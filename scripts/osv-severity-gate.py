"""
OSV-Scanner severity gate for the AION repositories.

Runs ``osv-scanner`` against one or more lockfiles, parses the JSON
output, applies the policy from the change ``openspec/changes/nex-50``:

* Exclude dev-only packages (configured per repository).
* Apply governance metadata from ``security/osv-exceptions.toml``.
* Fail only on vulnerabilities at or above ``--min-severity``.

The CVSS score vector determines severity. Advisories without a CVSS
vector are treated as ``UNKNOWN`` and filtered out of the gate; the
companion policy in ``docs/security-scanning.md`` records this as a
deliberate conservative default during the initial activation.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import re
import subprocess
import sys
from collections.abc import Iterable
from pathlib import Path
from typing import Any

if sys.version_info >= (3, 11):
    import tomllib
else:  # pragma: no cover - 3.12+ only environment
    import tomli as tomllib  # type: ignore[no-redef]


SEVERITY_RANK: dict[str, int] = {
    "CRITICAL": 4,
    "HIGH": 3,
    "MEDIUM": 2,
    "LOW": 1,
    "UNKNOWN": 0,
}

CVSS3_VECTOR_RE = re.compile(r"CVSS:3\.[01]/([A-Z:0-9./_]+)")


def _severity_from_cvss(vector: str) -> str:
    """Map a CVSS v3 base score range to a coarse severity bucket."""
    score = _cvss3_base_score(vector)
    if score is None:
        return "UNKNOWN"
    if score >= 9.0:
        return "CRITICAL"
    if score >= 7.0:
        return "HIGH"
    if score >= 4.0:
        return "MEDIUM"
    if score > 0.0:
        return "LOW"
    return "UNKNOWN"


def _cvss3_base_score(vector: str) -> float | None:
    match = CVSS3_VECTOR_RE.search(vector)
    if not match:
        return None
    metrics = match.group(1).split("/")
    values: dict[str, float] = {}
    for metric in metrics:
        if ":" not in metric:
            continue
        key, value = metric.split(":", 1)
        values[key] = _metric_value(key, value)
    if not values:
        return None
    av = values.get("AV", 1.0)
    ac = values.get("AC", 1.0)
    pr = values.get("PR", 1.0)
    ui = values.get("UI", 1.0)
    s = values.get("S", 1.0)
    c = values.get("C", 1.0)
    i = values.get("I", 1.0)
    a = values.get("A", 1.0)
    iss = 1 - (1 - c) * (1 - i) * (1 - a)
    if s:
        iss = 1.05 * iss
    impact = 6.42 * iss
    exploitability = 8.22 * av * ac * pr * ui
    if impact <= 0:
        return 0.0
    if s:
        return _round_up(min(1.08 * (impact + exploitability), 10.0))
    return _round_up(min(impact + exploitability, 10.0))


def _metric_value(key: str, value: str) -> float:
    table: dict[str, dict[str, float]] = {
        "AV": {"N": 0.85, "A": 0.62, "L": 0.55, "P": 0.2},
        "AC": {"L": 0.77, "H": 0.44},
        "PR": {
            "N": 0.85,
            "C": 0.44,
            "H": 0.27,
            "L": 0.62,
        },
        "UI": {"N": 0.85, "R": 0.62},
        "S": {"U": 0.0, "C": 1.0},
        "C": {"H": 0.56, "L": 0.22, "N": 0.0},
        "I": {"H": 0.56, "L": 0.22, "N": 0.0},
        "A": {"H": 0.56, "L": 0.22, "N": 0.0},
    }
    return table.get(key, {}).get(value, 1.0)


def _round_up(value: float) -> float:
    int_input = round(value * 100_000)
    if int_input % 10_000 == 0:
        return int_input / 100_000
    return (math.floor(int_input / 10_000) + 1) / 10


import math  # noqa: E402  (kept near usage for readability)


def _load_dev_packages(lockfile: Path) -> set[str]:
    """Return the set of dev-only package names for a lockfile.

    Looks for ``pyproject.toml`` next to ``uv.lock`` and ``package.json``
    next to ``pnpm-lock.yaml``. Returns an empty set when no manifest is
    found.
    """
    parent = lockfile.parent
    if lockfile.name == "uv.lock":
        manifest = parent / "pyproject.toml"
        if manifest.exists():
            data = tomllib.loads(manifest.read_text())
            names: set[str] = set()
            for _group, pkgs in data.get("dependency-groups", {}).items():
                for entry in pkgs:
                    name = re.split(r"[><=!~\[]", entry)[0].strip().lower()
                    name = name.split("[")[0]
                    names.add(name)
            return names
    elif lockfile.name == "pnpm-lock.yaml":
        manifest = parent / "package.json"
        if manifest.exists():
            data = json.loads(manifest.read_text())
            return {name.lower() for name in data.get("devDependencies", {}).keys()}
    return set()


def _load_exceptions(path: Path) -> dict[str, dict[str, Any]]:
    if not path.exists():
        return {}
    data = tomllib.loads(path.read_text())
    out: dict[str, dict[str, Any]] = {}
    for vuln in data.get("IgnoredVulns", []) or []:
        out[vuln["id"]] = vuln
    for vuln in data.get("ignored_vulns", []) or []:
        out[vuln["id"]] = vuln
    return out


def _scan_lockfile(lockfile: Path) -> dict[str, Any]:
    result = subprocess.run(
        [
            "osv-scanner",
            "scan",
            "--lockfile",
            str(lockfile),
            "--format",
            "json",
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode not in (0, 1):
        raise SystemExit(
            f"osv-scanner failed for {lockfile}: rc={result.returncode}\n{result.stderr}"
        )
    return json.loads(result.stdout or "{}")


def _evaluate(
    raw: dict[str, Any],
    dev_packages: set[str],
    exceptions: dict[str, dict[str, Any]],
    min_severity: str,
    today_iso: str,
) -> list[dict[str, Any]]:
    threshold = SEVERITY_RANK[min_severity]
    failing: list[dict[str, Any]] = []
    results = raw.get("results", [])
    for entry in results:
        for package in entry.get("packages", []):
            pkg_info = package.get("package", {}) or {}
            name = (pkg_info.get("name") or "").lower()
            version = pkg_info.get("version") or "?"
            is_dev = name in dev_packages
            for vuln in package.get("vulnerabilities", []) or []:
                advisory_id = vuln.get("id", "?")
                if advisory_id in exceptions:
                    ignore_until = exceptions[advisory_id].get("ignoreUntil", "")
                    if isinstance(ignore_until, _dt.datetime):
                        ignore_until = ignore_until.date().isoformat()
                    if not ignore_until or str(ignore_until) >= today_iso:
                        continue
                severities = vuln.get("severity", []) or []
                best = "UNKNOWN"
                for sev in severities:
                    if not isinstance(sev, dict):
                        continue
                    vector = sev.get("score", "")
                    if not isinstance(vector, str):
                        continue
                    if vector.startswith("CVSS:3"):
                        bucket = _severity_from_cvss(vector)
                        if SEVERITY_RANK[bucket] > SEVERITY_RANK[best]:
                            best = bucket
                    elif vector.startswith("CVSS:4"):
                        # Treat CVSS v4 as best by leaving it to score
                        best = "HIGH"
                if is_dev:
                    continue
                if SEVERITY_RANK[best] >= threshold:
                    failing.append(
                        {
                            "id": advisory_id,
                            "package": pkg_info.get("name") or "?",
                            "version": version,
                            "severity": best,
                            "summary": vuln.get("summary", ""),
                        }
                    )
    return failing


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--lockfile",
        action="append",
        required=True,
        help="Path to a lockfile (uv.lock or pnpm-lock.yaml). Repeatable.",
    )
    parser.add_argument(
        "--exceptions",
        default="security/osv-exceptions.toml",
        help="Path to the governance exception register.",
    )
    parser.add_argument(
        "--min-severity",
        default="HIGH",
        choices=sorted(SEVERITY_RANK.keys(), key=lambda k: -SEVERITY_RANK[k]),
    )
    parser.add_argument(
        "--today",
        default=os.environ.get("VALIDATE_TODAY") or "",
        help="ISO date used to evaluate exception expiry (default: today).",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    today = args.today or subprocess.run(
        ["date", "+%Y-%m-%d"], check=True, capture_output=True, text=True
    ).stdout.strip()
    exceptions = _load_exceptions(Path(args.exceptions))
    all_failing: list[dict[str, Any]] = []
    for lockfile_str in args.lockfile:
        lockfile = Path(lockfile_str)
        if not lockfile.exists():
            print(f"::error::lockfile not found: {lockfile}", file=sys.stderr)
            return 2
        dev_packages = _load_dev_packages(lockfile)
        raw = _scan_lockfile(lockfile)
        all_failing.extend(_evaluate(raw, dev_packages, exceptions, args.min_severity, today))
    if all_failing:
        print(f"::error::{len(all_failing)} dependency finding(s) at or above {args.min_severity}:")
        for f in all_failing:
            print(
                f"::error::{f['id']} | {f['package']}@{f['version']} | "
                f"severity={f['severity']} | {f['summary']}"
            )
        return 1
    print(
        f"No findings at or above {args.min_severity} across {len(args.lockfile)} lockfile(s)."
    )
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())

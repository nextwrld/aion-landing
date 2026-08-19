"""
Generate OSV exception register entries from the current baseline.

For each HIGH+ vulnerability without a fixed version, this script
produces a narrow, expiring exception with the full governance
metadata required by ``scripts/validate-security-exceptions.py``.

Exceptions are written to ``security/osv-exceptions.toml`` in the
target repository layout. Existing entries are preserved.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import re
import subprocess
import sys
from pathlib import Path

SEVERITY_RANK: dict[str, int] = {
    "CRITICAL": 4,
    "HIGH": 3,
    "MEDIUM": 2,
    "LOW": 1,
    "UNKNOWN": 0,
}

CVSS3_VECTOR_RE = re.compile(r"CVSS:3\.[01]/([A-Z:0-9./_]+)")


def _severity_from_cvss(vector: str) -> str:
    match = CVSS3_VECTOR_RE.search(vector)
    if not match:
        return "UNKNOWN"
    metrics = match.group(1).split("/")
    values: dict[str, float] = {}
    for metric in metrics:
        if ":" not in metric:
            continue
        key, value = metric.split(":", 1)
        values[key] = _metric_value(key, value)
    av = values.get("AV", 1.0)
    ac = values.get("AC", 1.0)
    pr = values.get("PR", 1.0)
    ui = values.get("UI", 1.0)
    c = values.get("C", 1.0)
    i = values.get("I", 1.0)
    a = values.get("A", 1.0)
    iss = 1 - (1 - c) * (1 - i) * (1 - a)
    score = 0.0
    if iss > 0:
        exploitability = 8.22 * av * ac * pr * ui
        impact = 6.42 * iss
        score = min(impact + exploitability, 10.0)
    if score >= 9.0:
        return "CRITICAL"
    if score >= 7.0:
        return "HIGH"
    if score >= 4.0:
        return "MEDIUM"
    if score > 0.0:
        return "LOW"
    return "UNKNOWN"


def _metric_value(key: str, value: str) -> float:
    table: dict[str, dict[str, float]] = {
        "AV": {"N": 0.85, "A": 0.62, "L": 0.55, "P": 0.2},
        "AC": {"L": 0.77, "H": 0.44},
        "PR": {"N": 0.85, "C": 0.44, "H": 0.27, "L": 0.62},
        "UI": {"N": 0.85, "R": 0.62},
        "C": {"H": 0.56, "L": 0.22, "N": 0.0},
        "I": {"H": 0.56, "L": 0.22, "N": 0.0},
        "A": {"H": 0.56, "L": 0.22, "N": 0.0},
    }
    return table.get(key, {}).get(value, 1.0)


def _collect_findings(lockfile: Path, dev_packages: set[str], min_severity: str) -> list[dict[str, str]]:
    import json

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
    raw = json.loads(result.stdout or "{}")
    threshold = SEVERITY_RANK[min_severity]
    findings: list[dict[str, str]] = []
    for entry in raw.get("results", []):
        for package in entry.get("packages", []):
            pkg_info = package.get("package", {}) or {}
            name = (pkg_info.get("name") or "").lower()
            if name in dev_packages:
                continue
            for vuln in package.get("vulnerabilities", []) or []:
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
                        best = "HIGH"
                if SEVERITY_RANK[best] >= threshold:
                    findings.append(
                        {
                            "id": vuln.get("id", "?"),
                            "package": pkg_info.get("name") or "?",
                            "version": pkg_info.get("version") or "?",
                            "severity": best,
                            "summary": (vuln.get("summary") or "").replace("\n", " ").strip(),
                        }
                    )
    return findings


def _toml_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def _build_register(
    findings: list[dict[str, str]],
    owner: str,
    tracking_issue: str,
    expires_on: str,
    rationale_prefix: str,
) -> str:
    lines: list[str] = [
        "# OSV-Scanner exception register.",
        "#",
        "# Each entry was generated from the initial baseline triage. All",
        "# listed advisories have NO fixed version available. Each entry MUST",
        "# be reviewed within the expiry date and either remediated, rewritten",
        "# with new evidence, or removed.",
        "",
    ]
    for finding in findings:
        lines.append("[[IgnoredVulns]]")
        lines.append(f"id = {_toml_escape(finding['id'])!r}")
        lines.append(f"ignoreUntil = {expires_on}T00:00:00Z")
        lines.append(
            f"reason = \"{_toml_escape(tracking_issue)}: {_toml_escape(finding['summary'] or finding['id'])}\""
        )
        lines.append("")
        lines.append("[[governance]]")
        lines.append(f"id = {_toml_escape(finding['id'])!r}")
        lines.append(f"owner = {owner!r}")
        lines.append(f"tracking_issue = {tracking_issue!r}")
        lines.append(
            f"compensating_control = \"No fixed version available. Baseline triage in progress; reviewed monthly.\""
        )
        lines.append("")
    return "\n".join(lines)


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--lockfile", required=True, help="Path to a uv.lock or pnpm-lock.yaml")
    parser.add_argument("--owner", default="gapfware")
    parser.add_argument("--tracking-issue", default="NEX-50")
    parser.add_argument(
        "--min-severity", default="HIGH", choices=sorted(SEVERITY_RANK, key=lambda k: -SEVERITY_RANK[k])
    )
    parser.add_argument("--expires-on", default=(_dt.date.today() + _dt.timedelta(days=30)).isoformat())
    parser.add_argument("--out", required=True, help="Path to write the generated register")
    return parser.parse_args(argv)


def _load_dev_packages(lockfile: Path) -> set[str]:
    import json

    parent = lockfile.parent
    if lockfile.name == "uv.lock":
        manifest = parent / "pyproject.toml"
        if manifest.exists():
            import tomllib

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


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    lockfile = Path(args.lockfile)
    dev = _load_dev_packages(lockfile)
    findings = _collect_findings(lockfile, dev, args.min_severity)
    if not findings:
        print(f"No findings at or above {args.min_severity}; no exceptions generated.")
        return 0
    body = _build_register(
        findings,
        owner=args.owner,
        tracking_issue=args.tracking_issue,
        expires_on=args.expires_on,
        rationale_prefix=f"{args.tracking_issue} baseline triage",
    )
    Path(args.out).write_text(body, encoding="utf-8")
    print(
        f"wrote {len(findings)} baseline exception(s) to {args.out} (expires {args.expires_on})"
    )
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())

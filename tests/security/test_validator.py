"""
Tests for the security exception validator.

Each test creates a single-purpose fixture, runs the validator with
``VALIDATE_TODAY`` pinned to a deterministic date, and asserts that the
validator exits non-zero with a clear reason.

The fixtures live in ``tests/security/fixtures/`` and are documented in
``tests/security/fixtures/README.md``.
"""

from __future__ import annotations

import datetime as _dt
from pathlib import Path

import pytest

from conftest import _run_validator

PINNED_TODAY = _dt.date(2026, 8, 15)
PLACEHOLDER = "NEX50_DOCUMENTATION_SYNTHETIC_VALUE_NOT_A_REAL_TOKEN_DO_NOT_USE_0000"
PLACEHOLDER_B = "NEX50_OTHER_DOCUMENTATION_SYNTHETIC_VALUE_NOT_A_REAL_TOKEN_DO_NOT_USE_0000"


def _write(path: Path, body: str) -> Path:
    path.write_text(body, encoding="utf-8")
    return path


def test_valid_gitleaks_exception_passes(tmp_path: Path) -> None:
    register = _write(
        tmp_path / "gitleaks.toml",
        f"""
[[exceptions]]
id = "NEX-50-OK"
rule_id = "generic-api-key"
path = "docs/examples/synthetic-token.txt"
match = "{PLACEHOLDER}"
owner = "gapfware"
tracking_issue = "NEX-50"
rationale = "Synthetic token used in documentation to demonstrate rule firing during verification."
expires_on = "2026-09-30"
compensating_control = "Token is publicly documented as fake."
""".strip(),
    )
    result = _run_validator(register, today=PINNED_TODAY)
    assert result.returncode == 0, result.stdout + result.stderr


def test_expired_gitleaks_exception_fails(tmp_path: Path) -> None:
    register = _write(
        tmp_path / "gitleaks.toml",
        f"""
[[exceptions]]
id = "NEX-50-EXPIRED"
rule_id = "generic-api-key"
path = "docs/examples/synthetic-token.txt"
match = "{PLACEHOLDER}"
owner = "gapfware"
tracking_issue = "NEX-50"
rationale = "Synthetic token used in documentation to demonstrate rule firing during verification."
expires_on = "2026-07-01"
compensating_control = "Token is publicly documented as fake."
""".strip(),
    )
    result = _run_validator(register, today=PINNED_TODAY)
    assert result.returncode != 0
    assert "expired" in (result.stdout + result.stderr).lower()


def test_malformed_date_fails(tmp_path: Path) -> None:
    register = _write(
        tmp_path / "gitleaks.toml",
        f"""
[[exceptions]]
id = "NEX-50-BAD-DATE"
rule_id = "generic-api-key"
path = "docs/examples/synthetic-token.txt"
match = "{PLACEHOLDER}"
owner = "gapfware"
tracking_issue = "NEX-50"
rationale = "Synthetic token used in documentation to demonstrate rule firing during verification."
expires_on = "not-a-date"
compensating_control = "Token is publicly documented as fake."
""".strip(),
    )
    result = _run_validator(register, today=PINNED_TODAY)
    assert result.returncode != 0
    assert "expires_on" in (result.stdout + result.stderr)


def test_missing_required_field_fails(tmp_path: Path) -> None:
    register = _write(
        tmp_path / "gitleaks.toml",
        f"""
[[exceptions]]
id = "NEX-50-MISSING-RATIONALE"
rule_id = "generic-api-key"
path = "docs/examples/synthetic-token.txt"
match = "{PLACEHOLDER}"
owner = "gapfware"
tracking_issue = "NEX-50"
expires_on = "2026-09-30"
""".strip(),
    )
    result = _run_validator(register, today=PINNED_TODAY)
    assert result.returncode != 0
    assert "rationale" in (result.stdout + result.stderr)


def test_overbroad_path_fails(tmp_path: Path) -> None:
    register = _write(
        tmp_path / "gitleaks.toml",
        f"""
[[exceptions]]
id = "NEX-50-OVERBROAD"
rule_id = "generic-api-key"
path = "**"
match = "{PLACEHOLDER}"
owner = "gapfware"
tracking_issue = "NEX-50"
rationale = "Covers all paths."
expires_on = "2026-09-30"
""".strip(),
    )
    result = _run_validator(register, today=PINNED_TODAY)
    assert result.returncode != 0
    assert "path" in (result.stdout + result.stderr).lower()


def test_directory_only_path_fails(tmp_path: Path) -> None:
    register = _write(
        tmp_path / "gitleaks.toml",
        f"""
[[exceptions]]
id = "NEX-50-DIR"
rule_id = "generic-api-key"
path = "backend/"
match = "{PLACEHOLDER}"
owner = "gapfware"
tracking_issue = "NEX-50"
rationale = "Covers an entire directory."
expires_on = "2026-09-30"
""".strip(),
    )
    result = _run_validator(register, today=PINNED_TODAY)
    assert result.returncode != 0
    assert "path" in (result.stdout + result.stderr).lower()


def test_invalid_owner_fails(tmp_path: Path) -> None:
    register = _write(
        tmp_path / "gitleaks.toml",
        f"""
[[exceptions]]
id = "NEX-50-BAD-OWNER"
rule_id = "generic-api-key"
path = "docs/examples/synthetic-token.txt"
match = "{PLACEHOLDER}"
owner = "not a github handle!"
tracking_issue = "NEX-50"
rationale = "Synthetic token used in documentation to demonstrate rule firing during verification."
expires_on = "2026-09-30"
compensating_control = "Token is publicly documented as fake."
""".strip(),
    )
    result = _run_validator(register, today=PINNED_TODAY)
    assert result.returncode != 0
    assert "owner" in (result.stdout + result.stderr)


def test_invalid_tracking_issue_fails(tmp_path: Path) -> None:
    register = _write(
        tmp_path / "gitleaks.toml",
        f"""
[[exceptions]]
id = "NEX-50-BAD-ISSUE"
rule_id = "generic-api-key"
path = "docs/examples/synthetic-token.txt"
match = "{PLACEHOLDER}"
owner = "gapfware"
tracking_issue = "not-a-linear-id"
rationale = "Synthetic token used in documentation to demonstrate rule firing during verification."
expires_on = "2026-09-30"
compensating_control = "Token is publicly documented as fake."
""".strip(),
    )
    result = _run_validator(register, today=PINNED_TODAY)
    assert result.returncode != 0
    assert "tracking_issue" in (result.stdout + result.stderr)


def test_missing_compensating_control_for_high_impact_rule_fails(tmp_path: Path) -> None:
    register = _write(
        tmp_path / "gitleaks.toml",
        f"""
[[exceptions]]
id = "NEX-50-NO-COMP"
rule_id = "github-pat"
path = "docs/examples/synthetic-token.txt"
match = "{PLACEHOLDER}"
owner = "gapfware"
tracking_issue = "NEX-50"
rationale = "Synthetic token used in documentation to demonstrate rule firing during verification."
expires_on = "2026-09-30"
""".strip(),
    )
    result = _run_validator(register, today=PINNED_TODAY)
    assert result.returncode != 0
    assert "compensating_control" in (result.stdout + result.stderr)


def test_duplicate_id_fails(tmp_path: Path) -> None:
    register = _write(
        tmp_path / "gitleaks.toml",
        f"""
[[exceptions]]
id = "NEX-50-DUP"
rule_id = "generic-api-key"
path = "docs/examples/a.txt"
match = "{PLACEHOLDER}"
owner = "gapfware"
tracking_issue = "NEX-50"
rationale = "First entry."
expires_on = "2026-09-30"
compensating_control = "Token is publicly documented as fake."

[[exceptions]]
id = "NEX-50-DUP"
rule_id = "generic-api-key"
path = "docs/examples/b.txt"
match = "{PLACEHOLDER_B}"
owner = "gapfware"
tracking_issue = "NEX-50"
rationale = "Second entry."
expires_on = "2026-09-30"
compensating_control = "Token is publicly documented as fake."
""".strip(),
    )
    result = _run_validator(register, today=PINNED_TODAY)
    assert result.returncode != 0
    assert "duplicate" in (result.stdout + result.stderr).lower()


def test_non_matching_match_fails(tmp_path: Path) -> None:
    register = _write(
        tmp_path / "gitleaks.toml",
        f"""
[[exceptions]]
id = "NEX-50-MISMATCH"
rule_id = "generic-api-key"
path = "docs/examples/synthetic-token.txt"
match = "{PLACEHOLDER} "  # trailing space
owner = "gapfware"
tracking_issue = "NEX-50"
rationale = "Synthetic token used in documentation to demonstrate rule firing during verification."
expires_on = "2026-09-30"
compensating_control = "Token is publicly documented as fake."
""".strip(),
    )
    result = _run_validator(register, today=PINNED_TODAY)
    assert result.returncode != 0
    assert "match" in (result.stdout + result.stderr).lower()

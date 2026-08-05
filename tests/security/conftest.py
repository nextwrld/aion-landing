"""Pytest configuration for the security validator tests."""

import datetime as _dt
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
VALIDATOR = REPO_ROOT / "scripts" / "validate-security-exceptions.py"


def _run_validator(register_path: Path, today: _dt.date | None = None) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    if today is not None:
        env["VALIDATE_TODAY"] = today.isoformat()
    return subprocess.run(
        [sys.executable, str(VALIDATOR), "--register", str(register_path), "--check"],
        check=False,
        capture_output=True,
        text=True,
        env=env,
        cwd=str(REPO_ROOT),
    )


@pytest.fixture
def run_validator():
    return _run_validator

# Gitleaks exception fixtures

Each fixture is a stand-alone ``gitleaks-exceptions.toml`` used by
``tests/security/test_validator.py`` to assert one validation rule. The
fixtures are intentionally broken so the validator MUST reject them.

The valid baseline is in ``security/gitleaks-exceptions.toml`` and the
governance rules live in ``docs/security-scanning.md``.

Common fields the validator enforces on every entry:

- id, rule_id, path, match, owner, tracking_issue, rationale, expires_on
- expires_on MUST be a valid ISO date and MUST NOT be in the past relative
  to ``VALIDATE_TODAY`` (default: today).
- path MUST be a non-empty, non-wildcard expression referencing a real
  path inside the repository. Bare ``**`` or directory-wide globs MUST
  fail.
- match MUST be a non-empty literal string (regexes are not allowed in the
  exception register; the scanner's own allowlist is reserved for the
  generated ignore file).
- owner MUST match a GitHub handle format (``[A-Za-z0-9-]{1,39}``).
- tracking_issue MUST match a Linear identifier (``NEX-NN+``).
- compensating_control MUST be present when the matched rule is a
  high-impact category (Gitleaks rule id appears in
  ``scripts/validate-security-exceptions.py`` high-impact list).

Failure classes covered by the test matrix:

1. valid (sanity)
2. expired
3. malformed date
4. missing required field
5. overbroad path (directory-only or wildcard)
6. non-matching match string (whitespace mismatch)
7. invalid owner format
8. invalid tracking issue
9. missing compensating control on a high-impact rule
10. duplicate id

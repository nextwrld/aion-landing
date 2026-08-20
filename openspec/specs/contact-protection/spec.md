# Contact Protection Specification

## Purpose

Protect the public `POST /api/contact` and `LeadFormSection.tsx` lead flow from automated abuse and repeated submissions while preserving legitimate lead conversion. This capability satisfies NEX-48 acceptance criteria 1–5.

## Requirements

### Requirement: Endpoint Anti-Bot Validation

The `POST /api/contact` endpoint MUST reject submissions whose honeypot field is populated with a generic `400` or `403` response and MUST NOT send SMTP email for those submissions. The endpoint MUST verify a submitted Cloudflare Turnstile token server-side before sending email and MUST reject a missing, invalid, or unsuccessful verification result with a generic `400` or `403` response. The anti-bot controls MUST operate without application cookies. This requirement satisfies NEX-48 acceptance criterion 1.

#### Scenario: Legitimate submission passes anti-bot validation

- GIVEN a contact submission with an empty honeypot field and a valid Turnstile token
- WHEN the endpoint receives the submission within its rate-limit allowance
- THEN the endpoint MUST accept it for SMTP delivery

#### Scenario: Filled honeypot is blocked

- GIVEN a contact submission whose honeypot field contains a value
- WHEN the endpoint receives the submission
- THEN the endpoint MUST return a generic `400` or `403` response
- AND the endpoint MUST NOT attempt Turnstile verification or SMTP delivery

#### Scenario: Invalid Turnstile token is blocked

- GIVEN a contact submission with an empty honeypot field and an invalid or unsuccessful Turnstile verification result
- WHEN the endpoint receives the submission
- THEN the endpoint MUST return a generic `400` or `403` response
- AND the endpoint MUST NOT send SMTP email

### Requirement: Controlled Anti-Bot Verification Fallback

The endpoint MUST fail open when the Turnstile `siteverify` request cannot complete because of verifier unavailability or transport failure. In that condition, the endpoint MUST continue through rate limiting and the normal delivery flow, MUST log the `contact.antibot.skip` event, and MUST NOT reject the submission solely because the verifier is unavailable. This requirement satisfies NEX-48 acceptance criterion 5.

#### Scenario: Turnstile verifier is unavailable

- GIVEN a contact submission with an empty honeypot field
- AND the Turnstile `siteverify` request fails to complete
- WHEN the submission remains within its rate-limit allowance
- THEN the endpoint MUST accept it for SMTP delivery
- AND the endpoint MUST record `contact.antibot.skip`

### Requirement: Origin-Based Rate Limiting

The endpoint MUST limit contact submission attempts to five attempts per fifteen-minute window for each normalized `CF-Connecting-IP` value. The limit MUST use shared Workers KV-backed state through the `RateLimiter` boundary and MUST use only the normalized source IP as its rate-limit key. The endpoint MUST return `429` without attempting SMTP delivery when the allowance is exhausted. This requirement satisfies NEX-48 acceptance criterion 2.

#### Scenario: Repeated submission exceeds the limit

- GIVEN one normalized source IP has already made five contact submission attempts during the active fifteen-minute window
- WHEN another submission arrives from that IP
- THEN the endpoint MUST return `429`
- AND the endpoint MUST NOT send SMTP email

#### Scenario: Shared IP is limited as one origin

- GIVEN multiple clients use the same normalized `CF-Connecting-IP`
- WHEN their combined contact submission attempts exceed five during one fifteen-minute window
- THEN the endpoint MUST apply the `429` response to subsequent attempts from that IP

### Requirement: Bounded and Sanitized SMTP Delivery

The contact endpoint MUST bound SMTP connection and greeting waits to approximately ten seconds each and SMTP socket inactivity to approximately twenty seconds. The endpoint MUST NOT retry SMTP delivery within the same request. On SMTP timeout or other SMTP failure, the endpoint MUST return a generic server error response that does not expose an SMTP provider message or other internal error detail. This requirement satisfies NEX-48 acceptance criterion 3.

#### Scenario: SMTP delivery times out

- GIVEN an accepted contact submission
- AND SMTP connection, greeting, or socket activity exceeds its configured timeout
- WHEN the endpoint handles the delivery failure
- THEN the endpoint MUST return a generic server error response
- AND the response MUST NOT contain the underlying SMTP error message
- AND the endpoint MUST NOT retry delivery in that request

#### Scenario: SMTP provider returns an error

- GIVEN an accepted contact submission
- AND the SMTP provider returns an error
- WHEN the endpoint handles the error
- THEN the endpoint MUST return a generic server error response without provider details

### Requirement: Contact Flow Observability

The endpoint MUST emit structured logs for accepted submission processing, anti-bot blocking, rate limiting, and SMTP failure using the events `contact.submit`, `contact.blocked`, `contact.rate_limited`, and `contact.smtp_failure`. Blocked and rate-limited events MUST include a machine-readable reason sufficient to distinguish protection outcomes without logging submitted lead content. This requirement satisfies NEX-48 acceptance criterion 4.

#### Scenario: A submission is blocked by honeypot validation

- GIVEN a contact submission with a populated honeypot field
- WHEN the endpoint blocks the submission
- THEN the endpoint MUST emit a structured `contact.blocked` log with the blocking reason

#### Scenario: SMTP delivery fails

- GIVEN an accepted contact submission reaches SMTP delivery
- WHEN SMTP delivery fails
- THEN the endpoint MUST emit a structured `contact.smtp_failure` log

### Requirement: Lead Form Protection and Localized Feedback

`LeadFormSection.tsx` MUST submit an empty honeypot field and the Cloudflare Turnstile token with contact submissions, and MUST present the Turnstile widget without requiring application cookies. The component MUST handle `429` and anti-bot rejection responses as non-success states and MUST present differentiated localized feedback for rate limiting versus verification or blocking. `src/i18n/content.ts` MUST define each new feedback string in every supported language. This requirement satisfies NEX-48 acceptance criteria 1, 2, and 5.

#### Scenario: The form receives a rate-limit response

- GIVEN a user submits `LeadFormSection.tsx`
- WHEN `POST /api/contact` returns `429`
- THEN the form MUST leave the success state
- AND the form MUST display the localized rate-limit message for the active language

#### Scenario: The form receives an anti-bot rejection

- GIVEN a user submits `LeadFormSection.tsx`
- WHEN `POST /api/contact` returns an anti-bot `400` or `403` response
- THEN the form MUST leave the success state
- AND the form MUST display localized verification or blocking feedback for the active language

### Requirement: Protection Configuration and Rollback

The contact protection configuration MUST permit Turnstile verification and rate limiting to be disabled independently without a code revert. When Turnstile verification is disabled, the endpoint MUST tolerate an absent Turnstile token; when rate limiting is disabled, it MUST not produce `429` responses from that control. Deployment documentation MUST identify the configuration controls and the procedure to restore the previous Worker version. This requirement supports NEX-48 acceptance criterion 5 by allowing prompt mitigation of conversion-impacting false positives.

#### Scenario: Turnstile is disabled for rollback

- GIVEN Turnstile verification is disabled by configuration
- WHEN a submission with an empty honeypot field omits a Turnstile token
- THEN the endpoint MUST continue to rate-limit and process the submission without rejecting it for the absent token

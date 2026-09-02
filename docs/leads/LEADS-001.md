# LEADS-001 Project Submission

## Canonical flow

- Spanish public URL: `/postula-tu-proyecto`. `/es/postula-tu-proyecto` is accepted by the existing locale middleware and redirects to the unprefixed Spanish canonical URL.
- English public URL: `/en/submit-your-project`.
- Public API: `POST /api/v1/forms/project-application/`.
- Legacy application URLs redirect to the canonical flow; no duplicate form is maintained.

Submissions are stored in Django's existing `forms.ProjectApplication` model. Sector, department, and municipality use canonical platform relations. Legacy text columns remain as snapshots for the existing webhook contract.

## Security and privacy

The endpoint is create-only and anonymous. It accepts JSON up to 64 KiB, applies the `project_submissions` throttle at 5 requests per hour per DRF client identity, validates all fields server-side, and rejects a populated `company_fax` honeypot. `reference_code`, `status`, and `source` are server-controlled. The response exposes only `reference_code`, `status`, and `created_at`; no PII or internal CRM fields are returned.

The throttle uses Django's configured cache. A shared cache and reviewed trusted-proxy configuration are required if production runs multiple backend instances and strict cross-instance enforcement is needed.

## Email decision

No email notification was added. Production has no configured transactional email provider or reviewed recipient configuration. The existing durable webhook event remains available for downstream processing, and a webhook enqueue failure does not make an otherwise stored submission fail.

## LEADS-002 debt

- Select and configure a transactional email provider using environment variables, templates, recipient policy, and retry/idempotency controls.
- Decide whether email is sent by Django or the existing integration pipeline to avoid duplicate notifications.
- Add a shared production throttle cache and validate reverse-proxy client IP handling.
- Measure spam before considering CAPTCHA; do not add an external challenge preemptively.
- Define retention, deletion, export, and staff access procedures for submission PII.
- Coordinate migration or normalization of legacy status and text snapshot values after downstream webhook consumers are reviewed.

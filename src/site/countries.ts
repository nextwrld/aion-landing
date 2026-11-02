// Countries the free trial can start in. Keep in sync with api/_utils/contact.ts
// and backend app/domains/trial_signups/countries.py.
const TRIAL_COUNTRY_CODES = [
  'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GT',
  'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'UY', 'VE', 'US',
] as const;

export function trialCountryOptions(lang: string): { value: string; label: string }[] {
  const names = new Intl.DisplayNames([lang], { type: 'region' });
  return TRIAL_COUNTRY_CODES.map((code) => ({ value: code, label: names.of(code) ?? code })).sort((a, b) =>
    a.label.localeCompare(b.label, lang),
  );
}

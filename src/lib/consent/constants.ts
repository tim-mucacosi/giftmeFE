// EU 27 + EEA (Iceland, Liechtenstein, Norway) — ISO 3166-1 alpha-2 codes.
// Deliberately excludes UK/CH: similar-but-distinct regimes, not EEA itself.
export const EEA_COUNTRY_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE', 'IS', 'LI', 'NO',
])

/** Set by middleware from the visitor's IP-derived country. */
export const GEO_COOKIE = 'pm_geo'
/** Same value as GEO_COOKIE, forwarded as a request header so the page
 *  rendered by this same request can read it — response cookies only take
 *  effect on the visitor's *next* request. */
export const GEO_HEADER = 'x-pm-geo'
/** Set once the visitor answers the consent banner. */
export const CONSENT_COOKIE = 'pm_consent'

export type ConsentValue = 'granted' | 'denied'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Event catalog. `undefined` means the event carries no params.
 * Keep this in sync with the doc shared with the team.
 */
export interface AnalyticsEventMap {
  cta_click: { location: string }
  login: { method: 'email' | 'google' }
  create_event_start: undefined
  create_event_step_complete: { step: 'details' | 'gift_list' | 'review' }
  gift_added: { category: string }
  /**
   * `duration_seconds`: clock time from entering the wizard (fresh
   * /create, not an edit) to a successful publish register as a GA4
   * custom metric to average it. `language`: UI language active at publish.
   */
  event_published: { duration_seconds: number; language: string }
  event_link_shared: { source: 'host_review' | 'host_overview' | 'guest_page' }
  event_link_copied: { source: 'host_review' | 'host_overview' | 'guest_page' }
  event_edited: undefined
  view_event: { event_type: string; gift_count: number }
  gift_reserve_start: undefined
  gift_reserved: undefined
  dashboard_view: undefined
  event_overview_view: undefined
}

type TrackArgs<K extends keyof AnalyticsEventMap> = AnalyticsEventMap[K] extends undefined
  ? [name: K]
  : [name: K, params: AnalyticsEventMap[K]]

/**
 * Fires a tracking event. Does nothing outside the browser or when the
 * Google tag has not loaded (e.g. local dev, where analytics is disabled).
 */
export function trackEvent<K extends keyof AnalyticsEventMap>(...args: TrackArgs<K>): void {
  const [name, params] = args
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}

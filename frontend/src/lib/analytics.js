// Lightweight analytics tracking
// Stores events in backend database, viewable in admin analytics page

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const ANALYTICS_ENABLED = !!BACKEND_URL;

// Get or create session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('pp_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('pp_session_id', sessionId);
  }
  return sessionId;
};

// Get UTM params from URL
const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
  };
};

// Track an event
const trackEvent = async (eventName, metadata = {}) => {
  if (!ANALYTICS_ENABLED) return;
  
  try {
    const event = {
      event_name: eventName,
      page_path: window.location.pathname,
      referrer: document.referrer || null,
      session_id: getSessionId(),
      timestamp: new Date().toISOString(),
      ...getUtmParams(),
      metadata: metadata,
    };
    
    // Fire and forget - don't wait for response
    fetch(`${BACKEND_URL}/api/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {
      // Silently fail - analytics should never break the site
    });
  } catch (e) {
    // Silently fail
  }
};

// Track page view
export const trackPageView = (pagePath) => {
  trackEvent('pageview', { path: pagePath });
};

// Track button click
export const trackClick = (buttonId, pagePath) => {
  trackEvent('click', { button_id: buttonId, path: pagePath });
};

// Track page exit with duration
let pageLoadTime = Date.now();

export const trackPageExit = () => {
  const duration = Math.round((Date.now() - pageLoadTime) / 1000);
  trackEvent('page_exit', { duration_seconds: duration });
};

// Initialize analytics on page load
export const initAnalytics = () => {
  if (!ANALYTICS_ENABLED) return;
  
  pageLoadTime = Date.now();
  
  // Track initial page view
  trackPageView(window.location.pathname);
  
  // Track page exit on visibility change (tab close, navigate away)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      trackPageExit();
    }
  });
  
  // Reset page load time when page becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      pageLoadTime = Date.now();
    }
  });
};

export default {
  trackPageView,
  trackClick,
  trackPageExit,
  initAnalytics,
};

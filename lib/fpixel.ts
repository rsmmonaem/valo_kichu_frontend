export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
export const TEST_EVENT_CODE = process.env.NEXT_PUBLIC_FACEBOOK_TEST_EVENT_CODE;

// Initialize the queue immediately to capture events fired before the script loads
if (typeof window !== 'undefined') {
  if (!(window as any).fbq) {
    (window as any).fbq = function() {
      (window as any).fbq.callMethod ?
      (window as any).fbq.callMethod.apply((window as any).fbq, arguments) :
      (window as any).fbq.queue.push(arguments);
    };
    if (!(window as any)._fbq) (window as any)._fbq = (window as any).fbq;
    (window as any).fbq.push = (window as any).fbq;
    (window as any).fbq.loaded = false;
    (window as any).fbq.version = '2.0';
    (window as any).fbq.queue = [];
  }
}

export const generateEventId = (prefix: string = 'evt') => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
};

// Helper: Extract cookie value directly from document.cookie
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : undefined;
};

const sendCapiEvent = async (eventName: string, customData: any, eventId: string, userData: any = {}) => {
  if (typeof window === 'undefined') return;

  const fbp = getCookie('_fbp');
  const fbc = getCookie('_fbc');

  const enrichedUserData = {
    ...userData,
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };
  
  try {
    // keepalive ensures the browser completes the request even during page navigations / redirects
    await fetch('/api/fb-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.href,
        custom_data: customData,
        user_data: enrichedUserData,
      }),
    });
  } catch (error) {
    console.error('Failed to send CAPI event', error);
  }
};

export const pageview = (userData: any = {}, explicitEventId?: string) => {
  if (typeof window !== 'undefined') {
    const eventId = explicitEventId || generateEventId('pv');
    const options: any = {};
    if (TEST_EVENT_CODE) {
      options.test_event_code = TEST_EVENT_CODE;
    }
    (window as any).fbq('track', 'PageView', options, { eventID: eventId });
    sendCapiEvent('PageView', {}, eventId, userData);
    return eventId;
  }
};

// https://developers.facebook.com/docs/meta-pixel/reference
export const event = (name: string, options: any = {}, userData: any = {}, explicitEventId?: string) => {
  if (typeof window !== 'undefined') {
    // Deterministic deduplication ID for Purchase or custom event_id if provided
    const eventId = explicitEventId || options.event_id || (name === 'Purchase' && options.order_id ? `purchase_${options.order_id}` : generateEventId());
    
    const payload = { ...options };
    if (TEST_EVENT_CODE) {
      payload.test_event_code = TEST_EVENT_CODE;
    }

    // Normalize value to a clean decimal number if present
    if (payload.value !== undefined) {
      const parsedValue = parseFloat(Number(payload.value).toFixed(2));
      if (!isNaN(parsedValue)) {
        payload.value = parsedValue;
      }
    }

    // Also normalize option value for CAPI
    if (options.value !== undefined) {
      const parsedValue = parseFloat(Number(options.value).toFixed(2));
      if (!isNaN(parsedValue)) {
        options.value = parsedValue;
      }
    }

    // Standard FB Events list
    const standardEvents = [
      'AddPaymentInfo', 'AddToCart', 'AddToWishlist', 'CompleteRegistration', 
      'Contact', 'CustomizeProduct', 'Donate', 'FindLocation', 'InitiateCheckout', 
      'Lead', 'Purchase', 'Schedule', 'Search', 'StartTrial', 'SubmitApplication', 
      'Subscribe', 'ViewContent', 'PageView'
    ];
    
    // Track via Browser Pixel with eventID (use trackCustom for non-standard events)
    const trackType = standardEvents.includes(name) ? 'track' : 'trackCustom';
    (window as any).fbq(trackType, name, payload, { eventID: eventId });
    
    // Track via Server CAPI with exact matching event_id
    sendCapiEvent(name, options, eventId, userData);

    return eventId;
  }
};

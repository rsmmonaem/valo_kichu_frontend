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

const generateEventId = () => {
  return `evt_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
};

const sendCapiEvent = async (eventName: string, customData: any, eventId: string, userData: any = {}) => {
  if (typeof window === 'undefined') return;
  
  try {
    await fetch('/api/fb-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.href,
        custom_data: customData,
        user_data: userData,
      }),
    });
  } catch (error) {
    console.error('Failed to send CAPI event', error);
  }
};

export const pageview = (userData: any = {}) => {
  if (typeof window !== 'undefined') {
    const eventId = generateEventId();
    const options: any = {};
    if (TEST_EVENT_CODE) {
      options.test_event_code = TEST_EVENT_CODE;
    }
    (window as any).fbq('track', 'PageView', options, { eventID: eventId });
    sendCapiEvent('PageView', {}, eventId, userData);
  }
};

// https://developers.facebook.com/docs/meta-pixel/reference
export const event = (name: string, options: any = {}, userData: any = {}) => {
  if (typeof window !== 'undefined') {
    const eventId = generateEventId();
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

    (window as any).fbq('track', name, payload, { eventID: eventId });
    sendCapiEvent(name, options, eventId, userData);
  }
};

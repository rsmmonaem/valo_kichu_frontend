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

export const pageview = () => {
  if (typeof window !== 'undefined') {
    const options: any = {};
    if (TEST_EVENT_CODE) {
      options.test_event_code = TEST_EVENT_CODE;
    }
    (window as any).fbq('track', 'PageView', options);
  }
};

// https://developers.facebook.com/docs/meta-pixel/reference
export const event = (name: string, options: any = {}) => {
  if (typeof window !== 'undefined') {
    const payload = { ...options };
    if (TEST_EVENT_CODE) {
      payload.test_event_code = TEST_EVENT_CODE;
    }
    (window as any).fbq('track', name, payload);
  }
};

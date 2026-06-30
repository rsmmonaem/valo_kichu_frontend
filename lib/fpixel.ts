export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
export const TEST_EVENT_CODE = process.env.NEXT_PUBLIC_FACEBOOK_TEST_EVENT_CODE;

export const pageview = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    const options: any = {};
    if (TEST_EVENT_CODE) {
      options.test_event_code = TEST_EVENT_CODE;
    }
    (window as any).fbq('track', 'PageView', options);
  }
};

// https://developers.facebook.com/docs/meta-pixel/reference
export const event = (name: string, options: any = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    const payload = { ...options };
    if (TEST_EVENT_CODE) {
      payload.test_event_code = TEST_EVENT_CODE;
    }
    (window as any).fbq('track', name, payload);
  }
};

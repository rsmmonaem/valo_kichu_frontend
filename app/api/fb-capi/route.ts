import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_name, event_id, event_source_url, custom_data, user_data } = body;

    const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Missing Pixel ID or Access Token' }, { status: 500 });
    }

    // Default user data (needs to be hashed if sending email/phone)
    // We get IP and User Agent from request headers
    const client_ip_address = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const client_user_agent = req.headers.get('user-agent') || '';

    // CAPI Payload
    const payload = {
      data: [
        {
          event_name: event_name,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id: event_id,
          event_source_url: event_source_url,
          user_data: {
            client_ip_address: client_ip_address,
            client_user_agent: client_user_agent,
            // If we have fbp / fbc cookies, we could include them here
            ...user_data,
          },
          custom_data: custom_data || {},
        },
      ],
      // test_event_code: process.env.NEXT_PUBLIC_FACEBOOK_TEST_EVENT_CODE || undefined,
    };

    if (process.env.NEXT_PUBLIC_FACEBOOK_TEST_EVENT_CODE) {
      (payload as any).test_event_code = process.env.NEXT_PUBLIC_FACEBOOK_TEST_EVENT_CODE;
    }

    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Meta CAPI Error:', data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('CAPI Request Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

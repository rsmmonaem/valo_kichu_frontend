import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function hashValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function hashPhone(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // Keep only digits
  let digits = value.replace(/\D/g, '');
  // Normalize local Bangladesh numbers (017... -> 88017...)
  if (digits.startsWith('0') && digits.length === 11) {
    digits = '88' + digits;
  }
  if (digits.length === 10 && digits.startsWith('1')) {
    digits = '880' + digits;
  }
  return crypto.createHash('sha256').update(digits).digest('hex');
}

function hashCountry(value: string | undefined): string | undefined {
  if (!value) return undefined;
  let normalized = value.trim().toLowerCase();
  if (normalized === 'bangladesh') {
    normalized = 'bd';
  }
  if (normalized.length > 2) {
    normalized = normalized.substring(0, 2);
  }
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_name, event_id, event_source_url, custom_data, user_data } = body;

    const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Missing Pixel ID or Access Token' }, { status: 500 });
    }

    // Retrieve cookies
    const cookieStore = await cookies();
    let fbp = cookieStore.get('_fbp')?.value;
    let fbc = cookieStore.get('_fbc')?.value;
    let setFbpCookie = false;
    let setFbcCookie = false;

    // Generate FBP if missing (fb.1.creationTime.randomNumber)
    if (!fbp) {
      const creationTime = Date.now();
      const randomNumber = Math.floor(Math.random() * 1000000000);
      fbp = `fb.1.${creationTime}.${randomNumber}`;
      setFbpCookie = true;
    }

    // Generate FBC if missing and fbclid query param is present in URL
    if (!fbc && event_source_url) {
      try {
        const urlObj = new URL(event_source_url);
        const fbclid = urlObj.searchParams.get('fbclid');
        if (fbclid) {
          const creationTime = Date.now();
          fbc = `fb.1.${creationTime}.${fbclid}`;
          setFbcCookie = true;
        }
      } catch (e) {
        // ignore invalid URL
      }
    }

    // Normalize and hash user_data for Conversions API
    const normalizedUserData: any = {};
    if (user_data) {
      if (user_data.email) normalizedUserData.em = hashValue(user_data.email);
      if (user_data.phone) normalizedUserData.ph = hashPhone(user_data.phone);
      if (user_data.firstName) normalizedUserData.fn = hashValue(user_data.firstName);
      if (user_data.lastName) normalizedUserData.ln = hashValue(user_data.lastName);
      if (user_data.city) normalizedUserData.ct = hashValue(user_data.city);
      if (user_data.state) normalizedUserData.st = hashValue(user_data.state);
      if (user_data.zip) normalizedUserData.zp = hashValue(user_data.zip);
      if (user_data.country) normalizedUserData.country = hashCountry(user_data.country);
      if (user_data.externalId) normalizedUserData.external_id = String(user_data.externalId);
    }

    // Default user data (IP and User Agent from request headers)
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
            ...(fbp ? { fbp } : {}),
            ...(fbc ? { fbc } : {}),
            ...normalizedUserData,
          },
          custom_data: custom_data || {},
        },
      ],
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

    // Create the NextResponse object
    const nextResponse = NextResponse.json({ success: true, data });

    // Set generated cookies back in browser response
    if (setFbpCookie && fbp) {
      nextResponse.cookies.set('_fbp', fbp, {
        maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
        path: '/',
        httpOnly: false, // Accessible by pixel script on frontend
        secure: true,
        sameSite: 'lax'
      });
    }

    if (setFbcCookie && fbc) {
      nextResponse.cookies.set('_fbc', fbc, {
        maxAge: 60 * 60 * 24 * 90, // 90 days
        path: '/',
        httpOnly: false,
        secure: true,
        sameSite: 'lax'
      });
    }

    return nextResponse;
  } catch (error: any) {
    console.error('CAPI Request Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

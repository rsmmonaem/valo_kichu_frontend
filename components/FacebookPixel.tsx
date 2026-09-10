'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import * as fpixel from '@/lib/fpixel';
import { useSettings } from '@/context/SettingsContext';

function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    fpixel.pageview();
  }, [pathname, searchParams]);

  return null;
}

export default function FacebookPixel() {
  const { settings, loading } = useSettings();

  useEffect(() => {
    if (!loading && settings) {
      fpixel.syncPixelSettings(settings);
    }
  }, [settings, loading]);

  const config = fpixel.getPixelConfig();
  const pixelId = settings?.facebook_pixel_id || config.pixelId || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  
  const isBrowserPixelEnabled = settings?.facebook_pixel_enabled !== undefined
    ? (settings.facebook_pixel_enabled === 'true' || settings.facebook_pixel_enabled === '1')
    : config.enableBrowserPixel;

  if (!isBrowserPixelEnabled || !pixelId) {
    return null;
  }

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq && f.fbq.loaded)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=n.queue||[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <NavigationEvents />
      </Suspense>
    </>
  );
}

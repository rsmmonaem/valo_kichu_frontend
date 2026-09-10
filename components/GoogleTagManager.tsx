'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useSettings } from '@/context/SettingsContext';
import * as gtm from '@/lib/gtm';

export default function GoogleTagManager() {
  const { settings, loading } = useSettings();

  useEffect(() => {
    if (!loading && settings) {
      gtm.syncGtmSettings(settings);
    }
  }, [settings, loading]);

  const config = gtm.getGtmConfig();
  const isEnabled = settings?.gtm_enabled !== undefined
    ? (settings.gtm_enabled === 'true' || settings.gtm_enabled === '1')
    : config.enabled;

  const gtmId = settings?.gtm_id || config.gtmId || process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WW3R96DZ';

  if (!isEnabled || !gtmId) {
    return null;
  }

  return (
    <>
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}

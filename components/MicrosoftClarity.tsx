'use client';

import { useSettings } from '@/context/SettingsContext';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function MicrosoftClarity() {
  const { settings } = useSettings();
  const pathname = usePathname();

  // Don't track admin dashboard
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const clarityId = settings?.clarity_id || process.env.NEXT_PUBLIC_CLARITY_ID;
  const isEnabled = (settings?.clarity_enabled !== 'false') && !!clarityId;

  if (!isEnabled || !clarityId) {
    return null;
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];
              if(y&&y.parentNode){y.parentNode.insertBefore(t,y);}else{(l.head||l.documentElement).appendChild(t);}
          })(window, document, "clarity", "script", "${clarityId}");
        `
      }}
    />
  );
}

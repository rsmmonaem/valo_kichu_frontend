"use client";

import Link from "next/link";
import { Phone, Facebook, Youtube, Instagram, Twitter } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function Footer() {
  const { settings } = useSettings();

  const customerServiceLinks = (() => {
    try {
      return JSON.parse(settings.footer_customer_service_links || "[]");
    } catch {
      return [];
    }
  })();

  const quickLinks = (() => {
    try {
      return JSON.parse(settings.footer_quick_links || "[]");
    } catch {
      return [];
    }
  })();

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mb-16 md:mb-0">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              {/* <div className="bg-blue-600 text-white p-1.5 rounded font-bold text-lg">V</div> */}
              <span className="text-xl font-bold text-gray-800">
                {/* {settings.footer_about_title || 'Valokichu'} */}
                {settings.site_logo && (
                  <img
                    src={
                      settings.site_logo.startsWith("http")
                        ? settings.site_logo
                        : `${
                            process.env.NEXT_PUBLIC_API_URL ||
                            "http://localhost:8000"
                          }/storage/${settings.site_logo}`
                    }
                    alt={settings.site_name || "Logo"}
                    className="h-14 w-auto group-hover:scale-105 transition-transform object-contain"
                  />
                )}
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              {settings.footer_about_text ||
                "Premium wholesale marketplace connecting you directly with best manufacturers. Quality products, factory prices."}
            </p>
            <div className="space-y-2 pt-2">
              {settings.footer_phone && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-blue-600" />
                  <span>{settings.footer_phone}</span>
                </div>
              )}
              {settings.footer_email && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="w-4 flex justify-center text-blue-600 font-bold">
                    @
                  </span>
                  <span>{settings.footer_email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-gray-800 mb-6">Customer Service</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              {customerServiceLinks.length > 0 ? (
                customerServiceLinks.map((link: any, i: number) => (
                  <li key={i}>
                    <Link
                      href={link.url}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link
                      href="/help"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/track"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Track Order
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/returns"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Returns & Refunds
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shipping"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Shipping Info
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Contact Us
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-800 mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              {quickLinks.length > 0 ? (
                quickLinks.map((link: any, i: number) => (
                  <li key={i}>
                    <Link
                      href={link.url}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-blue-600 transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/careers"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/sitemap"
                      className="hover:text-blue-600 transition-colors"
                    >
                      Sitemap
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* App & Social */}
          <div>
            <h4 className="font-bold text-gray-800 mb-6">Download App</h4>
            <div className="space-y-4">
              {settings.footer_play_store_url && (
                <a
                  href={settings.footer_play_store_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition w-full md:w-auto"
                >
                  <div className="text-2xl">►</div>
                  <div className="text-left">
                    <div className="text-[10px] uppercase tracking-wider">
                      Get it on
                    </div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </a>
              )}

              <div className="pt-4">
                <h5 className="font-bold text-gray-800 mb-3 text-sm">
                  Follow Us
                </h5>
                <div className="flex gap-4">
                  {settings.footer_facebook_url && (
                    <a
                      href={settings.footer_facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Facebook size={18} />
                    </a>
                  )}
                  {settings.footer_youtube_url && (
                    <a
                      href={settings.footer_youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Youtube size={18} />
                    </a>
                  )}
                  {settings.footer_instagram_url && (
                    <a
                      href={settings.footer_instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Instagram size={18} />
                    </a>
                  )}
                  {settings.footer_twitter_url && (
                    <a
                      href={settings.footer_twitter_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Twitter size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>
            {settings.footer_copyright_text ||
              `© ${new Date().getFullYear()} Valokichu.com. All rights reserved.`}
          </p>
          <div className="flex items-center gap-6">
            <span>We Accept:</span>
            <div className="flex items-center gap-2">
              <div>
                <img
                  src={`/bkash.jpeg`}
                  alt={settings.site_name || "Logo"}
                  className="h-10 w-auto group-hover:scale-105 transition-transform object-contain"
                />
              </div>
              <div>
                <img
                  src={`/nagad.png`}
                  alt={settings.site_name || "Logo"}
                  className="h-10 w-auto group-hover:scale-105 transition-transform object-contain"
                />
              </div>
              <div>
                <img
                  src={`/visa.png`}
                  alt={settings.site_name || "Logo"}
                  className="h-10 w-auto group-hover:scale-105 transition-transform object-contain"
                />
              </div>
              {/* <div className="h-6 w-10 bg-pink-600 rounded text-[8px] text-white flex items-center justify-center font-bold">bKash</div>
                            <div className="h-6 w-10 bg-orange-600 rounded text-[8px] text-white flex items-center justify-center font-bold">Nagad</div>
                            <div className="h-6 w-10 bg-blue-800 rounded text-[8px] text-white flex items-center justify-center font-bold">VISA</div> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

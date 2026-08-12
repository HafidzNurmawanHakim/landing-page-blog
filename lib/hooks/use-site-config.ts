"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/config/site";
import type {
  PublicSiteConfig,
  ResolvedSiteConfig,
} from "@/lib/services/site-config";

/**
 * Client access to the runtime site config (admin page `/admin/config`).
 * Fetches `/api/site-config` once (module-level cache shared by all consumers)
 * and falls back to the static defaults while loading or on error.
 */

const DEFAULTS: PublicSiteConfig = {
  contact: {
    phone: siteConfig.contact.phone,
    phoneDisplay: siteConfig.contact.phoneDisplay,
    email: siteConfig.contact.email,
    address: { ...siteConfig.contact.address },
    hours: {
      weekday: { ...siteConfig.contact.hours.weekday },
      time: { ...siteConfig.contact.hours.time },
    },
  },
  whatsappNumbers: siteConfig.whatsapp.numbers.map((w) => ({
    label: w.label,
    number: w.number,
  })),
  social: siteConfig.social.map((s) => ({ label: s.label, href: s.href })),
};

function mergeDefaults(
  data: Partial<ResolvedSiteConfig> | undefined
): PublicSiteConfig {
  if (!data) return DEFAULTS;
  return {
    contact: {
      phone: data.contact?.phone || DEFAULTS.contact.phone,
      phoneDisplay:
        data.contact?.phoneDisplay || DEFAULTS.contact.phoneDisplay,
      email: data.contact?.email || DEFAULTS.contact.email,
      address: { ...DEFAULTS.contact.address, ...data.contact?.address },
      hours: {
        weekday: {
          ...DEFAULTS.contact.hours.weekday,
          ...data.contact?.hours?.weekday,
        },
        time: { ...DEFAULTS.contact.hours.time, ...data.contact?.hours?.time },
      },
    },
    whatsappNumbers:
      Array.isArray(data.whatsappNumbers) && data.whatsappNumbers.length > 0
        ? data.whatsappNumbers.map((w) => ({
            label: w.label || "",
            number: w.number || "",
          }))
        : DEFAULTS.whatsappNumbers,
    social: Array.isArray(data.social) && data.social.length > 0
      ? data.social.map((s) => ({ label: s.label, href: s.href }))
      : DEFAULTS.social,
  };
}

let cachedPromise: Promise<PublicSiteConfig> | null = null;

function fetchConfig(): Promise<PublicSiteConfig> {
  cachedPromise ??= fetch("/api/site-config", { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<Partial<ResolvedSiteConfig>>;
    })
    .then((data) => mergeDefaults(data))
    .catch(() => DEFAULTS);
  return cachedPromise;
}

export function useSiteConfig(): {
  config: PublicSiteConfig;
  loading: boolean;
} {
  const [config, setConfig] = useState<PublicSiteConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchConfig().then((resolved) => {
      if (!active) return;
      setConfig(resolved);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { config, loading };
}

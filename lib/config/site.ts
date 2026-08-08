import type { Locale } from "@/lib/i18n/locales";

/**
 * Site-wide configuration. All public website data — SEO, contact, WhatsApp,
 * and links — lives here so it can be edited in one place.
 */

export interface SiteLink {
  href: string;
  labelKey: string;
}

export interface FooterColumn {
  titleKey: string;
  links: SiteLink[];
}

export type LocalizedText = Record<Locale, string>;

export interface PageSeo {
  title: LocalizedText;
  description: LocalizedText;
}

export const siteConfig = {
  name: "Destitour",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  defaultLocale: "id" as Locale,

  seo: {
    home: {
      title: {
        id: "Destitour - Booking Paket Wisata",
        en: "Destitour - Batam Tour Booking",
        ms: "Destitour - Tempahan Pakej Pelancongan",
        zh: "Destitour - 预订巴淡岛旅游套餐",
      },
      description: {
        id: "Marketplace paket tour Batam: Tour, Transport, Hotel. Booking online dengan konfirmasi cepat via WhatsApp.",
        en: "Batam tour package marketplace: Tour, Transport, Hotel. Book online with fast WhatsApp confirmation.",
        ms: "Pasaran pakej pelancongan Batam: Tour, Pengangkutan, Hotel. Tempah dalam talian dengan pengesahan pantas melalui WhatsApp.",
        zh: "巴淡岛旅游套餐平台：旅游、交通、酒店。在线预订，WhatsApp 快速确认。",
      },
    },
    about: {
      title: {
        id: "Tentang Destitour - Booking Paket Wisata",
        en: "About Destitour - Batam Tour Booking",
        ms: "Tentang Destitour - Tempahan Pakej Pelancongan",
        zh: "关于巴淡之旅 - 预订巴淡岛旅游套餐",
      },
      description: {
        id: "Kenali Destitour: marketplace paket tour Batam dengan harga transparan, konfirmasi cepat via WhatsApp, dan pemandu lokal berpengalaman.",
        en: "Get to know Destitour: Batam tour package marketplace with transparent pricing, fast WhatsApp confirmation, and experienced local guides.",
        ms: "Kenali Destitour: pasaran pakej pelancongan Batam dengan harga telus, pengesahan pantas melalui WhatsApp, dan pemandu tempatan berpengalaman.",
        zh: "了解巴淡之旅：巴淡岛旅游套餐平台，价格透明，WhatsApp 快速确认，资深本地导游。",
      },
    },
    packages: {
      title: {
        id: "Paket Wisata - Destitour",
        en: "Tour Packages - Destitour",
        ms: "Pakej Pelancongan - Destitour",
        zh: "旅游套餐 - 巴淡之旅",
      },
      description: {
        id: "Pilih paket Tour, Transport, atau Hotel sesuai kebutuhan liburanmu ke Batam.",
        en: "Choose a Tour, Transport, or Hotel package for your trip to Batam.",
        ms: "Pilih pakej Tour, Pengangkutan, atau Hotel mengikut keperluan percutian anda ke Batam.",
        zh: "选择适合您巴淡岛之旅的旅游、交通或酒店套餐。",
      },
    },
    gallery: {
      title: {
        id: "Galeri - Destitour",
        en: "Gallery - Destitour",
        ms: "Galeri - Destitour",
        zh: "画廊 - 巴淡之旅",
      },
      description: {
        id: "Lihat momen wisata di Batam lewat foto pilihan Destitour: pantai, Jembatan Barelang, kuliner, dan destinasi favorit.",
        en: "See Batam travel moments through Destitour's curated photos: beaches, Barelang Bridge, food, and favorite spots.",
        ms: "Lihat momen pelancongan di Batam melalui foto pilihan Destitour: pantai, Jambatan Barelang, makanan, dan destinasi kegemaran.",
        zh: "通过巴淡之旅精选照片欣赏巴淡岛的旅行瞬间：海滩、巴兰桥、美食和热门景点。",
      },
    },
  },

  contact: {
    phoneDisplay: "+62 812 3456 7890",
    phone: "+6281234567890",
    whatsapp: "6281234567890",
    email: "halo@destitour.id",
    address: {
      id: "Batam Center, Batam, Kepulauan Riau",
      en: "Batam Center, Batam, Riau Islands",
      ms: "Batam Center, Batam, Kepulauan Riau",
      zh: "巴淡中心，巴淡，廖内群岛",
    } satisfies LocalizedText,
    hours: {
      weekday: {
        id: "Senin - Jumat",
        en: "Monday - Friday",
        ms: "Isnin - Jumaat",
        zh: "周一至周五",
      } satisfies LocalizedText,
      time: {
        id: "08.00 - 16.00",
        en: "08:00 - 16:00",
        ms: "08:00 - 16:00",
        zh: "08:00 - 16:00",
      } satisfies LocalizedText,
    },
  },

  whatsapp: {
    defaultMessage: {
      id: "Halo Destitour, saya ingin bertanya tentang paket wisata.",
      en: "Hello Destitour, I would like to ask about tour packages.",
      ms: "Halo Destitour, saya ingin bertanya tentang pakej pelancongan.",
      zh: "您好，巴淡之旅，我想咨询旅游套餐。",
    } satisfies LocalizedText,
  },

  links: {
    nav: [
      { href: "/packages", labelKey: "nav.packages" },
      { href: "/gallery", labelKey: "nav.gallery" },
      { href: "/about", labelKey: "nav.about" },
      { href: "/#contact", labelKey: "nav.contact" },
      { href: "/#faq", labelKey: "nav.faq" },
    ] satisfies SiteLink[],
    footer: [
      {
        titleKey: "footer.packages",
        links: [
          { labelKey: "footer.tour", href: "/packages?category=tour" },
          { labelKey: "footer.transport", href: "/packages?category=transport" },
          { labelKey: "footer.hotel", href: "/packages?category=hotel" },
        ],
      },
      {
        titleKey: "footer.help",
        links: [
          { labelKey: "footer.howToBook", href: "/#faq" },
          { labelKey: "footer.contact", href: "/#contact" },
          { labelKey: "footer.faq", href: "/#faq" },
        ],
      },
      {
        titleKey: "footer.info",
        links: [
          { labelKey: "footer.about", href: "/about" },
          { labelKey: "footer.gallery", href: "/gallery" },
        ],
      },
    ] satisfies FooterColumn[],
  },
} as const;

export type SiteConfig = typeof siteConfig;

export function getSeo(page: keyof SiteConfig["seo"], locale: Locale) {
  const seo = siteConfig.seo[page];
  return {
    title: seo.title[locale] ?? seo.title[siteConfig.defaultLocale],
    description:
      seo.description[locale] ?? seo.description[siteConfig.defaultLocale],
  };
}

export function pickSiteText(text: LocalizedText, locale: Locale) {
  return text[locale] ?? text[siteConfig.defaultLocale];
}

export function getWhatsAppLink(locale: Locale, message?: string) {
  const text =
    message ??
    siteConfig.whatsapp.defaultMessage[locale] ??
    siteConfig.whatsapp.defaultMessage[siteConfig.defaultLocale];
  return `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(text)}`;
}

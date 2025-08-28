interface MetadataProps {
  title: string;
  description: string;
  image?: string;
  type?: string;
  url?: string;
  siteName?: string;
  locale?: string;
  author?: string;
  keywords?: string;
  robots?: boolean;
}

const DEFAULT_PREVIEW_IMAGE = '/preview.png';
const DEFAULT_SITE_NAME = 'Pubky App';
const DEFAULT_LOCALE = 'en_US';
const DEFAULT_AUTHOR = 'Pubky Team';
const DEFAULT_KEYWORDS = 'pubky, social media, decentralized, key, pkarr, pubky core';
const DEFAULT_TYPE = 'website';
const DEFAULT_URL = 'https://pubky.app';

export function Metadata({
  title,
  description,
  image,
  type,
  url,
  siteName,
  locale,
  author,
  keywords,
  robots,
}: MetadataProps) {
  return {
    title,
    description,
    keywords: keywords || DEFAULT_KEYWORDS,
    authors: [{ name: author || DEFAULT_AUTHOR }],
    creator: author || DEFAULT_AUTHOR,
    icons: {
      icon: '/pubky-favicon.svg',
      shortcut: '/pubky-favicon.svg',
      apple: '/pubky-favicon.svg',
    },
    openGraph: {
      title,
      description,
      url: url || DEFAULT_URL,
      siteName: siteName || DEFAULT_SITE_NAME,
      images: [
        {
          url: image || DEFAULT_PREVIEW_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale || DEFAULT_LOCALE,
      type: type || DEFAULT_TYPE,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image || DEFAULT_PREVIEW_IMAGE],
      creator: '@pubkyapp',
      site: '@pubkyapp',
    },
    robots: {
      index: robots ?? true,
      follow: robots ?? true,
    },
    alternates: {
      canonical: url || DEFAULT_URL,
    },
  };
}

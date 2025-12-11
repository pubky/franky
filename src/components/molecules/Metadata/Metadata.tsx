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
  creator?: string;
  site?: string;
  favicon?: string;
}
import * as Config from '@/config';

interface MetadataResult {
  metadataBase: URL;
  title: string;
  description: string;
  keywords: string;
  authors: Array<{ name: string }>;
  creator: string;
  icons: {
    icon: string;
    shortcut: string;
    apple: string;
  };
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    locale: string;
    type: string;
  };
  twitter: {
    card: 'summary_large_image';
    title: string;
    description: string;
    images: string[];
    creator: string;
    site: string;
  };
  robots: {
    index: boolean;
    follow: boolean;
  };
  alternates: {
    canonical: string;
  };
}

export function Metadata({
  title,
  description,
  image = Config.DEFAULT_PREVIEW_IMAGE,
  type = Config.DEFAULT_TYPE,
  url = Config.DEFAULT_URL,
  siteName = Config.DEFAULT_SITE_NAME,
  locale = Config.DEFAULT_LOCALE,
  author = Config.DEFAULT_AUTHOR,
  keywords = Config.DEFAULT_KEYWORDS,
  robots = true,
  creator = Config.DEFAULT_CREATOR,
  site = Config.DEFAULT_URL,
  favicon = '/pubky-favicon.svg',
}: MetadataProps): MetadataResult {
  return {
    metadataBase: new URL(Config.DEFAULT_URL),
    title,
    description,
    keywords,
    authors: [{ name: author }],
    creator: author,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator,
      site,
    },
    robots: {
      index: robots,
      follow: robots,
    },
    alternates: {
      canonical: url,
    },
  };
}

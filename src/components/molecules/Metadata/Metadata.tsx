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
}: MetadataProps) {
  return {
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

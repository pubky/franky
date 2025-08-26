'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface PageMetadata {
  title: string;
  description: string;
  image?: string;
  type?: string;
  url?: string;
  siteName?: string;
  locale?: string;
  author?: string;
  keywords?: string;
}

const DEFAULT_PREVIEW_IMAGE = '/preview.png';
const DEFAULT_SITE_NAME = 'Pubky App';
const DEFAULT_LOCALE = 'en_US';
const DEFAULT_AUTHOR = 'Pubky Team';
const DEFAULT_KEYWORDS = 'pubky, social media, decentralized, key, pkarr, pubky core';
const DEFAULT_TYPE = 'website';

// Helper function to get or create a meta element
function getOrCreateMetaElement(selector: string, attributes: Record<string, string>): HTMLElement {
  let element = document.querySelector(selector) as HTMLElement;
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }
  return element;
}

// Helper function to get or create a link element
function getOrCreateLinkElement(selector: string, attributes: Record<string, string>): HTMLElement {
  let element = document.querySelector(selector) as HTMLElement;
  if (!element) {
    element = document.createElement('link');
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }
  return element;
}

// Function to update page title
function updatePageTitle(title: string): void {
  document.title = title;
}

// Function to update meta description
function updateMetaDescription(description: string): void {
  const metaDescription = getOrCreateMetaElement('meta[name="description"]', {
    name: 'description',
  });
  metaDescription.setAttribute('content', description);
}

// Function to update viewport meta tag
function updateViewport(): void {
  getOrCreateMetaElement('meta[name="viewport"]', {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1.0',
  });
}

// Function to update robots meta tag
function updateRobots(): void {
  getOrCreateMetaElement('meta[name="robots"]', {
    name: 'robots',
    content: 'index, follow',
  });
}

// Function to update author meta tag
function updateAuthor(author: string): void {
  getOrCreateMetaElement('meta[name="author"]', {
    name: 'author',
    content: author,
  });
}

// Function to update keywords meta tag
function updateKeywords(keywords: string): void {
  getOrCreateMetaElement('meta[name="keywords"]', {
    name: 'keywords',
    content: keywords,
  });
}

// Function to update canonical URL
function updateCanonicalUrl(url: string): void {
  getOrCreateLinkElement('link[rel="canonical"]', {
    rel: 'canonical',
    href: url,
  });
}

// Function to update Open Graph metadata
function updateOpenGraph(metadata: PageMetadata): void {
  metadata.image = metadata.image || DEFAULT_PREVIEW_IMAGE;

  // Update Open Graph title
  const ogTitle = getOrCreateMetaElement('meta[property="og:title"]', {
    property: 'og:title',
  });
  ogTitle.setAttribute('content', metadata.title);

  // Update Open Graph description
  const ogDescription = getOrCreateMetaElement('meta[property="og:description"]', {
    property: 'og:description',
  });
  ogDescription.setAttribute('content', metadata.description);

  // Update Open Graph type
  const ogType = getOrCreateMetaElement('meta[property="og:type"]', {
    property: 'og:type',
  });
  ogType.setAttribute('content', metadata.type || DEFAULT_TYPE);

  // Update Open Graph URL
  const ogUrl = getOrCreateMetaElement('meta[property="og:url"]', {
    property: 'og:url',
  });
  ogUrl.setAttribute('content', metadata.url || window.location.href);

  // Update Open Graph site name
  const ogSiteName = getOrCreateMetaElement('meta[property="og:site_name"]', {
    property: 'og:site_name',
  });
  ogSiteName.setAttribute('content', metadata.siteName || DEFAULT_SITE_NAME);

  // Update Open Graph locale
  const ogLocale = getOrCreateMetaElement('meta[property="og:locale"]', {
    property: 'og:locale',
  });
  ogLocale.setAttribute('content', metadata.locale || DEFAULT_LOCALE);

  // Update Open Graph image if available
  if (metadata.image) {
    const ogImage = getOrCreateMetaElement('meta[property="og:image"]', {
      property: 'og:image',
    });
    ogImage.setAttribute('content', metadata.image);
  }
}

// Function to update Twitter Card metadata
function updateTwitterCard(metadata: PageMetadata): void {
  metadata.image = metadata.image || DEFAULT_PREVIEW_IMAGE;

  // Update Twitter card type
  const twitterCard = getOrCreateMetaElement('meta[name="twitter:card"]', {
    name: 'twitter:card',
  });
  twitterCard.setAttribute('content', 'summary_large_image');

  // Update Twitter title
  const twitterTitle = getOrCreateMetaElement('meta[name="twitter:title"]', {
    name: 'twitter:title',
  });
  twitterTitle.setAttribute('content', metadata.title);

  // Update Twitter description
  const twitterDescription = getOrCreateMetaElement('meta[name="twitter:description"]', {
    name: 'twitter:description',
  });
  twitterDescription.setAttribute('content', metadata.description);

  // Update Twitter site
  const twitterSite = getOrCreateMetaElement('meta[name="twitter:site"]', {
    name: 'twitter:site',
  });
  twitterSite.setAttribute('content', '@pubkyapp');

  // Update Twitter creator
  const twitterCreator = getOrCreateMetaElement('meta[name="twitter:creator"]', {
    name: 'twitter:creator',
  });
  twitterCreator.setAttribute('content', '@pubkyapp');

  // Update Twitter image if available
  if (metadata.image) {
    const twitterImage = getOrCreateMetaElement('meta[name="twitter:image"]', {
      name: 'twitter:image',
    });
    twitterImage.setAttribute('content', metadata.image);
  }
}

// Function to add favicon and icons
function addFaviconAndIcons(): void {
  // Add favicon
  getOrCreateLinkElement('link[rel="icon"]', {
    rel: 'icon',
    href: '/pubky-favicon.svg',
    type: 'image/svg+xml',
  });

  // Add shortcut icon
  getOrCreateLinkElement('link[rel="shortcut icon"]', {
    rel: 'shortcut icon',
    href: '/pubky-favicon.svg',
  });

  // Add apple touch icon
  getOrCreateLinkElement('link[rel="apple-touch-icon"]', {
    rel: 'apple-touch-icon',
    href: '/pubky-favicon.svg',
  });
}

// Function to add Schema.org JSON-LD markup
function addSchemaOrgMarkup(metadata: PageMetadata): void {
  // Remove existing schema markup
  const existingSchema = document.querySelector('script[type="application/ld+json"]');
  if (existingSchema) {
    existingSchema.remove();
  }

  // Create new schema markup
  const schemaScript = document.createElement('script');
  schemaScript.setAttribute('type', 'application/ld+json');

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: metadata.title,
    description: metadata.description,
    url: metadata.url || window.location.href,
    publisher: {
      '@type': 'Organization',
      name: DEFAULT_SITE_NAME,
      url: window.location.origin,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${window.location.origin}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  schemaScript.textContent = JSON.stringify(schemaData);
  document.head.appendChild(schemaScript);
}

// Function to get appropriate metadata based on current route
function getPageMetadata(pathname: string): PageMetadata {
  const is404Page = !pageMetadataMap[pathname];

  if (is404Page) {
    return notFoundMetadata;
  }

  return pageMetadataMap[pathname] || defaultMetadata;
}

// Function to update all metadata
function updateAllMetadata(metadata: PageMetadata): void {
  // Update basic meta tags
  updatePageTitle(metadata.title);
  updateMetaDescription(metadata.description);
  updateViewport();
  updateRobots();
  updateAuthor(metadata.author || DEFAULT_AUTHOR);
  updateKeywords(metadata.keywords || DEFAULT_KEYWORDS);

  // Update canonical URL
  const currentUrl = `${window.location.origin}${window.location.pathname}`;
  updateCanonicalUrl(metadata.url || currentUrl);

  // Update social media metadata
  updateOpenGraph(metadata);
  updateTwitterCard(metadata);

  // Update favicon and schema
  addFaviconAndIcons();
  addSchemaOrgMarkup(metadata);
}

export function Metadata() {
  const pathname = usePathname();

  useEffect(() => {
    const pageMetadata = getPageMetadata(pathname);
    updateAllMetadata(pageMetadata);
  }, [pathname]);

  return null;
}

const pageMetadataMap: Record<string, PageMetadata> = {
  '/': {
    title: 'Pubky App - Unlock the web',
    description:
      'Pubky App is a social-media-like experience built over Pubky Core. It serves as a working example on how to build over Pubky Core to create simple or complex applications.',
  },
  '/onboarding/install': {
    title: 'Install - Onboarding',
    description: 'Onboarding install page on pubky app.',
  },
  '/onboarding/profile': {
    title: 'Profile - Onboarding',
    description: 'Onboarding profile page on pubky app.',
  },
  '/onboarding/scan': {
    title: 'Scan - Onboarding',
    description: 'Onboarding scan page on pubky app.',
  },
  '/onboarding/backup': {
    title: 'Backup - Onboarding',
    description: 'Onboarding backup page on pubky app.',
  },
  '/onboarding/homeserver': {
    title: 'Homeserver - Onboarding',
    description: 'Onboarding homeserver page on pubky app.',
  },
  '/onboarding/pubky': {
    title: 'Pubky - Onboarding',
    description: 'Onboarding pubky page on pubky app.',
  },
};

const defaultMetadata: PageMetadata = {
  title: 'Pubky App',
  description:
    'Pubky App is a social-media-like experience built over Pubky Core. It serves as a working example on how to build over Pubky Core to create simple or complex applications.',
};

const notFoundMetadata: PageMetadata = {
  title: 'Page Not Found - Pubky App',
  description: 'The page you are looking for does not exist.',
};

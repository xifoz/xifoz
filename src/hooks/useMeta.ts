import { useEffect } from 'react';

interface MetaOptions {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

const SITE_NAME = 'XIFOZ';
const BASE_URL = 'https://xifoz.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/og/og-image.jpg`;

export function useMeta({ title, description, canonical, ogImage }: MetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
    const imageUrl = ogImage ?? DEFAULT_OG_IMAGE;

    document.title = fullTitle;

    setMeta('description', description);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:image', imageUrl, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', SITE_NAME, 'property');
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', fullTitle, 'name');
    setMeta('twitter:description', description, 'name');
    setMeta('twitter:image', imageUrl, 'name');

    setCanonical(canonicalUrl);

    return () => {
      document.title = SITE_NAME;
    };
  }, [title, description, canonical, ogImage]);
}

function setMeta(nameOrProp: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

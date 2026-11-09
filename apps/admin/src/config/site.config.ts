export const getPublicWebUrl = (path: string = '', _tenantSlug?: string): string => {
  let base = process.env.NEXT_PUBLIC_WEB_URL;
  if (!base && typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    base = 'https://omnistay-web.vercel.app';
  }
  if (!base) {
    base = process.env.NODE_ENV === 'production'
      ? 'https://omnistay-web.vercel.app'
      : 'http://localhost:3001';
  }

  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  return `${cleanBase}${cleanPath}`;
};


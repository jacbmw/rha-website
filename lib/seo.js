export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ripehouseadvisory.com.au';
export const SITE_NAME = 'Ripehouse Advisory';

export const DEFAULT_OG_IMAGE = {
  url: 'https://rha-blog-assets.s3.ap-southeast-2.amazonaws.com/rha-site/00b2dce8-67883d925988c40eb2582e45_RHLogo_Dark-p-1600.png',
  alt: 'Ripehouse Advisory',
};

export function pageMetadata({ title, description, path = '/', image, ogTitle, ogDescription, article, ...rest }) {
  const images = [image || DEFAULT_OG_IMAGE];
  const shareTitle = ogTitle || title;
  const shareDescription = ogDescription || description;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description: shareDescription,
      url: path,
      siteName: SITE_NAME,
      locale: 'en_AU',
      type: article ? 'article' : 'website',
      ...(article || {}),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: shareDescription,
      images: images.map((img) => img.url),
    },
    ...rest,
  };
}

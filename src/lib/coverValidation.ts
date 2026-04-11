const ALLOWED = /\.(jpe?g|png)$/i;

/** 封面仅支持 .jpg / .jpeg / .png */
export function isAllowedCoverUrl(url: string): boolean {
  try {
    const path = new URL(url, 'https://example.com').pathname;
    return ALLOWED.test(path);
  } catch {
    return ALLOWED.test(url);
  }
}

import * as URI from 'urijs';

/**
 * Utility function to mask authentication from URLs.
 *
 * @param url The url to be masked
 *
 * @returns {string}
 */
export function maskAuthUrl(url): string {
  const uri = new URI(url);
  if (uri.password()) {
    uri.password(uri.password().split('').map(() => 'x').join(''));
  }
  return uri.toString();
}

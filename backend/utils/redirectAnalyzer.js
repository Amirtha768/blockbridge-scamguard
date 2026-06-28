/**
 * Redirect Analyzer - Follows redirect chains to detect suspicious redirects
 * Uses HTTP HEAD requests with timeout and max depth limits
 */

import https from 'https';
import http from 'http';

const MAX_REDIRECTS = 5;
const REQUEST_TIMEOUT = 2000; // 2 seconds per request
const REDIRECT_STATUS_CODES = [301, 302, 307, 308];

/**
 * Follow redirects for a URL and return the chain
 * @param {string} url - URL to analyze
 * @param {number} maxDepth - Maximum redirect depth (default 5)
 * @returns {Promise<Object>} - { urls: string[], count: number, finalDestination: string }
 */
export async function followRedirects(url, maxDepth = MAX_REDIRECTS) {
  const chain = {
    urls: [url],
    count: 0,
    finalDestination: url
  };

  try {
    let currentUrl = url;
    let depth = 0;

    while (depth < maxDepth) {
      const redirectUrl = await makeHeadRequest(currentUrl);
      
      if (!redirectUrl) {
        // No more redirects
        chain.finalDestination = currentUrl;
        break;
      }

      // Add redirect to chain
      chain.urls.push(redirectUrl);
      chain.count++;
      currentUrl = redirectUrl;
      depth++;

      // Prevent infinite loops
      if (chain.urls.filter(u => u === redirectUrl).length > 1) {
        console.warn('Redirect loop detected');
        break;
      }
    }

    return chain;
  } catch (error) {
    console.error('Redirect analysis error:', error);
    // Return what we have so far
    return chain;
  }
}

/**
 * Make HTTP HEAD request and check for redirects
 * @param {string} url - URL to request
 * @returns {Promise<string|null>} - Redirect URL or null if no redirect
 */
async function makeHeadRequest(url) {
  return new Promise((resolve) => {
    try {
      // Parse URL
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const options = {
        method: 'HEAD',
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        timeout: REQUEST_TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        // Don't follow redirects automatically
        followAllRedirects: false,
        maxRedirects: 0
      };

      const req = protocol.request(options, (res) => {
        // Check if response is a redirect
        if (REDIRECT_STATUS_CODES.includes(res.statusCode)) {
          const location = res.headers.location;
          
          if (location) {
            // Handle relative URLs
            const redirectUrl = location.startsWith('http') 
              ? location 
              : new URL(location, url).href;
            
            resolve(redirectUrl);
          } else {
            resolve(null);
          }
        } else {
          // Not a redirect
          resolve(null);
        }
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });

      req.end();
    } catch (error) {
      console.error('URL parsing error:', error);
      resolve(null);
    }
  });
}

/**
 * Count redirects for a URL (simplified version)
 * @param {string} url - URL to check
 * @returns {Promise<number>} - Number of redirects
 */
export async function countRedirects(url) {
  try {
    const chain = await followRedirects(url);
    return chain.count;
  } catch (error) {
    console.error('Error counting redirects:', error);
    return 0;
  }
}

/**
 * Check if URL has excessive redirects (>2)
 * @param {number} redirectCount - Number of redirects
 * @returns {boolean} - True if excessive (>2)
 */
export function hasExcessiveRedirects(redirectCount) {
  return redirectCount > 2;
}

export default {
  followRedirects,
  countRedirects,
  hasExcessiveRedirects
};

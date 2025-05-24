const colors = require('chalk');

/**
 * Highlights URLs in a given text string.
 * URLs are identified by a specific regex, and their parts (path, query parameters)
 * are colored differently.
 *
 * @param {string} text The input string to highlight.
 * @returns {string} The string with URLs highlighted.
 */
function highlightUrl(text) {
  // Regex from the original task description / lib/index.js
  const urlRegex = /(\/api\/[a-zA-Z0-9\/-_]+)(?:\?((?:[^=&\s]+=[^&?\s]*(?:&|$))*))?/g;

  return text.replace(urlRegex, (fullMatch, pathPart, queryStringPart) => {
    let highlightedUrl = colors.cyan(pathPart);

    if (queryStringPart !== undefined) {
      highlightedUrl += colors.cyan('?');
      if (queryStringPart) { // Only process if there are actual params
        // Query parameter regex from original task description / lib/index.js
        const queryParamRegex = /([^=&\s]+)=([^&?\s]*)/g;
        const params = [];
        let match;
        while ((match = queryParamRegex.exec(queryStringPart)) !== null) {
          const key = match[1] ? colors.yellow(match[1]) : '';
          const value = match[2] ? colors.green(match[2]) : '';
          params.push(key + colors.cyan('=') + value);
        }
        highlightedUrl += params.join(colors.cyan('&'));
      }
    }
    return highlightedUrl;
  });
}

module.exports = { highlightUrl };

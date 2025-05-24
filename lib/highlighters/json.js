const colors = require('chalk');

/**
 * Highlights JSON-like objects in a given text string.
 * JSON-like objects are identified by the regex /\{.*\}/ig and colored blue.
 * Note: The regex is greedy and may match more than intended if multiple
 * JSON-like structures are on the same line or if structures are malformed.
 *
 * @param {string} text The input string to highlight.
 * @returns {string} The string with JSON-like objects highlighted.
 */
function highlightJson(text) {
  const jsonObjectRegex = /\{.*\}/ig;
  return text.replace(jsonObjectRegex, (match) => {
    return colors.blue(match);
  });
}

module.exports = { highlightJson };

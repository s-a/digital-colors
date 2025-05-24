const colors = require('chalk');

/**
 * Highlights XML-like tags in a given text string.
 * XML-like tags are identified by the regex /<.+>/ig and colored cyan.
 *
 * @param {string} text The input string to highlight.
 * @returns {string} The string with XML-like tags highlighted.
 */
function highlightXml(text) {
  const xmlRegex = /<.+>/ig;
  return text.replace(xmlRegex, (match) => {
    return colors.cyan(match);
  });
}

module.exports = { highlightXml };

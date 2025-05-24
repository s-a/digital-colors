const colors = require('chalk');

/**
 * Highlights HTTP method strings in a given text string.
 * HTTP methods are identified from a predefined list and a regex that requires
 * spaces around the method. The matched method is then underlined and bolded.
 *
 * @param {string} text The input string to highlight.
 * @returns {string} The string with HTTP methods highlighted.
 */
function highlightHttpMethod(text) {
  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  // Note the spaces around the capture group in the regex
  const httpMethodRegex = new RegExp(` (${httpMethods.join('|')}) `, 'g');

  return text.replace(httpMethodRegex, (match) => {
    // Preserve surrounding spaces, color the trimmed match
    return ' ' + colors.underline.bold(match.trim()) + ' ';
  });
}

module.exports = { highlightHttpMethod };

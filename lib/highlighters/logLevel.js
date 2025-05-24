const colors = require('chalk');

const infoRegex = / INFO /g;
const debugRegex = / DEBUG /g;
const errorRegex = / ERROR /g;
const fatalRegex = / FATAL /g;

/**
 * Highlights log level strings in a given text string.
 * It applies replacements for INFO, DEBUG, ERROR, and FATAL log levels
 * using specific regexes and colors.
 *
 * @param {string} text The input string to highlight.
 * @returns {string} The string with log levels highlighted.
 */
function highlightLogLevel(text) {
  let processedText = text;

  // INFO level
  processedText = processedText.replace(infoRegex, (match) => {
    return colors.green(match);
  });

  // DEBUG level
  processedText = processedText.replace(debugRegex, (match) => {
    return colors.gray(match);
  });

  // ERROR level
  processedText = processedText.replace(errorRegex, (match) => {
    return colors.red(match);
  });

  // FATAL level
  processedText = processedText.replace(fatalRegex, (match) => {
    return colors.redBright(match);
  });

  return processedText;
}

module.exports = { highlightLogLevel };

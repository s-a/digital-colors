const colors = require('chalk')

/**
 * Highlights log level strings in a given text string.
 * It applies replacements for INFO, DEBUG, ERROR, and FATAL log levels
 * using specific regexes and colors.
 *
 * @param {string} text The input string to highlight.
 * @returns {string} The string with log levels highlighted.
 */
function highlightLogLevel(text) {
	let processedText = text

	// INFO level
	processedText = processedText.replace(new RegExp(' INFO ', 'g'), (match) => {
		return colors.green(match)
	})

	// DEBUG level
	processedText = processedText.replace(new RegExp(' DEBUG ', 'g'), (match) => {
		return colors.gray(match)
	})

	// ERROR level
	processedText = processedText.replace(new RegExp(' ERROR ', 'g'), (match) => {
		return colors.red(match)
	})

	// FATAL level
	processedText = processedText.replace(new RegExp(' FATAL ', 'g'), (match) => {
		return colors.redBright(match)
	})

	return processedText
}

module.exports = { highlightLogLevel }

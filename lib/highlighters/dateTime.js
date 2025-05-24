const colors = require('chalk')

/**
 * Highlights DateTime strings in a given text string.
 * DateTime strings are identified by the regex /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}?,\d{3})/ig
 * and colored yellow. The regex matches patterns like "YYYY-MM-DD HH:MM:SS,mmm".
 * The seconds part before the comma is matched non-greedily by SS?.
 *
 * @param {string} text The input string to highlight.
 * @returns {string} The string with DateTime strings highlighted.
 */
function highlightDateTime(text) {
	const dateTimeRegex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}?,\d{3})/ig
	return text.replace(dateTimeRegex, (match) => {
		return colors.yellow(match)
	})
}

module.exports = { highlightDateTime }

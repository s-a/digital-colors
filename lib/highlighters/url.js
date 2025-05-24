const colors = require('chalk')

/**
 * Highlights URLs in a given text string.
 * URLs are identified by a specific regex, and their parts (path, query parameters)
 * are colored differently.
 *
 * @param {string} text The input string to highlight.
 * @returns {string} The string with URLs highlighted.
 */
function highlightUrl(text) {
	// Regex to match path and optional query string
	const urlRegex = /(\/api\/[A-Za-z0-9\/_-]+)(?:\?([^\s.,!?;:]*))?/g

	return text.replace(urlRegex, (match, pathPart, queryString) => {
		// Highlight the path in cyan
		let result = colors.cyan(pathPart)

		// Handle query string if present
		if (queryString !== undefined) {
			result += colors.cyan('?')

			// Process parameters if they exist
			if (queryString.length > 0) {
				const coloredParams = queryString.split('&').map(param => {
					// Handle parameters with or without values
					if (param.includes('=')) {
						const [key, value] = param.split('=')
						// Highlight key in yellow, '=' in cyan, and value in green (if present)
						return colors.yellow(key) + colors.cyan('=') + (value ? colors.green(value) : '')
					}
					// Parameter without '=' (flag) in yellow
					return colors.yellow(param)
				})
				result += coloredParams.join(colors.cyan('&'))
			}
		}

		return result
	})
}

module.exports = { highlightUrl }
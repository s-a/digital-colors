const chalk = require('chalk')

function highlightXml(text) {
	// Improved regex to match complete XML elements, self-closing tags, and malformed tags
	const xmlRegex = /<[^>]+>(?:[^<]|<(?![\/]))*<\/[^>]+>|<[^>]+\/>|<[^>]+>(?:[^<]|<(?![/]))*/g
	return text.replace(xmlRegex, (match) => chalk.cyan(match))
}

module.exports = { highlightXml }
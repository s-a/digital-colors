class UuidHighlighter {
	/**
	 * Checks if the given text represents a valid UUID.
	 * A UUID is a 36-character string (including 4 hyphens) of the form
	 * xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx where x is a hexadecimal digit.
	 *
	 * @param {string} text The text to check.
	 * @returns {boolean} True if the text is a UUID, false otherwise.
	 */
	isUuid(text) {
		if (text === null || text === undefined || typeof text !== 'string') {
			return false
		}

		const trimmedText = text.trim()
		if (trimmedText.length !== 36) {
			return false
		}

		const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
		return uuidRegex.test(trimmedText)
	}
}

module.exports = UuidHighlighter

class PathHighlighter {
	/**
   * Checks if the given text represents a valid file path.
   *
   * @param {string} text The text to check.
   * @returns {boolean} True if the text is a path, false otherwise.
   */
	isPath(text) {
		if (text === null || text === undefined || typeof text !== 'string') {
			return false
		}

		const trimmedText = text.trim()
		if (trimmedText === '') {
			return false
		}

		// Check for Windows absolute paths (e.g., C:\Users\name, D:/folder/file.txt)
		if (/^[a-zA-Z]:[\\/]/.test(trimmedText)) {
			return true
		}

		// Check for Windows UNC paths (e.g., \\server\share, \\localhost\c$)
		// Ensures both a server name and a share name are present.
		// Server and share components cannot contain any whitespace characters.
		// The share name is matched non-greedily and must be followed by a separator or end of string.
		if (/^\\\\([^\\/\s]+)\\([^\\/\s]+?)(?=\\|\/|$)/.test(trimmedText)) {
			return true
		}

		// Check for Unix-like absolute paths (e.g., /home/user, /var/log/sys.log)
		// It must start with '/', and if it's longer than '/', the second char cannot be another '/'.
		if (trimmedText.startsWith('/') && (trimmedText.length === 1 || trimmedText[1] !== '/')) {
			return true
		}

		return false
	}
}

module.exports = PathHighlighter

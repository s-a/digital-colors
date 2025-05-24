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
		if (/^\\\\([^\\/ ]+)\\([^\\/ ]+)/.test(trimmedText)) {
			return true
		}

		// Check for Unix-like absolute paths (e.g., /home/user, /var/log/sys.log)
		if (/^\//.test(trimmedText)) {
			return true
		}

		return false
	}
}

module.exports = PathHighlighter

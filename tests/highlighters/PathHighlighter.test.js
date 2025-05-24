const PathHighlighter = require('../../lib/highlighters/PathHighlighter')

describe('PathHighlighter', () => {
	let highlighter

	beforeAll(() => {
		highlighter = new PathHighlighter()
	})

	describe('Valid Windows absolute paths', () => {
		it('should identify standard Windows absolute paths', () => {
			expect(highlighter.isPath('C:\\Users\\name')).toBe(true)
			expect(highlighter.isPath('D:/folder/file.txt')).toBe(true) // Mixed slashes
		})
		it('should identify Windows absolute paths with spaces and different drive letters', () => {
			expect(highlighter.isPath('c:\\Program Files\\App')).toBe(true) // Lowercase drive
			expect(highlighter.isPath('Z:/Data/archive.zip')).toBe(true)
		})
		it('should identify root Windows paths', () => {
			expect(highlighter.isPath('C:\\')).toBe(true)
			expect(highlighter.isPath('D:/')).toBe(true)
		})
	})

	describe('Valid Windows UNC paths', () => {
		it('should identify standard UNC paths (server and share)', () => {
			expect(highlighter.isPath('\\\\server\\share')).toBe(true)
			expect(highlighter.isPath('\\\\localhost\\c$')).toBe(true)
			expect(highlighter.isPath('\\\\192.168.1.1\\public')).toBe(true)
			expect(highlighter.isPath('\\\\FS01\\department\\docs')).toBe(true)
			expect(highlighter.isPath('\\\\s\\s')).toBe(true) // Short server, short share
		})
		it('should identify UNC paths with subfolders and files (still true as regex matches start)', () => {
			expect(highlighter.isPath('\\\\server\\share\\folder')).toBe(true)
			expect(highlighter.isPath('\\\\server\\share\\folder\\file.txt')).toBe(true)
			expect(highlighter.isPath('\\\\server\\share\\folder with spaces')).toBe(true)
			expect(highlighter.isPath('\\\\server\\share\\file with.spaces.txt')).toBe(true)
		})
	})

	describe('Invalid Windows UNC paths', () => {
		it('should reject UNC paths with server only (no share)', () => {
			expect(highlighter.isPath('\\\\server')).toBe(false)
			expect(highlighter.isPath('\\\\localhost')).toBe(false)
			expect(highlighter.isPath('\\\\192.168.1.1')).toBe(false)
			expect(highlighter.isPath('\\\\FS01')).toBe(false)
			expect(highlighter.isPath('\\\\s')).toBe(false)
		})
		it('should reject UNC paths with server and trailing slash (no share name)', () => {
			expect(highlighter.isPath('\\\\server\\')).toBe(false)
			expect(highlighter.isPath('\\\\s\\')).toBe(false)
		})
		it('should reject UNC paths with spaces in server or share name component', () => {
			expect(highlighter.isPath('\\\\my server\\share')).toBe(false) // Space in server name
			expect(highlighter.isPath('\\\\server\\my share')).toBe(false) // Space in share name
			expect(highlighter.isPath('\\\\server\\share name with spaces')).toBe(false) // Space in share name (was in edge cases expecting true)
			expect(highlighter.isPath('\\\\server name\\share')).toBe(false) // Space in server name (was in tricky UNC expecting true)
		})
		it('should reject malformed or incomplete UNC paths', () => {
			expect(highlighter.isPath('//missing_hostname/share')).toBe(false) // Forward slashes for server part (already in invalid)
			expect(highlighter.isPath('\\onlyoneslash\\share')).toBe(false) // Single slash start (already in invalid)
			expect(highlighter.isPath('\\\\ \\share')).toBe(false) // Server name is space (from tricky UNC)
			expect(highlighter.isPath('\\\\\\share')).toBe(false) // Server name is slash (from tricky UNC)
			expect(highlighter.isPath('\\\\server\\ ')).toBe(false) // Share name is space
			expect(highlighter.isPath('\\\\')).toBe(false) // Just double slash (from tricky UNC)
			expect(highlighter.isPath('\\\\foo\\b ar')).toBe(false) // Space in share name part "b ar"
		})
	})

	describe('Valid Unix-like absolute paths', () => {
		it('should identify standard Unix absolute paths', () => {
			expect(highlighter.isPath('/home/user')).toBe(true)
			expect(highlighter.isPath('/var/log/sys.log')).toBe(true)
		})
		it('should identify Unix absolute paths with extensions and deeper structures', () => {
			expect(highlighter.isPath('/opt/app/bin/start.sh')).toBe(true)
			expect(highlighter.isPath('/tmp/data_file')).toBe(true)
		})
		it('should identify the root Unix path', () => {
			expect(highlighter.isPath('/')).toBe(true)
		})
	})

	describe('Invalid paths and other strings', () => {
		it('should reject relative paths', () => {
			expect(highlighter.isPath('folder/file.txt')).toBe(false)
			expect(highlighter.isPath('../docs')).toBe(false)
		})
		it('should reject non-path strings', () => {
			expect(highlighter.isPath('image.jpg')).toBe(false)
		})
		it('should reject malformed Windows paths', () => {
			expect(highlighter.isPath('C:file.txt')).toBe(false) // Missing slash after drive
		})
		// This section is now covered by "Invalid Windows UNC paths" or remains if general enough
		// expect(highlighter.isPath('\\\\server')).toBe(false); // Moved to Invalid Windows UNC paths
		// expect(highlighter.isPath('//missing_hostname/share')).toBe(false); // Moved
		// expect(highlighter.isPath('\\onlyoneslash\\share')).toBe(false); // Moved
		// Retaining general non-absolute path checks
		it('should reject paths that are not absolute (non-UNC, non-drive, non-root)', () => {
			expect(highlighter.isPath('not_a_path')).toBe(false)
			expect(highlighter.isPath('C')).toBe(false) // Just a drive letter
			expect(highlighter.isPath(':\\Windows')).toBe(false) // Missing drive letter
		})
	})

	describe('Edge cases', () => {
		it('should handle null, undefined, and empty/blank strings', () => {
			expect(highlighter.isPath('')).toBe(false)
			expect(highlighter.isPath(null)).toBe(false)
			expect(highlighter.isPath(undefined)).toBe(false)
			expect(highlighter.isPath('   ')).toBe(false) // Only spaces
		})

		it('should correctly handle paths with spaces (non-UNC or valid UNC subfolders)', () => {
			expect(highlighter.isPath('C:\\Users\\user name with spaces\\file.txt')).toBe(true)
			// For UNC, spaces are tested in "Valid Windows UNC paths" for subfolders
			// and "Invalid Windows UNC paths" for server/share names.
			// This specific test `\\server name with spaces\share` should be false and is covered in Invalid UNC.
			expect(highlighter.isPath('/home/user with spaces/file')).toBe(true)
		})
		// The "tricky UNC paths" section is removed as its cases are now integrated into
		// "Valid Windows UNC paths" and "Invalid Windows UNC paths" with correct expectations.
	})
})

#!/usr/bin/env node

const spawn = require('child_process').spawn
const { highlightUrl } = require('./highlighters/url')
const { highlightXml } = require('./highlighters/xml')
const { highlightJson } = require('./highlighters/json')
const { highlightDateTime } = require('./highlighters/dateTime')
const { highlightLogLevel } = require('./highlighters/logLevel')
const { highlightHttpMethod } = require('./highlighters/httpMethod') // Import the HttpMethod highlighter
const PathHighlighter = require('./highlighters/PathHighlighter') // Import the PathHighlighter class
const UuidHighlighter = require('./highlighters/UuidHighlighter'); // Import the UuidHighlighter class

// Define PathHighlighter instance and highlightPath function at the top level
const pathHighlighterInstance = new PathHighlighter()
const uuidHighlighterInstance = new UuidHighlighter();
function highlightPath(dataString) {
	// Check if the entire dataString is a path.
	if (pathHighlighterInstance.isPath(dataString.trim())) { // Trim to avoid issues with trailing newlines etc.
		// Apply some form of highlighting. Using ANSI bold as an example.
		// \x1b[1m makes text bold, \x1b[0m resets it.
		return `\x1b[1m${dataString}\x1b[0m`
	}
	return dataString
}

function highlightUuid(dataString) {
    // Check if the entire dataString is a UUID.
    if (uuidHighlighterInstance.isUuid(dataString.trim())) { // Trim to avoid issues with trailing newlines etc.
        // Apply some form of highlighting. Using ANSI bold as an example.
        // [1m makes text bold, [0m resets it.
        return `\x1b[1m${dataString}\x1b[0m`;
    }
    return dataString;
}

const argv = require('minimist')(process.argv.slice(2), {stopEarly: true})
const cmd = argv._.shift()

// Signal handlers
process.on('SIGINT', process.exit)
process.on('SIGQUIT', process.exit)
process.on('SIGTERM', process.exit)

function highlightAndPrint(dataString) {
	let chunk = dataString

	// Use the new URL highlighter
	chunk = highlightUrl(chunk)

	// Use the new XML highlighter
	chunk = highlightXml(chunk)

	// Use the new JSON highlighter
	chunk = highlightJson(chunk)

	// Use the new DateTime highlighter
	chunk = highlightDateTime(chunk)

	// Use the new LogLevel highlighter
	chunk = highlightLogLevel(chunk)

	// Use the new HttpMethod highlighter
	chunk = highlightHttpMethod(chunk)

	// Use the new Path highlighter (now defined at top level)
	chunk = highlightPath(chunk)

	// Use the new Uuid highlighter
	chunk = highlightUuid(chunk);

	// eslint-disable-next-line no-console
	console.log(chunk)
}

if (cmd) {
	// Execute command and highlight its output
	const tail = spawn(cmd, argv._)

	tail.stdout.on('data', function (data) {
		highlightAndPrint(data.toString())
	})

	tail.stderr.on('data', (data) => {
		process.stderr.write(data)
	})

	tail.on('close', (code) => {
		// eslint-disable-next-line no-process-exit
		process.exit(code)
	})
} else {
	// Process piped stdin
	process.stdin.setEncoding('utf8')

	process.stdin.on('data', (dataChunk) => {
		highlightAndPrint(dataChunk)
	})

	process.stdin.on('end', () => {
		// eslint-disable-next-line no-process-exit
		process.exit(0)
	})
}

// Export highlighters as requested by the subtask
// This was not an existing pattern in this file for exporting.
// The highlighters (highlightUrl, highlightXml, etc.) are imported at the top of the file.
// They are in scope here. The new highlightPath function is also defined in the module scope.
module.exports = [
	highlightUrl, // Already imported: const { highlightUrl } = require('./highlighters/url');
	highlightXml, // Already imported: const { highlightXml } = require('./highlighters/xml');
	highlightJson, // Already imported: const { highlightJson } = require('./highlighters/json');
	highlightDateTime, // Already imported: const { highlightDateTime } = require('./highlighters/dateTime');
	highlightLogLevel, // Already imported: const { highlightLogLevel } = require('./highlighters/logLevel');
	highlightHttpMethod, // Already imported: const { highlightHttpMethod } = require('./highlighters/httpMethod');
	highlightPath, // Now defined at the top level and used by highlightAndPrint
	highlightUuid // Add the new Uuid highlighter function
]
// npm i minimist
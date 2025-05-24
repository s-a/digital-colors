#!/usr/bin/env node

const spawn = require('child_process').spawn
const highlight = require('cli-highlight').highlight
const colors = require('chalk') // colors still used by other highlighters
const { highlightUrl } = require('./highlighters/url');
const { highlightXml } = require('./highlighters/xml');
const { highlightJson } = require('./highlighters/json');
const { highlightDateTime } = require('./highlighters/dateTime');
const { highlightLogLevel } = require('./highlighters/logLevel');
const { highlightHttpMethod } = require('./highlighters/httpMethod'); // Import the HttpMethod highlighter
const argv = require('minimist')(process.argv.slice(2), {stopEarly: true})
const cmd = argv._.shift()

// Signal handlers
process.on('SIGINT', process.exit)
process.on('SIGQUIT', process.exit)
process.on('SIGTERM', process.exit)

function highlightAndPrint(dataString) {
	let chunk = dataString

	// Use the new URL highlighter
	chunk = highlightUrl(chunk);

	// Use the new XML highlighter
	chunk = highlightXml(chunk);

	// Use the new JSON highlighter
	chunk = highlightJson(chunk);

	// Use the new DateTime highlighter
	chunk = highlightDateTime(chunk);

	// Use the new LogLevel highlighter
	chunk = highlightLogLevel(chunk);

	// Use the new HttpMethod highlighter
	chunk = highlightHttpMethod(chunk);

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
    process.exit(code);
  });

} else {
  // Process piped stdin
  process.stdin.setEncoding('utf8')

  process.stdin.on('data', (dataChunk) => {
    highlightAndPrint(dataChunk)
  })

  process.stdin.on('end', () => {
    process.exit(0)
  })
}
// npm i minimist
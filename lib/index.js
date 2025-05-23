#!/usr/bin/env node

const spawn = require('child_process').spawn
const highlight = require('cli-highlight').highlight
const colors = require('chalk')
const argv = require('minimist')(process.argv.slice(2), {stopEarly: true})
const cmd = argv._.shift()

// Signal handlers
process.on('SIGINT', process.exit)
process.on('SIGQUIT', process.exit)
process.on('SIGTERM', process.exit)

function highlightAndPrint(dataString) {
	let chunk = dataString

	// URL highlighting (priority)
	// Base regex: (\/api\/[a-zA-Z0-9\/-_]+(?:\?(?:[^=\s]+=[^&\s]*&?)*)?)
	// Breaking it down:
	// 1. Path part: (\/api\/[a-zA-Z0-9\/-_]+)
	// 2. Query string part (optional): (?:\?((?:[^=&\s]+=[^&?\s]*(?:&|$))*))?
	const urlRegex = /(\/api\/[a-zA-Z0-9\/-_]+)(?:\?((?:[^=&\s]+=[^&?\s]*(?:&|$))*))?/g;

	chunk = chunk.replace(urlRegex, (fullMatch, pathPart, queryStringPart) => {
		let highlightedUrl = colors.cyan(pathPart);

		if (queryStringPart !== undefined) { 
			highlightedUrl += colors.cyan('?');
			if (queryStringPart) { // Only process if there are actual params
				const queryParamRegex = /([^=&\s]+)=([^&?\s]*)/g;
				const params = [];
				let match;
				while ((match = queryParamRegex.exec(queryStringPart)) !== null) {
					const key = match[1] ? colors.yellow(match[1]) : '';
					const value = match[2] ? colors.green(match[2]) : '';
					params.push(key + colors.cyan('=') + value);
				}
				highlightedUrl += params.join(colors.cyan('&'));
			}
		}
		return highlightedUrl;
	});

	const xml = /<.+>/ig
	chunk = chunk.replace(xml, function (match) {
		// const h = highlight(match, {language: 'xml', ignoreIllegals: true})
		return colors.cyan(match)
	})
	const jsonObject = /\{.*\}/ig
	chunk = chunk.replace(jsonObject, function (match) {
		// const h = highlight(match, {language: 'json', ignoreIllegals: true})
		return colors.blue(match)
	})
	const dateTime = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}?,\d{3})/ig
	chunk = chunk.replace(dateTime, function (match) {
		// const h = highlight(match, {language: 'json', ignoreIllegals: true})
		return colors.yellow(match)
	})
	const info = / INFO /g
	chunk = chunk.replace(info, function (match) {
		// const h = highlight(match, {language: 'json', ignoreIllegals: true})
		return colors.green(match)
	})
	const debug = / DEBUG /g
	chunk = chunk.replace(debug, function (match) {
		// const h = highlight(match, {language: 'json', ignoreIllegals: true})
		return colors.gray(match)
	})
	const error = / ERROR /g
	chunk = chunk.replace(error, function (match) {
		// const h = highlight(match, {language: 'json', ignoreIllegals: true})
		return colors.red(match)
	})
	const fatal = / FATAL /g
	chunk = chunk.replace(fatal, function (match) {
		// const h = highlight(match, {language: 'json', ignoreIllegals: true})
		return colors.redBright(match)
	})

	// HTTP method highlighting
	const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
	const httpMethodRegex = new RegExp(` (${httpMethods.join('|')}) `, 'g');
	chunk = chunk.replace(httpMethodRegex, function (match) {
		return ' ' + colors.underline.bold(match.trim()) + ' ';
	});

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
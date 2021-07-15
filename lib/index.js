#!/usr/bin/env node

const spawn = require('child_process').spawn
const highlight = require('cli-highlight').highlight
const colors = require('chalk')
const argv = require('minimist')(process.argv.slice(2), {stopEarly: true})
console.log(argv)
const cmd = argv._.shift()

process.on('SIGINT', process.exit)
process.on('SIGQUIT', process.exit)
process.on('SIGTERM', process.exit)

const tail = spawn(cmd, argv._)
tail.stdout.on('data', function (data) {
	let chunk = data.toString()
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

	// eslint-disable-next-line no-console
	console.log(chunk)
})
// npm i minimist
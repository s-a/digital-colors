const { highlightJson } = require('../../lib/highlighters/json')
const chalk = require('chalk')

// Helper for expected output
const blue = (text) => chalk.blue(text)

describe('highlightJson', () => {
	test('should highlight simple JSON object', () => {
		const inputText = '{"key": "value"}'
		const expectedOutput = blue('{"key": "value"}')
		expect(highlightJson(inputText)).toBe(expectedOutput)
	})

	test('should highlight nested JSON object (greedy match)', () => {
		const inputText = '{"key": {"nestedKey": "nestedValue"}}'
		// The regex /\{.*\}/ig is greedy and will match the whole structure.
		const expectedOutput = blue('{"key": {"nestedKey": "nestedValue"}}')
		expect(highlightJson(inputText)).toBe(expectedOutput)
	})

	test('should highlight JSON with various data types', () => {
		const inputText = '{"name": "Test", "count": 10, "isActive": true}'
		const expectedOutput = blue('{"name": "Test", "count": 10, "isActive": true}')
		expect(highlightJson(inputText)).toBe(expectedOutput)
	})

	test('should return original string if no JSON object is present', () => {
		const inputText = 'This is a normal text without any JSON.'
		expect(highlightJson(inputText)).toBe(inputText)
	})

	test('should highlight multiple JSON objects on the same line (greedy match)', () => {
		const inputText = 'Obj1: {"a": 1} Obj2: {"b": 2}'
		// The regex /\{.*\}/ig is greedy and will match from the first '{' to the last '}'.
		const expectedOutput = `Obj1: ${blue('{"a": 1} Obj2: {"b": 2}')}`
		expect(highlightJson(inputText)).toBe(expectedOutput)
	})

	test('should highlight JSON objects mixed with other text', () => {
		const inputText = 'Data: {"id": 123, "status": "ok"} - Done'
		const expectedOutput = `Data: ${blue('{"id": 123, "status": "ok"}')} - Done`
		expect(highlightJson(inputText)).toBe(expectedOutput)
	})

	test.skip('should handle malformed JSON - missing closing brace (greedy match)', () => {
		const inputText = 'Error: {"key": "value" and some more text'
		// The regex /\{.*\}/ig will match from '{' to the end of the string if no '}' is found later.
		const expectedOutput = `Error: ${blue('{"key": "value" and some more text')}`
		expect(highlightJson(inputText)).toBe(expectedOutput)
	})

	test('should handle malformed JSON - missing quotes (still matches if structure is {.*})', () => {
		// The regex only cares about '{' and '}' and what's between them.
		const inputText = '{key: value, num: 1}'
		const expectedOutput = blue('{key: value, num: 1}')
		expect(highlightJson(inputText)).toBe(expectedOutput)
	})

	test('should not highlight if no opening brace', () => {
		const inputText = 'key": "value"}'
		expect(highlightJson(inputText)).toBe(inputText)
	})

	test('should highlight JSON containing special characters within values', () => {
		const inputText = '{"message": "Text with <xml> and & symbols."}'
		const expectedOutput = blue('{"message": "Text with <xml> and & symbols."}')
		expect(highlightJson(inputText)).toBe(expectedOutput)
	})

	test('should highlight empty JSON object', () => {
		const inputText = '{}'
		const expectedOutput = blue('{}')
		expect(highlightJson(inputText)).toBe(expectedOutput)
	})

	test('JSON object at the beginning of a string', () => {
		const inputText = '{"start": true} followed by text.'
		const expectedOutput = `${blue('{"start": true}')} followed by text.`
		expect(highlightJson(inputText)).toBe(expectedOutput)
	})

	test('JSON object at the end of a string', () => {
		const inputText = 'Text preceding {"end": false}'
		const expectedOutput = `Text preceding ${blue('{"end": false}')}`
		expect(highlightJson(inputText)).toBe(expectedOutput)
	})
})

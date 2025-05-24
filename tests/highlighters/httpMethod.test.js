const { highlightHttpMethod } = require('../../lib/highlighters/httpMethod')
const chalk = require('chalk')
chalk.level = 1 // Ensure colors are enabled for testing

// Helper for expected output
const ub = (text) => chalk.underline.bold(text)

describe('highlightHttpMethod', () => {
	const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

	methods.forEach(method => {
		test(`should highlight ${method} method`, () => {
			const inputText = `Request: ${method} /path`
			const expectedOutput = `Request: ${ub(method)} /path`
			expect(highlightHttpMethod(inputText)).toBe(expectedOutput)
		})

		test(`should highlight ${method} method with extra spaces`, () => {
			const inputText = `Request:  ${method}  /path`
			// The regex " (METHOD) " matches the inner " METHOD ".
			// Replacement is " ub(METHOD) ".
			// So, "Request: <space><space>METHOD<space><space>/path"
			//           becomes "Request: <space>" + " <ub(METHOD)> " + "<space>/path"
			const expectedOutput = `Request:  ${ub(method)}  /path`
			expect(highlightHttpMethod(inputText)).toBe(expectedOutput)
		})
	})

	test('should highlight multiple different HTTP methods', () => {
		const inputText = 'Methods: GET /data and POST /submit then PUT /update.'
		const expectedOutput = `Methods: ${ub('GET')} /data and ${ub('POST')} /submit then ${ub('PUT')} /update.`
		expect(highlightHttpMethod(inputText)).toBe(expectedOutput)
	})

	test('should highlight multiple same HTTP methods', () => {
		// Original: "GET /one then GET /two."
		// First GET is not preceded by space, so not matched.
		// Second " GET " is matched.
		const inputText = 'GET /one then GET /two.'
		const expectedOutput = `GET /one then ${ub('GET')} /two.`
		expect(highlightHttpMethod(inputText)).toBe(expectedOutput)
	})

	test('should return original string if no HTTP methods are present', () => {
		const inputText = 'This is a normal text message.'
		expect(highlightHttpMethod(inputText)).toBe(inputText)
	})

	test('should be case sensitive for methods', () => {
		const inputText = 'Method: get /path or PoSt /data'
		expect(highlightHttpMethod(inputText)).toBe(inputText)
	})

	test('should require spaces around methods (GET vs .GET.)', () => {
		const inputText = 'Method .GET. or (POST) should not match'
		expect(highlightHttpMethod(inputText)).toBe(inputText)
	})

	test('HTTP method at the beginning of the string (with leading space)', () => {
		// The regex ` (${method}) ` requires a leading space.
		// If the string starts with " GET /path", it won't match.
		// If it's " GET /path" (note leading space), it will match.
		// " GET " is replaced by " ub(GET) "
		const inputText = ' GET /start'
		const expectedOutput = ` ${ub('GET')} /start`
		expect(highlightHttpMethod(inputText)).toBe(expectedOutput)
	})

	test('HTTP method at the end of the string (with trailing space)', () => {
		const inputText = 'Request ends with POST '
		// " POST " is replaced by " ub(POST) "
		const expectedOutput = `Request ends with ${ub('POST')} `
		expect(highlightHttpMethod(inputText)).toBe(expectedOutput)
	})

	test('HTTP method in the middle of a sentence', () => {
		const inputText = 'A common method is GET for retrieval.'
		// " GET " is replaced by " ub(GET) "
		const expectedOutput = `A common method is ${ub('GET')} for retrieval.`
		expect(highlightHttpMethod(inputText)).toBe(expectedOutput)
	})

	test('Method surrounded by multiple spaces', () => {
		const inputText = 'Test:   GET   /path'
		// Inner " GET " is matched and replaced by " ub(GET) "
		// Result: "Test:  " + " ub(GET) " + "  /path"
		const expectedOutput = `Test:   ${ub('GET')}   /path`
		expect(highlightHttpMethod(inputText)).toBe(expectedOutput)
	})

	test('Should not highlight methods that are substrings of words', () => {
		const inputText = 'GETTING POSTURE OPTIONSLETTER'
		expect(highlightHttpMethod(inputText)).toBe(inputText)
	})

	test('String with only an HTTP method and spaces', () => {
		const inputText = ' POST ' // This entire string is the match
		const expectedOutput = ` ${ub('POST')} ` // Replaced by itself with styling
		expect(highlightHttpMethod(inputText)).toBe(expectedOutput)
	})
})

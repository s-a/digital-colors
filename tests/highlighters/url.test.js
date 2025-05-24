const { highlightUrl } = require('../../lib/highlighters/url');
const chalk = require('chalk');

// Helper function to create expected colored strings
// chalk.level is by default > 0, so colors will be enabled.
const cyan = (text) => chalk.cyan(text);
const yellow = (text) => chalk.yellow(text);
const green = (text) => chalk.green(text);

describe('highlightUrl', () => {
  test('should highlight URL with path only', () => {
    const inputText = 'Access /api/users/123 for user data.';
    const expectedOutput = `Access ${cyan('/api/users/123')} for user data.`;
    expect(highlightUrl(inputText)).toBe(expectedOutput);
  });

  test('should highlight URL with path and query parameters', () => {
    const inputText = 'Search /api/posts/abc?title=hello&author=me here.';
    const expectedOutput = `Search ${cyan('/api/posts/abc')}${cyan('?')}${yellow('title')}${cyan('=')}${green('hello')}${cyan('&')}${yellow('author')}${cyan('=')}${green('me')} here.`;
    expect(highlightUrl(inputText)).toBe(expectedOutput);
  });

  test('should highlight URL with path and empty query string', () => {
    const inputText = 'Data at /api/data? is available.';
    // Note: The implementation of highlightUrl adds a '?' only if queryStringPart is not undefined.
    // If queryStringPart is an empty string, it will still add '?'.
    const expectedOutput = `Data at ${cyan('/api/data')}${cyan('?')} is available.`;
    expect(highlightUrl(inputText)).toBe(expectedOutput);
  });

  test('should handle URL with special characters in path (if regex supports)', () => {
    // Assuming regex supports hyphens and underscores, which it does.
    const inputText = 'Item /api/items/item-123_abc found.';
    const expectedOutput = `Item ${cyan('/api/items/item-123_abc')} found.`;
    expect(highlightUrl(inputText)).toBe(expectedOutput);
  });

   test('should handle URL with special characters in query parameters', () => {
    const inputText = 'Query /api/search?text=a%20b&value=c-d_e.';
    // The current regex for query parameters ([^=&\s]+=[^&?\s]*) might not perfectly handle all URL-encoded chars
    // as distinct parts if they are not separated by '&'. However, for this simple case it should work.
    const expectedOutput = `Query ${cyan('/api/search')}${cyan('?')}${yellow('text')}${cyan('=')}${green('a%20b')}${cyan('&')}${yellow('value')}${cyan('=')}${green('c-d_e')}.`;
    expect(highlightUrl(inputText)).toBe(expectedOutput);
  });

  test('should return original string if no URLs are present', () => {
    const inputText = 'This is a normal text without any API paths.';
    expect(highlightUrl(inputText)).toBe(inputText);
  });

  test('should highlight multiple URLs in a string', () => {
    const inputText = 'First /api/A then /api/B?val=1 end.';
    const expectedOutput = `First ${cyan('/api/A')} then ${cyan('/api/B')}${cyan('?')}${yellow('val')}${cyan('=')}${green('1')} end.`;
    expect(highlightUrl(inputText)).toBe(expectedOutput);
  });

  test('should highlight URL at the beginning of a string', () => {
    const inputText = '/api/start point and some text.';
    const expectedOutput = `${cyan('/api/start')} point and some text.`;
    expect(highlightUrl(inputText)).toBe(expectedOutput);
  });

  test('should highlight URL in the middle of a string', () => {
    const inputText = 'Text before /api/middle/path and text after.';
    const expectedOutput = `Text before ${cyan('/api/middle/path')} and text after.`;
    expect(highlightUrl(inputText)).toBe(expectedOutput);
  });

  test('should highlight URL at the end of a string', () => {
    const inputText = 'Some text ending with /api/end?query=done';
    const expectedOutput = `Some text ending with ${cyan('/api/end')}${cyan('?')}${yellow('query')}${cyan('=')}${green('done')}`;
    expect(highlightUrl(inputText)).toBe(expectedOutput);
  });

  test('should handle URL with multiple query parameters correctly', () => {
    const inputText = 'Check /api/test?p1=v1&p2=v2&p3=v3 results.';
    const expectedOutput = `Check ${cyan('/api/test')}${cyan('?')}${yellow('p1')}${cyan('=')}${green('v1')}${cyan('&')}${yellow('p2')}${cyan('=')}${green('v2')}${cyan('&')}${yellow('p3')}${cyan('=')}${green('v3')} results.`;
    expect(highlightUrl(inputText)).toBe(expectedOutput);
  });

  test('should handle URL with query parameters without values', () => {
    const inputText = 'Filter /api/filter?active&pending=';
    // With the original urlRegex, the query part ((?:[^=&\s]+=[^&?\s]*(?:&|$))*)
    // only matches "key=value" like structures. If the string after "?"
    // doesn't start with such a structure (e.g., "active&..."),
    // the query capture group (queryStringPart) will be an empty string.
    // The "?" itself is matched, but queryStringPart is "".
    // Therefore, the "active&pending=" part remains as plain text.
    const expectedOutput = `${cyan('/api/filter')}${cyan('?')}active&pending=`;
    // Since the input string has "Filter " at the beginning:
    const finalExpectedOutput = `Filter ${expectedOutput}`;
    expect(highlightUrl(inputText)).toBe(finalExpectedOutput);
  });
});

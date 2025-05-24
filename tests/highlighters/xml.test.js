const { highlightXml } = require('../../lib/highlighters/xml');
const chalk = require('chalk');

// Helper for expected output
const cyan = (text) => chalk.cyan(text);

describe('highlightXml', () => {
  test('should highlight simple XML tags', () => {
    const inputText = '<tag>content</tag>';
    const expectedOutput = cyan('<tag>content</tag>');
    expect(highlightXml(inputText)).toBe(expectedOutput);
  });

  test('should highlight self-closing tags', () => {
    const inputText = 'Text with <br/> and <hr/> tags.';
    const expectedOutput = `Text with ${cyan('<br/>')} and ${cyan('<hr/>')} tags.`;
    expect(highlightXml(inputText)).toBe(expectedOutput);
  });

  test('should highlight tags with attributes', () => {
    const inputText = '<tag attribute="value">content</tag>';
    const expectedOutput = cyan('<tag attribute="value">content</tag>');
    expect(highlightXml(inputText)).toBe(expectedOutput);
  });

  test('should return original string if no XML tags are present', () => {
    const inputText = 'This is a normal text without any tags.';
    expect(highlightXml(inputText)).toBe(inputText);
  });

  test('should highlight multiple XML snippets in a string', () => {
    const inputText = 'First: <one>1</one>. Second: <two type="b">2</two>.';
    const expectedOutput = `First: ${cyan('<one>1</one>')}. Second: ${cyan('<two type="b">2</two>')}.`;
    expect(highlightXml(inputText)).toBe(expectedOutput);
  });

  test('should highlight XML snippets mixed with other text', () => {
    const inputText = 'Before <tag>data</tag> after.';
    const expectedOutput = `Before ${cyan('<tag>data</tag>')} after.`;
    expect(highlightXml(inputText)).toBe(expectedOutput);
  });

  test('should handle malformed XML tag <tag (greedy match)', () => {
    // The regex /<.+>/ig is greedy.
    // For "<tag attribute='value'>text<tag" it will match "<tag attribute='value'>text<tag"
    // This test clarifies the existing behavior.
    const inputText = "Text with <tag attribute='value'>text<tag and more";
    const expectedOutput = `Text with ${cyan("<tag attribute='value'>text<tag")} and more`;
    expect(highlightXml(inputText)).toBe(expectedOutput);
  });

  test('should not highlight incomplete tag tag>', () => {
    const inputText = 'Incomplete tag tag> here.';
    expect(highlightXml(inputText)).toBe(inputText);
  });

  test('should handle complex nested-like structures (single greedy match)', () => {
    const inputText = '<outer><inner>text</inner></outer>';
    // The regex /<.+>/ig will match the entire string as one tag.
    const expectedOutput = cyan('<outer><inner>text</inner></outer>');
    expect(highlightXml(inputText)).toBe(expectedOutput);
  });

  test('should handle tags with numbers and hyphens', () => {
    const inputText = '<my-tag-123>Data</my-tag-123>';
    const expectedOutput = cyan('<my-tag-123>Data</my-tag-123>');
    expect(highlightXml(inputText)).toBe(expectedOutput);
  });

  test('should highlight tags with various valid characters in attributes', () => {
    const inputText = '<a href="http://example.com?p1=v1&p2=v2">Link</a>';
    const expectedOutput = cyan('<a href="http://example.com?p1=v1&p2=v2">Link</a>');
    expect(highlightXml(inputText)).toBe(expectedOutput);
  });
});

const { highlightDateTime } = require('../../lib/highlighters/dateTime');
const chalk = require('chalk');

// Helper for expected output
const yellow = (text) => chalk.yellow(text);

describe('highlightDateTime', () => {
  test('should highlight valid DateTime string', () => {
    const inputText = 'Event time: 2023-10-27 10:30:00,123 recorded.';
    const expectedOutput = `Event time: ${yellow('2023-10-27 10:30:00,123')} recorded.`;
    expect(highlightDateTime(inputText)).toBe(expectedOutput);
  });

  test('should highlight valid DateTime string with non-greedy seconds (still two digits)', () => {
    // The regex \d{2}? for seconds means it will match two digits, non-greedily.
    // It doesn't make a difference here as \d{3} for milliseconds follows.
    const inputText = 'Timestamp: 2024-01-15 08:15:59,999 is the mark.';
    const expectedOutput = `Timestamp: ${yellow('2024-01-15 08:15:59,999')} is the mark.`;
    expect(highlightDateTime(inputText)).toBe(expectedOutput);
  });

  test('should return original string if no DateTime values are present', () => {
    const inputText = 'This is a normal text without any dates or times.';
    expect(highlightDateTime(inputText)).toBe(inputText);
  });

  test('should highlight multiple DateTime values in a string', () => {
    const inputText = 'Log: 2023-11-01 00:00:00,000 Start. 2023-11-01 23:59:59,999 End.';
    const expectedOutput = `Log: ${yellow('2023-11-01 00:00:00,000')} Start. ${yellow('2023-11-01 23:59:59,999')} End.`;
    expect(highlightDateTime(inputText)).toBe(expectedOutput);
  });

  test('should not highlight if date format is incorrect', () => {
    const inputText = 'Incorrect date: 23-2023-10 10:30:00,123';
    expect(highlightDateTime(inputText)).toBe(inputText);
  });

  test('should not highlight if time format is incorrect', () => {
    const inputText = 'Incorrect time: 2023-10-27 10-30-00,123';
    expect(highlightDateTime(inputText)).toBe(inputText);
  });

  test('should not highlight if milliseconds are missing', () => {
    const inputText = 'Missing ms: 2023-10-27 10:30:00';
    expect(highlightDateTime(inputText)).toBe(inputText);
  });

  test('should not highlight if comma before milliseconds is missing', () => {
    const inputText = 'Missing comma: 2023-10-27 10:30:00123';
    expect(highlightDateTime(inputText)).toBe(inputText);
  });

  test('should not highlight if seconds are only one digit (regex expects \\d{2})', () => {
    const inputText = 'Single digit seconds: 2023-10-27 10:30:0,123';
    expect(highlightDateTime(inputText)).toBe(inputText);
  });
  
  test('should highlight DateTime at the beginning of a string', () => {
    const inputText = '2023-10-27 10:30:00,123 Log entry started.';
    const expectedOutput = `${yellow('2023-10-27 10:30:00,123')} Log entry started.`;
    expect(highlightDateTime(inputText)).toBe(expectedOutput);
  });

  test('should highlight DateTime at the end of a string', () => {
    const inputText = 'Log entry finished 2023-10-27 10:30:01,456';
    const expectedOutput = `Log entry finished ${yellow('2023-10-27 10:30:01,456')}`;
    expect(highlightDateTime(inputText)).toBe(expectedOutput);
  });

  test('should handle DateTime string with minimum valid values', () => {
    // e.g. month 01, day 01, hour 00, etc.
    const inputText = 'Min values: 0000-01-01 00:00:00,000 test';
    const expectedOutput = `Min values: ${yellow('0000-01-01 00:00:00,000')} test`;
    expect(highlightDateTime(inputText)).toBe(expectedOutput);
  });
});

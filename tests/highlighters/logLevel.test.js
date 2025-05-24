const { highlightLogLevel } = require('../../lib/highlighters/logLevel');
const chalk = require('chalk');
chalk.level = 1; // Force color level for testing

// Helpers for expected output
const green = (text) => chalk.green(text);
const gray = (text) => chalk.gray(text);
const red = (text) => chalk.red(text);
const redBright = (text) => chalk.redBright(text);

describe('highlightLogLevel', () => {
  test('should highlight INFO log level', () => {
    const inputText = 'This is an INFO message.';
    const expectedOutput = `This is an${green(' INFO ')}message.`;
    expect(highlightLogLevel(inputText)).toBe(expectedOutput);
  });

  test('should highlight DEBUG log level', () => {
    const inputText = 'A DEBUG log appears.';
    const expectedOutput = `A${gray(' DEBUG ')}log appears.`;
    expect(highlightLogLevel(inputText)).toBe(expectedOutput);
  });

  test('should highlight ERROR log level', () => {
    const inputText = 'An ERROR occurred.';
    const expectedOutput = `An${red(' ERROR ')}occurred.`;
    expect(highlightLogLevel(inputText)).toBe(expectedOutput);
  });

  test('should highlight FATAL log level', () => {
    const inputText = 'This is a FATAL situation.';
    const expectedOutput = `This is a${redBright(' FATAL ')}situation.`;
    expect(highlightLogLevel(inputText)).toBe(expectedOutput);
  });

  test('should highlight multiple different log levels in a string', () => {
    const inputText = 'Log: INFO and DEBUG then ERROR and FATAL here.';
    let expectedOutput = 'Log: INFO and DEBUG then ERROR and FATAL here.';
    expectedOutput = expectedOutput.replace(' INFO ', green(' INFO '));
    expectedOutput = expectedOutput.replace(' DEBUG ', gray(' DEBUG '));
    expectedOutput = expectedOutput.replace(' ERROR ', red(' ERROR '));
    expectedOutput = expectedOutput.replace(' FATAL ', redBright(' FATAL '));
    expect(highlightLogLevel(inputText)).toBe(expectedOutput);
  });

  test('should highlight multiple same log levels in a string', () => {
    const inputText = 'INFO one, INFO two.';
    const expectedOutput = `${green(' INFO ')}one,${green(' INFO ')}two.`;
    expect(highlightLogLevel(inputText)).toBe(expectedOutput);
  });

  test('should return original string if no log levels are present', () => {
    const inputText = 'This is a normal text message.';
    expect(highlightLogLevel(inputText)).toBe(inputText);
  });

  test('should be case sensitive and require spaces (INFO vs info)', () => {
    const inputText = 'This is info, not INFO .';
    const expectedOutput = `This is info, not${green(' INFO ')}.`;
    expect(highlightLogLevel(inputText)).toBe(expectedOutput);
  });

  test('should be case sensitive and require spaces (INFO vs .INFO.)', () => {
    const inputText = 'This is .INFO. not INFO .';
    const expectedOutput = `This is .INFO. not${green(' INFO ')}.`;
    expect(highlightLogLevel(inputText)).toBe(expectedOutput);
  });
  
  test('log levels at the beginning and end of processing relevant parts', () => {
    // The regexes include spaces, so they won't match "INFO" at the very start/end of a string
    // unless there are spaces there too. This test clarifies that.
    const inputText = ' INFO at start. End has ERROR ';
    const expectedOutput = `${green(' INFO ')}at start. End has${red(' ERROR ')}`;
    expect(highlightLogLevel(inputText)).toBe(expectedOutput);
  });

  test('log levels without surrounding spaces should not be highlighted', () => {
    const inputText = 'This is anINFOmessage or DEBUGmessage or anERROR or FATALerror.';
    expect(highlightLogLevel(inputText)).toBe(inputText);
  });

  test('string with only a log level and spaces', () => {
    const inputText = ' DEBUG ';
    const expectedOutput = gray(' DEBUG ');
    expect(highlightLogLevel(inputText)).toBe(expectedOutput);
  });

  test('order of application does not matter for these distinct regexes', () => {
    const inputText = 'FATAL then INFO';
    const expectedOutput = `${redBright(' FATAL ')}then${green(' INFO ')}`;
    expect(highlightLogLevel(inputText)).toBe(expectedOutput);

    const inputText2 = 'INFO then FATAL';
    const expectedOutput2 = `${green(' INFO ')}then${redBright(' FATAL ')}`;
    expect(highlightLogLevel(inputText2)).toBe(expectedOutput2);
  });
});

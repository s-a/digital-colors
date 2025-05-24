const UuidHighlighter = require('../../lib/highlighters/UuidHighlighter');

describe('UuidHighlighter', () => {
  let highlighter;

  beforeAll(() => {
    highlighter = new UuidHighlighter();
  });

  describe('Valid UUIDs', () => {
    it('should identify lowercase UUIDs', () => {
      expect(highlighter.isUuid('abcdef01-2345-6789-abcd-ef0123456789')).toBe(true);
    });

    it('should identify uppercase UUIDs', () => {
      expect(highlighter.isUuid('ABCDEF01-2345-6789-ABCD-EF0123456789')).toBe(true);
    });

    it('should identify mixed-case UUIDs', () => {
      expect(highlighter.isUuid('AbCdEf01-2345-6789-AbCd-Ef0123456789')).toBe(true);
    });

    it('should identify UUIDs with numbers', () => {
      expect(highlighter.isUuid('12345678-1234-1234-1234-123456789012')).toBe(true);
    });
  });

  describe('Invalid UUIDs', () => {
    it('should reject strings with incorrect length', () => {
      expect(highlighter.isUuid('abcdef01-2345-6789-abcd-ef012345678')).toBe(false); // Too short
      expect(highlighter.isUuid('abcdef01-2345-6789-abcd-ef01234567890')).toBe(false); // Too long
    });

    it('should reject strings with incorrect format (hyphen placement)', () => {
      expect(highlighter.isUuid('abcdef012-345-6789-abcd-ef0123456789')).toBe(false);
      expect(highlighter.isUuid('abcdef01-23456-789-abcd-ef0123456789')).toBe(false);
      expect(highlighter.isUuid('abcdef01-2345-6789ab-cd-ef0123456789')).toBe(false);
      expect(highlighter.isUuid('abcdef01-2345-6789-abcd--ef0123456789')).toBe(false);
    });

    it('should reject strings with non-hexadecimal characters', () => {
      expect(highlighter.isUuid('abcdef01-2345-6789-abcd-ef012345678g')).toBe(false); // 'g' is not hex
      expect(highlighter.isUuid('abcdef01-2345-6789-abcd-ef012345678Z')).toBe(false); // 'Z' is not hex
      expect(highlighter.isUuid('abcdef01-2345-6789-abcd-ef012345678!')).toBe(false); // '!' is not hex
    });

    it('should reject strings that are almost UUIDs but have extra characters', () => {
      expect(highlighter.isUuid(' abcdef01-2345-6789-abcd-ef0123456789')).toBe(false); // Leading space (handled by trim in method)
      expect(highlighter.isUuid('abcdef01-2345-6789-abcd-ef0123456789 ')).toBe(false); // Trailing space (handled by trim in method)
      expect(highlighter.isUuid('abcdef01-2345-6789-abcd-ef0123456789\n')).toBe(false); // Trailing newline
    });
  });

  describe('Edge cases', () => {
    it('should handle null, undefined, and empty/blank strings', () => {
      expect(highlighter.isUuid(null)).toBe(false);
      expect(highlighter.isUuid(undefined)).toBe(false);
      expect(highlighter.isUuid('')).toBe(false);
      expect(highlighter.isUuid('   ')).toBe(false); // Only spaces
    });

    it('should handle strings that are only hyphens', () => {
      expect(highlighter.isUuid('--------')).toBe(false);
      expect(highlighter.isUuid('------------------------------------')).toBe(false);
    });

     it('should correctly handle trimmed valid UUIDs with leading/trailing spaces', () => {
      expect(highlighter.isUuid(' abcdef01-2345-6789-abcd-ef0123456789')).toBe(true);
      expect(highlighter.isUuid('abcdef01-2345-6789-abcd-ef0123456789 ')).toBe(true);
      expect(highlighter.isUuid('  abcdef01-2345-6789-abcd-ef0123456789  ')).toBe(true);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { isVersionSupported } from './versionValidator';

describe('versionValidator', () => {
  describe('isVersionSupported', () => {
    describe('exact match', () => {
      it('should match exact version string', () => {
        expect(isVersionSupported('0.1.0', ['0.1.0'])).toBe(true);
      });

      it('should not match different version', () => {
        expect(isVersionSupported('0.1.1', ['0.1.0'])).toBe(false);
      });

      it('should match against multiple patterns', () => {
        expect(isVersionSupported('0.2.0', ['0.1.0', '0.2.0', '0.3.0'])).toBe(true);
      });

      it('should handle version with only major', () => {
        expect(isVersionSupported('1', ['1.0.0'])).toBe(false);
        expect(isVersionSupported('1', ['1'])).toBe(true);
      });

      it('should handle version with major.minor only', () => {
        expect(isVersionSupported('1.2', ['1.2'])).toBe(true);
        expect(isVersionSupported('1.2', ['1.2.0'])).toBe(false);
      });
    });

    describe('caret (^) - patch version matching', () => {
      it('should match same major and minor with different patch', () => {
        expect(isVersionSupported('0.2.5', ['^0.2.0'])).toBe(true);
      });

      it('should match exact version with caret pattern', () => {
        expect(isVersionSupported('0.2.0', ['^0.2.0'])).toBe(true);
      });

      it('should not match different minor version', () => {
        expect(isVersionSupported('0.3.0', ['^0.2.0'])).toBe(false);
      });

      it('should not match different major version', () => {
        expect(isVersionSupported('1.2.0', ['^0.2.0'])).toBe(false);
      });

      it('should match any patch version within same major.minor', () => {
        const pattern = ['^1.5.0'];
        expect(isVersionSupported('1.5.0', pattern)).toBe(true);
        expect(isVersionSupported('1.5.1', pattern)).toBe(true);
        expect(isVersionSupported('1.5.99', pattern)).toBe(true);
        expect(isVersionSupported('1.6.0', pattern)).toBe(false);
      });
    });

    describe('double caret (^^) - major version matching', () => {
      it('should match same major with different minor and patch', () => {
        expect(isVersionSupported('1.5.0', ['^^1.0.0'])).toBe(true);
        expect(isVersionSupported('1.9.99', ['^^1.0.0'])).toBe(true);
      });

      it('should not match different major version', () => {
        expect(isVersionSupported('2.0.0', ['^^1.0.0'])).toBe(false);
        expect(isVersionSupported('0.9.9', ['^^1.0.0'])).toBe(false);
      });

      it('should match any version within same major', () => {
        const pattern = ['^^2.3.4'];
        expect(isVersionSupported('2.0.0', pattern)).toBe(true);
        expect(isVersionSupported('2.3.4', pattern)).toBe(true);
        expect(isVersionSupported('2.10.5', pattern)).toBe(true);
        expect(isVersionSupported('2.99.99', pattern)).toBe(true);
        expect(isVersionSupported('3.0.0', pattern)).toBe(false);
      });

      it('should handle zero major version', () => {
        const pattern = ['^^0.5.0'];
        expect(isVersionSupported('0.1.0', pattern)).toBe(true);
        expect(isVersionSupported('0.9.9', pattern)).toBe(true);
        expect(isVersionSupported('1.0.0', pattern)).toBe(false);
      });
    });

    describe('multiple patterns', () => {
      it('should match if any pattern matches', () => {
        const patterns = ['0.1.0', '^0.2.0', '^^1.0.0'];
        
        expect(isVersionSupported('0.1.0', patterns)).toBe(true); // exact
        expect(isVersionSupported('0.2.5', patterns)).toBe(true); // caret
        expect(isVersionSupported('1.5.0', patterns)).toBe(true); // double caret
      });

      it('should return false if no patterns match', () => {
        const patterns = ['0.1.0', '^0.2.0', '^^1.0.0'];
        
        expect(isVersionSupported('0.3.0', patterns)).toBe(false);
        expect(isVersionSupported('2.0.0', patterns)).toBe(false);
      });

      it('should handle mixed pattern types', () => {
        const patterns = ['^2.1.0', '^^3.0.0', '4.0.0'];
        
        expect(isVersionSupported('2.1.5', patterns)).toBe(true);  // matches ^2.1.0
        expect(isVersionSupported('3.5.0', patterns)).toBe(true);  // matches ^^3.0.0
        expect(isVersionSupported('4.0.0', patterns)).toBe(true);  // matches exact
        expect(isVersionSupported('2.2.0', patterns)).toBe(false); // no match
        expect(isVersionSupported('4.0.1', patterns)).toBe(false); // no match
      });
    });

    describe('edge cases', () => {
      it('should return false for empty version string', () => {
        expect(isVersionSupported('', ['0.1.0'])).toBe(false);
      });

      it('should return false for null/undefined version', () => {
        expect(isVersionSupported(null as any, ['0.1.0'])).toBe(false);
        expect(isVersionSupported(undefined as any, ['0.1.0'])).toBe(false);
      });

      it('should handle empty patterns array', () => {
        expect(isVersionSupported('1.0.0', [])).toBe(false);
      });

      it('should handle version without patch (defaults to 0)', () => {
        expect(isVersionSupported('1.2', ['^1.2.0'])).toBe(true);
      });

      it('should handle version without minor (defaults to 0.0)', () => {
        expect(isVersionSupported('1', ['^^1.0.0'])).toBe(true);
      });

      it('should handle malformed version strings gracefully', () => {
        // These will parse with NaN values, should not match
        expect(isVersionSupported('abc', ['0.1.0'])).toBe(false);
        expect(isVersionSupported('1.2.3.4', ['1.2.3'])).toBe(false);
      });

      it('should handle patterns with spaces (no trimming expected)', () => {
        expect(isVersionSupported('1.0.0', [' 1.0.0'])).toBe(false);
        expect(isVersionSupported('1.0.0', ['1.0.0 '])).toBe(false);
      });
    });

    describe('real-world scenarios', () => {
      it('should validate semver compatibility for app data', () => {
        // Simulate supported versions for an app
        const supportedVersions = ['^^0.1.0', '^1.0.0', '2.0.0'];
        
        // Valid imports
        expect(isVersionSupported('0.1.0', supportedVersions)).toBe(true);
        expect(isVersionSupported('0.5.2', supportedVersions)).toBe(true);
        expect(isVersionSupported('1.0.15', supportedVersions)).toBe(true);
        expect(isVersionSupported('2.0.0', supportedVersions)).toBe(true);
        
        // Invalid imports
        expect(isVersionSupported('1.1.0', supportedVersions)).toBe(false); // different minor
        expect(isVersionSupported('2.0.1', supportedVersions)).toBe(false); // different patch
        expect(isVersionSupported('3.0.0', supportedVersions)).toBe(false); // unsupported major
      });

      it('should handle version upgrade paths', () => {
        // App at version 1.5.3 supports data from:
        const supportedVersions = [
          '^^1.0.0',  // All 1.x.x versions
          '^0.9.0',   // 0.9.x versions
          '0.8.5'     // Exact legacy version
        ];
        
        expect(isVersionSupported('1.0.0', supportedVersions)).toBe(true);
        expect(isVersionSupported('1.5.3', supportedVersions)).toBe(true);
        expect(isVersionSupported('1.9.0', supportedVersions)).toBe(true);
        expect(isVersionSupported('0.9.5', supportedVersions)).toBe(true);
        expect(isVersionSupported('0.8.5', supportedVersions)).toBe(true);
        expect(isVersionSupported('0.8.4', supportedVersions)).toBe(false);
        expect(isVersionSupported('2.0.0', supportedVersions)).toBe(false);
      });
    });
  });
});

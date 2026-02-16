/**
 * Validates if a version string matches the supported version patterns.
 * Patterns:
 * - "0.1.0": Exact match
 * - "^0.2.0": Matches patch versions (Same Major and Minor)
 * - "^^1.5.0": Matches all updates within the Major version (Same Major)
 */
export function isVersionSupported(fileVersion: string, supportedPatterns: string[]): boolean {
    if (!fileVersion) return false;

    // Helper to parse "x.y.z"
    const parse = (v: string) => {
        const parts = v.split('.').map(Number);
        return {
            major: parts[0],
            minor: parts.length > 1 ? parts[1] : 0,
            patch: parts.length > 2 ? parts[2] : 0
        };
    };

    const actual = parse(fileVersion);

    return supportedPatterns.some(pattern => {
        if (pattern.startsWith('^^')) {
            // Major version match
            // "^^1.5.0" -> Matches 1.x.x
            const base = pattern.substring(2);
            const expected = parse(base);
            return actual.major === expected.major;
        } else if (pattern.startsWith('^')) {
            // Minor version match (Patch updates)
            // "^0.2.0" -> Matches 0.2.x
            const base = pattern.substring(1);
            const expected = parse(base);
            return actual.major === expected.major && actual.minor === expected.minor;
        } else {
            // Exact match
            return fileVersion === pattern;
        }
    });
}

/**
 * List of supported versions for import compatibility.
 * 
 * Version Format Examples:
 * - "0.1.0":   Exact match. Only this specific version is allowed.
 * - "^0.2.0":  Minor version match. Allows any patch update within the same minor version (e.g., 0.2.1, 0.2.5).
 * - "^^1.5.0": Major version match. Allows any minor or patch update within the same major version (e.g., 1.5.1, 1.6.0, 1.9.9).
 */
export const SUPPORTED_VERSIONS = [
    "^0.1.0"
];

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to slug
 * @returns The generated slug
 */
export function generateSlug(text: string): string {
  if (!text) return "";

  return (
    text
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/[\s\W-]+/g, "-")
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, "")
      // Limit length to 100 characters
      .substring(0, 100)
  );
}

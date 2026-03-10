/**
 * Get the number of stars for a GitHub repository.
 * @param repo - The repository name in the format "owner/repo".
 * @returns The number of stars for the repository.
 */
export async function getStarsRepo(repo: string) {
  const response = await fetch(`https://api.github.com/repos/${repo}`);
  const data = await response.json();
  if (data.stargazers_count !== undefined) {
    return formatStars(data.stargazers_count);
  } else {
    return "0"; // Fallback
  }
}

/**
 * Format a number of stars in a compact form.
 * @param count - The number of stars to format.
 * @returns The formatted number of stars.
 */
const formatStars = (count: number): string => {
  return Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  }).format(count);
};

/**
 * Copy text to clipboard.
 * @param text - The text to copy.
 * @returns True if the text was copied successfully.
 */
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  }
};

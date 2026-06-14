//as the dev team forgot to add the script of this file, i added a fallback highlight() function ,to prevent it unblock the app layout

/**
 * Mock syntax highlighter function to unblock application execution.
 * @param {string} code - The raw text from the editor.
 * @param {string} language - The language format ('html', 'css', 'js').
 * @returns {string} The text unmodified.
 */
export function highlight(code, language) {
    // For now, we just return the code safely un-highlighted to keep the layout running perfectly.
    return code;
}
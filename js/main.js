```javascript
/**
 * @file Main application logic for the in-browser code editor.
 * @description This script initializes the code editors, handles user input,
 *              updates the real-time preview, and manages syntax highlighting
 *              and line numbering.
 */

import { highlight } from './syntax-highlighter.js';
import { TAB_SIZE, DEBOUNCE_DELAY } from './config.js';

/**
 * A simple debounce function to limit the rate at which a function gets called.
 * @param {Function} func The function to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {Function} The debounced function.
 */
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const elements = {
        html: {
            editor: document.getElementById('html-editor'),
            highlight: document.getElementById('html-highlight'),
            lineNumbers: document.getElementById('html-line-numbers'),
        },
        css: {
            editor: document.getElementById('css-editor'),
            highlight: document.getElementById('css-highlight'),
            lineNumbers: document.getElementById('css-line-numbers'),
        },
        js: {
            editor: document.getElementById('js-editor'),
            highlight: document.getElementById('js-highlight'),
            lineNumbers: document.getElementById('js-line-numbers'),
        },
        previewFrame: document.getElementById('preview-frame'),
    };

    /**
     * Updates the preview iframe with the current code from all editors.
     * This function is debounced to prevent excessive updates while typing,
     * which improves performance.
     */
    const updatePreview = debounce(() => {
        if (!elements.previewFrame) return;

        const htmlCode = elements.html.editor.value;
        const cssCode = elements.css.editor.value;
        const jsCode = elements.js.editor.value;

        const sourceDocument = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Live Preview</title>
                <style>
                    ${cssCode}
                </style>
            </head>
            <body>
                ${htmlCode}
                <script>
                    try {
                        ${jsCode}
                    } catch (e) {
                        console.error("Error in user script:", e);
                    }
                <\/script>
            </body>
            </html>
        `;

        elements.previewFrame.srcdoc = sourceDocument;
    }, DEBOUNCE_DELAY);

    /**
     * Updates the line numbers for a given editor.
     * @param {HTMLTextAreaElement} editor - The textarea element.
     * @param {HTMLElement} lineNumbersEl - The element to display line numbers in.
     */
    const updateLineNumbers = (editor, lineNumbersEl) => {
        const lineCount = editor.value.split('\n').length;
        const lastKnownLineCount = parseInt(lineNumbersEl.dataset.lineCount || '0', 10);

        // Avoid unnecessary DOM manipulation if the line count hasn't changed.
        if (lineCount === lastKnownLineCount) {
            return;
        }

        const lines = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
        lineNumbersEl.textContent = lines;
        lineNumbersEl.dataset.lineCount = lineCount;
    };

    /**
     * Handles input events for a specific editor, updating highlighting and line numbers.
     * @param {object} editorElements - The collection of elements for one language.
     * @param {string} language - The language of the editor ('html', 'css', 'js').
     */
    const handleEditorInput = (editorElements, language) => {
        const code = editorElements.editor.value;
        
        // Update syntax highlighting. Use innerHTML as it contains styled spans.
        // Append a newline to fix a scrolling issue where the last line is not visible.
        editorElements.highlight.innerHTML = highlight(code, language) + '\n';
        
        // Update line numbers
        updateLineNumbers(editorElements.editor, editorElements.lineNumbers);
        
        // Trigger the debounced preview update
        updatePreview();
    };

    /**
     * Synchronizes the scroll position of the editor, highlighter, and line numbers.
     * @param {Event} e - The scroll event object.
     * @param {object} editorElements - The collection of elements for one language.
     */
    const syncScroll = (e, editorElements) => {
        const { scrollTop, scrollLeft } = e.target;
        editorElements.highlight.scrollTop = scrollTop;
        editorElements.highlight.scrollLeft = scrollLeft;
        editorElements.lineNumbers.scrollTop = scrollTop;
    };

    /**
     * Handles the 'keydown' event, specifically for intercepting the Tab key
     * to insert spaces instead of changing focus.
     * @param {KeyboardEvent} e - The keyboard event object.
     */
    const handleTabKey = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const editor = e.target;
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const tabCharacter = ' '.repeat(TAB_SIZE);

            // Insert tab character at the current cursor position
            editor.value = editor.value.substring(0, start) + tabCharacter + editor.value.substring(end);

            // Move the cursor to the position after the inserted tab
            editor.selectionStart = editor.selectionEnd = start + tabCharacter.length;
            
            // Manually trigger an input event to update highlighting and preview
            editor.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        }
    };

    /**
     * Initializes all editors, setting up event listeners and initial state.
     */
    const initializeEditors = () => {
        // Check if all required elements are present
        if (!elements.html.editor || !elements.css.editor || !elements.js.editor || !elements.previewFrame) {
            console.error('One or more required editor elements are missing from the DOM.');
            return;
        }

        Object.entries(elements).forEach(([lang, editorElements]) => {
            // Skip the previewFrame object
            if (lang === 'previewFrame') return;

            const { editor } = editorElements;

            // Set common attributes for a better coding experience
            editor.setAttribute('spellcheck', 'false');
            editor.setAttribute('autocorrect', 'off');
            editor.setAttribute('autocapitalize', 'off');

            // Set up event listeners
            editor.addEventListener('input', () => handleEditorInput(editorElements, lang));
            editor.addEventListener('scroll', (e) => syncScroll(e, editorElements));
            editor.addEventListener('keydown', handleTabKey);

            // Perform an initial update on page load to process any pre-filled content
            handleEditorInput(editorElements, lang);
        });
    };

    // --- Application Initialization ---
    initializeEditors();
});
```
/**
 * @file Main application logic for the in-browser code editor.
 * @description Refactored to support a single textarea with tabbed multi-language storage,
 * persisting data via localStorage, and a clean editor reset.
 */

import { highlight } from './syntax-highlighter.js';
import { TAB_SIZE, DEBOUNCE_DELAY } from './config.js';

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
    // --- State Management ---
    // === this is added as a 'cental memory store ' to tarck the content of 3 lang tabs(html,css,js) ===
    let codeState = {
        html: '\n<h1>Hello World</h1>',
        css: '/* Write your CSS here */\nh1 {\n    color: slateblue;\n}',
        js: '// Write your JavaScript here\nconsole.log("Hello from the editor!");'
    };

    let currentLang = 'html'; // Tracks which tab is currently viewed

    // --- DOM Element Selection ---
    const elements = {
        editor: document.getElementById('code-editor'),
        lineNumbers: document.getElementById('line-numbers'),
        previewFrame: document.getElementById('preview-frame'),
        tabs: {
            html: document.getElementById('html-tab'),
            css: document.getElementById('css-tab'),
            js: document.getElementById('js-tab')
        }
    };

    /**
     * Updates the preview iframe with the current code from state.
     */
    const updatePreview = debounce(() => {
        if (!elements.previewFrame) return;

        const sourceDocument = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Live Preview</title>
                <style>
                    ${codeState.css}
                </style>
            </head>
            <body>
                ${codeState.html}
                <script>
                    try {
                        ${codeState.js}
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
     * Updates the line numbers inside the sidebar gutter.
     */
    const updateLineNumbers = () => {
        if (!elements.editor || !elements.lineNumbers) return;
        const lineCount = elements.editor.value.split('\n').length;
        
        let lineNumbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHTML += `<span>${i}</span>`;
        }
        elements.lineNumbers.innerHTML = lineNumbersHTML;
    };

    /**
     * Handles typing in the active editor panel
     */
    const handleEditorInput = () => {
        // 1. Update our central state object with what the user typed
        codeState[currentLang] = elements.editor.value;
        
        // 2. Refresh side components
        updateLineNumbers();
        updatePreview();

        // === this is a reuied feature that auto-save the updated state to store in local storage ===
        localStorage.setItem('in_browser_editor_code', JSON.stringify(codeState));
    };

    /**
     * Switches the active language tab layout
     */
    const switchTab = (nextLang) => {
        if (!elements.tabs[nextLang] || !elements.editor) return;

        // Manage active classes on tabs
        Object.keys(elements.tabs).forEach(lang => {
            elements.tabs[lang].classList.remove('active');
            elements.tabs[lang].setAttribute('aria-selected', 'false');
        });
        elements.tabs[nextLang].classList.add('active');
        elements.tabs[nextLang].setAttribute('aria-selected', 'true');

        // Swap out the text contents for the next target language
        currentLang = nextLang;
        elements.editor.value = codeState[currentLang];
        
        updateLineNumbers();
    };

    /**
     * Intercepts standard Tab keys to insert structural spaces instead
     */
    const handleTabKey = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const editor = e.target;
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const tabCharacter = ' '.repeat(TAB_SIZE || 4);

            editor.value = editor.value.substring(0, start) + tabCharacter + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + tabCharacter.length;
            
            handleEditorInput();
        }
    };

    /**
     * Initializes state from storage or attaches global interactions
     */
    const initializeEditors = () => {
        if (!elements.editor || !elements.previewFrame) {
            console.error('Core DOM elements missing.');
            return;
        }

        // === this is the required feature ' Load local content on startup ' ===
        const savedCode = localStorage.getItem('in_browser_editor_code');
        if (savedCode) {
            try {
                const parsed = JSON.parse(savedCode);
                if (parsed.html !== undefined) codeState.html = parsed.html;
                if (parsed.css !== undefined) codeState.css = parsed.css;
                if (parsed.js !== undefined) codeState.js = parsed.js;
            } catch (e) {
                console.error("Failed parsing localStorage state:", e);
            }
        }

        // Set attributes
        elements.editor.setAttribute('spellcheck', 'false');

        // Core Event Bindings
        elements.editor.addEventListener('input', handleEditorInput);
        elements.editor.addEventListener('keydown', handleTabKey);

        // Bind language tabs buttons click events
        Object.entries(elements.tabs).forEach(([lang, tabElement]) => {
            if (tabElement) {
                tabElement.addEventListener('click', () => switchTab(lang));
            }
        });

        // Seed initial panel presentation data
        elements.editor.value = codeState[currentLang];
        updateLineNumbers();
        updatePreview();
    };

    // Initialize application execution
    initializeEditors();
  
    // === designed and wired a ' Clear Editor ' button into preview toolbar header==
    const clearBtn = document.getElementById('clear-editor-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your code? This resets all data.')) {
                localStorage.removeItem('in_browser_editor_code');
                codeState = { html: '', css: '', js: '' };
                elements.editor.value = '';
                updateLineNumbers();
                updatePreview();
            }
        });
    }
});
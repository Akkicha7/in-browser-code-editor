/**
 * @file Configuration for the In-Browser Code Editor.
 * @description This file centralizes settings for editor behavior, appearance,
 * performance, and integrations with other services. Using a centralized config
 * file makes it easier to manage and update the application's settings without
 * altering core logic.
 */

const config = {
    /**
     * General editor settings that control the core editing experience.
     */
    editor: {
        /** @type {number} The number of spaces a tab is equal to. */
        tabSize: 4,

        /** @type {boolean} If true, use tab characters for indentation. If false, use spaces. */
        indentWithTabs: false,

        /** @type {boolean} Toggles the visibility of line numbers in the gutter. */
        lineNumbers: true,

        /** @type {boolean} Automatically closes brackets `()`, `[]`, `{}` and quotes `""`, `''`. */
        autoCloseBrackets: true,

        /** @type {boolean} Automatically closes HTML tags. */
        autoCloseTags: true,

        /** @type {boolean} Toggles soft line wrapping for long lines. */
        wordWrap: false,

        /** @type {string} The default theme for the editor ('light' or 'dark'). */
        theme: 'dark',

        /** @type {number} The font size for the editor content in pixels. */
        fontSize: 14,
    },

    /**
     * Syntax highlighting settings.
     */
    syntaxHighlighting: {
        /**
         * @type {number} Debounce delay in milliseconds for re-running the highlighter on user input.
         * A lower value is more responsive but more resource-intensive.
         */
        highlightDelay: 150,

        /**
         * @type {Object.<string, Object.<string, string>>} Color mappings for different token types, organized by theme.
         * Keys correspond to CSS class names applied to tokens by `syntax-highlighter.js`.
         */
        themeColors: {
            dark: {
                'token-comment': '#6a9955',
                'token-punctuation': '#d4d4d4',
                'token-tag': '#569cd6',
                'token-attribute-name': '#9cdcfe',
                'token-attribute-value': '#ce9178',
                'token-string': '#ce9178',
                'token-selector': '#d7ba7d',
                'token-property': '#9cdcfe',
                'token-value': '#ce9178',
                'token-keyword': '#c586c0',
                'token-function': '#dcdcaa',
                'token-variable': '#4fc1ff',
                'token-number': '#b5cea8',
                'token-operator': '#d4d4d4',
                'token-default': '#d4d4d4',
            },
            light: {
                'token-comment': '#008000',
                'token-punctuation': '#333333',
                'token-tag': '#0000ff',
                'token-attribute-name': '#ff0000',
                'token-attribute-value': '#a31515',
                'token-string': '#a31515',
                'token-selector': '#2b91af',
                'token-property': '#ff0000',
                'token-value': '#0451a5',
                'token-keyword': '#0000ff',
                'token-function': '#795e26',
                'token-variable': '#001080',
                'token-number': '#098658',
                'token-operator': '#333333',
                'token-default': '#333333',
            }
        }
    },

    /**
     * Real-time preview pane settings.
     */
    preview: {
        /** @type {boolean} If true, the preview pane updates automatically as the user types. */
        autoUpdate: true,

        /**
         * @type {number} Debounce delay in milliseconds for updating the preview pane.
         * This prevents the preview from re-rendering on every single keystroke, improving performance.
         */
        updateDelay: 300,
    },

    /**
     * Configuration for integrations with other services.
     * This section simulates a microservice architecture where the editor
     * can interact with other parts of a larger system.
     */
    integrations: {
        /**
         * Settings for the Text-Based Adventure Game service.
         * Allows the editor to be used for editing game scripts or content,
         * potentially fetching them from and saving them to a remote service.
         */
        textAdventureGame: {
            /** @type {string|null} The base URL for the adventure game's API. Set to null to disable integration. */
            apiBaseUrl: 'https://api.example.com/adventure-game/v1',

            /**
             * @type {object} API endpoints for interacting with the game service.
             */
            endpoints: {
                /**
                 * @type {string} Endpoint to fetch a game script.
                 * Example usage: `${apiBaseUrl}${endpoints.getScript}?id=scene1`
                 */
                getScript: '/scripts',
                /**
                 * @type {string} Endpoint to save a game script.
                 * Example usage: POST to `${apiBaseUrl}${endpoints.saveScript}`
                 */
                saveScript: '/scripts',
            },

            /** @type {boolean} Enables a special UI mode in the editor for editing game scripts. */
            scriptEditingMode: false,
        }
    },
};

// Use Object.freeze to create an immutable configuration object.
// This is a best practice for production code to prevent accidental modification
// of configuration at runtime, which could lead to unpredictable behavior.
export default Object.freeze(config);
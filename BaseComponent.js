/**
 * BaseComponent.js
 *
 * A base class for custom Web Components.
 *
 * Provides:
 * - Shadow DOM
 * - Automatic props from attributes
 * - Typed attribute binding via defineProps()
 * - Automatic CSS/HTML templating
 * - Custom rendering support
 * - Simple lifecycle hooks
 * - Clean rendering flow with minimal boilerplate
 */
export default class BaseComponent extends HTMLElement {
    constructor() {
        super();

        // Attach Shadow DOM
        this.attachShadow({ mode: "open" });

        // Props object populated from defined attributes
        this.props = {};

        // Initialize props before the first render
        this.updatePropsFromAttributes();
    }

    /**
     * Optional class-level CSS template function.
     * Child components may assign a function that receives the component's
     * current props and returns a CSS template string.
     *
     * Example:
     * static {
     *     this.css = css;
     * }
     * @type {Function|null}
     */
    static css = null;

    /**
     * Optional class-level HTML template function.
     * Child components may assign a function that receives the component's
     * current props and returns an HTML template string.
     *
     * Example:
     * static {
     *     this.html = html;
     * }
     * @type {Function|null}
     */
    static html = null;

    /**
     * Defines component props and observed attributes.
     * Typed syntax:
     *
     * this.defineProps({
     *     title: String,
     *     required: Boolean,
     *     count: Number
     * });
     *
     * String-only shorthand:
     * this.defineProps("title", "description");
     * @param {...(string|Object)} args - Prop names or a prop definition object.
     */
    static defineProps(...args) {
        let propDefinitions = {};

        if (args.length === 1 &&
            typeof args[0] === "object" &&
            args[0] !== null &&
            !Array.isArray(args[0])) {
            propDefinitions = args[0];
        } else {
            // Backward-compatible string syntax
            args.forEach(name => {
                propDefinitions[name] = String;
            });
        }

        this.propDefinitions = propDefinitions;

        Object.defineProperty(this, "observedAttributes", {
            configurable: true,
            value: Object.keys(propDefinitions)
        });
    }

    /**
     * Converts a kebab-case attribute name to camelCase for props mapping.
     *
     * Example:
     * "link-text" -> "linkText"
     * @param {string} attr - Attribute name.
     * @returns {string}
     */
    static toCamelCase(attr) {
        return attr.replace(
            /-([a-z])/g,
            (_, letter) => letter.toUpperCase()
        );
    }

    /**
     * Converts an attribute value into its defined prop type.
     *
     * Supported types:
     * - String
     * - Number
     * - Boolean
     * @param {Function} type - Prop type constructor.
     * @param {string|null} value - Raw attribute value.
     * @returns {string|number|boolean|null}
     */
    static parseProp(type, value) {
        if (type === Boolean) {
            return value !== null;
        }

        if (type === Number) {
            return value === null ? null : Number(value);
        }

        if (type === String) {
            return value ?? null;
        }

        return value;
    }

    /**
     * Lifecycle hook called after every render, including the initial render.
     * Override this method for setup that depends on the component's
     * rendered Shadow DOM, such as attaching event listeners.
     */
    onRender() {}

    /**
     * Lifecycle hook called after the component is connected to the DOM
     * and its initial render has completed.
     * Override this method for initialization that should occur when
     * the component is mounted.
     */
    onMount() {}

    /**
     * Generates the component's template.
     * Child components may override this method to provide custom rendering.
     * By default, the class-level `css` and `html` template functions are used.
     * @returns {string|null}
     */
    render() {
        return this.autoTemplate();
    }

    /**
     * Generates a template using the class-level `css` and `html`
     * template functions.
     * Both functions receive the component's current props.
     * @returns {string|null} The compiled template, or null if no
     * template functions have been defined.
     */
    autoTemplate() {
        const C = this.constructor;
        const cssFn = C.css;
        const htmlFn = C.html;

        if (typeof cssFn !== "function" &&
            typeof htmlFn !== "function") {
            return null;
        }

        const cssString = typeof cssFn === "function"
                ? cssFn(this.props)
                : "";

        const htmlString = typeof htmlFn === "function"
                ? htmlFn(this.props)
                : "";

        return this.compile(cssString, htmlString);
    }

    /**
     * Builds `this.props` from the component's defined attributes.
     * Attribute names are converted from kebab-case to camelCase
     * and values are converted to their defined prop types.
     */
    updatePropsFromAttributes() {
        const definitions =
            this.constructor.propDefinitions || {};

        this.props = {};

        Object.entries(definitions).forEach(([attr, type]) => {
            const key = this.constructor.toCamelCase(attr);
            const value = this.getAttribute(attr);

            this.props[key] =
                this.constructor.parseProp(type, value);
        });
    }

    /**
     * Called when an observed attribute changes.
     * Updates the component's props and triggers a new render when
     * the component is currently connected to the DOM.
     * @param {string} name - Changed attribute name.
     * @param {string|null} oldValue - Previous attribute value.
     * @param {string|null} newValue - New attribute value.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }

        this.updatePropsFromAttributes();

        if (this.isConnected) {
            this.doRender();
        }
    }

    /**
     * Called when the component is connected to the DOM.
     * Performs the initial render and then calls `onMount()`.
     */
    connectedCallback() {
        this.doRender();
        this.onMount();
    }

    /**
     * Performs lightweight minification of a compiled component template.
     * CSS comments and unnecessary CSS whitespace are removed.
     * Whitespace between HTML tags is also removed while preserving
     * whitespace within text content.
     * @param {string} html - Compiled component template.
     * @returns {string}
     */
    minifyTemplate(html) {
        if (!html || typeof html !== "string") {
            return html;
        }

        let output = html;

        // Minify CSS inside <style> tags
        output = output.replace(
            /<style[^>]*>([\s\S]*?)<\/style>/gi,
            (match, css) => {
                const minifiedCss = css
                    .replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/\s+/g, " ")
                    .replace(/\s*([:;{}])\s*/g, "$1")
                    .trim();

                return `<style>${minifiedCss}</style>`;
            }
        );

        // Remove whitespace between HTML tags while preserving text spacing
        output = output.replace(/>\s+</g, "><");
        return output.trim();
    }

    /**
     * Compiles CSS and HTML template strings into a single template.
     * @param {string} cssString - Component CSS.
     * @param {string} htmlString - Component HTML.
     * @returns {string} The compiled and minified component template.
     */
    compile(cssString, htmlString) {
        const template = `
            <style>${cssString || ""}</style>
            ${htmlString || ""}
        `;

        return this.minifyTemplate(template);
    }

    /**
     * Internal render pipeline.
     * Calls `render()`, writes the returned template to the Shadow DOM,
     * then calls `onRender()`.
     */
    doRender() {
        const template = this.render();

        if (typeof template !== "string") {
            return;
        }

        this.shadowRoot.innerHTML = template;
        this.onRender();
    }
}
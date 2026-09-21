import BaseComponent from "./BaseComponent.js";

/**
 * FormComponent.js
 *
 * Base class for building form-associated custom elements such as
 * inputs, selects, checkboxes, and buttons.
 *
 * Extends BaseComponent with native form integration using ElementInternals.
 * Form controls built from this class can participate in standard HTML forms,
 * including forms rendered and processed by Django.
 *
 * Provides:
 * - Native form association
 * - Form value synchronization
 * - Constraint validation
 * - Access to the associated form
 * - Standard `name` and `value` interfaces
 * - Form reset lifecycle support
 * - Form disabled lifecycle support
 */
export default class FormComponent extends BaseComponent {
    /**
     * Enables native form association for this custom element.
     * This allows the browser to associate components extending
     * FormComponent with their containing <form>.
     * @type {boolean}
     */
    static formAssociated = true;

    constructor() {
        super();

        /**
         * Provides access to the browser's form-associated custom element API.
         * Used internally for form association, form values,
         * constraint validation, and other native form behavior.
         * @type {ElementInternals}
        */
        this.internals = this.attachInternals();
    }

    /**
     * Returns the HTML form associated with this component.
     * Returns null when the component is not associated with a form.
     * @returns {HTMLFormElement|null}
     */
    get form() {
        return this.internals.form;
    }

    /**
     * Returns the component's `name` attribute.
     * The name identifies the control when its value is included
     * in submitted form data.
     * @returns {string}
     */
    get name() {
        return this.getAttribute("name") ?? "";
    }

    /**
     * Returns the current value of the form control.
     * Individual form controls should override this getter to return
     * the value of their internal control.
     * @returns {string}
     */
    get value() {
        return "";
    }

    /**
     * Sets the current value of the form control.
     * Individual form controls should override this setter and synchronize
     * the new value with both their internal control and the form using
     * `setFormValue()`.
     * @param {*} value - The new value of the form control.
     */
    set value(value) {
        // Implemented by individual controls
    }

    /**
     * Sets the value contributed by this component during form submission.
     * Individual controls should call this whenever their value changes
     * so the custom element remains synchronized with its associated form.
     * @param {*} value - Value to associate with the form control.
     */
    setFormValue(value) {
        this.internals.setFormValue(value);
    }

    /**
     * Sets the constraint validation state of the form control.
     * An empty flags object marks the control as valid. When invalid,
     * a validation message and optional anchor element may be provided.
     * @param {Object} flags - Validity flags describing the invalid state.
     * @param {string} message - Validation message presented by the browser.
     * @param {HTMLElement} [anchor] - Element associated with the validation error.
     */
    setValidity(flags = {}, message = "", anchor = undefined) {
        this.internals.setValidity(
            flags,
            message,
            anchor
        );
    }

    /**
     * Checks whether the form control satisfies its validation constraints.
     * @returns {boolean} True when the control is valid.
     */
    checkValidity() {
        return this.internals.checkValidity();
    }

    /**
     * Checks the control's validity and asks the browser to report
     * validation errors to the user when invalid.
     * @returns {boolean} True when the control is valid.
     */
    reportValidity() {
        return this.internals.reportValidity();
    }

    /**
     * Form-associated lifecycle callback invoked when the associated
     * form is reset.
     * Individual controls may override this method to restore their
     * initial value and synchronize their form and validation state.
     */
    formResetCallback() {}

    /**
     * Form-associated lifecycle callback invoked when the control's
     * disabled state changes through form-associated behavior.
     * Individual controls may override this method to synchronize the
     * disabled state with their internal native control.
     * @param {boolean} disabled - Whether the form control should be disabled.
     */
    formDisabledCallback(disabled) {}
}

import FormComponent from "../../lib/FormComponent.js";

const css = () => /*css*/`
    .cc-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        box-sizing: border-box;
        margin: 1rem 0;
        padding: 0.5rem 0.75rem;
        font: inherit;
        font-weight: 500;
        line-height: 1.5;
        cursor: pointer;
        border: 1px solid transparent;
        border-radius: var(--border-radius-round);
        transition:
            background-color 0.15s ease-in-out,
            border-color 0.15s ease-in-out,
            color 0.15s ease-in-out,
            box-shadow 0.15s ease-in-out,
            filter 0.15s ease-in-out;
    }

    .cc-btn:focus-visible {
        outline: 2px solid var(--color-info);
        outline-offset: 2px;
    }

    .cc-btn:disabled {
        cursor: not-allowed;
        opacity: 0.6;
        filter: none;
    }

    .cc-btn-primary {
        color: var(--primary-text);
        background-color: var(--sidebar);
        border-color: var(--primary-text);
    }

    .cc-btn-primary:not(:disabled):hover {
        filter: brightness(1.25);
    }

    .cc-btn-outline {
        color: var(--primary-text);
        background-color: transparent;
        border-color: var(--primary-text);
    }

    .cc-btn-outline:not(:disabled):hover {
        color: var(--sidebar);
        background-color: var(--primary-text);
    }
`;

const html = ({
    text = "Submit",
    type = "button",
    variant = "primary",
    disabled
}) => /*html*/`
    <button
        class="cc-btn cc-btn-${variant}"
        type="button"
        ${disabled ? "disabled" : ""}
    >
        ${text}
    </button>
`;

class FormButton extends FormComponent {

    static {
        this.defineProps({
            text: String,
            type: String,
            variant: String,
			disabled: Boolean
        });

        this.css = css;
        this.html = html;
    }

    get button() {
        return this.shadowRoot.querySelector("button");
    }

    onMount() {
        this.setClickEvent();
    }

    setClickEvent() {
        this.button.addEventListener("click", () => {
            if (this.props.disabled) return;

            switch (this.props.type) {
                case "submit":
                    this.form?.requestSubmit();
                    break;
                case "reset":
                    this.form?.reset();
                    break;
                default:
                    break;
            }
        });
    }

    formDisabledCallback(disabled) {
        if (this.button) {
            this.button.disabled = disabled;
        }
    }
}

customElements.define("form-button", FormButton);
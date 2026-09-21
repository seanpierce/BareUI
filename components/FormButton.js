import FormComponent from "../../lib/FormComponent.js";

const css = () => /*css*/`
	.cc-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--bare-button-gap);
		width: 100%;
		min-height: var(--bare-button-height);
		box-sizing: border-box;
		padding-inline: var(--bare-button-padding-inline);
		font: inherit;
		font-size: var(--bare-button-font-size);
		font-weight: var(--bare-button-font-weight);
		cursor: pointer;
		border: var(--bare-border-width) solid transparent;
		border-radius: var(--bare-button-border-radius);
		transition:
			background-color var(--bare-duration-medium) var(--bare-easing-standard),
			border-color var(--bare-duration-medium) var(--bare-easing-standard),
			color var(--bare-duration-medium) var(--bare-easing-standard),
			box-shadow var(--bare-duration-medium) var(--bare-easing-standard);
	}

	.cc-btn:focus-visible {
        outline:var(--bare-focus-width) solid var(--bare-focus-color);
		outline-offset: var(--bare-focus-offset);
	}

	.cc-btn:disabled {
		color: var(--bare-button-disabled-color);
		background-color: var(--bare-button-disabled-background);
		border-color: transparent;
		cursor: not-allowed;
	}

    .cc-btn-primary {
        color: var(--bare-button-color);
        background-color: var(--bare-button-background);
        border-color: var(--bare-button-border-color);
    }

    .cc-btn-primary:not(:disabled):hover {
        background-color: var(--bare-button-hover-background);
        box-shadow: var(--bare-button-hover-shadow);
    }

    .cc-btn-outline {
        color: var(--bare-button-outline-color);
        background-color: var(--bare-button-outline-background);
        border-color: var(--bare-button-outline-border-color);
    }

    .cc-btn-outline:not(:disabled):hover {
        background-color: var(--bare-button-outline-hover-background);
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
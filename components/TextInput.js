import FormComponent from "../../lib/FormComponent.js";

const css = () => /*css*/`
	.cc-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin: 0.5rem 0 1rem;
	}

	.cc-field label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--primary-text);
	}

	.cc-field input {
		display: block;
		width: 100%;
		box-sizing: border-box;
		padding: 0.375rem 0.75rem;
		font: inherit;
		line-height: 1.5;
		color: var(--primary-text);
		background-color: var(--sidebar);
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius-round);
		transition:
			border-color 0.15s ease-in-out,
			box-shadow 0.15s ease-in-out;
	}

	.cc-field input::placeholder {
		color: var(--secondary-text);
	}

	.cc-field input:focus {
		border-color: var(--color-info);
		outline: 0;
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
	}

	.cc-field input:disabled {
		background-color: var(--disabled-surface, #e9ecef);
		cursor: not-allowed;
		opacity: 0.7;
	}

	.cc-field input[readonly] {
		background-color: var(--readonly-surface, #e9ecef);
	}
`;

const html = ({
	name,
	label = "Label text",
	placeholder = "",
	value = "",
	maxlength,
	required,
	disabled,
	readonly,
	autocomplete
	}) => /*html*/`
	<div class="cc-field">
		<label for="${name}">
			${label} ${required ? '*' : ''}
		</label>

		<input
			id="${name}"
			name="${name}"
			type="text"
			value="${value ?? ""}"
			placeholder="${placeholder ?? ""}"
			maxlength="${maxlength}"
			${required ? "required" : ""}
			${disabled ? "disabled" : ""}
			${readonly ? "readonly" : ""}
			${autocomplete ? `autocomplete="${autocomplete}"` : ""}
		/>
	</div>
`;

class TextInput extends FormComponent {
	static {
		this.defineProps({
			name: String,
			label: String,
			placeholder: String,
			value: String,
			maxlength: Number,
			required: Boolean,
			disabled: Boolean,
			readonly: Boolean,
			autocomplete: String
		});

		this.css = css;
		this.html = html;
	}

	get input() {
		return this.shadowRoot.querySelector("input");
	}

	get value() {
		return this.input?.value ?? "";
	}

	set value(value) {
		if (!this.input) return;

		this.input.value = value;
		this.setFormValue(value);
		this.updateValidity();
	}

	onRender() {
		this.setInputEvents();
		this.setFormValue(this.value);
		this.updateValidity();
	}

	setInputEvents() {
		this.input.addEventListener("input", () => {
			this.setFormValue(this.value);
			this.updateValidity();
		});

		this.input.addEventListener("keydown", (event) => {
			if (event.key !== "Enter") return;
			event.preventDefault();
			this.form?.requestSubmit();
		});
	}

	updateValidity() {
		const input = this.input;

		if (input.validity.valid) {
			this.setValidity({});
			return;
		}

		this.setValidity({
				valueMissing: input.validity.valueMissing,
				tooLong: input.validity.tooLong
			},
			input.validationMessage,
			input
		);
	}

	formResetCallback() {
		const initialValue = this.getAttribute("value") ?? "";
		this.input.value = initialValue;
		this.setFormValue(initialValue);
		this.updateValidity();
	}

	formDisabledCallback(disabled) {
		this.input.disabled = disabled;
	}
}

customElements.define("text-input", TextInput);
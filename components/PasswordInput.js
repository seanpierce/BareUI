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

	.cc-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.cc-field input {
		display: block;
		width: 100%;
		box-sizing: border-box;
		padding: 0.375rem 3rem 0.375rem 0.75rem;
		font: inherit;
		line-height: 1.5;
		color: var(--primary-text);
		background-color: var(--sidebar);
		border: 1px solid var(--border-color);
		border-radius: var(--border-radius-round);
		transition: border-color 0.15s ease-in-out,
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

	/*
		* Hide browser-native password reveal controls.
		* Primarily affects Microsoft Edge / IE-style controls.
		*/
	.cc-field input::-ms-reveal,
	.cc-field input::-ms-clear {
		display: none;
	}

	.cc-password-toggle {
		position: absolute;
		top: 50%;
		right: 0.65rem;
		transform: translateY(-50%);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		color: var(--secondary-text);
		background: transparent;
		border: 0;
		border-radius: var(--border-radius-round);
		cursor: pointer;
		--icon-color: var(--secondary-text);
		transition:
			color 0.15s ease-in-out,
			background-color 0.15s ease-in-out;
	}

	.cc-password-toggle:hover {
		color: var(--primary-text);
		--icon-color: var(--primary-text);
	}

	.cc-password-toggle:focus-visible {
		outline: 2px solid var(--color-info);
		outline-offset: 2px;
	}

	.cc-password-toggle:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
`;

const html = ({
	name,
	label = "Password",
	placeholder = "",
	value = "",
	required,
	autocomplete = "current-password"
}) => /*html*/`
	<div class="cc-field">
		<label for="${name}">
			${label} ${required ? "*" : ""}
		</label>

		<div class="cc-input-wrapper">
			<input
				id="${name}"
				name="${name}"
				type="password"
				value="${value ?? ""}"
				placeholder="${placeholder ?? ""}"
				${required ? "required" : ""}
				${autocomplete ? `autocomplete="${autocomplete}"` : ""}
			/>

			<button
				class="cc-password-toggle"
				type="button"
				aria-label="Show password"
				aria-pressed="false"
			>
				<app-icon
					name="eye-opened"
					size="20">
				</app-icon>
			</button>
		</div>
	</div>
`;

class PasswordInput extends FormComponent {

	static {
		this.defineProps({
			name: String,
			label: String,
			placeholder: String,
			value: String,
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

	get toggleButton() {
		return this.shadowRoot.querySelector(
			".cc-password-toggle"
		);
	}

	get toggleIcon() {
		return this.toggleButton?.querySelector(
			"app-icon"
		);
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
		this.setPasswordToggleEvent();
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

	setPasswordToggleEvent() {
		this.toggleButton.addEventListener("click", () => {

			const showingPassword =
				this.input.type === "text";

			if (showingPassword) {
				this.hidePassword();
			} else {
				this.showPassword();
			}
		});
	}

	showPassword() {
		this.input.type = "text";
		this.toggleButton.setAttribute("aria-label", "Hide password");
		this.toggleButton.setAttribute("aria-pressed", "true");
		this.toggleIcon?.setAttribute("name", "eye-closed");
	}

	hidePassword() {
		this.input.type = "password";
		this.toggleButton.setAttribute("aria-label", "Show password");
		this.toggleButton.setAttribute("aria-pressed", "false");
		this.toggleIcon?.setAttribute("name", "eye-opened");
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
		const initialValue =
			this.getAttribute("value") ?? "";

		this.input.value = initialValue;
		this.setFormValue(initialValue);
		this.hidePassword();
		this.updateValidity();
	}

	formDisabledCallback(disabled) {
		if (!this.input || !this.toggleButton) return;

		this.input.disabled = disabled;
		this.toggleButton.disabled = disabled;
	}
}

customElements.define("password-input", PasswordInput);
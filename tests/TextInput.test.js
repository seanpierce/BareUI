import {
	describe,
	test,
	beforeEach,
	afterEach,
	expect
} from "../lib/tests/TestRunner.js";

import {
	createFixture,
	removeFixture,
	render,
	input,
	mount
} from "../lib/tests/TestFixture.js";

import "../components/FormElements/TextInput.js";


describe("TextInput", () => {
	beforeEach(() => {
		createFixture();
	});

	afterEach(() => {
		removeFixture();
	});

	test("renders a native text input", () => {
		const component = render(`
			<text-input
				name="username"
				label="Username">
			</text-input>
		`);

		expect(component.input).not.toBeNull();
		expect(component.input.type).toBe("text");
	});

	test("renders the supplied label", () => {
		const component = render(`
			<text-input
				name="username"
				label="Username">
			</text-input>
		`);

		const label =
			component.shadowRoot.querySelector("label");

		expect(label).not.toBeNull();
		expect(label.textContent).toContain("Username");
		expect(label.getAttribute("for")).toBe("username");
	});

	test("uses the name attribute for the native input id and name", () => {
		const component = render(`
			<text-input
				name="username">
			</text-input>
		`);

		expect(component.input.id).toBe("username");
		expect(component.input.name).toBe("username");
	});

	test("renders the supplied placeholder", () => {
		const component = render(`
			<text-input
				name="username"
				placeholder="Enter your username">
			</text-input>
		`);

		expect(component.input.placeholder).toBe(
			"Enter your username"
		);
	});

	test("renders the supplied initial value", () => {
		const component = render(`
			<text-input
				name="username"
				value="Sean">
			</text-input>
		`);

		expect(component.input.value).toBe("Sean");
		expect(component.value).toBe("Sean");
	});

	test("passes maxlength to the native input", () => {
		const component = render(`
			<text-input
				name="username"
				maxlength="30">
			</text-input>
		`);

		expect(component.props.maxlength).toBe(30);
		expect(component.input.maxLength).toBe(30);
	});

	test("marks the native input as required", () => {
		const component = render(`
			<text-input
				name="username"
				required>
			</text-input>
		`);

		expect(component.props.required).toBe(true);
		expect(component.input.required).toBe(true);
		expect(component.input).toHaveAttribute("required");
	});

	test("does not mark the native input as required when omitted", () => {
		const component = render(`
			<text-input name="username">
			</text-input>
		`);

		expect(component.props.required).toBe(false);
		expect(component.input.required).toBe(false);
		expect(component.input).not.toHaveAttribute("required");
	});

	test("marks the native input as disabled", () => {
		const component = render(`
			<text-input
				name="username"
				disabled>
			</text-input>
		`);

		expect(component.props.disabled).toBe(true);
		expect(component.input.disabled).toBe(true);
		expect(component.input).toHaveAttribute("disabled");
	});

	test("marks the native input as readonly", () => {
		const component = render(`
			<text-input
				name="username"
				readonly>
			</text-input>
		`);

		expect(component.props.readonly).toBe(true);
		expect(component.input.readOnly).toBe(true);
		expect(component.input).toHaveAttribute("readonly");
	});

	test("passes autocomplete to the native input", () => {
		const component = render(`
			<text-input
				name="username"
				autocomplete="username">
			</text-input>
		`);

		expect(
			component.input.getAttribute("autocomplete")
		).toBe("username");
	});

	test("adds a required indicator to the label", () => {
		const component = render(`
			<text-input
				name="username"
				label="Username"
				required>
			</text-input>
		`);

		const label =
			component.shadowRoot.querySelector("label");

		expect(label.textContent).toContain("*");
	});

	test("returns the current native input value", () => {
		const component = render(`
			<text-input name="username">
			</text-input>
		`);

		component.input.value = "Sean";

		expect(component.value).toBe("Sean");
	});


	test("value setter updates the native input value", () => {
		const component = render(`
			<text-input name="username">
			</text-input>
		`);

		component.value = "Sean";

		expect(component.input.value).toBe("Sean");
		expect(component.value).toBe("Sean");
	});


	test("updates its form value when the user types", () => {
		const form = render(`
			<form>
				<text-input
					name="username">
				</text-input>
			</form>
		`);

		const component =
			form.querySelector("text-input");

		input(
			component.input,
			"Sean"
		);

		const formData =
			new FormData(form);

		expect(
			formData.get("username")
		).toBe("Sean");
	});


	test("initial value participates in FormData", () => {
		const form = render(`
			<form>
				<text-input
					name="username"
					value="Sean">
				</text-input>
			</form>
		`);

		const formData =
			new FormData(form);

		expect(
			formData.get("username")
		).toBe("Sean");
	});


	test("is invalid when required and empty", () => {
		const component = render(`
			<text-input
				name="username"
				required>
			</text-input>
		`);

		expect(
			component.input.validity.valid
		).toBe(false);

		expect(
			component.input.validity.valueMissing
		).toBe(true);

		expect(
			component.checkValidity()
		).toBe(false);
	});


	test("becomes valid when a required value is entered", () => {
		const component = render(`
			<text-input
				name="username"
				required>
			</text-input>
		`);

		input(
			component.input,
			"Sean"
		);

		expect(
			component.input.validity.valid
		).toBe(true);

		expect(
			component.checkValidity()
		).toBe(true);
	});


	test("resets to its initial value", () => {
		const form = render(`
			<form>
				<text-input
					name="username"
					value="Original">
				</text-input>
			</form>
		`);

		const component =
			form.querySelector("text-input");

		input(
			component.input,
			"Changed"
		);

		expect(
			component.value
		).toBe("Changed");

		form.reset();

		expect(
			component.value
		).toBe("Original");

		const formData =
			new FormData(form);

		expect(
			formData.get("username")
		).toBe("Original");
	});


	test("does not contribute a value to FormData when disabled", () => {
		const form = render(`
			<form>
				<text-input
					name="username"
					value="Sean"
					disabled>
				</text-input>
			</form>
		`);

		const formData =
			new FormData(form);

		expect(
			formData.get("username")
		).toBeNull();
	});


	test("submits the associated form when Enter is pressed", () => {
		const form = render(`
			<form>
				<text-input
					name="username">
				</text-input>
			</form>
		`);

		const component =
			form.querySelector("text-input");

		let submitCount = 0;

		form.addEventListener(
			"submit",
			(event) => {
				event.preventDefault();

				submitCount++;
			}
		);

		const event = new KeyboardEvent(
			"keydown",
			{
				key: "Enter",
				bubbles: true,
				cancelable: true
			}
		);

		component.input.dispatchEvent(event);

		expect(
			event.defaultPrevented
		).toBe(true);

		expect(
			submitCount
		).toBe(1);
	});


	test("does not submit the associated form for other keys", () => {
		const form = render(`
			<form>
				<text-input
					name="username">
				</text-input>
			</form>
		`);

		const component =
			form.querySelector("text-input");

		let submitCount = 0;

		form.addEventListener(
			"submit",
			(event) => {
				event.preventDefault();

				submitCount++;
			}
		);

		const event = new KeyboardEvent(
			"keydown",
			{
				key: "Tab",
				bubbles: true,
				cancelable: true
			}
		);

		component.input.dispatchEvent(event);

		expect(
			event.defaultPrevented
		).toBe(false);

		expect(
			submitCount
		).toBe(0);
	});


	test("updates when an observed attribute changes", () => {
		const component = render(`
			<text-input
				name="username"
				placeholder="First">
			</text-input>
		`);

		expect(
			component.input.placeholder
		).toBe("First");

		component.setAttribute(
			"placeholder",
			"Second"
		);

		expect(
			component.props.placeholder
		).toBe("Second");

		expect(
			component.input.placeholder
		).toBe("Second");
	});


	test("continues responding to input after re-rendering", () => {
		const form = render(`
			<form>
				<text-input
					name="username"
					placeholder="First">
				</text-input>
			</form>
		`);

		const component =
			form.querySelector("text-input");

		component.setAttribute(
			"placeholder",
			"Second"
		);

		input(
			component.input,
			"Sean"
		);

		const formData =
			new FormData(form);

		expect(
			formData.get("username")
		).toBe("Sean");
	});


	test("uses attributes configured before mounting", () => {
		const component =
			document.createElement("text-input");

		component.setAttribute(
			"name",
			"username"
		);

		component.setAttribute(
			"required",
			""
		);

		component.setAttribute(
			"maxlength",
			"30"
		);

		mount(component);

		expect(
			component.input.name
		).toBe("username");

		expect(
			component.input.required
		).toBe(true);

		expect(
			component.input.maxLength
		).toBe(30);
	});
});
let fixture = null;


/**
 * Creates a fresh DOM fixture for the current test.
 *
 * Any existing fixture is removed before the new fixture is created.
 * The fixture is attached to document.body so connectedCallback()
 * and other browser lifecycle behavior run normally.
 *
 * @returns {HTMLDivElement} The newly created test fixture.
 */
export const createFixture = () => {
	removeFixture();

	fixture = document.createElement("div");

	fixture.setAttribute(
		"data-test-fixture",
		""
	);

	document.body.appendChild(fixture);

	return fixture;
};


/**
 * Returns the currently active test fixture.
 *
 * @returns {HTMLDivElement} The active test fixture.
 * @throws {Error} If no fixture has been created.
 */
export const getFixture = () => {
	if (!fixture) {
		throw new Error(
			"No test fixture exists. Call createFixture() first."
		);
	}

	return fixture;
};


/**
 * Removes the current test fixture from the document.
 *
 * Calling this function when no fixture exists is safe.
 *
 * @returns {void}
 */
export const removeFixture = () => {
	fixture?.remove();

	fixture = null;
};


/**
 * Mounts a DOM node inside the active test fixture.
 *
 * Mounting an element into the attached fixture allows browser lifecycle
 * callbacks such as connectedCallback() to execute normally.
 *
 * @template {Node} T
 * @param {T} element - DOM node to append to the fixture.
 * @returns {T} The mounted node.
 * @throws {TypeError} If the supplied value is not a DOM Node.
 */
export const mount = (element) => {
	if (!(element instanceof Node)) {
		throw new TypeError(
			"mount() expects a DOM Node."
		);
	}

	getFixture().appendChild(element);

	return element;
};


/**
 * Renders an HTML string inside the active test fixture.
 *
 * The fixture contents are replaced and the first rendered element
 * is returned.
 *
 * @param {string} html - HTML markup to render.
 * @returns {Element} The first rendered element.
 * @throws {TypeError} If html is not a string.
 * @throws {Error} If the markup does not produce an element.
 */
export const render = (html) => {
	if (typeof html !== "string") {
		throw new TypeError(
			"render() expects an HTML string."
		);
	}

	const fixture = getFixture();

	fixture.innerHTML = html.trim();

	const element = fixture.firstElementChild;

	if (!element) {
		throw new Error(
			"render() did not produce a DOM element."
		);
	}

	return element;
};


/**
 * Dispatches an event from the supplied element.
 *
 * Standard Event instances are created by default. If the options object
 * contains a detail property, a CustomEvent is created instead.
 *
 * Events bubble and are cancelable unless explicitly overridden.
 *
 * @param {EventTarget} element - Element or object that will dispatch the event.
 * @param {string} eventName - Name of the event to dispatch.
 * @param {Object} [options={}] - Event configuration options.
 * @returns {Event} The dispatched event.
 * @throws {TypeError} If the supplied element cannot dispatch events.
 */
export const trigger = (
	element,
	eventName,
	options = {}
) => {
	if (
		!element ||
		typeof element.dispatchEvent !== "function"
	) {
		throw new TypeError(
			"trigger() expects an EventTarget."
		);
	}

	const eventOptions = {
		bubbles: true,
		cancelable: true,
		...options
	};

	const event =
		"detail" in options
			? new CustomEvent(
				eventName,
				eventOptions
			)
			: new Event(
				eventName,
				eventOptions
			);

	element.dispatchEvent(event);

	return event;
};


/**
 * Simulates a user click on an element.
 *
 * Uses the element's native click() method so normal browser click behavior
 * is preserved.
 *
 * @template {HTMLElement} T
 * @param {T} element - Element to click.
 * @returns {T} The clicked element.
 * @throws {TypeError} If the supplied element does not support click().
 */
export const click = (element) => {
	if (
		!element ||
		typeof element.click !== "function"
	) {
		throw new TypeError(
			"click() expects an element with a click() method."
		);
	}

	element.click();

	return element;
};


/**
 * Sets an element's value and dispatches an input event.
 *
 * This simulates the behavior commonly produced while a user is typing
 * into a form control.
 *
 * @template {HTMLElement} T
 * @param {T} element - Form control whose value should be updated.
 * @param {*} value - Value to assign to the element.
 * @returns {T} The updated element.
 */
export const input = (
	element,
	value
) => {
	element.value = value;

	trigger(
		element,
		"input"
	);

	return element;
};


/**
 * Sets an element's value and dispatches a change event.
 *
 * This simulates committing a changed value on a form control.
 *
 * @template {HTMLElement} T
 * @param {T} element - Form control whose value should be updated.
 * @param {*} value - Value to assign to the element.
 * @returns {T} The updated element.
 */
export const change = (
	element,
	value
) => {
	element.value = value;

	trigger(
		element,
		"change"
	);

	return element;
};


/**
 * Submits a form using its native requestSubmit() behavior.
 *
 * requestSubmit() is preferred over submit() because it performs normal
 * constraint validation and dispatches the form's submit event.
 *
 * @param {HTMLFormElement} form - Form to submit.
 * @returns {HTMLFormElement} The submitted form.
 * @throws {TypeError} If the supplied value does not support requestSubmit().
 */
export const submit = (form) => {
	if (
		!form ||
		typeof form.requestSubmit !== "function"
	) {
		throw new TypeError(
			"submit() expects a form with a requestSubmit() method."
		);
	}

	form.requestSubmit();

	return form;
};
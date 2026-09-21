const TestOutcomes = {
	pass: "pass",
	error: "error",
	suite: "suite",
	summary: "summary",
	info: "info"
}

const suites = [];

let currentSuite = null;

/**
 * Defines a named collection of related tests.
 *
 * Tests and lifecycle callbacks declared within the callback are
 * registered with this suite.
 *
 * @param {string} name - Human-readable name for the test suite.
 * @param {Function} callback - Function used to define the suite's tests.
 * @returns {void}
 */
export const describe = (name, callback) => {
	const suite = {
		name,
		tests: [],
		beforeEachCallbacks: [],
		afterEachCallbacks: []
	};

	suites.push(suite);

	const previousSuite = currentSuite;

	currentSuite = suite;

	try {
		callback();
	} finally {
		currentSuite = previousSuite;
	}
};


/**
 * Registers an individual test within the current test suite.
 *
 * The callback may be synchronous or asynchronous.
 *
 * @param {string} name - Human-readable description of the expected behavior.
 * @param {Function} callback - Function containing the test logic.
 * @returns {void}
 * @throws {Error} If called outside of a describe() block.
 */
export const test = (name, callback) => {
	if (!currentSuite) {
		throw new Error(`test("${name}") must be inside describe().`);
	}

	currentSuite.tests.push({ name, callback });
};


/**
 * Registers a callback to run before each test in the current suite.
 *
 * The callback may be synchronous or asynchronous.
 *
 * @param {Function} callback - Setup function to run before each test.
 * @returns {void}
 * @throws {Error} If called outside of a describe() block.
 */
export const beforeEach = (callback) => {
	if (!currentSuite) {
		throw new Error("beforeEach() must be inside describe().");
	}

	currentSuite.beforeEachCallbacks.push(callback);
};


/**
 * Registers a callback to run after each test in the current suite.
 *
 * The callback may be synchronous or asynchronous.
 *
 * @param {Function} callback - Cleanup function to run after each test.
 * @returns {void}
 * @throws {Error} If called outside of a describe() block.
 */
export const afterEach = (callback) => {
	if (!currentSuite) {
		throw new Error("afterEach() must be inside describe().");
	}

	currentSuite.afterEachCallbacks.push(callback);
};


/**
 * Creates assertion matchers for a value.
 *
 * Matchers are also exposed through the `not` property to perform
 * negated assertions.
 *
 * @param {*} actual - The value being tested.
 * @returns {Object} Assertion matchers for the supplied value.
 */
export const expect = (actual) => {
	return {
		...createMatchers(actual),
		not: createMatchers(actual, true)
	};
};


/**
 * Executes all registered test suites and reports their results.
 *
 * beforeEach() callbacks run before each test and afterEach() callbacks
 * run afterward, regardless of whether the test succeeds or fails.
 *
 * @returns {Promise<Object>} Test result totals.
 */
export const runTests = async () => {
	let passed = 0;
	let failed = 0;

	console.group("Test Results");

	for (const suite of suites) {
		createHtmlMessage(suite.name, TestOutcomes.suite);

		for (const currentTest of suite.tests) {
			let testError = null;

			try {
				for (const callback of suite.beforeEachCallbacks) {
					await callback();
				}

				await currentTest.callback();
			} catch (error) {
				testError = error;
			} finally {
				for (const callback of suite.afterEachCallbacks) {
					try {
						await callback();
					} catch (error) {
						if (!testError) {
							testError = error;
						} else {
							createHtmlMessage(
								`Additional afterEach() error in "${currentTest.name}":`,
								TestOutcomes.error
							);
						}
					}
				}
			}

			if (testError) {
				createHtmlMessage(`✗ ${currentTest.name}`, TestOutcomes.error);
				createHtmlMessage(testError, TestOutcomes.error);

				failed++;
			} else {
				createHtmlMessage(`✓ ${currentTest.name}`, TestOutcomes.pass);

				passed++;
			}
		}

		console.groupEnd();
	}

	console.groupEnd();

	const total = passed + failed;

	createHtmlMessage(`${passed} passed, ${failed} failed, ${total} total`, TestOutcomes.summary);

	return {
		passed,
		failed,
		total
	};
};


/**
 * Creates the assertion matchers used by expect().
 *
 * When negated is true, each assertion succeeds only when its normal
 * condition is false.
 *
 * @param {*} actual - The value being tested.
 * @param {boolean} [negated=false] - Whether the assertions should be inverted.
 * @returns {Object} Assertion matcher methods.
 */
const createMatchers = (actual, negated = false) => {
	/**
	 * Evaluates an assertion result and throws an error when it fails.
	 *
	 * @param {boolean} result - Result of the assertion condition.
	 * @param {string} positiveMessage - Error message for a normal assertion.
	 * @param {string} negativeMessage - Error message for a negated assertion.
	 * @returns {void}
	 * @throws {Error} When the assertion fails.
	 */
	const check = (result, positiveMessage, negativeMessage) => {
		const failed = negated
			? result
			: !result;

		if (failed) {
			throw new Error(negated ? negativeMessage : positiveMessage);
		}
	};

	return {
		/**
		 * Asserts strict equality using the === operator.
		 *
		 * @param {*} expected - Expected value.
		 * @returns {void}
		 */
		toBe(expected) {
			check(
				actual === expected,
				`Expected ${format(actual)} to be ${format(expected)}.`,
				`Expected ${format(actual)} not to be ${format(expected)}.`
			);
		},

		/**
		 * Asserts that the actual value is null.
		 *
		 * @returns {void}
		 */
		toBeNull() {
			check(
				actual === null,
				`Expected ${format(actual)} to be null.`,
				"Expected value not to be null."
			);
		},

		/**
		 * Asserts that the actual value is undefined.
		 *
		 * @returns {void}
		 */
		toBeUndefined() {
			check(
				actual === undefined,
				`Expected ${format(actual)} to be undefined.`,
				"Expected value not to be undefined."
			);
		},

		/**
		 * Asserts that the actual value is not undefined.
		 *
		 * @returns {void}
		 */
		toBeDefined() {
			check(
				actual !== undefined,
				"Expected value to be defined.",
				`Expected ${format(actual)} to be undefined.`
			);
		},

		/**
		 * Asserts that the actual value is truthy.
		 *
		 * @returns {void}
		 */
		toBeTruthy() {
			check(
				Boolean(actual),
				`Expected ${format(actual)} to be truthy.`,
				`Expected ${format(actual)} to be falsy.`
			);
		},

		/**
		 * Asserts that the actual value is falsy.
		 *
		 * @returns {void}
		 */
		toBeFalsy() {
			check(
				!actual,
				`Expected ${format(actual)} to be falsy.`,
				`Expected ${format(actual)} to be truthy.`
			);
		},

		/**
		 * Asserts that a string or array contains the expected value.
		 *
		 * @param {*} expected - Value expected to be contained.
		 * @returns {void}
		 */
		toContain(expected) {
			const supportsIncludes =
				actual !== null &&
				actual !== undefined &&
				typeof actual.includes === "function";

			const contains =
				supportsIncludes &&
				actual.includes(expected);

			check(
				contains,
				`Expected ${format(actual)} to contain ${format(expected)}.`,
				`Expected ${format(actual)} not to contain ${format(expected)}.`
			);
		},

		/**
		 * Asserts that a DOM element contains a specified attribute.
		 *
		 * If expectedValue is provided, the attribute value must also match.
		 *
		 * @param {string} name - Attribute name.
		 * @param {*} [expectedValue] - Optional expected attribute value.
		 * @returns {void}
		 */
		toHaveAttribute(name, expectedValue = undefined) {
			const isElement =
				typeof Element !== "undefined" &&
				actual instanceof Element;

			if (!isElement) {
				throw new Error(
					"toHaveAttribute() expects a DOM Element."
				);
			}

			const hasAttribute = actual.hasAttribute(name);

			if (expectedValue === undefined) {
				check(
					hasAttribute,
					`Expected ${format(actual)} to have attribute "${name}".`,
					`Expected ${format(actual)} not to have attribute "${name}".`
				);

				return;
			}

			const actualValue = actual.getAttribute(name);
			const matches = hasAttribute && actualValue === String(expectedValue);

			check(
				matches,
				`Expected attribute "${name}" to be ${format(String(expectedValue))}, but received ${format(actualValue)}.`,
				`Expected attribute "${name}" not to be ${format(String(expectedValue))}.`
			);
		}
	};
};


/**
 * Converts a value into a readable representation for assertion messages.
 *
 * Strings are quoted, DOM elements are represented by their HTML,
 * and other values are serialized to JSON when possible.
 *
 * @param {*} value - Value to format.
 * @returns {string} Human-readable representation of the value.
 */
const format = (value) => {
	if (typeof value === "string") {
		return `"${value}"`;
	}

	if (typeof Element !== "undefined" && value instanceof Element) {
		return value.outerHTML;
	}

	try {
		const serialized = JSON.stringify(value);
		return serialized ?? String(value);
	} catch {
		return String(value);
	}
};

/**
 * Internal method used to print test results to the DOM.
 * Also logs the results in the console.
 * @param {*} message
 * @param {*} type
 * @returns
 */
const createHtmlMessage = (message, type = TestOutcomes.info) => {
	if (type === TestOutcomes.error) {
		console.error(message);
	} else {
		console.log(message);
	}

	const output = document.getElementById("test-results");
	if (!output)
		return;

	let elem = document.createElement("div");

	switch (type) {
		case TestOutcomes.pass:
			elem.classList.add("test-pass");
			break;

		case(TestOutcomes.error):
			elem.classList.add("test-fail");
			break;

		case(TestOutcomes.suite):
			elem = document.createElement("h2");
			elem.classList.add("test-suite");
			break;

		case(TestOutcomes.summary):
			elem.classList.add("test-summary");
			break;

		default:
			elem.classList.add("test-info");
	}

	elem.textContent = message;
	output.appendChild(elem);
};
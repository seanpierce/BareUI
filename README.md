# Bare UI

Bare UI is a lightweight, dependency-free component library built with vanilla JavaScript and native Web Components.

The goal of Bare UI is to provide a small, reusable foundation for building application interfaces without introducing a frontend framework or runtime dependencies. It relies on browser-native features such as Custom Elements, Shadow DOM, and form-associated custom elements while providing a small amount of structure around component rendering, properties, lifecycle hooks, and form integration.

## Goals

Bare UI is intended to keep frontend development simple and close to the web platform.

The library aims to:

- Use native browser APIs wherever possible.
- Avoid frontend framework and runtime dependencies.
- Keep components small, reusable, and self-contained.
- Provide consistent patterns for defining and rendering components.
- Encapsulate component styles with Shadow DOM.
- Work naturally with standard HTML forms.
- Provide first-class support for server-rendered applications such as Django.
- Remain understandable without requiring knowledge of a large framework or build system.

Bare UI is not intended to replace the browser with another abstraction layer. Instead, it provides a small amount of structure around functionality the browser already provides.

## Core Architecture

Bare UI is built around two primary base classes.

### `BaseComponent`

`BaseComponent` provides the foundation for general-purpose components.

It handles common functionality including:

- Shadow DOM creation
- Attribute observation
- Typed component properties
- Attribute-to-property mapping
- HTML and CSS templates
- Component rendering
- Re-rendering when observed attributes change
- Component lifecycle hooks

Components extend `BaseComponent` and define only the properties, markup, styles, and behavior they require.

A simple component might look like:

```js
import BaseComponent from "../lib/BaseComponent.js";

const css = () => /*css*/`
	.message {
		font-weight: 600;
	}
`;

const html = ({
	message = ""
}) => /*html*/`
	<div class="message">
		${message}
	</div>
`;

class MessageBox extends BaseComponent {
	static {
		this.defineProps({
			message: String
		});

		this.css = css;
		this.html = html;
	}
}

customElements.define(
	"message-box",
	MessageBox
);
```

It can then be used as normal HTML:

```html
<message-box message="Hello world!"></message-box>
```

### `FormComponent`

`FormComponent` extends `BaseComponent` and provides a foundation for components that participate in native HTML forms.

It uses the browser's `ElementInternals` API to allow custom elements to behave like standard form controls.

This allows components such as:

```html
<text-input
	name="username"
	label="Username"
	required>
</text-input>

<password-input
	name="password"
	label="Password"
	required>
</password-input>
```

to participate in forms much like native `<input>` elements.

For example:

```html
<form method="post">
	<text-input
		name="username"
		label="Username">
	</text-input>

	<password-input
		name="password"
		label="Password">
	</password-input>

	<form-button type="submit">
		Sign In
	</form-button>
</form>
```

The resulting values are available through standard browser mechanisms such as `FormData` and normal form submission.

This is particularly useful for server-rendered applications because custom UI controls can still participate in traditional form POST requests without requiring a client-side application framework.

## Component Properties

Components explicitly define the attributes they support using `defineProps()`.

```js
static {
	this.defineProps({
		name: String,
		label: String,
		maxlength: Number,
		required: Boolean,
		disabled: Boolean
	});
}
```

Bare UI converts those attributes into typed values available through the component's `props` object.

For example:

```html
<text-input
	name="username"
	maxlength="30"
	required>
</text-input>
```

provides values similar to:

```js
this.props.name
// "username"

this.props.maxlength
// 30

this.props.required
// true
```

Each component explicitly declares the properties it supports rather than inheriting a large collection of properties it may not need.

## Component Lifecycle

Bare UI provides two primary lifecycle hooks for component-specific behavior.

### `onRender()`

`onRender()` runs after the component's Shadow DOM has been rendered.

Because attribute changes can cause a component to re-render, this is the appropriate place to establish behavior that depends on elements inside the Shadow DOM.

```js
onRender() {
	this.setInputEvents();
}
```

### `onMount()`

`onMount()` runs after the component is initially connected to the document.

It is intended for behavior that only needs to occur once when the component is first mounted.

## Styling

Component styles are defined alongside the component and rendered inside its Shadow DOM.

```js
const css = () => /*css*/`
	.button {
		padding: 0.5rem 1rem;
		border-radius: var(--border-radius);
	}
`;
```

Shadow DOM keeps component-specific styles isolated while CSS custom properties can still be used to provide application-level theming.

This allows the application to define shared design tokens while components retain control over their internal structure.

## Browser-Native by Design

Bare UI intentionally relies on modern browser functionality rather than recreating it in JavaScript.

Some of the APIs used by the library include:

- Custom Elements
- Shadow DOM
- `ElementInternals`
- Form-associated custom elements
- `ValidityState`
- `FormData`
- Native DOM events

Using browser-native functionality keeps the library small and allows components to behave similarly to standard HTML elements.

## Testing

Bare UI includes a small browser-native testing system designed specifically for its components.

Tests execute against real browser APIs rather than a simulated DOM. This is important because Bare UI relies heavily on features such as Shadow DOM, Custom Elements, `ElementInternals`, native form validation, and form-associated custom elements.

The testing utilities provide basic functionality for:

- Organizing test suites
- Assertions
- Test setup and teardown
- Creating disposable DOM fixtures
- Rendering components
- Simulating common user interactions
- Testing native form behavior

Tests generally favor observable behavior over internal implementation details.

For example, rather than only verifying that a component called `setFormValue()`, a test can verify that the value actually appears in native `FormData`:

```js
const formData = new FormData(form);

expect(
	formData.get("username")
).toBe("Sean");
```

This helps ensure that components behave correctly from the perspective of both the browser and the server receiving the submitted form.

## Dependencies

Bare UI has no frontend runtime dependencies.

It does not require a client-side framework such as React, Vue, or Angular, and the component architecture itself does not depend on third-party JavaScript packages.

The intention is to keep the library portable, transparent, and inexpensive to maintain.

## Browser Support

Bare UI targets modern browsers with support for the Web Component APIs used by the library.

Because form components rely on features such as `ElementInternals` and form-associated custom elements, browser support for those APIs should be considered when determining application compatibility requirements.

## Project Philosophy

Bare UI follows a few simple principles:

**Use the platform.**  
Prefer native browser functionality over custom implementations when the browser already provides the required behavior.

**Keep abstractions small.**  
Shared functionality belongs in the base component classes, but individual components should remain explicit about the behavior and properties they support.

**Favor HTML semantics.**  
Custom components should behave as closely as practical to the native elements they represent.

**Test behavior, not implementation.**  
Tests should verify what users, forms, and the browser actually observe rather than unnecessarily coupling tests to internal implementation details.

**Add complexity only when it earns its place.**  
New abstractions and dependencies should solve a concrete problem rather than being introduced preemptively.

## Status

Bare UI is an evolving internal component library. Its APIs and conventions may change as additional components are developed and common patterns emerge.

The library intentionally begins with a small foundation. Additional abstractions should be introduced only when repeated component development demonstrates a clear need for them.
# Frontend

This project was scaffolded using Vite, and has the following key features:

- React 18
- TypeScript, for static type checking
- ESLint, for code quality
- Prettier, for code formatting

## Requirements

- [Bun](https://bun.sh/)

## Commands

| Command           | Description                                       |
| ----------------- | ------------------------------------------------- |
| `bun install`     | Install packages                                  |
| `bun run dev`     | Start local dev server with hot-reloading         |
| `bun run build`   | Build production version of app                   |
| `bun run preview` | Serve built version of app (must run build first) |
| `bun run lint`    | Fix linting and formatting                        |
| `bun run test`    | Run tests                                         |

## Usage

See the "testbed" page for an overview of what formatting/elements/components/etc. you can use and how.

## Background

- **[HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference)**.
  Static markup that defines the "content" of a page/document.
  Consists of nested [tags](https://developer.mozilla.org/en-US/docs/Web/HTML/Element) with [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes) that become the [DOM](https://developer.mozilla.org/en-US/docs/Glossary/DOM).

- **[CSS](https://developer.mozilla.org/en-US/docs/Web/css/Reference)**.
  [Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors) and [styles](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference) that determine how the content of your page looks and is laid out.
  [Modules](https://vitejs.dev/guide/features.html#css-modules) should be used to keep styles scoped to a particular file and avoid selector name collisions.

- **[JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)**.
  A dynamic, loosely-typed, general-purpose language that runs in a browser when a user visits a page.
  It can dynamically manipulate the document/styles, make network requests, and interact with the browser in [a multitude of other ways](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs).

_These 👆 are the only things that a browser can natively understand_ (and assets like images, videos, etc.).
Anything else 👇 is abstraction or convenience built on top of them, and must first go through a "compilation"/"build" step to transform it into one of the three core things.

- **[React](https://react.dev/learn)**.
  A widely popular and plugin-rich JavaScript library that makes it easier to generate HTML on the page, keep it in sync with data, handle events, and more.
  In general, it makes code more readable, robust, and re-usable.
  The [JSX](https://react.dev/learn/writing-markup-with-jsx) syntax is used to write dynamic content in a more declarative, clear way.
  Pieces of content are split into cleanly separated "components".
  A component is a generic term for any function that returns HTML to be generated, and it can range from low level (e.g. button, select dropdown, table) to high-level (e.g. tab group, section, page).

- **[TypeScript](https://en.wikipedia.org/wiki/TypeScript)**.
  A superset of JavaScript that makes it strongly, statically typed so you can catch errors before even running the code.
  Adds some additional overhead/complexity, but is especially essential for apps dealing with complex data structures.

- **[Vite](https://vitejs.dev/)**.
  A multi-purpose tool that handles coordination of the various other technologies.
  Most notably, it handles running the app locally for development (with fast automatic refresh), transpiling TypeScript into plain JavaScript, and "compiling" the app into a production/browser-ready bundle.

- **[Node](https://nodejs.org/en/)**.
  An environment for running JavaScript locally instead of in a browser.
  Has APIs that browsers cannot have, such as filesystem access, and lacks some of the APIs browsers do have, such as functions to manipulate the DOM (there is no DOM or browser).
  That is, not all Node code can run in the browser, and vice-versa.
  Vite and other packages that do things locally are ultimately intended to run on top of this.

- **[Bun](https://bun.sh/)**.
  A very new tool that aims to be an all-in-one replacement for Node, Yarn, Vite, and many other tools.
  Since it is so new, in this project will only use it as a runtime (replacement for Node) and package manager (replacement for Yarn).
  If you encounter issues, install [Node](https://nodejs.org/en) (`v18` or later) and try running the above commands with `npm` instead of `bun`.
  Do not use functionality that is Bun-only (not "backwards-compatible" with Node).

- **[ESLint](https://eslint.org/)**.
  A tool that checks JavaScript code for common pitfalls, mostly focused on things that _affect functionality_ rather than code aesthetics.

- **[Prettier](https://prettier.io/)**.
  A tool that formats JavaScript code to make it look pretty.
  Useful for enforcing consistency, avoiding bike-shedding, and writing code more quickly without worrying about formatting.
  _Only affects code aesthetics_, and should not affect functionality.

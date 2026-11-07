# Code Comments

Default to writing no comments. Make code clear through naming and structure first.

## Only comment when the code can't explain itself

- Complex logic or a non-obvious algorithm
- Why a surprising decision was made, including a constraint or trade-off
- A workaround for a bug or a limitation in another library, with a link when one exists
- A hidden requirement, such as a required call order or a performance or security constraint
- Tool directives, such as `@ts-expect-error` or lint overrides, with the reason

Explain why, not what. Keep it as short as the explanation allows.

## Never add

- Comments that restate the code, or describe what a well-named function or variable already says
- Section banners or dividers, such as `// Helpers`
- JSDoc or docstrings that only repeat the name and types
- Notes about the current change, such as `// added X` or `// fixed bug`
- Commented-out code
- `TODO` comments, unless the user asked for one or it links to a tracked issue

## Editing existing code

- Don't add comments to code you didn't change
- Don't remove existing comments unless they are wrong or the user asked for a cleanup
- Update or remove a comment when your change makes it inaccurate

Public API documentation is fine when the project already uses it, or when the user asks for it.

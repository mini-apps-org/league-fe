---
paths:
  - '**/*.{ts,tsx}'
---

# TypeScript Coding Rules

When writing, modifying, or refactoring TypeScript code, follow these rules strictly.

## 1. Use a block body and an explicit `return`

Every function, arrow function, async function, React component, hook, and event handler must use a `{}` body and an explicit `return` when it returns a value.

The **only** exception is described in Rule 2.

Prefer:

```ts
const getUserName = (user: User): string => {
  return user.name;
};
```

Avoid:

```ts
const getUserName = (user: User): string => user.name;
```

## 2. Exception: one-line callbacks for array methods

A callback passed **directly** to one of these array methods may use a one-line implicit return:

- `map`, `flatMap`
- `filter`
- `find`, `findIndex`, `findLast`, `findLastIndex`
- `some`, `every`
- `reduce`, `reduceRight`
- `sort`, `toSorted`

The exception applies only when **all** of these are true:

1. The callback is a single expression that fits on one line.
2. The expression has no side effects (no mutation, logging, or API calls).
3. The expression has no nested ternary and no nested function that is itself a non-array-method callback.

Allowed:

```ts
const names = users.map((user) => user.name);

const activeUsers = users.filter((user) => user.isActive);

const admin = users.find((user) => user.role === 'admin');

const hasMinor = users.some((user) => user.age < 18);

const totalAge = users.reduce((sum, user) => sum + user.age, 0);

const byAge = [...users].sort((a, b) => a.age - b.age);
```

Use a block body when the callback grows beyond one simple expression:

```ts
const labels = users.map((user) => {
  const prefix = user.isActive ? 'Active' : 'Inactive';

  return `${prefix}: ${user.name}`;
});

const usersById = users.reduce<Record<string, User>>((acc, user) => {
  acc[user.id] = user;

  return acc;
}, {});
```

## 3. Callbacks that are NOT covered by the exception

These must always use a block body:

- `forEach` (it returns nothing, so there is no value to return implicitly)
- Promise callbacks (`then`, `catch`, `finally`)
- React event handlers (`onClick`, `onChange`, ...)
- `setTimeout`, `setInterval`, and other non-array callbacks
- Functions returned from a callback

Prefer:

```ts
users.forEach((user) => {
  console.log(user.name);
});

fetchUser(id).then((user) => {
  return user.name;
});

<button
  onClick={() => {
    handleSave();
  }}
>
  Save
</button>
```

Avoid:

```ts
users.forEach((user) => console.log(user.name));

fetchUser(id).then((user) => user.name);

<button onClick={() => handleSave()}>Save</button>
```

## 4. Do not optimize for fewer lines

Outside the array-method exception, do not compress logic to save lines.

Prefer:

```ts
const user = users.find((item) => item.id === userId);

if (!user) {
  return null;
}

return {
  id: user.id,
  name: user.name,
};
```

Avoid:

```ts
return users.find((item) => item.id === userId) ?? null;
```

## 5. Apply the rules consistently

These rules apply to all TypeScript and TSX code, including:

- Functions and arrow functions
- Async functions
- Promise callbacks
- Array callbacks
- React components and hooks
- Event handlers
- Utility functions

## 6. Enforcement (ESLint)

Enforced by the first `no-restricted-syntax` selector in `eslint.config.mjs`. The linter allows
any expression-bodied callback for the listed array methods; Rule 2's "one line, no side effects"
conditions are checked during code review.

---
title: "Session"
description: "Reference docs for the session property of Keystone’s system configuration object."
---

The `session` property of the [system configuration](./config) object allows you to configure session management of your Keystone system.
It has a TypeScript type of `SessionStrategy<any>`.
In general you will use `SessionStrategy` objects from the `@keystone-6/auth/session` package, rather than writing this yourself.

```typescript
import { config } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/auth/session';

export default config({
  session: statelessSessions({
    secret: 'ABCDEFGH1234567887654321HGFEDCBA',
    ironOptions: { /* ... */ },
    maxAge: 60 * 60 * 24,
    secure: true,
    path: '/',
    domain: 'localhost',
    sameSite: 'lax',
  }),
  /* ... */
});
```

## Stateless vs stored sessions

Keystone supports both stateless and stored sessions.
In a stateless session all session data is stored in a cookie.
In a stored session a session ID is stored in the cookie, and this ID is used to save and load data from a data store on the server.
All cookies are encrypted with [`@hapi/iron`](https://hapi.dev/module/iron/).

Both `statelessSessions()` and `storedSessions()` accept a common set of arguments which control the behaviour of the cookies.
`storedSessions()` accepts an additional `store` argument, which is an object capable of loading and storing session data.

```typescript
import { config } from '@keystone-6/core';
import { statelessSessions, storedSessions } from '@keystone-6/auth/session';

export default config({
  // Stateless
  session: statelessSessions({ /* ... */ }),

  // Stored
  session: storedSessions({ store: { /* ... */ }, /* ... */ }),
  /* ... */
});
```

Options

- `secret` (required): The secret used by `@hapi/iron` for encrypting the cookie data. Must be at least 32 characters long.
- `ironOptions`: Additional options to be passed to `Iron.seal()` and `Iron.unseal()` when encrypting and decrypting the cookies.
  See the [`@hapi/iron` docs](https://hapi.dev/module/iron/api/?v=6.0.0#options) for details.
- `maxAge` (default: `60 * 60 * 8` (8 hours)): The number of seconds until the [cookie expires](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie).
- `secure` (default: `process.env.NODE_ENV === 'production`): If `true`, the cookie is only sent to the server when a request is made with the `https:` scheme (except on localhost), and therefore is more resistent to man-in-the-middle attacks.
  **Note:** Do not assume that `secure` prevents all access to sensitive information in cookies (session keys, login details, etc.).
  Cookies with this attribute can still be read/modified with access to the client's hard disk, or from JavaScript if the HttpOnly cookie attribute is not set.
  **Note:** Insecure sites (`http:`) can't set cookies with the `secure` attribute (since Chrome 52 and Firefox 52).
  For Firefox, the `https:` requirements are ignored when the `secure` attribute is set by localhost (since Firefox 75).
- `path` (default: `'/'`): A path that must exist in the requested URL, or the browser won't send the cookie header.
  The forward slash (`/`) character is interpreted as a directory separator, and subdirectories will be matched as well: for `path: '/docs'`, `/docs`, `/docs/Web/`, and `/docs/Web/HTTP` will all match.
- `domain` (default: current document URL): Host to which the cookie will be sent. See [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes) for more details on the `domain` cookie attribute.
  **Note**: Only one domain is allowed. If a domain is specified then subdomains are always included.
- `sameSite` (default: `'lax'`): Controls whether the cookie is sent with cross-origin requests. Can be one of `true`, `false`, `'strict'`, `'lax'` or `'none'`. See [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes) for more details on the `sameSite` cookie attribute.
  **Note**: The `secure` attribute must also be set when `sameSite` is set to `none`!

### Session stores

When using `storedSessions` you need to pass in a session store as the `store` option.
This `store` option must be either a `SessionStore` object, or a function `({ maxAge }) => { ... }` which returns a `SessionStore` object.

A `SessionStore` object has the following interface:

```typescript
const store = {
  set: async (sessionId, data) => { /* ... */ },
  get: async (sessionId) => {
    /* ... */
    return data;
  },
  delete: async (sessionId) => { /* ... */ },
};
```

Interface:

- `set`: Set a value `data` for the key `sessionId`.
- `get`: Get the `data` value associated with `sessionId`.
- `delete`: Delete the entry associated with `sessionId` from the session store.

## Session context

If you configure your Keystone session with session management then the [`KeystoneContext`](../context/overview) type will include the following session related properties.

- `session`: An object representing the session data. The value will depend on the value passed into `context.sessionStrategy.start()`.
- `sessionStrategy`: an object that, when using `statelessSessions` or `storedSessions` from `@keystone-6/core/session` includes the following functions:
  - `get({context})`: a function that returns a `session` object based on `context` - this needs to be a `context` with a valid `req` (using `context.withRequest`). This function is called by Keystone to get the value of `context.session`
  - `start({context, data})`: a function that, given a valid `context.res` starts a new session containing what is passed into `data`.
  - `end({context})`: a function that, given a valid `context.res` ends a session.

The `start` and `end` functions will be used by [authentication mutations](./auth) to start and end authenticated sessions.
These mutations will set the value of `session` to include the values `{ listKey, itemId }`.

## Related resources

{% related-content %}
{% well
heading="Config API Reference"
href="/docs/config/config" %}
The API to configure all the parts parts of your Keystone system.
{% /well %}
{% well
heading="Example Project: Authentication"
href="https://github.com/keystonejs/keystone/tree/main/examples/with-auth"
target="_blank" %}
Adds password-based authentication to the Task Manager starter project.
{% /well %}
{% /related-content %}

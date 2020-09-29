<!--[meta]
section: api
subSection: database-adapters
title: Prisma adapter
[meta]-->

# Prisma database adapter

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/adapter-prisma)

> The Keystone Prisma adapter is not currently production-ready. It depends on the [Prisma Migrate](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-migrate) system which is currently flagged as `EXPERIMENTAL`. Once Prisma Migrate is out of experimental mode, we will release a production-ready version of `@keystonejs/adapter-prisma`.

The [Prisma](https://www.prisma.io/) adapter allows Keystone to connect a database using a Prisma Client, a type-safe and auto-generated database client. You can learn more about Prisma Client in the [Prisma docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client). 

> This adapter currently only supports PostgreSQL databases. Future releases will enable support for all database backends which are [supported by Prisma](https://www.prisma.io/docs/more/supported-databases).

## Usage

```javascript
const { PrismaAdapter } = require('@keystonejs/adapter-prisma');

const keystone = new Keystone({
  adapter: new PrismaAdapter({ url: 'postgres://...' }),
});
```

## Config

### `url`

_**Default:**_ `DATABASE_URL`

The connection string for your database, in the form `postgres://<user>:<password>@<host>:<port>/<dbname>`.
By default it will use the value of the environment variable `DATABASE_URL`. You can learn more about the connection string format used in the [Prisma docs]
(https://www.prisma.io/docs/reference/database-connectors/connection-urls).

### `getPrismaPath`

_**Default:**_ `({ prismaSchema }) => '.prisma'`

A function which returns a directory name for storing the generated Prisma schema and client.

### `getDbSchemaName`

_**Default:**_ `({ prismaSchema }) => 'public'`

A function which returns a database schema name to use for storage of all Keystone tables in your database.

> You can also set the schema name by including the suffix `?schema=...` in your `DATABASE_URL` or `url`. In this case you should set this value to `() => null`.

### `enableLogging`

_**Default:**_ `false`

Enables logging at the [`query`](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#overview) level in the Prisma client.

### `dropDatabase`

_**Default:**_ `false`

Allow the adapter to drop the entire database and recreate the tables / foreign keys based on the list schema in your application. This option is ignored in production, i.e. when the environment variable NODE_ENV === 'production'.

## Setup

Before running Keystone with the Prisma adapter you will need to have a PostgreSQL database to connect to.

If you already have a database then you can use its connection string in the `url` config option.
If you don't have a database already then you can create one locally with the following commands.

```shell allowCopy=false showLanguage=false
createdb -U postgres keystone
psql keystone -U postgres -c "CREATE USER keystone5 PASSWORD 'k3yst0n3'"
psql keystone -U postgres -c "GRANT ALL ON DATABASE keystone TO keystone5;"
```

If using the above, you will want to set a connection string of:

```javascript
const keystone = new Keystone({
  adapter: new PrismaAdapter({ url: `postgres://keystone5:k3yst0n3@localhost:5432/keystone` }),
});
```

See the [adapters setup](/docs/quick-start/adapters.md) guide for more details on how to setup a database.
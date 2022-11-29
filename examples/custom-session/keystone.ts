import { randomBytes } from 'crypto';
import { config, graphql } from '@keystone-6/core';
import { lists } from './schema';
import { Context, TypeInfo } from '.keystone/types';

async function startSession({ id, context }: { id: string; context: Context }) {
  const sudoContext = context.sudo();
  const token = randomBytes(16).toString('hex'); // random 128-bit token

  await sudoContext.db.Session.createOne({
    data: {
      token,
      user: { connect: { id } },
      ended: false,
    },
  });

  return token;
}
async function endSession({ context }: { context: Context }) {
  const sudoContext = context.sudo();
  const token = context.req?.headers?.authorization;
  if (!token) return; // not authenticated

  await sudoContext.db.Session.updateOne({
    where: {
      token,
    },
    data: {
      ended: true,
    },
  });
}

async function getSession({ context }: { context: Context }) {
  const sudoContext = context.sudo();
  const token = context.req?.headers?.authorization;
  if (!token) return; // not authenticated

  const item = await sudoContext.query.Session.findOne({
    where: {
      token,
    },
    query: 'user { id } ended',
  });

  // no session
  if (!item) return;

  const { user, ended } = item;
  if (!user) return; // uh, shouldnt happen

  // is it still active?
  if (ended) return;

  // they have a session
  return {
    id: user.id,
    data: {
      id: user.id,
    },
  };
}

export const extendGraphqlSchema = graphql.extend(base => {
  return {
    mutation: {
      authenticate: graphql.field({
        args: {
          id: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
        }, // parameters
        type: base.object('Session'), // return type
        async resolve(source, { id }, context: Context) {
          const token = await startSession({ id, context });
          console.log({ token });
          return { token };
        },
      }),

      refresh: graphql.field({
        args: {
          id: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
        }, // parameters
        type: base.object('Session'), // return type
        async resolve(source, { id }, context: Context) {
          if (!context.session) return {}; // only authenticated peeps

          const token = await startSession({ id, context });
          return { id, token };
        },
      }),

      deauthenticate: graphql.field({
        args: {
          token: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        }, // parameters
        type: base.object('Session'), // return type
        async resolve(source, args, context: Context) {
          await endSession({ context });
        },
      }),
    },
  };
});

async function insertSeedData(context: Context) {
  const { id } = await context.db.User.createOne({
    data: {
      name: 'Daniel',
    },
  });

  console.error('created user', { id });
}

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',
    async onConnect(context) {
      if (process.argv.includes('--seed-data')) {
        await insertSeedData(context);
      }
    },
  },
  lists,
  getSession,
  extendGraphqlSchema,
});

/* on /api/graphql
query getUsers {
  users {
    id
    name
  }
}

mutation tryAuth {
  authenticate(id: "<YOUR TOKEN>") {
    id
    token
  }
}

mutation tryDeauth {
  deauthenticate(token: "<YOUR TOKEN>") {
    id
  }
}
*/

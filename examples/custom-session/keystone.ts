import { randomBytes } from 'crypto';
import { config, graphql } from '@keystone-6/core';
import type { SessionStrategy } from '@keystone-6/core/src/types/session';
import { Context } from '.keystone/types';
import { lists } from './schema';

type Session = {
  id: string
  data: {
    id: string
  }
};

function mySessionStrategy (): SessionStrategy<Session, {
  id: string
}> {
  return {
    async start({ data: { id }, createContext }) { // TODO: change the return type of this to unknown/T
      const sudoContext = createContext({}).sudo();
      const token = randomBytes(16).toString('hex'); // random 128-bit token

      await sudoContext.db.Session.createOne({
        data: {
          token,
          user: { connect: { id } },
          ended: false
        },
      });

      return token;
    },

    // this populates the session object
    async get({ req, createContext }) {
      const sudoContext = createContext({}).sudo();
      const token = req.headers?.authorization;
      if (!token) return; // not authenticated
      // TODO: hash the token for timing attack

      const item = await sudoContext.query.Session.findOne({
        where: {
          token
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
          id: user.id
        }
      };
    },

    async end({ req, createContext }) {
      const sudoContext = createContext({}).sudo();
      const token = req.headers?.authorization;
      if (!token) return; // not authenticated

      await sudoContext.db.Session.updateOne({
        where: {
          token
        },
        data: {
          ended: true
        },
      });
    },
  };
}

export const extendGraphqlSchema = graphql.extend((base) => {
  return {
    mutation: {
      authenticate: graphql.field({
        args: {
          id: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
        }, // parameters
        type: base.object('Session'), // return type
        async resolve(source, { id }, context) {
          const token = await context.startSession({ id }); // TODO: should be an object
          console.log({ token })
          return {};
        },
      }),

      refresh: graphql.field({
        args: {
          id: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
        }, // parameters
        type: base.object('Session'), // return type
        async resolve(source, { id }, context) {
          if (!context.session) return {}; // only authenticated peeps

          const token = await context.startSession({ id }); // TODO: should be an object
          return { id, token };
        },
      }),

      deauthenticate: graphql.field({
        args: {
          token: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        }, // parameters
        type: base.object('Session'), // return type
        async resolve(source, { token }, context) {
          await context.endSession({ token }); // TODO: should be an object
        },
      }),
    },
  };
});

async function insertSeedData (context: Context) {
  const { id } = await context.db.User.createOne({
    data: {
      name: 'Daniel'
    },
    query: 'id'
  });

  console.error('created user', { id });
}

export default config({
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
  session: mySessionStrategy(),
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

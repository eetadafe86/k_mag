import { config } from '@keystone-6/core';
import { lists } from './src/keystone/schema';
import { withAuth, session } from './src/keystone/auth';
import type { Context } from '.keystone/types';

const demoUsers = [
  {
    email: 'clark@email.com',
    password: 'passw0rd',
    name: 'Clark Kent',
  },
  {
    email: 'bruce@email.com',
    password: 'passw0rd',
    name: 'Bruce Wayne',
  },
  {
    email: 'diana@email.com',
    password: 'passw0rd',
    name: 'Diana Prince',
  },
] as const;

const upsertUser = async ({
  context,
  user,
}: {
  context: Context;
  user: { email: string; password: string; name: string };
}) => {
  const userInDb = await context.db.User.findOne({
    where: { email: user.email },
  });
  if (userInDb) {
    return userInDb;
  }

  return context.db.User.createOne({ data: user });
};

// Next.js deploys need absolute path to sqlite db file
const dbFilePath = `${process.cwd()}/keystone.db`;
export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: `file:${dbFilePath}`,
      onConnect: async (context: Context) => {
        const sudoContext = context.sudo();
        demoUsers.forEach(u => upsertUser({ context: sudoContext, user: u }));
      },
    },
    lists,
    session,
  })
);

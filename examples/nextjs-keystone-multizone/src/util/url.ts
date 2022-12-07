import { NEXT_MODE } from './env';

/*
    In dev builds, Admin UI is a separate Next.js app server by the Keystone server.
    In prod builds, we use multizone approach and redirect Keystone Admin UI to
    and Next.js app to run in a single server.
    check next.config.js to know how this works.
*/
export const ADMIN_UI_URL = NEXT_MODE === 'build' ? '/admin' : 'http://localhost:3000';

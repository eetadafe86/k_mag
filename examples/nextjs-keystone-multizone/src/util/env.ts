//  npm_lifecycle_script = 'keystone build' | 'keystone dev'
const KEYSTONE_SCRIPT = process.env.npm_lifecycle_script;
let keystoneMode: 'dev' | 'build' = 'dev';
if (KEYSTONE_SCRIPT === 'keystone build') {
  keystoneMode = 'build';
}

//  npm_lifecycle_script = 'next build' | 'next dev'
const NEXT_SCRIPT = process.env.npm_lifecycle_script;
let nextMode: 'dev' | 'build' = 'dev';
if (NEXT_SCRIPT === 'keystone build') {
  nextMode = 'build';
}

console.log({ keystoneMode, nextMode });

export const KEYSTONE_MODE = keystoneMode;
export const NEXT_MODE = nextMode;

const fs = require('fs');
const path = require('path');
const paths = require('./paths');

// Make sure that including paths.js after env.js will read .env variables.
delete require.cache[require.resolve('./paths')];

const { NODE_ENV } = process.env;
let { OUTLINE } = process.env;
if (!NODE_ENV) {
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.',
  );
}

const VALID_OUTLINES = {
  a: true,
  bc: true,
  svup: true,
};

if (!VALID_OUTLINES[OUTLINE]) {
  OUTLINE = 'local';
}

console.log(`TRY TO FIND ENV ${OUTLINE}`);

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  `${paths.dotenv}.${NODE_ENV}.${OUTLINE}`,
  `${paths.dotenv}.${NODE_ENV}`,
  // Don't include `.env.local` for `test` environment
  // since normally you expect tests to produce the same
  // results for everyone
  // NODE_ENV !== 'test' && `${paths.dotenv}.local`,
  // paths.dotenv,
].filter(Boolean);
console.log('dotenvFiles', dotenvFiles);
// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.  Variable expansion is supported in .env files.
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv-expand')(
      require('dotenv').config({
        path: dotenvFile,
      }),
    );
  }
});

// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// https://github.com/facebookincubator/create-react-app/issues/253.
// It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
// Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
// Otherwise, we risk importing Node.js core modules into an app instead of Webpack shims.
// https://github.com/facebookincubator/create-react-app/issues/1023#issuecomment-265344421
// We also resolve them to make sure all tools using them work consistently.
const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || '')
  .split(path.delimiter)
  .filter(folder => folder && !path.isAbsolute(folder))
  .map(folder => path.resolve(appDirectory, folder))
  .join(path.delimiter);

// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.
const REACT_APP = /^REACT_APP_/i;

function getClientEnvironment(publicUrl) {
  const raw = Object.keys(process.env)
    .filter(key => REACT_APP.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        APP_VERSION: process.env.APP_VERSION,
        BUILD_TIME: new Date(),
        // Useful for determining whether we’re running in production mode.
        // Most importantly, it switches React into the correct mode.
        NODE_ENV: process.env.NODE_ENV || 'development',
        // Useful for resolving the correct path to static assets in `public`.
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put
        // images into the `src` and `import` them in code to get their paths.
        PUBLIC_URL: publicUrl,
        API_MODE: process.env.API_MODE,
        BASE_URL: process.env.BASE_URL,
        HIDE_CONTRACT_BTN: process.env.HIDE_CONTRACT_BTN === 'true',
        CLIENT_AUTH_HASH: new Buffer(
          `${process.env.BACKEND_USER}:${process.env.BACKEND_PASSWORD}`,
        ).toString('base64'),

        PRIVATE_KEY: process.env.PRIVATE_KEY,

        HRV_TOKEN_ADDRESS: process.env.HRV_TOKEN_ADDRESS,
        USD_TOKEN_ADDRESS: process.env.USD_TOKEN_ADDRESS,
        BTC_TOKEN_ADDRESS: process.env.BTC_TOKEN_ADDRESS,
        DEMETER_CONTRACT_ADDRESS: process.env.DEMETER_CONTRACT_ADDRESS,

        HMY_NODE_URL: process.env.HMY_NODE_URL,
        HMY_EXPLORER_URL: process.env.HMY_EXPLORER_URL,
        GAS_LIMIT: process.env.GAS_LIMIT,
        GAS_PRICE: process.env.GAS_PRICE,

        BACKEND_URL: process.env.BACKEND_URL,
      },
    );
  // Stringify all values so we can feed into Webpack DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
}

module.exports = getClientEnvironment;

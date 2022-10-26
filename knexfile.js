const strapiDatabase = require('./config/database');
const path = require('path');
const { env } = require('@strapi/utils');

const fetchConfiguration = async () => {
  let config = strapiDatabase({ env }).connection;
  if (!config.seeds) {
    config.seeds = {
      directory: path.resolve(path.join(__dirname, 'seeds'))
    }
  }
  return config
}

module.exports = async () => {
  const configuration = await fetchConfiguration();

  if (configuration.client === 'sqlite') {
    configuration.client = 'better-sqlite3';
  }

  return {
    ...configuration,
    migrations: {},
    baseDir: __dirname
  }
};

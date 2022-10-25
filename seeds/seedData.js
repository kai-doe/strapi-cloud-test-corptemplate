/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const fs = require('fs-extra');
const path = require('path');

exports.seed = async function(knex) {
  let tables = []
  // Disables Knex Foreign Key Constraints and fetches table names
  const dbClient = await knex.context.client.config.client;
  if (dbClient === 'sqlite') {
    await knex.raw('PRAGMA foreign_keys = OFF');
    tables = await knex.raw('SELECT name FROM sqlite_master WHERE type="table"');
  } else if (dbclient === 'mysql') {
    // do something
  } else if (dbclient === 'pg') {
    // do something
  }

  // Construct paths and content types
  const baseDir = knex.context.client.config.baseDir;
  const dataPath = path.resolve(path.join(baseDir, 'data', 'knexSeedData'));
  let contentTypes = fs.readdirSync(dataPath);

  // Loop through content types and seed data
  for (let contentType of contentTypes) {
    const contentTypeName = contentType.replace('.json', '');
    const contentTypeData = fs.readJsonSync(path.resolve(dataPath, contentType));
    const data = contentTypeData[contentTypeName]

    // Delete existing data
    console.log(`Deleting ${contentTypeName} data`);
    await knex(contentTypeName).del();

    // Insert new data
    console.log(`Seeding ${contentTypeName} data`);
    try {
      if (data.length > 0) {
        await knex(contentTypeName).insert(data);
      } else {
        console.log(`No data for ${contentTypeName}, skipping...`);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Enables Knex Foreign Key Constraints
  if (dbClient === 'sqlite') {
    await knex.raw('PRAGMA foreign_keys = ON');
  } else if (dbclient === 'mysql') {
    // do something
  } else if (dbclient === 'pg') {
    // do something
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const fs = require('fs-extra');
const path = require('path');

exports.seed = async function(knex) {
  let tables = []

  // Get
  const dbConfig = await knex.context.client.config;
  const dbClient = dbConfig.client;

  // Disables Knex Foreign Key Constraints and fetches table names
  if (dbClient === 'better-sqlite3' || dbClient === 'sqlite') {
    await knex.raw('PRAGMA foreign_keys = OFF');
    tables = await knex.raw('SELECT name FROM sqlite_master where type=\'table\'');
  } else if (dbClient === 'mysql') {
    await knex.raw('SET foreign_key_checks = 0');
    tables = await knex.raw('SELECT table_name FROM information_schema.tables');
  } else if (dbClient === 'postgres') {
    await knex.raw('SET session_replication_role = \'replica\'');
    let data = await knex.raw('SELECT table_name as name FROM information_schema.tables WHERE table_schema = \'public\'');
    tables = data.rows;
  }

  // console.log(tables);

  // Construct paths and content types
  const baseDir = knex.context.client.config.baseDir;
  const dataPath = path.resolve(path.join(baseDir, 'data', 'knexSeedData'));
  let contentTypes = fs.readdirSync(dataPath);

  // Loop through content types and seed data
  for (let contentType of contentTypes) {
    const contentTypeName = contentType.replace('.json', '');
    const contentTypeData = fs.readJsonSync(path.resolve(dataPath, contentType));
    const data = contentTypeData[contentTypeName]

    // Clean up date format
    for (let entry of data) {
      if (entry.created_at) {
        entry.created_at = new Date(entry.created_at).toISOString();
      }
      if (entry.created_at) {
        entry.updated_at = new Date(entry.updated_at).toISOString();
      }
      if (entry.published_at) {
        entry.published_at = new Date(entry.published_at).toISOString();
      }
      if (entry.time) {
        entry.time = new Date(entry.time).toISOString();
      }
    }

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
  if (dbClient === 'better-sqlite3' || dbClient === 'sqlite') {
    await knex.raw('PRAGMA foreign_keys = ON');
  } else if (dbClient === 'mysql') {
    await knex.raw('SET foreign_key_checks = 1');
  } else if (dbClient === 'postgres') {
    await knex.raw('SET session_replication_role = \'origin\'');
  }
};

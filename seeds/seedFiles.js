/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const fs = require('fs-extra');
const path = require('path');

exports.seed = async function(knex) {
  // Get paths
  const baseDir = knex.context.client.config.baseDir;
  const dataPath = path.resolve(path.join(baseDir, 'data', 'uploads'));
  const uploadsPath = path.resolve(path.join(baseDir, 'public', 'uploads'));
  const dataExists = fs.existsSync(dataPath);
  const uploadsExist = fs.existsSync(uploadsPath);

  if (uploadsExist === true) {
    //Delete existing file uploads
    console.log('Deleting file uploads');
    await fs.rm(uploadsPath, { recursive: true, force: true });
  }

  if (dataExists === true) {
    // Copy new file uploads
    console.log('Copying file uploads');
    await fs.copy(dataPath, uploadsPath);
  } else {
    console.log('No file uploads to copy');
    fs.mkdir(uploadsPath);
  }
};

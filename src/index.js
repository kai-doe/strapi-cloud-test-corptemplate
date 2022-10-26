"use strict";

module.exports = {
  async register() {

  },
  async bootstrap() {
    const KnexConfig = require('../knexfile');
    const knex = require('knex')(await KnexConfig());

    async function isFirstRun() {
      const pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: "type",
        name: "setup",
      });
      const initHasRun = await pluginStore.get({ key: "initHasRun" });
      await pluginStore.set({ key: "initHasRun", value: true });
      return !initHasRun;
    }

    const hasRun = await isFirstRun();

    if (hasRun === true && !process.env.DISABLE_MIGRATIONS) {
      try {
        await knex.seed.run();
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("Setup has already run or is disabled");
    }
  },
};

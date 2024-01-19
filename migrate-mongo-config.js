// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const config = {
  mongodb: {
    url: process.env.MONGO_DB_URL,

    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  migrationsDir: 'src/database/migrations',

  changelogCollectionName: 'changelog',

  migrationFileExtension: '.js',

  useFileHash: false,

  moduleSystem: 'commonjs',
};

module.exports = config;

const shell = require('shelljs');

// Get the migration name from the command arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.log('Please provide a migration name');
  process.exit(1);
}

// Run the migrate-mongo create command
shell.exec(`npx migrate-mongo create ${migrationName}`);

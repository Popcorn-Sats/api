## Set up PostgresSQL database (MacOS)

Install postgres

`brew install postgresql`

To start PostgresSQL manually:

`pg_ctl -D /usr/local/var/postgres start`

Or, to start PostgresSQL automatically on login:

`brew services start postgresql`

Log in as postgres

`psql postgres`

Create database

`CREATE DATABASE luca;`

[Read more about using Postgres with Homebrew here](https://dyclassroom.com/howto-mac/how-to-install-postgresql-on-mac-using-homebrew)

## Install Dependencies

Run from the project directory:

`npm install`

Configure the database credentials in `./config/config.json` for the local environment.

Set environment:

`export NODE_ENV=local`

`export NODE_CONFIG_DIR="$(pwd)/config/"`

## Run DB Migrations

`npx sequelize-cli db:migrate`

## Run DB Seeders

`npx sequelize-cli db:seed:all`

## Start server

`npm start`

## Test

Testing with [Jest](https://jestjs.io)

Run `npm run test` to run the entire test suite.

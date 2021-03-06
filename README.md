# Basic Set Up

## Set up PostgresSQL database (MacOS)

Install postgres

`brew install postgresql`

To start PostgresSQL manually:

`pg_ctl -D /usr/local/var/postgres start`

Or, to start PostgresSQL automatically on login:

`brew services start postgresql`

Make sure you have a superuser called `postgres`:

`createuser postgres -s`

Log in as postgres

`psql postgres`

Create database

`CREATE DATABASE popcorn;`

(Optional) You can also create other databases to be used in different environments defined by your config (below). I like to create `popcorndev` and `popcorntest` while I'm at it

[Read more about using Postgres with Homebrew here](https://dyclassroom.com/howto-mac/how-to-install-postgresql-on-mac-using-homebrew)

## Install Dependencies

Run from the project directory:

`npm install`

Configure the database credentials in `./config/config.json` for the local environment. If you're following this guide without changing any database names or setting passwords, then the default options should work. You can also take this time to enter the HOST for your Electrum server (more details below).

Set environment from your terminal:

`export NODE_ENV=production`

`export NODE_CONFIG_DIR="$(pwd)/config/"`

## Run DB Migrations

`npx sequelize-cli db:migrate`

## Run DB Seeders

### Development / testing

`npx sequelize-cli db:seed:all`

### Production

For now, run the same command as for Development above, then delete anything you don't want. A production seed script is coming Soon™

## Add submodule(s)

The Popcorn API relies on the Popcorn fork of the [electrum-client](https://github.com/Popcorn-Sats/electrum-client). This fork allows you to proxy requests through Tor. To install the submodule:

```
git submodule init
git submodule update
```

## Start server

`npm start`

# Tests

Testing with [Jest](https://jestjs.io)

Run `npm run test` to run the entire test suite.

Run a single test: `npm run test -- __tests__/services/bitcoin/getAddressFromXpub.test.js`

Run a single test and watch for changes: `npm run test -- __tests__/services/bitcoin/getAddressFromXpub.test.js --watch`

# Tor

Using the Popcorn fork of the [electrum-client](https://github.com/Popcorn-Sats/electrum-client) (already installed before as a submodule) you can proxy electrum requests through tor to query your self-hosted node (e.g. Umbrel).

On Mac, install tor with homebrew:

```
brew install tor
```

Then run tor locally before running the API:

```
tor
```

In `config.js`, you might initially have something like this for public electrum servers:

```
"ELECTRUM": {
    "HOST": "electrum.hodlister.co",
    "PORT": 50002,
    "TLS_ENABLED": true
  }
```

But to use tor, change it to something like this:

```
"ELECTRUM": {
    "HOST": "yournodeaddress.onion",
    "PORT": 50001,
    "TLS_ENABLED": false
  }
```

It's important that you disable TLS. Tor is already end-to-end encrypted, and actually [TLS can be counter-productive because one of its goals is to de-anonymize the server](https://security.stackexchange.com/questions/75975/is-tls-in-tor-useless#75984).

Then, in `services/electrum.js`, add the tor proxy to the instantiation of ElectrumClient. Go from this:

```
const electrumClient = new ElectrumClient(
  config.ELECTRUM.PORT,
  config.ELECTRUM.HOST,
  config.ELECTRUM.TLS_ENABLED ? 'tls' : 'tcp',
  false,
  electrumCallbacks
)
```

To this:

```
const electrumClient = new ElectrumClient(
  config.ELECTRUM.PORT,
  config.ELECTRUM.HOST,
  config.ELECTRUM.TLS_ENABLED ? 'tls' : 'tcp',
  {
    proxy: {
      host: "127.0.0.1",
      port: 9050,
      type: 5,
    },
  },
  electrumCallbacks
)
```

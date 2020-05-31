__NOTE:__ This project is still a work in progress. You can already check it out if you're curious. The API may change in the future.

# DuckyAPI

API that interacts with the [WildDuck](https://github.com/nodemailer/wildduck) API. Mostly built as a backend to [DuckyPanel](https://github.com/louis-lau/DuckyPanel).


![We need to go deeper](docs/images/deeper.jpg)

## Why?
In WildDuck a user is a single Email Account, using the api as an end-user you can add address aliases to that inbox. You can not add extra email accounts or manage domain level functionality like DKIM. The aim of DuckyAPI is to offer an end-user API that allows complete management of domains and email accounts within those domains.

## How?
DuckyAPI stores its users in MongoDB, this can be the same instance that you're already using for WildDuck. Each user owns a list of domains, granting permission to manage dkim or add/edit email accounts and forwarders under that domain. Each user can be assigned a package, containing quotas and limits for the user. Currently nothing happens when quota is exceeded, this may change in the future.

Like WildDuck, this application does not depend on memory for anything. Users etc are stored in mongodb, queue management is done in redis. This application is stateless.

## Features
See [DuckyPanel features](https://github.com/louis-lau/DuckyPanel/blob/master/README.md#current-features).

## Dependencies
* Node.js
* MongoDB
* Redis
* WildDuck

## Installation
```bash
$ git clone https://github.com/louis-lau/DuckyAPI.git
$ cd DuckyAPI
$ npm install
```

## Configuration
Copy `config/example.env` to `config/production.env` or `config/development.env` depending on your environment. You must change the configuration for the application to start. If you've misconfigured something the application should tell you on start.

## Usage
```bash
$ npm run clean
$ npm run build
$ npm start

# Create your first admin user, admin users are
# only meant for adding and updating users/packages
$ node dist/cli create-admin <username>
# Create an api key for your admin user
$ node dist/cli create-apikey <username> <keyName>

# Add a normal user using the api, be sure to replace
# the access token with the one you just got from create-apikey
curl -X POST "http://localhost:3000/users" \
-H "Authorization: Bearer YOUR-ACCESS-TOKEN-HERE" \
-H "Content-Type: application/json" \
-d '{"username":"johndoe", "password":"supersecret"}'

# Now use the normal user to log in to DuckyPanel,
# or request an access token from the /authentication endpoint
```
👆 Instead of using curl you can also execute these requests from http://localhost:3000/swagger

## API documentation
API documentation with code examples is available on louis-lau.github.io/DuckyAPI.

You can also visit http://localhost:3000/swagger to try the api out live in your browser. Much nice than using curl!

## Integrated DuckyPanel
DuckyApi can serve DuckyPanel on its integrated server. Just run `npm run duckypanel:install` and let it install, this can take a bit of time. Open your configuration and set `SERVE_DUCKYPANEL` to `true`. Then set a custom `BASE_URL` for the api, for example `/api`.

Duckypanel will now be live at http://localhost:3000/, and DuckyApi at http://localhost:3000/api.

#### Updating integrated DuckyPanel
Update DuckyPanel by running `npm run duckypanel:update`.



## Task queue
Any created background tasks and their progress can be viewed on http://localhost:3000/queues with basicauth if you've enabled this in the configuration. Removing a domain or suspending a user will trigger a background task to execute mass changes.
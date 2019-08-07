# DuckyAPI

API that interacts with the [WildDuck](https://github.com/nodemailer/wildduck) API.


![We need to go deeper](docs/images/deeper.jpg)

## Why?
In WildDuck a user is a single Email Account, using the api as an end-user you can add address aliases to that inbox. You can not add extra email accounts or manage domain level functionality like DKIM. The aim of DuckyAPI is to offer an end-user API that allows complete management of domains and email accounts within those domains.

## How?
DuckyAPI stores it users in MongoDB, this can be the same instance that you're already using for WildDuck. Each user owns a list of domains, granting permission to manage dkim or add/edit email accounts under that domain.

Authentication is accomplished using JSON web tokens. For each user a date can be set which invalidates all tokens generated before that date. No sessions are used, this application is stateless.

## Usage/Installation/Features/Contributing
TODO, let's get this thing semi-complete first :grin:.
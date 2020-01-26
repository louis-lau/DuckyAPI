__NOTE:__ This project is still a work in progress. You can already check it out if you're curious, but I can't guarantee it will work out for you. For example, the API endpoint for creating new API users currently isn't protected.

# DuckyAPI

API that interacts with the [WildDuck](https://github.com/nodemailer/wildduck) API. Mostly built as a backend to [DuckyPanel](https://github.com/louis-lau/DuckyPanel).


![We need to go deeper](docs/images/deeper.jpg)

## Why?
In WildDuck a user is a single Email Account, using the api as an end-user you can add address aliases to that inbox. You can not add extra email accounts or manage domain level functionality like DKIM. The aim of DuckyAPI is to offer an end-user API that allows complete management of domains and email accounts within those domains.

## How?
DuckyAPI stores its users in MongoDB, this can be the same instance that you're already using for WildDuck. Each user owns a list of domains, granting permission to manage dkim or add/edit email accounts under that domain.

Authentication is accomplished using JSON web tokens. For each user a date can be set which invalidates all tokens generated before that date. No sessions are used, this application is stateless.

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
Copy `config/example.env` to `config/production.env` or `config/develop.env` depending on your environment. You must change the configuration for the application to start. If you've misconfigured something the application should tell you on start.

## Usage
```bash
$ npm run clean
$ npm run build
$ npm start
```
OR
```bash
$ npm run buildstart
```
After this you can visit http://localhost:3000/swagger for the 
API documentation and try it out live. You can also view any created background tasks and their progress on http://localhost:3000/arena with basicauth if you've enabled this in the configuration.

![Swagger API documentation screenshot](docs/images/swagger.png)

If you want to do something cooler than staring at JSON you can now try configuring [DuckyPanel](https://github.com/louis-lau/DuckyPanel).
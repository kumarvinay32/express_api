# express API

Node Js API Microservice/setup based on NodeJS, express, mysql2, sequelize.
This package will generate a complete setup to start writing API for your application.

## Feature:
###   Auto setup
###   Auto response formating
###   Mysql connection that support mysql1, mysql2 as well as sequelize with pool connection.
###   Custom message on database error. (Configurable)
###   Multilangual response message. (Configurable)
###   Response Logger hook (Configurable)
###   Thread Support (i.e Inbuilt function that allows function to run in a thread with a minor change.)
###   Thread Logging that will help in debug.
###   Prebuilt function library that will help during developing API.
###   File Logging support that allows you to generate log file insted of printing on console.

## Installation

```sh
$ npm i @krvinay/express_api

```

## Documentation : 

### Fresh installation
1. Create a project folder.
2. nevigate to project folder and run below command.
```sh
$ npm init
$ npm i @krvinay/express_api
```

### Installation in existing product.
1. Create/edit .env file to project's root directory.
    src="new source directory" default is `src`
2. Run 
```sh
$ npm i @krvinay/express_api
```
3. Edit route/index.js to use your previous entry routes.

> [!TIP]
> If you put `src="/"` in `.env` then source directory will not get created and package will treate root directory as source directory.

This Package will install all required package and generate a source folder named "src" or mention src in `.env` file with folowing files and directory.

- src
    - activities /** Contains Thread related files and functions */
      - index.js /** Sample thread Function */
    - config /** Configuration Container */
      - appConfig.js /** initial Configuration file */ 
    - helpers /** Function liberary */
      - index.js
    - lang /** Language Container */
      - en.js
      - hi.js
    - logs /** Log files container */
    - models /** Models */
      - datasource /** Table scheama container for sequelize */
      - index.js /** Database connection Mysql/Sequelize
    - routes /** API routing container */
      - index.js /** Initial route file */
- .env
- .gitignore
- .redme.md
- server.js /** this will be your main file */

To start application, you have to run below command.
```sh
$ node server.js
```

> [!NOTE]
> If you already having `server.js` file as your entry point then you need to edit file as mentioned below.

```javascript
require("dotenv").config();
const server = require('express')();
const { json, urlencoded } = require('express');
const default_port = 8080;

server.use(json({ limit: '50mb', extended: true }));
server.use(urlencoded({ limit: '50mb', extended: true }));
server.use(require("@krvinay/express_api"));

server.listen(process.env.PORT || default_port, () => {
    console.log("Server running on port " + (process.env.PORT || default_port));
});
```

# README

# Introduction

This is a prototype on a brainstorming workflow my team worked on in **[DESCI 502](https://www.coursicle.com/umich/courses/DESCI/502/)**. The goal is to impose certain restrictions on the brainstorm activity to prevent **[Design Fixation](https://www.fastcompany.com/3044535/what-is-design-fixation-and-how-can-you-stop-it)** from happening in an interdisciplinary team setting.

TODO: link to report

# Technical Aspect

This application was built using [Node.js](https://nodejs.org/en/) and uses primarily [Express](https://expressjs.com/) and [WebSocket](https://www.npmjs.com/package/ws) to control client view. WebSocket was used because this app is meant to be used in a team brainstorm session where everyone is present, so a way to ensure synchronized views on everyone's devices was needed.

* Client Side
  - **config** `./client.config.js`
  - **code** `./frontend/js`
* Server Side
  - **config** `./server.config.js`
  - **code**
      - `./server-http.js`
      - `./server-ws.js`
      - `./websocket-handlers`

# How to install

Get [Node.js](https://nodejs.org/en/) first, then in the cloned project root, type:
```Bash
$ npm install
```
This will install all dependencies in the folder.

# How to run

At the project root, type:
```Bash
$ npm run start
```
This will compile the `.scss` files, bundle/minimize `.js` files, and start the server on port 80.
At this point, you should be able to type `localhost:80` in your browser to see the login screen.
If you would like to temporarily make this app public, after running `$ npm run start` in one command line instance, open another command line window and run `$ npm run serveo`, this uses [serveo](https://serveo.net/) to create a temporary public address for other people to connect to your device.

# Contributors
|[![](https://github.com/p1ho.png?size=50)](https://github.com/p1ho)
|---|
|[p1ho](https://github.com/p1ho)|

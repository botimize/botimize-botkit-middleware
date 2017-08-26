# botimize-botkit-middleware

[![build status](https://img.shields.io/travis/botimize/botimize-botkit-middleware/master.svg?style=flat-square)](https://travis-ci.org/botimize/botimize-botkit-middleware)
[![npm](https://img.shields.io/npm/v/botimize-botkit-middleware.svg?style=flat-square)](https://www.npmjs.com/package/botimize-botkit-middleware)

This middleware plugin for [Botkit](http://howdy.ai/botkit) allows you to seamlessly integrate [Botimize](http://getbotimize.com) functionalities into your Botkit bot.

### Setup

- Create a free account at [Botimize](http://getbotimize.com) to get an API key.

- Install this middleware plugin with `npm`:

  ```shell
  npm install --save botimize-botkit-middleware
  ```

### Usage

* Use API key to create a new botimize and middleware objects:

  ```javascript
  const botimize = require('botimize')('<YOUR-API-KEY>', 'facebook');
  const botimizeBotkit = require('botimize-botkit-middleware')(botimize);
  ```

* Setup Botkit middleware:

  ```javascript
  const controller = botkit.facebookbot({...});
  controller.middleware.receive.use(botimizeBotkit.receive);
  controller.middleware.send.use(botimizeBotkit.send);
  ```


## botimize-botkit-middleware

This middleware plugin for [Botkit](http://howdy.ai/botkit) allows you to seamlessly integrate [botimize](http://botimize.io) functionalities into your Botkit bot.

### Setup

- Create a free account at [botimize](botimize.io) to get an API key.

- Install botimize SDK with `npm`:

  ```shell
  npm install --save botimize
  ```

- Install this middleware plugin with `npm`:

  ```shell
  npm install --save botimize-botkit-middleware
  ```

### Usage

* Use API key to create a new botimize and middleware objects:

  ```javascript
  const botimize = require('botimize')('<YOUR-API-KEY'>, 'facebook');
  const botimizeBotkit = require('botimize-botkit-middleware')(botimize);
  ```

* Setup Botkit middleware:

  ```javascript
  const controller = botkit.facebookbot({...});
  controller.middleware.receive.use(botimizeBotkit.receive);
  controller.middleware.send.use(botimizeBotkit.send);
  ```

  ​
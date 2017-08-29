class BotkitMiddlewareBase {
  constructor(botimize, options = {}) {
    this.botimize = botimize;
    // In ES5, need to bind this when internal function calling.
    this.receive = this.receive.bind(this);
    this.send = this.send.bind(this);
    this.debug = options.debug || false;
  }

  transferIncoming(bot, message) {
    return message;
  }

  transferOutgoing(bot, message) {
    return message;
  }

  receive(bot, message, next) {
    if (this.debug) {
      console.log('[BotkitMiddlewareBase receive]', bot, message);
    }
    this.botimize.logIncoming(this.transferIncoming(bot, message), {
      parse: 'pure', source: 'botkit',
    });
    next();
  }

  send(bot, message, next) {
    if (this.debug) {
      console.log('[BotkitMiddlewareBase send]', bot, message);
    }
    this.botimize.logOutgoing(this.transferOutgoing(bot, message), {
      parse: 'pure', source: 'botkit',
    });
    next();
  }
}

class Facebook extends BotkitMiddlewareBase {
  transferIncoming(bot, message) {
    let fbMessage = {
      sender: {
        id: message.user,
      },
      timestamp: message.timestamp,
      message: {},
    };

    if (message.text) {
      fbMessage.message.text = message.text;
    }

    if (message.seq) {
      fbMessage.message.seq = message.seq;
    }

    if (message.mid) {
      fbMessage.message.mid = message.mid;
    }

    if (message.sticker_id) {
      fbMessage.message.sticker_id = message.sticker_id;
    }

    if (message.attachments) {
      fbMessage.message.attachments = message.attachments;
    }

    if (message.quick_reply) {
      fbMessage.message.quick_reply = message.quick_reply;
    }

    return {
      object: 'page',
      entry: [
        {
          time: message.timestamp,
          messaging: [
            fbMessage,
          ],
        },
      ],
    };
  }

  transferOutgoing(bot, message) {
    let fbMessage = {
      recipient: {},
      message: {},
    };

    if (typeof message.channel === 'string' &&
      message.channel.match(/\+\d+\(\d\d\d\)\d\d\d\-\d\d\d\d/)) {
      fbMessage.recipient.phone_number = message.channel;
    } else {
      fbMessage.recipient.id = message.channel;
    }

    if (message.text) {
      fbMessage.message.text = message.text;
    }

    if (message.attachment) {
      fbMessage.message.attachment = message.attachment;
    }

    if (message.sticker_id) {
      fbMessage.message.sticker_id = message.sticker_id;
    }

    if (message.quick_replies) {
      fbMessage.message.quick_replies = message.quick_replies;
    }

    fbMessage.accessToken = bot.botkit.config.access_token;

    return fbMessage;
  }
}

class Slack extends BotkitMiddlewareBase {
  addTeamInfo(bot, message) {
    let id = JSON.parse(JSON.stringify(bot.identify));
    let teamInfo = JSON.parse(JSON.stringify(bot.team_info));
    delete id.prefs;
    delete teamInfo.prefs;
    teamInfo.bot = id;

    return {
      team: teamInfo,
      bot: id,
      token: bot.config.token,
      message: message,
    };
  }

  transferIncoming(bot, message) {
    return this.addTeamInfo(bot, message);
  }

  transferOutgoing(bot, message) {
    return this.addTeamInfo(bot, message);
  }

  receive(bot, message, next) {
    if (message.type !== 'reconnect_url') {
      this.track('incoming', this.transferIncoming(bot, message));
    }
    next();
  }
}

export default function botimizeBotkit(botimize, options = {}) {
  if (botimize.platform === 'facebook') {
    return new Facebook(botimize, options);
  } else if (botimize.platform === 'slack') {
    return new Slack(botimize, options);
  } else {
    throw new Error('Invalid platform');
  }
}

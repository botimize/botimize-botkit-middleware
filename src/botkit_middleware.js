import * as fs from 'fs';

export class BotkitMiddlewareBase {

    constructor(botimize, platform = 'botkit') {
        this.botimize = botimize
        this.platform = platform;
        // In ES5, need to bind this when internal function calling.
        this.receive = this.receive.bind(this);
        this.send = this.send.bind(this);
    }

    track(ev, props) {
        let _props = JSON.parse(JSON.stringify(props));
        let record = {
            "direction": ev,
            "platform": this.platform,
            "raw": _props
        };

        fs.writeFile('out/fb_msg.json', JSON.stringify(record) + '\n', {flag: 'a'}, (error) => {
            if (error) {
                console.log(error);
            }
            console.log('Write file done.');
        });

        this.botimize.track(ev, props);
    }

    transferIncoming(bot, message) {
        console.log('transfer incoming message in botimize base.');
        return message;
    }

    transferOutgoing(bot, message) {
        console.log('transfer outgoing message in botimize base.');
        return message;
    }

    receive(bot, message, next) {
        console.log('receive message from middleware.');
        this.track('incoming', this.transferIncoming(bot, message));
        next();
    }

    send(bot, message, next) {
        console.log('send message from middleware.');
        this.track('outgoing', this.transferOutgoing(bot, message));
        next();
    }

}

export class BotkitMiddlewareFacebook extends BotkitMiddlewareBase {

    constructor(botimize) {
        super(botimize, 'facebook')
    }

    transferIncoming(bot, message) {
        console.log('receive message in botimize facebook.');

        let fbMessage = {
            "sender": { "id": message.user },
            "timestamp": message.timestamp,
            "message":{}
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
            "object": "page",
            "entry": [{
                "time": message.timestamp,
                "messaging": [ fbMessage ]
            }]
        };
    }

    transferOutgoing(bot, message) {
        console.log('receive message in botimize facebook.');

        let fbMessage = {
            "recipient": {},
            "message": {}
        };

        if (typeof(message.channel) == 'string' && message.channel.match(/\+\d+\(\d\d\d\)\d\d\d\-\d\d\d\d/)) {
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

        fbMessage.access_token = bot.botkit.config.access_token;

        return fbMessage;
    }

}

export class BotkitMiddlewareSlack extends BotkitMiddlewareBase {
    constructor(botimize) {
        super(botimize, 'slack');
    }

    addTeamInfo(bot, message) {
        let id = JSON.parse(JSON.stringify(bot.identify));
        let teamInfo = JSON.parse(JSON.stringify(bot.team_info));
        delete id.prefs;
        delete teamInfo.prefs;
        teamInfo.bot = id;

        return {
            "team": teamInfo,
            "bot": id,
            "token": bot.config.token,
            "message": message
        };
    }

    transferIncoming(bot, message) {
        return addTeamInfo(bot, message);
    }

    transferOutgoing(bot, message) {
        return addTeamInfo(bot, message);
    }

    receive(bot, message, next) {
        if (message.type !== 'reconnect_url') {
            this.track('incoming', this.transferIncoming(bot, message));
        }
        next();
    }
}


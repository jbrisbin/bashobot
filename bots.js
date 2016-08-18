if (!process.env.slack_token || !process.env.travis_token) {
  console.log('Error: Specify slack_token and travis_token in environment');
  process.exit(1);
}

var os = require('os');
var fs = require('fs');
var botkit = require('botkit');
var mustache = require('mustache');
var http = require('https');

var controller = botkit.slackbot({
  debug: true
});

var bot = controller.spawn({ token: process.env.slack_token }).startRTM();

var callbacks = {
  "help": function(bot, message, cmd) {
    fs.readFile('templates/help.md', function(err, f) {
      if(err) throw err;
      var help = {
        "attachments": [
          {
            "pretext": "An automaton that can perform actions on your behalf",
            "text": mustache.render(f.toString(), message),
            "mrkdwn_in": ["text", "pretext", "fields"]
          }
        ]
      };
      bot.reply(message, help);
    });
  },
  "travisci:build": function(bot, message, cmd) {
    var branch = cmd.length == 3 ? cmd[2] : false;
    var replyMsg = "Triggered build for " + cmd[1];
    if(branch) {
      replyMsg += " and branch " + branch;
    }
    if(message.subtype == "file_share") {
      replyMsg += " using overrides found in " + message.file.permalink
    }

    var opts = {
      "host": "api.travis-ci.org",
      "path": "/repo/" + encodeURIComponent(cmd[1]) + "/requests",
      "method": "POST",
      "headers": {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Travis-API-Version": "3",
        "Authorization": "token " + process.env.travis_token
      }
    };
    var req = http.request(opts, function(resp) {
      var str = ''
      resp.on('data', function(chunk) { str += chunk; });
      resp.on('end', function() {
        if(resp.statusCode != 202) {
          bot.reply(message, {
            "attachments": [
              {
                "color": "danger",
                "text": "Failed to trigger build for " + cmd[1] + " with error: " + str
              }
            ]
          });
        } else {
          bot.reply(message, {
            "attachments": [
              {
                "color": "good",
                "text": replyMsg
              }
            ]
          });
        }
      });
    });
    req.on('error', function(err) {
      console.log(err);
    });
    var reqBody = {
      "request": {
        "branch": "master"
      }
    };
    if(message.subtype == "file_share") {
      reqBody = JSON.parse(message.file.preview);
    }
    if(branch) {
      reqBody.request.branch = branch;
    }
    req.write(JSON.stringify(reqBody));
    req.end();
  }
}

controller.on(['file_share', 'direct_message', 'direct_mention'], function(bot, message) {
  //console.log(JSON.stringify(message, undefined, 2));
  var cmd = [];
  if(message.subtype == "file_share") {
    cmd = message.file.initial_comment.comment.trim().split(' ')
    if(cmd[0].startsWith('<@')) {
      cmd.shift();
    }
  } else if(message.text) {
    cmd = message.text.trim().split(' ')
  } else {
    return;
  }

  console.log(JSON.stringify(cmd));
  callbacks[cmd[0]](bot, message, cmd);
});

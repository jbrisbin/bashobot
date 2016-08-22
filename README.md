# Basho Bot

`@bashobot` is a [Slack Bot](https://api.slack.com/bot-users) that performs actions on a user's behalf. It can perform authenticated requests without revealing credentials to users that need to perform those actions.

### Running Basho Bot

`@bashobot` isn't currently deployed to a managed service yet, so you have to run it on your local development environment. It expects two environment variables to be declared: `slack_token` and `travis_token`. Both should be valid tokens that have permissions to interact with Slack and to trigger builds on Travis, respectively.

Run the bot with Docker (of course!):

    docker build -t bashobot .
    docker run --rm -it -e slack_token=SOMETOKEN -e travis_token=ANOTHER_TOKEN bashobot

### Using Basho Bot

`@bashobot` is a user that can be invited into a Slack room and sent commands either by mention or through a direct message to the `@bashobot` user. To use a direct mention, invite the `@bashobot` into your room.

    /invite @bashobot

It should automatically join. Then you can direct mention the bot.

    @bashobot: help

`@bashobot` will respond to commands of the form `group:command`. Supported commands can be listed by asking `@bashobot` for help using the above command.

### Travis CI

`@bashobot` interacts with Travis CI using the secure REST API. It supports the following commands:

- `travisci:build org/repo [branch]` - Manually trigger a build of _org/repo_ on Travis CI. Optionally pass a branch name. If you need to pass a full JSON document to override elements of your build configuration (as shown in the [Travis CI REST API docs for triggering a build](https://docs.travis-ci.com/user/triggering-builds)), send that JSON as a snippet in a direct message and in the "comment" section of the snippet, mention the `@bashobot` with the appropriate command e.g. `@bashobot travisci:build org/repo`.

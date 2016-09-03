# hapi-keen

> hapi server/plugin to proxy hooks to keen.io

`hapi-keen` is a service that can receive hooks from different services, distill
the request body into a meaningful event and post it to [keen.io](https://keen.io).

## Motivation

I want Open Source projects to be able to

1. Measure their impact
2. Find meaningful contributions / contributors beyond just code

Here is a list of questions that I hope this tool can help us manage [our
beloved Open Source Community](http://hood.ie) better

1. How many new contributors do we have?
1. How many new maintainers do we have?
1. How many active contributors?
1. How many active maintainers?
1. Who created a helpful issue or Pull Request?
1. Who was helpful in our slack chat?
1. What is our reach? How many people use Hoodie?
1. How many visitors / views has our Website?
1. What is the reach of our Twitter account?

to be continued. Please file an issue / PR to add more questions.

## Usage

Note: this is dreamcode. Nothing is implemented yet

```js
KEEN_PROJECT_ID=... KEEN_WRITE_KEY=... npm start
```

This will expose the routes for hooks of different services. I want to start
out with GitHub and Slack. The routes are

```
POST /hooks/github
POST /hooks/slack
```

Besides routes that receive hooks, I think it would be nice if the service
could also pull data from 3rd party services. Be it for bootstrapping data,
to subscribe to stream APIs like the one from Twitter, or to pull data on a
recurring basis, e.g. from Google Analytics, to get the daily page views / visitors.

Eventually these services should become hapi plugins by themselves, but to keep
things simple, I’ll start by putting them into the repository.

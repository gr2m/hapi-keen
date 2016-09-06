var GitHubApi = require('github')
var mkdirp = require('mkdirp')
var KeenTracking = require('keen-tracking')

const { GITHUB_TOKEN, KEEN_PROJECT_ID, KEEN_WRITE_KEY } = process.env

// Configure a client instance
var client = new KeenTracking({
  projectId: KEEN_PROJECT_ID,
  writeKey: KEEN_WRITE_KEY
})

var fetch = require('../lib/github/fetch')
var Parser = require('../lib/github/parser')

var github = new GitHubApi({
  // debug: true,
  headers: {
    'user-agent': 'hoodie-community-data-bootstrap',
    'accept': 'application/vnd.github.v3.star+json'
  },
  timeout: 5000
})

var state = {
  github: github,
  org: 'hoodiehq',
  events: []
}

mkdirp.sync('./data')

github.authenticate({
  type: 'oauth',
  token: GITHUB_TOKEN
})

fetch(state, 'repositories', state.github.repos.getForOrg, {org: state.org, per_page: 100})

.then(function (repositories) {
  state.repositories = repositories

  // get stargazers
  return repositories.reduce(function (promise, repository) {
    return promise

    .then(function () {
      return Promise.all([
        fetch(state, 'stars', state.github.activity.getStargazersForRepo, {user: state.org, repo: repository.name, per_page: 100})
          .then(function (stars) {
            return stars.map(toStarEvent.bind(null, repository))
          }),
        fetch(state, 'commit comments', state.github.repos.getAllCommitComments, {user: state.org, repo: repository.name, per_page: 100})
          .then(function (comments) {
            return comments.map(toCommitCommentEvent.bind(null, repository))
          }),
        fetch(state, 'issue comments', state.github.issues.getCommentsForRepo, {user: state.org, repo: repository.name, per_page: 100})
          .then(function (comments) {
            return comments.map(toIssueCommentEvent.bind(null, repository))
          }),
        fetch(state, 'issues', state.github.issues.getForRepo, {user: state.org, repo: repository.name, state: 'all', per_page: 100})
          .then(function (issues) {
            var events = issues.map(toIssueEvent.bind(null, repository, 'opened')).concat(
              issues.filter(isCLosed).map(toIssueEvent.bind(null, repository, 'closed'))
            )
            return events
          }),
        fetch(state, 'pull requests', state.github.pullRequests.getAll, {user: state.org, repo: repository.name, state: 'all', per_page: 100})
          .then(function (pullRequests) {
            var events = pullRequests.map(toPullRequestEvent.bind(null, repository, 'opened')).concat(
              pullRequests.filter(isCLosed).map(toPullRequestEvent.bind(null, repository, 'closed'))
            )
            return events
          })
      ])
    })

    .then(function (repositoryEvents) {
      var events = [].concat.apply([], repositoryEvents)

      // console.log(`\n${repository.name} results ==============================`)
      // console.log(toEventsStats(events))
      // console.log('\n\n')

      state.events = state.events.concat(events)
    })
  }, Promise.resolve())
})

.then(function () {
  console.log(`\nTotal events ==============================`)
  console.log(toEventsStats(state.events))
  console.log('pushing to keen.io ...')

  var map = toEventsMap(state.events)

  require('fs').writeFileSync('data/events.json', JSON.stringify(map, null, 4))

  client.recordEvents(map, function (error, response) {
    if (error) {
      throw error
    }

    console.log(`\nkeen.io response ==============================`)
    console.log(response)
  })
})

.catch(function (error) {
  console.log(`\nerror ==============================`)
  console.log(error)
})

function toStarEvent (repository, star) {
  return {
    type: 'star',
    user: {
      login: star.user.login.toLowerCase(),
      id: star.user.id
    },
    repository: {
      name: repository.name.toLowerCase(),
      id: repository.id
    },
    keen: {
      timestamp: star.starred_at
    }
  }
}

function toCommitCommentEvent (repository, comment) {
  return Parser.commit_comment({
    comment: comment,
    repository: repository
  })
}

function toIssueCommentEvent (repository, comment) {
  return Parser.issue_comment({
    comment: comment,
    repository: repository
  })
}

function toIssueEvent (repository, state, issue) {
  var event = Parser.issue({
    action: state,
    issue: issue,
    repository: repository
  })

  return event
}

function isCLosed (issue) {
  return issue.closed_at
}

function toPullRequestEvent (repository, state, pullRequest) {
  var event = Parser.pull_request({
    action: state,
    pull_request: pullRequest,
    repository: repository
  })

  return event
}

function toEventsStats (events) {
  return events.reduce(function (map, event) {
    if (!map[event.type]) {
      map[event.type] = 0
    }
    map[event.type]++
    return map
  }, {})
}

function toEventsMap (events) {
  return events.reduce(function (map, event) {
    var type = event.type
    if (!map[type]) {
      map[type] = []
    }
    delete event.type
    map[type].push(event)
    return map
  }, {})
}

// - [x] load all repositories
// - [x] load stars for each repository, create star events
// - [x] load repo commit comments, create commit_comment events
// - [x] load issues for each repository, create issue_opened and issue_closed events
// - [x] load comments for each issue, create issue_comment events
// - [x] load pull requests for each repository, create pull_request_opened, pull_request_closed and pull_request_merged events
// - [x] load comments for each pull request, create pull_request_review_comment events
// - [ ] load memberships for org, create member_added events

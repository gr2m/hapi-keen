module.exports = {
  commit_comment: githubCommentParser,
  issue: githubIssueParser,
  issue_comment: githubCommentParser,
  pull_request: githubPullRequestParser,
  pull_request_review_comment: githubCommentParser,
  watch: githubStarParser
}

function githubCommentParser (payload) {
  var type = 'repository_comment'
  var comment = payload.comment
  var user = {
    id: comment.user.id,
    login: comment.user.login.toLowerCase()
  }
  var repository = {
    id: payload.repository.id,
    name: payload.repository.name.toLowerCase()
  }

  if (/\/issues\//.test(comment.html_url)) {
    type = 'issue_comment'
  }

  if (/\/pull\//.test(comment.html_url)) {
    type = 'pull_request_review_comment'
  }

  return {
    type: type,
    id: comment.id,
    html_url: comment.html_url,
    user: user,
    repository: repository,
    keen: {
      timestamp: comment.created_at
    }
  }
}

function githubIssueParser (payload) {
  var type = `issue_${payload.action}`
  var issue = payload.issue
  var user = {
    id: issue.user.id,
    login: issue.user.login.toLowerCase()
  }
  var repository = {
    id: payload.repository.id,
    name: payload.repository.name.toLowerCase()
  }

  return {
    type: type,
    id: issue.id,
    html_url: issue.html_url,
    user: user,
    repository: repository,
    keen: {
      timestamp: payload.action === 'opened' ? issue.created_at : issue.closed_at
    }
  }
}

function githubPullRequestParser (payload) {
  var pullRequest = payload.pull_request
  var user = {
    id: pullRequest.user.id,
    login: pullRequest.user.login.toLowerCase()
  }
  var repository = {
    id: payload.repository.id,
    name: payload.repository.name.toLowerCase()
  }
  var type

  if (payload.action === 'opened') {
    type = 'pull_request_opened'
  }
  if (payload.action === 'closed') {
    type = payload.merged ? 'pull_request_merged' : 'pull_request_closed'
  }

  return {
    type: type,
    id: pullRequest.id,
    html_url: pullRequest.html_url,
    user: user,
    repository: repository,
    keen: {
      timestamp: pullRequest.created_at
    }
  }
}

function githubStarParser (payload) {
  // GitHub’s "watch" event is actually a "star" event
  // https://developer.github.com/changes/2012-09-05-watcher-api/
  var type = 'star'
  var user = {
    id: payload.sender.id,
    login: payload.sender.login.toLowerCase()
  }
  var repository = {
    id: payload.repository.id,
    name: payload.repository.name.toLowerCase()
  }

  return {
    type: type,
    user: user,
    repository: repository
  }
}

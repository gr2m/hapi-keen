var KeenTracking = require('keen-tracking')
var moment = require('moment')

const { KEEN_PROJECT_ID, KEEN_WRITE_KEY } = process.env

// Configure a client instance
var client = new KeenTracking({
  projectId: KEEN_PROJECT_ID,
  writeKey: KEEN_WRITE_KEY
})

// Record an event
client.recordEvent('test', {
  title: 'test event from hapi-keen',
  keen: {
    timestamp: moment().subtract(1, 'day').toISOString()
  }
})

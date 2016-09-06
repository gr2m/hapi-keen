var fs = require('fs')
var path = require('path')

var test = require('tap').test

var parser = require('../lib/github/parser')

test('fixtures', function (t) {
  var fixturesPath = path.join('test', 'fixtures', 'github-events')
  var fixturesFiles = fs.readdirSync(fixturesPath)

  fixturesFiles.forEach(function (file) {
    var fixtures = require(path.resolve(fixturesPath, file))
    var parse = parser[fixtures.type]
    t.ok(parse, `${fixtures.type} has parser`)
    t.deepEqual(fixtures.to, parse(fixtures.from))
  })

  t.end()
})

var Hapi = require('hapi')

var server = new Hapi.Server()
server.connection({port: 9000})

server.route({
  method: 'get',
  path: '/',
  handler: function (request, reply) {
    reply('ok')
  }
})

server.start(function (error) {
  if (error) {
    throw error
  }

  console.log(server.info.uri)
})

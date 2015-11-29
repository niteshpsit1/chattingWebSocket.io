var Hapi = require('hapi'),
    Good = require('good'),
    mongoose   = require('mongoose'),
    routes = require('./routes');

mongoose.connect('mongodb://localhost/chatweb');

var server = new Hapi.Server();
server.connection({ port: 3000});

// plugins register
server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                response: '*',
                log: '*'
            }
        }]
    }
}, function (err) {
    if (err) {
        throw err; // something bad happened loading the plugin
    }
});


var options = {
    storeBlank: true,
    cookieOptions: {
        password: 'password',
        isSecure: false
    }
};

server.register({
    register: require('yar'),
    options: options
}, function (err) { });


// view handler
server.views({
    engines: {
        jade: require('jade')
    },
    relativeTo: __dirname,
    path: 'views'
});

// serving static files
server.route({
    path: "/public/{path*}",
    method: "GET",
    handler: {
        directory: {
            path: "./public",
            listing: false,
            index: false
        }
    }
});

routes(server);

require('./chatConnection').init(server.listener);
server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
});
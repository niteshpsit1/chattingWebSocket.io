var path = require('path');
var fs = require('fs');

var routes = function(server){
	fs.readdirSync(__dirname).filter(function (file){
		return path.join(__dirname, file) != __filename;	
	}).forEach(function(file){
		require('./'+path.basename(file))(server);
	});
};

module.exports = routes;

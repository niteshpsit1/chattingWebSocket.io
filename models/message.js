var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var message = Schema({
	msg: String,
	username: String,
	createdAt: {type:String, default: Date.now()}
});

module.exports = mongoose.model('Message',message);


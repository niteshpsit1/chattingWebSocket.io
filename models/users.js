var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var users = Schema({
	username : { type: String, unique: true },
	email: String,
	password : String,
	gender : String,
	country : String,
	status: { type: Boolean, default: false },
});

module.exports = mongoose.model('users', users);
var Users = require('../models/users')
	bcrypt = require('bcryptjs');

module.exports = function(server){

	server.route({
	    method: 'GET',
	    path: '/',
	    handler: function (request, reply) {
	        reply.view('index');
	    }
	});
	//@ this route is used for register the institute
	server.route({
		path:'/user',
		method:'GET',
		handler: function(request, reply){
			Users.find({status:true},function(error, data){
				if(error){
					reply("something went wrong");
				}else{
					reply(data);
				}
			});
		}
	});

	server.route({
	    method: 'GET',
	    path: '/userlist',
	    handler: function (request, reply) {
	    	if(request.session.get('email')){
	        	reply.view('userlist',{ _id:request.session.get('_id'), email:request.session.get('email'), username:request.session.get('username')});
	    	}else{
	    		reply.redirect('/login');
	    	}
	    }
	});

	server.route({
	    method: 'GET',
	    path: '/login',
	    handler: function (request, reply) {
	    	if(!request.session.get('email')){
	        	reply.view('login');
	    	}else{
	    		reply.redirect('/userlist')
	    	}
	    }
	});
	server.route({
	    method: 'GET',
	    path: '/logout',
	    handler: function (request, reply) {
	    	request.session.reset();
	    	reply.view('logout');
	    }
	});

	server.route({
	    method: 'POST',
	    path: '/login',
	    handler: function (request, reply) {
	    	Users.findOne({email:request.payload.username},function(err, data){
	    		if(err){
	    			reply("some thing went wrong");
	    		}else if(data && bcrypt.compareSync(request.payload.password, data.password)){
	    			
	    			request.session.set('_id',data._id);	   	    			 				    							
					request.session.set('email',request.payload.username);
					Users.update({"email" : request.payload.username }, { $set: { "status": true }}).exec();
					Users.findOne({"email" : request.payload.username },function(err ,user){
						request.session.set('username',user.username);
						reply.redirect('/userlist');
					});
	    			
	    		}else{
	    			reply("user not found");
	    		}
	    	});
	    }
	});

	server.route({
	    method: 'GET',
	    path: '/registration',
	    handler: function (request, reply) {
	        if(!request.session.get('email')){
	        	reply.view('registration');
	        }else{
	        	reply.redirect('/userlist');
	        }

	    }
	});

	server.route({
	    method: 'POST',
	    path: '/registration',
	    handler: function (request, reply) {
	    	if(request.payload.password === request.payload.passwordconfirm){
	    		delete request.payload.passwordconfirm;
	    	}
	    	var salt = bcrypt.genSaltSync(10);
			var hash = bcrypt.hashSync(request.payload.password, salt);
			request.payload.password = hash;
	    	var users = new Users(request.payload);
	    	users.save(function (error) {
	            if (error) {
	                reply({
	                    statusCode: 503,
	                    message: error
	                });
   				}else{
    					reply.redirect('/login');
    				 }		
        	});
		}
	});
}
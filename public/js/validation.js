$(document).ready(function(){
    var $username = $('#username');
    var $password = $('#password');
    var $loginForm = $('#loginForm');
    $loginForm.submit(function(e){
    	if($username.val() === ''){
	    	alert("user name can not be black");
	    	e.preventDefault();
	    }else if($password.val() === ''){
	    	alert("password can not be black");
	    	e.preventDefault();
	    }
    }); 
});
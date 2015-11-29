$(document).ready(function(){
            
      var $username = $('#username');
      var $_id = $('#_id');
      var $onlineUser = $('#onlineUser');
      var $msgForm = $('#msgForm');
      var $userId = $('#userId');
      var $message = $('#message');
      var $messages = $('#messages');
      var $totalonline = $('#totalonline');
      var $personalMsgForm = $('.personalMsgForm');
      var $personalMessage = $('.personalMessage');
      var $personalMessages = $('.personalMessages');
      var divmsgs=document.getElementById('msgs');
      // connection with socket
      socket = io.connect();
      //on when any user become online new user join
      socket.on('on join',function(users){
            var html = '';
            for(var key in users){
                  if (key !== $_id.val())
                        html += '<li id="'+key+'userList" class="list-group-item" onclick=CreateTab("'+users[key]+'","'+key+'") >' +users[key]+ '</li>';
            }
            $onlineUser.html(html);
      });
      // for updating the number of online users in real time 
      socket.on('online user numbers',function(numbers){
            numbers = numbers - 1;
            $totalonline.html(' '+numbers+' ');
      });
      // emit this event because notification other user that i ma became online :)
      socket.emit('user join',{ _id:$_id.val(), userId:$userId.val(), username:$username.val() });
      // updating the list of online user when any user became online
      socket.on('online user',function(user){
            user.username = user.username.toString();
            if (user._id !== $_id.val())
                  $onlineUser.append("<li id='"+user._id+"userList' class=list-group-item onclick=\"CreateTab('"+user.username+"' ,'"+user._id+"')\" > "+user.username+ "</li>");
      });
      // updating the list of online user when any user goes offline
      socket.on('remove user',function(_id){
            $('#'+_id+'userList').remove();
      });
      // message broadcasting  
      // when any online user wants to broadcast any message to all the user those are online
      $msgForm.submit(function(e){
            e.preventDefault();
            if($message.val().trim() !== ''){
                  socket.emit('message',{msg:$message.val()});
            }
            $message.val('');
      });
      // load all messages to the user when he or she became online ( the broadcasted messages )
      socket.on('load messages',function(msgs){
            for(var i = msgs.length-1; i>=0; i--){
                  $messages.append('<li><b>'+(msgs[i].username).toUpperCase()+':</b><span> '+msgs[i].msg+'</span></li>');
            }
      });
      // when any user broadcast message to all users
      socket.on('new message',function(data){
            $messages.append('<li><b>'+(data.username).toUpperCase()+':</b><span>  '+data.msg+'<span></li>');
            var down=divmsgs.scrollHeight-divmsgs.clientHeight;
            if(down>=0){
                  $("#msgs").scrollTop(down);
            }
      });
      // one to one chatting 
      // when any friend send the personal message
      socket.on('message from friend', function(data, callback){
            if ($('#'+data._id).length){
                  $('#'+data._id).find('.personalMessages').append('<li><b>'+(data.username).toUpperCase()+':</b><span> '+data.msg+'</span></li>');
                  //scrollChat($('#'+data._id).find('.showMsgs')[0]);
            }else{
                  CreateTab(data.username,data._id);
            }
            callback();
      });
      // load old messsage of the friend 
      socket.on('seen all messages',function(data){
            if($('#'+data.friendId).length) {
                  $('#'+data.friendId).find('.personalMessages').find('.deliver').removeClass( ".deliver" ).addClass( "seen" );
                  $('#'+data.friendId).find('.personalMessages').find('.deliver').removeClass( ".send" ).addClass( "seen" );
            }
      });
});


function CreateTab(name, uniqueId)
{          
      
     var aa = [];
      $('#chat_tabs').children().each(function(index){
            aa.push($(this).attr('id'));
      });      

      if(jQuery.inArray(uniqueId, aa) == -1){
            $('#chat_tabs').append('<form data-attribute="'+uniqueId+'" id="'+uniqueId+'" class="personalMsgForm"><div class=col-sm-3 style="border:1px solid black;background:white;"><div> <div class=col-sm-12 style="background:green;">  <span class="glyphicon glyphicon-minus" onclick="hideTab(this)" style="float: right;" aria-hidden="true"></span>  <span class="glyphicon glyphicon-unchecked" style="float: right;" aria-hidden="true" onclick="showTab(this)" ></span>  <span class="glyphicon glyphicon-remove" style="float: right;" aria-hidden="true" onclick="removeTab(this)"></span> </div>    <div>'+ name +'</div><div class="showMsgs hideable" style="width:100%;float:left;height:110px;overflow: scroll;"> <ul class="personalMessages" style="padding-bottom:40px"></ul></div></div><div class="hideable" ><input class="personalMessage" autocomplete="off" placeholder="Type message" class="form-control"><button>Send</button></div> </div></form>')
            socket.emit('tab open',{friendId:uniqueId});
      }
      socket.on('old message',function(data){
            var html = '';
            for(var i =data.length -1 ; i>= 0; i--){
                  if(data[i].from === uniqueId) {
                        html += '<li><span class=""> '+data[i].message+'</span></li>'
                  } else {
                        html += '<li><span class="'+data[i].status+'"> '+data[i].message+'</span></li>'
                  }
            }
            if ($('#'+uniqueId).length){
                  $('#'+uniqueId).find('.personalMessages').append(html);
            }
            //scrollChat($('#'+uniqueId).find('.showMsgs')[0]);
      });

      $('.personalMsgForm').submit(function(e){
            e.preventDefault();

            var msg = $(this).find('.personalMessage').val().trim();
            if(msg !== ''){
                  
                  //scrollChat($(this).find('.showMsgs')[0]);
                  socket.emit('personal message',{msg:msg,friendId:$(this).attr('data-attribute')},function(err, status){
                        if(err) {
            
                              $('#'+uniqueId).find('.personalMessages').append('<li><b>'+$('#username').val().toUpperCase()+':</b><span>  '+msg+'</span></li>');
                        
                        }
                        else if(status == 'deliver') {
                              
                              $('#'+uniqueId).find('.personalMessages').append('<li><b>'+$('#username').val().toUpperCase()+':</b><span class="deliver"> '+msg+'</span></li>');
                        
                        }
                        else {
                              
                              $('#'+uniqueId).find('.personalMessages').append('<li><b>'+$('#username').val().toUpperCase()+':</b><span class="send">  '+msg+'</span></li>');
                        
                        }
                  });
            }
            $(this).find('.personalMessage').val('');
      });
      setInterval(function(){

            if($('#'+uniqueId).find('.personalMessage').is(":focus")){
                  socket.emit('read message', {friendId:uniqueId});
            }
            
      },100);
}

function setContainerHeight()
{     var height = $( window ).height();
      $('.container').height(height);
}

function tabMessageSender()
{
            var message = $('#messageTab').val()
            if(message !== ''){
                  socket.emit('message',{msg:message});
                  $('#messageTab').val('');
            } 
}

function hideTab(parr)
{
      var elementsInternal = $(parr).parent().parent().children();
      var elementsExternal = $(parr).parent().parent().parent().children();
      
      elementsInternal.each(function(index){
            console.log($(this));
            if( $(this).hasClass( "hideable" ))
            $(this).hide();
      });

      elementsExternal.each(function(index){
            console.log($(this));
            if( $(this).hasClass( "hideable" ))
            $(this).hide();
      })


}

function showTab(parr)
{
      var elementsInternal = $(parr).parent().parent().children();
      var elementsExternal = $(parr).parent().parent().parent().children();
      
      elementsInternal.each(function(index){
            console.log($(this));
            if( $(this).hasClass( "hideable" ))
            $(this).show();
      });

      elementsExternal.each(function(index){
            console.log($(this));
            if( $(this).hasClass( "hideable" ))
            $(this).show();
      })

}


function removeTab(parr)
{
      var elementsExternal = $(parr).parent().parent().parent().remove();
}

/*function scrollChat(personalMsgs){
      var down=personalMsgs.scrollHeight-personalMsgs.clientHeight;
      if(down>=0){                       
      $(personalMsgs).scrollTop(down); 
      }
}*/


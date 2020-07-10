var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');

var typingUsers = new Set(); // danh sach nguoi dang typing

var stompClient = null;
var username = null;
var avatar = null;
var user_id = 0;
var joined = false;

var typing = false;
var timeout = undefined;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

var websocket = new WebSocket("ws://localhost:8080/chatroom-1/phong-chat");
websocket.onopen = function (message) { processOpen(message); };
websocket.onmessage = function (message) { onMessageReceived(message);};
websocket.onclose = function (message) { processClose(message); };
websocket.onerror = function (message) { onError(message); };

function processOpen(message) {
    if(websocket.readyState == WebSocket.OPEN){
        console.log("open" + user_id)
        joinChat();
    }else{
        console.log("closed")
    }
    console.log("connected")
}

function processClose(message) {
    if(websocket.readyState == WebSocket.OPEN){
        console.log("d_open")
    }else{
        console.log("d_closed")
    }
    console.log("Disconnected...")
}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
    console.log("error")
}



function getToken(){
    var token = localStorage.getItem("current-user-token");
    if(token){
        return token;
    }
    else{
       return window.location="./index.html";
    }
}


function sendMessage(messageContent) {
    console.log(messageContent)
    var token = getToken();
    var json = {
        "action": "send_message",
        "payload":{
            "token": token,
            "content": messageContent
        }
    }
    if (typeof websocket != 'undefined' && websocket.readyState == WebSocket.OPEN) {
        websocket.send(JSON.stringify(json));
        messageInput.value = '';
    }
}


function onMessageReceived(payload) {
    console.log(payload)
    var response = JSON.parse(payload.data);
    var action = response.action;
    if(action == "send_message"){
        var display = get_data(payload);
        var username = display["username"];
        var message = display["message"];
        showMessage(username, message);
    }
    else if(action == "response") {
        var response_type = response.payload.type
        if(response_type == "lastest_messages"){
            var response_payload = response.payload.response_payload
            var messages = response_payload.messages
            messages.sort(function(a, b){
                if(a.createAt < b.createAt){
                    return -1;
                }
                else if (a.createAt > b.createAt){
                    return 1;
                }
                return 0;
            })
            for(message of messages){
                username = message.username
                content = message.content
                showMessage(username, content);
            }
        }else if (response_type == "join_chat"){
            var message = response.payload.message;
            var code = response.payload.code
            if(code == 1){
                alert(message);
                localStorage.removeItem("current-user-token");
                window.location = "./index.html";
            }
        }
    } else if (action == "user-typing"){
        var typingUser = response.payload.username;
        var isTyping = response.payload.typing;
        if(isTyping == 1){
            typingUsers.add(typingUser);
        }else{
            typingUsers.delete(typingUser);
        }
        if(typingUsers.size == 1){
            document.getElementById('typing').innerHTML = typingUser +" đang soạn tin nhắn....";
        }else if(typingUsers.size > 1){
            document.getElementById('typing').innerHTML = "Có " + typingUsers.size + " đang nhập tin nhắn...";
        } else {
            document.getElementById('typing').innerHTML = "";
        }
        
    }
}
function showMessage(username, message){
    var message_type = "chat-message";
    if(username == "System"){
        message_type = "event-message";
    }

    var avatar = username[0];
    var messageElement = document.createElement('li')
    if(message_type == "chat-message") {
        messageElement.classList.add(message_type);
        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(avatar);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(username);
    
        messageElement.appendChild(avatarElement);
    
        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(username);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }
    else {
        messageElement.classList.add("event-message");
    }
    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function get_data(message){
    var response = JSON.parse(message.data);
    var action = response.action;
    var payload = response.payload;
    if (action == "send_message") {
        var content = payload.content
        var username = payload.username
        var avatar = username[0];
        console.log(username + ": " + content);
        return {
            "username": username,
            "avatar": avatar,
            "message": content
        }
    }
}

function joinChat(){
    var token = getToken();
    var json = {
      "action": "join_chat",
      "payload":{
        "token": token
      }
    }
    if(websocket.OPEN){
      websocket.send(JSON.stringify(json));
    }
  }
  

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

// enter de gui tin nhan
window.addEventListener('keydown', function (e) {
    if (e.keyIdentifier == 'U+000A' || e.keyIdentifier == 'Enter' || e.keyCode == 13) {
        if (e.target.nodeName == 'INPUT' && e.target.type == 'text') {
            e.preventDefault();
            document.getElementById('btn').click();
            return false;
        }
    }
}, true);


function checkMessage(){
    var messageContent = messageInput.value.trim();
    if(messageContent != ""){
        sendMessage(messageContent)
    }
}
function logOut(){
    localStorage.removeItem("current-user-token");
    window.location = "./index.html";
}

function sendTypingEvent(typing){
    var token = getToken();
    var json = {
        "action": "typing-event",
        "payload": {
            "token": token,
            "typing": typing
        }
    }
    if (typeof websocket != 'undefined' && websocket.readyState == WebSocket.OPEN) {
        websocket.send(JSON.stringify(json));
    }
}


function stopTyping (){
    typing = false;
    sendTypingEvent(0);
}

function onKeyDownNotEnter(){
  if(typing == false) {
    typing = true
    sendTypingEvent(1);
    timeout = setTimeout(stopTyping, 5000);
  } else {
    clearTimeout(timeout);
    timeout = setTimeout(stopTyping, 5000);
  }
}
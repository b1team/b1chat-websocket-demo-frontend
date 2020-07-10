var websocket = new WebSocket("ws://localhost:8080/chatroom-1/phong-chat");
websocket.onmessage = function (message) { onMessageReceived(message); };

websocket.onerror = function (str) {
  console.log("error: ", str);
};
// Tell the server we want to send something to the other client
websocket.onopen = function () {
  console.log("Connected")
}
websocket.onclose = function () {
  console.log("Disconnected")
}

function send() {
  var username = document.getElementById('user_name').value;
  var password = document.getElementById('pass_word').value;
  var json = {
    'action': 'login',
    'payload': {
      'username': username.toLowerCase(),
      'password': password
    }
  };
  websocket.send(JSON.stringify(json))
  return false;
}

function onMessageReceived(message) {
  console.log(message);
  var response = Response(message)
  login(response)
}


function saveToLocalStorage(token){
  localStorage.setItem("current-user-token", token);
}

function login(response){
  var code = response['code'];
  var type = response['type'];
  var payload = response['payload'];
  var message = response['message'];
  if(code == 0 && type == "login"){
    var token = payload.response_payload.token;
    alert(message)
    window.location="./chat.html";
    saveToLocalStorage(token);
  }
  else if (code == 1){
    alert(message)
  }
 
}

function Response(message){
  var response = JSON.parse(message.data);
  var action = response.action;
  var payload = response.payload;
  if(action == "response"){
    var code = payload.code;
    var type = payload.type;
    var message = payload.message;
    return {
      "code": code,
      "type": type,
      "payload": payload,
      "message": message
    }
  }
  else if (action == "send_message") { // chat
      var content = payload.content
      var username = payload.username
      console.log(username + ": " + content);
  }
}

var token = localStorage.getItem("current-user-token");
if(token){
  window.location = "./chat.html";
}

function redirectToReg(){
  window.location = "./register.html";
}
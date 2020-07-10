
// validate register 
const form = document.getElementById('form');
const usernameField = document.getElementById('username');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

// Show input error message
function showError(input, message) {
  const formControl = input.parentElement;
  formControl.className = 'form-control error';
  const small = formControl.querySelector('small');
  small.innerText = message;
}

// Show success outline
function showSuccess(input) {
  const formControl = input.parentElement;
  formControl.className = 'form-control success';
}



// Check required fields
function checkRequired(inputArr) {
  inputArr.forEach(function(input) {
    if (input.value.trim() === '') {
      showError(input, `${getFieldName(input)} is required`);
    } else {
      showSuccess(input);
    }
  });
}

// Check input length
function checkLength(input, min, max) {
  if (input.value.length < min) {
    showError(
      input,
      `${getFieldName(input)} must be at least ${min} characters`
    );
  } else if (input.value.length > max) {
    showError(
      input,
      `${getFieldName(input)} must be less than ${max} characters`
    );
  } else {
    showSuccess(input);
  }
}

// Check passwords match
function checkPasswordsMatch(input1, input2) {
  if (input1.value !== input2.value) {
    showError(input2, 'Passwords do not match');
  }
}

// Get fieldname
function getFieldName(input) {
  return input.id.charAt(0).toUpperCase() + input.id.slice(1);
}

// Event listeners
form.addEventListener('submit', function(e) {
  e.preventDefault();

  checkRequired([usernameField, password, password2]);
  checkLength(usernameField, 3, 15);
  checkLength(password, 6, 25);
  checkPasswordsMatch(password, password2);
});
var websocket = new WebSocket("ws://localhost:8080/chatroom-1/dang-ky");
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
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  var json = {
    'action': "register",
    'payload': {
      'username': username.toLowerCase(),
      'password': password
    }
  
  };
  if(password == password2.value && password.length >= 6 && username.length > 3 && username.length < 15){
    websocket.send(JSON.stringify(json));
  }
  else{
    console.log("INVALID");
  }
  return false;
}

function onMessageReceived(message){
  var response = JSON.parse(message.data);
  var action = response.action;
  var payload = response.payload;
  if(action == "response"){
    var code = payload.code;
    var type = payload.type;
    var message = payload.message;
    if(code == 0 && type == "register"){
      alert(message);
      window.location = "./login.html";
    }else if(code == 1){
      alert(message);
    }
  }
}
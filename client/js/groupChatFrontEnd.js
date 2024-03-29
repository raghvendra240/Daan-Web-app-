const socket = io(BASE_SOCKET_URL);

let $parent = $(".chat-messages");
let $template = $parent.find(".message");

const scrollToBottom = () => {
  $parent.scrollTop($parent[0].scrollHeight);
};

$(".dn-chat-opener").click((event) => {
  if ($(".dn-icon-opener").hasClass("dn-hide")) {
    //Chat is opened
    $(".dn-chat-wrapper").addClass("dn-hide");
    $(".dn-close-icon").addClass("dn-hide");
    $(".dn-icon-opener").removeClass("dn-hide");
    
  } else {
    $(".dn-chat-wrapper").removeClass("dn-hide");
    $(".dn-close-icon").removeClass("dn-hide");
    $(".dn-icon-opener").addClass("dn-hide");
    scrollToBottom();
  }
});

$('.chat-messages').scroll((event) => {
  event.stopPropagation();
});

const formatAMPM = (timeStamp) => {  
  let date = new Date(Number(timeStamp));
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes.toString().padStart(2, "0");
  let strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
};

let buildMsgDOM = function (msgObj) {
  let $templateClone = $template.clone();
  if (msgObj.msgType == "receive") {
    $templateClone.addClass("receivers-msg");
    $templateClone.find("user-name").text(msgObj.userName);
  } else {
    $templateClone.addClass("sender-msg");
    $templateClone.find(".user-image").hide();
    $templateClone.find(".user-name").hide();
  }

  if (msgObj.sameUserMsg) {
    $templateClone.find(".user-image").css('visibility', 'hidden');
    $templateClone.find(".user-name").hide();
  }

  $templateClone.find(".user-text").text(msgObj.msg);
  let msgDate = formatAMPM(msgObj.date);
  $templateClone.find(".user-msg-time").text(msgDate);
  $parent.append($templateClone);
  $parent.scrollTop($parent[0].scrollHeight);
};

let populateMessages = function (messages) {
  let currentUserId;
  let loggedInUserId = localStorage.getItem("userId");
  messages.forEach(function (msg, index) {
    try {
      let msgObj = {
        userName: msg.senderUserId.firstName,
        msg: msg.message,
        date: msg.date,
      };
      if (currentUserId === undefined || currentUserId != msg.senderUserId._id) {
        currentUserId = msg.senderUserId._id;
      } else {
        msgObj.sameUserMsg = true;
      }
      if (loggedInUserId != msg.senderUserId._id) {
          msgObj.msgType = "receive";
      }
      buildMsgDOM(msgObj);
    } catch (error) {
      console.log(error);
    }
   
  });
  scrollToBottom();

};

let sendMsgFn = function () {
  let msg = $(".chat-input").val();
  $(".chat-input").val("");
  msgObj = {
    userId: localStorage.getItem("userId"),
    msg: msg,
    date: Date.now(),
  };
  socket.emit("sendMsg", msgObj);
  msgObj.msgType = "send";
  buildMsgDOM(msgObj);
  scrollToBottom();
};

$(".send-msg-btn").click(sendMsgFn);
$(".chat-input").keypress(function (e) {
  if (e.which == 13) {
    sendMsgFn();
  }
});

socket.on("receivedMsg", function (msgObj) {
  let audio = new Audio("../sounds/msg-notificaiton-sound.mp3");
  audio.play();
  msgObj.msgType = "receive";
  buildMsgDOM(msgObj);
  scrollToBottom
});

fetch(`${BASE_BE_URL}/groupchat`)
  .then((response) => response.json())
  .then((data) => {
    let messages = data.data;
    populateMessages(messages);
  });

// document.onload = function() {
// }

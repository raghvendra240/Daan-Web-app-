const socket = io(BASE_SOCKET_URL);
let userId = localStorage.getItem("userId");
let firstPerson;
let firstConversationId;
let currentChatInLeftNavigation;
let currentChatInChatBox;
let otherPersonId;
let conversationId;
function setCurrentChatHeaderData(donorDetail) {
  $(".donor-name-header").text(donorDetail.firstName);
  let avatarPath = "../images/default-avatar.jpg";
  if (donorDetail.avatarPath)
    avatarPath = `${BASE_BE_URL}/${donorDetail.avatarPath}`;
  $(".donor-image-header").attr("src", avatarPath);
}

function addNewChatInLeftNavigation(
  donorDetail,
  makeChatActive,
  conversationId
) {
  let $usersParent = $(".dn-chat-users-container");
  let $userTemplate = $(".chat-user-template-container .dn-chat-user");
  let $templateClone = $userTemplate.clone();
  $templateClone.find(".donor-name").text(donorDetail.firstName);
  if (donorDetail.avatarPath) {
    $templateClone
      .find(".donor-image")
      .attr("src", `${BASE_BE_URL}/` + donorDetail.avatarPath);
  } else {
    $templateClone
      .find(".donor-image")
      .attr("src", "../images/default-avatar.jpg");
  }
  $templateClone.attr("data-conversation-id", conversationId);
  $templateClone.attr("data-otherperson-id", donorDetail._id);
  if (makeChatActive) $templateClone.addClass("active");
  $usersParent.prepend($templateClone);
}

function moveLeftNavElemUp(elem) { 
  let $usersParent = $(".dn-chat-users-container");
  let $elemCopy  = elem.clone();
  elem.remove();
  currentChatInLeftNavigation = $elemCopy.attr("data-conversation-id");
  $usersParent.prepend($elemCopy);
}

function loadChatMessages(msgArray, clearPreviousMessages) {
  let $list = $('.chat-history');
  let $parentContainer = $(".dn-chat-history");
  let $chatTemplate = $(".chat-template-container .clearfix");
  if(clearPreviousMessages) {
    $parentContainer.empty();
  }
  if (msgArray.length ==0 ) {
    $('.empty-chat').show();
  } else {
    $('.empty-chat').hide();
  }
  msgArray.forEach(function (msg, index) {
    $chatTemplateClone = $chatTemplate.clone();
    if (msg.senderUserId == userId) {
      $chatTemplateClone.find(".message-text").removeClass("other-message");
      $chatTemplateClone.find(".message-text").addClass("float-right");
      $chatTemplateClone.find(".message-text").addClass("my-message");
      $chatTemplateClone.find(".message-data").addClass("text-right");
    } else {
      $chatTemplateClone.find(".message-text").removeClass("float-right");
      $chatTemplateClone.find(".message-text").removeClass("my-message");
      $chatTemplateClone.find(".message-data").removeClass("text-right");
      $chatTemplateClone.find(".message-text").addClass("other-message");
    }
    $chatTemplateClone.find(".message-text").text(msg.text);
    $parentContainer.append($chatTemplateClone);
    $list.scrollTop(9999999);
  });
}

function loadChatWrapper() {
  fetch(`${BASE_BE_URL}/user/` + otherPersonId)
    .then((response) => response.json())
    .then((response) => {
      setCurrentChatHeaderData(response[0]);
      currentChatInChatBox = conversationId;
      fetch(`${BASE_BE_URL}/messages/` + conversationId)
        .then((response) => response.json())
        .then((response) => {
          loadChatMessages(response, true);
        });
    });
}

async function loadConversationWrapper(conversation, makeChatActive) {
  let otherPersonId_ = conversation.members.find((member) => member != userId);
  if (makeChatActive) {
    otherPersonId = otherPersonId_;
    conversationId = conversation._id;
  }
 let rawResponse = await  fetch(`${BASE_BE_URL}/user/` + otherPersonId_)
 let response = await rawResponse.json();
 addNewChatInLeftNavigation(response[0], makeChatActive, conversation._id);
 return;
    // .then((response) => response.json())
    // .then((response) => {
      
    // });
}

async function loadConversation(){
  let rawResponse  = await fetch(`${BASE_BE_URL}/conversation/` + userId)
  let response = await rawResponse.json();
  response = response.sort((convA, convB) => {
    return convA.lastUpdated > convB.lastUpdated ? 1 : -1;
  })
  let index = 0;
  for(let conversation of response){
      ++index;
     await loadConversationWrapper(conversation, index == response.length);
  }
  loadChatWrapper();
}

//Loads the chat when user navigate from contact donor page
// fetch("${BASE_BE_URL}/user/" + donorId)
//   .then((response) => response.json())
//   .then((response) => {
//     setCurrentChatHeaderData(response[0]);
//   });

/* listener for chat navigation */
$(".people-list").click(function (e) {
  e.preventDefault();
  if (
    $(e.target).closest(".dn-chat-user").length
  ) {
    let $userElement = $(e.target).closest(".dn-chat-user");
    conversationId = $userElement.attr("data-conversation-id");
    otherPersonId = $userElement.attr("data-otherperson-id");
    loadChatWrapper();
    $(".dn-chat-user").removeClass("active");
    $(e.target).addClass("active");
  }
});

/*  Message send functionality */

function sendMsgFn() {
  let text = $(".msg-input").val();
  if (text == "") {
    $(".msg-input").addClass("error");
    return;
  }
  $(".msg-input").removeClass("error");
  let msgObj = {
    senderUserId: userId,
    conversationId: conversationId,
    text: text,
  };
  socket.emit("sendPrivateMsg", msgObj);
  $(".msg-input").val("");
}

$(".submit-btn").click(sendMsgFn);
$(".msg-input").keypress(function (e) {
  if (e.which == 13) {
    sendMsgFn();
  }
});
$(".msg-input").on("blur", function (e) {
  $(".msg-input").removeClass("error");
});

socket.on("receivePrivateMsg", function (msgObj) {
  console.log(msgObj);
  if(currentChatInChatBox == msgObj.conversationId){
    loadChatMessages([msgObj]);
   }
  if(currentChatInLeftNavigation != msgObj.conversationId){
    let $parent = $('.dn-chat-users-container');
    let $leftNavUser = $parent.find(`[data-conversation-id = ${msgObj.conversationId}]`);
    moveLeftNavElemUp($leftNavUser)
  }
  // fetch("${BASE_BE_URL}/conversation/" + msgObj.conversationId)
  //   .then((response) => response.json())
  //   .then((response) => {
  //    let otherPerson_ = response.members.find(member => member != userId);
     
  //   });
});



/* Handler when user came from contact donor page*/

async function createConversation(donorId){
  const rawResponse = await fetch(`${BASE_BE_URL}/conversation`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      senderUserId: userId,
      receiverUserId: donorId
    })
  });

  let response =  await rawResponse.json();
  return response;
}

async function getConversation(donorId){
  let rawResponse = await fetch(`${BASE_BE_URL}/conversation/`+donorId);
  let response = await rawResponse.json();
  let CONVERSATION;
  // console.log(response);

  response.forEach((conversation) => {
     let found = conversation.members.find((member) => member == userId);
     if(found){
      CONVERSATION = conversation;
     }
  });

  if(!CONVERSATION){
    CONVERSATION = await createConversation(donorId);
    return [CONVERSATION, false]
  }

  return [CONVERSATION, true];
}

async function handlerDonorFn(donorId){
  let [conversation, alreadyExisted] = await getConversation(donorId);
  if (alreadyExisted) {
    $('.dn-chat-user').removeClass('active');
    let $parent = $('.dn-chat-users-container');
    let $leftNavUser = $parent.find(`[data-conversation-id = ${conversation._id}]`);
    $leftNavUser.addClass('active');
    // $('.dn-chat-user').each(index => {
    //   $('.dn-chat-user').eq(index).removeClass('active');
    //   if( $('.dn-chat-user').eq(index).attr('data-conversation-id') == conversation._id){
    //     $('.dn-chat-user').eq(index).addClass('active');
    //   }
    // })
    conversationId = conversation._id;
    otherPersonId = donorId;
    if(currentChatInChatBox == conversationId){
      moveLeftNavElemUp($leftNavUser);
      loadChatWrapper();
    }
  } else {
    $('.dn-chat-user').removeClass('active');
    loadConversationWrapper(conversation , true)
  }

}



/* Starting Point */

async function onLoad(){
  await loadConversation();
  let donorId = localStorage.getItem("donorId");
  if (donorId) {
    localStorage.removeItem("donorId");
    handlerDonorFn(donorId);
  }
}

onLoad();


let donorId = localStorage.getItem("donorId");
let userId = localStorage.getItem("userId");
let firstPerson;
let firstConversationId;
function setCurrentChatHeaderData(donorDetail) {
  $(".donor-name-header").text(donorDetail.firstName);
  let avatarPath = "../images/default-avatar.jpg";
  if (donorDetail.avatarPath)
    avatarPath = "http://localhost:3000/" + donorDetail.avatarPath;
  $(".donor-image-header").attr("src", avatarPath);
}

function addNewChatInLeftNavigation(donorDetail) {
  let $usersParent = $(".dn-chat-users-container");
  let $userTemplate = $usersParent.find(".dn-chat-user:first");
  let $templateClone = $userTemplate.clone();
  $templateClone.find(".donor-name").text(donorDetail.firstName);
  if (donorDetail.avatarPath) {
    $templateClone
      .find(".donor-image")
      .attr("src", "http://localhost:3000/" + donorDetail.avatarPath);
  } else {
    $templateClone
      .find(".donor-image")
      .attr("src", "../images/default-avatar.jpg");
  }
  $usersParent.append($templateClone);
}

function loadChatMessages(msgArray){
console.log("🚀 ~ file: privateChat.Js ~ line 31 ~ msgArray", msgArray);
  let $parentContainer = $('.dn-chat-history');
  let $chatTemplate = $parentContainer.find('.clearfix:first');
  $parentContainer.empty();
  msgArray.forEach(function (msg) {
    $chatTemplateClone = $chatTemplate.clone();
    if(msg.senderUserId == userId){
      $chatTemplateClone.find('.message-text').addClass("float-right");
      $chatTemplateClone.find('.message-text').addClass("my-message");
      $chatTemplateClone.find('.message-data').addClass('text-right');
    }else{
      $chatTemplateClone.find('.message-text').addClass("other-message");
    }
    $chatTemplateClone.find('.message-text').text(msg.text);
    // $chatTemplateClone.find('.message-text')
    $parentContainer.append($chatTemplateClone);
  });
  debugger;
}

function loadChatWrapper(otherPersonId, conversationId) {
  fetch("http://localhost:3000/user/" + otherPersonId)
    .then((response) => response.json())
    .then((response) => {
      setCurrentChatHeaderData(response[0]);
      fetch("http://localhost:3000/messages/" + conversationId)
        .then((response) => response.json())
        .then((response) => {
          loadChatMessages(response);
        });
    });
}

fetch("http://localhost:3000/conversation/" + userId)
  .then((response) => response.json())
  .then(async (response) => {
    response.forEach(async (conversation, index) => {
      let otherPersonId = conversation.members.find(
        (member) => member != userId
      );
      if (index == 0) {
        firstPerson = otherPersonId;
        firstConversationId = conversation._id;
      }
      fetch("http://localhost:3000/user/" + otherPersonId)
        .then((response) => response.json())
        .then((response) => {
          addNewChatInLeftNavigation(response[0]);
        });
    });
  })
  .then(() => loadChatWrapper(firstPerson, firstConversationId));

//Loads the chat when user navigate from contact donor page
// fetch("http://localhost:3000/user/" + donorId)
//   .then((response) => response.json())
//   .then((response) => {
//     setCurrentChatHeaderData(response[0]);
//   });

function updateMessages() {}

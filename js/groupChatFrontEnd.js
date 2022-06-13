//chat opening and closing

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
  }
});


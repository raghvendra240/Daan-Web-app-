function showLoginForm(event) {
  $(".registration-section").addClass("visible");
  $(".forms .login").show();
  $(".forms .signup").hide();
}

function showRegistrationForm(event) {
  $(".registration-section").addClass("visible");
  $(".forms .login").hide();
  $(".forms .signup").show();
}

function hideForm(event) {
  $(".registration-section").removeClass("visible");
  $(".forms .login").hide();
  $(".forms .signup").hide();
  $(".form-msg").text("");
}

function showError(msg) {
  $(".form-msg").addClass("dn-error");
  $(".form-msg").text(msg);
}
function onSuccess(msg) {
  $(".form-msg").addClass("dn-success");
  $(".form-msg").text(msg);
}

$(".registration-section").click(hideForm);

$(".form").click((e) => {
  e.stopPropagation();
});

//Opens Login Modal
$("#login-btn").click(showLoginForm);

//Opens Registration Modal
$("#signup-btn").click(showRegistrationForm);

//Hide the form
$(".js-close-btn").click(hideForm);

//Registration -> login
$(".login-link").click(showLoginForm);
//Login -> Registration
$(".signup-link").click(showRegistrationForm);

$(".registration-form").submit((event) => {
  event.stopPropagation();
  event.preventDefault();
  $(".form-msg").text("");
  $(".registration-form .button").prop("disabled", true);
  $(".registration-form .button").addClass("btn-loading");
  let name = $(".registration-form .name").val();
  let firstPassword = $(".registration-form .password").val();
  let secondPassword = $(".registration-form .cnfm-password").val();
  let email = $(".registration-form .email").val();
  let firstName = name.split(" ")[0];
  let lastName = name.split(" ")[1] || "NAN";

  if (firstPassword != secondPassword) {
    showError("Password does not matched....");
    return;
  }
  let data = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: firstPassword,
  };
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/signup",
    crossDomain: true,
    xhrFields: {
      withCredentials: true,
    },
    data: data,
    success: function (data) {
      if ((data.status = "Success")) {
        localStorage.setItem("userEmail", data.data);
        console.log("Success", data);
        $("#btnSubmit").prop("disabled", false);
        $(".registration-form .name").val("");
        $(".registration-form .password").val("");
        $(".registration-form .cnfm-password").val("");
        $(".registration-form .email").val("");
        $(".registration-form .button").removeClass("btn-loading");
        $(".registration-form").addClass("dn-animate");
        setTimeout(() => {
          $(".registration-form").hide();
          $(".otp-verification-form").addClass("dn-visible");
          onSuccess("Please enter OTP send on you email");
        }, 2000);
      } else {
        showError("Something went wrong. Please try again....");
      }
    },
    error: function (e) {
      console.log("Error", e);
      $(".registration-form .button").removeClass("btn-loading");
      showError("Something went wrong. Please try again....");
    },
  });
});

$(".otp-verification-form").submit((event) => {
  event.stopPropagation();
  event.preventDefault();
  $(".otp-verification-form .button").prop("disabled", true);
  $(".otp-verification-form .button").addClass("btn-loading");
  let data = {
    OTP: $(".otp-verification-form .otp-input").val(),
    email: localStorage.getItem("userEmail"),
  };
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/verify/otp",
    crossDomain: true,
    xhrFields: {
      withCredentials: true,
    },
    data: data,
    success: function (data) {
      console.log("OTP", data);
    },
    error: function (e) {
      console.log("Error", e);
      $(".registration-form .button").removeClass("btn-loading");
      showError("Something went wrong. Please try again....");
    },
  });
});

$(".login-form").submit((event) => {
  event.stopPropagation();
  event.preventDefault();
  $(".login-form .button").prop("disabled", true);
  $(".login-form .button").addClass("btn-loading");
  let data = {
    email: $(".login-form .email").val(),
    password: $(".login-form .password").val(),
  };
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/login",
    crossDomain: true,
    dataType: 'json',
    xhrFields: {
        withCredentials: true
    },
    data: data,
    success: function (data) {
      if (data.status == "Success") {
        $(".registration-section").removeClass('visible');
        $(".dn-login-regsitration-forms").hide();
        $(".dn-user-profile").removeClass("dn-hidden");
        localStorage.setItem("userId", data.userId);
        location.reload();
      } else {
        console.log("Error", data);
        $(".login-form .button").removeClass("btn-loading");
        showError(data.message);
      }
    },
    error: function (e) {
      console.log("Error", e);
      $(".login-form .button").removeClass("btn-loading");
      showError("Something went wrong. Please try later...");
    },
  });
});

$(".dn-user-profile").click(function (event) {
  event.stopPropagation();
  $(".dn-user-info").toggle();
});
$("dn-user-info").click((event) => {
  event.stopPropagation;
});

$('.dn-logout-options').click((event) => {
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/logout",
    crossDomain: true,
    dataType: 'json',
    xhrFields: {
        withCredentials: true
    },
    success: function (data) {
      localStorage.removeItem("userId");
      location.reload();
    },
    error: function (e) {
      console.log("Error", e);
    },
  });
})

//Open the chat
$('.dn-showChat-btn').click(function (e) { 
  e.preventDefault();
  e.stopPropagation();
  window.location.href = "/htmlPages/privateChat.html";
});

//Contact now of product

$('.doantion-card-wrapper').click(function (event) {
  event.preventDefault();
  event.stopPropagation();
  if($(event.target).hasClass('dn-product-contact')){
    localStorage.setItem('dn-product-detail', $(event.target).closest('.container').find('.dn-product-detail').val());
    location.href = "htmlPages/contactDonor.html"
  }
})
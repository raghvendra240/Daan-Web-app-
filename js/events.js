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
    data: data,
    success: function (data) {
      console.log("Success", data);
      $("#btnSubmit").prop("disabled", false);
      $(".registration-form .name").val("");
      $(".registration-form .password").val("");
      $(".registration-form .cnfm-password").val("");
      $(".registration-form .email").val("");
      onSuccess("Verification link sent on you email")
      
    },
    error: function (e) {
      console.log("Error", e);
    },
  });
});

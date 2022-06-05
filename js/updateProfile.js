$("#dn-dp-input").change(function (event) {
  event.preventDefault();
  event.stopPropagation();
  let imageInput = this;
  if (imageInput.files && imageInput.files.length) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $(".dn-profile-image").attr("src", e.target.result);
    };

    reader.readAsDataURL(imageInput.files[0]);
  }
});

$("#dn-submit-btn").click(async function (event) {
  event.preventDefault();
  event.stopPropagation();
  let dpForm = $("#dn-dp-form")[0];
  let formData = new FormData(dpForm);
  formData.append("firstName", $("#dn-firstname").val());
  formData.append("lastName", $("#dn-lastname").val());
  formData.append("email", $("#dn-email").val());
  formData.append("phone", $("#dn-phone").val());
  formData.append("country", $("#dn-country").val());
  formData.append("state", $("#dn-state").val());
  formData.append("zipcode", $("#dn-zipcode").val());
  formData.append("city", $("#dn-city").val());
  formData.append("address", $("#dn-address").val());
  let response = await fetch("http://localhost:3000/updateProfile", {
    credentials: "include",
    method: "PATCH",
    body: formData,
  });

  let result = await response.json();
  console.log(result);

});

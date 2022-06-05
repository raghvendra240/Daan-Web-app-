$("#dn-donateform-submit").click(async (event) => {
  event.preventDefault();
  event.stopPropagation();
  let imageForm = $("#image-form");
  let imageFormData = new FormData(imageForm[0]);
  let categoryData = $("#dn-category").val();
  let subCategoryData = $("#dn-sub-category").val();
  let descriptionData = $("#dn-item-description textarea").val();
  let title = $(".dn-item-title").val();
  imageFormData.append("category", categoryData);
  imageFormData.append("subcategory", subCategoryData);
  imageFormData.append("description", descriptionData);
  imageFormData.append("title", title);
  let response = await fetch("http://localhost:3000/upload/donation", {
    credentials: "include",
    method: "POST",
    body: imageFormData,
  });

  let result = await response.json();
  console.log(result);
});

$(".dn-images-container input").change(function (e) {
  e.preventDefault();
  let input = this;
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    let inputIndex = $(this).attr("data-image-index");
    reader.onload = function (e) {
      $(".dn-input-wrapper").eq(inputIndex).hide();
      $(".dn-postupload-wrapper img").eq(inputIndex).attr("src", e.target.result);
      $(".dn-postupload-wrapper").eq(inputIndex).show();
    };

    reader.readAsDataURL(input.files[0]);
  }
});

$(".dn-postupload-buttons button").click(function(event) {
  event.preventDefault();
  event.stopPropagation();
   if(this.innerText == "Remove") {
     let imageInput = $(this).closest('.dn-image-selector').find('input');
     let inputIndex = imageInput.attr("data-image-index");
     imageInput.val('');
     $(".dn-input-wrapper").eq(inputIndex).show();
     $(".dn-postupload-wrapper img").eq(inputIndex).attr("src", '');
     $(".dn-postupload-wrapper").eq(inputIndex).hide();

   }else if(this.innerText == "Replace") {
    let imageInput = $(this).closest('.dn-image-selector').find('input').click();

   }
})

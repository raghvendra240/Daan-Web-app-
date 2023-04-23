
$("#dn-donateform-submit").click(async (event) => {
  event.preventDefault();
  event.stopPropagation();
  let imageForm = $("#image-form");
  let imageFormData = new FormData(imageForm[0]);
  let categoryData = $("#dn-category").val();
  let subCategoryData = $("#dn-sub-category").val();
  let descriptionData = $("#dn-item-description textarea").val();
  let title = $("#dn-item-title-input").val();
  let daanCoins = $("#dn-daan-coins-input").val();
  imageFormData.append("category", categoryData);
  imageFormData.append("subcategory", subCategoryData);
  imageFormData.append("description", descriptionData);
  imageFormData.append("title", title);
  imageFormData.append("daanCoins", daanCoins);
  let response = await fetch(`${BASE_BE_URL}/donation`, {
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

async function fillData(donationId) {
  const rawResponse = await fetch(`${BASE_BE_URL}/donation/bydonationid/${donationId}`);
  let response = await rawResponse.json();
  response = response.data[0];

  $('#dn-item-title-input').val(response.itemTitle);
  $('#dn-category').val(response.itemCategory);
  $('#dn-sub-category').val(response.itemSubCategory);
  $('textarea').val(response.itemDescription);
}
const donationId = localStorage.getItem('toEditDonationId');
if(donationId) {
  fillData(donationId);
}



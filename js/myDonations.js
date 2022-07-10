let userId = localStorage.getItem("userId");

function populateData(donationData) {
  const $parentContainer = $(".donations-container");
  const $template = $(".donation-template .donation");
  const $templateClone = $template.clone();
  $templateClone.attr("data-donation-id", donationData._id);
  $templateClone.find(".donation-title").text(donationData.itemTitle);
  $templateClone.find(".donation-category").text(donationData.itemCategory);
  $templateClone
    .find(".donation-description")
    .text(donationData.itemDescription);
  if (donationData.images.length) {
    $templateClone
      .find(".donation-image")
      .attr("src", "http://localhost:3000/" + donationData.images[0]);
  }
  $parentContainer.append($templateClone);
}

async function fetchDonations() {
  const rawResponse = await fetch("http://localhost:3000/donation/" + userId);
  const response = await rawResponse.json();
  const data = response.data;
  for (let donation of data) {
    populateData(donation);
  }
}

async function onload() {
  fetchDonations();
}
onload();

/* Events Starts */

$("body").on("click", function (event) {
  event.preventDefault();
  event.stopPropagation();
  if ($(event.target).hasClass("btn-delete")) {
    const $container = $(event.target).closest(".donation");
    const donationId = $container.data("donation-id");
    localStorage.setItem("toDeleteDonationId", donationId);
    $(".confirmation-modal-container").removeClass("dn-hidden");
  }
});

$(".btn-delete-confirm").click(async function (event) {
  const DonationId = localStorage.getItem("toDeleteDonationId");
  let rawResponse = await fetch(
    "http://localhost:3000/donation/" + DonationId,
    {
      method: "DELETE",
    }
  );
  let response = await rawResponse.json();
  localStorage.removeItem("toDeleteDonationId");
  $(".donations-container").find(`[data-donation-id = ${DonationId}]`).remove();
  $(".confirmation-modal-container").addClass("dn-hidden");
  $(".delete-alert").addClass("alert-success");
  $(".delete-alert").text(response.message);
  $(".delete-alert").removeClass("dn-hidden");
  setTimeout(function () {
    $(".delete-alert").addClass("dn-hidden");
  }, 2000);
});

$(".btn-cancel").click(function () {
  localStorage.removeItem("toDeleteDonationId");
  $(".confirmation-modal-container").addClass("dn-hidden");
});


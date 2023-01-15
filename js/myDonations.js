let userId = localStorage.getItem("userId");

function populateData(donationData, containerID) {
  const $parentContainer = $(`#${containerID}`);
  const $template = $(".donation-template");
  const $templateClone = $template.contents().clone();
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
  if (containerID != 'new-donations') {
    $templateClone.find('.btn-container').remove();
  }
  $parentContainer.append($templateClone);
}

async function fetchDonations() {
  const rawResponse = await fetch("http://localhost:3000/donation/" + userId);
  const response = await rawResponse.json();
  const data = response.data;
  for (let donation of data) {
    if (!donation.donationStatus) {
      populateData(donation, 'new-donations');
    } else if (donation.donationStatus == 1) {
      populateData(donation, 'donations-under-verification');
    } else {
      populateData(donation, 'donations-completed');
    }
  }
}

/* Tab functionality*/ 
function openTab(event, tabId) {
  $('.tab').removeClass('dn-selected');
  $('.tab-content').removeClass('tab-active');
  $(event.currentTarget).addClass('dn-selected');
  $(`#${tabId}`).addClass('tab-active');
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
    $(".confirmation-modal-container.delete-modal").removeClass("dn-hidden");
  }

  if ($(event.target).hasClass("btn-edit")) {
    const $container = $(event.target).closest(".donation");
    const donationId = $container.data("donation-id");
    localStorage.setItem("toEditDonationId",donationId);
    window.location.href = "/htmlPages/donationForm.html";
  }
  if ($(event.target).hasClass("btn-donated")) {
    const $container = $(event.target).closest(".donation");
    const donationId = $container.data("donation-id");
    localStorage.setItem("CompletedDonationId",donationId);
    $(".confirmation-modal-container.donation-done-modal").removeClass("dn-hidden");
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

const closeModal = function () {
  localStorage.removeItem("toDeleteDonationId");
  localStorage.removeItem("toEditDonationId");
  localStorage.removeItem("CompletedDonationId");
  $(".confirmation-modal-container").addClass("dn-hidden");
}

$(".btn-cancel").click(closeModal);

$(".btn-donated-confirm").click( async (event) => {
  event.stopPropagation();
  const receiverEmailId = $('#receiver-email').val();
  const payload = {
    donarId: userId,
    receiverEmailId: receiverEmailId,
    donationId: localStorage.getItem("CompletedDonationId")
  }
  try {
   const response = await $.ajax({
      type: "POST",
      url: "http://localhost:3000/donation/completed/send",
      data: payload,
    });
    closeModal();
  } catch (error) {
      console.log(error);
      closeModal();
  }
});


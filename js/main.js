function populateCardData(data) {
  let container = $(document.getElementsByClassName("swiper-wrapper content"));
  let elem = $(document.getElementsByClassName("swiper-slide card"));
  $.each(data, (index, user) => {
    if (index == 0) {
      elem.find(".name").text(user.firstName);
      elem.find(".profession").text(user.email);
      elem.find(".dn-coins").text(user.daan);
    } else {
      let clonedCard = elem.clone();
      clonedCard.find(".name").text(user.firstName);
      clonedCard.find(".profession").text(user.email);
      container.append(clonedCard);
    }
  });
}
function startSwiper() {
  var swiper = new Swiper(".mySwiper", {
    slidesPerView: 3,
    spaceBetween: 30,
    slidesPerGroup: 3,
    loop: true,
    loopFillGroupWithBlank: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
}

fetch("http://localhost:3000/topdonor", {
  credentials: "include",
})
  .then((response) => response.json())
  .then((data) => {
    populateCardData(data);
  })
  .finally(() => {
    startSwiper();
  });
// Check if the user is authenticated
fetch("http://localhost:3000/isAuthenticated", { credentials: "include" })
  .then((response) => response.json())
  .then((response) => {
    if (response.isAuthenticated) {
      $('.unauthenticated-block').addClass("dn-hidden");
      $(".dn-login-regsitration-forms").hide();
      $("#dn-loggedinuser-coins").text(response.data.daan);
      $('.authenticated-block').removeClass("dn-hidden");
      $('.dn-profile .user-name').text(`${response.data.firstName} ${response.data.lastName}`);
      if(response.data.avatarPath){
        $('.dn-user-profile .dn-user-image').attr('src', "http://localhost:3000/" + response.data.avatarPath);
        $('.dn-profile-photo img').attr('src', "http://localhost:3000/" + response.data.avatarPath);
      }
    }
  })
  .catch((error) => {
    console.log(
      "Something went wrong while getting the authentication information",
      error
    );
  });

  function filterResult(data, searchText) {
    data = data.filter ((donation) => {
      return  donation.itemCategory.toLowerCase().indexOf(searchText) != -1 ||
              donation.itemDescription.toLowerCase().indexOf(searchText) != -1 ||
              donation.itemSubCategory.toLowerCase().indexOf(searchText) != -1 ||
              donation.itemTitle.toLowerCase().indexOf(searchText) != -1 ||
              false;
    })
    return data;
  }

  function loadRecentDonations(searchText) {
    fetch("http://localhost:3000/donation")
      .then((response) => response.json())
      .then((response) => {
        let $parent = $('.doantion-card-wrapper');
        let $template = $('.doantion-card-wrapper .single-card').eq(0);
        let $templateCopy
        let data = response.data;
        if (searchText) {
          data = filterResult(data,searchText)
          $parent.empty();
        }
        data.forEach((item,index) => {
          if (index === 0) {
            $templateCopy = $template;
          }else{
            $templateCopy = $template.clone();
          }
          let itemStr = JSON.stringify(item);
          $templateCopy.find('.dn-product-detail').val(itemStr);
          $templateCopy.find('.dn-product-title').text(item.itemTitle);
          if(item.images.length > 0) {
            console.log("http://localhost:3000/"+item.images[0]);
            $templateCopy.find('.dn-product-image').attr("src", "http://localhost:3000/"+item.images[0]);
          }else {
            $templateCopy.find('.dn-product-image').attr("src", "");
          }
          let address = `${item.contactInfo.address.city} , ${item.contactInfo.address.state} - ${item.contactInfo.address.zipcode}`;
          $templateCopy.find('.dn-product-address small').text(address);
          $parent.append($templateCopy);
        });
        $parent.addClass('dn-visible');
      });

  }
  loadRecentDonations();

  export {loadRecentDonations}
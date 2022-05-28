function populateCardData(data) {
  let container = $(document.getElementsByClassName('swiper-wrapper content'));
  let elem = $(document.getElementsByClassName('swiper-slide card'));
  $.each(data, (index, user) => {
    if (index == 0) {
      elem.find(".name").text(user.firstName);
      elem.find(".profession").text(user.email);
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
  credentials: 'include'
})
  .then((response) => response.json())
  .then((data) => {
    populateCardData(data);
  })
  .finally(() => {
    startSwiper();
  });

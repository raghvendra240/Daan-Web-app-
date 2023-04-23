let productDetail = localStorage['dn-product-detail'];
// localStorage.removeItem( 'dn-product-detail'); 
if(!productDetail){
    window.location('/');
}
productDetail = JSON.parse(productDetail);
let $parent = $('.carousel-inner');
let $template = $parent.find('.carousel-item');

/* Populate Image caracol data*/
productDetail.images.forEach(function(image, index) {
    let $templateClone = $template;
    if(index > 0) $templateClone = $template.clone();
    $templateClone.find('img').attr('src','http://localhost:3000/' + image);
    if(index > 0 ) $parent.append($templateClone); 
})

function getDateStr(date) {
    let dateObj = new Date(date);
    let month = dateObj.getMonth() + 1;
    let day = dateObj.getDate();
    let year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
}

$parent.find('.carousel-item:first').addClass('active');
$('.dn-title').text(productDetail.itemTitle);
$('.dn-category').text(`${productDetail.itemCategory} -> ${productDetail.itemSubCategory}`);
$('.dn-detail-info.donor .dn-info-value').text(`${productDetail.contactInfo.firstName}  ${productDetail.contactInfo.lastName}`);
$('.dn-detail-info.location .dn-info-value').text(`${productDetail.contactInfo.address.city} , ${productDetail.contactInfo.address.state} - ${productDetail.contactInfo.address.zipcode}`);
$('.dn-detail-info.donation-date .dn-info-value').text(getDateStr(productDetail.createdAt));
$('.dsecription-text').text(productDetail.itemDescription);
$('.js-required-coins').text(productDetail.daanCoins);

$('.dn-chat-with-donor-btn').click(function(e) {
    localStorage.setItem('donorId',productDetail.contactInfo._id);
    window.location.href = "/htmlPages/privateChat.html"
});

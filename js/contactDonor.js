let productDetail = localStorage['dn-product-detail'];
localStorage.removeItem( 'dn-product-detail' ); 
productDetail = JSON.parse(productDetail);
console.log("🚀 ~ file: contactDonor.js ~ line 4 ~ productDetail", productDetail)
let $parent = $('.carousel-inner');
let $template = $parent.find('.carousel-item');

/* Populate Image caracol data*/
productDetail.images.forEach(function(image, index) {
    let $templateClone = $template;
    if(index > 0) $templateClone = $template.clone();
    $templateClone.find('img').attr('src','http://localhost:3000/' + image);
    if(index > 0 ) $parent.append($templateClone); 
})

$parent.find('.carousel-item:first').addClass('active');
$('.dn-title').text(productDetail.itemTitle);
$('.dn-category').text(`${productDetail.itemCategory} -> ${productDetail.itemSubCategory}`);
$('.dn-detail-info.donor .dn-info-value').text(`${productDetail.contactInfo.firstName}  ${productDetail.contactInfo.lastName}`);
$('.dn-detail-info.location .dn-info-value').text(`${productDetail.contactInfo.address.city} , ${productDetail.contactInfo.address.state} - ${productDetail.contactInfo.address.zipcode}`);
// $('.dn-detail-info.donation-date .dn-info-value').text();
$('.dsecription-text').text(productDetail.itemDescription);

(async () => {
    let response = await fetch(`${BASE_BE_URL}/isAuthenticated`, {
        credentials: "include",
      });
      let result = await response.json();
      if(result.isAuthenticated == false) {
          window.location.replace('/');
      }else{
        $('#dn-firstname').val(result.data.firstName);
        $('#dn-lastname').val(result.data.lastName);
        let $emailElement = $('#dn-email');
        $emailElement.val(result.data.email);
        $emailElement.prop('disabled', true);
        $emailElement.addClass('dn-disable-input');
        $emailElement.removeClass('bg-light');
        $("#dn-phone").val(result.data.phone);
        if (result.data.address) {
          $('#dn-country').val(result.data.address.country);
          $('#dn-state').val(result.data.address.state);
          $('#dn-city').val(result.data.address.city);
          $('#dn-zipcode').val(result.data.address.zipcode);
          $('#dn-address').val(result.data.address.streetAddress);
        }
        if(result.data.avatarPath) {
          $('.dn-profile-image').attr('src', `${BASE_BE_URL}/${result.data.avatarPath}`)
        } else {
          $('.dn-profile-image').attr('src', `${BASE_FE_URL}/images/default-avatar.jpg`)
        }
        $(".dn-profile-update-main").show();
      }
  })();
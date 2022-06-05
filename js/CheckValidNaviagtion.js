(async () => {
    let response = await fetch("http://localhost:3000/isAuthenticated", {
        credentials: "include",
      });
      let result = await response.json();
      if(result.isAuthenticated == false) {
          window.location.replace('/');
      }else{
          console.log(result);
        $('#dn-firstname').val(result.data.firstName);
        $('#dn-lastname').val(result.data.lastName);
        let $emailElement = $('#dn-email');
        $emailElement.val(result.data.email);
        $emailElement.prop('disabled', true);
        $emailElement.css('cursor', 'not-allowed');
        $('.dn-profile-image').attr('src', "http://localhost:3000/"+result.data.avatarPath)
      }
  })();
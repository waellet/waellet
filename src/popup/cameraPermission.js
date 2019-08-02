
if(navigator.userAgent.indexOf("Firefox") != -1 ) {
    console.log('firefox')

    // browser.storage.sync.get('firefoxCameraAllowed').then(allowed => {
    //     if (allowed) {
    //         let extensionUrl = browser.extension.getURL ('./')
    //         browser.tabs.create({url: extensionUrl+'/popup/popup.html#/qrCodeReader', active: false});
    //     }
    //     else {
    //         console.log('Notallowed');
    
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
            .then((result) => {
                browser.storage.sync.set({ firefoxCameraAllowed: true}).then(() => {
                    let extensionUrl = browser.extension.getURL ('./')
                    browser.tabs.create({url: extensionUrl+'/popup/popup.html#/qrCodeReader', active: true});
                });
            }).catch((err) => {
                alert("You have denied the access to camera.")
            });
        }
    //     }
    // });
    
}


else if(navigator.userAgent.indexOf("Chrome") != -1 ) {
    console.log('chromaaaaaaaaaaaaa')
    console.log(navigator.userAgent)
    if (navigator.getUserMedia) {
        // Request the camera.
        navigator.getUserMedia(
            // Constraints
            {
                video: true
            },
    
            // Success Callback
            function(localMediaStream) {
                alert("You have allowed the chrome camera. Now, try again to create a vault for AirGap! :)")
                console.log("You have allowed the chrome camera. Now, try again to create a vault for AirGap! :)")
            },
    
            // Error Callback
            function(err) {
                // Log the error to the console.
                console.log('The following error occurred when trying to use getUserMedia: ' + err);
            }
        );
    
      } else {
        alert('Sorry, your browser does not support getUserMedia');
      }
}
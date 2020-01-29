const PopupConnection = { 

    onConnect() {
        console.log("this is onConnect method")
        browser.runtime.onConnect.addListener( async ( port ) => {
            console.log("port from popup connection", port)
        })
    }
}


export default PopupConnection
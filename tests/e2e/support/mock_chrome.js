const onBeforeLoad = (win) => {
    win.chrome = win.chrome || {};
    
    try {
        win.chrome.runtime = {
            getURL(url){
                let path = url.split("/").filter(u => u != "..").join("/");
                return Cypress.config().baseUrl + path;
            }
        };
        win.chrome.storage = {
            sync: {
                set(data,callback) {
                    for (let d in data) {
                        localStorage.setItem(d,data[d]);
                    }
                    callback();
                },
                get(data,callback) {
                    let res = {};
                    if(localStorage.getItem(data)){
                        res = {[data]:localStorage.getItem(data)};
                    }
                    callback(res);
                }
            } 
        };
    }catch(err) {

    }
}

export {onBeforeLoad};
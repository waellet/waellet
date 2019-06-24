// console.log('injected script');
// console.log("test");
// Subscribe from postMessages from page
const readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval)

        window.addEventListener("message", ({data}) => {
            console.log("tuk");
            // Handle message from page and redirect to background script
            chrome.runtime.sendMessage({ method: 'pageMessage', data })
        }, false)

        // Handle message from background and redirect to page
        chrome.runtime.onMessage.addListener(({ data }, sender) => {
            window.postMessage(data, '*')
        })
    }
}, 10)


function sendToBackground(method, params) {
    chrome.runtime.sendMessage({
        jsonrpc: "2.0",
        id: null,
        method,
        params
    })
}

// Render
function render(data) {
    // @TODO create list with sdks and his transaction with ability to accept/decline signing
}

function clickSign({target, value}) {
    const [sdkId, tx] = target.id.split['-'];
    signResponse({value, sdkId, tx})
}

function signResponse({value, sdkId, tx}) {
    sendToBackground('txSign', {value, sdkId, tx})
}
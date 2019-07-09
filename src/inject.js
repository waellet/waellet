import { extractHostName, detectBrowser } from './popup/utils/helper';

if(typeof navigator.clipboard == 'undefined') {
    redirectToWarning(extractHostName(window.location.href),window.location.href)
} else {
    chrome.runtime.sendMessage({
        method:'phishingCheck',
        data: {
            hostname:extractHostName(window.location.href),
            href:window.location.href
        }
    })
    
}

// Subscribe from postMessages from page

window.addEventListener("message", ({data}) => {
    // Handle message from page and redirect to background script
    chrome.runtime.sendMessage({ method: 'pageMessage', data })
}, false)

// Handle message from background and redirect to page
chrome.runtime.onMessage.addListener(({ data }, sender) => {
    if(data.method == 'phishingCheck') {
        if(data.blocked) {
            redirectToWarning(data.data.hostname,data.data.href,data.extUrl)
        }
    }
    // console.log(data)
    // window.postMessage(data, '*')
})

const redirectToWarning = (hostname,href,extUrl = '') => {
    window.stop()
    let extensionUrl = 'chrome-extension'
    if(detectBrowser() == 'Firefox') {
        extensionUrl = 'moz-extension'
    }
    let redirectUrl = ''
    if(extUrl != '') {
        redirectUrl = `${extUrl}phishing/phishing.html#hostname=${hostname}&href=${href}`
    }else {
        redirectUrl = `${extensionUrl}://${chrome.runtime.id}/phishing/phishing.html#hostname=${hostname}&href=${href}`
    }
    window.location.href = redirectUrl
    return
};

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
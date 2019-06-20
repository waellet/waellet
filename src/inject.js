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

import uuid from 'uuid';
// global.browser = require('webextension-polyfill');
let background;
const pendingRequests = {};

const unloadHandler = () => {
    if (!window.props.resolved) {
        background.postMessage({ action: 'deny' });
        if (window.hasOwnProperty('reject')) window.reject(new Error('Rejected by user'));
    }
};
  
const closingWrapper = f => (...args) => {
    window.props.resolved = true;
    window.removeEventListener('beforeunload', unloadHandler, true);
    f(...args);
    window.close();
    setTimeout(() => {
        window.close();
    }, 1000);
};

const setPopupData = data => {
    console.log(process.env.RUNNING_IN_POPUP)
    if (process.env.RUNNING_IN_POPUP) {
        window.props = data;
        console.log("data", data)
        window.addEventListener('beforeunload', unloadHandler, true);
        const resolve = () => background.postMessage({ action: 'accept' });
        const reject = () => background.postMessage({ action: 'deny' });
        window.props.resolve = closingWrapper(resolve);
        window.props.reject = closingWrapper(reject);
    }
};

const messageHandler = message => {
    if (!pendingRequests[message.uuid]) {
      if (message.type !== 'POPUP_INFO') throw new Error(`Can't find request with id: ${message.uuid}`);
      else return setPopupData(message);
    }
  
    pendingRequests[message.uuid].resolve(message);
};
  
const ensureBackgroundInitialised = async () => {
    if (background) return;
    background = await browser.runtime.connect({ name: process.env.RUNNING_IN_POPUP ? 'POPUP' : 'EXTENSION' });
    background.onMessage.addListener(messageHandler);
};
  
export const postMessage = async ({ type, payload }) => {
    await ensureBackgroundInitialised();
    const id = uuid();
    background.postMessage({ type, payload, uuid: id });
    return new Promise((resolve, reject) => {
        pendingRequests[id] = { resolve, reject };
    });
};
  
export const setMessageListener = async cb => {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        cb(message, sender, sendResponse);
    });
};
  
export const readWebPageDom = cb => {
    setMessageListener((message, sender, sendResponse) => {
        if (message.from === 'content' && message.type === 'readDom' && sender.id === browser.runtime.id) {
        cb({ address: message.data, host: sender.url }, sendResponse);
        }
    });
};
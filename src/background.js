import { phishingCheckUrl, getPhishingUrls, setPhishingUrl } from './popup/utils/phishing-detect';
import { checkAeppConnected, removeTxFromStorage, parseFromStorage, detectConnectionType } from './popup/utils/helper';
import WalletController from './wallet-controller';
import Notification from './notifications';
import rpcWallet from './lib/rpcWallet';
import { HDWALLET_METHODS, AEX2_METHODS, NOTIFICATION_METHODS, CONNECTION_TYPES } from './popup/utils/constants';
import { setController, contractCallStatic } from './popup/utils/aepp-utils'; // for Aepp object should be deprecated
import { PopupConnections } from './lib/popup-connection';

global.browser = require('webextension-polyfill');

// for Aepp object should be deprecated
const error = {
  error: {
    code: 1,
    data: {
      request: {},
    },
    message: 'Transaction verification failed',
  },
  id: null,
  jsonrpc: '2.0',
};

const controller = new WalletController();
const notification = new Notification();
setController(controller); // for Aepp object should be deprecated
browser.runtime.onMessage.addListener((msg, sendResponse) => {
  switch (msg.method) {
    case 'phishingCheck':
      const data = { ...msg, extUrl: browser.extension.getURL('./') };
      phishingCheckUrl(msg.params.hostname).then(res => {
        if (typeof res.result !== 'undefined' && res.result == 'blocked') {
          const whitelist = getPhishingUrls().filter(url => url === msg.params.hostname);
          if (whitelist.length) {
            data.blocked = false;
            return postPhishingData(data);
          }
          data.blocked = true;
          return postPhishingData(data);
        }
        data.blocked = false;
        return postPhishingData(data);
      });
      break;
    case 'setPhishingUrl':
      const urls = getPhishingUrls();
      urls.push(msg.params.hostname);
      setPhishingUrl(urls);
      break;
    case 'aeppMessage': // for Aepp object should be deprecated
      switch (msg.params.type) {
        case 'txSign':
          checkAeppConnected(msg.params.hostname).then(check => {
            if (check) {
              openAeppPopup(msg, 'txSign').then(res => {
                sendResponse(res);
              });
            } else {
              error.error.message = 'Account not connected. Establish connection first';
              error.id = msg.id;
              sendResponse(error);
            }
          });
          break;

        case 'connectConfirm':
          checkAeppConnected(msg.params.params.hostname).then(check => {
            if (!check) {
              openAeppPopup(msg, 'connectConfirm').then(res => {
                sendResponse(res);
              });
            } else {
              error.error.message = 'Connection already established';
              error.id = msg.id;
              sendResponse(error);
            }
          });
          break;

        case 'getAddress':
          browser.storage.local.get('userAccount').then(user => {
            browser.storage.local.get('isLogged').then(data => {
              if (data.isLogged && data.hasOwnProperty('isLogged')) {
                browser.storage.local.get('subaccounts').then(subaccounts => {
                  browser.storage.local.get('activeAccount').then(active => {
                    let activeIdx = 0;
                    if (active.hasOwnProperty('activeAccount')) {
                      activeIdx = active.activeAccount;
                    }
                    const address = subaccounts.subaccounts[activeIdx].publicKey;
                    sendResponse({ id: null, jsonrpc: '2.0', address });
                  });
                });
              } else {
                sendResponse({ id: null, jsonrpc: '2.0', address: '' });
              }
            });
          });
          break;

        case 'contractCall':
          checkAeppConnected(msg.params.hostname).then(check => {
            if (check) {
              if (typeof msg.params.callType !== 'undefined' && msg.params.callType == 'static') {
                if (msg.params.hasOwnProperty('tx') && msg.params.tx.hasOwnProperty('params')) {
                  msg.params.tx.params = parseFromStorage(msg.params.tx.params);
                }
                contractCallStatic(msg.params)
                  .then(res => {
                    res.id = msg.id;
                    sendResponse(res);
                  })
                  .catch(err => {
                    error.error.message = err;
                    error.id = msg.id;
                    sendResponse(error);
                  });
              } else {
                openAeppPopup(msg, 'contractCall').then(res => {
                  sendResponse(res);
                });
              }
            } else {
              error.error.message = 'Account not connected. Establish connection first';
              error.id = msg.id;
              sendResponse(error);
            }
          });

          break;

        case 'signMessage':
          checkAeppConnected(msg.params.hostname).then(check => {
            if (check) {
              openAeppPopup(msg, 'signMessage').then(res => {
                sendResponse(res);
              });
            } else {
              error.error.message = 'Account not connected. Establish connection first';
              error.id = msg.id;
              sendResponse(error);
            }
          });
          break;

        case 'verifyMessage':
          checkAeppConnected(msg.params.hostname).then(check => {
            if (check) {
              openAeppPopup(msg, 'verifyMessage').then(res => {
                sendResponse(res);
              });
            } else {
              error.error.message = 'Account not connected. Establish connection first';
              error.id = msg.id;
              sendResponse(error);
            }
          });
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }

  return true;
});

/**
 * for Aepp object should be deprecated
 */
const connectToPopup = (cb, type, id) => {
  browser.runtime.onConnect.addListener(port => {
    port.onMessage.addListener((msg, sender) => {
      msg.id = sender.name;
      if (id === sender.name) cb(msg);
    });
    port.onDisconnect.addListener(async event => {
      const list = await removeTxFromStorage(event.name);
      browser.storage.local.set({ pendingTransaction: { list } }).then(() => {});
      browser.storage.local.remove('showAeppPopup').then(() => {});
      error.id = event.name;
      if (event.name === id) {
        if (type === 'txSign') {
          error.error.message = 'Transaction rejected by user';
          cb(error);
        } else if (type === 'connectConfirm') {
          error.error.message = 'Connection canceled';
          cb(error);
        } else if (type === 'contractCall') {
          error.error.message = 'Transaction rejected by user';
          cb(error);
        } else {
          cb();
        }
      }
    });
  });
};

/**
 * for Aepp object should be deprecated
 */
const openAeppPopup = (msg, type) =>
  new Promise(resolve => {
    browser.storage.local.set({ showAeppPopup: { data: msg.params, type } }).then(() => {
      browser.windows
        .create({
          url: browser.runtime.getURL('./popup/popup.html'),
          type: 'popup',
          height: 680,
          width: 420,
        })
        .then(() => {
          connectToPopup(
            res => {
              resolve(res);
            },
            type,
            msg.params.id
          );
        });
    });
  });

const postPhishingData = data => {
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    const message = { method: 'phishingCheck', data };
    tabs.forEach(({ id }) => browser.tabs.sendMessage(id, message));
  });
};

/**
 * AEX-2 RpcWallet Init
 */
const popupConnections = PopupConnections();
popupConnections.init();
rpcWallet.init(controller, popupConnections);
browser.runtime.onConnect.addListener(async port => {
  if (port.sender.id === browser.runtime.id) {
    const connectionType = detectConnectionType(port);
    if (connectionType === CONNECTION_TYPES.EXTENSION) {
      port.onMessage.addListener(async ({ type, payload, uuid }) => {
        if (HDWALLET_METHODS.includes(type)) {
          port.postMessage({ uuid, res: await controller[type](payload) });
        }
        if (AEX2_METHODS[type]) rpcWallet[type](payload);

        if (NOTIFICATION_METHODS[type]) notification[type](payload);
      });
    } else if (connectionType === CONNECTION_TYPES.POPUP) {
      const url = new URL(port.sender.url);
      const id = url.searchParams.get('id');
      popupConnections.addConnection(id, port);
    } else if (connectionType === CONNECTION_TYPES.OTHER) {
      const check = rpcWallet.sdkReady(() => {
        rpcWallet.addConnection(port);
      });
      port.onDisconnect.addListener(() => {
        clearInterval(check);
      });
    }
  }
});

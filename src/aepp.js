import uuid from 'uuid';
import { checkAddress, chekAensName, stringifyForStorage } from './popup/utils/helper';

const Aepp = {
  request: {
    sign({ recipientId, amount }) {
      const error = {
        id: null,
        jsonrpc: '2.0',
        data: {
          request: {},
        },
        error: {},
      };
      if (!checkAddress(recipientId) && !chekAensName(recipientId)) {
        error.error = {
          code: 1,
          message: 'Enter correct recipient',
        };
        return new Promise((resolve, reject) => {
          resolve(error);
        });
      }
      if (amount <= 0) {
        error.error = {
          code: 1,
          message: 'Enter correct amount',
        };

        return new Promise((resolve, reject) => {
          resolve(error);
        });
      }
      const req = {
        id: uuid(),
        method: 'aeppMessage',
        type: 'txSign',
        tx: {
          recipientId,
          amount,
        },
        hostname: window.location.host,
      };
      window.postMessage(req, '*');
      return new Promise((resolve, reject) => {
        receiveResponse(res => {
          resolve(res);
        }, req.id);
      });
    },
    connect() {
      const req = {
        id: uuid(),
        method: 'aeppMessage',
        type: 'connectConfirm',
        params: {
          hostname: window.location.host,
          protocol: window.location.protocol,
          title: document.title,
        },
      };
      window.postMessage(req, '*');
      return new Promise((resolve, reject) => {
        receiveResponse(r => {
          resolve(r);
        }, req.id);
      });
    },
    contractCallStatic({ source, address, method, params = [], options = {} }) {
      const req = {
        id: uuid(),
        method: 'aeppMessage',
        type: 'contractCall',
        callType: 'static',
        tx: {
          source,
          address,
          method,
          params: stringifyForStorage(params),
          options,
        },
        hostname: window.location.host,
      };
      window.postMessage(req, '*');
      return new Promise((resolve, reject) => {
        receiveResponse(r => {
          resolve(r);
        }, req.id);
      });
    },
    contractCall({ source, address, method, params = [], options = {} }) {
      const req = {
        id: uuid(),
        method: 'aeppMessage',
        type: 'contractCall',
        callType: 'pay',
        tx: {
          source,
          address,
          method,
          params: stringifyForStorage(params),
          options,
        },
        hostname: window.location.host,
      };
      window.postMessage(req, '*');
      return new Promise((resolve, reject) => {
        receiveResponse(r => {
          resolve(r);
        }, req.id);
      });
    },
    signMessage({ message }) {
      const req = {
        id: uuid(),
        method: 'aeppMessage',
        type: 'signMessage',
        msg: {
          text: message,
        },
        hostname: window.location.host,
      };
      window.postMessage(req, '*');
      return new Promise((resolve, reject) => {
        receiveResponse(r => {
          resolve(r);
        }, req.id);
      });
    },
    verifyMessage({ message, signature, publicKey }) {
      const req = {
        id: uuid(),
        method: 'aeppMessage',
        type: 'verifyMessage',
        msg: {
          text: message,
          signature,
          publicKey,
        },
        hostname: window.location.host,
      };
      window.postMessage(req, '*');
      return new Promise((resolve, reject) => {
        receiveResponse(r => {
          resolve(r);
        }, req.id);
      });
    },
  },
  get: {
    address() {
      const req = {
        id: uuid(),
        method: 'aeppMessage',
        type: 'getAddress',
      };
      window.postMessage(req, '*');
      return new Promise((resolve, reject) => {
        receiveResponse(res => {
          resolve(res);
        });
      });
    },
  },
};

const receiveResponse = (cb, id) => {
  window.addEventListener('message', ({ data }) => {
    if (data.method == 'aeppMessage' && data.hasOwnProperty('resolve')) {
      if (data.id == id) cb(data);
    }
  });
};

window.Aepp = Aepp;

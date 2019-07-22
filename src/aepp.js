import uuid from 'uuid';
const Aepp = {
    request: {
        sign({ recipientId, amount }){
            let error = {
                id: null,
                jsonrpc: "2.0",
                data:{
                    request: {
    
                    }
                },
                error: {}
            }
            if(amount <= 0) {
                error.error = {
                    code:1,
                    message: "Enter correct amount"
                }
    
                return new Promise((resolve,reject) => {
                    resolve(error)
                });
            }
            let req = {
                id:uuid(),
                method:'aeppMessage',
                type:"txSign",
                tx: {
                    recipientId,
                    amount
                },
                hostname: window.location.host
            }
            window.postMessage(req, '*')
            return new Promise((resolve,reject) => {
                receiveResponse((res) => {
                    resolve(res)
                }, req.id)
            })
            
        },
        connect() {
            let req = {
                id:uuid(),
                method:'aeppMessage',
                type:"connectConfirm",
                params: {
                    hostname:window.location.host,
                    protocol:window.location.protocol,
                    title:document.title
                }
            }
            window.postMessage(req, '*')
            return new Promise((resolve,reject) => {
                receiveResponse((r) => {
                    resolve(r)
                }, req.id)
            })
        },
        contractCallStatic({source,address, method, params = []}) {
            let req = {
                id:uuid(),
                method: "aeppMessage",
                type:"contractCall",
                callType:"static",
                tx: {
                    source,
                    address,
                    method,
                    params
                },
                hostname:window.location.host
            }
            window.postMessage(req, '*')
            return new Promise((resolve, reject) => {
                receiveResponse((r) => {
                    resolve(r)
                }, req.id)
            })
        },
        contractCall({source, address, method, params = []}) {
            let req = {
              id:uuid(),
              method: "aeppMessage",
              type:"contractCall",
              callType:"pay",
              tx: {
                  source,
                  address,
                  method,
                  params
              },
              hostname:window.location.host
            }
            window.postMessage(req, '*')
            return new Promise((resolve, reject) => {
                receiveResponse((r) => {
                    resolve(r)
                }, req.id)
            })
        }
    },
    get: {
        address() {
            let req = {
                id:uuid(),
                method:'aeppMessage',
                type:"getAddress"
            }
            window.postMessage(req, '*')
            return new Promise((resolve,reject) => {
                receiveResponse((res) => {
                    resolve(res)
                })
            })
        }
    }
    
}

const receiveResponse = (cb, id) => {
    window.addEventListener("message", ({data}) => {
        if(data.method == "aeppMessage" && data.hasOwnProperty("resolve")) {
            if(data.id == id) cb(data)
            
        }
    });
}

window.Aepp = Aepp 
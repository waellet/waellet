
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
            if(recipientId == "" || recipientId.length != 53) {
                error.error = {
                    code:1,
                    message: "Enter correct public address"
                }
    
                return new Promise((resolve,reject) => {
                    resolve(error)
                });
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
                })
            })
            
        },
        connect() {
            let req = {
                method:'aeppMessage',
                type:"connectConfirm",
                params: {
                    hostname:window.location.host,
                    protocol:window.location.protocol,
                    title:document.title
                }
            }
            window.postMessage(req, '*')
            return new window.Promise((resolve,reject) => {
                receiveResponse((r) => {
                    resolve(r)
                })
            })
        },
        contractCall({source,address, method, params}) {
            console.log(address)
            console.log(method)
            console.log(params)
            let req = {
                method: "aeppMessage",
                type:"contractCall",
                params: {
                    source,
                    address,
                    method,
                    params
                }
            }
            window.postMessage(req, '*')
            return new Promise((resolve, reject) => {
                receiveResponse((r) => {
                    resolve(r)
                })
            })
        }
    },
    get: {
        address() {
            let req = {
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

const receiveResponse = (cb) => {
    window.addEventListener("message", ({data}) => {
        if(data.method == "aeppMessage" && data.hasOwnProperty("resolve")) {
            cb(data)
        }
    });
}


window.Aepp = Aepp 
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
            return new Promise((resolve,reject) => {
                receiveResponse((res) => {
                    resolve(res)
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
    window.addEventListener('ReceiveWalletResponse', (e) => {
        cb(e.detail) 
        window.removeEventListener('ReceiveWalletResponse', () => {})
    })
}

window.Aepp = Aepp 
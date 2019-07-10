const Aepp = {
    signAndSend({ recipientId, amount }){
        let req = {
            method:'aeppMessage',
            type:"txSign",
            tx: {
                recipientId,
                amount
            }
        }
        window.postMessage(req, '*')
        return new Promise((resolve,reject) => {
            receiveResponse((res) => {
                resolve(res)
            })
        })
    },
    registerProvider() {
        console.log("register provider")
    }
}

const receiveResponse = (cb) => {
    window.addEventListener('ReceiveWalletResponse', (e) => {
        cb(e.detail) 
        window.removeEventListener('ReceiveWalletResponse', () => {})
    })
}

window.Aepp = Aepp 
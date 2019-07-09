const Aepp = {
    signAndSend({ address, amount }){
        let req = {
            method:'aeppMessage',
            type:"txSign",
            tx: {
               address,
               amount
            },
            a:function() {
                console.log("asdasd")
            }
        }
        window.postMessage(JSON.stringify(req), '*')

    },
    registerProvider() {
        console.log("register provider")
    }
}

function evnt() {
    return new Promise((resolve, reject) => {
        let ev = new CustomEvent('StorageRequest', {
          detail: {
              test:() => {
                  console.log("asd")
              }
          }
        })
        console.log(resolve)
        window.dispatchEvent(ev)
    })
}

window.abc = function() {
    console.log("here")
    evnt()
    .then(res => {
        console.log(res)
    })
    
}
window.Aepp = Aepp
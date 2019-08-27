import uuid from 'uuid';




export const start = async (browser) =>  {

   return browser.runtime.connect({ name: 'popup' })
}

export const postMesssage = async (connection, { type, payload }) => {
    let id = uuid()
    connection.postMessage({ type, payload, uuid:id  })
    return new Promise((resolve, reject) => {
        connection.onMessage.addListener((msg) => {
            if(msg.uuid == id) {
                resolve(msg)
            }
        })
    })
}

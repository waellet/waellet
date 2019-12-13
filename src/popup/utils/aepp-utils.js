export const getActiveAccount  = () => {
    return new Promise((resolve, rejet) => {
        browser.storage.local.get('isLogged').then((data) => {
            if (data.isLogged && data.hasOwnProperty('isLogged')) {
                browser.storage.local.get('subaccounts').then((subaccounts) => {
                    browser.storage.local.get('activeAccount').then((active) => {
                        let activeIdx = 0
                        if(active.hasOwnProperty("activeAccount")) {
                            activeIdx = active.activeAccount
                        }
                        let address = subaccounts.subaccounts[activeIdx].publicKey
                        resolve(address)
                    })
                })
            } else {
                resolve(false)
            }
        })
    })
    
}
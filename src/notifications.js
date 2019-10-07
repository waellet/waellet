global.browser = require('webextension-polyfill');
const { Universal: Ae, Crypto } = require('@aeternity/aepp-sdk')
import { networks } from './popup/utils/constants';
import { detectBrowser } from './popup/utils/helper';

export default class Notification {

    constructor() {
        this.init()
    }

    async init() {
        let { activeNetwork } = await browser.storage.sync.get('activeNetwork')
        this.network = networks.Testnet
        if(typeof activeNetwork != "undefined") {
            this.network = networks[activeNetwork]
        }
        this.client = await Ae({
            url: this.network.url,
            internalUrl: this.network.internalUrl,
            networkId: this.network.networkId,
            compilerUrl: 'https://compiler.aepps.com'
        })
        
        setInterval(() => {
            this.checkTxReady();
        },2000)

    }

    async getAllNotifications() {
        let { processingTx } = await browser.storage.sync.get('processingTx');
        return processingTx;
    }

    async deleteNotification(tx) {
        let { processingTx } = await browser.storage.sync.get('processingTx');
        let list = [
            ...processingTx
        ];
        list = list.filter(t => t != tx)
        await browser.storage.sync.set({ processingTx: list })
    }
    
    async checkTxReady () {
        let noties = await this.getAllNotifications()
        if(noties) {
            noties.forEach(async (tx, index ) => {
                if (tx != "error") {
                    let res = await this.client.poll(tx)
                    let url = this.network.explorerUrl + '/#/tx/' + tx
                    this.sendNoti({ title: 'Transaction ready', message: 'You can expore your transaction at: ', contextMessage: url})
                } else {
                    this.sendNoti({ title: 'Transaction error', message: 'Transaction cannot be processed '})
                }
                
                
                await this.deleteNotification(tx)
            })
        }
        
    }
    
    async sendNoti ({ title, message, contextMessage }) {
        let params = {
            'type': 'basic',
            'title': title,
            'iconUrl':browser.runtime.getURL('../../../icons/icon_48.png'),
            'message': message,
            'priority': 2,
            
        }
        if(detectBrowser() != 'Firefox') {
            params = {
                ...params,
                'buttons': [
                    { title: 'See transaction details' }
                ]
            }
        }

        let noti = browser.notifications.create(`popup.html?${contextMessage}`,params )
        browser.notifications.onButtonClicked.addListener((id) => {
            browser.tabs.create({url: id.split('?')[1], active: true});
        })
    }
    
}


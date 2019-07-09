<template>
    <div>
        {{data}}
        <ae-list class="spendTxDetailsList">
            <ae-list-item fill="neutral" class="flex-justify-between whiteBg">
                <div class="flex flex-align-center accountFrom">
                    <ae-identicon :address="data.senderId" />
                    <ae-address :value="data.senderId" length="short" class="spendAccountAddr" />
                </div>
                <ae-filter-separator />
                <div class="arrowSeprator">
                    <ae-icon name="left-more" />
                </div>
                <div class="flex flex-align-center accountTo">
                    <ae-identicon :address="data.recipientId" />
                    <ae-address :value="data.recipientId" length="short" class="spendAccountAddr" />
                </div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-justify-between">
                <div class="balance balanceSpend">{{amount}}</div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-justify-between whiteBg">
                <div>Transaction fee</div>
                <div class="balance balanceBig txFee">{{fee}}</div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-justify-between whiteBg">
                <div>Total</div>
                <div class="balance balanceBig balanceTotalSpend">{{amount + fee}}</div>
            </ae-list-item>
         </ae-list>
        <ae-button-group class="btnFixed">
            <ae-button face="round" fill="primary" @click="cancelTransaction">Cancel</ae-button>
            <ae-button face="round" fill="alternative" @click="signTransaction">Sign</ae-button>
        </ae-button-group>
    </div>
</template>

<script>
import locales from '../../locales/locales.json'
import { mapGetters } from 'vuex';
import { convertToAE } from '../../utils/helper';

export default {
    data(){
        return {
            data: {
                senderId:'ak_5',
                recipientId:'ak_5'
            },
            port:null
        };
    },
    
    locales,
    methods: {

    },
    mounted() {
        // chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
        //     console.log(response)
        // });
        
        console.log(this.data)
        browser.storage.sync.set({pendingTransaction:{data:this.data}}).then(() => { });
    },
    created(){
        console.log("created")
        this.port = chrome.extension.connect({ name: "conn" });
       
        
        this.port.onMessage.addListener((msg, sender,sendResponse) => {
            console.log("message recieved" + msg);
        });
    },
    computed: {
        ...mapGetters(['account']),
        amount() {
            return convertToAE(this.data.amount)
        },
        fee() {
            return convertToAE(this.data.fee)
        }
    },
    methods: {
        cancelTransaction() {
            //TO DO close the popup window
            this.port.postMessage({sign:false})
            browser.storage.sync.set({pendingTransaction:''}).then(() => { });
            browser.storage.sync.get('showAeppPopup', data => {
                if(data.hasOwnProperty('showAeppPopup') && data.showAeppPopup.hasOwnProperty('type') && data.showAeppPopup.hasOwnProperty('data') && data.showAeppPopup.type != "" ) {
                   
                }else {
                    this.$router.push('/');
                }
            });
        },
        signTransaction() {
            this.port.postMessage({sign:true})
            browser.storage.sync.set({pendingTransaction:''}).then(() => { });
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.balanceSpend {
    font-size:2.5rem;
    color:#000;
}
.spendTxDetailsList .ae-list-item {
    padding:1rem;
    position:relative;
    cursor: unset;
    text-transform: uppercase;
}
.spendTxDetailsList .ae-button {
    margin-bottom:0 !important;
}
.arrowSeprator {
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    -webkit-transform:translate(-50%,-50%);
    -ms-transform:translate(-50%,-50%);
    background: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    text-align: center;
    vertical-align: middle;
    padding-left: 1px;
    padding-top:2px;
    border: 1px solid #d8d8d8;
}
.arrowSeprator .ae-icon {
    font-size:1.2rem !important;
    float:none !important;
}
.whiteBg {
    background:#fff;
}
.spendAccountAddr {
    padding:0 0.5rem !important;
    font-weight:bold !important;
}
</style>

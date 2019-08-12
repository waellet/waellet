<template>
    <div>
        <div class="popup">
            <div class="actions">
                <button class="backbutton toAccount" @click="navigateAccount"><ae-icon name="back" /> {{language.buttons.backToAccount}}</button>
            </div>
        
            <h3>{{language.pages.tokens.addHeading}}</h3>
            <div v-if="addStep == false" class="token-add-form">
                <ae-panel>
                    <h4>{{language.pages.tokens.addToken}}</h4>
                    <hr>
                    <div class="input-container">
                        <ae-input :label="language.pages.tokens.tokenContractLabel" >
                            <input type="text" class="ae-input token-contract" @keyup="validate('contract')"  v-model="token.contract" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                            <ae-toolbar slot="footer">
                                Valid token contract address
                            </ae-toolbar>
                        </ae-input>
                    </div>
                    <div class="input-container">
                        <ae-input :label="language.pages.tokens.tokenSymbolLabel">
                            <input type="text" :disabled="token.precisionDisabled" class="ae-input token-symbol" @keyup.native="validate('symbol')" v-model="token.symbol" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                            <ae-toolbar slot="footer">
                                Symbol between 1 and 12 characters
                            </ae-toolbar>
                        </ae-input>
                    </div>
                    <div class="input-container">
                        <ae-input :label="language.pages.tokens.tokenPrecision" >
                            <input type="text" :disabled="token.precisionDisabled" class="ae-input token-precision" @keyup.native="validate('precision')" v-model="token.precision" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                            <ae-toolbar slot="footer" >
                                Number between 0 and 36
                            </ae-toolbar>
                        </ae-input>
                    </div>
                    <ae-button face="round" fill="primary" @click="next" class="to-confirm-add" extend >{{language.pages.tokens.next}}</ae-button>
                </ae-panel>
            </div>
            <div v-if="addStep" >
                <ae-panel>
                    <h4>{{language.pages.tokens.addToken}}</h4>
                    <hr>
                    <div class="flex  flex-justify-between token-add-holder">
                        <div>
                            <div class="token-title">Token</div>
                            <div class="flex ">
                                <ae-identicon :address="token.contract" />
                                <div class="balanceBig balance no-sign">{{token.symbol}}</div>
                            </div>
                        </div>
                        <div>
                            <div class="token-title">Balance</div>
                            <div class="balanceBig balance no-sign">{{token.balance}} {{token.symbol}}</div>
                        </div>
                    </div>
                    <ae-button face="round" fill="primary" @click="addCustomToken" class="add-token" extend >{{language.pages.tokens.addToken}}</ae-button>
                </ae-panel>
            </div>
        </div>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
        <Loader size="big" :loading="loading" type="transparent" ></Loader>
    </div>
</template>

<script>
import locales from '../../locales/locales.json';
import { mapGetters } from 'vuex';
import { FUNGIBLE_TOKEN_CONTRACT } from '../../utils/constants';
export default {
    data() {
        return {
            activeTab:'add',
            language: locales['en'],
            token: {
                contract:'',
                symbol:'',
                precision:1,
                precisionDisabled:false,
                balance:0,
                name:''
            },
            error: {
                type:null,
                msg:null
            },
            addStep:false,
            loading:false,
            timer: ''
        }
    },
    locales,
    computed: {
        ...mapGetters(['sdk','account','tokens','popup'])
    },
    async created() {
    },
    methods:{
        switchTabs(tab) {
            this.activeTab = tab
        },
        tabAcitveClass(tab) {
            return this.activeTab == tab ? 'tab-active' : ''
        },
        navigateAccount() {
            this.$router.push('/account')
        },
        validate(type) {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            this.timer = setTimeout(() => {
                if(type == 'contract') {
                    this.token.precisionDisabled = false
                    // if(this.token.contract.length == 53) {
                        this.searchTokenMetaInfo(this.token.contract)
                    // }
                }
            }, 3000);
        },
        async next() {
            let added = this.tokens.find(tkn => tkn.contract == this.token.contract && tkn.parent == this.account.publicKey)
            if( 
                (this.token.contract.length != 53 && this.token.contract.length != 54 &&  this.token.contract.length != 52) ||
                (this.token.symbol.length < 1 || this.token.symbol.length > 12) || 
                isNaN(this.token.precision) ||
                (!isNaN(this.token.precision) && (this.token.precision < 1 || this.token.precision > 36 ))
            ) {
                this.$store.dispatch('popupAlert', { name: 'account', type: 'token_add'})
            }else if(typeof added != 'undefined'){
                this.$store.dispatch('popupAlert', { name: 'account', type: 'token_exists'})
            }else {
                this.loading = true
                let call = await this.sdk.contractCallStatic(FUNGIBLE_TOKEN_CONTRACT,this.token.contract,'balance',[this.account.publicKey])
                let balance = await call.decode()
                this.loading = false
                this.token.balance = balance == 'None' ? 0 : balance.Some[0]
                this.addStep = true
            }
        },
        async addCustomToken() {
            let tokens = this.tokens.map(tkn => tkn)
            tokens.push({
                contract:this.token.contract,
                name:this.token.name,
                symbol:this.token.symbol,
                precision:this.token.precision,
                balance:this.token.balance,
                parent:this.account.publicKey
            })
            this.$store.dispatch('setTokens', tokens).then(() => {
                browser.storage.sync.set({ tokens: this.tokens}).then(() => { 
                    this.$store.dispatch('popupAlert', {
                            name: 'account',
                            type: 'added_success'
                        }).then(() => { 
                            this.token.contract = ""
                            this.token.symbol = ""
                            this.token.precision = 0
                            this.token.precisionDisabled = false
                            this.addStep = false
                        });
                });
            });
        },
        searchTokenMetaInfo(address) {
            this.loading = true
            try {
                this.sdk.contractCallStatic(FUNGIBLE_TOKEN_CONTRACT,address,'meta_info')
                .then((res) => {
                    res.decode()
                    .then(data => {
                        if(typeof data.decimals != 'undefined' && typeof data.symbol != 'undefined') {
                            this.token.precision = data.decimals
                            this.token.symbol = data.symbol
                            this.token.name = data.name
                            this.addToken = true
                            this.token.precisionDisabled = true
                        }
                        this.loading = false
                    })
                    .catch(e => {
                        this.$store.dispatch('popupAlert', { name: 'account', type: 'token_invalid_address'})
                        this.loading = false
                    })
                })
                .catch(e => { 
                    this.$store.dispatch('popupAlert', { name: 'account', type: 'token_invalid_address'})
                    this.loading = false
                })
            }catch(e) {
                this.$store.dispatch('popupAlert', { name: 'account', type: 'token_invalid_address'})
                this.loading = false
            }
            
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.actions {
  width: 50%;
  margin-top: 5px;
}
.tabs {
    margin-top:1rem;
}
.tabs span {
    width:49%;
}
.token-title {
    font-size:1.1rem;
    text-align: left;
    margin-bottom:1rem;
}
.token-add-holder {
    margin-bottom:2rem;
}
.token-add-holder > div:first-child {
    width:60%;
}
.token-add-holder > div:last-child {
    width:40%;
}
.token-add-holder > div div {
    text-align: left;
    color:$color-secondary;
}
.token-add-holder .ae-identicon {
    height:3rem !important;
    margin-right:1rem;
}

</style>

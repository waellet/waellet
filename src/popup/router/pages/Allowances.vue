<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateUtilities"><ae-icon name="back" /> {{language.buttons.backToUtilities}}</button>
        </div>
        <h3 style='text-align:center;'>{{language.pages.allowances.heading}}</h3>
        <br>
        <div class="allowance-form">
            <select class="allowance-token-dropdown" @change="onChange($event)" v-model="selected">
                <option value="default" disabled>Choose a token</option>
                <option v-for="(tok, key) in filteredTokens" :value="tok.key">
                {{tok.name}}
                </option>
            </select>
            <ae-input class="allowance-address" v-model="form.to_account" label="Address"></ae-input>
            <ae-input class="allowance-value" v-model.number="form.value" type="number" label="Value"></ae-input>
            <ae-button @click="makeAllowance" face="round" fill="primary" extend>Submit</ae-button>
        </div>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
        <Loader size="big" :loading="loading" type="transparent" ></Loader>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';
import QrcodeVue from 'qrcode.vue';
import Wallet from '@aeternity/aepp-sdk/es/ae/wallet';
import { MemoryAccount } from '@aeternity/aepp-sdk';
import { MAGNITUDE, MIN_SPEND_TX_FEE, MIN_SPEND_TX_FEE_MICRO } from '../../utils/constants';
import BigNumber from 'bignumber.js';
import Ae from '@aeternity/aepp-sdk/es/ae/universal';
import { getHdWalletAccount } from '../../utils/hdWallet';
import { FUNGIBLE_TOKEN_CONTRACT } from '../../utils/constants';
import FungibleTokensVue from './FungibleTokens.vue';
import { isNumber } from 'util';

export default {
    data() {
        return {
            language: locales['en'],
            loading: false,
            form: {
                to_account: '',
                value: '0',
            },
            selected: 'default',
        }
    },
    locales,
    computed: {
        ...mapGetters(['account', 'balance', 'network', 'current', 'wallet', 'activeAccount', 'subaccounts', 'tokenSymbol', 'tokenBalance', 'sdk', 'tokens', 'popup']),
        filteredTokens() {
            return this.tokens.filter((t,index) => {
                t.key = index;
                return t.parent == this.account.publicKey && t.name != 'AE'
            });
        }
    },
    methods: {
        onChange(event) {
            this.selected = event.target.value;
        },
        makeAllowance() {
            // if (this.selected == '' || this.selected == 'default') {
            //     this.$store.dispatch('popupAlert', {
            //         name: 'account',
            //         type: 'not_selected_val'
            //     })
            // }
            // else if (this.form.to_account == '' || this.form.value.length == 0) {
            //     this.$store.dispatch('popupAlert', {
            //         name: 'account',
            //         type: 'requiredField'
            //     });
            //     console.log(this.form.to_account);
            //     console.log(this.form.value);
            //     console.log(typeof this.form.value);
            // }
            // else {
            //     if (this.form.value < 0) {
            //         this.$store.dispatch('popupAlert', {
            //             name: 'account',
            //             type: 'invalid_number'
            //         })
            //     }
            //     else {
                    console.log(this.tokens);
                    this.tokens.forEach(async element => {
                        if (element.key == this.selected) {
                            console.log('da');
                            let value = (this.form.value).toString();
                            console.log(element);
                            let call = await this.sdk.contractCall(FUNGIBLE_TOKEN_CONTRACT, element.contract , 'create_allowance', [this.form.to_account,value])
                            console.log(call);
                            console.log('____________________');
                            let dec = await call.decode()
                            console.log(dec);
                        }
                    });
            //     }
            // }
        },
        openAllowencesPage() {
            this.$router.push('/allowances');
        },
        navigateUtilities() {
            this.$router.push('/utilities')
        },
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.allowance-token-dropdown {
    margin-bottom: 1rem;
    width: 100%;
    height: 4rem;
    background: #ececec;
    border: 0;
    font-size: 19px;
    text-align: center;
    padding: 10px;
}
.allowance-token-dropdown:active, .allowance-token-dropdown:focus {
    border: none;
    outline: none;
    border-left: 2px solid #ff0d6a;
}
.allowance-token-dropdown option {
    height: 4rem;
    padding: 10px;
    width: 100%;
    border:none;
}
.allowance-form .ae-input-container {
    margin-bottom: 1rem; 
}
</style>
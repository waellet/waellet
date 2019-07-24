<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateToSettings"><ae-icon name="back" /> {{language.buttons.backToSettings}}</button>
        </div>
        <h3 style='text-align:center;'>{{language.pages.settings.generalSettings.heading}}</h3>
        <ae-panel>
            <div class="maindiv_input-group-addon">
                <h4>{{language.pages.settings.generalSettings.registerName}}</h4><hr>
                <small class="sett_info">{{language.pages.settings.generalSettings.registerNameInfo}}</small>
                <div class="checkName input-group-addon">
                    <input v-model="name" class="addon-input" />
                    <label class="addon-lbl" >.test</label>
                </div>
                <ae-button class="regbtn" face="icon" fill="primary" @click="registerName">
                    <ae-icon name="plus" />
                </ae-button>
                <small style="font-size:12px; display: inline-block;"><ae-icon style="font-size: 15px;" name="github" />{{language.pages.settings.generalSettings.registerNameRequirement}}</small>
            </div>
        </ae-panel>
        
        <ae-panel>
            <div class="maindiv_input-group-addon">
                <h4>{{language.pages.settings.generalSettings.registeredNames}}</h4><hr>
                <ae-list>
                    <ae-list-item fill="neutral" v-for="(name, key) in names" :key="key" >
                        <ae-identicon class="subAccountIcon" v-bind:address="name.owner" size="base" />
                        <div class="subAccountInfo">
                            <div class="subAccountName">{{name.name}}</div>
                            <ae-address :value="name.owner" length="short" />
                        </div>
                        <ae-icon fill="primary" face="round" name="reload" class="name-pending" v-if="name.pending"/>
                    </ae-list-item>
                </ae-list>
            </div>
        </ae-panel>
        <Loader size="big" :loading="loading" type="transparent" content="" ></Loader>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getHdWalletAccount } from '../../utils/hdWallet';
import locales from '../../locales/locales.json';
import { Universal } from '@aeternity/aepp-sdk';
import { clearInterval, clearTimeout  } from 'timers';
export default {
    data () {
        return {
            language: locales['en'],
            loading: false,
            name: '',
            ak_address: '',
            polling:null
        }
    },
    computed: {
        ...mapGetters(['account', 'balance', 'network', 'current','transactions','subaccounts','wallet','activeAccountName','activeAccount', 'popup', 'names', 'sdk']),
    },
    created() {
        this.polling = setInterval(() => {
            this.$store.dispatch('getRegisteredNames')
        },5000)
    },
    methods: {
        async registerName() {
            var onlyLettersAndNums = /^[A-Za-z0-9]+$/;
            if (this.name == '') {
                this.$store.dispatch('popupAlert', {
                    name: 'account',
                    type: 'requiredField'
                });
            }
            else if (!onlyLettersAndNums.test(this.name)) {
                this.$store.dispatch('popupAlert', {
                    name: 'account',
                    type: 'only_allowed_chars'
                });
            }
            else {
                this.loading = true;
                let name = `${this.name}.test`
                const query = this.sdk.aensQuery(name)
                .then(async () => {
                    this.loading = false;
                    this.$store.dispatch('popupAlert', {
                        name: 'account',
                        type: 'name_exist'
                    });
                })
                .catch(async err => {
                    let tx = {
                        popup:false,
                        tx: {
                            name,
                            recipientId:''
                        },
                        type:'namePreClaim'
                    }
                    this.$store.commit('SET_AEPP_POPUP',true)
                    this.$router.push({'name':'sign', params: {
                        data:tx,
                        type:tx.type
                    }});

                    // const preclaim = await this.sdk.aensPreclaim(name);
                    // const claim = await this.sdk.aensClaim(name, preclaim.salt, preclaim.height);
                    // const update = await this.sdk.aensUpdate(claim.id, this.account.publicKey);

                    // this.$store.dispatch('popupAlert', {
                    //     name: 'account',
                    //     type: 'added_success'
                    // })

                    // this.loading = false;
                })
            }
        },
        navigateToSettings() {
            this.$router.push('/settings')
        }
    },
    beforeDestroy() {
        window.clearTimeout(this.polling)
    }
}
</script>

<style lang="scss">

@import '../../../common/base';
.backbtn {
    width: 50%; margin-top: 5px;
}
.regbtn{
    background: #FF0D6A;
    color: #ffffff;
    float: right;
    width: 19%;
    border-radius: 0 !important;
}
.maindiv_input-group-addon {
    text-align: center;
}
.maindiv_input-group-addon h4 {
    text-align: left;
    margin: 0 !important; 
}
.input-group-addon {
    background: #ececec;
    border: 1px solid #ccc;
    width: 79%;
    height: 56px;
    float: left;
}
.addon-input {
    width: 75%;
    outline: none;
    color: #828282;
    padding: 0;
    height: 55px;
    text-indent: 5px;
    caret-color: #ff0d6a;
}
.addon-lbl {
    font-weight: 600;
    color: #828282;
}
input:active,input:focus {
    border: none;
    outline: none;
}
.sett_info {
    text-align: left;
    width: 100%;
    display: block;
    word-break: break-word;
}
.ae-list .ae-list-item:first-child {
    border-top:none !important
}
</style>
<template>
    <div class="popup">
        <h3>How to connect from Ledger</h3>
        <ae-panel>
            <h4>Steps</h4>
            <hr>
            <ae-list class="text-left">
                <ae-list-item fill="neutral">
                    Connect your Ledger via USB and unlock it
                </ae-list-item>
                <ae-list-item fill="neutral">
                    Open the aeternitya app on your Ledger
                </ae-list-item>
                <ae-list-item fill="neutral">
                    Create a first account by pressing the button bellow
                </ae-list-item>
                <ae-list-item fill="neutral" class="ledger manageAccounts account-btn">
                  <ae-button  class="triggerhidedd" @click="addAccount">
                    <ae-button face="icon" class="iconBtn ledger">
                      <ae-icon name="plus" />
                    </ae-button>
                    <span class="newSubaccount">{{ language.strings.ledgerAccount }}</span>
                  </ae-button>
                </ae-list-item>
            </ae-list>
        </ae-panel>
    </div>
</template>

<script>
import locales from '../../locales/locales.json'
import { mapGetters } from 'vuex';


export default {
    data () {
        return {
            language: locales['en'],
            
        }
    },
    computed: {
        ...mapGetters(['ledgerApi','account','sdk','balance','subaccounts'])
    },
    locales: locales,
    created() {
        
    },
    methods: {
        async addAccount() {
            let account = await this.$store.dispatch('ledgerCreate')
            
            if(account.success) {
                this.$router.push('/account')
            }else {
                this.$store.dispatch('popupAlert', { name: 'account', type: 'ledger_account_error'})
            }
        }
    }   
}
</script>

<style lang="scss" scoped >
@import '../../../common/base';
.iconBtn {
    padding: 0 !important;
    height: 30px !important;
    width: 30px !important;
    color: #fff;
    text-align: center;
    margin-right: 8px;
}
.text-left li {
    word-break: break-word;
}
</style>

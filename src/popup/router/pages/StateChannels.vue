<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateUtilities"><ae-icon name="back" />{{ $t('pages.signAndVerifyMsg.backToUtilities') }}</button>
        </div>
        <h3 style='text-align:center;'>{{$t('pages.stateChannelsPage.heading') }}</h3>

        <div class="openChannel" v-if="openChannel">
            <div class="maindiv_input-group-addon">
                <h4>{{$t('pages.stateChannelsPage.openNewChannel') }}</h4><hr>
                <div class="checkName namingsystem-input-group-addon">
                    <input v-model="port" class="namingsystem-addon-input" />
                </div>
                <ae-button class="regbtn notround" face="icon" fill="primary" @click="openStateChannel">
                    <ae-icon name="plus" />
                </ae-button>
            </div>
        </div>

        <ae-button class="regbtn notround" face="icon" fill="secondary" @click="getChannelId">
            <ae-icon name="plus" />
        </ae-button>

        <Loader size="big" :loading="loading" type="transparent" content="" ></Loader>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { fetchData, convertToAE, addressToName } from '../../utils/helper'
import Channel from '@aeternity/aepp-sdk/es/channel/index'

export default {
    data () {
        return {
            loading: false,
            channel_responder: 'ak_cFBreUSVWPEc3qSCYHfcy5yW2CWkbdrPkr9itgQfBw1Zdd6HV',
            ak_address: '',
            polling:null,
            openChannel: true,
            channel : null,
            port: 3013
        }
    },
    computed: {
        ...mapGetters(['account', 'current', 'popup', 'names', 'sdk', 'network'])
    },
    created() {},
    methods: {
        async updateAuctionEntry() {
            const res = await this.$store.dispatch('names/fetchAuctionEntry', this.moreAuInfo.info.name);
            this.expiration = res.expiration;
            this.bids = res.bids;
        },
        async getChannelId() {
            debugger
        },
        async openStateChannel() {

            console.log(`Opening a state channel with: ${this.channel_responder} on port ${this.port}`)

            this.channel = await Channel({
                url: 'wss://testnet.aeternity.io/channel',
                role: 'initiator',
                initiatorId: this.account.publicKey,
                responderId: this.channel_responder,
                initiatorAmount: 1e18,
                responderAmount: 1e18,
                pushAmount: 0,
                channelReserve: 1,
                ttl: 1000,
                host: 'localhost',
                port: this.port,
                lockPeriod: 10,
                sign: async (tag, tx) => {
                    console.log(tag)
                    console.log(tx)
                    return this.sdk.signTransaction(tx)
                }
            })

            console.log(this.channel)
        },
        navigateUtilities(){
            this.$router.push('/utilities')
        },
    },
    beforeDestroy() {
        window.clearTimeout(this.polling)
    }
}
</script>

<style lang="scss">

@import '../../../common/base';

.singleAuction:hover {
    margin: 5px;
    transition: all-ease;
}

.seeAllActiveAuctions li {
    margin-bottom: 5px;
    .auctionInfo {
        width: 100%;
        text-align: left;
        .name { font-weight: bold; }
    } 
}

.tab-holder { margin:2rem auto; }
.ae-button.flat.primary {
    color: #F279A8 !important;
    width: 28% !important;
    word-break: break-word;
    box-sizing: border-box;
    border-color: #E72B6E !important;
    text-align: center;
    vertical-align: middle;
    border: 1px solid #f279a8 !important;
    margin: 0px 5px;
    padding: 5px;
    display: inline !important;
}
.ae-button.flat.primary:hover, 
.ae-button.flat.primary:active,
.activeTab  {
    background: #E72B6E !important;
    color: #fff !important;
}
.backbtn {
    width: 50%; margin-top: 5px;
}
.au-filter {
    cursor: pointer;
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
.namingsystem-input-group-addon {
    background: #ececec;
    border: 1px solid #ccc;
    width: 79%;
    height: 56px;
    float: left;
}
.namingsystem-addon-input {
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
    color: #9c9c9c;
    text-align: left;
    width: 100%;
    margin: 0 0px 10px;
    display: block;
    word-break: break-word;
}

.notround { border-radius: 0 !important; }
.ae-list .ae-list-item:first-child {
    border-top:none !important
}
</style>


<template>
    <div class="popup">
        <div class="seeAllRegisteredNames" v-if="seeAllRegisteredNames">
            <div class="maindiv_input-group-addon">
                <h4>{{$t('pages.generalSettings.registeredNames') }}</h4><hr>
                <ae-list v-if="haveRegisteredNames">
                    <ae-list-item fill="neutral" v-for="(name, key) in names" :key="key" >
                        <ae-identicon class="subAccountIcon" v-bind:address="name.owner" size="base" />
                        <div class="subAccountInfo">
                            <div class="subAccountName">{{name.name}}</div>
                            <ae-address :value="name.owner" length="short" />
                        </div>
                        <ae-icon fill="primary" face="round" name="reload" class="name-pending" v-if="name.pending"/>
                    </ae-list-item>
                </ae-list>
                <p v-if="!haveRegisteredNames">{{ $t('pages.generalSettings.noNames') }}</p>
                <ae-button face="round" fill="primary" @click="seeAllRegisteredNames = false" extend>{{ $t('pages.generalSettings.OkButton') }}</ae-button>
                <ae-button face="round" fill="primary" @click="seeAllRegisteredNames = false" class="closeAllAENS" extend>{{ $t('pages.generalSettings.OkButton') }}</ae-button>
            </div>
        </div>
        <div v-if="!seeAllRegisteredNames">
            <div class="actions">
                <button class="backbutton toAccount" @click="navigateToSettings"><ae-icon name="back" /> {{$t('pages.generalSettings.backToSettings') }}</button>
            </div>
            <h3 style='text-align:center;'>{{$t('pages.generalSettings.heading') }}</h3>
            <ae-panel>
                <div class="maindiv_input-group-addon">
                    <h4>{{$t('pages.generalSettings.registerName') }}</h4><hr>
                    <small class="sett_info">{{$t('pages.generalSettings.registerNameInfo') }}</small>
                    <div class="checkName input-group-addon">
                        <input v-model="name" class="addon-input" />
                        <label class="addon-lbl" >.test</label>
                    </div>
                    <ae-button class="regbtn notround" face="icon" fill="primary" @click="registerName">
                        <ae-icon name="plus" />
                    </ae-button>
                    <small style="font-size:12px; display: inline-block;"><ae-icon style="font-size: 15px;" name="github" />{{$t('pages.generalSettings.registerNameRequirement') }}</small>
                    <ae-button class="seeAllRegisteredNamesBtn allAENS" face="flat" fill="primary" @click="seeAllRegisteredNames = true">{{$t('pages.generalSettings.seeAllRegisteredNames') }}</ae-button>
                </div>
            </ae-panel>
            <Loader size="big" :loading="loading" type="transparent" content="" ></Loader>
            
            <ae-panel>
                <div class="maindiv_input-group-addon">
                    <h4>{{$t('pages.generalSettings.switchLanguage') }}</h4><hr>
                    <small class="sett_info">{{$t('pages.generalSettings.currentLanguage') }}: {{ (this.current.language ? this.current.language : 'en') }}</small>
                    <div class="language-settings">
                        <li id="languages" class="have-subDropdown" :class="dropdown.languages ? 'show' : ''">
                            <ae-button class="notround switchlanguageBtn" face="round" fill="primary" extend @click="toggleDropdown($event, '.have-subDropdown')">
                                <ae-icon name="globe" />
                                {{$t('pages.generalSettings.switchLanguage') }}
                                <ae-icon name="left-more" />
                            </ae-button>

                            <!-- Language sub dropdown -->
                            <ul class="sub-dropdown">
                                <li v-for="(value, name) in locales" v-bind:key="name">
                                <ae-button v-on:click="switchLanguage(name)" class="" :class="current.language == name ? 'current' : ''">
                                    <img :src="'../icons/flag_'+name+'.png'" />
                                    {{ name }}
                                </ae-button>
                                </li>
                            </ul>
                        </li>
                    </div>
                </div>
            </ae-panel>
        </div>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { clearTimeout  } from 'timers';
import {langs, fetchAndSetLocale} from '../../utils/i18nHelper'

export default {
    data () {
        return {
            locales: langs,
            loading: false,
            name: '',
            ak_address: '',
            polling:null,
            dropdown: {
                languages: false,
            },
            seeAllRegisteredNames: ''
        }
    },
    computed: {
        ...mapGetters(['current', 'popup', 'names', 'sdk']),
        haveRegisteredNames() {
            return this.names.length > 0;
        }
    },
    created() {
        if (this.current.language == undefined) {
            this.current.language = 'en';
        }
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
                })
            }
        },
        toggleDropdown(event, parentClass) {
            if (typeof parentClass == 'undefined') {
                parentClass = '.language-settings';
            }
            let dropdownParent = event.target.closest(parentClass);
            this.dropdown[dropdownParent.id] = !this.dropdown[dropdownParent.id]
        },
        async switchLanguage(languageChoose) {
            fetchAndSetLocale(languageChoose);
            browser.storage.sync.set({language: languageChoose}).then(() => {
                this.current.language = languageChoose;
                this.dropdown.languages = false;
                this.$store.state.current.language = languageChoose;
            });
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
    color: #9c9c9c;
    text-align: left;
    width: 100%;
    margin: 0 0px 10px;
    display: block;
    word-break: break-word;
}

.language-settings li {
    list-style-type: none;
    color: #717C87;
    margin: 0;
}
.language-settings li .ae-icon {
    font-size: 1.2rem;
    margin-right: 10px;
}
.language-settings button {
    font-size: 14px;
    width: 100%;
    color: #000;
    text-align: left;
    margin: 0;
    padding: 0 1rem;
    white-space: nowrap;
    justify-content: unset;
}
.language-settings ul {
    min-width: 250px;
    box-shadow: none;
    visibility: hidden;
    max-height: 0;
    padding: 0;
    overflow: hidden;
    transition: all 0.3s ease-in-out;
    right: 0;
}
.language-settings .have-subDropdown.show ul.sub-dropdown {
    visibility: visible;
    max-height: 165px;
}
.language-settings .have-subDropdown.show .ae-button .ae-icon-left-more {
    transform: rotate(90deg);
}
.notround { border-radius: 0 !important; }
.notround:not(.regbtn) {width: 100% !important;}
.ae-list .ae-list-item:first-child {
    border-top:none !important
}
</style>
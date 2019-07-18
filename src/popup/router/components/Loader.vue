<template>
    <div>
        <div v-if="loading" class="loading">
            <div class="center" v-if="size == 'small' ">
                <span v-if="content != ''">{{content}}</span>
                <br v-if="content != ''">
                <ae-loader />
            </div>
            <transition name="fadeOut" v-if="size == 'big'">
                <span class="mainLoader" :class="type == 'transparent' ? 'mainLoaderTransparent' : ''"><ae-loader /></span>
            </transition>
        </div>
    </div>  
</template>

<script>
import locales from '../../locales/locales.json';
export default {
    data() {
        return {
            
        };
    },
    props: ['loading','content', 'size', 'type'],
    locales,
    methods: {

    }
}

</script>

<style lang="scss" scoped>
@import '../../../common/base';
.fadeOut-enter-active, .fadeOut-leave-active { transition: all .5s ease-in-out; }
.fadeOut-leave-to { opacity: 0; }
.mainLoader { position: fixed; width: 100%; height: 100%; background-color: rgba(255,255,255,1); top: 0; }
.mainLoader .ae-loader { position: absolute; top: 50%; left: 50%; margin: -1.5em; width: 3em !important; height: 3em !important; border-radius: 3em !important; }
.mainLoader.mainLoaderTransparent { opacity: 0.6 }
.loader .loading {
    width:32px;
    margin-right:15px;
}
</style>
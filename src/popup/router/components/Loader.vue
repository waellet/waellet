<template>
    <div>
        <div v-if="loading" class="loading">
            <div class="center">

                <span v-if="content != ''">{{content}}</span>
                <br v-if="content != ''">
                <ae-loader />
            </div>
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
    props: ['loading','content'],
    locales,
    methods: {

    }
}

</script>

<style lang="scss" scoped>
@import '../../../common/base';
.loader .loading {
    width:32px;
    margin-right:15px;
}
</style>
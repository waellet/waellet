<template>
    <div>
        <div v-if="loading" class="loading">
            <div class="center">
            <span>{{content}}</span>
            <br>
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
</style>
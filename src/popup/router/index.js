import Vue from 'vue';
import VueRouter from 'vue-router';
import VueClipboard from 'vue-clipboard2';
import Components from '@aeternity/aepp-components';
import routes from './routes';
import '@aeternity/aepp-components/dist/aepp.components.css';

Vue.use(VueRouter);
Vue.use(VueClipboard);
Vue.use(Components);

export default new VueRouter({
  routes,
});

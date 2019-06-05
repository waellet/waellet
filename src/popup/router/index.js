import Vue from 'vue';
import VueRouter from 'vue-router';
import VueClipboard from 'vue-clipboard2';
import Components from '@aeternity/aepp-components-3';
import routes from './routes';
import '@aeternity/aepp-components-3/dist/aepp.components.css';
import LoaderComponent from './components/Loader';

Vue.use(VueRouter);
Vue.use(VueClipboard);
Vue.use(Components);
Vue.component('Loader',LoaderComponent);
export default new VueRouter({
  routes,
});

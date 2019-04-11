import Vue from 'vue';
import VueRouter from 'vue-router';
import VueClipboard from 'vue-clipboard2';
import routes from './routes';

Vue.use(VueRouter);
Vue.use(VueClipboard);

export default new VueRouter({
  routes,
});

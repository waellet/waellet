import Vue from 'vue';
import VueRouter from 'vue-router';
import VueClipboard from 'vue-clipboard2';
import Components from '@aeternity/aepp-components-3';
import routes from './routes';
import '@aeternity/aepp-components-3/dist/aepp.components.css';
import LoaderComponent from './components/Loader';
import TransactionItemComponent from './components/TransactionItem';
import SwitchButtonComponent from './components/SwitchButton';
import Popup from './components/Popup';

Vue.use(VueRouter);
Vue.use(VueClipboard);
Vue.use(Components);
Vue.component('Loader',LoaderComponent);
Vue.component('TransactionItem',TransactionItemComponent);
Vue.component('SwitchButton',SwitchButtonComponent);
Vue.component('Popup',Popup);

export default new VueRouter({
  routes,
});

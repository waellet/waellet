import IndexComponent from './pages/Index';
import AccountComponent from './pages/Account';
import SendComponent from './pages/Send';
import ReceiveComponent from './pages/Receive';
import AccountPasswordComponent from './pages/AccountPassword';

export default [
  {
    path: '/',
    component: IndexComponent,
  },
  {
    path: '/account',
    component: AccountComponent,
  },
  {
    path: '/send',
    component: SendComponent,
  },
  {
    path: '/receive',
    component: ReceiveComponent,
  },
  {
    name: 'password',
    path: '/password',
    component: AccountPasswordComponent,
    props:true
  }
];

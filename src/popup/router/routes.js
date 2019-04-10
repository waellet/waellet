import IndexComponent from './pages/Index';
import AccountComponent from './pages/Account';
import SendComponent from './pages/Send';
import ReceiveComponent from './pages/Receive';

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
];

import * as types from './mutation-types';

export const setAccount = ({ commit }, payload) => {
  commit(types.UPDATE_ACCOUNT, payload);
};

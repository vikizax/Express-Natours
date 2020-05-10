/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

// type : 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type == 'data'
        ? 'http://localhost:3000/api/v1/users/updateMe'
        : 'http://localhost:3000/api/v1/users/updateMyPassword';
    const result = await axios({
      method: 'PATCH',
      url,
      data
    });

    if (result.data.status == 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully 👍`);
    }
  } catch (err) {
    err = err.response.data ? err.response.data.message : err.message;
    showAlert('error', err);
  }
};

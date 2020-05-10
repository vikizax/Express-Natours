/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password
      },
      withCredentials: true
    });

    if (result.data.status == 'success') {
      showAlert('success', 'Logged in 👍');
      location.assign('/');
    }
  } catch (err) {
    err = err.response.data ? err.response.data.message : err.message;
    showAlert('error', err);
  }
};

export const logout = async () => {
  try {
    const result = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
      withCredentials: true
    });
    if (result.data.status == 'success') location.reload(true);
  } catch (err) {
    err = err.response.data ? err.response.data.message : err.message;
    showAlert('error', err);
    location.reload(true);
  }
};

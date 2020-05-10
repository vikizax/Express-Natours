/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
// DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
// delegation
if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );

  displayMap(locations);
}

if (loginForm) {
  document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    // values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const btn = document.querySelector('.btn--save-password');
    btn.textContent = 'Updating..';
    btn.disabled = true;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    btn.disabled = false;
    btn.textContent = 'Save password';
    userPasswordForm.reset();
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing..';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

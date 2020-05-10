/* eslint-disable */
const stripe = Stripe('pk_test_6nF5E1zan48H3PgMMzAMVcZB00uS595mQY');
import axios from 'axios';
import { showAlert } from './alerts';
export const bookTour = async tourId => {
  try {
    // get checkout session from endpoint
    const session = await axios(
      `http://localhost:3000/api/v1/booking/checkout-session/${tourId}`
    );
    // create checkout form + charge to credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
    
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

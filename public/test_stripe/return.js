document.addEventListener('DOMContentLoaded', async () => {
    // Load the publishable key from the server. The publishable key
    // is set in your .env file.
    const {publishable_key} = (await axios.get('/api/stripe/config')).data;
    if (!publishable_key) {
        addMessage(
            'No publishable key returned from the server. Please check `.env` and try again'
        );
        alert('Please set your Stripe publishable API key in the .env file');
    }
  
    const stripe = Stripe(publishable_key, {
        apiVersion: '2020-08-27',
    });
  
    const url = new URL(window.location);
    const client_secret = url.searchParams.get('payment_intent_client_secret');
  
    const {error, paymentIntent} = await stripe.retrievePaymentIntent(
        client_secret
    );
    if (error) {
        addMessage(error.message);
    }
    addMessage(`Payment ${paymentIntent.status}: ${paymentIntent.id}`);
});
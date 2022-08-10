

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

    const {client_secret} = (await axios.get("/api/stripe/create-test-payment-intent")).data;
    addMessage(`Client secret returned.`);
  
    // Initialize Stripe Elements with the PaymentIntent's client_secret,
    // then mount the payment element.
    const elements = stripe.elements({ "clientSecret": client_secret });
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
  
    // When the form is submitted...
    const form = document.getElementById('payment-form');
    let submitted = false;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        // Disable double submission of the form
        if(submitted) { return; }
        submitted = true;
        form.querySelector('button').disabled = true;
    
        //const nameInput = document.querySelector('#name');
    
        // Confirm the card payment given the client_secret
        // from the payment intent that was just created on
        // the server.
        const {error: stripeError} = await stripe.confirmPayment({
            elements,
            confirmParams: {
            return_url: `${window.location.origin}/test_stripe/return.html`,
            }
        });
    
        if (stripeError) {
            addMessage(stripeError.message);
    
            // reenable the form.
            submitted = false;
            form.querySelector('button').disabled = false;
            return;
        }
    });
});
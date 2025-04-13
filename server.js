// server.js - Titan Cloud AI Backend

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Basic Root Route
app.get('/', (req, res) => {
  res.send('Titan Cloud AI Backend is running');
});

// Stripe Webhook Example
app.post('/webhook/stripe', bodyParser.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    // Process event (e.g. subscription created, payment failed)
    console.log('Stripe event:', event.type);
    res.status(200).send('Received');
  } catch (err) {
    console.error('Webhook Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Twilio Messaging Endpoint
app.post('/send-sms', async (req, res) => {
  const { to, body } = req.body;
  try {
    const message = await twilio.messages.create({
      body,
      from: process.env.TWILIO_PHONE,
      to
    });
    res.status(200).json({ success: true, sid: message.sid });
  } catch (err) {
    console.error('SMS Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Titan Cloud AI backend running on port ${PORT}`);
});

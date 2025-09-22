import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface BookingSummary {
  _id: string;
  totalAmount: number;
  station: { name: string };
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
}

const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    const pk = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY as string | undefined;
    if (pk) {
      setStripePromise(loadStripe(pk));
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(process.env.REACT_APP_SERVER_DOMAIN + `/api/bookings/${id}`);
        setBooking({
          _id: res.data._id,
          totalAmount: res.data.totalAmount,
          station: { name: res.data.station?.name || 'Station' },
          paymentStatus: res.data.paymentStatus,
        });
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handlePay = async () => {
    if (!booking) return;
    try {
      setProcessing(true);
      if (paymentMethod === 'cod') {
        await axios.put(process.env.REACT_APP_SERVER_DOMAIN + `/api/bookings/${booking._id}/payment-status`, {
          status: 'pending',
          method: 'cod'
        });
        navigate(`/booking/${booking._id}`);
        return;
      }
      // Online: request a PaymentIntent and show Payment Element (UPI/Card, etc.)
      if (!clientSecret) {
        const intent = await axios.post(process.env.REACT_APP_SERVER_DOMAIN + `/api/payments/create-payment-intent`, {
          bookingId: booking._id
        });
        setClientSecret(intent.data.clientSecret);
      }
    } catch (e: any) {
      setError(e.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading checkout...</div></div>;
  if (error) return <div className="container"><div className="alert alert-danger">{error}</div></div>;
  if (!booking) return null;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>← Back</button>
        <h1>Checkout</h1>
      </div>
      <div className="checkout-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', padding: '1.5rem', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Station</span>
            <strong>{booking.station.name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total</span>
            <strong>₹{booking.totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        <div style={{ margin: '1rem 0' }}>
          <label className="form-label">Payment Method</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label className="checkbox-label">
              <input type="radio" name="pm" checked={paymentMethod==='cod'} onChange={() => setPaymentMethod('cod')} />
              <span>Cash on Delivery</span>
            </label>
            <label className="checkbox-label">
              <input type="radio" name="pm" checked={paymentMethod==='online'} onChange={() => setPaymentMethod('online')} />
              <span>Online (Stripe Test)</span>
            </label>
          </div>
        </div>

        {!clientSecret && (
          <button className="btn btn-primary" onClick={handlePay} disabled={processing}>
            {processing ? 'Processing...' : paymentMethod === 'cod' ? 'Confirm COD' : 'Continue to Pay'}
          </button>
        )}

        {paymentMethod === 'online' && clientSecret && stripePromise && (
          <div style={{ marginTop: '1.5rem' }}>
            <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
              <OnlinePaymentForm bookingId={booking._id} onSuccess={() => navigate(`/booking/${booking._id}`)} onError={setError} />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;

// Inline form to confirm the PaymentElement
const OnlinePaymentForm: React.FC<{ bookingId: string; onSuccess: () => void; onError: (msg: string) => void }> = ({ bookingId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Optionally set a return_url for 3DS flows
        },
        redirect: 'if_required'
      });

      if (error) {
        onError(error.message || 'Payment failed');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Inform server to finalize the booking payment
        try {
          await axios.post(process.env.REACT_APP_SERVER_DOMAIN + '/api/payments/confirm-payment', {
            bookingId,
            paymentIntentId: paymentIntent.id
          });
        } catch (e) {
          // ignore server confirm failure and still navigate
        }
        onSuccess();
      } else {
        onError('Payment not completed');
      }
    } catch (err: any) {
      onError(err.message || 'Payment error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem' }}>
      <PaymentElement options={{ layout: 'tabs' }} />
      <button className="btn btn-primary" type="submit" disabled={!stripe || submitting}>
        {submitting ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};



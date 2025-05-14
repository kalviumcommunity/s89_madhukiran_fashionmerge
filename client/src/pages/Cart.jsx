import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Minus, Plus, X, CreditCard, CheckCircle, Check, Clock, CreditCard as CardIcon, ShoppingBag, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from './cartStore';
import { BASE_URL } from '../config/api';
import './Cart.css';
import './PaymentAnimations.css';

function Cart() {
  const navigate = useNavigate();
  const {
    items,
    removeItem: removeItemFromStore,
    updateQuantity,
    fetchItems,
    isLoading,
    error
  } = useCartStore();
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId && !!token);
  const [promoCode, setPromoCode] = useState('');
  const [email, setEmail] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [paymentStep, setPaymentStep] = useState('shipping'); // shipping, payment, confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // Payment processing animation states
  const [processingSteps, setProcessingSteps] = useState([
    { id: 1, text: 'Verifying payment information', status: 'pending' },
    { id: 2, text: 'Processing payment', status: 'pending' },
    { id: 3, text: 'Creating order', status: 'pending' },
    { id: 4, text: 'Finalizing purchase', status: 'pending' }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const confettiRef = useRef(null);

  // Success popup states
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupClosing, setPopupClosing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Check login status on component mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const currentUserId = localStorage.getItem('userId');
      const currentToken = localStorage.getItem('token');
      setUserId(currentUserId);
      setToken(currentToken);
      setIsLoggedIn(!!currentUserId && !!currentToken);

      if (currentUserId && currentToken) {
        console.log('User is logged in with ID:', currentUserId);
      } else {
        console.log('User is not logged in');
      }
    };

    // Check initially
    checkLoginStatus();

    // Set up event listener for storage changes
    window.addEventListener('storage', checkLoginStatus);

    // Clean up
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // Fetch cart items from MongoDB when component mounts or login status changes
  useEffect(() => {
    // Use the fetchItems function from the store
    fetchItems();
  }, [isLoggedIn, userId, token, fetchItems]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCheckout = (e) => {
    e.preventDefault();

    if (paymentStep === 'shipping') {
      // Validate shipping info
      if (!email || !shippingInfo.firstName || !shippingInfo.lastName ||
          !shippingInfo.address || !shippingInfo.city || !shippingInfo.state ||
          !shippingInfo.zipCode || !shippingInfo.country) {
        alert('Please fill in all shipping information fields');
        return;
      }
      setPaymentStep('payment');
    } else if (paymentStep === 'payment') {
      // Process payment
      processPayment();
    }
  };

  // Function to create confetti elements
  const createConfetti = () => {
    if (!confettiRef.current) return;

    const container = confettiRef.current;
    container.innerHTML = '';

    // Create 50 confetti elements
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = `${Math.random() * 20}%`;
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;

      // Random shapes
      if (Math.random() > 0.6) {
        confetti.style.borderRadius = '50%';
      } else if (Math.random() > 0.5) {
        confetti.style.borderRadius = '2px';
      }

      container.appendChild(confetti);
    }
  };

  // Update processing steps
  const updateProcessingStep = (stepIndex, status) => {
    setProcessingSteps(prevSteps =>
      prevSteps.map((step, index) =>
        index === stepIndex ? { ...step, status } : step
      )
    );
  };

  const processPayment = async () => {
    if (!isLoggedIn) {
      alert('Please log in to complete your purchase');
      navigate('/login');
      return;
    }

    // Validate card info
    if (!cardInfo.cardNumber || !cardInfo.cardName || !cardInfo.expiryDate || !cardInfo.cvv) {
      setPaymentError('Please fill in all payment information fields');
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentError('');
      setCurrentStep(0);

      // Reset processing steps
      setProcessingSteps([
        { id: 1, text: 'Verifying payment information', status: 'pending' },
        { id: 2, text: 'Processing payment', status: 'pending' },
        { id: 3, text: 'Creating order', status: 'pending' },
        { id: 4, text: 'Finalizing purchase', status: 'pending' }
      ]);

      // Step 1: Verify payment information
      updateProcessingStep(0, 'active');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateProcessingStep(0, 'completed');
      setCurrentStep(1);

      // Step 2: Create a payment intent
      updateProcessingStep(1, 'active');
      const paymentIntentResponse = await fetch(`${BASE_URL}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to cents
          metadata: {
            email: email
          }
        })
      });

      if (!paymentIntentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      updateProcessingStep(1, 'completed');
      setCurrentStep(2);

      const paymentIntentData = await paymentIntentResponse.json();

      // Step 3: Process the payment and create the order
      updateProcessingStep(2, 'active');
      const processPaymentResponse = await fetch(`${BASE_URL}/api/stripe/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentData.paymentIntentId,
          products: items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image
          })),
          totalAmount: total,
          shippingAddress: shippingInfo
        })
      });

      if (!processPaymentResponse.ok) {
        throw new Error('Failed to process payment');
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      updateProcessingStep(2, 'completed');
      setCurrentStep(3);

      await processPaymentResponse.json();

      // Step 4: Finalizing purchase
      updateProcessingStep(3, 'active');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateProcessingStep(3, 'completed');

      // Payment successful
      await new Promise(resolve => setTimeout(resolve, 500));
      setPaymentStep('confirmation');

      // Generate a random order number
      const randomOrderNum = Math.floor(100000000 + Math.random() * 900000000).toString();
      setOrderNumber(randomOrderNum);

      // Create confetti effect
      setTimeout(() => {
        createConfetti();
      }, 300);

      // Show success popup after a short delay
      setTimeout(() => {
        setShowSuccessPopup(true);
      }, 1000);

      // Clear cart
      setItems([]);

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'An error occurred during payment processing');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle closing the success popup
  const handleClosePopup = () => {
    setPopupClosing(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
      setPopupClosing(false);
    }, 300);
  };

  // Remove item using the store's method which handles MongoDB sync
  const removeItem = useCallback((itemId, size, color) => {
    removeItemFromStore(itemId, size, color);
  }, [removeItemFromStore]);

  return (
    <div className="cart-container">
      {/* Success Popup */}
      <div className={`success-popup-overlay ${showSuccessPopup ? 'visible' : ''}`}>
        <div className={`success-popup ${popupClosing ? 'closing' : ''}`}>
          <button className="success-popup-close" onClick={handleClosePopup}>×</button>
          <div className="success-popup-icon">
            <CheckCircle size={32} />
          </div>
          <h2 className="success-popup-title">Order Confirmed!</h2>
          <p className="success-popup-message">
            Thank you for your purchase! Your order #{orderNumber} has been confirmed and is being processed.
            <br /><br />
            A confirmation email has been sent to {email}.
          </p>
          <button className="success-popup-button" onClick={() => {
            handleClosePopup();
            navigate('/purchases');
          }}>
            View My Orders
          </button>
        </div>
      </div>

      <br />
      <br />
      <h1 className="cart-title">Shopping Cart</h1>
      {isLoading ? (
        <div className="loading-cart">
          <Loader className="spinner" size={24} />
          <p>Loading your cart...</p>
        </div>
      ) : error ? (
        <div className="error-cart">
          <p>Error loading your cart: {error}</p>
          <button onClick={fetchItems} className="retry-btn">Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-cart">
          <p>Your shopping cart is empty</p>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-items">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <div className="cart-item-options">
                      <span>Size: {item.size}</span>
                      <span>Color: {item.color}</span>
                    </div>
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.size, item.color)}
                          className="quantity-btn"
                        >
                          - {/* Replace Minus icon with - symbol */}
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                          className="quantity-btn"
                        >
                          + {/* Replace Plus icon with + symbol */}
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        className="remove-item-btn"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="checkout-section">
            <form onSubmit={handleCheckout} className="checkout-form">
              <div className="checkout-section-content">
                <div className="promo-code">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button type="button">Apply</button>
                </div>
                <div className="cart-total">
                  <div className="cart-total-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="cart-total-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="cart-total-row">
                    <span>Estimated Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="cart-total-row final">
                    <span>Estimated Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="checkout-form-section">
                  <h3>Contact Information</h3>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="checkout-form-section">
                  <h3>Shipping Information</h3>
                  <div className="name-fields">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                    required
                  />
                  <div className="city-state-zip">
                    <input
                      type="text"
                      placeholder="City"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                      required
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Country"
                    value={shippingInfo.country}
                    onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                    required
                  />
                </div>
                {paymentStep === 'shipping' ? (
                  <button type="submit" className="checkout-btn">
                    Proceed to Payment
                  </button>
                ) : paymentStep === 'payment' ? (
                  <div className="payment-section">
                    <h3>Payment Information</h3>
                    <div className="card-info">
                      <input
                        type="text"
                        placeholder="Card Number"
                        value={cardInfo.cardNumber}
                        onChange={(e) => setCardInfo({...cardInfo, cardNumber: e.target.value})}
                        maxLength="16"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Name on Card"
                        value={cardInfo.cardName}
                        onChange={(e) => setCardInfo({...cardInfo, cardName: e.target.value})}
                        required
                      />
                      <div className="card-expiry-cvv">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardInfo.expiryDate}
                          onChange={(e) => setCardInfo({...cardInfo, expiryDate: e.target.value})}
                          maxLength="5"
                          required
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          value={cardInfo.cvv}
                          onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                          maxLength="3"
                          required
                        />
                      </div>
                    </div>

                    {paymentError && (
                      <div className="payment-error">
                        {paymentError}
                      </div>
                    )}

                    {isProcessing ? (
                      <div className="payment-processing-container">
                        <div className="processing-spinner"></div>
                        <div className="processing-text">Processing Your Payment</div>
                        <div className="processing-steps">
                          {processingSteps.map((step, index) => (
                            <div
                              key={step.id}
                              className={`processing-step ${step.status === 'active' ? 'active' : ''} ${step.status === 'completed' ? 'completed' : ''}`}
                            >
                              <div className="step-icon">
                                {step.status === 'completed' ? <Check size={12} /> : index + 1}
                              </div>
                              <div className="step-text">{step.text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          type="submit"
                          className="checkout-btn payment-btn"
                          disabled={isProcessing}
                        >
                          <CreditCard size={18} />
                          Pay ${total.toFixed(2)}
                        </button>

                        <button
                          type="button"
                          className="back-btn"
                          onClick={() => setPaymentStep('shipping')}
                          disabled={isProcessing}
                        >
                          Back to Shipping
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="confirmation-section">
                    <div className="confetti-container" ref={confettiRef}></div>
                    <div className="success-animation-container">
                      <div className="checkmark-circle">
                        <div className="checkmark-circle-bg"></div>
                        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                          <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                      </div>
                      <h2 className="success-title">Payment Successful!</h2>
                      <p className="success-message">Your order has been placed successfully.</p>
                      <p className="success-details">You will receive a confirmation email shortly.</p>

                      <button
                        type="button"
                        className="continue-shopping-btn success-button"
                        onClick={() => navigate('/collections')}
                      >
                        Continue Shopping
                      </button>
                      <button
                        type="button"
                        className="view-purchases-btn success-button-secondary"
                        onClick={() => navigate('/purchases')}
                      >
                        View My Purchases
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
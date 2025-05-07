import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import './Purchases.css';

function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const navigate = useNavigate();
  
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId && !!token);

  // Check login status on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const currentUserId = localStorage.getItem('userId');
      const currentToken = localStorage.getItem('token');
      setUserId(currentUserId);
      setToken(currentToken);
      setIsLoggedIn(!!currentUserId && !!currentToken);
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

  // Fetch purchases when component mounts or login status changes
  useEffect(() => {
    const fetchPurchases = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/purchases/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch purchases: ${response.status}`);
        }

        const result = await response.json();
        setPurchases(result.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching purchases:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [isLoggedIn, userId, token]);

  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get order status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      default:
        return 'status-processing';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="purchases-container">
        <div className="login-prompt">
          <h2>Please log in to view your purchases</h2>
          <button className="login-button" onClick={() => navigate('/login')}>
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="purchases-container">
      <h1 className="purchases-title">My Purchases</h1>
      
      {loading ? (
        <div className="loading">Loading your purchase history...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : purchases.length === 0 ? (
        <div className="empty-purchases">
          <Package size={48} />
          <h2>No purchases yet</h2>
          <p>Items you purchase will appear here</p>
          <button className="shop-now-button" onClick={() => navigate('/collections')}>
            Shop Now
          </button>
        </div>
      ) : (
        <div className="purchases-list">
          {purchases.map((purchase) => (
            <div key={purchase._id} className="purchase-card">
              <div 
                className="purchase-header" 
                onClick={() => toggleOrderExpansion(purchase._id)}
              >
                <div className="purchase-info">
                  <div className="purchase-date">
                    Order placed: {formatDate(purchase.orderDate)}
                  </div>
                  <div className="purchase-id">
                    Order ID: {purchase._id}
                  </div>
                </div>
                <div className="purchase-summary">
                  <div className={`status-badge ${getStatusBadgeClass(purchase.orderStatus)}`}>
                    {purchase.orderStatus.charAt(0).toUpperCase() + purchase.orderStatus.slice(1)}
                  </div>
                  <div className="purchase-total">
                    Total: ${purchase.totalAmount.toFixed(2)}
                  </div>
                  <div className="expand-icon">
                    {expandedOrders[purchase._id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>
              
              {expandedOrders[purchase._id] && (
                <div className="purchase-details">
                  <div className="purchase-products">
                    <h3>Products</h3>
                    {purchase.products.map((product, index) => (
                      <div key={index} className="purchase-product">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="product-image" 
                        />
                        <div className="product-info">
                          <div className="product-name">{product.name}</div>
                          <div className="product-details">
                            {product.size && <span>Size: {product.size}</span>}
                            {product.color && <span>Color: {product.color}</span>}
                            <span>Quantity: {product.quantity}</span>
                          </div>
                          <div className="product-price">
                            ${(product.price * product.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="purchase-shipping">
                    <h3>Shipping Address</h3>
                    <div className="address-details">
                      <p>{purchase.shippingAddress.firstName} {purchase.shippingAddress.lastName}</p>
                      <p>{purchase.shippingAddress.address}</p>
                      <p>{purchase.shippingAddress.city}, {purchase.shippingAddress.state} {purchase.shippingAddress.zipCode}</p>
                      <p>{purchase.shippingAddress.country}</p>
                    </div>
                  </div>
                  
                  <div className="purchase-payment">
                    <h3>Payment Information</h3>
                    <div className="payment-details">
                      <p>Method: {purchase.paymentInfo.paymentMethod}</p>
                      <p>Status: {purchase.paymentInfo.paymentStatus}</p>
                      <p>Payment ID: {purchase.paymentInfo.paymentId}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Purchases;

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  MapPin, 
  Truck,
  CheckCircle,
  AlertCircle,
  X,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'

const CartPage = ({ onClose }) => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart()
  const { user, userData } = useAuth()
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY')
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [orderSuccess, setOrderSuccess] = useState(false)

  useEffect(() => {
    // Load user's default address if available
    if (userData?.address) {
      setShippingAddress(userData.address)
    }
  }, [userData])

  const handleCheckout = async () => {
    if (!user || !userData) {
      alert('Please login to place an order')
      return
    }

    if (!shippingAddress.trim()) {
      alert('Please enter a shipping address')
      return
    }

    setIsCheckingOut(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userData.id,
          items: items,
          shippingAddress: shippingAddress,
          paymentMethod: paymentMethod,
          totalAmount: getTotalPrice()
        })
      })

      const data = await response.json()

      if (data.success) {
        setOrderSuccess(true)
        clearCart()
        setTimeout(() => {
          setOrderSuccess(false)
          onClose?.()
        }, 3000)
      } else {
        alert('Failed to place order: ' + data.error)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (orderSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">Your order has been confirmed and will be processed soon.</p>
          <motion.button
            onClick={() => {
              setOrderSuccess(false)
              onClose?.()
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-[#F25D49] to-[#FF6B5B] text-white rounded-lg font-medium"
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl mx-2 sm:mx-4"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F25D49] to-[#FF6B5B] p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Shopping Cart</h2>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {getTotalItems()} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-120px)]">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some products to get started!</p>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-[#F25D49] to-[#FF6B5B] text-white rounded-lg font-medium"
                >
                  Start Shopping
                </motion.button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.proId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-4 flex items-center space-x-4 hover:shadow-md transition-shadow"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.proImages?.[0] || '/placeholder-product.jpg'}
                          alt={item.proName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{item.proName}</h3>
                        <p className="text-sm text-gray-600 truncate">{item.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-lg font-bold text-[#F25D49]">
                            ${parseFloat(item.salePrice) || parseFloat(item.price) || 0}
                          </span>
                          {item.salePrice && parseFloat(item.salePrice) < parseFloat(item.price) && (
                            <span className="text-sm text-gray-500 line-through">
                              ${parseFloat(item.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-white rounded-lg p-2">
                          <button
                            onClick={() => updateQuantity(item.proId, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.proId, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.proId)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Checkout Summary */}
          {items.length > 0 && (
            <div className="lg:w-96 bg-gray-50 p-4 sm:p-6 border-l border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-lg font-bold text-[#F25D49]">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Shipping Address
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your shipping address..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F25D49] focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F25D49] focus:border-transparent"
                >
                  <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                </select>
              </div>

              {/* Checkout Button */}
              <motion.button
                onClick={handleCheckout}
                disabled={isCheckingOut || !shippingAddress.trim()}
                whileHover={{ scale: isCheckingOut ? 1 : 1.02 }}
                whileTap={{ scale: isCheckingOut ? 1 : 0.98 }}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  isCheckingOut || !shippingAddress.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#F25D49] to-[#FF6B5B] text-white hover:shadow-lg'
                }`}
              >
                {isCheckingOut ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Truck className="w-5 h-5" />
                    <span>Place Order</span>
                  </div>
                )}
              </motion.button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing this order, you agree to our terms and conditions.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CartPage

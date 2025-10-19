'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AnimatedCard from '@/components/ui/AnimatedCard'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Star,
  RefreshCw,
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react'

const OrderHistory = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockOrders = [
        {
          id: 'ORD-001',
          date: '2024-01-15',
          status: 'delivered',
          total: 125.50,
          items: [
            { name: 'Wireless Headphones', price: 79.99, quantity: 1, image: '/placeholder-product.jpg' },
            { name: 'Phone Case', price: 15.99, quantity: 2, image: '/placeholder-product.jpg' }
          ],
          shippingAddress: '123 Main St, City, State 12345',
          trackingNumber: 'TRK123456789',
          estimatedDelivery: '2024-01-18'
        },
        {
          id: 'ORD-002',
          date: '2024-01-14',
          status: 'shipped',
          total: 89.99,
          items: [
            { name: 'Laptop Stand', price: 45.99, quantity: 1, image: '/placeholder-product.jpg' },
            { name: 'USB Cable', price: 12.99, quantity: 2, image: '/placeholder-product.jpg' }
          ],
          shippingAddress: '456 Oak Ave, City, State 12345',
          trackingNumber: 'TRK987654321',
          estimatedDelivery: '2024-01-20'
        },
        {
          id: 'ORD-003',
          date: '2024-01-13',
          status: 'processing',
          total: 156.75,
          items: [
            { name: 'Smart Watch', price: 199.99, quantity: 1, image: '/placeholder-product.jpg' }
          ],
          shippingAddress: '789 Pine Rd, City, State 12345',
          trackingNumber: null,
          estimatedDelivery: '2024-01-22'
        },
        {
          id: 'ORD-004',
          date: '2024-01-12',
          status: 'cancelled',
          total: 67.50,
          items: [
            { name: 'Bluetooth Speaker', price: 67.50, quantity: 1, image: '/placeholder-product.jpg' }
          ],
          shippingAddress: '321 Elm St, City, State 12345',
          trackingNumber: null,
          estimatedDelivery: null
        }
      ]
      
      setOrders(mockOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  )

  const OrderCard = ({ order, index }) => (
    <AnimatedCard
      delay={index * 0.1}
      className="p-6 hover-lift"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(order.date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(order.status)}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {order.items.map((item, itemIndex) => (
          <div key={itemIndex} className="flex items-center space-x-3">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">{item.name}</h4>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <span className="font-semibold text-gray-800">${item.price}</span>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Total Amount:</span>
          <span className="text-lg font-bold text-gray-800">${order.total}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedOrder(order)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
            
            {order.status === 'delivered' && (
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Star className="w-4 h-4" />
                <span>Rate Order</span>
              </button>
            )}
            
            {order.status === 'processing' && (
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <XCircle className="w-4 h-4" />
                <span>Cancel Order</span>
              </button>
            )}
          </div>
          
          {order.trackingNumber && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Tracking:</p>
              <p className="font-mono text-sm text-blue-600">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>
    </AnimatedCard>
  )

  const OrderDetailsModal = ({ order, onClose }) => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <p className="font-medium">{order.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Order Date:</span>
                    <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium capitalize">{order.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="font-medium">${order.total}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Items Ordered</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">${item.price}</p>
                        <p className="text-sm text-gray-600">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Shipping Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{order.shippingAddress}</span>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Tracking:</span>
                      <span className="font-mono font-medium text-blue-600">{order.trackingNumber}</span>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Estimated Delivery:</span>
                      <span className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
          <p className="text-gray-600">
            Track and manage your orders
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Orders</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No orders found</h3>
          <p className="text-gray-500">You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order, index) => (
            <OrderCard key={order.id} order={order} index={index} />
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  )
}

export default OrderHistory

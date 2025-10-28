'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  CreditCard,
  User,
  Package,
  ChevronDown,
  X
} from 'lucide-react'

const OrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({})
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter
      })

      const response = await fetch(`/api/orders?${params}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    const calculateStats = () => {
      const totalOrders = orders.length
      const pendingOrders = orders.filter(o => o.status === 'PENDING').length
      const processingOrders = orders.filter(o => o.status === 'PROCESSING').length
      const shippedOrders = orders.filter(o => o.status === 'SHIPPED').length
      const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length
      const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length
      
      setStats({
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders
      })
    }
    
    if (orders.length > 0) {
      calculateStats()
    }
  }, [orders])

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          status: newStatus
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchOrders()
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order status')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-orange-600" />
      case 'PROCESSING':
        return <Package className="w-4 h-4 text-blue-600" />
      case 'SHIPPED':
        return <Truck className="w-4 h-4 text-purple-600" />
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Order Management
            </h1>
            <p className="text-gray-600">Manage and track all customer orders</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-blue-600">{stats.processingOrders || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shipped</p>
              <p className="text-2xl font-bold text-purple-600">{stats.shippedOrders || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelledOrders || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('')
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </button>

          <div className="text-right">
            <p className="text-sm text-gray-600">Total Orders: <span className="font-bold">{stats.totalOrders || 0}</span></p>
          </div>
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence mode="wait">
                    {orders.map((order, index) => (
                      <motion.tr
                        key={`${order.id}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id.substring(0, 8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.user?.username || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.user?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.orderItems?.length || 0} item(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatPrice(parseFloat(order.totalAmount) || 0)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(order.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {order.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                                title="Start Processing"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {order.status === 'PROCESSING' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                                className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors"
                                title="Mark as Shipped"
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                            )}
                            {order.status === 'SHIPPED' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                                title="Mark as Delivered"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold text-gray-900">#{selectedOrder.id.substring(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedOrder.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.paymentMethod || 'N/A'}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedOrder.user?.username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedOrder.user?.email || 'N/A'}</p>
                  </div>
                </div>
                {selectedOrder.shippingAddress && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Shipping Address
                    </p>
                    <p className="font-medium">{selectedOrder.shippingAddress}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      {item.product?.proImages && (
                        <img
                          src={item.product.proImages[0] || '/placeholder-product.jpg'}
                          alt={item.product.proName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">
                          {item.product?.proName || 'Unknown Product'}
                        </h5>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(parseFloat(item.price) || 0)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: {formatPrice((parseFloat(item.price) || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(parseFloat(selectedOrder.totalAmount) || 0)}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OrderManagement


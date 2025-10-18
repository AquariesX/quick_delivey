'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  AlertTriangle,
  UserCheck,
  UserX,
  Settings,
  BarChart3,
  Grid,
  List,
  Table,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react'

const VendorManagement = () => {
  const { userData } = useAuth()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [emailError, setEmailError] = useState('')
  
  // Form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    role: 'VENDOR',
    emailVerification: false
  })
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterVerification, setFilterVerification] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [showAnalytics, setShowAnalytics] = useState(true)
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    totalVendors: 0,
    activeVendors: 0,
    verifiedVendors: 0,
    pendingVendors: 0,
    totalProducts: 0,
    totalRevenue: 0
  })

  // Fetch vendors data
  const fetchVendors = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/users/all')
      const result = await response.json()
      
      if (result.success) {
        const vendorUsers = result.data?.filter(user => user.role === 'VENDOR') || []
        setVendors(vendorUsers)
        
        // Calculate analytics
        const totalVendors = vendorUsers.length
        const activeVendors = vendorUsers.filter(v => v.status !== 'inactive').length
        const verifiedVendors = vendorUsers.filter(v => v.emailVerification).length
        const pendingVendors = vendorUsers.filter(v => !v.emailVerification).length
        
        // Fetch vendor products for revenue calculation
        const productsResponse = await fetch('/api/products?type=products')
        const productsResult = await productsResponse.json()
        const products = productsResult.success ? productsResult.data || [] : []
        
        const vendorProducts = products.filter(p => vendorUsers.some(v => v.uid === p.vendorId))
        const totalProducts = vendorProducts.length
        const totalRevenue = vendorProducts.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0)
        
        setAnalyticsData({
          totalVendors,
          activeVendors,
          verifiedVendors,
          pendingVendors,
          totalProducts,
          totalRevenue
        })
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      if (window.addNotification) {
        window.addNotification('Failed to load vendors data', 'error')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear email error when user starts typing
    if (name === 'email') {
      setEmailError('')
    }
  }

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle add vendor
  const handleAddVendor = async (e) => {
    e.preventDefault()
    
    // Basic client-side validation
    if (!formData.username.trim()) {
      if (window.addNotification) {
        window.addNotification('Please enter a username', 'error')
      }
      return
    }
    
    if (!formData.email.trim()) {
      if (window.addNotification) {
        window.addNotification('Please enter an email address', 'error')
      }
      return
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      if (window.addNotification) {
        window.addNotification('Please enter a valid email address', 'error')
      }
      return
    }
    
    if (!formData.phoneNumber.trim()) {
      if (window.addNotification) {
        window.addNotification('Please enter a phone number', 'error')
      }
      return
    }
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          phoneNumber: formData.phoneNumber.trim(),
          uid: null, // Will be set when vendor sets password
          role: 'VENDOR',
          sendInvitationEmail: true // Always send invitation email
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        if (window.addNotification) {
          window.addNotification('Vendor added successfully! Invitation email sent to vendor.', 'success')
        }
        setShowAddModal(false)
        setFormData({
          username: '',
          email: '',
          phoneNumber: '',
          role: 'VENDOR',
          emailVerification: false
        })
        fetchVendors()
      } else {
        if (window.addNotification) {
          if (result.code === 'EMAIL_ALREADY_EXISTS') {
            window.addNotification(`Email "${formData.email}" is already registered. Please use a different email address.`, 'error')
          } else {
            window.addNotification(result.error || 'Failed to add vendor', 'error')
          }
        }
      }
    } catch (error) {
      console.error('Error adding vendor:', error)
      if (window.addNotification) {
        window.addNotification('Failed to add vendor', 'error')
      }
    }
  }

  // Handle edit vendor
  const handleEditVendor = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          uid: selectedVendor.uid
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        if (window.addNotification) {
          window.addNotification('Vendor updated successfully!', 'success')
        }
        setShowEditModal(false)
        setSelectedVendor(null)
        fetchVendors()
      } else {
        if (window.addNotification) {
          window.addNotification(result.error || 'Failed to update vendor', 'error')
        }
      }
    } catch (error) {
      console.error('Error updating vendor:', error)
      if (window.addNotification) {
        window.addNotification('Failed to update vendor', 'error')
      }
    }
  }

  // Handle delete vendor
  const handleDeleteVendor = async (vendor) => {
    if (!confirm(`Are you sure you want to delete vendor "${vendor.username}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/users?uid=${vendor.uid}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        if (window.addNotification) {
          window.addNotification('Vendor deleted successfully!', 'success')
        }
        fetchVendors()
      } else {
        if (window.addNotification) {
          window.addNotification(result.error || 'Failed to delete vendor', 'error')
        }
      }
    } catch (error) {
      console.error('Error deleting vendor:', error)
      if (window.addNotification) {
        window.addNotification('Failed to delete vendor', 'error')
      }
    }
  }

  // Handle view vendor
  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor)
    setShowViewModal(true)
  }

  // Handle edit click
  const handleEditClick = (vendor) => {
    setSelectedVendor(vendor)
    setFormData({
      username: vendor.username,
      email: vendor.email,
      phoneNumber: vendor.phoneNumber,
      password: '', // Don't pre-fill password for security
      role: vendor.role,
      emailVerification: vendor.emailVerification
    })
    setShowEditModal(true)
  }

  // Toggle vendor verification status
  const handleToggleVerification = async (vendor) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: vendor.uid,
          emailVerification: !vendor.emailVerification
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        if (window.addNotification) {
          window.addNotification(
            `Vendor ${vendor.emailVerification ? 'unverified' : 'verified'} successfully!`, 
            'success'
          )
        }
        fetchVendors()
      } else {
        if (window.addNotification) {
          window.addNotification('Failed to update verification status', 'error')
        }
      }
    } catch (error) {
      console.error('Error updating verification:', error)
      if (window.addNotification) {
        window.addNotification('Failed to update verification status', 'error')
      }
    }
  }

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && vendor.status !== 'inactive') ||
                          (filterStatus === 'inactive' && vendor.status === 'inactive')
    
    const matchesVerification = filterVerification === 'all' ||
                               (filterVerification === 'verified' && vendor.emailVerification) ||
                               (filterVerification === 'unverified' && !vendor.emailVerification)
    
    return matchesSearch && matchesStatus && matchesVerification
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-600">Loading vendors...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
          <p className="text-gray-600">Manage all vendors in the system</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAnalytics 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Vendor
          </motion.button>
        </div>
      </div>

      {/* Analytics Overview */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Vendors</p>
                    <p className="text-3xl font-bold">{analyticsData.totalVendors}</p>
                    <p className="text-blue-100 text-sm mt-1">
                      {analyticsData.activeVendors} active
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-blue-200" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Verified Vendors</p>
                    <p className="text-3xl font-bold">{analyticsData.verifiedVendors}</p>
                    <p className="text-green-100 text-sm mt-1">
                      {analyticsData.pendingVendors} pending
                    </p>
                  </div>
                  <UserCheck className="w-12 h-12 text-green-200" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Total Products</p>
                    <p className="text-3xl font-bold">{analyticsData.totalProducts}</p>
                    <p className="text-purple-100 text-sm mt-1">
                      From all vendors
                    </p>
                  </div>
                  <Package className="w-12 h-12 text-purple-200" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold">{formatCurrency(analyticsData.totalRevenue)}</p>
                    <p className="text-orange-100 text-sm mt-1">
                      From vendor products
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-orange-200" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div>
            <select
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchVendors}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors.map((vendor, index) => (
                <motion.tr
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {vendor.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {vendor.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {vendor.uid}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vendor.email}</div>
                    <div className="text-sm text-gray-500">{vendor.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      vendor.status !== 'inactive' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vendor.status !== 'inactive' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {vendor.emailVerification ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                      )}
                      <span className={`text-sm ${
                        vendor.emailVerification ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {vendor.emailVerification ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(vendor.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewVendor(vendor)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditClick(vendor)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleToggleVerification(vendor)}
                        className={`${vendor.emailVerification ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {vendor.emailVerification ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteVendor(vendor)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vendor Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add New Vendor</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddVendor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="emailVerification"
                    checked={formData.emailVerification}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Email Verified
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">i</span>
                    </div>
                    <div>
                      <p className="text-blue-800 text-sm font-medium">Invitation Email</p>
                      <p className="text-blue-700 text-xs mt-1">
                        An invitation email will be sent to the vendor with a verification link to set up their password and complete account setup.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Vendor
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Vendor Modal */}
      <AnimatePresence>
        {showEditModal && selectedVendor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Vendor</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditVendor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="emailVerification"
                    checked={formData.emailVerification}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Email Verified
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Update Vendor
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Vendor Modal */}
      <AnimatePresence>
        {showViewModal && selectedVendor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Vendor Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedVendor.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedVendor.username}</h4>
                    <p className="text-gray-600">Vendor ID: {selectedVendor.uid}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-700">Email</span>
                    </div>
                    <p className="text-gray-900">{selectedVendor.email}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-700">Phone</span>
                    </div>
                    <p className="text-gray-900">{selectedVendor.phoneNumber}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-700">Joined</span>
                    </div>
                    <p className="text-gray-900">{formatDate(selectedVendor.createdAt)}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Settings className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-700">Status</span>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedVendor.status !== 'inactive' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedVendor.status !== 'inactive' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">Email Verification</span>
                  </div>
                  <div className="flex items-center">
                    {selectedVendor.emailVerification ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                    )}
                    <span className={`text-sm ${
                      selectedVendor.emailVerification ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {selectedVendor.emailVerification ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VendorManagement

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  Calendar,
  Shield,
  Crown,
  Store,
  ChevronDown,
  X,
  Check,
  AlertCircle
} from 'lucide-react'

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [verifiedFilter, setVerifiedFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({})
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        role: roleFilter,
        verified: verifiedFilter
      })

      const response = await fetch(`/api/users?${params}`)
      const data = await response.json()

      if (data.success) {
        setCustomers(data.data || [])
        setTotalPages(data.pagination?.pages || 1)
        setStats({
          totalUsers: data.stats?.totalUsers || 0,
          totalCustomers: data.stats?.totalCustomers || 0,
          totalVendors: data.stats?.totalVendors || 0,
          verifiedUsers: data.stats?.verifiedUsers || 0
        })
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [currentPage, searchTerm, roleFilter, verifiedFilter])

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setShowModal(true)
  }

  const handleDelete = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const response = await fetch(`/api/admin/customers?id=${customerId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        fetchCustomers()
      } else {
        alert('Failed to delete customer')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Failed to delete customer')
    }
  }

  const handleSave = async (customerData) => {
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingCustomer.id,
          ...customerData
        })
      })
      const data = await response.json()

      if (data.success) {
        setShowModal(false)
        setEditingCustomer(null)
        fetchCustomers()
      } else {
        alert('Failed to update customer')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      alert('Failed to update customer')
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Crown className="w-4 h-4 text-purple-600" />
      case 'VENDOR':
        return <Store className="w-4 h-4 text-blue-600" />
      case 'CUSTOMER':
        return <Users className="w-4 h-4 text-green-600" />
      default:
        return <Shield className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'VENDOR':
        return 'bg-blue-100 text-blue-800'
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          Customer Management
        </h1>
        <p className="text-gray-600 text-lg">Manage all users, customers, and vendors with ease</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalUsers || 0}</p>
              <p className="text-xs text-blue-600 mt-1">All registered users</p>
            </div>
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg"
            >
              <Users className="w-8 h-8 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700 mb-1">Customers</p>
              <p className="text-3xl font-bold text-green-900">{stats.totalCustomers || 0}</p>
              <p className="text-xs text-green-600 mt-1">Active customers</p>
            </div>
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg"
            >
              <Users className="w-8 h-8 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-700 mb-1">Vendors</p>
              <p className="text-3xl font-bold text-purple-900">{stats.totalVendors || 0}</p>
              <p className="text-xs text-purple-600 mt-1">Registered vendors</p>
            </div>
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg"
            >
              <Store className="w-8 h-8 text-white" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 shadow-xl backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-700 mb-1">Verified</p>
              <p className="text-3xl font-bold text-orange-900">{stats.verifiedUsers || 0}</p>
              <p className="text-xs text-orange-600 mt-1">Email verified</p>
            </div>
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg"
            >
              <UserCheck className="w-8 h-8 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-600" />
          Search & Filter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-12 pr-8 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 appearance-none"
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="VENDOR">Vendor</option>
              <option value="ADMIN">Admin</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 appearance-none"
            >
              <option value="">All Users</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSearchTerm('')
              setRoleFilter('')
              setVerifiedFilter('')
            }}
            className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-medium"
          >
            Clear Filters
          </motion.button>
        </div>
      </motion.div>

      {/* Customer Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
            />
            <p className="text-gray-600 text-lg">Loading customers...</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-600" />
                Customer List ({customers.length})
              </h3>
            </div>
            
            <div className="p-6">
              {customers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <Users className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">No customers found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {customers.map((customer, index) => (
                      <motion.div
                        key={customer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                      >
                        {/* Customer Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <motion.div 
                              whileHover={{ scale: 1.1 }}
                              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                            >
                              <span className="text-white font-bold text-lg">
                                {customer.username?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </motion.div>
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">{customer.username || 'N/A'}</h4>
                              <p className="text-sm text-gray-500">ID: {customer.uid?.substring(0, 8)}...</p>
                            </div>
                          </div>
                          
                          {/* Role Badge */}
                          <div className="flex items-center">
                            {getRoleIcon(customer.role)}
                            <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(customer.role)}`}>
                              {customer.role}
                            </span>
                          </div>
                        </div>

                        {/* Customer Details */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-3 text-gray-400" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                          
                          {customer.phoneNumber && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-4 h-4 mr-3 text-gray-400" />
                              <span>{customer.phoneNumber}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                            <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center">
                            {customer.emailVerification ? (
                              <div className="flex items-center text-green-600">
                                <Check className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-orange-600">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                <span className="text-sm font-medium">Unverified</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(customer)}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit</span>
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(customer.id)}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm bg-white rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showModal && editingCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edit Customer
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <EditCustomerForm
                customer={editingCustomer}
                onSave={handleSave}
                onCancel={() => setShowModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const EditCustomerForm = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    username: customer.username || '',
    email: customer.email || '',
    phoneNumber: customer.phoneNumber || '',
    role: customer.role || 'CUSTOMER',
    emailVerification: customer.emailVerification || false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 placeholder-gray-500"
            placeholder="Enter username"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 placeholder-gray-500"
            placeholder="Enter email"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 placeholder-gray-500"
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Role
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 appearance-none"
          >
            <option value="CUSTOMER">Customer</option>
            <option value="VENDOR">Vendor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailVerification"
            checked={formData.emailVerification}
            onChange={(e) => setFormData({ ...formData, emailVerification: e.target.checked })}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="emailVerification" className="ml-3 block text-sm font-semibold text-gray-700">
            Email Verified
          </label>
        </div>
      </div>

      <div className="flex space-x-4 pt-6">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg"
        >
          Save Changes
        </motion.button>
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold"
        >
          Cancel
        </motion.button>
      </div>
    </form>
  )
}

export default CustomerManagement

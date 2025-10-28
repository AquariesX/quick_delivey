'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { checkUserAccess, getUserRole } from '@/lib/authHelpers'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CustomerManagement from '@/components/admin/CustomerManagement'
import ProductManagement from '@/components/admin/ProductManagement'
import OrderManagement from '@/components/admin/OrderManagement'
import { 
  Users, 
  Package, 
  BarChart3, 
  Settings, 
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Activity,
  Eye,
  Edit3,
  Plus,
  Filter,
  Search,
  Store,
  Truck,
  CreditCard,
  AlertCircle,
  UserCheck,
  FileText
} from 'lucide-react'

const AdminDashboard = () => {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [dashboardStats, setDashboardStats] = useState({})

  useEffect(() => {
    if (!loading && user) {
      const access = checkUserAccess(user, userData, ['ADMIN'])
      
      if (!access.hasAccess) {
        const userRole = getUserRole(userData)
        
        if (userRole === 'CUSTOMER') {
          router.push('/customer')
        } else if (userRole === 'VENDOR') {
          router.push('/vendor-dashboard')
        } else {
          router.push(access.redirectTo)
        }
        return
      }
    }
  }, [user, userData, loading, router])

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch multiple stats in parallel using original APIs
      const [customersRes, productsRes] = await Promise.all([
        fetch('/api/users?limit=1'),
        fetch('/api/products?type=products&limit=1')
      ])

      const [customersData, productsData] = await Promise.all([
        customersRes.json(),
        productsRes.json()
      ])

      if (customersData.success && productsData.success) {
        setDashboardStats({
          totalUsers: customersData.data?.length || 0,
          totalCustomers: customersData.data?.filter(u => u.role === 'CUSTOMER').length || 0,
          totalVendors: customersData.data?.filter(u => u.role === 'VENDOR').length || 0,
          verifiedUsers: customersData.data?.filter(u => u.emailVerification).length || 0,
          totalProducts: productsData.data?.length || 0,
          approvedProducts: productsData.data?.filter(p => p.approvalStatus === 'Approved').length || 0,
          pendingProducts: productsData.data?.filter(p => p.approvalStatus === 'Pending').length || 0,
          activeProducts: productsData.data?.filter(p => p.status).length || 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'vendors', label: 'Vendors', icon: Store },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={dashboardStats} />
      case 'customers':
        return <CustomerManagement />
      case 'products':
        return <ProductManagement />
      case 'vendors':
        return <VendorsTab />
      case 'orders':
        return <OrderManagement />
      case 'settings':
        return <SettingsTab />
      default:
        return <OverviewTab stats={dashboardStats} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
          />
          <motion.h2 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Loading Admin Dashboard...
          </motion.h2>
          <p className="text-gray-600">Preparing your admin panel</p>
        </motion.div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {userData?.username || 'Admin'}!</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8"
        >
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

const OverviewTab = ({ stats }) => {
  const overviewCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'blue',
      change: '+12%',
      changeType: 'positive',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: Package,
      color: 'green',
      change: '+8%',
      changeType: 'positive',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Active Products',
      value: stats.activeProducts || 0,
      icon: Activity,
      color: 'purple',
      change: '+15%',
      changeType: 'positive',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Pending Approval',
      value: stats.pendingProducts || 0,
      icon: Eye,
      color: 'orange',
      change: '+3%',
      changeType: 'positive',
      gradient: 'from-orange-500 to-orange-600'
    }
  ]

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Create a new product listing',
      icon: Plus,
      color: 'blue',
      action: () => console.log('Add product')
    },
    {
      title: 'Manage Customers',
      description: 'View and manage user accounts',
      icon: Users,
      color: 'green',
      action: () => console.log('Manage customers')
    },
    {
      title: 'Review Products',
      description: 'Approve pending product submissions',
      icon: Edit3,
      color: 'purple',
      action: () => console.log('Review products')
    },
    {
      title: 'View Analytics',
      description: 'Check sales and performance metrics',
      icon: BarChart3,
      color: 'orange',
      action: () => console.log('View analytics')
    }
  ]

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <motion.p 
                  className="text-2xl font-bold text-gray-900"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {card.value}
                </motion.p>
                <p className={`text-sm ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {card.change} from last month
                </p>
              </div>
              <motion.div 
                className={`p-3 rounded-lg bg-gradient-to-r ${card.gradient}`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <card.icon className="w-6 h-6 text-white" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className={`p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-all duration-200 text-left`}
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className={`p-2 rounded-lg bg-${action.color}-100`}
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                </motion.div>
                <div>
                  <h4 className="font-medium text-gray-900">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'New product submitted', user: 'TechStore Pro', time: '2 hours ago', type: 'product' },
            { action: 'Customer registered', user: 'john.doe@email.com', time: '4 hours ago', type: 'user' },
            { action: 'Product approved', user: 'Wireless Headphones', time: '6 hours ago', type: 'approval' },
            { action: 'Vendor verified', user: 'Electronics Hub', time: '8 hours ago', type: 'vendor' }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ x: 5 }}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <motion.div 
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-600">{activity.user}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

const VendorsTab = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Vendor Management</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </motion.button>
      </div>
      <p className="text-gray-600">Vendor management features coming soon...</p>
    </div>
  )
}

const SettingsTab = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
      <p className="text-gray-600">Settings panel coming soon...</p>
    </div>
  )
}

export default AdminDashboard
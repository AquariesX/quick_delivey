'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Store,
  UserCheck,
  Truck,
  AlertCircle,
  Menu,
  X
} from 'lucide-react'

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState({})
  const { user, userData, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const toggleExpanded = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }))
  }

  const handleNavigation = (path) => {
    router.push(path)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getMenuItems = () => {
    const userRole = userData?.role || 'CUSTOMER'
    
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/dashboard',
        roles: ['ADMIN', 'VENDOR', 'DRIVER', 'CUSTOMER']
      }
    ]

    if (userRole === 'ADMIN') {
      return [
        ...baseItems,
        {
          id: 'vendors',
          label: 'Vendors',
          icon: Store,
          path: '/dashboard/vendors',
          roles: ['ADMIN']
        },
        {
          id: 'customers',
          label: 'Customers',
          icon: Users,
          path: '/dashboard/customers',
          roles: ['ADMIN']
        },
        {
          id: 'drivers',
          label: 'Drivers',
          icon: Truck,
          path: '/dashboard/drivers',
          roles: ['ADMIN']
        },
        {
          id: 'payments',
          label: 'Payments',
          icon: CreditCard,
          path: '/dashboard/payments',
          roles: ['ADMIN']
        },
        {
          id: 'orders',
          label: 'Order Management',
          icon: ShoppingBag,
          children: [
            { id: 'new-orders', label: 'New Orders', path: '/dashboard/orders/new' },
            { id: 'order-history', label: 'Order History', path: '/dashboard/orders/history' },
            { id: 'pending-orders', label: 'Pending Orders', path: '/dashboard/orders/pending' }
          ],
          roles: ['ADMIN', 'VENDOR']
        },
        {
          id: 'products',
          label: 'Product Management',
          icon: Package,
          path: '/dashboard/products',
          roles: ['ADMIN', 'VENDOR']
        },
        {
          id: 'employees',
          label: 'Employee Management',
          icon: UserCheck,
          path: '/dashboard/employees',
          roles: ['ADMIN']
        },
        {
          id: 'disputes',
          label: 'Disputes',
          icon: AlertCircle,
          path: '/dashboard/disputes',
          roles: ['ADMIN', 'VENDOR']
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          path: '/dashboard/settings',
          roles: ['ADMIN', 'VENDOR', 'DRIVER', 'CUSTOMER']
        }
      ]
    }

    if (userRole === 'VENDOR') {
      return [
        ...baseItems,
        {
          id: 'orders',
          label: 'Order Management',
          icon: ShoppingBag,
          children: [
            { id: 'new-orders', label: 'New Orders', path: '/dashboard/orders/new' },
            { id: 'order-history', label: 'Order History', path: '/dashboard/orders/history' },
            { id: 'pending-orders', label: 'Pending Orders', path: '/dashboard/orders/pending' }
          ],
          roles: ['VENDOR']
        },
        {
          id: 'products',
          label: 'Product Management',
          icon: Package,
          path: '/dashboard/products',
          roles: ['VENDOR']
        },
        {
          id: 'disputes',
          label: 'Disputes',
          icon: AlertCircle,
          path: '/dashboard/disputes',
          roles: ['VENDOR']
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          path: '/dashboard/settings',
          roles: ['VENDOR']
        }
      ]
    }

    // Default for DRIVER and CUSTOMER
    return [
      ...baseItems,
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        path: '/dashboard/settings',
        roles: ['DRIVER', 'CUSTOMER']
      }
    ]
  }

  const menuItems = getMenuItems()

  const isActive = (path) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true
    if (path !== '/dashboard' && pathname.startsWith(path)) return true
    return false
  }

  const MenuItem = ({ item, level = 0 }) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems[item.id]
    const active = isActive(item.path)

    return (
      <div>
        <motion.div
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
            active 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id)
            } else {
              handleNavigation(item.path)
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </div>
          
          {!isCollapsed && hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {item.children.map((child) => (
                <motion.div
                  key={child.id}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    isActive(child.path)
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-400'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                  style={{ paddingLeft: `${28 + level * 16}px` }}
                  onClick={() => handleNavigation(child.path)}
                >
                  <span className="text-sm font-medium">{child.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/90 backdrop-blur-lg border-r border-gray-200/50 h-full flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      } transition-all duration-300 shadow-lg`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <motion.div 
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-white font-bold text-sm">QD</span>
              </motion.div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Quick Delivery
              </h1>
            </motion.div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 border-b border-gray-200/50"
        >
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white font-semibold text-sm">
                {user?.displayName?.charAt(0) || userData?.username?.charAt(0) || 'U'}
              </span>
            </motion.div>
            <div>
              <p className="font-semibold text-gray-800">
                {userData?.username || user?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userData?.role?.toLowerCase() || 'customer'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Menu Items */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <MenuItem item={item} />
          </motion.div>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200/50">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default Sidebar

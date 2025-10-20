'use client'

import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from './Sidebar'
import { Bell, Search, User, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'

const DashboardLayout = ({ children }) => {
  const { user, userData, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm"
          >
            <div className="flex items-center justify-between px-6 py-4">
              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex-1 max-w-md"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </motion.div>

              {/* Right Side */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center space-x-4"
              >
                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  <motion.span 
                    className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  ></motion.span>
                </motion.button>

                {/* User Profile */}
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.displayName?.charAt(0) || userData?.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-semibold text-gray-800">
                        {userData?.username || user?.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {userData?.role?.toLowerCase() || 'customer'}
                      </p>
                    </div>
                  </motion.div>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      <hr className="my-2" />
                      <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.header>

          {/* Main Content Area */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex-1 overflow-y-auto"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout

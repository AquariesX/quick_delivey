'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { checkUserAccess, getUserRole } from '@/lib/authHelpers'
import ProductCatalog from '@/components/customer/ProductCatalog'
import OrderHistory from '@/components/customer/OrderHistory'
import CustomerProfile from '@/components/customer/CustomerProfile'
import CustomerHero from '@/components/customer/CustomerHero'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { 
  ShoppingBag, 
  Package, 
  User, 
  Heart, 
  Search, 
  Filter,
  Star,
  ShoppingCart,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Grid3X3,
  Layers,
  UserCircle,
  Wishlist,
  Settings
} from 'lucide-react'

const CustomerDashboard = () => {
  const { user, userData, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showCategoriesSidebar, setShowCategoriesSidebar] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [favorites, setFavorites] = useState([])
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New products available!', time: '2 min ago', read: false },
    { id: 2, message: 'Your order has been shipped', time: '1 hour ago', read: true },
    { id: 3, message: 'Flash sale on electronics!', time: '3 hours ago', read: false }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && userData) {
      const access = checkUserAccess(user, userData, ['CUSTOMER'])
      
      if (!access.hasAccess) {
        // Redirect based on user role
        const userRole = getUserRole(userData)
        
        if (userRole === 'ADMIN') {
          router.push('/dashboard')
        } else if (userRole === 'VENDOR') {
          router.push('/vendor-dashboard')
        } else {
          router.push(access.redirectTo)
        }
        return
      }
      
      // Customer - stay on customer page
      setLoading(false)
    }
  }, [user, userData, router])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const handleSignOut = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User }
  ]

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.proId === product.proId)
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.proId === product.proId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }])
    }
  }

  const handleToggleFavorite = (product) => {
    const isFavorite = favorites.find(fav => fav.proId === product.proId)
    if (isFavorite) {
      setFavorites(favorites.filter(fav => fav.proId !== product.proId))
    } else {
      setFavorites([...favorites, product])
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <div>
            <CustomerHero />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ProductCatalog 
                searchQuery={searchQuery}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                favorites={favorites}
              />
            </div>
          </div>
        )
      case 'orders':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <OrderHistory />
          </div>
        )
      case 'favorites':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <div className="text-center py-8">
                <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">My Favorites</h2>
                <p className="text-gray-600">Products you&apos;ve saved for later</p>
              </div>
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No favorites yet</h3>
                  <p className="text-gray-500">Start adding products to your favorites!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favorites.map((product, index) => (
                    <motion.div
                      key={product.proId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 product-card"
                    >
                      <div className="relative">
                        <img 
                          src={product.proImages?.[0] || '/placeholder-product.jpg'} 
                          alt={product.proName}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={() => handleToggleFavorite(product)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.proName}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-blue-600">
                            ${product.price}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="px-4 py-2 bg-[#F25D49] text-white rounded-lg hover:bg-[#F25D49]/90 transition-colors btn-animated"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      case 'profile':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CustomerProfile />
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-orange-200 border-t-[#F25D49] rounded-full mx-auto mb-6"
          />
          <motion.h2 
            className="text-2xl font-bold bg-gradient-to-r from-[#F25D49] to-[#FF6B5B] bg-clip-text text-transparent mb-2"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Loading Dashboard...
          </motion.h2>
          <p className="text-gray-600">Preparing your shopping experience</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* Enhanced Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100"
        >
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Categories button placed before logo */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCategoriesSidebar(!showCategoriesSidebar)}
                className="p-3 text-[#F25D49] hover:bg-[#F25D49]/10 rounded-full transition-all duration-300 mr-3"
                title="Categories"
              >
                <Grid3X3 className="w-6 h-6" />
              </motion.button>

              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-[#F25D49] rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-[#F55E49]">QuickDelivery</span>
              </motion.div>

              {/* Search input (inline on lg+, icon only on smaller screens) */}
              <div className="hidden lg:flex items-center justify-center px-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    aria-label="Search products"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="pl-10 pr-8 py-2 w-64 rounded-full border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F25D49] focus:border-transparent transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // fallback for smaller screens: open search modal or focus search
                  // We'll just log for now; mobile search UI can be added separately
                  console.log('Search clicked')
                }}
                className="lg:hidden flex items-center justify-center p-3 border border-gray-200 rounded-full bg-gray-50 hover:bg-white transition-all duration-300 hover:border-[#F25D49] hover:text-[#F25D49]"
              >
                <Search className="w-6 h-6 text-gray-400 hover:text-[#F25D49] transition-colors" />
              </motion.button>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-2">

                {/* Wishlist */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-3 text-gray-600 hover:text-[#F25D49] hover:bg-[#F25D49]/10 rounded-full transition-all duration-300"
                  title="Wishlist"
                >
                  <Heart className="w-6 h-6" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#F25D49] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </motion.button>

                {/* Cart */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-3 text-gray-600 hover:text-[#F25D49] hover:bg-[#F25D49]/10 rounded-full transition-all duration-300"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#F25D49] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {cartItems.length}
                    </span>
                  )}
                </motion.button>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-3 text-gray-600 hover:text-[#F25D49] hover:bg-[#F25D49]/10 rounded-full transition-all duration-300"
                    title="Notifications"
                  >
                    <Bell className="w-6 h-6" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </motion.button>
                </div>

                {/* User Profile */}
                <div className="relative user-menu-container">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-full transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-[#F55E49] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {user?.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-gray-800">
                        {user?.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">Customer</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </motion.button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-800">{user?.displayName || 'User'}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-1 bg-[#F25D49]/10 text-[#F25D49] text-xs rounded-full">Customer</span>
                        </div>
                        <div className="py-2">
                          <button
                            onClick={() => { setActiveTab('profile'); setShowUserMenu(false) }}
                            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <UserCircle className="w-5 h-5 mr-3 text-[#F55E49]" />
                            Profile Settings
                          </button>
                          <button
                            onClick={() => { setActiveTab('orders'); setShowUserMenu(false) }}
                            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Package className="w-5 h-5 mr-3 text-[#F25D49]" />
                            My Orders
                          </button>
                          <button
                            onClick={() => { setActiveTab('favorites'); setShowUserMenu(false) }}
                            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Heart className="w-5 h-5 mr-3 text-[#F25D49]" />
                            Wishlist
                          </button>
                          <button
                            onClick={() => setShowUserMenu(false)}
                            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-5 h-5 mr-3 text-[#F25D49]" />
                            Settings
                          </button>
                        </div>
                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={() => { handleSignOut(); setShowUserMenu(false) }}
                            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden p-3 text-gray-600 hover:text-[#F25D49] hover:bg-[#F25D49]/10 rounded-full transition-all duration-300"
                >
                  {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

          </div>
        </motion.header>

        {/* Main Content */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Enhanced Mobile Menu Overlay */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
              onClick={() => setShowMobileMenu(false)}
            >
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="w-80 h-full bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                    <button
                      onClick={() => setShowMobileMenu(false)}
                      className="p-2 text-gray-600 hover:text-[#F25D49] hover:bg-[#F25D49]/10 rounded-full transition-all duration-300"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[#F25D49]/10 to-[#FF6B5B]/10 rounded-xl mb-6">
                    <div className="w-12 h-12 bg-[#F25D49] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {user?.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user?.displayName || 'User'}</p>
                      <p className="text-sm text-gray-500">Customer</p>
                    </div>
                  </div>

                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id)
                          setShowMobileMenu(false)
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-[#F25D49]/20 text-[#F25D49] border border-[#F25D49]/30'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-[#F25D49]'
                        }`}
                      >
                        <tab.icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                    
                    {/* Categories Button */}
                    <button
                      onClick={() => {
                        setShowCategoriesSidebar(true)
                        setShowMobileMenu(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-[#F25D49]"
                    >
                      <Grid3X3 className="w-5 h-5" />
                      <span className="font-medium">Categories</span>
                    </button>
                    
                    {/* Sign Out Button */}
                    <button
                      onClick={() => {
                        handleSignOut()
                        setShowMobileMenu(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </nav>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Categories Sidebar */}
        <AnimatePresence>
          {showCategoriesSidebar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex"
              onClick={() => setShowCategoriesSidebar(false)}
            >
              {/* Clear/transparent backdrop that still captures clicks */}
              <div className="absolute inset-0 bg-transparent" />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="relative z-10 w-80 h-full bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <Layers className="w-6 h-6 mr-2 text-[#F25D49]" />
                      Categories
                    </h2>
                    <button
                      onClick={() => setShowCategoriesSidebar(false)}
                      className="p-2 text-gray-600 hover:text-[#F25D49] hover:bg-[#F25D49]/10 rounded-full transition-all duration-300"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSearchQuery('')
                        setShowCategoriesSidebar(false)
                      }}
                      className="w-full flex items-center p-4 rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-[#F25D49]/10 hover:to-[#FF6B5B]/10 hover:text-[#F25D49] transition-all duration-300 border border-transparent hover:border-[#F25D49]/20"
                    >
                      <Package className="w-6 h-6 mr-4 text-[#F25D49]" />
                      <span className="font-semibold text-lg">All Products</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSearchQuery('electronics')
                        setShowCategoriesSidebar(false)
                      }}
                      className="w-full flex items-center p-4 rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-[#F25D49]/10 hover:to-[#FF6B5B]/10 hover:text-[#F25D49] transition-all duration-300 border border-transparent hover:border-[#F25D49]/20"
                    >
                      <Star className="w-6 h-6 mr-4 text-[#F25D49]" />
                      <span className="font-semibold text-lg">Electronics</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSearchQuery('fashion')
                        setShowCategoriesSidebar(false)
                      }}
                      className="w-full flex items-center p-4 rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-[#F25D49]/10 hover:to-[#FF6B5B]/10 hover:text-[#F25D49] transition-all duration-300 border border-transparent hover:border-[#F25D49]/20"
                    >
                      <Heart className="w-6 h-6 mr-4 text-[#F25D49]" />
                      <span className="font-semibold text-lg">Fashion</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSearchQuery('home')
                        setShowCategoriesSidebar(false)
                      }}
                      className="w-full flex items-center p-4 rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-[#F25D49]/10 hover:to-[#FF6B5B]/10 hover:text-[#F25D49] transition-all duration-300 border border-transparent hover:border-[#F25D49]/20"
                    >
                      <ShoppingBag className="w-6 h-6 mr-4 text-[#F25D49]" />
                      <span className="font-semibold text-lg">Home & Kitchen</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSearchQuery('books')
                        setShowCategoriesSidebar(false)
                      }}
                      className="w-full flex items-center p-4 rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-[#F25D49]/10 hover:to-[#FF6B5B]/10 hover:text-[#F25D49] transition-all duration-300 border border-transparent hover:border-[#F25D49]/20"
                    >
                      <Package className="w-6 h-6 mr-4 text-[#F25D49]" />
                      <span className="font-semibold text-lg">Books</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSearchQuery('beauty')
                        setShowCategoriesSidebar(false)
                      }}
                      className="w-full flex items-center p-4 rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-[#F25D49]/10 hover:to-[#FF6B5B]/10 hover:text-[#F25D49] transition-all duration-300 border border-transparent hover:border-[#F25D49]/20"
                    >
                      <Star className="w-6 h-6 mr-4 text-[#F25D49]" />
                      <span className="font-semibold text-lg">Health & Beauty</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
}

export default CustomerDashboard

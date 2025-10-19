'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
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
  ChevronDown
} from 'lucide-react'

const CustomerDashboard = () => {
  const { user, userData, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }, [user, router])

  const handleSignOut = async () => {
    try {
      await signOut()
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
    console.log('Rendering content for tab:', activeTab)
    console.log('Search query:', searchQuery)
    console.log('Cart items:', cartItems.length)
    console.log('Favorites:', favorites.length)
    
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors btn-animated"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-6"
          />
          <motion.h2 
            className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-lg sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">QuickDelivery</span>
              </motion.div>

              {/* Search Bar */}
              <div className="flex-1 max-w-lg mx-8 hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Navigation Dropdown */}
              <div className="hidden md:block relative">
                <div className="relative">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-700"
                  >
                    {tabs.map((tab) => (
                      <option key={tab.id} value={tab.id}>
                        {tab.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.displayName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">Customer</p>
                  </div>
                </div>

                {/* Cart */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </motion.button>

                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Bell className="w-6 h-6" />
                </motion.button>

                {/* Sign Out */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-6 h-6" />
                </motion.button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
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
                      className="p-2 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id)
                          setShowMobileMenu(false)
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <tab.icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                    
                    {/* Sign Out Button */}
                    <button
                      onClick={() => {
                        handleSignOut()
                        setShowMobileMenu(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50"
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
    </div>
  )
}

export default CustomerDashboard

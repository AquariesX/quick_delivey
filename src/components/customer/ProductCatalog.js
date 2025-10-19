'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AnimatedCard from '@/components/ui/AnimatedCard'
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Filter, 
  Grid, 
  List,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Package
} from 'lucide-react'

const ProductCatalog = ({ searchQuery, onAddToCart, onToggleFavorite, favorites }) => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedVendor, setSelectedVendor] = useState('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    console.log('ProductCatalog mounted, fetching products and categories...')
    fetchProducts()
    fetchCategories()
  }, [])

  // Refetch products when filters change
  useEffect(() => {
    fetchProducts()
  }, [searchQuery, selectedCategory, selectedVendor, priceRange, sortBy])

  // Generate dummy products for demonstration
  const generateDummyProducts = () => {
    const dummyProducts = [
      {
        proId: 'dummy-1',
        proName: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
        price: 199.99,
        salePrice: 149.99,
        discount: 25,
        proImages: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
        category: { name: 'Electronics' },
        vendor: { businessName: 'TechStore Pro', role: 'ADMIN' },
        reviews: [
          { rating: 5, comment: 'Amazing sound quality!' },
          { rating: 4, comment: 'Great battery life' }
        ],
        status: true,
        approvalStatus: 'Approved',
        catId: 'electronics',
        vendorId: 'vendor-1'
      },
      {
        proId: 'dummy-2',
        proName: 'Smart Fitness Watch',
        description: 'Track your fitness goals with heart rate monitoring, GPS, and water resistance.',
        price: 299.99,
        proImages: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
        category: { name: 'Wearables' },
        vendor: { businessName: 'FitTech Solutions', role: 'VENDOR' },
        reviews: [
          { rating: 5, comment: 'Perfect for workouts' },
          { rating: 5, comment: 'Accurate heart rate tracking' },
          { rating: 4, comment: 'Good battery life' }
        ],
        status: true,
        approvalStatus: 'Approved',
        catId: 'wearables',
        vendorId: 'vendor-2'
      },
      {
        proId: 'dummy-3',
        proName: 'Premium Coffee Maker',
        description: 'Automatic coffee maker with programmable settings and thermal carafe.',
        price: 89.99,
        salePrice: 69.99,
        discount: 22,
        proImages: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'],
        category: { name: 'Kitchen' },
        vendor: { businessName: 'Home Essentials', role: 'VENDOR' },
        reviews: [
          { rating: 4, comment: 'Makes great coffee' },
          { rating: 5, comment: 'Easy to use' }
        ],
        status: true,
        approvalStatus: 'Approved',
        catId: 'kitchen',
        vendorId: 'vendor-3'
      },
      {
        proId: 'dummy-4',
        proName: 'Gaming Mechanical Keyboard',
        description: 'RGB backlit mechanical keyboard with customizable keys and gaming mode.',
        price: 159.99,
        proImages: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'],
        category: { name: 'Gaming' },
        vendor: { businessName: 'GameZone Official', role: 'ADMIN' },
        reviews: [
          { rating: 5, comment: 'Best keyboard ever!' },
          { rating: 5, comment: 'RGB lighting is amazing' },
          { rating: 4, comment: 'Great for gaming' }
        ],
        status: true,
        approvalStatus: 'Approved',
        catId: 'gaming',
        vendorId: 'vendor-4'
      },
      {
        proId: 'dummy-5',
        proName: 'Portable Bluetooth Speaker',
        description: 'Waterproof portable speaker with 360-degree sound and 12-hour battery.',
        price: 79.99,
        salePrice: 59.99,
        discount: 25,
        proImages: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'],
        category: { name: 'Audio' },
        vendor: { businessName: 'SoundWave Inc', role: 'VENDOR' },
        reviews: [
          { rating: 4, comment: 'Great sound quality' },
          { rating: 5, comment: 'Perfect for outdoor use' }
        ],
        status: true,
        approvalStatus: 'Approved',
        catId: 'audio',
        vendorId: 'vendor-5'
      },
      {
        proId: 'dummy-6',
        proName: 'Wireless Charging Pad',
        description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
        price: 39.99,
        proImages: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'],
        category: { name: 'Accessories' },
        vendor: { businessName: 'TechStore Pro', role: 'ADMIN' },
        reviews: [
          { rating: 5, comment: 'Charges fast' },
          { rating: 4, comment: 'Good value for money' }
        ],
        status: true,
        approvalStatus: 'Approved',
        catId: 'accessories',
        vendorId: 'vendor-1'
      },
      {
        proId: 'dummy-7',
        proName: 'Ergonomic Office Chair',
        description: 'Comfortable ergonomic chair with lumbar support and adjustable height.',
        price: 249.99,
        salePrice: 199.99,
        discount: 20,
        proImages: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
        category: { name: 'Furniture' },
        vendor: { businessName: 'Office Solutions', role: 'VENDOR' },
        reviews: [
          { rating: 5, comment: 'Very comfortable' },
          { rating: 4, comment: 'Great for long work sessions' }
        ],
        status: true,
        approvalStatus: 'Approved',
        catId: 'furniture',
        vendorId: 'vendor-6'
      },
      {
        proId: 'dummy-8',
        proName: 'Smart Home Security Camera',
        description: 'HD security camera with night vision, motion detection, and mobile app.',
        price: 129.99,
        proImages: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
        category: { name: 'Security' },
        vendor: { businessName: 'SecureHome Pro', role: 'ADMIN' },
        reviews: [
          { rating: 5, comment: 'Excellent night vision' },
          { rating: 4, comment: 'Easy to install' },
          { rating: 5, comment: 'Great app interface' }
        ],
        status: true,
        approvalStatus: 'Approved',
        catId: 'security',
        vendorId: 'vendor-7'
      }
    ]
    return dummyProducts
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log('Fetching products from original API...')
      
      // TEMPORARY: Force dummy products for testing
      console.log('Using dummy products for testing')
      const dummyProducts = generateDummyProducts()
      setProducts(dummyProducts)
      setLoading(false)
      return
      
      // Use the original products API that we know works
      const response = await fetch('/api/products?type=products')
      const data = await response.json()
      
      console.log('API Response:', data)
      
      if (data.success && data.data && data.data.length > 0) {
        console.log('Raw API data:', data.data)
        // More lenient filtering - just check if product exists and has basic info
        const activeProducts = data.data.filter(product => 
          product && product.proName && product.price
        )
        console.log('Filtered active products:', activeProducts.length)
        console.log('Active products data:', activeProducts)
        setProducts(activeProducts)
      } else {
        console.log('No real products found, using dummy products for demonstration')
        const dummyProducts = generateDummyProducts()
        setProducts(dummyProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      console.log('Using dummy products due to API error')
      const dummyProducts = generateDummyProducts()
      setProducts(dummyProducts)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from original API...')
      
      // TEMPORARY: Force dummy categories for testing
      console.log('Using dummy categories for testing')
      const dummyCategories = [
        { id: 'electronics', name: 'Electronics', description: 'Electronic devices and gadgets' },
        { id: 'wearables', name: 'Wearables', description: 'Smart watches and fitness trackers' },
        { id: 'kitchen', name: 'Kitchen', description: 'Kitchen appliances and tools' },
        { id: 'gaming', name: 'Gaming', description: 'Gaming accessories and equipment' },
        { id: 'audio', name: 'Audio', description: 'Audio devices and speakers' },
        { id: 'accessories', name: 'Accessories', description: 'Tech accessories and peripherals' },
        { id: 'furniture', name: 'Furniture', description: 'Office and home furniture' },
        { id: 'security', name: 'Security', description: 'Home security and surveillance' }
      ]
      setCategories(dummyCategories)
      return
      
      const response = await fetch('/api/products?type=categories')
      const data = await response.json()
      
      console.log('Categories API Response:', data)
      
      if (data.success && data.data && data.data.length > 0) {
        console.log('Fetched categories from original API:', data.data.length)
        setCategories(data.data)
      } else {
        console.log('No real categories found, using dummy categories for demonstration')
        const dummyCategories = [
          { id: 'electronics', name: 'Electronics', description: 'Electronic devices and gadgets' },
          { id: 'wearables', name: 'Wearables', description: 'Smart watches and fitness trackers' },
          { id: 'kitchen', name: 'Kitchen', description: 'Kitchen appliances and tools' },
          { id: 'gaming', name: 'Gaming', description: 'Gaming accessories and equipment' },
          { id: 'audio', name: 'Audio', description: 'Audio devices and speakers' },
          { id: 'accessories', name: 'Accessories', description: 'Tech accessories and peripherals' },
          { id: 'furniture', name: 'Furniture', description: 'Office and home furniture' },
          { id: 'security', name: 'Security', description: 'Home security and surveillance' }
        ]
        setCategories(dummyCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      console.log('Using dummy categories due to API error')
      const dummyCategories = [
        { id: 'electronics', name: 'Electronics', description: 'Electronic devices and gadgets' },
        { id: 'wearables', name: 'Wearables', description: 'Smart watches and fitness trackers' },
        { id: 'kitchen', name: 'Kitchen', description: 'Kitchen appliances and tools' },
        { id: 'gaming', name: 'Gaming', description: 'Gaming accessories and equipment' },
        { id: 'audio', name: 'Audio', description: 'Audio devices and speakers' },
        { id: 'accessories', name: 'Accessories', description: 'Tech accessories and peripherals' },
        { id: 'furniture', name: 'Furniture', description: 'Office and home furniture' },
        { id: 'security', name: 'Security', description: 'Home security and surveillance' }
      ]
      setCategories(dummyCategories)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.proName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.catId === selectedCategory
    const matchesVendor = !selectedVendor || product.vendorId === selectedVendor
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max
    
    return matchesSearch && matchesCategory && matchesVendor && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return (b.reviews?.length || 0) - (a.reviews?.length || 0)
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt)
    }
  })

  const ProductCard = ({ product, index }) => {
    const isFavorite = favorites.find(fav => fav.proId === product.proId)
    const averageRating = product.reviews?.length ? 
      product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length : 0

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ 
          y: -10, 
          scale: 1.02,
          rotateY: 2
        }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group product-card border border-gray-100 hover:border-purple-200"
      >
        <div className="relative">
          <img 
            src={product.proImages?.[0] || '/placeholder-product.jpg'} 
            alt={product.proName}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <motion.button
              onClick={() => onToggleFavorite(product)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 transition-all duration-300"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'} transition-colors duration-300`} />
            </motion.button>
            {product.discount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg"
              >
                -{product.discount}%
              </motion.span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-3">
            <motion.span 
              className="text-xs text-purple-600 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full font-medium"
              whileHover={{ scale: 1.05 }}
            >
              {product.category?.name}
            </motion.span>
          </div>
          
          <h3 className="font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300 text-lg">
            {product.proName}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">
              ({product.reviews?.length || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              {product.salePrice && product.salePrice < product.price ? (
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ${product.salePrice}
                  </span>
                  <span className="text-sm text-gray-500 line-through ml-2">
                    ${product.price}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ${product.price}
                </span>
              )}
            </div>
            
            <motion.button
              onClick={() => onAddToCart(product)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="font-medium">Add</span>
            </motion.button>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Sold by: <span className="font-medium text-purple-600">{product.vendor?.businessName || 'Unknown Vendor'}</span>
            </div>
            {product.vendor?.role === 'ADMIN' && (
              <motion.span 
                className="px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-bold rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                Official Store
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    console.log('ProductCatalog loading...')
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading products..." />
      </div>
    )
  }

  console.log('ProductCatalog products:', products.length)
  console.log('ProductCatalog categories:', categories.length)
  console.log('ProductCatalog products data:', products)
  console.log('ProductCatalog filtered products:', filteredProducts.length)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Products
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredProducts.length} products found
          </motion.p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:w-64 flex-shrink-0"
            >
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Category</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={selectedCategory === ''}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">All Categories</span>
                    </label>
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={selectedCategory === category.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Vendor Filter */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Vendor</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="vendor"
                        value=""
                        checked={selectedVendor === ''}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">All Vendors</span>
                    </label>
                    {Array.from(new Set(products.map(p => p.vendor?.businessName).filter(Boolean))).map((vendorName) => {
                      const vendor = products.find(p => p.vendor?.businessName === vendorName)?.vendor
                      return (
                        <label key={vendor?.id} className="flex items-center">
                          <input
                            type="radio"
                            name="vendor"
                            value={vendor?.id}
                            checked={selectedVendor === vendor?.id}
                            onChange={(e) => setSelectedVendor(e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-sm flex items-center">
                            {vendorName}
                            {vendor?.role === 'ADMIN' && (
                              <span className="ml-2 px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                Official
                              </span>
                            )}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div className="flex-1">
          {sortedProducts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Package className="w-12 h-12 text-purple-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your search or filters</p>
              <motion.button
                onClick={() => {
                  // Clear filters by triggering parent component to reset searchQuery
                  window.location.reload() // Simple solution to reset all filters
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Clear Filters
              </motion.button>
            </motion.div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.proId} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCatalog

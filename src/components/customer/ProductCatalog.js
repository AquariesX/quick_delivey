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

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log('Fetching products from original API...')
      
      // Use the original products API that we know works
      const response = await fetch('/api/products?type=products')
      const data = await response.json()
      
      console.log('API Response:', data)
      
      if (data.success && data.data) {
        // Filter for active products with vendors
        const activeProducts = data.data.filter(product => 
          product.status && product.vendor
        )
        console.log('Fetched products from original API:', activeProducts.length)
        setProducts(activeProducts)
      } else {
        console.error('Failed to fetch products:', data.error)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from original API...')
      const response = await fetch('/api/products?type=categories')
      const data = await response.json()
      
      console.log('Categories API Response:', data)
      
      if (data.success && data.data) {
        console.log('Fetched categories from original API:', data.data.length)
        setCategories(data.data)
      } else {
        console.error('Failed to fetch categories:', data.error)
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
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

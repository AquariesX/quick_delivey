'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
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
  Package,
  Truck,
  ShoppingBag,
  Tag,
  Home,
  Smartphone
} from 'lucide-react'

const ProductCatalog = ({ searchQuery, onToggleFavorite, favorites }) => {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [selectedVendor, setSelectedVendor] = useState('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    console.log('ProductCatalog mounted, fetching products and categories...')
    fetchProducts()
    fetchCategories()
  }, [])

  // Refetch products when filters change
  useEffect(() => {
    fetchProducts()
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedVendor, sortBy])

  // Fetch subcategories when a category is selected
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        if (!selectedCategory) {
          setSubcategories([])
          setSelectedSubcategory('')
          return
        }
        const response = await fetch(`/api/products?type=subcategories&categoryId=${selectedCategory}`)
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
          setSubcategories(data.data)
          setSelectedSubcategory('')
        } else {
          setSubcategories([])
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err)
        setSubcategories([])
      }
    }
    fetchSubcategories()
  }, [selectedCategory])
  

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log('Fetching products from database...')

      const response = await fetch('/api/products?type=products')
      const data = await response.json()
      
      console.log('API Response:', data)
      
      if (data.success && data.data) {
        console.log('Products found:', data.data.length)
        console.log('Raw products data:', data.data)
        // Filter for active and approved products only
        const activeProducts = data.data.filter(product => 
          product && 
          product.proName && 
          product.price && 
          product.status === true && 
          product.approvalStatus === 'Approved'
        )
        console.log('Active approved products:', activeProducts.length)
        console.log('Filtered products:', activeProducts)
        
        // If no approved products, show all products for debugging
        if (activeProducts.length === 0) {
          console.log('No approved products found, showing all products for debugging')
          const allProducts = data.data.filter(product => 
            product && product.proName && product.price
          )
          setProducts(allProducts)
        } else {
          setProducts(activeProducts)
        }
      } else {
        console.log('No products found in API response')
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
      
      if (data.success && data.data && data.data.length > 0) {
        console.log('Fetched categories from original API:', data.data.length)
        setCategories(data.data)
      } else {
        console.log('Failed to Fetch the Categories')
    
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
     }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.proName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.catId === selectedCategory
    const matchesSubcategory = !selectedSubcategory || product.subCatId === Number(selectedSubcategory)
    const matchesVendor = !selectedVendor || product.vendorId === selectedVendor
    const productPrice = parseFloat(product.price) || 0
    const matchesPrice = productPrice >= priceRange.min && productPrice <= priceRange.max
    
    console.log(`Product: ${product.proName}, catId: ${product.catId}, subCatId: ${product.subCatId}, selectedCategory: ${selectedCategory}, selectedSubcategory: ${selectedSubcategory}`)
    console.log(`matchesSearch: ${matchesSearch}, matchesCategory: ${matchesCategory}, matchesSubcategory: ${matchesSubcategory}, matchesVendor: ${matchesVendor}, matchesPrice: ${matchesPrice}`)
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesVendor && matchesPrice
  })
  
  console.log('Total products:', products.length)
  console.log('Filtered products:', filteredProducts.length)
  console.log('Selected category:', selectedCategory)
  console.log('Selected subcategory:', selectedSubcategory)
  console.log('Price range:', priceRange)
  console.log('Search query:', searchQuery)

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)
      case 'price-high':
        return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
      >
        <div className="relative h-40 bg-gray-100">
          <img 
            src={product.proImages?.[0] || '/placeholder-product.jpg'} 
            alt={product.proName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(product)
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </motion.button>
          </div>
        </div>
        
        <div className="p-3">
          <div className="mb-2">
            <span className="text-xs text-[#F25D49] bg-orange-50 px-2 py-0.5 rounded font-medium">
              {product.category?.name}
            </span>
          </div>
          
          <h3 className="font-semibold text-sm text-gray-800 mb-1 line-clamp-1 group-hover:text-[#F25D49] transition-colors">
            {product.proName}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviews?.length || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              {product.salePrice && parseFloat(product.salePrice) < parseFloat(product.price) ? (
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#F25D49]">
                    ${parseFloat(product.salePrice)}
                  </span>
                  <span className="text-xs text-gray-500 line-through">
                    ${parseFloat(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-base font-bold text-[#F25D49]">
                  ${parseFloat(product.price)}
                </span>
              )}
            </div>
            
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                addToCart(product)
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 bg-gradient-to-r from-[#F25D49] to-[#FF6B5B] text-white rounded-lg text-xs font-medium hover:from-[#F25D49]/90 hover:to-[#FF6B5B]/90 transition-all duration-300 flex items-center gap-1"
            >
              <ShoppingCart className="w-3 h-3" />
              <span>Add</span>
            </motion.button>
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
  console.log('ProductCatalog sorted products:', sortedProducts.length)

  return (
    <div className="w-full overflow-x-hidden">
      <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-[#F25D49] via-[#FF6B5B] to-[#FF8E7A] bg-clip-text text-transparent"
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
            className="flex items-center space-x-2 px-4 py-2 bg-[#F25D49] text-white rounded-lg hover:bg-[#F25D49]/90 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </motion.div>

      {/* Category Cards Section (example-style pastel cards) */}
      {categories.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-4">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-2">
            {categories.map((cat, idx) => {
              // pastel color palette
              const palette = ['#FBE9E7', '#E8FCF0', '#E8F2FF', '#FFF0F6', '#F3F4F6']
              const bg = palette[idx % palette.length]
              // category icons mapping
              const categoryIcons = {
                'Electronics': Smartphone,
                'Food & Groceries': Truck,
                'All Products': ShoppingBag,
                'Home & Kitchen': Home,
                'Fashion': Tag,
                'Default': Package
              }
              const IconComp = categoryIcons[cat.name] || categoryIcons['Default']
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="group p-4 flex flex-col items-center justify-start text-center hover:scale-105 transform transition-all duration-300"
                  title={cat.description || cat.name}
                >
                  <div style={{ background: bg }} className="w-full h-44 rounded-xl shadow-md overflow-hidden flex items-center justify-center p-4">
                    <div className="text-6xl text-gray-800 opacity-90 flex items-center justify-center">
                      <IconComp className="w-16 h-16" />
                    </div>
                  </div>
                  <div className="mt-3 w-full">
                    <h3 className="font-semibold text-center">{cat.name}</h3>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Category and Subcategory Tabs */}
      <div className="space-y-4">
        {/* Categories Tabs */}
  <div className="flex items-center gap-2 flex-wrap pb-1">
          <button
            onClick={() => { setSelectedCategory(''); setSelectedSubcategory('') }}
            className={`px-4 py-2 rounded-full whitespace-nowrap border transition-colors ${
              selectedCategory === '' ? 'bg-[#F25D49] text-white border-[#F25D49]' : 'bg-white text-gray-700 border-gray-200 hover:bg-[#F25D49]/10'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap border transition-colors ${
                selectedCategory === cat.id ? 'bg-[#F25D49] text-white border-[#F25D49]' : 'bg-white text-gray-700 border-gray-200 hover:bg-[#F25D49]/10'
              }`}
              title={cat.description || cat.name}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Subcategories Tabs (shown when category selected) */}
        {selectedCategory && (
          <div className="flex items-center gap-2 flex-wrap pb-1">
            <button
              onClick={() => setSelectedSubcategory('')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap border text-sm transition-colors ${
                selectedSubcategory === '' ? 'bg-[#FF6B5B] text-white border-[#FF6B5B]' : 'bg-white text-gray-700 border-gray-200 hover:bg-[#FF6B5B]/10'
              }`}
            >
              All Subcategories
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.subCatId}
                onClick={() => setSelectedSubcategory(String(sub.subCatId))}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap border text-sm transition-colors ${
                  selectedSubcategory === String(sub.subCatId) ? 'bg-[#FF6B5B] text-white border-[#FF6B5B]' : 'bg-white text-gray-700 border-gray-200 hover:bg-[#FF6B5B]/10'
                }`}
                title={sub.subCatName}
              >
                {sub.subCatName}
              </button>
            ))}
          </div>
        )}
      </div>

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
                className="w-24 h-24 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Package className="w-12 h-12 text-[#F25D49]" />
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
                className="mt-4 px-6 py-2 bg-gradient-to-r from-[#F25D49] to-[#FF6B5B] text-white rounded-lg hover:from-[#F25D49]/90 hover:to-[#FF6B5B]/90 transition-all duration-300"
              >
                Clear Filters
              </motion.button>
            </motion.div>
          ) : (
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
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
    </div>
  )
} 

export default ProductCatalog

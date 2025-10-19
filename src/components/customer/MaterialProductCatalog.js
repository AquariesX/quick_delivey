'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  IconButton,
  Rating,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Slider,
  Switch,
  FormControlLabel,
  AppBar,
  Toolbar,
  Badge,
  Avatar,
  Menu,
  Container,
  Paper,
  Stack,
  Fab
} from '@mui/material'
import {
  Search,
  FilterList,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Star,
  Store,
  Person,
  Notifications,
  Menu as MenuIcon,
  Close,
  Logout
} from '@mui/icons-material'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const MaterialProductCatalog = ({ searchQuery, onAddToCart, onToggleFavorite, favorites }) => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedVendor, setSelectedVendor] = useState('')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

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
      }
    ]
    return dummyProducts
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      console.log('Fetching products from original API...')
      
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
        
        if (activeProducts.length > 0) {
          setProducts(activeProducts)
        } else {
          console.log('No products passed filtering, using dummy products for demonstration')
          const dummyProducts = generateDummyProducts()
          setProducts(dummyProducts)
        }
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
          { id: 'accessories', name: 'Accessories', description: 'Tech accessories and peripherals' }
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
        { id: 'accessories', name: 'Accessories', description: 'Tech accessories and peripherals' }
      ]
      setCategories(dummyCategories)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.proName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.catId === selectedCategory
    const matchesVendor = !selectedVendor || product.vendorId === selectedVendor
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
    
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -5 }}
      >
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: 6
            }
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="200"
              image={product.proImages?.[0] || '/placeholder-product.jpg'}
              alt={product.proName}
              sx={{ objectFit: 'cover' }}
            />
            <IconButton
              onClick={() => onToggleFavorite(product)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }}
            >
              {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
            {product.discount > 0 && (
              <Chip
                label={`-${product.discount}%`}
                color="error"
                size="small"
                sx={{ position: 'absolute', top: 8, left: 8 }}
              />
            )}
          </Box>
          
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {product.category?.name}
            </Typography>
            
            <Typography variant="h6" component="h3" gutterBottom sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {product.proName}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 2
            }}>
              {product.description}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={averageRating} readOnly size="small" />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ({product.reviews?.length || 0})
              </Typography>
            </Box>
            
            <Box sx={{ mt: 'auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  ${product.salePrice && product.salePrice < product.price ? product.salePrice : product.price}
                  {product.salePrice && product.salePrice < product.price && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', ml: 1 }}>
                      ${product.price}
                    </Typography>
                  )}
                </Typography>
                
                <Button
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  onClick={() => onAddToCart(product)}
                  size="small"
                >
                  Add
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Sold by: <strong>{product.vendor?.businessName || 'Unknown Vendor'}</strong>
                </Typography>
                {product.vendor?.role === 'ADMIN' && (
                  <Chip label="Official Store" color="success" size="small" />
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <LoadingSpinner size="lg" text="Loading products..." />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {filteredProducts.length} products found
        </Typography>
      </Box>

      {/* Filters and Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              size="small"
              sx={{ minWidth: 300 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort by"
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </Stack>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Filters Sidebar */}
        <Drawer
          anchor="left"
          open={showFilters}
          onClose={() => setShowFilters(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 300,
              position: 'relative',
              height: 'auto',
              boxShadow: 'none',
              border: 'none'
            }
          }}
        >
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Filters</Typography>
              <IconButton onClick={() => setShowFilters(false)}>
                <Close />
              </IconButton>
            </Box>
            
            {/* Category Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Category</Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Vendor Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Vendor</Typography>
              <FormControl fullWidth size="small">
                <InputLabel>Vendor</InputLabel>
                <Select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  label="Vendor"
                >
                  <MenuItem value="">All Vendors</MenuItem>
                  {Array.from(new Set(products.map(p => p.vendor?.businessName).filter(Boolean))).map((vendorName) => {
                    const vendor = products.find(p => p.vendor?.businessName === vendorName)?.vendor
                    return (
                      <MenuItem key={vendor?.id} value={vendor?.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {vendorName}
                          {vendor?.role === 'ADMIN' && (
                            <Chip label="Official" color="success" size="small" />
                          )}
                        </Box>
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Box>
            
            {/* Price Range */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </Typography>
              <Slider
                value={priceRange}
                onChange={(e, newValue) => setPriceRange(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
                step={10}
              />
            </Box>
          </Paper>
        </Drawer>

        {/* Products Grid */}
        <Box sx={{ flexGrow: 1 }}>
          {sortedProducts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filters
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {sortedProducts.map((product, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.proId}>
                  <ProductCard product={product} index={index} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Container>
  )
}

export default MaterialProductCatalog

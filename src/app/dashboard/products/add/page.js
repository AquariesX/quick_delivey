'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMultipleImages } from '@/lib/imageUpload'
import NextImage from 'next/image'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  ArrowLeft,
  Package, 
  Upload,
  Image,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Hash,
  Tag,
  BarChart3,
  FileText,
  Camera,
  Plus,
  Palette,
  Ruler,
  Sparkles
} from 'lucide-react'

const AddProductPage = () => {
  const router = useRouter()
  const { userData, user, loading } = useAuth()
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSizePopup, setShowSizePopup] = useState(false)
  const [showColorPopup, setShowColorPopup] = useState(false)
  
  const [formData, setFormData] = useState({
    proName: '',
    description: '',
    catId: '',
    subCatId: '',
    price: '',
    cost: '',
    discount: '',
    sku: '',
    barcode: '',
    qnty: '',
    stock: '',
    status: true,
    images: [],
    // New Product Fields
    brandName: '',
    manufacturer: '',
    keyFeatures: [],
    productType: '',
    variations: {},
    sizeName: '',
    modelNumber: '',
    productDimensions: '',
    packageWeight: '',
    salePrice: '',
    saleStartDate: '',
    saleEndDate: '',
    currency: 'USD',
    conditionType: '',
    warranty: '',
    ingredients: '',
    reviews: [],
    // Size and Color fields
    size: '',
    customSize: '',
    color: '',
    customColor: ''
  })

  const [errors, setErrors] = useState({})

  // Predefined colors with hex values
  const predefinedColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Yellow', hex: '#F59E0B' },
    { name: 'Purple', hex: '#8B5CF6' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Orange', hex: '#F97316' },
    { name: 'Gray', hex: '#6B7280' },
    { name: 'Brown', hex: '#92400E' },
    { name: 'Navy', hex: '#1E3A8A' }
  ]

  // Authentication and access control
  useEffect(() => {
    if (!loading) {
      if (!user || !user.emailVerified || !userData) {
        router.push('/login')
        return
      }

      // Check if user has access to add products
      const userRole = userData?.role || 'CUSTOMER'
      const canAccess = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'VENDOR'
      
      if (!canAccess) {
        router.push('/dashboard')
        return
      }
    }
  }, [user, userData, loading, router])

  // Fetch categories and subcategories
  useEffect(() => {
    if (!userData?.uid) return
    
    const fetchData = async () => {
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          fetch('/api/products?type=categories'),
          fetch('/api/products?type=subcategories')
        ])
        
        const categoriesResult = await categoriesRes.json()
        const subcategoriesResult = await subcategoriesRes.json()
        
        if (categoriesResult.success) {
          setCategories(categoriesResult.data || [])
        }
        if (subcategoriesResult.success) {
          setSubcategories(subcategoriesResult.data || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        if (window.addNotification) {
          window.addNotification('Failed to load categories and subcategories', 'error')
        }
      }
    }
    
    fetchData()
  }, [userData?.uid])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.proName.trim()) {
      newErrors.proName = 'Product name is required'
    }
    if (!formData.catId) {
      newErrors.catId = 'Category is required'
    }
    if (!formData.subCatId) {
      newErrors.subCatId = 'Subcategory is required'
    }
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required'
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      newErrors.cost = 'Valid cost is required'
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('Form submission started with data:', {
      proName: formData.proName,
      catId: formData.catId,
      subCatId: formData.subCatId,
      price: formData.price,
      cost: formData.cost,
      vendorId: userData?.uid,
      createdById: userData?.uid
    })
    
    if (!validateForm()) {
      console.log('Form validation failed')
      if (window.addNotification) {
        window.addNotification('Please fix the errors before submitting', 'error')
      }
      return
    }

    setIsSubmitting(true)
    
    try {
      const requestBody = {
        type: 'product',
        proName: formData.proName,
        description: formData.description,
        catId: formData.catId,
        subCatId: parseInt(formData.subCatId),
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        discount: parseFloat(formData.discount) || 0,
        sku: formData.sku,
        barcode: formData.barcode || formData.sku,
        qnty: parseInt(formData.qnty) || parseInt(formData.stock),
        stock: parseInt(formData.stock),
        proImages: formData.images,
        vendorId: userData?.uid,
        createdById: userData?.uid,
        // New Product Fields
        brandName: formData.brandName || null,
        manufacturer: formData.manufacturer || null,
        keyFeatures: formData.keyFeatures.length > 0 ? formData.keyFeatures : null,
        productType: formData.productType || null,
        variations: Object.keys(formData.variations).length > 0 ? formData.variations : null,
        sizeName: formData.sizeName || null,
        modelNumber: formData.modelNumber || null,
        productDimensions: formData.productDimensions || null,
        packageWeight: formData.packageWeight || null,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        saleStartDate: formData.saleStartDate || null,
        saleEndDate: formData.saleEndDate || null,
        currency: formData.currency || 'USD',
        conditionType: formData.conditionType || null,
        warranty: formData.warranty || null,
        ingredients: formData.ingredients || null,
        reviews: formData.reviews.length > 0 ? formData.reviews : null,
        // Size and Color fields
        size: formData.size === 'custom' ? formData.customSize : formData.size || null,
        color: formData.color === 'custom' ? formData.customColor : formData.color || null
      }
      
      console.log('Sending request to API with body:', requestBody)
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('API response status:', response.status)
      const result = await response.json()
      console.log('API response result:', result)
      
      if (result.success) {
        console.log('Product created successfully')
        if (window.addNotification) {
          window.addNotification('Product added successfully!', 'success')
        }
        router.push('/dashboard/products')
      } else {
        console.error('Failed to add product:', result.error)
        if (window.addNotification) {
          window.addNotification(`Failed to add product: ${result.error}`, 'error')
        }
      }
    } catch (error) {
      console.error('Error adding product:', error)
      if (window.addNotification) {
        window.addNotification('Error adding product. Please try again.', 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return

    setUploadingImages(true)
    
    try {
      const result = await uploadMultipleImages(files, 'product_images')
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...result.urls]
        }))
        
        if (window.addNotification) {
          window.addNotification(`Successfully uploaded ${result.urls.length} image(s)`, 'success')
        }
        
        if (result.errors && result.errors.length > 0) {
          if (window.addNotification) {
            window.addNotification(`Warning: ${result.errors.length} image(s) failed to upload`, 'warning')
          }
        }
      } else {
        if (window.addNotification) {
          window.addNotification(`Failed to upload images: ${result.error}`, 'error')
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      if (window.addNotification) {
        window.addNotification(`Error uploading images: ${error.message}`, 'error')
      }
    } finally {
      setUploadingImages(false)
    }
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  // Access control
  if (!user || !user.emailVerified || !userData) {
    return null
  }

  const userRole = userData?.role || 'CUSTOMER'
  const canAccess = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'VENDOR'
  
  if (!canAccess) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600 mt-1">Create a new product listing for your store</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.proName}
                    onChange={(e) => handleInputChange('proName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200 hover:border-gray-400 shadow-sm ${
                      errors.proName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.proName && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.proName && (
                  <p className="mt-1 text-sm text-red-600">{errors.proName}</p>
                )}
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 transition-colors ${
                      errors.sku ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter SKU"
                  />
                  {errors.sku && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                )}
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <div className="relative">
                  <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 transition-colors"
                    placeholder="Enter barcode"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.catId}
                    onChange={(e) => {
                      handleInputChange('catId', e.target.value)
                      handleInputChange('subCatId', '') // Reset subcategory
                    }}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 transition-colors ${
                      errors.catId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {errors.catId && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.catId && (
                  <p className="mt-1 text-sm text-red-600">{errors.catId}</p>
                )}
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.subCatId}
                    onChange={(e) => handleInputChange('subCatId', e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 transition-colors ${
                      errors.subCatId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${!formData.catId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!formData.catId}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories
                      .filter(sub => sub.catId === formData.catId)
                      .map(subcategory => (
                        <option key={subcategory.subCatId} value={subcategory.subCatId}>
                          {subcategory.subCatName}
                        </option>
                      ))
                    }
                  </select>
                  {errors.subCatId && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.subCatId && (
                  <p className="mt-1 text-sm text-red-600">{errors.subCatId}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 transition-colors"
                  placeholder="Enter product description"
                />
              </div>
            </div>
          </motion.div>

          {/* Additional Product Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Additional Product Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange('brandName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                  placeholder="Enter brand name"
                />
              </div>

              {/* Manufacturer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                  placeholder="Enter manufacturer"
                />
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type
                </label>
                <select
                  value={formData.productType}
                  onChange={(e) => handleInputChange('productType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                >
                  <option value="">Select Product Type</option>
                  <option value="Physical">Physical Product</option>
                  <option value="Digital">Digital Product</option>
                  <option value="Service">Service</option>
                  <option value="Subscription">Subscription</option>
                </select>
              </div>

              {/* Model Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Number
                </label>
                <input
                  type="text"
                  value={formData.modelNumber}
                  onChange={(e) => handleInputChange('modelNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                  placeholder="Enter model number"
                />
              </div>

              {/* Size */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Size
                  </label>
                  <motion.button
                    type="button"
                    onClick={() => setShowSizePopup(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Custom</span>
                  </motion.button>
                </div>
                <div className="space-y-3">
                  <select
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200 hover:border-gray-400 shadow-sm"
                  >
                    <option value="">Select Size</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="XL">XL</option>
                  </select>
                  {formData.size && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm"
                    >
                      <div className="p-1 bg-blue-200 rounded-lg">
                        <Ruler className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-semibold text-blue-800">{formData.size}</span>
                      <button
                        type="button"
                        onClick={() => handleInputChange('size', '')}
                        className="ml-auto p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-200 rounded-lg transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Color */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Color
                  </label>
                  <motion.button
                    type="button"
                    onClick={() => setShowColorPopup(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Palette className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Custom</span>
                  </motion.button>
                </div>
                <div className="space-y-3">
                  <select
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 transition-all duration-200 hover:border-gray-400 shadow-sm"
                  >
                    <option value="">Select Color</option>
                    {predefinedColors.slice(0, 4).map(color => (
                      <option key={color.name} value={color.name}>{color.name}</option>
                    ))}
                  </select>
                  {formData.color && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm"
                    >
                      <div className="p-1 bg-purple-200 rounded-lg">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                          style={{ backgroundColor: predefinedColors.find(c => c.name === formData.color)?.hex || '#6B7280' }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-purple-800">{formData.color}</span>
                      <button
                        type="button"
                        onClick={() => handleInputChange('color', '')}
                        className="ml-auto p-1 text-purple-500 hover:text-purple-700 hover:bg-purple-200 rounded-lg transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Condition Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition Type
                </label>
                <select
                  value={formData.conditionType}
                  onChange={(e) => handleInputChange('conditionType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                >
                  <option value="">Select Condition</option>
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Open Box">Open Box</option>
                </select>
              </div>

              {/* Product Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Dimensions
                </label>
                <input
                  type="text"
                  value={formData.productDimensions}
                  onChange={(e) => handleInputChange('productDimensions', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                  placeholder="e.g., 10 x 5 x 3 inches"
                />
              </div>

              {/* Package Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Weight
                </label>
                <input
                  type="text"
                  value={formData.packageWeight}
                  onChange={(e) => handleInputChange('packageWeight', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                  placeholder="e.g., 2.5 lbs"
                />
              </div>

              {/* Warranty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty
                </label>
                <input
                  type="text"
                  value={formData.warranty}
                  onChange={(e) => handleInputChange('warranty', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                  placeholder="e.g., 1 year manufacturer warranty"
                />
              </div>

            </div>

            {/* Key Features */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Product Features
              </label>
              <div className="space-y-2">
                {formData.keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...formData.keyFeatures]
                        newFeatures[index] = e.target.value
                        handleInputChange('keyFeatures', newFeatures)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                      placeholder="Enter feature"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newFeatures = formData.keyFeatures.filter((_, i) => i !== index)
                        handleInputChange('keyFeatures', newFeatures)
                      }}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newFeatures = [...formData.keyFeatures, '']
                    handleInputChange('keyFeatures', newFeatures)
                  }}
                  className="px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                >
                  + Add Feature
                </button>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients
              </label>
              <textarea
                value={formData.ingredients}
                onChange={(e) => handleInputChange('ingredients', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                placeholder="Enter ingredients (for food/cosmetics products)"
              />
            </div>
          </motion.div>

          {/* Sale Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Sale Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sale Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => handleInputChange('salePrice', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Sale Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Start Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.saleStartDate}
                  onChange={(e) => handleInputChange('saleStartDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                />
              </div>

              {/* Sale End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale End Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.saleEndDate}
                  onChange={(e) => handleInputChange('saleEndDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black transition-colors"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="PKR">PKR - Pakistani Rupee</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Pricing & Inventory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Pricing & Inventory</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 transition-colors ${
                      errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 transition-colors ${
                      errors.cost ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.cost && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
                )}
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => handleInputChange('discount', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 transition-colors ${
                      errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.stock && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <Camera className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Product Images</h2>
            </div>
            
            <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 transition-colors ${
              uploadingImages ? 'opacity-50 bg-gray-50' : 'hover:border-gray-400'
            }`}>
              <div className="text-center">
                {uploadingImages ? (
                  <>
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-600 mb-2">Uploading images...</p>
                    <p className="text-sm text-gray-500">Please wait while we process your images</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-600 mb-2">Upload product images</p>
                    <p className="text-sm text-gray-500 mb-6">Drag and drop images here or click to browse</p>
                  </>
                )}
                
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImages}
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    uploadingImages 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg cursor-pointer transform hover:scale-105'
                  }`}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {uploadingImages ? 'Uploading...' : 'Choose Images'}
                </label>
              </div>
              
              {/* Display uploaded images */}
              {formData.images && formData.images.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Uploaded Images</h3>
                    <span className="text-sm text-gray-500">{formData.images.length} image(s)</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {formData.images.map((imageUrl, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                      >
                        <NextImage
                          src={imageUrl}
                          alt={`Upload ${index + 1}`}
                          width={96}
                          height={96}
                          className="w-full h-24 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end space-x-4"
          >
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding Product...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Add Product</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Custom Size Popup */}
        {showSizePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSizePopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Ruler className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Add Custom Size</h3>
                </div>
                <button
                  onClick={() => setShowSizePopup(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size Name
                  </label>
                  <input
                    type="text"
                    value={formData.customSize}
                    onChange={(e) => handleInputChange('customSize', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all duration-200"
                    placeholder="e.g., XXL, 2XL, Extra Small"
                    autoFocus
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowSizePopup(false)}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (formData.customSize.trim()) {
                        handleInputChange('size', formData.customSize.trim())
                        handleInputChange('customSize', '')
                        setShowSizePopup(false)
                      }
                    }}
                    disabled={!formData.customSize.trim()}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Add Size
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Custom Color Popup */}
        {showColorPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowColorPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Palette className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Choose Color</h3>
                </div>
                <button
                  onClick={() => setShowColorPopup(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Predefined Colors */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Predefined Colors</h4>
                  <div className="grid grid-cols-6 gap-3">
                    {predefinedColors.map((color, index) => (
                      <motion.button
                        key={color.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          handleInputChange('color', color.name)
                          setShowColorPopup(false)
                        }}
                        className="group relative p-3 rounded-xl hover:scale-105 transition-all duration-200 hover:shadow-lg"
                        style={{ backgroundColor: color.hex }}
                      >
                        <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm group-hover:border-gray-300 transition-colors" />
                        <div className="absolute inset-0 rounded-xl bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
                        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {color.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Input */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Color</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.customColor}
                      onChange={(e) => handleInputChange('customColor', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 transition-all duration-200"
                      placeholder="Enter color name (e.g., Midnight Blue, Forest Green)"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowColorPopup(false)}
                        className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (formData.customColor.trim()) {
                            handleInputChange('color', formData.customColor.trim())
                            handleInputChange('customColor', '')
                            setShowColorPopup(false)
                          }
                        }}
                        disabled={!formData.customColor.trim()}
                        className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        Add Color
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default AddProductPage

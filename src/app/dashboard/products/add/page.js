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
  Camera
} from 'lucide-react'

const AddProductPage = () => {
  const router = useRouter()
  const { userData, user, loading } = useAuth()
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
    images: []
  })

  const [errors, setErrors] = useState({})

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
    
    if (!validateForm()) {
      if (window.addNotification) {
        window.addNotification('Please fix the errors before submitting', 'error')
      }
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
          createdById: userData?.uid
        })
      })

      const result = await response.json()
      
      if (result.success) {
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
              <Package className="w-6 h-6 text-blue-500 mr-3" />
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 transition-colors ${
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

          {/* Pricing & Inventory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-6">
              <DollarSign className="w-6 h-6 text-green-500 mr-3" />
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
              <Camera className="w-6 h-6 text-purple-500 mr-3" />
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
      </div>
    </DashboardLayout>
  )
}

export default AddProductPage

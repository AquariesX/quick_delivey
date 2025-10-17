'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMultipleImages } from '@/lib/imageUpload'
import NextImage from 'next/image'
import AdminProductAnalytics from './AdminProductAnalytics'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  DollarSign,
  ShoppingCart,
  Grid,
  List,
  MoreVertical,
  Star,
  TrendingUp,
  Upload,
  Image,
  X,
  Table,
  BarChart3
} from 'lucide-react'

const AdminProductManagement = () => {
  const { userData } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingImages, setUploadingImages] = useState(false)
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterApproval, setFilterApproval] = useState('all')
  const [viewMode, setViewMode] = useState('table') // grid, list, or table
  const [showAnalytics, setShowAnalytics] = useState(true) // Toggle between analytics and products
  
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

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?type=products')
      const result = await response.json()
      
      if (result.success) {
        setProducts(result.data || [])
      } else {
        console.error('Failed to fetch products:', result.error)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products?type=categories')
      const result = await response.json()
      
      if (result.success) {
        setCategories(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Fetch subcategories for dropdown
  const fetchSubcategories = async () => {
    try {
      const response = await fetch('/api/products?type=subcategories')
      const result = await response.json()
      
      if (result.success) {
        setSubcategories(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchSubcategories()
  }, [])

  const handleAddProduct = async () => {
    // Validation
    if (!formData.proName.trim()) {
      if (window.addNotification) {
        window.addNotification('Product name is required', 'error')
      }
      return
    }
    if (!formData.catId) {
      if (window.addNotification) {
        window.addNotification('Category is required', 'error')
      }
      return
    }
    if (!formData.subCatId) {
      if (window.addNotification) {
        window.addNotification('Subcategory is required', 'error')
      }
      return
    }
    if (!formData.sku.trim()) {
      if (window.addNotification) {
        window.addNotification('SKU is required', 'error')
      }
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      if (window.addNotification) {
        window.addNotification('Valid price is required', 'error')
      }
      return
    }
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      if (window.addNotification) {
        window.addNotification('Valid cost is required', 'error')
      }
      return
    }

    try {
      // First create the product to get the ID
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'product',
          proName: formData.proName.trim(),
          description: formData.description.trim(),
          catId: formData.catId,
          subCatId: parseInt(formData.subCatId),
          price: parseFloat(formData.price),
          cost: parseFloat(formData.cost),
          discount: parseFloat(formData.discount || 0),
          sku: formData.sku.trim(),
          barcode: formData.barcode.trim() || null,
          qnty: parseInt(formData.qnty) || 0,
          stock: parseInt(formData.stock) || 0,
          vendorId: userData?.uid, // Use current admin's ID as vendor
          status: formData.status,
          createdById: userData?.uid, // Use current admin's ID as creator
          proImages: formData.images // Include image URLs
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setFormData({
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
        fetchProducts() // Refresh the list
        if (window.addNotification) {
          window.addNotification('Product added successfully!', 'success')
        }
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
    }
  }

  const handleEditProduct = async () => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'product',
          id: selectedProduct.proId,
          proName: formData.proName,
          description: formData.description,
          catId: formData.catId,
          subCatId: parseInt(formData.subCatId),
          price: parseFloat(formData.price),
          cost: parseFloat(formData.cost),
          discount: parseFloat(formData.discount || 0),
          sku: formData.sku,
          barcode: formData.barcode,
          qnty: parseInt(formData.qnty),
          stock: parseInt(formData.stock),
          status: formData.status
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setShowEditModal(false)
        setSelectedProduct(null)
        setFormData({
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
          vendorId: '',
          status: true
        })
        fetchProducts() // Refresh the list
        if (window.addNotification) {
          window.addNotification('Product updated successfully!', 'success')
        }
      } else {
        console.error('Failed to update product:', result.error)
        if (window.addNotification) {
          window.addNotification('Failed to update product. Please try again.', 'error')
        }
      }
    } catch (error) {
      console.error('Error updating product:', error)
      if (window.addNotification) {
        window.addNotification('Error updating product. Please try again.', 'error')
      }
    }
  }

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products?type=product&id=${id}`, {
          method: 'DELETE'
        })

        const result = await response.json()
        
        if (result.success) {
          fetchProducts() // Refresh the list
          if (window.addNotification) {
            window.addNotification('Product deleted successfully!', 'success')
          }
        } else {
          console.error('Failed to delete product:', result.error)
          if (window.addNotification) {
            window.addNotification('Failed to delete product. Please try again.', 'error')
          }
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        if (window.addNotification) {
          window.addNotification('Error deleting product. Please try again.', 'error')
        }
      }
    }
  }

  const handleApproveProduct = async (productId, approvalStatus) => {
    try {
      // Validate user data for approval
      if (approvalStatus === 'Approved' && !userData?.uid) {
        if (window.addNotification) {
          window.addNotification('Unable to approve product: User not authenticated', 'error')
        }
        return
      }

      const requestBody = {
        type: 'approve-product',
        id: productId,
        approvalStatus: approvalStatus
      }

      // Only include approveById for approved products
      if (approvalStatus === 'Approved') {
        requestBody.approveById = userData?.uid
      }

      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()
      
      if (result.success) {
        fetchProducts() // Refresh the list
        if (window.addNotification) {
          window.addNotification(`Product ${approvalStatus.toLowerCase()} successfully!`, 'success')
        }
      } else {
        console.error('Failed to update approval status:', result.error)
        if (window.addNotification) {
          window.addNotification(`Failed to ${approvalStatus.toLowerCase()} product: ${result.error}`, 'error')
        }
      }
    } catch (error) {
      console.error('Error updating approval status:', error)
      if (window.addNotification) {
        window.addNotification(`Error ${approvalStatus.toLowerCase()}ing product. Please try again.`, 'error')
      }
    }
  }

  const handleEditClick = (product) => {
    setSelectedProduct(product)
    setFormData({
      proName: product.proName,
      description: product.description || '',
      catId: product.catId,
      subCatId: product.subCatId.toString(),
      price: product.price.toString(),
      cost: product.cost.toString(),
      discount: product.discount.toString(),
      sku: product.sku,
      barcode: product.barcode || '',
      qnty: product.qnty.toString(),
      stock: product.stock.toString(),
      status: product.status,
      images: product.proImages || []
    })
    setShowEditModal(true)
  }

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return

    console.log('Starting image upload with files:', files.length, 'files')
    setUploadingImages(true)
    
    try {
      // Upload to temp folder
      const result = await uploadMultipleImages(files, 'product_images')
      
      console.log('Upload result:', result)
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), ...result.urls]
        }))
        if (window.addNotification) {
          window.addNotification(`Successfully uploaded ${result.urls.length} image(s)`, 'success')
        }
        
        // Show any errors for failed uploads
        if (result.errors && result.errors.length > 0) {
          console.warn('Some uploads failed:', result.errors)
          if (window.addNotification) {
            window.addNotification(`Warning: ${result.errors.length} image(s) failed to upload`, 'warning')
          }
        }
      } else {
        console.error('Upload failed:', result.error)
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

  const handleViewClick = (product) => {
    setSelectedProduct(product)
    setShowViewModal(true)
  }

  const getCreatorType = (product) => {
    // If the creator's role is ADMIN, it was created by admin
    // Otherwise, it was created by vendor
    return product.creator?.role === 'ADMIN' ? 'Admin' : 'Vendor'
  }

  const getCreatorTypeColor = (product) => {
    return product.creator?.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.proName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && product.status) ||
                         (filterStatus === 'inactive' && !product.status)
    const matchesCategory = filterCategory === 'all' || product.catId === filterCategory
    const matchesApproval = filterApproval === 'all' || product.approvalStatus === filterApproval
    return matchesSearch && matchesStatus && matchesCategory && matchesApproval
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-600">Loading products...</span>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4" />
      case 'Pending': return <Clock className="w-4 h-4" />
      case 'Rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage all products in the system</p>
        </div>
        
        <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAnalytics 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard/products/add')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </motion.button>
        </div>
      </div>

      {/* Analytics Overview */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <AdminProductAnalytics />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          {/* Approval Filter */}
          <div>
            <select
              value={filterApproval}
              onChange={(e) => setFilterApproval(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="all">All Approval</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-end mt-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      <div className="bg-white rounded-xl shadow-sm border">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div>
            {/* Table Header with Count */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Products ({filteredProducts.length} of {products.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Showing {filteredProducts.length} products
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.proId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {product.proImages && Array.isArray(product.proImages) && product.proImages.length > 0 ? (
                          <NextImage 
                            src={product.proImages[0]} 
                            alt={product.proName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${product.proImages && Array.isArray(product.proImages) && product.proImages.length > 0 ? 'hidden' : 'flex'}`}>
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.proName}</div>
                        <div className="text-sm text-gray-500">{product.category?.name} - {product.subCategory?.subCatName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(product.approvalStatus)}`}>
                        {getStatusIcon(product.approvalStatus)}
                        {product.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCreatorTypeColor(product)}`}>
                        {getCreatorType(product)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewClick(product)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.proId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {product.approvalStatus === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApproveProduct(product.proId, 'Approved')}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproveProduct(product.proId, 'Rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        ) : (
          /* Grid/List View */
          <div className={`p-6 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.proId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-50 rounded-xl border hover:shadow-md transition-all duration-300 ${
                  viewMode === 'list' ? 'flex items-center justify-between p-4' : 'p-6'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {product.proImages && Array.isArray(product.proImages) && product.proImages.length > 0 ? (
                        <NextImage 
                          src={product.proImages[0]} 
                          alt={product.proName}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${product.proImages && Array.isArray(product.proImages) && product.proImages.length > 0 ? 'hidden' : 'flex'}`}>
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{product.proName}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(product.approvalStatus)}`}>
                          {getStatusIcon(product.approvalStatus)}
                          {product.approvalStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">SKU:</span>
                          <span className="ml-1 font-medium">{product.sku}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <span className="ml-1 font-medium">{product.stock}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Created by:</span>
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getCreatorTypeColor(product)}`}>
                            {getCreatorType(product)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Vendor:</span>
                          <span className="ml-1 font-medium">{product.vendor?.username || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => handleViewClick(product)}
                          className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit className="w-4 h-4 inline mr-1" />
                          Edit
                        </button>
                      </div>

                      {/* Approval Actions */}
                      {product.approvalStatus === 'Pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveProduct(product.proId, 'Approved')}
                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveProduct(product.proId, 'Rejected')}
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            <XCircle className="w-4 h-4 inline mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* List View */
                  <>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.proName}</h3>
                        <p className="text-gray-600 text-sm">{product.sku} • {product.category?.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">${product.price}</div>
                        <div className="text-sm text-gray-500">Stock: {product.stock}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(product.approvalStatus)}`}>
                        {getStatusIcon(product.approvalStatus)}
                        {product.approvalStatus}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewClick(product)}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.proId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* View Product Modal */}
      <AnimatePresence>
        {showViewModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Product Images */}
                <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Images</h4>
                    {selectedProduct.proImages && selectedProduct.proImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedProduct.proImages.map((image, index) => (
                          <NextImage
                            key={index}
                            src={image}
                            alt={`Product ${index + 1}`}
                            width={200}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg shadow-sm"
                          />
                        ))}
                </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <NextImage className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Information */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedProduct.proName}</h4>
                      <p className="text-sm text-gray-600">SKU: {selectedProduct.sku}</p>
                      {selectedProduct.barcode && (
                        <p className="text-sm text-gray-600">Barcode: {selectedProduct.barcode}</p>
                      )}
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                      <p className="text-sm text-gray-600">
                        {selectedProduct.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Category</h5>
                        <p className="text-sm text-gray-600">{selectedProduct.category?.name}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Subcategory</h5>
                        <p className="text-sm text-gray-600">{selectedProduct.subCategory?.subCatName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Price</h5>
                        <p className="text-lg font-bold text-green-600">${selectedProduct.price}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Cost</h5>
                        <p className="text-sm text-gray-600">${selectedProduct.cost}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Stock</h5>
                        <p className="text-sm text-gray-600">{selectedProduct.stock} units</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Quantity</h5>
                        <p className="text-sm text-gray-600">{selectedProduct.qnty} units</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Status</h5>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedProduct.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedProduct.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Approval</h5>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProduct.approvalStatus)}`}>
                          {selectedProduct.approvalStatus}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Created By</h5>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCreatorTypeColor(selectedProduct)}`}>
                        {getCreatorType(selectedProduct)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {showEditModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Edit Product</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={formData.proName}
                      onChange={(e) => setFormData({...formData, proName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Enter product name"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Enter SKU"
                    />
                </div>

                  {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={formData.catId}
                      onChange={(e) => {
                        setFormData({...formData, catId: e.target.value, subCatId: ''})
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
                    <select
                      value={formData.subCatId}
                      onChange={(e) => setFormData({...formData, subCatId: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
                </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="0"
                    />
                  </div>

                  {/* Barcode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Enter barcode"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Enter product description"
                  />
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                  <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 ${uploadingImages ? 'opacity-50' : ''}`}>
                    <div className="text-center">
                      {uploadingImages ? (
                        <>
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-4">Uploading images...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-4">Upload product images</p>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                        id="image-upload-edit"
                        disabled={uploadingImages}
                      />
                      <label
                        htmlFor="image-upload-edit"
                        className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                          uploadingImages 
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                        }`}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingImages ? 'Uploading...' : 'Choose Images'}
                      </label>
                    </div>
                    
                    {/* Display uploaded images */}
                    {formData.images && formData.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Uploaded Images:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {formData.images.map((imageUrl, index) => (
                            <div key={index} className="relative">
                              <NextImage
                                src={imageUrl}
                                alt={`Upload ${index + 1}`}
                                width={80}
                                height={80}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditProduct}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminProductManagement
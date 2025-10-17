'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMultipleImages } from '@/lib/imageUpload'
import NextImage from 'next/image'
import { 
  Package, 
  Plus, 
  Edit, 
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
  Table,
  Upload,
  Image,
  X,
  Trash2,
  AlertCircle,
  Eye as ViewIcon
} from 'lucide-react'

const VendorProductManagement = () => {
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


  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products?type=categories')
      const result = await response.json()
      
      if (result.success) {
        setCategories(result.data || [])
      } else {
        console.error('Failed to fetch categories:', result.error)
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  // Fetch subcategories from database
  const fetchSubcategories = async () => {
    try {
      const response = await fetch('/api/products?type=subcategories')
      const result = await response.json()
      
      if (result.success) {
        setSubcategories(result.data || [])
      } else {
        console.error('Failed to fetch subcategories:', result.error)
        setSubcategories([])
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      setSubcategories([])
    }
  }

  // Fetch products from database
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products?type=products&vendorId=${userData?.uid}`)
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
  }, [userData?.uid])

  useEffect(() => {
    if (userData?.uid) {
      fetchCategories()
      fetchSubcategories()
      fetchProducts()
    }
  }, [userData?.uid, fetchProducts])


  const handleEditProduct = async () => {
    if (!selectedProduct) return

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
          discount: parseFloat(formData.discount) || 0,
          sku: formData.sku,
          barcode: formData.barcode || formData.sku,
          qnty: parseInt(formData.qnty) || parseInt(formData.stock),
          stock: parseInt(formData.stock),
          status: formData.status,
          proImages: formData.images
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setShowEditModal(false)
        setSelectedProduct(null)
        fetchProducts()
        alert('Product updated successfully!')
      } else {
        console.error('Failed to update product:', result.error)
        alert(`Failed to update product: ${result.error}`)
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Error updating product. Please try again.')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'product',
          id: productId
        })
      })

      const result = await response.json()
      
      if (result.success) {
        fetchProducts()
        alert('Product deleted successfully!')
      } else {
        console.error('Failed to delete product:', result.error)
        alert(`Failed to delete product: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product. Please try again.')
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

  const handleViewClick = (product) => {
    setSelectedProduct(product)
    setShowViewModal(true)
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

  const getApprovalIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getApprovalColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-gray-600">Loading products...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
          <p className="text-gray-600 mt-1">Manage your product listings and track approval status</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/dashboard/products/add')}
          className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">
                {products.filter(p => p.approvalStatus === 'Approved').length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {products.filter(p => p.approvalStatus === 'Pending').length}
              </p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-purple-600">
                ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </motion.div>

      {/* Filters and View Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            <select
              value={filterApproval}
              onChange={(e) => setFilterApproval(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            >
              <option value="all">All Approval</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
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
      </motion.div>

      {/* Products Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
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
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category?.name}</div>
                      <div className="text-sm text-gray-500">{product.subCategory?.subCatName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${product.price}</div>
                      <div className="text-sm text-gray-500">Cost: ${product.cost}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock}</div>
                      <div className="text-sm text-gray-500">Qty: {product.qnty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalColor(product.approvalStatus)}`}>
                        {product.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewClick(product)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Details"
                        >
                          <ViewIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.proId)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 ${
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
                        <p className="text-sm text-gray-600">{product.category?.name} - {product.subCategory?.subCatName}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">${product.price}</p>
                          <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalColor(product.approvalStatus)}`}>
                            {product.approvalStatus}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {product.status ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewClick(product)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          >
                            <ViewIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(product)}
                            className="text-indigo-600 hover:text-indigo-800 p-1 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.proId)}
                            className="text-red-600 hover:text-red-800 p-1 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* List View */
                  <>
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {product.proImages && Array.isArray(product.proImages) && product.proImages.length > 0 ? (
                          <NextImage 
                            src={product.proImages[0]} 
                            alt={product.proName}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{product.proName}</h3>
                        <p className="text-sm text-gray-600">{product.category?.name} - {product.subCategory?.subCatName}</p>
                        <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${product.price}</p>
                        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalColor(product.approvalStatus)}`}>
                            {product.approvalStatus}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.status ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewClick(product)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      >
                        <ViewIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(product)}
                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.proId)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
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
      </motion.div>

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
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getApprovalColor(selectedProduct.approvalStatus)}`}>
                          {selectedProduct.approvalStatus}
                        </span>
                      </div>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
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
                          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
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
                            : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
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
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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

export default VendorProductManagement

import { storage } from './firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

export const uploadProductImage = async (file, productId) => {
  try {
    // Create a unique filename
    const timestamp = Date.now()
    const fileName = `products/${productId}/${timestamp}_${file.name}`
    
    // Create storage reference
    const storageRef = ref(storage, fileName)
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file)
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return {
      success: true,
      url: downloadURL,
      fileName: fileName
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const uploadMultipleImages = async (files, folderName = 'temp_uploads') => {
  try {
    console.log('uploadMultipleImages called with:', files.length, 'files, folder:', folderName)
    console.log('Storage instance:', storage)
    
    // Validate storage instance
    if (!storage) {
      throw new Error('Firebase Storage is not initialized')
    }
    
    // Validate files
    if (!files || files.length === 0) {
      throw new Error('No files provided')
    }
    
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        console.log('Processing file:', file.name, 'size:', file.size, 'type:', file.type)
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`Invalid file type: ${file.type}. Only images are allowed.`)
        }
        
        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          throw new Error(`File too large: ${file.name}. Maximum size is 10MB.`)
        }
        
        // Create a unique filename
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 15)
        const fileName = `${folderName}/${timestamp}_${randomId}_${file.name}`
        
        console.log('Created filename:', fileName)
        
        // Create storage reference
        const storageRef = ref(storage, fileName)
        console.log('Storage ref created:', storageRef)
        
        // Upload file
        console.log('Starting upload...')
        const snapshot = await uploadBytes(storageRef, file)
        console.log('Upload completed, getting download URL...')
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref)
        console.log('Download URL obtained:', downloadURL)
        
        return {
          success: true,
          url: downloadURL,
          fileName: fileName
        }
      } catch (error) {
        console.error('Error uploading individual image:', error)
        return {
          success: false,
          error: error.message
        }
      }
    })
    
    const results = await Promise.all(uploadPromises)
    console.log('All upload results:', results)
    
    const successfulUploads = results.filter(result => result.success)
    const failedUploads = results.filter(result => !result.success)
    
    console.log('Successful uploads:', successfulUploads.length)
    console.log('Failed uploads:', failedUploads.length)
    
    const finalResult = {
      success: successfulUploads.length > 0,
      urls: successfulUploads.map(result => result.url),
      errors: failedUploads.map(result => result.error)
    }
    
    console.log('Final result:', finalResult)
    return finalResult
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export const deleteProductImage = async (fileName) => {
  try {
    const storageRef = ref(storage, fileName)
    await deleteObject(storageRef)
    return { success: true }
  } catch (error) {
    console.error('Error deleting image:', error)
    return { success: false, error: error.message }
  }
}

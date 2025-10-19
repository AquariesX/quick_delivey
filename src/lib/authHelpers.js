// Client-side authentication helpers
// This file only contains functions that can run in the browser

// Check if user is verified and has proper data
export function checkUserVerification(user, userData) {
  if (!user) {
    return { isVerified: false, reason: 'No user' }
  }
  
  // Check database verification first (more reliable)
  if (userData && userData.emailVerification) {
    return { isVerified: true, reason: 'Database verified' }
  }
  
  // Fallback to Firebase verification
  if (user.emailVerified) {
    return { isVerified: true, reason: 'Firebase verified' }
  }
  
  // If we have userData but not verified, show pending
  if (userData && !userData.emailVerification) {
    return { isVerified: false, reason: 'Database verification pending' }
  }
  
  // If no userData yet, show loading
  if (!userData) {
    return { isVerified: false, reason: 'Loading user data' }
  }
  
  return { isVerified: false, reason: 'Email not verified' }
}

// Get user role for client-side use
export function getUserRole(userData) {
  return userData?.role || 'CUSTOMER'
}

// Check if user has specific role
export function hasRole(userData, requiredRole) {
  return userData?.role === requiredRole
}

// Check user access for specific roles
export function checkUserAccess(user, userData, allowedRoles) {
  if (!user) {
    return { hasAccess: false, redirectTo: '/login', reason: 'No user' }
  }
  
  // Check verification status using the same logic as checkUserVerification
  const verification = checkUserVerification(user, userData)
  
  if (!verification.isVerified) {
    if (verification.reason === 'Database verification pending') {
      return { hasAccess: false, redirectTo: '/verify', reason: 'Database verification pending' }
    } else if (verification.reason === 'Loading user data') {
      return { hasAccess: false, redirectTo: '/login', reason: 'Loading user data' }
    } else {
      return { hasAccess: false, redirectTo: '/login', reason: 'Email not verified' }
    }
  }
  
  if (!userData) {
    return { hasAccess: false, redirectTo: '/login', reason: 'No user data' }
  }
  
  if (!allowedRoles.includes(userData.role)) {
    return { hasAccess: false, redirectTo: '/dashboard', reason: 'Insufficient permissions' }
  }
  
  return { hasAccess: true, reason: 'Access granted' }
}

// Check if user is admin
export function isAdmin(userData) {
  return hasRole(userData, 'ADMIN')
}

// Check if user is vendor
export function isVendor(userData) {
  return hasRole(userData, 'VENDOR')
}

// Check if user is customer
export function isCustomer(userData) {
  return hasRole(userData, 'CUSTOMER')
}

// Check if user is driver
export function isDriver(userData) {
  return hasRole(userData, 'DRIVER')
}

// Unified verification helper function
export const checkUserVerification = (user, userData) => {
  if (!user || !userData) {
    return { isVerified: false, reason: 'missing_user_data' }
  }

  const userRole = userData.role || 'CUSTOMER'
  
  // For vendors, check database verification status
  if (userRole === 'VENDOR') {
    return {
      isVerified: userData.emailVerification === true,
      reason: userData.emailVerification ? 'verified' : 'vendor_not_verified'
    }
  }
  
  // For other users, check Firebase email verification
  return {
    isVerified: user.emailVerified === true,
    reason: user.emailVerified ? 'verified' : 'firebase_not_verified'
  }
}

// Unified access control helper
export const checkUserAccess = (user, userData, requiredRoles = []) => {
  const verification = checkUserVerification(user, userData)
  
  if (!verification.isVerified) {
    return {
      hasAccess: false,
      reason: verification.reason,
      redirectTo: '/login'
    }
  }

  const userRole = userData?.role || 'CUSTOMER'
  
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    return {
      hasAccess: false,
      reason: 'insufficient_permissions',
      redirectTo: '/dashboard'
    }
  }

  return {
    hasAccess: true,
    reason: 'verified',
    redirectTo: null
  }
}

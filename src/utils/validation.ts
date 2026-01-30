// Validation utility functions

export interface ValidationError {
  field: string
  message: string
}

// Email validation
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email) {
    return { valid: false, message: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format. Must be in format: user@example.com' }
  }

  return { valid: true }
}

// Password validation
export const validatePassword = (password: string): { valid: boolean; message?: string; strength?: 'weak' | 'medium' | 'strong' } => {
  if (!password) {
    return { valid: false, message: 'Password is required' }
  }

  if (password.length < 8) {
    return { 
      valid: false, 
      message: 'Password must be at least 8 characters',
      strength: 'weak'
    }
  }

  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return {
      valid: false,
      message: 'Password must contain: uppercase, lowercase, numbers, and special characters',
      strength: 'weak'
    }
  }

  let strength: 'weak' | 'medium' | 'strong' = 'medium'
  const strengthIndicators = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
  if (strengthIndicators >= 4 && password.length >= 12) {
    strength = 'strong'
  }

  return { valid: true, strength }
}

// First Name validation
export const validateFirstName = (firstName: string): { valid: boolean; message?: string } => {
  if (!firstName || firstName.trim() === '') {
    return { valid: false, message: 'First name is required' }
  }

  if (firstName.trim().length < 2) {
    return { valid: false, message: 'First name must be at least 2 characters' }
  }

  if (firstName.length > 50) {
    return { valid: false, message: 'First name is too long' }
  }

  return { valid: true }
}

// Last Name validation
export const validateLastName = (lastName: string): { valid: boolean; message?: string } => {
  if (!lastName || lastName.trim() === '') {
    return { valid: false, message: 'Last name is required' }
  }

  if (lastName.trim().length < 2) {
    return { valid: false, message: 'Last name must be at least 2 characters' }
  }

  if (lastName.length > 50) {
    return { valid: false, message: 'Last name is too long' }
  }

  return { valid: true }
}

// LinkedIn URL validation
export const validateLinkedInUrl = (url: string): { valid: boolean; message?: string } => {
  if (!url) {
    return { valid: true } // Optional
  }

  try {
    const urlObj = new URL(url)
    if (!urlObj.hostname.includes('linkedin.com')) {
      return { valid: false, message: 'URL must be from LinkedIn' }
    }
    if (!urlObj.pathname.includes('/in/')) {
      return { valid: false, message: 'Invalid LinkedIn URL format' }
    }
    return { valid: true }
  } catch {
    return { valid: false, message: 'Invalid URL. Make sure it starts with https://' }
  }
}

// CV file validation
export const validateCVFile = (files: File[]): { valid: boolean; message?: string } => {
  if (!files || files.length === 0) {
    return { valid: false, message: 'At least one CV file must be uploaded' }
  }

  const allowedExtensions = ['pdf', 'doc', 'docx']
  const maxFileSize = 5 * 1024 * 1024 // 5MB

  for (const file of files) {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return { valid: false, message: 'Allowed file formats: PDF, DOC, DOCX' }
    }

    if (file.size > maxFileSize) {
      return { valid: false, message: 'File size must be less than 5MB' }
    }
  }

  return { valid: true }
}

// Bio validation
export const validateBio = (bio: string): { valid: boolean; message?: string } => {
  if (!bio || bio.trim() === '') {
    return { valid: false, message: 'Bio is required' }
  }

  if (bio.trim().length < 20) {
    return { valid: false, message: 'Bio must be at least 20 characters' }
  }

  if (bio.length > 1000) {
    return { valid: false, message: 'Bio is too long (max 1000 characters)' }
  }

  return { valid: true }
}

// Signup form validation
export const validateSignupForm = (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): { valid: boolean; errors: ValidationError[] } => {
  const errors: ValidationError[] = []

  const firstNameValidation = validateFirstName(firstName)
  if (!firstNameValidation.valid) {
    errors.push({ field: 'firstName', message: firstNameValidation.message || 'Invalid first name' })
  }

  const lastNameValidation = validateLastName(lastName)
  if (!lastNameValidation.valid) {
    errors.push({ field: 'lastName', message: lastNameValidation.message || 'Invalid last name' })
  }

  const emailValidation = validateEmail(email)
  if (!emailValidation.valid) {
    errors.push({ field: 'email', message: emailValidation.message || 'Invalid email' })
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    errors.push({ field: 'password', message: passwordValidation.message || 'Invalid password' })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Mentor form validation for step 4 (submission)
export const validateMentorProfileForm = (
  expertise: string[],
  industry: string,
  experience: string,
  availability: string,
  mentees: string,
  bio: string,
  linkedinUrl: string,
  cvFiles: File[]
): { valid: boolean; errors: ValidationError[] } => {
  const errors: ValidationError[] = []

  if (!expertise || expertise.length === 0) {
    errors.push({ field: 'expertise', message: 'At least one expertise must be selected' })
  }

  if (!industry) {
    errors.push({ field: 'industry', message: 'Industry must be selected' })
  }

  if (!experience) {
    errors.push({ field: 'experience', message: 'Years of experience must be selected' })
  }

  if (!availability) {
    errors.push({ field: 'availability', message: 'Availability must be selected' })
  }

  if (!mentees || mentees === '0') {
    errors.push({ field: 'mentees', message: 'Number of mentees must be selected' })
  }

  const bioValidation = validateBio(bio)
  if (!bioValidation.valid) {
    errors.push({ field: 'bio', message: bioValidation.message || 'Invalid bio' })
  }

  const linkedinValidation = validateLinkedInUrl(linkedinUrl)
  if (!linkedinValidation.valid) {
    errors.push({ field: 'linkedinUrl', message: linkedinValidation.message || 'Invalid LinkedIn URL' })
  }

  const cvValidation = validateCVFile(cvFiles)
  if (!cvValidation.valid) {
    errors.push({ field: 'cvFiles', message: cvValidation.message || 'Invalid CV file' })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

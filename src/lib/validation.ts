/**
 * Comprehensive Validation Utilities for Shutter and Stripes Form Handlers
 */

// RFC 5322 compliant simplified email regex
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Standard international telephone check (allows leading +, digits, spaces, parentheses, hyphens)
export const PHONE_CHAR_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

// International name check (Unicode letter support for international & multilingual names)
export const NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF'’\.\-\s]{2,100}$/;

/**
 * Validate a person or entity name field
 */
export function validateName(name: string, fieldName = 'Your name'): string | null {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return `${fieldName} is required.`;
  }
  if (trimmed.length < 2) {
    return `${fieldName} must be at least 2 characters.`;
  }
  if (trimmed.length > 100) {
    return `${fieldName} cannot exceed 100 characters.`;
  }
  if (!NAME_REGEX.test(trimmed)) {
    return `${fieldName} contains invalid characters. Please use letters only.`;
  }
  return null;
}

/**
 * Validate an email address
 */
export function validateEmail(email: string): string | null {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  if (trimmed.length > 200) {
    return 'Email address is too long.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address (e.g. name@example.com).';
  }
  return null;
}

/**
 * Validate an international or domestic phone/WhatsApp number
 */
export function validatePhone(phone: string): string | null {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return 'Phone / WhatsApp number is required.';
  }
  if (/[a-zA-Z]/.test(trimmed)) {
    return 'Phone number cannot contain letters.';
  }
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7) {
    return 'Please enter a valid phone number (minimum 7 digits).';
  }
  if (digits.length > 15) {
    return 'Phone number cannot exceed 15 digits.';
  }
  if (!PHONE_CHAR_REGEX.test(trimmed)) {
    return 'Please enter a valid phone number format.';
  }
  return null;
}

/**
 * Validate Number of Safaris
 */
export function validateSafaris(val: number | string): string | null {
  const num = typeof val === 'number' ? val : parseInt(String(val), 10);
  if (isNaN(num) || num < 1) {
    return 'Please enter at least 1 safari drive.';
  }
  if (num > 15) {
    return 'For bookings of more than 15 Safaris, please mention your requirements in the Special Requirements / Safari Notes (Optional) section. Our team will assist you with your booking.';
  }
  return null;
}

/**
 * Validate Number of Guests
 */
export function validateGuests(val: number | string): string | null {
  const num = typeof val === 'number' ? val : parseInt(String(val), 10);
  if (isNaN(num) || num < 1) {
    return 'Please specify at least 1 guest.';
  }
  if (num > 15) {
    return 'For bookings of more than 15 guests, please mention your group size and requirements in the Special Requirements / Safari Notes (Optional) section. Our team will assist you with your booking.';
  }
  return null;
}

/**
 * Validate booking / travel dates
 */
export function validateTravelDate(dateStr: string, fieldLabel = 'Travel date'): string | null {
  if (!dateStr || !dateStr.trim()) {
    return `Please select a ${fieldLabel.toLowerCase()}.`;
  }
  const selected = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  if (isNaN(selected.getTime())) {
    return 'Please select a valid date.';
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selected < today) {
    return `${fieldLabel} cannot be in the past.`;
  }
  return null;
}

/**
 * Validate required text or textarea message
 */
export function validateRequired(val: string, fieldName = 'This field', minLength = 3): string | null {
  const trimmed = (val || '').trim();
  if (!trimmed) {
    return `${fieldName} is required.`;
  }
  if (trimmed.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters.`;
  }
  return null;
}

/**
 * Helper to build input border and ring styles depending on validation error
 */
export function getFieldStatusClass(hasError: boolean, isSuccess = false): string {
  if (hasError) {
    return 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-400/20';
  }
  if (isSuccess) {
    return 'border-emerald-600/40 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20';
  }
  return 'border-forest/20 focus:border-gold focus:ring-2 focus:ring-gold/20';
}


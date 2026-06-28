/**
 * Input Validator - Validates and detects input types
 * Determines if input is URL, EMAIL, or MESSAGE
 */

// URL validation regex - checks for domain structure
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate if string is a valid URL
 * @param {string} input - Input string to validate
 * @returns {boolean} - True if valid URL
 */
export function isValidURL(input) {
  if (!input || typeof input !== 'string') return false;
  
  // Remove leading/trailing whitespace
  const trimmed = input.trim();
  
  // Check against URL pattern
  return URL_REGEX.test(trimmed);
}

/**
 * Validate if string is a valid email
 * @param {string} input - Input string to validate
 * @returns {boolean} - True if valid email
 */
export function isValidEmail(input) {
  if (!input || typeof input !== 'string') return false;
  
  const trimmed = input.trim();
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Check if input is a message (any non-empty string)
 * @param {string} input - Input string to validate
 * @returns {boolean} - True if valid message
 */
export function isMessage(input) {
  if (!input || typeof input !== 'string') return false;
  return input.trim().length > 0;
}

/**
 * Validate input and detect type
 * @param {string} input - Input string to validate
 * @param {string} expectedType - Optional expected type ('URL', 'EMAIL', 'MESSAGE')
 * @returns {Object} - { isValid: boolean, type: string, error?: string }
 */
export function validateInput(input, expectedType = null) {
  // Check if input is provided
  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return {
      isValid: false,
      type: 'UNKNOWN',
      error: 'Input cannot be empty.'
    };
  }

  const trimmed = input.trim();

  // Detect input type
  let detectedType = 'UNKNOWN';
  
  if (isValidURL(trimmed)) {
    detectedType = 'URL';
  } else if (isValidEmail(trimmed)) {
    detectedType = 'EMAIL';
  } else if (isMessage(trimmed)) {
    detectedType = 'MESSAGE';
  }

  // If expected type is specified, validate against it
  if (expectedType) {
    if (detectedType !== expectedType) {
      return {
        isValid: false,
        type: detectedType,
        error: `Invalid input format. Expected ${expectedType}, but detected ${detectedType}.`
      };
    }
  }

  // If no type detected and no expected type, it's invalid
  if (detectedType === 'UNKNOWN') {
    return {
      isValid: false,
      type: 'UNKNOWN',
      error: 'Invalid input. This does not appear to be a valid email, URL, or supported message. Please enter valid content.'
    };
  }

  return {
    isValid: true,
    type: detectedType
  };
}

export default {
  validateInput,
  isValidURL,
  isValidEmail,
  isMessage
};

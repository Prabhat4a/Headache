// EMAIL VALIDATION
export const validateEmail = (email) => {
  const value = email.trim();

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!value) {
    return { valid: false, message: "Please enter your email" };
  }

  if (!pattern.test(value)) {
    return { valid: false, message: "Please enter a valid email" };
  }

  return { valid: true };
};

// PHONE VALIDATION
export const validatePhone = (phone) => {
  const value = phone.replace(/\D/g, "");

  if (!value) {
    return { valid: false, message: "Please enter your phone number" };
  }

  if (!/^\d{10}$/.test(value)) {
    return { valid: false, message: "Phone number must be 10 digits" };
  }

  return { valid: true };
};

// USERNAME VALIDATION
export const validateUsername = (username) => {
  const value = username.trim();

  if (!value) {
    return { valid: false, message: "Please enter a username" };
  }

  if (!/^[a-zA-Z]/.test(value)) {
    return { valid: false, message: "Username must start with a letter" };
  }

  if (/\s/.test(value)) {
    return { valid: false, message: "Username cannot contain spaces" };
  }

  if (value.length > 9) {
    return { valid: false, message: "Username max 9 characters" };
  }

  return { valid: true };
};

// PASSWORD VALIDATION
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: "Please enter your password" };
  }

  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }

  return { valid: true };
};

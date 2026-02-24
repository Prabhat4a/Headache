export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone) => {
  return /^\d{10}$/.test(phone);
};

export const validateUsername = (username) => {
  if (!username) return { valid: false, message: "Please enter a username" };
  if (!/^[a-zA-Z]/.test(username))
    return { valid: false, message: "Username must start with a letter" };
  if (/\s/.test(username))
    return { valid: false, message: "Username cannot contain spaces" };
  if (username.length > 9)
    return { valid: false, message: "Username max 9 characters" };
  return { valid: true };
};

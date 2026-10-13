/**
 * Helper to decode base64url encoded JWT payload
 * @param {string} token 
 * @returns {object|null} Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Checks if a JWT token has expired
 * @param {string} token 
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Common formatting utility for user profiles and settings views
 * @param {string} username 
 * @param {string} role 
 * @returns {object} Formatted user metadata properties
 */
export const formatUserMetadata = (username, role) => {
  const isEmail = username && username.includes("@");
  const emailValue = isEmail ? username : "Not Provided";
  const displayUsername = isEmail ? username.split("@")[0] : username || "AI Researcher";
  const displayRole = role === "admin" ? "Administrator" : "Research User";

  return {
    isEmail,
    emailValue,
    displayUsername,
    displayRole,
  };
};

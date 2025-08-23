import jwt from "jsonwebtoken";

/**
 * Extracts a Bearer token from the Authorization header.
 * Returns null if the header is missing or malformed.
 */
function extractTokenFromRequest(req) {
  const header = req.headers?.authorization || req.headers?.Authorization;
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

/**
 * Signs a JWT access token with the provided payload.
 * Respects JWT_SECRET and optional JWT_EXPIRES_IN from env.
 */
export function signAccessToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }

  const defaultOptions = { expiresIn: process.env.JWT_EXPIRES_IN || "7d" };
  return jwt.sign(payload, secret, { ...defaultOptions, ...options });
}

/**
 * Middleware that enforces a valid JWT Bearer token.
 * - On success: attaches decoded token to req.user and calls next().
 * - On failure: responds 401.
 */
export function authenticate(req, res, next) {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ success: false, message: "Missing Bearer token" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, message: "Server misconfiguration: JWT secret not set" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

/**
 * Middleware that attempts to authenticate if a token is present,
 * but does not error if missing/invalid. Useful for public routes
 * that behave differently when a user is logged in.
 */
export function authenticateOptional(req, res, next) {
  const token = extractTokenFromRequest(req);
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
  } catch (_) {
    // ignore decoding errors for optional auth
  }
  return next();
}

/**
 * Role-based authorization guard.
 * Usage: router.get('/admin', authenticate, requireRoles('admin'), handler)
 */
export function requireRoles(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (allowedRoles.length === 0) return next();

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return next();
  };
}

export default {
  authenticate,
  authenticateOptional,
  requireRoles,
  signAccessToken,
};



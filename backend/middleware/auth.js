import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Authentication required.' });

  try {
    req.user = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function requireActive(req, res, next) {
  if (req.user?.subscription_status !== 'ACTIVE')
    return res.status(403).json({ message: 'Active subscription required. Please upgrade your plan.' });
  next();
}

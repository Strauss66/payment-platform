export function requireRoles(...roles) {
    return (req, res, next) => {
      const userRoles = req.user?.roles || [];
      const ok = roles.some(r => userRoles.includes(r));
      if (!ok) return res.status(403).json({ message: 'Forbidden' });
      next();
    };
  }
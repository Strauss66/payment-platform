export function requireSameSchool(req, res, next) {
  // enforce school_id scope on write operations
  req.scope = { school_id: req.user.school_id };
  next();
}
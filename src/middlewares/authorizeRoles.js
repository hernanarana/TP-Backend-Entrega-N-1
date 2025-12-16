export const authorizeRoles = (...allowed) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ status: "error", error: "No autenticado" });
    }

    if (!allowed.includes(user.role)) {
      return res.status(403).json({ status: "error", error: "No autorizado" });
    }

    next();
  };
};

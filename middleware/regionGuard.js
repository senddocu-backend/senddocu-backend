moxdule.exports = function regionGuard(expectedRegion) {
  return (req, res, next) => {
    if (req.tenant.region !== expectedRegion) {
      return res.status(403).json({
        error: "REGION_ACCESS_DENIED"
      });
    }
    next();
  };
};

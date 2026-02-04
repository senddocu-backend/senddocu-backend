module.exports = function auditContext(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    req.audit = {
      start,
      statusCode: res.statusCode
    };
  });

  next();
};

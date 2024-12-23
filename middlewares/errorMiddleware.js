// backend/middlewares/errorMiddleware.js

module.exports = (err, req, res, next) => {
  console.error("Unexpected Error:", err);
  res.status(500).json({ msg: "Server Error" });
};

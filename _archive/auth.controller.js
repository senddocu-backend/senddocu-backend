const { signToken } = require("../utils/jwt");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // TEMP STATIC AUTH (we will replace with DB later)
    if (email !== "admin@senddocu.com" || password !== "test123") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      id: 1,
      email,
      role: "admin",
    });

    return res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

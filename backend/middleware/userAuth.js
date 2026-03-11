import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({ success: false, message: "Not authorized. Login again" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.json({ success: false, message: "Invalid token" });
    }

    req.userId = decoded.id;

    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
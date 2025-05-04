import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized. Login required." });
  }

  const token = authHeader.slice(7);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || !decoded?.email || !decoded?.password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    if (
      decoded.email !== process.env.ADMIN_EMAIL ||
      decoded.password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(403).json({
        success: false,
        message: "Not Authorized. Invalid admin credentials.",
      });
    }

    req.adminEmail = decoded.email;
    next();
  });
};

export default adminAuth;

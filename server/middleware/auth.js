import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized. Login required." });
  }

  const token = authHeader.slice(7);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || !decoded?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    req.userId = decoded.id;
    next();
  });
};

export default authUser;

import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

export async function isAuthenticated(req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwtToken) {
    token = req.cookies.jwtToken;
  }

  if (!token) {
    return res.status(400).json({ success: false, error: "unauthorized user" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const response = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!response) {
      return res
        .status(400)
        .json({ success: false, error: "user no longer exist in DB" });
    }

    req.user = response;
    next();
  } catch (error) {
    res.status(400).json({ success: false, error: "unauthorized user" });
  }
}

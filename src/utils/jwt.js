import jwt from "jsonwebtoken";

export function generateToken(user) {
  try {
    const payload = {
      id: user.id,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    throw new Error("JWT generation failed");
  }
}

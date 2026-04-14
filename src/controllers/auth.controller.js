import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // check if user exist or not
    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist) {
      return res.status(400).json({
        success: false,
        error: "Email or password already exist",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // insert user to db
    const response = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = await generateToken(response);

    // send response back
    if (response) {
      return res.status(200).cookie("jwtToken", token).json({
        success: true,
        message: "user register aptly",
      });
    }
  } catch (error) {
    return res.status(404).json(error);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!response) {
      return res.status(400).json({
        success: false,
        error: "username or password is wrong",
      });
    }

    const token = await generateToken(response);

    return res
      .status(200)
      .cookie("jwtToken", token)
      .json({
        success: true,
        user: {
          id: response.id,
          email: response.email,
        },
        message: "user logged in aptly",
        token,
      });
  } catch (error) {
    return res.status(404).json({ error });
  }
};

const logoutUser = async (req, res) => {
  res.cookie("jwtToken", "").json({
    message: "user logged out aptly",
  });
};

export { registerUser, loginUser, logoutUser };

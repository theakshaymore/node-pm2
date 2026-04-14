import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "get route api",
  });
});

router.post("/", (req, res) => {
  res.json({
    message: "post route api",
  });
});

export default router;

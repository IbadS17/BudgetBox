import { Router } from "express";
import { pool } from "./db";

const router = Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const exists = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (exists.rows.length > 0) {
      return res.json({ success: false, message: "Email already exists" });
    }

    await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
      email,
      password,
    ]);

    return res.json({ success: true, message: "Account created" });
  } catch (err) {
    res.json({ success: false, message: "Error creating account" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (user.rows.length === 0) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    return res.json({
      success: true,
      email,
      token: "dummy-token", // not required but nice to return
    });
  } catch (err) {
    res.json({ success: false, message: "Login error" });
  }
});

export default router;

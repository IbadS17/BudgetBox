import { Router } from "express";
import { pool } from "./db";

const router = Router();

router.post("/budget/sync", async (req, res) => {
  console.log("SYNC HIT");
  console.log("BODY RECEIVED:", req.body);

  try {
    const { email, budget } = req.body;

    const result = await pool.query(
      `INSERT INTO budgets (user_email, payload, updated_at)
       VALUES ($1, $2, NOW())
       RETURNING updated_at`,
      [email, budget]
    );

    res.json({
      success: true,
      timestamp: result.rows[0].updated_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sync failed" });
  }
});

router.get("/budget/latest", async (req, res) => {
  try {
    const email = req.query.email;

    const result = await pool.query(
      `SELECT payload, updated_at
       FROM budgets
       WHERE user_email = $1
       ORDER BY updated_at DESC
       LIMIT 1`,
      [email]
    );

    res.json({
      success: true,
      budget: result.rows[0]?.payload || null,
      timestamp: result.rows[0]?.updated_at || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

export default router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');

//--------------------------------------------
// GET /api/ranking/tetris → ranking top 10 Tetris
//--------------------------------------------
router.get('/tetris', async (req, res) => {
  try {
    const ranking = await User.find({}, { name: 1, avatar: 1, tetrisHighScore: 1 })
      .sort({ tetrisHighScore: -1 })
      .limit(10);

    res.json(ranking);
  } catch (err) {
    console.error("Erro no ranking Tetris:", err);
    res.status(500).json({ message: "Erro no ranking Tetris" });
  }
});

module.exports = router;

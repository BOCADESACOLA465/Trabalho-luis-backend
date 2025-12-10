const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const upload = require("../middleware/upload"); // ← ADICIONADO







//--------------------------------------------
// GET /api/me  → retorna dados do usuário logado
//--------------------------------------------
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    res.json({
      name: user.name,
      avatar: user.avatar,
      highScore: user.highScore
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

//--------------------------------------------
// PUT /api/me  → atualiza pontuação
//--------------------------------------------
router.put('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const newScore = req.body.score;
    if (newScore > (user.highScore || 0)) {
      user.highScore = newScore;
      await user.save();
    }

    res.json({ highScore: user.highScore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//--------------------------------------------
// PUT /api/usuarios/me  → atualizar nome e avatar
//--------------------------------------------
router.put("/usuarios/me", auth, upload.single("avatar"), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    // Atualizar nome
    if (req.body.name) user.name = req.body.name;

    // Atualizar avatar (imagem)
    if (req.file) {
  user.avatar = `http://localhost:5000/uploads/${req.file.filename}`;
}
    await user.save();

    res.json({ usuario: user });
  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    res.status(500).json({ message: "Erro ao atualizar perfil" });
  }
});
router.get("/ranking", async (req, res) => {
  try {
    const ranking = await User.find({}, { name: 1, avatar: 1, highScore: 1 })
      .sort({ highScore: -1 })
      .limit(10);

    res.json(ranking);
  } catch (err) {
    console.error("Erro no ranking:", err);
    res.status(500).json({ message: "Erro no ranking" });
  }
});

module.exports = router;

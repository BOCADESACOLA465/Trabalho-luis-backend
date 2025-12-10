//--------------------------------------------
// GET /api/ranking  → Top 10 jogadores
//--------------------------------------------
router.get("/ranking", async (req, res) => {
  try {
    const ranking = await User.find({}, { name: 1, avatar: 1, highScore: 1 })
      .sort({ highScore: -1 })
      .limit(10);

    res.json(ranking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar ranking" });
  }
});

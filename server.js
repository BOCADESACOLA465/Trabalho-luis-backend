require('dotenv').config();
const path = require("path");
const express = require('express');
const cors = require('cors');

// Importa a função de conexão com o MongoDB
const connectDB = require('./config/database'); 

// Importa rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user'); // rotas de usuário

const app = express();

// Conectar ao MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// 🔥 Torna a pasta uploads acessível como URL (IMPORTANTE)
app.use('/uploads', express.static('uploads'));

// Rotas
app.use('/api/auth', authRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API Dashboard RH funcionando!' });
});

// Rotas de usuário (onde está /api/me e /api/usuarios/me)
app.use('/api', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

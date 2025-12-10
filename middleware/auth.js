const jwt = require('jsonwebtoken');


// Importa corretamente o database, caso precise (se for usar aqui)
const connectDB = require('../config/database'); // caminho relativo correto

const auth = async (req, res, next) => {
  try {
    // 1. Pega o token do cabeçalho Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // 2. Se não tem token, lança erro
    if (!token) {
      throw new Error("Token não fornecido");
    }

    // 3. Verifica se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Adiciona o ID do usuário na requisição
    req.userId = decoded.userId;

    // 5. Passa para a próxima função (rota)
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Por favor, faça login para acessar este recurso!'
    });
  }
};

module.exports = auth;

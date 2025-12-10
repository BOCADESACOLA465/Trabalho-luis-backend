const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// =================== Cadastro ===================
router.post('/cadastro', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Este email já está cadastrado' });
    }

    const usuario = new User({ name, email, password });
    await usuario.save();

    const token = jwt.sign({ userId: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      token,
      usuario: { id: usuario._id, name: usuario.name, email: usuario.email }
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário', error: error.message });
  }
});

// =================== Login ===================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario || !(await usuario.compararSenha(password))) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const token = jwt.sign({ userId: usuario._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      usuario: { id: usuario._id, name: usuario.name, email: usuario.email }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro ao fazer login', error: error.message });
  }
});

// =================== Esqueci a Senha ===================
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ message: 'Email não encontrado' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    usuario.resetPasswordToken = token;
    usuario.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await usuario.save();

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const link = `${process.env.FRONT_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"Meu App" <${process.env.MAIL_USER}>`,
      to: usuario.email,
      subject: 'Redefinição de Senha',
      html: `<p>Clique no link abaixo para redefinir sua senha:</p><a href="${link}">${link}</a>`
    });

    res.json({ message: 'Email enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ message: 'Erro ao enviar email', error: error.message });
  }
});

// =================== Resetar Senha ===================
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body; // <-- aqui pegamos 'password', que é o campo do schema

  try {
    const usuario = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    // Atualiza a senha do usuário
    usuario.password = password;

    // Limpa o token de redefinição
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpires = undefined;

    // Salva no banco
    await usuario.save();

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro ao redefinir senha', error: error.message });
  }
});


// =================== Rotas Protegidas ===================

// Obter dados do usuário logado
router.get('/me', auth, async (req, res) => {
  try {
    const usuario = await User.findById(req.userId).select('-password');
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados do usuário' });
  }
});

// Listar todos os usuários
router.get('/usuarios', auth, async (req, res) => {
  try {
    const usuarios = await User.find().select('-password');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
});

// Atualizar usuário
router.put('/usuarios/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const usuario = await User.findById(id);
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });

    if (email && email !== usuario.email && (await User.findOne({ email }))) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }

    usuario.name = name || usuario.name;
    usuario.email = email || usuario.email;
    if (password) usuario.password = password;

    await usuario.save();
    res.json({ message: 'Usuário atualizado com sucesso!', usuario });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
});

// Excluir usuário
router.delete('/usuarios/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.userId === id) return res.status(400).json({ message: 'Não é possível excluir sua própria conta' });

    const usuario = await User.findByIdAndDelete(id);
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });

    res.json({ message: 'Usuário excluído com sucesso!', usuario });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir usuário', error: error.message });
  }
});

// Atualizar highScore do usuário
router.put('/score', auth, async (req, res) => {
  try {
    const { score } = req.body;
    const usuario = await User.findById(req.userId);
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });

    if (score > usuario.highScore) {
      usuario.highScore = score;
      await usuario.save();
    }

    res.json({ message: 'Pontuação salva com sucesso!', highScore: usuario.highScore });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar pontuação', error: error.message });
  }
});

module.exports = router;

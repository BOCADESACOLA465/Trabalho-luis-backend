const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },        // Nome do usuário
  avatar: { type: String, default: "" },         // URL da foto de perfil
  highScore: { type: Number, default: 0 },       // Recorde do jogo

  // 🔥 Campos para recuperação de senha
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }

}, { timestamps: true });


// 🔐 Criptografar senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔍 Comparação de senha para login
userSchema.methods.compararSenha = async function(senhaInformada) {
  return await bcrypt.compare(senhaInformada, this.password);
};

module.exports = mongoose.model('User', userSchema);

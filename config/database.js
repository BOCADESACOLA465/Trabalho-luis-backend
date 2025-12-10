const mongoose = require('mongoose');

const connectDB = async () => {

    try{
        // Tenta conectar no mongoDB usando a URL do .env
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✔ MongoDB conectado com sucesso!')
    } catch (error) {
        // Se der erro, mostra mensagem e encerra o programa
        console.error('❌ Error ao conectar no MongoDB:', error.message);
        process.exit(1); // Código 1 - erro
    }
};

module.exports = connectDB; // exporta para usar no server.js

//processo:
//1. importa Mongoose (biblioteca para MongoDB)
//2. Define função async connectDB
//3. Tenta conectar ao banco
//4. Se sucesso: Mostra ✔
//5. Se erro: Mostra ❌ e encerra
//6. Exporta a função
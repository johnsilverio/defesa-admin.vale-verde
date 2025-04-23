const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://johnsilverio:iAwAzO8OCmLX0b4X@cluster0.jqwjfgk.mongodb.net/defesa-admin?retryWrites=true&w=majority&appName=Cluster0'
).then(() => {
  console.log('✅ Conexão com MongoDB Atlas estabelecida com sucesso!');
  mongoose.disconnect();
}).catch(err => {
  console.error('❌ Erro ao conectar no MongoDB Atlas:', err);
});
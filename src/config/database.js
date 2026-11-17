const mongoose = require('mongoose');

async function connectDB() {
  await mongoose.connect(
    'mongodb://127.0.0.1:27017/gestaoEspacos'
  );

  console.log('MongoDB conectado!');
}

module.exports = connectDB;
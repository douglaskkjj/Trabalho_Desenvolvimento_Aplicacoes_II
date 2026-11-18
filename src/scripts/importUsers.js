
const connectDB = require('../config/database');
const User = require('../models/User');

const users = require('../data/user.json');

async function importUsers() {
    try {
        await connectDB();

        for (const user of users) {
            await User.findOneAndUpdate(
                { id: user.id },
                user,
                {
                    upsert: true,
                    returnDocument: 'after',
                    runValidators: true
                }
            );
        }

        console.log('Usuários importados com sucesso!');
    } catch (error) {
        console.error('Erro ao importar usuários:', error);
    } finally {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
    }
}

importUsers();

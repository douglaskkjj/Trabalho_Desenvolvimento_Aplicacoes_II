
const connectDB = require('../config/database');
const Space = require('../models/Space');
const spacesData = require('../data/spaces.json');
const mongoose = require('mongoose');

async function importSpaces() {
    try {
        await connectDB();

        for (const space of spacesData) {
            await Space.findOneAndUpdate(
                { id: space.id },
                space,
                {
                    upsert: true,
                    returnDocument: 'after',
                    runValidators: true
                }
            );
        }

        console.log('Espaços importados com sucesso!');
    } catch (error) {
        console.error('Erro ao importar espaços:', error);
    } finally {
        await mongoose.connection.close();
    }
}

importSpaces();

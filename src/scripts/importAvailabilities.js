
const connectDB = require('../config/database');
const Availability = require('../models/Availability');
const availabilitiesData = require('../data/disponibilidades.json');
const mongoose = require('mongoose');

async function importAvailabilities() {
    try {
        await connectDB();

        for (const availability of availabilitiesData) {
            await Availability.findOneAndUpdate(
                { id: availability.id },
                availability,
                {
                    upsert: true,
                    returnDocument: 'after',
                    runValidators: true
                }
            );
        }

        console.log('Disponibilidades importadas com sucesso!');
    } catch (error) {
        console.error('Erro ao importar disponibilidades:', error);
    } finally {
        await mongoose.connection.close();
    }
}

importAvailabilities();

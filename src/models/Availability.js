
const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    space_id: {
        type: Number,
        required: true
    },
    day_of_week: {
        type: Number,
        required: true,
        min: 0,
        max: 7,
        validate: {
            validator: Number.isInteger,
            message: 'O dia da semana deve ser um número inteiro'
        }
    },
    start_time: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):[0-5]\d$/
    },
    end_time: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):[0-5]\d$/
    },
    is_external_allowed: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Availability', availabilitySchema);

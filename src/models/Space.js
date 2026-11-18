
const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'A capacidade deve ser um número inteiro'
        }
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    is_active: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Space', spaceSchema);

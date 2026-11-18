
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },

    corporate_name: {
        type: String,
        required: true,
        trim: true
    },

    trade_name: {
        type: String,
        trim: true
    },

    cnpj: {
        type: String,
        trim: true
    },

    phone: {
        type: String,
        trim: true
    },

    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Company', companySchema);

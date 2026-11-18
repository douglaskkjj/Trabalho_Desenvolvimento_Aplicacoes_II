
const connectDB = require('../config/database');
const Company = require('../models/Company');

const companiesData = require('../data/company.json');

async function importCompanies() {
    try {
        await connectDB();

        const companies = Array.isArray(companiesData)
            ? companiesData
            : [companiesData];

        for (const company of companies) {
            await Company.findOneAndUpdate(
                { id: company.id },
                company,
                {
                    upsert: true,
                    returnDocument: 'after',
                    runValidators: true
                }
            );
        }

        console.log('Empresas importadas com sucesso!');
    } catch (error) {
        console.error('Erro ao importar empresas:', error);
    } finally {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
    }
}

importCompanies();


require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
const authRoutes = require('./src/routes/auth');
const spacesRoutes = require('./src/routes/spacesRoutes');
const bookingsRoutes = require('./src/routes/bookings');
const userRoutes = require('./src/routes/user');
const companyRoutes = require('./src/routes/company');
const disponibilidadesRoutes = require('./src/routes/disponibilidadesRoutes');

// Registrar rotas
app.use('/auth', authRoutes);
app.use('/spaces', spacesRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/users', userRoutes);
app.use('/company', companyRoutes);
app.use('/', disponibilidadesRoutes);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

async function iniciarServidor() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar a aplicação:', error);
    process.exit(1);
  }
}

iniciarServidor();

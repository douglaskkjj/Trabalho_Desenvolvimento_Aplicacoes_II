const express = require("express");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = 3000;

app.use(express.json());

// Rotas
const spacesRoutes = require("./src/routes/spacesRoutes");
const bookingsRoutes = require("./src/routes/bookings");
const userRoutes = require("./src/routes/user");
const companyRoutes = require("./src/routes/company");

app.use("/spaces", spacesRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/users", userRoutes);
app.use("/company", companyRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
const express = require("express");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();
const PORT = 3000;

app.use(express.json());

const spacesRoutes = require("./src/routes/spacesRoutes");

app.use("/spaces", spacesRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
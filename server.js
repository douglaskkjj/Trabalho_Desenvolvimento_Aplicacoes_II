const express = require("express");

const app = express();

app.use(express.json());

const bookingsRoutes = require("./src/routes/bookings");

app.use("/bookings", bookingsRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando na porta https://localhost:3000");
});
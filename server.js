const express = require("express");

const app = express();

app.use(express.json());

const bookingsRoutes = require("./src/routes/bookings");
const userRoutes = require("./src/routes/user");
const companyRoutes = require("./src/routes/company");

app.use("/company", companyRoutes);
app.use("/users", userRoutes);
app.use("/bookings", bookingsRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando na porta http://localhost:3000");
});
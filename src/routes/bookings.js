const express = require("express");
const fs = require("fs");
const path = require("path");
 
const router = express.Router();

const filePath = path.join(__dirname, "../data/bookings.json");

router.get("/", (req, res) => {
    const reservas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    res.json(reservas);
});

//buscar por data
router.get("/buscar", (req, res) => {
    const reservas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );
    const data = req.query.data;
    const resultado = reservas.filter((reserva) =>
        reserva.start_datetime.startsWith(data)
    );

    res.json(resultado);
});


//busca por ID
router.get("/:id", (req, res) => {
    const reservas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const id = Number(req.params.id);

    const reserva = reservas.find(
        (reserva) => reserva.id === id
    );

    if (!reserva) {
        return res.status(404).json({
            mensagem: "Reserva não encontrada"
        });
    }

    res.json(reserva);
});


// nova reserva
router.post("/", (req, res) => {
    const reservas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const novaReserva = {
        id: reservas.length > 0
            ? reservas[reservas.length - 1].id + 1
            : 1,

        space_id: req.body.space_id,
        user_id: req.body.user_id,
        start_datetime: req.body.start_datetime,
        end_datetime: req.body.end_datetime,
        status: "PENDING",
        rejection_reason: null,
        created_at: new Date().toISOString()
    };

    reservas.push(novaReserva);

    fs.writeFileSync(
        filePath,
        JSON.stringify(reservas, null, 2)
    );

    res.status(201).json(novaReserva);
});


// atualiza reserva
router.put("/:id", (req, res) => {
    const reservas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const id = Number(req.params.id);

    const indice = reservas.findIndex(
        (reserva) => reserva.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Reserva não encontrada"
        });
    }

    reservas[indice] = {
        ...reservas[indice],
        ...req.body,
        id: id
    };

    fs.writeFileSync(
        filePath,
        JSON.stringify(reservas, null, 2)
    );

    res.json(reservas[indice]);
});

// deletar reserva
router.delete("/:id", (req, res) => {
    const reservas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const id = Number(req.params.id);

    const indice = reservas.findIndex(
        (reserva) => reserva.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Reserva não encontrada"
        });
    }

    const reservaRemovida = reservas.splice(indice, 1);

    fs.writeFileSync(
        filePath,
        JSON.stringify(reservas, null, 2)
    );

    res.json({
        mensagem: "Reserva removida com sucesso",
        reserva: reservaRemovida[0]
    });
});




module.exports = router;
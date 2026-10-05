const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const filePath = path.join(__dirname, "../data/bookings.json");

const statusPermitidos = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "CANCELLED"
];

function lerReservas() {
    return JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );
}

function salvarReservas(reservas) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(reservas, null, 2)
    );
}


/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Listar todas as reservas
 *     tags:
 *       - Reservas
 *     responses:
 *       200:
 *         description: Lista de todas as reservas
 */
router.get("/", (req, res) => {

    const reservas = lerReservas();

    res.json(reservas);
});


/**
 * @swagger
 * /bookings/buscar:
 *   get:
 *     summary: Buscar reservas por data
 *     tags:
 *       - Reservas
 *     parameters:
 *       - in: query
 *         name: data
 *         required: true
 *         description: Data da reserva no formato AAAA-MM-DD
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-10-05"
 *     responses:
 *       200:
 *         description: Reservas encontradas
 *       400:
 *         description: Data não informada
 */
router.get("/buscar", (req, res) => {

    const data = req.query.data;

    if (!data) {
        return res.status(400).json({
            mensagem: "Informe a data para realizar a busca"
        });
    }

    const reservas = lerReservas();

    const resultado = reservas.filter((reserva) =>
        reserva.start_datetime.startsWith(data)
    );

    res.json(resultado);
});


/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Buscar reserva por ID
 *     tags:
 *       - Reservas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da reserva
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *       404:
 *         description: Reserva não encontrada
 */
router.get("/:id", (req, res) => {

    const reservas = lerReservas();

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


/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Criar uma nova reserva
 *     tags:
 *       - Reservas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - space_id
 *               - user_id
 *               - start_datetime
 *               - end_datetime
 *             properties:
 *               space_id:
 *                 type: integer
 *                 example: 2
 *               user_id:
 *                 type: integer
 *                 example: 5
 *               start_datetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-05T14:00:00"
 *               end_datetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-05T16:00:00"
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso
 */
router.post("/", (req, res) => {

    const reservas = lerReservas();

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

    salvarReservas(reservas);

    res.status(201).json(novaReserva);
});


/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Atualizar uma reserva
 *     tags:
 *       - Reservas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da reserva
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               space_id:
 *                 type: integer
 *                 example: 2
 *               user_id:
 *                 type: integer
 *                 example: 5
 *               start_datetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-05T15:00:00"
 *               end_datetime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-05T17:00:00"
 *               status:
 *                 type: string
 *                 enum:
 *                   - PENDING
 *                   - APPROVED
 *                   - REJECTED
 *                   - CANCELLED
 *                 example: APPROVED
 *               rejection_reason:
 *                 type: string
 *                 nullable: true
 *                 example: "Espaço indisponível"
 *     responses:
 *       200:
 *         description: Reserva atualizada com sucesso
 *       400:
 *         description: Status inválido
 *       404:
 *         description: Reserva não encontrada
 */
router.put("/:id", (req, res) => {

    const reservas = lerReservas();

    const id = Number(req.params.id);

    const indice = reservas.findIndex(
        (reserva) => reserva.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Reserva não encontrada"
        });
    }

    if (
        req.body.status !== undefined &&
        !statusPermitidos.includes(req.body.status)
    ) {
        return res.status(400).json({
            mensagem: "Status inválido"
        });
    }

    reservas[indice] = {
        ...reservas[indice],
        ...req.body,
        id: id
    };

    salvarReservas(reservas);

    res.json(reservas[indice]);
});


/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Excluir uma reserva
 *     tags:
 *       - Reservas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da reserva
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Reserva removida com sucesso
 *       404:
 *         description: Reserva não encontrada
 */
router.delete("/:id", (req, res) => {

    const reservas = lerReservas();

    const id = Number(req.params.id);

    const indice = reservas.findIndex(
        (reserva) => reserva.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Reserva não encontrada"
        });
    }

    const reservaRemovida = reservas.splice(indice, 1)[0];

    salvarReservas(reservas);

    res.json({
        mensagem: "Reserva removida com sucesso",
        reserva: reservaRemovida
    });
});


module.exports = router;
const express = require('express');
const router = express.Router();

const Booking = require('../models/Booking');


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
router.get('/', async (req, res) => {
  try {
    const reservas = await Booking.find();

    res.json(reservas);
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao listar reservas'
    });
  }
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
router.get('/buscar', async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({
        mensagem: 'Informe a data para realizar a busca'
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return res.status(400).json({
        mensagem: 'Informe uma data válida no formato AAAA-MM-DD'
      });
    }

    const inicio = new Date(`${data}T00:00:00.000Z`);

    if (
      Number.isNaN(inicio.getTime()) ||
      inicio.toISOString().slice(0, 10) !== data
    ) {
      return res.status(400).json({
        mensagem: 'Informe uma data válida'
      });
    }

    const fim = new Date(inicio);
    fim.setUTCDate(fim.getUTCDate() + 1);

    const resultado = await Booking.find({
      start_datetime: {
        $gte: inicio,
        $lt: fim
      }
    });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao buscar reservas'
    });
  }
});

/**
 * @swagger
 * /bookings/buscar-status:
 *   get:
 *     summary: Buscar reservas por status
 *     tags:
 *       - Reservas
 *     parameters:
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         example: PENDING
 *     responses:
 *       200:
 *         description: Lista de reservas encontradas
 *       400:
 *         description: Status não informado
 */


// busca por status
router.get('/buscar-status', async (req, res) => {
  try {
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({
        mensagem: 'Informe o status para realizar a busca'
      });
    }

    const statusPermitidos = [
      'PENDING',
      'APPROVED',
      'REJECTED',
      'CANCELLED'
    ];

    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({
        mensagem: 'Status inválido'
      });
    }

    const resultado = await Booking.find({ status });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao buscar reservas'
    });
  }
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
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: 'ID inválido'
      });
    }

    const reserva = await Booking.findOne({ id });

    if (!reserva) {
      return res.status(404).json({
        mensagem: 'Reserva não encontrada'
      });
    }

    res.json(reserva);
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao buscar reserva'
    });
  }
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
router.post('/', async (req, res) => {
  try {
    const {
      space_id,
      user_id,
      start_datetime,
      end_datetime
    } = req.body;

    if (
      space_id === undefined ||
      user_id === undefined ||
      !start_datetime ||
      !end_datetime
    ) {
      return res.status(400).json({
        mensagem: 'Informe espaço, usuário, início e término'
      });
    }

    const inicio = new Date(start_datetime);
    const fim = new Date(end_datetime);

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fim.getTime()) ||
      fim <= inicio
    ) {
      return res.status(400).json({
        mensagem: 'Informe datas válidas e um término posterior ao início'
      });
    }

    const ultimaReserva = await Booking.findOne()
      .sort({ id: -1 });

    const proximoId = ultimaReserva
      ? ultimaReserva.id + 1
      : 1;

    const novaReserva = await Booking.create({
      id: proximoId,
      space_id,
      user_id,
      start_datetime: inicio,
      end_datetime: fim,
      status: 'PENDING',
      rejection_reason: null
    });

    res.status(201).json(novaReserva);
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao criar reserva'
    });
  }
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
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: 'ID inválido'
      });
    }

    const camposPermitidos = [
      'space_id',
      'user_id',
      'start_datetime',
      'end_datetime',
      'status',
      'rejection_reason'
    ];

    const atualizacao = {};

    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        atualizacao[campo] = req.body[campo];
      }
    }

    if (
      atualizacao.status !== undefined &&
      ![
        'PENDING',
        'APPROVED',
        'REJECTED',
        'CANCELLED'
      ].includes(atualizacao.status)
    ) {
      return res.status(400).json({
        mensagem: 'Status inválido'
      });
    }

    if (
      atualizacao.start_datetime !== undefined
    ) {
      atualizacao.start_datetime =
        new Date(atualizacao.start_datetime);
    }

    if (
      atualizacao.end_datetime !== undefined
    ) {
      atualizacao.end_datetime =
        new Date(atualizacao.end_datetime);
    }

    const reservaAtual = await Booking.findOne({ id });

    if (!reservaAtual) {
      return res.status(404).json({
        mensagem: 'Reserva não encontrada'
      });
    }

    const inicio = atualizacao.start_datetime ??
      reservaAtual.start_datetime;

    const fim = atualizacao.end_datetime ??
      reservaAtual.end_datetime;

    if (
      Number.isNaN(new Date(inicio).getTime()) ||
      Number.isNaN(new Date(fim).getTime()) ||
      new Date(fim) <= new Date(inicio)
    ) {
      return res.status(400).json({
        mensagem: 'Datas inválidas para a reserva'
      });
    }

    const reservaAtualizada = await Booking.findOneAndUpdate(
      { id },
      { $set: atualizacao },
      {
        new: true,
        runValidators: true
      }
    );

    res.json(reservaAtualizada);
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao atualizar reserva'
    });
  }
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
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: 'ID inválido'
      });
    }

    const reservaRemovida = await Booking.findOneAndDelete({
      id
    });

    if (!reservaRemovida) {
      return res.status(404).json({
        mensagem: 'Reserva não encontrada'
      });
    }

    res.json({
      mensagem: 'Reserva removida com sucesso',
      reserva: reservaRemovida
    });
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao excluir reserva'
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

const Booking = require('../models/Booking');
const Space = require('../models/Space');
const User = require('../models/User');

const STATUS_PERMITIDOS = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED'
];

// Valida ID numérico positivo
function validarId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

// Verifica se o período da reserva conflita com outra reserva aprovada
async function verificarConflito(space_id, inicio, fim, idIgnorado = null) {
  const filtro = {
    space_id,
    status: 'APPROVED',
    start_datetime: { $lt: fim },
    end_datetime: { $gt: inicio }
  };

  // No PUT, ignora a própria reserva
  if (idIgnorado !== null) {
    filtro.id = { $ne: idIgnorado };
  }

  return await Booking.findOne(filtro);
}

// Verifica se espaço e usuário existem e se o espaço está ativo
async function validarReferencias(space_id, user_id, res) {
  if (!Number.isInteger(space_id) || space_id <= 0) {
    res.status(400).json({ mensagem: 'ID do espaço inválido' });
    return false;
  }

  if (!Number.isInteger(user_id) || user_id <= 0) {
    res.status(400).json({ mensagem: 'ID do usuário inválido' });
    return false;
  }

  const espaco = await Space.findOne({ id: space_id });

  if (!espaco) {
    res.status(404).json({ mensagem: 'Espaço não encontrado' });
    return false;
  }

  if (!espaco.is_active) {
    res.status(400).json({ mensagem: 'Este espaço está inativo' });
    return false;
  }

  const usuario = await User.findOne({ id: user_id });

  if (!usuario) {
    res.status(404).json({ mensagem: 'Usuário não encontrado' });
    return false;
  }

  return true;
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
router.get('/', async (req, res) => {
  try {
    const reservas = await Booking.find();
    return res.json(reservas);
  } catch (error) {
    console.error('Erro ao listar reservas:', error);
    return res.status(500).json({
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
 *         description: Data inválida ou não informada
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

    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar reservas por data:', error);
    return res.status(500).json({
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
 *         description: Status inválido ou não informado
 */
router.get('/buscar-status', async (req, res) => {
  try {
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({
        mensagem: 'Informe o status para realizar a busca'
      });
    }

    if (!STATUS_PERMITIDOS.includes(status)) {
      return res.status(400).json({
        mensagem: 'Status inválido'
      });
    }

    const resultado = await Booking.find({ status });

    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar reservas por status:', error);
    return res.status(500).json({
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
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Reserva não encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!validarId(id)) {
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

    return res.json(reserva);
  } catch (error) {
    console.error('Erro ao buscar reserva:', error);
    return res.status(500).json({
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
 *       400:
 *         description: Dados inválidos ou horário ocupado
 *       404:
 *         description: Espaço ou usuário não encontrado
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

    const referenciasValidas = await validarReferencias(
      space_id,
      user_id,
      res
    );

    if (!referenciasValidas) {
      return;
    }

    // Somente reservas APPROVED bloqueiam horários
    const conflito = await verificarConflito(
      space_id,
      inicio,
      fim
    );

    if (conflito) {
      return res.status(409).json({
        mensagem: 'Este espaço já possui uma reserva aprovada nesse horário',
        reserva_conflitante: conflito.id
      });
    }

    const ultimaReserva = await Booking.findOne().sort({ id: -1 });

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

    return res.status(201).json(novaReserva);
  } catch (error) {
    console.error('Erro ao criar reserva:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        mensagem: 'Já existe uma reserva com esse ID'
      });
    }

    return res.status(500).json({
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
 *         description: Dados inválidos
 *       404:
 *         description: Reserva não encontrada
 *       409:
 *         description: Horário já reservado
 */
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!validarId(id)) {
      return res.status(400).json({
        mensagem: 'ID inválido'
      });
    }

    const reservaAtual = await Booking.findOne({ id });

    if (!reservaAtual) {
      return res.status(404).json({
        mensagem: 'Reserva não encontrada'
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
      !STATUS_PERMITIDOS.includes(atualizacao.status)
    ) {
      return res.status(400).json({
        mensagem: 'Status inválido'
      });
    }

    const space_id = atualizacao.space_id ?? reservaAtual.space_id;
    const user_id = atualizacao.user_id ?? reservaAtual.user_id;

    const inicio = new Date(
      atualizacao.start_datetime ?? reservaAtual.start_datetime
    );

    const fim = new Date(
      atualizacao.end_datetime ?? reservaAtual.end_datetime
    );

    if (
      Number.isNaN(inicio.getTime()) ||
      Number.isNaN(fim.getTime()) ||
      fim <= inicio
    ) {
      return res.status(400).json({
        mensagem: 'Datas inválidas para a reserva'
      });
    }

    const referenciasValidas = await validarReferencias(
      space_id,
      user_id,
      res
    );

    if (!referenciasValidas) {
      return;
    }

    const novoStatus = atualizacao.status ?? reservaAtual.status;

    // PENDING e APPROVED precisam respeitar horários já aprovados.
    // REJECTED e CANCELLED não representam reservas ativas.
    if (
      novoStatus === 'PENDING' ||
      novoStatus === 'APPROVED'
    ) {
      const conflito = await verificarConflito(
        space_id,
        inicio,
        fim,
        id
      );

      if (conflito) {
        return res.status(409).json({
          mensagem: 'Este espaço já possui uma reserva aprovada nesse horário',
          reserva_conflitante: conflito.id
        });
      }
    }

    if (atualizacao.start_datetime !== undefined) {
      atualizacao.start_datetime = inicio;
    }

    if (atualizacao.end_datetime !== undefined) {
      atualizacao.end_datetime = fim;
    }

    const reservaAtualizada = await Booking.findOneAndUpdate(
      { id },
      { $set: atualizacao },
      {
        returnDocument: 'after',
        runValidators: true
      }
    );

    return res.json(reservaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);

    return res.status(500).json({
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
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Reserva não encontrada
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!validarId(id)) {
      return res.status(400).json({
        mensagem: 'ID inválido'
      });
    }

    const reservaRemovida = await Booking.findOneAndDelete({ id });

    if (!reservaRemovida) {
      return res.status(404).json({
        mensagem: 'Reserva não encontrada'
      });
    }

    return res.json({
      mensagem: 'Reserva removida com sucesso',
      reserva: reservaRemovida
    });
  } catch (error) {
    console.error('Erro ao excluir reserva:', error);

    return res.status(500).json({
      mensagem: 'Erro ao excluir reserva'
    });
  }
});

module.exports = router;

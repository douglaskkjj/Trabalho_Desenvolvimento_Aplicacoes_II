
const express = require('express');
const router = express.Router();

const Availability = require('../models/Availability');
const Space = require('../models/Space');

// Valida ID numérico positivo
function validarId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

// Valida os dados de uma disponibilidade
function validarDisponibilidade(dados) {
  const {
    space_id,
    day_of_week,
    start_time,
    end_time,
    is_external_allowed
  } = dados;

  if (
    space_id === undefined ||
    day_of_week === undefined ||
    !start_time ||
    !end_time ||
    is_external_allowed === undefined
  ) {
    return 'Todos os campos são obrigatórios';
  }

  if (!Number.isInteger(space_id) || space_id <= 0) {
    return 'O ID do espaço deve ser um número inteiro positivo';
  }

  if (
    !Number.isInteger(day_of_week) ||
    day_of_week < 0 ||
    day_of_week > 7
  ) {
    return 'O dia da semana deve ser um número inteiro entre 0 e 7';
  }

  const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (!formatoHora.test(start_time) || !formatoHora.test(end_time)) {
    return 'Os horários devem estar no formato HH:mm';
  }

  if (start_time >= end_time) {
    return 'O horário final deve ser posterior ao horário inicial';
  }

  if (typeof is_external_allowed !== 'boolean') {
    return 'is_external_allowed deve ser verdadeiro ou falso';
  }

  return null;
}

// Verifica se o espaço existe
async function validarEspaco(space_id, res) {
  const espaco = await Space.findOne({ id: space_id });

  if (!espaco) {
    res.status(404).json({
      mensagem: 'Espaço não encontrado'
    });

    return false;
  }

  return true;
}

// Verifica conflito entre disponibilidades do mesmo espaço e dia
async function verificarConflitoDisponibilidade(
  space_id,
  day_of_week,
  start_time,
  end_time,
  idIgnorado = null
) {
  const filtro = {
    space_id,
    day_of_week,
    start_time: { $lt: end_time },
    end_time: { $gt: start_time }
  };

  // No PUT, ignora a própria disponibilidade
  if (idIgnorado !== null) {
    filtro.id = { $ne: idIgnorado };
  }

  return await Availability.findOne(filtro);
}

/**
 * @swagger
 * /disponibilidades:
 *   get:
 *     summary: Listar todas as disponibilidades
 *     tags:
 *       - Disponibilidades
 *     responses:
 *       200:
 *         description: Lista de disponibilidades
 */
router.get('/disponibilidades', async (req, res) => {
  try {
    const disponibilidades = await Availability.find();

    return res.json(disponibilidades);
  } catch (error) {
    console.error('Erro ao listar disponibilidades:', error);

    return res.status(500).json({
      mensagem: 'Erro ao listar disponibilidades'
    });
  }
});

/**
 * @swagger
 * /disponibilidades:
 *   post:
 *     summary: Cadastrar uma nova disponibilidade
 *     tags:
 *       - Disponibilidades
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - space_id
 *               - day_of_week
 *               - start_time
 *               - end_time
 *               - is_external_allowed
 *             properties:
 *               space_id:
 *                 type: integer
 *                 example: 1
 *               day_of_week:
 *                 type: integer
 *                 example: 1
 *               start_time:
 *                 type: string
 *                 example: "08:00"
 *               end_time:
 *                 type: string
 *                 example: "18:00"
 *               is_external_allowed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Disponibilidade cadastrada com sucesso
 *       400:
 *         description: Dados inválidos ou horário conflitante
 *       404:
 *         description: Espaço não encontrado
 */
router.post('/disponibilidades', async (req, res) => {
  try {
    const erroValidacao = validarDisponibilidade(req.body);

    if (erroValidacao) {
      return res.status(400).json({
        mensagem: erroValidacao
      });
    }

    const {
      space_id,
      day_of_week,
      start_time,
      end_time,
      is_external_allowed
    } = req.body;

    const espacoValido = await validarEspaco(space_id, res);

    if (!espacoValido) {
      return;
    }

    const conflito = await verificarConflitoDisponibilidade(
      space_id,
      day_of_week,
      start_time,
      end_time
    );

    if (conflito) {
      return res.status(409).json({
        mensagem: 'Já existe uma disponibilidade cadastrada nesse horário',
        disponibilidade_conflitante: conflito.id
      });
    }

    const ultimaDisponibilidade = await Availability
      .findOne()
      .sort({ id: -1 });

    const proximoId = ultimaDisponibilidade
      ? ultimaDisponibilidade.id + 1
      : 1;

    const novaDisponibilidade = await Availability.create({
      id: proximoId,
      space_id,
      day_of_week,
      start_time,
      end_time,
      is_external_allowed
    });

    return res.status(201).json(novaDisponibilidade);
  } catch (error) {
    console.error('Erro ao cadastrar disponibilidade:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        mensagem: 'Já existe uma disponibilidade com esse ID'
      });
    }

    return res.status(500).json({
      mensagem: 'Erro ao cadastrar disponibilidade'
    });
  }
});

/**
 * @swagger
 * /disponibilidades/{id}:
 *   get:
 *     summary: Buscar disponibilidade por ID
 *     tags:
 *       - Disponibilidades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disponibilidade
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Disponibilidade encontrada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Disponibilidade não encontrada
 */
router.get('/disponibilidades/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!validarId(id)) {
      return res.status(400).json({
        mensagem: 'ID inválido'
      });
    }

    const disponibilidade = await Availability.findOne({ id });

    if (!disponibilidade) {
      return res.status(404).json({
        mensagem: 'Disponibilidade não encontrada'
      });
    }

    return res.json(disponibilidade);
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);

    return res.status(500).json({
      mensagem: 'Erro ao buscar disponibilidade'
    });
  }
});

/**
 * @swagger
 * /disponibilidades/{id}:
 *   put:
 *     summary: Atualizar uma disponibilidade
 *     tags:
 *       - Disponibilidades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disponibilidade
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
 *                 example: 1
 *               day_of_week:
 *                 type: integer
 *                 example: 2
 *               start_time:
 *                 type: string
 *                 example: "09:00"
 *               end_time:
 *                 type: string
 *                 example: "17:00"
 *               is_external_allowed:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Disponibilidade atualizada com sucesso
 *       400:
 *         description: Dados inválidos ou horário conflitante
 *       404:
 *         description: Disponibilidade ou espaço não encontrado
 */
router.put('/disponibilidades/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!validarId(id)) {
      return res.status(400).json({
        mensagem: 'ID inválido'
      });
    }

    const disponibilidadeAtual = await Availability.findOne({ id });

    if (!disponibilidadeAtual) {
      return res.status(404).json({
        mensagem: 'Disponibilidade não encontrada'
      });
    }

    // Mantém os valores atuais quando um campo não for enviado
    const dadosAtualizados = {
      space_id: req.body.space_id ?? disponibilidadeAtual.space_id,
      day_of_week: req.body.day_of_week ?? disponibilidadeAtual.day_of_week,
      start_time: req.body.start_time ?? disponibilidadeAtual.start_time,
      end_time: req.body.end_time ?? disponibilidadeAtual.end_time,
      is_external_allowed:
        req.body.is_external_allowed ??
        disponibilidadeAtual.is_external_allowed
    };

    const erroValidacao = validarDisponibilidade(dadosAtualizados);

    if (erroValidacao) {
      return res.status(400).json({
        mensagem: erroValidacao
      });
    }

    const espacoValido = await validarEspaco(
      dadosAtualizados.space_id,
      res
    );

    if (!espacoValido) {
      return;
    }

    const conflito = await verificarConflitoDisponibilidade(
      dadosAtualizados.space_id,
      dadosAtualizados.day_of_week,
      dadosAtualizados.start_time,
      dadosAtualizados.end_time,
      id
    );

    if (conflito) {
      return res.status(409).json({
        mensagem: 'Já existe uma disponibilidade cadastrada nesse horário',
        disponibilidade_conflitante: conflito.id
      });
    }

    const disponibilidadeAtualizada = await Availability.findOneAndUpdate(
      { id },
      { $set: dadosAtualizados },
      {
        returnDocument: 'after',
        runValidators: true
      }
    );

    return res.json(disponibilidadeAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar disponibilidade:', error);

    return res.status(500).json({
      mensagem: 'Erro ao atualizar disponibilidade'
    });
  }
});

/**
 * @swagger
 * /disponibilidades/{id}:
 *   delete:
 *     summary: Excluir uma disponibilidade
 *     tags:
 *       - Disponibilidades
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disponibilidade
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Disponibilidade removida com sucesso
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Disponibilidade não encontrada
 */
router.delete('/disponibilidades/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!validarId(id)) {
      return res.status(400).json({
        mensagem: 'ID inválido'
      });
    }

    const disponibilidadeRemovida = await Availability.findOneAndDelete({
      id
    });

    if (!disponibilidadeRemovida) {
      return res.status(404).json({
        mensagem: 'Disponibilidade não encontrada'
      });
    }

    return res.json({
      mensagem: 'Disponibilidade removida com sucesso',
      disponibilidade: disponibilidadeRemovida
    });
  } catch (error) {
    console.error('Erro ao excluir disponibilidade:', error);

    return res.status(500).json({
      mensagem: 'Erro ao excluir disponibilidade'
    });
  }
});

module.exports = router;

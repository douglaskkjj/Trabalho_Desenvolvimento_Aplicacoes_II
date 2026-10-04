const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const filePath = path.join(__dirname, "../data/disponibilidades.json");

function lerDisponibilidades() {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function salvarDisponibilidades(dados) {
    fs.writeFileSync(filePath  , JSON.stringify(dados, null, 2));
}

/**
 * @swagger
 * /disponibilidades:
 *   get:
 *     summary: Lista todas as disponibilidades
 *     tags: [Disponibilidades]
 *     responses:
 *       200:
 *         description: Lista de disponibilidades
 */
router.get('/disponibilidades', (req, res) => {
    const disponibilidades = lerDisponibilidades();
    res.json(disponibilidades);
});

/**
 * @swagger
 * /disponibilidades:
 *   post:
 *     summary: Cadastra uma nova disponibilidade
 *     tags: [Disponibilidades]
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
 *               day_of_week:
 *                 type: integer
 *               start_time:
 *                 type: string
 *               end_time:
 *                 type: string
 *               is_external_allowed:
 *                 type: boolean
 *           example:
 *             space_id: 2
 *             day_of_week: 3
 *             start_time: "08:00"
 *             end_time: "17:00"
 *             is_external_allowed: true
 *     responses:
 *       201:
 *         description: Disponibilidade cadastrada
 */
router.post('/disponibilidades', (req, res) => {
    const disponibilidades = lerDisponibilidades();

    const novaDisponibilidade = {
        id: disponibilidades.length > 0
            ? Math.max(...disponibilidades.map(item => item.id)) + 1
            : 1,
        ...req.body
    };

    disponibilidades.push(novaDisponibilidade);
    salvarDisponibilidades(disponibilidades);

    res.status(201).json(novaDisponibilidade);
});

/**
 * @swagger
 * /disponibilidades/{id}:
 *   get:
 *     summary: Busca uma disponibilidade pelo ID
 *     tags: [Disponibilidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Disponibilidade encontrada
 *       404:
 *         description: Disponibilidade não encontrada
 */
router.get('/disponibilidades/:id', (req, res) => {
    const disponibilidades = lerDisponibilidades();
    const id = parseInt(req.params.id);

    const disponibilidade = disponibilidades.find(
        item => item.id === id
    );

    if (!disponibilidade) {
        return res.status(404).json({
            mensagem: 'Disponibilidade não encontrada'
        });
    }

    res.json(disponibilidade);
});

/**
 * @swagger
 * /disponibilidades/{id}:
 *   put:
 *     summary: Atualiza uma disponibilidade
 *     tags: [Disponibilidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               space_id:
 *                 type: integer
 *               day_of_week:
 *                 type: integer
 *               start_time:
 *                 type: string
 *               end_time:
 *                 type: string
 *               is_external_allowed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Disponibilidade atualizada
 *       404:
 *         description: Disponibilidade não encontrada
 */
router.put('/disponibilidades/:id', (req, res) => {
    const disponibilidades = lerDisponibilidades();
    const id = parseInt(req.params.id);

    const indice = disponibilidades.findIndex(
        item => item.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensagem: 'Disponibilidade não encontrada'
        });
    }

    disponibilidades[indice] = {
        ...disponibilidades[indice],
        ...req.body,
        id: id
    };

    salvarDisponibilidades(disponibilidades);

    res.json(disponibilidades[indice]);
});

/**
 * @swagger
 * /disponibilidades/{id}:
 *   delete:
 *     summary: Remove uma disponibilidade
 *     tags: [Disponibilidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Disponibilidade removida
 *       404:
 *         description: Disponibilidade não encontrada
 */
router.delete('/disponibilidades/:id', (req, res) => {
    const disponibilidades = lerDisponibilidades();
    const id = parseInt(req.params.id);

    const novaLista = disponibilidades.filter(
        item => item.id !== id
    );

    if (novaLista.length === disponibilidades.length) {
        return res.status(404).json({
            mensagem: 'Disponibilidade não encontrada'
        });
    }

    salvarDisponibilidades(novaLista);

    res.json({
        mensagem: 'Disponibilidade removida com sucesso'
    });
});

module.exports = router;
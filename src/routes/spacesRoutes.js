const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const filePath = path.join(__dirname, "../data/spaces.json");

// Ler os espaços
function readSpaces() {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}

// Salvar os espaços
function saveSpaces(spaces) {
    fs.writeFileSync(filePath, JSON.stringify(spaces, null, 2));
}

/**
 * @swagger
 * /spaces:
 *   get:
 *     summary: Listar todos os espaços
 *     description: Retorna todos os espaços cadastrados. É possível filtrar pelo nome.
 *     tags:
 *       - Espaços
 *     parameters:
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: Nome ou parte do nome do espaço
 *     responses:
 *       200:
 *         description: Lista de espaços retornada com sucesso
 */

// GET - listar todos os espaços
router.get("/", (req, res) => {
    const spaces = readSpaces();
    const { name } = req.query;

    if (name) {
        const result = spaces.filter(space =>
            space.name.toLowerCase().includes(name.toLowerCase())
        );

        return res.json(result);
    }

    res.json(spaces);
});

/**
 * @swagger
 * /spaces/{id}:
 *   get:
 *     summary: Buscar espaço por ID
 *     description: Retorna um espaço específico pelo seu ID.
 *     tags:
 *       - Espaços
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do espaço
 *     responses:
 *       200:
 *         description: Espaço encontrado com sucesso
 *       404:
 *         description: Espaço não encontrado
 */

// GET - buscar espaço por ID
router.get("/:id", (req, res) => {
    const spaces = readSpaces();
    const id = Number(req.params.id);

    const space = spaces.find(space => space.id === id);

    if (!space) {
        return res.status(404).json({
            message: "Espaço não encontrado"
        });
    }

    res.json(space);
});

/**
 * @swagger
 * /spaces:
 *   post:
 *     summary: Cadastrar novo espaço
 *     description: Cadastra um novo espaço.
 *     tags:
 *       - Espaços
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - capacity
 *               - description
 *               - is_active
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sala de Reuniões 02
 *               type:
 *                 type: string
 *                 example: MEETING_ROOM
 *               capacity:
 *                 type: integer
 *                 example: 15
 *               description:
 *                 type: string
 *                 example: Sala para reuniões
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Espaço cadastrado com sucesso
 *       400:
 *         description: Todos os campos são obrigatórios
 */

// POST - cadastrar novo espaço
router.post("/", (req, res) => {
    const spaces = readSpaces();

    const {
        name,
        type,
        capacity,
        description,
        is_active
    } = req.body;

    if (
        !name ||
        !type ||
        capacity === undefined ||
        !description ||
        is_active === undefined
    ) {
        return res.status(400).json({
            message: "Todos os campos são obrigatórios"
        });
    }

    const newId = spaces.length > 0
        ? Math.max(...spaces.map(space => space.id)) + 1
        : 1;

    const newSpace = {
        id: newId,
        name,
        type,
        capacity,
        description,
        is_active
    };

    spaces.push(newSpace);

    saveSpaces(spaces);

    res.status(201).json(newSpace);
});

/**
 * @swagger
 * /spaces/{id}:
 *   put:
 *     summary: Atualizar espaço
 *     description: Atualiza os dados de um espaço pelo seu ID.
 *     tags:
 *       - Espaços
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do espaço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - capacity
 *               - description
 *               - is_active
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sala de Reuniões Atualizada
 *               type:
 *                 type: string
 *                 example: MEETING_ROOM
 *               capacity:
 *                 type: integer
 *                 example: 20
 *               description:
 *                 type: string
 *                 example: Sala para reuniões atualizada
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Espaço atualizado com sucesso
 *       400:
 *         description: Todos os campos são obrigatórios
 *       404:
 *         description: Espaço não encontrado
 */

// PUT - atualizar espaço
router.put("/:id", (req, res) => {
    const spaces = readSpaces();
    const id = Number(req.params.id);

    const index = spaces.findIndex(space => space.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Espaço não encontrado"
        });
    }

    const {
        name,
        type,
        capacity,
        description,
        is_active
    } = req.body;

    if (
        !name ||
        !type ||
        capacity === undefined ||
        !description ||
        is_active === undefined
    ) {
        return res.status(400).json({
            message: "Todos os campos são obrigatórios"
        });
    }

    spaces[index] = {
        id,
        name,
        type,
        capacity,
        description,
        is_active
    };

    saveSpaces(spaces);

    res.json(spaces[index]);
});

/**
 * @swagger
 * /spaces/{id}:
 *   delete:
 *     summary: Excluir espaço
 *     description: Remove um espaço pelo seu ID.
 *     tags:
 *       - Espaços
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do espaço que será excluído
 *     responses:
 *       200:
 *         description: Espaço removido com sucesso
 *       404:
 *         description: Espaço não encontrado
 */

// DELETE - excluir espaço
router.delete("/:id", (req, res) => {
    const spaces = readSpaces();
    const id = Number(req.params.id);

    const index = spaces.findIndex(space => space.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Espaço não encontrado"
        });
    }

    const deletedSpace = spaces.splice(index, 1)[0];

    saveSpaces(spaces);

    res.json({
        message: "Espaço removido com sucesso",
        space: deletedSpace
    });
});

module.exports = router;
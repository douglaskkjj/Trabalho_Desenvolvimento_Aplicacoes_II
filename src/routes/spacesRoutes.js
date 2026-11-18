
const express = require("express");
const router = express.Router();

const Space = require("../models/Space");

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validarId(id) {
    return Number.isInteger(Number(id)) && Number(id) > 0;
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

// GET - listar espaços
router.get("/", async (req, res) => {
    try {
        const { name } = req.query;

        let spaces;

        if (name) {
            spaces = await Space.find({
                name: {
                    $regex: escapeRegex(name),
                    $options: "i"
                }
            });
        } else {
            spaces = await Space.find();
        }

        return res.json(spaces);
    } catch (error) {
        console.error("Erro ao listar espaços:", error);
        return res.status(500).json({
            message: "Erro ao buscar espaços"
        });
    }
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
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!validarId(id)) {
            return res.status(400).json({
                message: "ID inválido"
            });
        }

        const space = await Space.findOne({
            id: Number(id)
        });

        if (!space) {
            return res.status(404).json({
                message: "Espaço não encontrado"
            });
        }

        return res.json(space);
    } catch (error) {
        console.error("Erro ao buscar espaço:", error);
        return res.status(500).json({
            message: "Erro ao buscar espaço"
        });
    }
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
 *         description: Dados inválidos ou campos obrigatórios ausentes
 */

// POST - cadastrar novo espaço
router.post("/", async (req, res) => {
    try {
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

        if (
            typeof name !== "string" ||
            typeof type !== "string" ||
            typeof description !== "string" ||
            !Number.isInteger(capacity) ||
            capacity < 0 ||
            typeof is_active !== "boolean"
        ) {
            return res.status(400).json({
                message: "Dados inválidos para cadastrar o espaço"
            });
        }

        const lastSpace = await Space.findOne().sort({ id: -1 });

        const newId = lastSpace ? lastSpace.id + 1 : 1;

        const newSpace = await Space.create({
            id: newId,
            name,
            type,
            capacity,
            description,
            is_active
        });

        return res.status(201).json(newSpace);
    } catch (error) {
        console.error("Erro ao cadastrar espaço:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Já existe um espaço com esse ID"
            });
        }

        return res.status(500).json({
            message: "Erro ao cadastrar espaço"
        });
    }
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
 *         description: Dados inválidos ou campos obrigatórios ausentes
 *       404:
 *         description: Espaço não encontrado
 */

// PUT - atualizar espaço
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!validarId(id)) {
            return res.status(400).json({
                message: "ID inválido"
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

        if (
            typeof name !== "string" ||
            typeof type !== "string" ||
            typeof description !== "string" ||
            !Number.isInteger(capacity) ||
            capacity < 0 ||
            typeof is_active !== "boolean"
        ) {
            return res.status(400).json({
                message: "Dados inválidos para atualizar o espaço"
            });
        }

        const updatedSpace = await Space.findOneAndUpdate(
            { id: Number(id) },
            {
                name,
                type,
                capacity,
                description,
                is_active
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!updatedSpace) {
            return res.status(404).json({
                message: "Espaço não encontrado"
            });
        }

        return res.json(updatedSpace);
    } catch (error) {
        console.error("Erro ao atualizar espaço:", error);
        return res.status(500).json({
            message: "Erro ao atualizar espaço"
        });
    }
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
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!validarId(id)) {
            return res.status(400).json({
                message: "ID inválido"
            });
        }

        const deletedSpace = await Space.findOneAndDelete({
            id: Number(id)
        });

        if (!deletedSpace) {
            return res.status(404).json({
                message: "Espaço não encontrado"
            });
        }

        return res.json({
            message: "Espaço removido com sucesso",
            space: deletedSpace
        });
    } catch (error) {
        console.error("Erro ao excluir espaço:", error);
        return res.status(500).json({
            message: "Erro ao excluir espaço"
        });
    }
});

module.exports = router;

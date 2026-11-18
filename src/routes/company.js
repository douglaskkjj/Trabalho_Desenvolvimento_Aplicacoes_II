
const express = require("express");
const router = express.Router();

const Company = require("../models/Company");

/**
 * @swagger
 * /company:
 *   get:
 *     summary: Buscar todas as empresas
 *     tags:
 *       - Empresas
 *     responses:
 *       200:
 *         description: Lista de empresas cadastradas
 */

// Buscar todas as empresas
router.get("/", async (req, res) => {
    try {
        const empresas = await Company.find();

        return res.status(200).json(empresas);
    } catch (error) {
        console.error("Erro ao buscar empresas:", error);

        return res.status(500).json({
            mensagem: "Erro ao buscar empresas."
        });
    }
});

/**
 * @swagger
 * /company/buscar:
 *   get:
 *     summary: Buscar empresa por nome
 *     tags:
 *       - Empresas
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *           example: Empresa Exemplo
 *     responses:
 *       200:
 *         description: Empresas encontradas
 */

// Buscar por nome
router.get("/buscar", async (req, res) => {
    try {
        const nome = req.query.nome;

        if (!nome) {
            return res.status(400).json({
                mensagem: "Informe um nome para buscar."
            });
        }

        const empresas = await Company.find({
            corporate_name: {
                $regex: nome,
                $options: "i"
            }
        });

        return res.status(200).json(empresas);
    } catch (error) {
        console.error("Erro ao buscar empresas por nome:", error);

        return res.status(500).json({
            mensagem: "Erro ao buscar empresas."
        });
    }
});

/**
 * @swagger
 * /company/buscar-data:
 *   get:
 *     summary: Buscar empresas por data
 *     tags:
 *       - Empresas
 *     parameters:
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-10-04"
 *     responses:
 *       200:
 *         description: Empresas encontradas
 */

// Buscar por data
router.get("/buscar-data", async (req, res) => {
    try {
        const data = req.query.data;

        if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            return res.status(400).json({
                mensagem: "Informe uma data válida no formato YYYY-MM-DD."
            });
        }

        const inicio = new Date(`${data}T00:00:00.000Z`);
        const fim = new Date(`${data}T23:59:59.999Z`);

        if (isNaN(inicio.getTime())) {
            return res.status(400).json({
                mensagem: "Data inválida."
            });
        }

        const empresas = await Company.find({
            created_at: {
                $gte: inicio,
                $lte: fim
            }
        });

        return res.status(200).json(empresas);
    } catch (error) {
        console.error("Erro ao buscar empresas por data:", error);

        return res.status(500).json({
            mensagem: "Erro ao buscar empresas."
        });
    }
});

/**
 * @swagger
 * /company/{id}:
 *   get:
 *     summary: Buscar empresa por ID
 *     tags:
 *       - Empresas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *       404:
 *         description: Empresa não encontrada
 */

// Buscar por ID
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const empresa = await Company.findOne({ id });

        if (!empresa) {
            return res.status(404).json({
                mensagem: "Empresa não encontrada."
            });
        }

        return res.status(200).json(empresa);
    } catch (error) {
        console.error("Erro ao buscar empresa:", error);

        return res.status(500).json({
            mensagem: "Erro ao buscar empresa."
        });
    }
});

/**
 * @swagger
 * /company:
 *   post:
 *     summary: Cadastrar nova empresa
 *     tags:
 *       - Empresas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               corporate_name:
 *                 type: string
 *                 example: Empresa Exemplo LTDA
 *               trade_name:
 *                 type: string
 *                 example: Empresa Exemplo
 *               cnpj:
 *                 type: string
 *                 example: 12.345.678/0001-90
 *               phone:
 *                 type: string
 *                 example: "(48) 99999-9999"
 *     responses:
 *       201:
 *         description: Empresa cadastrada com sucesso
 */

// Cadastrar nova empresa
router.post("/", async (req, res) => {
    try {
        const {
            corporate_name,
            trade_name,
            cnpj,
            phone
        } = req.body;

        if (!corporate_name || !corporate_name.trim()) {
            return res.status(400).json({
                mensagem: "A razão social é obrigatória."
            });
        }

        const ultimaEmpresa = await Company.findOne().sort({ id: -1 });

        const novoId = ultimaEmpresa
            ? ultimaEmpresa.id + 1
            : 1;

        const novaEmpresa = await Company.create({
            id: novoId,
            corporate_name,
            trade_name,
            cnpj,
            phone
        });

        return res.status(201).json(novaEmpresa);
    } catch (error) {
        console.error("Erro ao cadastrar empresa:", error);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar empresa."
        });
    }
});

/**
 * @swagger
 * /company/{id}:
 *   put:
 *     summary: Atualizar empresa
 *     tags:
 *       - Empresas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               corporate_name:
 *                 type: string
 *               trade_name:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Empresa atualizada com sucesso
 *       404:
 *         description: Empresa não encontrada
 */

// Atualizar empresa
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const empresa = await Company.findOne({ id });

        if (!empresa) {
            return res.status(404).json({
                mensagem: "Empresa não encontrada."
            });
        }

        const {
            corporate_name,
            trade_name,
            cnpj,
            phone
        } = req.body;

        const dadosAtualizados = {};

        if (corporate_name !== undefined) {
            dadosAtualizados.corporate_name = corporate_name;
        }

        if (trade_name !== undefined) {
            dadosAtualizados.trade_name = trade_name;
        }

        if (cnpj !== undefined) {
            dadosAtualizados.cnpj = cnpj;
        }

        if (phone !== undefined) {
            dadosAtualizados.phone = phone;
        }

        const empresaAtualizada = await Company.findOneAndUpdate(
            { id },
            { $set: dadosAtualizados },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        return res.status(200).json(empresaAtualizada);
    } catch (error) {
        console.error("Erro ao atualizar empresa:", error);

        return res.status(500).json({
            mensagem: "Erro ao atualizar empresa."
        });
    }
});

/**
 * @swagger
 * /company/{id}:
 *   delete:
 *     summary: Deletar empresa
 *     tags:
 *       - Empresas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Empresa removida com sucesso
 *       404:
 *         description: Empresa não encontrada
 */

// Deletar empresa
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido."
            });
        }

        const empresaRemovida = await Company.findOneAndDelete({ id });

        if (!empresaRemovida) {
            return res.status(404).json({
                mensagem: "Empresa não encontrada."
            });
        }

        return res.status(200).json({
            mensagem: "Empresa removida com sucesso.",
            empresa: empresaRemovida
        });
    } catch (error) {
        console.error("Erro ao remover empresa:", error);

        return res.status(500).json({
            mensagem: "Erro ao remover empresa."
        });
    }
});

module.exports = router;

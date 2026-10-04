const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const filePath = path.join(__dirname, "../data/company.json");

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

// Buscar todos os usuários
router.get("/", (req, res) => {
    const empresas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    res.json(empresas);
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
 *         example: Empresa Exemplo
 *     responses:
 *       200:
 *         description: Empresas encontradas
 */
// Buscar por nome
router.get("/buscar", (req, res) => {
    const empresas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const nome = req.query.nome;

    const resultado = empresas.filter((empresa) =>
        empresa.corporate_name.toLowerCase().includes(nome.toLowerCase())
    );

    res.json(resultado);
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
 *         example: "2026-10-04"
 *     responses:
 *       200:
 *         description: Empresas encontradas
 */

// Buscar por data
router.get("/buscar-data", (req, res) => {
    const empresas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const data = req.query.data;

    const resultado = empresas.filter((empresa) =>
        empresa.created_at.startsWith(data)
    );

    res.json(resultado);
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
 *         example: 1
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *       404:
 *         description: Empresa não encontrada
 */
// Buscar por ID
router.get("/:id", (req, res) => {
    const empresas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const id = Number(req.params.id);

    const empresa = empresas.find(
        (empresa) => empresa.id === id
    );

    if (!empresa) {
        return res.status(404).json({
            mensagem: "Empresa não encontrada"
        });
    }

    res.json(empresa);
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
// nova empresa
router.post("/", (req, res) => {
    const empresas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const novaEmpresa = {
        id: empresas.length > 0
            ? empresas[empresas.length - 1].id + 1
            : 1,

        corporate_name: req.body.corporate_name,
        trade_name: req.body.trade_name,
        cnpj: req.body.cnpj,
        phone: req.body.phone,
        created_at: new Date().toISOString()
    };

    empresas.push(novaEmpresa);

    fs.writeFileSync(
        filePath,
        JSON.stringify(empresas, null, 2)
    );

    res.status(201).json(novaEmpresa);
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
 *         example: 1
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

// atualiza empresa
router.put("/:id", (req, res) => {
    const empresas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const id = Number(req.params.id);

    const indice = empresas.findIndex(
        (empresa) => empresa.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Empresa não encontrada"
        });
    }

    empresas[indice] = {
        ...req.body,
        id: id
    };

    fs.writeFileSync(
        filePath,
        JSON.stringify(empresas, null, 2)
    );

    res.json(empresas[indice]);
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
 *         example: 1
 *     responses:
 *       200:
 *         description: Empresa removida com sucesso
 *       404:
 *         description: Empresa não encontrada
 */
// deletar empresa
router.delete("/:id", (req, res) => {
    const empresas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const id = Number(req.params.id);

    const indice = empresas.findIndex(
        (empresa) => empresa.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Empresa não encontrada"
        });
    }

    const empresaRemovida = empresas.splice(indice, 1);

    fs.writeFileSync(
        filePath,
        JSON.stringify(empresas, null, 2)
    );

    res.json({
        mensagem: "Empresa removida com sucesso",
        empresa: empresaRemovida[0]
    });
});

module.exports = router;
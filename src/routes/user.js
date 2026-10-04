const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const filePath = path.join(__dirname, "../data/user.json");
/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Buscar todos os usuários
 *     tags:
 *       - Usuários
 *     responses:
 *       200:
 *         description: Lista de usuários cadastrados
 */

// Buscar todos os usuários
router.get("/", (req, res) => {
    const usuarios = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    res.json(usuarios);
});

/**
 * @swagger
 * /usuarios/buscar:
 *   get:
 *     summary: Buscar usuário por nome
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *         example: João
 *     responses:
 *       200:
 *         description: Usuários encontrados
 */
// Buscar por nome
router.get("/buscar", (req, res) => {
    const usuarios = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const nome = req.query.nome;

    const resultado = usuarios.filter((usuario) =>
        usuario.name.toLowerCase().includes(nome.toLowerCase())
    );

    res.json(resultado);
});

/**
 * @swagger
 * /usuarios/buscar-data:
 *   get:
 *     summary: Buscar usuários por data de criação
 *     tags:
 *       - Usuários
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
 *         description: Usuários encontrados
 */
// Buscar por data
router.get("/buscar-data", (req, res) => {
    const usuarios = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const data = req.query.data;

    const resultado = usuarios.filter((usuario) =>
        usuario.created_at.startsWith(data)
    );

    res.json(resultado);
});

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
// Buscar por ID
router.get("/:id", (req, res) => {
    const usuarios = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const id = Number(req.params.id);

    const usuario = usuarios.find(
        (usuario) => usuario.id === id
    );

    if (!usuario) {
        return res.status(404).json({
            mensagem: "Usuário não encontrado"
        });
    }

    res.json(usuario);
});

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cadastrar novo usuário
 *     tags:
 *       - Usuários
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password_hash
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@email.com
 *               password_hash:
 *                 type: string
 *                 example: senha123
 *               role:
 *                 type: string
 *                 example: usuario
 *               cpf_cnpj:
 *                 type: string
 *                 example: "123.456.789-00"
 *               company_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 */
// novo usuario
router.post("/", (req, res) => {
    const usuario = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const novoUsuario = {
        id: usuario.length > 0
            ? usuario[usuario.length - 1].id + 1
            : 1,

        name: req.body.name,
        email: req.body.email,
        password_hash: req.body.password_hash,
        role: req.body.role,
        cpf_cnpj: req.body.cpf_cnpj,
        company_id: req.body.company_id,
        created_at: new Date().toISOString()
    };

    usuario.push(novoUsuario);

    fs.writeFileSync(
        filePath,
        JSON.stringify(usuario, null, 2)
    );

    res.status(201).json(novoUsuario);
});

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags:
 *       - Usuários
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
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@email.com
 *               password_hash:
 *                 type: string
 *                 example: novaSenha123
 *               role:
 *                 type: string
 *                 example: usuario
 *               cpf_cnpj:
 *                 type: string
 *                 example: "123.456.789-00"
 *               company_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */

// atualiza usuario
router.put("/:id", (req, res) => {
    const usuarios = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const id = Number(req.params.id);

    const indice = usuarios.findIndex(
        (usuario) => usuario.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Usuário não encontrado"
        });
    }

    usuarios[indice] = {
        ...usuarios[indice],
        ...req.body,
        id: id
    };

    fs.writeFileSync(
        filePath,
        JSON.stringify(usuarios, null, 2)
    );

    res.json(usuarios[indice]);
});

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Deletar usuário
 *     tags:
 *       - Usuários
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
// deletar usuario
router.delete("/:id", (req, res) => {
    const usuarios = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    const id = Number(req.params.id);

    const indice = usuarios.findIndex(
        (usuario) => usuario.id === id
    );

    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Usuário não encontrado"
        });
    }

    const usuarioRemovido = usuarios.splice(indice, 1);

    fs.writeFileSync(
        filePath,
        JSON.stringify(usuarios, null, 2)
    );

    res.json({
        mensagem: "Usuário removido com sucesso",
        usuário: usuarioRemovido[0]
    });
});

module.exports = router;
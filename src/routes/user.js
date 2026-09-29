const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const filePath = path.join(__dirname, "../data/user.json");

// Buscar todos os usuários
router.get("/", (req, res) => {
    const usuarios = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    res.json(usuarios);
});

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
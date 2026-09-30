const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const filePath = path.join(__dirname, "../data/company.json");

// Buscar todos os usuários
router.get("/", (req, res) => {
    const empresas = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    res.json(empresas);
});

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
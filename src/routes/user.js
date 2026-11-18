
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password_hash');
    res.json(users);
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao buscar usuários',
      erro: error.message
    });
  }
});

/**
 * @swagger
 * /users/buscar:
 *   get:
 *     summary: Buscar usuários por nome
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome ou parte do nome do usuário
 *     responses:
 *       200:
 *         description: Usuários encontrados
 */
router.get('/buscar', async (req, res) => {
  try {
    const { nome } = req.query;

    const users = await User.find({
      name: { $regex: nome || '', $options: 'i' }
    }).select('-password_hash');

    res.json(users);
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao buscar usuários',
      erro: error.message
    });
  }
});

/**
 * @swagger
 * /users/buscar-data:
 *   get:
 *     summary: Buscar usuários por data de cadastro
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         example: "2026-11-17"
 *         description: Data de cadastro
 *     responses:
 *       200:
 *         description: Usuários encontrados
 *       400:
 *         description: Data não informada
 */
router.get('/buscar-data', async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({
        mensagem: 'Informe uma data'
      });
    }

    const inicio = new Date(`${data}T00:00:00.000Z`);
    const fim = new Date(`${data}T23:59:59.999Z`);

    const users = await User.find({
      created_at: { $gte: inicio, $lte: fim }
    }).select('-password_hash');

    res.json(users);
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao buscar usuários por data',
      erro: error.message
    });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({
      id: Number(req.params.id)
    }).select('-password_hash');

    if (!user) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado'
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao buscar usuário',
      erro: error.message
    });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cadastrar usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Administrador
 *               email:
 *                 type: string
 *                 example: admin@teste.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, CLIENT]
 *                 example: ADMIN
 *               cpf_cnpj:
 *                 type: string
 *                 example: "12345678900"
 *               company_id:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       400:
 *         description: Dados obrigatórios não informados
 *       409:
 *         description: E-mail já cadastrado
 *       500:
 *         description: Erro interno
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      cpf_cnpj,
      company_id
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        mensagem: 'Nome, e-mail e senha são obrigatórios'
      });
    }

    const emailExistente = await User.findOne({
      email: email.toLowerCase()
    });

    if (emailExistente) {
      return res.status(409).json({
        mensagem: 'Este e-mail já está cadastrado'
      });
    }

    const ultimoUsuario = await User.findOne().sort({ id: -1 });
    const novoId = ultimoUsuario ? ultimoUsuario.id + 1 : 1;

    const password_hash = await bcrypt.hash(password, 10);

    const novoUsuario = await User.create({
      id: novoId,
      name,
      email,
      password_hash,
      role: role || 'CLIENT',
      cpf_cnpj,
      company_id
    });

    const usuarioResposta = novoUsuario.toObject();
    delete usuarioResposta.password_hash;

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso',
      usuario: usuarioResposta
    });
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao cadastrar usuário',
      erro: error.message
    });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Users]
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
 *               name:
 *                 type: string
 *                 example: Administrador Atualizado
 *               email:
 *                 type: string
 *                 example: admin@teste.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, CLIENT]
 *                 example: ADMIN
 *               cpf_cnpj:
 *                 type: string
 *                 example: "12345678900"
 *               company_id:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       409:
 *         description: E-mail já cadastrado
 */
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      cpf_cnpj,
      company_id
    } = req.body;

    const usuario = await User.findOne({
      id: Number(req.params.id)
    });

    if (!usuario) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado'
      });
    }

    if (email) {
      const emailExistente = await User.findOne({
        email: email.toLowerCase(),
        id: { $ne: Number(req.params.id) }
      });

      if (emailExistente) {
        return res.status(409).json({
          mensagem: 'Este e-mail já está cadastrado'
        });
      }

      usuario.email = email;
    }

    if (name !== undefined) usuario.name = name;

    if (password) {
      usuario.password_hash = await bcrypt.hash(password, 10);
    }

    if (role !== undefined) usuario.role = role;
    if (cpf_cnpj !== undefined) usuario.cpf_cnpj = cpf_cnpj;
    if (company_id !== undefined) usuario.company_id = company_id;

    await usuario.save();

    const usuarioResposta = usuario.toObject();
    delete usuarioResposta.password_hash;

    res.json({
      mensagem: 'Usuário atualizado com sucesso',
      usuario: usuarioResposta
    });
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao atualizar usuário',
      erro: error.message
    });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Excluir usuário
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await User.findOneAndDelete({
      id: Number(req.params.id)
    });

    if (!usuario) {
      return res.status(404).json({
        mensagem: 'Usuário não encontrado'
      });
    }

    res.json({
      mensagem: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao excluir usuário',
      erro: error.message
    });
  }
});

module.exports = router;

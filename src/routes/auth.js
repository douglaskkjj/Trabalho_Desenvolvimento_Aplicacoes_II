
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação de usuários
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realizar login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@teste.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: E-mail e senha são obrigatórios
 *       401:
 *         description: E-mail ou senha incorretos
 *       500:
 *         description: Erro interno
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        mensagem: 'E-mail e senha são obrigatórios'
      });
    }

    const usuario = await User.findOne({
      email: email.toLowerCase()
    });

    if (!usuario) {
      return res.status(401).json({
        mensagem: 'E-mail ou senha incorretos'
      });
    }

    const senhaCorreta = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: 'E-mail ou senha incorretos'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        role: usuario.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
      }
    );

    res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role
      }
    });

  } catch (error) {
    res.status(500).json({
      mensagem: 'Erro ao realizar login',
      erro: error.message
    });
  }
});

module.exports = router;

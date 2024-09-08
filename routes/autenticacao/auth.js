const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { UserProfile, Token, Cargo, Instituicoes, EditorChefes } = require("../../model/db");

const router = express.Router();

// Registro de novo usuário
router.post('/register', async (req, res) => {
  const { email, nome, senha, cpf, validado, cargos } = req.body;

  if (!Array.isArray(cargos) || cargos.length === 0) {
    return res.status(400).json({ message: 'cargo must be a non-empty array' });
  }

  const validcargo = ['Avaliador', 'Editor Chefe', 'Convidado', 'Chair', 'Organizador', 'Autor', 'Ouvinte'];
  const invalidcargo = cargos.filter(cargo => !validcargo.includes(cargo));

  if (invalidcargo.length > 0) {
    return res.status(400).json({ message: `Invalid cargo: ${invalidcargo.join(', ')}` });
  }

  const hashedsenha = await bcrypt.hash(senha, 10);

  try {
    const user = await UserProfile.create({ email, nome, senha: hashedsenha, cpf, validado });

    // Buscar cargos no banco
    const roleRecords = await Cargo.findAll({ where: { cargo: cargos } });
    console.log(roleRecords)

    if (roleRecords.length === 0) {
      return res.status(400).json({ message: 'No valid roles found' });
    }

    // Associar cargos ao usuário
    await user.addCargo(roleRecords);
    console.log(user.addCargo(roleRecords))

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error); // Loga o erro completo
    res.status(400).json({ message: 'Error registering user', error: error.message });
  }
});

// Login de usuário
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    // Inclui o modelo Cargo para garantir que os cargos sejam carregados
    const user = await UserProfile.findOne({ 
      where: { email }, 
      include: {
        model: Cargo,
        through: { attributes: [] } // Exclui atributos da tabela intermediária
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or senha' });
    }

    const validsenha = await bcrypt.compare(senha, user.senha);
    if (!validsenha) {
      return res.status(400).json({ message: 'Invalid email or senha' });
    }

    // Verifica se o usuário tem cargos associados
    if (!user.Cargos || user.Cargos.length === 0) {
      return res.status(400).json({ message: 'User has no roles associated' });
    }

    // Mapeia os cargos do usuário
    const usercargo = user.Cargos.map(cargo => cargo.cargo);

    // Inclui os cargos no payload do JWT
    const token = jwt.sign({ id: user.id, cargo: usercargo }, process.env.JWT_SECRET, { expiresIn: '5h' });

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 5);

    await Token.create({ token, idUserProfiles: user.id, expiresAt });

    res.json({ token });

  } catch (error) {
    console.error('Login error:', error); // Log detalhado do erro
    res.status(500).json({ message: 'An error occurred during login', error: error.message });
  }
});

module.exports = router;

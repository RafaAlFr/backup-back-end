const express = require('express');
const bcrypt = require('bcryptjs'); // Importa bcryptjs
const router = express.Router();
const { UserProfile, Convidados, Cargo } = require('../../model/db');

router.post('/', async (req, res) => {
  try {
    // Encripta a senha antes de salvar
    const salt = await bcrypt.genSalt(10); // Gera o salt
    const hashedPassword = await bcrypt.hash(req.body.senha, salt); // Encripta a senha

    // Criação de UserProfile
    const userData = {
      nome: req.body.nome,
      email: req.body.email,
      senha: hashedPassword, // Usa a senha encriptada
      cpf: req.body.cpf,
      validado: req.body.validado,
    };
    const userpfp = await UserProfile.create(userData);
    console.log(userpfp);

    // Criação de Convidado associado ao UserProfile
    const convidadoData = {
      funcao: req.body.funcao,
      tempoNecessario: req.body.tempoNecessario,
      periodo: req.body.periodo,
      idUserProfiles: userpfp.id,
    };
    const novoConvidado = await Convidados.create(convidadoData);
    console.log(novoConvidado);

    // Busca o cargo "convidado" no banco de dados
    const roleRecords = await Cargo.findOne({ where: { cargo: 'convidado' } });

    if (!roleRecords) {
      return res.status(400).json({ message: 'Cargo "convidado" não encontrado.' });
    }

    // Associar o cargo ao usuário na tabela UserCargo
    await userpfp.addCargo(roleRecords); // Isso irá criar um registro na tabela UserCargo
    console.log('Cargo associado:', roleRecords);

    // Finaliza a requisição com sucesso
    res.status(201).json({ message: 'Convidado cadastrado e cargo associado com sucesso.', userpfp, novoConvidado });
  } catch (error) {
    console.error('Erro ao cadastrar convidado:', error);
    res.status(500).json({ message: 'Erro ao cadastrar convidado.', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs'); // Importa bcryptjs
const router = express.Router();
const { Instituicoes, UserProfile, Eventos, Chairs, Organizadores, Avaliadores, Cargo } = require('../../model/db');

// Registro de novo usuário
router.post('/:nomeURL', async (req, res) => {
  try {
    // Busca de instituição e evento no banco de dados
    const instituicao = await Instituicoes.findOne({ where: { nome: req.body.instituicao } });
    const event = await Eventos.findOne({ where: { nomeURL: req.params.nomeURL } });

    // Verifica se a instituição foi encontrada
    if (!instituicao) {
      return res.status(404).json({ message: 'Instituição não encontrada.' });
    }

    // Verifica se o evento foi encontrado
    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    const { email, nome, senha, cpf, validado, cargos, linkLattes, periodo, status } = req.body;

    if (!Array.isArray(cargos) || cargos.length === 0) {
      return res.status(400).json({ message: 'Cargos deve ser um array não vazio.' });
    }

    const validcargo = ['Avaliador', 'Chair', 'Organizador'];
    const invalidcargo = cargos.filter(cargo => !validcargo.includes(cargo));

    if (invalidcargo.length > 0) {
      return res.status(400).json({ message: `Cargo inválido: ${invalidcargo.join(', ')}` });
    }

    // Gera a senha hash
    const hashedsenha = await bcrypt.hash(senha, 10);

    // Criação do usuário
    const user = await UserProfile.create({ email, nome, senha: hashedsenha, cpf, validado });

    // Busca de cargos no banco
    const roleRecords = await Cargo.findAll({ where: { cargo: cargos } });

    if (roleRecords.length === 0) {
      return res.status(400).json({ message: 'Nenhum cargo válido encontrado.' });
    }

    // Associar cargos ao usuário
    await user.addCargo(roleRecords);

    // Verificação dos cargos e criação das entradas específicas
    if (cargos.includes('Chair')) {
      const chairData = {
        idInstituicacoes: instituicao.id,
        idEventos: event.id,
        idUserProfiles: user.id,
        linkLattes: linkLattes,
        periodo: periodo,
        status: status
      };
      await Chairs.create(chairData);
    }

    if (cargos.includes('Organizador')) {
      const organizadorData = {
        idInstituicacoes: instituicao.id,
        idEventos: event.id,
        idUserProfiles: user.id,
        periodo: periodo,
        linkLattes: linkLattes,
        status: status
      };
      await Organizadores.create(organizadorData);
    }

    if (cargos.includes('Avaliador')) {
      const avaliadorData = {
        idInstituicacoes: instituicao.id,
        idUserProfiles: user.id,
        linkLattes: linkLattes,
        status: status
      };
      await Avaliadores.create(avaliadorData);
    }

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error); // Loga o erro completo
    res.status(400).json({ message: 'Erro ao registrar usuário', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Instituicoes, EditorChefes } = require('../../model/db');

router.post('/', async (req, res) => {
  try {
    // Busca a instituição pelo nome fornecido
    const instituicao = await Instituicoes.findOne({ where: { nome: req.body.instituicao } });
    
    // Verifica se a instituição existe
    if (!instituicao) {
      return res.status(404).json({ message: 'Instituição não encontrada.' });
    }

    // Dados para criar o Editor Chefe
    const data = {
      idInstituicao: instituicao.id,
      idUserProfiles: req.user.id, // Pegando o id do usuário autenticado
      linkLattes: req.body.linkLattes,
      status: req.body.status
    };

    // Verifica se já existe um Editor Chefe com o idUserProfiles fornecido
    const editorChefeExistente = await EditorChefes.findOne({ where: { idUserProfiles: req.user.id } });

    if (editorChefeExistente) {
      return res.status(400).json({ message: 'Já existe um Editor Chefe cadastrado para este usuário.' });
    }

    // Cria um novo Editor Chefe
    const novoEditorChefe = await EditorChefes.create(data);
    res.status(201).json(novoEditorChefe);

  } catch (error) {
    console.error('Erro ao cadastrar Editor Chefe:', error);
    res.status(500).json({ message: 'Erro ao cadastrar Editor Chefe.', error: error.message });
  }
});

module.exports = router;

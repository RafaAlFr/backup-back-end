const express = require('express');
const bcrypt = require('bcryptjs'); // Importa bcryptjs
const router = express.Router();
const { Instituicoes, UserProfile, Ouvintes, Cargo } = require('../../model/db');

router.post('/', async (req, res) => {
    try {
      // Busca a instituição pelo nome fornecido
      const instituicao = await Instituicoes.findOne({ where: { nome: "zl" } });
      
      // Verifica se a instituição existe
      if (!instituicao) {
        return res.status(404).json({ message: 'Instituição não encontrada.' });
      }
      
      const Instdata = { idInstituicao: instituicao.id };
      console.log(Instdata);

      // Encripta a senha antes de salvar
      const salt = await bcrypt.genSalt(10); // Gera o salt
      const hashedPassword = await bcrypt.hash(req.body.senha, salt); // Encripta a senha

      const userData = {
        nome: req.body.nome,
        email: req.body.email,
        senha: hashedPassword, // Usa a senha encriptada
        cpf: req.body.cpf,
        validado: req.body.validado 
      };
      const userpfp = await UserProfile.create(userData); 
      console.log(userpfp);

      const ouvinteData = {
        curso: req.body.curso,
        periodo: req.body.periodo,
        presenca: req.body.presenca,
        idUserProfiles: userpfp.id,
        idInstituicao: instituicao.idInstituicao 
      };
      const novoOuvinte = await Ouvintes.create(ouvinteData); 
      console.log(novoOuvinte);

      const roleRecords = await Cargo.findOne({ where: { cargo: 'Ouvinte' } });

      if (!roleRecords) {
        return res.status(400).json({ message: 'Cargo "Ouvinte" não encontrado.' });
      }
  
      // Associar o cargo ao usuário na tabela UserCargo
      await userpfp.addCargo(roleRecords); // Isso irá criar um registro na tabela UserCargo
      console.log('Cargo associado:', roleRecords);
  
      // Finaliza a requisição com sucesso
      res.status(201).json({ message: 'Convidado cadastrado e cargo associado com sucesso.', userpfp, novoOuvinte });
    } catch (error) {
      console.error('Erro ao cadastrar convidado:', error);
      res.status(500).json({ message: 'Erro ao cadastrar convidado.', error: error.message });
    }
});
  
module.exports = router;

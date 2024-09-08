const express = require('express');
const router = express.Router();
const { CategoriaArquivos } = require("../../model/db");

router.get('/', async (req, res) => {
    const cat = await CategoriaArquivos.findAll();
    res.json(cat)
});


router.post('/', async (req, res) => {
    const cat = req.body;
    console.log(cat)
    try {
        console.log(cat)
        const novo = await CategoriaArquivos.create(cat)
        console.log(novo)
        res.json(novo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao ccadastrar categoria de arquivos '+ error.message });
    }
});

module.exports = router
const express = require('express');
const router = express.Router();
const { Instituicoes } = require("../../model/db");

router.get('/', async (req, res) => {
    const inst = await Instituicoes.findAll();
    res.json(inst)
});

router.post("/", async (req, res) => {
    const inst = req.body;
    console.log(inst)
    try {
        console.log(inst)
        const novo = await Instituicoes.create(inst)
        console.log(novo)
        res.json(novo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar Instituicoes '+ error.message });
    }
});

module.exports = router;
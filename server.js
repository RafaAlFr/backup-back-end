require('dotenv').config();
const express = require('express');
const { sequelize } = require('./model/db');
const authRoutes = require('./routes/autenticacao/auth');
const authMiddleware = require('./routes/autenticacao/middleware');

const app = express();
app.use("/uploads", express.static('uploads'));
app.use(express.json());
app.use('/auth', authRoutes);

// Rotas protegidas por tipos de usuário
const evento = require('./routes/evento/evento');
app.use('/evento/cadastro', authMiddleware(['Editor Chefe']), evento );

const CategoriaArquivos = require('./routes/evento/categoriaArquivo');
app.use('/evento/categoriaArquivos', authMiddleware(['Editor Chefe']), CategoriaArquivos );

const Instituicoes = require('./routes/cadastros/instituicao')
app.use("/Instituicoes",  Instituicoes)

const editorChefe = require('./routes/cadastros/editorChefe')
app.use("/cadastro/editorChefe",authMiddleware(['Avaliador', 'Editor Chefe', 'Convidado', 'Chair', 'Organizador', 'Autor', 'Ouvinte']), editorChefe )


app.get('/avaliador', authMiddleware(['Editor Chefe', 'Ouvinte']), (req, res) => {
  res.json({ message: 'Welcome, avaliador!' });
});

app.get('/organizador', authMiddleware(['Ouvinte']), (req, res) => {
  res.json({ message: 'Welcome, organizador!' });
});

app.get('/convidado', authMiddleware(['convidado']), (req, res) => {
  res.json({ message: 'Welcome, convidado!' });
});

app.get('/chair', authMiddleware(['chair']), (req, res) => {
  res.json({ message: 'Welcome, chair!' });
});

app.get('/autor', authMiddleware(['autor']), (req, res) => {
  res.json({ message: 'Welcome, autor!' });
});

const PORT = process.env.PORT || 3031;
app.listen(PORT, async () => {
  await sequelize.authenticate();
  console.log(`Server running on port ${PORT}`);
});

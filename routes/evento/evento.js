const express = require('express');
const router = express.Router();
const { Eventos, EditorChefes, CorpoEditoriais, Apoiadores, CorpoEditorialEventos, EventApoiadores, Onlines, Presenciais, Arquivos } = require("../../model/db");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Função para garantir que o diretório existe
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Função slugify para normalizar o nome do arquivo
function slugify(string) {
    return string
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/[^\w\-]+/g, '') // Remove caracteres não alfanuméricos
        .replace(/\-\-+/g, '-') // Remove múltiplos hífens
        .replace(/^-+/, '') // Remove hífen no início
        .replace(/-+$/, ''); // Remove hífen no final
}

const getYearMonth = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda se necessário
    return `${year}-${month}`;
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const nomeEvento = getYearMonth(); // Usa ano e mês no nome do evento
        const eventDirLogo = path.join('uploads', nomeEvento, 'logo');
        const eventDirArquivos = path.join('uploads', nomeEvento, 'arquivos');
        
        // Cria os diretórios se não existirem
        ensureDirExists(eventDirLogo);
        ensureDirExists(eventDirArquivos);

        // Define o diretório com base no campo do arquivo (logo ou arquivos)
        if (file.fieldname === 'logo') {
            cb(null, eventDirLogo);
        } else {
            cb(null, eventDirArquivos);
        }
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `${slugify(file.originalname)}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.fields([{ name: 'logo' }]), async (req, res) => {
    try {
        const editorChefe = await EditorChefes.findOne({ where: { idUserProfiles: req.user.id } });
        if (!editorChefe) {
            return res.status(404).json({ message: 'Editor chefe não encontrado.' });
        }

        const url = slugify(req.body.nome)

        const data = {
            idEditorChefes: editorChefe.id,
            nome: req.body.nome,
            nomeURL: url,
            descricao: req.body.descricao,
            assuntoPrincipal: req.body.assuntoPrincipal,
            emailEvento: req.body.emailEvento,
            publico: req.body.publico,
            proceedings: req.body.proceedings,
            certificados: req.body.certificados,
            formato: req.body.formato,
            // Logo será opcional, pode ser descomentada conforme necessário:
            // logo: req.files.logo ? req.files.logo[0].path : null
        };

        // Criação do evento
       const event = await Eventos.create(data);

       // Criação dos Apoiadores
        const apoaId = [];
        if (req.body.apoiadores && Array.isArray(req.body.apoiadores)) {
            for (let i = 0; i < req.body.apoiadores.length; i++) {
                const apoia = await Apoiadores.create({ nome: req.body.apoiadores[i] });
                apoaId.push(apoia.id);
            }
        }

        // Criação do Corpo Editorial
        const corpId = [];
        if (req.body.corpoEditorial && Array.isArray(req.body.corpoEditorial)) {
            for (let i = 0; i < req.body.corpoEditorial.length; i++) {
                const corp = await CorpoEditoriais.create({ nome: req.body.corpoEditorial[i] });
                corpId.push(corp.id);
            }
        }

        // Associação do Corpo Editorial ao evento
        for (let index = 0; index < corpId.length; index++) {
            await CorpoEditorialEventos.create({
                idCorpoEditoriais: corpId[index],
                idEventos: event.id
            });
        }

        // Associação dos Apoiadores ao evento
        for (let index = 0; index < apoaId.length; index++) {
            await EventApoiadores.create({
                idApoiadores: apoaId[index],
                idEventos: event.id
            });
        }


    } catch (error) {
        console.error('Erro ao criar evento:', error);
        res.status(500).json({ error: 'Erro ao criar evento: ' + error.message });
    }
});

// Rota para listar eventos
router.get('/', async (req, res) => {
    try {
        const eventos = await Eventos.findAll();
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar eventos: ' + error.message });
    }
});

// Rota para atualizar evento por nome
router.post('/:nomeURL', async (req, res) => {
    try {
        const event = await Eventos.findOne({ where: { nomeURL: req.params.nomeURL } });

        if (!event) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        const dataPresencial = {
            cep: req.body.cep,
            local: req.body.local,
            cidade: req.body.cidade,
            estado: req.body.estado,
            idEventos: event.id
        };

        await Presenciais.create(dataPresencial)

        const dataEvent = {
        dataInicio: req.body.dataInicio,
        dataFinal: req.body.dataFinal,
        manha: req.body.manha,
        tarde: req.body.tarde,
        noite: req.body.noite,
        horarioInicio: req.body.horarioInicio,
        horarioFinal: req.body.horarioFinal
        }

        await Eventos.update(dataEvent, { where: { id: event.id } });

    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        res.status(500).json({ error: 'Erro ao atualizar evento: ' + error.message });
    }
});

router.post('/:nomeURL/online', async(req, res)=>{
    const event = await Eventos.findOne({ where: { nomeURL: req.params.nomeURL } });
    if (!event) {
        return res.status(404).json({ error: 'Evento não encontrado' });
    }
    const dataOnline = {
        link: req.body.link
    }
    
    await Onlines.create(dataOnline)

    const dataEvent = {
        dataInicio: req.body.dataInicio,
        dataFinal: req.body.dataFinal,
        manha: req.body.manha,
        tarde: req.body.tarde,
        noite: req.body.noite,
        horarioInicio: req.body.horarioInicio,
        horarioFinal: req.body.horarioFinal
        }

        await Eventos.update(dataEvent, { where: { id: event.id } });
});


router.post('/:nomeURL/hibrido', async(req, res)=>{
    const event = await Eventos.findOne({ where: { nomeURL: req.params.nomeURL } });
    if (!event) {
        return res.status(404).json({ error: 'Evento não encontrado' });
    }
    const dataOnline = {
        idEventos: event.id,
        link: req.body.link
    }
    
    await Onlines.create(dataOnline)

    const dataPresencial = {
        cep: req.body.cep,
        local: req.body.local,
        cidade: req.body.cidade,
        estado: req.body.estado,
        idEventos: event.id
    };

    await Presenciais.create(dataPresencial)

    const dataEvent = {
        dataInicio: req.body.dataInicio,
        dataFinal: req.body.dataFinal,
        manha: req.body.manha,
        tarde: req.body.tarde,
        noite: req.body.noite,
        horarioInicio: req.body.horarioInicio,
        horarioFinal: req.body.horarioFinal
        
        }

        await Eventos.update(dataEvent, { where: { id: event.id } });
});

router.post('/:nomeURL/arquivos', upload.fields([
    { name: 'ModeloArquivos' },
    { name: 'ModeloApresentacao' }
]), async (req, res) => {
    try {
        const event = await Eventos.findOne({ where: { nomeURL: req.params.nomeURL } });
        if (!event) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        const dataEvent = {
            status: req.body.status,
            inicioSubmissao: req.body.inicioSubmissao,
            finalSubmissao: req.body.finalSubmissao,
            inicioAvaliacao: req.body.inicioAvaliacao,
            FinalAvaliacao: req.body.FinalAvaliacao,
            limiteArquivosAutores: req.body.limiteArquivosAutores,
            limitesAutores: req.body.limitesAutores,
            limiteAvaliadores: req.body.limiteAvaliadores,
            modeloApresentacao: req.files.ModeloApresentacao[0].path,

        };

        await Eventos.update(dataEvent, { where: { id: event.id } });

        const datArquivos = {
            modeloArquivo: req.files.ModeloArquivos[0].path,
            normasPublicacaos: req.body.normasPublicacaos,
            avalicao: req.body.avalicao,
            reenvio: req.body.reenvio,
            apresentacao: req.body.apresentacao,
            idEventos: event.id,
            idCategoriaArquivos: req.body.idCategoriaArquivos
        };

        await Arquivos.create(datArquivos);

        res.status(200).json({ message: 'Arquivos e dados do evento atualizados com sucesso!' });
    } catch (error) {
        console.error('Erro ao processar arquivos e dados do evento:', error);
        res.status(500).json({ error: 'Erro ao processar arquivos e dados do evento: ' + error.message });
    }
});



router.get('/:nomeURL/listArquivos', async(req,res)=>{
    const listaArquivos = await Arquivos.findAll()
    res.json(listaArquivos)
});
   


module.exports = router;

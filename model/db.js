const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('teste', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

const Instituicoes = sequelize.define('Instituicoes', {
  nome: { type: DataTypes.STRING, allowNull: false },
  cnpj: { type: DataTypes.STRING, allowNull: false }
});

const UserProfile = sequelize.define('UserProfile', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  senha: { type: DataTypes.STRING, allowNull: false },
  nome: { type: DataTypes.STRING, allowNull: false },
  cpf: { type: DataTypes.STRING, allowNull: true },
  validado: { type: DataTypes.BOOLEAN, allowNull: false }
}, {
  timestamps: false
});

const Cargo = sequelize.define('Cargo', {
  cargo: { type: DataTypes.ENUM('Avaliador', 'Editor Chefe', 'Convidado', 'Chair', 'Organizador', 'Autor', 'Ouvinte'), allowNull: false, unique: true }
}, {
  timestamps: false
});

const UserCargo = sequelize.define('UserCargo', {
  idUserProfiles: {
    type: DataTypes.INTEGER,
    references: {
      model: UserProfile,
      key: 'id'
    }
  }, //oia, aqui você tá fazendo as relaçoes por FK; se fala qual o id q tá relacionando e e depois suas propriedades, além do model q você tá chamando
  idCargo: {
    type: DataTypes.INTEGER,
    references: {
      model: Cargo,
      key: 'id'
    }
  }
}, {
  timestamps: false
});


const Token = sequelize.define('Token', {
  token: { type: DataTypes.STRING, allowNull: false },
  idUserProfiles: { type: DataTypes.INTEGER, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false }
}, {
  timestamps: false
});


const EditorChefes = sequelize.define('EditorChefes', {
  idInstituicao: {
    type: DataTypes.INTEGER,
    references: {
      model: Instituicoes,
      key: 'id'
    }
  },
    idUserProfiles: {
      type: DataTypes.INTEGER,
      references: {
        model: UserProfile,
        key: 'id',
      },
      unique: true
    },
    linkLattes: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false }
});

const Eventos = sequelize.define('Eventos', {
  idEditorChefes: {
    type: DataTypes.INTEGER,
    references: {
      model: EditorChefes,
      key: 'id'
    }
  },
  nome: { type: DataTypes.STRING, allowNull: false },
  nomeURL: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: false },
  assuntoPrincipal: { type: DataTypes.STRING, allowNull: false },
  emailEvento: { type: DataTypes.STRING, allowNull: false },
  dataInicio: { type: DataTypes.DATE, allowNull: true },
  dataFinal: { type: DataTypes.DATE, allowNull: true },
  horarioInicio: { type: DataTypes.TIME, allowNull: true },
  horarioFinal: { type: DataTypes.TIME, allowNull: true },
  manha: { type: DataTypes.BOOLEAN, allowNull: true },
  tarde: { type: DataTypes.BOOLEAN, allowNull: true },
  noite: { type: DataTypes.BOOLEAN, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: true },
  publico: { type: DataTypes.BOOLEAN, allowNull: false },
  formato: { type: DataTypes.STRING, allowNull: false },
  proceedings: { type: DataTypes.BOOLEAN, allowNull: false },
  certificados: { type: DataTypes.BOOLEAN, allowNull: false },
  logo: { type: DataTypes.STRING, allowNull: true },
  inicioSubmissao: { type: DataTypes.DATE, allowNull: true },
  finalSubmissao: { type: DataTypes.DATE, allowNull: true },
  inicioAvaliacao: { type: DataTypes.DATE, allowNull: true },
  finalAvaliacao: { type: DataTypes.DATE, allowNull: true },
  limiteArquivosAutores: { type: DataTypes.INTEGER, allowNull: true },
  limiteAutores: { type: DataTypes.INTEGER, allowNull: true },
  limiteAvaliadores: { type: DataTypes.INTEGER, allowNull: true },
  modeloApresentacao: { type: DataTypes.STRING, allowNull: true}
});


const Ouvintes = sequelize.define('Ouvintes', {
  idUserProfiles: {
    type: DataTypes.INTEGER,
    references: {
      model: UserProfile,
      key: 'id'
    }
  },
  idInstituicao: {
    type: DataTypes.INTEGER,
    references: {
      model: Instituicoes,
      key: 'id'
    }
  },
  curso: { type: DataTypes.STRING, allowNull: false },
  periodo: { type: DataTypes.STRING, allowNull: false },
  presenca: { type: DataTypes.BOOLEAN, allowNull: false }
});

const Convidados = sequelize.define('Convidados', {
  idUserProfiles: {
    type: DataTypes.INTEGER,
    references: {
      model: UserProfile,
      key: 'id'
    }
  },
  funcao: { type: DataTypes.STRING, allowNull: false },
  tempoNecessario: { type: DataTypes.STRING, allowNull: false },
  periodo: { type: DataTypes.STRING, allowNull: false }
});

const Autores = sequelize.define('Autores', {
  idUserProfiles: {
    type: DataTypes.INTEGER,
    references: {
      model: UserProfile,
      key: 'id'
    }
  },
    idInstituicao: {
      type: DataTypes.INTEGER,
      references: {
        model: Instituicoes,
        key: 'id'
      }
    },
      periodo: { type: DataTypes.STRING, allowNull: false },
      apresentador: { type: DataTypes.BOOLEAN, allowNull: false },
      presenca: { type: DataTypes.BOOLEAN, allowNull: false },
      curso: { type: DataTypes.STRING, allowNull: false }
});

const Avaliadores = sequelize.define('Avaliadores', {
  idUserProfiles: {
    type: DataTypes.INTEGER,
    references: {
      model: UserProfile,
      key: 'id'
    }
  },
  idInstituicao: {
    type: DataTypes.INTEGER,
    references: {
      model: Instituicoes,
      key: 'id'
    }
  },
  linkLattes: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false }
});

const Comissoes = sequelize.define('Comissoes', {
  idInstituicao: {
    type: DataTypes.INTEGER,
    references: {
      model: Instituicoes,
      key: 'id'
    }
  },
  idUserProfiles: {
    type: DataTypes.INTEGER,
    references: {
      model: UserProfile,
      key: 'id'
    }
  },
  idEventos: {
    type: DataTypes.INTEGER,
    references: {
      model: Eventos,
      key: 'id'
    }
  },
  linkLattes: { type: DataTypes.STRING, allowNull: false },
  periodo: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  organizador: { type: DataTypes.BOOLEAN, allowNull: false },
  chair: { type: DataTypes.BOOLEAN, allowNull: false }
});

const GrandeAreas = sequelize.define('GrandeAreas', {
  nome: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.STRING, allowNull: false }
});

const Areas = sequelize.define('Areas', {
  idGrandeAreas: {
    type: DataTypes.INTEGER,
    references: {
      model: GrandeAreas,
      key: 'id'
    }
  },
  nome: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.STRING, allowNull: false }
});

const subAreas = sequelize.define('subAreas', {
  idAreas: {
    type: DataTypes.INTEGER,
    references: {
      model: Areas,
      key: 'id'
    }
  },
  nome: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.STRING, allowNull: false }
});

const AvaliadorSubAreas = sequelize.define('AvaliadorSubAreas', {
  idAvaliadores: {
    type: DataTypes.INTEGER,
    references: {
      model: Avaliadores,
      key: 'id'
    }
  },
  idSubAreas: {
    type: DataTypes.INTEGER,
    references: {
      model: subAreas,
      key: 'id'
    }
  }
});

const Especialidades = sequelize.define('Especialidades', {
  idSubAreas: {
    type: DataTypes.INTEGER,
    references: {
      model: subAreas,
      key: 'id'
    }
  },
  nome: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.STRING, allowNull: false }
});


const CorpoEditoriais = sequelize.define('CorpoEditoriais', {
  nome : { type: DataTypes.STRING, allowNull: false }
});

const CorpoEditorialEventos = sequelize.define('CorpoEditorialEventos', {
  idEventos: {
    type: DataTypes.INTEGER,
    references: {
      model: Eventos,
      key: 'id'
    }
  },
  idCorpoEditoriais: {
    type: DataTypes.INTEGER,
    references: {
      model: CorpoEditoriais,
      key: 'id'
    }
  }
});

const Apoiadores = sequelize.define('Apoiadores', {
  nome: { type: DataTypes.STRING, allowNull: false },
});

const EventApoiadores = sequelize.define('EventApoiadores', {
  idEventos: {
    type: DataTypes.INTEGER,
    references: {
      model: Eventos,
      key: 'id'
    }
  },
  idApoiadores: {
    type: DataTypes.INTEGER,
    references: {
      model: Apoiadores,
      key: 'id'
    }
  }
});

const Onlines = sequelize.define('Onlines', {
  idEventos: {
    type: DataTypes.INTEGER,
    references: {
      model: Eventos,
      key: 'id'
    }
  },
  link: { type: DataTypes.STRING, allowNull: false }
});

const Presenciais = sequelize.define('Presenciais', {
  idEventos: {
    type: DataTypes.INTEGER,
    references: {
      model: Eventos,
      key: 'id'
    }
  },
  cep : { type: DataTypes.STRING, allowNull: false },
  estado : { type: DataTypes.STRING, allowNull: false },
  local : { type: DataTypes.STRING, allowNull: false },
  cidade : { type: DataTypes.STRING, allowNull: false }
});


const CategoriaArquivos = sequelize.define('CategoriasArquivos', {
  nome: { type: DataTypes.STRING, allowNull: true },
  descricao: { type: DataTypes.STRING, allowNull: true }
});

const Arquivos = sequelize.define('Arquivos', {
  idEventos: {
    type: DataTypes.INTEGER,
    references: {
      model: Eventos,
      key: 'id'
    }
  },
  idCategoriaArquivos: {
    type: DataTypes.INTEGER,
    references: {
      model: CategoriaArquivos,
      key: 'id'
    }
  },
  normasPublicacaos: { type: DataTypes.STRING, allowNull: true },
  modeloArquivo: { type: DataTypes.STRING, allowNull: true },
  apresentacao : { type: DataTypes.BOOLEAN, allowNull: true },
  avalicao: { type: DataTypes.BOOLEAN, allowNull: true },
  reenvio: { type: DataTypes.BOOLEAN, allowNull: true }
});

UserProfile.belongsToMany(Cargo, { through: UserCargo, foreignKey: 'idUserProfiles' });
Cargo.belongsToMany(UserProfile, { through: UserCargo, foreignKey: 'idCargo' });


sequelize.sync();

// Não esqueçam
module.exports = { UserProfile, Cargo, Token, UserCargo, Instituicoes, EditorChefes, Eventos, Ouvintes, Areas, subAreas, GrandeAreas, AvaliadorSubAreas, Especialidades, CorpoEditoriais, CorpoEditorialEventos, Apoiadores, EventApoiadores, Onlines, Presenciais, CategoriaArquivos, Arquivos, Convidados, Autores, Comissoes, Avaliadores, sequelize };

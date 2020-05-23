
const mongoose = require('mongoose');

const { Schema } = mongoose;

const SchemaTabela = new Schema({
  decricao: {
    type: String,
    required: 'Descrição é obrigatório',
  },
  administradorGrupoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
  },
  participantes: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('GrupoApostador', SchemaTabela);

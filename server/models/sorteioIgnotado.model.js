
const mongoose = require('mongoose');

const { Schema } = mongoose;

const SchemaTabela = new Schema({
  concurso: {
    type: Number,
    required: 'concurso obrigatório',
  },
  modalidadeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Modalidade',
    required: 'Modalidade obrigatório',
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: 'Usuário do Lançamento obrigatório',
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
SchemaTabela.index({ concurso: 1, modalidadeId: 1, usuarioId: 1 });
SchemaTabela.index({ concurso: 1 });
SchemaTabela.index({ modalidadeId: 1 });
SchemaTabela.index({ usuarioId: 1 });
module.exports = mongoose.model('SorteioIgnorado', SchemaTabela);


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
  jogos: {
    type: [{
      dezenas: {
        type: [String],
        required: 'resultado obrigatório',
      },
      cota: Number,
      cotas: Number,
      acertos: Number,
    }],
  },
  cotas: {
    type: Number,
    default: 1,
  },
  totalCotas: {
    type: Number,
    default: 1,
  },
  usuarioCotaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: 'Usuário da Cota obrigatório',
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: 'Usuário do Lançamento obrigatório',
  },
  conferido: {
    type: Boolean,
    default: false,
  },
  dtConferencia: {
    type: Date,
  },
  bolaoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bolao',
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
SchemaTabela.index({ concurso: 1, modalidadeId: 1 });
SchemaTabela.index({ concurso: 1 });
SchemaTabela.index({ modalidadeId: 1 });
SchemaTabela.index({ conferido: 1 });
module.exports = mongoose.model('Aposta', SchemaTabela);


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
        type: [Number],
        required: 'dezenas obrigatórias',
      },
      cota: {
        type: Number,
        default: 1,
      },
      cotas: {
        type: Number,
        default: 1,
      },
      acertos: Number,
      dezenasConferidas: {
        type: [Number],
      },
      acertosFaixa: {
        type: [{
          faixa: Number,
          acertos: Number,
          valor: Number,
        }],
      },
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
  vlCustoAposta: {
    type: Number,
    default: 0,
  },
  vlPremiado: {
    type: Number,
    default: 0,
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

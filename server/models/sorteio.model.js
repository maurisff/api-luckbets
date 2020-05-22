
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
  },
  apuracao: {
    type: Date,
    required: 'apuracao obrigatória',
  },
  resultado: {
    type: [String],
    required: 'resultado obrigatório',
  },
  resultado2: {
    type: String,
  },
  premiacao: {
    type: [{
      faixa: Number,
      dezenas: Number,
      ganhadores: Number,
      valor: Number,
    }],
  },
  proximoConcurso: {
    type: Number,
  },
  proximaApuracao: {
    type: Date,
  },
  valorPrevisto: {
    type: Number,
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
SchemaTabela.index({ concurso: 1, modalidadeId: 1 }, { unique: true });
module.exports = mongoose.model('Sorteio', SchemaTabela);

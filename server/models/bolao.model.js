
const mongoose = require('mongoose');

const { Schema } = mongoose;

const SchemaTabela = new Schema({
  modalidadeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Modalidade',
  },
  concurso: {
    type: Number,
    required: 'Concurso obrigatório',
  },
  concursoFinal: {
    type: Number,
  },
  participantes: {
    type: [{
      participante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
      },
      quota: Number,
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
module.exports = mongoose.model('Bolao', SchemaTabela);

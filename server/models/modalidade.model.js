
const mongoose = require('mongoose');

const { Schema } = mongoose;

const SchemaTabela = new Schema({
  codigo: {
    type: String,
    required: 'Código obrigatório',
    uppercase: true,
    trim: true,
  },
  titulo: {
    type: String,
    required: 'titulo é Obrigatória',
  },
  ultimoConcurso: {
    type: Number,
  },
  ultimaApuracao: {
    type: Date,
  },
  proximoConcurso: {
    type: Number,
  },
  proximaApuracao: {
    type: Date,
  },
  url: {
    type: String,
  },
  dezenas: {
    type: Number,
    required: 'dezenas é Obrigatória',
  },
  minDezenas: {
    type: Number,
    required: 'minDezenas é Obrigatória',
  },
  maxDezenas: {
    type: Number,
    required: 'maxDezenas é Obrigatória',
  },
  valorApostaMinima: {
    type: Number,
    required: 'maxDezenas é Obrigatória',
  },
  teimozinha: {
    type: [Number],
    required: 'teimozinha é Obrigatória',
  },
  faixaPremio: {
    type: [{
      faixa: { type: Number, required: 'Faixa Premiaçao "faixa" obrigatória' },
      dezenas: { type: Number, required: 'Faixa Premiaçao "dezenas" obrigatória' },
      propGanhadoresFaixa: { type: String, required: 'Faixa Premiaçao Property "propGanhadoresFaixa" obrigatória' },
      propValorFaixa: { type: String, required: 'Faixa Premiaçao Property "propValorFaixa" obrigatória' },
    }],
    required: 'Faixa de Prêmio é Obrigatória',
  },
  propriedades: {
    concurso: { type: String, required: 'Property "concurso" obrigatória' },
    dataConcurso: { type: String, required: 'Property "dataConcurso" obrigatória' },
    resultado: { type: String, required: 'Property "resultado" obrigatória' },
    dataProximo: { type: String, required: 'Property "dataProximo" obrigatória' },
    valorPrevisto: { type: String, required: 'Property "valorPrevisto" obrigatória' },
  },
  style: {
    corTitulo: String,
    corBGDezena: String,
    corTxtDezena: String,
    corDefaulBGDezena: String,
    corDefaulTxtDezena: String,
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
SchemaTabela.index({ codigo: 1 }, { unique: true });
module.exports = mongoose.model('Modalidade', SchemaTabela);

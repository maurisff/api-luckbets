
const mongoose = require('mongoose');

const Model = mongoose.model('Sorteio');

exports.create = async (data) => new Model(data).save();

exports.update = async (id, data) => Model.findOneAndUpdate({ _id: id }, data, { new: true });

exports.delete = async (id) => Model.remove({ _id: id });

exports.get = async (id) => Model.findById(id);

exports.getByUID = async (uid) => Model.findOne({ uid });

exports.getOne = async (filter) => Model.findOne(filter);

exports.listarTodos = async () => Model.find({});

exports.listarByFilter = async (filter) => Model.find(filter);

exports.countByFilter = async (filter) => Model.countDocuments(filter);

exports.selectByFilter = async (fields = null, filter = null) => Model.find((filter || {})).select((fields || {}));

exports.ultimoResultado = async (modalidadeId) => Model.find({ modalidadeId })
  .select('-_id -premiacao._id -__v -updateAt -createdAt')
  .populate({
    path: 'modalidadeId',
    select: 'codigo titulo valorApostaMinima style -_id',
  })
  .sort({ concurso: -1 })
  .limit(1);

exports.resultadoModalidade = async (modalidadeId, { filter = {}, limit = 0, skip = 0 }) => Model.find({ modalidadeId })
  .find(filter)
  .select('-_id -premiacao._id -__v -updateAt -createdAt')
  .populate({
    path: 'modalidadeId',
    select: '-_id -propriedades -url -faixaPremio._id -faixaPremio.propGanhadoresFaixa -faixaPremio.propValorFaixa -__v -updateAt -createdAt -proximaApuracao -proximoConcurso -ultimaApuracao -ultimoConcurso',
  })
  .sort({ concurso: -1 })
  .skip(skip)
  .limit(limit);

exports.validFilter = async (filter) => {
  await Object.keys(filter).forEach(async (fl) => {
    if (await Object.keys(Model.schema.obj).indexOf(fl) === -1) {
      throw new Error(`Filtro (${fl}) inválido para consulta.`);
    }
  });
};

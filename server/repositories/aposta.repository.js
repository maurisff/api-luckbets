
const mongoose = require('mongoose');

const Model = mongoose.model('Aposta');

exports.create = async (data) => new Model(data).save();

exports.update = async (id, data) => Model.findOneAndUpdate({ _id: id }, data, { new: true });

exports.delete = async (id) => Model.remove({ _id: id });

exports.get = async (id) => Model.findById(id);

exports.getByUID = async (uid) => Model.findOne({ uid });

exports.getOne = async (filter) => Model.findOne(filter);

exports.listarTodos = async () => Model.find({});

exports.listarByFilter = async (filter) => Model.find(filter);

exports.countByFilter = async (modalidadeId, usuarioCotaId, filter) => Model.countDocuments({ modalidadeId, usuarioCotaId, ...filter });

exports.selectByFilter = async (fields = null, filter = null) => Model.find((filter || {})).select((fields || {}));

exports.apostasUsuario = async (modalidadeId, usuarioCotaId, { filter = {}, limit = 0, skip = 0 }) => Model.find({ modalidadeId, usuarioCotaId, ...filter })
  .select('-__v -updateAt')
  .populate({
    path: 'modalidadeId',
    select: '-_id -propriedades -teimosinha -url -faixaPremio._id -faixaPremio.propGanhadoresFaixa -faixaPremio.propValorFaixa -__v -updateAt -createdAt -proximaApuracao -proximoConcurso -ultimaApuracao -ultimoConcurso',
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

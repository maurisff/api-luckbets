
const mongoose = require('mongoose');

const Model = mongoose.model('Bolao');

exports.create = async (data) => new Model(data).save();

exports.update = async (id, data) => Model.findOneAndUpdate({ _id: id }, data, { new: true });

exports.delete = async (id) => Model.remove({ _id: id });

exports.get = async (id) => Model.findById(id);

exports.getOne = async (filter) => Model.findOne(filter);

exports.listarTodos = async () => Model.find({});

exports.listarByFilter = async (filter) => Model.find(filter);

exports.countByFilter = async (filter) => Model.countDocuments(filter);

exports.selectByFilter = async (fields = null, filter = null) => Model.find((filter || {})).select((fields || {}));

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const repository = require('../repositories/modalidade.repository');
const ResponseInfor = require('../util/ResponseInfo');

exports.update = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, 'Id do Objeto não foi informado.'));
    } else if (!req.body) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (modalidade) não foi informado.'));
    } else if (!(typeof req.body === 'object')) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (modalidade) não é um objeto validado'));
    } else {
      const modalidade = await repository.update(req.params.id, req.body);
      if (modalidade) {
        res.status(200).json(new ResponseInfor(true, modalidade));
      } else {
        res.status(200).json(new ResponseInfor(false, `Objeto (modalidade), id (${req.params.id}) não encontrato ou não atualizado.`));
      }
    }
  } catch (error) {
    console.error('modalidade.controller.update: ', error);
    res.status(200).json(new ResponseInfor(false, error));
  }
};

exports.list = async (req, res) => {
  try {
    let modalidades = [];
    if (req.query && Object.keys(req.query).length > 0) {
      modalidades = await repository.listarByFilter(req.query);
    } else {
      modalidades = await repository.listarTodos();
    }
    res.status(200).json(new ResponseInfor(true, modalidades));
  } catch (error) {
    res.status(200).json(new ResponseInfor(false, error));
  }
};

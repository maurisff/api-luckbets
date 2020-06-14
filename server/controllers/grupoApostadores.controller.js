const repository = require('../repositories/grupoApostadores.repository');
const ResponseInfor = require('../util/ResponseInfo');

exports.create = async (req, res) => {
  try {
    if (!req.body) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (Dados) não foi informado!'));
    } else if (!(typeof req.body === 'object')) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (Dados) não é um objeto validado'));
    } else {
      const data = await repository.create(req.body);
      res.status(200).json(new ResponseInfor(true, data));
    }
  } catch (error) {
    res.status(500).json(new ResponseInfor(false, error.message));
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, 'Id do Objeto (Dados) não foi informado.'));
    } else if (!req.body) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (Dados) não foi informado.'));
    } else if (!(typeof req.body === 'object')) {
      res.status(200).json(new ResponseInfor(false, 'Objeto (Dados) não é um objeto validado'));
    } else {
      const data = await repository.update(req.params.id, req.body);
      if (data) {
        res.status(200).json(new ResponseInfor(true, data));
      } else {
        res.status(200).json(new ResponseInfor(false, `Objeto (Dados), id (${req.params.id}) não encontrato ou não atualizado.`));
      }
    }
  } catch (error) {
    res.status(500).json(new ResponseInfor(false, error.message));
  }
};

exports.get = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, 'Id do Objeto não foi informado.'));
    } else {
      const data = await repository.get(req.params.id);
      if (data) {
        res.status(200).json(new ResponseInfor(true, data));
      } else {
        res.status(200).json(new ResponseInfor(false, `Objeto, id (${req.params.id}) não encontrato`));
      }
    }
  } catch (error) {
    res.status(500).json(new ResponseInfor(false, error.message));
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfor(false, 'Id do Objeto não foi informado.'));
    } else {
      await repository.delete(req.params.id);
      res.status(200).json(new ResponseInfor(true, `Id (${req.params.id}) Excluido com sucesso.`));
    }
  } catch (error) {
    res.status(500).json(new ResponseInfor(false, error.message));
  }
};

exports.list = async (req, res) => {
  try {
    let result = [];
    if (req.query && Object.keys(req.query).length > 0) {
      result = await repository.listarByFilter(req.query);
    } else {
      result = await repository.listarTodos();
    }
    res.status(200).json(new ResponseInfor(true, result));
  } catch (error) {
    res.status(500).json(new ResponseInfor(false, error.message));
  }
};

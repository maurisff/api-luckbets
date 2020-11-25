/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */

const repository = require('../repositories/usuario.repository');
const modalidadeRepository = require('../repositories/modalidade.repository');
const sorteioIgnoradoRepository = require('../repositories/sorteioIgnorado.repository');
const firebaseHelper = require('../helper/firebase');
const ResponseInfor = require('../util/ResponseInfo');


exports.sendNotification = async (req, res) => {
  try {
    const { id, uid, message } = req.body;
    let usuario = null;
    if (id) {
      usuario = await repository.get(id);
    } else {
      usuario = await repository.getByUID(uid);
    }
    if (usuario && usuario._id) {
      setTimeout(() => {
        firebaseHelper.sendNotificationToUser(usuario._id, message);
      }, 3000);
    }
    res.status(200).json(new ResponseInfor(true, 'Mensagem enviada!'));
  } catch (error) {
    console.error('sendNotification - Error: ', error);
    res.status(400).json(new ResponseInfor(false, error.message));
  }
};


exports.ignorarSorteio = async (req, res) => {
  try {
    const { modalidade = '', concurso, usuarioId } = req.params;
    const modalidadeData = await modalidadeRepository.getOne({ codigo: modalidade.toUpperCase() });
    const modalidadeId = modalidadeData ? modalidadeData._id : null;
    const countIgnorados = await sorteioIgnoradoRepository.countIgnorados(modalidadeId, usuarioId, concurso);
    if (usuarioId && modalidadeId && concurso && Number(countIgnorados) === 0) {
      await sorteioIgnoradoRepository.create({ modalidadeId, usuarioId, concurso });
    }
    res.status(200).json(new ResponseInfor(true, 'Sucesso!'));
  } catch (error) {
    console.error('ignorarSorteio - Error: ', error);
    res.status(400).json(new ResponseInfor(false, error.message));
  }
};

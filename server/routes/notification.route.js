module.exports = (app) => {
  const controller = require('../controllers/notificationController');
  app.route('/notification/send')
    .post(controller.sendNotification);

  app.route('/notification/ignorar-sorteio/:modalidade/:concurso/:usuarioId')
    .post(controller.ignorarSorteio);
};

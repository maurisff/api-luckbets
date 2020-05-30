
module.exports = (app) => {
  const controller = require('../controllers/aposta.controller');

  app.route('/aposta')
    .post(controller.create);

  app.route('/aposta/:id')
    .get(controller.get)
    .delete(controller.delete);


  app.route('/aposta/:codigo/resultado')
    .get(controller.list);
};


module.exports = (app) => {
  const controller = require('../controllers/grupoApostadores.controller');
  app.route('/grupoapostadores')
    .get(controller.list)
    .post(controller.create);

  app.route('/grupoapostadores/:id')
    .get(controller.get)
    .put(controller.update)
    .delete(controller.delete);
};

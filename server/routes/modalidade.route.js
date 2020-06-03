
module.exports = (app) => {
  const controller = require('../controllers/modalidade.controller');
  app.route('/modalidade')
    .get(controller.list);

  app.route('/administracao/modalidade/:id')
    .put(controller.update);
};

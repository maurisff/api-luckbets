
module.exports = (app) => {
  const controller = require('../controllers/aposta.controller');

  app.route('/aposta')
    .post(controller.create);
};

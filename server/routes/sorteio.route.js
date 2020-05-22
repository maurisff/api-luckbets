
module.exports = (app) => {
  const sorteioController = require('../controllers/sorteio.controller');
  app.route('/sorteios/resultados')
    .get(sorteioController.list);

  app.route('/sorteios/semresultado')
    .get(sorteioController.semSorteio);

  app.route('/sorteios/buscaresultado')
    .post(sorteioController.postVerificaSorteio);
};

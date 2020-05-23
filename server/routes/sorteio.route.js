
module.exports = (app) => {
  const sorteioController = require('../controllers/sorteio.controller');
  app.route('/sorteios/ultimosresultados')
    .get(sorteioController.ultimosResultados);

  app.route('/sorteios/:codigo/resultado')
    .get(sorteioController.resultadoModalidade);

  app.route('/administracao/sorteios/semresultado')
    .get(sorteioController.semSorteio);

  app.route('/administracao/sorteios/buscaresultado')
    .post(sorteioController.postVerificaSorteio);
};

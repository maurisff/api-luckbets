const consultaSorteios = require('./consultarSorteio');
const notificacaoSorteio = require('./notificacaoSorteio');

module.exports = {
  async start() {
    console.log('inicializando serviços em segundo planos...');
    await consultaSorteios.start();
    await notificacaoSorteio.start();
  },
};

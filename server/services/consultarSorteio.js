/* eslint-disable no-restricted-globals */
/* eslint-disable no-use-before-define */
/* eslint-disable linebreak-style */
const { CronJob } = require('cron');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const controller = require('../controllers/sorteio.controller');


const ModalidadeModel = mongoose.model('Modalidade');
const tzLog = process.env.TZSERVER || 'America/Sao_Paulo';

module.exports = {
  async start() {
    console.log('inicializando consulta de sorteios...');
    const modalidades = await ModalidadeModel.find();
    if (modalidades && modalidades.length > 0) {
      let delay = 1;
      await global.util.asyncForEach(modalidades, async (doc) => {
        await schedulerModalidade(doc, delay);
        delay++;
      });
    }
  },
};

async function schedulerModalidade(modalidade, delay = 1) {
  setTimeout(() => {
    verificaSorteio(modalidade._id);
  }, (3000 * delay));
  // Test expression: https://cronjob.xyz/
  const cronTime = (process.env.TIME_SCHEDULER_SORTEIO ? process.env.TIME_SCHEDULER_SORTEIO : '*/30 20-23 * * 1-6'); // default cada 30 minutos, das 20 hrs até as 23:59, de segunda a sabado
  // ================================================================================================================================
  const scheduler = new CronJob(cronTime, (() => {
    try {
      setTimeout(() => {
        verificaSorteio(modalidade._id);
      }, (3000 * delay));
    } catch (error) {
      console.error(`${moment().tz(tzLog).format()} - Execution schedulerModalidade (${modalidade.codigo}). Error: `, error);
    }
  }), null, true, tzLog);
  scheduler.start();
  console.log(`Started schedulerModalidade (${modalidade.codigo})!`);
}

async function verificaSorteio(id) {
  const modadidade = await ModalidadeModel.findById(id);
  if (!modadidade) {
    return;
  }
  if (!modadidade.proximaApuracao || moment().tz(tzLog).isSameOrAfter(moment(modadidade.proximaApuracao).tz(tzLog), 'day')) {
    // console.log(`${moment().tz(tzLog).format('DD/MM/YYYY HH:mm:ss')} - Consultando sorteio Modalidade "${modadidade.codigo}"...`);
    try {
      await controller.consultaSorteio(modadidade._id, { auto: true });
    } catch (error) {
      console.error(`${moment().tz(tzLog).format('DD/MM/YYYY HH:mm:ss')} - Consultando sorteio Modalidade "${modadidade.codigo}". Erro: `, error);
      console.log('===================================================================================================================================');
    }
  }
}

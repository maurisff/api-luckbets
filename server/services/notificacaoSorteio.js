/* eslint-disable no-restricted-globals */
/* eslint-disable no-use-before-define */
/* eslint-disable linebreak-style */
const { CronJob } = require('cron');
// const mongoose = require('mongoose');
const moment = require('moment-timezone');
// const controller = require('../controllers/sorteio.controller');

const tzLog = process.env.TZSERVER || 'America/Sao_Paulo';

module.exports = {
  async start() {
    console.log('inicializando notificação de sorteios...');
    await schedulerAviso();
  },
};

async function schedulerAviso() {
  // Test expression: https://cronjob.xyz/
  const cronTime = (process.env.TIME_SCHEDULER_AVISOSORTEIO ? process.env.TIME_SCHEDULER_AVISOSORTEIO : '0 08,18 * * 1-6'); // default 1 vez as 08 e as 18 horas de segunda a sabado
  // ================================================================================================================================
  const scheduller = new CronJob(cronTime, (() => {
    try {
      notificaUsuarios();
    } catch (error) {
      console.error(`${moment().tz(tzLog).format()} - Execution schedulerAviso. Error: `, error);
    }
  }), null, true, tzLog);
  scheduller.start();
  console.log('Started schedulerAviso!');
}

async function notificaUsuarios() {
  console.log(`${moment().tz(tzLog).format('DD/MM/YYYY HH:mm:ss')} - Notificando usuarios de sorteios...`);
  try {
    // await controller.consultaSorteio(modadidade._id, { auto: true });
  } catch (error) {
    console.error(`${moment().tz(tzLog).format('DD/MM/YYYY HH:mm:ss')} - Notificando usuarios de sorteios. Erro: `, error);
    console.log('===================================================================================================================================');
  }
}

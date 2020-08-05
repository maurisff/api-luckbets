/* eslint-disable no-restricted-globals */
/* eslint-disable no-use-before-define */
/* eslint-disable linebreak-style */
const { CronJob } = require('cron');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const firebaseHelper = require('../helper/firebase');
const sorteioRepository = require('../repositories/sorteio.repository');
const apostaRepository = require('../repositories/aposta.repository');

const ModalidadeModel = mongoose.model('Modalidade');
const UsuarioModel = mongoose.model('Usuario');
const tzLog = process.env.TZSERVER || 'America/Sao_Paulo';


async function notificaUsuarios(modalidade, concurso) {
  // console.log(`${moment().tz(tzLog).format('DD/MM/YYYY HH:mm:ss')} - Notificando usuarios de sorteios...`);
  try {
    if (!modalidade) {
      return;
    }
    const usuarios = await UsuarioModel.find({ notificaSorteio: { $elemMatch: { $eq: modalidade.codigo } } });
    if (!usuarios || usuarios.length === 0) {
      return;
    }
    const usuariosFiltrados = [];
    await global.util.asyncForEach(usuarios, async (u) => {
      const count = await apostaRepository.countByFilter(modalidade._id, u._id, { concurso });
      // criar regra pra validar se o usuario optou pela ação de não jogar hoje.
      if (count === 0) {
        usuariosFiltrados.push(u);
      }
    });

    if (!usuariosFiltrados || usuariosFiltrados.length === 0) {
      return;
    }

    const notificacoes = usuariosFiltrados.map((u) => ({
      usuarioId: u._id,
      notification: {
        title: 'Hoje tem Sorteio!',
        body: `Olá ${(u.nome ? u.nome.split(' ')[0] : u.email)}, Hoje tem sorteio do concurso ${concurso} da ${modalidade.titulo}.\nNão se esqueça de fazer sua aposta!`,
        icon: `${modalidade.codigo.toLowerCase()}.png`,
        /** Implemenatr action para ignorar proxima notificações. */
      },
    }));

    notificacoes.forEach(async (el) => {
      await firebaseHelper.sendNotificationToUser(el.usuarioId, el.notification);
    });
  } catch (error) {
    console.error(`${moment().tz(tzLog).format('DD/MM/YYYY HH:mm:ss')} - Notificando usuarios de sorteios. Erro: `, error);
    console.log('===================================================================================================================================');
  }
}


async function verificaSorteioModalidade(modalidade) {
  // console.log(`${moment().tz(tzLog).format('DD/MM/YYYY HH:mm:ss')} - Verificando sorteios da modalidade ${modalidade.codigo}...`);
  try {
    if (!modalidade) {
      return;
    }
    const sorteio = await sorteioRepository.ultimoResultado(modalidade._id);
    if (!sorteio) {
      return;
    }

    if (sorteio.proximaApuracao && moment().tz(tzLog).isSameOrAfter(moment(sorteio.proximaApuracao).tz(tzLog), 'day')) {
      notificaUsuarios(modalidade, sorteio.proximoConcurso);
    }
  } catch (error) {
    console.error(`${moment().tz(tzLog).format('DD/MM/YYYY HH:mm:ss')} - Verificando sorteios da modalidade ${modalidade.codigo}. Erro: `, error.message);
    console.log('===================================================================================================================================');
  }
}


async function schedulerAviso(modalidade) {
  // await verificaSorteioModalidade(modalidade);
  // Test expression: https://cronjob.xyz/
  const cronTime = (process.env.TIME_SCHEDULER_AVISOSORTEIO ? process.env.TIME_SCHEDULER_AVISOSORTEIO : '0 08,18 * * 1-6'); // default 1 vez as 08 e as 18 horas de segunda a sabado
  // ================================================================================================================================
  const scheduller = new CronJob(cronTime, (() => {
    try {
      verificaSorteioModalidade(modalidade);
    } catch (error) {
      console.error(`${moment().tz(tzLog).format()} - Execution schedulerAviso. Error: `, error);
    }
  }), null, true, tzLog);
  scheduller.start();
  // console.log('Started schedulerAviso!');
}


module.exports = {
  async start() {
    console.log('inicializando notificação de sorteios...');
    const modalidades = await ModalidadeModel.find();
    if (modalidades && modalidades.length > 0) {
      await global.util.asyncForEach(modalidades, async (doc) => {
        await schedulerAviso(doc);
      });
    }
  },
};

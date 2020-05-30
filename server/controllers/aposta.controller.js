/* eslint-disable radix */

const firebaseHelper = require('../helper/firebase');
const emailHelper = require('../helper/emailHelper');
const modalidadeRepository = require('../repositories/modalidade.repository');
const sorteioRepository = require('../repositories/sorteio.repository');
const apostaRepository = require('../repositories/aposta.repository');
const bolaoRepository = require('../repositories/bolao.repository');
const usuarioRepository = require('../repositories/usuario.repository');
const ResponseInfo = require('../util/ResponseInfo');
const globalEvents = require('../helper/globalEvents');


async function eventEmitter(name, event) {
  globalEvents.emit(name, event);
}

async function confereAposta(modalidadeId, apostaId, options = { atualiza: false }) {
  try {
    const { atualiza } = options;
    const modalidade = await modalidadeRepository.get(modalidadeId);
    if (!modalidade) {
      throw new Error(`modalidade não encontrada para o ID (${modalidadeId})`);
    }
    const aposta = await apostaRepository.get(apostaId);
    if (!aposta) {
      throw new Error(`Aposta não encontrada para o ID (${apostaId})`);
    }
    if (aposta.conferido && !atualiza) {
      return;
    }
    const sorteio = await sorteioRepository.getOne({ modalidadeId, concurso: aposta.concurso });
    if (!sorteio) {
      return;
    }
    const { resultado } = sorteio;
    for (let index = 0; index < aposta.jogos.length; index++) {
      const jogo = aposta.jogos[index];
      const qtDezenas = jogo.dezenas.length;
      jogo.dezenasConferidas = jogo.dezenas.filter((d) => resultado.indexOf(d) !== -1);
      jogo.acertos = jogo.dezenasConferidas.length;
      jogo.acertosFaixa = [];

      const faixaPremiacao = modalidade.faixaPremio.find((f) => f.dezenas === jogo.acertos);
      const faixaSorteio = sorteio.premiacao.find((f) => f.dezenas === jogo.acertos);
      if (faixaPremiacao) {
        if (qtDezenas > modalidade.minDezenas && faixaPremiacao.tabelaPremiacao && faixaPremiacao.tabelaPremiacao.length > 0 && faixaSorteio && faixaSorteio.ganhadores > 0) {
          /** mauricio.sff 28/05/2020
           * O calculo da faixa de premio depende da tabela de Acertos disponilizado pela Caixa, que ainda não foi implementado.       *
           */
        } else if (faixaSorteio && faixaSorteio.ganhadores > 0) {
          jogo.acertosFaixa.push({
            faixa: faixaSorteio.faixa,
            acertos: 1,
            valor: ((faixaSorteio.valor / ((jogo.cotas || 0) === 0 ? 1 : jogo.cotas)) * jogo.cota),
          });
        }
      }
      aposta.jogos[index] = jogo;
    }
    // const jogosPremiados = aposta.jogos.map((j) => (j.acertos || 0)).reduce((a, b) => a + b);
    // const jogosPremiados = aposta.jogos.map((j) => (j.acertosFaixa && j.acertosFaixa.length > 0 ? j.acertosFaixa.map((f) => (f.acertos || 0)).reduce((a, b) => a + b) : 0)).reduce((a, b) => a + b) || 0;
    const jogosPremiados = aposta.jogos.map((j) => ((j.acertos && sorteio.premiacao.map((p) => p.dezenas).indexOf(j.acertos) !== -1) ? 1 : 0)).reduce((a, b) => a + b) || 0;
    const valorPremio = aposta.jogos.map((j) => (j.acertosFaixa && j.acertosFaixa.length > 0 ? j.acertosFaixa.map((f) => (f.valor || 0)).reduce((a, b) => a + b) : 0)).reduce((a, b) => a + b) || 0;
    aposta.vlPremiado = ((valorPremio / ((aposta.totalCotas || 0) === 0 ? 1 : aposta.totalCotas)) * aposta.cotas);
    aposta.premiado = ((jogosPremiados || 0) > 0);
    aposta.conferido = true;
    aposta.dtConferencia = new Date();

    await apostaRepository.update(aposta._id, aposta);

    // notification = { title = '', body = '', icon = '', url = '', actions = ''}

    if (aposta.vlPremiado > 0) {
      const notification = {
        title: 'Parabéns!',
        body: `Sua aposta da ${modalidade.titulo} foi premiada. Valor ${(aposta.vlPremiado || 0).toStringPrice()}.\nProcure uma agência da Caixa para verificar o valor exato do seu prêmio!`,
        icon: `${modalidade.codigo.toLowerCase()}.png`,
      };
      firebaseHelper.sendNotificationToUser(aposta.usuarioCotaId, notification);
    } else if (aposta.premiado) {
      const notification = {
        title: 'Parabéns!',
        body: `Sua aposta da ${modalidade.titulo} foi premiada, Valor não confirmado.\nProcure uma agência da Caixa para verificar o valor exato do seu prêmio!`,
        icon: `${modalidade.codigo.toLowerCase()}.png`,
      };
      firebaseHelper.sendNotificationToUser(aposta.usuarioCotaId, notification);
    }
  } catch (error) {
    console.error('confereAposta-Erro: ', error);
  }
}


async function enviaEmailBolao(bolaoId) {
  try {
    const bolao = await bolaoRepository.getBolaoEmail(bolaoId);
    if (!bolao) {
      return;
    }
    console.log('bolao:', bolao);
    console.log('0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
    console.log('bolaoJSON:', JSON.stringify(bolao));
    console.log('Enviando email Bolao ...');
    const modalidade = await modalidadeRepository.get(bolao.modalidadeId);
    if (!modalidade) {
      throw new Error(`modalidade não encontrada para o ID (${bolao.modalidadeId})`);
    }
    const aposta = await apostaRepository.getOne({ bolaoId });
    if (!aposta) {
      throw new Error(`Aposta não encontrada nenhuma aposta para o Bolao com ID (${bolaoId})`);
    }
    const usuarioBolao = await usuarioRepository.get(aposta.usuarioId);
    const Titulo = `Novo Bolão ${modalidade.titulo}`;

    const jogos = aposta.jogos.map((j) => j.dezenas.join('-'));
    const participantes = bolao.participantes.map((p) => ({ cota: p.cota, email: p.participante.email, nome: p.participante.nome })); //  [1, 2, 3, 4]; // busca os participantes do bolado [nome e email]

    let texto = `Olá #PARTICIPANTE#, voçê está participando do bolão da ${modalidade.titulo}!`;
    texto += `\n${bolao.concurso && bolao.concursoFinal && bolao.concurso !== bolao.concursoFinal ? `Concurso: ${bolao.concurso} até ${bolao.concursoFinal}` : `Concurso: ${bolao.concurso}`}`;
    texto += `\nCotas: #COTA# de ${participantes.map((p) => (p.cota || 0)).reduce((a, b) => a + b)}`;
    texto += `\nAdministrado por: ${usuarioBolao.nome && usuarioBolao.email ? `${usuarioBolao.nome} <${usuarioBolao.email}>` : `${usuarioBolao.email}`}`;
    texto += '\nDezenas:';
    texto += `\n${jogos.join('\n')}`;
    texto += '\n\nParticipantes do Bolão:';
    texto += '\n#ARR_PARTICIPANTES#'; // Monta o nome e email do particilante "Nome <email> || email"
    texto += '\n\n\nCruse os dedos e boa sorte!!';


    participantes.forEach(async (participante) => {
      const emailParticipantes = participantes.map((p) => ({ nome: p.nome, email: p.email })).filter((p) => p.email !== participante.email).map((p) => (p.nome && p.email ? `${p.nome} <${p.email}>` : `${p.email}`)); // remove o usuario que vai receber o email

      const body = texto.replace('#PARTICIPANTE#', (participante.nome || 'Participante')).replace('#COTA#', (participante.cota || 1)).replace('#ARR_PARTICIPANTES#', emailParticipantes.join('\n'));
      // config = { from, to, cc, bcc, subject, body, htmlBody }
      const config = {
        from: `${usuarioBolao.nome && usuarioBolao.email ? `"${usuarioBolao.nome}" <${usuarioBolao.email}>` : `${usuarioBolao.email}`}`,
        to: `${participante.nome && participante.email ? `"${participante.nome}" <${participante.email}>` : `${participante.email}`}`,
        subject: Titulo,
        body,
      };
      await emailHelper.sendEmail(config);
    });
  } catch (error) {
    console.error('enviaEmailBolao-Erro: ', error);
  }
}


exports.create = async (req, res) => {
  try {
    if (!req.body) {
      res.status(200).json(new ResponseInfo(false, 'Objeto (Dados) não foi informado!'));
      return;
    }
    if (!(typeof req.body === 'object')) {
      res.status(200).json(new ResponseInfo(false, 'Objeto (Dados) não é um objeto validado'));
      return;
    }
    const concursos = [];
    const participantesBolao = [];
    const {
      modalidade = '', concurso, teimosinha, jogos, bolao = {},
    } = req.body;
    const { participantes } = bolao || {};
    let Bolao = null;
    const Modalidade = await modalidadeRepository.getOne({ codigo: modalidade.toString() });
    if (!Modalidade) {
      res.status(200).json(new ResponseInfo(false, `Modalidade (${modalidade}) não cadastrada!`));
      return;
    }
    if (!concurso) {
      res.status(200).json(new ResponseInfo(false, 'Concurso não informado!'));
      return;
    }
    if (!jogos || !Array.isArray(jogos) || jogos.length === 0) {
      res.status(200).json(new ResponseInfo(false, 'Jogos não informados!'));
      return;
    }
    if (participantes && !Array.isArray(participantes)) {
      res.status(200).json(new ResponseInfo(false, 'Participantes invalidos!'));
      return;
    }
    concursos.push(concurso);
    if (teimosinha && teimosinha > 0) {
      for (let i = 1; i < teimosinha; i++) {
        concursos.push((concurso + i));
      }
    }

    if (participantes) {
      await global.util.asyncForEach(participantes, async (participante) => {
        const {
          email, nome, usuarioId, cota = 1,
        } = participante;
        let p = null;
        if (usuarioId) {
          p = await usuarioRepository.get(usuarioId);
        } else {
          p = await usuarioRepository.getOne({ email: email.toLowerCase() });
        }
        if (!p && email && nome) {
          const u = {
            email,
            nome,
          };
          p = await usuarioRepository.create(u);
        }
        if (p) {
          participantesBolao.push({ participante: p._id, cota });
        }
      });
    }

    if (participantesBolao.length > 0) {
      const concursoFinal = concursos.reduce((a, b) => Math.max(a, b));
      Bolao = await bolaoRepository.create({
        modalidadeId: Modalidade._id,
        concurso,
        concursoFinal,
        participantes: participantesBolao,
      });
    } else {
      participantesBolao.push({ participante: req.headers.usuarioId, cota: 1 });
    }
    if (participantesBolao.map((p) => p.participante.toString()).indexOf((req.headers.usuarioId).toString()) === -1) {
      participantesBolao.push({ participante: req.headers.usuarioId, cota: 1 });
    }

    const arrayJogos = [];
    try {
      await global.util.asyncForEach(jogos, async (jogo) => {
        let { dezenas, cota = 1, cotas = 1 } = jogo;
        cota = parseInt(cota) || 1;
        cotas = parseInt(cotas) || 1;
        if (!dezenas || !Array.isArray(dezenas) || dezenas.length === 0) {
          throw new Error('Não foi possivel identificar as dezenas do jogo.');
        }
        if (cota > cotas) {
          throw new Error(`Cota invalida. cota (${cota})  de cotas (${cotas})`);
        }
        dezenas = dezenas.map((d) => parseInt(d));
        const tempMinDez = dezenas.reduce((a, b) => Math.min(a, b));
        const tempMaxDez = dezenas.reduce((a, b) => Math.max(a, b));
        if (dezenas.some((d) => dezenas.indexOf(d) !== dezenas.lastIndexOf(d))) {
          throw new Error(`Existem dezenas repetidas: (${dezenas.join('-')})`);
        }
        if (!(dezenas.length >= Modalidade.minDezenas && dezenas.length <= Modalidade.maxDezenas)) {
          throw new Error(`A quantidade de dezenas deve estrar entre (${Modalidade.minDezenas}) e (${Modalidade.maxDezenas})`);
        }
        if (!(tempMinDez >= 1)) {
          throw new Error(`A dezena ${tempMinDez} inválida. Dezenas deve estar entre 1 e ${Modalidade.dezenas}`);
        }
        if (!(tempMaxDez <= Modalidade.dezenas)) {
          throw new Error(`A dezena ${tempMaxDez} inválida. Dezenas deve estar entre 1 e ${Modalidade.dezenas}`);
        }
        arrayJogos.push({ dezenas, cota, cotas });
      });
    } catch (error) {
      res.status(200).json(new ResponseInfo(false, error.message));
      return;
    }
    const apostas = [];
    const bolaoId = Bolao ? Bolao._id : null;
    const totalCotas = participantesBolao.map((p) => p.cota).reduce((a, b) => a + b);
    await global.util.asyncForEach(participantesBolao, async (participante) => {
      await global.util.asyncForEach(concursos, async (cc) => {
        const aposta = {
          concurso: cc,
          modalidadeId: Modalidade._id,
          jogos: arrayJogos,
          cotas: participante.cota,
          totalCotas,
          usuarioCotaId: participante.participante,
          usuarioId: req.headers.usuarioId,
          bolaoId,
        };
        apostas.push(aposta);
      });
    });

    await global.util.asyncForEach(apostas, async (aposta) => {
      try {
        const Aposta = await apostaRepository.create(aposta);
        eventEmitter('nova-aposta', { id: Aposta._id });
      } catch (error) {
        console.log('apostaRepository.create - Error: ', error);
      }
    });
    if (bolaoId) {
      eventEmitter('novo-bolao', { id: bolaoId });
    }
    res.status(200).json(new ResponseInfo(true, 'success'));
  } catch (error) {
    console.error('Create aposta - Error: ', error);
    res.status(500).json(new ResponseInfo(false, error));
  }
};


exports.confereAposta = async (req, res) => {
  try {
    if (!req.body) {
      res.status(200).json(new ResponseInfo(false, 'Objeto (Dados) não foi informado!'));
      return;
    }
    if (!(typeof req.body === 'object')) {
      res.status(200).json(new ResponseInfo(false, 'Objeto (Dados) não é um objeto validado'));
      return;
    }
    res.status(200).json(new ResponseInfo(true, 'success'));
  } catch (error) {
    console.error('Create aposta - Error: ', error);
    res.status(500).json(new ResponseInfo(false, error));
  }
};


exports.get = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfo(false, 'Id do Objeto não foi informado.'));
    } else {
      const data = await apostaRepository.get(req.params.id);
      const valido = (req.headers && req.headers.usuarioId && req.headers.usuarioId.toString() === data.usuarioCotaId.toString());
      if (data && valido) {
        res.status(200).json(new ResponseInfo(true, data));
      } else {
        res.status(200).json(new ResponseInfo(false, `Objeto, id (${req.params.id}) não encontrato`));
      }
    }
  } catch (error) {
    res.status(500).json(new ResponseInfo(false, error));
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(200).json(new ResponseInfo(false, 'Id do Objeto não foi informado.'));
    } else {
      const data = await apostaRepository.get(req.params.id);
      const valido = (req.headers && req.headers.usuarioId && data && req.headers.usuarioId.toString() === data.usuarioId.toString());
      if (valido) {
        await apostaRepository.delete(data._id);
        if (data.bolaoId) {
          await bolaoRepository.delete(data.bolaoId);
        }
        res.status(200).json(new ResponseInfo(true, `Id (${req.params.id}) Excluido com sucesso.`));
      } else {
        res.status(200).json(new ResponseInfo(false, `Id (${req.params.id}) não encontrato`));
      }
    }
  } catch (error) {
    res.status(500).json(new ResponseInfo(false, error));
  }
};

exports.list = async (req, res) => {
  try {
    const { usuarioId = '' } = req.headers;
    const { codigo } = req.params;
    let { concurso, rowsPage = 0, page = 1 } = req.query;
    let filter = {};

    if (concurso) {
      concurso = parseInt(concurso);
    }
    if (rowsPage) {
      rowsPage = parseInt(rowsPage);
    }
    if (page) {
      page = parseInt(page);
    }
    if (!codigo) {
      res.status(400).json(new ResponseInfo(false, ''));
      return;
    }
    const modalidade = await modalidadeRepository.getOne({ codigo: codigo.toUpperCase() });

    if (!modalidade) {
      res.status(400).json(new ResponseInfo(false, ''));
      return;
    }

    if (concurso) {
      filter = { concurso, ...filter };
    }

    let rows = await apostaRepository.countByFilter(modalidade._id, usuarioId, filter);
    if (!rows || Number.isNaN(rows)) {
      rows = 0;
    }
    rows = parseInt(rows);
    if (rowsPage <= 0) {
      rowsPage = rows;
    }
    let totalPages = Math.ceil((parseInt(rows) / rowsPage));
    totalPages = (totalPages === 0 ? 1 : totalPages);
    res.header('X-Total-Rows', rows);
    res.header('X-Rows-Page', rowsPage);
    res.header('X-Page', page);
    res.header('X-Total-Pages', totalPages);

    const pagination = {
      totalRows: rows,
      rowsPage,
      page,
      totalPages,
    };

    if (rows <= 0) {
      res.status(200).json(new ResponseInfo(true, [], pagination));
      return;
    }

    const options = {
      filter,
      limit: rowsPage,
      skip: (((page - 1) * rowsPage)),
    };
    const result = await apostaRepository.apostasUsuario(modalidade._id, usuarioId, options);
    res.status(200).json(new ResponseInfo(true, result, pagination));
  } catch (error) {
    res.status(500).json(new ResponseInfo(false, error));
  }
};


globalEvents.on('novo-sorteio', async (event) => {
  // event => { concurso: resultado.concurso, modalidadeId: resultado.modalidadeId };
  const apostas = await apostaRepository.listarByFilter({ conferido: { $eq: false }, ...event });
  apostas.forEach((aposta) => {
    confereAposta(aposta.modalidadeId, aposta._id);
  });
});

globalEvents.on('nova-aposta', async (event) => {
  // event => { id: apostaId }
  const aposta = await apostaRepository.get(event.id);
  if (aposta) {
    confereAposta(aposta.modalidadeId, aposta._id);
  }
});


globalEvents.on('novo-bolao', async (event) => {
  // event => { id: bolaoId }
  if (event.id) {
    enviaEmailBolao(event.id);
  }
});

/* eslint-disable radix */

const moment = require('moment-timezone');

const modalidadeRepository = require('../repositories/modalidade.repository');
const sorteioRepository = require('../repositories/sorteio.repository');
const apostaRepository = require('../repositories/aposta.repository');
const bolaoRepository = require('../repositories/bolao.repository');
const usuarioRepository = require('../repositories/usuario.repository');
const ResponseInfo = require('../util/ResponseInfo');
const globalEvents = require('../helper/globalEvents');


globalEvents.on('novo-jogo', (event) => {
  console.warn('onEvent-novo-jogo: ', JSON.stringify(event));
});

async function eventEmitter(sorteio) {
  globalEvents.emit('novo-jogo', sorteio);
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
          email, nome, usuarioId, cotas = 1,
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
          participantesBolao.push({ participante: p._id, cota: cotas });
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
    if (participantesBolao.map((p) => p.toString()).indexOf((req.headers.usuarioId).toString()) === -1) {
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
        eventEmitter({ id: Aposta._id });
      } catch (error) {
        console.log('apostaRepository.create - Error: ', error);
      }
    });
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
      const valido = (req.headers && req.headers.usuarioId && data && req.headers.usuarioId.toString() === data.usuarioCotaId.toString());
      if (valido) {
        await apostaRepository.delete(data._id);
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
    const { usuarioCotaId = '' } = req.headers;
    const filter = req.query && Object.keys(req.query).length > 0 ? req.query : {};
    const result = await apostaRepository.listarByFilter({ usuarioCotaId, ...filter });
    res.status(200).json(new ResponseInfo(true, result));
  } catch (error) {
    res.status(500).json(new ResponseInfo(false, error));
  }
};

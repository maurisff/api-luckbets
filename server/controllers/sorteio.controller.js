/* eslint-disable radix */

const moment = require('moment-timezone');

const successHttpStatus = [200, 201, 202, 203, 204, 205, 206, 207, 208];
const acceptErrorsHttpStatus = [500, 503, 504];
const axios = require('axios');
const modalidadeRepository = require('../repositories/modalidade.repository');
const sorteioRepository = require('../repositories/sorteio.repository');
const apostaRepository = require('../repositories/aposta.repository');
const ResponseInfo = require('../util/ResponseInfo');
const globalEvents = require('../helper/globalEvents');

async function eventEmitter(sorteio) {
  globalEvents.emit('novo-sorteio', sorteio);
}


async function consultaSorteio(modalidadeId, options = {
  auto: false, forceUpdate: false, ignoreErrors: false, forceConference: false, concurso: null,
}) {
  const {
    auto, ignoreErrors, forceUpdate, forceConference, concurso,
  } = options;
  const modalidade = await modalidadeRepository.get(modalidadeId);
  let notifica = null;
  if (!modalidade) {
    throw new Error(`Modadelidade não localizada com Id (${modalidadeId})`);
  }
  if (!modalidade.propriedades) {
    throw new Error(`Modadelidade (${modalidade.codigo}) - Não possui propriedades para extração dos dados`);
  }
  if (!modalidade.url) {
    throw new Error(`Modadelidade (${modalidade.codigo}) - Não possui URL de consulta`);
  }

  try {
    let urlApi = `${modalidade.url}?timestampAjax=${new Date().getTime()}`;
    if (concurso) {
      urlApi = `${urlApi}&concurso=${concurso}`;
    }
    let data = null;
    try {
      const response = await axios.get(urlApi, {
        headers: {
          'content-type': 'application/json',
          cookie: 'security=true',
          accept: 'application/json',
          'accept-encoding': 'gzip, deflate',
          'accept-language': 'en-US,en;q=0.8',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
        },
      });
      if (response && successHttpStatus.indexOf(response.status) > -1) {
        data = await response.data;
      }
    } catch (error) {
      data = null;
      if (error.response && error.response.status && acceptErrorsHttpStatus.indexOf(error.response.status) > -1) {
        console.log(`Axios.get(${modalidade.codigo})${concurso ? ` - Concurso(${concurso})` : ''}. Server error status: `, error.response.status);
      } else {
        console.error(`Axios.get(${modalidade.codigo}).error: `, error);
      }
    }

    if (data) {
      const premiacao = [];
      if (modalidade && modalidade.faixaPremio) {
        await global.util.asyncForEach(modalidade.faixaPremio, async (faixa) => {
          premiacao.push({
            faixa: faixa.faixa,
            dezenas: faixa.dezenas,
            ganhadores: data[faixa.propGanhadoresFaixa] || 0,
            valor: Number(data[faixa.propValorFaixa] || 0),
          });
        });
      }
      const resultado = {
        concurso: data[modalidade.propriedades.concurso],
        modalidadeId: modalidade._id,
        apuracao: (moment(data[modalidade.propriedades.dataConcurso]).isValid() ? moment(data[modalidade.propriedades.dataConcurso]) : null),
        resultado: (data[modalidade.propriedades.resultado] || '').replace(/\s+/g, '').split('-').map((d) => parseInt(d)),
        proximoConcurso: (data[modalidade.propriedades.concurso] + 1),
        proximaApuracao: (moment(data[modalidade.propriedades.dataProximo]).isValid() ? moment(data[modalidade.propriedades.dataProximo]) : null),
        valorPrevisto: parseFloat((data[modalidade.propriedades.valorPrevisto] || '').toString().retornaNumeros()),
        premiacao,
      };
      let sorteio = null;
      try {
        sorteio = await sorteioRepository.getOne({ concurso: resultado.concurso, modalidadeId: resultado.modalidadeId });
      } catch (error) {
        sorteio = null;
      }
      // console.warn(`Modadelidade (${modalidade.codigo}) - resultado: `, resultado);
      // console.warn(`Modadelidade (${modalidade.codigo}) - JSON resultado: `, JSON.stringify(resultado));
      if (!sorteio) {
        await sorteioRepository.create(resultado);
        notifica = { concurso: resultado.concurso, modalidadeId: resultado.modalidadeId };
      } else if (sorteio && forceUpdate) {
        await sorteioRepository.update(sorteio._id, resultado);
        notifica = { concurso: resultado.concurso, modalidadeId: resultado.modalidadeId };
      }
      if (!modalidade.proximoConcurso || (resultado.concurso >= modalidade.proximoConcurso)) {
        modalidade.ultimoConcurso = resultado.concurso;
        modalidade.proximoConcurso = (resultado.concurso + 1);
        modalidade.ultimaApuracao = resultado.apuracao;
        modalidade.proximaApuracao = resultado.proximaApuracao;
        await modalidadeRepository.update(modalidade._id, modalidade);
      }
    }
  } catch (error) {
    notifica = null;
    if (ignoreErrors) {
      console.log(`Erro Ignorado Modalidade (${modalidade.codigo})${concurso ? ` - Concurso(${concurso})` : ''}: `, error);
    } else {
      throw error;
    }
  }
  if (notifica) {
    eventEmitter(notifica);
  }
}

exports.consultaSorteio = async (modalidadeId, options = {}) => {
  const {
    auto, forceUpdate, ignoreErrors, forceConference, concurso,
  } = options;
  if (concurso && Array.isArray(concurso)) {
    await global.util.asyncForEach(concurso, async (cc) => {
      await consultaSorteio(modalidadeId, {
        auto, forceUpdate, ignoreErrors, forceConference, concurso: cc,
      });
    });
  } else {
    await consultaSorteio(modalidadeId, options);
  }
};

exports.postVerificaSorteio = async (req, res) => {
  try {
    const {
      codigoModalidade, forceUpdate, ignoreErrors, forceConference, concurso = null,
    } = req.body;
    if (!codigoModalidade) {
      res.status(400).json(new ResponseInfo(false, 'codigo da modalidade não informado no corpo da requisição'));
      return;
    }
    const modalidade = await modalidadeRepository.getOne({ codigo: codigoModalidade.toString().toUpperCase() });
    if (!modalidade) {
      res.status(400).json(new ResponseInfo(false, `Modalidade (${codigoModalidade}) não cadastrada!`));
      return;
    }
    if (concurso && Array.isArray(concurso)) {
      await global.util.asyncForEach(concurso, async (cc) => {
        await consultaSorteio(modalidade._id, {
          auto: false, forceUpdate: !!forceUpdate, ignoreErrors: !!ignoreErrors, forceConference: !!forceConference, concurso: cc,
        });
      });
    } else {
      await consultaSorteio(modalidade._id, {
        auto: false, forceUpdate: !!forceUpdate, ignoreErrors: !!ignoreErrors, forceConference: !!forceConference, concurso,
      });
    }
    res.status(200).json(new ResponseInfo(true, 'Sucesso!'));
  } catch (error) {
    res.status(400).json(new ResponseInfo(false, error));
  }
};

exports.ultimosResultados = async (req, res) => {
  try {
    const { usuarioId } = req.headers;
    const modalidades = await modalidadeRepository.listarTodos();
    const result = [];
    await global.util.asyncForEach(modalidades, async (modalidade) => {
      try {
        const sorteio = await sorteioRepository.ultimoResultado(modalidade._id);
        let serializedData = JSON.parse(JSON.stringify(sorteio)) || [];
        if (usuarioId && sorteio) {
          const aposta = await apostaRepository.getOne({ concurso: sorteio.concurso, usuarioCotaId: usuarioId, premiado: { $eq: true } });
          if (aposta && aposta.premiado) {
            serializedData = { ...serializedData, premiado: true };
          }
        }
        if (serializedData) {

          result.push(serializedData);
        }
      } catch (error) {
        console.error(`ultimosResultados - Modalidade (${modalidade.codigo}) error: `, error);
      }
    });
    // console.log(result);
    res.status(200).json(new ResponseInfo(true, result));
  } catch (error) {
    res.status(400).json(new ResponseInfo(false, error));
  }
};

exports.resultadoModalidade = async (req, res) => {
  try {
    const { codigo } = req.params;
    let { concurso, rowsPage = 0, page = 1 } = req.query;

    if (concurso) {
      concurso = parseInt(concurso);
    }
    if (rowsPage) {
      rowsPage = parseInt(rowsPage);
    }
    if (page) {
      page = parseInt(page);
    }
    let rows = 0;
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
      rows = await sorteioRepository.countByFilter({ modalidadeId: modalidade._id, concurso });
    } else {
      rows = await sorteioRepository.countByFilter({ modalidadeId: modalidade._id });
    }
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
    let options = {
      limit: rowsPage,
      skip: (((page - 1) * rowsPage)),
    };
    if (concurso) {
      options = { filter: { concurso }, ...options };
    }

    const result = await sorteioRepository.resultadoModalidade(modalidade._id, options);
    res.status(200).json(new ResponseInfo(true, result, pagination));
  } catch (error) {
    res.status(400).json(new ResponseInfo(false, error.message));
  }
};

exports.semSorteio = async (req, res) => {
  try {
    const { codigo } = req.body;

    const modalidade = await modalidadeRepository.getOne({ codigo: codigo.toUpperCase() });
    if (!modalidade) {
      res.status(200).json(new ResponseInfo(false, `Modalidade (${codigo}) não localizada!!`));
      return;
    }
    const list = await sorteioRepository.selectByFilter({}, { modalidadeId: modalidade._id });
    if (!list || (Array.isArray(list) && list.length === 0)) {
      res.status(200).json(new ResponseInfo(false, 'Não foi possivel identifical o ultimo concurso registrado.'));
      return;
    }
    const aux = list.map((l) => l.concurso);
    const max = aux.reduce((a, b) => Math.max(a, b));
    const pendentes = [];
    for (let i = 1; i <= max; i++) {
      if (aux.indexOf(i) === -1) {
        pendentes.push(i);
      }
    }
    res.status(200).json(await pendentes.join(','));
  } catch (error) {
    res.status(400).json(new ResponseInfo(false, error));
  }
};

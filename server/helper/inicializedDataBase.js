/* eslint-disable no-use-before-define */
const mongoose = require('mongoose');
// const schedule = require('node-schedule');
// const MD5 = require('md5');
module.exports = {
  async start() {
    console.log('inicializando serviços de banco de dados padrão...');
    await createModalida();
    /*
    await createProvedorMoeda();
    await createCommoditie();
    await createProvedorCommoditie();
    await createDefautlUserAdmin();
    */
  },
};

// =================================================================================================
// Criar metodos a serem executados depois que o bando de dados ja estiver inicializado e conectado
// =================================================================================================

async function createModalida() {
  const Modalidade = mongoose.model('Modalidade');
  const modalidades = [{
    codigo: 'MEGASENA',
    titulo: 'Megasena',
    url: 'http://www.loterias.caixa.gov.br/wps/portal/loterias/landing/megasena/app/!ut/p/a1/jc_NDoIwEATgR-rQ0lKO5ce2gLEXEXsxPRESRQ_G57cSTyaiO6dNvkl2iScD8XN4TGO4T9c5nF-7FyejW5lIjRZc11C83zjOGoaSRXCMoNTKpFkHIJUUtipMleVbwIr_-vgyCr_6B-IXIpIOBhoNLJVQae1o3_QMkn0C7UoOtauKHCwG_A3WfljAypG3y37AZMcn2D1l5w!!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0K05GE0A5VFP53J3024/res/id=buscaResultado/c=cacheLevelPage/=/',
    dezenas: 60,
    minDezenas: 6,
    maxDezenas: 15,
    valorApostaMinima: 4.5,
    teimozinha: [2, 4, 8],
    faixaPremio: [
      {
        faixa: 1,
        dezenas: 6,
        propGanhadoresFaixa: 'ganhadores',
        propValorFaixa: 'valor',
      },
      {
        faixa: 2,
        dezenas: 5,
        propGanhadoresFaixa: 'ganhadores_quina',
        propValorFaixa: 'valor_quina',
      },
      {
        faixa: 3,
        dezenas: 4,
        propGanhadoresFaixa: 'ganhadores_quadra',
        propValorFaixa: 'valor_quadra',
      },
    ],
    propriedades: {
      concurso: 'concurso',
      dataConcurso: 'data',
      resultado: 'resultado',
      dataProximo: 'dt_proximo_concurso',
      valorPrevisto: 'vr_estimativa',
    },
    style: {
      corTitulo: '#209869',
      corBGDezena: '#209869',
      corTxtDezena: '#ffffff',
      corDefaulBGDezena: '',
      corDefaulTxtDezena: '#209869',
    },
  },
  {
    codigo: 'lotofacil',
    titulo: 'Lotofácil',
    url: 'http://www.loterias.caixa.gov.br/wps/portal/loterias/landing/lotofacil/app/!ut/p/a1/jc_NCsIwEATgR8rE_iQ9pols0lYqlGrNpfRUClo9iM9vLHgRrO6cFr6BXeZZx_w8PKZxuE_XeTi_dp_2lkrJJaGkhgso02jaNopDiwBOAWhSNhYVgFhu4Exujch2gEv_6-PLKPzqH5lfSMorWBCKunAJVFlHUWsOHDL5BLTXAdQmzxCF4A3WfljAypG3S9thcuMTUYqLKA!!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KGS170ADSCGESA1022/res/id=buscaResultado/c=cacheLevelPage/=/',
    dezenas: 25,
    minDezenas: 15,
    maxDezenas: 18,
    valorApostaMinima: 2.50,
    teimozinha: [2, 4, 8, 12],
    faixaPremio: [
      {
        faixa: 1,
        dezenas: 15,
        propGanhadoresFaixa: 'qt_ganhador_faixa1',
        propValorFaixa: 'vr_rateio_faixa1',
      },
      {
        faixa: 2,
        dezenas: 14,
        propGanhadoresFaixa: 'qt_ganhador_faixa2',
        propValorFaixa: 'vr_rateio_faixa2',
      },
      {
        faixa: 3,
        dezenas: 13,
        propGanhadoresFaixa: 'qt_ganhador_faixa3',
        propValorFaixa: 'vr_rateio_faixa3',
      },
      {
        faixa: 4,
        dezenas: 12,
        propGanhadoresFaixa: 'qt_ganhador_faixa4',
        propValorFaixa: 'vr_rateio_faixa4',
      },
      {
        faixa: 5,
        dezenas: 11,
        propGanhadoresFaixa: 'qt_ganhador_faixa5',
        propValorFaixa: 'vr_rateio_faixa5',
      },
    ],
    propriedades: {
      concurso: 'nu_concurso',
      dataConcurso: 'dt_apuracao',
      resultado: 'de_resultado',
      dataProximo: 'dtProximoConcurso',
      valorPrevisto: 'vrEstimativa',
    },
    style: {
      corTitulo: '#930089',
      corBGDezena: '#930089',
      corTxtDezena: '#ffffff',
      corDefaulBGDezena: '',
      corDefaulTxtDezena: '#930089',
    },
  },
  {
    codigo: 'quina',
    titulo: 'Quina',
    url: 'http://www.loterias.caixa.gov.br/wps/portal/!ut/p/a1/jc_NDoIwEATgR-oApS3HAqY_YOACYi-mJ9JE0YPx-a0kXkxE9zbZb5Jd4shE3OIfYfb3cF38-ZUdO2nViEQoNB3TAnLgSaO4BRiN4BhBpaSmvAVARQpTl7rmxR4w7L8-vozEr_6BuJWwpIWGgoVJI6G7Ph3tmCHLP4Hqqxyyq8sCcQ28wdYPK9g48nYZJgQzPwFBL-3d/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO6H80AU71KG7J00D1/res/id=buscaResultado/c=cacheLevelPage/=/',
    dezenas: 80,
    minDezenas: 5,
    maxDezenas: 15,
    valorApostaMinima: 2,
    teimozinha: [3, 6, 18, 24],
    faixaPremio: [
      {
        faixa: 1,
        dezenas: 5,
        propGanhadoresFaixa: 'ganhadores',
        propValorFaixa: 'valor',
      },
      {
        faixa: 2,
        dezenas: 4,
        propGanhadoresFaixa: 'ganhadores_quadra',
        propValorFaixa: 'valor_quadra',
      },
      {
        faixa: 3,
        dezenas: 3,
        propGanhadoresFaixa: 'ganhadores_terno',
        propValorFaixa: 'valor_terno',
      },
      {
        faixa: 4,
        dezenas: 2,
        propGanhadoresFaixa: 'qt_ganhador_duque',
        propValorFaixa: 'vr_rateio_duque',
      },
    ],
    propriedades: {
      concurso: 'concurso',
      dataConcurso: 'data',
      resultado: 'resultado',
      dataProximo: 'dtProximoConcurso',
      valorPrevisto: 'vrEstimado',
    },
    style: {
      corTitulo: '#260085',
      corBGDezena: '#260085',
      corTxtDezena: '#ffffff',
      corDefaulBGDezena: '',
      corDefaulTxtDezena: '#260085',
    },
  }, {
    codigo: 'LOTOMANIA',
    titulo: 'Lotomania',
    url: 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/lotomania/!ut/p/a1/04_Sj9CPykssy0xPLMnMz0vMAfGjzOLNDH0MPAzcDbz8vTxNDRy9_Y2NQ13CDA38jYEKIoEKnN0dPUzMfQwMDEwsjAw8XZw8XMwtfQ0MPM2I02-AAzgaENIfrh-FqsQ9wBmoxN_FydLAGAgNTKEK8DkRrACPGwpyQyMMMj0VAajYsZo!/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_61L0H0G0JGJVA0AKLR5T3K00V0/res/id=buscaResultado/c=cacheLevelPage/=/',
    dezenas: 99,
    minDezenas: 50,
    maxDezenas: 50,
    valorApostaMinima: 2.5,
    teimozinha: [2, 4, 8],
    faixaPremio: [
      {
        faixa: 1,
        dezenas: 20,
        propGanhadoresFaixa: 'qtGanhadoresFaixa1',
        propValorFaixa: 'vrRateioFaixa1',
      },
      {
        faixa: 2,
        dezenas: 19,
        propGanhadoresFaixa: 'qtGanhadoresFaixa2',
        propValorFaixa: 'vrRateioFaixa2',
      },
      {
        faixa: 3,
        dezenas: 18,
        propGanhadoresFaixa: 'qtGanhadoresFaixa3',
        propValorFaixa: 'vrRateioFaixa3',
      },
      {
        faixa: 4,
        dezenas: 17,
        propGanhadoresFaixa: 'qtGanhadoresFaixa4',
        propValorFaixa: 'vrRateioFaixa4',
      },
      {
        faixa: 5,
        dezenas: 16,
        propGanhadoresFaixa: 'qtGanhadoresFaixa5',
        propValorFaixa: 'vrRateioFaixa5',
      },
      {
        faixa: 6,
        dezenas: 15,
        propGanhadoresFaixa: 'qtGanhadoresFaixa6',
        propValorFaixa: 'vrRateioFaixa6',
      },
      {
        faixa: 7,
        dezenas: 0,
        propGanhadoresFaixa: 'qtGanhadoresFaixa7',
        propValorFaixa: 'vrRateioFaixa7',
      },
    ],
    propriedades: {
      concurso: 'concurso',
      dataConcurso: 'dtApuracao',
      resultado: 'deResultado',
      dataProximo: 'dtProximoConcurso',
      valorPrevisto: 'vrEstimativa',
    },
    style: {
      corTitulo: '#f78100',
      corBGDezena: '#f78100',
      corTxtDezena: '#ffffff',
      corDefaulBGDezena: '',
      corDefaulTxtDezena: '#f78100',
    },
  }, {
    codigo: 'DIADESORTE',
    titulo: 'Dia de Sorte',
    url: 'http://loterias.caixa.gov.br/wps/portal/loterias/landing/diadesorte/!ut/p/a1/jc5BDsIgFATQs3gCptICXdKSfpA2ujFWNoaVIdHqwnh-sXFr9c_qJ2-SYYGNLEzxmc7xkW5TvLz_IE6WvCoUwZPwArpTnZWD4SCewTGDlrQtZQ-gVGs401gj6wFw4r8-vpzGr_6BhZmIoocFYUO7toLemqYGz0H1AUsTZ7Cw4X7dj0hu9QIyUWUw/dl5/d5/L2dBISEvZ0FBIS9nQSEh/pw/Z7_HGK818G0KO5GE0Q8PTB11800G3/res/id=buscaResultado/c=cacheLevelPage/=/',
    dezenas: 31,
    minDezenas: 7,
    maxDezenas: 15,
    valorApostaMinima: 2,
    teimozinha: [3, 6, 9, 12],
    faixaPremio: [
      {
        faixa: 1,
        dezenas: 7,
        propGanhadoresFaixa: 'qt_GANHADOR_FAIXA_1',
        propValorFaixa: 'vr_RATEIO_FAIXA_1',
      },
      {
        faixa: 2,
        dezenas: 6,
        propGanhadoresFaixa: 'qt_GANHADOR_FAIXA_2',
        propValorFaixa: 'vr_RATEIO_FAIXA_2',
      },
      {
        faixa: 3,
        dezenas: 5,
        propGanhadoresFaixa: 'qt_GANHADOR_FAIXA_3',
        propValorFaixa: 'vr_RATEIO_FAIXA_3',
      },
      {
        faixa: 4,
        dezenas: 4,
        propGanhadoresFaixa: 'qt_GANHADOR_FAIXA_4',
        propValorFaixa: 'vr_RATEIO_FAIXA_4',
      },
    ],
    propriedades: {
      concurso: 'nu_CONCURSO',
      dataConcurso: 'dt_APURACAO',
      resultado: 'de_RESULTADO',
      dataProximo: 'dt_PROXIMO_CONCURSO',
      valorPrevisto: 'vr_ESTIMATIVA',
    },
    style: {
      corTitulo: '#cb852b',
      corBGDezena: '#cb852b',
      corTxtDezena: '#ffffff',
      corDefaulBGDezena: '',
      corDefaulTxtDezena: '#cb852b',
    },
  }];
  await global.util.asyncForEach(modalidades, async (doc) => {
    try {
      const value = await Modalidade.findOne({ codigo: doc.codigo });
      if (!value) {
        await new Modalidade(doc).save();
      }
    } catch (error) {
      console.error(`inicializedDataBase.createModalidade (${doc.codigo}): `, error);
    }
  });
}

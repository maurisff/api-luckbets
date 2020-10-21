const moment = require('moment');


async function processResultadoSorteio(modalidade, sorteio) {
  const premiacao = [];
  if (modalidade && modalidade.faixaPremio && sorteio.listaRateioPremio && Array.isArray(sorteio.listaRateioPremio)) {
    await global.util.asyncForEach(modalidade.faixaPremio, async (faixa) => {
      const premio = sorteio.listaRateioPremio.find((f) => f.faixa === faixa.faixa);
      if (premio) {
        premiacao.push({
          faixa: faixa.faixa,
          dezenas: faixa.dezenas,
          // ganhadores: premio[faixa.propGanhadoresFaixa] || 0,
          // valor: Number(premio[faixa.propValorFaixa] || 0),
          ganhadores: premio.numeroDeGanhadores || 0,
          valor: Number(premio.valorPremio || 0),
        });
      }
    });
  }
  /*

  const concurso = Number(sorteio[modalidade.propriedades.concurso]);
  const apuracao = (moment(sorteio[modalidade.propriedades.dataConcurso], 'DD/MM/YYYY').isValid() ? moment(sorteio[modalidade.propriedades.dataConcurso], 'DD/MM/YYYY') : null);
  // const resultado = (sorteio[modalidade.propriedades.resultado] || '').replace(/\s+/g, '').split('-').map((d) => Number(d))
  const resultado = sorteio[modalidade.propriedades.resultado].map((e) => Number(e));
  const proximoConcurso = (Number(sorteio[modalidade.propriedades.concurso]) + 1);
  const proximaApuracao = (moment(sorteio[modalidade.propriedades.dataProximo], 'DD/MM/YYYY').isValid() ? moment(sorteio[modalidade.propriedades.dataProximo], 'DD/MM/YYYY') : null);
  const valorPrevisto = parseFloat((sorteio[modalidade.propriedades.valorPrevisto] || '').toString().retornaNumeros());

  */


  const concurso = Number(sorteio.numero);
  const apuracao = (moment(sorteio.dataApuracao, 'DD/MM/YYYY').isValid() ? moment(sorteio.dataApuracao, 'DD/MM/YYYY') : null);
  const resultado = sorteio.listaDezenas.map((e) => Number(e));
  const proximoConcurso = (concurso + 1);
  const proximaApuracao = (moment(sorteio.dataProximoConcurso, 'DD/MM/YYYY').isValid() ? moment(sorteio.dataProximoConcurso, 'DD/MM/YYYY') : null);
  const valorPrevisto = parseFloat((sorteio.valorEstimadoProximoConcurso || '').toString().retornaNumeros());

  return {
    concurso,
    modalidadeId: modalidade._id,
    apuracao,
    resultado,
    proximoConcurso,
    proximaApuracao,
    valorPrevisto,
    premiacao,
  };
}

exports.processResponse = async (modalidade, sorteio) => {
  const defaultModalidades = [
    'MEGASENA',
    'LOTOFACIL',
    'QUINA',
    'LOTOMANIA',
    'DIADESORTE',
  ];
  if (!sorteio) {
    return null;
  }
  if (!modalidade || !modalidade.codigo) {
    throw new Error('Modalidade não informada para o processamento do resultado da caixa.');
  }
  if (defaultModalidades.indexOf(modalidade.codigo.toUpperCase()) > -1) {
    return processResultadoSorteio(modalidade, sorteio);
  }
  return null;
};

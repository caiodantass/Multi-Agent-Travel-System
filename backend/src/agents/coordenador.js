import { AgenteIntencao, AgenteLocalizacao, AgenteTemporal } from './especialistas.js';
import { AgenteConhecimento } from './agenteConhecimento.js';
import { AgenteClima } from './agenteClima.js';
import { AgenteOrcamento } from './agenteOrcamento.js';
import { AgenteValidador } from './agenteValidador.js';

export const AgenteCoordenador = {
  processInput: (text, currentData = {}) => {
    const input = text.toLowerCase().trim();
    const logs = [];
    logs.push(`[Coordenador] Iniciando processamento do input do usuário: "${text}"`);

    // DELEGAÇÃO PARA AGENTES ESPECIALISTAS DE EXTRAÇÃO
    // Se o usuário já selecionou um serviço via botões de opção, preservamos e travamos a seleção.
    const hasExistingServices = currentData.services && currentData.services.length > 0;
    const services = hasExistingServices ? currentData.services : AgenteIntencao.process(input);
    const locations = AgenteLocalizacao.process(input);
    const times = AgenteTemporal.process(input);

    // EXTRAÇÃO DIRETA: Passageiros, Tipo de Hospedagem e Orçamento

    // ---- PASSAGEIROS ----
    let passengers = null;

    // "Passageiros: 4", "passageiros 4", "Passageiros 4 (2 adultos...)"
    const paxLabelMatch = input.match(/passageiros?\s*[:\-]?\s*(\d+)/i);
    if (paxLabelMatch) passengers = parseInt(paxLabelMatch[1]);

    // "4 pessoas", "4 passageiros", "4 adultos", "4 pax"
    if (!passengers) {
      const paxNumMatch = input.match(/(\d+)\s*(?:pessoa|pessoas|pax|passageiro|passageiros|adulto|adultos|viajante|viajantes)/i);
      if (paxNumMatch) passengers = parseInt(paxNumMatch[1]);
    }

    // "quantidade de pessoas: 4", "somos 4", "grupo de 5", "familia de 4", "nós 3"
    if (!passengers) {
      const paxAltMatch = input.match(/(?:quantidade\s*(?:de\s*)?pessoas?\s*[:\-]?\s*|somos\s+|grupo\s+de\s+|fam[ií]lia\s+de\s+|n[oó]s\s+)(\d+)/i);
      if (paxAltMatch) passengers = parseInt(paxAltMatch[1]);
    }

    // "eu e minha esposa" = 2, "eu, minha esposa e filho" = 3
    if (!passengers && /\bcasal\b/i.test(input)) passengers = 2;

    // ---- TIPO DE HOSPEDAGEM ----
    let accommodationType = null;
    // Ordem de prioridade: mais específicos primeiro
    const accPatterns = [
      { regex: /\baluguel\s*(?:de\s*|por\s*)?temporada/i, type: 'aluguel por temporada' },
      { regex: /\btemporada\b/i, type: 'aluguel por temporada' },
      { regex: /\bairbnb/i, type: 'airbnb' },
      { regex: /\bresort/i, type: 'resort' },
      { regex: /\bhostel/i, type: 'hostel' },
      { regex: /\bpousada/i, type: 'pousada' },
      { regex: /\bapartamento/i, type: 'apartamento' },
      { regex: /\bhotel\b/i, type: 'hotel' },
      { regex: /\bhot[eé]is\b/i, type: 'hotel' },
      { regex: /\bhospedagem\b/i, type: 'hotel' },
    ];
    for (const { regex, type } of accPatterns) {
      if (regex.test(input)) {
        // Evitar falso positivo: "casa" quando tem "casal"
        if (type === 'casa' && /\bcasal\b/i.test(input)) continue;
        accommodationType = type;
        break;
      }
    }
    // "casa" separada para evitar conflito com "casal"
    if (!accommodationType && /\bcasa\b/i.test(input) && !/\bcasal\b/i.test(input)) {
      accommodationType = 'casa';
    }

    // ---- ORÇAMENTO MÁXIMO ----
    let maxBudget = null;

    // "R$ 25.000", "R$ 25.000,00", "R$25000", "R$ 5000"
    const budgetPatterns = [
      // "orçamento máximo de R$ 25.000" / "orçamento de 25000" / "orçamento: 5000"
      /(?:or[cç]amento|limite|m[aá]ximo|budget)\s*(?:m[aá]ximo)?\s*(?:de|:)?\s*(?:r\$\s*)?([\d]+(?:[.\s]\d{3})*(?:,\d{1,2})?)\b(?!\s*\/)/i,
      // "até R$ 25.000" / "ate R$25000"
      /(?:at[eé]|no\s+m[aá]ximo)\s*(?:r\$\s*)?([\d]+(?:[.\s]\d{3})*(?:,\d{1,2})?)\b(?!\s*\/)/i,
      // "R$ 25.000" standalone
      /r\$\s*([\d]+(?:[.\s]\d{3})*(?:,\d{1,2})?)\b(?!\s*\/)/i,
      // "25 mil", "25k"
      /(?:or[cç]amento|limite|m[aá]ximo|at[eé]|budget)\s*(?:de\s*)?(?:r\$\s*)?(\d+)\s*(?:mil|k)\b/i,
    ];

    for (const rx of budgetPatterns) {
      const m = input.match(rx);
      if (m) {
        let rawVal = m[1];
        // Checar se é "X mil" ou "Xk"
        if (/mil|k/i.test(input.substring(input.indexOf(rawVal)))) {
          const numVal = parseFloat(rawVal);
          if (!isNaN(numVal) && numVal > 0 && numVal < 1000) {
            maxBudget = numVal * 1000;
            break;
          }
        }
        // Limpar separadores de milhar e decimal
        const cleanVal = rawVal.replace(/[\s.]/g, '').replace(',', '.');
        const val = parseFloat(cleanVal);
        if (!isNaN(val) && val > 0) {
          maxBudget = val;
          break;
        }
      }
    }

    // ---- QUANTIDADE DE QUARTOS ----
    let rooms = null;
    const roomsNumMatch = input.match(/(\d+)\s*quartos?/i);
    if (roomsNumMatch) {
      rooms = parseInt(roomsNumMatch[1]);
    } else {
      const roomsLabelMatch = input.match(/(?:quantidade\s*(?:de\s*)?)?quartos?\s*[:\-]?\s*(\d+)/i);
      if (roomsLabelMatch) rooms = parseInt(roomsLabelMatch[1]);
    }

    logs.push(`[Coordenador] Extração parcial concluída pelos especialistas.`);

    // CONSOLIDAÇÃO DOS RESULTADOS (Papel do Coordenador)
    let extractedOrigin = locations.origin;
    let extractedDestination = locations.destination;

    // Detectar se o input é uma única cidade isolada e se deve ser tratada como origem
    const isSingleCityFallback = extractedDestination !== null && extractedOrigin === null && 
      !/\b(para|pra|pro|ir|destino|visitar|conhecer|a|voltar)\b/i.test(input);

    if (isSingleCityFallback && currentData.destination && !currentData.origin) {
      extractedOrigin = extractedDestination;
      extractedDestination = null;
      logs.push(`[Coordenador] [Smart Swap] Movendo local "${extractedOrigin}" para a Origem, pois o Destino já está preenchido.`);
    }

    // Mesclamos com o estado atual do contexto se ele existir
    const servicesCombined = [...new Set([...(currentData.services || []), ...services])];
    
    const data = {
      services: servicesCombined,
      origin: extractedOrigin !== null ? extractedOrigin : currentData.origin,
      destination: extractedDestination !== null ? extractedDestination : currentData.destination,
      startDate: times.startDate !== null ? times.startDate : currentData.startDate,
      endDate: times.endDate !== null ? times.endDate : currentData.endDate,
      days: times.days !== null ? times.days : (times.startDate && times.endDate ? null : currentData.days),
      passengers: passengers !== null ? passengers : currentData.passengers,
      rooms: rooms !== null ? rooms : currentData.rooms,
      accommodationType: accommodationType !== null ? accommodationType : currentData.accommodationType,
      maxBudget: maxBudget !== null ? maxBudget : currentData.maxBudget
    };

    // Calcular dias se tivermos data de início e fim
    if (data.startDate && data.endDate && !data.days) {
      const parseDate = (dStr) => {
        const parts = dStr.split(/[\/\-]/);
        if (parts.length >= 2) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          let year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
          if (year < 100) year += 2000; // Ajuste para anos com 2 dígitos (ex: 26 -> 2026)
          return new Date(year, month, day);
        }
        return null;
      };
      const start = parseDate(data.startDate);
      const end = parseDate(data.endDate);
      if (start && end && end >= start) {
        const diffTime = Math.abs(end - start);
        data.days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Evita dias = 0 se for bate-volta, considera pelo menos 1 dia
        if (data.days === 0) data.days = 1;
        logs.push(`[Coordenador] Calculados ${data.days} dias de viagem com base nas datas.`);
      }
    }

    return { data, logs };
  },

  validate: (data) => {
    const missing = [];
    const services = data.services && data.services.length > 0 ? data.services : [];
    
    if (services.length === 0) {
      return {
        isComplete: false,
        missingFields: ['o que deseja planejar (Passagens, Hospedagem ou Roteiro?)'],
        activatedAgents: []
      };
    }

    const hasFlight = services.includes('flight');
    const hasAcc = services.includes('accommodation');

    // Nomes amigáveis para as datas
    const termIda = 'Data de ida';
    const termVolta = 'Data de volta';

    // 1. Origem: Necessária apenas se tiver voo (flight)
    if (hasFlight) {
      if (!data.origin) {
        missing.push('Origem');
      }
    }

    // 2. Destino: Sempre necessário
    if (!data.destination) {
      missing.push('Destino');
    }

    // 3. Datas (Ida/Check-in e Volta/Check-out): Sempre necessárias
    if (!data.startDate) {
      missing.push(termIda);
    }
    if (!data.endDate) {
      missing.push(termVolta);
    }

    // 4. Quantidade de pessoas: Necessária para voo ou hospedagem
    if (hasFlight || hasAcc) {
      if (!data.passengers) {
        missing.push('Quantidade de pessoas');
      }
    }

    // 5. Quantidade de quartos e Tipo de Hospedagem: Necessárias apenas se tiver hospedagem (accommodation)
    if (hasAcc) {
      if (!data.rooms) {
        missing.push('Quantidade de quartos');
      }
      if (!data.accommodationType) {
        missing.push('Tipo de hospedagem (Hotel ou Aluguel por temporada)');
      }
    }

    return {
      isComplete: missing.length === 0,
      missingFields: missing,
      activatedAgents: services
    };
  },

  // NOVO PIPELINE MULTIAGENTE E EXECUÇÃO
  runPipeline: (data) => {
    const pipelineLogs = [];
    pipelineLogs.push(`[Coordenador] Pipeline ativado. Dados de viagem consolidados.`);

    // Limpa a sigla IATA do destino para os agentes de conhecimento e clima
    const pureDestination = (data.destination || '').replace(/\s*\([A-Z]{3}\)/i, '').trim();

    // 1. Chamar o Knowledge Agent
    pipelineLogs.push(`[Coordenador] Invocando Agente de Conhecimento para o destino "${pureDestination}"...`);
    const knowledgeResult = AgenteConhecimento.process(pureDestination);
    pipelineLogs.push(...knowledgeResult.logs);

    // 2. Chamar o Weather Agent
    pipelineLogs.push(`[Coordenador] Invocando Agente do Clima para previsão de clima...`);
    const weatherResult = AgenteClima.getForecast(pureDestination, data.startDate);
    pipelineLogs.push(...weatherResult.logs);

    // 3. Chamar o Budget Agent
    pipelineLogs.push(`[Coordenador] Invocando Agente de Orçamento para consolidar custos...`);
    const budgetResult = AgenteOrcamento.calculate(data, knowledgeResult);
    pipelineLogs.push(...budgetResult.logs);

    // 4. Chamar o Validator Agent
    pipelineLogs.push(`[Coordenador] Invocando Agente Validador para auditar o plano...`);
    const validationResult = AgenteValidador.validatePlan(data, budgetResult, weatherResult);
    pipelineLogs.push(...validationResult.logs);

    pipelineLogs.push(`[Coordenador] Pipeline concluído com sucesso. Retornando resultados compilados.`);

    return {
      knowledgeResult,
      weatherResult,
      budgetResult,
      validationResult,
      logs: pipelineLogs
    };
  }
};

// Agente focado em entender as intenções de serviço
export const AgenteIntencao = {
  process: (input) => {
    const services = [];

    // Detectar voo/passagem
    if (/\b(passagem|passagens|v[oô]o|v[oô]os|a[eé]reo|a[eé]rea|bilhete|bilhetes|ticket|tickets|classe\s+econ[oô]mica|primeira\s+classe|classe\s+executiva)\b/i.test(input) 
      || /\b(saindo de|partindo de|origem|parto de|saio de)\b/i.test(input)) {
      services.push('flight');
    }

    // Detectar hospedagem
    if (/\b(hotel|hot[eé]is|pousada|pousadas|airbnb|hospedagem|apartamento|resort|resorts|hostel|hostels|alojamento|acomodação|acomoda[cç][aã]o|quarto|quartos|diária|diarias|pernoite|check-in|checkin)\b/i.test(input)) {
      services.push('accommodation');
    } else if (/\bcasa\b/i.test(input) && !/\bcasal\b/i.test(input)) {
      services.push('accommodation');
    }

    // Detectar roteiro/itinerário
    if (/\b(roteiro|roteiros|atividade|atividades|guia|passeio|passeios|itiner[aá]rio|pontos\s+tur[ií]sticos|o\s+que\s+fazer|visita|visitar|excurs[aã]o|tour|tours)\b/i.test(input)) {
      services.push('itinerary');
    }

    // Se menciona "viagem" ou "viajar" sem serviços específicos => viagem completa
    if (/\b(viagem\s+completa|pacote\s+completo|tudo\s+incluso)\b/i.test(input)) {
      return ['flight', 'accommodation', 'itinerary'];
    }

    // Se menciona "viagem" genérico e nenhum serviço específico foi detectado
    if (services.length === 0 && /\b(viagem|viajar|trip|férias|ferias|feriado)\b/i.test(input)) {
      return ['flight', 'accommodation', 'itinerary'];
    }

    // Se menciona "X dias" => também quer itinerário
    if (!services.includes('itinerary') && /\b\d+\s*dias?\b/i.test(input)) {
      services.push('itinerary');
    }

    return [...new Set(services)];
  }
};

// Agente especialista em extrair Origem e Destino
export const AgenteLocalizacao = {
  process: (input) => {
    let origin = null;
    let destination = null;

    const cleanInput = input
      .replace(/https?:\/\/\S+/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Lista de cidades conhecidas para matching direto
    const knownCities = [
      'são paulo', 'sao paulo', 'rio de janeiro', 'recife', 'salvador',
      'belo horizonte', 'brasília', 'brasilia', 'curitiba', 'fortaleza',
      'manaus', 'belém', 'belem', 'goiânia', 'goiania', 'porto alegre',
      'natal', 'maceió', 'maceio', 'joão pessoa', 'joao pessoa', 'joa pessoa',
      'florianópolis', 'florianopolis', 'vitória', 'vitoria', 'campinas',
      'gramado', 'canela', 'búzios', 'buzios', 'arraial do cabo',
      'porto de galinhas', 'maragogi', 'pipa', 'jericoacoara',
      'fernando de noronha', 'foz do iguaçu', 'foz do iguacu',
      'paris', 'londres', 'london', 'nova york', 'new york',
      'orlando', 'miami', 'buenos aires', 'roma', 'rome',
      'lisboa', 'lisbon', 'tóquio', 'toquio', 'tokyo',
      'madri', 'madrid', 'barcelona', 'cancun', 'cancún',
      'santiago', 'lima', 'bogotá', 'bogota', 'montevidéu', 'montevideu'
    ];

    // Função para capturar cidade (1 a 5 palavras, sem stopwords no final) e opcionalmente uma sigla (XXX)
    const cityCapture = `([A-Za-záéíóúãõâêôçüÀ-ÿ]+(?:\\s+(?:de|do|da|dos|das)\\s+[A-Za-záéíóúãõâêôçüÀ-ÿ]+|\\s+[A-Za-záéíóúãõâêôçüÀ-ÿ]+){0,4}(?:\\s*\\([A-Z]{3}\\))?)`;

    // ---- EXTRAÇÃO DE ORIGEM ----
    const originRegexes = [
      // "Origem: Recife" ou "Origem Recife"
      new RegExp(`\\borigem\\s*[:\\-]?\\s*${cityCapture}`, 'i'),
      // "saindo de Recife", "partindo de Recife", "saio de Recife", "parto de Recife"
      new RegExp(`\\b(?:saindo|partindo|saio|parto|sa[ií]da)\\s+d[eao]\\s+${cityCapture}`, 'i'),
      // "de Recife para..."
      new RegExp(`\\bd[eao]\\s+${cityCapture}\\s+(?:para|até|ate|pra|pro)\\s+`, 'i'),
      // "vou sair de Recife"
      new RegExp(`\\bvou\\s+sair\\s+d[eao]\\s+${cityCapture}`, 'i'),
      // "de Recife" isolado
      new RegExp(`^d[eao]\\s+${cityCapture}$`, 'i'),
    ];

    for (const rx of originRegexes) {
      const m = cleanInput.match(rx);
      if (m && m[1]) {
        const candidate = cleanCity(m[1]);
        if (candidate) { origin = candidate; break; }
      }
    }

    // ---- EXTRAÇÃO DE DESTINO ----
    const destRegexes = [
      // "Destino: Rio de Janeiro" ou "Destino Rio de Janeiro"
      new RegExp(`\\bdestino\\s*[:\\-]?\\s*${cityCapture}`, 'i'),
      // "para o Rio de Janeiro", "para Rio de Janeiro", "pro Rio", "pra Salvador"
      new RegExp(`\\b(?:para\\s+o|para\\s+a|para|pra\\s+o|pra\\s+a|pra|pro|até\\s+o|até\\s+a|até|ate)\\s+${cityCapture}`, 'i'),
      // "ao Rio de Janeiro", "à Salvador"
      new RegExp(`\\b(?:ao|à|a)\\s+${cityCapture}`, 'i'),
      // "ir para Rio", "ir ao Rio", "ir em Rio"
      new RegExp(`\\bir\\s+(?:para\\s+o|para\\s+a|para|ao|à|em|no|na)\\s+${cityCapture}`, 'i'),
      // "viagem ao Rio de Janeiro", "viagem para Paris"
      new RegExp(`\\bviagem\\s+(?:ao|à|para\\s+o|para\\s+a|para|pra|pro|em|no|na)\\s+${cityCapture}`, 'i'),
      // "Viagem Rio de Janeiro" (sem preposição)
      new RegExp(`\\bviagem\\s+${cityCapture}`, 'i'),
      // "conhecer o Rio", "visitar Paris"
      new RegExp(`\\b(?:conhecer|visitar)\\s+(?:o|a)?\\s*${cityCapture}`, 'i'),
    ];

    for (const rx of destRegexes) {
      const m = cleanInput.match(rx);
      if (m && m[1]) {
        const candidate = cleanCity(m[1]);
        if (candidate && candidate.toLowerCase() !== (origin || '').toLowerCase()) {
          destination = candidate; break;
        }
      }
    }

    // Se não achou destino com padrões, tenta achar cidade conhecida no texto
    if (!destination) {
      const lowerInput = cleanInput.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      for (const city of knownCities) {
        const normalizedCity = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (lowerInput.includes(normalizedCity) && normalizedCity !== (origin || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
          // Capitalizar primeira letra de cada palavra
          destination = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          break;
        }
      }
    }

    return { origin, destination };
  }
};

// Função utilitária para limpar candidato de cidade
function cleanCity(raw) {
  if (!raw) return null;
  let cleaned = raw.trim()
    // Remover artigos no início
    .replace(/^(?:o|a|os|as|um|uma|uns|umas)\s+/i, '')
    // Remover prefixos comuns de localidade no início
    .replace(/^(?:cidade\s+de\s+|cidade\s+|munic[ií]pio\s+de\s+|munic[ií]pio\s+|estado\s+de\s+|regi[aã]o\s+de\s+)/i, '')
    .trim();

  if (!cleaned || /^\d+$/.test(cleaned)) return null;

  // Preservar "João Pessoa" ignorando a palavra "pessoa" como boundary
  if (/joa[oõ]?\s+pessoa/i.test(cleaned)) {
    return 'João Pessoa';
  }

  // Truncar o nome da cidade se encontrarmos delimitadores de outros dados
  const boundaryWords = [
    'dia', 'dias', 'data', 'datas', 'ida', 'volta', 'com', 'em', 'para', 'pra', 'pro',
    'adulto', 'adultos', 'pessoa', 'pessoas', 'pax', 'quartos', 'quarto', 'hotel',
    'hospedagem', 'passagem', 'passagens', 'viagem', 'voo', 'voos', 'roteiro', 'classe',
    'orçamento', 'orcamento', 'saida', 'saída', 'saindo', 'partindo', 'origem'
  ];

  const tokens = cleaned.split(/\s+/);
  const finalTokens = [];
  for (const token of tokens) {
    const lowerToken = token.toLowerCase();
    if (
      /^\d+[\/\-]\d+/.test(token) || 
      /^\d+$/.test(token) || 
      boundaryWords.includes(lowerToken)
    ) {
      break;
    }
    finalTokens.push(token);
  }

  if (finalTokens.length === 0) return null;
  cleaned = finalTokens.join(' ').trim();

  // Remover trailing stopwords/preposições que sobraram antes do corte
  cleaned = cleaned.replace(/\s+(?:de|do|da|dos|das|com|e|por|em|no|na|nos|nas)$/i, '').trim();

  const stopwords = ['um', 'uma', 'para', 'hotel', 'airbnb', 'pousada', 'roteiro', 'hospedagem', 'passagem', 'passagens', 'viagem', 'voo', 'vôo', 'dias', 'dia', 'classe', 'economica', 'adulto', 'adultos', 'criança', 'crianças', 'pessoa', 'pessoas', 'serviços', 'servicos', 'orçamento', 'orcamento'];
  if (stopwords.includes(cleaned.toLowerCase())) return null;

  // Capitalizar
  cleaned = cleaned.split(' ').map(w => {
    if (w.match(/^\([a-z]{3}\)$/i)) return w.toUpperCase();
    const lower = w.toLowerCase();
    if (['de', 'do', 'da', 'dos', 'das', 'e'].includes(lower)) return lower;
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');

  return cleaned;
}

// Agente especialista em Datas e Períodos
export const AgenteTemporal = {
  process: (input) => {
    // Padrão de data: DD/MM/YYYY, DD-MM-YYYY, DD/MM/YY, DD/MM (sem ano)
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/g;
    const dates = input.match(datePattern) || [];

    // Captura "X dias"
    const daysMatch = input.match(/\b(\d+)\s*dias?\b/i);

    let startDate = null;
    let endDate = null;

    // Padrões explícitos de ida
    const idaPatterns = [
      /(?:ida|indo|partida|saída|saida|saio|saindo|check[\s-]?in|embarque|embarco)\s*(?:em|no|na|dia|:)?\s*(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/i,
      /(?:dia)\s+(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/i,
    ];

    // Padrões explícitos de volta
    const voltaPatterns = [
      /(?:volta|voltando|retorno|retornando|chegada|volto|check[\s-]?out|desembarque)\s*(?:em|no|na|dia|:)?\s*(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/i,
    ];

    for (const rx of idaPatterns) {
      const m = input.match(rx);
      if (m) { startDate = m[1]; break; }
    }

    for (const rx of voltaPatterns) {
      const m = input.match(rx);
      if (m) { endDate = m[1]; break; }
    }

    // Padrão "DD/MM/YYYY a DD/MM/YYYY" ou "DD/MM/YYYY até DD/MM/YYYY"
    const rangeMatch = input.match(
      /(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\s*(?:a|até|ate|ao|[-–])\s*(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/i
    );
    if (rangeMatch) {
      if (!startDate) startDate = rangeMatch[1];
      if (!endDate) endDate = rangeMatch[2];
    }

    // Fallback: primeira e segunda datas no texto
    if (!startDate && dates.length >= 1) {
      startDate = dates[0];
    }
    if (!endDate && dates.length >= 2) {
      // Pegar a segunda data diferente da primeira
      endDate = dates.find((d, i) => i > 0 && d !== startDate) || dates[1];
    }

    return {
      startDate,
      endDate,
      days: daysMatch ? parseInt(daysMatch[1]) : null
    };
  }
};
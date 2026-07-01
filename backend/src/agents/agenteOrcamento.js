const getIataCode = (cityName) => {
  if (!cityName) return '';

  return cityName.trim();
};

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const slugify = (text) => {
  if (!text) return '';
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, '-');
};

const resolveFlightCity = (cityName) => {
  if (!cityName) return '';

  const normalized = normalizeText(cityName);

  const map = {
    // Brasil - Capitais e Cidades Importantes
    'sao paulo': 'SAO', 'são paulo': 'SAO',
    'rio de janeiro': 'RIO', 'rio': 'RIO',
    'recife': 'REC',
    'salvador': 'SSA',
    'belo horizonte': 'BHZ',
    'brasilia': 'BSB', 'brasília': 'BSB',
    'curitiba': 'CWB',
    'fortaleza': 'FOR',
    'manaus': 'MAO',
    'belem': 'BEL', 'belém': 'BEL',
    'goiania': 'GYN', 'goiânia': 'GYN',
    'porto alegre': 'POA',
    'natal': 'NAT',
    'maceio': 'MCZ', 'maceió': 'MCZ',
    'joao pessoa': 'JPA', 'joão pessoa': 'JPA', 'joa pessoa': 'JPA',
    'florianopolis': 'FLN', 'florianópolis': 'FLN',
    'vitoria': 'VIX', 'vitória': 'VIX',
    'campinas': 'VCP',
    'foz do iguacu': 'IGU', 'foz do iguaçu': 'IGU',
    'fernando de noronha': 'FEN',
    'aracaju': 'AJU',
    'boa vista': 'BVB',
    'campo grande': 'CGR',
    'cuiaba': 'CGB', 'cuiabá': 'CGB',
    'macapa': 'MCP', 'macapá': 'MCP',
    'palmas': 'PMW',
    'porto velho': 'PVH',
    'rio branco': 'RBR',
    'sao luis': 'SLZ', 'são luís': 'SLZ',
    'teresina': 'THE',
    'campina grande': 'CPV',
    'navegantes': 'NVT',
    'porto seguro': 'BPS',
    'uberlandia': 'UDI', 'uberlândia': 'UDI',
    'londrina': 'LDB',
    'ribeirao preto': 'RAO', 'ribeirão preto': 'RAO',
    'joinville': 'JOI',
    'juazeiro do norte': 'JDO',
    'ilheus': 'IOS', 'ilhéus': 'IOS',
    'petrolina': 'PNZ',
    'chapeco': 'XAP', 'chapecó': 'XAP',
    'caxias do sul': 'CXJ',
    'maringa': 'MGF', 'maringá': 'MGF',
    'cascavel': 'CAC',

    // Brasil - Estados (mapeados para seus principais aeroportos de capital)
    'acre': 'RBR',
    'alagoas': 'MCZ',
    'amapa': 'MCP', 'amapá': 'MCP',
    'amazonas': 'MAO',
    'bahia': 'SSA',
    'ceara': 'FOR', 'ceará': 'FOR',
    'distrito federal': 'BSB',
    'espirito santo': 'VIX', 'espírito santo': 'VIX',
    'goias': 'GYN', 'goiás': 'GYN',
    'maranhao': 'SLZ', 'maranhão': 'SLZ',
    'mato grosso': 'CGB',
    'mato grosso do sul': 'CGR',
    'minas gerais': 'CNF',
    'para': 'BEL', 'pará': 'BEL',
    'paraiba': 'JPA', 'paraíba': 'JPA',
    'parana': 'CWB', 'paraná': 'CWB',
    'pernambuco': 'REC',
    'piaui': 'THE', 'piauí': 'THE',
    'rio grande do norte': 'NAT',
    'rio grande do sul': 'POA',
    'rondonia': 'PVH', 'rondônia': 'PVH',
    'roraima': 'BVB',
    'santa catarina': 'FLN',
    'sergipe': 'AJU',
    'tocantins': 'PMW',

    // Internacional
    'paris': 'CDG',
    'nova york': 'JFK', 'new york': 'JFK',
    'orlando': 'MCO',
    'miami': 'MIA',
    'buenos aires': 'EZE',
    'roma': 'FCO', 'rome': 'FCO',
    'toquio': 'NRT', 'tokyo': 'NRT', 'tóquio': 'NRT',
    'londres': 'LHR', 'london': 'LHR',
    'lisboa': 'LIS', 'lisbon': 'LIS',
    'madri': 'MAD', 'madrid': 'MAD',
    'barcelona': 'BCN',
    'cancun': 'CUN', 'cancún': 'CUN',
    'santiago': 'SCL',
    'lima': 'LIM',
    'bogota': 'BOG', 'bogotá': 'BOG',
    'montevideu': 'MVD', 'montevidéu': 'MVD',
    'paraguai': 'ASU', 'paraguay': 'ASU'
  };

  const nearestAirportCity = {
    'porto de galinhas': 'REC',
    'maragogi': 'MCZ',
    'gramado': 'POA',
    'canela': 'POA',
    'buzios': 'GIG',
    'arraial do cabo': 'GIG',
    'pipa': 'NAT',
    'jericoacoara': 'FOR',
  };

  // Se o nome da cidade já vier com a sigla em parênteses, ex: "Sao Paulo (GRU)", extraímos a sigla
  const iataMatch = cityName.match(/\(([A-Za-z]{3})\)/);
  if (iataMatch) {
    return iataMatch[1].toUpperCase();
  }

  // Retorna código IATA do mapa, ou do aeroporto mais próximo, ou o próprio nome da cidade
  return map[normalized] || nearestAirportCity[normalized] || cityName.trim();
};

const formatToYYYYMMDD = (dateStr) => {
  if (!dateStr) return '';

  const parts = dateStr.split(/[\/\-]/);

  if (parts.length >= 2) {
    let day = parts[0];
    let month = parts[1];
    let year = parts[2] || new Date().getFullYear().toString();

    if (year.length === 2) year = '20' + year;
    if (day.length === 1) day = '0' + day;
    if (month.length === 1) month = '0' + month;

    return `${year}-${month}-${day}`;
  }

  return dateStr;
};

const addDaysToDateStr = (dateStr, days) => {
  if (!dateStr) return '';
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length >= 2) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    let year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
    if (year < 100) year += 2000;
    const date = new Date(year, month, day);
    date.setDate(date.getDate() + days);
    
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
  return dateStr;
};

const getAirportRegion = (code) => {
  if (!code) return 'SE';
  const c = code.toUpperCase();
  
  const NE = ['REC', 'SSA', 'FOR', 'NAT', 'MCZ', 'JPA', 'AJU', 'SLZ', 'THE', 'CPV', 'BPS', 'IOS', 'PNZ', 'FEN'];
  const SE = ['SAO', 'RIO', 'BHZ', 'VIX', 'VCP', 'RAO', 'UDI', 'CNF', 'GRU', 'GIG'];
  const CO = ['BSB', 'GYN', 'CGR', 'CGB'];
  const S = ['CWB', 'POA', 'FLN', 'NVT', 'JOI', 'CXJ', 'XAP', 'MGF', 'CAC', 'IGU'];
  const N = ['MAO', 'BEL', 'PVH', 'RBR', 'MCP', 'PMW', 'BVB'];
  
  if (NE.includes(c)) return 'NE';
  if (SE.includes(c)) return 'SE';
  if (CO.includes(c)) return 'CO';
  if (S.includes(c)) return 'S';
  if (N.includes(c)) return 'N';
  
  return 'SE';
};

const getDomesticFlightPrice = (origin, destination) => {
  const codeO = resolveFlightCity(origin);
  const codeD = resolveFlightCity(destination);
  const regO = getAirportRegion(codeO);
  const regD = getAirportRegion(codeD);
  
  if (regO === regD) {
    return 600 + Math.floor(Math.random() * 200 - 100);
  }
  
  if ((regO === 'NE' && regD === 'SE') || (regO === 'SE' && regD === 'NE')) {
    return 1100 + Math.floor(Math.random() * 200 - 100);
  }
  
  if ((regO === 'NE' && regD === 'CO') || (regO === 'CO' && regD === 'NE')) {
    return 1450 + Math.floor(Math.random() * 200 - 100);
  }
  
  if ((regO === 'NE' && regD === 'S') || (regO === 'S' && regD === 'NE')) {
    return 1550 + Math.floor(Math.random() * 300 - 150);
  }
  
  if ((regO === 'SE' && regD === 'S') || (regO === 'S' && regD === 'SE')) {
    return 680 + Math.floor(Math.random() * 160 - 80);
  }
  
  if ((regO === 'SE' && regD === 'CO') || (regO === 'CO' && regD === 'SE')) {
    return 650 + Math.floor(Math.random() * 150 - 75);
  }
  
  if ((regO === 'SE' && regD === 'N') || (regO === 'N' && regD === 'SE')) {
    return 1250 + Math.floor(Math.random() * 300 - 150);
  }
  
  return 1750 + Math.floor(Math.random() * 400 - 200);
};

const buildFlightSearchUrl = (data) => {
  const originCode = resolveFlightCity(data.origin);
  const destinationCode = resolveFlightCity(data.destination);
  const startFormatted = formatToYYYYMMDD(data.startDate);
  const endFormatted = data.endDate ? formatToYYYYMMDD(data.endDate) : '';
  const passengers = data.passengers || 1;

  // Se o código de origem ou destino não for IATA (3 letras maiúsculas), formatamos o nome da cidade com hífens
  const originParam = /^[A-Z]{3}$/.test(originCode) 
    ? originCode 
    : slugify(data.origin || '');
    
  const destParam = /^[A-Z]{3}$/.test(destinationCode) 
    ? destinationCode 
    : slugify(data.destination || '');

  if (!originParam || !destParam) {
    return '#';
  }

  // Geramos sempre o link direto do Kayak (voos)
  let path = `flights/${originParam}-${destParam}/${startFormatted}`;
  if (endFormatted) {
    path += `/${endFormatted}`;
  }
  path += `/${passengers}adults`;
  return `https://www.kayak.com.br/${path}?sort=bestflight_a`;
};

const capitalizeCity = (name) => {
  return name
    .split(' ')
    .map(word => {
      const lower = word.toLowerCase();
      if (['de', 'do', 'da', 'dos', 'das', 'e'].includes(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

const buildAccommodationSearchUrl = (data) => {
  // Para hospedagem focamos apenas no nome da cidade, removendo a sigla IATA se houver
  const pureDestination = (data.destination || '').replace(/\s*\([A-Z]{3}\)/i, '').trim();
  const checkin = formatToYYYYMMDD(data.startDate);
  
  let checkoutDate = data.endDate;
  if (!checkoutDate && data.startDate) {
    const days = data.days || 1;
    checkoutDate = addDaysToDateStr(data.startDate, days);
  }
  const checkout = formatToYYYYMMDD(checkoutDate);
  const passengers = data.passengers || 1;
  const rooms = data.rooms || 1;
  const type = (data.accommodationType || 'hotel').toLowerCase();

  const isAirbnbType = ['airbnb', 'apartamento', 'casa', 'aluguel por temporada', 'temporada'].includes(type);

  if (isAirbnbType) {
    const bedroomsParam = rooms > 1 ? `&min_bedrooms=${rooms}` : '';
    return `https://www.airbnb.com.br/s/${encodeURIComponent(pureDestination)}/homes?checkin=${checkin}&checkout=${checkout}&adults=${passengers}${bedroomsParam}`;
  }

  // Kayak Hotéis: Excelente buscador que preenche perfeitamente destino, check-in, check-out, hóspedes e quartos.
  const formattedDest = slugify(pureDestination);
  const roomsPath = rooms > 1 ? `/${rooms}rooms` : '';
  return `https://www.kayak.com.br/hotels/${formattedDest}/${checkin}/${checkout}/${passengers}adults${roomsPath}`;
};

const formatRangeBRL = (min, max) => {
  if (min === 0 && max === 0) return 'R$ 0,00';
  return `R$ ${min.toFixed(2)} - R$ ${max.toFixed(2)}`;
};

export const AgenteOrcamento = {
  calculate: (data, destinationInfo) => {
    const logs = [];
    logs.push(`[Agente de Orçamento] Iniciando cálculo financeiro para: "${destinationInfo.name}"`);

    const passengers = data.passengers || 1;
    const rooms = data.rooms || 1;
    const days = data.days || 5;
    const services = data.services || [];

    logs.push(`[Agente de Orçamento] Parâmetros: ${passengers} pax, ${rooms} quarto(s), ${days} dia(s).`);

    const rate = destinationInfo.exchangeRateToBRL;
    const localSymbol = destinationInfo.currencySymbol;
    const localCurrency = destinationInfo.currency;

    let flightCostPerPersonBRL = 0;

    if (services.includes('flight')) {
      if (destinationInfo.currency === 'BRL') {
        const originCode = resolveFlightCity(data.origin);
        const destinationCode = resolveFlightCity(data.destination);
        flightCostPerPersonBRL = getDomesticFlightPrice(originCode, destinationCode);
      } else {
        if (destinationInfo.currency === 'ARS') flightCostPerPersonBRL = 2200;
        else if (destinationInfo.currency === 'USD') flightCostPerPersonBRL = 4500;
        else if (destinationInfo.currency === 'EUR') flightCostPerPersonBRL = 5500;
        else if (destinationInfo.currency === 'JPY') flightCostPerPersonBRL = 8500;
        else flightCostPerPersonBRL = 3000;

        flightCostPerPersonBRL += Math.floor(Math.random() * 200 - 100);
      }
    }

    let accommodationDailyLocal = 0;
    let accommodationDailyBRL = 0;
    const type = data.accommodationType || 'hotel';
    const isAirbnbType = ['airbnb', 'apartamento', 'casa', 'aluguel por temporada', 'temporada'].includes(type.toLowerCase());

    if (services.includes('accommodation')) {
      const baseCost = destinationInfo.baseDailyCostPerPerson;
      let multiplier = 1.0;

      if (type === 'resort') multiplier = 1.4;
      else if (type === 'hotel') multiplier = 0.75;
      else if (type === 'pousada') multiplier = 0.5;
      else if (type === 'airbnb') multiplier = 0.6;
      else if (type === 'apartamento') multiplier = 0.65;
      else if (type === 'casa') multiplier = 0.75;
      else if (type === 'aluguel por temporada') multiplier = 0.65;

      accommodationDailyLocal = baseCost * multiplier;
      accommodationDailyLocal += Math.random() * (baseCost * 0.1);
      accommodationDailyBRL = accommodationDailyLocal * rate;
    }

    let activityDailyLocal = 0;
    let activityDailyPerPersonBRL = 0;

    if (services.includes('itinerary')) {
      const baseCost = destinationInfo.baseDailyCostPerPerson;
      activityDailyLocal = baseCost * 0.5;
      activityDailyPerPersonBRL = activityDailyLocal * rate;
    }

    let totalFlightBRL = flightCostPerPersonBRL * passengers;
    let totalAccommodationBRL = accommodationDailyBRL * days * rooms;
    let totalActivitiesBRL = activityDailyPerPersonBRL * days * passengers;
    let totalBRL = totalFlightBRL + totalAccommodationBRL + totalActivitiesBRL;

    logs.push(`[Agente de Orçamento] Estimativa inicial calculada: R$ ${totalBRL.toFixed(2)}`);

    let isOptimized = false;
    let optimizationNote = "";

    if (data.maxBudget && totalBRL > data.maxBudget) {
      const maxBudgetVal = parseFloat(data.maxBudget);
      logs.push(`[Agente de Orçamento] [OTIMIZADOR] O custo estimado excede o limite do usuário (R$ ${maxBudgetVal.toFixed(2)}). Iniciando filtragem de tarifas econômicas...`);

      if (services.includes('flight')) {
        flightCostPerPersonBRL = flightCostPerPersonBRL * 0.75;
        totalFlightBRL = flightCostPerPersonBRL * passengers;
        logs.push(`[Agente de Orçamento] [OTIMIZADOR] Passagem aérea filtrada para tarifa promocional: R$ ${flightCostPerPersonBRL.toFixed(2)} por pessoa.`);
      }

      if (services.includes('accommodation')) {
        accommodationDailyLocal = accommodationDailyLocal * 0.7;
        accommodationDailyBRL = accommodationDailyLocal * rate;
        totalAccommodationBRL = accommodationDailyBRL * days * rooms;
        logs.push(`[Agente de Orçamento] [OTIMIZADOR] Hospedagem ajustada para tarifa econômica / alternativa: R$ ${accommodationDailyBRL.toFixed(2)} por dia (${rooms} quarto(s)).`);
      }

      if (services.includes('itinerary')) {
        activityDailyLocal = activityDailyLocal * 0.85;
        activityDailyPerPersonBRL = activityDailyLocal * rate;
        totalActivitiesBRL = activityDailyPerPersonBRL * days * passengers;
        logs.push(`[Agente de Orçamento] [OTIMIZADOR] Despesas de alimentação/roteiro otimizadas: R$ ${activityDailyPerPersonBRL.toFixed(2)} por dia.`);
      }

      totalBRL = totalFlightBRL + totalAccommodationBRL + totalActivitiesBRL;
      isOptimized = true;
      optimizationNote = "Nota de Otimização: Ajustamos os voos e a hospedagem para tarifas promocionais e categorias econômicas para que a viagem caiba no seu orçamento.";
      logs.push(`[Agente de Orçamento] [OTIMIZADOR] Novo orçamento recalculado após filtragem: R$ ${totalBRL.toFixed(2)}`);
    }

    const totalFlightLocal = totalFlightBRL / rate;
    const totalAccommodationLocal = accommodationDailyLocal * days * rooms;
    const totalActivitiesLocal = activityDailyLocal * days * passengers;
    const totalLocal = totalFlightLocal + totalAccommodationLocal + totalActivitiesLocal;

    const flightSearchUrl = buildFlightSearchUrl(data);
    const accommodationSearchUrl = buildAccommodationSearchUrl(data);


    logs.push(`[Agente de Orçamento] Links reais de busca gerados.`);
    logs.push(`[Agente de Orçamento] Link de Voo (Kayak): ${flightSearchUrl}`);
    logs.push(`[Agente de Orçamento] Link de Acomodação (Kayak Hotéis): ${accommodationSearchUrl}`);


    let budgetAlert = null;

    if (data.maxBudget) {
      const maxBudgetVal = parseFloat(data.maxBudget);

      if (totalBRL > maxBudgetVal) {
        const diff = totalBRL - maxBudgetVal;
        budgetAlert = `Atenção: Mesmo com tarifas econômicas e reajustes, a viagem estimada (R$ ${totalBRL.toFixed(2)}) ultrapassa o limite de R$ ${maxBudgetVal.toFixed(2)} em R$ ${diff.toFixed(2)}.`;
      } else {
        budgetAlert = `Sucesso! Ajustamos o pacote e a estimativa de R$ ${totalBRL.toFixed(2)} está dentro do seu orçamento máximo (R$ ${maxBudgetVal.toFixed(2)}).`;
      }
    }

    const minFlightPerPerson = flightCostPerPersonBRL * 0.92;
    const maxFlightPerPerson = flightCostPerPersonBRL * 1.08;
    const minTotalFlight = totalFlightBRL * 0.92;
    const maxTotalFlight = totalFlightBRL * 1.08;

    const minAccommodationDaily = accommodationDailyBRL * 0.9;
    const maxAccommodationDaily = accommodationDailyBRL * 1.1;
    const minTotalAccommodation = totalAccommodationBRL * 0.9;
    const maxTotalAccommodation = totalAccommodationBRL * 1.1;

    const minActivityDaily = activityDailyPerPersonBRL * 0.85;
    const maxActivityDaily = activityDailyPerPersonBRL * 1.15;
    const minTotalActivities = totalActivitiesBRL * 0.85;
    const maxTotalActivities = totalActivitiesBRL * 1.15;

    const minTotalBRL = minTotalFlight + minTotalAccommodation + minTotalActivities;
    const maxTotalBRL = maxTotalFlight + maxTotalAccommodation + maxTotalActivities;
    const minTotalPerPerson = passengers > 0 ? minTotalBRL / passengers : minTotalBRL;
    const maxTotalPerPerson = passengers > 0 ? maxTotalBRL / passengers : maxTotalBRL;

    const accommodationPerPersonBRL = passengers > 0 ? totalAccommodationBRL / passengers : totalAccommodationBRL;
    const accommodationPerPersonDailyBRL = passengers > 0 ? accommodationDailyBRL / passengers : accommodationDailyBRL;
    const totalPerPersonBRL = passengers > 0 ? totalBRL / passengers : totalBRL;

    return {
      passengers,
      flightCostPerPerson: `R$ ${flightCostPerPersonBRL.toFixed(2)}`,
      totalFlightBRL: `R$ ${totalFlightBRL.toFixed(2)}`,
      accommodationDailyBRL: `R$ ${accommodationDailyBRL.toFixed(2)}`,
      accommodationPerPersonBRL: `R$ ${accommodationPerPersonBRL.toFixed(2)}`,
      accommodationPerPersonDailyBRL: `R$ ${accommodationPerPersonDailyBRL.toFixed(2)}`,
      accommodationDailyLocal: `${localSymbol} ${accommodationDailyLocal.toFixed(2)}`,
      totalAccommodationBRL: `R$ ${totalAccommodationBRL.toFixed(2)}`,
      totalAccommodationLocal: `${localSymbol} ${totalAccommodationLocal.toFixed(2)}`,
      activityDailyPerPersonBRL: `R$ ${activityDailyPerPersonBRL.toFixed(2)}`,
      activityDailyLocal: `${localSymbol} ${activityDailyLocal.toFixed(2)}`,
      totalActivitiesBRL: `R$ ${totalActivitiesBRL.toFixed(2)}`,
      totalActivitiesLocal: `${localSymbol} ${totalActivitiesLocal.toFixed(2)}`,
      totalBRL: `R$ ${totalBRL.toFixed(2)}`,
      totalPerPersonBRL: `R$ ${totalPerPersonBRL.toFixed(2)}`,
      totalLocal: `${localSymbol} ${totalLocal.toFixed(2)}`,
      exchangeRateText: `1 ${localCurrency} = R$ ${rate.toFixed(4)}`,
      accommodationProvider: isAirbnbType ? 'Airbnb' : 'Kayak Hotéis',
      
      // NOVOS CAMPOS DE FAIXA E MÉDIA
      totalFlightBRLRange: formatRangeBRL(minTotalFlight, maxTotalFlight),
      totalFlightBRLMedia: `R$ ${totalFlightBRL.toFixed(2)}`,
      flightCostPerPersonRange: formatRangeBRL(minFlightPerPerson, maxFlightPerPerson),
      flightCostPerPersonMedia: `R$ ${flightCostPerPersonBRL.toFixed(2)}`,
      
      totalAccommodationBRLRange: formatRangeBRL(minTotalAccommodation, maxTotalAccommodation),
      totalAccommodationBRLMedia: `R$ ${totalAccommodationBRL.toFixed(2)}`,
      accommodationDailyBRLRange: formatRangeBRL(minAccommodationDaily, maxAccommodationDaily),
      accommodationDailyBRLMedia: `R$ ${accommodationDailyBRL.toFixed(2)}`,
      
      totalActivitiesBRLRange: formatRangeBRL(minTotalActivities, maxTotalActivities),
      totalActivitiesBRLMedia: `R$ ${totalActivitiesBRL.toFixed(2)}`,
      activityDailyPerPersonBRLRange: formatRangeBRL(minActivityDaily, maxActivityDaily),
      activityDailyPerPersonBRLMedia: `R$ ${activityDailyPerPersonBRL.toFixed(2)}`,
      
      totalBRLRange: formatRangeBRL(minTotalBRL, maxTotalBRL),
      totalBRLMedia: `R$ ${totalBRL.toFixed(2)}`,
      totalPerPersonBRLRange: formatRangeBRL(minTotalPerPerson, maxTotalPerPerson),
      totalPerPersonBRLMedia: `R$ ${totalPerPersonBRL.toFixed(2)}`,

      flightSearchUrl,
      accommodationSearchUrl,
      isOptimized,
      optimizationNote,
      budgetAlert,
      logs
    };
  }
};
import { knowledgeBase } from '../data/knowledgeBase.js';

export const AgenteConhecimento = {
  process: (destinationName) => {
    const logs = [];
    logs.push(`[Agente de Conhecimento] Recebida requisição para o destino: "${destinationName}"`);

    if (!destinationName) {
      logs.push(`[Agente de Conhecimento] Erro: Nenhum destino foi especificado.`);
      return {
        found: false,
        name: "Destino desconhecido",
        currency: "BRL",
        currencySymbol: "R$",
        exchangeRateToBRL: 1.0,
        attractions: ["Passeio pelo centro histórico", "Visitar o mirante principal", "Provar a culinária local"],
        tips: ["Documentação: Mantenha sempre seus documentos oficiais em mãos.", "Planejamento: Reserve passeios principais com antecedência."],
        baseDailyCostPerPerson: 200,
        logs
      };
    }

    const key = destinationName.toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove acentos
    
    logs.push(`[Agente de Conhecimento] Buscando na base de conhecimento pela chave: "${key}"`);

    // Busca direta ou aproximada
    let match = knowledgeBase[key];
    if (!match) {
      // Tenta achar alguma chave que contenha ou esteja contida na busca
      const foundKey = Object.keys(knowledgeBase).find(k => k.includes(key) || key.includes(k));
      if (foundKey) {
        match = knowledgeBase[foundKey];
        logs.push(`[Agente de Conhecimento] Correspondência aproximada encontrada: "${foundKey}"`);
      }
    }

    if (match) {
      logs.push(`[Agente de Conhecimento] Destino encontrado! Nome oficial: "${match.name}".`);
      logs.push(`[Agente de Conhecimento] Moeda local: ${match.currency} (${match.currencySymbol}). Cotação base: R$ ${match.exchangeRateToBRL}`);
      logs.push(`[Agente de Conhecimento] Carregadas ${match.attractions.length} principais atrações turísticas.`);
      logs.push(`[Agente de Conhecimento] Carregadas ${match.tips.length} dicas práticas.`);
      
      return {
        found: true,
        ...match,
        logs
      };
    } else {
      logs.push(`[Agente de Conhecimento] Destino "${destinationName}" não encontrado na base de conhecimento local.`);
      logs.push(`[Agente de Conhecimento] Utilizando informações genéricas e sugerindo cadastro futuro.`);
      
      return {
        found: false,
        name: destinationName,
        currency: "BRL",
        currencySymbol: "R$",
        exchangeRateToBRL: 1.0,
        attractions: [
          "Centro histórico da cidade",
          "Principais museus locais",
          "Parques e áreas naturais",
          "Feiras de artesanato locais",
          "Restaurantes tradicionais"
        ],
        tips: [
          "Documentação: Certifique-se de ter passaporte ou documento de identidade válidos para o local.",
          "Saúde: Verifique se o destino exige alguma vacina obrigatória antes de embarcar.",
          "Idioma: Aprenda algumas palavras de cortesia locais caso viaje para fora do país."
        ],
        baseDailyCostPerPerson: 220,
        logs
      };
    }
  }
};

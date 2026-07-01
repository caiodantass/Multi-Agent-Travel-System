export const AgenteValidador = {
  validatePlan: (data, budgetResult, weatherResult) => {
    const logs = [];
    logs.push(`[Agente Validador] Iniciando auditoria de qualidade do planejamento.`);

    const warnings = [];
    let approved = true;
    let score = 100;

    const days = data.days || 5;
  
    const accType = data.accommodationType || "hotel";
    const destination = (data.destination || "").toLowerCase();

    // 1. CHECAGEM DE COERÊNCIA DAS DATAS
    if (data.startDate && data.endDate) {
      logs.push(`[Agente Validador] Validando datas da viagem: ${data.startDate} até ${data.endDate}`);
      
      const parseDate = (dStr) => {
        const parts = dStr.split(/[\/\-]/);
        if (parts.length >= 2) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
          return new Date(year, month, day);
        }
        return null;
      };

      const start = parseDate(data.startDate);
      const end = parseDate(data.endDate);

      if (start && end) {
        if (end < start) {
          approved = false;
          score -= 40;
          warnings.push("ERRO CRÍTICO: A data de volta/check-out é anterior à data de ida/check-in.");
          logs.push(`[Agente Validador] FALHA DE VALIDAÇÃO: Volta (${data.endDate}) antes da ida (${data.startDate})`);
        } else {
          logs.push(`[Agente Validador] Cronograma de datas validado com sucesso.`);
        }
      }
    }

    // 2. CHECAGEM DE DURAÇÃO VS DESTINO
    const isInternational = /(paris|new york|roma|tokyo|toquio|orlando)/i.test(destination);
    if (isInternational && days < 6) {
      score -= 15;
      warnings.push(`Duração recomendada: Para destinos distantes como ${data.destination}, sugerimos pelo menos 6 ou 7 dias. ${days} dias é muito pouco tempo considerando o fuso horário e cansaço do voo.`);
      logs.push(`[Agente Validador] Alerta emitido: Viagem internacional muito curta (${days} dias).`);
    }

    // 3. COERÊNCIA DE HOSPEDAGEM
    if (days > 10 && accType === 'hotel') {
      warnings.push("Dica de Estadia: Para estadias longas (mais de 10 dias), alugar um 'airbnb' ou 'casa' pode ser mais econômico e confortável do que um hotel.");
      logs.push(`[Agente Validador] Sugestão de acomodação para estadia longa.`);
    }

    // 4. ANÁLISE DE ORÇAMENTO (Do AgenteOrcamento)
    if (budgetResult && budgetResult.budgetAlert && budgetResult.budgetAlert.includes("ultrapassa")) {
      score -= 20;
      warnings.push("Atenção Financeira: Seu orçamento estimado ultrapassa o teto definido. Dica: Altere a acomodação para 'airbnb' ou 'pousada', ou reduza o número de dias.");
      logs.push(`[Agente Validador] Nota fiscalizada: Limite de orçamento excedido. Adicionando conselho financeiro.`);
    }

    // Determinar status final
    if (score < 60) {
      approved = false;
    }
    
    logs.push(`[Agente Validador] Auditoria concluída. Nota final de viabilidade: ${score}/100. Status: ${approved ? 'APROVADO' : 'CORREÇÕES NECESSÁRIAS'}`);

    return {
      approved,
      warnings,
      score,
      logs
    };
  }
};

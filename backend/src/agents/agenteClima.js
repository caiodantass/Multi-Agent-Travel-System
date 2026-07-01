export const AgenteClima = {
  getForecast: (destinationName, startDate) => {
    const logs = [];
    logs.push(`[Agente do Clima] Iniciando consulta de previsão climática para: "${destinationName}"`);

    let month = 5; // Maio por padrão (mês atual da simulação)
    if (startDate) {
      logs.push(`[Agente do Clima] Analisando data de ida: "${startDate}"`);
      const match = startDate.match(/(?:[\/\-])(\d{1,2})(?:[\/\-])?/);
      if (match) {
        month = parseInt(match[1]);
        logs.push(`[Agente do Clima] Mês detectado da viagem: ${month} (1-12)`);
      }
    } else {
      logs.push(`[Agente do Clima] Data não informada. Utilizando mês padrão da simulação (Maio).`);
    }

    let temp = 20;
    let condition = "Ensolarado";
    let packing = [];

    const isNorthernHemisphere = !/(rio de janeiro|buenos aires|sydney|pretoria)/i.test(destinationName);
    logs.push(`[Agente do Clima] Destino fica no hemisfério ${isNorthernHemisphere ? 'Norte' : 'Sul'}.`);

    // Estimar estação do ano
    let season = "outono";
    if (isNorthernHemisphere) {
      if (month >= 3 && month <= 5) season = "primavera";
      else if (month >= 6 && month <= 8) season = "verão";
      else if (month >= 9 && month <= 11) season = "outono";
      else season = "inverno";
    } else {
      if (month >= 3 && month <= 5) season = "outono";
      else if (month >= 6 && month <= 8) season = "inverno";
      else if (month >= 9 && month <= 11) season = "primavera";
      else season = "verão";
    }
    
    logs.push(`[Agente do Clima] Estação do ano estimada no destino: "${season.toUpperCase()}"`);

    // Definir temperaturas e condições climáticas típicas
    if (season === "verão") {
      temp = Math.floor(Math.random() * 8) + 26; // 26 a 33°C
      condition = Math.random() > 0.3 ? "Ensolarado e Quente" : "Possibilidade de pancadas de chuva de verão";
      packing = ["Roupas leves (shorts, camisetas)", "Óculos de sol e boné", "Protetor solar", "Traje de banho"];
    } else if (season === "inverno") {
      if (isNorthernHemisphere && /(paris|new york|roma|tokyo|toquio)/i.test(destinationName)) {
        temp = Math.floor(Math.random() * 8) + 1; // 1 a 8°C
        condition = Math.random() > 0.5 ? "Muito frio com possibilidade de neve" : "Frio e Nublado";
        packing = ["Casaco pesado / Sobretudo", "Luvas, cachecol e touca", "Calçados fechados e impermeáveis", "Roupas térmicas / Segunda pele"];
      } else {
        temp = Math.floor(Math.random() * 8) + 12; // 12 a 19°C (inverno mais ameno)
        condition = "Frio ameno com ventos";
        packing = ["Jaqueta média ou blusa de frio", "Calça comprida", "Tênis confortável", "Guarda-chuva (por precaução)"];
      }
    } else if (season === "primavera") {
      temp = Math.floor(Math.random() * 7) + 17; // 17 a 23°C
      condition = "Agradável com florescimento local";
      packing = ["Roupas leves para o dia", "Casaco leve para a noite", "Sapato confortável para caminhada", "Guarda-chuva pequeno"];
    } else { // Outono
      temp = Math.floor(Math.random() * 7) + 13; // 13 a 19°C
      condition = "Fresco com vento e folhas secas";
      packing = ["Roupas em camadas (suéter, jaqueta leve)", "Calças confortáveis", "Cachecol leve", "Calçado resistente"];
    }

    logs.push(`[Agente do Clima] Chamando ferramenta Weather API virtual...`);
    logs.push(`[Agente do Clima] Resultado obtido: ${temp}°C, Condição: ${condition}`);
    logs.push(`[Agente do Clima] Recomendações de malas geradas com base no clima.`);

    return {
      temperature: `${temp}°C`,
      condition,
      season,
      packing,
      logs
    };
  }
};

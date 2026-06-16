// Agente focado em gerar respostas naturais baseadas no contexto atual
export const AgenteContexto = {
  generateResponse: (status, data) => {
    if (status.isComplete) {
      return `Tudo pronto! Já tenho seu roteiro para ${data.destination}, saindo de ${data.origin || 'sua cidade'}. Veja as opções que preparei abaixo:`;
    }

    const collected = [];
    if (data.destination) collected.push(`o destino (${data.destination})`);
    if (data.origin) collected.push(`a origem (${data.origin})`);
    if (data.startDate) collected.push(`a data de ida (${data.startDate})`);
    if (data.endDate) collected.push(`a data de volta (${data.endDate})`);
    if (data.passengers) collected.push(`o total de ${data.passengers} pessoas`);
    if (data.rooms) collected.push(`o total de ${data.rooms} quarto(s)`);
    if (data.accommodationType) collected.push(`o tipo de hospedagem (${data.accommodationType})`);

    let intro = "Entendido! ";
    if (collected.length > 0) {
      intro = `Ótimo, já anotei ${collected.join(', ')}. `;
    }

    let missingList = status.missingFields.join(', ');
    return `${intro}Agora, para eu conseguir os melhores preços, você ainda precisa me informar: ${missingList}.`;
  }
};


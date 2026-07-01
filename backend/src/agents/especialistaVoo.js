export const EspecialistaVoo = {
  generate: (data) => {
    const perPerson = Math.random() * 800 + 400;
    const total = perPerson * (data.passengers || 1);
    
    return {
      title: "Sugestão de Passagem Aérea",
      origin: data.origin,
      destination: data.destination,
      departureDate: data.startDate,
      returnDate: data.endDate,
      passengers: data.passengers,
      airline: "LATAM Airlines",
      class: "Econômica",
      pricePerPerson: `R$ ${perPerson.toFixed(2)}`,
      totalPrice: `R$ ${total.toFixed(2)}`
    };
  }
};


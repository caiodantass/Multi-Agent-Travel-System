export const EspecialistaHospedagem = {
  generate: (data) => {
    const hotels = {
      'hotel': ['Grand Plaza Hotel', 'Sea View Resort', 'Luxury Palace'],
      'pousada': ['Pousada do Sol', 'Recanto das Águas', 'Vila Feliz'],
      'airbnb': ['Loft Moderno no Centro', 'Casa com Piscina', 'Studio aconchegante'],
      'apartamento': ['Edifício Horizon', 'Sunset Apartments'],
      'casa': ['Casa de Praia', 'Mansão das Oliveiras'],
      'resort': ['Blue Resort Spa', 'Tropical Haven']
    };

    const type = data.accommodationType || 'hotel';
    const options = hotels[type] || hotels['hotel'];
    const selected = options[Math.floor(Math.random() * options.length)];
    
    const dailyRate = Math.random() * 300 + 150;
    const passengers = data.passengers || 1;
    const total = dailyRate * 5; 
    const perPerson = total / passengers;

    return {
      title: "Sugestão de Hospedagem",
      type: type.charAt(0).toUpperCase() + type.slice(1),
      name: selected,
      destination: data.destination,
      checkIn: data.startDate,
      checkOut: data.endDate,
      guests: passengers,
      pricePerPerson: `R$ ${perPerson.toFixed(2)}`,
      totalPrice: `R$ ${total.toFixed(2)}`
    };
  }
};



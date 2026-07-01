export const EspecialistaRoteiro = {
  generate: (data) => {
    const days = data.days || 1;
    const activities = [
      "City Tour pelos pontos históricos",
      "Visita ao museu local",
      "Tarde livre no parque central",
      "Jantar em restaurante típico",
      "Passeio de barco ao pôr do sol",
      "Caminhada ecológica guiada",
      "Visita ao mercado de artesanato",
      "Show cultural noturno"
    ];

    const dailyPlan = [];
    for (let i = 1; i <= days; i++) {
      const dailyActivities = [];
      const count = Math.floor(Math.random() * 2) + 2; // 2 to 3 activities per day
      for (let j = 0; j < count; j++) {
        dailyActivities.push(activities[Math.floor(Math.random() * activities.length)]);
      }
      dailyPlan.push({
        day: i,
        activities: [...new Set(dailyActivities)]
      });
    }

    return {
      title: "Roteiro Turístico Personalizado",
      destination: data.destination,
      duration: `${days} dias`,
      plan: dailyPlan,
      averageDailySpend: `R$ ${(Math.random() * 200 + 100).toFixed(2)} por pessoa`
    };
  }
};

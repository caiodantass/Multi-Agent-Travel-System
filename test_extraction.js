import { AgenteCoordenador } from './src/agents/coordenador.js';
import { AgenteOrcamento } from './src/agents/agenteOrcamento.js';

const input = "quero uma viagem de joao pessoa para sao paulo data de ida é em 11/08/2026 e de volta é 21/08/2026, para 3 pessoas";
const extracted = AgenteCoordenador.processInput(input, {});

console.log("EXTRACTED:", extracted.data);

const budget = AgenteOrcamento.calculate(extracted.data, {}, {});
console.log("URL FLIGHT:", budget.flightSearchUrl);

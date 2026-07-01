import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importação dos Agentes que agora vivem no servidor
import { AgenteCoordenador } from './src/agents/coordenador.js';
import { EspecialistaVoo } from './src/agents/especialistaVoo.js';
import { EspecialistaHospedagem } from './src/agents/especialistaHospedagem.js';
import { EspecialistaRoteiro } from './src/agents/especialistaRoteiro.js';
// Vamos simular a importação do AgenteContexto, se ele estiver lá.
// Importação do AgenteContexto (agora no servidor)
import { AgenteContexto } from './src/agents/agenteContexto.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Exemplo de como usar a variável de ambiente (Chave de API real futura)
const EXTERNAL_API_KEY = process.env.EXTERNAL_API_KEY || 'dummy_key';

app.post('/api/plan', (req, res) => {
  try {
    const { userMessage, currentExtraction } = req.body;

    // 1. Coordenador processa e extrai entidades (se houver texto)
    let extractedData = currentExtraction || {};
    let coordLogs = [];
    
    if (userMessage) {
      const result = AgenteCoordenador.processInput(userMessage, currentExtraction);
      extractedData = result.data;
      coordLogs = result.logs;
    }
    
    // 2. Validação se falta algo
    const status = AgenteCoordenador.validate(extractedData);
    const systemResponse = AgenteContexto.generateResponse(status, extractedData);

    let compilation = null;
    let pipelineLogs = [];

    // Se a matriz estiver completa, ativa a rede inteira de agentes
    if (status.isComplete) {
      const pipelineResult = AgenteCoordenador.runPipeline(extractedData);
      pipelineLogs = pipelineResult.logs;

      const flightData = status.activatedAgents.includes('flight') ? EspecialistaVoo.generate(extractedData) : null;
      const accommodationData = status.activatedAgents.includes('accommodation') ? EspecialistaHospedagem.generate(extractedData) : null;
      const itineraryData = status.activatedAgents.includes('itinerary') ? EspecialistaRoteiro.generate(extractedData) : null;

      compilation = {
        id: Date.now(),
        destination: extractedData.destination,
        flight: flightData,
        accommodation: accommodationData,
        itinerary: itineraryData,
        knowledge: pipelineResult.knowledgeResult,
        weather: pipelineResult.weatherResult,
        budget: pipelineResult.budgetResult,
        validation: pipelineResult.validationResult,
        timestamp: new Date()
      };
    }

    // O Back-end responde com tudo estruturado para o Front-end
    res.json({
      extractedData,
      status,
      systemResponse,
      compilation,
      logs: [...coordLogs, ...pipelineLogs]
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({ error: 'Erro interno no servidor Multiagente.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Multi-Agent Travel System Back-end rodando na porta ${PORT}`);
  console.log(`🔑 Chave de API Externa configurada: ${EXTERNAL_API_KEY === 'dummy_key' ? 'Nenhuma (Simulação)' : 'Carregada'}`);
});

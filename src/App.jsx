import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, MapPin, Calendar, Plane, Bed, Map as MapIcon, 
  Sparkles, ChevronRight, Globe, Info, Trash2, History, 
  CreditCard, CloudSun, AlertTriangle, CheckCircle2, 
  Sparkle, RefreshCw, X, Menu, DollarSign 
} from 'lucide-react';
// Agentes migrados para o backend.
// As chamadas agora serão feitas via fetch() para a API Node.js.

const App = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'system',
      content: 'Olá! Sou o TravelAI. Para onde você está planejando sua próxima viagem? Escolha uma das opções abaixo para começarmos:',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentExtraction, setCurrentExtraction] = useState({ services: [] });
  const [results, setResults] = useState(null);
  
  // Logs do console de agentes
  const [consoleLogs, setConsoleLogs] = useState([
    "[Coordinator] Sistema inicializado. Aguardando comando do usuário..."
  ]);
  const [activeAgent, setActiveAgent] = useState("coordinator"); // coordinator, knowledge, weather, budget, validator

  // Memória no LocalStorage
  const [savedTrips, setSavedTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);

  // Responsividade dos painéis
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightConsole, setShowRightConsole] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Carregar do localStorage na inicialização
  useEffect(() => {
    try {
      const data = localStorage.getItem('travel_ai_trips');
      if (data) {
        setSavedTrips(JSON.parse(data));
      }
    } catch (e) {
      console.error("Erro ao ler localStorage:", e);
    }
  }, []);

  const saveTripToMemory = (extraction, resultsData, currentMessages) => {
    try {
      const tripsData = localStorage.getItem('travel_ai_trips');
      const trips = tripsData ? JSON.parse(tripsData) : [];
      
      const newTripId = resultsData.id || Date.now();
      const newTrip = {
        id: newTripId,
        extraction,
        results: resultsData,
        messages: currentMessages,
        timestamp: new Date()
      };

      const existingIndex = trips.findIndex(t => t.id === newTripId || (t.extraction.destination === extraction.destination && t.extraction.startDate === extraction.startDate));
      
      if (existingIndex >= 0) {
        trips[existingIndex] = newTrip;
      } else {
        trips.unshift(newTrip);
      }
      
      localStorage.setItem('travel_ai_trips', JSON.stringify(trips));
      setSavedTrips(trips);
      setActiveTripId(newTripId);
    } catch (e) {
      console.error("Erro ao salvar no localStorage:", e);
    }
  };

  const loadSavedTrip = (trip) => {
    setMessages(trip.messages);
    setCurrentExtraction(trip.extraction);
    setResults(trip.results);
    setActiveTripId(trip.id);
    setConsoleLogs([
      `[Memory] Viagem para "${trip.extraction.destination}" carregada da memória persistente local.`,
      `[Memory] Dados carregados: ${trip.extraction.passengers || 1} pax, ${trip.extraction.days || 'N/A'} dias, orçamento de R$ ${trip.extraction.maxBudget || 'N/A'}`
    ]);
    setActiveAgent("coordinator");
  };

  const deleteSavedTrip = (e, id) => {
    e.stopPropagation();
    try {
      const updated = savedTrips.filter(t => t.id !== id);
      localStorage.setItem('travel_ai_trips', JSON.stringify(updated));
      setSavedTrips(updated);
      
      if (activeTripId === id) {
        resetChat();
      }
    } catch (e) {
      console.error("Erro ao deletar do localStorage:", e);
    }
  };

  const resetChat = () => {
    setMessages([{ 
      id: Date.now(), 
      role: 'system', 
      content: 'Olá! Sou o TravelAI. Para onde você está planejando sua próxima viagem? Escolha uma das opções abaixo para começarmos:',
      timestamp: new Date()
    }]);
    setCurrentExtraction({ services: [] });
    setResults(null);
    setActiveTripId(null);
    setConsoleLogs([
      "[Coordinator] Chat reiniciado. Memória ativa de curto prazo limpa. Pronto para o próximo roteiro."
    ]);
    setActiveAgent("coordinator");
  };

  const handleServiceSelection = (selectedServices, label) => {
    if (isProcessing) return;
    
    // Adiciona a seleção do usuário como mensagem no chat
    const updatedMessages = [
      ...messages,
      { id: Date.now(), role: 'user', content: `Quero planejar: ${label}`, timestamp: new Date() }
    ];
    setMessages(updatedMessages);
    setIsProcessing(true);
    setActiveAgent("coordinator");

    setTimeout(async () => {
      // Cria a nova extração inicial com os serviços escolhidos
      const newExtraction = {
        ...currentExtraction,
        services: selectedServices
      };
      setCurrentExtraction(newExtraction);

      try {
        const response = await fetch('http://localhost:3001/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userMessage: '', currentExtraction: newExtraction })
        });
        
        const data = await response.json();
        
        if (data.systemResponse) {
          setMessages(prev => [
            ...prev,
            { id: Date.now() + 1, role: 'system', content: data.systemResponse, timestamp: new Date() }
          ]);
        }
        
        if (data.logs) {
          setConsoleLogs(prev => [
            ...prev,
            `[Coordinator] Usuário selecionou o serviço: ${label}.`,
            ...data.logs
          ]);
        }
      } catch (err) {
        console.error("Erro ao contactar o servidor:", err);
        setConsoleLogs(prev => [...prev, "[Erro] Falha ao comunicar com o Backend."]);
      }
      
      setIsProcessing(false);
    }, 600);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    
    // Adicionar mensagem do usuário
    const updatedMessages = [...messages, { id: Date.now(), role: 'user', content: userMessage, timestamp: new Date() }];
    setMessages(updatedMessages);
    setIsProcessing(true);
    setActiveAgent("coordinator");

    // Simular o delay de raciocínio da rede de agentes
    setTimeout(async () => {
      try {
        setConsoleLogs(prev => [...prev, `[Coordinator] Novo input recebido: "${userMessage}"`]);
        setConsoleLogs(prev => [...prev, `[Network] Enviando requisição para o Backend...`]);

        const response = await fetch('http://localhost:3001/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userMessage, currentExtraction })
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const { extractedData, status, systemResponse, compilation, logs } = data;

        setCurrentExtraction(extractedData);
        if (logs) {
          setConsoleLogs(prev => [...prev, ...logs]);
        }

        if (status.isComplete && compilation) {
          setResults(compilation);
          saveTripToMemory(extractedData, compilation, [
            ...updatedMessages,
            { 
              id: Date.now() + 1, 
              role: 'system', 
              content: systemResponse,
              timestamp: new Date() 
            }
          ]);
          setConsoleLogs(prev => [...prev, `[Coordinator] Pipeline concluído. Plano de viagem para "${extractedData.destination}" pronto e renderizado na tela.`]);
        } else {
          setConsoleLogs(prev => [...prev, `[Coordinator] Validação pendente. Faltando dados: ${status.missingFields.join(', ')}`]);
        }

        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          role: 'system', 
          content: systemResponse,
          timestamp: new Date() 
        }]);

      } catch (error) {
        console.error(error);
        setConsoleLogs(prev => [...prev, `[Coordinator] ERRO DE PROCESSAMENTO: ${error.message}`]);
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          role: 'system', 
          content: 'Desculpe, tive um problema ao orquestrar a resposta do Backend. O servidor está rodando?',
          timestamp: new Date() 
        }]);
      } finally {
        setIsProcessing(false);
      }
    }, 800);
  };

  return (
    <div className="flex h-screen bg-[#07070a] text-slate-100 font-sans overflow-hidden">
      
      {/* 1. PAINEL ESQUERDO: MEMÓRIA (HISTÓRICO LOCALSTORAGE) */}
      <AnimatePresence>
        {showLeftSidebar && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 border-r border-white/5 bg-[#0b0b0f] flex flex-col h-full z-20"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
                <History size={16} />
                <span>Memória de Viagens</span>
              </div>
              <button 
                onClick={resetChat}
                className="p-1.5 hover:bg-white/5 rounded text-xs text-slate-400 flex items-center gap-1 transition-all"
                title="Novo Roteiro"
              >
                <RefreshCw size={12} />
                <span>Novo</span>
              </button>
            </div>

            {/* Listagem de Viagens Salvas */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {savedTrips.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-8 px-4">
                  Nenhuma viagem no histórico. Conclua um planejamento para salvá-lo aqui.
                </div>
              ) : (
                savedTrips.map(trip => (
                  <div
                    key={trip.id}
                    onClick={() => loadSavedTrip(trip)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all relative group flex flex-col gap-1 ${
                      activeTripId === trip.id 
                        ? 'bg-violet-500/10 border-violet-500/30 text-white' 
                        : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-900/80 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-xs truncate pr-6 capitalize">
                        {trip.extraction.destination}
                      </span>
                      <button
                        onClick={(e) => deleteSavedTrip(e, trip.id)}
                        className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1 hover:bg-rose-500/20 hover:text-rose-400 rounded text-slate-500 transition-all"
                        title="Deletar da memória"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>{trip.extraction.days || 5} dias • {trip.extraction.passengers || 1} pax</span>
                      <span>{new Date(trip.timestamp).toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-white/5 text-[10px] text-center text-slate-600">
              Persistência Local (LocalStorage)
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. PAINEL CENTRAL: CHAT E DASHBOARD DE RESULTADOS */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#07070a] relative h-full">
        {/* Header Superior */}
        <header className="border-b border-white/5 bg-[#09090c]/70 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowLeftSidebar(!showLeftSidebar)} 
              className="p-2 hover:bg-white/5 rounded-lg text-slate-400 lg:block transition-all"
              title="Alternar Histórico"
            >
              <Menu size={18} />
            </button>
            <div className="p-2 bg-violet-600 rounded-lg">
              <Globe size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100">TravelAI</h1>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Multi-Agent Planner</p>
            </div>
          </div>

          {/* Tags de Contexto em Destaque */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto max-w-[50%] no-scrollbar">
            <ContextTag label="Destino" value={currentExtraction?.destination} icon={<MapPin size={10}/>} />
            <ContextTag label="Data Ida" value={currentExtraction?.startDate} icon={<Calendar size={10}/>} />
            <ContextTag label="Orçamento" value={currentExtraction?.maxBudget ? `R$ ${currentExtraction.maxBudget}` : null} icon={<DollarSign size={10}/>} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetChat}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-white/5 bg-zinc-900 text-slate-300 hover:bg-zinc-800 hover:text-white transition-all"
              title="Iniciar novo planejamento"
            >
              <RefreshCw size={12} />
              <span>Nova Viagem</span>
            </button>

            <button 
              onClick={() => setShowRightConsole(!showRightConsole)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                showRightConsole 
                  ? 'bg-violet-600/10 border-violet-500/20 text-violet-400' 
                  : 'bg-zinc-900 border-white/5 text-slate-400 hover:bg-zinc-800'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-violet-400 animate-ping' : 'bg-emerald-400'}`} />
              Console Agentes
            </button>
          </div>
        </header>

        {/* Scroll Container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Mensagens de Chat */}
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((m, index) => (
                  <div key={m.id} className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`p-4 rounded-2xl max-w-[85%] leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10 text-sm' 
                          : 'bg-zinc-900/60 border border-white/5 text-slate-200 text-sm'
                      }`}>
                        <p className="whitespace-pre-line">{m.content}</p>
                      </div>
                    </motion.div>

                    {/* Mostrar opções de serviço após a primeira mensagem do sistema */}
                    {index === 0 && currentExtraction.services.length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl pt-2 pb-4"
                      >
                        <ServiceButton 
                          icon={<Plane size={15} />} 
                          label="Apenas Passagem" 
                          onClick={() => handleServiceSelection(['flight'], 'Apenas Passagem')} 
                        />
                        <ServiceButton 
                          icon={<Bed size={15} />} 
                          label="Apenas Hospedagem" 
                          onClick={() => handleServiceSelection(['accommodation'], 'Apenas Hospedagem')} 
                        />
                        <ServiceButton 
                          icon={<MapIcon size={15} />} 
                          label="Apenas Roteiro" 
                          onClick={() => handleServiceSelection(['itinerary'], 'Apenas Roteiro')} 
                        />
                        <ServiceButton 
                          icon={
                            <div className="flex items-center gap-0.5">
                              <Plane size={12} />
                              <span className="text-[8px] opacity-40 font-light">+</span>
                              <Bed size={12} />
                            </div>
                          } 
                          label="Passagem + Hospedagem" 
                          onClick={() => handleServiceSelection(['flight', 'accommodation'], 'Passagem + Hospedagem')} 
                        />
                        <ServiceButton 
                          icon={
                            <div className="flex items-center gap-0.5">
                              <Plane size={12} />
                              <span className="text-[8px] opacity-40 font-light">+</span>
                              <MapIcon size={12} />
                            </div>
                          } 
                          label="Passagem + Roteiro" 
                          onClick={() => handleServiceSelection(['flight', 'itinerary'], 'Passagem + Roteiro')} 
                        />
                        <ServiceButton 
                          icon={
                            <div className="flex items-center gap-0.5">
                              <Bed size={12} />
                              <span className="text-[8px] opacity-40 font-light">+</span>
                              <MapIcon size={12} />
                            </div>
                          } 
                          label="Hospedagem + Roteiro" 
                          onClick={() => handleServiceSelection(['accommodation', 'itinerary'], 'Hospedagem + Roteiro')} 
                        />
                        <div className="col-span-1 sm:col-span-2 md:col-span-3">
                          <ServiceButton 
                            icon={<Sparkles size={15} className="text-amber-400" />} 
                            label="Viagem Completa (Passagem, Hospedagem e Roteiro)" 
                            onClick={() => handleServiceSelection(['flight', 'accommodation', 'itinerary'], 'Viagem Completa')} 
                            highlight={true} 
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}

                {isProcessing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-zinc-900/30 border border-white/5 px-4 py-3 rounded-2xl flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="h-1.5 w-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-1.5 w-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-1.5 w-1.5 bg-violet-400 rounded-full animate-bounce" />
                      </div>
                      <span className="text-xs text-slate-400">Agentes trabalhando...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SEÇÃO PRINCIPAL DE RESULTADOS: DASHBOARD INTEGRADO */}
            {results && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="border border-white/5 bg-[#0b0b0f]/80 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* Cabeçalho do Dashboard */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-5 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white capitalize">{results.destination}</h2>
                      <p className="text-xs text-slate-400">Plano Orquestrado por Inteligência Artificial</p>
                    </div>
                  </div>
                  
                  {/* Validação Score */}
                  <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2 self-start md:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Score de Viabilidade</span>
                      <span className={`text-sm font-black ${
                        results.validation.score >= 80 ? 'text-emerald-400' : results.validation.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {results.validation.score}/100
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-white/5 flex items-center justify-center relative">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="20" cy="20" r="16" stroke="currentColor" className="text-zinc-800" strokeWidth="2.5" fill="transparent" />
                        <circle 
                          cx="20" cy="20" r="16" 
                          stroke="currentColor" 
                          className={results.validation.score >= 80 ? 'text-emerald-400' : results.validation.score >= 60 ? 'text-amber-400' : 'text-rose-400'} 
                          strokeWidth="2.5" 
                          fill="transparent" 
                          strokeDasharray={100}
                          strokeDashoffset={100 - results.validation.score}
                        />
                      </svg>
                      <span className="absolute text-[9px] font-bold">
                        {results.validation.approved ? 'OK' : 'X'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid Superior: Base de Conhecimento e Clima */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Conhecimento Turístico (RAG) */}
                  <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkle size={14} />
                      Conhecimento do Destino (RAG)
                    </h3>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-1">Principais Atrações:</span>
                        <ul className="grid grid-cols-1 gap-1">
                          {results.knowledge.attractions.map((attr, idx) => (
                            <li key={idx} className="flex gap-2 items-center text-slate-300">
                              <ChevronRight size={12} className="text-violet-500 shrink-0" />
                              <span>{attr}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-white/5 pt-2">
                        <span className="text-slate-500 block mb-1">Conselhos Locais:</span>
                        <ul className="space-y-1 text-slate-400 text-[11px] leading-relaxed">
                          {results.knowledge.tips.map((tip, idx) => (
                            <li key={idx} className="list-disc pl-3 list-inside">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Previsão do Tempo e Mala (Weather Agent) */}
                  <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CloudSun size={14} />
                      Previsão de Clima (Weather Agent)
                    </h3>
                    
                    <div className="flex items-center gap-4 bg-zinc-950/60 p-3 rounded-lg border border-white/5">
                      <div className="text-2xl font-black text-white">{results.weather.temperature}</div>
                      <div className="text-xs">
                        <span className="text-slate-200 font-medium block">{results.weather.condition}</span>
                        <span className="text-slate-500 text-[10px] uppercase">Estação: {results.weather.season}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <span className="text-slate-500 block">Recomendação de Bagagem:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {results.weather.packing.map((item, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] text-slate-300">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Orçamento e Finanças (Budget Agent) */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={14} />
                    Gestão Financeira & Orçamentos (Budget Agent)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FinanceBox 
                      title="Passagens (Total)" 
                      val={results.budget.totalFlightBRLRange} 
                      desc={results.flight ? `Média: ${results.budget.totalFlightBRLMedia} (${results.budget.flightCostPerPersonMedia}/pax) • ${results.flight.airline} (${results.flight.class})` : "Não contratado"} 
                    />
                    <FinanceBox 
                      title="Hospedagem (Total)" 
                      val={results.budget.totalAccommodationBRLRange} 
                      desc={results.accommodation ? `Média: ${results.budget.totalAccommodationBRLMedia} (${results.budget.accommodationDailyBRLMedia}/dia) • ${results.accommodation.type}` : "Não contratado"} 
                    />
                    <FinanceBox 
                      title="Despesas Diárias" 
                      val={results.budget.totalActivitiesBRLRange} 
                      desc={results.itinerary ? `Média: ${results.budget.totalActivitiesBRLMedia} (${results.budget.activityDailyPerPersonBRLMedia}/dia por pax)` : "Não contratado"} 
                    />
                  </div>

                  {(results.flight || results.accommodation) && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      {results.flight && (
                        <a 
                          href={results.budget.flightSearchUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex-1 py-2.5 px-4 bg-violet-600/10 hover:bg-violet-600/25 border border-violet-500/20 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 text-violet-300 hover:text-white transition-all cursor-pointer"
                        >
                          <Plane size={14} />
                          <span>Buscar Voos no Kayak ↗</span>
                        </a>
                      )}
                      {results.accommodation && (
                        <a 
                          href={results.budget.accommodationSearchUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex-1 py-2.5 px-4 bg-sky-600/10 hover:bg-sky-600/25 border border-sky-500/20 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 text-sky-300 hover:text-white transition-all cursor-pointer"
                        >
                          <Bed size={14} />
                          <span>Buscar em {results.budget.accommodationProvider || 'Parceiro'} ↗</span>
                        </a>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-zinc-950/70 p-4 rounded-xl border border-white/5 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-black block">Faixa de Custo Estimado</span>
                      <span className="text-base font-black text-emerald-400">{results.budget.totalBRLRange}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Média Total: {results.budget.totalBRLMedia} ({results.budget.exchangeRateText})</span>
                    </div>

                    <div className="text-left md:text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-black block">Por Pessoa ({results.budget.passengers} pax)</span>
                      <span className="text-sm font-bold text-violet-400">{results.budget.totalPerPersonBRLRange}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Média por Pessoa: {results.budget.totalPerPersonBRLMedia}</span>
                    </div>

                    {results.knowledge.currency !== 'BRL' && (
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-black block">Custo em Moeda Local</span>
                        <span className="text-base font-bold text-white">{results.budget.totalLocal}</span>
                      </div>
                    )}
                  </div>

                  {results.budget.isOptimized && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg text-xs text-amber-300 flex items-start gap-2.5">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <p>{results.budget.optimizationNote}</p>
                    </div>
                  )}

                  {results.budget.budgetAlert && (
                    <div className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs ${
                      results.budget.budgetAlert.includes("ultrapassa")
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    }`}>
                      {results.budget.budgetAlert.includes("ultrapassa") ? <AlertTriangle size={16} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={16} className="shrink-0 mt-0.5" />}
                      <p>{results.budget.budgetAlert}</p>
                    </div>
                  )}
                </div>

                {/* Parecer do Auditor (Validator Agent) */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    Relatório de Auditoria de Qualidade (Validator Agent)
                  </h3>

                  <div className="space-y-2">
                    {results.validation.warnings.length === 0 ? (
                      <div className="text-xs text-slate-300 flex items-center gap-2 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span>Parabéns! Nenhuma inconsistência encontrada no plano de viagem pelo Auditor.</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {results.validation.warnings.map((warn, idx) => (
                          <div key={idx} className={`p-2.5 rounded-lg border text-xs flex gap-2 items-start ${
                            warn.includes("ERRO") 
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                          }`}>
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <span>{warn}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Roteiro Turístico (Itinerary Agent) */}
                {results.itinerary && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MapIcon size={14} />
                      Sugestão de Roteiro Integrado (Itinerary Agent)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.itinerary.plan.map((day) => (
                        <div key={day.day} className="bg-zinc-900/25 border border-white/5 p-4 rounded-xl space-y-2">
                          <span className="text-[10px] font-black text-violet-400 uppercase tracking-wider">Dia {day.day}</span>
                          <ul className="space-y-2">
                            {day.activities.map((act, i) => (
                              <li key={i} className="flex gap-2 items-start text-xs text-slate-300 leading-tight">
                                <ChevronRight size={10} className="text-violet-500 shrink-0 mt-0.5" />
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            )}

            <div ref={messagesEndRef} className="h-10" />
          </div>
        </div>

        {/* Input Bar de Comandos */}
        <div className="p-4 border-t border-white/5 bg-[#09090c]/70 backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSend} className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentExtraction.services.length === 0 ? "Escolha uma das opções acima para começar..." : (isProcessing ? "Aguardando resposta dos agentes..." : "Planeje sua viagem (ex: ir para Paris em Outubro com 2 pessoas e orçamento de 15000)...")}
                disabled={isProcessing || currentExtraction.services.length === 0}
                className="w-full bg-zinc-900/90 border border-white/10 rounded-xl py-4 pl-5 pr-14 focus:outline-none focus:border-violet-500 transition-all text-xs text-slate-100 placeholder-slate-500"
              />
              <button 
                type="submit"
                disabled={isProcessing || !input.trim() || currentExtraction.services.length === 0}
                className="absolute right-2 top-2 p-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 rounded-lg transition-all text-white"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* 3. PAINEL DIREITO: CONSOLE DE AGENTES (ORQUESTRADOR E PENSAMENTO VISUAL) */}
      <AnimatePresence>
        {showRightConsole && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 border-l border-white/5 bg-[#0a0a0e] flex flex-col h-full z-20"
          >
            {/* Título do Console */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Console Multiagente</span>
              </div>
              <button 
                onClick={() => setShowRightConsole(false)}
                className="p-1 hover:bg-white/5 rounded text-slate-400 transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Painel de Status dos Agentes */}
            <div className="p-4 border-b border-white/5 bg-zinc-950/40 space-y-3">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Topologia dos Agentes</span>
              
              <div className="grid grid-cols-1 gap-2">
                <AgentBadge name="Coordinator Agent" isActive={activeAgent === 'coordinator'} color="border-purple-500/20 text-purple-400 bg-purple-500/5" />
                <AgentBadge name="Knowledge Agent" isActive={activeAgent === 'knowledge'} color="border-sky-500/20 text-sky-400 bg-sky-500/5" />
                <AgentBadge name="Weather Agent" isActive={activeAgent === 'weather'} color="border-amber-500/20 text-amber-400 bg-amber-500/5" />
                <AgentBadge name="Budget Agent" isActive={activeAgent === 'budget'} color="border-emerald-500/20 text-emerald-400 bg-emerald-500/5" />
                <AgentBadge name="Validator Agent" isActive={activeAgent === 'validator'} color="border-rose-500/20 text-rose-400 bg-rose-500/5" />
              </div>
            </div>

            {/* Logs de Pensamento em Tempo Real */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[10px] leading-normal no-scrollbar">
              <AnimatePresence>
                {consoleLogs.map((log, idx) => {
                  let colorClass = "text-slate-400";
                  if (log.includes("[Coordinator]")) colorClass = "text-purple-400";
                  else if (log.includes("[Knowledge Agent]")) colorClass = "text-sky-400 border-l border-sky-500/20 pl-1.5";
                  else if (log.includes("[Weather Agent]")) colorClass = "text-amber-400 border-l border-amber-500/20 pl-1.5";
                  else if (log.includes("[Budget Agent]")) colorClass = "text-emerald-400 border-l border-emerald-500/20 pl-1.5";
                  else if (log.includes("[Validator Agent]")) colorClass = "text-rose-400 border-l border-rose-500/20 pl-1.5";
                  else if (log.includes("[Memory]")) colorClass = "text-violet-400";

                  return (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: 5 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className={`pb-1 border-b border-white/5 ${colorClass}`}
                    >
                      {log}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

    </div>
  );
};

// Componente auxiliar para Caixa de Custos
const FinanceBox = ({ title, val, desc }) => (
  <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
    <div>
      <span className="text-[9px] text-slate-500 uppercase font-black block">{title}</span>
      <span className="text-sm font-bold text-slate-200">{val || "R$ 0,00"}</span>
    </div>
    <span className="text-[10px] text-slate-500 truncate block mt-1">{desc}</span>
  </div>
);

// Componente auxiliar para Emblema de Agente Ativo
const AgentBadge = ({ name, isActive, color }) => (
  <div className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
    isActive 
      ? `${color} ring-1 ring-violet-500/30 scale-[1.02] font-semibold` 
      : 'border-white/5 bg-zinc-900/10 text-slate-500 opacity-60'
  }`}>
    <span className="text-[10px] font-mono">{name}</span>
    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-current animate-ping' : 'bg-zinc-700'}`} />
  </div>
);

// Componente auxiliar para as Tags de Contexto do Topo
const ContextTag = ({ label, value, icon }) => (
  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all duration-300 text-[10px] ${
    value 
      ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' 
      : 'bg-white/5 border-white/5 text-slate-500 opacity-40'
  }`}>
    {icon}
    <span className="font-bold uppercase tracking-wider">{label}</span>
    {value && (
      <>
        <span className="w-1 h-1 rounded-full bg-violet-500/40"></span>
        <span className="font-semibold text-white truncate max-w-[90px]">{value}</span>
      </>
    )}
  </div>
);

// Componente auxiliar para Botões de Seleção de Serviço
const ServiceButton = ({ icon, label, onClick, highlight = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group p-3 rounded-xl border text-left cursor-pointer transition-all duration-300 flex items-center gap-3 w-full text-xs font-semibold backdrop-blur-sm relative overflow-hidden ${
      highlight 
        ? 'bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border-violet-500/30 hover:border-violet-500/60 text-violet-300 hover:text-white shadow-lg hover:shadow-violet-500/10 hover:scale-[1.01]' 
        : 'bg-zinc-900/40 border-white/5 hover:border-white/15 hover:bg-zinc-900/80 text-slate-300 hover:text-white hover:scale-[1.01] hover:shadow-lg'
    }`}
  >
    <div className={`p-2 rounded-lg transition-all duration-300 shrink-0 ${
      highlight 
        ? 'bg-violet-500/15 text-violet-400 group-hover:bg-violet-500/25 group-hover:text-violet-300' 
        : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-slate-200'
    }`}>
      {icon}
    </div>
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="font-bold text-[11px] sm:text-xs leading-none">{label}</span>
    </div>
  </button>
);

export default App;

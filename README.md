# Multi-Agent Travel System — Autonomous Trip Planning Architecture

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![NodeJS](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Architecture](https://img.shields.io/badge/Architecture-10%20Autonomous%20Agents-FF6F00.svg)](#-arquitetura-orquestração-dos-10-agentes)
[![Animations](https://img.shields.io/badge/UI-Framer%20Motion-black.svg?logo=framer&logoColor=white)](https://www.framer.com/motion/)

Sistema inteligente de ponta a ponta para planejamento automatizado de viagens baseado em uma **arquitetura de múltiplos agentes colaborativos**. 

A partir de um único prompt em linguagem natural (ex: *"Quero viajar de João Pessoa para São Paulo de 11/08/2026 a 21/08/2026 para 3 pessoas em um Airbnb"*), o sistema orquestra uma malha de **10 agentes especializados** que extraem entidades, analisam condições climáticas, montam roteiros dinâmicos dia a dia, consolidam custos e geram links parametrizados de reserva para parceiros (como Kayak e Airbnb).

---

## 🏗️ Arquitetura: Orquestração dos 10 Agentes

```mermaid
flowchart TD
    User(["👤 Usuário (Prompt em Linguagem Natural)"]) --> Coord["🎯 Agente Coordenador"]

    subgraph Phase1 ["1. Extração & Comunicação"]
        Coord --> Context["💬 Agente de Contexto & Entidades"]
        Context --> Extractor["🔍 Parsers Semânticos (Origem, Destino, Datas, Hóspedes)"]
    end

    subgraph Phase2 ["2. Enriquecimento de Domínio"]
        Extractor --> KB["📚 Agente de Conhecimento (Atrações, Moeda, Dicas)"]
        Extractor --> Weather["☀️ Agente de Clima (Previsão Sazonal & Bagagem)"]
    end

    subgraph Phase3 ["3. Especialistas Verticais"]
        KB & Weather --> Flights["✈️ Especialista em Voos (Companhias, Conexões)"]
        KB & Weather --> Stays["🏨 Especialista em Hospedagem (Airbnb, Hotéis, Diárias)"]
        KB & Weather --> Itinerary["📅 Especialista em Roteiros (Manhã, Tarde, Noite)"]
    end

    subgraph Phase4 ["4. Consolidação & Auditoria"]
        Flights & Stays & Itinerary --> Budget["💰 Agente de Orçamento & Câmbio"]
        Budget --> Validator["🛡️ Agente Validador (Auditoria de Coerência e Datas)"]
    end

    Validator --> UI["🖥️ Interface Reativa (Roteiro, Custos e Links Diretos)"]
```

---

## 🧠 Papéis e Responsabilidades dos Agentes

1. **🎯 Agente Coordenador (`coordenador.js`)**: O cérebro da operação. Avalia o prompt, distribui os dados e verifica se há requisitos mínimos antes de disparar o pipeline de execução.
2. **💬 Agente de Contexto (`agenteContexto.js`)**: Gerencia o diálogo com o usuário caso faltem dados essenciais, solicitando complementos de forma fluida.
3. **🔍 Parsers Semânticos de Entidades**: Algoritmos de NLP que isolam destinos, janelas temporais de viagem e quantidade de viajantes.
4. **📚 Agente de Conhecimento (`agenteConhecimento.js`)**: Base de dados turística para determinação de fusos horários, moedas locais, atrativos e recomendações de segurança.
5. **☀️ Agente de Clima (`agenteClima.js`)**: Avalia a sazonalidade nas datas especificadas, prevê temperaturas médias e gera sugestões de vestuário/bagagem.
6. **✈️ Especialista em Voos (`especialistaVoo.js`)**: Mapeia rotas aéreas domésticas e internacionais, aeroportos e precificação média.
7. **🏨 Especialista em Hospedagem (`especialistaHospedagem.js`)**: Segmenta as opções de acomodação conforme a preferência (Airbnb, resort, pousada ou hotel).
8. **📅 Especialista em Roteiros (`especialistaRoteiro.js`)**: Gera cronogramas diários detalhados (turnos: Manhã, Tarde e Noite) ajustados à duração da estadia.
9. **💰 Agente de Orçamento & Câmbio (`agenteOrcamento.js`)**: Converte moedas, valida limites orçamentários e constrói URLs parametrizadas com *deep-linking* de parceiros.
10. **🛡️ Agente Validador (`agenteValidador.js`)**: Executa a auditoria final de integridade (consistência de datas, valores e lógica do itinerário) antes da entrega.

---

## 🛠️ Stack Tecnológica

* **Frontend**:
  * **React 19**: Arquitetura baseada em componentes reativos.
  * **Vite**: Bundler de alta velocidade e compilação otimizada.
  * **Tailwind CSS v4**: Estilização utilitária com suporte a Glassmorphism e Dark Mode.
  * **Framer Motion**: Animações de transição de estado e micro-interações fluidas.
  * **Lucide React**: Ícones vetoriais modernos.
* **Backend**:
  * **Node.js & Express**: API REST assíncrona responsável pela orquestração dos agentes.

---

## 📁 Estrutura do Repositório

Multi-Agent-Travel-System/ ├── backend/ │ ├── src/ │ │ ├── agents/ # Implementação dos 10 agentes especializados │ │ ├── data/ # Base de conhecimento turístico e climatológico │ │ └── server.js # API REST Express │ └── package.json │ ├── src/ │ ├── components/ # Componentes visuais (Chat, Roteiro, Orçamento) │ ├── agents/ # Lógica de agentes no lado cliente │ ├── data/ # Bases estáticas e configurações │ ├── App.jsx # Ponto de entrada da aplicação │ └── index.css # Configurações de tema e Tailwind │ ├── vite.config.js └── package.json


---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* [Node.js](https://nodejs.org/) instalado (versão 18 ou superior).

### 1. Clonar o Repositório
```bash
git clone https://github.com/caiodantass/Multi-Agent-Travel-System.git
cd Multi-Agent-Travel-System
```

### 2. Configurar o Backend
```bash
cd backend
npm install
node server.js
```

(O backend iniciará na porta 3001 ou configurada).

### 3. Configurar o Frontend

Abra um novo terminal na raiz do projeto:
```bash
npm install
npm run dev
```

Acesse a interface no navegador em [http://localhost:5173](http://localhost:5173).

---

## 👨‍💻 Autor

**Caio Dantas**  
* Engenheiro de Software / Desenvolvedor de Firmware  
* GitHub: [@caiodantass](https://github.com/caiodantass)  
* LinkedIn: [linkedin.com/in/caiodantass](https://www.linkedin.com/in/caio-l%C3%ADvio/)

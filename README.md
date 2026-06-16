<div align="center">
  <h1>🌍 Multi-Agent Travel System</h1>
  <h3><i>Sistema Inteligente de Planejamento Automatizado de Viagens</i></h3>
  
  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="JavaScript" />
  </p>
</div>

<br />

## 📖 O que é este projeto?

O **Multi-Agent Travel System** é uma aplicação web interativa que utiliza uma arquitetura simulada de múltiplos agentes inteligentes para planejar viagens de ponta a ponta. 

Com uma única mensagem em linguagem natural (ex: *"Quero uma viagem de João Pessoa para São Paulo dia 11/08/2026 até 21/08/2026 para 3 pessoas em um Airbnb"*), o sistema extrai o contexto, lida com informações incompletas de forma conversacional e ativa uma rede de especialistas virtuais que constroem um roteiro diário, calculam o orçamento e geram links automatizados de parceiros (como Kayak e Airbnb) perfeitamente preenchidos para finalizar as reservas.

## 🎯 O Problema Resolvido

Planejar viagens costuma ser um processo extremamente manual, fragmentado e frustrante. Usuários precisam cruzar dezenas de abas no navegador comparando voos, buscando as melhores localizações, calculando custo de vida local e formatando roteiros. 

**A solução:** Uma única interface conversacional. O projeto abstrai toda a complexidade exigindo apenas um prompt do usuário. A aplicação blinda a requisição, forçando o envio de informações mínimas e entregando um pacote fechado e calculado em questão de segundos.

## 🧠 Arquitetura: Os 10 Agentes Especialistas

O grande diferencial deste projeto é a sua arquitetura modular, onde cada responsabilidade do planejamento foi fragmentada para um "agente" hiper-especializado. Isso previne alucinações e garante alta coerência na montagem do plano:

1. **Agente Coordenador:** O cérebro da operação. Avalia o prompt, distribui os dados e verifica se há informações faltando antes de disparar o restante dos processos.
2. **Agente de Contexto e Comunicação:** A interface humana. Se falta algum dado vital, gera um texto dinâmico amigável interagindo com o usuário.
3. **Agentes de Extração (Intenção, Local e Tempo):** Extratores de Linguagem Natural baseados em RegEx que capturam e isolam perfeitamente destinos, datas e quantidade de hóspedes.
4. **Agente de Conhecimento:** O banco de dados turístico. Retorna a moeda local, fuso horário, atrações e dicas de segurança do destino.
5. **Agente de Clima:** Avalia as datas da viagem, prevê a temperatura média da estação e gera sugestões inteligentes para fazer as malas.
6. **Especialista em Voos:** Focado na criação das lógicas de voos domésticos e internacionais e companhias aéreas.
7. **Especialista em Hospedagem:** Analisa o perfil solicitado (Airbnb, resort, hotel ou pousada) para precificar e gerar as opções de estadia.
8. **Especialista em Roteiros:** Monta um cronograma diário completo baseado na exata quantidade de dias da viagem (Manhã, Tarde e Noite).
9. **Agente de Orçamento e Finanças:** O braço financeiro. Cruza taxas de câmbio, enquadra o plano no "orçamento máximo" fornecido pelo usuário e constrói as URLs diretas de parceiros.
10. **Agente Validador:** A auditoria final. Avalia a coerência das datas e do pacote antes de exibi-lo ao usuário.

## 🛠️ Tecnologias Utilizadas

O projeto foi totalmente desenvolvido utilizando um ecossistema moderno voltado à alta performance e experiência visual:

- **[React 19](https://react.dev/):** Biblioteca principal para a construção das interfaces de usuário e gerenciamento de estado.
- **[Vite](https://vitejs.dev/):** Bundler super rápido responsável pelo ambiente de desenvolvimento e build.
- **[Tailwind CSS (v4)](https://tailwindcss.com/):** Framework de utilitários CSS para estilização ágil, garantindo design responsivo e moderno (Glassmorphism e Dark Mode).
- **[Framer Motion](https://www.framer.com/motion/):** Biblioteca de animações para micro-interações fluidas e responsivas na interface.
- **[Lucide React](https://lucide.dev/):** Pacote de ícones altamente customizáveis e leves.

## 🚀 Como Rodar Localmente

Siga o passo a passo abaixo para rodar o projeto em sua máquina local:

1. **Clone este repositório:**
   ```bash
   git clone https://github.com/SEU-USUARIO/multi-agent-travel-system.git
   ```

2. **Acesse a pasta do projeto:**
   ```bash
   cd multi-agent-travel-system
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. O servidor estará rodando. Basta acessar `http://localhost:5173` no seu navegador!

---

## 📸 Demonstração / Telas do Sistema

> *💡 Dica: Adicione aqui GIFs, vídeos ou screenshots que você capturou durante os testes (Interface Principal, Orçamentos, Roteiros, e Links gerados).*

<p align="center">
  <i>(Insira a imagem de demonstração aqui)</i>
</p>

---

<div align="center">
  Feito com ❤️ por Caiom (ou seu nome/equipe). <br />
  Avaliado na Sprint 4.
</div>

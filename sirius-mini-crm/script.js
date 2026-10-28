
/* ========================================
   SIRIUS CRM - LÓGICA DO APLICATIVO
   ======================================== */

const STORAGE_KEY = "sirius-crm-contatos-v1";

// Configuraremos esta URL quando criarmos o Webhook no n8n.
const N8N_WEBHOOK_URL = "https://mirandaapp.app.n8n.cloud/webhook/sirius-crm-contatos";

// Estado principal da aplicação.
let contatos = carregarContatos();
let contatoEmEdicao = null;

/* ========================================
   ELEMENTOS DA INTERFACE
   ======================================== */

const formContato = document.getElementById("formContato");
const tituloFormulario = document.getElementById("tituloFormulario");
const campoNome = document.getElementById("nome");
const campoWhatsapp = document.getElementById("whatsapp");
const campoMensagem = document.getElementById("mensagem");

const listaContatos = document.getElementById("listaContatos");
const buscaContato = document.getElementById("buscaContato");
const filtroStatus = document.getElementById("filtroStatus");

const btnNovoContato = document.getElementById("btnNovoContato");
const btnFecharFormulario = document.getElementById("btnFecharFormulario");
const btnCancelar = document.getElementById("btnCancelar");

const notificacoes = document.getElementById("notificacoes");

/* ========================================
   ARMAZENAMENTO LOCAL
   ======================================== */

// Recupera os contatos salvos no navegador.
function carregarContatos() {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);

    if (!dados) {
      return [];
    }

    const resultado = JSON.parse(dados);

    if (!Array.isArray(resultado)) {
      return [];
    }

    // Valida os campos essenciais antes de usar os dados.
    return resultado.filter((contato) => {
      return (
        contato &&
        typeof contato.id === "string" &&
        typeof contato.nome === "string" &&
        typeof contato.whatsapp === "string" &&
        typeof contato.mensagem === "string" &&
        ["Novo", "Em atendimento", "Finalizado"].includes(
          contato.status
        )
      );
    });
  } catch (erro) {
    console.error("Erro ao recuperar contatos:", erro);
    return [];
  }
}

// Salva o estado atual dos contatos.
function salvarContatos() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(contatos)
    );

    return true;
  } catch (erro) {
    console.error("Erro ao salvar contatos:", erro);

    mostrarNotificacao(
      "Não foi possível salvar os dados no navegador.",
      "error"
    );

    return false;
  }
}

/* ========================================
   FUNÇÕES AUXILIARES
   ======================================== */

// Gera identificadores únicos para os contatos.
function gerarId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  );
}

// Escapa caracteres para evitar inserir HTML fornecido pelo usuário.
function escaparHTML(valor) {
  return String(valor).replace(/[&<>"']/g, (caractere) => {
    const entidades = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entidades[caractere];
  });
}

// Apresenta mensagens temporárias na interface.
function mostrarNotificacao(mensagem, tipo = "success") {
  const notificacao = document.createElement("div");

  notificacao.className = `toast ${tipo}`;
  notificacao.textContent = mensagem;

  notificacoes.appendChild(notificacao);

  setTimeout(() => {
    notificacao.remove();
  }, 4000);
}

// Encontra um contato pelo identificador.
function encontrarContato(id) {
  return contatos.find((contato) => contato.id === id);
}

/* ========================================
   FORMULÁRIO
   ======================================== */

function abrirFormulario(contato = null) {
  contatoEmEdicao = contato ? contato.id : null;

  formContato.reset();
  formContato.hidden = false;

  if (contato) {
    tituloFormulario.textContent = "Editar contato";
    campoNome.value = contato.nome;
    campoWhatsapp.value = contato.whatsapp;
    campoMensagem.value = contato.mensagem;

    document.getElementById("btnSalvar").textContent =
      "Salvar alterações";
  } else {
    tituloFormulario.textContent = "Cadastrar contato";

    document.getElementById("btnSalvar").textContent =
      "Salvar contato";
  }

  formContato.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  campoNome.focus({ preventScroll: true });
}

function fecharFormulario() {
  formContato.reset();
  formContato.hidden = true;
  contatoEmEdicao = null;

  tituloFormulario.textContent = "Cadastrar contato";

  document.getElementById("btnSalvar").textContent =
    "Salvar contato";
}

// Cadastrar um contato ou atualizar um existente.
formContato.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nome = campoNome.value.trim();
  const whatsapp = campoWhatsapp.value.trim();
  const mensagem = campoMensagem.value.trim();

  if (!nome || !whatsapp || !mensagem) {
    mostrarNotificacao(
      "Preencha todos os campos obrigatórios.",
      "error"
    );
    return;
  }

  const contatoAnterior = contatoEmEdicao
    ? encontrarContato(contatoEmEdicao)
    : null;

  const contato = {
    id: contatoEmEdicao || gerarId(),
    nome,
    whatsapp,
    mensagem,
    status: contatoAnterior?.status || "Novo",
    criadoEm: contatoAnterior?.criadoEm || new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),

    // Preserva uma análise anterior somente se os dados não mudaram.
    analise: contatoAnterior &&
      contatoAnterior.nome === nome &&
      contatoAnterior.whatsapp === whatsapp &&
      contatoAnterior.mensagem === mensagem
      ? contatoAnterior.analise || null
      : null
  };

  const listaAnterior = contatos;

  if (contatoEmEdicao) {
    contatos = contatos.map((item) =>
      item.id === contatoEmEdicao ? contato : item
    );
  } else {
    contatos = [contato, ...contatos];
  }

  if (!salvarContatos()) {
    contatos = listaAnterior;
    return;
  }

  renderizarAplicativo();
  fecharFormulario();

  mostrarNotificacao(
    contatoEmEdicao
      ? "Contato atualizado com sucesso."
      : "Contato cadastrado com sucesso."
  );
});

/* ========================================
   EXIBIÇÃO DOS CONTATOS
   ======================================== */

function renderizarContatos() {
  const termo = buscaContato.value.trim().toLowerCase();
  const statusSelecionado = filtroStatus.value;

  const contatosFiltrados = contatos.filter((contato) => {
    const correspondeBusca =
      contato.nome.toLowerCase().includes(termo) ||
      contato.whatsapp.toLowerCase().includes(termo) ||
      contato.mensagem.toLowerCase().includes(termo);

    const correspondeStatus =
      statusSelecionado === "Todos" ||
      contato.status === statusSelecionado;

    return correspondeBusca && correspondeStatus;
  });

  if (contatosFiltrados.length === 0) {
    const temContatos = contatos.length > 0;

    listaContatos.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <div class="empty-icon" aria-hidden="true">♙</div>
          <strong>${
            temContatos
              ? "Nenhum contato encontrado"
              : "Nenhum contato cadastrado"
          }</strong>
          <p>${
            temContatos
              ? "Tente mudar os filtros ou a busca."
              : "Adicione seu primeiro contato para começar."
          }</p>
        </td>
      </tr>
    `;

    atualizarContador(contatosFiltrados.length);
    return;
  }

  listaContatos.innerHTML = contatosFiltrados
    .map(criarLinhaContato)
    .join("");

  atualizarContador(contatosFiltrados.length);
}

function criarLinhaContato(contato) {
  const id = escaparHTML(contato.id);

  const analise = contato.analise
    ? criarHTMLAnalise(contato.analise)
    : `<span class="text-muted">Ainda não analisado</span>`;

  return `
    <tr>
      <td>
        <div class="contact-name">${escaparHTML(contato.nome)}</div>
        <div class="contact-phone">${escaparHTML(contato.whatsapp)}</div>
      </td>

      <td>
        <div class="message-preview"
          title="${escaparHTML(contato.mensagem)}">
          ${escaparHTML(contato.mensagem)}
        </div>
      </td>

      <td>
        <select
          class="status-select"
          data-action="status"
          data-id="${id}"
          aria-label="Status de ${escaparHTML(contato.nome)}"
        >
          ${criarOpcaoStatus("Novo", contato.status)}
          ${criarOpcaoStatus("Em atendimento", contato.status)}
          ${criarOpcaoStatus("Finalizado", contato.status)}
        </select>
      </td>

      <td>${analise}</td>

      <td>
        <div class="action-group">
          <button
            class="action-button"
            type="button"
            data-action="analisar"
            data-id="${id}"
          >
            ✦ Analisar
          </button>

          <button
            class="action-button edit"
            type="button"
            data-action="editar"
            data-id="${id}"
          >
            Editar
          </button>

          <button
            class="action-button delete"
            type="button"
            data-action="excluir"
            data-id="${id}"
          >
            Excluir
          </button>
        </div>
      </td>
    </tr>
  `;
}

function criarOpcaoStatus(status, statusAtual) {
  const selecionado = status === statusAtual ? "selected" : "";

  return `
    <option value="${escaparHTML(status)}" ${selecionado}>
      ${escaparHTML(status)}
    </option>
  `;
}

function criarHTMLAnalise(analise) {
  const prioridades = {
    Alta: "priority-high",
    Média: "priority-medium",
    Baixa: "priority-low"
  };

  const classePrioridade =
    prioridades[analise.prioridade] || "";

  return `
    <div class="analysis-result">
      <p class="analysis-title">✦ Análise comercial</p>

      <div class="analysis-meta">
        <span class="analysis-tag">
          ${escaparHTML(analise.categoria)}
        </span>

        <span class="analysis-tag ${classePrioridade}">
          Prioridade: ${escaparHTML(analise.prioridade)}
        </span>
      </div>

      <p class="analysis-response">
        ${escaparHTML(analise.resposta)}
      </p>
    </div>
  `;
}

/* ========================================
   INDICADORES E CONTADOR
   ======================================== */

function atualizarIndicadores() {
  document.getElementById("totalContatos").textContent =
    contatos.length;

  document.getElementById("totalNovos").textContent =
    contatos.filter((c) => c.status === "Novo").length;

  document.getElementById("totalAtendimento").textContent =
    contatos.filter((c) => c.status === "Em atendimento").length;

  document.getElementById("totalFinalizados").textContent =
    contatos.filter((c) => c.status === "Finalizado").length;
}

function atualizarContador(quantidadeVisivel) {
  const total = contatos.length;

  const textoTotal =
    `${total} ${total === 1 ? "contato" : "contatos"}`;

  const textoVisivel =
    quantidadeVisivel === total
      ? textoTotal
      : `${quantidadeVisivel} de ${textoTotal}`;

  document.getElementById("contadorContatos").textContent =
    textoVisivel;
}

function renderizarAplicativo() {
  atualizarIndicadores();
  renderizarContatos();
}

/* ========================================
   AÇÕES DA TABELA
   ======================================== */

// Usa delegação de eventos para tratar botões e status
// mesmo quando a tabela é reconstruída.
listaContatos.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-action]");

  if (!botao) {
    return;
  }

  const { action, id } = botao.dataset;
  const contato = encontrarContato(id);

  if (!contato) {
    mostrarNotificacao("Contato não encontrado.", "error");
    return;
  }

  if (action === "editar") {
    abrirFormulario(contato);
  }

  if (action === "excluir") {
    excluirContato(contato);
  }

  if (action === "analisar") {
    analisarComIA(contato.id, botao);
  }
});

// Atualiza o status selecionado pelo usuário.
listaContatos.addEventListener("change", (evento) => {
  const select = evento.target.closest(
    'select[data-action="status"]'
  );

  if (!select) {
    return;
  }

  const contato = encontrarContato(select.dataset.id);

  if (!contato) {
    return;
  }

  const statusAnterior = contato.status;
  const listaAnterior = contatos;

  contatos = contatos.map((item) =>
    item.id === contato.id
      ? {
          ...item,
          status: select.value,
          atualizadoEm: new Date().toISOString()
        }
      : item
  );

  if (!salvarContatos()) {
    contatos = listaAnterior;
    renderizarAplicativo();
    return;
  }

  renderizarAplicativo();

  mostrarNotificacao(
    `Status atualizado: ${statusAnterior} → ${select.value}.`
  );
});

// Remove um contato após confirmação.
function excluirContato(contato) {
  const confirmar = window.confirm(
    `Deseja realmente excluir o contato "${contato.nome}"?`
  );

  if (!confirmar) {
    return;
  }

  const listaAnterior = contatos;

  contatos = contatos.filter(
    (item) => item.id !== contato.id
  );

  if (!salvarContatos()) {
    contatos = listaAnterior;
    return;
  }

  renderizarAplicativo();

  mostrarNotificacao("Contato excluído com sucesso.");
}

/* ========================================
   BUSCA E FILTROS
   ======================================== */

buscaContato.addEventListener("input", renderizarContatos);
filtroStatus.addEventListener("change", renderizarContatos);

/* ========================================
   BOTÕES DO FORMULÁRIO
   ======================================== */

btnNovoContato.addEventListener("click", () => {
  abrirFormulario();
});

btnFecharFormulario.addEventListener(
  "click",
  fecharFormulario
);

btnCancelar.addEventListener("click", fecharFormulario);

/* ========================================
   INTEGRAÇÃO COM IA - PRÓXIMA ETAPA
   ======================================== */

async function analisarComIA(id, botao) {
  const contato = encontrarContato(id);

  if (!contato) {
    mostrarNotificacao("Contato não encontrado.", "error");
    return;
  }

  if (!N8N_WEBHOOK_URL) {
    mostrarNotificacao(
      "O Webhook do n8n ainda não foi configurado. " +
      "Vamos conectá-lo na próxima etapa.",
      "error"
    );
    return;
  }

  const textoOriginal = botao.textContent;

  botao.disabled = true;
  botao.textContent = "Analisando...";

  try {
    const respostaHTTP = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome: contato.nome,
        whatsapp: contato.whatsapp,
        mensagem: contato.mensagem
      })
    });

    if (!respostaHTTP.ok) {
      throw new Error(
        `O serviço retornou o status ${respostaHTTP.status}.`
      );
    }

    const resultado = await respostaHTTP.json();

    const categoriasPermitidas = [
      "Abertura de empresa",
      "Consultoria",
      "Produtos digitais",
      "Outros serviços"
    ];

    const prioridadesPermitidas = [
      "Alta",
      "Média",
      "Baixa",
      "Media"
    ];

    if (
      !categoriasPermitidas.includes(resultado.categoria) ||
      !prioridadesPermitidas.includes(resultado.prioridade) ||
      typeof resultado.resposta !== "string" ||
      !resultado.resposta.trim()
    ) {
      throw new Error(
        "A resposta da automação está incompleta ou inválida."
      );
    }

    const listaAnterior = contatos;

    contatos = contatos.map((item) =>
      item.id === id
        ? {
            ...item,
            analise: {
              categoria: resultado.categoria,
              prioridade:
                resultado.prioridade === "Media"
                  ? "Média"
                  : resultado.prioridade,
              resposta: resultado.resposta
            }
          }
        : item
    );

    if (!salvarContatos()) {
      contatos = listaAnterior;
      renderizarAplicativo();
      return;
    }

    renderizarAplicativo();

    mostrarNotificacao(
      "Análise comercial recebida com sucesso."
    );
  } catch (erro) {
    console.error("Erro na análise:", erro);

    mostrarNotificacao(
      "Não foi possível concluir a análise. " +
      "Verifique o Webhook e a conexão com o n8n.",
      "error"
    );
  } finally {
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
}

/* ========================================
   INICIALIZAÇÃO
   ======================================== */

renderizarAplicativo();

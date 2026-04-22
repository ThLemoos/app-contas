// ========================================
// CONTROLE FÁCIL — script.js
// ========================================

// 🔥 CONFIG FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyB-tiKS-EUwiMaiHF0cH8p8fIVsQy4eSzw",
    authDomain: "app-contas-88fd3.firebaseapp.com",
    projectId: "app-contas-88fd3",
    storageBucket: "app-contas-88fd3.firebasestorage.app",
    messagingSenderId: "939142410016",
    appId: "1:939142410016:web:3d2beeb98fa8f849df7145"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🔥 DADOS
let contas = [];
let historico = [];

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    mostrarMes();
    carregarDados();
    configurarKeyboard();
    esconderSplash();
});

function esconderSplash() {
    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) {
            splash.classList.add("hidden");
            setTimeout(() => splash.remove(), 500);
        }
    }, 1400);
}

function configurarKeyboard() {
    // Permite adicionar conta com Enter no último campo
    document.getElementById("valorConta").addEventListener("keydown", (e) => {
        if (e.key === "Enter") adicionarConta();
    });
    document.getElementById("nomeConta").addEventListener("keydown", (e) => {
        if (e.key === "Enter") document.getElementById("valorConta").focus();
    });
    document.getElementById("cartao").addEventListener("keydown", (e) => {
        if (e.key === "Enter") document.getElementById("nomeConta").focus();
    });
}

// ========================================
// FIREBASE
// ========================================
async function carregarDados() {
    try {
        const doc = await db.collection("dados").doc("usuario").get();
        if (doc.exists) {
            const data = doc.data();
            contas = data.contas || [];
            historico = data.historico || [];
        }
        renderizar();
    } catch (e) {
        toast("Erro ao carregar dados", "error");
    }
}

async function salvar() {
    try {
        await db.collection("dados").doc("usuario").set({
            contas: contas,
            historico: historico
        });
    } catch (e) {
        toast("Erro ao salvar", "error");
    }
}

// Tempo real
db.collection("dados").doc("usuario").onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();
        contas = data.contas || [];
        historico = data.historico || [];
        renderizar();
    }
});

// ========================================
// MÊS
// ========================================
function mostrarMes() {
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const hoje = new Date();
    document.getElementById("mesAtual").innerText =
        meses[hoje.getMonth()].toUpperCase() + " " + hoje.getFullYear();
}

// ========================================
// ADICIONAR CONTA
// ========================================
function adicionarConta() {
    const cartao = document.getElementById("cartao").value.trim();
    const nome = document.getElementById("nomeConta").value.trim();
    const valorRaw = document.getElementById("valorConta").value;
    const valor = parseFloat(valorRaw);

    if (!cartao) { toast("Informe o cartão ou pessoa", "error"); document.getElementById("cartao").focus(); return; }
    if (!nome) { toast("Informe a descrição da conta", "error"); document.getElementById("nomeConta").focus(); return; }
    if (!valorRaw || isNaN(valor) || valor <= 0) { toast("Informe um valor válido", "error"); document.getElementById("valorConta").focus(); return; }

    contas.push({ cartao, nome, valor });
    salvar();

    document.getElementById("nomeConta").value = "";
    document.getElementById("valorConta").value = "";
    document.getElementById("nomeConta").focus();

    toast("Conta adicionada!", "success");
}

// ========================================
// RENDERIZAR CONTAS
// ========================================
function renderizar() {
    const lista = document.getElementById("listaContas");
    const emptyState = document.getElementById("emptyState");

    let total = contas.reduce((acc, c) => acc + c.valor, 0);

    // Total hero
    document.getElementById("totalGeral").innerText = formatarMoeda(total);
    document.getElementById("badgeQtd").innerText = contas.length;

    const qtdEl = document.getElementById("qtdContas");
    qtdEl.innerText = contas.length === 0
        ? "Nenhuma conta ainda"
        : `${contas.length} ${contas.length === 1 ? "conta" : "contas"} registrada${contas.length === 1 ? "" : "s"}`;

    // Limpar lista (mantém o emptyState)
    const cardsAntigos = lista.querySelectorAll(".card");
    cardsAntigos.forEach(c => c.remove());

    if (contas.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    // Agrupar por cartão
    let agrupado = {};
    contas.forEach((c, index) => {
        if (!agrupado[c.cartao]) agrupado[c.cartao] = [];
        agrupado[c.cartao].push({ ...c, index });
    });

    let delay = 0;
    for (let cartao in agrupado) {
        const info = getInfoCartao(cartao);
        const subtotal = agrupado[cartao].reduce((acc, c) => acc + c.valor, 0);

        const card = document.createElement("div");
        card.className = "card";
        card.style.animationDelay = `${delay}ms`;

        let itensHtml = agrupado[cartao].map(c => `
            <div class="item-conta">
                <span class="item-nome">${escHtml(c.nome)}</span>
                <span class="item-valor">${formatarMoeda(c.valor)}</span>
                <button class="btn-excluir" onclick="excluirConta(${c.index})" title="Remover">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        `).join("");

        card.innerHTML = `
            <div class="card-header">
                <div class="icone" style="background:${info.cor}">${info.icone}</div>
                <div class="card-header-info">
                    <h3>${escHtml(cartao)}</h3>
                    <div class="card-subtotal">${agrupado[cartao].length} ${agrupado[cartao].length === 1 ? "item" : "itens"}</div>
                </div>
            </div>
            <div class="card-body">${itensHtml}</div>
            <div class="card-footer">
                <span class="subtotal-label">Subtotal</span>
                <span class="subtotal-valor">${formatarMoeda(subtotal)}</span>
            </div>
        `;

        lista.appendChild(card);
        delay += 50;
    }
}

// ========================================
// FECHAR MÊS
// ========================================
function fecharMes() {
    if (contas.length === 0) {
        toast("Não há contas para fechar!", "error");
        return;
    }

    if (!confirm(`Fechar ${document.getElementById("mesAtual").innerText}? Isso moverá as contas para o histórico.`)) return;

    const mesTexto = document.getElementById("mesAtual").innerText;
    const total = contas.reduce((acc, c) => acc + c.valor, 0);

    historico.unshift({
        mes: mesTexto,
        total: total,
        contas: [...contas]
    });

    contas = [];
    salvar();
    toast("Mês fechado com sucesso! 🎉", "success");
}

// ========================================
// HISTÓRICO
// ========================================
function renderizarHistorico() {
    const div = document.getElementById("historico");
    div.innerHTML = "";

    if (historico.length === 0) {
        div.innerHTML = `
            <div class="hist-empty">
                <div class="hist-empty-icon">📭</div>
                <div class="hist-empty-text">Nenhum mês no histórico</div>
            </div>
        `;
        return;
    }

    historico.forEach((mes, index) => {
        const card = document.createElement("div");
        card.className = "hist-card";

        let agrupado = {};
        mes.contas.forEach(c => {
            if (!agrupado[c.cartao]) agrupado[c.cartao] = [];
            agrupado[c.cartao].push(c);
        });

        let subcardsHtml = "";
        for (let cartao in agrupado) {
            const info = getInfoCartao(cartao);
            const subtotal = agrupado[cartao].reduce((acc, c) => acc + c.valor, 0);

            let itensHtml = agrupado[cartao].map(c => `
                <div class="hist-item">
                    <span class="hist-item-nome">${escHtml(c.nome)}</span>
                    <span class="hist-item-val">${formatarMoeda(c.valor)}</span>
                </div>
            `).join("");

            subcardsHtml += `
                <div class="hist-sub-card">
                    <div class="hist-sub-header">
                        <div class="icone" style="background:${info.cor}; width:28px; height:28px; font-size:11px;">${info.icone}</div>
                        <span class="hist-sub-nome">${escHtml(cartao)}</span>
                        <span class="hist-sub-total">${formatarMoeda(subtotal)}</span>
                    </div>
                    ${itensHtml}
                </div>
            `;
        }

        card.innerHTML = `
            <div class="hist-card-header" onclick="toggleHistCard(this)">
                <span class="hist-mes-nome">${escHtml(mes.mes)}</span>
                <div class="hist-right">
                    <span class="hist-total">${formatarMoeda(mes.total)}</span>
                    <button class="hist-del" onclick="excluirMes(event, ${index})" title="Excluir mês">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                    <svg class="hist-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
            </div>
            <div class="hist-body">
                ${subcardsHtml}
            </div>
        `;

        div.appendChild(card);
    });
}

function toggleHistCard(header) {
    header.classList.toggle("aberto");
    const body = header.nextElementSibling;
    const chevron = header.querySelector(".hist-chevron");
    body.classList.toggle("aberto");
    chevron.classList.toggle("rotated");
}

function abrirHistorico() {
    renderizarHistorico();
    document.getElementById("modalHistorico").classList.add("open");
    document.body.style.overflow = "hidden";
}

function fecharHistorico() {
    document.getElementById("modalHistorico").classList.remove("open");
    document.body.style.overflow = "";
}

function fecharSeClicouFora(event) {
    if (event.target === document.getElementById("modalHistorico")) {
        fecharHistorico();
    }
}

// ========================================
// EXCLUIR
// ========================================
function excluirMes(event, index) {
    event.stopPropagation();
    if (!confirm("Excluir este mês do histórico?")) return;
    historico.splice(index, 1);
    salvar();
    renderizarHistorico();
    toast("Mês removido", "success");
}

function excluirConta(index) {
    if (!confirm("Remover esta conta?")) return;
    contas.splice(index, 1);
    salvar();
    toast("Conta removida", "success");
}

// ========================================
// IDENTIDADE DOS CARTÕES
// ========================================
function getInfoCartao(cartao) {
    const c = cartao.toLowerCase();
    if (c.includes("nubank")) return { cor: "#8A05BE", icone: "Nu" };
    if (c.includes("itaú") || c.includes("itau")) return { cor: "#FF6200", icone: "it" };
    if (c.includes("inter")) return { cor: "#FF8700", icone: "IN" };
    if (c.includes("bradesco")) return { cor: "#CC092F", icone: "Bd" };
    if (c.includes("santander")) return { cor: "#EC0000", icone: "Sa" };
    if (c.includes("caixa")) return { cor: "#005CA9", icone: "CE" };
    if (c.includes("bruna")) return { cor: "#E11D48", icone: "B" };
    if (c.includes("mãe") || c.includes("mae")) return { cor: "#EC4899", icone: "M" };
    if (c.includes("pai")) return { cor: "#2563EB", icone: "P" };
    if (c.includes("c6")) return { cor: "#333", icone: "C6" };

    // Cor gerada a partir do nome
    const cores = ["#7C3AED", "#0891B2", "#059669", "#D97706", "#DC2626", "#9333EA", "#0284C7"];
    let hash = 0;
    for (let i = 0; i < cartao.length; i++) hash = cartao.charCodeAt(i) + ((hash << 5) - hash);
    const cor = cores[Math.abs(hash) % cores.length];
    return { cor, icone: cartao.substring(0, 2).toUpperCase() };
}

// ========================================
// UTILITÁRIOS
// ========================================
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

let toastTimer;
function toast(msg, tipo = "") {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.className = "toast show " + tipo;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        el.className = "toast";
    }, 2800);
}
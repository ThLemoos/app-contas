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

// 🔥 CARREGAR DADOS
async function carregarDados() {
    const doc = await db.collection("dados").doc("usuario").get();

    if (doc.exists) {
        const data = doc.data();
        contas = data.contas || [];
        historico = data.historico || [];
    }

    renderizar();
}

// 🔥 SALVAR NO FIREBASE
async function salvar() {
    await db.collection("dados").doc("usuario").set({
        contas: contas,
        historico: historico
    });
}

// 🔥 TEMPO REAL
db.collection("dados").doc("usuario")
    .onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            contas = data.contas || [];
            historico = data.historico || [];

            renderizar();
        }
    });

// 🔥 MÊS
function mostrarMes() {
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const hoje = new Date();
    document.getElementById("mesAtual").innerText =
        meses[hoje.getMonth()] + " de " + hoje.getFullYear();
}

// 🔥 ADICIONAR CONTA
function adicionarConta() {
    const cartao = document.getElementById("cartao").value;
    const nome = document.getElementById("nomeConta").value;
    const valor = parseFloat(document.getElementById("valorConta").value);

    if (!cartao || !nome || !valor) {
        alert("Preencha tudo!");
        return;
    }

    contas.push({ cartao, nome, valor });

    salvar();

    document.getElementById("cartao").value = "";
    document.getElementById("nomeConta").value = "";
    document.getElementById("valorConta").value = "";
}

// 🔥 RENDERIZAR
function renderizar() {
    const lista = document.getElementById("listaContas");
    lista.innerHTML = "";

    let agrupado = {};
    let total = 0;

    contas.forEach((c, index) => {
        if (!agrupado[c.cartao]) {
            agrupado[c.cartao] = [];
        }
        agrupado[c.cartao].push({ ...c, index });
        total += c.valor;
    });

    for (let cartao in agrupado) {
        const div = document.createElement("div");
        div.className = "card";

        let info = getInfoCartao(cartao);
        let subtotal = agrupado[cartao].reduce((acc, c) => acc + c.valor, 0);

        let html = `
            <div class="card-header">
                <div class="icone" style="background:${info.cor}">
                    ${info.icone}
                </div>
                <h3>${cartao}</h3>
            </div>
        `;

        agrupado[cartao].forEach(c => {
            html += `
                <div class="item-conta">
                    <span>${c.nome}</span>
                    <span>R$ ${c.valor.toFixed(2)}</span>
                    <button onclick="excluirConta(${c.index})">❌</button>
                </div>
            `;
        });

        html += `<p class="subtotal">Total: R$ ${subtotal.toFixed(2)}</p>`;

        div.innerHTML = html;
        lista.appendChild(div);
    }

    document.getElementById("totalGeral").innerText =
        "Total: R$ " + total.toFixed(2);
}

// 🔥 FECHAR MÊS
function fecharMes() {
    if (contas.length === 0) {
        alert("Não há contas para fechar!");
        return;
    }

    const mesTexto = document.getElementById("mesAtual").innerText;
    let total = contas.reduce((acc, c) => acc + c.valor, 0);

    historico.push({
        mes: mesTexto,
        total: total,
        contas: [...contas]
    });

    contas = [];
    salvar();

    alert("Mês fechado com sucesso!");
}

// 🔥 HISTÓRICO
function renderizarHistorico() {
    const div = document.getElementById("historico");
    div.innerHTML = "";

    historico.forEach((mes, index) => {
        let bloco = document.createElement("div");
        bloco.className = "card";

        let html = `
            <h3>${mes.mes}</h3>
            <p><strong>Total: R$ ${mes.total.toFixed(2)}</strong></p>
            <button onclick="excluirMes(${index})">🗑️ Excluir mês</button>
        `;

        let agrupado = {};

        mes.contas.forEach(c => {
            if (!agrupado[c.cartao]) {
                agrupado[c.cartao] = [];
            }
            agrupado[c.cartao].push(c);
        });

        for (let cartao in agrupado) {
            let subtotal = agrupado[cartao].reduce((acc, c) => acc + c.valor, 0);
            let info = getInfoCartao(cartao);

            html += `<div class="card" style="margin-top:10px;">`;

            html += `
                <div class="card-header">
                    <div class="icone" style="background:${info.cor}">
                        ${info.icone}
                    </div>
                    <h4>${cartao}</h4>
                </div>
            `;

            agrupado[cartao].forEach(c => {
                html += `<p>${c.nome} - R$ ${c.valor.toFixed(2)}</p>`;
            });

            html += `<p class="subtotal">Total: R$ ${subtotal.toFixed(2)}</p>`;
            html += `</div>`;
        }

        bloco.innerHTML = html;
        div.appendChild(bloco);
    });
}

// 🔥 MODAL
function abrirHistorico() {
    renderizarHistorico();
    document.getElementById("modalHistorico").style.display = "block";
}

function fecharHistorico() {
    document.getElementById("modalHistorico").style.display = "none";
}

window.onclick = function (event) {
    let modal = document.getElementById("modalHistorico");
    if (event.target === modal) {
        fecharHistorico();
    }
}

// 🔥 EXCLUIR
function excluirMes(index) {
    if (!confirm("Tem certeza?")) return;

    historico.splice(index, 1);
    salvar();
}

function excluirConta(index) {
    if (!confirm("Excluir conta?")) return;

    contas.splice(index, 1);
    salvar();
}

// 🔥 IDENTIDADE
function getInfoCartao(cartao) {
    cartao = cartao.toLowerCase();

    if (cartao.includes("nubank")) return { cor: "#8A05BE", icone: "nu" };
    if (cartao.includes("itaú") || cartao.includes("itau")) return { cor: "#FF6200", icone: "it" };
    if (cartao.includes("bruna")) return { cor: "#E11D48", icone: "B" };
    if (cartao.includes("mãe") || cartao.includes("mae")) return { cor: "#EC4899", icone: "M" };
    if (cartao.includes("pai")) return { cor: "#2563EB", icone: "P" };

    return { cor: "#64748B", icone: "💳" };
}

// 🚀 INICIAR
mostrarMes();
carregarDados();
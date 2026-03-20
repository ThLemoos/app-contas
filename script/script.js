let contas = JSON.parse(localStorage.getItem("contas")) || [];

function salvar() {
    localStorage.setItem("contas", JSON.stringify(contas));
}

function mostrarMes() {
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const hoje = new Date();
    document.getElementById("mesAtual").innerText =
        meses[hoje.getMonth()] + " de " + hoje.getFullYear();
}

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
    renderizar();

    document.getElementById("cartao").value = "";
    document.getElementById("nomeConta").value = "";
    document.getElementById("valorConta").value = "";
}

function renderizar() {
    const lista = document.getElementById("listaContas");
    lista.innerHTML = "";

    let agrupado = {};
    let total = 0;

    contas.forEach(c => {
        if (!agrupado[c.cartao]) {
            agrupado[c.cartao] = [];
        }
        agrupado[c.cartao].push(c);
        total += c.valor;
    });

    for (let cartao in agrupado) {
        const div = document.createElement("div");
        div.className = "card";

        let html = `<h3>${cartao}</h3>`;

        agrupado[cartao].forEach(c => {
            html += `<p>${c.nome} - R$ ${c.valor.toFixed(2)}</p>`;
        });

        div.innerHTML = html;
        lista.appendChild(div);
    }

    document.getElementById("totalGeral").innerText =
        "Total: R$ " + total.toFixed(2);
}

mostrarMes();
renderizar();

let historico = JSON.parse(localStorage.getItem("historico")) || [];

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
        contas: contas
    });

    localStorage.setItem("historico", JSON.stringify(historico));

    contas = [];
    salvar();

    renderizar();
    renderizarHistorico();

    alert("Mês fechado com sucesso!");
}

function renderizarHistorico() {
    const div = document.getElementById("historico");
    div.innerHTML = "";

    historico.forEach((mes, index) => {
        let bloco = document.createElement("div");
        bloco.className = "card";

        let html = `
      <h3>${mes.mes}</h3>
      <p>Total: R$ ${mes.total.toFixed(2)}</p>
      <button onclick="excluirMes(${index})">🗑️ Excluir mês</button>
    `;

        mes.contas.forEach(c => {
            html += `<p>${c.cartao} - ${c.nome} - R$ ${c.valor.toFixed(2)}</p>`;
        });

        bloco.innerHTML = html;
        div.appendChild(bloco);
    });
}

function abrirHistorico() {
    document.getElementById("modalHistorico").style.display = "block";
}

function fecharHistorico() {
    renderizarHistorico();
    document.getElementById("modalHistorico").style.display = "none";
}

window.onclick = function (event) {
    let modal = document.getElementById("modalHistorico");
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

function excluirMes(index) {
    let confirmar = confirm("Tem certeza que deseja excluir este mês?");

    if (!confirmar) return;

    historico.splice(index, 1);

    localStorage.setItem("historico", JSON.stringify(historico));

    renderizarHistorico();
}
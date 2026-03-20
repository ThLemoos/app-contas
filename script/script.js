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
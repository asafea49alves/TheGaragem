// script.js - Funcionalidades para The Garage

// Variáveis globais
let carrinho = [];
let total = 0;

// Carregar carrinho do localStorage ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    carregarCarrinho();
    iniciarContagemRegressiva();
    // Adicionar event listener para fechar modal ao clicar fora
    document.addEventListener('click', function(event) {
        const modal = document.getElementById('modal');
        if (modal && modal.style.display === 'block' && !modal.contains(event.target)) {
            fecharModal();
        }
    });
});

// Função para carregar carrinho do localStorage
function carregarCarrinho() {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
        carrinho = JSON.parse(carrinhoSalvo);
        total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        atualizarCarrinho();
    }
}

// Função para salvar carrinho no localStorage
function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// Função para adicionar item ao carrinho
function adicionarAoCarrinho(produto, preco) {
    const quantidadeId = `qtd-${produto}`;
    const quantidade = parseInt(document.getElementById(quantidadeId).textContent);
    
    const itemExistente = carrinho.find(item => item.nome === produto);
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({ nome: produto, preco: preco, quantidade: quantidade });
    }
    total += preco * quantidade;
    salvarCarrinho();
    atualizarCarrinho();
    alert(`${quantidade} x ${produto} adicionado(s) ao carrinho!`);
}

// Função para remover item do carrinho
function removerDoCarrinho(index) {
    total -= carrinho[index].preco * carrinho[index].quantidade;
    carrinho.splice(index, 1);
    salvarCarrinho();
    atualizarCarrinho();
}

// Função para atualizar display do carrinho
function atualizarCarrinho() {
    const itens = document.getElementById('carrinho-itens');
    const count = document.getElementById('cart-count');
    const totalSpan = document.getElementById('total');

    itens.innerHTML = '';
    carrinho.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'carrinho-item';
        div.innerHTML = `
            <span>${item.quantidade} x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
            <button onclick="removerDoCarrinho(${index})">Remover</button>
        `;
        itens.appendChild(div);
    });

    count.textContent = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    totalSpan.textContent = total.toFixed(2);
}

// Função para toggle do carrinho
function toggleCarrinho() {
    const carrinhoDiv = document.getElementById('carrinho');
    const overlay = document.getElementById('overlay');
    if (carrinhoDiv.style.display === 'block') {
        carrinhoDiv.style.display = 'none';
        overlay.style.display = 'none';
    } else {
        carrinhoDiv.style.display = 'block';
        overlay.style.display = 'block';
    }
}

// Função para finalizar compra
function finalizarCompra() {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
    } else {
        alert(`Compra finalizada! Total: R$ ${total.toFixed(2)}`);
        carrinho = [];
        total = 0;
        salvarCarrinho();
        atualizarCarrinho();
        toggleCarrinho();
    }
}

// Função para alterar quantidade
function alterarQuantidade(event, produto, delta) {
    event.stopPropagation(); // Evitar abrir modal
    const quantidadeSpan = document.getElementById(`qtd-${produto}`);
    let quantidade = parseInt(quantidadeSpan.textContent);
    quantidade += delta;
    if (quantidade < 1) quantidade = 1;
    quantidadeSpan.textContent = quantidade;
}

// Função para abrir modal
function abrirModal(titulo, descricao, imagem, preco) {
    const modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <span class="close" onclick="fecharModal()">&times;</span>
        <img src="${imagem}" alt="${titulo}">
        <h3>${titulo}</h3>
        <p>${descricao}</p>
        <p class="preco">R$ ${preco.toFixed(2)}</p>
        <button onclick="adicionarAoCarrinho('${titulo}', ${preco}); fecharModal();">Adicionar ao Carrinho</button>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Função para fechar modal
function fecharModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.remove();
    }
}

// Função para contagem regressiva (24 horas)
function iniciarContagemRegressiva() {
    const countdownElement = document.getElementById('countdown');
    const endTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 horas a partir de agora

    const timer = setInterval(function() {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
            clearInterval(timer);
            countdownElement.textContent = '00:00:00';
            return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Função para navegação suave (opcional, para links de âncora)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

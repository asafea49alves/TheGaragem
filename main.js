// script.js - Funcionalidades para The Garage
// Inicialização baseada no index.html: associa produtos, botões, ícone do carrinho e cria overlay/carrinho se necessário
(function() {
    // Carrega biblioteca QRCode se não existir
    if (typeof QRCode === 'undefined') {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        s.defer = true;
        document.head.appendChild(s);
    }

    // Cria overlay global se não existir
    if (!document.getElementById('overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.display = 'none';
        overlay.addEventListener('click', () => {
            const carrinhoEl = document.getElementById('carrinho');
            if (carrinhoEl) carrinhoEl.style.display = 'none';
            overlay.style.display = 'none';
        });
        document.body.appendChild(overlay);
    }

    // Cria estrutura mínima do carrinho (caso index.html não tenha)
    if (!document.getElementById('carrinho')) {
        const carrinhoDiv = document.createElement('div');
        carrinhoDiv.id = 'carrinho';
        carrinhoDiv.style.display = 'none';
        carrinhoDiv.innerHTML = `
            <h3>Seu Carrinho (<span id="cart-count">0</span>)</h3>
            <div id="carrinho-itens"></div>
            <div class="carrinho-total">Total: R$ <span id="total">0.00</span></div>
            <button onclick="finalizarCompra()">Finalizar Compra</button>
        `;
        document.body.appendChild(carrinhoDiv);
    }

    // Associar clique no ícone do carrinho (elemento com id 'cart-icon' no index.html)
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCarrinho();
        });
    }

    // Função utilitária para extrair dados de um card de produto
    function extrairDadosProduto(el) {
        const nome = el.dataset.nome || (el.querySelector('.titulo') && el.querySelector('.titulo').textContent) || '';
        const precoAttr = el.dataset.preco || (el.querySelector('.preco') && el.querySelector('.preco').dataset.valor) || (el.querySelector('.preco') && el.querySelector('.preco').textContent) || '0';
        const preco = parseFloat(String(precoAttr).replace(/[^0-9.,-]/g, '').replace(',', '.')) || 0;
        const descricao = el.dataset.descricao || (el.querySelector('.descricao') && el.querySelector('.descricao').textContent) || '';
        const imagem = el.dataset.imagem || (el.querySelector('img') && el.querySelector('img').src) || '';
        return { nome, preco, descricao, imagem };
    }

    // Associa event listeners aos cards de produto (classe .produto no index.html)
    document.querySelectorAll('.produto').forEach(card => {
        const dados = extrairDadosProduto(card);

        // Abrir modal ao clicar no card (mas permitir botões internos funcionarem)
        card.addEventListener('click', (e) => {
            if (e.target.closest('.qtd-btn') || e.target.closest('.add-cart') || e.target.closest('button')) return;
            abrirModal(dados.nome, dados.descricao, dados.imagem, dados.preco);
        });

        // Botões de quantidade (se presentes)
        const minus = card.querySelector('.qtd-minus');
        const plus = card.querySelector('.qtd-plus');
        const qtdSpan = card.querySelector('.qtd') || card.querySelector('.qtd-span');

        if (minus && qtdSpan) {
            minus.addEventListener('click', (e) => alterarQuantidade(e, dados.nome, -1));
        }
        if (plus && qtdSpan) {
            plus.addEventListener('click', (e) => alterarQuantidade(e, dados.nome, +1));
        }

        // Botão "Adicionar ao carrinho" (classe .add-cart)
        const addBtn = card.querySelector('.add-cart');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // garante que exista um elemento de quantidade com id esperado
                const quantidadeId = `qtd-${dados.nome}`;
                let qtdEl = document.getElementById(quantidadeId);
                if (!qtdEl) {
                    // tentativa de mapear a partir do card
                    qtdEl = qtdSpan || document.createElement('span');
                    qtdEl.id = quantidadeId;
                    if (!qtdSpan) qtdEl.textContent = '1';
                }
                adicionarAoCarrinho(dados.nome, dados.preco);
            });
        }
    });

    // Atualiza exibição inicial
    if (typeof atualizarCarrinho === 'function') {
        atualizarCarrinho();
    } else {
        // mínima atualização se função não estiver disponível
        const cartCount = document.getElementById('cart-count');
        if (cartCount) cartCount.textContent = '0';
        const totalSpan = document.getElementById('total');
        if (totalSpan) totalSpan.textContent = '0.00';
    }
})();

// Variáveis globais
let carrinho = [];
let total = 0;

// Carregar carrinho do localStorage ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    carregarCarrinho();
    iniciarContagemRegressiva();
 // Adicionar chamada para atualizar ícone na inicialização
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
 // Atualizar ícone após carregar
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
    window.location.href = "/paginaPay.html";
    atualizarCarrinho(); // Atualizar ícone após adicionar
    alert(`${quantidade} x ${produto} adicionado(s) ao carrinho!`);
}

// Função para remover item do carrinho
function removerDoCarrinho(index) {
    total -= carrinho[index].preco * carrinho[index].quantidade;
    carrinho.splice(index, 1);
    salvarCarrinho();
    atualizarCarrinho(); // Atualizar ícone após remover
}

// Método para atualizar o ícone do carrinho com a quantidade total de itens
function atualizarIconeCarrinho() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const quantidadeTotal = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
        cartCount.textContent = quantidadeTotal;
    }
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
    // Removido: window.location.href = "/paginaPay.html"; // Isso não deveria estar aqui, pois toggleCarrinho() apenas abre/fecha o carrinho
}

// Função para finalizar compra (agora abre modal de pagamento Pix)
function finalizarCompra() {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    abrirModalPix();
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

// Função para abrir modal de produto
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

// Função para abrir modal de pagamento Pix
function abrirModalPix() {
    const modal = document.createElement('div');
    modal.id = 'modal-pix';
    modal.className = 'modal';
    modal.innerHTML = `
        <span class="close" onclick="fecharModalPix()">&times;</span>
        <h3>Pagamento via Pix</h3>
        <p>Total a pagar: R$ ${total.toFixed(2)}</p>
        <p>Chave Pix: asafea49@gmail.com</p>
        <div id="qrcode"></div>
        <p>Escaneie o QR Code com seu app de banco para pagar.</p>
        <button onclick="confirmarPagamento()">Confirmar Pagamento</button>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Gerar QR Code Pix
    gerarQRCodePix();
}

// Função para fechar modal Pix
function fecharModalPix() {
    const modal = document.getElementById('modal-pix');
    if (modal) {
        modal.remove();
    }
}

// Função para gerar QR Code Pix
function gerarQRCodePix() {
    // Dados do Pix (simplificado; em produção, use uma API para gerar corretamente)
    const chavePix = 'asafea49@gmail.com';
    const valor = total.toFixed(2);
    const descricao = 'Compra The Garage';

    const pixString = `00020101021126360014BR.GOV.BCB.PIX0111${chavePix}5204000053039865404${valor}`; 
    const qrcode = new QRCode(document.getElementById('qrcode'), {
        text: pixString,
        width: 256,
        height: 256,
    });
}

// Função para confirmar pagamento (simulação)
function confirmarPagamento() {
    alert('Pagamento confirmado! Obrigado pela compra.');
    carrinho = [];
    total = 0;
    salvarCarrinho();
    atualizarCarrinho(); 
    fecharModalPix();
    toggleCarrinho();
}
function atualizarIconeCarrinho() {
    console.log("Atualizando ícone do carrinho e redirecionando para página de pagamento.");
     window.location.href = "/paginaPay.html";
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

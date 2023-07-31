$(document).ready(function () {
    cardapio.eventos.init();
});

var cardapio = {};

var MEU_CARRINHO = [];

var VALOR_CARRINHO = 0;

var VALOR_ENTREGA = 5;

cardapio.eventos = {
    init: function () {
        cardapio.metodos.obterItensCardapio();
    }
};

cardapio.metodos = {
    // ...

    obterItensCardapio: (categoria = 'burgers', vermais = false) => {
        var filtro = MENU[categoria];
        console.log(filtro);

        if (!vermais) {
            $('#itensCardapio').html('');
            $('#btnVerMais').removeClass('hidden');
        }

        $.each(filtro, function (i, e) {
            let temp = cardapio.templates.item
                .replace(/\${id}/g, e.id)
                .replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','));

            // botão ver mais foi clicado (12 itens)
            if (vermais && i >= 8 && i < 12) {
                $("#itensCardapio").append(temp);
            }

            // paginacao inicial (8 itens)
            if (!vermais && i < 8) {
                $('#itensCardapio').append(temp);
            }
        });

        // Remove o ativo
        $(".container-menu a").removeClass('active');

        // Seta o menu para ativo
        $("#menu-" + categoria).addClass('active');
    },

    // Clique no botão "Ver Mais"
    verMais: function () {
        var ativo = $(".container-menu a.active").attr("id").split("menu-")[1];
        cardapio.metodos.obterItensCardapio(ativo, true);

        $("#btnVerMais").addClass("hidden");
    },

    // Diminuir a quantidade do item no cardapio
    diminuirQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1)
        }

    },

    // Aumentar a quantidade do item no cardapio
    aumentarQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(qntdAtual + 1)
    },

    //Adicionar ao carrinho os itens selecionados
    adicionarAoCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {

            //obter a categoria ativa
            var categoria = $(".container-menu a.active").attr("id").split("menu-")[1];

            //obtem a lista de itens
            let filtro = MENU[categoria];

            //obtem o itemxxx
            let item = $.grep(filtro, (e, i) => { return e.id == id })

            if (item.length > 0) {


                //Validar se ja existe o item no carrinho
                let existe = $.grep(MEU_CARRINHO, (elem, index) => { return elem.id == id });

                if (existe.length > 0) {
                    // Caso já exista, apenas altere a quantidade
                    let objIndex = MEU_CARRINHO.findIndex(obj => obj.id == id);
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;

                } else {
                    // Caso ainda não exista o item no carrinho, adiciona
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0]);
                }

                cardapio.metodos.mensagem('sucesso', 'Produto adicionado com sucesso');
                $("#qntd-" + id).text(0);

                cardapio.metodos.atualizarBadgeTotal();

            }
        }
    },

    carregarValores: () => {

        VALOR_CARRINHO = 0;

        $("#lblSubTotal").text('R$ 0,00');
        $("#lblValorEntrega").text('+ R$ 0,00');
        $("#lblValorTotal").text('R$ 0,00');

        $.each(MEU_CARRINHO, (i, e) => {

            VALOR_CARRINHO += parseFloat(e.price * e.qntd)

            if ((i + 1) == MEU_CARRINHO.length) {

                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`);
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace('.', ',')}`);
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`);
            }

        })
    },

    // Função para mostrar a notificação

    mensagem: (tipo, conteudo) => {
        let mensagemElemento = document.createElement('div');
        mensagemElemento.classList.add('mensagem');

        // Defina as classes de estilo com base no tipo de mensagem
        if (tipo === 'sucesso') {
            mensagemElemento.classList.add('sucesso');
        } else if (tipo === 'erro') {
            mensagemElemento.classList.add('erro');
        } else {
            console.error('Tipo de mensagem inválido.');
            return; // Encerra a execução se o tipo for inválido
        }

        // Defina o conteúdo da mensagem
        mensagemElemento.textContent = conteudo;

        // Adicione a mensagem ao corpo do documento (você pode personalizar onde deseja exibir)
        document.body.appendChild(mensagemElemento);

        // Remova a mensagem após um determinado período (opcional)
        setTimeout(() => {
            mensagemElemento.remove();
        }, 5000); // Remove a mensagem após 5 segundos (ajuste o tempo conforme necessário)
    },

    //atualiza o badge de totais dos botoes "Meu carrinho"
    atualizarBadgeTotal: () => {

        var total = 0;

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd

        })

        if (total > 0) {
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
        }
        else {
            $(".botao-carrinho").addClass('hidden');
            $(".container-total-carrinho").addClass('hidden');
        }

        $(".badge-total-carrinho").html(total);

    },

    abrirFecharCarrinho: (abrir) => {

        if (abrir) {
            $("#modalCarrinho").removeClass("hidden");
            cardapio.metodos.carregarCarrinho();
        }
        else {
            $("#modalCarrinho").addClass("hidden");
        }

    },

    carregarEtapa: (etapa) => {

        if (etapa == 1) {
            $("#lblTituloEtapa").text("Seu carrinho:");
            $("#itensCarrinho").removeClass("hidden");
            $("#localEntrega").addClass("hidden");
            $("#resumoCarrinho").addClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");

            $("#btnEtapaPedido").removeClass("hidden");
            $("#btnEtapaEndereco").addClass("hidden");
            $("#btnEtapaResumo").addClass("hidden");
            $("#btnVoltar").addClass("hidden");
        }
        if (etapa == 2) {
            $("#lblTituloEtapa").text("Endereco de entrega:");
            $("#itensCarrinho").addClass("hidden");
            $("#localEntrega").removeClass("hidden");
            $("#resumoCarrinho").addClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");
            $(".etapa2").addClass("active");


            $("#btnEtapaPedido").addClass("hidden");
            $("#btnEtapaEndereco").removeClass("hidden");
            $("#btnEtapaResumo").addClass("hidden");
            $("#btnVoltar").removeClass("hidden");

        }
        if (etapa == 3) {
            $("#lblTituloEtapa").text("Resumo do pedido:");
            $("#itensCarrinho").addClass("hidden");
            $("#localEntrega").addClass("hidden");
            $("#resumoCarrinho").removeClass("hidden");

            $(".etapa").removeClass("active");
            $(".etapa1").addClass("active");
            $(".etapa2").addClass("active");
            $(".etapa3").addClass("active");


            $("#btnEtapaPedido").addClass("hidden");
            $("#btnEtapaEndereco").addClass("hidden");
            $("#btnEtapaResumo").removeClass("hidden");
            $("#btnVoltar").removeClass("hidden");

        }

    },

    voltarEtapa: () => {

        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapa(etapa - 1);
    },

    //carrega a lista de itens do carrinho
    carregarCarrinho: () => {
        cardapio.metodos.carregarEtapa(1);

        if (MEU_CARRINHO.length > 0) {
            $("#itensCarrinho").html('');

            $.each(MEU_CARRINHO, (i, e) => {
                let temp = cardapio.templates.itemCarrinho
                    .replace(/\${id}/g, e.id)
                    .replace(/\${img}/g, e.img)
                    .replace(/\${name}/g, e.name)
                    .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
                    .replace(/\${qntd}/g, e.qntd);

                $("#itensCarrinho").append(temp);

                if ((i + 1) == MEU_CARRINHO.length) {
                    cardapio.metodos.carregarValores();

                }
            });
        }
        else {
            $("#itensCarrinho").html('<p class="carrinho-vazio"> <i class="fa fa-shopping-bag"><i/> Seu carrinho esta vazio.</p>')
            cardapio.metodos.carregarValores();

        }
    },

    diminuirQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

        if (qntdAtual > 1) {
            $("#qntd-carrinho-" + id).text(qntdAtual - 1)
            cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1)
        }
        else {
            cardapio.metodos.removeItemCarrinho(id)
        }

    },

    aumentarQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        $("#qntd-carrinho-" + id).text(qntdAtual + 1)
        cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1)


    },

    removeItemCarrinho: (id) => {
        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id });
        cardapio.metodos.carregarCarrinho()

        cardapio.metodos.atualizarBadgeTotal()

    },

    atualizarCarrinho: (id, qntd) => {

        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
        MEU_CARRINHO[objIndex].qntd = qntd;

        // atualizar o botao carrinho com a quantidade aatualizada
        cardapio.metodos.atualizarBadgeTotal();
        // atualizar os valores (R$) totais do carrinho

        cardapio.metodos.carregarValores();
    },

    carregarEndereco: () => {
        if (MEU_CARRINHO.length <= 0) {
            cardapio.metodos.mensagem('erro', 'Seu carrinho está vazio!')
            return
        }
        cardapio.metodos.carregarEtapa(2);
    },


    //API ViaCEP

    buscarCep: () => {

    let cep = $("#txtCEP").val().trim().replace(/\D/g, '');

    if (cep === "") {
        cardapio.metodos.mensagem('erro', 'CEP não informado');
        return;
    }

    let validarCEP = /^[0-9]{8}$/;
    if (!validarCEP.test(cep)) {
        cardapio.metodos.mensagem('erro', 'Formato do CEP inválido');
        return;
    }

    $.getJSON(`https://viacep.com.br/ws/${cep}/json/?callback=?`, function (dados) {

            if (!("erro" in dados)) {
                // Atualizar os campos do formulário com os valores retornados
                $("#txtEndereco").val(dados.logradouro);
                $("#txtBairro").val(dados.bairro);
                $("#txtCidade").val(dados.localidade);

                $("#txtNumero").focus();

            } 
            else
             {
                cardapio.metodos.mensagem('erro', 'CEP não encontrado, preencha as informações manualmente');
                $("#txtEndereco").focus();
            }
        })
},
}


cardapio.templates = {

    item: `
    <div class="col-3 mb-3">
        <div class="card card-item" id="\${id}">
            <div class="img-produto">
                <img src="\${img}" />
            </div>
            <p class="title-produto text-center mt-4">
                <b>\${name}</b>
            </p>
            <p class="price-produto text-center">
                <b>R$ \${price}</b>
            </p>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-\${id}"><i></i>0</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
            </div>
        </div>
    </div>`,

    itemCarrinho: `
    <div class="col-12 item-carrinho ">
        <div class="produto-container d-flex">
            <div class="img-produto">
                <img src="\${img}" alt="hamburgue">
        </div>
        <div class="dados-produto ml-2 mt-4">
            <p class="title-produto"><b>\${name}</b></p>
            <p class="price-produto"><b>R$ \${price}</b></p>
        </div>
    </div>
        <div class="add-carrinho">
            <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
            <span class="add-numero-itens" id="qntd-carrinho-\${id}"><i></i>\${qntd}</span>
            <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
            <span class="btn btn-remove" onclick="cardapio.metodos.removeItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
        </div>
    </div>`
}



/* =========================================================
   SABEDORIA POPULAR — O SEGREDO DOS ANTIGOS
   Lógica do jogo: telas, movimento, diálogos, missões e quiz
   ========================================================= */
(function () {
    'use strict';

    /* ---------- Atalhos ---------- */
    const $ = (id) => document.getElementById(id);
    const IMG = 'assets/limpo/';

    const telas = {
        inicial: $('tela-inicial'),
        instrucoes: $('tela-instrucoes'),
        jogo: $('tela-jogo'),
        livro: $('tela-livro'),
        quiz: $('tela-quiz'),
        final: $('tela-final')
    };

    const el = {
        mundo: $('mundo-jogo'),
        cenario: $('cenario-atual'),
        personagens: $('personagens-cenario'),
        jogador: $('jogador'),
        sprite: $('sprite-jogador'),
        dica: $('dica-interacao'),
        tituloFase: $('titulo-fase'),
        pontuacao: $('pontuacao'),
        progressoMissao: $('progresso-missao'),
        tituloMissao: $('titulo-missao'),
        descMissao: $('descricao-missao'),
        estadoMissao: $('estado-missao'),
        contadorPaginas: $('contador-paginas'),
        invPaginas: $('inventario-paginas'),
        msgInv: $('mensagem-inventario'),
        listaPaginas: $('lista-paginas'),
        dialogo: $('caixa-dialogo'),
        retrato: $('retrato-personagem'),
        nome: $('nome-personagem'),
        texto: $('texto-dialogo'),
        opcoes: $('opcoes-dialogo'),
        btnAvancar: $('btn-avancar-dialogo'),
        btnFechar: $('btn-fechar-dialogo'),
        notificacao: $('notificacao-jogo'),
        textoNotificacao: $('texto-notificacao'),
        ajuda: $('dialogo-ajuda')
    };

    /* ---------- Estado ---------- */
    let estado;
    let telaAnterior = 'inicial';

    function novoEstado() {
        return {
            pontos: 0,
            fase: 1,
            paginas: [],
            x: 0.15,
            y: 0.14,
            conversou: {},
            itens: 0,
            plantados: 0,
            cozido: false,
            restos: 0,
            compostados: 0,
            lixos: 0,
            minijogo: null,
            vistos: {},
            dialogoAberto: false,
            quizIndice: 0,
            acertos: 0,
            respondeu: false
        };
    }

    /* ---------- Mensagens de navegação entre telas ---------- */
    function mostrarTela(nome) {
        Object.keys(telas).forEach((k) => {
            const t = telas[k];
            const ativa = k === nome;
            t.hidden = !ativa;
            t.classList.toggle('screen--active', ativa);
        });
    }

    function telaVisivel() {
        return Object.keys(telas).find((k) => !telas[k].hidden);
    }

    /* =========================================================
       DADOS DAS FASES
       ========================================================= */
    const OBJ = 'assets/objetos_jogo/';
    // tipo do item: principal (padrão), resto, lixo, perigo | movel: foge do jogador
    const FASES = {
        1: {
            titulo: 'Vila dos Saberes',
            fundo: 'assets/fundos/vila_principal.png',
            missao: 'As galinhas do Pedrinho fugiram! Pegue as 3 (elas correm de você!) e depois converse com o sábio da vila.',
            npcs: [
                { id: 'crianca', nome: 'Pedrinho', img: 'npc_4.png', x: 0.3, y: 0.2 },
                { id: 'idoso', nome: 'Seu Anselmo (o sábio)', img: 'npc_3.png', x: 0.72, y: 0.3 }
            ],
            itens: [
                { emoji: '🐔', nome: 'galinha', movel: true, x: 0.5, y: 0.34 },
                { emoji: '🐔', nome: 'galinha', movel: true, x: 0.16, y: 0.4 },
                { emoji: '🐔', nome: 'galinha', movel: true, x: 0.86, y: 0.16 }
            ],
            pontos: []
        },
        2: {
            titulo: 'Jardim Comunitário',
            fundo: 'assets/cenarios/jardim.png',
            missao: 'Recolha 3 sementes e plante-as nos canteiros (Espaço). Bônus: leve restos de comida 🍌 à composteira e separe o lixo 🥤!',
            npcs: [{ id: 'agricultor', nome: 'Seu Zé (agricultor)', img: 'npc_1.png', x: 0.8, y: 0.3 }],
            itens: [
                { emoji: '🌱', nome: 'semente', x: 0.12, y: 0.4 },
                { emoji: '🌻', nome: 'semente', x: 0.46, y: 0.45 },
                { emoji: '🌽', nome: 'semente', x: 0.7, y: 0.16 },
                { emoji: '🍌', nome: 'casca de banana', tipo: 'resto', x: 0.3, y: 0.44 },
                { emoji: '🥬', nome: 'folhas murchas', tipo: 'resto', x: 0.6, y: 0.42 },
                { emoji: '🍎', nome: 'miolo de maçã', tipo: 'resto', x: 0.88, y: 0.46 },
                { emoji: '🥤', nome: 'copo plástico', tipo: 'lixo', x: 0.05, y: 0.28 },
                { emoji: '🛍️', nome: 'sacola plástica', tipo: 'lixo', x: 0.62, y: 0.3 }
            ],
            pontos: [
                { id: 'canteiro', nome: 'Canteiro', img: OBJ + 'canteiro.png', larg: 7.5, x: 0.2, y: 0.18 },
                { id: 'canteiro', nome: 'Canteiro', img: OBJ + 'canteiro.png', larg: 7.5, x: 0.36, y: 0.1 },
                { id: 'canteiro', nome: 'Canteiro', img: OBJ + 'canteiro.png', larg: 7.5, x: 0.5, y: 0.22 },
                { id: 'composteira', nome: 'Composteira', img: OBJ + 'composteira.png', larg: 5, x: 0.93, y: 0.1 }
            ]
        },
        3: {
            titulo: 'Cozinha das Tradições',
            fundo: 'assets/cenarios/cozinha.png',
            missao: 'Reúna 3 ingredientes, prepare a receita no fogão a lenha (acerte o ponto mexendo a panela!) e converse com a cozinheira.',
            npcs: [{ id: 'cozinheira', nome: 'Dona Maria (cozinheira)', img: 'npc_2.png', x: 0.76, y: 0.3 }],
            itens: [
                { emoji: '🌽', nome: 'milho', x: 0.1, y: 0.34 },
                { emoji: '🥔', nome: 'mandioca', x: 0.4, y: 0.44 },
                { emoji: '🥬', nome: 'couve', x: 0.62, y: 0.34 }
            ],
            pontos: [
                { id: 'fogao', nome: 'Fogão a lenha', img: OBJ + 'fogao.png', larg: 9.5, x: 0.25, y: 0.38 },
                { id: 'caderno', nome: 'Caderno de receitas', img: OBJ + 'mesa_caderno.png', larg: 8, x: 0.5, y: 0.2 },
                { id: 'vasos', nome: 'Vasos de temperos', img: OBJ + 'vasos.png', larg: 7, x: 0.93, y: 0.46 }
            ]
        },
        4: {
            titulo: 'Trilha da Natureza',
            fundo: 'assets/cenarios/trilha.png',
            missao: 'Registre 3 elementos da natureza, recolha o lixo 🥫 e CUIDADO: não toque em plantas e cogumelos desconhecidos! Depois fale com os guias.',
            npcs: [
                { id: 'pescador', nome: 'Tião (pescador)', img: 'npc_5.png', x: 0.3, y: 0.3 },
                { id: 'artesa', nome: 'Dona Rosa (artesã)', img: 'npc_6.png', x: 0.66, y: 0.22 }
            ],
            itens: [
                { emoji: '🍃', nome: 'folha', x: 0.18, y: 0.44 },
                { emoji: '🦋', nome: 'borboleta', movel: true, x: 0.5, y: 0.44 },
                { emoji: '🪶', nome: 'pena', x: 0.58, y: 0.16 },
                { emoji: '🍄', nome: 'cogumelo desconhecido', tipo: 'perigo', x: 0.4, y: 0.4 },
                { emoji: '🍒', nome: 'frutinha desconhecida', tipo: 'perigo', x: 0.76, y: 0.46 },
                { emoji: '🥫', nome: 'lata', tipo: 'lixo', x: 0.12, y: 0.2 }
            ],
            pontos: [
                { id: 'placa', nome: 'Placa da trilha', img: OBJ + 'placa.png', larg: 3.6, x: 0.08, y: 0.14 },
                { id: 'tronco', nome: 'Tronco caído', img: OBJ + 'tronco.png', larg: 8, x: 0.44, y: 0.14 },
                { id: 'pedras', nome: 'Pedras do riacho', img: OBJ + 'pedras.png', larg: 8.5, x: 0.86, y: 0.3 }
            ]
        }
    };

    const PAGINAS = {
        1: 'Saberes da comunidade',
        2: 'Cuidado com a terra',
        3: 'Tradições à mesa',
        4: 'Segredos da natureza'
    };

    /* ---------- Quiz ---------- */
    const QUIZ = [
        {
            p: 'O que são saberes populares?',
            alt: [
                'Conhecimentos transmitidos pelas experiências e tradições de uma comunidade',
                'Informações encontradas apenas em livros escolares',
                'Conhecimentos exclusivos de laboratórios',
                'Ideias que não mudam de uma geração para outra'
            ],
            c: 0,
            e: 'Os saberes populares nascem da vivência e passam de geração em geração.'
        },
        {
            p: 'Qual prática ajuda a aproveitar restos de frutas, verduras e folhas?',
            alt: [
                'Queimar todos os resíduos',
                'Misturar os resíduos com plástico',
                'Fazer compostagem com materiais orgânicos adequados',
                'Jogar os resíduos em rios'
            ],
            c: 2,
            e: 'A compostagem transforma resíduos orgânicos em adubo e reduz o lixo.'
        },
        {
            p: 'Como podemos preservar receitas e tradições alimentares?',
            alt: [
                'Deixando de ensinar as receitas',
                'Registrando receitas e compartilhando histórias com respeito',
                'Substituindo todos os ingredientes locais',
                'Evitando conversar com pessoas mais velhas'
            ],
            c: 1,
            e: 'Registrar e compartilhar mantém viva a memória cultural.'
        },
        {
            p: 'Qual é uma forma responsável de aprender sobre plantas usadas tradicionalmente?',
            alt: [
                'Experimentar qualquer planta desconhecida',
                'Acreditar que toda planta natural é segura',
                'Usar plantas sem identificar a espécie',
                'Pesquisar fontes confiáveis e consultar profissionais qualificados sobre segurança'
            ],
            c: 3,
            e: 'Nem toda planta é segura: identificar a espécie e consultar quem entende evita riscos.'
        },
        {
            p: 'Como os saberes tradicionais podem se relacionar com a ciência?',
            alt: [
                'Podem dialogar, com respeito, observação e investigação',
                'Devem ser sempre tratados como idênticos às pesquisas científicas',
                'Nunca podem ser estudados pela ciência',
                'Devem substituir todos os conhecimentos científicos'
            ],
            c: 0,
            e: 'Os dois tipos de conhecimento podem se complementar quando há respeito e investigação.'
        }
    ];

    const MENSAGEM_FINAL =
        'O conhecimento de uma comunidade é parte de sua história. Preservar os saberes é valorizar as pessoas, a cultura e as possibilidades de construir um futuro sustentável.';

    /* =========================================================
       DIÁLOGOS
       Cada função devolve { passos, aoTerminar }
       passo = { texto } ou { texto, opcoes: [{ rotulo, correta, retorno }] }
       ========================================================= */
    function dialogoDe(id) {
        const f = estado.fase;
        const feito = estado.paginas.includes(f);

        switch (id) {
            /* ----- Fase 1 ----- */
            case 'crianca':
                if (feito) return { passos: [{ texto: 'Valeu por tudo! As galinhas estão felizes e eu também. 🐔' }] };
                if (estado.itens >= 3) {
                    estado.conversou.crianca = true;
                    return {
                        passos: [
                            { texto: 'Você pegou TODAS as galinhas?! Que velocidade! Obrigado, de coração!' },
                            { texto: 'Sabe, meu avô diz que cuidar dos bichos, da horta e da gente é um jeito de aprender. Ele guarda uma página do Livro dos Saberes!' },
                            { texto: 'Vai falar com ele, o Seu Anselmo. Ele sabe contar histórias como ninguém.' }
                        ],
                        aoTerminar: () => {
                            if (estado.conversou.agradeceu) return;
                            estado.conversou.agradeceu = true;
                            ganharPontos(5);
                            avisar('Pedrinho agradeceu! +5 pontos');
                        }
                    };
                }
                if (!estado.conversou.crianca) {
                    estado.conversou.crianca = true;
                    return {
                        passos: [
                            { texto: 'Oi, forasteiro! Eu sou o Pedrinho. Moro aqui com meu avô, que sabe de tudo: quando vai chover, qual folha serve para o chá, como fazer pão de milho…' },
                            { texto: 'Mas hoje estou em apuros: as 3 galinhas fugiram do terreiro! Elas são ariscas e correm de quem chega perto.' },
                            { texto: 'Dica de quem cria galinha: contorne e encurrale na beirada do cenário. Me ajuda a pegar elas?' }
                        ]
                    };
                }
                return { passos: [{ texto: 'Ainda faltam galinhas (' + estado.itens + ' de 3)! Elas fogem, então tente encurralar nas beiradas. 🐔' }] };

            case 'idoso':
                if (feito) return { passos: [{ texto: 'Siga em frente! Os outros saberes estão espalhados pela comunidade, no jardim, na cozinha e na trilha.' }] };
                if (!estado.conversou.crianca || estado.itens < 3) {
                    return { passos: [{ texto: 'Ah, um visitante! Antes de conversarmos, ajude o Pedrinho com as galinhas. Ele ficou todo preocupado!' }] };
                }
                return {
                    passos: [
                        { texto: 'Então foi você que ajudou meu neto! Muito bem. Aqui na vila a gente aprende fazendo, ouvindo e observando os mais velhos.' },
                        { texto: 'Aprendi com minha avó a olhar o céu, a sentir o cheiro da terra e a respeitar o tempo de cada planta. Esses saberes passam de geração em geração.' },
                        { texto: 'Mas nem tudo que se conta é certo. Por isso a gente observa, conversa e confere, e a ciência também ajuda a entender por que algumas tradições funcionam.' },
                        { texto: 'Aqui está a primeira página do Livro dos Saberes. Guarde bem e leve para o jardim, onde o Seu Zé espera por você!' }
                    ],
                    aoTerminar: () => ganharPagina(1)
                };

            /* ----- Fase 2 ----- */
            case 'agricultor':
                if (feito) return { passos: [{ texto: 'O jardim está lindo, graças a você! Cuide bem da terra e ela cuida de você.' }] };
                if (estado.itens < 3) {
                    return { passos: [{ texto: 'Bem-vindo ao jardim! Espalhei umas sementes por aí e elas sumiram. Procure por elas (' + estado.itens + ' de 3) e chegue perto para recolher.' }] };
                }
                if (estado.plantados < 3) {
                    return { passos: [{ texto: 'Ótimo, você tem as sementes! Agora plante nos canteiros (' + estado.plantados + ' de 3). Fique perto de um canteiro e aperte Espaço.' }] };
                }
                return {
                    passos: [
                        { texto: 'Olha só que lindeza, tudo plantado! Você tem mão boa para a terra.' },
                        { texto: estado.compostados > 0
                            ? 'E você ainda levou restos para a composteira! É assim que a gente faz: casca, folha e borra de café viram adubo e voltam para a terra.'
                            : 'Uma dica de ouro: casca de fruta, folhas e restos de verdura NÃO vão para o lixo. Na composteira, viram adubo e voltam para a terra!' },
                        { texto: 'Na composteira não entram carne, óleo nem plástico. O que é lixo de verdade, a gente separa para a coleta seletiva.' },
                        { texto: 'Meu pai me ensinou assim e eu ensino você. Leve esta página do Livro dos Saberes! Agora a cozinha da Dona Maria precisa de ajuda.' }
                    ],
                    aoTerminar: () => ganharPagina(2)
                };

            /* ----- Fase 3 ----- */
            case 'cozinheira':
                if (feito) return { passos: [{ texto: 'Que cheirinho bom! Obrigada pela ajuda, e nada foi desperdiçado. 😋' }] };
                if (estado.itens < 3) {
                    return { passos: [{ texto: 'Estou preparando a receita da minha avó e preciso de milho, mandioca e couve. Faltam ingredientes (' + estado.itens + ' de 3). Chegue perto para pegar.' }] };
                }
                if (!estado.cozido) {
                    return { passos: [{ texto: 'Já temos tudo! Agora leve ao fogão a lenha e capriche no ponto (Espaço perto do fogão). Mexer na hora certa faz toda a diferença!' }] };
                }
                return {
                    passos: [
                        { texto: 'Hmm, que cheiro! Ficou no ponto, igualzinho ao da minha avó.' },
                        { texto: 'Aqui nada se perde: os talos da couve viram refogado, as cascas limpas viram farofa, e o que sobra vai para a composteira.' },
                        { texto: 'Cada receita é uma memória. Ingredientes da nossa terra, histórias da família… por isso eu anoto tudo no caderno e conto para quem quiser aprender.' },
                        { texto: 'Aqui está a página do Livro dos Saberes! Agora vá até a trilha: o Tião e a Dona Rosa conhecem os segredos da natureza.' }
                    ],
                    aoTerminar: () => ganharPagina(3)
                };

            /* ----- Fase 4 ----- */
            case 'pescador':
                estado.conversou.pescador = true;
                return {
                    passos: [
                        { texto: 'Pesco aqui desde menino. Meu pai me ensinou a só tirar o que a gente precisa e a respeitar o período de descanso dos peixes, a piracema.' },
                        { texto: 'Rio limpo, mata em volta e peixe no tempo certo: é tudo ligado. Cuidar de um é cuidar de todos.' },
                        { texto: 'Vai lá falar com a Dona Rosa. Ela conhece as plantas da trilha e tem uma última página para você.' }
                    ]
                };

            case 'artesa':
                if (feito) return { passos: [{ texto: 'Siga cuidando da natureza e dividindo o que aprendeu!' }] };
                if (estado.itens < 3) {
                    return { passos: [{ texto: 'Registre os elementos da trilha no caderno (' + estado.itens + ' de 3). Só observe: a natureza é de todos! E não toque no que você não conhece.' }] };
                }
                if (!estado.conversou.pescador) {
                    return { passos: [{ texto: 'Muito bem! Antes de continuar, converse com o Tião, ele tem algo a ensinar sobre o rio.' }] };
                }
                return {
                    passos: [
                        { texto: 'Você registrou tudo direitinho. Uso fibras e folhas nos meus artesanatos e conheço plantas de chás tradicionais.' },
                        { texto: 'Mas aprendi uma regra de ouro: natural não quer dizer seguro. Tem planta, fruta e cogumelo que parecem inofensivos e são venenosos.' },
                        { texto: 'Por isso, antes de usar qualquer planta, identifique a espécie, pesquise em fontes confiáveis e consulte quem entende, como um profissional de saúde ou um botânico.' },
                        { texto: 'O saber tradicional e a ciência podem caminhar juntos, com respeito e investigação. Esta é a última página do Livro dos Saberes. Agora vem o desafio final!' }
                    ],
                    aoTerminar: () => ganharPagina(4)
                };
        }
        return { passos: [{ texto: '...' }] };
    }

    /* ---------- Objetos interativos (pontos de interesse) ---------- */
    const INFO_PONTOS = {
        composteira: 'Esta composteira transforma cascas, folhas e restos de verduras em adubo. Restos de carne, óleo e plástico não entram nela!',
        caderno: 'No caderno de receitas cada página guarda a memória de uma família. Registrar e compartilhar as receitas ajuda a manter a tradição viva.',
        vasos: 'Salsinha, hortelã e manjericão crescem bem em vasos. Cultivar temperos em casa evita desperdício, mas é preciso identificar bem cada planta.',
        placa: 'Trilha da Natureza: observe sem arrancar, não deixe lixo e siga sempre pelo caminho marcado.',
        tronco: 'Troncos caídos abrigam musgos, fungos e insetos: são casas da biodiversidade. Cogumelos silvestres nunca devem ser colhidos nem comidos sem identificação de um especialista, pois alguns são venenosos.',
        pedras: 'Riachos precisam da mata ao redor. Preservar a vegetação das margens mantém a água limpa para pessoas e animais.'
    };

    function chavePonto(d) {
        return estado.fase + ':' + d.id + ':' + d.x;
    }

    function pontoDialogo(d, elemento) {
        const chave = chavePonto(d);

        if (d.id === 'canteiro') {
            if (estado.vistos[chave]) {
                return { passos: [{ texto: 'A muda deste canteiro já está crescendo. Cuide dela com água e paciência!' }] };
            }
            if (estado.itens - estado.plantados <= 0) {
                return { passos: [{ texto: 'Você ainda não tem sementes para plantar. Procure-as pelo jardim e chegue perto delas.' }] };
            }
            return {
                passos: [{ texto: 'Você afofa a terra e planta a semente com cuidado, do jeito que os mais velhos ensinam.' }],
                aoTerminar: () => plantar(d, elemento)
            };
        }

        if (d.id === 'fogao') {
            if (estado.cozido) {
                return { passos: [{ texto: 'A receita já está pronta e o cheirinho toma conta da cozinha. Que tal conversar com Dona Maria?' }] };
            }
            if (estado.itens < 3) {
                return { passos: [{ texto: 'O fogão está aceso, mas ainda faltam ingredientes (' + estado.itens + ' de 3). Procure milho, mandioca e couve.' }] };
            }
            return {
                passos: [
                    { texto: 'Você coloca o milho, a mandioca e a couve na panela de ferro e aviva o fogo da lenha.' },
                    { texto: 'Agora o segredo é o ponto: mexa a panela na hora certa para não queimar nem deixar crua!' }
                ],
                aoTerminar: () => iniciarMinijogo(d, elemento)
            };
        }

        if (d.id === 'composteira' && estado.restos > 0) {
            const n = estado.restos;
            return {
                passos: [{ texto: 'Você joga ' + n + (n > 1 ? ' restos' : ' resto') + ' de comida na composteira, mistura com folhas secas e tampa. Em poucos meses, vira adubo!' }],
                aoTerminar: () => {
                    estado.compostados += n;
                    estado.restos = 0;
                    ganharPontos(5 * n);
                    avisar('Compostagem feita! +' + 5 * n + ' pontos');
                    estado.vistos[chavePonto(d)] = true;
                    if (elemento) elemento.classList.add('is-visto');
                }
            };
        }

        const info = INFO_PONTOS[d.id] || '...';
        const primeira = !estado.vistos[chave];
        return {
            passos: [{ texto: info + (primeira ? ' (+3 pontos por observar com atenção)' : '') }],
            aoTerminar: () => {
                if (estado.vistos[chave]) return;
                estado.vistos[chave] = true;
                if (elemento) elemento.classList.add('is-visto');
                ganharPontos(3);
            }
        };
    }

    function plantar(d, elemento) {
        const chave = chavePonto(d);
        estado.vistos[chave] = true;
        estado.plantados += 1;
        ganharPontos(5);
        if (elemento) {
            elemento.classList.add('is-visto');
            const planta = document.createElement('span');
            planta.className = 'ponto__extra ponto__extra--planta';
            planta.textContent = '🌱';
            elemento.appendChild(planta);
            setTimeout(() => { planta.textContent = '🌿'; }, 2500);
            setTimeout(() => { planta.textContent = '🌼'; }, 6000);
        }
        avisar('Semente plantada (' + estado.plantados + '/3) +5 pontos');
        if (estado.plantados === 3) el.estadoMissao.textContent = 'Tudo plantado! Fale com o agricultor';
    }

    function cozinhar(d, elemento, acertos) {
        estado.vistos[chavePonto(d)] = true;
        estado.cozido = true;
        const pts = 5 + acertos * 3;
        ganharPontos(pts);
        if (elemento) {
            elemento.classList.add('is-visto');
            const vapor = document.createElement('span');
            vapor.className = 'ponto__extra ponto__extra--vapor';
            vapor.textContent = '💨';
            elemento.appendChild(vapor);
        }
        avisar((acertos === 3 ? 'Ponto perfeito! ' : 'Receita pronta! ') + '+' + pts + ' pontos');
        som.pagina();
        el.estadoMissao.textContent = 'Receita pronta! Fale com a cozinheira';
    }

    /* =========================================================
       PLACAR / INTERFACE
       ========================================================= */
    function atualizarPlacar() {
        el.pontuacao.textContent = estado.pontos;
        el.progressoMissao.textContent = Math.min(estado.fase, 4) + ' de 4';
        const n = estado.paginas.length;
        el.contadorPaginas.textContent = n + '/4';
        el.invPaginas.textContent = n + '/4 páginas';
        el.msgInv.textContent = n === 0
            ? 'As páginas que você encontrar aparecerão aqui.'
            : n === 4 ? 'Livro completo! O quiz final foi liberado.' : 'Continue explorando para achar as outras páginas.';

        document.querySelectorAll('[data-page]').forEach((li) => {
            const num = Number(li.dataset.page);
            const ok = estado.paginas.includes(num);
            li.classList.toggle('is-collected', ok);
            const span = li.querySelector('span');
            if (span) span.textContent = ok ? (li.matches('.book-page') ? 'Página encontrada' : 'Coletada') : (li.matches('.book-page') ? 'Ainda não encontrada' : 'Não encontrada');
        });
    }

    function ganharPontos(qtd) {
        const antes = estado.pontos;
        estado.pontos = Math.max(0, estado.pontos + qtd);
        atualizarPlacar();
        popup(estado.pontos - antes);
    }

    function popup(valor) {
        if (!valor || telas.jogo.hidden) return;
        const p = document.createElement('span');
        p.className = 'popup-pontos' + (valor < 0 ? ' popup-pontos--ruim' : '');
        p.textContent = (valor > 0 ? '+' : '') + valor;
        p.style.left = estado.x * 100 + '%';
        p.style.bottom = 'calc(' + estado.y * 100 + '% + 80px)';
        el.personagens.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    }

    /* ---------- Sons simples (WebAudio, sem arquivos) ---------- */
    let audioCtx = null;
    let somLigado = true;
    function bip(freq, dur, tipo, vol, atraso) {
        if (!somLigado) return;
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const t0 = audioCtx.currentTime + (atraso || 0);
            const osc = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            osc.type = tipo || 'square';
            osc.frequency.setValueAtTime(freq, t0);
            g.gain.setValueAtTime(vol || 0.04, t0);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            osc.connect(g);
            g.connect(audioCtx.destination);
            osc.start(t0);
            osc.stop(t0 + dur + 0.02);
        } catch (e) { /* sem áudio, segue o jogo */ }
    }
    const som = {
        coleta() { bip(660, 0.08); bip(990, 0.1, 'square', 0.04, 0.07); },
        ponto() { bip(520, 0.07, 'triangle', 0.06); },
        erro() { bip(180, 0.25, 'sawtooth', 0.05); },
        pagina() { [523, 659, 784, 1046].forEach((f, i) => bip(f, 0.14, 'square', 0.04, i * 0.1)); },
        vitoria() { [523, 659, 784, 659, 784, 1046].forEach((f, i) => bip(f, 0.16, 'square', 0.04, i * 0.12)); }
    };

    let timerNotificacao;
    function avisar(msg) {
        el.textoNotificacao.textContent = msg;
        el.notificacao.hidden = false;
        clearTimeout(timerNotificacao);
        timerNotificacao = setTimeout(() => { el.notificacao.hidden = true; }, 3200);
    }

    function dica(msg) {
        if (el.dica.textContent !== msg) el.dica.textContent = msg;
    }

    /* =========================================================
       FASES / CENÁRIO
       ========================================================= */
    let npcsAtivos = [];
    let itensAtivos = [];

    function carregarFase(n) {
        estado.fase = n;
        estado.itens = 0;
        estado.plantados = 0;
        estado.cozido = false;
        estado.restos = 0;
        estado.lixos = 0;
        const fase = FASES[n];

        el.tituloFase.textContent = fase.titulo;
        el.cenario.style.backgroundImage = 'url("' + fase.fundo + '")';
        el.cenario.classList.toggle('cenario-nitido', n > 1);
        el.cenario.setAttribute('aria-label', 'Cenário: ' + fase.titulo);
        el.tituloMissao.textContent = 'Missão ' + n + ': ' + fase.titulo;
        el.descMissao.textContent = fase.missao;
        el.estadoMissao.textContent = 'Missão em andamento';

        // limpar elementos da fase anterior
        npcsAtivos.forEach((o) => o.el.remove());
        itensAtivos.forEach((o) => o.el.remove());
        npcsAtivos = [];
        itensAtivos = [];

        fase.npcs.forEach((d) => {
            const e = document.createElement('div');
            e.className = 'npc';
            e.setAttribute('role', 'button');
            e.setAttribute('aria-label', 'Conversar com ' + d.nome);
            e.style.left = d.x * 100 + '%';
            e.style.bottom = d.y * 100 + '%';
            e.style.zIndex = 100 - Math.round(d.y * 100);
            const img = document.createElement('img');
            img.src = IMG + d.img;
            img.alt = d.nome;
            img.draggable = false;
            e.appendChild(img);
            e.addEventListener('click', () => {
                if (estado.dialogoAberto) return;
                // andar até o morador e falar
                if (distancia(d) <= RAIO_INTERACAO * 1.6) iniciarConversa({ dados: d, el: e, tipo: 'npc' });
                else dica('Aproxime-se de ' + d.nome + ' para conversar.');
            });
            el.personagens.appendChild(e);
            npcsAtivos.push({ dados: d, el: e, tipo: 'npc' });
        });

        fase.pontos.forEach((d) => {
            const e = document.createElement('div');
            e.className = 'ponto';
            e.setAttribute('role', 'button');
            e.setAttribute('aria-label', 'Examinar: ' + d.nome);
            e.style.left = d.x * 100 + '%';
            e.style.bottom = d.y * 100 + '%';
            e.style.width = d.larg + '%';
            e.style.zIndex = 100 - Math.round(d.y * 100);
            const img = document.createElement('img');
            img.src = d.img;
            img.alt = d.nome;
            img.draggable = false;
            e.appendChild(img);
            const alvo = { dados: d, el: e, tipo: 'ponto' };
            e.addEventListener('click', () => {
                if (estado.dialogoAberto) return;
                if (distancia(d) <= RAIO_INTERACAO * 1.8) iniciarConversa(alvo);
                else dica('Aproxime-se para examinar: ' + d.nome + '.');
            });
            el.personagens.appendChild(e);
            npcsAtivos.push(alvo);
        });

        fase.itens.forEach((d) => {
            const e = document.createElement('div');
            e.className = 'item';
            e.setAttribute('aria-hidden', 'true');
            e.textContent = d.emoji;
            e.style.left = d.x * 100 + '%';
            e.style.bottom = d.y * 100 + '%';
            e.style.zIndex = 100 - Math.round(d.y * 100);
            el.personagens.appendChild(e);
            itensAtivos.push({ dados: d, el: e, pego: false, pos: { x: d.x, y: d.y }, vx: 0, vy: 0, tempo: 0, lado: Math.random() < 0.5 ? 1 : -1 });
        });

        estado.x = 0.12;
        estado.y = 0.14;
        posicionarJogador();
        atualizarPlacar();
        dica(n === 1 ? 'Use as setas para andar e aproxime-se de um morador.' : 'Explore o cenário: ' + fase.missao);
    }

    /* ---------- Movimento ---------- */
    const teclas = {};
    const LIMITE = { xMin: 0.04, xMax: 0.96, yMin: 0.05, yMax: 0.5 };
    const VELOCIDADE = 0.28; // fração da largura por segundo
    let direcao = 1;
    let ultimoQuadro = 0;
    let tempoAndando = 0;
    const RAIO_INTERACAO = 90; // px

    function mundoDim() {
        return { w: el.mundo.clientWidth, h: el.mundo.clientHeight };
    }

    function posicionarJogador() {
        const { w, h } = mundoDim();
        const lw = el.jogador.offsetWidth;
        el.jogador.style.left = estado.x * w - lw / 2 + 'px';
        el.jogador.style.bottom = estado.y * h + 'px';
        el.jogador.style.zIndex = 100 - Math.round(estado.y * 100);
    }

    function distancia(d) {
        const { w, h } = mundoDim();
        const dx = (d.x - estado.x) * w;
        const dy = (d.y - estado.y) * h;
        return Math.hypot(dx, dy);
    }

    function laco(t) {
        const dt = Math.min((t - ultimoQuadro) / 1000 || 0, 0.05);
        ultimoQuadro = t;

        if (!telas.jogo.hidden) {
            let mx = 0;
            let my = 0;
            if (!estado.dialogoAberto) {
                if (teclas.ArrowRight) mx += 1;
                if (teclas.ArrowLeft) mx -= 1;
                if (teclas.ArrowUp) my += 1;
                if (teclas.ArrowDown) my -= 1;
            }
            const { w, h } = mundoDim();
            if (mx || my) {
                const norm = Math.hypot(mx, my);
                estado.x += (mx / norm) * VELOCIDADE * dt;
                // velocidade vertical proporcional em pixels
                estado.y += ((my / norm) * VELOCIDADE * dt * w) / h;
                estado.x = Math.min(LIMITE.xMax, Math.max(LIMITE.xMin, estado.x));
                estado.y = Math.min(LIMITE.yMax, Math.max(LIMITE.yMin, estado.y));
                if (mx) direcao = mx > 0 ? 1 : -1;
                tempoAndando += dt;
            } else {
                tempoAndando = 0;
            }
            const balanco = tempoAndando ? Math.abs(Math.sin(tempoAndando * 14)) * -6 : 0;
            el.sprite.style.transform = 'translateY(' + balanco + 'px) scaleX(' + direcao + ')';
            posicionarJogador();
            if (estado.minijogo) atualizarMinijogo(dt);
            else if (!estado.dialogoAberto) moverItens(dt);
            verificarProximidade();
        }
        requestAnimationFrame(laco);
    }

    function verificarProximidade() {
        if (estado.dialogoAberto) return;

        // itens
        itensAtivos.forEach((it) => {
            if (it.pego) return;
            if (distancia(it.pos) < 55) coletarItem(it);
        });

        // moradores
        const perto = npcProximo();
        if (perto) {
            dica(perto.tipo === 'ponto'
                ? 'Pressione Espaço (ou toque em Falar) para examinar: ' + perto.dados.nome + '.'
                : 'Pressione Espaço (ou toque em Falar) para conversar com ' + perto.dados.nome + '.');
        }
        else if (el.dica.textContent.indexOf('Pressione') === 0) dica('Explore o cenário e aproxime-se de um morador.');
    }

    function npcProximo() {
        let melhor = null;
        let menor = RAIO_INTERACAO + 20;
        npcsAtivos.forEach((n) => {
            const d = distancia(n.dados);
            if (d < menor) { menor = d; melhor = n; }
        });
        return melhor;
    }

    function coletarItem(it) {
        const tipo = it.dados.tipo || 'principal';
        it.pego = true;
        it.el.classList.add('is-collected');
        setTimeout(() => it.el.remove(), 350);

        if (tipo === 'perigo') {
            ganharPontos(-3);
            som.erro();
            avisar('⚠️ Cuidado! Não toque nem coma ' + it.dados.nome + '. Natural não quer dizer seguro! -3 pontos');
            return;
        }
        if (tipo === 'lixo') {
            estado.lixos += 1;
            ganharPontos(3);
            som.ponto();
            avisar('♻️ ' + it.dados.nome + ' separado para a coleta seletiva. +3 pontos');
            return;
        }
        if (tipo === 'resto') {
            estado.restos += 1;
            ganharPontos(2);
            som.ponto();
            avisar('🌿 ' + it.dados.nome + ' guardado para a composteira (' + estado.restos + '). Leve até ela!');
            return;
        }

        estado.itens += 1;
        ganharPontos(5);
        som.coleta();
        const verbos = { 1: 'Você pegou', 2: 'Você encontrou', 3: 'Você pegou', 4: 'Você registrou' };
        avisar(verbos[estado.fase] + ': ' + it.dados.nome + ' (' + estado.itens + '/3) +5 pontos');
        if (estado.itens === 3) {
            const proximo = {
                1: 'Todas as galinhas! Volte a falar com o Pedrinho',
                2: 'Agora plante as sementes nos canteiros',
                3: 'Prepare a receita no fogão a lenha',
                4: 'Agora fale com os guias da trilha'
            };
            el.estadoMissao.textContent = proximo[estado.fase] || 'Agora fale com o morador da cena';
        }
    }

    /* ---------- Itens que fogem (galinhas, borboleta) ---------- */
    function moverItens(dt) {
        const { w, h } = mundoDim();
        itensAtivos.forEach((it) => {
            if (it.pego || !it.dados.movel) return;
            const dxp = (it.pos.x - estado.x) * w;
            const dyp = (it.pos.y - estado.y) * h;
            const dist = Math.hypot(dxp, dyp) || 1;
            let vx;
            let vy;
            if (dist < 170) {
                // foge do jogador, deslizando pelas paredes
                const lado = it.lado;
                vx = (dxp / dist) * 0.2 + (-dyp / dist) * 0.12 * lado;
                vy = ((dyp / dist) * 0.2 + (dxp / dist) * 0.12 * lado) * (w / h);
            } else {
                it.tempo -= dt;
                if (it.tempo <= 0) {
                    const ang = Math.random() * Math.PI * 2;
                    const v = Math.random() < 0.4 ? 0 : 0.05;
                    it.vx = Math.cos(ang) * v;
                    it.vy = Math.sin(ang) * v * (w / h);
                    it.tempo = 1 + Math.random() * 1.6;
                }
                vx = it.vx;
                vy = it.vy;
            }
            it.pos.x = Math.min(LIMITE.xMax, Math.max(LIMITE.xMin, it.pos.x + vx * dt));
            it.pos.y = Math.min(LIMITE.yMax, Math.max(LIMITE.yMin, it.pos.y + vy * dt));
            if (dist < 170 && (it.pos.x <= LIMITE.xMin || it.pos.x >= LIMITE.xMax || it.pos.y <= LIMITE.yMin || it.pos.y >= LIMITE.yMax)) {
                if (Math.random() < 0.05) it.lado *= -1;
            }
            it.el.style.left = it.pos.x * 100 + '%';
            it.el.style.bottom = it.pos.y * 100 + '%';
            it.el.style.zIndex = 100 - Math.round(it.pos.y * 100);
        });
    }

    /* ---------- Minijogo: mexer a panela ---------- */
    function iniciarMinijogo(d, elemento) {
        const painel = document.createElement('div');
        painel.className = 'minijogo';
        painel.innerHTML =
            '<h3>Mexa a panela! 🥄</h3>' +
            '<p class="minijogo__texto">Aperte Espaço (ou o botão) quando o marcador estiver na zona verde. 3 tentativas!</p>' +
            '<div class="minijogo__barra"><div class="minijogo__zona"></div><div class="minijogo__marcador"></div></div>' +
            '<p class="minijogo__status" aria-live="polite">Acertos: 0 de 3</p>' +
            '<button type="button" class="button button--primary minijogo__botao">Mexer!</button>';
        el.mundo.appendChild(painel);

        estado.dialogoAberto = true;
        estado.minijogo = {
            d, elemento, painel,
            marcador: painel.querySelector('.minijogo__marcador'),
            zona: painel.querySelector('.minijogo__zona'),
            status: painel.querySelector('.minijogo__status'),
            pos: 0, dir: 1, tentativas: 0, acertos: 0, zonaIni: 0.4, larg: 0.24
        };
        sortearZona();
        painel.querySelector('.minijogo__botao').addEventListener('click', mexerPanela);
    }

    function sortearZona() {
        const m = estado.minijogo;
        m.zonaIni = 0.1 + Math.random() * 0.6;
        m.zona.style.left = m.zonaIni * 100 + '%';
        m.zona.style.width = m.larg * 100 + '%';
    }

    function atualizarMinijogo(dt) {
        const m = estado.minijogo;
        m.pos += m.dir * dt * (0.9 + m.tentativas * 0.25);
        if (m.pos >= 1) { m.pos = 1; m.dir = -1; }
        if (m.pos <= 0) { m.pos = 0; m.dir = 1; }
        m.marcador.style.left = m.pos * 100 + '%';
    }

    function mexerPanela() {
        const m = estado.minijogo;
        if (!m) return;
        m.tentativas += 1;
        const acertou = m.pos >= m.zonaIni && m.pos <= m.zonaIni + m.larg;
        if (acertou) { m.acertos += 1; som.coleta(); } else { som.erro(); }
        m.status.textContent = (acertou ? 'Boa! ' : 'Quase! ') + 'Acertos: ' + m.acertos + ' de 3';
        if (m.tentativas >= 3) {
            const { d, elemento, painel, acertos } = m;
            estado.minijogo = null;
            setTimeout(() => {
                painel.remove();
                estado.dialogoAberto = false;
                cozinhar(d, elemento, acertos);
            }, 700);
        } else {
            sortearZona();
        }
    }

    /* =========================================================
       DIÁLOGO
       ========================================================= */
    let conversa = null; // { passos, indice, aoTerminar, tentativas }

    function iniciarConversa(npc) {
        const d = npc.dados;
        const dados = npc.tipo === 'ponto' ? pontoDialogo(d, npc.el) : dialogoDe(d.id);
        conversa = { passos: dados.passos, indice: 0, aoTerminar: dados.aoTerminar, tentativas: 0, npc: d };
        estado.dialogoAberto = true;
        el.nome.textContent = d.nome;
        el.retrato.style.backgroundImage = 'url("' + (d.img.indexOf('/') >= 0 ? d.img : IMG + d.img) + '")';
        el.dialogo.hidden = false;
        mostrarPasso();
    }

    function mostrarPasso() {
        const passo = conversa.passos[conversa.indice];
        el.texto.textContent = passo.texto;
        el.opcoes.innerHTML = '';
        conversa.tentativas = 0;

        if (passo.opcoes) {
            el.btnAvancar.hidden = true;
            passo.opcoes.forEach((op) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.textContent = op.rotulo;
                b.addEventListener('click', () => escolher(b, op));
                el.opcoes.appendChild(b);
            });
            const primeira = el.opcoes.querySelector('button');
            if (primeira) primeira.focus({ preventScroll: true });
        } else {
            el.btnAvancar.hidden = false;
            const ultimo = conversa.indice === conversa.passos.length - 1;
            el.btnAvancar.textContent = ultimo ? 'Concluir' : 'Continuar';
        }
    }

    function escolher(botao, op) {
        el.texto.textContent = op.retorno;
        if (op.correta) {
            ganharPontos(conversa.tentativas === 0 ? 10 : 5);
            avisar('Resposta certa! +' + (conversa.tentativas === 0 ? 10 : 5) + ' pontos');
            el.opcoes.innerHTML = '';
            el.btnAvancar.hidden = false;
            el.btnAvancar.textContent = 'Continuar';
            conversa.indice += 1;
            // se o próximo passo não existir, terminar já
            if (conversa.indice >= conversa.passos.length) {
                conversa.indice = conversa.passos.length - 1;
            }
            conversa.depoisDaEscolha = true;
            el.btnAvancar.focus({ preventScroll: true });
        } else {
            conversa.tentativas += 1;
            botao.disabled = true;
            botao.classList.add('is-wrong');
        }
    }

    function avancarDialogo() {
        if (!conversa) return;
        // após uma escolha correta, o índice já aponta para o passo seguinte
        if (conversa.depoisDaEscolha) {
            conversa.depoisDaEscolha = false;
            mostrarPasso();
            return;
        }
        if (conversa.indice < conversa.passos.length - 1) {
            conversa.indice += 1;
            mostrarPasso();
        } else {
            fecharDialogo(true);
        }
    }

    function fecharDialogo(concluido) {
        if (!conversa) return;
        const cb = concluido ? conversa.aoTerminar : null;
        conversa = null;
        estado.dialogoAberto = false;
        el.dialogo.hidden = true;
        el.mundo.focus({ preventScroll: true });
        if (cb) cb();
    }

    /* =========================================================
       PÁGINAS / PROGRESSÃO
       ========================================================= */
    function ganharPagina(n) {
        if (estado.paginas.includes(n)) return;
        estado.paginas.push(n);
        ganharPontos(10);
        el.estadoMissao.textContent = 'Missão concluída!';
        avisar('Nova página: "' + PAGINAS[n] + '" +10 pontos');
        som.pagina();
        atualizarPlacar();

        setTimeout(() => {
            if (n < 4) {
                carregarFase(n + 1);
                avisar('Novo local: ' + FASES[n + 1].titulo);
            } else {
                avisar('Livro dos Saberes completo! O quiz final começou.');
                setTimeout(iniciarQuiz, 1400);
            }
        }, 1800);
    }

    /* =========================================================
       QUIZ
       ========================================================= */
    const quiz = {
        num: $('numero-pergunta'),
        acertos: $('pontuacao-quiz'),
        pergunta: $('pergunta-quiz'),
        alts: $('alternativas-quiz'),
        feedback: $('feedback-quiz'),
        confirmar: $('btn-responder-quiz'),
        proxima: $('btn-proxima-pergunta'),
        form: $('formulario-quiz')
    };

    function iniciarQuiz() {
        estado.quizIndice = 0;
        estado.acertos = 0;
        mostrarTela('quiz');
        mostrarPergunta();
    }

    function mostrarPergunta() {
        const q = QUIZ[estado.quizIndice];
        estado.respondeu = false;
        quiz.num.textContent = 'Pergunta ' + (estado.quizIndice + 1) + ' de ' + QUIZ.length;
        quiz.acertos.textContent = 'Acertos: ' + estado.acertos;
        quiz.pergunta.textContent = q.p;
        quiz.feedback.hidden = true;
        quiz.proxima.hidden = true;
        quiz.confirmar.hidden = false;
        quiz.alts.innerHTML = '';
        const letras = ['A', 'B', 'C', 'D'];
        q.alt.forEach((texto, i) => {
            const label = document.createElement('label');
            label.className = 'quiz-option';
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'alternativa';
            input.value = i;
            label.appendChild(input);
            label.appendChild(document.createTextNode(' ' + letras[i] + '. ' + texto));
            quiz.alts.appendChild(label);
        });
    }

    quiz.form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        if (estado.respondeu) return;
        const marcada = quiz.form.querySelector('input[name="alternativa"]:checked');
        if (!marcada) {
            quiz.feedback.hidden = false;
            quiz.feedback.textContent = 'Escolha uma alternativa antes de confirmar.';
            return;
        }
        estado.respondeu = true;
        const q = QUIZ[estado.quizIndice];
        const escolha = Number(marcada.value);
        const labels = quiz.alts.querySelectorAll('.quiz-option');
        labels[q.c].classList.add('is-correct');
        quiz.form.querySelectorAll('input').forEach((i) => { i.disabled = true; });

        if (escolha === q.c) {
            estado.acertos += 1;
            ganharPontos(10);
            quiz.feedback.textContent = 'Correto! +10 pontos. ' + q.e;
        } else {
            labels[escolha].classList.add('is-incorrect');
            quiz.feedback.textContent = 'Não foi dessa vez. ' + q.e;
        }
        quiz.feedback.hidden = false;
        quiz.acertos.textContent = 'Acertos: ' + estado.acertos;
        quiz.confirmar.hidden = true;
        quiz.proxima.hidden = false;
        quiz.proxima.textContent = estado.quizIndice === QUIZ.length - 1 ? 'Ver resultado' : 'Próxima pergunta';
        quiz.proxima.focus({ preventScroll: true });
    });

    quiz.proxima.addEventListener('click', () => {
        if (estado.quizIndice < QUIZ.length - 1) {
            estado.quizIndice += 1;
            mostrarPergunta();
        } else {
            mostrarFinal();
        }
    });

    function mostrarFinal() {
        $('pontuacao-final').textContent = estado.pontos;
        $('acertos-finais').textContent = estado.acertos + ' de ' + QUIZ.length;
        const elogio = estado.acertos === QUIZ.length
            ? 'Perfeito! Você é um(a) verdadeiro(a) guardião(ã) dos saberes. '
            : estado.acertos >= 3
                ? 'Muito bem! Você aprendeu bastante. '
                : 'Boa tentativa! Releia o Livro dos Saberes e jogue novamente. ';
        const estrelas = estado.pontos >= 200 ? '⭐⭐⭐' : estado.pontos >= 150 ? '⭐⭐' : '⭐';
        const titulo = estrelas.length === 3 ? 'Guardião(ã) dos Saberes' : estrelas.length === 2 ? 'Aprendiz dedicado(a)' : 'Explorador(a) da Comunidade';
        $('mensagem-final').textContent = estrelas + ' Título: ' + titulo + '. ' + elogio + MENSAGEM_FINAL;
        som.vitoria();
        mostrarTela('final');
    }

    /* =========================================================
       EVENTOS GERAIS
       ========================================================= */
    function comecar() {
        estado = novoEstado();
        mostrarTela('jogo');
        carregarFase(1);
        el.mundo.focus({ preventScroll: true });
    }

    $('btn-iniciar').addEventListener('click', comecar);
    $('btn-jogar-novamente').addEventListener('click', comecar);
    $('btn-instrucoes-inicial').addEventListener('click', () => mostrarTela('instrucoes'));
    $('btn-voltar-instrucoes').addEventListener('click', () => mostrarTela('inicial'));

    $('btn-ajuda').addEventListener('click', () => el.ajuda.showModal());
    $('btn-fechar-ajuda').addEventListener('click', () => el.ajuda.close());

    $('btn-livro').addEventListener('click', () => {
        const atual = telaVisivel();
        if (atual && atual !== 'livro') telaAnterior = atual;
        mostrarTela('livro');
    });
    $('btn-voltar-jogo').addEventListener('click', () => {
        mostrarTela(telaAnterior === 'livro' ? 'inicial' : telaAnterior);
    });

    el.btnAvancar.addEventListener('click', avancarDialogo);
    el.btnFechar.addEventListener('click', () => fecharDialogo(false));

    function interagir() {
        if (estado.minijogo) { mexerPanela(); return; }
        if (estado.dialogoAberto) {
            if (!el.btnAvancar.hidden) avancarDialogo();
            return;
        }
        const n = npcProximo();
        if (n) iniciarConversa(n);
    }

    // Setas e WASD controlam o mesmo movimento
    const MAPA_TECLAS = { KeyW: 'ArrowUp', KeyA: 'ArrowLeft', KeyS: 'ArrowDown', KeyD: 'ArrowRight' };

    function teclaDeMovimento(ev) {
        if (MAPA_TECLAS[ev.code]) return MAPA_TECLAS[ev.code];
        if (ev.key && ev.key.indexOf('Arrow') === 0) return ev.key;
        return null;
    }

    document.addEventListener('keydown', (ev) => {
        if (telas.jogo.hidden) return;
        if (el.ajuda.open) return;
        if (ev.ctrlKey || ev.metaKey || ev.altKey) return;

        const mov = teclaDeMovimento(ev);
        if (mov) {
            if (ev.target.closest && ev.target.closest('input, select, textarea')) return;
            teclas[mov] = true;
            ev.preventDefault();
            return;
        }
        if (ev.key === 'Escape' && estado.minijogo) {
            estado.minijogo.painel.remove();
            estado.minijogo = null;
            estado.dialogoAberto = false;
            return;
        }
        if (ev.key === 'Escape' && estado.dialogoAberto) {
            fecharDialogo(false);
            return;
        }
        if (ev.key === ' ' || ev.key === 'Enter') {
            // Botões tratam Espaço/Enter por conta própria
            if (ev.target.tagName === 'BUTTON') return;
            ev.preventDefault();
            interagir();
        }
    });

    document.addEventListener('keyup', (ev) => {
        const mov = teclaDeMovimento(ev);
        if (mov) teclas[mov] = false;
    });
    window.addEventListener('blur', () => Object.keys(teclas).forEach((k) => { teclas[k] = false; }));

    /* ---------- Botão de som ---------- */
    (function criarBotaoSom() {
        const nav = document.querySelector('.main-navigation');
        if (!nav) return;
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'button button--secondary';
        b.id = 'btn-som';
        b.textContent = '🔊 Som';
        b.setAttribute('aria-pressed', 'true');
        b.addEventListener('click', () => {
            somLigado = !somLigado;
            b.textContent = somLigado ? '🔊 Som' : '🔇 Mudo';
            b.setAttribute('aria-pressed', String(somLigado));
            if (somLigado) som.ponto();
        });
        nav.appendChild(b);
    })();

    /* ---------- Controles de toque ---------- */
    (function criarControlesToque() {
        const pad = document.createElement('div');
        pad.className = 'touch-controls';
        pad.setAttribute('aria-hidden', 'true');
        const botoes = [
            ['▲', 'ArrowUp', 'up'],
            ['◀', 'ArrowLeft', 'left'],
            ['▼', 'ArrowDown', 'down'],
            ['▶', 'ArrowRight', 'right']
        ];
        botoes.forEach(([rotulo, tecla, cls]) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'touch-controls__btn touch-controls__btn--' + cls;
            b.textContent = rotulo;
            const liga = (ev) => { ev.preventDefault(); teclas[tecla] = true; };
            const desliga = (ev) => { ev.preventDefault(); teclas[tecla] = false; };
            b.addEventListener('pointerdown', liga);
            b.addEventListener('pointerup', desliga);
            b.addEventListener('pointerleave', desliga);
            b.addEventListener('pointercancel', desliga);
            pad.appendChild(b);
        });
        const falar = document.createElement('button');
        falar.type = 'button';
        falar.className = 'touch-controls__talk';
        falar.textContent = 'Falar';
        falar.addEventListener('click', interagir);
        pad.appendChild(falar);
        el.mundo.appendChild(pad);
    })();

    /* ---------- Inicialização ---------- */
    estado = novoEstado();
    el.sprite.style.backgroundImage = 'url("' + IMG + 'jogador.png")';
    atualizarPlacar();
    window.addEventListener('resize', posicionarJogador);
    requestAnimationFrame(laco);
})();

let caes = [];

async function carregarCaesDoBanco() {
    try {
        const resposta = await fetch('/api/caes');
        caes = await resposta.json();
        printGaleria(caes);
    } catch (erro) {
        console.error('Erro ao buscar dados da API:', erro);
        const galeria = document.getElementById('galeria') || document.getElementById('galeria-meus-anuncios');
        if (galeria) {
            galeria.innerHTML = `<p class="mensagem-vazio">Erro ao carregar o banco de dados. Verifique se o servidor está rodando.</p>`;
        }
    }
}

const galeriaPrincipal = document.getElementById('galeria');
const galeriaMeusAnuncios = document.getElementById('galeria-meus-anuncios');
const containerAtivo = galeriaPrincipal || galeriaMeusAnuncios;

const filtroPorte = document.getElementById('filtro-porte');
const filtroFase = document.getElementById('filtro-fase');
const filtroCastrado = document.getElementById('filtro-castrado');
const filtroVacinado = document.getElementById('filtro-vacinado');

const janelaContato = document.getElementById('janela-contato');
const btnFecharContato = document.getElementById('fechar-janela');

const janelaEditar = document.getElementById('janela-editar');
const btnFecharEditar = document.getElementById('fechar-editar');
const formEditar = document.getElementById('form-editar');

const formCadastro = document.getElementById('form-cadastro');

function printGaleria(listaCaes) {
    if (!containerAtivo) return;
    
    containerAtivo.innerHTML = ""; 

    if (listaCaes.length === 0) {
        containerAtivo.innerHTML = `<p class="mensagem-vazio">Não foram encontrados aumigos. Tente outra busca com os filtros.</p>`;
        return;
    }

    listaCaes.forEach(cao => {
        const article = document.createElement('article');
        article.classList.add('card');

        let botaoHTML = "";
        let cabecalhoHTML = `<h3>${cao.nome} <span style="font-size: 16px; font-weight: normal;">(${cao.fase})</span></h3>`;

        if (galeriaMeusAnuncios) {
            let statusTag = cao.adotado 
                ? `<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: bold; margin-left: 10px;">Já Adotado</span>` 
                : `<span style="background: #ffc107; color: black; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: bold; margin-left: 10px;">Disponível</span>`;
            
            cabecalhoHTML = `<h3>${cao.nome} ${statusTag}</h3>`;

            botaoHTML = `
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="btn-contato btn-editar-custom" onclick="abrirModalEdicao(${cao.id})">Editar</button>
                    <button class="btn-contato" style="background-color: #dc3545; color: white; flex: 1;" onclick="deletarCao(${cao.id})">Excluir</button>
                </div>
            `;
        }
        else {
            if (cao.adotado) {
                botaoHTML = `<button class="btn-contato" disabled>Já Adotado</button>`;
            } else {
                botaoHTML = `<button class="btn-contato" onclick="abrirJanela(${cao.id})">Ver contato</button>`;
            }
        }

        let racaHTML = '';
        if (document.getElementById('galeria')) {
            racaHTML = `<span class="raca-clicavel" onclick="buscarInfoRaca('${cao.raca}')" title="Clique para saber mais sobre a raça">${cao.raca}</span>`;
        } else {
            racaHTML = `<span>${cao.raca}</span>`;
        }

        article.innerHTML = `
            <img src="${cao.imagem}" alt="Foto do ${cao.nome}">
            <div class="card-conteudo">
                ${cabecalhoHTML}
                <p class="info">${cao.sexo} • ${racaHTML}</p> <p class="info" style="font-weight: normal; margin-bottom: 5px;">${cao.porte} • ${cao.idade} ano(s) • ${cao.cidade}</p>
                <p class="info" style="font-weight: normal; font-size: 14px;"><strong> ${cao.castrado} </strong> • <strong>${cao.vacinado}</strong></p>
                <p class="descricao">${cao.descricao}</p>
                ${botaoHTML}
            </div>
        `;
        
        containerAtivo.appendChild(article);
    });
}

function filtrarCaes() {
    if (!filtroPorte || !filtroFase || !filtroCastrado || !filtroVacinado) return;

    const valorPorte = filtroPorte.value;
    const valorFase = filtroFase.value;
    const valorCastrado = filtroCastrado.value;
    const valorVacinado = filtroVacinado.value;

    const caesFiltrados = caes.filter(cao => {
        const batePorte = (valorPorte === "Todos" || cao.porte === valorPorte);
        const bateFase = (valorFase === "Todos" || cao.fase === valorFase);
        const bateCastrado = (valorCastrado === "Todos" || cao.castrado === valorCastrado);
        const bateVacinado = (valorVacinado === "Todos" || cao.vacinado === valorVacinado);
        
        return batePorte && bateFase && bateCastrado && bateVacinado;
    });

    printGaleria(caesFiltrados);
}

if (filtroPorte) filtroPorte.addEventListener('change', filtrarCaes);
if (filtroFase) filtroFase.addEventListener('change', filtrarCaes);
if (filtroCastrado) filtroCastrado.addEventListener('change', filtrarCaes);
if (filtroVacinado) filtroVacinado.addEventListener('change', filtrarCaes);

function abrirJanela(id) {
    const cao = caes.find(c => c.id === id);

    document.getElementById('janela-nome-cao').innerText = cao.nome;
    document.getElementById('janela-dono').innerText = cao.dono;
    
    document.getElementById('janela-telefone').innerText = formatarTelefone(cao.telefone);
    
    document.getElementById('janela-email').innerText = cao.email;

    const modal = document.getElementById('janela-contato');
    modal.classList.add('ativo');
}


if (btnFecharContato) {
    btnFecharContato.addEventListener('click', () => {
        janelaContato.classList.remove('ativo');
    });
}

function abrirModalEdicao(id) {
    const cao = caes.find(c => c.id === id);
    if (cao && janelaEditar) {
        document.getElementById('edit-id').value = cao.id;
        document.getElementById('edit-nome').value = cao.nome;
        document.getElementById('edit-sexo').value = cao.sexo;
        document.getElementById('edit-raca').value = cao.raca;
        document.getElementById('edit-porte').value = cao.porte;
        document.getElementById('edit-idade').value = cao.idade;
        document.getElementById('edit-castrado').value = cao.castrado;
        document.getElementById('edit-vacinado').value = cao.vacinado;
        document.getElementById('edit-descricao').value = cao.descricao;
        document.getElementById('edit-adotado').value = cao.adotado ? "true" : "false";
        
        janelaEditar.classList.add('ativo');
    }
}

if (btnFecharEditar) {
    btnFecharEditar.addEventListener('click', () => {
        janelaEditar.classList.remove('ativo');
    });
}

if (formEditar) {
    formEditar.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const idEdicao = document.getElementById('edit-id').value;
        const dadosAtualizados = {
            nome: document.getElementById('edit-nome').value,
            sexo: document.getElementById('edit-sexo').value,
            raca: document.getElementById('edit-raca').value,
            porte: document.getElementById('edit-porte').value,
            idade: document.getElementById('edit-idade').value,
            castrado: document.getElementById('edit-castrado').value,
            vacinado: document.getElementById('edit-vacinado').value,
            descricao: document.getElementById('edit-descricao').value,
            adotado: document.getElementById('edit-adotado').value === "true"
        };
        
        try {
            const resposta = await fetch(`/api/caes/${idEdicao}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosAtualizados)
            });

            if (resposta.ok) {
                mostrarAlerta('Sucesso!', 'Os dados do Aumigo foram atualizados.', 'sucesso', 'editar.html');
            } else {
                mostrarAlerta('Erro', 'Ocorreu um erro ao atualizar os dados.', 'erro');
            }
        } catch (erro) {
            console.error('Erro de conexão:', erro);
            mostrarAlerta('Sem Ligação', 'Não foi possível conectar ao servidor.', 'erro');
        }
    });
}

window.addEventListener('click', (evento) => {
    if (janelaContato && evento.target === janelaContato) {
        janelaContato.classList.remove('ativo');
    }
    if (janelaEditar && evento.target === janelaEditar) {
        janelaEditar.classList.remove('ativo');
    }
});

if (formCadastro) {
    formCadastro.addEventListener('submit', async function(evento) {
        evento.preventDefault(); 
        
        const formData = new FormData(formCadastro);

        try {
            const resposta = await fetch('/api/caes', {
                method: 'POST',
                body: formData 
            });

            if (resposta.ok) {
                mostrarAlerta('Sucesso!', 'Aumigo cadastrado com sucesso!', 'sucesso', 'cadastrar.html');
            } else {
                mostrarAlerta('Erro', 'Ocorreu um erro ao tentar cadastrar o cão.', 'erro');
            }
        } catch (erro) {
            console.error('Erro de conexão:', erro);
            mostrarAlerta('Sem Ligação', 'Não foi possível conectar ao servidor.', 'erro');
        }
    });
}

function deletarCao(id) {
    mostrarConfirmacao(
        'Tem certeza?', 
        'Você está prestes a excluir este post. Esta ação não pode ser desfeita.', 
        async function() {
            try {
                const resposta = await fetch(`/api/caes/${id}`, {
                    method: 'DELETE'
                });

                if (resposta.ok) {
                    mostrarAlerta('Excluído', 'O post foi removido com sucesso.', 'sucesso');
                    carregarCaesDoBanco();
                } else {
                    mostrarAlerta('Erro', 'Não foi possível excluir o post.', 'erro');
                }
            } catch (erro) {
                console.error('Erro de conexão:', erro);
                mostrarAlerta('Erro', 'Não foi possível conectar ao servidor.', 'erro');
            }
        }
    );
}

function mostrarAlerta(titulo, texto, tipo, urlRedirecionamento = null) {
    const modal = document.getElementById('modal-alerta');
    const tituloEl = document.getElementById('modal-alerta-titulo');
    const textoEl = document.getElementById('modal-alerta-texto');
    const btn = document.getElementById('modal-alerta-btn');

    if (!modal) {
        alert(texto);
        if (urlRedirecionamento) window.location.href = urlRedirecionamento;
        return;
    }

    tituloEl.innerText = titulo;
    textoEl.innerText = texto;

    if (tipo === 'erro') {
        btn.classList.add('erro');
    } else {
        btn.classList.remove('erro');
    }

    modal.classList.add('ativo');

    btn.onclick = function() {
        modal.classList.remove('ativo');
        
        if (urlRedirecionamento) {
            window.location.href = urlRedirecionamento;
        }
    };
}

function mostrarConfirmacao(titulo, texto, acaoConfirmar) {
    const modal = document.getElementById('modal-alerta');
    const tituloEl = document.getElementById('modal-alerta-titulo');
    const textoEl = document.getElementById('modal-alerta-texto');
    const btnOk = document.getElementById('modal-alerta-btn');
    const btnCancelar = document.getElementById('modal-alerta-btn-cancelar');

    if (!modal) {
        if (confirm(texto)) acaoConfirmar();
        return;
    }

    tituloEl.innerText = titulo;
    textoEl.innerText = texto;
    btnOk.innerText = 'Sim, excluir';
    btnOk.className = 'modal-alerta-btn erro';
    btnCancelar.style.display = 'inline-block';
    
    modal.classList.add('ativo');

    btnOk.onclick = function() {
        fecharEResetarModal();
        acaoConfirmar();
    };

    btnCancelar.onclick = function() {
        fecharEResetarModal();
    };

    function fecharEResetarModal() {
        modal.classList.remove('ativo');
        btnOk.innerText = 'OK';
        btnOk.className = 'modal-alerta-btn';
        btnCancelar.style.display = 'none';
    }
}

function formatarTelefone(telefone) {
    let numeroLimpo = String(telefone).replace(/\D/g, '');

    if (numeroLimpo.length === 11) {
        return `(${numeroLimpo.substring(0, 2)})${numeroLimpo.substring(2, 7)}-${numeroLimpo.substring(7, 11)}`;
    }
    else if (numeroLimpo.length === 10) {
        return `(${numeroLimpo.substring(0, 2)})${numeroLimpo.substring(2, 6)}-${numeroLimpo.substring(6, 10)}`;
    }

    return telefone;
}

async function buscarInfoRaca(nomeRaca) {
    const modal = document.getElementById('janela-raca');
    const msgEl = document.getElementById('raca-mensagem');
    const conteudoEl = document.getElementById('raca-conteudo');
    
    document.getElementById('raca-nome-titulo').innerText = nomeRaca;
    msgEl.style.display = 'block';
    msgEl.innerHTML = 'Buscando dados na The Dog API... ';
    conteudoEl.style.display = 'none';
    
    modal.classList.add('ativo');

    const racaFormatada = nomeRaca.toLowerCase().trim();
    if (racaFormatada.includes('srd') || racaFormatada.includes('mestiço') || racaFormatada === 'não definida' || racaFormatada === 'vira-lata') {
        document.getElementById('raca-temperamento').innerText = 'Personalidade variada e adaptável.';
        document.getElementById('raca-vida').innerText = '12 - 15 anos';
        document.getElementById('raca-peso').innerText = '10 - 25 kg';
        
        msgEl.style.display = 'none';
        conteudoEl.style.display = 'block';
        
    }

    try {
        const racaEmIngles = await traduzirParaIngles(nomeRaca);

        msgEl.innerHTML = `Buscando dados na The Dog API...`;

        const url = `https://api.thedogapi.com/v1/breeds/search?q=${encodeURIComponent(racaEmIngles)}`;
        
        const resposta = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': 'live_Qktafe1x4hq2rYGgtNfdXL7oCf241hm3EyTna8HFnz2GdnCeXrvWsvj9b98EnIIn',
                'Content-Type': 'application/json'
            }
        });

        const dados = await resposta.json();
        if (dados && dados.length > 0) {
            const racaInfo = dados[0];
           
            if (racaInfo.life_span) {
                let apenasNumeros = racaInfo.life_span.replace(/years/gi, '').replace(/year/gi, '').trim();
                document.getElementById('raca-vida').innerText = `${apenasNumeros} anos`;
            } else {
                document.getElementById('raca-vida').innerText = 'Não informado.';
            }
            
            document.getElementById('raca-peso').innerText = (racaInfo.weight && racaInfo.weight.metric) ? `${racaInfo.weight.metric} kg` : 'Não informado.';

            const temperamentoEmIngles = racaInfo.temperament || 'Não informado.';
            
            document.getElementById('raca-temperamento').innerText = 'Traduzindo...';
            
            const temperamentoTraduzido = await traduzirParaPTBR(temperamentoEmIngles);
            
            document.getElementById('raca-temperamento').innerText = temperamentoTraduzido;
            
            msgEl.style.display = 'none';
            conteudoEl.style.display = 'block';
        } else {
            msgEl.innerHTML = `Não encontramos informações detalhadas para a raça "<b>${nomeRaca}</b>" no banco de dados internacional.`;
        }

    } catch (erro) {
        console.error('Erro na The Dog API:', erro);
        msgEl.innerHTML = 'Ocorreu um erro ao tentar ligar ao banco de dados das raças.';
    }
}

const btnFecharRaca = document.getElementById('fechar-janela-raca');

if (btnFecharRaca) {
    btnFecharRaca.onclick = function() {
        const modalRaca = document.getElementById('janela-raca');
        if (modalRaca) modalRaca.classList.remove('ativo');
    };
}

window.addEventListener('click', function(event) {
    const modalRaca = document.getElementById('janela-raca');
    
    if (modalRaca && event.target === modalRaca) {
        modalRaca.classList.remove('ativo');
    }
});

async function traduzirParaPTBR(texto) {
    if (!texto || texto === 'Não informado.') return texto;
    
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|pt-br`;
        const resposta = await fetch(url);
        const dados = await resposta.json();
        
        if (dados.responseData && dados.responseData.translatedText) {
            return dados.responseData.translatedText;
        }
        return texto;
    } catch (erro) {
        console.error('Erro na API de tradução:', erro);
        return texto;
    }
}

async function traduzirParaIngles(texto) {
    if (!texto) return texto;
    
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=pt-br|en`;
        const resposta = await fetch(url);
        const dados = await resposta.json();
        
        if (dados.responseData && dados.responseData.translatedText) {
            return dados.responseData.translatedText;
        }
        return texto;
    } catch (erro) {
        console.error('Erro na API de tradução para inglês:', erro);
        return texto;
    }
}

carregarCaesDoBanco();
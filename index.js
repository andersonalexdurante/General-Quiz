(function(){
    let game;

    //construtor para monta as perguntas
    const Pergunta = function(dificuldade, categoria, pergunta, correta, vetor, tipo){
        this.dificuldade = dificuldade;
        this.categoria = categoria;
        this.pergunta = pergunta;
        this.tipo = tipo;
        this.correta = correta;
        this.vetor = vetor;
    }

    //construtor de objeto que controla o jogo
    const jogo = function(){
        this.token;
        this.questaoMomento;
        this.categoria;
        this.dificuldade;
        this.ponto = 0;
        this.vidas = 3;
        this.qntdPerguntas = 0;
        this.arrayObjetosPergunta = new Array();
        this.erradas = 0;
        this.acertadas = 0;
        this.guardada;
        this.pontoddp = false;
        this.loadCategoria = false;
        this.loadPergunta = false;
        this.loadTempo = false;
    }

    document.querySelector('.start').addEventListener('click', function(){
        document.querySelector('.config').style.display = 'flex';
        document.querySelector('.menu').style.display = 'none';
        document.querySelector('.logo').style.display = 'none';
        document.querySelector('.gameover').style.display = 'none';
        document.querySelector('.loading').style.display = 'flex';
        game = new jogo();
        loadCategoria();
        pegarCategorias();
    });

    document.querySelector('#comecar').addEventListener('click', function(){
        document.querySelector('.config').style.display = 'none';
        document.querySelector('.point').style.display = 'flex';
        document.querySelector('.jogo').style.display = 'flex';
        criarToken();
        capturarDados();
    });

    document.querySelector('#quit').addEventListener('click', function(){
        location.reload();
    });
    document.querySelector('#again').addEventListener('click', function(){
        location.reload();
    });

    function criarToken(){
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        axios.get(`${proxy}https://opentdb.com/api_token.php?command=request`).then(function(json){
            const tokenJSON = json.data;
            game.token = tokenJSON.token;
        });
    }

    function resetToken(){
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        axios.get(`${proxy}https://opentdb.com/api_token.php?command=reset&token=${game.token}`).then(function(json){
            const tokenJSON = json.data;
            game.token = tokenJSON.token;
        });
    }

    function pegarCategorias(){
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        axios.get(`${proxy}https://opentdb.com/api_category.php`).then(function(json){
            const catJSON = json.data;
            let ax = document.querySelector('#categorias');
            for(const a of catJSON.trivia_categories){
                game.loadCategoria = true;
                let nome = a.name;
                ax.innerHTML += `<option value="${a.id}">${nome}</option>`;
            }
        });
    }

    function loadCategoria(){
        document.querySelector('#escolha').style.display = 'none';
        document.querySelector('#comecar').style.display = 'none';
        document.querySelector('.config').style.display = 'none';
        const div=document.querySelector('.load');
        let interval=0;
        div.textContent=interval;
        let it=setInterval(function(){
            interval++;
            div.textContent='Loading: '+interval+'%';
            if (interval==100 || game.loadCategoria == true){
                document.querySelector('#comecar').style.display = 'inline';
                document.querySelector('#escolha').style.display = 'inline';
                document.querySelector('.config').style.display = 'flex';
                clearInterval(it); // Pára repetição
                document.querySelector('.loading').style.display = 'none';
                game.loadCategoria = false;
        }},40);
    }

    function loadTempo(tempo){
        game.loadTempo = false;
        const time = document.querySelector('#seg');
        time.textContent = `00:${tempo}`;
        let it = setInterval(function(){
            tempo--;
            time.textContent = '00:'+tempo;
            if(tempo == 0 || game.loadTempo == true){
                document.querySelector('.time-bar').style.display = 'none';
                clearInterval(it);
                if(game.loadTempo != true){
                    confirm();
                    document.querySelector('.time-bar').style.display = 'flex';
                }
            }
            game.loadTempo = false;
        },1000)
    }

    function capturarDados(){
        let cat = document.getElementById('categorias');
        let dif = document.getElementById('dificuldades');
        if(cat.options[cat.selectedIndex].value == "" && dif.options[cat.selectedIndex].value == ""){
            let y;
            let x;
            y = Math.floor((Math.random() * 3));
            x = Math.floor((Math.random() * (32 - 9) + 9));

            if(y == 0){
                dif = "easy";
            }
            else if(y == 1){
                dif = "medium";
            }
            else if(y == 2){
                dif = "hard";
            }
            game.categoria = x;
            game.dificuldade = dif;
            console.log(game.categoria);
            console.log(game.dificuldade);
        }
        else{
            game.categoria = cat.options[cat.selectedIndex].value;
            game.dificuldade = dif.options[dif.selectedIndex].value;
        }
        carregarPergunta();
    }
    function carregarPergunta(){
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        axios.get(`${proxy}https://opentdb.com/api_count.php?category=${game.categoria}`).then(function(json){
            const cat = json.data;
            if(game.dificuldade == "easy"){
                game.qntdPerguntas = cat.category_question_count.total_easy_question_count;
            }
            else if(game.dificuldade == "medium"){
                game.qntdPerguntas = cat.category_question_count.total_medium_question_count;
            }
            else if(game.dificuldade == "hard"){
                game.qntdPerguntas = cat.category_question_count.total_hard_question_count;
            }
        });  
        loadingPergunta();
        setTimeout(function(){loadPergunta()},3000);
    }

    function loadingPergunta(){
        document.querySelector('.loading').style.display = 'flex';
        document.querySelector('.jogo').style.display = 'none';
        document.querySelector('.point').style.display = 'none';
        const div=document.querySelector('.load');
        let interval=0;
        div.textContent=interval;
        let it=setInterval(function(){
            interval++;
            div.textContent='Loading: '+interval+'%';
            if (interval==100 || game.loadPergunta == true){
                clearInterval(it); // Para repetição
                document.querySelector('.loading').style.display = 'none';
                document.querySelector('.jogo').style.display = 'flex';
                document.querySelector('.point').style.display = 'flex';
                game.loadPergunta = false;
        }},70);
    }

    function loadPergunta(){
        let array = new Array();
        let perguntaJSON;
        proxy = 'https://cors-anywhere.herokuapp.com/';
        axios.get(`${proxy}https://opentdb.com/api.php?amount=1&category=${game.categoria}&difficulty=${game.dificuldade}&token=${game.token}`).then(function(json){
            perguntaJSON = json.data;
            for (const p of perguntaJSON.results){
                game.loadPergunta = true;
                const pergunta = p.question;
                const correta = p.correct_answer;
                for(const a of p.incorrect_answers){//percorre as 3 alternativas erradas
                    array.push(a);
                }
                const tipo = p.type;
                let objPergunta = new Pergunta(game.dificuldade, game.categoria, pergunta, correta, array, tipo);//construi um obg de pergunta por vez
                game.arrayObjetosPergunta.push(objPergunta);//-para segurança
                game.questaoMomento = objPergunta;
                array = [];
            }
            jogar();
        });
    }

    function jogar(){
        let questao = game.questaoMomento.pergunta;
        //manipular a questão com DOM
        const questaoDOM = document.querySelector('#ask');
        questaoDOM.textContent = '';
        questaoDOM.innerHTML += `<p id="ask">${questao}</p>`;

        document.querySelector('.time-bar').style.display = 'flex';
        if(game.questaoMomento.dificuldade == 'easy'){
            loadTempo(45);
        }    
        else if(game.questaoMomento.dificuldade == 'medium'){
            loadTempo(30);
        }
        else{
            loadTempo(15);
        }
        //manipular as alternativas com DOM
        const alternativas = document.querySelector('.alternativas');
        alternativas.textContent = '';
        alternativas.innerHTML += `<h2>Alternatives</h2>`;
        montaAlternativa(alternativas);

        if(game.guardada == null){
            alternativas.innerHTML += `<button id="next" onclick="next()">Reply Later</button>`;
        }
        alternativas.innerHTML += `<button id="confirm" onclick="confirm()">Confirm</button>`;
    }

    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    function montaAlternativa(alternativa){
        let y;
        let string, aux;
        if(game.questaoMomento.tipo === "multiple"){
            y = Math.floor((Math.random() * 4));
            for(i = 0;i<=game.questaoMomento.vetor.length;i++){
                if(y === i){
                    string = `<div class="form-check">
                            <input class="form-check-input" type="radio" name="alternativa" id="correta" value="${game.questaoMomento.dificuldade}">
                            <label class="form-check-label" for="correta">
                                ${game.questaoMomento.correta}
                            </label>
                        </div>`
                    alternativa.innerHTML += string;
                    aux = game.questaoMomento.vetor[i];
                }
                else if(i === game.questaoMomento.vetor.length){
                    string = `<div class="form-check">
                            <input class="form-check-input" type="radio" name="alternativa" id="${game.questaoMomento.vetor[i]}" value="${aux}">
                            <label class="form-check-label" for="${game.questaoMomento.vetor[i]}">
                                ${aux}
                            </label>
                        </div>`
                    alternativa.innerHTML += string;
                }
                else{
                    string = `<div class="form-check">
                            <input class="form-check-input" type="radio" name="alternativa" id="${game.questaoMomento.vetor[i]}" value="${game.questaoMomento.vetor[i]}">
                            <label class="form-check-label" for="${game.questaoMomento.vetor[i]}">
                                ${game.questaoMomento.vetor[i]}
                            </label>
                        </div>`
                    alternativa.innerHTML += string;
                }     
            }
        }
        else{
            let arrayTrueFalse = new Array();
            arrayTrueFalse.push(game.questaoMomento.vetor);
            arrayTrueFalse.push(game.questaoMomento.correta);
            arrayTrueFalse = shuffle(arrayTrueFalse);
            y = Math.floor((Math.random() * 2));
            for(i = 0;i<=arrayTrueFalse.length-1;i++){
                if(y == i){
                string = `<div class="form-check">
                    <input class="form-check-input" type="radio" name="alternativa" id="correta" value="${game.questaoMomento.dificuldade}">
                    <label class="form-check-label" for="correta">
                        ${game.questaoMomento.correta}
                    </label>
                    </div>`
                    alternativa.innerHTML += string;
                }
                else if(y != i){
                    string = `<div class="form-check">
                            <input class="form-check-input" type="radio" name="alternativa" id="${game.questaoMomento.vetor}" value="${game.questaoMomento.vetor[i]}">
                            <label class="form-check-label" for="${game.questaoMomento.vetor}">
                                ${game.questaoMomento.vetor}
                            </label>
                        </div>`
                    alternativa.innerHTML += string;
                }
            }
        }
        console.log(game.questaoMomento.correta);
    }

    function confirm(){
        game.loadTempo = true;
        if(document.getElementById('correta').checked){//acertou questao
            if(document.getElementById('correta').value === "easy" && game.pontoddp == false){
                game.ponto += 5;
            }
            if(document.getElementById('correta').value === "medium" && game.pontoddp == false){
                game.ponto += 8;
            }
            if(document.getElementById('correta').value === "hard" && game.pontoddp == false){
                game.ponto += 10;
            }
            if(document.getElementById('correta').value === "easy" && game.pontoddp == true){
                game.ponto += 3;
                game.pontoddp = false;
            }
            if(document.getElementById('correta').value === "medium" && game.pontoddp == true){
                game.ponto += 6;
                game.pontoddp = false;
            }
            if(document.getElementById('correta').value === "hard" && game.pontoddp == true){
                game.ponto += 8;
                game.pontoddp = false;
            }
            let score = document.querySelector('.score');
            score.textContent = '';
            score.innerHTML += `<h3>Score: ${game.ponto} Vida: ${game.vidas}</h3>`;
            info(0);
            game.acertadas++;
        }
        else if(!document.getElementById('correta').checked){//erra
            if(document.getElementById('correta').value === "easy" && game.pontoddp == false){
                game.ponto -= 5;
            }
            if(document.getElementById('correta').value === "medium"  && game.pontoddp == false){
                game.ponto -= 8;
            }
            if(document.getElementById('correta').value === "hard"  && game.pontoddp == false){
                game.ponto -= 10;
            }
            if(document.getElementById('correta').value === "easy" && game.pontoddp == true){
                game.ponto -= 3;
                game.pontoddp = false;
            }
            if(document.getElementById('correta').value === "medium" && game.pontoddp == true){
                game.ponto -= 6;
                game.pontoddp = false;
            }
            if(document.getElementById('correta').value === "hard" && game.pontoddp == true){
                game.ponto -= 8;
                game.pontoddp = false;
            }
            if(game.ponto <= 0){
                game.ponto = 0;
            }
            game.vidas--;
            let score = document.querySelector('.score');
            score.textContent = '';
            score.innerHTML += `<h3>Score: ${game.ponto} Vida: ${game.vidas}</h3>`;
            info(1); 
            game.erradas++;
            if(game.vidas == 0){
                gameover();
            }
        }
        else{
            alert("Selecione uma Alternativa!");
        }

        if(game.arrayObjetosPergunta.length == game.qntdPerguntas){
            document.querySelector('#continue').style.display = 'none';
            info(2);
        }
    }

    function info(n){
        document.querySelector('.config').style.display = 'none';
        document.querySelector('.point').style.display = 'none';
        document.querySelector('.jogo').style.display = 'none';
        document.querySelector('.info').style.display = 'flex';
        let status;
        if(n === 0){
            status = document.querySelector('#status');
            status.textContent = '';
            status.innerHTML += `<p id="status">Correct</p>`;
            document.querySelector('.informacao').style.backgroundColor = '#129619';
        }
        else if(n === 2){
            status = document.querySelector('#status');
            status.textContent = '';
            status.innerHTML += `<p id="status">You win!</p>`;
            document.querySelector('.informacao').style.backgroundColor = '#03cafc';
        }
        else{
            status = document.querySelector('#status');
            status.textContent = '';
            status.innerHTML += `<p id="status">Incorrect</p>`;
            document.querySelector('.informacao').style.backgroundColor = '#c41a0e';
        }
    }

    function continuar(){
        document.querySelector('.config').style.display = 'none';
        document.querySelector('.point').style.display = 'flex';
        document.querySelector('.jogo').style.display = 'flex';
        document.querySelector('.info').style.display = 'none';
        loadingPergunta();
        loadPergunta();
    }

    function next(){
        game.loadTempo = true;
        if(game.guardada == null){
            game.guardada = game.questaoMomento;
            document.querySelector('#saved').style.display = 'inline';
            document.querySelector('#next').style.display = 'none';
            loadingPergunta();
            setTimeout(function(){
                loadPergunta(); 
            },700) 
        }
    }

    function respNext(){
        if(game.guardada != null){
            montaNext();
        }
    }

    function montaNext(){
        game.questaoMomento = game.guardada;
        game.guardada = null;
        game.pontoddp = true;
        document.querySelector('.config').style.display = 'none';
        document.querySelector('.point').style.display = 'flex';
        document.querySelector('.jogo').style.display = 'flex';
        document.querySelector('.info').style.display = 'none';
        document.querySelector('#saved').style.display = 'none';
        jogar();
    }

    function gameover(){
        document.querySelector('.config').style.display = 'none';
        document.querySelector('.point').style.display = 'none';
        document.querySelector('.jogo').style.display = 'none';
        document.querySelector('.info').style.display = 'none';
        document.querySelector('.gameover').style.display = 'flex';
        let acertos = document.querySelector('#acertos');
        acertos.textContent = '';
        acertos.innerHTML += `<p id="acertos">Right questions: ${game.acertadas}</p>`;

        let erros = document.querySelector('#erros');
        erros.textContent = '';
        erros.innerHTML += `<p id="erros">Wrong questions: ${game.erradas}</p>`;

        let pt = document.querySelector('#pt');
        pt.textContent = '';
        pt.innerHTML += `<p id="pt">Score: ${game.ponto}</p>`;
    }
})();
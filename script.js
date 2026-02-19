document.addEventListener('DOMContentLoaded', () => {
    // Variável global para rastrear o áudio atual
    let currentAudio = null;

    // Função auxiliar para tocar áudio com barra de progresso
    function playAudioWithProgress(audioPath, container, speed = 1) {
        // Se já houver um áudio tocando, impede a reprodução de um novo até que termine
        if (currentAudio && !currentAudio.paused) {
            return;
        }

        // Remove barra de progresso residual, se houver
        const oldBar = document.querySelector('.audio-progress-bar');
        if (oldBar) oldBar.remove();

        // Remove destaques de texto anteriores (caso tenha ficado algum travado)
        document.querySelectorAll('.text-highlight').forEach(el => el.classList.remove('text-highlight'));

        if (!audioPath) return;

        const audio = new Audio(audioPath);
        audio.playbackRate = speed; // Define a velocidade do áudio
        currentAudio = audio;

        // Identifica o elemento de texto para destacar (span no card, p no chat)
        let textElement = null;
        if (container) {
            textElement = container.querySelector('span, p, .highlight-text');
            if (textElement) textElement.classList.add('text-highlight');
        }

        // Cria a barra de progresso visualmente
        const progressBar = document.createElement('div');
        progressBar.classList.add('audio-progress-bar');
        if (container) container.appendChild(progressBar);

        // Atualiza a largura da barra conforme o áudio toca
        audio.addEventListener('timeupdate', () => {
            const percentage = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${percentage}%`;
        });

        // Remove a barra quando o áudio termina
        audio.addEventListener('ended', () => {
            progressBar.remove();
            if (textElement) textElement.classList.remove('text-highlight');
            currentAudio = null;
        });

        audio.play().catch(error => {
            console.error("Erro ao reproduzir áudio:", error);
            progressBar.remove();
            if (textElement) textElement.classList.remove('text-highlight');
            currentAudio = null;
        });
    }

    // Lógica do Modo Escuro
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            // Alterna o texto do botão entre Lua e Sol
            themeToggleBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Modo Claro' : '🌙 Modo Escuro';
        });
    }

    // Lógica do botão de Vocabulário
    const toggleVocabBtn = document.getElementById('toggle-vocab');
    const vocabContent = document.getElementById('vocab-content');

    if (toggleVocabBtn && vocabContent) {
        toggleVocabBtn.addEventListener('click', () => {
            // Alterna a classe 'hidden' para mostrar/ocultar
            vocabContent.classList.toggle('hidden');
            const letsTalkBtn = document.getElementById('lets-talk-btn');
            
            // Atualiza o texto do botão conforme o estado
            if (vocabContent.classList.contains('hidden')) {
                toggleVocabBtn.textContent = '📖 Abrir Vocabulário';
                if (letsTalkBtn) letsTalkBtn.classList.remove('hidden');
            } else {
                toggleVocabBtn.textContent = '📖 Fechar Vocabulário';
                if (letsTalkBtn) letsTalkBtn.classList.add('hidden');
                
                // Adiciona delay escalonado para animação de entrada
                const items = vocabContent.querySelectorAll('.audio-item');
                items.forEach((item, index) => {
                    item.style.animationDelay = `${index * 0.05}s`;
                    // Reinicia a animação removendo e readicionando a propriedade
                    item.style.animationName = 'none';
                    item.offsetHeight; /* trigger reflow */
                    item.style.animationName = 'popIn';
                });
            }
        });
    }

    // Lógica de Navegação (Passo 1 <-> Passo 2)
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const stepTalk = document.getElementById('step-talk');
    const stepRead = document.getElementById('step-read');
    const stepListening = document.getElementById('step-listening');
    const letsTalkBtn = document.getElementById('lets-talk-btn');
    const letsReadBtn = document.getElementById('lets-read-btn');
    const letsListenBtn = document.getElementById('lets-listen-btn');
    const letsListenIntroBtn = document.getElementById('lets-listen-intro-btn');
    const container = document.querySelector('.container');

    if (nextBtn && step1 && step2) {
        nextBtn.addEventListener('click', () => {
            // Se estiver no Passo 1 (Greetings), vai para o Passo 2 (Introdução)
            if (!step1.classList.contains('hidden')) {
                step1.classList.add('hidden');
                step2.classList.remove('hidden');
                
                if (prevBtn) prevBtn.classList.remove('disabled');

                if (container) container.classList.add('transparent');
                document.body.classList.add('white-bg');
                return;
            }

            // Se estiver no Passo 2 (Introdução), vai para o Passo 3 (Let's Talk)
            if (!step2.classList.contains('hidden') && stepTalk) {
                step2.classList.add('hidden');
                stepTalk.classList.remove('hidden');
                return;
            }

            // Se estiver no Passo 3 (Let's Talk), vai para o Passo 4 (Listening)
            if (stepTalk && !stepTalk.classList.contains('hidden') && stepListening) {
                stepTalk.classList.add('hidden');
                stepListening.classList.remove('hidden');
                
                // Esconde o botão Próximo no último passo
                nextBtn.style.display = 'none';
            }
        });
    }
    
    // Lógica para destacar o item de vocabulário clicado (Borda Verde)
    const audioItems = document.querySelectorAll('.audio-item');
    audioItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove a classe 'selected-card' de todos os itens para limpar a seleção anterior
            audioItems.forEach(i => i.classList.remove('selected-card'));
            // Adiciona a classe ao item que foi clicado agora
            item.classList.add('selected-card');

            // Tocar o áudio ao clicar no card
            const playBtn = item.querySelector('.play-btn');
            if (playBtn) {
                const audioPath = playBtn.getAttribute('data-audio');
                playAudioWithProgress(audioPath, item, 1); // Velocidade normal ao clicar no card
            }
        });
    });

    // Lógica para tocar áudio ao clicar nos balões de fala (Let's Talk)
    const chatBubbles = document.querySelectorAll('.chat-bubble');
    chatBubbles.forEach(bubble => {
        bubble.addEventListener('click', () => {
            const playBtn = bubble.querySelector('.play-mini-btn');
            if (playBtn) {
                const audioPath = playBtn.getAttribute('data-audio');
                playAudioWithProgress(audioPath, bubble, 1); // Velocidade normal ao clicar no balão
            }
        });
    });

    // Lógica do botão Let's Talk
    if (letsTalkBtn && stepTalk) {
        letsTalkBtn.addEventListener('click', () => {
            step2.classList.add('hidden');
            stepTalk.classList.remove('hidden');
            
            // Esconde o botão Próximo (pois é o fim) e habilita o Anterior
            if (nextBtn) nextBtn.style.display = 'none';
            if (prevBtn) prevBtn.classList.remove('disabled');
        });
    }

    // Lógica do botão Let's Read
    if (letsReadBtn && stepRead) {
        letsReadBtn.addEventListener('click', () => {
            stepTalk.classList.add('hidden');
            stepRead.classList.remove('hidden');
            
            if (nextBtn) nextBtn.style.display = 'none';
        });
    }

    // Lógica do botão Video Quiz na Introdução
    if (letsListenIntroBtn && stepListening) {
        letsListenIntroBtn.addEventListener('click', () => {
            step2.classList.add('hidden');
            stepListening.classList.remove('hidden');
            
            if (nextBtn) nextBtn.style.display = 'none';
            if (prevBtn) prevBtn.classList.remove('disabled');
        });
    }

    // Lógica do botão de voltar para Introdução (Seta no Step Talk)
    const backToIntroBtn = document.getElementById('back-to-intro-btn');
    if (backToIntroBtn && stepTalk && step2) {
        backToIntroBtn.addEventListener('click', () => {
            stepTalk.classList.add('hidden');
            step2.classList.remove('hidden');
            
            // Restaura o botão "Próximo" na navegação inferior
            if (nextBtn) nextBtn.style.display = 'inline-block';
        });
    }

    if (prevBtn && step1 && step2) {
        prevBtn.addEventListener('click', () => {
            // Se estiver no Step Listening, volta para o Step Talk
            if (stepListening && !stepListening.classList.contains('hidden')) {
                stepListening.classList.add('hidden');
                stepTalk.classList.remove('hidden');
                if (nextBtn) nextBtn.style.display = 'inline-block';
                return;
            }

            // Se estiver no Step Read, volta para o Step Talk
            if (stepRead && !stepRead.classList.contains('hidden')) {
                stepRead.classList.add('hidden');
                stepTalk.classList.remove('hidden');
                if (nextBtn) nextBtn.style.display = 'inline-block';
                return;
            }

            // Se estiver no Step Talk, volta para o Step 2
            if (stepTalk && !stepTalk.classList.contains('hidden')) {
                stepTalk.classList.add('hidden');
                step2.classList.remove('hidden');
                if (nextBtn) nextBtn.style.display = 'inline-block'; // Mostra o botão Próximo de volta
                return;
            }

            // Se estiver no Step 2, volta para o Step 1
            if (!step2.classList.contains('hidden')) {
                // Se o vocabulário estiver aberto, fecha ele e permanece na Introdução
                if (vocabContent && !vocabContent.classList.contains('hidden')) {
                    vocabContent.classList.add('hidden');
                    const letsTalkBtn = document.getElementById('lets-talk-btn');
                    if (letsTalkBtn) letsTalkBtn.classList.remove('hidden');
                    if (toggleVocabBtn) {
                        toggleVocabBtn.textContent = '📖 Abrir Vocabulário';
                    }
                    return;
                }

                step2.classList.add('hidden');
                step1.classList.remove('hidden');
                
                prevBtn.classList.add('disabled');
                if (nextBtn) nextBtn.classList.remove('disabled');
    
                if (container) container.classList.remove('transparent');
                document.body.classList.remove('white-bg');
            }
        });
    }

    // --- Lógica para Tocar Áudios ---
    // Seleciona todos os botões de áudio (tanto do vocabulário quanto do chat)
    const allAudioButtons = document.querySelectorAll('.play-btn, .play-mini-btn');
    
    allAudioButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o clique selecione o card (se estiver no vocabulário)
            
            const audioPath = btn.getAttribute('data-audio');
            // Encontra o container pai (card ou balão de chat) para colocar a barra
            const container = btn.closest('.audio-item') || btn.closest('.chat-bubble') || btn.closest('.reading-card') || btn.closest('.quiz-card');
            playAudioWithProgress(audioPath, container, 0.5); // Velocidade lenta ao clicar no botão
        });
    });

    // --- Lógica do Quiz (Listening and Choose) ---
    const quizOptions = document.querySelectorAll('.quiz-option');
    quizOptions.forEach(option => {
        option.addEventListener('click', () => {
            const isCorrect = option.getAttribute('data-correct') === 'true';
            const card = option.closest('.quiz-card');
            const feedback = card.querySelector('.quiz-feedback');
            const allOptions = card.querySelectorAll('.quiz-option');

            if (isCorrect) {
                option.classList.add('correct');
                feedback.textContent = "✨ Correto! Muito bem!";
                feedback.style.color = "#10b981"; // Verde
                
                // Desabilita todos os botões após acertar para finalizar
                allOptions.forEach(btn => btn.disabled = true);
            } else {
                option.classList.add('incorrect');
                feedback.textContent = "❌ Tente novamente!";
                feedback.style.color = "#ef4444"; // Vermelho
                
                // Desabilita apenas o botão errado
                option.disabled = true;
            }
        });
    });

    // --- Lógica do Quiz de Vídeo (Step 4 - Listening) ---
    const videoQuizData = [
        {
            video: "Imagens de Greetins/Design sem nome.mp4",
            question: "1. Qual cumprimento foi usado no vídeo?",
            options: [
                { text: "Good Night", correct: false },
                { text: "Hello / Hi", correct: true },
                { text: "Goodbye", correct: false },
                { text: "See you later", correct: false }
            ]
        },
        {
            video: "Imagens de Greetins/Design sem nome.mp4", // Substitua pelo vídeo da pergunta 2
            question: "2. Como a pessoa respondeu?",
            options: [
                { text: "I am sad", correct: false },
                { text: "I'm fine", correct: true },
                { text: "See ya", correct: false },
                { text: "Good morning", correct: false }
            ]
        }
        // Adicione mais perguntas aqui se desejar
    ];

    let currentVideoQuizIndex = 0;
    let score = 0;
    const videoPlayer = document.getElementById('video-quiz-player');
    const videoSource = document.getElementById('video-quiz-source');
    const questionTitle = document.getElementById('video-quiz-question');
    const optionsContainer = document.getElementById('video-quiz-options');
    const feedbackMsg = document.getElementById('video-quiz-feedback');
    const nextQuestionBtn = document.getElementById('video-quiz-next-btn');
    const scoreDisplay = document.getElementById('video-quiz-score');

    function updateScoreDisplay() {
        if (scoreDisplay) {
            scoreDisplay.textContent = `Acertos: ${score}/${videoQuizData.length}`;
        }
    }

    function loadVideoQuestion(index) {
        if (index === 0) score = 0; // Reseta a pontuação ao iniciar

        if (index >= videoQuizData.length) {
            if (questionTitle) questionTitle.textContent = `Parabéns! Você completou o quiz. Pontuação final: ${score}/${videoQuizData.length}`;
            if (optionsContainer) optionsContainer.innerHTML = '';
            if (feedbackMsg) feedbackMsg.textContent = '';
            if (nextQuestionBtn) nextQuestionBtn.style.display = 'none';
            if (videoPlayer) videoPlayer.closest('.video-container').style.display = 'none';
            return;
        }

        const data = videoQuizData[index];
        
        updateScoreDisplay();
        
        if (videoSource && videoPlayer) {
            // Atualiza o vídeo apenas se for diferente para evitar recarregamento desnecessário
            if (videoSource.getAttribute('src') !== data.video) {
                videoSource.src = data.video;
                videoPlayer.load();
            }
        }

        if (questionTitle) questionTitle.textContent = data.question;
        if (feedbackMsg) {
            feedbackMsg.textContent = '';
            feedbackMsg.style.color = '';
        }
        if (nextQuestionBtn) nextQuestionBtn.classList.add('hidden');

        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            data.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.classList.add('quiz-option');
                btn.textContent = opt.text;
                btn.dataset.correct = opt.correct;
                
                // Adiciona evento de clique para cada opção
                btn.addEventListener('click', () => {
                    const isCorrect = btn.dataset.correct === 'true';
                    const allOptions = optionsContainer.querySelectorAll('.quiz-option');

                    if (isCorrect) {
                        btn.classList.add('correct');
                        score++;
                        updateScoreDisplay();
                        feedbackMsg.textContent = "✨ Correto!";
                        feedbackMsg.style.color = "#10b981";
                        allOptions.forEach(b => b.disabled = true);
                        nextQuestionBtn.classList.remove('hidden');
                    } else {
                        btn.classList.add('incorrect');
                        feedbackMsg.textContent = "❌ Tente novamente!";
                        feedbackMsg.style.color = "#ef4444";
                        btn.disabled = true;
                    }
                });

                optionsContainer.appendChild(btn);
            });
        }
    }

    // Botão Próxima Pergunta
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', () => {
            currentVideoQuizIndex++;
            loadVideoQuestion(currentVideoQuizIndex);
        });
    }

    // Inicializa o quiz carregando a primeira pergunta
    loadVideoQuestion(0);
});
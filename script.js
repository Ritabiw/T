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
                
                // Reseta a visualização do vocabulário PT ao fechar
                const vocabPtContent = document.getElementById('vocab-pt-content');
                const vocabContinueBtn = document.getElementById('vocab-continue-btn');
                if (vocabPtContent) vocabPtContent.classList.add('hidden');
                if (vocabContinueBtn) vocabContinueBtn.style.display = '';
            } else {
                toggleVocabBtn.textContent = '📖 Fechar Vocabulário';
                if (letsTalkBtn) letsTalkBtn.classList.add('hidden');
                
                // Adiciona delay escalonado para animação de entrada
                const items = vocabContent.querySelectorAll('.audio-item');
                items.forEach((item, index) => {
                    // Reinicia a animação de forma robusta para mobile
                    item.style.animation = 'none';
                    item.offsetHeight; /* trigger reflow */
                    item.style.animation = `popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.05}s backwards`;
                });
            }
        });
    }

    // Lógica do botão "To Ask" (Próxima Lição) - Igual ao Vocabulário
    const toggleToAskBtn = document.getElementById('toggle-to-ask-btn');
    const toAskContent = document.getElementById('to-ask-content');

    if (toggleToAskBtn && toAskContent) {
        toggleToAskBtn.addEventListener('click', () => {
            toAskContent.classList.toggle('hidden');
            
            if (toAskContent.classList.contains('hidden')) {
                toggleToAskBtn.textContent = '📖 Abrir Perguntas';
                
                // Reseta a visualização do vocabulário PT ao fechar (Igual à Lição 1)
                const toAskPtContent = document.getElementById('to-ask-pt-content');
                const toAskContinueBtn = document.getElementById('to-ask-continue-btn');
                if (toAskPtContent) toAskPtContent.classList.add('hidden');
                if (toAskContinueBtn) toAskContinueBtn.style.display = '';
            } else {
                toggleToAskBtn.textContent = '📖 Fechar Perguntas';
                // Animação de entrada
                const items = toAskContent.querySelectorAll('.audio-item');
                items.forEach((item, index) => {
                    item.style.animation = 'none';
                    item.offsetHeight; /* trigger reflow */
                    item.style.animation = `popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.05}s backwards`;
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
    const stepNextLesson = document.getElementById('step-next-lesson');
    const stepTalkLesson2 = document.getElementById('step-talk-lesson2');
    const letsTalkBtn = document.getElementById('lets-talk-btn');
    const letsReadBtn = document.getElementById('lets-read-btn');
    const letsListenBtn = document.getElementById('lets-listen-btn');
    const letsListenIntroBtn = document.getElementById('lets-listen-intro-btn');
    const container = document.querySelector('.container');

    // Elementos do Video Quiz (Definidos aqui para acesso global no script)
    const videoPlayer = document.getElementById('video-quiz-player');

    // Lógica do Atalho para Lição 2 na Introdução
    const shortcutLesson2Btn = document.getElementById('shortcut-lesson2-btn');
    if (shortcutLesson2Btn && step2 && stepNextLesson) {
        shortcutLesson2Btn.addEventListener('click', () => {
            step2.classList.add('hidden');
            stepNextLesson.classList.remove('hidden');
            
            if (nextBtn) nextBtn.style.display = 'none';
            if (prevBtn) prevBtn.classList.remove('disabled');
        });
    }

    // Lógica do botão Voltar ao Início (na Lição 2)
    const backToStartBtn = document.getElementById('back-to-start-btn');
    if (backToStartBtn && step2 && stepNextLesson) {
        backToStartBtn.addEventListener('click', () => {
            stepNextLesson.classList.add('hidden');
            step2.classList.remove('hidden');
            
            // Reseta a navegação inferior
            if (prevBtn) prevBtn.classList.remove('disabled');
            if (nextBtn) {
                nextBtn.style.display = 'none';
            }

            // Aplica estilos visuais da Introdução
            if (container) container.classList.add('transparent');
            document.body.classList.add('white-bg');
            
            // Rola a página para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (nextBtn && step1 && step2) {
        nextBtn.addEventListener('click', () => {
            // Se estiver no Passo 1 (Greetings), vai para o Passo 2 (Introdução)
            if (!step1.classList.contains('hidden')) {
                step1.classList.add('hidden');
                step2.classList.remove('hidden');
                
                if (prevBtn) prevBtn.classList.remove('disabled');

                if (container) container.classList.add('transparent');
                document.body.classList.add('white-bg');
                if (nextBtn) nextBtn.style.display = 'none'; // Oculta o botão Próximo ao entrar na Introdução
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

    // Lógica do botão Continuar dentro do Vocabulário
    const vocabContinueBtn = document.getElementById('vocab-continue-btn');
    if (vocabContinueBtn) {
        vocabContinueBtn.addEventListener('click', () => {
            // Revela a seção de Português -> Inglês
            const vocabPtContent = document.getElementById('vocab-pt-content');
            if (vocabPtContent) {
                vocabPtContent.classList.remove('hidden');
                vocabContinueBtn.style.display = 'none'; // Oculta o botão para dar fluidez
                
                // Animação de entrada
                const items = vocabPtContent.querySelectorAll('.audio-item');
                items.forEach((item, index) => {
                    // Reinicia a animação de forma robusta para mobile
                    item.style.animation = 'none';
                    item.offsetHeight; /* trigger reflow */
                    item.style.animation = `popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.05}s backwards`;
                });
                
                // Pequeno delay para garantir que o layout atualizou antes de rolar (fix para mobile)
                setTimeout(() => {
                    vocabPtContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        });
    }

    // Lógica do botão Continuar dentro do Vocabulário PT
    const vocabPtContinueBtn = document.getElementById('vocab-pt-continue-btn');
    if (vocabPtContinueBtn) {
        vocabPtContinueBtn.addEventListener('click', () => {
            // Navega para o Let's Talk (Passo 3)
            if (step2 && stepTalk) {
                step2.classList.add('hidden');
                stepTalk.classList.remove('hidden');
                if (prevBtn) prevBtn.classList.remove('disabled');
                if (nextBtn) nextBtn.style.display = 'none';
                if (container) container.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Lógica do botão Continuar dentro do To Ask (Lição 2)
    const toAskContinueBtn = document.getElementById('to-ask-continue-btn');
    if (toAskContinueBtn) {
        toAskContinueBtn.addEventListener('click', () => {
            // Revela a seção de Português -> Inglês da Lição 2
            const toAskPtContent = document.getElementById('to-ask-pt-content');
            if (toAskPtContent) {
                toAskPtContent.classList.remove('hidden');
                toAskContinueBtn.style.display = 'none'; // Oculta o botão
                
                // Animação de entrada
                const items = toAskPtContent.querySelectorAll('.audio-item');
                items.forEach((item, index) => {
                    item.style.animation = 'none';
                    item.offsetHeight; /* trigger reflow */
                    item.style.animation = `popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.05}s backwards`;
                });
                
                // Scroll suave
                setTimeout(() => {
                    toAskPtContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }
        });
    }

    // Lógica do botão Continuar (Final do Vocabulário Lição 2) -> Vai para Let's Talk Lesson 2
    const toAskPtContinueBtn = document.getElementById('to-ask-pt-continue-btn');
    if (toAskPtContinueBtn) {
        toAskPtContinueBtn.addEventListener('click', () => {
            if (stepNextLesson && stepTalkLesson2) {
                stepNextLesson.classList.add('hidden');
                stepTalkLesson2.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // Lógica do botão Finalizar Módulo (no final do Let's Talk Lesson 2)
    const finishModuleBtn = document.getElementById('finish-module-btn');
    if (finishModuleBtn) {
        finishModuleBtn.addEventListener('click', () => {
            alert("Parabéns! Você concluiu todo o Módulo 1 com sucesso! 🏆");
        });
    }

    // Lógica do botão Voltar ao Início (no Let's Talk Lesson 2)
    const backToStartLesson2Btn = document.getElementById('back-to-start-lesson2-btn');
    if (backToStartLesson2Btn && step2 && stepTalkLesson2) {
        backToStartLesson2Btn.addEventListener('click', () => {
            stepTalkLesson2.classList.add('hidden');
            step2.classList.remove('hidden');
            
            if (prevBtn) prevBtn.classList.remove('disabled');
            if (nextBtn) nextBtn.style.display = 'none';
            if (container) container.classList.add('transparent');
            document.body.classList.add('white-bg');
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // Lógica do botão Video Quiz (Let's Listen) no final do Let's Talk
    if (letsListenBtn && stepListening && stepTalk) {
        letsListenBtn.addEventListener('click', () => {
            stepTalk.classList.add('hidden');
            stepListening.classList.remove('hidden');
            if (nextBtn) nextBtn.style.display = 'none';
            if (container) container.scrollIntoView({ behavior: 'smooth' });
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
            // Para qualquer áudio tocando ao voltar (reset geral de áudio)
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                const oldBar = document.querySelector('.audio-progress-bar');
                if (oldBar) oldBar.remove();
                document.querySelectorAll('.text-highlight').forEach(el => el.classList.remove('text-highlight'));
                currentAudio = null;
            }

            // Se estiver na Próxima Lição (Passo 5), volta para o Listening (Passo 4)
            if (stepNextLesson && !stepNextLesson.classList.contains('hidden')) {
                stepNextLesson.classList.add('hidden');
                stepListening.classList.remove('hidden');
                if (nextBtn) nextBtn.style.display = 'none';
                return;
            }

            // Se estiver no Step Listening, volta para o Step Talk
            if (stepListening && !stepListening.classList.contains('hidden')) {
                // Reseta o estado do Quiz (Vídeo, Pontuação, Perguntas)
                if (videoPlayer) {
                    videoPlayer.pause();
                    videoPlayer.currentTime = 0;
                }
                currentQuizData = part1Data;
                currentVideoQuizIndex = 0;
                score = 0;
                questionShown = false;
                currentSceneStartTime = 0;
                loadVideoQuestion(0);

                stepListening.classList.add('hidden');
                stepTalk.classList.remove('hidden');
                if (nextBtn) nextBtn.style.display = 'none';
                return;
            }

            // Se estiver no Step Read, volta para o Step Talk
            if (stepRead && !stepRead.classList.contains('hidden')) {
                stepRead.classList.add('hidden');
                stepTalk.classList.remove('hidden');
                if (nextBtn) nextBtn.style.display = 'none';
                return;
            }

            // Se estiver no Step Talk, volta para o Step 2
            if (stepTalk && !stepTalk.classList.contains('hidden')) {
                stepTalk.classList.add('hidden');
                step2.classList.remove('hidden');
                if (nextBtn) nextBtn.style.display = 'none'; // Mantém oculto pois a navegação é interna
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

                    // Reseta a visualização do vocabulário PT ao fechar pelo botão Voltar
                    const vocabPtContent = document.getElementById('vocab-pt-content');
                    const vocabContinueBtn = document.getElementById('vocab-continue-btn');
                    if (vocabPtContent) vocabPtContent.classList.add('hidden');
                    if (vocabContinueBtn) vocabContinueBtn.style.display = '';

                    return;
                }

                step2.classList.add('hidden');
                step1.classList.remove('hidden');
                
                prevBtn.classList.add('disabled');
                if (nextBtn) {
                    nextBtn.classList.remove('disabled');
                    nextBtn.style.display = 'inline-block'; // Garante que o botão apareça ao voltar para o Passo 1
                }
    
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
            const container = btn.closest('.audio-item') || btn.closest('.chat-bubble') || btn.closest('.reading-card') || btn.closest('.quiz-card') || btn.closest('.full-audio-card');
            
            // Define a velocidade: lenta (0.5) para botões individuais, normal (1) para a conversa completa
            let speed = 0.5;
            if (btn.closest('.full-audio-card')) {
                speed = 1;
            }
            
            playAudioWithProgress(audioPath, container, speed);
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
    const part1Data = [
        {
            video: "Listening and choose/videoplayback.mp4",
            stopTime: 6.5, // Pausa aos 5 segundos
            question: "1. Qual cumprimento foi o primeiro usado no vídeo?",
            options: [
                { text: "Good Night", correct: false },
                { text: "Hello / Hi", correct: false },
                { text: "Goodbye", correct: false },
                { text: "Good Morning", correct: true }
            ]
        },
        {
            video: "Listening and choose/videoplayback.mp4",
            stopTime: 16, // Pausa aos 12 segundos
            question: "2. Como a professora (Teacher) respondeu?",
            options: [
                { text: "I am sad", correct: false },
                { text: "I'm fine", correct: true },
                { text: "See ya", correct: false },
                { text: "Good morning", correct: false }
            ]
        },
        {
            video: "Listening and choose/videoplayback.mp4",
            stopTime: 28, // Pausa aos 18 segundos
            question: "3. Qual era o nome da aluna nova?",
            options: [
                { text: "Katherine", correct: false },
                { text: "Susy", correct: false },
                { text: "Katia", correct: false },
                { text: "Kate", correct: true }
            ]
        },
        {
            video: "Listening and choose/videoplayback.mp4",
            stopTime: 40, // Pausa aos 24 segundos
            question: "4. Qual seria a pergunta formulada para que Kate pudesse declarar o seu nome?",
            options: [
                { text: "Where have you been?", correct: false },
                { text: "What is your name?", correct: true },
                { text: "How old are you?", correct: false },
                { text: "Where are you going?", correct: false }
            ]
        },
        {
            video: "Listening and choose/videoplayback.mp4",
            stopTime: 41, // Pausa aos 30 segundos
            question: "5. Como a conversação terminou?",
            options: [
                { text: "I'm great you", correct: false },
                { text: "Thank you", correct: true },
                { text: "Hello", correct: false },
                { text: "Please", correct: false }
            ]
        }
    ];

    const part2Data = [
        {
            video: "Listening and choose/Interpretação greetins.mp4", // Coloque o caminho do novo vídeo aqui
            stopTime: 15, // Pausa para a 1ª pergunta
            question: "1. Qual a primeira (Firt) personagem apresentada no vídeo?",
            options: [
                { text: "Girl", correct: true },
                { text: "Boy", correct: false },
                { text: "Woman", correct: false },
                { text: "Women", correct: false }
            ]
        },
        {
            video: "Listening and choose/Interpretação greetins.mp4",
            stopTime: 33, // Pausa para a 2ª pergunta
            question: "2. Qual foi a reação do segundo (Second) personagem?",
            options: [
                { text: "Good", correct: false },
                { text: "Great", correct: false },
                { text: "Happy", correct: true },
                { text: "Lazy", correct: false }
            ]
        },
        {
            video: "Listening and choose/Interpretação greetins.mp4",
            stopTime: 46, // Pausa para a 3ª pergunta
            question: "3. O que respondeu o terceiro (Third) personagem na primeira pergunta?",
            options: [
                { text: "I'm good", correct: false },
                { text: "I'm god", correct: false },
                { text: "I'm bad", correct: false },
                { text: "I'm not good", correct: true }
            ]
        },
        {
            video: "Listening and choose/Interpretação greetins.mp4",
            stopTime: 85, // Pausa para a 4ª pergunta (final)
            question: "4. Why the Lion is crying?",
            options: [
                { text: "He has fear of the rabbit", correct: true },
                { text: "He was not happy", correct: false },
                { text: "He was boried", correct: false },
                { text: "He is good", correct: false }
            ]
        }
    ];

    let currentQuizData = part1Data; // Começa com a Parte 1
    let currentVideoQuizIndex = 0;
    let score = 0;
    let questionShown = false; // Controle para pausar apenas uma vez por pergunta
    let currentSceneStartTime = 0; // Armazena o tempo de início da cena atual

    const videoSource = document.getElementById('video-quiz-source');
    const questionTitle = document.getElementById('video-quiz-question');
    const optionsContainer = document.getElementById('video-quiz-options');
    const feedbackMsg = document.getElementById('video-quiz-feedback');
    const nextQuestionBtn = document.getElementById('video-quiz-next-btn');
    const scoreDisplay = document.getElementById('video-quiz-score');
    const videoOverlay = document.getElementById('video-start-overlay');
    const quizCard = document.querySelector('.quiz-card');
    const skipToPart2Btn = document.getElementById('skip-to-part2-btn');
    const skipInterpretationBtn = document.getElementById('skip-interpretation-btn');

    function updateScoreDisplay() {
        if (scoreDisplay) {
            scoreDisplay.textContent = `Acertos: ${score}/${part1Data.length + part2Data.length}`;
        }
    }

    function showQuestionUI(data) {
        // Habilita a interação com o card
        if (quizCard) {
            quizCard.style.opacity = '1';
            quizCard.style.pointerEvents = 'auto';
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
                        feedbackMsg.textContent = "❌ Errado! Assista novamente...";
                        feedbackMsg.style.color = "#ef4444";
                        
                        // Diminui a pontuação ao errar (sem deixar ficar negativa)
                        if (score > 0) score--;
                        updateScoreDisplay();

                        // Bloqueia todas as opções para o usuário não clicar em mais nada
                        allOptions.forEach(b => b.disabled = true);

                        // Aguarda 1.5 segundos e reinicia o trecho do vídeo
                        setTimeout(() => {
                            if (quizCard) {
                                quizCard.style.opacity = '0.6';
                                quizCard.style.pointerEvents = 'none';
                            }
                            videoPlayer.currentTime = currentSceneStartTime;
                            videoPlayer.play();
                            questionShown = false; // Permite que a pergunta apareça novamente ao final do trecho
                            if (videoOverlay) videoOverlay.classList.add('hidden');
                        }, 1500);
                    }
                });

                optionsContainer.appendChild(btn);
            });
        }
    }

    function loadVideoQuestion(index) {
        if (index === 0 && currentQuizData === part1Data) score = 0; // Reseta a pontuação ao iniciar apenas a parte 1

        // Controla a visibilidade do botão de pular (esconde se já estiver na parte 2)
        if (skipToPart2Btn) {
            // Mostra durante toda a Parte 1 (enquanto houver perguntas)
            skipToPart2Btn.style.display = (currentQuizData === part1Data && index < currentQuizData.length) ? 'block' : 'none';
        }

        // Controla a visibilidade do botão de pular Interpretação (Parte 2)
        if (skipInterpretationBtn) {
            // Mostra durante a Parte 2
            skipInterpretationBtn.style.display = (currentQuizData === part2Data && index < currentQuizData.length) ? 'block' : 'none';
        }

        if (index >= currentQuizData.length) {
            // Se acabou a Parte 1, oferece a transição para a Parte 2
            if (currentQuizData === part1Data) {
                if (questionTitle) questionTitle.textContent = "Parte 1 concluída! Vamos para a Interpretação?";
                if (optionsContainer) {
                    optionsContainer.innerHTML = '';
                    const nextPartBtn = document.createElement('button');
                    nextPartBtn.className = 'action-btn';
                    nextPartBtn.textContent = 'Ir para Interpretação 🎬';
                    nextPartBtn.style.backgroundColor = '#9C27B0';
                    nextPartBtn.onclick = () => {
                        currentQuizData = part2Data;
                        currentVideoQuizIndex = 0;
                        loadVideoQuestion(0);
                    };
                    optionsContainer.appendChild(nextPartBtn);
                }
                if (feedbackMsg) feedbackMsg.textContent = `Pontuação parcial: ${score}`;
                if (nextQuestionBtn) nextQuestionBtn.classList.add('hidden');
                if (quizCard) {
                    quizCard.style.opacity = '1';
                    quizCard.style.pointerEvents = 'auto';
                }
                return;
            }

            // Se acabou a Parte 2 (Fim total)
            if (questionTitle) questionTitle.textContent = `Parabéns! Você completou todo o módulo. Pontuação final: ${score}/${part1Data.length + part2Data.length}`;
            if (optionsContainer) {
                optionsContainer.innerHTML = '';
                
                // Cria o botão para ir para a Próxima Lição
                const nextLessonBtn = document.createElement('button');
                nextLessonBtn.className = 'action-btn';
                nextLessonBtn.textContent = 'Próxima Lição ➡';
                nextLessonBtn.style.marginTop = '20px';
                nextLessonBtn.onclick = () => {
                    stepListening.classList.add('hidden');
                    stepNextLesson.classList.remove('hidden');
                };
                optionsContainer.appendChild(nextLessonBtn);
            }
            if (feedbackMsg) feedbackMsg.textContent = '';
            if (nextQuestionBtn) nextQuestionBtn.style.display = 'none';
            // Garante que o card fique visível no final
            if (quizCard) {
                quizCard.style.opacity = '1';
                quizCard.style.pointerEvents = 'auto';
            }
            return;
        }

        const data = currentQuizData[index];
        questionShown = false; // Reseta para permitir nova pausa
        
        // Define o tempo de início: 0 para a primeira, ou o stopTime da anterior para as próximas
        if (index === 0) {
            currentSceneStartTime = 0;
        } else {
            currentSceneStartTime = currentQuizData[index - 1].stopTime;
        }
        
        updateScoreDisplay();
        
        if (videoSource && videoPlayer) {
            const currentSrc = videoSource.getAttribute('src');
            if (currentSrc !== data.video) {
                videoSource.src = data.video;
                videoPlayer.load();
                // Se não for a primeira pergunta, tenta tocar automaticamente
                if (index > 0) videoPlayer.play().catch(() => {});
            } else {
                // Se for o mesmo vídeo
                if (index > 0) {
                    videoPlayer.play().catch(() => {});
                } else {
                    // Se for a primeira (reset), garante que para
                    videoPlayer.pause();
                    videoPlayer.currentTime = 0;
                }
            }
        }

        // Garante que o overlay de Replay suma ao avançar para a próxima pergunta
        if (videoOverlay) {
            if (index === 0) {
                videoOverlay.classList.remove('hidden');
                const btn = videoOverlay.querySelector('.big-play-btn');
                if (btn) btn.textContent = '▶';
            } else {
                // Se não for a primeira, esconde o overlay para o vídeo tocar
                videoOverlay.classList.add('hidden');
            }
        }

        // Deixa o card "desativado" visualmente enquanto o vídeo toca
        if (quizCard) {
            quizCard.style.opacity = '0.6';
            quizCard.style.pointerEvents = 'none';
        }
        if (questionTitle) questionTitle.textContent = `Assista ao vídeo... (Pergunta ${index + 1})`;
        if (optionsContainer) optionsContainer.innerHTML = '';
        if (feedbackMsg) feedbackMsg.textContent = '';
        if (nextQuestionBtn) nextQuestionBtn.classList.add('hidden');
    }

    // Monitora o tempo do vídeo
    if (videoPlayer) {
        videoPlayer.addEventListener('timeupdate', () => {
            if (currentVideoQuizIndex >= currentQuizData.length) return;

            const data = currentQuizData[currentVideoQuizIndex];
            
            // Se atingiu o tempo e a pergunta ainda não foi mostrada
            if (!questionShown && videoPlayer.currentTime >= data.stopTime) {
                videoPlayer.pause();
                questionShown = true;
                showQuestionUI(data);
                // Mostra o overlay com ícone de Replay
                if (videoOverlay) {
                    videoOverlay.classList.remove('hidden');
                    const btn = videoOverlay.querySelector('.big-play-btn');
                    if (btn) btn.textContent = '🔄';
                }
            }
        });
    }

    // Lógica do Botão de Play Grande (Overlay)
    if (videoOverlay && videoPlayer) {
        videoOverlay.addEventListener('click', () => {
            videoPlayer.currentTime = currentSceneStartTime; // Garante que volta ao início da cena (Replay)
            videoPlayer.play();
            questionShown = false; // Permite que pause novamente no final
            videoOverlay.classList.add('hidden');
        });
    }

    // Botão Próxima Pergunta
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', () => {
            currentVideoQuizIndex++;
            loadVideoQuestion(currentVideoQuizIndex);
        });
    }

    // Botão para pular para a Parte 2 (Interpretação)
    if (skipToPart2Btn) {
        skipToPart2Btn.addEventListener('click', () => {
            const confirmSkip = confirm("Tem certeza que deseja pular para a Interpretação? Seu progresso atual na Parte 1 será perdido.");
            
            if (confirmSkip) {
                currentQuizData = part2Data;
                currentVideoQuizIndex = 0;
                loadVideoQuestion(0);
            }
        });
    }

    // Botão para pular a Interpretação (Parte 2) e finalizar
    if (skipInterpretationBtn) {
        skipInterpretationBtn.addEventListener('click', () => {
            const confirmSkip = confirm("Tem certeza que deseja pular a Interpretação? O quiz será finalizado.");
            
            if (confirmSkip) {
                currentVideoQuizIndex = currentQuizData.length; // Força o índice para o final
                loadVideoQuestion(currentVideoQuizIndex); // Carrega a tela final
            }
        });
    }

    // --- Lógica de Reconhecimento de Voz (Pronúncia) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // Define o idioma para Inglês
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        const micButtons = document.querySelectorAll('.mic-btn');

        micButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita clicar no balão
                
                // Se já estiver ouvindo, para
                if (btn.classList.contains('listening')) {
                    recognition.stop();
                    return;
                }

                const targetText = btn.getAttribute('data-text').toLowerCase();
                const bubble = btn.closest('.chat-row').querySelector('.chat-bubble');
                
                // Remove feedback anterior
                const oldFeedback = bubble.querySelector('.voice-feedback');
                if (oldFeedback) oldFeedback.remove();

                // Cria elemento de feedback
                const feedback = document.createElement('div');
                feedback.classList.add('voice-feedback');
                feedback.textContent = "Ouvindo... 👂";
                feedback.style.color = "#666";
                bubble.appendChild(feedback);

                // Ativa visual do botão
                btn.classList.add('listening');

                recognition.start();

                recognition.onresult = (event) => {
                    const spokenText = event.results[0][0].transcript.toLowerCase();
                    const confidence = event.results[0][0].confidence;

                    // Lógica de comparação simples (remove pontuação para facilitar)
                    const cleanSpoken = spokenText.replace(/[^a-z0-9 ]/g, '');
                    const cleanTarget = targetText.replace(/[^a-z0-9 ]/g, '');

                    // Verifica se a frase dita contém a frase alvo ou é muito parecida
                    if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
                        feedback.textContent = `✅ Excellent! ("${spokenText}")`;
                        feedback.style.color = "#10b981"; // Verde
                    } else {
                        feedback.textContent = `❌ Tente de novo. Ouvi: "${spokenText}"`;
                        feedback.style.color = "#ef4444"; // Vermelho
                    }
                    
                    btn.classList.remove('listening');
                };

                recognition.onerror = (event) => {
                    feedback.textContent = "Erro no microfone ou permissão negada.";
                    feedback.style.color = "#ef4444";
                    btn.classList.remove('listening');
                };

                recognition.onend = () => {
                    btn.classList.remove('listening');
                };
            });
        });
    } else {
        console.log("Seu navegador não suporta reconhecimento de voz.");
    }

    // Inicializa o quiz carregando a primeira pergunta
    loadVideoQuestion(0);
});
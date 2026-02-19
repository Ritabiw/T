document.addEventListener('DOMContentLoaded', () => {
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
            
            // Atualiza o texto do botão conforme o estado
            if (vocabContent.classList.contains('hidden')) {
                toggleVocabBtn.textContent = '📖 Abrir Vocabulário';
            } else {
                toggleVocabBtn.textContent = '📖 Fechar Vocabulário';
                
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
    const letsTalkBtn = document.getElementById('lets-talk-btn');
    const container = document.querySelector('.container');

    if (nextBtn && step1 && step2) {
        nextBtn.addEventListener('click', () => {
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
            
            nextBtn.classList.add('disabled');
            if (prevBtn) prevBtn.classList.remove('disabled');

            if (container) container.classList.add('transparent');
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

    if (prevBtn && step1 && step2) {
        prevBtn.addEventListener('click', () => {
            // Se estiver no Step Talk, volta para o Step 2
            if (stepTalk && !stepTalk.classList.contains('hidden')) {
                stepTalk.classList.add('hidden');
                step2.classList.remove('hidden');
                if (nextBtn) nextBtn.style.display = 'inline-block'; // Mostra o botão Próximo de volta
                return;
            }

            // Se estiver no Step 2, volta para o Step 1
            if (!step2.classList.contains('hidden')) {
                step2.classList.add('hidden');
                step1.classList.remove('hidden');
                
                prevBtn.classList.add('disabled');
                if (nextBtn) nextBtn.classList.remove('disabled');
    
                if (container) container.classList.remove('transparent');

                // Fecha o vocabulário automaticamente ao sair da seção (voltar)
                if (vocabContent && !vocabContent.classList.contains('hidden')) {
                    vocabContent.classList.add('hidden');
                    if (toggleVocabBtn) {
                        toggleVocabBtn.textContent = '📖 Abrir Vocabulário';
                    }
                }
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
            if (audioPath) {
                const audio = new Audio(audioPath);
                audio.play().catch(error => console.error("Erro ao reproduzir áudio:", error));
            } else {
                console.log('Nenhum caminho de áudio definido para este botão.');
            }
        });
    });
});
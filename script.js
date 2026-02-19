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
            }
        });
    }

    // Lógica de Navegação (Passo 1 <-> Passo 2)
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
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

    if (prevBtn && step1 && step2) {
        prevBtn.addEventListener('click', () => {
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
        });
    }
});
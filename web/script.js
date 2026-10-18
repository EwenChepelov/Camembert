// Camembert - Jeu de plateau en ligne pour 8 joueurs
// ================================================

// Configuration du jeu
const CONFIG = {
    MAX_PLAYERS: 8,
    QUESTION_TIME: 30, // secondes par question
    TOTAL_QUESTIONS: 20, // nombre de questions par partie
    MIN_PLAYERS_TO_START: 2
};

// État du jeu
let gameState = {
    players: [],
    currentQuestion: null,
    currentQuestionIndex: 0,
    scores: {},
    answers: {},
    isStarted: false,
    isQuestionActive: false,
    timer: null,
    host: null
};

// Récupérer ou générer un ID unique pour le joueur
function getPlayerId() {
    let playerId = localStorage.getItem('camembertPlayerId');
    if (!playerId) {
        playerId = 'player-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('camembertPlayerId', playerId);
    }
    return playerId;
}

// Générer une couleur aléatoire pour un joueur
function getRandomColor() {
    const colors = [
        '#FF5733', '#33FF57', '#3357FF', '#F3FF33',
        '#FF33F3', '#33FFF3', '#8A2BE2', '#FF8C00'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Générer un avatar pour un joueur
function getAvatar(letter) {
    return letter.toUpperCase();
}

// Afficher une notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification ' + type;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Mettre à jour l'affichage des joueurs
function updatePlayersDisplay() {
    const playersList = document.getElementById('players-list');
    const playerCount = document.getElementById('player-count');
    
    playersList.innerHTML = '';
    playerCount.textContent = gameState.players.length;
    
    gameState.players.forEach(player => {
        const badge = document.createElement('div');
        badge.className = 'player-badge';
        badge.innerHTML = `
            <span class="avatar" style="background: ${player.color}">${getAvatar(player.name[0])}</span>
            <span>${player.name}</span>
            ${player.isHost ? '<span>👑</span>' : ''}
        `;
        playersList.appendChild(badge);
    });
    
    // Mettre à jour le bouton Commencer
    const startBtn = document.getElementById('start-game-btn');
    if (gameState.host && gameState.players.length >= CONFIG.MIN_PLAYERS_TO_START && !gameState.isStarted) {
        startBtn.classList.remove('hidden');
    } else {
        startBtn.classList.add('hidden');
    }
}

// Mettre à jour le classement
function updateScoreboard() {
    const scoreboard = document.getElementById('scoreboard');
    const ol = scoreboard.querySelector('ol');
    
    // Trier les joueurs par score
    const sortedPlayers = gameState.players.map(p => ({
        ...p,
        score: gameState.scores[p.id] || 0
    })).sort((a, b) => b.score - a.score);
    
    ol.innerHTML = '';
    sortedPlayers.forEach((player, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="rank">${index + 1}</span>
            <span>${player.name}</span>
            <span class="score">${player.score} pts</span>
        `;
        ol.appendChild(li);
    });
}

// Afficher une question
function displayQuestion() {
    if (gameState.currentQuestionIndex >= Math.min(CONFIG.TOTAL_QUESTIONS, QUESTIONS.length)) {
        endGame();
        return;
    }
    
    gameState.currentQuestion = QUESTIONS[gameState.currentQuestionIndex];
    const questionContainer = document.getElementById('question-container');
    const questionText = document.getElementById('question-text');
    const questionNumber = document.getElementById('question-number');
    const totalQuestions = document.getElementById('total-questions');
    const category = document.getElementById('category');
    const answersContainer = document.getElementById('answers');
    
    questionText.textContent = gameState.currentQuestion.question;
    questionNumber.textContent = gameState.currentQuestionIndex + 1;
    totalQuestions.textContent = Math.min(CONFIG.TOTAL_QUESTIONS, QUESTIONS.length);
    category.textContent = gameState.currentQuestion.category;
    
    answersContainer.innerHTML = '';
    gameState.currentQuestion.answers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer.text;
        btn.dataset.index = index;
        btn.addEventListener('click', () => selectAnswer(index));
        answersContainer.appendChild(btn);
    });
    
    // Afficher le timer
    startTimer();
    
    // Afficher les écrans appropriés
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    questionContainer.classList.remove('hidden');
}

// Sélectionner une réponse
function selectAnswer(answerIndex) {
    if (!gameState.isQuestionActive || !gameState.currentQuestion) return;
    
    const playerId = getPlayerId();
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;
    
    // Désactiver les boutons
    gameState.isQuestionActive = false;
    clearInterval(gameState.timer);
    
    const answersContainer = document.getElementById('answers');
    const buttons = answersContainer.querySelectorAll('.answer-btn');
    
    // Marquer la réponse sélectionnée
    buttons[answerIndex].classList.add('selected');
    
    // Vérifier si c'est la bonne réponse
    const isCorrect = gameState.currentQuestion.answers[answerIndex].correct;
    
    // Mettre à jour le score
    if (isCorrect) {
        gameState.scores[playerId] = (gameState.scores[playerId] || 0) + 10;
        buttons[answerIndex].classList.add('correct');
        showNotification('✅ Bonne réponse ! +10 points', 'success');
    } else {
        buttons[answerIndex].classList.add('incorrect');
        showNotification('❌ Mauvaise réponse', 'error');
    }
    
    // Marquer la bonne réponse
    const correctIndex = gameState.currentQuestion.answers.findIndex(a => a.correct);
    if (correctIndex !== answerIndex) {
        buttons[correctIndex].classList.add('correct');
    }
    
    // Afficher les résultats après un délai
    setTimeout(() => {
        showResults();
    }, 2000);
}

// Démarrer le timer
function startTimer() {
    gameState.isQuestionActive = true;
    let timeLeft = CONFIG.QUESTION_TIME;
    const timerElement = document.getElementById('timer');
    
    timerElement.textContent = timeLeft;
    timerElement.classList.add('running');
    
    gameState.timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(gameState.timer);
            timerElement.classList.remove('running');
            gameState.isQuestionActive = false;
            showNotification('⏰ Temps écoulé !', 'error');
            showResults();
        }
    }, 1000);
}

// Afficher les résultats
function showResults() {
    const resultsContainer = document.getElementById('results');
    const nextBtn = document.getElementById('next-question-btn');
    
    resultsContainer.innerHTML = '';
    
    // Trier les joueurs par score pour cette question
    const sortedPlayers = gameState.players.map(p => ({
        ...p,
        score: gameState.scores[p.id] || 0,
        answeredCorrectly: gameState.answers[p.id] === true
    })).sort((a, b) => {
        if (a.answeredCorrectly && !b.answeredCorrectly) return -1;
        if (!a.answeredCorrectly && b.answeredCorrectly) return 1;
        return b.score - a.score;
    });
    
    sortedPlayers.forEach(player => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="player-info">
                <span class="avatar" style="background: ${player.color}">${getAvatar(player.name[0])}</span>
                <span>${player.name}</span>
            </div>
            <span class="score">${player.score} pts</span>
        `;
        resultsContainer.appendChild(resultItem);
    });
    
    // Afficher les écrans
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    nextBtn.classList.remove('hidden');
    
    // Réinitialiser pour la prochaine question
    gameState.answers = {};
}

// Passer à la question suivante
function nextQuestion() {
    gameState.currentQuestionIndex++;
    
    // Réinitialiser le timer
    const timerElement = document.getElementById('timer');
    timerElement.classList.remove('running');
    
    if (gameState.currentQuestionIndex < Math.min(CONFIG.TOTAL_QUESTIONS, QUESTIONS.length)) {
        displayQuestion();
        document.getElementById('next-question-btn').classList.add('hidden');
    } else {
        endGame();
    }
}

// Terminer la partie
function endGame() {
    clearInterval(gameState.timer);
    
    const questionContainer = document.getElementById('question-container');
    const resultsContainer = document.getElementById('results');
    const nextBtn = document.getElementById('next-question-btn');
    
    questionContainer.classList.add('hidden');
    nextBtn.classList.add('hidden');
    
    // Afficher le classement final
    const sortedPlayers = gameState.players.map(p => ({
        ...p,
        score: gameState.scores[p.id] || 0
    })).sort((a, b) => b.score - a.score);
    
    resultsContainer.innerHTML = '<h2>🏆 Classement Final</h2>';
    
    sortedPlayers.forEach((player, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="player-info">
                <span style="font-weight: bold; margin-right: 10px;">#${index + 1}</span>
                <span class="avatar" style="background: ${player.color}">${getAvatar(player.name[0])}</span>
                <span>${player.name}</span>
            </div>
            <span class="score">${player.score} pts</span>
        `;
        resultsContainer.appendChild(resultItem);
    });
    
    document.getElementById('results-screen').classList.remove('hidden');
    
    // Réinitialiser le jeu
    gameState.isStarted = false;
    gameState.currentQuestionIndex = 0;
    gameState.scores = {};
}

// Rejoindre la partie
function joinGame() {
    const nameInput = document.getElementById('player-name');
    const playerName = nameInput.value.trim();
    
    if (!playerName) {
        showNotification('Veuillez entrer un pseudo', 'error');
        return;
    }
    
    const playerId = getPlayerId();
    const playerExists = gameState.players.some(p => p.id === playerId);
    
    if (playerExists) {
        showNotification('Vous êtes déjà dans la partie !', 'error');
        return;
    }
    
    const newPlayer = {
        id: playerId,
        name: playerName,
        color: getRandomColor(),
        isHost: gameState.players.length === 0
    };
    
    gameState.players.push(newPlayer);
    gameState.scores[playerId] = 0;
    
    if (newPlayer.isHost) {
        gameState.host = playerId;
    }
    
    // Masquer le formulaire
    document.getElementById('join-form').style.display = 'none';
    document.getElementById('waiting-message').textContent = 'En attente des autres joueurs...';
    
    updatePlayersDisplay();
    showNotification(`Bienvenue, ${playerName} !`, 'success');
}

// Commencer la partie
function startGame() {
    if (!gameState.host || gameState.players.length < CONFIG.MIN_PLAYERS_TO_START) {
        showNotification('Il faut au moins 2 joueurs pour commencer', 'error');
        return;
    }
    
    gameState.isStarted = true;
    gameState.currentQuestionIndex = 0;
    gameState.scores = {};
    gameState.players.forEach(p => {
        gameState.scores[p.id] = 0;
    });
    
    document.getElementById('start-screen').classList.add('hidden');
    displayQuestion();
    showNotification('✅ Partie commencé !', 'success');
}

// Quitter la partie
function leaveGame() {
    const playerId = getPlayerId();
    const playerIndex = gameState.players.findIndex(p => p.id === playerId);
    
    if (playerIndex !== -1) {
        gameState.players.splice(playerIndex, 1);
        delete gameState.scores[playerId];
        
        // Si c'était l'hôte, désigner un nouveau host
        if (playerId === gameState.host && gameState.players.length > 0) {
            gameState.host = gameState.players[0].id;
            gameState.players[0].isHost = true;
        }
        
        // Réinitialiser si la partie était en cours
        if (gameState.isStarted && gameState.players.length < CONFIG.MIN_PLAYERS_TO_START) {
            gameState.isStarted = false;
            gameState.currentQuestionIndex = 0;
        }
        
        updatePlayersDisplay();
        
        // Réafficher le formulaire
        document.getElementById('join-form').style.display = 'flex';
        document.getElementById('player-name').value = '';
        document.getElementById('start-screen').classList.remove('hidden');
        document.getElementById('question-container').classList.add('hidden');
        document.getElementById('results-screen').classList.add('hidden');
        
        showNotification('Vous avez quitté la partie', 'info');
    }
}

// Initialisation
function init() {
    // Charger les joueurs depuis le localStorage (pour le test local)
    // Dans une vraie implémentation multi-joueurs, cela viendrait du serveur
    
    // Écouteurs d'événements
    document.getElementById('join-btn').addEventListener('click', joinGame);
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
    document.getElementById('leave-btn').addEventListener('click', leaveGame);
    
    // Permettre de rejoindre avec la touche Entrée
    document.getElementById('player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            joinGame();
        }
    });
    
    // Initialiser l'affichage
    updatePlayersDisplay();
    updateScoreboard();
    
    // Afficher l'écran de démarrage
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
}

// Démarrer quand la page est chargée
document.addEventListener('DOMContentLoaded', init);

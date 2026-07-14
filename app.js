class StakeApp {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.minesGame = null;
        this.blackjackGame = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkSession();
        this.renderUserSection();
    }

    loadUsers() {
        const saved = localStorage.getItem('stakeUsers');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            admin: {
                username: 'admin',
                email: 'admin@stake.com',
                password: 'admin123',
                balance: 10000,
                isAdmin: true,
                createdAt: new Date().toISOString()
            }
        };
    }

    saveUsers() {
        localStorage.setItem('stakeUsers', JSON.stringify(this.users));
    }

    checkSession() {
        const savedUser = localStorage.getItem('stakeCurrentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateBalanceDisplay();
            this.showPage('home');
        } else {
            this.showPage('auth');
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-btn, [data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page) {
                    if (page === 'admin' && (!this.currentUser || !this.currentUser.isAdmin)) {
                        alert('Access denied! Admin only.');
                        return;
                    }
                    if (page !== 'auth' && page !== 'home' && !this.currentUser) {
                        this.showPage('auth');
                        return;
                    }
                    this.showPage(page);
                }
            });
        });

        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                const tabName = e.target.dataset.tab;
                document.getElementById('loginForm').classList.toggle('hidden', tabName !== 'login');
                document.getElementById('registerForm').classList.toggle('hidden', tabName !== 'register');
            });
        });

        document.getElementById('loginBtn').addEventListener('click', () => this.login());
        document.getElementById('registerBtn').addEventListener('click', () => this.register());
        document.getElementById('depositBtn').addEventListener('click', () => this.deposit());

        document.getElementById('minesStart').addEventListener('click', () => this.startMines());
        document.getElementById('minesCashout').addEventListener('click', () => this.cashoutMines());

        document.getElementById('blackjackDeal').addEventListener('click', () => this.startBlackjack());
        document.getElementById('blackjackHit').addEventListener('click', () => this.hitBlackjack());
        document.getElementById('blackjackStand').addEventListener('click', () => this.standBlackjack());

        document.getElementById('slotsSpin').addEventListener('click', () => this.spinSlots());

        document.getElementById('diceRoll').addEventListener('click', () => this.rollDice());

        document.getElementById('coinflipStart').addEventListener('click', () => this.startCoinFlip());
        document.getElementById('rouletteSpin').addEventListener('click', () => this.spinRoulette());
        
        // Admin
        document.getElementById('adminAdjustBalance')?.addEventListener('click', () => this.adminAdjustBalance());
        document.getElementById('adminResetPassword')?.addEventListener('click', () => this.adminResetPassword());
    }

    showPage(pageName) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const page = document.getElementById(pageName + 'Page');
        if (page) {
            page.classList.add('active');
        }
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageName);
        });
        if (pageName === 'admin') {
            this.renderAdminPanel();
        }
    }

    renderUserSection() {
        const userSection = document.getElementById('userSection');
        if (this.currentUser) {
            userSection.innerHTML = `
                <span>${this.currentUser.username}</span>
                <button class="btn btn-primary" data-page="deposit">Deposit</button>
                <button class="btn btn-secondary" id="logoutBtn">Logout</button>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
            document.querySelector('[data-page="deposit"]').addEventListener('click', () => this.showPage('deposit'));
        } else {
            userSection.innerHTML = `
                <button class="btn btn-primary" data-page="auth">Login / Register</button>
            `;
        }
    }

    login() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            alert('Please fill in all fields');
            return;
        }

        const user = this.users[username];
        if (user && user.password === password) {
            this.currentUser = user;
            localStorage.setItem('stakeCurrentUser', JSON.stringify(user));
            this.updateBalanceDisplay();
            this.renderUserSection();
            this.showPage('home');
        } else {
            alert('Invalid username or password');
        }
    }

    register() {
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;

        if (!username || !email || !password) {
            alert('Please fill in all fields');
            return;
        }

        if (this.users[username]) {
            alert('Username already exists');
            return;
        }

        const newUser = {
            username,
            email,
            password,
            balance: 100,
            isAdmin: false,
            createdAt: new Date().toISOString()
        };

        this.users[username] = newUser;
        this.saveUsers();
        this.currentUser = newUser;
        localStorage.setItem('stakeCurrentUser', JSON.stringify(newUser));
        this.updateBalanceDisplay();
        this.renderUserSection();
        this.showPage('home');
        alert('Account created successfully! You received $100 bonus!');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('stakeCurrentUser');
        this.renderUserSection();
        this.updateBalanceDisplay();
        this.showPage('auth');
    }

    deposit() {
        const amount = parseFloat(document.getElementById('depositAmount').value);
        const cardNumber = document.getElementById('cardNumber').value;
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvv = document.getElementById('cardCvv').value;

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!cardNumber || !cardExpiry || !cardCvv) {
            alert('Please fill in all card details');
            return;
        }

        this.currentUser.balance += amount;
        this.users[this.currentUser.username].balance = this.currentUser.balance;
        this.saveUsers();
        localStorage.setItem('stakeCurrentUser', JSON.stringify(this.currentUser));
        this.updateBalanceDisplay();

        document.getElementById('depositAmount').value = '';
        document.getElementById('cardNumber').value = '';
        document.getElementById('cardExpiry').value = '';
        document.getElementById('cardCvv').value = '';

        alert(`Successfully deposited $${amount.toFixed(2)}!`);
        this.showPage('home');
    }

    updateBalanceDisplay() {
        const balanceEl = document.getElementById('balanceAmount');
        if (this.currentUser) {
            balanceEl.textContent = `$${this.currentUser.balance.toFixed(2)}`;
        } else {
            balanceEl.textContent = '$0.00';
        }
    }

    updateBalance(amount) {
        this.currentUser.balance += amount;
        this.users[this.currentUser.username].balance = this.currentUser.balance;
        this.saveUsers();
        localStorage.setItem('stakeCurrentUser', JSON.stringify(this.currentUser));
        this.updateBalanceDisplay();
    }

    startMines() {
        const bet = parseFloat(document.getElementById('minesBet').value);
        const minesCount = parseInt(document.getElementById('minesCount').value);

        if (!bet || bet <= 0) {
            alert('Please enter a valid bet');
            return;
        }

        if (bet > this.currentUser.balance) {
            alert('Insufficient balance');
            return;
        }

        this.updateBalance(-bet);
        this.minesGame = {
            bet,
            minesCount,
            revealed: 0,
            mines: new Set(),
            gems: new Set(),
            grid: [],
            gameOver: false
        };

        const positions = Array.from({ length: 25 }, (_, i) => i);
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        for (let i = 0; i < minesCount; i++) {
            this.minesGame.mines.add(positions[i]);
        }

        for (let i = minesCount; i < 25; i++) {
            this.minesGame.gems.add(positions[i]);
        }

        this.renderMinesGrid();
        document.getElementById('minesCashout').disabled = true;
        document.getElementById('minesMultiplier').textContent = '1.00x';
    }

    renderMinesGrid() {
        const grid = document.getElementById('minesGrid');
        grid.innerHTML = '';
        for (let i = 0; i < 25; i++) {
            const tile = document.createElement('div');
            tile.className = 'mine-tile';
            tile.dataset.index = i;
            tile.textContent = '?';
            tile.addEventListener('click', () => this.revealTile(i));
            grid.appendChild(tile);
        }
    }

    revealTile(index) {
        if (!this.minesGame || this.minesGame.gameOver) return;

        const tiles = document.querySelectorAll('.mine-tile');
        const tile = tiles[index];

        if (tile.classList.contains('revealed')) return;

        tile.classList.add('revealed');

        if (this.minesGame.mines.has(index)) {
            tile.textContent = '💣';
            tile.classList.add('mine');
            this.endMines(false);
        } else {
            tile.textContent = '💎';
            tile.classList.add('gem');
            this.minesGame.revealed++;
            const multiplier = this.getMinesMultiplier();
            document.getElementById('minesMultiplier').textContent = `${multiplier.toFixed(2)}x`;
            document.getElementById('minesCashout').disabled = false;

            if (this.minesGame.revealed === 25 - this.minesGame.minesCount) {
                this.endMines(true);
            }
        }
    }

    getMinesMultiplier() {
        const safe = 25 - this.minesGame.minesCount;
        if (this.minesGame.revealed === 0) return 2;
        let multiplier = 1;
        for (let i = 0; i < this.minesGame.revealed; i++) {
            multiplier *= (safe - i) / (25 - i);
        }
        return 1 / multiplier;
    }

    cashoutMines() {
        if (!this.minesGame || this.minesGame.gameOver) return;
        this.endMines(true);
    }

    endMines(won) {
        this.minesGame.gameOver = true;
        document.querySelectorAll('.mine-tile').forEach((tile, index) => {
            if (!tile.classList.contains('revealed')) {
                tile.classList.add('revealed');
                if (this.minesGame.mines.has(index)) {
                    tile.textContent = '💣';
                    tile.classList.add('mine');
                } else {
                    tile.textContent = '💎';
                    tile.classList.add('gem');
                }
            }
        });

        if (won) {
            const multiplier = this.getMinesMultiplier();
            const winAmount = this.minesGame.bet * multiplier;
            this.updateBalance(winAmount);
            alert(`You won $${(winAmount - this.minesGame.bet).toFixed(2)}!`);
        } else {
            alert(`You lost $${this.minesGame.bet.toFixed(2)}!`);
        }

        document.getElementById('minesCashout').disabled = true;
    }

    startBlackjack() {
        const bet = parseFloat(document.getElementById('blackjackBet').value);
        if (!bet || bet <= 0) {
            alert('Please enter a valid bet');
            return;
        }
        if (bet > this.currentUser.balance) {
            alert('Insufficient balance');
            return;
        }

        this.updateBalance(-bet);
        this.blackjackGame = {
            bet,
            deck: this.createDeck(),
            playerHand: [],
            dealerHand: [],
            gameOver: false
        };

        document.getElementById('blackjackResult').textContent = '';
        document.getElementById('blackjackControls').classList.remove('hidden');

        this.hitBlackjack();
        this.hitBlackjack();
        this.dealerHit();

        if (this.getBlackjackScore(this.blackjackGame.playerHand) === 21) {
            this.endBlackjack('blackjack');
        }
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];
        for (let s of suits) {
            for (let v of values) {
                deck.push({ suit: s, value: v });
            }
        }
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    hitBlackjack() {
        if (!this.blackjackGame || this.blackjackGame.gameOver) return;
        const card = this.blackjackGame.deck.pop();
        this.blackjackGame.playerHand.push(card);
        this.renderBlackjackHands();
        const score = this.getBlackjackScore(this.blackjackGame.playerHand);
        if (score > 21) {
            this.endBlackjack('bust');
        }
    }

    standBlackjack() {
        if (!this.blackjackGame || this.blackjackGame.gameOver) return;
        while (this.getBlackjackScore(this.blackjackGame.dealerHand) < 17) {
            this.dealerHit();
        }
        const playerScore = this.getBlackjackScore(this.blackjackGame.playerHand);
        const dealerScore = this.getBlackjackScore(this.blackjackGame.dealerHand);
        if (dealerScore > 21 || playerScore > dealerScore) {
            this.endBlackjack('win');
        } else if (playerScore === dealerScore) {
            this.endBlackjack('push');
        } else {
            this.endBlackjack('lose');
        }
    }

    dealerHit() {
        const card = this.blackjackGame.deck.pop();
        this.blackjackGame.dealerHand.push(card);
        this.renderBlackjackHands();
    }

    getBlackjackScore(hand) {
        let score = 0;
        let aces = 0;
        for (let card of hand) {
            if (card.value === 'A') {
                aces++;
                score += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                score += 10;
            } else {
                score += parseInt(card.value);
            }
        }
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    }

    renderBlackjackHands() {
        const dealerCards = document.getElementById('dealerCards');
        const playerCards = document.getElementById('playerCards');
        dealerCards.innerHTML = '';
        playerCards.innerHTML = '';

        this.blackjackGame.dealerHand.forEach(card => {
            dealerCards.appendChild(this.createCardElement(card));
        });
        this.blackjackGame.playerHand.forEach(card => {
            playerCards.appendChild(this.createCardElement(card));
        });

        document.getElementById('dealerScore').textContent = this.getBlackjackScore(this.blackjackGame.dealerHand);
        document.getElementById('playerScore').textContent = this.getBlackjackScore(this.blackjackGame.playerHand);
    }

    createCardElement(card) {
        const el = document.createElement('div');
        el.className = 'card' + (['♥', '♦'].includes(card.suit) ? ' red' : '');
        el.innerHTML = `
            <div class="card-value">${card.value}</div>
            <div class="card-suit">${card.suit}</div>
        `;
        return el;
    }

    endBlackjack(result) {
        this.blackjackGame.gameOver = true;
        document.getElementById('blackjackControls').classList.add('hidden');
        const resultEl = document.getElementById('blackjackResult');
        resultEl.classList.remove('win', 'lose');

        let message = '';
        if (result === 'blackjack') {
            message = 'BLACKJACK! You win 1.5x!';
            this.updateBalance(this.blackjackGame.bet * 2.5);
            resultEl.classList.add('win');
        } else if (result === 'win') {
            message = 'You win!';
            this.updateBalance(this.blackjackGame.bet * 2);
            resultEl.classList.add('win');
        } else if (result === 'push') {
            message = 'Push!';
            this.updateBalance(this.blackjackGame.bet);
        } else {
            message = 'You lose!';
            resultEl.classList.add('lose');
        }
        resultEl.textContent = message;
    }

    spinSlots() {
        const bet = parseFloat(document.getElementById('slotsBet').value);
        if (!bet || bet <= 0) {
            alert('Please enter a valid bet');
            return;
        }
        if (bet > this.currentUser.balance) {
            alert('Insufficient balance');
            return;
        }

        this.updateBalance(-bet);

        const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '💎', '7️⃣'];
        const reels = [
            document.getElementById('reel1'),
            document.getElementById('reel2'),
            document.getElementById('reel3')
        ];

        const results = [];
        reels.forEach((reel, i) => {
            reel.classList.add('spinning');
            setTimeout(() => {
                const symbol = symbols[Math.floor(Math.random() * symbols.length)];
                results.push(symbol);
                reel.textContent = symbol;
                reel.classList.remove('spinning');

                if (i === 2) {
                    this.checkSlotsResult(results, bet);
                }
            }, 500 + i * 300);
        });
    }

    checkSlotsResult(results, bet) {
        const resultEl = document.getElementById('slotsResult');
        resultEl.classList.remove('win', 'lose');

        let winMultiplier = 0;
        if (results[0] === results[1] && results[1] === results[2]) {
            if (results[0] === '7️⃣') {
                winMultiplier = 50;
            } else if (results[0] === '💎') {
                winMultiplier = 25;
            } else if (results[0] === '⭐') {
                winMultiplier = 15;
            } else {
                winMultiplier = 10;
            }
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            winMultiplier = 2;
        }

        if (winMultiplier > 0) {
            const winAmount = bet * winMultiplier;
            this.updateBalance(winAmount);
            resultEl.textContent = `WIN! $${(winAmount - bet).toFixed(2)}!`;
            resultEl.classList.add('win');
        } else {
            resultEl.textContent = 'No win!';
            resultEl.classList.add('lose');
        }
    }

    rollDice() {
        const bet = parseFloat(document.getElementById('diceBet').value);
        const target = parseInt(document.getElementById('diceTarget').value);
        if (!bet || bet <= 0) {
            alert('Please enter a valid bet');
            return;
        }
        if (target < 2 || target > 12) {
            alert('Target must be between 2 and 12');
            return;
        }
        if (bet > this.currentUser.balance) {
            alert('Insufficient balance');
            return;
        }

        this.updateBalance(-bet);

        const dice1El = document.getElementById('dice1');
        const dice2El = document.getElementById('dice2');
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

        dice1El.classList.add('rolling');
        dice2El.classList.add('rolling');

        setTimeout(() => {
            const die1 = Math.floor(Math.random() * 6) + 1;
            const die2 = Math.floor(Math.random() * 6) + 1;
            const total = die1 + die2;

            dice1El.textContent = diceEmojis[die1 - 1];
            dice2El.textContent = diceEmojis[die2 - 1];
            dice1El.classList.remove('rolling');
            dice2El.classList.remove('rolling');

            const resultEl = document.getElementById('diceResult');
            resultEl.classList.remove('win', 'lose');

            if (total === target) {
                let multiplier = 6;
                if (total === 2 || total === 12) multiplier = 36;
                else if (total === 3 || total === 11) multiplier = 18;
                else if (total === 4 || total === 10) multiplier = 12;
                else if (total === 5 || total === 9) multiplier = 9;
                else if (total === 6 || total === 8) multiplier = 7;

                const winAmount = bet * multiplier;
                this.updateBalance(winAmount);
                resultEl.textContent = `You rolled ${total}! WIN $${(winAmount - bet).toFixed(2)}!`;
                resultEl.classList.add('win');
            } else {
                resultEl.textContent = `You rolled ${total}! You lose!`;
                resultEl.classList.add('lose');
            }
        }, 500);
    }

    startCoinFlip() {
        const bet = parseFloat(document.getElementById('coinflipBet').value);
        const choice = document.getElementById('coinflipChoice').value;
        if (!bet || bet <= 0) {
            alert('Please enter a valid bet');
            return;
        }
        if (bet > this.currentUser.balance) {
            alert('Insufficient balance');
            return;
        }

        this.updateBalance(-bet);
        const coinEl = document.getElementById('coin');
        coinEl.classList.add('flipping');

        setTimeout(() => {
            const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
            coinEl.classList.remove('flipping');
            coinEl.textContent = outcome === 'heads' ? '🦅' : '🪙';

            const resultEl = document.getElementById('coinflipResult');
            resultEl.classList.remove('win', 'lose');

            if (outcome === choice) {
                const winAmount = bet * 2;
                this.updateBalance(winAmount);
                resultEl.textContent = `Landed on ${outcome}! WIN $${(winAmount - bet).toFixed(2)}!`;
                resultEl.classList.add('win');
            } else {
                resultEl.textContent = `Landed on ${outcome}! You lose!`;
                resultEl.classList.add('lose');
            }
        }, 1000);
    }

    spinRoulette() {
        const bet = parseFloat(document.getElementById('rouletteBet').value);
        const choice = document.getElementById('rouletteChoice').value;
        if (!bet || bet <= 0) {
            alert('Please enter a valid bet');
            return;
        }
        if (bet > this.currentUser.balance) {
            alert('Insufficient balance');
            return;
        }

        this.updateBalance(-bet);
        const wheelEl = document.getElementById('rouletteWheel');
        wheelEl.classList.add('spinning-fast');

        setTimeout(() => {
            const num = Math.floor(Math.random() * 15); // 0-14. 0 green, 1-7 red, 8-14 black
            let outcome;
            if (num === 0) outcome = 'green';
            else if (num <= 7) outcome = 'red';
            else outcome = 'black';

            wheelEl.classList.remove('spinning-fast');
            
            const resultEl = document.getElementById('rouletteResult');
            resultEl.classList.remove('win', 'lose');

            if (outcome === choice) {
                const multiplier = outcome === 'green' ? 14 : 2;
                const winAmount = bet * multiplier;
                this.updateBalance(winAmount);
                resultEl.textContent = `Landed on ${outcome}! WIN $${(winAmount - bet).toFixed(2)}!`;
                resultEl.classList.add('win');
            } else {
                resultEl.textContent = `Landed on ${outcome}! You lose!`;
                resultEl.classList.add('lose');
            }
        }, 2000);
    }

    renderAdminPanel() {
        const statsEl = document.getElementById('adminStats');
        const usersEl = document.getElementById('usersList');

        const userList = Object.values(this.users);
        const totalUsers = userList.length;
        const totalBalance = userList.reduce((sum, u) => sum + u.balance, 0);
        const regularUsers = userList.filter(u => !u.isAdmin).length;

        statsEl.innerHTML = `
            <div class="stat-card">
                <h3>Total Users</h3>
                <div class="stat-value">${totalUsers}</div>
            </div>
            <div class="stat-card">
                <h3>Regular Users</h3>
                <div class="stat-value">${regularUsers}</div>
            </div>
            <div class="stat-card">
                <h3>Total Balance</h3>
                <div class="stat-value">$${totalBalance.toFixed(2)}</div>
            </div>
        `;

        usersEl.innerHTML = userList.map(user => `
            <div class="user-item">
                <div class="user-info">
                    <span class="username">${user.username}${user.isAdmin ? ' (Admin)' : ''}</span>
                    <span class="email">${user.email}</span>
                </div>
                <div class="user-info">
                    <span>Balance: $${user.balance.toFixed(2)}</span>
                </div>
                <div class="user-actions">
                    ${!user.isAdmin ? `<button class="btn btn-danger" onclick="app.deleteUser('${user.username}')">Delete</button>` : ''}
                </div>
            </div>
        `).join('');
    }

    deleteUser(username) {
        if (confirm(`Are you sure you want to delete ${username}?`)) {
            delete this.users[username];
            this.saveUsers();
            this.renderAdminPanel();
        }
    }

    adminAdjustBalance() {
        const username = document.getElementById('adminTargetUser').value.trim();
        const amount = parseFloat(document.getElementById('adminAmount').value);
        
        if (!username || isNaN(amount)) {
            alert('Please enter a valid username and amount');
            return;
        }
        
        const user = this.users[username];
        if (!user) {
            alert('User not found');
            return;
        }
        
        user.balance += amount;
        this.saveUsers();
        
        if (this.currentUser && this.currentUser.username === username) {
            this.currentUser.balance = user.balance;
            localStorage.setItem('stakeCurrentUser', JSON.stringify(this.currentUser));
            this.updateBalanceDisplay();
        }
        
        document.getElementById('adminAmount').value = '';
        alert(`Successfully adjusted ${username}'s balance by $${amount.toFixed(2)}`);
        this.renderAdminPanel();
    }

    adminResetPassword() {
        const username = document.getElementById('adminTargetUser').value.trim();
        const newPassword = document.getElementById('adminNewPassword').value;
        
        if (!username || !newPassword) {
            alert('Please enter a username and new password');
            return;
        }
        
        const user = this.users[username];
        if (!user) {
            alert('User not found');
            return;
        }
        
        user.password = newPassword;
        this.saveUsers();
        
        document.getElementById('adminNewPassword').value = '';
        alert(`Password for ${username} has been reset`);
    }
}

const app = new StakeApp();

import React, { useState } from 'react';

// ASCII art for the header
const BLACKJACK_ASCII = `
 __________.__ __      ____.               __    
 \\______ \\ | _____   ____ | |  __    | |____ ____ | | __
 |    | _/ | \\__  \\ _/ ___\\| | / /    |  |\\__ \\ _/ ___\\| |/ /
 |    |   \\ |__/ __ \\\\  \\___|    <  /\\__|  |/ __ \\\\  \\___|   <
 |______  /____(____ /\\___ >__|_ \\ \\________(____ /\\___ >__|_ \\
        \\/          \\/     \\/     \\/            \\/     \\/     \\/
`;

const BlackjackGame = () => {
  const [gameState, setGameState] = useState('initial'); // initial, betting, playing, gameOver
  const [dealerCards, setDealerCards] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [message, setMessage] = useState('');
  const [showDealerCard, setShowDealerCard] = useState(false);
  
  // NEW: Betting system state
  const [chips, setChips] = useState(1000);
  const [currentBet, setCurrentBet] = useState(0);
  const [betAmount, setBetAmount] = useState(10);

  // Cards array matching your Python logic
  const cards = [11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];

  const getRandomCard = () => cards[Math.floor(Math.random() * cards.length)];

  const calculateTotal = (hand) => {
    let total = hand.reduce((sum, card) => sum + card, 0);
    let aceCount = hand.filter(card => card === 11).length;
    
    // Convert Aces from 11 to 1 if busted
    while (total > 21 && aceCount > 0) {
      total -= 10;
      aceCount--;
    }
    return total;
  };

  const adjustAces = (hand) => {
    let newHand = [...hand];
    let total = newHand.reduce((sum, card) => sum + card, 0);
    
    while (total > 21 && newHand.includes(11)) {
      const aceIndex = newHand.indexOf(11);
      newHand[aceIndex] = 1;
      total = newHand.reduce((sum, card) => sum + card, 0);
    }
    return newHand;
  };

  const startBetting = () => {
    if (chips <= 0) {
      setMessage("💸 You're out of chips! Click 'Reset Game' to start over.");
      return;
    }
    setGameState('betting');
    setMessage('');
  };

  const placeBet = () => {
    if (betAmount > chips) {
      setMessage(`You only have $${chips} in chips!`);
      return;
    }
    if (betAmount <= 0) {
      setMessage('Please enter a valid bet amount!');
      return;
    }
    
    setCurrentBet(betAmount);
    setChips(chips - betAmount);
    startNewGame();
  };

  const startNewGame = () => {
    // Deal initial cards
    const dealerHand = [getRandomCard(), getRandomCard()];
    const playerHand = [getRandomCard(), getRandomCard()];
    
    const adjustedDealerHand = adjustAces(dealerHand);
    const adjustedPlayerHand = adjustAces(playerHand);
    
    setDealerCards(adjustedDealerHand);
    setPlayerCards(adjustedPlayerHand);
    setShowDealerCard(false);
    setMessage('');
    
    // Check for immediate blackjack
    if (calculateTotal(adjustedPlayerHand) === 21) {
      setGameState('gameOver');
      setShowDealerCard(true);
      const winnings = Math.floor(currentBet * 2.5); // Blackjack pays 3:2
      setChips(chips + currentBet + winnings);
      setMessage(`🎉 BLACKJACK! You win $${winnings}!`);
    } else {
      setGameState('playing');
    }
  };

  const hit = () => {
    if (gameState !== 'playing') return;
    
    const newCard = getRandomCard();
    const newPlayerCards = adjustAces([...playerCards, newCard]);
    setPlayerCards(newPlayerCards);
    
    const total = calculateTotal(newPlayerCards);
    
    if (total > 21) {
      setShowDealerCard(true);
      const dealerTotal = calculateTotal(dealerCards);
      
      if (total === dealerTotal) {
        setChips(chips + currentBet); // Return bet on tie
        setMessage(`💥 Oops! Your sum went overboard. Total: ${total}\nDealer also has total ${dealerTotal}. It's a tie. Bet returned.`);
      } else {
        setMessage(`💥 Oops! Your sum went overboard. Total: ${total}\nDealer had ${dealerTotal}. You lost $${currentBet}.`);
      }
      setGameState('gameOver');
    }
  };

  const stand = () => {
    if (gameState !== 'playing') return;
    
    setShowDealerCard(true);
    let currentDealerCards = [...dealerCards];
    
    // Dealer hits until 17 or more
    while (calculateTotal(currentDealerCards) < 17) {
      currentDealerCards.push(getRandomCard());
      currentDealerCards = adjustAces(currentDealerCards);
    }
    
    setDealerCards(currentDealerCards);
    
    const dealerTotal = calculateTotal(currentDealerCards);
    const playerTotal = calculateTotal(playerCards);
    
    // Compare hands and calculate winnings
    let resultMessage = '';
    let winnings = 0;
    
    if (dealerTotal > 21 && playerTotal <= 21) {
      winnings = currentBet * 2;
      setChips(chips + currentBet + winnings);
      resultMessage = `Dealer total: ${dealerTotal}\nPlayer total: ${playerTotal}\n\n🎉 Dealer busted. You win $${winnings}!`;
    } else if (dealerTotal <= 21 && playerTotal > 21) {
      resultMessage = `Dealer total: ${dealerTotal}\nPlayer total: ${playerTotal}\n\n😞 It's a bust. You lost $${currentBet}.`;
    } else if (dealerTotal === playerTotal) {
      setChips(chips + currentBet); // Return bet
      resultMessage = `Dealer total: ${dealerTotal}\nPlayer total: ${playerTotal}\n\n🤝 It's a tie. Bet returned.`;
    } else if (dealerTotal > playerTotal) {
      resultMessage = `Dealer total: ${dealerTotal}\nPlayer total: ${playerTotal}\n\n😞 Dealer won. You lost $${currentBet}.`;
    } else {
      winnings = currentBet * 2;
      setChips(chips + currentBet + winnings);
      resultMessage = `Dealer total: ${dealerTotal}\nPlayer total: ${playerTotal}\n\n🎉 Dealer lost. You win $${winnings}!`;
    }
    
    setMessage(resultMessage);
    setGameState('gameOver');
  };

  const resetGame = () => {
    setChips(1000);
    setCurrentBet(0);
    setBetAmount(10);
    setGameState('initial');
    setMessage('');
  };

  const renderCards = (hand, hideFirst = false) => {
    return hand.map((card, index) => (
      <div key={index} className="card">
        {hideFirst && index === 0 ? '?' : card}
      </div>
    ));
  };

  return (
    <div className="game-container">
      <div className="ascii-header">
        <pre>{BLACKJACK_ASCII}</pre>
      </div>
      
      <h1 className="welcome">WELCOME TO BLACKJACK</h1>

      {/* Chip Display - Always visible */}
      <div className="chip-display">
        <div className="chip-stack">
          <span className="chip-icon">🎰</span>
          <span className="chip-amount">${chips}</span>
        </div>
        {currentBet > 0 && gameState !== 'initial' && gameState !== 'betting' && (
          <div className="current-bet">
            Current Bet: ${currentBet}
          </div>
        )}
      </div>

      {/* Initial Screen */}
      {gameState === 'initial' && (
        <div className="initial-screen">
          <button onClick={startBetting} className="deal-button">
            START GAME
          </button>
        </div>
      )}

      {/* Betting Screen */}
      {gameState === 'betting' && (
        <div className="betting-screen">
          <h2>Place Your Bet</h2>
          <div className="bet-controls">
            <div className="bet-input-group">
              <label>Bet Amount:</label>
              <input
                type="number"
                min="1"
                max={chips}
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="bet-input"
              />
            </div>
            <div className="quick-bet-buttons">
              <button onClick={() => setBetAmount(10)} className="quick-bet">$10</button>
              <button onClick={() => setBetAmount(25)} className="quick-bet">$25</button>
              <button onClick={() => setBetAmount(50)} className="quick-bet">$50</button>
              <button onClick={() => setBetAmount(100)} className="quick-bet">$100</button>
              <button onClick={() => setBetAmount(chips)} className="quick-bet">ALL IN</button>
            </div>
          </div>
          {message && <div className="bet-message">{message}</div>}
          <button onClick={placeBet} className="deal-button place-bet-button">
            PLACE BET
          </button>
        </div>
      )}

      {/* Game Table */}
      {(gameState === 'playing' || gameState === 'gameOver') && (
        <>
          <div className="table">
            <div className="hand dealer-hand">
              <h2>Dealer's Hand</h2>
              <div className="cards">
                {renderCards(dealerCards, !showDealerCard)}
              </div>
              {showDealerCard && (
                <p className="total">Total: {calculateTotal(dealerCards)}</p>
              )}
            </div>

            <div className="hand player-hand">
              <h2>Your Hand</h2>
              <div className="cards">
                {renderCards(playerCards)}
              </div>
              <p className="total">Total: {calculateTotal(playerCards)}</p>
            </div>
          </div>

          {message && (
            <div className="message-box">
              {message.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}

          <div className="controls">
            {gameState === 'playing' && (
              <>
                <button onClick={hit} className="action-button hit-button">
                  HIT
                </button>
                <button onClick={stand} className="action-button stand-button">
                  STAND
                </button>
              </>
            )}
            
            {gameState === 'gameOver' && (
              <>
                <button onClick={startBetting} className="deal-button">
                  PLAY ANOTHER ROUND
                </button>
                <button onClick={resetGame} className="reset-button">
                  RESET GAME
                </button>
              </>
            )}
          </div>
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Permanent+Marker&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Courier Prime', monospace;
          background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
          min-height: 100vh;
          color: #fff;
        }

        .game-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ascii-header {
          background: rgba(0, 0, 0, 0.4);
          border: 3px solid #ffd700;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
        }

        .ascii-header pre {
          font-family: monospace;
          font-size: 10px;
          color: #ffd700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          line-height: 1.2;
          margin: 0;
        }

        .welcome {
          font-family: 'Permanent Marker', cursive;
          font-size: 2.5rem;
          color: #ffd700;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 4px 10px rgba(0, 0, 0, 0.5);
          margin-bottom: 30px;
          letter-spacing: 3px;
        }

        /* NEW: Chip Display Styles */
        .chip-display {
          background: rgba(0, 0, 0, 0.6);
          border: 3px solid #ffd700;
          border-radius: 15px;
          padding: 20px 40px;
          margin-bottom: 30px;
          display: flex;
          gap: 30px;
          align-items: center;
          box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
        }

        .chip-stack {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .chip-icon {
          font-size: 2.5rem;
        }

        .chip-amount {
          font-family: 'Permanent Marker', cursive;
          font-size: 2rem;
          color: #ffd700;
          text-shadow: 0 2px 10px rgba(255, 215, 0, 0.5);
        }

        .current-bet {
          font-family: 'Permanent Marker', cursive;
          font-size: 1.3rem;
          color: #4caf50;
          padding: 10px 20px;
          background: rgba(76, 175, 80, 0.2);
          border-radius: 10px;
          border: 2px solid #4caf50;
        }

        /* NEW: Betting Screen Styles */
        .betting-screen {
          background: rgba(0, 0, 0, 0.6);
          border: 3px solid #ffd700;
          border-radius: 20px;
          padding: 40px;
          margin: 20px 0;
          box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
          text-align: center;
          max-width: 600px;
        }

        .betting-screen h2 {
          font-family: 'Permanent Marker', cursive;
          font-size: 2rem;
          color: #ffd700;
          margin-bottom: 30px;
        }

        .bet-controls {
          margin-bottom: 30px;
        }

        .bet-input-group {
          margin-bottom: 20px;
        }

        .bet-input-group label {
          display: block;
          font-size: 1.2rem;
          color: #ffd700;
          margin-bottom: 10px;
        }

        .bet-input {
          font-family: 'Courier Prime', monospace;
          font-size: 1.5rem;
          padding: 15px;
          width: 200px;
          border: 3px solid #ffd700;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          text-align: center;
        }

        .bet-input:focus {
          outline: none;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }

        .quick-bet-buttons {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .quick-bet {
          font-family: 'Permanent Marker', cursive;
          font-size: 1rem;
          padding: 12px 20px;
          background: rgba(255, 215, 0, 0.2);
          border: 2px solid #ffd700;
          border-radius: 8px;
          color: #ffd700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .quick-bet:hover {
          background: rgba(255, 215, 0, 0.4);
          transform: scale(1.05);
        }

        .bet-message {
          color: #ff6b6b;
          font-size: 1.1rem;
          margin: 15px 0;
        }

        .place-bet-button {
          margin-top: 20px;
        }

        .initial-screen {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .table {
          background: linear-gradient(135deg, #1a472a 0%, #0d3b1f 100%);
          border: 5px solid #8b4513;
          border-radius: 200px;
          padding: 60px;
          margin: 20px 0;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), inset 0 0 50px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 900px;
        }

        .hand {
          margin: 30px 0;
          text-align: center;
        }

        .hand h2 {
          font-family: 'Permanent Marker', cursive;
          color: #ffd700;
          font-size: 1.8rem;
          margin-bottom: 20px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .dealer-hand h2 {
          color: #ff6b6b;
        }

        .cards {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
          margin: 20px 0;
          min-height: 140px;
          align-items: center;
        }

        .card {
          width: 90px;
          height: 130px;
          background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
          border: 3px solid #333;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: bold;
          color: #000;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 2px 5px rgba(0, 0, 0, 0.2);
          transform: rotate(-2deg);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          animation: dealCard 0.4s ease-out;
        }

        .card:nth-child(even) {
          transform: rotate(2deg);
        }

        .card:hover {
          transform: rotate(0deg) translateY(-10px) scale(1.05);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
        }

        @keyframes dealCard {
          from {
            opacity: 0;
            transform: translateY(-50px) rotate(20deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotate(-2deg);
          }
        }

        .total {
          font-size: 1.5rem;
          color: #ffd700;
          font-weight: bold;
          margin-top: 15px;
          text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
        }

        .message-box {
          background: rgba(0, 0, 0, 0.8);
          border: 3px solid #ffd700;
          border-radius: 15px;
          padding: 30px;
          margin: 30px 0;
          font-size: 1.4rem;
          text-align: center;
          max-width: 600px;
          box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
          animation: messageAppear 0.5s ease-out;
        }

        .message-box div {
          margin: 8px 0;
          line-height: 1.6;
        }

        @keyframes messageAppear {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .controls {
          display: flex;
          gap: 20px;
          margin: 30px 0;
          flex-wrap: wrap;
          justify-content: center;
        }

        button {
          font-family: 'Permanent Marker', cursive;
          font-size: 1.5rem;
          padding: 18px 45px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .deal-button {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #000;
          font-size: 1.8rem;
          padding: 25px 60px;
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
        }

        .deal-button:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 12px 35px rgba(255, 215, 0, 0.6);
        }

        .deal-button:active {
          transform: translateY(-2px) scale(1.02);
        }

        .hit-button {
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          color: white;
        }

        .hit-button:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 10px 30px rgba(76, 175, 80, 0.5);
        }

        .stand-button {
          background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
          color: white;
        }

        .stand-button:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 10px 30px rgba(244, 67, 54, 0.5);
        }

        .reset-button {
          background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
          color: white;
          font-size: 1.2rem;
          padding: 15px 35px;
        }

        .reset-button:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 10px 30px rgba(158, 158, 158, 0.5);
        }

        button:active {
          transform: translateY(-2px) scale(1.02);
        }

        @media (max-width: 768px) {
          .ascii-header pre {
            font-size: 6px;
          }

          .welcome {
            font-size: 1.8rem;
          }

          .chip-display {
            flex-direction: column;
            gap: 15px;
          }

          .chip-amount {
            font-size: 1.5rem;
          }

          .table {
            padding: 30px 20px;
            border-radius: 100px;
          }

          .card {
            width: 70px;
            height: 100px;
            font-size: 2rem;
          }

          button {
            font-size: 1.2rem;
            padding: 15px 30px;
          }

          .deal-button {
            font-size: 1.4rem;
            padding: 20px 40px;
          }

          .betting-screen {
            padding: 30px 20px;
          }

          .quick-bet-buttons {
            gap: 5px;
          }

          .quick-bet {
            font-size: 0.9rem;
            padding: 10px 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default BlackjackGame;

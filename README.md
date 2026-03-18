I wrote the logic for blackjack in Python for learning. Later, I created it into a web app using Javascript and deployed it on Vercel.
Find the deployed Blackjack Game below. Enjoy!
https://blackjack-six-red.vercel.app/

Rules for blackjack: 
Blackjack is a card game played between a player and a dealer. The goal is to get a hand value as close to 21 as possible without exceeding it.
You can bet using custom value, and you get a total of $1000 chips in the beginning.
🎯 Objective
Beat the dealer by having a hand value closer to 21 than theirs.
Do not go over 21 (this is called a bust).

🃠 Card Values
Number cards (2–10): Face value
Face cards (Jack, Queen, King): 10
Ace: Can be 1 or 11 (whichever is more beneficial)

🪪 Game Setup
Both player and dealer are dealt 2 cards.
Player’s cards are visible.

Dealer has:
One visible card
One hidden card

🎮 Player Actions
Hit (h) → Take another card
Stand (s) → Stop taking cards
You can keep hitting until:
You choose to stand, or
Your total exceeds 21 (bust)

🤖 Dealer Rules
Dealer reveals hidden card after player stands.
Dealer must:
Hit if total is less than 17
Stand if total is 17 or more

⚖️ Winning Conditions
If you bust (>21) → You lose
If dealer busts → You win
If both don’t bust:
Higher total wins
Same total → Tie

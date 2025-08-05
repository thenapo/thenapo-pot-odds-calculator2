
function parseCards(input) {
  const cards = input.trim().split(" ");
  const validRanks = "23456789TJQKA";
  const validSuits = "shdc";

  return cards.filter(card => 
    card.length === 2 &&
    validRanks.includes(card[0].toUpperCase()) &&
    validSuits.includes(card[1].toLowerCase())
  );
}

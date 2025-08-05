document.getElementById("analyze-btn").addEventListener("click", function () {
  const handInput = document.getElementById("hand").value;
  const communityInput = document.getElementById("community").value;
  const potSize = parseFloat(document.getElementById("pot-size").value);
  const callSize = parseFloat(document.getElementById("call-size").value);

  const handCards = parseCards(handInput);
  const communityCards = parseCards(communityInput);

  if (handCards.length !== 2 || communityCards.length < 3) {
    alert("אנא הזן 2 קלפים ביד ולפחות 3 קלפים בקופה.");
    return;
  }

  const totalPot = potSize + callSize;
  const potOdds = callSize / totalPot;

  const { outs, reason } = estimateOuts(handCards, communityCards);
  const equity = (outs * 2) / 100;

  document.getElementById("current-hand-result").innerText = handCards.join(", ");
  document.getElementById("outs-result").innerText = `${outs} אאוטים (${reason})`;
  document.getElementById("pot-odds-result").innerText = (potOdds * 100).toFixed(2) + "%";
  document.getElementById("equity-result").innerText = (equity * 100).toFixed(2) + "%";

  const recommendation = equity >= potOdds ? "מומלץ להשוות (Call)" : "מומלץ לוותר (Fold)";
  document.getElementById("recommendation-text").innerText = recommendation;

  document.getElementById("results-section").classList.remove("hidden");
});

function estimateOuts(hand, board) {
  const allCards = hand.concat(board);
  const suits = { s: 0, h: 0, d: 0, c: 0 };
  const rankCounts = {};
  const ranks = [];

  allCards.forEach(card => {
    const suit = card[1];
    const rank = card[0].toUpperCase();
    suits[suit] += 1;
    ranks.push(rankToValue(rank));
    rankCounts[rank] = (rankCounts[rank] || 0) + 1;
  });

  const reasons = [];
  let outs = 0;

  // פלאש דרואו
  const maxSuitCount = Math.max(...Object.values(suits));
  if (maxSuitCount === 4) {
    outs += 9;
    reasons.push("פלאש דרואו");
  } else if (maxSuitCount === 3) {
    outs += 2;
    reasons.push("פלאש אפשרי חלקי");
  }

  // סטרייט דרואו
  const sorted = [...new Set(ranks)].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 3; i++) {
    const window = sorted.slice(i, i + 4);
    const gaps = window[3] - window[0];
    if (gaps === 3) {
      outs += 8;
      reasons.push("סטרייט פתוח");
    } else if (gaps <= 4) {
      outs += 4;
      reasons.push("גאטשוט");
    }
  }

  // זיהוי זוגות/סטים מתוקן
  let pairRanks = [];
  let tripsRanks = [];

  for (const [rank, count] of Object.entries(rankCounts)) {
    if (count === 2) pairRanks.push(rank);
    if (count === 3) tripsRanks.push(rank);
  }

  if (tripsRanks.length >= 1) {
    outs += 7;
    reasons.push("סט – אאוטים לפול האוס / קארה");
  } else if (pairRanks.length >= 2) {
    outs += 4;
    reasons.push("שני זוגות – אאוטים לפול האוס");
  } else if (pairRanks.length === 1) {
    outs += 5;
    reasons.push("זוג – אאוטים לסט");
  }

  if (outs === 0) {
    outs = 6;
    reasons.push("הערכה כללית");
  }

  return {
    outs,
    reason: reasons.join(", ")
  };
}

function rankToValue(rank) {
  const rankMap = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return rankMap[rank] || 0;
}

const { Promise, Bet, User } = require('../models/model');

const finishPromise = async () => {
  const promises = await Promise.find({
    $and: [
      { resolution_date: { $gte: new ISODate() } },
      { status: { $ne: 'finished' } }
    ]
  });
  const resolveResult = promises.map(async (_promise) => {
    const resolvePromiseResult = await resolvePromise(_promise);
  })

}
const resolvePromise = async (promise) => {
  const gameResult = await getEventResult(promise.id_event)
  const outcome = gameResult.winner;
  const eventState = gameResult.state;
  const eventInfo = gameResult.event;
  if (eventState === 'Complete') {
    let winners = [];
    let loser = [];
    const betAmount = promise.bet_amount;
    try {
      const updatedPromise = await Promise.findByIdAndUpdate(promise._id, { status: 'finished', outcome: outcome });
      const users = await Bet.updateMany({ promise_id: promise._id }, { $set: { settled: 1 } });
      const betResult = users.map((_user) => {
        _user.choice === outcome
          ? winners.push(_user._id)
          : loser.push(_user._id)
      });
      if (promise.creator_choice === outcome) winners.push(promise.creator_id);
      else loser.push(promise.creator_id)
      const totalProfit = loser.length * Number(betAmount);
      const winnerProfit = promise_bet_amount + (totalProfit * 0.8) / loser.length;
      const winnerResult = await User.updateMany({ _id: winners }, { $inc: { amount: winnerProfit, escrow: -1 * betAmount } })
      const loserResult = await User.updateMany({ _id: loser }, { $inc: { escrow: -1 * betAmount } })

    } catch (error) {
      console.log("resolve_event : ", error)
    }
  }



}

async function getEventResult(eventId) {
  try {
    const sportsApiKey = process.env.SPORTSAPIKEY;
    const headers = {
      'X-API-KEY': sportsApiKey,
      'Content-Type': 'application/json'
    }

    const response = await axios.get(`https://www.thesportsdb.com//api/v2/json/lookup/event/${eventId}`,
      { headers: headers })

    if (response.data.lookup && response.data.lookup.length > 0) {
      const event = response.data.events[0];
      // Determine the state of the event
      const state = determineEventState(event);
      console.log('Event State:', state);

      // Determine the winner
      const winner = determineWinner(event);
      console.log('Winner:', winner);

      return { event, state, winner };
    } else {
      console.log('No event found with the given ID');
      return null;
    }
  } catch (error) {
    console.error('Error fetching event result:', error);
    return null;
  }
}
function determineEventState(event) {
  // Example logic to determine the state of the event

  const status = event.strStatus;
  let gameState;
  switch (status) {
    case 'NS':
      gameState = 'Not Started';
      break;
    case 'Q1':
    case 'Q2':
    case 'Q3':
    case 'Q4':
    case 'OP':
    case 'BP':
    case 'HP':
      gameState = 'In Progress';
      break;
    case 'FT':
    case 'AOT':
      gameState = 'Complete';
      break;
    case 'CANC':
      gameState = 'Cancelled';
      break;
    case 'POST':
      gameState = 'Postponed';
      break;
    case 'ABD':
      gameState = 'Abandoned';
      break;
    default:
      gameState = 'Not complete';
  }
  return gameState;
}

function determineWinner(event) {
  // Example logic to determine the winner
  if (event.intHomeScore > event.intAwayScore) {
    return event.strHomeTeam;
  } else if (event.intHomeScore < event.intAwayScore) {
    return event.strAwayTeam;
  } else {
    return 'Draw';
  }
}

module.exports= {finishPromise};
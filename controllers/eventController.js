const sportsApiKey = process.env.SPORTSAPIKEY;
const getAllEvent = async (req, res) => {


  const data = await fetchUpcomingEvents('4387');
  res.status(200).json(data)
  console.log("data : ", data)
}

const fetchUpcomingEvents = async (leagueId) => {
  const apiSource = {
    endpoint: `https://www.thesportsdb.com/api/v1/json/${sportsApiKey}/eventsseason.php?id=${leagueId}`,
    method: 'GET',
  };

  console.log('fetchUpcomingEvents called');

  const data = await fetchApiData(apiSource, {});
  if (!data || !data.events) {
    throw new Error('No events found for this league.');
  }

  // Get current date
  const currentDate = new Date(getCurrentDate());
  let upcomingEvents = [];
  let pastEvents = [];
  console.log(currentDate)

  // Filter events to get upcoming events
  data.events.map((event) => {
    if (event.strHomeTeamBadge === null || event.strAwayTeamBadge === null) return
    // console.log(event)
    if (!event.dateEvent) return null; // Exclude events without a date
    const eventDate = new Date(event.dateEvent);
    if (eventDate >= currentDate)
      upcomingEvents.push(
        {
          value: event.strEvent, label: event.strEvent, strEvent: event.strEvent,
          strThumbA: event.strHomeTeamBadge, strThumbB: event.strAwayTeamBadge,
          dataEvent: event.dateEvent, teamA: event.strHomeTeam, teamB: event.strAwayTeam,
          idEvent: event.idEvent
        })
    else if (event.intHomeScore !== null && event.intAwayScore !== null)
      pastEvents.push(
        {
          value: event.strEvent, label: event.strEvent, strEvent: event.strEvent,
          strThumbA: event.strHomeTeamBadge, strThumbB: event.strAwayTeamBadge, dataEvent: event.dateEvent,
          teamAScore: event.intHomeScore, teamBScore: event.intAwayScore, teamA: event.strHomeTeam,
          teamB: event.strAwayTeam
        })
  });

  if (upcomingEvents.length === 0) {
    throw new Error('No upcoming matches found for this league.');
  }
  if (pastEvents.length === 0) {
    throw new Error('No past matches found for this league.');
  }

  // Sort by date ascending
  upcomingEvents.sort((a, b) => (new Date(a.dateEvent) - new Date(b.dateEvent)));
  pastEvents.sort((a, b) => (new Date(a.dateEvent) - new Date(b.dateEvent)));

  return { upcomingEvents: upcomingEvents, pastEvents: pastEvents.reverse().slice(0, 5) };
}

const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const fetchApiData = async (apiSource, params) => {
  let { endpoint, method, headers } = apiSource;

  // Replace `{apiKey}` in the endpoint
  endpoint = endpoint.replace('{apiKey}', params.apiKey);
  delete params.apiKey;

  const urlObject = new URL(endpoint);

  // Include any additional params (if needed)
  for (const [key, value] of Object.entries(params || {})) {
    urlObject.searchParams.append(key, value);
  }

  const options = { method, headers: headers || {} };

  try {
    const response = await fetch(urlObject.toString(), options);
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response content-type: ${contentType}. Response body: ${text}`);
    }
  } catch (error) {
    console.error(`Failed to fetch API data: ${error.message}`);
    throw error;
  }
}

module.exports = { getAllEvent, fetchUpcomingEvents }
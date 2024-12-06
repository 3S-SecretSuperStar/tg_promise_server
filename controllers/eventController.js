const sportsApiKey = process.env.SPORTSAPIKEY;
const getAllEvent = async (req,res) => {


  const data = await fetchUpcomingEvents('4387');
  res.status(200).json(data)
  console.log("data : ", data)
}

async function fetchUpcomingEvents(leagueId) {
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
  const currentDate = new Date();

  // Filter events to get upcoming events
  const upcomingEvents = data.events.map((event) => {
    // console.log(event)
    if (!event.dateEvent) return null; // Exclude events without a date
    const eventDate = new Date(event.dateEvent);
    if (eventDate >= currentDate)
      return { value: event.strEvent, label: event.strEvent, strEvent: event.strEvent, strThumb: event.strThumb, dataEvent: event.dateEvent }

  });

  if (upcomingEvents.length === 0) {
    throw new Error('No upcoming matches found for this league.');
  }

  // Sort by date ascending
  upcomingEvents.sort((a, b) => new Date(a.dateEvent) - new Date(b.dateEvent));

  return upcomingEvents;
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

module.exports = { getAllEvent }
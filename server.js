const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
const PORT = 8000

app.use(cors())

// --- Steam Backlog RPG API (proxies Valve's Steam Web API) ---

app.get('/api/steam/games', async (req, res) => {
  const { steamid, key } = req.query

  if (!steamid || !key) {
    return res.status(400).json({ error: 'steamid and key are required' })
  }

  try {
    const url = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/'
    const response = await axios.get(url, {
      params: {
        key,
        steamid,
        format: 'json',
        include_appinfo: 1,
        include_played_free_games: 1,
      },
      timeout: 10000,
    })
    res.json(response.data)
  } catch (error) {
    console.error('Steam games API error:', error.message)
    if (error.response) {
      res.status(error.response.status).json({
        error: `Steam API returned ${error.response.status}`,
        details: error.response.data,
      })
    } else {
      res.status(500).json({ error: 'Failed to fetch Steam games', details: error.message })
    }
  }
})

app.get('/api/steam/user', async (req, res) => {
  const { steamid, key } = req.query

  if (!steamid || !key) {
    return res.status(400).json({ error: 'steamid and key are required' })
  }

  try {
    const url = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/'
    const response = await axios.get(url, {
      params: {
        key,
        steamids: steamid,
        format: 'json',
      },
      timeout: 10000,
    })
    res.json(response.data)
  } catch (error) {
    console.error('Steam user API error:', error.message)
    if (error.response) {
      res.status(error.response.status).json({
        error: `Steam API returned ${error.response.status}`,
        details: error.response.data,
      })
    } else {
      res.status(500).json({ error: 'Failed to fetch Steam user', details: error.message })
    }
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// --- Static portfolio site (must come after the API routes above) ---
app.use(express.static(__dirname))

app.listen(PORT, () => {
  console.log(`Portfolio running on http://localhost:${PORT}`)
})

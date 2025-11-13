// Simple Express server (CommonJS) to send SMS via Twilio and handle authentication
// Usage: set environment variables TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
// Run: node server.cjs  (or npm run api)

const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.API_PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// In-memory user store (for demo purposes; use a database in production)
const users = []

// Try to require twilio only when available to avoid hard crash if not installed
let twilioClient = null
try {
  const Twilio = require('twilio')
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  }
} catch (err) {
  console.warn('Twilio SDK not installed or failed to load. SMS sending will be unavailable.')
}

app.get('/ping', (req, res) => res.json({ ok: true }))

// POST /signup
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }

  const existingUser = users.find(user => user.email === email)
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = { id: users.length + 1, name, email, password: hashedPassword }
  users.push(user)

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET)
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

// POST /login
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = users.find(user => user.email === email)
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }

  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    return res.status(400).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET)
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

// POST /send-sms
// Body: { name, email, message, phone }
app.post('/send-sms', async (req, res) => {
  const { name, email, message, phone } = req.body || {}

  if (!name || !email || !message || !phone) {
    return res.status(400).json({ error: 'Missing required fields: name, email, message, phone' })
  }

  if (!twilioClient) {
    return res.status(500).json({ error: 'Twilio client not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.' })
  }

  const from = process.env.TWILIO_FROM
  if (!from) {
    return res.status(500).json({ error: 'TWILIO_FROM not set in environment' })
  }

  try {
    const smsBody = `Contact from ${name} (${email}): ${message}`
    const msg = await twilioClient.messages.create({
      body: smsBody,
      from,
      to: phone
    })

    return res.json({ success: true, sid: msg.sid })
  } catch (err) {
    console.error('Error sending SMS:', err && err.message ? err.message : err)
    return res.status(500).json({ error: 'Failed to send SMS', details: err && err.message })
  }
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
  console.log('POST /send-sms to send SMS messages (requires Twilio credentials in env)')
})

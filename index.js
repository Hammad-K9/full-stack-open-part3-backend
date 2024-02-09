const express = require('express')
var morgan = require('morgan')
const cors = require('cors')

const app = express()

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

let contacts = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', req => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/contacts', (req, res) => {
  res.json(contacts)
})

app.get('/api/contacts/info', (req, res) => {
  res.send(
    `<p>Phonebook has info for ${contacts.length} people</p>
    <p>${new Date()}</p>
    `
  )
})

app.get('/api/contacts/:id', (req, res) => {
  const id = +req.params.id
  const contact = contacts.find(contact => contact.id === id)
  contact ? res.json(contact) : res.status(404).send('Contact doesn\'t exist')
})

app.delete('/api/contacts/:id', (req, res) => {
  const id = +req.params.id
  contacts = contacts.filter(c => c.id !== id)

  res.status(204).end()
})

const generateId = () =>  Math.floor(Math.random() * 100) + 1

app.post('/api/contacts', (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ 
      error: 'name or number is missing' 
    })
  }

  if (contacts.find(c => c.name === body.name)) {
    return res.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const contact = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  contacts = contacts.concat(contact)

  res.json(contacts)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
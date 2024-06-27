const express = require('express')
const app = express()
var morgan = require('morgan')

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))

let persons = [
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

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(persons => persons.id === id)

    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })

  app.post('/api/persons', (request, response) => {
    const body = request.body;

    // Verificar si el nombre o el número están ausentes en la solicitud
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number is missing'
        });
    }

    // Verificar si el nombre ya existe en la lista persons
    const nameExists = persons.some(person => person.name === body.name);
    if (nameExists) {
        return response.status(400).json({
            error: 'name must be unique'
        });
    }

    // Si pasa todas las validaciones, agregar la nueva persona
    const newPerson = {
        id: generateId(),
        name: body.name,
        number: body.number
    };
    
    persons = persons.concat(newPerson);
    response.json(newPerson);
});

function generateId() {
    const maxId = persons.length > 0 ? Math.max(...persons.map(p => p.id)) : 0;
    return maxId + 1;
}

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(persons => persons.id !== id)
  
    response.status(204).end()
  })

app.get('/info', (request, response) => {
    const i = persons.length
    const currentTime = new Date();
    console.log(i)
    const message = '<p>Phonebook has info for ' + i + ' people </p>'
    const responseHtml = message + `<p>Request received at ${currentTime}</p>`;
    response.send(responseHtml)
  })

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
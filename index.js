const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

// Middleware
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());
app.use(express.static('dist'));
app.use(express.json());

// MongoDB connection
const password = 'ZwqI0my7zlzH0Yw6';
const url = `mongodb+srv://alexbecerradev:${password}@phonebookback.jnuo0jy.mongodb.net/?appName=phonebookback`;

mongoose.set('strictQuery', false);

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });

  const phoneValidator = [
  {
    validator: function (v) {
      return v.length >= 8;
    },
    message: props => `${props.value} is too short. A phone number must have at least 8 characters.`
  },
  {
    validator: function (v) {
      return /^\d{2,3}-\d+$/.test(v);
    },
    message: props => `${props.value} is not a valid phone number. Format should be XX-XXXXXXX or XXX-XXXXXXXX.`
  }
];

// Mongoose schema and model
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  number: {
    type: String,
    required: true,
    validate: phoneValidator
  }
});



const Person = mongoose.model('Person', personSchema);

// Routes
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons);
  });
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number is missing'
    });
  }

  const newPerson = new Person({
    name: body.name,
    number: body.number
  });

  newPerson.save()
    .then(savedPerson => {
      res.json(savedPerson);
    })
    .catch(error => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  app.get('/info', (req, res, next) => {
    Person.find({})
      .then(persons => {
        const totalPersons = persons.length;
        const currentTime = new Date();
        res.send(`
          <p>Phonebook has info for ${totalPersons} people</p>
          <p>${currentTime}</p>
        `);
      })
      .catch(error => next(error));
  });

  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      res.json(updatedPerson);
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

// Middleware de manejo de errores
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

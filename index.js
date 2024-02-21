const express = require('express');
var morgan = require('morgan');
const cors = require('cors');

require('dotenv').config();
const app = express();
const Contact = require('./models/contact');

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  next(err);
};

app.use(express.json());
app.use(cors());
app.use(express.static('dist'));

morgan.token('body', req => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/api/contacts', (req, res) => {
  Contact.find({}).then(contacts => {
    res.json(contacts);
  });
});

app.get('/api/contacts/info', (req, res) => {
  Contact.collection.countDocuments()
    .then(numContacts => {
      res.send(
        `<p>Phonebook has info for ${numContacts} people</p>
      <p>${new Date()}</p>
      `
      );
    });
});

app.get('/api/contacts/:id', (req, res, next) => {
  Contact.findById(req.params.id)
    .then(contact => {
      if (contact) res.json(contact);
      else res.status(404).send('Contact doesn\'t exist');
    })
    .catch(err => next(err));
});

app.delete('/api/contacts/:id', (req, res, next) => {
  Contact.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => next(err));
});

app.post('/api/contacts', (req, res, next) => {
  const body = req.body;

  const contact = new Contact({
    name: body.name,
    number: body.number,
  });

  contact.save()
    .then(savedContact => {
      res.json(savedContact);
    })
    .catch(err => next(err));
});

app.put('/api/contacts/:id', (req, res, next) => {
  const body = req.body;
  const contact = { ...body };

  Contact.findByIdAndUpdate(req.params.id, contact,
    { new: true, runValidators: true, context: 'query' })
    .then(updatedContact => {
      res.json(updatedContact);
    })
    .catch(err => next(err));
});

app.use(unknownEndpoint);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
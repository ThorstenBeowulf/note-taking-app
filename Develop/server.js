const express = require('express')
const fs = require('fs');
const tips = require('express').Router();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => 
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) => 
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) => {
  console.log(`${req.method} api request received`);
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.delete('/api/notes/:id', (req, res) => {
  console.log(`${req.method} api request received`);
  const noteId = req.params.id;
  fs.readFile('db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      const filteredData = parsedData.filter((note) => note.id !== noteId);
      fs.writeFile('db/db.json', JSON.stringify(filteredData, null, 4), (err) =>
      err ? console.error(err) : console.info(`Data written to db/db.json`)
      );
      res.json(`note id= ${noteId} deleted`);
    }
  });

});

app.post('/api/notes', (req, res) => {
  console.log(`${req.method} api request received`);
  const { title, text} = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: uuidv4()
    };

    fs.readFile('db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedData = JSON.parse(data);
        parsedData.push(newNote);
        fs.writeFile('db/db.json', JSON.stringify(parsedData, null, 4), (err) =>
        err ? console.error(err) : console.info(`Data written to db/db.json`)
        );
      }
    });

    const response = {
      status: 'success',
      body: newNote
    };

    res.json(response);
  } else {
    res.json('There was an error trying to post message');
  };
});

app.get('*', (req, res) => 
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () => 
  console.log(`Server Running on port ${PORT}`)
);
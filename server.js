const express = require('express');
const path = require('path');
const fs = require('fs');
const uniqueId = require('uniqid');
let dbData = require('./db/db.json');

const PORT= process.env.PORT || 3001;
const app = express();

// accepts json data from the front end and parses it for us
app.use(express.json());
// helps parse data from the front end that come in a different way
app.use(express.urlencoded({extended: true}));
// points express to the public folder and says all the files in that folder, send them statically to the front end. 
// makes several app.get routes to help access the files we want
app.use(express.static('public'));

//localhost:3001/
// req is the request from the client, res is what we do in the backend. 
// the req object represents data that's been sent to us about the request
app.get('/', (req, res) => 
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET request for notes page to open upon clicking the Get Started button
app.get('/notes', (req, res) => 
// Path.join() joins two different folder file paths. 
  res.sendFile(path.join(__dirname, 'public/notes.html'))
);


// GET request for notes
app.get('/api/notes', (req, res) => {

  // Log our request to the terminal
  console.log(`${req.method} request received to open notes page`);

  //Read the db.json file and return all saved notes as JSON.
  dbData = JSON.parse(fs.readFileSync('./db/db.json', 'utf-8'));
  res.json(dbData);

});


// POST request to add a note
// can only ever have one res.json inside a function
app.post('/api/notes', async (req, res) => {
  try{
    // Log that a POST request was received
    console.log(`${req.method} request received to access notes page`)
    
    // Destructuring the items in req.body
    const { title, text } = req.body

    if (!title || !text) {
      return res.status(500).json('Error in posting review');
    }

    // Variable for the object we will save for the notes
    const newNote = {
      title, 
      text, 
      id: uniqueId()
    };

    const rawData = await fs.promises.readFile('./db/db.json');

    // The type of rawData is a string, so we will convert it to an object
    const notesData = JSON.parse(rawData);

    // We push the new note into the array that represents our file
    notesData.push(newNote);

    // Convert the data to a string so we can save it
    const noteString = JSON.stringify(notesData, null, 4);

    // Write the file using the fs library
    fs.writeFile(`./db/db.json`, noteString, (err) =>
      err
        ?console.error(err)
        : console.log(`Notes for ${newNote.title} has been written to JSON file.`)
    );

    const response = {
      status: 'Success', 
      body: newNote
    };

    res.status(201).json(response);

  } catch (err) {
    console.log(err);
  }
})

// DELETE request to delete note
app.delete('/api/notes/:id', (req, res) => {
  let notesToKeep = [];
  for (let i=0; i<dbData.length; i++) {
    // if the dbData[i].id isn't equal to the id of the note selected
    // push that id into the new array (so recreate the array with all notes but the one selected for deletion)
    if (dbData[i].id != req.params.id) {
      notesToKeep.push(dbData[i])
    }
  }

  dbData = notesToKeep;
  fs.writeFileSync('./db/db.json', JSON.stringify(dbData));
  res.json(dbData);

  console.log(`Note ${newNote.title.id} has been deleted`);
});


app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(`App listening at http://localhost:${PORT} 🚀`)
});
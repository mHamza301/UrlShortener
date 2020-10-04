//Standard Importing
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');


const app = express();


//Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.static('./public'));

/*

app.get('/url/:id', (req, res) =>{


});


app.get('/:id', (req, res) =>{


});
 

app.post('/url', (req, res) =>{


});
*/

const port = process.env.PORT || 5555;
app.listen(port, () =>{

    console.log(`Listening on ${port}`);
});

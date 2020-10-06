//Standard Importing
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const monk = require('monk');
const { nanoid } = require('nanoid');

require('dotenv').config();

//Database Connection
const db = monk(process.env.MONGO_URI);
const urls = db.get('urls');
urls.createIndex({alias: 1}, {unique: true});

const app = express();


//Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.static('./public'));

//Routes

app.get('/:id', async (req, res, next) =>{

    const {id: alias} = req.params;
    try {
        const url = await urls.findOne({alias});
        if (url) {
            res.redirect(url.url);
        }
        res.redirect(`/?error=${alias} not found`);
    } catch (error) {
        res.redirect(`/?error= Link not found`);
    }

});
 
//Schema Validation

const schema = yup.object().shape({

    alias: yup.string().trim().matches(/[\w\-]/i),
    url: yup.string().trim().url().required(),

});
app.post('/url', async (req, res, next) =>{

    let {alias, url} = req.body;

    try {
        await schema.validate({
            alias,
            url,
        });

        if (!alias) {
            alias = nanoid(12);
        }  else {
            const alreadyPresent = await urls.findOne({alias});
                if (alreadyPresent){
                    throw new Error('Alias already present');
                }
        } 
        alias = alias.toLowerCase();

        const newURL = {
            url,
            alias,
        };

        const createdUrl = await urls.insert(newURL);
        res.json(createdUrl);
    } catch (error)
    {
        next(error);
    }

});

//Error Handling

app.use((error, req, res, next) =>{

    if(error.status){
        res.status(error.status);
    }
    else{
        res.status(500);
    }
    res.json({
        message: error.message,
        stack : process.env.NODE_ENV === 'production' ? 'Good' : error.stack,
        
    })
});

//Localhost running setup

const port = process.env.PORT || 5555;
app.listen(port, () =>{

    console.log(`Listening on ${port}`);
});

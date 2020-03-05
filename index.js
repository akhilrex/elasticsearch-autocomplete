require('dotenv').config()
const express = require('express');
const morgan= require('morgan');
const { Bearer} = require('permit');
const auth = require('./auth');
const cors = require('cors');
const APP_PORT = process.env.port;

var app = express();
app.use(cors());
app.use(morgan('combined'));
app.use(require('body-parser').json({ limit: '20mb' }));

const permit = new Bearer({
    basic: 'username', // Also allow a Basic Auth username as a token.
    query: 'access_token', // Also allow an `?access_token=` query parameter.
  })

function authenticate(req, res, next) {
    // Try to find the bearer token in the request.
    const token = permit.check(req)
  
    // No token found, so ask for authentication. If there is no env variable named token it assumes the api is publicly accessible.
    if (!token && process.env.token) {
      permit.fail(res)
      return next(new Error(`Authentication required!`))
    }
  
    // Perform your authentication logic however you'd like...
    auth.validate(token, (err, isValid) => {
      if (err) return next(err);
  
      // No user found, so their token was invalid.
      if (!isValid) {
        permit.fail(res);
        return next(new Error(`Authentication invalid!`));
      }
  
      next();
    })
  }

  //Api health check
app.get('/',function(req,res){
    res.sendStatus(200);
});

app.use('/admin',authenticate,require('./routes/admin'));
app.use('/suggest',require('./routes/suggest'));

app.listen(APP_PORT, function(){
    //logger.logger.log('App is running');
});
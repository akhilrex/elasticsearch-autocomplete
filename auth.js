require('dotenv').config()
// Build your own auth logic here

function validate(token, callback){
    let valid = false;
    
    if(!process.env.token){
        valid=true;
    }else{
        valid= process.env.token===token;
    }
    callback(null,valid);
}

exports.validate=validate;
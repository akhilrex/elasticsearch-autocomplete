var express = require('express');
var router = express.Router();

var elasticsearch = require('../es');

//Get result from elasticsearch
router.get('/:index/:text/:num', function (req, res, next) {
    elasticsearch.getSuggestions(req.params.index, req.params.text, req.params.num).then(
        function (result) {
            if(!result.suggest){
                return res.json([]);
            }
            if (!req.query.compact) {
                res.json(result)
            } else {

                let toReturn = result.suggest.theSuggester[0].options.map(x => { let p = x._source; p._id = x._id; return p; });
                res.json(toReturn);
            }
        }
    );
});

module.exports = router;

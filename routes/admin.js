var express = require('express');
var router = express.Router();

var elasticsearch = require('../es');

const Joi = require('joi');

// define the validation schema
const schema = Joi.array().items(Joi.object().keys({

    keyword: Joi.string().required(),
    weight: Joi.number().default(1),
    meta: Joi.object()
}));


router.post('/indexes',

    function (req, res, next) {
        elasticsearch.createIndex(req.body.name).then(
            function (result) {
                elasticsearch.indexMapping(req.body.name);
                res.json(result)
            }
        ).catch(err => res.status(500).json(err));
    });

router.delete('/indexes/:index',

    function (req, res, next) {
        elasticsearch.deleteIndex(req.params.index).then(
            function (result) {
                res.json(result)
            }
        ).catch(err => res.status(500).json(err));
    });

router.post('/indexes/:index', function (req, res, next) {
    const data = req.body;
    console.log(data);
    Joi.validate(data, schema, (err, value) => {
        if (err) {
            res.status(500).json(err)
        } else {
            console.log(value);

            elasticsearch.addDocument(req.params.index, data).then(
                function (result) {
                    res.json(result)
                }
            ).catch(error => res.status(500).json(error));
        }
    });
});


router.delete('/indexes/:index/:docid', function (req, res, next) {

    elasticsearch.deleteDocument(req.params.index, req.params.docid).then(
        function (result) {
            res.json(result)
        }
    ).catch(error => res.status(500).json(error));

});

router.post('/indexes/:index/delete', function (req, res, next) {

    elasticsearch.deleteByQuery(req.params.index,req.body).then(
        function (result) {
            res.json(result)
        }
    ).catch(error => res.status(500).json(error));

});

router.post('/indexes/:index/simplebulk', function (req, res, next) {
    const data = req.body;

    Joi.validate(data, Joi.array().items(Joi.string()), (err, value) => {
        if (err) {
            res.status(500).json(err)
        } else {
            console.log(value);
            let toInsert = data.map(elasticsearch.getDefaultObject);

            elasticsearch.addDocument(req.params.index, toInsert).then(
                function (result) {
                    res.json(result)
                }
            ).catch(error => res.status(500).json(error));
        }
    });
});



module.exports = router;

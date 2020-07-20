'use strict';

require('dotenv').config()

var fs = require('fs');
var elasticsearch = require('elasticsearch');


const es = elasticsearch.Client({
    host: process.env.elasticsearch,
    log: 'trace',
    "apiVersion": "6.8"
});



function indexExists(indexName) {
    return es.indices.exists({
        index: indexName
    });
}

function createIndex(indexName) {
    return es.indices.create({
        index: indexName
    });
}

function deleteIndex(indexName) {
    return es.indices.delete({
        index: indexName
    });
}

function getDefaultObject(keyword) {
    return {
        keyword: keyword,
        weight: 1
    }
}

function indexMapping(indexName) {
    return es.indices.putMapping({
        index: indexName,
        type: 'doc',
        body: {
            properties: {
                keyword: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple"
                },

                weight: {
                    type: "integer"
                },
                meta: {
                    type: 'object'
                }

            }
        }
    });
}

function addDocument(indexName, documents) {


    var items = [];

    documents.forEach(element => {
        let keyCopy = getTokenizedArray(element.keyword);
        element.keyword = { input: keyCopy, weight: element.weight };
        items.push({ index: { _index: indexName } }, element);
    });

    return es.bulk({
        body: items,
        type: 'doc',
        refresh: "true"
    });
}

function getTokenizedArray(keyword) {
    let toReturn = [];
    let split = keyword.split(' ');
    for (var i = 0; i < split.length; i++) {
        let toAdd = split.slice(i).join(' ');
        if (toAdd && toAdd.trim()) {
            toReturn.push(toAdd)
        }
    }
    return toReturn;

}

function deleteDocument(indexName, docId) {
    return es.delete({
        index: indexName,
        id: docId,
        type: 'doc',
        refresh: "true"
    });
}



function getSuggestions(indexName, text, size) {
    return es.search({
        index: indexName,
        type: 'doc',
        body: {
            suggest: {
                theSuggester: {
                    prefix: text,
                    completion: {
                        field: "keyword",
                        size: size,
                        fuzzy: {
                            fuzziness: "auto"
                        }
                    }
                }
            }

        }
    });
}


function deleteByQuery(indexName, query) {
    return es.deleteByQuery({
        index: indexName,
        type: 'doc',
        body: {
            query: {
                match: query
            }
        }
    });
}

function getStat(indexName, id) {
    return es.search({
        index: indexName,
        type: 'doc',
        body: {
            query: {
                term: {
                    "_id": id
                }
            }
        }
    });
}

exports.deleteIndex = deleteIndex;
exports.createIndex = createIndex;
exports.indexExists = indexExists;
exports.indexMapping = indexMapping;
exports.addDocument = addDocument;
exports.deleteDocument = deleteDocument;
exports.getSuggestions = getSuggestions;
exports.getStat = getStat;
exports.getDefaultObject = getDefaultObject;
exports.deleteByQuery = deleteByQuery;
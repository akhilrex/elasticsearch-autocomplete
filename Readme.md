# Elasticsearch Autocomplete Standalone Microsite

This is a simple standalone application that can be independently deployed to provide fast autocomplete functionality using a REST API. The API is powered by expressjs (node). It supports maintaining multiple indexes so that a single deployment can be used for multiple separate datasets with a minimal yet extensible document structure.

## Setup

Checkout the repository

```
git checkout https://github.com/akhilrex/elasticsearch-autocomplete.git
```

### Install using Docker

The easiest way to get up and running is using Docker Compose. The compose file will spin 2 containers - one each for elasticsearch and the api.

Update the environment variables in the docker-compose file as per your setup and run the following command. You can keep the default values and they should work just fine but it is highly recommended that you change the token which is used to authorize the admin api end points.

```
 docker-compose up -d
```

### Native Installation

Update the environment variables in the .env file as per your setup and run the following command. It is highly recommended that you change the token which is used to authorize the admin api end points.

```
npm install
node index.js
```

Ideally, you should run the application using a process manager like pm2.

## Admin API

The admin api used Bearer authentication with the token defined in the environment variable `token` as the auth key. If the token environment variable is not set or set to empty the api can be accessed without auth. This is not recommended. Most of the Admin API endpoints return the Elasticsearch API responses as is which you can easily change into custom responses.

### Create Index

**URL** : `/admin/indexes`

**Method** : `POST`

**Data Constraints**
```json
{
    "name":"[valid elasticsearch index name]"
}
```

**Data Example**
```json
{
    "name":"myindex"
}
```

### Delete Index

**URL** : `/admin/indexes/:indexName`

**Method** : `DELETE`

**URL Parameters** : `indexName=[string]` where `indexName` is the name of the index to be deleted.

**Data** : `{}`

### Insert Documents

**URL** : `/admin/indexes/:indexName`

**URL Parameters** : `indexName=[string]` where `indexName` is the name of the index to be deleted.

**Method** : `POST`

**Data Constraints**
```
[{
	"keyword":"[string (required) - phrase to be indexed]",
	"weight":[integer- weight to be assigned for preference],
	"meta": [object - any information that you want to store alongside completion terms.]
}]
```

**Data Example**
```json
[{
	"keyword":"green tshirt",
	"weight":2,
	"meta":{"id":10}
}]
```

### Simple Bulk Insert Documents

Use this endpoint to simply bulk import an array of keywords which do not require any special weights to be provided or have any meta information.

**URL** : `/admin/indexes/:indexName/simplebulk`

**URL Parameters** : `indexName=[string]` where `indexName` is the name of the index to be deleted.

**Method** : `POST`

**Data Constraints**
```
["string"]
```

**Data Example**
```json
["green shirt","blue shirt","red short"]
```
### Delete Singe Document

**URL** : `/admin/indexes/:indexName/:docId`

**Method** : `DELETE`

**URL Parameters** : `indexName=[string]` and `docId=[strig]` where `indexName` is the name of the index and `docId` is the id of the document to be deleted.

**Data** : `{}`

## Suggest API

This is the endpoint that will be return the autocomplete results. Currently this end point does not require any kind of authentication but it can easily be implemented on the lines of Admin section authentication.

**URL** : `/suggest/:indexName/:prefix/:num`

**Method** : `DELETE`

**URL Parameters** : `indexName=[string]` where `indexName` is the name of the index to be deleted. `prefix=[string]` where `prefix` is the input text for autocompletion. `num=[integer]` where `num` is the number of autocompletion results requested. 

**Query Parameters** : `compact=[optional]`. If not passed the output from elasticsearch is returnes as-is. If any value is passed, only the matching documents are retuned.

**Data** : `{}`

**Response Example**

Detailed Response
```json
{
    "took": 11,
    "timed_out": false,
    "_shards": {
        "total": 5,
        "successful": 5,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": 0,
        "max_score": 0,
        "hits": []
    },
    "suggest": {
        "theSuggester": [
            {
                "text": "gre",
                "offset": 0,
                "length": 3,
                "options": [
                    {
                        "text": "green tshirt",
                        "_index": "faballey",
                        "_type": "doc",
                        "_id": "GqT9MnABc0Yb2hhHJq5W",
                        "_score": 4,
                        "_source": {
                            "keyword": {
                                "input": [
                                    "green tshirt"
                                ],
                                "weight": 2
                            },
                            "weight": 2,
                            "meta": {
                                "id": 10
                            }
                        }
                    },
                    {
                        "text": "green dress",
                        "_index": "faballey",
                        "_type": "doc",
                        "_id": "nr_VMnABEqvF9gctqKoP",
                        "_score": 2,
                        "_source": {
                            "keyword": {
                                "input": [
                                    "green dress"
                                ],
                                "weight": 1
                            },
                            "weight": 1
                        }
                    },
                    {
                        "text": "green top",
                        "_index": "faballey",
                        "_type": "doc",
                        "_id": "lb_VMnABEqvF9gctqKoP",
                        "_score": 2,
                        "_source": {
                            "keyword": {
                                "input": [
                                    "green top"
                                ],
                                "weight": 1
                            },
                            "weight": 1
                        }
                    }
                ]
            }
        ]
    }
}
```

Compact Response
```json
[
    {
        "keyword": {
            "input": [
                "green tshirt"
            ],
            "weight": 2
        },
        "weight": 2,
        "meta": {
            "id": 10
        },
        "_id": "GqT9MnABc0Yb2hhHJq5W"
    },
    {
        "keyword": {
            "input": [
                "green dress"
            ],
            "weight": 1
        },
        "weight": 1,
        "_id": "nr_VMnABEqvF9gctqKoP"
    },
    {
        "keyword": {
            "input": [
                "green top"
            ],
            "weight": 1
        },
        "weight": 1,
        "_id": "lb_VMnABEqvF9gctqKoP"
    }
]
```

## How to extend

### Authentication 

By default only admin end points require a fixed bearer token as authentication. Update the auth.js file to build the authentication method as per your requirement. 

### Document Model

Although any data can be saved in the `meta` property of the prescribed document schema, update the `es.js` file to update the methods pertaining to elasticserch.


'use strict';
const
// bodyParser = require('body-parser'),
    config = require('config'),
    express = require('express'),
    request = require('request');

var app = express();
var port = process.env.PORT || process.env.port || 5000;
app.set('port', port);

app.use(express.json());

app.use(express.static('public'));

const SHEETDB_PRODUCTINFO_ID = config.get('productinfo_id');

app.listen(app.get('port'), function() {
    console.log('[app.listen] Node app is running on port', app.get('port'));

})

module.exports = app;

app.post('/webhook', function(req, res) {
    console.log("[WebHook] In");
    let data = req.body;
    console.log(data)
    let queryCategory = data.queryResult.parameters["Category"];



    var thisQs = {};

    if (queryCategory == "熱門") {
        thisQs.IsHot = "TRUE";
    } else {
        thisQs.Category = queryCategory;

    }

    thisQs.casesensitive = false;
    request({
        uri: "https://sheetdb.io/api/v1/" + SHEETDB_PRODUCTINFO_ID + "/search?",
        json: true,
        method: "GET",
        headers: { "Content-Type": "application/json" },
        qs: thisQs

    }, function(error, response, body) {


        if (!error && response.statusCode == 200) {
            console.log("[SheetDB API] Success");
            //sendCards(body, res);
            sendCardsV2(body, res);
        } else {
            console.log("[SheetDB API] failed!")
        }
    });

});

// function sendCards(body, res) {
//     console.log("[sendCarsoulCards] In");
//     console.log(body);
//     var thisFulfillmentMessages = [];
//     for (var x = 0; x < body.length; x++) {
//         var thisObject = {};
//         thisObject.card = {};
//         thisObject.card.title = body[x].Name;
//         thisObject.card.subtitle = body[x].Category;
//         thisObject.card.imageUri = body[x].Photo;
//         thisObject.card.buttons = [{
//             "text": "看大圖",
//             "postback": body[x].Photo
//         }];
//         thisFulfillmentMessages.push(thisObject);
//     }
//     var responseObject = {
//         fulfillmentMessages: thisFulfillmentMessages
//     };
//     res.json(responseObject);
// }

function sendCardsV2(body, res) {
    console.log('[sendCardsV2] In');
    var thisFulfillmentMessages = [];
    var thisLineObject = {
        payload: {
            line: {
                type: "template",
                altText: "this is a carousel template",
                template: {
                    type: "carousel",
                    columns: []
                }
            }
        }
    };

    for (var x = 0; x < body.length; x++) {
        var thisObject = {};
        thisObject.thumbnailImageUrl = body[x].Photo;
        thisObject.imageBackgroundColor = "#FFFFFF";
        thisObject.title = body[x].Name;
        thisObject.text = body[x].Category;
        thisObject.defaultAction = {};
        thisObject.defaultAction.type = "uri";
        thisObject.defaultAction.label = "view detail";
        thisObject.defaultAction.uri = body[x].Photo;
        thisObject.actions = [];
        var thisActionObject = {};
        thisActionObject.type = "uri";
        thisActionObject.label = "view detail";
        thisActionObject.uri = body[x].Photo;
        thisObject.actions.push(thisActionObject);
        thisLineObject.payload.line.template.columns.push(thisObject);
    }

    thisFulfillmentMessages.push(thisLineObject);
    var responseObject = {
        fulfillmentMessages: thisFulfillmentMessages
    };
    res.json(responseObject);
}
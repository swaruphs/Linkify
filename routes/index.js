var express = require('express');
var router = express.Router();
var check = require('check-types');
var hashids = require('hashids');
var mongoose  =  require('mongoose');
var linkModel = mongoose.model('links');
var seqModel = mongoose.model('sequence');
var geoModel = mongoose.model('geolocation');

/* GET home page. */

router.post('/doLink', function(req, res){
    var link = req.body.link;
    console.log('got link'+link);
    var result =  null;
    if(check.webUrl(link)){
        seqModel.increment('seq', function(err, result){
            var next = result.next;
            var hash =  new hashids('link shortening app called linkify',5);
            var key = hash.encode(result.next);
            var url = 'http://'+req.get('host')+'/'+key;
            console.log(' hash url is '+url);
            insert_link(url,link, function(newLink){
                res.json({'status':200, 'hash':newLink.generatedLink});
            })
        });
    }
    else {
        result = 'this is not a web url';
        res.json({'status':400, 'error':result});
    }
});

router.get('/:id', function(req, res){
    var hex =  req.params.id;
    var url = 'http://'+req.get('host')+'/'+hex;
    
    linkModel.findOne({generatedLink:url}, function (err, link) {
        if(!err){
            if(link != null) {
                link.clicks++;
                link.save();
                var ip = req.connection.remoteAddress;
                console.log('got web url '+link.forwardLink);
                res.redirect(link.forwardLink);
            }
            else {
                res.redirect('/');
            }
        }
        else {
            res.redirect('/');
        }
    });
});

router.get('/:id/clicks', function(req, res){

    var hex  = req.params.id;
    var url = 'http://'+req.get('host')+'/'+hex;
    linkModel.findOne({generatedLink:url}, function(err, link){
        if(!err) {
            if(link != null) {
               res.render('clicks',{ clicks: link.clicks});
            }
        }
    });
});

router.get('/', function(req, res){
    res.render('index');
});

router.get('/*', function(req, res) {
    res.redirect('/');
});

var insert_link = function(hashstring, urlString, callback){

    console.log(hashstring);
    console.log(urlString);

    linkModel.create({
        generatedLink:hashstring,
        forwardLink:urlString,
        createdOn:Date.now()
    }, function(err, newLink){
        if(!err){
            callback(newLink);
        }
    });
}

module.exports = router;

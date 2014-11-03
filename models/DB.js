
var mongoose = require('mongoose');
var dbURI = process.env == DEV  ? 'mongodb://localhost/linkify' : ;
mongoose.connect(dbURI);

/**
 * Link Model
 * @type {mongoose.Schema}
 */
var linkModel = new mongoose.Schema({
    generatedLink:{type: String, unique:true},
    forwardLink:{type: String},
    createdOn: {type: Date, default:Date.now},
    clicks:{type:Number, default:0}
});

var geoModel =  new mongoose.Schema({
    generatedLink:{type:String},
    lat:{type:Number, default:0},
    long:{type:Number, default:0},
    country:{type:String}
});

var seqModel = new mongoose.Schema({
    _id:{type:String},
    next:{type:Number}
});

seqModel.statics.increment = function (counter, callback) {
    return this.findByIdAndUpdate(counter, { $inc: { next: 1 } }, {new: true, upsert: true, select: {next: 1}}, callback);
};

mongoose.model('links', linkModel);
mongoose.model('sequence',seqModel);
mongoose.model('geolocation',geoModel);

/**
 *  Mongoose events.
 * */
mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});

process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through app termination');
        process.exit(0);
    });
});

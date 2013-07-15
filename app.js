/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , jsdom = require('jsdom')
  , request = require('request')
  , url = require('url')
  , routes = require('./routes')
  , path = require('path');



var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, '/public')));
});

// development only
app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/steve', function(req, res) {
  request({uri: 'http://www.youtube.com'}, function(err, response, body) {
      var self = this;
      self.items = new Array();

      if (err && response.statusCode !== 200) {
        console.log('Request Error.');
      }

      jsdom.env({
          html: body,
          scripts: ['http://code.jquery.com/jquery-1.6.min.js']
      }, function(err, window) {

            var $ = window.jQuery,
                $body = $('body'),
                $videos = $('*[data-context-item-type="video"]');

                $videos.each(function(i, item) {
                    var $a = $(item).attr('data-context-item-id'),
                        $title = $(item).attr('data-context-item-title'),
                        $time = $(item).attr('data-context-item-time'),
                        $embed = 'http://www.youtube.com/v/'+ $a +'?version=3&autohide=1',

                        $img = $(item).find('span.yt-thumb-clip-inner img');

                    self.items[i] = {
                        href: $a,
                        title: $title.trim(),
                        time: $time,
                        thumbnail: $img.attr('data-thumb') ? $img.attr('data-thumb') : $img.attr('src')
                    };
                });
          res.render('list', {
                  title: 'stevetube',
                  items: self.items
                });
      });
  });
  });
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

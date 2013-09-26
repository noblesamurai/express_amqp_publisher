var amqp = require('amqplib'),
    when = require('when'),
    express = require('express'),
    app = express();

app.use(express.bodyParser());

var amqp_url = process.env.AMQP_URL;

function handleMessage(message) {
  console.log('message handled!');
}

app.post('/publish', function(req, res) {
  console.log('putting it on the queue.');
  console.log(req.body);
  app.amqp_ch.publish('bar', 'baz', new Buffer('hello'));
});

amqp.connect(amqp_url).then(function(conn) {
  var ok = conn.createChannel();
  ok = ok.then(function(ch) {
    app.amqp_ch = ch;
    return when.all([
      ch.assertQueue('foo'),
      ch.assertExchange('bar'),
      ch.bindQueue('foo', 'bar', 'baz')
    ]);
  });
  return ok;
}).then(app.listen(3000), console.warn);

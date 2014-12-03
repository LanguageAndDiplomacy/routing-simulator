var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());


// ============  data  =============

function ConnectionStore() {
  this.data = {};
}
ConnectionStore.prototype.list = function(u) {
  return _.keys(this.data[u]);
};
ConnectionStore.prototype.contains = function(u1, u2) {
  return this.data[u1] && this.data[u1][u2];
};
ConnectionStore.prototype.add = function(u1, u2) {
  if (!this.data[u1]) {
    this.data[u1] = {};
  }
  if (!this.data[u2]) {
    this.data[u2] = {};
  }
  this.data[u1][u2] = true;
  this.data[u2][u1] = true;
};

function MessageStore() {
  this.data = [];
}
MessageStore.prototype.all = function() {
  return this.data.slice(0);
};
MessageStore.prototype.getTo = function(user, since) {
  var start = since ? since : 0;
  return _.filter(this.data.slice(start), {to: user});
};
MessageStore.prototype.getFrom = function(user) {
  return _.filter(this.data, {from: user});
};
MessageStore.prototype.push = function(msg) {
  msg = _.pick(msg, ['body', 'from', 'to']);
  msg.id = this.data.length + 1;
  this.data.push(msg);
  return msg;
};

var USERS = {};
var CONNECTIONS = new ConnectionStore();
var MESSAGES = new MessageStore();


// ========= helpers ==========

function buildUser(name) {
  return {id: name};
}

function buildConnection(from, to) {
  return {from: from, to: to};
}

function isValidMessage(msg) {
  return msg.body &&
    USERS[msg.to] &&
    USERS[msg.from] &&
    CONNECTIONS.contains(msg.from, msg.to);
}

// ========= routes ===========

app.get('/users', function(req, res) {
  res.send(_.keys(USERS).map(buildUser));
});

app.get('/users/:id', function(req, res) {
  var name = req.params.id;
  if (USERS[name]) {
    res.send(buildUser(name));
  } else {
    res.status(404).send('Not Found');
  }
});

app.post('/users', function(req, res) {
  var name = req.body.id;
  if (name) {
    if (USERS[name]) {
      res.status(409).send('That user already exists');
    } else {
      USERS[name] = true;
      res.send(buildUser(name));
    }
  } else {
    res.status(400).send('Must include user id');
  }
});


app.get('/connections', function(req, res) {
  var rel = req.query['related-to'];
  if (rel && USERS[rel]) {
    res.send(CONNECTIONS.list(rel));
  } else {
    res.status(400).send('Bad query param related-to');
  }
});

app.post('/connections', function(req, res) {
  var conn = req.body;
  if (CONNECTIONS.contains(conn.from, conn.to)) {
    res.status(409).send('That connection already exists');
  } else if (USERS[conn.from] && USERS[conn.to]) {
    CONNECTIONS.add(conn.from, conn.to);
    res.send(buildConnection(conn.from, conn.to));
  } else {
    res.status(400).send('Invalid connection');
  }
});


app.get('/messages', function(req, res) {
  res.send(MESSAGES.all());
});
app.post('/messages', function(req, res) {
  var msg = req.body;
  if (isValidMessage(msg)) {
    res.send(MESSAGES.push(msg));
  } else {
    res.status(400).send('Bad message');
  }
});

app.get('/users/:id/messages', function(req, res) {
  var name = req.params.id;
  if (USERS[name]) {
    var since = req.query.since ? parseInt(req.query.since) : null;
    res.send(MESSAGES.getTo(name, since));
  } else {
    res.status(404).send('Not Found');
  }
});

app.get('/users/:id/sent-messages', function(req, res) {
  var name = req.params.id;
  if (USERS[name]) {
    res.send(MESSAGES.getFrom(name));
  } else {
    res.status(404).send('Not Found');
  }
});


// =========== debug ==========

function setupTestData() {
  USERS['alice'] = true;
  USERS['bob'] = true;
  USERS['carol'] = true;
  USERS['dave'] = true;

  CONNECTIONS.add('alice', 'bob');
  CONNECTIONS.add('alice', 'carol');
  CONNECTIONS.add('bob', 'dave');
  CONNECTIONS.add('carol', 'dave');

  MESSAGES.push({from: 'alice', to: 'bob', body: 'hi to bob'});
  MESSAGES.push({from: 'bob', to: 'alice', body: 'hi to alice'});
  MESSAGES.push({from: 'dave', to: 'carol', body: 'hi to carol'});
}

app.listen(app.get('port'), function() {
  setupTestData();
  console.log("Node app is running at localhost:" + app.get('port'));
});


var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/dist'));
app.use(bodyParser.json());


// ============  data  =============

function ConnectionStore() {
  this.reset();
}
ConnectionStore.prototype.reset = function() {
  this.data = {};
};
ConnectionStore.prototype.all = function() {
  var data = this.data;
  var results = {};
  _.keys(data).forEach(function(u1) {
    _.keys(data[u1]).forEach(function(u2) {
      var uniqid = [u1, u2].sort().join();
      results[uniqid] = buildConnection(u1, u2);
    });
  });
  return _.values(results);
};
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
ConnectionStore.prototype.remove = function(u1, u2) {
  if (this.contains(u1, u2)) {
    delete this.data[u1][u2];
    delete this.data[u2][u1];
    return true;
  }
  return false;
};

function MessageStore() {
  this.reset();
}
MessageStore.prototype.reset = function() {
  this.data = [];
};
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

function allUsers() {
  return _.chain(USERS).keys().without('tealsteachers').value();
}

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
  res.send(allUsers().map(buildUser));
});

app.delete('/users/:id', function(req, res) {
  delete USERS[req.params.id];
  res.send('ok');
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
  } else if (!rel) {
    res.send(CONNECTIONS.all());
  } else {
    res.status(400).send('Invalid related-to');
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

app.delete('/connections/:from/:to', function(req, res) {
  var q = req.params;
  if (CONNECTIONS.remove(q.from, q.to)) {
    res.send('ok');
  } else {
    res.status(404).send('Not Found');
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

app.post('/admin/reset', function(req, res) {
  MESSAGES.reset();
  CONNECTIONS.reset();
  res.send('ok');
});

app.post('/admin/topology/ring', function(req, res) {
  CONNECTIONS.reset();
  var users = allUsers();
  for (var i = 0; i < users.length; i++) {
    var next = (i + 1) % users.length;
    CONNECTIONS.add(users[i], users[next]);
  }
  res.send(CONNECTIONS.all());
});

app.post('/admin/generate-messages', function(req, res) {
  var users = _.shuffle(allUsers());
  var messages = [];
  for (var i = 0; i < users.length; i++) {
    var next = (i + 1) % users.length;
    messages.push({from: users[i], to: users[next]});
  }
  res.send(messages);
});

// =========== debug ==========

function setupTestData() {
  /*
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
  */
}

app.listen(app.get('port'), function() {
  setupTestData();
  console.log("Node app is running at localhost:" + app.get('port'));
});


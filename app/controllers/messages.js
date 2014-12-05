import Ember from 'ember';
import ajax from '../utils/ajax';

export default Ember.ArrayController.extend({
  needs: ['login'],
  sortProperties: ['id'],
  sortAscending: false,

  me: Ember.computed.alias('controllers.login.name'),
  latestMessageId: Ember.computed.alias('firstObject.id'),
  nConnections: Ember.computed.alias('connections.length'),

  pendingTo: null,
  pendingText: null,
  pendingMessage: Ember.computed('pendingTo', 'pendingText', 'me', function() {
    var msg = {
      to: this.get('pendingTo'),
      body: this.get('pendingText'),
      from: this.get('me')
    };
    if (msg.to && msg.body && msg.from) {
      return msg;
    }
    return null;
  }),
  pendingMessageInvalid: Ember.computed.equal('pendingMessage', null),

  composerIsOpen: false,
  composerSendSuccess: false,
  composerIsSending: false,

  cantSend: Ember.computed.or('composerIsSending', 'pendingMessageInvalid'),

  actions: {
    reload: function() {
      this.get('target').send('reload');
    },
    openComposer: function() {
      this.set('composerIsOpen', true);
      this.set('composerSendSuccess', false);
      this.set('pendingTo', this.get('connections.firstObject'));
    },
    cancelComposer: function() {
      this.set('composerIsOpen', false);
      this.set('pendingTo', this.get('connections.firstObject'));
      this.set('pendingText', null);
    },
    send: function() {
      var _this = this;
      this.set('composerIsSending', true);
      ajax({
        type: 'POST',
        url: '/messages',
        data: JSON.stringify(this.get('pendingMessage')),
        contentType: 'application/json',
        dataType: 'json'
      }).then(function(msg) {
        _this.set('pendingText', null);
        _this.set('composerSendSuccess', true);
        _this.set('composerIsOpen', false);
        _this.set('composerIsSending', false);
        _this.get('sentMessages').unshiftObject(msg);
      }, function(error) {
        console.log(error);
        alert('Unable to send message. Please reload');
      });
    }
  }
});

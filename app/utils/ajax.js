import Ember from 'ember';

export default function ajax(opts) {
  return new Ember.RSVP.Promise(function(resolve, reject) {
    opts.success = resolve;
    opts.error = reject;
    Ember.$.ajax(opts);
  });
}

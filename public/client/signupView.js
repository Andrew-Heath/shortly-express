Shortly.signupView = Backbone.View.extend({
  className: 'signup',

  template: Templates['signup'],

  events: {
    'submit': 'signup'
  },

  render: function() {
    this.$el.html( this.template() );
    return this;
  },

  signup: function() {
    var $username = this.$el.find('input #username');
    var username = $username.val();

    var $password = this.$el.find('input #password');
    var password = $password.val();

    $username.val('');
    $password.val('');

    var options = {
      'method': 'POST',
      'uri': 'http://127.0.0.1:4568/signup',
      'json': {
        'username': username,
        'password': password
      }
    };
    
  }


});

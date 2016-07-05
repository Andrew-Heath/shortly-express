Shortly.loginView = Backbone.View.extend({
  className: 'login',

  template: Templates['login'],

  events: {
    'submit': 'login'
  },

  render: function() {
    this.$el.html( this.template() );
    return this;
  }, 
  login: function() {
    e.preventDefault();

    var $username = this.$el.find('input #username');
    var username = $username.val();
    $username.val('');

    var $password = this.$el.find('input #password');
    var password = $password.val();
    $password.val('');

    var options = {
      'method': 'POST',
      'uri': 'http://127.0.0.1:4568/login',
      'json': {
        'username': username,
        'password': password
      }
    };
  }
});

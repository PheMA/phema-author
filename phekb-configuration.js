var configuration = {
  baseUrl: 'http://local.phekb.org',

  // api_key must match the api key specified at phekb.org/admin/phema/config 
  apiKey: 'abc123',

};

exports.config = function() {
  return JSON.parse(JSON.stringify(configuration));
};

exports.index = function(req, res){
  //res.render('index', { title: 'Route Separation Example' });
  res.sendfile(__dirname + '/dist/index.html');
};
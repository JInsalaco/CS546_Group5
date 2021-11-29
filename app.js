const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const configRoutes = require('./routes');
const static = express.static(__dirname + '/public');
const session = require('express-session');



app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', exphbs({ defaultLayout: 'main', partialsDir: 'views/partials' }));
app.set('view engine', 'handlebars');

app.use(session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: true
  })
);
configRoutes(app);

app.listen(3000, () => {
	console.log('Your routes will be running on http://localhost:3000');
});

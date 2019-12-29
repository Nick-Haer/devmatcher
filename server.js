const express = require('express');

const app = express();

const dbConnector = require('./config/db');

const routes = require('./routes/apiRoutes/index');

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(routes);

dbConnector();

app.get('/', (req, res) => {
  res.status(200).json('Major tom to ground conrol');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started on port ${PORT}`));

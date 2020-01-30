const mongoose = require('mongoose');

const config = require('config');

const db = config.get('mongoURI');

console.log(db);

const dbConnect = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    console.log('MongoDb connected');
  } catch (err) {
    console.error(err.message);
    // exit the program on an error
    process.exit(1);
  }
};

module.exports = dbConnect;

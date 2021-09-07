const Sequelize = require('sequelize');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { STRING } = Sequelize;
const config = {
  logging: false
};

const SECRET = "COUNTER_STRIKE_FORTNITE";

if(process.env.LOGGING){
  delete config.logging;
}
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db', config);

const User = conn.define('user', {
  username: STRING,
  password: STRING
});



User.byToken = async(token)=> {
  try {
    const userId = jwt.verify(token, SECRET);
    const user = await User.findByPk(userId.userId);
    if(user){
      return user;
    }
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
  catch(ex){
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
};

User.authenticate = async({ username, password })=> {
  const user = await User.findOne({
    where: {
      username,
      
    }
  });
  if(user && bcrypt.compare(password, user.password)){
    // return user.id; 
    let token = jwt.sign({userId: user.id}, SECRET);
    
    return token;
  }
  const error = Error('bad credentials');
  error.status = 401;
  throw error;
};

User.beforeCreate(async (user, options) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.dataValues.password = hashedPassword;
})

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const credentials = [
    { username: 'lucy', password: 'lucy_pw'},
    { username: 'moe', password: 'moe_pw'},
    { username: 'larry', password: 'larry_pw'}
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map( credential => User.create(credential))
  );
  return {
    users: {
      lucy,
      moe,
      larry
    }
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User
  }
};
const { verifySignUp } = require('./middleware')
const controller = require('./controllers/auth.controller')

module.exports = function (app) {
  const URI = process.env.NFTEE_DB || 'mongodb://localhost:27017'
  const DB = process.env.NFTEE_DATABASE || 'nftees'

  const db = require('./models')
  const Role = db.role

  db.mongoose
    .connect(`${URI}/${DB}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Successfully connect to MongoDB.')
      initial()
    })
    .catch((err) => {
      console.error('Connection error', err)
      process.exit()
    })

  function initial() {
    Role.estimatedDocumentCount((err, count) => {
      if (!err && count === 0) {
        new Role({
          name: 'user',
        }).save((err) => {
          if (err) {
            console.log('error', err)
          }

          console.log("added 'user' to roles collection")
        })

        new Role({
          name: 'moderator',
        }).save((err) => {
          if (err) {
            console.log('error', err)
          }

          console.log("added 'moderator' to roles collection")
        })

        new Role({
          name: 'admin',
        }).save((err) => {
          if (err) {
            console.log('error', err)
          }

          console.log("added 'admin' to roles collection")
        })
      }
    })
  }

  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    )
    next()
  })

  app.post(
    '/auth/signup',
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    controller.signup
  )

  app.post('/auth/signin', controller.signin)
}

/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const winston = require('winston')
const config = require('../auth.config')
const db = require('../models')

const WINSTON_FORMAT = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info
    return `${timestamp} - [AUTH CONTROLLER] - [${level}]: ${message} \n${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`
  })
)
const LOGGER = winston.createLogger({
  format: WINSTON_FORMAT,
  transports: [
    new winston.transports.Console({
      level: process.env.DEBUG_LEVEL || 'debug',
      json: true,
      colorize: true,
    }),
  ],
})

const User = db.user
const Role = db.role

exports.signup = (req, res) => {
  LOGGER.debug({ message: 'New Signup Request', body: req.body })
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  })

  user.save((err, user) => {
    if (err) {
      LOGGER.Error({ message: 'Failed to save user.', err })
      res.status(500).send({ message: err })
      return
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err })
            return
          }

          user.roles = roles.map((role) => role._id)
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err })
              return
            }

            res.send({ message: 'User was registered successfully!' })
          })
        }
      )
    } else {
      Role.findOne({ name: 'user' }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err })
          return
        }

        user.roles = [role._id]
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err })
            return
          }

          res.send({ message: 'User was registered successfully!' })
        })
      })
    }
  })
}

exports.signin = (req, res) => {
  LOGGER.debug({ message: 'New Signin Request', body: req.body })
  User.findOne({
    email: req.body.email,
  })
    .populate('roles', '-__v')
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err })
        return
      }

      if (!user) {
        return res.status(404).send({ message: 'User Not found.' })
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      )

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: 'Invalid Password!',
        })
      }

      const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, // 24 hours
      })

      const authorities = []

      for (let i = 0; i < user.roles.length; i += 1) {
        authorities.push(`ROLE_${user.roles[i].name.toUpperCase()}`)
      }
      res.status(200).send({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          roles: authorities,
        },
        token,
      })
    })
}

exports.getuser = (req, res) => {
  LOGGER.debug({
    message: 'New get user request',
    body: req.body,
    token: req.headers['x-access-token'],
  })
  const token = req.headers['x-access-token'].replace('Bearer ', '')

  if (!token) {
    LOGGER.error({
      message: 'No token provided',
      token: req.headers['x-access-token'],
    })
    return res.status(403).send({ message: 'No token provided!' })
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      LOGGER.error({ message: 'Error decoding token', err })
      return res.status(500).send({ message: 'Error decoding token', err })
    }

    LOGGER.debug({ message: 'Decoded token', decoded })
    User.findOne({ id: decoded.id }, (err, user) => {
      if (err) {
        LOGGER.error({ message: 'Error querying database', err })
        return res.status(500).send({ message: 'Error querying database', err })
      }
      return res.json({
        status: 'success',
        user,
      })
    })
  })
}

exports.update = (req, res) => {
  LOGGER.debug({
    message: 'New update user request',
    body: req.body,
    token: req.headers['x-access-token'],
  })
  const token = req.headers['x-access-token'].replace('Bearer ', '')

  if (!token) {
    LOGGER.error({
      message: 'No token provided',
      token: req.headers['x-access-token'],
    })
    return res.status(403).send({ message: 'No token provided!' })
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      LOGGER.error({ message: 'Error decoding token', err })
      return res.status(500).send({ message: 'Error decoding token', err })
    }

    LOGGER.debug({ message: 'Decoded token', decoded })
    User.findOne({ id: decoded.id }, (err, user) => {
      if (err) {
        LOGGER.error({ message: 'Error querying database', err })
        return res.status(500).send({ message: 'Error querying database', err })
      }

      // Signed in, update information.
      LOGGER.debug({ message: 'Updating User', user })
      User.updateOne(
        { id: decoded.id },
        { $set: { ...req.body } },
        (err, user) => {
          if (err) {
            LOGGER.error({ message: 'Error updating database', err })
            return res
              .status(500)
              .send({ message: 'Error updating database', err })
          }
          LOGGER.debug({ message: 'Database updated', user })

          return res.json({
            status: 'success',
            user,
          })
        }
      )
    })
  })
}

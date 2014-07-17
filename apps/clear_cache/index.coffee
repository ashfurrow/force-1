express = require 'express'
{ flushall } = require '../../lib/cache'

app = module.exports = express()
app.set 'views', __dirname
app.set 'view engine', 'jade'

app.all '/clear-cache', all = (req, res, next) ->
  return next() if req.user?.get('type') is 'Admin'
  res.status 403
  next new Error "You must be logged in as an admin to clear the cache."
app.get '/clear-cache', get = (req, res) ->
  res.render 'index'
app.post '/clear-cache', post = (req, res, next) ->
  flushall -> res.redirect '/'
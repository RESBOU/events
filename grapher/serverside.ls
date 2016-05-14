require! {
  util
  ribcage
  leshdash: { mapValues, each, assign, keys }
  bluebird: p
  
  express
  ejs
  'body-parser'
  'socket.io': io
}

env = {}

settings = do
  module:
    express4:
      port: 3002
      configure: ->
        it.set 'x-powered-by', false
 
        it.use bodyParser.json()
        it.use express.static __dirname + '/static', do
          etag: true
          dotfiles: 'ignore'
        
        it.set 'view engine', 'ejs'
        it.set 'views', __dirname + '/views'
        

env.settings = assign settings, require './settings'

initRibcage = -> new p (resolve,reject) ~>
  ribcage.init env, (err, modules) ->
    if err then return reject err
    else resolve modules

initIO = -> new p (resolve,reject) ~>
  env.io = io env.http
  env.io.on 'connection', -> console.log "CONNECT"
  
  resolve!

initAPI = -> new p (resolve,reject) ~>
  env.data = {}
  env.idCnt = 0

  newId = -> env.idCnt += 1
    
  env.app.use (err, req, res, next) ~>
    res.status(500).send util.inspect(err)
    throw err
      
  env.app.post '/add', (req,res) ->
    if not req.body.id then req.body.id = newId()
    env.data[req.body.id] = req.body
    console.log 'add', req.body
    env.io.emit('update', req.body.id)
    env.io.emit 'graphs', keys env.data
    res.end String req.body.id
    
  resolve!

initRoutes = -> new p (resolve,reject) ~>
  env.app.get '/view/:id', (req,res) ->
    data = env.data[req.params.id] or { id: req.params.id , data: [] }
    assign data, graphs: keys env.data
    res.render 'view', { layout: 'layout', id: req.params.id, data: data}
  resolve!
  
initRibcage()
.then initAPI
.then initIO
.then initRoutes
.then -> new p (resolve,reject) ~>
  env.log 'running', {}, 'init', 'ok'
  resolve!

require! {
  bluebird: p
  leshdash: { flatten, each, head, rpad, lazy, union, assign, omit, map, curry, times, keys, first, wait }
  request
  '../index': events
}

module.exports = do
  drawEvents: (title, ...data) -> new p (resolve,reject) ~>
    data.reverse!
    req = flatten map data, (something, index) ->
      map do
        switch something@@
          | Array => map something, (.serialize!)
          | events.Event => [ something.serialize! ]
          | events.MemEvents => something.serialize!
          | otherwise => something.serialize!
        -> assign it, { layer: index }
    request.post 'http://localhost:3002/add', { json: { id: title, data: req, type: 'eventlayers' } }, -> resolve!

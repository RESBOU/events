# * require
require! {
  bluebird: p
  leshdash: { w, find, filter, pick, keys, values, pop, assign, each, reduce, flattenDeep, push, map, mapValues, omit }
  
  moment
  'moment-range'
}

# * Type coercion functions for a more chilled out API

format = exports.format = -> it.format('YYYY-MM-DD')

parse = exports.parse = do 
  # (any) -> Event | Error
  event: ->
    switch it@@
      | Event => it
      | Object => new Event it
      | otherwise => throw new Error "invalid type for event #{it@@}"

  # (any) -> MemEvents | Error
  events: ->
    if it instanceof Events then return it
    switch it@@
      | Array => new MemEvents it
      | otherwise => new MemEvents parse.event it

  # (Any) -> Array<Event> | Error
  eventArray: ->
    flattenDeep switch it@@
      | Array => map it, parse.eventArray
      | MemEvents => it.toArray()
      | otherwise => [ parse.event it ]
        
  # ( Events | Event | void ) -> Range
  range: (something, def) ->
    switch something?@@
      | false => def or void
      | Object => new moment.range something
      | Array => new moment.range Array
      | Event => something.range!
      | otherwise => something
    
# ( Events | Array<Event> | Event | void ) -> Array<Event>
  eventCollection: (something) ->
    switch something?@@
      | void => []
      | Event => [ Event ]
      | Events => Events.toArray()
      | Array => flattenDeep something
      | otherwise => throw 'what is this'

# * EventLike
# more of a spec then anything, this is implemented by Event & Events
# 

EventLike = exports.EventLike = class EventLike

  # fetches all events from a collection relevant to current event (by type and range)
  # ( Events ) -> Events
  relevantEvents: (events) ->
    parse.events events
    .filter range: @ #, type: @type ## TODO

  # ( EventLike ) -> Events
  push: (event) -> ...
  
  # ( EventLike ) -> Events
  subtract: (something) ->
    if something instanceof Events then @subtractMany something
    else @subtractOne something
    
  # ( EventLike, (Event, Event) -> Events) -> Events
  collide: (events, cb) -> ...

  # () -> moment.range
  range: -> ...

  each: -> ...

  subtractMany: -> ...

  subtractOne: -> ...

# * Event
# represents some event in time, defined by start and end timestamps
# caries some payload, like a price or a booking

parseInit = (data) ->
  if not data then return {}
  if data.center then return { start: data.start, end: data.end }
  if data.range
    data.start = data.range.start
    data.end = data.range.end
    delete data.range
    return data
    
  if data@@ isnt Object then return "wut wut"
  else return data

Event = exports.Event = class Event extends EventLike
  (init) -> assign @, parseInit init

  clone: (data={}) ->
    new Event assign {}, @, { id: @id + '-clone'}, data

  # () -> Json
  serialize: ->
    assign {}, @, mapValues (pick @, <[ start end ]>), (value) -> value.utc().format "YYYY-MM-DD HH:mm:ss"

  # () -> String
  toString: ->
    start = format @start
    end = format @end
    if @price then "Price(" + @price + " " + start + ")"
    else "Event(" + @id + ")"

  # get or set range
  # (range?) -> moment.range
  range: (setRange) ->
    if range = setRange
      @start = range.start.clone()
      @end = range.end.clone()
    else
      range = new moment.range @start, @end
      
    return range
    
  # ( Events ) -> Events
  subtractMany: (events) ->
    @relevantEvents events
    .reduce do
      (res, event) ~> res.subtractOne event
      new MemEvents @
      
  # ( Event ) -> Events
  subtractOne: (event) ->
    cnt = 0
    new MemEvents map do
      @range().subtract event.range()
      ~> @clone { start: it.start, end: it.end, id: @id + '-' + cnt++ }

  # ( Events, (Event, Event) -> Events ) -> Events
  collide: (events, cb) ->
    @relevantEvents events
    .reduce (events, event) ~> events.pushm cb event, @

  each: (cb) -> cb @

# * Events
# abstract event collection
# supporting common set operations,
# and some uncommon operations related to time (collide, subtract)
 
Events = exports.Events = class Events extends EventLike
  (...events) -> @pushm.apply @, events

  # ( MomentRange, Object ) -> Events
  _find: (range, pattern) -> ...
    
  # ( rangeEquivalent ) -> Events
  clone: (rangeEquivalent) ~> ...

  # ( EventCollection) -> Events
  pushm: (eventCollection) -> true

  # ( EventCollection) -> Events
  push: (eventCollection) -> @clone events

  # ( Function ) -> void
  each: (cb) -> @_each cb

  # () -> String
  toString: -> "E < " + (@map (event) -> "" + event).join(", ") + " >"

  # () -> Json
  serialize: -> @map (.serialize!)

  # () -> Array<Event>
  toArray: ->
    ret = []
    @each -> ret.push it
    ret

  # ( (Event) -> any) ) -> Array<any>
  map: (cb) ->
    ret = []
    @each (event) -> ret.push cb event
    ret
    
  # ( (Events, Event) -> Events ) -> Array<any>
  rawReduce: (cb, memo) ->
    @each (event) -> memo := cb memo, event
    memo
    
  # ( (Events, Event) -> Events ) -> Events
  reduce: (cb, memo) ->
    if not memo then memo = new MemEvents()
    @rawReduce cb, memo

  # ( { range: Range, ... } ) -> Events
  filter: (pattern) ->
    @_filter do
      parse.range pattern.range
      omit pattern, 'range'

  # ( Events ) -> Events
  updatePrice: (priceData) ->    
    parse.events priceData
    .reduce (res, event) ~>

      targets = event.relevantEvents @
      
      if not targets.length then return res.pushm event
        
      res.pushm targets.collide event, (event1, event2) ->
        if event1.price is event2.price
          res.pushm event2.clone range: event1.range!add event2.range!
        else
          res.pushm [ event1, event2.subtract(event1) ]


  update: (events) ->
    
    res = new MemEvents()

    @filter range: events
    
    .map (event) ~> 
      collisions = event.relevantEvents events
      if not collisions.length then event.markDelete!
      else
        map collisions, (collision) ->
          
      res.pushm @collide event, (oldEvent, newEvent) ->
        if newEvent.type isnt oldEvent.type then return
        if oldEvent.equals newEvent then return
        
        # need update
        [ oldEvent.markRemove!, newEvent ]
        
        
          
  # ( Events ) -> Events
  union: (events) ->
    res = @clone()
    events.each ~> res.pushm it
    res

  # ( (Events, (Event1, Event2) -> Events ) -> Events
  collide: (events, cb) ->
    @reduce (memo, event) -> memo.pushm event.collide events, cb

  # ( Event ) -> Events
  subtractOne: (event) ->
    @reduce (ret, child) -> ret.pushm child.subtract event

  # ( Events ) -> Events
  subtractMany: (events) ->
    @reduce (ret, child) -> ret.pushm child.subtractMany events

  
# * MemEvents
# In memory Event collection implementation,
# this is a very naive implementation
# 
# I guess we should use range tree data structure or something smart like that for fast range search in the future.
# its good enough for now even if we end up quadratic complexity for algos, we are not parsing many events per property.
# 
MemEvents = exports.MemEvents = class MemEventsNaive extends Events
  ->
    assign @, do
      events:  {}
      length: 0
      type: {}
    super ...
    
  toArray: -> values @events

  _each: (cb) -> each @events, cb

  _rangeSearch: (range) ->
    filter @events, ->
      range.contains it.start or range.contains it.end or it.range!.contains range
      
  _filter: (range, pattern) ->
    ret = new MemEvents()
    
    if range then events = @_rangeSearch range
    else events = values @events

    checkPattern = (pattern) ->
      (event) ->
        not find pattern, (value, key) ->
          if value is true then return not event[key]?
          else
            if event[key] is value then return false else return true
              
    ret.pushm filter events, checkPattern pattern
    ret
        
  pushm: (...events) ->
    each parse.eventArray(events), (event) ~>
      if not event then return
      if @events[event.id]? then return
      @events[event.id] = event
      @type[event.type] = true
      @length++
    @
  

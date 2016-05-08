# * require
require! {
  bluebird: p
  leshdash: { w, filter, pick, keys, values, pop, assign, each, reduce, flattenDeep, push, map, mapValues }
  
  moment
  'moment-range'
  'interval-tree2': Tree
}

# * Type transformers
# quick type conversions for a more comfy API

format = exports.format = -> it.format('YYYY-MM-DD')
 
# (any) -> Event | Error
resolveEvent = ->
  switch it@@
    | Event => it
    | Object => new Event it
    | otherwise => throw new Error "invalid type for event #{it@@}"

# (any) -> MemEvents | Error
resolveEvents = ->
  if it instanceof Events then return it
  switch it@@
    | Array => new MemEvents it
    | otherwise => new MemEvents resolveEvent it

# (Any) -> Array<Event> | Error
resolveEventArray = ->
  flattenDeep switch it@@
    | Array => map it, resolveEventArray
    | MemEvents => it.toArray()
    | otherwise => [ resolveEvent it ]
        
# ( Events | Event | void ) -> Range
resolveRange = (something) ->
  switch something@@
    | Object => new moment.range something
    | Array => new moment.range Array
    | Event => something.range!
    | otherwise => something
    
# ( Events | Array<Event> | Event | void ) -> Array<Event>
resolveEventCollection = (something) ->
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
  # ( Events ) -> Events
  relevantEvents: (events) ->
    resolveEvents events
      .filter range: @
      
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

  clone: (data) ->
    new Event assign {}, @, { id: @id + '-split'}, parseInit data

  # () -> Json
  serialize: ->
    assign {}, @, mapValues (pick @, [ 'start', 'end' ]), (value) -> value.utc().format("YYYY-MM-DD HH:mm:ss")

  # () -> String
  toString: ->
    start = format @start
    end = format @end
    if @price then "Price(" + @price + " " + start + ")"
    else "Event(" + @id + ")"

  # () -> moment.range
  range: -> new moment.range @start, @end 
    
  # ( Events ) -> Events
  subtractMany: (events) ->
    @relevantEvents events
      .reduce do
        (memo, event) ~> memo.subtract event
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
      resolveRange pop pattern, 'range'
      pattern

  # ( Events ) -> Events
  updatePrice: (priceData) ->
    @collide priceData, (event1, event2) ->
#      if event1.price is event2.price
#        event2.subtract event1
#        .pushm event1
#      else
        event1.subtract event2
        .pushm event2

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
# In memory Events implementation, using range tree data structure for fast search
#
MemEvents = exports.MemEvents = class MemEventsNaive extends Events
  ->
    assign @, do
      events:  {}
      length: 0
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

    ret.pushm events      
    ret
        
  pushm: (...events) ->
    each resolveEventArray(events), (event) ~>
      if not event then return
      if @events[event.id]? then return
      @events[event.id] = event
      @length++
    @
  

class MemEventsTree
  ->
    assign @, do
      tree: new Tree new Date!getTime!
      events:  {}
      length: 0
      
    super ...
    
  toArray: -> values @events

  _each: (cb) -> each @events, cb

  _filter: (range, pattern) ->
    ret = new MemEvents()
    
    if range
      search = @tree.rangeSearch range.start.unix!, range.end.unix!
      events = map search, ~> @events[it.id]
    else events = values @events

    ret.pushm events      
    ret
        
  pushm: (...events) ->
    each resolveEventArray(events), (event) ~>
      if not event then return
      if @events[event.id]? then return
      @tree.add event.start.unix!, event.end.unix!, event.id
      @events[event.id] = event
      @length++
    @

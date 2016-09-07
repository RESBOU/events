require! {
  assert
  util
  
  bluebird: p
  leshdash: { head, rpad, lazy, union, assign, omit, map, curry, times, keys, first, wait }
  
  chai: { expect }

  moment
  'moment-range'

  '../index': events
  '../grapher/client': eventGrapher
}

xspecify = -> true

describe 'events', ->
  before -> new p (resolve,reject) ~>
     
    e = do
      type: 'price'
      
    @start = start = new moment('2016-04-23T00:00:00+02:00')
    .startOf 'month'

    eventArray = []
    
    eventArray.push assign {}, e,
      id: 'ea1'
      start: start.clone()
      end: start.clone().add 5, 'days'
      payload: 100

    eventArray.push assign {}, e,
      id: 'ea2'
      start: start.clone().add 5, 'days'
      end: start.clone().add 10, 'days' e
      payload: 125

    eventArray.push assign {}, e,
      id: 'ea3'
      start: start.clone().add 10, 'days'
      end: start.clone().add 15, 'days'
      payload: 150

    @events = new events.MemEvents map eventArray, -> new events.Event it

    @event1 = new events.Event do
      id: "event1"
      type: "price"
      start: @start.clone().add 1 'days'
      end: @start.clone().add 3 'days'
      payload: 300

    @event2 = new events.Event do
      id: 'event2'
      type: "price"
      start: @start.clone().add 2 'days'
      end: @start.clone().add 4 'days'
      payload: 600

    resolve!
    
  specify 'init', -> new p (resolve,reject) ~>
    expect @events.length
      .to.equal 3
    
    expect keys @events.events
      .to.have.lengthOf 3
      
    resolve!

    
  specify 'serializeOne', -> new p (resolve,reject) ~>
    expect @event1.serialize()
    .to.deep.equal { id: "event1", start: '2016-04-02 00:00:00', end: '2016-04-04 00:00:00', payload: 300, type: 'price' }
    resolve!

  specify 'serializeMany', -> new p (resolve,reject) ~>
    expect @events.serialize()
    .to.be.a 'array'
    resolve!

  specify 'range', -> new p (resolve,reject) ~>
    end = @start.clone().add 9,'days'
    
    expect do
      @events.filter range: moment.range(@start, end), { type: 'price' }
      .map (.payload)

    .to.deep.equal [ 100, 125 ]

    resolve!

  specify 'filter', -> new p (resolve,reject) ~>
    filterQuery1 = new events.Event start: @start.clone().add(1,'days'), end: @start.clone().add(4, 'days')
    res1 = @events.filter range: filterQuery1

    expect res1.serialize!
    .to.deep.equal do
      [ {
        type: 'price',
        id: 'ea1',
        start: '2016-04-01 00:00:00',
        end: '2016-04-06 00:00:00',
        payload: 100 } ]

    filterQuery2 = new events.Event start: @start.clone().subtract(1,'days'), end: @start.clone().add(8, 'days')
    res2 = @events.filter range: filterQuery2

    expect res2.serialize!
    .to.deep.equal do
      [ { type: 'price',
      id: 'ea1',
      start: '2016-04-01 00:00:00',
      end: '2016-04-06 00:00:00',
      payload: 100 },
      { type: 'price',
      id: 'ea2',
      start: '2016-04-06 00:00:00',
      end: '2016-04-11 00:00:00',
      payload: 125 } ]

    filterQuery3 = new events.Event start: @start.clone().add(1,'days'), end: @start.clone().add(17, 'days')
    res3 = @events.filter range: filterQuery3

    expect res3.serialize!
    .to.deep.equal do
      [ { type: 'price',
      id: 'ea1',
      start: '2016-04-01 00:00:00',
      end: '2016-04-06 00:00:00',
      payload: 100 },
      { type: 'price',
      id: 'ea2',
      start: '2016-04-06 00:00:00',
      end: '2016-04-11 00:00:00',
      payload: 125 },
      { type: 'price',
      id: 'ea3',
      start: '2016-04-11 00:00:00',
      end: '2016-04-16 00:00:00',
      payload: 150 } ]

    eventGrapher.drawEvents 'filter', @events, filterQuery1, res1, filterQuery2, res2, filterQuery3, res3
    resolve!
        

  specify 'parse events', -> new p (resolve,reject) ~>
    expect @events instanceof events.Events
    .to.equal true

    expect events.parse.events @events
    .to.equal @events
    
    resolve!
    
  specify 'diff-update-merge', -> new p (resolve,reject) ~>

    dummy1 = new events.Event do
      id: 'd1'
      start: @start.clone().add 6, 'days'
      end: @start.clone().add 8, 'days'
      payload: 195
      type: 'price'
      
    dummy2 = new events.Event do
      id: 'd2'
      start: @start.clone().add 9, 'days'
      end: @start.clone().add 17, 'days'
      payload: 150
      type: 'price'

    dummy3 = new events.Event do
      id: 'd3'
      start: @start.clone().add 17, 'days'
      end: @start.clone().add 23, 'days'
      payload: 175
      type: 'price'


    dummies = new events.MemEvents [ @event1, dummy1, dummy2, dummy3 ]

    targets = @events.clone()

    targets
      .pushm new events.Event {
        id: 'ea4'
        start: @start.clone().add 15, 'days'
        end: @start.clone().add 20, 'days'
        payload: 175 }
        
    targets
      .pushm new events.Event {
        id: 'ea0'
        start: @start.clone().subtract 2, 'days'
        end: @start.clone()
        payload: 175}

    diff = targets.diff dummies

    [ create, remove ] = targets.update diff

    res = targets.clone().subtract(remove).pushm create
    
    
    eventGrapher.drawEvents 'diff-update-merge', targets, dummies, diff, remove, create, res
    resolve!
        
  specify 'neighbours', -> new p (resolve,reject) ~>
    [ start, end ] = @events.events['ea2'].neighbours @events

    expect start.serialize()
    .to.deep.equal do
      [
        type: 'price',
        id: 'ea1',
        start: '2016-04-01 00:00:00',
        end: '2016-04-06 00:00:00',
        payload: 100
      ]
      
    expect end.serialize()
    .to.deep.equal do
      [
        type: 'price',
        id: 'ea3',
        start: '2016-04-11 00:00:00',
        end: '2016-04-16 00:00:00',
        payload: 150 
      ]

    eventGrapher.drawEvents 'neighbours', @events, start, end
    resolve!

  specify 'reduce', -> new p (resolve,reject) ~>
    res = @events.reduce (events, event) ->
      range = event.range!
      range.start.add '2', 'days'
      range.end.add '2', 'days'
      if event.payload isnt 125
        events.pushm event.clone range
      else
        range1 = moment.range range.start, range.center!
        range2 = moment.range range.center!, range.end
        events.pushm do
          event.clone range: range1, id: event.id + '-split1'
          event.clone range: range2, id: event.id + '-split2'

    eventGrapher.drawEvents 'reduce', @events, res
    
    expect res.serialize()
    .to.deep.equal do
      [ {
        type: 'price',
        id: 'ea1-clone',
        start: '2016-04-03 00:00:00',
        end: '2016-04-08 00:00:00',
        payload: 100
      }
      {
        type: 'price',
        id: 'ea2-split1',
        start: '2016-04-08 00:00:00',
        end: '2016-04-10 12:00:00',
        payload: 125
      },
      {
        type: 'price',
        id: 'ea2-split2',
        start: '2016-04-10 12:00:00',
        end: '2016-04-13 00:00:00',
        payload: 125
      }
      {
        type: 'price',
        id: 'ea3-clone',
        start: '2016-04-13 00:00:00',
        end: '2016-04-18 00:00:00',
        payload: 150
      }]

    resolve!

  specify 'collideOne', -> new p (resolve,reject) ~>

    crashDummy = new events.Event do
      id: 'crashDummy'
      start: @start.clone().add 1 'days'
      end: @start.clone().add 8 'days'
      payload: 300
      
    res1 = crashDummy.collide @events, (e1,e2) -> [ e1 ]

    expect res1.map -> it.payload
    .to.deep.equal [100,125]

    res2 = crashDummy.collide @events, (e1,e2) -> e2

    expect res2.map -> it.payload
    .to.deep.equal [300]

    res3 = crashDummy.collide @events, (e1,e2) -> new events.MemEvents e1

    expect res3.map -> it.payload
    .to.deep.equal [100,125]
    
    eventGrapher.drawEvents 'collideOne', crashDummy, @events, res1, res2, res3
    
    resolve!
    
    
  specify 'collideMany', -> new p (resolve,reject) ~>
    crashDummys1 = new events.MemEvents do
      new events.Event do
        id: 'dummy1'
        start: @start.clone().subtract 3 'days'
        end: @start.clone().subtract 1 'days'
        payload: 300

      new events.Event do
        id: 'dummy2'
        start: @start.clone().add 11 'days'
        end: @start.clone().add 14 'days'
        payload: 500

      new events.Event do
        id: 'dummy3'
        start: @start.clone().add 11 'days'
        end: @start.clone().add 14 'days'
        payload: 500


    crashDummys2 = new events.MemEvents do
      new events.Event do
        id: 'dummy4'
        start: @start.clone().add 1 'days'
        end: @start.clone().add 4 'days'
        payload: 300

      new events.Event do
        id: 'dummy5'
        start: @start.clone().add 6 'days'
        end: @start.clone().add 16 'days'
        payload: 500
        

    res1 = crashDummys1.collide @events, (e1, e2) -> e2
    res2 = crashDummys1.collide @events, (e1, e2) -> e1
    res3 = crashDummys1.collide @events, (e1, e2) -> e1
    
    cnt = 10
    
    res4 = crashDummys2.collide @events, (e1, e2) ->
        new events.Event assign {}, e1, do
          start: e1.start.clone().add(1,'days')
          end: e1.end.clone().subtract(1,'days')
          payload: cnt += 10
          id: 'test-' + cnt
        
    eventGrapher.drawEvents 'collideMany', crashDummys1, crashDummys2, @events, res1, res2, res3, res4
    
    resolve!

  specify 'subOne2One', -> new p (resolve,reject) ~>
    serialize1 = [ @event1.serialize(), @event2.serialize() ]
    
    res = (@event1.subtract @event2)

    # subtract should be immutable!
    expect [ @event1.serialize(), @event2.serialize() ]
    .to.deep.equal serialize1

    eventGrapher.drawEvents 'subOne2One', @event2, @event1, res
    .then resolve

    expect res.serialize()
    .to.deep.equal do
       [ { id: 'event1-0',
       type: 'price'
       start: '2016-04-02 00:00:00',
       end: '2016-04-03 00:00:00',
       payload: 300 } ]
    
  specify 'subOne2Many', -> new p (resolve,reject) ~>
    
    crashTarget = new events.Event do
        id: 'target'
        start: @start.clone()
        end: @start.clone().add 9 'days'
        payload: 300

    crashDummys = new events.MemEvents do
      new events.Event do
        id: 'dummy1'
        start: @start.clone().add 1 'days'
        end: @start.clone().add 3 'days'
        payload: 300

      new events.Event do
        id: 'dummy2'
        start: @start.clone().add 7 'days'
        end: @start.clone().add 13 'days'
        payload: 600
    
    res = crashTarget.subtract crashDummys

    eventGrapher.drawEvents 'subOne2Many' crashDummys, crashTarget, res
    .then resolve

    expect res.serialize!
    .to.deep.equal do
      [ { id: 'target-0-0',
      start: '2016-04-01 00:00:00',
      end: '2016-04-02 00:00:00',
      payload: 300 },
      { id: 'target-1-0',
      start: '2016-04-04 00:00:00',
      end: '2016-04-08 00:00:00',
      payload: 300 } ]

  specify 'bookingUpdate', -> new p (resolve,reject) ~>


    dummy1 = new events.Event do
      id: 'd1'
      start: @start.clone().add 6, 'days'
      end: @start.clone().add 8, 'days'
      payload: 195
      type: 'price'
      
    dummy2 = new events.Event do
      id: 'd2'
      start: @start.clone().add 9, 'days'
      end: @start.clone().add 17, 'days'
      payload: 150
      type: 'price'

    dummy3 = new events.Event do
      id: 'd3'
      start: @start.clone().add 17, 'days'
      end: @start.clone().add 23, 'days'
      payload: 175
      type: 'price'


    
    dummies = new events.MemEvents [ @event1, dummy1, dummy2, dummy3 ]
    targets = @events.clone()

    create = targets.diff dummies
    remove = dummies.diff targets

    eventGrapher.drawEvents 'bookingUpdate', targets, dummies, create, remove
    .then resolve

  specify 'subMany2Many', -> new p (resolve,reject) ~>
    
    crashTargets = new events.MemEvents do
      new events.Event do
        id: 'target1'
        start: @start.clone()
        end: @start.clone().add 4 'days'
        payload: 150
        
      new events.Event do
        id: 'target2'
        start: @start.clone().add 5, 'days'
        end: @start.clone().add 12, 'days'
        payload: 200
        
      new events.Event do
        id: 'target3'
        start: @start.clone().add 14, 'days'
        end: @start.clone().add 15, 'days'
        payload: 200

    crashDummys = new events.MemEvents do
      new events.Event do
        id: 'dummy1'
        start: @start.clone().add 1 'days'
        end: @start.clone().add 3 'days'
        payload: 300

      new events.Event do
        id: 'dummy2'
        start: @start.clone().add 7 'days'
        end: @start.clone().add 13 'days'
        payload: 600
    
    res = crashTargets.subtract crashDummys
    
    eventGrapher.drawEvents 'subMany2Many' crashDummys, crashTargets, res
    .then resolve
    
    expect res.serialize!
    .to.deep.equal do
      [ { id: 'target1-0',
      start: '2016-04-01 00:00:00',
      end: '2016-04-02 00:00:00',
      payload: 150 },
      { id: 'target1-1',
      start: '2016-04-04 00:00:00',
      end: '2016-04-05 00:00:00',
      payload: 150 },
      { id: 'target2-0',
      start: '2016-04-06 00:00:00',
      end: '2016-04-08 00:00:00',
      payload: 200 },
      { id: 'target3',
      start: '2016-04-15 00:00:00',
      end: '2016-04-16 00:00:00',
      payload: 200 } ]
        
  specify 'diff-change-merge', -> new p (resolve,reject) ~>

    dummy1 = new events.Event do
      id: 'd1'
      start: @start.clone().add 3, 'days'
      end: @start.clone().add 7, 'days'
      payload: 99
      type: 'booking'
      
    dummy2 = new events.Event do
      id: 'd2'
      start: @start.clone().add 9, 'days'
      end: @start.clone().add 17, 'days'
      payload: 99
      type: 'booking'

    dummies = new events.MemEvents [ dummy1, dummy2 ]
    # .pushm new events.Event {
    #    id: 'eBooking3'
    #    type: 'booking'
    #    start: @start.clone().add 21, 'days'
    #    end: @start.clone().add 25, 'days'
    #    payload: 99 }

#    targets = @events.clone()
    targets = new events.MemEvents()

    targets
      .pushm new events.Event {
        id: 'ea4'
        start: @start.clone().add 15, 'days'
        end: @start.clone().add 20, 'days'
        payload: 175 }
        
    targets
      .pushm new events.Event {
        id: 'eBooking3'
        type: 'booking'
        start: @start.clone().add 21, 'days'
        end: @start.clone().add 25, 'days'
        payload: 99 }
        
    targets
      .pushm new events.Event {
        id: 'ea0'
        start: @start.clone()
        end: @start.clone().add 1, 'days'
        type: 'price'
        payload: 123}
        
    targets
      .pushm new events.Event {
        id: 'eBooking1'
        start: @start.clone().subtract 2, 'days'
        end: @start.clone()
        type: 'booking'
        payload: 99}

    targets.pushm do
      id: 'eBooking2'
      type: 'booking',
      start: @start.clone().add 4, 'days'
      end: @start.clone().add 11, 'days'
      payload: 99

    rtargets = targets.filter type: 'booking'

    { busy, free, create, remove } = rtargets.change dummies

    res = targets
      .subtract remove
      .pushm create
                   
    eventGrapher.drawEvents 'diff-change-merge', targets, dummies, rtargets, busy, free, remove, create, res
    .then resolve
    

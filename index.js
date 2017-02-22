(function(){
  var p, ref$, w, find, omit, filter, pick, keys, values, pop, assign, each, reduce, flattenDeep, push, map, mapValues, moment, momentRange, format, parse, Matcher, EventLike, parseInit, Event, PersistLayer, Events, MemEvents, MemEventsNaive, slice$ = [].slice;
  p = require('bluebird');
  ref$ = require('leshdash'), w = ref$.w, find = ref$.find, omit = ref$.omit, filter = ref$.filter, pick = ref$.pick, keys = ref$.keys, values = ref$.values, pop = ref$.pop, assign = ref$.assign, each = ref$.each, reduce = ref$.reduce, flattenDeep = ref$.flattenDeep, push = ref$.push, map = ref$.map, mapValues = ref$.mapValues, omit = ref$.omit;
  moment = require('moment');
  momentRange = require('moment-range');
  format = exports.format = function(it){
    return it.format('YYYY-MM-DD');
  };
  parse = exports.parse = mapValues({
    pattern: function(it){
      switch (false) {
      case (it != null ? it.isEvent : void 8) == null:
        return [
          it.range(), {
            payload: it.payload
          }
        ];
      case !((it != null ? it.constructor : void 8) === Object && it.range != null):
        return [parse.range(it.range), omit(it, 'range')];
      case (it != null ? it.constructor : void 8) !== Object:
        return [false, it];
      default:
        throw new Error("invalid type for patern " + (it != null ? typeof it.toString == 'function' ? it.toString() : void 8 : void 8) + " " + (it != null ? it.constructor : void 8));
      }
    },
    event: function(it){
      if ((it != null ? it.isEvent : void 8) != null) {
        return it;
      }
      switch (it != null && it.constructor) {
      case Object:
        return new Event(it);
      default:
        console.log(it);
        console.log(String(it));
        throw new Error("invalid type for event " + (it != null ? typeof it.toString == 'function' ? it.toString() : void 8 : void 8) + " " + (it != null ? it.constructor : void 8));
      }
    },
    events: function(it){
      if ((it != null ? it.isEvents : void 8) != null) {
        return it;
      }
      switch (it != null && it.constructor) {
      case Array:
        return new MemEvents(it);
      default:
        return new MemEvents(parse.event(it));
      }
    },
    eventArray: function(it){
      return flattenDeep((function(){
        switch (it != null && it.constructor) {
        case Array:
          return map(it, parse.eventArray);
        case MemEvents:
          return it.toArray();
        default:
          return [parse.event(it)];
        }
      }()));
    },
    range: function(something, def){
      switch (something != null && something.constructor) {
      case false:
        return def || void 8;
      case Object:
        return moment.range(something);
      case Array:
        return moment.range(something);
      case Event:
        return something.range();
      case MemEvents:
        return something.range();
      default:
        return (typeof something.range == 'function' ? something.range() : void 8) || something;
      }
    },
    eventCollection: function(something){
      switch (something != null && something.constructor) {
      case void 8:
        return [];
      case Event:
        return [Event];
      case Events:
        return Events.toArray();
      case Array:
        return flattenDeep(something);
      default:
        throw 'what is this';
      }
    }
  }, function(f, name){
    return function(it){
      return f((it != null ? it.constructor : void 8) === Function ? it() : it);
    };
  });
  Matcher = curry$(function(range, pattern, event){
    var checkRange, checkRangeStrict, checkPattern;
    checkRange = function(event){
      if (range) {
        return range.contains(event.start.clone().add(1)) || range.contains(event.end.clone().subtract(1)) || event.range().contains(range);
      } else {
        return true;
      }
    };
    checkRangeStrict = function(event){
      return range.isEqual(event.range());
    };
    checkPattern = function(event){
      return !find(pattern, function(value, key){
        switch (value != null && value.constructor) {
        case undefined:
          return true;
        case Boolean:
          if (value) {
            return event[key] == null;
          } else {
            return event[key] != null;
          }
          break;
        case Function:
          return !value(event[key]);
        default:
          if (moment.isMoment(value)) {
            return !value.isSame(event[key]);
          } else if (event[key] === value) {
            return false;
          } else {
            return true;
          }
        }
      });
    };
    return checkRange(event) && checkPattern(event);
  });
  EventLike = exports.EventLike = EventLike = (function(){
    EventLike.displayName = 'EventLike';
    var prototype = EventLike.prototype, constructor = EventLike;
    prototype.relevantEvents = function(events){
      return parse.events(events).filter({
        range: this.range(),
        type: this.type
      });
    };
    prototype.neighbours = function(events){
      return [
        events.filter({
          end: this.start.clone()
        }), events.filter({
          start: this.end.clone()
        })
      ];
    };
    prototype.range = function(setRange){
      var range;
      if (range = setRange) {
        this.start = range.start.clone();
        this.end = range.end.clone();
      } else {
        range = new moment.range(this.start, this.end);
      }
      return range;
    };
    prototype.push = function(event){
      throw Error('unimplemented');
    };
    prototype.subtract = function(something){
      if (something instanceof Events) {
        return this.subtractMany(something);
      } else {
        return this.subtractOne(something);
      }
    };
    prototype.collide = function(events, cb){
      throw Error('unimplemented');
    };
    prototype.each = function(){
      throw Error('unimplemented');
    };
    prototype.subtractMany = function(){
      throw Error('unimplemented');
    };
    prototype.subtractOne = function(){
      throw Error('unimplemented');
    };
    function EventLike(){}
    return EventLike;
  }());
  parseInit = function(data){
    var ref$, ref1$, ref2$;
    if (!data) {
      return {};
    }
    if (data.constructor !== Object) {
      return "wut wut";
    }
    data = import$({}, data);
    if (data.center) {
      return {
        start: moment.utc(data.start, {
          end: moment.utc(data.end)
        })
      };
    }
    if (data.range) {
      data.start = data.range.start;
      data.end = data.range.end;
      delete data.range;
    }
    if ((ref$ = (ref1$ = data.start) != null ? ref1$.constructor : void 8) === Date || ref$ === String) {
      data.start = moment.utc(data.start);
    }
    if ((ref$ = (ref2$ = data.end) != null ? ref2$.constructor : void 8) === Date || ref$ === String) {
      data.end = moment.utc(data.end);
    }
    if (!data.id) {
      data.id = data.start.format() + " " + data.end.format() + " " + data.type;
    }
    return data;
  };
  Event = exports.Event = Event = (function(superclass){
    var prototype = extend$((import$(Event, superclass).displayName = 'Event', Event), superclass).prototype, constructor = Event;
    prototype.isEvent = true;
    function Event(init){
      assign(this, parseInit(init));
    }
    prototype.compare = function(event){
      return [this.isSameRange(event), this.isSamePayload(event)];
    };
    prototype.isSame = function(event){
      return this.isSameRange(event) && this.isSamePayload(event);
    };
    prototype.isSameRange = function(event){
      event = parse.event(event);
      return this.range().isSame(event.range());
    };
    prototype.isSamePayload = function(event){
      event = parse.event(event);
      return this.type === event.type && this.payload === event.payload;
    };
    prototype.clone = function(data){
      var ret;
      data == null && (data = {});
      ret = new Event(assign({}, this, {
        id: this.id + '-clone'
      }, data));
      delete ret.repr;
      return ret;
    };
    prototype.serialize = function(){
      return import$(pick(this, ['type', 'payload', 'id', 'tags']), mapValues(pick(this, ['start', 'end']), function(value){
        return value.utc().format();
      }));
    };
    prototype.toString = function(){
      var start, end;
      start = format(this.start);
      end = format(this.end);
      if (this.price) {
        return "Price(" + this.price + " " + start + ")";
      } else {
        return "Event(" + (this.id || "unsaved-" + this.type) + ")";
      }
    };
    prototype.subtractMany = function(events){
      var this$ = this;
      return this.relevantEvents(events).reduce(function(res, event){
        return res.subtractOne(event);
      }, new MemEvents(this));
    };
    prototype.subtractOne = function(event){
      var cnt, range, this$ = this;
      cnt = 0;
      range = event.range();
      range.start.subtract(1, 'second');
      range.end.add(1, 'second');
      return new MemEvents(map(this.range().subtract(range), function(it){
        return this$.clone({
          start: it.start,
          end: it.end,
          id: this$.id + '-' + cnt++
        });
      }));
    };
    prototype.collide = function(events, cb){
      var this$ = this;
      return this.relevantEvents(events).reduce(function(events, event){
        return events.pushm(cb(event, this$));
      });
    };
    prototype.each = function(cb){
      return cb(this);
    };
    prototype.merge = function(event){
      var newSelf;
      newSelf = this.clone();
      if (event.start < newSelf.start) {
        newSelf.start = event.start;
      }
      if (event.end > newSelf.end) {
        newSelf.end = event.end;
      }
      return newSelf;
    };
    return Event;
  }(EventLike));
  PersistLayer = exports.PersistLayer = (function(){
    PersistLayer.displayName = 'PersistLayer';
    var prototype = PersistLayer.prototype, constructor = PersistLayer;
    prototype.markRemove = function(){
      return this.toRemove = true;
    };
    prototype.save = function(){
      var this$ = this;
      return new p(function(resolve, reject){
        if (this$.toRemove) {
          return resolve(this$.remove());
        } else {
          throw Error('unimplemented');
        }
      });
    };
    prototype.remove = function(){
      var this$ = this;
      return new p(function(resolve, reject){
        throw Error('unimplemented');
      });
    };
    function PersistLayer(){}
    return PersistLayer;
  }());
  Events = exports.Events = Events = (function(superclass){
    var prototype = extend$((import$(Events, superclass).displayName = 'Events', Events), superclass).prototype, constructor = Events;
    function Events(){
      var events;
      events = slice$.call(arguments);
      this.pushm.apply(this, events);
    }
    prototype.days = function(cb){
      return this.each(function(event){
        var this$ = this;
        return event.range().by('days', function(it){
          return cb(it, event);
        });
      });
    };
    prototype.isEvents = true;
    prototype.find = function(range, pattern){
      throw Error('unimplemented');
    };
    prototype.pushm = function(eventCollection){
      throw Error('unimplemented');
    };
    prototype.push = function(eventCollection){
      return this.clone(eventCollection);
    };
    prototype.without = function(){
      throw Error('unimplemented');
    };
    prototype.each = function(cb){
      throw Error('unimplemented');
    };
    prototype.toString = function(){
      return ("E[" + this.length + "] < ") + this.map(function(event){
        return "" + event;
      }).join(", ") + " >";
    };
    prototype.serialize = function(){
      return this.map(function(it){
        return it.serialize();
      });
    };
    prototype.toArray = function(){
      var ret;
      ret = [];
      this.each(function(it){
        return ret.push(it);
      });
      return ret;
    };
    prototype.map = function(cb){
      var ret;
      ret = [];
      this.each(function(event){
        return ret.push(cb(event));
      });
      return ret;
    };
    prototype.summary = function(){
      return this.rawReduce(function(stats, event){
        var ref$;
        return ref$ = stats || {}, ref$[event.type + ""] = ((stats != null ? stats[event.type] : void 8) || 0) + 1, ref$;
      });
    };
    prototype.rawReduce = function(cb, memo){
      this.each(function(event){
        return memo = cb(memo, event);
      });
      return memo;
    };
    prototype.reduce = function(cb, memo){
      if (!memo) {
        memo = new MemEvents();
      }
      return this.rawReduce(cb, memo);
    };
    prototype.has = function(targetEvent){
      var range;
      range = targetEvent.range();
      return this._find(function(event){
        return event.payload === targetEvent.payload && event.range().isSame(range);
      });
    };
    prototype.find = function(it){
      var matcher;
      matcher = Matcher.apply(this, parse.pattern(it));
      return this._find(matcher);
    };
    prototype.filter = function(pattern){
      var matcher;
      matcher = Matcher.apply(this, parse.pattern(pattern));
      return this.reduce(function(ret, event){
        if (matcher(event)) {
          return ret.pushm(event);
        } else {
          return ret;
        }
      });
    };
    prototype.diff = function(events){
      var makeDiff, this$ = this;
      makeDiff = function(diff, event){
        var collisions;
        collisions = event.relevantEvents(diff);
        if (!collisions.length) {
          return diff;
        } else {
          return diff.popm(collisions).pushm(collisions.reduce(function(res, collision){
            var ref$, range, payload;
            ref$ = event.compare(collision), range = ref$[0], payload = ref$[1];
            if (!range && !payload) {
              return res.pushm(collision);
            }
            if (payload) {
              return res.pushm(collision.subtract(event));
            }
            if (range) {
              return res.pushm(collision);
            }
            return res;
          }));
        }
      };
      events = parse.events(events);
      return this.reduce(makeDiff, events.clone());
    };
    prototype.change = function(newEvents){
      var busy, free, create, remove, this$ = this;
      newEvents = parse.events(newEvents);
      busy = newEvents.subtract(this);
      free = this.subtract(newEvents);
      create = newEvents.reduce(function(create, event){
        if (!this$.has(event)) {
          return create.pushm(event);
        } else {
          return create;
        }
      });
      remove = this.reduce(function(remove, event){
        if (!newEvents.has(event)) {
          return remove.pushm(event);
        } else {
          return remove;
        }
      });
      return {
        busy: busy,
        free: free,
        create: create,
        remove: remove
      };
    };
    prototype.update = function(events){
      var this$ = this;
      return this.reduce(function(arg$, event){
        var create, remove, relevantEvents;
        create = arg$[0], remove = arg$[1];
        if ((relevantEvents = event.relevantEvents(events)).length) {
          remove.pushm(event);
          create.pushm(event.subtract(relevantEvents));
        }
        return [create, remove];
      }, [events.clone(), new MemEvents()]);
    };
    prototype.merge = function(){
      var this$ = this;
      return this.reduce(function(res, event){
        return event.neighbours(this$).map(function(oldEvent){
          if (oldEvent.length && oldEvent.payload === oldEvent.payload) {
            return oldEvent.merge(event);
          }
        });
      });
    };
    prototype.union = function(events){
      var res, this$ = this;
      res = this.clone();
      events.each(function(it){
        return res.pushm(it);
      });
      return res;
    };
    prototype.collide = function(events, cb){
      return this.reduce(function(memo, event){
        return memo.pushm(event.collide(events, cb));
      });
    };
    prototype.subtractOne = function(event){
      return this.reduce(function(ret, child){
        return ret.pushm(child.subtract(event));
      });
    };
    prototype.subtractMany = function(events){
      return this.reduce(function(ret, child){
        return ret.pushm(child.subtractMany(events));
      });
    };
    return Events;
  }(EventLike));
  MemEvents = exports.MemEvents = MemEventsNaive = (function(superclass){
    var prototype = extend$((import$(MemEventsNaive, superclass).displayName = 'MemEventsNaive', MemEventsNaive), superclass).prototype, constructor = MemEventsNaive;
    function MemEventsNaive(){
      assign(this, {
        events: {},
        length: 0,
        type: {}
      });
      MemEventsNaive.superclass.apply(this, arguments);
    }
    prototype.without = function(event){
      return new MemEvents(filter(values(this.events), function(it){
        return it.id !== event.id;
      }));
    };
    prototype.toArray = function(){
      return values(this.events);
    };
    prototype.each = function(cb){
      return each(this.events, cb);
    };
    prototype._find = function(cb){
      return find(this.events, cb);
    };
    prototype.clone = function(range){
      return new MemEvents(values(this.events));
    };
    prototype.popm = function(){
      var events, this$ = this;
      events = slice$.call(arguments);
      each(parse.eventArray(events), function(event){
        if (!event) {
          return;
        }
        if (this$.events[event.id] == null) {} else {
          delete this$.events[event.id];
          return this$.length--;
        }
      });
      return this;
    };
    prototype.pushm = function(){
      var events, this$ = this;
      events = slice$.call(arguments);
      each(parse.eventArray(events), function(event){
        if (!event) {
          return;
        }
        if (this$.events[event.id] != null) {
          return;
        }
        this$.events[event.id] = event;
        this$.type[event.type] = true;
        if (event.start < this$.start || !this$.start) {
          this$.start = event.start;
        }
        if (event.end < this$.end || !this$.end) {
          this$.end = event.end;
        }
        return this$.length++;
      });
      return this;
    };
    return MemEventsNaive;
  }(Events));
  function curry$(f, bound){
    var context,
    _curry = function(args) {
      return f.length > 1 ? function(){
        var params = args ? args.concat() : [];
        context = bound ? context || this : this;
        return params.push.apply(params, arguments) <
            f.length && arguments.length ?
          _curry.call(context, params) : f.apply(context, params);
      } : f;
    };
    return _curry();
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9zZXJ2ZXJzaWRlL25vZGVfbW9kdWxlcy90aW1lRXZlbnRzL2luZGV4LmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBSVksQ0FBVixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQTtFQUNBLElBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQVksQ0FBWixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVksQ0FBWixFQUFlLElBQWYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFlLElBQWYsRUFBcUIsSUFBckIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFxQixJQUFyQixFQUEyQixNQUEzQixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTJCLE1BQTNCLEVBQW1DLElBQW5DLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbUMsSUFBbkMsRUFBeUMsSUFBekMsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF5QyxJQUF6QyxFQUErQyxNQUEvQyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStDLE1BQS9DLEVBQXVELEdBQXZELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdUQsR0FBdkQsRUFBNEQsTUFBNUQsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE0RCxNQUE1RCxFQUFvRSxJQUFwRSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW9FLElBQXBFLEVBQTBFLE1BQTFFLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEUsTUFBMUUsRUFBa0YsV0FBbEYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFrRixXQUFsRixFQUErRixJQUEvRixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStGLElBQS9GLEVBQXFHLEdBQXJHLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcUcsR0FBckcsRUFBMEcsU0FBMUcsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEwRyxTQUExRyxFQUFxSCxJQUFySCxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXFIO0VBQ3JILE1BQUEsQ0FB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QUFDLEVBQVAsQ0FBWCxRQUFILElBQ0E7VUFDRSxPQUFPLEtBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQVA7aUJBQ2QsS0FBQyxDQUFBLE1BQUQ7O09BTEM7YUFNTDs7Y0FFRixRQUFPLFFBQUEsQ0FBQTs7TUFBSTtNQUNULEtBQUssS0FBSyxDQUFDLFdBQVcsTUFBRCxHQUFVLFFBQUEsQ0FBQSxLQUFBO1FBQzdCLElBQUcsQ0FBSSxLQUFQO1VBQWtCLE1BQUE7O1FBQ2xCLElBQUcsS0FBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBUCxDQUFQLFFBQUg7VUFBMkIsTUFBQTs7UUFDM0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBUCxDQUFXLENBQUEsQ0FBQSxDQUFFO1FBQ3BCLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQVAsQ0FBYSxDQUFBLENBQUEsQ0FBRTtRQUdwQixJQUFHLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLEtBQUMsQ0FBQSxLQUFNLENBQUEsRUFBQSxDQUFHLENBQUksS0FBQyxDQUFBLEtBQWhDO1VBQTJDLEtBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLEtBQUssQ0FBQzs7UUFDMUQsSUFBRyxLQUFLLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBRSxLQUFDLENBQUEsR0FBSSxDQUFBLEVBQUEsQ0FBRyxDQUFJLEtBQUMsQ0FBQSxHQUE1QjtVQUFxQyxLQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBRSxLQUFLLENBQUM7O2VBRWxELEtBQUMsQ0FBQSxNQUFEO09BVkc7YUFXTDs7O0lBdkNpRCIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcblxuIyAqIHJlcXVpcmVcbnJlcXVpcmUhIHtcbiAgYmx1ZWJpcmQ6IHBcbiAgbGVzaGRhc2g6IHsgdywgZmluZCwgb21pdCwgZmlsdGVyLCBwaWNrLCBrZXlzLCB2YWx1ZXMsIHBvcCwgYXNzaWduLCBlYWNoLCByZWR1Y2UsIGZsYXR0ZW5EZWVwLCBwdXNoLCBtYXAsIG1hcFZhbHVlcywgb21pdCB9ICBcbiAgbW9tZW50XG4gICdtb21lbnQtcmFuZ2UnXG59XG5cbiMgKiBUeXBlIGNvZXJjaW9uIGZ1bmN0aW9ucyBmb3IgYSBtb3JlIGNoaWxsZWQgb3V0IEFQSVxuZm9ybWF0ID0gZXhwb3J0cy5mb3JtYXQgPSAtPiBpdC5mb3JtYXQgJ1lZWVktTU0tREQnXG5cbnBhcnNlID0gZXhwb3J0cy5wYXJzZSA9IG1hcFZhbHVlcyBkb1xuICBwYXR0ZXJuOiAtPlxuICAgIHwgaXQ/aXNFdmVudD8gPT4gWyBpdC5yYW5nZSEsIHBheWxvYWQ6IGl0LnBheWxvYWQgXVxuICAgIHwgaXQ/QEAgaXMgT2JqZWN0IGFuZCBpdC5yYW5nZT8gPT4gWyBwYXJzZS5yYW5nZShpdC5yYW5nZSksIG9taXQoaXQsICdyYW5nZScpIF1cbiAgICB8IGl0P0BAIGlzIE9iamVjdCA9PiBbIGZhbHNlLCBpdCBdXG4gICAgfCBvdGhlcndpc2UgPT4gdGhyb3cgbmV3IEVycm9yIFwiaW52YWxpZCB0eXBlIGZvciBwYXRlcm4gI3tpdD90b1N0cmluZz8hfSAje2l0P0BAfVwiXG4gICAgXG4gICMgKGFueSkgLT4gRXZlbnQgfCBFcnJvclxuICBldmVudDogLT5cbiAgICBpZiBpdD9pc0V2ZW50PyB0aGVuIHJldHVybiBpdFxuICAgIHN3aXRjaCBpdD9AQFxuICAgICAgfCBPYmplY3QgPT4gbmV3IEV2ZW50IGl0XG4gICAgICB8IG90aGVyd2lzZSA9PlxuICAgICAgICBjb25zb2xlLmxvZyBpdFxuICAgICAgICBjb25zb2xlLmxvZyBTdHJpbmcgaXRcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaW52YWxpZCB0eXBlIGZvciBldmVudCAje2l0P3RvU3RyaW5nPyF9ICN7aXQ/QEB9XCJcblxuICAjIChhbnkpIC0+IE1lbUV2ZW50cyB8IEVycm9yXG4gIGV2ZW50czogLT5cbiAgICBpZiBpdD9pc0V2ZW50cz8gdGhlbiByZXR1cm4gaXRcbiAgICAgIFxuICAgIHN3aXRjaCBpdD9AQFxuICAgICAgfCBBcnJheSA9PiBuZXcgTWVtRXZlbnRzIGl0XG4gICAgICB8IG90aGVyd2lzZSA9PiBuZXcgTWVtRXZlbnRzIHBhcnNlLmV2ZW50IGl0XG5cbiAgIyAoQW55KSAtPiBBcnJheTxFdmVudD4gfCBFcnJvclxuICBldmVudEFycmF5OiAtPlxuICAgIGZsYXR0ZW5EZWVwIHN3aXRjaCBpdD9AQFxuICAgICAgfCBBcnJheSA9PiBtYXAgaXQsIHBhcnNlLmV2ZW50QXJyYXlcbiAgICAgIHwgTWVtRXZlbnRzID0+IGl0LnRvQXJyYXkoKVxuICAgICAgfCBvdGhlcndpc2UgPT4gWyBwYXJzZS5ldmVudCBpdCBdXG4gICAgICAgIFxuICAjICggRXZlbnRzIHwgRXZlbnQgfCB2b2lkICkgLT4gUmFuZ2VcbiAgcmFuZ2U6IChzb21ldGhpbmcsIGRlZikgLT5cbiAgICBzd2l0Y2ggc29tZXRoaW5nP0BAXG4gICAgICB8IGZhbHNlID0+IGRlZiBvciB2b2lkXG4gICAgICB8IE9iamVjdCA9PiBtb21lbnQucmFuZ2Ugc29tZXRoaW5nXG4gICAgICB8IEFycmF5ID0+IG1vbWVudC5yYW5nZSBzb21ldGhpbmdcbiAgICAgIHwgRXZlbnQgPT4gc29tZXRoaW5nLnJhbmdlIVxuICAgICAgfCBNZW1FdmVudHMgPT4gc29tZXRoaW5nLnJhbmdlIVxuICAgICAgfCBvdGhlcndpc2UgPT4gc29tZXRoaW5nLnJhbmdlPyEgb3Igc29tZXRoaW5nXG4gICAgXG4jICggRXZlbnRzIHwgQXJyYXk8RXZlbnQ+IHwgRXZlbnQgfCB2b2lkICkgLT4gQXJyYXk8RXZlbnQ+XG4gIGV2ZW50Q29sbGVjdGlvbjogKHNvbWV0aGluZykgLT5cbiAgICBzd2l0Y2ggc29tZXRoaW5nP0BAXG4gICAgICB8IHZvaWQgPT4gW11cbiAgICAgIHwgRXZlbnQgPT4gWyBFdmVudCBdXG4gICAgICB8IEV2ZW50cyA9PiBFdmVudHMudG9BcnJheSgpXG4gICAgICB8IEFycmF5ID0+IGZsYXR0ZW5EZWVwIHNvbWV0aGluZ1xuICAgICAgfCBvdGhlcndpc2UgPT4gdGhyb3cgJ3doYXQgaXMgdGhpcydcblxuICAoIGYsIG5hbWUgKSAtPiAtPiBmIGlmIGl0P0BAIGlzIEZ1bmN0aW9uIHRoZW4gaXQhIGVsc2UgaXRcbiAgICBcblxuTWF0Y2hlciA9IChyYW5nZSwgcGF0dGVybiwgZXZlbnQpIC0tPlxuICBcbiAgY2hlY2tSYW5nZSA9IChldmVudCkgLT5cbiAgICBpZiByYW5nZSB0aGVuIHJldHVybiByYW5nZS5jb250YWlucyBldmVudC5zdGFydC5jbG9uZSgpLmFkZCgxKSBvciByYW5nZS5jb250YWlucyBldmVudC5lbmQuY2xvbmUoKS5zdWJ0cmFjdCgxKSBvciBldmVudC5yYW5nZSEuY29udGFpbnMgcmFuZ2VcbiAgICBlbHNlIHJldHVybiB0cnVlXG5cbiAgY2hlY2tSYW5nZVN0cmljdCA9IChldmVudCkgLT4gcmFuZ2UuaXNFcXVhbCBldmVudC5yYW5nZSFcblxuICBjaGVja1BhdHRlcm4gPSAoZXZlbnQpIC0+XG4gICAgbm90IGZpbmQgcGF0dGVybiwgKHZhbHVlLCBrZXkpIC0+XG4gICAgICBzd2l0Y2ggdmFsdWU/QEBcbiAgICAgICAgfCB1bmRlZmluZWQgPT4gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgfCBCb29sZWFuID0+XG4gICAgICAgICAgaWYgdmFsdWUgdGhlbiBub3QgZXZlbnRba2V5XT9cbiAgICAgICAgICBlbHNlIGV2ZW50W2tleV0/XG4gICAgICAgICAgXG4gICAgICAgIHwgRnVuY3Rpb24gPT4gbm90IHZhbHVlIGV2ZW50W2tleV1cblxuICAgICAgICB8IG90aGVyd2lzZSA9PlxuICAgICAgICAgIGlmIG1vbWVudC5pc01vbWVudCB2YWx1ZSB0aGVuIG5vdCB2YWx1ZS5pc1NhbWUgZXZlbnRba2V5XVxuICAgICAgICAgIGVsc2UgaWYgZXZlbnRba2V5XSBpcyB2YWx1ZSB0aGVuIGZhbHNlIGVsc2UgdHJ1ZVxuXG4gIGNoZWNrUmFuZ2UoZXZlbnQpIGFuZCBjaGVja1BhdHRlcm4oZXZlbnQpXG5cblxuIyAqIEV2ZW50TGlrZVxuIyBtb3JlIG9mIGEgc3BlYyB0aGVuIGFueXRoaW5nLCB0aGlzIGlzIGltcGxlbWVudGVkIGJ5IEV2ZW50ICYgRXZlbnRzXG5cbkV2ZW50TGlrZSA9IGV4cG9ydHMuRXZlbnRMaWtlID0gY2xhc3MgRXZlbnRMaWtlXG5cbiAgIyBmZXRjaGVzIGFsbCBldmVudHMgZnJvbSBhIGNvbGxlY3Rpb24gcmVsZXZhbnQgdG8gY3VycmVudCBldmVudCAoYnkgdHlwZSBhbmQgcmFuZ2UpXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgcmVsZXZhbnRFdmVudHM6IChldmVudHMpIC0+XG4gICAgcGFyc2UuZXZlbnRzIGV2ZW50c1xuICAgIC5maWx0ZXIgcmFuZ2U6IEByYW5nZSgpLCB0eXBlOiBAdHlwZVxuXG4gIG5laWdoYm91cnM6IChldmVudHMpIC0+XG4gICAgW1xuICAgICAgZXZlbnRzLmZpbHRlciBlbmQ6IEBzdGFydC5jbG9uZSgpXG4gICAgICBldmVudHMuZmlsdGVyIHN0YXJ0OiBAZW5kLmNsb25lKClcbiAgICBdXG5cbiAgIyBnZXQgb3Igc2V0IHJhbmdlXG4gICMgKHJhbmdlPykgLT4gbW9tZW50LnJhbmdlXG4gIHJhbmdlOiAoc2V0UmFuZ2UpIC0+XG4gICAgaWYgcmFuZ2UgPSBzZXRSYW5nZVxuICAgICAgQHN0YXJ0ID0gcmFuZ2Uuc3RhcnQuY2xvbmUoKVxuICAgICAgQGVuZCA9IHJhbmdlLmVuZC5jbG9uZSgpXG4gICAgZWxzZVxuICAgICAgcmFuZ2UgPSBuZXcgbW9tZW50LnJhbmdlIEBzdGFydCwgQGVuZFxuICAgICAgXG4gICAgcmFuZ2VcblxuICAjICggRXZlbnRMaWtlICkgLT4gRXZlbnRzXG4gIHB1c2g6IChldmVudCkgLT4gLi4uXG4gICAgXG4gICMgKCBFdmVudExpa2UgKSAtPiBFdmVudHNcbiAgc3VidHJhY3Q6IChzb21ldGhpbmcpIC0+XG4gICAgaWYgc29tZXRoaW5nIGluc3RhbmNlb2YgRXZlbnRzIHRoZW4gQHN1YnRyYWN0TWFueSBzb21ldGhpbmdcbiAgICBlbHNlIEBzdWJ0cmFjdE9uZSBzb21ldGhpbmdcbiAgICBcbiAgIyAoIEV2ZW50TGlrZSwgKEV2ZW50LCBFdmVudCkgLT4gRXZlbnRzKSAtPiBFdmVudHNcbiAgY29sbGlkZTogKGV2ZW50cywgY2IpIC0+IC4uLlxuXG4gIGVhY2g6IC0+IC4uLlxuXG4gIHN1YnRyYWN0TWFueTogLT4gLi4uXG5cbiAgc3VidHJhY3RPbmU6IC0+IC4uLlxuXG4jICogRXZlbnRcbiMgcmVwcmVzZW50cyBzb21lIGV2ZW50IGluIHRpbWUsIGRlZmluZWQgYnkgc3RhcnQgYW5kIGVuZCB0aW1lc3RhbXBzXG4jIGNhcmllcyBzb21lIHBheWxvYWQsIGxpa2UgYSBwcmljZSBvciBhIGJvb2tpbmdcblxucGFyc2VJbml0ID0gKGRhdGEpIC0+XG4gIGlmIG5vdCBkYXRhIHRoZW4gcmV0dXJuIHt9XG4gIGlmIGRhdGFAQCBpc250IE9iamVjdCB0aGVuIHJldHVybiBcInd1dCB3dXRcIlxuICBkYXRhID0ge30gPDw8IGRhdGFcbiAgICBcbiAgaWYgZGF0YS5jZW50ZXIgdGhlbiByZXR1cm4geyBzdGFydDogbW9tZW50LnV0YyBkYXRhLnN0YXJ0LCBlbmQ6IG1vbWVudC51dGMgZGF0YS5lbmQgfVxuICAgIFxuICBpZiBkYXRhLnJhbmdlXG4gICAgZGF0YS5zdGFydCA9IGRhdGEucmFuZ2Uuc3RhcnRcbiAgICBkYXRhLmVuZCA9IGRhdGEucmFuZ2UuZW5kXG4gICAgZGVsZXRlIGRhdGEucmFuZ2VcbiAgXG4gIGlmIGRhdGEuc3RhcnQ/QEAgaW4gWyBEYXRlLCBTdHJpbmcgXSB0aGVuIGRhdGEuc3RhcnQgPSBtb21lbnQudXRjIGRhdGEuc3RhcnRcblxuICBpZiBkYXRhLmVuZD9AQCBpbiBbIERhdGUsIFN0cmluZyBdIHRoZW4gZGF0YS5lbmQgPSBtb21lbnQudXRjIGRhdGEuZW5kXG5cbiAgaWYgbm90IGRhdGEuaWQgdGhlbiBkYXRhLmlkID0gZGF0YS5zdGFydC5mb3JtYXQoKSArIFwiIFwiICsgZGF0YS5lbmQuZm9ybWF0KCkgKyBcIiBcIiArIGRhdGEudHlwZVxuICAgICAgICBcbiAgcmV0dXJuIGRhdGFcblxuRXZlbnQgPSBleHBvcnRzLkV2ZW50ID0gY2xhc3MgRXZlbnQgZXh0ZW5kcyBFdmVudExpa2VcbiAgaXNFdmVudDogdHJ1ZVxuICBcbiAgKGluaXQpIC0+IGFzc2lnbiBALCBwYXJzZUluaXQgaW5pdFxuXG4gIGNvbXBhcmU6IChldmVudCkgLT5cbiAgICBbIEBpc1NhbWVSYW5nZShldmVudCksIEBpc1NhbWVQYXlsb2FkKGV2ZW50KSBdXG5cbiAgaXNTYW1lOiAoZXZlbnQpIC0+XG4gICAgQGlzU2FtZVJhbmdlKGV2ZW50KSBhbmQgQGlzU2FtZVBheWxvYWQoZXZlbnQpXG5cbiAgaXNTYW1lUmFuZ2U6IChldmVudCkgLT5cbiAgICBldmVudCA9IHBhcnNlLmV2ZW50IGV2ZW50XG4gICAgQHJhbmdlIS5pc1NhbWUgZXZlbnQucmFuZ2UhXG4gICAgXG4gIGlzU2FtZVBheWxvYWQ6IChldmVudCkgLT5cbiAgICBldmVudCA9IHBhcnNlLmV2ZW50IGV2ZW50XG4gICAgKEB0eXBlIGlzIGV2ZW50LnR5cGUpIGFuZCAoQHBheWxvYWQgaXMgZXZlbnQucGF5bG9hZClcbiAgXG4gIGNsb25lOiAoZGF0YT17fSkgLT5cbiAgICByZXQgPSBuZXcgRXZlbnQgYXNzaWduIHt9LCBALCB7IGlkOiBAaWQgKyAnLWNsb25lJ30sIGRhdGFcbiAgICBkZWxldGUgcmV0LnJlcHJcbiAgICByZXRcblxuICAjICgpIC0+IEpzb25cbiAgc2VyaWFsaXplOiAtPlxuICAgIHBpY2soQCwgPFt0eXBlIHBheWxvYWQgaWQgdGFnc10+KSA8PDwgbWFwVmFsdWVzIChwaWNrIEAsIDxbIHN0YXJ0IGVuZCBdPiksICh2YWx1ZSkgLT4gdmFsdWUudXRjKCkuZm9ybWF0KClcblxuICAjICgpIC0+IFN0cmluZ1xuICB0b1N0cmluZzogLT5cbiAgICBzdGFydCA9IGZvcm1hdCBAc3RhcnRcbiAgICBlbmQgPSBmb3JtYXQgQGVuZFxuICAgIGlmIEBwcmljZSB0aGVuIFwiUHJpY2UoXCIgKyBAcHJpY2UgKyBcIiBcIiArIHN0YXJ0ICsgXCIpXCJcbiAgICBlbHNlIFwiRXZlbnQoXCIgKyAoQGlkIG9yIFwidW5zYXZlZC1cIiArIEB0eXBlKSAgKyBcIilcIlxuICAgIFxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0TWFueTogKGV2ZW50cykgLT5cbiAgICBAcmVsZXZhbnRFdmVudHMgZXZlbnRzXG4gICAgLnJlZHVjZSBkb1xuICAgICAgKHJlcywgZXZlbnQpIH4+IHJlcy5zdWJ0cmFjdE9uZSBldmVudFxuICAgICAgbmV3IE1lbUV2ZW50cyBAXG4gICAgICBcbiAgIyAoIEV2ZW50ICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0T25lOiAoZXZlbnQpIC0+XG4gICAgY250ID0gMFxuICAgIHJhbmdlID0gZXZlbnQucmFuZ2UoKVxuICAgIHJhbmdlLnN0YXJ0LnN1YnRyYWN0IDEsICdzZWNvbmQnXG4gICAgcmFuZ2UuZW5kLmFkZCAxICdzZWNvbmQnXG4gICAgXG4gICAgbmV3IE1lbUV2ZW50cyBtYXAgZG9cbiAgICAgIEByYW5nZSgpLnN1YnRyYWN0IHJhbmdlXG4gICAgICB+PiBAY2xvbmUgeyBzdGFydDogaXQuc3RhcnQsIGVuZDogaXQuZW5kLCBpZDogQGlkICsgJy0nICsgY250KysgfSAjIGdldCByaWQgb2YgcG90ZW50aWFsIG9sZCByZXByLCB0aGlzIGlzIGEgbmV3IGV2ZW50XG4gICAgICBcbiAgIyAoIEV2ZW50cywgKEV2ZW50LCBFdmVudCkgLT4gRXZlbnRzICkgLT4gRXZlbnRzXG4gIGNvbGxpZGU6IChldmVudHMsIGNiKSAtPlxuICAgIEByZWxldmFudEV2ZW50cyBldmVudHNcbiAgICAucmVkdWNlIChldmVudHMsIGV2ZW50KSB+PiBldmVudHMucHVzaG0gY2IgZXZlbnQsIEBcblxuICBlYWNoOiAoY2IpIC0+IGNiIEBcbiAgICBcbiAgbWVyZ2U6IChldmVudCkgLT5cbiAgICBuZXdTZWxmID0gQGNsb25lKClcbiAgICBpZiBldmVudC5zdGFydCA8IG5ld1NlbGYuc3RhcnQgdGhlbiBuZXdTZWxmLnN0YXJ0ID0gZXZlbnQuc3RhcnRcbiAgICBpZiBldmVudC5lbmQgPiBuZXdTZWxmLmVuZCB0aGVuIG5ld1NlbGYuZW5kID0gZXZlbnQuZW5kXG4gICAgbmV3U2VsZlxuICAgIFxuXG5QZXJzaXN0TGF5ZXIgPSBleHBvcnRzLlBlcnNpc3RMYXllciA9IGNsYXNzXG4gIG1hcmtSZW1vdmU6IC0+IEB0b1JlbW92ZSA9IHRydWVcbiAgXG4gIHNhdmU6IC0+IG5ldyBwIChyZXNvbHZlLHJlamVjdCkgfj5cbiAgICBpZiBAdG9SZW1vdmUgdGhlbiByZXNvbHZlIEByZW1vdmUhXG4gICAgZWxzZSAuLi5cbiAgICAgIFxuICByZW1vdmU6IC0+IG5ldyBwIChyZXNvbHZlLHJlamVjdCkgfj4gLi4uXG5cbiMgKiBFdmVudHNcbiMgYWJzdHJhY3QgZXZlbnQgY29sbGVjdGlvblxuIyBzdXBwb3J0aW5nIGNvbW1vbiBzZXQgb3BlcmF0aW9ucyxcbiMgYW5kIHNvbWUgdW5jb21tb24gb3BlcmF0aW9ucyByZWxhdGVkIHRvIHRpbWUgKGNvbGxpZGUsIHN1YnRyYWN0KVxuIFxuRXZlbnRzID0gZXhwb3J0cy5FdmVudHMgPSBjbGFzcyBFdmVudHMgZXh0ZW5kcyBFdmVudExpa2VcbiAgKC4uLmV2ZW50cykgLT4gQHB1c2htLmFwcGx5IEAsIGV2ZW50c1xuXG4gICMgcGVyIGRheSBkYXRhIChhaXJibmIgYXBpIGhlbHBlcilcbiAgZGF5czogKGNiKSAtPiBAZWFjaCAoZXZlbnQpIC0+IGV2ZW50LnJhbmdlIWJ5ICdkYXlzJywgfj4gY2IgaXQsIGV2ZW50XG5cbiAgaXNFdmVudHM6IHRydWVcblxuICAjICggTW9tZW50UmFuZ2UsIE9iamVjdCApIC0+IEV2ZW50c1xuICBmaW5kOiAocmFuZ2UsIHBhdHRlcm4pIC0+IC4uLlxuICAgIFxuICAjICggcmFuZ2VFcXVpdmFsZW50ICkgLT4gRXZlbnRzXG4jICBjbG9uZTogKHJhbmdlRXF1aXZhbGVudCkgfj4gLi4uXG5cbiAgIyAoIEV2ZW50Q29sbGVjdGlvbikgLT4gRXZlbnRzXG4gIHB1c2htOiAoZXZlbnRDb2xsZWN0aW9uKSAtPiAuLi5cblxuICAjICggRXZlbnRDb2xsZWN0aW9uKSAtPiBFdmVudHNcbiAgcHVzaDogKGV2ZW50Q29sbGVjdGlvbikgLT4gQGNsb25lIGV2ZW50Q29sbGVjdGlvblxuXG4gICMgKCkgLT4gRXZlbnRzXG4gIHdpdGhvdXQ6IC0+ICAuLi5cblxuICAjICggRnVuY3Rpb24gKSAtPiB2b2lkXG4gIGVhY2g6IChjYikgLT4gLi4uXG5cbiAgIyAoKSAtPiBTdHJpbmdcbiAgdG9TdHJpbmc6IC0+IFwiRVsje0BsZW5ndGh9XSA8IFwiICsgKEBtYXAgKGV2ZW50KSAtPiBcIlwiICsgZXZlbnQpLmpvaW4oXCIsIFwiKSArIFwiID5cIlxuXG4gICMgKCkgLT4gSnNvblxuICBzZXJpYWxpemU6IC0+IEBtYXAgKC5zZXJpYWxpemUhKVxuXG4gICMgKCkgLT4gQXJyYXk8RXZlbnQ+XG4gIHRvQXJyYXk6IC0+XG4gICAgcmV0ID0gW11cbiAgICBAZWFjaCAtPiByZXQucHVzaCBpdFxuICAgIHJldFxuXG4gICMgKCAoRXZlbnQpIC0+IGFueSkgKSAtPiBBcnJheTxhbnk+XG4gIG1hcDogKGNiKSAtPlxuICAgIHJldCA9IFtdXG4gICAgQGVhY2ggKGV2ZW50KSAtPiByZXQucHVzaCBjYiBldmVudFxuICAgIHJldFxuXG4gICMgKCkgLT4gT2JqZWN0XG4gIHN1bW1hcnk6IC0+XG4gICAgQHJhd1JlZHVjZSAoc3RhdHMsIGV2ZW50KSAtPiAoc3RhdHMgb3Ige30pIDw8PCBcIiN7ZXZlbnQudHlwZX1cIjogKHN0YXRzP1tldmVudC50eXBlXSBvciAwKSArIDFcbiAgXG4gICMgKCAoRXZlbnRzLCBFdmVudCkgLT4gRXZlbnRzICkgLT4gQXJyYXk8YW55PlxuICByYXdSZWR1Y2U6IChjYiwgbWVtbykgLT5cbiAgICBAZWFjaCAoZXZlbnQpIC0+IG1lbW8gOj0gY2IgbWVtbywgZXZlbnRcbiAgICBtZW1vXG4gICAgXG4gICMgKCAoRXZlbnRzLCBFdmVudCkgLT4gRXZlbnRzICkgLT4gRXZlbnRzXG4gIHJlZHVjZTogKGNiLCBtZW1vKSAtPlxuICAgIGlmIG5vdCBtZW1vIHRoZW4gbWVtbyA9IG5ldyBNZW1FdmVudHMoKVxuICAgIEByYXdSZWR1Y2UgY2IsIG1lbW9cblxuICAjICggRXZlbnQgKSAtPiBCb29sZWFuXG4gIGhhczogKHRhcmdldEV2ZW50KSAtPlxuICAgIHJhbmdlID0gdGFyZ2V0RXZlbnQucmFuZ2UhXG4gICAgQF9maW5kIChldmVudCkgLT4gZXZlbnQucGF5bG9hZCBpcyB0YXJnZXRFdmVudC5wYXlsb2FkIGFuZCBldmVudC5yYW5nZSFpc1NhbWUgcmFuZ2VcbiAgICAgICAgICAgIFxuICAjICggRXZlbnQgfCB7IHJhbmdlOiBSYW5nZSwgLi4uIH0gKSAtPiBFdmVudHNcbiAgZmluZDogLT5cbiAgICBtYXRjaGVyID0gTWF0Y2hlci5hcHBseSBALCBwYXJzZS5wYXR0ZXJuIGl0XG4gICAgQF9maW5kIG1hdGNoZXJcbiAgICBcbiAgIyAoIHsgcmFuZ2U6IFJhbmdlLCAuLi4gfSApIC0+IEV2ZW50c1xuICBmaWx0ZXI6ICggcGF0dGVybiApLT5cbiAgICBtYXRjaGVyID0gTWF0Y2hlci5hcHBseSBALCBwYXJzZS5wYXR0ZXJuIHBhdHRlcm5cbiAgICBAcmVkdWNlIChyZXQsIGV2ZW50KSAtPiBpZiBtYXRjaGVyIGV2ZW50IHRoZW4gcmV0LnB1c2htIGV2ZW50IGVsc2UgcmV0XG4gICAgXG4gIGRpZmY6IChldmVudHMpIC0+XG4gICAgbWFrZURpZmYgPSAoZGlmZiwgZXZlbnQpIH4+XG4gICAgICBjb2xsaXNpb25zID0gZXZlbnQucmVsZXZhbnRFdmVudHMgZGlmZlxuICAgICAgaWYgbm90IGNvbGxpc2lvbnMubGVuZ3RoIHRoZW4gcmV0dXJuIGRpZmZcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGRpZmYucG9wbShjb2xsaXNpb25zKS5wdXNobSBjb2xsaXNpb25zLnJlZHVjZSAocmVzLCBjb2xsaXNpb24pIC0+XG4gICAgICAgICAgWyByYW5nZSwgcGF5bG9hZCBdID0gZXZlbnQuY29tcGFyZSBjb2xsaXNpb25cbiAgICAgICAgICBcbiAgICAgICAgICBpZiBub3QgcmFuZ2UgYW5kIG5vdCBwYXlsb2FkIHRoZW4gcmV0dXJuIHJlcy5wdXNobSBjb2xsaXNpb25cbiAgICAgICAgICBpZiBwYXlsb2FkIHRoZW4gcmV0dXJuIHJlcy5wdXNobSBjb2xsaXNpb24uc3VidHJhY3QgZXZlbnRcbiAgICAgICAgICBpZiByYW5nZSB0aGVuIHJldHVybiByZXMucHVzaG0gY29sbGlzaW9uXG4gICAgICAgICAgcmV0dXJuIHJlc1xuXG4gICAgZXZlbnRzID0gcGFyc2UuZXZlbnRzIGV2ZW50c1xuICAgIEByZWR1Y2UgbWFrZURpZmYsIGV2ZW50cy5jbG9uZSgpXG5cbiAgIyBjb21wbGF0ZWx5IHRyYW5zZm9ybXMgdGhlIGdyb3VwIG9mIGV2ZW50cywgcmV0dXJuaW5nIHJhbmdlcyBhZGRlZCBhbmQgcmVtb3ZlZCwgYW5kIGRiIGV2ZW50cyB0byBkZWxldGUgYW5kIGNyZWF0ZSB0byBhcHBseSB0aGUgY2hhbmdlXG4gICMgKCBFdmVudHMgKSAtPiB7IGJ1c3k6IEV2ZW50cywgZnJlZTogRXZlbnRzLCBjcmVhdGU6IEV2ZW50cywgcmVtb3ZlOiBFdmVudHMgfVxuICBjaGFuZ2U6IChuZXdFdmVudHMpIC0+XG4gICAgbmV3RXZlbnRzID0gcGFyc2UuZXZlbnRzIG5ld0V2ZW50c1xuICAgIGJ1c3kgPSBuZXdFdmVudHMuc3VidHJhY3QgQFxuICAgIGZyZWUgPSBAc3VidHJhY3QgbmV3RXZlbnRzXG5cbiAgICBjcmVhdGUgPSBuZXdFdmVudHMucmVkdWNlIChjcmVhdGUsIGV2ZW50KSB+PiBpZiBub3QgQGhhcyBldmVudCB0aGVuIGNyZWF0ZS5wdXNobSBldmVudCBlbHNlIGNyZWF0ZVxuICAgIHJlbW92ZSA9IEByZWR1Y2UgKHJlbW92ZSwgZXZlbnQpIC0+IGlmIG5vdCBuZXdFdmVudHMuaGFzIGV2ZW50IHRoZW4gcmVtb3ZlLnB1c2htIGV2ZW50IGVsc2UgcmVtb3ZlXG4gICAgICAgIFxuICAgIGJ1c3k6IGJ1c3ksIGZyZWU6IGZyZWUsIGNyZWF0ZTogY3JlYXRlLCByZW1vdmU6IHJlbW92ZVxuXG4gICMgdXBhdGVzIGV2ZW50c1xuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHVwZGF0ZTogKGV2ZW50cykgLT5cbiAgICBAcmVkdWNlIGRvXG4gICAgICAoWyBjcmVhdGUsIHJlbW92ZSBdLCBldmVudCkgfj5cblxuICAgICAgICBpZiAocmVsZXZhbnRFdmVudHMgPSBldmVudC5yZWxldmFudEV2ZW50cyhldmVudHMpKS5sZW5ndGhcbiAgICAgICAgICByZW1vdmUucHVzaG0gZXZlbnRcbiAgICAgICAgICBjcmVhdGUucHVzaG0gZXZlbnQuc3VidHJhY3QgcmVsZXZhbnRFdmVudHNcblxuICAgICAgICBbIGNyZWF0ZSwgcmVtb3ZlIF1cblxuICAgICAgWyBldmVudHMuY2xvbmUoKSwgbmV3IE1lbUV2ZW50cygpIF1cbiAgICAgICAgICAgIFxuICBtZXJnZTogLT5cbiAgICBAcmVkdWNlIChyZXMsIGV2ZW50KSB+PlxuICAgICAgZXZlbnRcbiAgICAgIC5uZWlnaGJvdXJzKEApXG4gICAgICAubWFwIChvbGRFdmVudCkgLT4gXG4gICAgICAgIGlmIG9sZEV2ZW50Lmxlbmd0aCBhbmQgb2xkRXZlbnQucGF5bG9hZCBpcyBvbGRFdmVudC5wYXlsb2FkIHRoZW4gb2xkRXZlbnQubWVyZ2UgZXZlbnRcbiAgICBcbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICB1bmlvbjogKGV2ZW50cykgLT5cbiAgICByZXMgPSBAY2xvbmUoKVxuICAgIGV2ZW50cy5lYWNoIH4+IHJlcy5wdXNobSBpdFxuICAgIHJlc1xuXG4gICMgKCAoRXZlbnRzLCAoRXZlbnQxLCBFdmVudDIpIC0+IEV2ZW50cyApIC0+IEV2ZW50c1xuICBjb2xsaWRlOiAoZXZlbnRzLCBjYikgLT5cbiAgICBAcmVkdWNlIChtZW1vLCBldmVudCkgLT4gbWVtby5wdXNobSBldmVudC5jb2xsaWRlIGV2ZW50cywgY2JcblxuICAjICggRXZlbnQgKSAtPiBFdmVudHNcbiAgc3VidHJhY3RPbmU6IChldmVudCkgLT5cbiAgICBAcmVkdWNlIChyZXQsIGNoaWxkKSAtPiByZXQucHVzaG0gY2hpbGQuc3VidHJhY3QgZXZlbnRcblxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0TWFueTogKGV2ZW50cykgLT5cbiAgICBAcmVkdWNlIChyZXQsIGNoaWxkKSAtPiByZXQucHVzaG0gY2hpbGQuc3VidHJhY3RNYW55IGV2ZW50c1xuXG4jICogTWVtRXZlbnRzXG4jIEluIG1lbW9yeSBFdmVudCBjb2xsZWN0aW9uIGltcGxlbWVudGF0aW9uLFxuIyB0aGlzIGlzIGEgdmVyeSBuYWl2ZSBpbXBsZW1lbnRhdGlvblxuIyBcbiMgSSBndWVzcyB3ZSBzaG91bGQgdXNlIHJhbmdlIHRyZWUgZGF0YSBzdHJ1Y3R1cmUgb3Igc29tZXRoaW5nIHNtYXJ0IGxpa2UgdGhhdCBmb3IgZmFzdCByYW5nZSBzZWFyY2ggaW4gdGhlIGZ1dHVyZS5cbiMgaXRzIGdvb2QgZW5vdWdoIGZvciBub3cgZXZlbiBpZiB3ZSBlbmQgdXAgcXVhZHJhdGljIGNvbXBsZXhpdHkgZm9yIGFsZ29zLCB3ZSBhcmUgbm90IHBhcnNpbmcgbWFueSBldmVudHMgcGVyIHByb3BlcnR5LlxuIyBcbk1lbUV2ZW50cyA9IGV4cG9ydHMuTWVtRXZlbnRzID0gY2xhc3MgTWVtRXZlbnRzTmFpdmUgZXh0ZW5kcyBFdmVudHNcbiAgLT5cbiAgICBhc3NpZ24gQCwgZG9cbiAgICAgIGV2ZW50czogIHt9XG4gICAgICBsZW5ndGg6IDBcbiAgICAgIHR5cGU6IHt9XG4gICAgc3VwZXIgLi4uXG4gIFxuICB3aXRob3V0OiAoZXZlbnQpIC0+IG5ldyBNZW1FdmVudHMgZmlsdGVyICh2YWx1ZXMgQGV2ZW50cyksIC0+IGl0LmlkIGlzbnQgZXZlbnQuaWRcbiAgICBcbiAgdG9BcnJheTogLT4gdmFsdWVzIEBldmVudHNcblxuICBlYWNoOiAoY2IpIC0+IGVhY2ggQGV2ZW50cywgY2JcbiAgXG4gIF9maW5kOiAoY2IpIC0+IGZpbmQgQGV2ZW50cywgY2JcblxuICBjbG9uZTogKHJhbmdlKSAtPiBuZXcgTWVtRXZlbnRzIHZhbHVlcyBAZXZlbnRzXG5cbiAgcG9wbTogKC4uLmV2ZW50cykgLT4gXG4gICAgZWFjaCBwYXJzZS5ldmVudEFycmF5KGV2ZW50cyksIChldmVudCkgfj5cbiAgICAgIGlmIG5vdCBldmVudCB0aGVuIHJldHVyblxuICAgICAgaWYgbm90IEBldmVudHNbZXZlbnQuaWRdPyB0aGVuIHJldHVyblxuICAgICAgZWxzZVxuICAgICAgICBkZWxldGUgQGV2ZW50c1tldmVudC5pZF1cbiAgICAgICAgQGxlbmd0aC0tXG4gICAgQFxuXG4gIHB1c2htOiAoLi4uZXZlbnRzKSAtPlxuICAgIGVhY2ggcGFyc2UuZXZlbnRBcnJheShldmVudHMpLCAoZXZlbnQpIH4+XG4gICAgICBpZiBub3QgZXZlbnQgdGhlbiByZXR1cm5cbiAgICAgIGlmIEBldmVudHNbZXZlbnQuaWRdPyB0aGVuIHJldHVyblxuICAgICAgQGV2ZW50c1tldmVudC5pZF0gPSBldmVudFxuICAgICAgQHR5cGVbZXZlbnQudHlwZV0gPSB0cnVlXG5cblxuICAgICAgaWYgZXZlbnQuc3RhcnQgPCBAc3RhcnQgb3Igbm90IEBzdGFydCB0aGVuIEBzdGFydCA9IGV2ZW50LnN0YXJ0XG4gICAgICBpZiBldmVudC5lbmQgPCBAZW5kIG9yIG5vdCBAZW5kIHRoZW4gQGVuZCA9IGV2ZW50LmVuZFxuICAgICAgXG4gICAgICBAbGVuZ3RoKytcbiAgICBAXG4gIFxuIl19

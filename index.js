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
      console.log("WILL PARSE", events);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9zZXJ2ZXJzaWRlL25vZGVfbW9kdWxlcy90aW1lRXZlbnRzL2luZGV4LmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBSVksQ0FBVixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQTtFQUNBLElBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQVksQ0FBWixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVksQ0FBWixFQUFlLElBQWYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFlLElBQWYsRUFBcUIsSUFBckIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFxQixJQUFyQixFQUEyQixNQUEzQixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTJCLE1BQTNCLEVBQW1DLElBQW5DLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbUMsSUFBbkMsRUFBeUMsSUFBekMsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF5QyxJQUF6QyxFQUErQyxNQUEvQyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStDLE1BQS9DLEVBQXVELEdBQXZELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdUQsR0FBdkQsRUFBNEQsTUFBNUQsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE0RCxNQUE1RCxFQUFvRSxJQUFwRSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW9FLElBQXBFLEVBQTBFLE1BQTFFLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEUsTUFBMUUsRUFBa0YsV0FBbEYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFrRixXQUFsRixFQUErRixJQUEvRixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStGLElBQS9GLEVBQXFHLEdBQXJHLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcUcsR0FBckcsRUFBMEcsU0FBMUcsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEwRyxTQUExRyxFQUFxSCxJQUFySCxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXFIO0VBQ3JILE1BQUEsQ0FB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QUFDLEVBQVAsQ0FBWCxRQUFILElBQ0E7VUFDRSxPQUFPLEtBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQVA7aUJBQ2QsS0FBQyxDQUFBLE1BQUQ7O09BTEM7YUFNTDs7Y0FFRixRQUFPLFFBQUEsQ0FBQTs7TUFBSTtNQUNULE9BQU8sQ0FBQyxJQUFnQixjQUFDLE1BQUQ7TUFDeEIsS0FBSyxLQUFLLENBQUMsV0FBVyxNQUFELEdBQVUsUUFBQSxDQUFBLEtBQUE7UUFDN0IsSUFBRyxDQUFJLEtBQVA7VUFBa0IsTUFBQTs7UUFDbEIsSUFBRyxLQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFQLENBQVAsUUFBSDtVQUEyQixNQUFBOztRQUMzQixLQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFQLENBQVcsQ0FBQSxDQUFBLENBQUU7UUFDcEIsS0FBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBUCxDQUFhLENBQUEsQ0FBQSxDQUFFO1FBR3BCLElBQUcsS0FBSyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsS0FBQyxDQUFBLEtBQU0sQ0FBQSxFQUFBLENBQUcsQ0FBSSxLQUFDLENBQUEsS0FBaEM7VUFBMkMsS0FBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBLENBQUUsS0FBSyxDQUFDOztRQUMxRCxJQUFHLEtBQUssQ0FBQyxHQUFJLENBQUEsQ0FBQSxDQUFFLEtBQUMsQ0FBQSxHQUFJLENBQUEsRUFBQSxDQUFHLENBQUksS0FBQyxDQUFBLEdBQTVCO1VBQXFDLEtBQUMsQ0FBQSxHQUFJLENBQUEsQ0FBQSxDQUFFLEtBQUssQ0FBQzs7ZUFFbEQsS0FBQyxDQUFBLE1BQUQ7T0FWRzthQVdMOzs7SUF4Q2lEIiwic291cmNlc0NvbnRlbnQiOlsiIyBhdXRvY29tcGlsZVxuXG4jICogcmVxdWlyZVxucmVxdWlyZSEge1xuICBibHVlYmlyZDogcFxuICBsZXNoZGFzaDogeyB3LCBmaW5kLCBvbWl0LCBmaWx0ZXIsIHBpY2ssIGtleXMsIHZhbHVlcywgcG9wLCBhc3NpZ24sIGVhY2gsIHJlZHVjZSwgZmxhdHRlbkRlZXAsIHB1c2gsIG1hcCwgbWFwVmFsdWVzLCBvbWl0IH0gIFxuICBtb21lbnRcbiAgJ21vbWVudC1yYW5nZSdcbn1cblxuIyAqIFR5cGUgY29lcmNpb24gZnVuY3Rpb25zIGZvciBhIG1vcmUgY2hpbGxlZCBvdXQgQVBJXG5mb3JtYXQgPSBleHBvcnRzLmZvcm1hdCA9IC0+IGl0LmZvcm1hdCAnWVlZWS1NTS1ERCdcblxucGFyc2UgPSBleHBvcnRzLnBhcnNlID0gbWFwVmFsdWVzIGRvXG4gIHBhdHRlcm46IC0+XG4gICAgfCBpdD9pc0V2ZW50PyA9PiBbIGl0LnJhbmdlISwgcGF5bG9hZDogaXQucGF5bG9hZCBdXG4gICAgfCBpdD9AQCBpcyBPYmplY3QgYW5kIGl0LnJhbmdlPyA9PiBbIHBhcnNlLnJhbmdlKGl0LnJhbmdlKSwgb21pdChpdCwgJ3JhbmdlJykgXVxuICAgIHwgaXQ/QEAgaXMgT2JqZWN0ID0+IFsgZmFsc2UsIGl0IF1cbiAgICB8IG90aGVyd2lzZSA9PiB0aHJvdyBuZXcgRXJyb3IgXCJpbnZhbGlkIHR5cGUgZm9yIHBhdGVybiAje2l0P3RvU3RyaW5nPyF9ICN7aXQ/QEB9XCJcbiAgICBcbiAgIyAoYW55KSAtPiBFdmVudCB8IEVycm9yXG4gIGV2ZW50OiAtPlxuICAgIGlmIGl0P2lzRXZlbnQ/IHRoZW4gcmV0dXJuIGl0XG4gICAgc3dpdGNoIGl0P0BAXG4gICAgICB8IE9iamVjdCA9PiBuZXcgRXZlbnQgaXRcbiAgICAgIHwgb3RoZXJ3aXNlID0+XG4gICAgICAgIGNvbnNvbGUubG9nIGl0XG4gICAgICAgIGNvbnNvbGUubG9nIFN0cmluZyBpdFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbnZhbGlkIHR5cGUgZm9yIGV2ZW50ICN7aXQ/dG9TdHJpbmc/IX0gI3tpdD9AQH1cIlxuXG4gICMgKGFueSkgLT4gTWVtRXZlbnRzIHwgRXJyb3JcbiAgZXZlbnRzOiAtPlxuICAgIGlmIGl0P2lzRXZlbnRzPyB0aGVuIHJldHVybiBpdFxuICAgICAgXG4gICAgc3dpdGNoIGl0P0BAXG4gICAgICB8IEFycmF5ID0+IG5ldyBNZW1FdmVudHMgaXRcbiAgICAgIHwgb3RoZXJ3aXNlID0+IG5ldyBNZW1FdmVudHMgcGFyc2UuZXZlbnQgaXRcblxuICAjIChBbnkpIC0+IEFycmF5PEV2ZW50PiB8IEVycm9yXG4gIGV2ZW50QXJyYXk6IC0+XG4gICAgZmxhdHRlbkRlZXAgc3dpdGNoIGl0P0BAXG4gICAgICB8IEFycmF5ID0+IG1hcCBpdCwgcGFyc2UuZXZlbnRBcnJheVxuICAgICAgfCBNZW1FdmVudHMgPT4gaXQudG9BcnJheSgpXG4gICAgICB8IG90aGVyd2lzZSA9PiBbIHBhcnNlLmV2ZW50IGl0IF1cbiAgICAgICAgXG4gICMgKCBFdmVudHMgfCBFdmVudCB8IHZvaWQgKSAtPiBSYW5nZVxuICByYW5nZTogKHNvbWV0aGluZywgZGVmKSAtPlxuICAgIHN3aXRjaCBzb21ldGhpbmc/QEBcbiAgICAgIHwgZmFsc2UgPT4gZGVmIG9yIHZvaWRcbiAgICAgIHwgT2JqZWN0ID0+IG1vbWVudC5yYW5nZSBzb21ldGhpbmdcbiAgICAgIHwgQXJyYXkgPT4gbW9tZW50LnJhbmdlIHNvbWV0aGluZ1xuICAgICAgfCBFdmVudCA9PiBzb21ldGhpbmcucmFuZ2UhXG4gICAgICB8IE1lbUV2ZW50cyA9PiBzb21ldGhpbmcucmFuZ2UhXG4gICAgICB8IG90aGVyd2lzZSA9PiBzb21ldGhpbmcucmFuZ2U/ISBvciBzb21ldGhpbmdcbiAgICBcbiMgKCBFdmVudHMgfCBBcnJheTxFdmVudD4gfCBFdmVudCB8IHZvaWQgKSAtPiBBcnJheTxFdmVudD5cbiAgZXZlbnRDb2xsZWN0aW9uOiAoc29tZXRoaW5nKSAtPlxuICAgIHN3aXRjaCBzb21ldGhpbmc/QEBcbiAgICAgIHwgdm9pZCA9PiBbXVxuICAgICAgfCBFdmVudCA9PiBbIEV2ZW50IF1cbiAgICAgIHwgRXZlbnRzID0+IEV2ZW50cy50b0FycmF5KClcbiAgICAgIHwgQXJyYXkgPT4gZmxhdHRlbkRlZXAgc29tZXRoaW5nXG4gICAgICB8IG90aGVyd2lzZSA9PiB0aHJvdyAnd2hhdCBpcyB0aGlzJ1xuXG4gICggZiwgbmFtZSApIC0+IC0+IGYgaWYgaXQ/QEAgaXMgRnVuY3Rpb24gdGhlbiBpdCEgZWxzZSBpdFxuICAgIFxuXG5NYXRjaGVyID0gKHJhbmdlLCBwYXR0ZXJuLCBldmVudCkgLS0+XG4gIFxuICBjaGVja1JhbmdlID0gKGV2ZW50KSAtPlxuICAgIGlmIHJhbmdlIHRoZW4gcmV0dXJuIHJhbmdlLmNvbnRhaW5zIGV2ZW50LnN0YXJ0LmNsb25lKCkuYWRkKDEpIG9yIHJhbmdlLmNvbnRhaW5zIGV2ZW50LmVuZC5jbG9uZSgpLnN1YnRyYWN0KDEpIG9yIGV2ZW50LnJhbmdlIS5jb250YWlucyByYW5nZVxuICAgIGVsc2UgcmV0dXJuIHRydWVcblxuICBjaGVja1JhbmdlU3RyaWN0ID0gKGV2ZW50KSAtPiByYW5nZS5pc0VxdWFsIGV2ZW50LnJhbmdlIVxuXG4gIGNoZWNrUGF0dGVybiA9IChldmVudCkgLT5cbiAgICBub3QgZmluZCBwYXR0ZXJuLCAodmFsdWUsIGtleSkgLT5cbiAgICAgIHN3aXRjaCB2YWx1ZT9AQFxuICAgICAgICB8IHVuZGVmaW5lZCA9PiB0cnVlXG4gICAgICAgIFxuICAgICAgICB8IEJvb2xlYW4gPT5cbiAgICAgICAgICBpZiB2YWx1ZSB0aGVuIG5vdCBldmVudFtrZXldP1xuICAgICAgICAgIGVsc2UgZXZlbnRba2V5XT9cbiAgICAgICAgICBcbiAgICAgICAgfCBGdW5jdGlvbiA9PiBub3QgdmFsdWUgZXZlbnRba2V5XVxuXG4gICAgICAgIHwgb3RoZXJ3aXNlID0+XG4gICAgICAgICAgaWYgbW9tZW50LmlzTW9tZW50IHZhbHVlIHRoZW4gbm90IHZhbHVlLmlzU2FtZSBldmVudFtrZXldXG4gICAgICAgICAgZWxzZSBpZiBldmVudFtrZXldIGlzIHZhbHVlIHRoZW4gZmFsc2UgZWxzZSB0cnVlXG5cbiAgY2hlY2tSYW5nZShldmVudCkgYW5kIGNoZWNrUGF0dGVybihldmVudClcblxuXG4jICogRXZlbnRMaWtlXG4jIG1vcmUgb2YgYSBzcGVjIHRoZW4gYW55dGhpbmcsIHRoaXMgaXMgaW1wbGVtZW50ZWQgYnkgRXZlbnQgJiBFdmVudHNcblxuRXZlbnRMaWtlID0gZXhwb3J0cy5FdmVudExpa2UgPSBjbGFzcyBFdmVudExpa2VcblxuICAjIGZldGNoZXMgYWxsIGV2ZW50cyBmcm9tIGEgY29sbGVjdGlvbiByZWxldmFudCB0byBjdXJyZW50IGV2ZW50IChieSB0eXBlIGFuZCByYW5nZSlcbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICByZWxldmFudEV2ZW50czogKGV2ZW50cykgLT5cbiAgICBwYXJzZS5ldmVudHMgZXZlbnRzXG4gICAgLmZpbHRlciByYW5nZTogQHJhbmdlKCksIHR5cGU6IEB0eXBlXG5cbiAgbmVpZ2hib3VyczogKGV2ZW50cykgLT5cbiAgICBbXG4gICAgICBldmVudHMuZmlsdGVyIGVuZDogQHN0YXJ0LmNsb25lKClcbiAgICAgIGV2ZW50cy5maWx0ZXIgc3RhcnQ6IEBlbmQuY2xvbmUoKVxuICAgIF1cblxuICAjIGdldCBvciBzZXQgcmFuZ2VcbiAgIyAocmFuZ2U/KSAtPiBtb21lbnQucmFuZ2VcbiAgcmFuZ2U6IChzZXRSYW5nZSkgLT5cbiAgICBpZiByYW5nZSA9IHNldFJhbmdlXG4gICAgICBAc3RhcnQgPSByYW5nZS5zdGFydC5jbG9uZSgpXG4gICAgICBAZW5kID0gcmFuZ2UuZW5kLmNsb25lKClcbiAgICBlbHNlXG4gICAgICByYW5nZSA9IG5ldyBtb21lbnQucmFuZ2UgQHN0YXJ0LCBAZW5kXG4gICAgICBcbiAgICByYW5nZVxuXG4gICMgKCBFdmVudExpa2UgKSAtPiBFdmVudHNcbiAgcHVzaDogKGV2ZW50KSAtPiAuLi5cbiAgICBcbiAgIyAoIEV2ZW50TGlrZSApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdDogKHNvbWV0aGluZykgLT5cbiAgICBpZiBzb21ldGhpbmcgaW5zdGFuY2VvZiBFdmVudHMgdGhlbiBAc3VidHJhY3RNYW55IHNvbWV0aGluZ1xuICAgIGVsc2UgQHN1YnRyYWN0T25lIHNvbWV0aGluZ1xuICAgIFxuICAjICggRXZlbnRMaWtlLCAoRXZlbnQsIEV2ZW50KSAtPiBFdmVudHMpIC0+IEV2ZW50c1xuICBjb2xsaWRlOiAoZXZlbnRzLCBjYikgLT4gLi4uXG5cbiAgZWFjaDogLT4gLi4uXG5cbiAgc3VidHJhY3RNYW55OiAtPiAuLi5cblxuICBzdWJ0cmFjdE9uZTogLT4gLi4uXG5cbiMgKiBFdmVudFxuIyByZXByZXNlbnRzIHNvbWUgZXZlbnQgaW4gdGltZSwgZGVmaW5lZCBieSBzdGFydCBhbmQgZW5kIHRpbWVzdGFtcHNcbiMgY2FyaWVzIHNvbWUgcGF5bG9hZCwgbGlrZSBhIHByaWNlIG9yIGEgYm9va2luZ1xuXG5wYXJzZUluaXQgPSAoZGF0YSkgLT5cbiAgaWYgbm90IGRhdGEgdGhlbiByZXR1cm4ge31cbiAgaWYgZGF0YUBAIGlzbnQgT2JqZWN0IHRoZW4gcmV0dXJuIFwid3V0IHd1dFwiXG4gIGRhdGEgPSB7fSA8PDwgZGF0YVxuICAgIFxuICBpZiBkYXRhLmNlbnRlciB0aGVuIHJldHVybiB7IHN0YXJ0OiBtb21lbnQudXRjIGRhdGEuc3RhcnQsIGVuZDogbW9tZW50LnV0YyBkYXRhLmVuZCB9XG4gICAgXG4gIGlmIGRhdGEucmFuZ2VcbiAgICBkYXRhLnN0YXJ0ID0gZGF0YS5yYW5nZS5zdGFydFxuICAgIGRhdGEuZW5kID0gZGF0YS5yYW5nZS5lbmRcbiAgICBkZWxldGUgZGF0YS5yYW5nZVxuICBcbiAgaWYgZGF0YS5zdGFydD9AQCBpbiBbIERhdGUsIFN0cmluZyBdIHRoZW4gZGF0YS5zdGFydCA9IG1vbWVudC51dGMgZGF0YS5zdGFydFxuXG4gIGlmIGRhdGEuZW5kP0BAIGluIFsgRGF0ZSwgU3RyaW5nIF0gdGhlbiBkYXRhLmVuZCA9IG1vbWVudC51dGMgZGF0YS5lbmRcblxuICBpZiBub3QgZGF0YS5pZCB0aGVuIGRhdGEuaWQgPSBkYXRhLnN0YXJ0LmZvcm1hdCgpICsgXCIgXCIgKyBkYXRhLmVuZC5mb3JtYXQoKSArIFwiIFwiICsgZGF0YS50eXBlXG4gICAgICAgIFxuICByZXR1cm4gZGF0YVxuXG5FdmVudCA9IGV4cG9ydHMuRXZlbnQgPSBjbGFzcyBFdmVudCBleHRlbmRzIEV2ZW50TGlrZVxuICBpc0V2ZW50OiB0cnVlXG4gIFxuICAoaW5pdCkgLT4gYXNzaWduIEAsIHBhcnNlSW5pdCBpbml0XG5cbiAgY29tcGFyZTogKGV2ZW50KSAtPlxuICAgIFsgQGlzU2FtZVJhbmdlKGV2ZW50KSwgQGlzU2FtZVBheWxvYWQoZXZlbnQpIF1cblxuICBpc1NhbWU6IChldmVudCkgLT5cbiAgICBAaXNTYW1lUmFuZ2UoZXZlbnQpIGFuZCBAaXNTYW1lUGF5bG9hZChldmVudClcblxuICBpc1NhbWVSYW5nZTogKGV2ZW50KSAtPlxuICAgIGV2ZW50ID0gcGFyc2UuZXZlbnQgZXZlbnRcbiAgICBAcmFuZ2UhLmlzU2FtZSBldmVudC5yYW5nZSFcbiAgICBcbiAgaXNTYW1lUGF5bG9hZDogKGV2ZW50KSAtPlxuICAgIGV2ZW50ID0gcGFyc2UuZXZlbnQgZXZlbnRcbiAgICAoQHR5cGUgaXMgZXZlbnQudHlwZSkgYW5kIChAcGF5bG9hZCBpcyBldmVudC5wYXlsb2FkKVxuICBcbiAgY2xvbmU6IChkYXRhPXt9KSAtPlxuICAgIHJldCA9IG5ldyBFdmVudCBhc3NpZ24ge30sIEAsIHsgaWQ6IEBpZCArICctY2xvbmUnfSwgZGF0YVxuICAgIGRlbGV0ZSByZXQucmVwclxuICAgIHJldFxuXG4gICMgKCkgLT4gSnNvblxuICBzZXJpYWxpemU6IC0+XG4gICAgcGljayhALCA8W3R5cGUgcGF5bG9hZCBpZCB0YWdzXT4pIDw8PCBtYXBWYWx1ZXMgKHBpY2sgQCwgPFsgc3RhcnQgZW5kIF0+KSwgKHZhbHVlKSAtPiB2YWx1ZS51dGMoKS5mb3JtYXQoKVxuXG4gICMgKCkgLT4gU3RyaW5nXG4gIHRvU3RyaW5nOiAtPlxuICAgIHN0YXJ0ID0gZm9ybWF0IEBzdGFydFxuICAgIGVuZCA9IGZvcm1hdCBAZW5kXG4gICAgaWYgQHByaWNlIHRoZW4gXCJQcmljZShcIiArIEBwcmljZSArIFwiIFwiICsgc3RhcnQgKyBcIilcIlxuICAgIGVsc2UgXCJFdmVudChcIiArIChAaWQgb3IgXCJ1bnNhdmVkLVwiICsgQHR5cGUpICArIFwiKVwiXG4gICAgXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgc3VidHJhY3RNYW55OiAoZXZlbnRzKSAtPlxuICAgIEByZWxldmFudEV2ZW50cyBldmVudHNcbiAgICAucmVkdWNlIGRvXG4gICAgICAocmVzLCBldmVudCkgfj4gcmVzLnN1YnRyYWN0T25lIGV2ZW50XG4gICAgICBuZXcgTWVtRXZlbnRzIEBcbiAgICAgIFxuICAjICggRXZlbnQgKSAtPiBFdmVudHNcbiAgc3VidHJhY3RPbmU6IChldmVudCkgLT5cbiAgICBjbnQgPSAwXG4gICAgcmFuZ2UgPSBldmVudC5yYW5nZSgpXG4gICAgcmFuZ2Uuc3RhcnQuc3VidHJhY3QgMSwgJ3NlY29uZCdcbiAgICByYW5nZS5lbmQuYWRkIDEgJ3NlY29uZCdcbiAgICBcbiAgICBuZXcgTWVtRXZlbnRzIG1hcCBkb1xuICAgICAgQHJhbmdlKCkuc3VidHJhY3QgcmFuZ2VcbiAgICAgIH4+IEBjbG9uZSB7IHN0YXJ0OiBpdC5zdGFydCwgZW5kOiBpdC5lbmQsIGlkOiBAaWQgKyAnLScgKyBjbnQrKyB9ICMgZ2V0IHJpZCBvZiBwb3RlbnRpYWwgb2xkIHJlcHIsIHRoaXMgaXMgYSBuZXcgZXZlbnRcbiAgICAgIFxuICAjICggRXZlbnRzLCAoRXZlbnQsIEV2ZW50KSAtPiBFdmVudHMgKSAtPiBFdmVudHNcbiAgY29sbGlkZTogKGV2ZW50cywgY2IpIC0+XG4gICAgQHJlbGV2YW50RXZlbnRzIGV2ZW50c1xuICAgIC5yZWR1Y2UgKGV2ZW50cywgZXZlbnQpIH4+IGV2ZW50cy5wdXNobSBjYiBldmVudCwgQFxuXG4gIGVhY2g6IChjYikgLT4gY2IgQFxuICAgIFxuICBtZXJnZTogKGV2ZW50KSAtPlxuICAgIG5ld1NlbGYgPSBAY2xvbmUoKVxuICAgIGlmIGV2ZW50LnN0YXJ0IDwgbmV3U2VsZi5zdGFydCB0aGVuIG5ld1NlbGYuc3RhcnQgPSBldmVudC5zdGFydFxuICAgIGlmIGV2ZW50LmVuZCA+IG5ld1NlbGYuZW5kIHRoZW4gbmV3U2VsZi5lbmQgPSBldmVudC5lbmRcbiAgICBuZXdTZWxmXG4gICAgXG5cblBlcnNpc3RMYXllciA9IGV4cG9ydHMuUGVyc2lzdExheWVyID0gY2xhc3NcbiAgbWFya1JlbW92ZTogLT4gQHRvUmVtb3ZlID0gdHJ1ZVxuICBcbiAgc2F2ZTogLT4gbmV3IHAgKHJlc29sdmUscmVqZWN0KSB+PlxuICAgIGlmIEB0b1JlbW92ZSB0aGVuIHJlc29sdmUgQHJlbW92ZSFcbiAgICBlbHNlIC4uLlxuICAgICAgXG4gIHJlbW92ZTogLT4gbmV3IHAgKHJlc29sdmUscmVqZWN0KSB+PiAuLi5cblxuIyAqIEV2ZW50c1xuIyBhYnN0cmFjdCBldmVudCBjb2xsZWN0aW9uXG4jIHN1cHBvcnRpbmcgY29tbW9uIHNldCBvcGVyYXRpb25zLFxuIyBhbmQgc29tZSB1bmNvbW1vbiBvcGVyYXRpb25zIHJlbGF0ZWQgdG8gdGltZSAoY29sbGlkZSwgc3VidHJhY3QpXG4gXG5FdmVudHMgPSBleHBvcnRzLkV2ZW50cyA9IGNsYXNzIEV2ZW50cyBleHRlbmRzIEV2ZW50TGlrZVxuICAoLi4uZXZlbnRzKSAtPiBAcHVzaG0uYXBwbHkgQCwgZXZlbnRzXG5cbiAgIyBwZXIgZGF5IGRhdGEgKGFpcmJuYiBhcGkgaGVscGVyKVxuICBkYXlzOiAoY2IpIC0+IEBlYWNoIChldmVudCkgLT4gZXZlbnQucmFuZ2UhYnkgJ2RheXMnLCB+PiBjYiBpdCwgZXZlbnRcblxuICBpc0V2ZW50czogdHJ1ZVxuXG4gICMgKCBNb21lbnRSYW5nZSwgT2JqZWN0ICkgLT4gRXZlbnRzXG4gIGZpbmQ6IChyYW5nZSwgcGF0dGVybikgLT4gLi4uXG4gICAgXG4gICMgKCByYW5nZUVxdWl2YWxlbnQgKSAtPiBFdmVudHNcbiMgIGNsb25lOiAocmFuZ2VFcXVpdmFsZW50KSB+PiAuLi5cblxuICAjICggRXZlbnRDb2xsZWN0aW9uKSAtPiBFdmVudHNcbiAgcHVzaG06IChldmVudENvbGxlY3Rpb24pIC0+IC4uLlxuXG4gICMgKCBFdmVudENvbGxlY3Rpb24pIC0+IEV2ZW50c1xuICBwdXNoOiAoZXZlbnRDb2xsZWN0aW9uKSAtPiBAY2xvbmUgZXZlbnRDb2xsZWN0aW9uXG5cbiAgIyAoKSAtPiBFdmVudHNcbiAgd2l0aG91dDogLT4gIC4uLlxuXG4gICMgKCBGdW5jdGlvbiApIC0+IHZvaWRcbiAgZWFjaDogKGNiKSAtPiAuLi5cblxuICAjICgpIC0+IFN0cmluZ1xuICB0b1N0cmluZzogLT4gXCJFWyN7QGxlbmd0aH1dIDwgXCIgKyAoQG1hcCAoZXZlbnQpIC0+IFwiXCIgKyBldmVudCkuam9pbihcIiwgXCIpICsgXCIgPlwiXG5cbiAgIyAoKSAtPiBKc29uXG4gIHNlcmlhbGl6ZTogLT4gQG1hcCAoLnNlcmlhbGl6ZSEpXG5cbiAgIyAoKSAtPiBBcnJheTxFdmVudD5cbiAgdG9BcnJheTogLT5cbiAgICByZXQgPSBbXVxuICAgIEBlYWNoIC0+IHJldC5wdXNoIGl0XG4gICAgcmV0XG5cbiAgIyAoIChFdmVudCkgLT4gYW55KSApIC0+IEFycmF5PGFueT5cbiAgbWFwOiAoY2IpIC0+XG4gICAgcmV0ID0gW11cbiAgICBAZWFjaCAoZXZlbnQpIC0+IHJldC5wdXNoIGNiIGV2ZW50XG4gICAgcmV0XG5cbiAgIyAoKSAtPiBPYmplY3RcbiAgc3VtbWFyeTogLT5cbiAgICBAcmF3UmVkdWNlIChzdGF0cywgZXZlbnQpIC0+IChzdGF0cyBvciB7fSkgPDw8IFwiI3tldmVudC50eXBlfVwiOiAoc3RhdHM/W2V2ZW50LnR5cGVdIG9yIDApICsgMVxuICBcbiAgIyAoIChFdmVudHMsIEV2ZW50KSAtPiBFdmVudHMgKSAtPiBBcnJheTxhbnk+XG4gIHJhd1JlZHVjZTogKGNiLCBtZW1vKSAtPlxuICAgIEBlYWNoIChldmVudCkgLT4gbWVtbyA6PSBjYiBtZW1vLCBldmVudFxuICAgIG1lbW9cbiAgICBcbiAgIyAoIChFdmVudHMsIEV2ZW50KSAtPiBFdmVudHMgKSAtPiBFdmVudHNcbiAgcmVkdWNlOiAoY2IsIG1lbW8pIC0+XG4gICAgaWYgbm90IG1lbW8gdGhlbiBtZW1vID0gbmV3IE1lbUV2ZW50cygpXG4gICAgQHJhd1JlZHVjZSBjYiwgbWVtb1xuXG4gICMgKCBFdmVudCApIC0+IEJvb2xlYW5cbiAgaGFzOiAodGFyZ2V0RXZlbnQpIC0+XG4gICAgcmFuZ2UgPSB0YXJnZXRFdmVudC5yYW5nZSFcbiAgICBAX2ZpbmQgKGV2ZW50KSAtPiBldmVudC5wYXlsb2FkIGlzIHRhcmdldEV2ZW50LnBheWxvYWQgYW5kIGV2ZW50LnJhbmdlIWlzU2FtZSByYW5nZVxuICAgICAgICAgICAgXG4gICMgKCBFdmVudCB8IHsgcmFuZ2U6IFJhbmdlLCAuLi4gfSApIC0+IEV2ZW50c1xuICBmaW5kOiAtPlxuICAgIG1hdGNoZXIgPSBNYXRjaGVyLmFwcGx5IEAsIHBhcnNlLnBhdHRlcm4gaXRcbiAgICBAX2ZpbmQgbWF0Y2hlclxuICAgIFxuICAjICggeyByYW5nZTogUmFuZ2UsIC4uLiB9ICkgLT4gRXZlbnRzXG4gIGZpbHRlcjogKCBwYXR0ZXJuICktPlxuICAgIG1hdGNoZXIgPSBNYXRjaGVyLmFwcGx5IEAsIHBhcnNlLnBhdHRlcm4gcGF0dGVyblxuICAgIEByZWR1Y2UgKHJldCwgZXZlbnQpIC0+IGlmIG1hdGNoZXIgZXZlbnQgdGhlbiByZXQucHVzaG0gZXZlbnQgZWxzZSByZXRcbiAgICBcbiAgZGlmZjogKGV2ZW50cykgLT5cbiAgICBtYWtlRGlmZiA9IChkaWZmLCBldmVudCkgfj5cbiAgICAgIGNvbGxpc2lvbnMgPSBldmVudC5yZWxldmFudEV2ZW50cyBkaWZmXG4gICAgICBpZiBub3QgY29sbGlzaW9ucy5sZW5ndGggdGhlbiByZXR1cm4gZGlmZlxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gZGlmZi5wb3BtKGNvbGxpc2lvbnMpLnB1c2htIGNvbGxpc2lvbnMucmVkdWNlIChyZXMsIGNvbGxpc2lvbikgLT5cbiAgICAgICAgICBbIHJhbmdlLCBwYXlsb2FkIF0gPSBldmVudC5jb21wYXJlIGNvbGxpc2lvblxuICAgICAgICAgIFxuICAgICAgICAgIGlmIG5vdCByYW5nZSBhbmQgbm90IHBheWxvYWQgdGhlbiByZXR1cm4gcmVzLnB1c2htIGNvbGxpc2lvblxuICAgICAgICAgIGlmIHBheWxvYWQgdGhlbiByZXR1cm4gcmVzLnB1c2htIGNvbGxpc2lvbi5zdWJ0cmFjdCBldmVudFxuICAgICAgICAgIGlmIHJhbmdlIHRoZW4gcmV0dXJuIHJlcy5wdXNobSBjb2xsaXNpb25cbiAgICAgICAgICByZXR1cm4gcmVzXG5cbiAgICBldmVudHMgPSBwYXJzZS5ldmVudHMgZXZlbnRzXG4gICAgQHJlZHVjZSBtYWtlRGlmZiwgZXZlbnRzLmNsb25lKClcblxuICAjIGNvbXBsYXRlbHkgdHJhbnNmb3JtcyB0aGUgZ3JvdXAgb2YgZXZlbnRzLCByZXR1cm5pbmcgcmFuZ2VzIGFkZGVkIGFuZCByZW1vdmVkLCBhbmQgZGIgZXZlbnRzIHRvIGRlbGV0ZSBhbmQgY3JlYXRlIHRvIGFwcGx5IHRoZSBjaGFuZ2VcbiAgIyAoIEV2ZW50cyApIC0+IHsgYnVzeTogRXZlbnRzLCBmcmVlOiBFdmVudHMsIGNyZWF0ZTogRXZlbnRzLCByZW1vdmU6IEV2ZW50cyB9XG4gIGNoYW5nZTogKG5ld0V2ZW50cykgLT5cbiAgICBuZXdFdmVudHMgPSBwYXJzZS5ldmVudHMgbmV3RXZlbnRzXG4gICAgYnVzeSA9IG5ld0V2ZW50cy5zdWJ0cmFjdCBAXG4gICAgZnJlZSA9IEBzdWJ0cmFjdCBuZXdFdmVudHNcblxuICAgIGNyZWF0ZSA9IG5ld0V2ZW50cy5yZWR1Y2UgKGNyZWF0ZSwgZXZlbnQpIH4+IGlmIG5vdCBAaGFzIGV2ZW50IHRoZW4gY3JlYXRlLnB1c2htIGV2ZW50IGVsc2UgY3JlYXRlXG4gICAgcmVtb3ZlID0gQHJlZHVjZSAocmVtb3ZlLCBldmVudCkgLT4gaWYgbm90IG5ld0V2ZW50cy5oYXMgZXZlbnQgdGhlbiByZW1vdmUucHVzaG0gZXZlbnQgZWxzZSByZW1vdmVcbiAgICAgICAgXG4gICAgYnVzeTogYnVzeSwgZnJlZTogZnJlZSwgY3JlYXRlOiBjcmVhdGUsIHJlbW92ZTogcmVtb3ZlXG5cbiAgIyB1cGF0ZXMgZXZlbnRzXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgdXBkYXRlOiAoZXZlbnRzKSAtPlxuICAgIEByZWR1Y2UgZG9cbiAgICAgIChbIGNyZWF0ZSwgcmVtb3ZlIF0sIGV2ZW50KSB+PlxuXG4gICAgICAgIGlmIChyZWxldmFudEV2ZW50cyA9IGV2ZW50LnJlbGV2YW50RXZlbnRzKGV2ZW50cykpLmxlbmd0aFxuICAgICAgICAgIHJlbW92ZS5wdXNobSBldmVudFxuICAgICAgICAgIGNyZWF0ZS5wdXNobSBldmVudC5zdWJ0cmFjdCByZWxldmFudEV2ZW50c1xuXG4gICAgICAgIFsgY3JlYXRlLCByZW1vdmUgXVxuXG4gICAgICBbIGV2ZW50cy5jbG9uZSgpLCBuZXcgTWVtRXZlbnRzKCkgXVxuICAgICAgICAgICAgXG4gIG1lcmdlOiAtPlxuICAgIEByZWR1Y2UgKHJlcywgZXZlbnQpIH4+XG4gICAgICBldmVudFxuICAgICAgLm5laWdoYm91cnMoQClcbiAgICAgIC5tYXAgKG9sZEV2ZW50KSAtPiBcbiAgICAgICAgaWYgb2xkRXZlbnQubGVuZ3RoIGFuZCBvbGRFdmVudC5wYXlsb2FkIGlzIG9sZEV2ZW50LnBheWxvYWQgdGhlbiBvbGRFdmVudC5tZXJnZSBldmVudFxuICAgIFxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHVuaW9uOiAoZXZlbnRzKSAtPlxuICAgIHJlcyA9IEBjbG9uZSgpXG4gICAgZXZlbnRzLmVhY2ggfj4gcmVzLnB1c2htIGl0XG4gICAgcmVzXG5cbiAgIyAoIChFdmVudHMsIChFdmVudDEsIEV2ZW50MikgLT4gRXZlbnRzICkgLT4gRXZlbnRzXG4gIGNvbGxpZGU6IChldmVudHMsIGNiKSAtPlxuICAgIEByZWR1Y2UgKG1lbW8sIGV2ZW50KSAtPiBtZW1vLnB1c2htIGV2ZW50LmNvbGxpZGUgZXZlbnRzLCBjYlxuXG4gICMgKCBFdmVudCApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE9uZTogKGV2ZW50KSAtPlxuICAgIEByZWR1Y2UgKHJldCwgY2hpbGQpIC0+IHJldC5wdXNobSBjaGlsZC5zdWJ0cmFjdCBldmVudFxuXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgc3VidHJhY3RNYW55OiAoZXZlbnRzKSAtPlxuICAgIEByZWR1Y2UgKHJldCwgY2hpbGQpIC0+IHJldC5wdXNobSBjaGlsZC5zdWJ0cmFjdE1hbnkgZXZlbnRzXG5cbiMgKiBNZW1FdmVudHNcbiMgSW4gbWVtb3J5IEV2ZW50IGNvbGxlY3Rpb24gaW1wbGVtZW50YXRpb24sXG4jIHRoaXMgaXMgYSB2ZXJ5IG5haXZlIGltcGxlbWVudGF0aW9uXG4jIFxuIyBJIGd1ZXNzIHdlIHNob3VsZCB1c2UgcmFuZ2UgdHJlZSBkYXRhIHN0cnVjdHVyZSBvciBzb21ldGhpbmcgc21hcnQgbGlrZSB0aGF0IGZvciBmYXN0IHJhbmdlIHNlYXJjaCBpbiB0aGUgZnV0dXJlLlxuIyBpdHMgZ29vZCBlbm91Z2ggZm9yIG5vdyBldmVuIGlmIHdlIGVuZCB1cCBxdWFkcmF0aWMgY29tcGxleGl0eSBmb3IgYWxnb3MsIHdlIGFyZSBub3QgcGFyc2luZyBtYW55IGV2ZW50cyBwZXIgcHJvcGVydHkuXG4jIFxuTWVtRXZlbnRzID0gZXhwb3J0cy5NZW1FdmVudHMgPSBjbGFzcyBNZW1FdmVudHNOYWl2ZSBleHRlbmRzIEV2ZW50c1xuICAtPlxuICAgIGFzc2lnbiBALCBkb1xuICAgICAgZXZlbnRzOiAge31cbiAgICAgIGxlbmd0aDogMFxuICAgICAgdHlwZToge31cbiAgICBzdXBlciAuLi5cbiAgXG4gIHdpdGhvdXQ6IChldmVudCkgLT4gbmV3IE1lbUV2ZW50cyBmaWx0ZXIgKHZhbHVlcyBAZXZlbnRzKSwgLT4gaXQuaWQgaXNudCBldmVudC5pZFxuICAgIFxuICB0b0FycmF5OiAtPiB2YWx1ZXMgQGV2ZW50c1xuXG4gIGVhY2g6IChjYikgLT4gZWFjaCBAZXZlbnRzLCBjYlxuICBcbiAgX2ZpbmQ6IChjYikgLT4gZmluZCBAZXZlbnRzLCBjYlxuXG4gIGNsb25lOiAocmFuZ2UpIC0+IG5ldyBNZW1FdmVudHMgdmFsdWVzIEBldmVudHNcblxuICBwb3BtOiAoLi4uZXZlbnRzKSAtPiBcbiAgICBlYWNoIHBhcnNlLmV2ZW50QXJyYXkoZXZlbnRzKSwgKGV2ZW50KSB+PlxuICAgICAgaWYgbm90IGV2ZW50IHRoZW4gcmV0dXJuXG4gICAgICBpZiBub3QgQGV2ZW50c1tldmVudC5pZF0/IHRoZW4gcmV0dXJuXG4gICAgICBlbHNlXG4gICAgICAgIGRlbGV0ZSBAZXZlbnRzW2V2ZW50LmlkXVxuICAgICAgICBAbGVuZ3RoLS1cbiAgICBAXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVzaG06ICguLi5ldmVudHMpIC0+XG4gICAgY29uc29sZS5sb2cgXCJXSUxMIFBBUlNFXCIsZXZlbnRzXG4gICAgZWFjaCBwYXJzZS5ldmVudEFycmF5KGV2ZW50cyksIChldmVudCkgfj5cbiAgICAgIGlmIG5vdCBldmVudCB0aGVuIHJldHVyblxuICAgICAgaWYgQGV2ZW50c1tldmVudC5pZF0/IHRoZW4gcmV0dXJuXG4gICAgICBAZXZlbnRzW2V2ZW50LmlkXSA9IGV2ZW50XG4gICAgICBAdHlwZVtldmVudC50eXBlXSA9IHRydWVcblxuXG4gICAgICBpZiBldmVudC5zdGFydCA8IEBzdGFydCBvciBub3QgQHN0YXJ0IHRoZW4gQHN0YXJ0ID0gZXZlbnQuc3RhcnRcbiAgICAgIGlmIGV2ZW50LmVuZCA8IEBlbmQgb3Igbm90IEBlbmQgdGhlbiBAZW5kID0gZXZlbnQuZW5kXG4gICAgICBcbiAgICAgIEBsZW5ndGgrK1xuICAgIEBcbiAgXG4iXX0=

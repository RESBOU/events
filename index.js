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
        if (value === true) {
          return event[key] == null;
        } else {
          if (!moment.isMoment(value)) {
            if (event[key] === value) {
              return false;
            } else {
              return true;
            }
          } else {
            return !value.isSame(event[key]);
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
    var ref$, ref1$;
    if (!data) {
      return {};
    }
    if (data.center) {
      return {
        start: data.start,
        end: data.end
      };
    }
    if (data.range) {
      data.start = data.range.start;
      data.end = data.range.end;
      delete data.range;
    }
    if (((ref$ = data.start) != null ? ref$.constructor : void 8) === String) {
      data.start = moment(data.start);
    }
    if (((ref1$ = data.end) != null ? ref1$.constructor : void 8) === String) {
      data.end = moment(data.end);
    }
    if (data.constructor !== Object) {
      return "wut wut";
    } else {
      return data;
    }
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
        return value.format("YYYY-MM-DD HH:mm:ss");
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
      var cnt, this$ = this;
      cnt = 0;
      return new MemEvents(map(this.range().subtract(event.range()), function(it){
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
    prototype.updatePrice = function(priceData){
      var this$ = this;
      return parse.events(priceData).reduce(function(res, event){
        var targets;
        targets = event.relevantEvents(this$);
        if (!targets.length) {
          return res.pushm(event);
        }
        return res.pushm(targets.collide(event, function(event1, event2){
          if (event1.price === event2.price) {
            return res.pushm(event2.clone({
              range: event1.range().add(event2.range())
            }));
          } else {
            return res.pushm([event1, event2.subtract(event1)]);
          }
        }));
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
    prototype.change = function(events){
      var busy, free, ref$, create, remove;
      busy = events.subtract(this);
      free = this.subtract(events);
      ref$ = this.reduce(function(arg$, event){
        var create, remove;
        create = arg$[0], remove = arg$[1];
        if (!create.has(event)) {
          remove.pushm(event);
        }
        return [create, remove];
      }, [events.clone(), new MemEvents()]), create = ref$[0], remove = ref$[1];
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
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9jb3JlL25vZGVfbW9kdWxlcy90aW1lRXZlbnRzL2luZGV4LmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBR1ksQ0FBVixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQTtFQUNBLElBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQVksQ0FBWixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVksQ0FBWixFQUFlLElBQWYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFlLElBQWYsRUFBcUIsSUFBckIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFxQixJQUFyQixFQUEyQixNQUEzQixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTJCLE1BQTNCLEVBQW1DLElBQW5DLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbUMsSUFBbkMsRUFBeUMsSUFBekMsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF5QyxJQUF6QyxFQUErQyxNQUEvQyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStDLE1BQS9DLEVBQXVELEdBQXZELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdUQsR0FBdkQsRUFBNEQsTUFBNUQsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE0RCxNQUE1RCxFQUFvRSxJQUFwRSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW9FLElBQXBFLEVBQTBFLE1BQTFFLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEUsTUFBMUUsRUFBa0YsV0FBbEYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFrRixXQUFsRixFQUErRixJQUEvRixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStGLElBQS9GLEVBQXFHLEdBQXJHLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcUcsR0FBckcsRUFBMEcsU0FBMUcsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEwRyxTQUExRyxFQUFxSCxJQUFySCxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXFIO0VBQ3JILE1BQUEsQ0FBQSxDQUFB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QUFPLFFBQUEsQ0FBQTs7TUFBSTtNQUNULEtBQUssS0FBSyxDQUFDLFdBQVcsTUFBRCxHQUFVLFFBQUEsQ0FBQSxLQUFBO1FBQzdCLElBQUcsQ0FBSSxLQUFQO1VBQWtCLE1BQUE7O1FBQ2xCLElBQUcsS0FBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBUCxDQUFQLFFBQUg7VUFBMkIsTUFBQTs7UUFDM0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBUCxDQUFXLENBQUEsQ0FBQSxDQUFFO1FBQ3BCLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQVAsQ0FBYSxDQUFBLENBQUEsQ0FBRTtRQUdwQixJQUFHLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLEtBQUMsQ0FBQSxLQUFNLENBQUEsRUFBQSxDQUFHLENBQUksS0FBQyxDQUFBLEtBQWhDO1VBQTJDLEtBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLEtBQUssQ0FBQzs7UUFDMUQsSUFBRyxLQUFLLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBRSxLQUFDLENBQUEsR0FBSSxDQUFBLEVBQUEsQ0FBRyxDQUFJLEtBQUMsQ0FBQSxHQUE1QjtVQUFxQyxLQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBRSxLQUFLLENBQUM7O2VBRWxELEtBQUMsQ0FBQSxNQUFEO09BVkc7YUFXTDs7O0lBdkNpRCIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcbiMgKiByZXF1aXJlXG5yZXF1aXJlISB7XG4gIGJsdWViaXJkOiBwXG4gIGxlc2hkYXNoOiB7IHcsIGZpbmQsIG9taXQsIGZpbHRlciwgcGljaywga2V5cywgdmFsdWVzLCBwb3AsIGFzc2lnbiwgZWFjaCwgcmVkdWNlLCBmbGF0dGVuRGVlcCwgcHVzaCwgbWFwLCBtYXBWYWx1ZXMsIG9taXQgfSAgXG4gIG1vbWVudFxuICAnbW9tZW50LXJhbmdlJ1xufVxuXG4jICogVHlwZSBjb2VyY2lvbiBmdW5jdGlvbnMgZm9yIGEgbW9yZSBjaGlsbGVkIG91dCBBUElcbmZvcm1hdCA9IGV4cG9ydHMuZm9ybWF0ID0gLT4gaXQuZm9ybWF0ICdZWVlZLU1NLUREJ1xuXG5wYXJzZSA9IGV4cG9ydHMucGFyc2UgPSBtYXBWYWx1ZXMgZG9cbiAgcGF0dGVybjogLT5cbiAgICB8IGl0P2lzRXZlbnQ/ID0+IFsgaXQucmFuZ2UhLCBwYXlsb2FkOiBpdC5wYXlsb2FkIF1cbiAgICB8IGl0P0BAIGlzIE9iamVjdCBhbmQgaXQucmFuZ2U/ID0+IFsgcGFyc2UucmFuZ2UoaXQucmFuZ2UpLCBvbWl0KGl0LCAncmFuZ2UnKSBdXG4gICAgfCBpdD9AQCBpcyBPYmplY3QgPT4gWyBmYWxzZSwgaXQgXVxuICAgIHwgb3RoZXJ3aXNlID0+IHRocm93IG5ldyBFcnJvciBcImludmFsaWQgdHlwZSBmb3IgcGF0ZXJuICN7aXQ/dG9TdHJpbmc/IX0gI3tpdD9AQH1cIlxuICAgIFxuICAjIChhbnkpIC0+IEV2ZW50IHwgRXJyb3JcbiAgZXZlbnQ6IC0+XG4gICAgaWYgaXQ/aXNFdmVudD8gdGhlbiByZXR1cm4gaXRcbiAgICBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgT2JqZWN0ID0+IG5ldyBFdmVudCBpdFxuICAgICAgfCBvdGhlcndpc2UgPT5cbiAgICAgICAgY29uc29sZS5sb2cgaXRcbiAgICAgICAgY29uc29sZS5sb2cgU3RyaW5nIGl0XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcImludmFsaWQgdHlwZSBmb3IgZXZlbnQgI3tpdD90b1N0cmluZz8hfSAje2l0P0BAfVwiXG5cbiAgIyAoYW55KSAtPiBNZW1FdmVudHMgfCBFcnJvclxuICBldmVudHM6IC0+XG4gICAgaWYgaXQ/aXNFdmVudHM/IHRoZW4gcmV0dXJuIGl0XG4gICAgICBcbiAgICBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgQXJyYXkgPT4gbmV3IE1lbUV2ZW50cyBpdFxuICAgICAgfCBvdGhlcndpc2UgPT4gbmV3IE1lbUV2ZW50cyBwYXJzZS5ldmVudCBpdFxuXG4gICMgKEFueSkgLT4gQXJyYXk8RXZlbnQ+IHwgRXJyb3JcbiAgZXZlbnRBcnJheTogLT5cbiAgICBmbGF0dGVuRGVlcCBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgQXJyYXkgPT4gbWFwIGl0LCBwYXJzZS5ldmVudEFycmF5XG4gICAgICB8IE1lbUV2ZW50cyA9PiBpdC50b0FycmF5KClcbiAgICAgIHwgb3RoZXJ3aXNlID0+IFsgcGFyc2UuZXZlbnQgaXQgXVxuICAgICAgICBcbiAgIyAoIEV2ZW50cyB8IEV2ZW50IHwgdm9pZCApIC0+IFJhbmdlXG4gIHJhbmdlOiAoc29tZXRoaW5nLCBkZWYpIC0+XG4gICAgc3dpdGNoIHNvbWV0aGluZz9AQFxuICAgICAgfCBmYWxzZSA9PiBkZWYgb3Igdm9pZFxuICAgICAgfCBPYmplY3QgPT4gbW9tZW50LnJhbmdlIHNvbWV0aGluZ1xuICAgICAgfCBBcnJheSA9PiBtb21lbnQucmFuZ2Ugc29tZXRoaW5nXG4gICAgICB8IEV2ZW50ID0+IHNvbWV0aGluZy5yYW5nZSFcbiAgICAgIHwgTWVtRXZlbnRzID0+IHNvbWV0aGluZy5yYW5nZSFcbiAgICAgIHwgb3RoZXJ3aXNlID0+IHNvbWV0aGluZy5yYW5nZT8hIG9yIHNvbWV0aGluZ1xuXG4gICAgXG4jICggRXZlbnRzIHwgQXJyYXk8RXZlbnQ+IHwgRXZlbnQgfCB2b2lkICkgLT4gQXJyYXk8RXZlbnQ+XG4gIGV2ZW50Q29sbGVjdGlvbjogKHNvbWV0aGluZykgLT5cbiAgICBzd2l0Y2ggc29tZXRoaW5nP0BAXG4gICAgICB8IHZvaWQgPT4gW11cbiAgICAgIHwgRXZlbnQgPT4gWyBFdmVudCBdXG4gICAgICB8IEV2ZW50cyA9PiBFdmVudHMudG9BcnJheSgpXG4gICAgICB8IEFycmF5ID0+IGZsYXR0ZW5EZWVwIHNvbWV0aGluZ1xuICAgICAgfCBvdGhlcndpc2UgPT4gdGhyb3cgJ3doYXQgaXMgdGhpcydcblxuICAoIGYsIG5hbWUgKSAtPiAtPiBmIGlmIGl0P0BAIGlzIEZ1bmN0aW9uIHRoZW4gaXQhIGVsc2UgaXRcbiAgICBcblxuTWF0Y2hlciA9IChyYW5nZSwgcGF0dGVybiwgZXZlbnQpIC0tPlxuICBcbiAgY2hlY2tSYW5nZSA9IChldmVudCkgLT5cbiAgICBpZiByYW5nZSB0aGVuIHJldHVybiByYW5nZS5jb250YWlucyBldmVudC5zdGFydC5jbG9uZSgpLmFkZCgxKSBvciByYW5nZS5jb250YWlucyBldmVudC5lbmQuY2xvbmUoKS5zdWJ0cmFjdCgxKSBvciBldmVudC5yYW5nZSEuY29udGFpbnMgcmFuZ2VcbiAgICBlbHNlIHJldHVybiB0cnVlXG5cbiAgY2hlY2tSYW5nZVN0cmljdCA9IChldmVudCkgLT4gcmFuZ2UuaXNFcXVhbCBldmVudC5yYW5nZSFcblxuICBjaGVja1BhdHRlcm4gPSAoZXZlbnQpIC0+XG4gICAgbm90IGZpbmQgcGF0dGVybiwgKHZhbHVlLCBrZXkpIC0+XG4gICAgICBpZiB2YWx1ZSBpcyB0cnVlIHRoZW4gcmV0dXJuIG5vdCBldmVudFtrZXldP1xuICAgICAgZWxzZVxuICAgICAgICBpZiBub3QgbW9tZW50LmlzTW9tZW50IHZhbHVlXG4gICAgICAgICAgaWYgZXZlbnRba2V5XSBpcyB2YWx1ZSB0aGVuIHJldHVybiBmYWxzZSBlbHNlIHJldHVybiB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gbm90IHZhbHVlLmlzU2FtZSBldmVudFtrZXldXG5cbiAgY2hlY2tSYW5nZShldmVudCkgYW5kIGNoZWNrUGF0dGVybihldmVudClcblxuXG5cbiMgKiBFdmVudExpa2VcbiMgbW9yZSBvZiBhIHNwZWMgdGhlbiBhbnl0aGluZywgdGhpcyBpcyBpbXBsZW1lbnRlZCBieSBFdmVudCAmIEV2ZW50c1xuXG5FdmVudExpa2UgPSBleHBvcnRzLkV2ZW50TGlrZSA9IGNsYXNzIEV2ZW50TGlrZVxuXG4gICMgZmV0Y2hlcyBhbGwgZXZlbnRzIGZyb20gYSBjb2xsZWN0aW9uIHJlbGV2YW50IHRvIGN1cnJlbnQgZXZlbnQgKGJ5IHR5cGUgYW5kIHJhbmdlKVxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHJlbGV2YW50RXZlbnRzOiAoZXZlbnRzKSAtPlxuICAgIHBhcnNlLmV2ZW50cyBldmVudHNcbiAgICAuZmlsdGVyIHJhbmdlOiBAcmFuZ2UoKSwgdHlwZTogQHR5cGVcblxuICBuZWlnaGJvdXJzOiAoZXZlbnRzKSAtPlxuICAgIFtcbiAgICAgIGV2ZW50cy5maWx0ZXIgZW5kOiBAc3RhcnQuY2xvbmUoKVxuICAgICAgZXZlbnRzLmZpbHRlciBzdGFydDogQGVuZC5jbG9uZSgpXG4gICAgXVxuXG4gICMgZ2V0IG9yIHNldCByYW5nZVxuICAjIChyYW5nZT8pIC0+IG1vbWVudC5yYW5nZVxuICByYW5nZTogKHNldFJhbmdlKSAtPlxuICAgIGlmIHJhbmdlID0gc2V0UmFuZ2VcbiAgICAgIEBzdGFydCA9IHJhbmdlLnN0YXJ0LmNsb25lKClcbiAgICAgIEBlbmQgPSByYW5nZS5lbmQuY2xvbmUoKVxuICAgIGVsc2VcbiAgICAgIHJhbmdlID0gbmV3IG1vbWVudC5yYW5nZSBAc3RhcnQsIEBlbmRcbiAgICAgIFxuICAgIHJhbmdlXG5cbiAgIyAoIEV2ZW50TGlrZSApIC0+IEV2ZW50c1xuICBwdXNoOiAoZXZlbnQpIC0+IC4uLlxuICAgIFxuICAjICggRXZlbnRMaWtlICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0OiAoc29tZXRoaW5nKSAtPlxuICAgIGlmIHNvbWV0aGluZyBpbnN0YW5jZW9mIEV2ZW50cyB0aGVuIEBzdWJ0cmFjdE1hbnkgc29tZXRoaW5nXG4gICAgZWxzZSBAc3VidHJhY3RPbmUgc29tZXRoaW5nXG4gICAgXG4gICMgKCBFdmVudExpa2UsIChFdmVudCwgRXZlbnQpIC0+IEV2ZW50cykgLT4gRXZlbnRzXG4gIGNvbGxpZGU6IChldmVudHMsIGNiKSAtPiAuLi5cblxuICBlYWNoOiAtPiAuLi5cblxuICBzdWJ0cmFjdE1hbnk6IC0+IC4uLlxuXG4gIHN1YnRyYWN0T25lOiAtPiAuLi5cblxuIyAqIEV2ZW50XG4jIHJlcHJlc2VudHMgc29tZSBldmVudCBpbiB0aW1lLCBkZWZpbmVkIGJ5IHN0YXJ0IGFuZCBlbmQgdGltZXN0YW1wc1xuIyBjYXJpZXMgc29tZSBwYXlsb2FkLCBsaWtlIGEgcHJpY2Ugb3IgYSBib29raW5nXG5cbnBhcnNlSW5pdCA9IChkYXRhKSAtPlxuICBpZiBub3QgZGF0YSB0aGVuIHJldHVybiB7fVxuICBpZiBkYXRhLmNlbnRlciB0aGVuIHJldHVybiB7IHN0YXJ0OiBkYXRhLnN0YXJ0LCBlbmQ6IGRhdGEuZW5kIH1cbiAgaWYgZGF0YS5yYW5nZVxuICAgIGRhdGEuc3RhcnQgPSBkYXRhLnJhbmdlLnN0YXJ0XG4gICAgZGF0YS5lbmQgPSBkYXRhLnJhbmdlLmVuZFxuICAgIGRlbGV0ZSBkYXRhLnJhbmdlXG5cbiAgaWYgZGF0YS5zdGFydD9AQCBpcyBTdHJpbmcgdGhlbiBkYXRhLnN0YXJ0ID0gbW9tZW50IGRhdGEuc3RhcnRcbiAgaWYgZGF0YS5lbmQ/QEAgaXMgU3RyaW5nIHRoZW4gZGF0YS5lbmQgPSBtb21lbnQgZGF0YS5lbmRcbiAgICBcbiAgaWYgZGF0YUBAIGlzbnQgT2JqZWN0IHRoZW4gcmV0dXJuIFwid3V0IHd1dFwiXG4gIGVsc2UgcmV0dXJuIGRhdGFcblxuRXZlbnQgPSBleHBvcnRzLkV2ZW50ID0gY2xhc3MgRXZlbnQgZXh0ZW5kcyBFdmVudExpa2VcbiAgaXNFdmVudDogdHJ1ZVxuICBcbiAgKGluaXQpIC0+IGFzc2lnbiBALCBwYXJzZUluaXQgaW5pdFxuXG4gIGNvbXBhcmU6IChldmVudCkgLT5cbiAgICBbIEBpc1NhbWVSYW5nZShldmVudCksIEBpc1NhbWVQYXlsb2FkKGV2ZW50KSBdXG5cbiAgaXNTYW1lOiAoZXZlbnQpIC0+XG4gICAgQGlzU2FtZVJhbmdlKGV2ZW50KSBhbmQgQGlzU2FtZVBheWxvYWQoZXZlbnQpXG5cbiAgaXNTYW1lUmFuZ2U6IChldmVudCkgLT5cbiAgICBldmVudCA9IHBhcnNlLmV2ZW50IGV2ZW50XG4gICAgQHJhbmdlIS5pc1NhbWUgZXZlbnQucmFuZ2UhXG4gICAgXG4gIGlzU2FtZVBheWxvYWQ6IChldmVudCkgLT5cbiAgICBldmVudCA9IHBhcnNlLmV2ZW50IGV2ZW50XG4gICAgKEB0eXBlIGlzIGV2ZW50LnR5cGUpIGFuZCAoQHBheWxvYWQgaXMgZXZlbnQucGF5bG9hZClcbiAgXG4gIGNsb25lOiAoZGF0YT17fSkgLT5cbiAgICByZXQgPSBuZXcgRXZlbnQgYXNzaWduIHt9LCBALCB7IGlkOiBAaWQgKyAnLWNsb25lJ30sIGRhdGFcbiAgICBkZWxldGUgcmV0LnJlcHJcbiAgICByZXRcblxuICAjICgpIC0+IEpzb25cbiAgc2VyaWFsaXplOiAtPlxuICAgIHBpY2soQCwgPFt0eXBlIHBheWxvYWQgaWQgdGFnc10+KSA8PDwgbWFwVmFsdWVzIChwaWNrIEAsIDxbIHN0YXJ0IGVuZCBdPiksICh2YWx1ZSkgLT4gdmFsdWUuZm9ybWF0IFwiWVlZWS1NTS1ERCBISDptbTpzc1wiXG5cbiAgIyAoKSAtPiBTdHJpbmdcbiAgdG9TdHJpbmc6IC0+XG4gICAgc3RhcnQgPSBmb3JtYXQgQHN0YXJ0XG4gICAgZW5kID0gZm9ybWF0IEBlbmRcbiAgICBpZiBAcHJpY2UgdGhlbiBcIlByaWNlKFwiICsgQHByaWNlICsgXCIgXCIgKyBzdGFydCArIFwiKVwiXG4gICAgZWxzZSBcIkV2ZW50KFwiICsgKEBpZCBvciBcInVuc2F2ZWQtXCIgKyBAdHlwZSkgICsgXCIpXCJcbiAgICBcbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE1hbnk6IChldmVudHMpIC0+XG4gICAgQHJlbGV2YW50RXZlbnRzIGV2ZW50c1xuICAgIC5yZWR1Y2UgZG9cbiAgICAgIChyZXMsIGV2ZW50KSB+PiByZXMuc3VidHJhY3RPbmUgZXZlbnRcbiAgICAgIG5ldyBNZW1FdmVudHMgQFxuICAgICAgXG4gICMgKCBFdmVudCApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE9uZTogKGV2ZW50KSAtPlxuICAgIGNudCA9IDBcbiAgICBuZXcgTWVtRXZlbnRzIG1hcCBkb1xuICAgICAgQHJhbmdlKCkuc3VidHJhY3QgZXZlbnQucmFuZ2UoKVxuICAgICAgfj4gQGNsb25lIHsgc3RhcnQ6IGl0LnN0YXJ0LCBlbmQ6IGl0LmVuZCwgaWQ6IEBpZCArICctJyArIGNudCsrIH0gIyBnZXQgcmlkIG9mIHBvdGVudGlhbCBvbGQgcmVwciwgdGhpcyBpcyBhIG5ldyBldmVudFxuXG4gICMgKCBFdmVudHMsIChFdmVudCwgRXZlbnQpIC0+IEV2ZW50cyApIC0+IEV2ZW50c1xuICBjb2xsaWRlOiAoZXZlbnRzLCBjYikgLT5cbiAgICBAcmVsZXZhbnRFdmVudHMgZXZlbnRzXG4gICAgLnJlZHVjZSAoZXZlbnRzLCBldmVudCkgfj4gZXZlbnRzLnB1c2htIGNiIGV2ZW50LCBAXG5cbiAgZWFjaDogKGNiKSAtPiBjYiBAXG4gICAgXG4gIG1lcmdlOiAoZXZlbnQpIC0+XG4gICAgbmV3U2VsZiA9IEBjbG9uZSgpXG4gICAgaWYgZXZlbnQuc3RhcnQgPCBuZXdTZWxmLnN0YXJ0IHRoZW4gbmV3U2VsZi5zdGFydCA9IGV2ZW50LnN0YXJ0XG4gICAgaWYgZXZlbnQuZW5kID4gbmV3U2VsZi5lbmQgdGhlbiBuZXdTZWxmLmVuZCA9IGV2ZW50LmVuZFxuICAgIG5ld1NlbGZcbiAgICBcblxuUGVyc2lzdExheWVyID0gZXhwb3J0cy5QZXJzaXN0TGF5ZXIgPSBjbGFzc1xuICBtYXJrUmVtb3ZlOiAtPiBAdG9SZW1vdmUgPSB0cnVlXG4gIFxuICBzYXZlOiAtPiBuZXcgcCAocmVzb2x2ZSxyZWplY3QpIH4+XG4gICAgaWYgQHRvUmVtb3ZlIHRoZW4gcmVzb2x2ZSBAcmVtb3ZlIVxuICAgIGVsc2UgLi4uXG4gICAgICBcbiAgcmVtb3ZlOiAtPiBuZXcgcCAocmVzb2x2ZSxyZWplY3QpIH4+IC4uLlxuXG4jICogRXZlbnRzXG4jIGFic3RyYWN0IGV2ZW50IGNvbGxlY3Rpb25cbiMgc3VwcG9ydGluZyBjb21tb24gc2V0IG9wZXJhdGlvbnMsXG4jIGFuZCBzb21lIHVuY29tbW9uIG9wZXJhdGlvbnMgcmVsYXRlZCB0byB0aW1lIChjb2xsaWRlLCBzdWJ0cmFjdClcbiBcbkV2ZW50cyA9IGV4cG9ydHMuRXZlbnRzID0gY2xhc3MgRXZlbnRzIGV4dGVuZHMgRXZlbnRMaWtlXG4gICguLi5ldmVudHMpIC0+IEBwdXNobS5hcHBseSBALCBldmVudHNcblxuICAjIHBlciBkYXkgZGF0YSAoYWlyYm5iIGFwaSBoZWxwZXIpXG4gIGRheXM6IChjYikgLT4gQGVhY2ggKGV2ZW50KSAtPiBldmVudC5yYW5nZSFieSAnZGF5cycsIH4+IGNiIGl0LCBldmVudFxuXG4gIGlzRXZlbnRzOiB0cnVlXG5cbiAgIyAoIE1vbWVudFJhbmdlLCBPYmplY3QgKSAtPiBFdmVudHNcbiAgZmluZDogKHJhbmdlLCBwYXR0ZXJuKSAtPiAuLi5cbiAgICBcbiAgIyAoIHJhbmdlRXF1aXZhbGVudCApIC0+IEV2ZW50c1xuIyAgY2xvbmU6IChyYW5nZUVxdWl2YWxlbnQpIH4+IC4uLlxuXG4gICMgKCBFdmVudENvbGxlY3Rpb24pIC0+IEV2ZW50c1xuICBwdXNobTogKGV2ZW50Q29sbGVjdGlvbikgLT4gLi4uXG5cbiAgIyAoIEV2ZW50Q29sbGVjdGlvbikgLT4gRXZlbnRzXG4gIHB1c2g6IChldmVudENvbGxlY3Rpb24pIC0+IEBjbG9uZSBldmVudENvbGxlY3Rpb25cblxuICAjICgpIC0+IEV2ZW50c1xuICB3aXRob3V0OiAtPiAgLi4uXG5cbiAgIyAoIEZ1bmN0aW9uICkgLT4gdm9pZFxuICBlYWNoOiAoY2IpIC0+IC4uLlxuXG4gICMgKCkgLT4gU3RyaW5nXG4gIHRvU3RyaW5nOiAtPiBcIkVbI3tAbGVuZ3RofV0gPCBcIiArIChAbWFwIChldmVudCkgLT4gXCJcIiArIGV2ZW50KS5qb2luKFwiLCBcIikgKyBcIiA+XCJcblxuICAjICgpIC0+IEpzb25cbiAgc2VyaWFsaXplOiAtPiBAbWFwICguc2VyaWFsaXplISlcblxuICAjICgpIC0+IEFycmF5PEV2ZW50PlxuICB0b0FycmF5OiAtPlxuICAgIHJldCA9IFtdXG4gICAgQGVhY2ggLT4gcmV0LnB1c2ggaXRcbiAgICByZXRcblxuICAjICggKEV2ZW50KSAtPiBhbnkpICkgLT4gQXJyYXk8YW55PlxuICBtYXA6IChjYikgLT5cbiAgICByZXQgPSBbXVxuICAgIEBlYWNoIChldmVudCkgLT4gcmV0LnB1c2ggY2IgZXZlbnRcbiAgICByZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAjICggKEV2ZW50cywgRXZlbnQpIC0+IEV2ZW50cyApIC0+IEFycmF5PGFueT5cbiAgcmF3UmVkdWNlOiAoY2IsIG1lbW8pIC0+XG4gICAgQGVhY2ggKGV2ZW50KSAtPiBtZW1vIDo9IGNiIG1lbW8sIGV2ZW50XG4gICAgbWVtb1xuICAgIFxuICAjICggKEV2ZW50cywgRXZlbnQpIC0+IEV2ZW50cyApIC0+IEV2ZW50c1xuICByZWR1Y2U6IChjYiwgbWVtbykgLT5cbiAgICBpZiBub3QgbWVtbyB0aGVuIG1lbW8gPSBuZXcgTWVtRXZlbnRzKClcbiAgICBAcmF3UmVkdWNlIGNiLCBtZW1vXG5cbiAgIyAoIEV2ZW50ICkgLT4gQm9vbGVhblxuICBoYXM6ICh0YXJnZXRFdmVudCkgLT5cbiAgICByYW5nZSA9IHRhcmdldEV2ZW50LnJhbmdlIVxuICAgIEBfZmluZCAoZXZlbnQpIC0+IGV2ZW50LnBheWxvYWQgaXMgdGFyZ2V0RXZlbnQucGF5bG9hZCBhbmQgZXZlbnQucmFuZ2UhaXNTYW1lIHJhbmdlXG4gICAgICAgICAgICBcbiAgIyAoIEV2ZW50IHwgeyByYW5nZTogUmFuZ2UsIC4uLiB9ICkgLT4gRXZlbnRzXG4gIGZpbmQ6IC0+XG4gICAgbWF0Y2hlciA9IE1hdGNoZXIuYXBwbHkgQCwgcGFyc2UucGF0dGVybiBpdFxuICAgIEBfZmluZCBtYXRjaGVyXG4gICAgXG4gICMgKCB7IHJhbmdlOiBSYW5nZSwgLi4uIH0gKSAtPiBFdmVudHNcbiAgZmlsdGVyOiAoIHBhdHRlcm4gKS0+XG4gICAgbWF0Y2hlciA9IE1hdGNoZXIuYXBwbHkgQCwgcGFyc2UucGF0dGVybiBwYXR0ZXJuXG4gICAgQHJlZHVjZSAocmV0LCBldmVudCkgLT4gaWYgbWF0Y2hlciBldmVudCB0aGVuIHJldC5wdXNobSBldmVudCBlbHNlIHJldFxuICAgIFxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHVwZGF0ZVByaWNlOiAocHJpY2VEYXRhKSAtPiAgICBcbiAgICBwYXJzZS5ldmVudHMgcHJpY2VEYXRhXG4gICAgLnJlZHVjZSAocmVzLCBldmVudCkgfj5cblxuICAgICAgdGFyZ2V0cyA9IGV2ZW50LnJlbGV2YW50RXZlbnRzIEBcbiAgICAgIFxuICAgICAgaWYgbm90IHRhcmdldHMubGVuZ3RoIHRoZW4gcmV0dXJuIHJlcy5wdXNobSBldmVudFxuICAgICAgICBcbiAgICAgIHJlcy5wdXNobSB0YXJnZXRzLmNvbGxpZGUgZXZlbnQsIChldmVudDEsIGV2ZW50MikgLT5cbiAgICAgICAgaWYgZXZlbnQxLnByaWNlIGlzIGV2ZW50Mi5wcmljZVxuICAgICAgICAgIHJlcy5wdXNobSBldmVudDIuY2xvbmUgcmFuZ2U6IGV2ZW50MS5yYW5nZSFhZGQgZXZlbnQyLnJhbmdlIVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVzLnB1c2htIFsgZXZlbnQxLCBldmVudDIuc3VidHJhY3QoZXZlbnQxKSBdXG5cbiAgZGlmZjogKGV2ZW50cykgLT5cbiAgICBtYWtlRGlmZiA9IChkaWZmLCBldmVudCkgfj5cbiAgICAgIGNvbGxpc2lvbnMgPSBldmVudC5yZWxldmFudEV2ZW50cyBkaWZmXG4gICAgICBpZiBub3QgY29sbGlzaW9ucy5sZW5ndGggdGhlbiByZXR1cm4gZGlmZlxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gZGlmZi5wb3BtKGNvbGxpc2lvbnMpLnB1c2htIGNvbGxpc2lvbnMucmVkdWNlIChyZXMsIGNvbGxpc2lvbikgLT5cbiAgICAgICAgICBbIHJhbmdlLCBwYXlsb2FkIF0gPSBldmVudC5jb21wYXJlIGNvbGxpc2lvblxuICAgICAgICAgIFxuICAgICAgICAgIGlmIG5vdCByYW5nZSBhbmQgbm90IHBheWxvYWQgdGhlbiByZXR1cm4gcmVzLnB1c2htIGNvbGxpc2lvblxuICAgICAgICAgIGlmIHBheWxvYWQgdGhlbiByZXR1cm4gcmVzLnB1c2htIGNvbGxpc2lvbi5zdWJ0cmFjdCBldmVudFxuICAgICAgICAgIGlmIHJhbmdlIHRoZW4gcmV0dXJuIHJlcy5wdXNobSBjb2xsaXNpb25cbiAgICAgICAgICByZXR1cm4gcmVzXG5cbiAgICBldmVudHMgPSBwYXJzZS5ldmVudHMgZXZlbnRzXG4gICAgQHJlZHVjZSBtYWtlRGlmZiwgZXZlbnRzLmNsb25lKClcblxuICAjIGNvbXBsYXRlbHkgdHJhbnNmb3JtcyB0aGUgZ3JvdXAgb2YgZXZlbnRzLCByZXR1cm5pbmcgcmFuZ2VzIGFkZGVkIGFuZCByZW1vdmVkLCBhbmQgZGIgZXZlbnRzIHRvIGRlbGV0ZSBhbmQgY3JlYXRlIHRvIGFwcGx5IHRoZSBjaGFuZ2VcbiAgIyAoIEV2ZW50cyApIC0+IHsgYnVzeTogRXZlbnRzLCBmcmVlOiBFdmVudHMsIGNyZWF0ZTogRXZlbnRzLCByZW1vdmU6IEV2ZW50cyB9XG4gIGNoYW5nZTogKGV2ZW50cykgLT5cbiAgICBidXN5ID0gZXZlbnRzLnN1YnRyYWN0IEBcbiAgICBmcmVlID0gQHN1YnRyYWN0IGV2ZW50c1xuICAgIFxuICAgIFsgY3JlYXRlLCByZW1vdmUgXSA9IEByZWR1Y2UgZG9cbiAgICAgIChbIGNyZWF0ZSwgcmVtb3ZlIF0sIGV2ZW50KSAtPlxuICAgICAgICBpZiBub3QgY3JlYXRlLmhhcyBldmVudCB0aGVuIHJlbW92ZS5wdXNobSBldmVudFxuICAgICAgICBbIGNyZWF0ZSwgcmVtb3ZlIF1cbiAgICAgICAgXG4gICAgICBbIGV2ZW50cy5jbG9uZSgpLCBuZXcgTWVtRXZlbnRzKCkgXVxuXG4gICAgYnVzeTogYnVzeSwgZnJlZTogZnJlZSwgY3JlYXRlOiBjcmVhdGUsIHJlbW92ZTogcmVtb3ZlXG5cbiAgICAgICAgXG4gICMgdXBhdGVzIGV2ZW50c1xuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHVwZGF0ZTogKGV2ZW50cykgLT5cbiAgICBAcmVkdWNlIGRvXG4gICAgICAoWyBjcmVhdGUsIHJlbW92ZSBdLCBldmVudCkgfj5cblxuICAgICAgICBpZiAocmVsZXZhbnRFdmVudHMgPSBldmVudC5yZWxldmFudEV2ZW50cyhldmVudHMpKS5sZW5ndGhcbiAgICAgICAgICByZW1vdmUucHVzaG0gZXZlbnRcbiAgICAgICAgICBjcmVhdGUucHVzaG0gZXZlbnQuc3VidHJhY3QgcmVsZXZhbnRFdmVudHNcblxuICAgICAgICBbIGNyZWF0ZSwgcmVtb3ZlIF1cblxuICAgICAgWyBldmVudHMuY2xvbmUoKSwgbmV3IE1lbUV2ZW50cygpIF1cblxuICAgICAgICAgICAgXG4gIG1lcmdlOiAtPlxuICAgIEByZWR1Y2UgKHJlcywgZXZlbnQpIH4+XG4gICAgICBldmVudFxuICAgICAgLm5laWdoYm91cnMoQClcbiAgICAgIC5tYXAgKG9sZEV2ZW50KSAtPiBcbiAgICAgICAgaWYgb2xkRXZlbnQubGVuZ3RoIGFuZCBvbGRFdmVudC5wYXlsb2FkIGlzIG9sZEV2ZW50LnBheWxvYWQgdGhlbiBvbGRFdmVudC5tZXJnZSBldmVudFxuICAgIFxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHVuaW9uOiAoZXZlbnRzKSAtPlxuICAgIHJlcyA9IEBjbG9uZSgpXG4gICAgZXZlbnRzLmVhY2ggfj4gcmVzLnB1c2htIGl0XG4gICAgcmVzXG5cbiAgIyAoIChFdmVudHMsIChFdmVudDEsIEV2ZW50MikgLT4gRXZlbnRzICkgLT4gRXZlbnRzXG4gIGNvbGxpZGU6IChldmVudHMsIGNiKSAtPlxuICAgIEByZWR1Y2UgKG1lbW8sIGV2ZW50KSAtPiBtZW1vLnB1c2htIGV2ZW50LmNvbGxpZGUgZXZlbnRzLCBjYlxuXG4gICMgKCBFdmVudCApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE9uZTogKGV2ZW50KSAtPlxuICAgIEByZWR1Y2UgKHJldCwgY2hpbGQpIC0+IHJldC5wdXNobSBjaGlsZC5zdWJ0cmFjdCBldmVudFxuXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgc3VidHJhY3RNYW55OiAoZXZlbnRzKSAtPlxuICAgIEByZWR1Y2UgKHJldCwgY2hpbGQpIC0+IHJldC5wdXNobSBjaGlsZC5zdWJ0cmFjdE1hbnkgZXZlbnRzXG5cbiAgXG4jICogTWVtRXZlbnRzXG4jIEluIG1lbW9yeSBFdmVudCBjb2xsZWN0aW9uIGltcGxlbWVudGF0aW9uLFxuIyB0aGlzIGlzIGEgdmVyeSBuYWl2ZSBpbXBsZW1lbnRhdGlvblxuIyBcbiMgSSBndWVzcyB3ZSBzaG91bGQgdXNlIHJhbmdlIHRyZWUgZGF0YSBzdHJ1Y3R1cmUgb3Igc29tZXRoaW5nIHNtYXJ0IGxpa2UgdGhhdCBmb3IgZmFzdCByYW5nZSBzZWFyY2ggaW4gdGhlIGZ1dHVyZS5cbiMgaXRzIGdvb2QgZW5vdWdoIGZvciBub3cgZXZlbiBpZiB3ZSBlbmQgdXAgcXVhZHJhdGljIGNvbXBsZXhpdHkgZm9yIGFsZ29zLCB3ZSBhcmUgbm90IHBhcnNpbmcgbWFueSBldmVudHMgcGVyIHByb3BlcnR5LlxuIyBcbk1lbUV2ZW50cyA9IGV4cG9ydHMuTWVtRXZlbnRzID0gY2xhc3MgTWVtRXZlbnRzTmFpdmUgZXh0ZW5kcyBFdmVudHNcbiAgLT5cbiAgICBhc3NpZ24gQCwgZG9cbiAgICAgIGV2ZW50czogIHt9XG4gICAgICBsZW5ndGg6IDBcbiAgICAgIHR5cGU6IHt9XG4gICAgc3VwZXIgLi4uXG4gIFxuICB3aXRob3V0OiAoZXZlbnQpIC0+IG5ldyBNZW1FdmVudHMgZmlsdGVyICh2YWx1ZXMgQGV2ZW50cyksIC0+IGl0LmlkIGlzbnQgZXZlbnQuaWRcbiAgICBcbiAgdG9BcnJheTogLT4gdmFsdWVzIEBldmVudHNcblxuICBlYWNoOiAoY2IpIC0+IGVhY2ggQGV2ZW50cywgY2JcbiAgXG4gIF9maW5kOiAoY2IpIC0+IGZpbmQgQGV2ZW50cywgY2JcblxuICBjbG9uZTogKHJhbmdlKSAtPiBuZXcgTWVtRXZlbnRzIHZhbHVlcyBAZXZlbnRzXG5cbiAgcG9wbTogKC4uLmV2ZW50cykgLT4gXG4gICAgZWFjaCBwYXJzZS5ldmVudEFycmF5KGV2ZW50cyksIChldmVudCkgfj5cbiAgICAgIGlmIG5vdCBldmVudCB0aGVuIHJldHVyblxuICAgICAgaWYgbm90IEBldmVudHNbZXZlbnQuaWRdPyB0aGVuIHJldHVyblxuICAgICAgZWxzZVxuICAgICAgICBkZWxldGUgQGV2ZW50c1tldmVudC5pZF1cbiAgICAgICAgQGxlbmd0aC0tXG4gICAgQFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1c2htOiAoLi4uZXZlbnRzKSAtPlxuICAgIGVhY2ggcGFyc2UuZXZlbnRBcnJheShldmVudHMpLCAoZXZlbnQpIH4+XG4gICAgICBpZiBub3QgZXZlbnQgdGhlbiByZXR1cm5cbiAgICAgIGlmIEBldmVudHNbZXZlbnQuaWRdPyB0aGVuIHJldHVyblxuICAgICAgQGV2ZW50c1tldmVudC5pZF0gPSBldmVudFxuICAgICAgQHR5cGVbZXZlbnQudHlwZV0gPSB0cnVlXG5cblxuICAgICAgaWYgZXZlbnQuc3RhcnQgPCBAc3RhcnQgb3Igbm90IEBzdGFydCB0aGVuIEBzdGFydCA9IGV2ZW50LnN0YXJ0XG4gICAgICBpZiBldmVudC5lbmQgPCBAZW5kIG9yIG5vdCBAZW5kIHRoZW4gQGVuZCA9IGV2ZW50LmVuZFxuICAgICAgXG4gICAgICBAbGVuZ3RoKytcbiAgICBAXG4gIFxuIl19

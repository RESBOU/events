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
        switch (value.constructor) {
        case Boolean:
          if (value === true) {
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
    if ((ref$ = (ref1$ = data.start) != null ? ref1$.constructor : void 8) === String || ref$ === Date) {
      data.start = moment(data.start);
    }
    if ((ref$ = (ref2$ = data.end) != null ? ref2$.constructor : void 8) === String || ref$ === Date) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9jb3JlL25vZGVfbW9kdWxlcy90aW1lRXZlbnRzL2luZGV4LmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBR1ksQ0FBVixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQTtFQUNBLElBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQVksQ0FBWixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVksQ0FBWixFQUFlLElBQWYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFlLElBQWYsRUFBcUIsSUFBckIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFxQixJQUFyQixFQUEyQixNQUEzQixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTJCLE1BQTNCLEVBQW1DLElBQW5DLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbUMsSUFBbkMsRUFBeUMsSUFBekMsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF5QyxJQUF6QyxFQUErQyxNQUEvQyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStDLE1BQS9DLEVBQXVELEdBQXZELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdUQsR0FBdkQsRUFBNEQsTUFBNUQsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE0RCxNQUE1RCxFQUFvRSxJQUFwRSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW9FLElBQXBFLEVBQTBFLE1BQTFFLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEUsTUFBMUUsRUFBa0YsV0FBbEYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFrRixXQUFsRixFQUErRixJQUEvRixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStGLElBQS9GLEVBQXFHLEdBQXJHLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcUcsR0FBckcsRUFBMEcsU0FBMUcsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEwRyxTQUExRyxFQUFxSCxJQUFySCxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXFIO0VBQ3JILE1BQUEsQ0FBQSxDQUFB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LEtBQUssQ0FBQyxXQUFXLE1BQUQsR0FBVSxRQUFBLENBQUEsS0FBQTtRQUM3QixJQUFHLENBQUksS0FBUDtVQUFrQixNQUFBOztRQUNsQixJQUFPLEtBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQVAsQ0FBWCxRQUFILElBQ0E7VUFDRSxPQUFPLEtBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQVA7aUJBQ2QsS0FBQyxDQUFBLE1BQUQ7O09BTEM7YUFNTDs7Y0FFRixRQUFPLFFBQUEsQ0FBQTs7TUFBSTtNQUNULEtBQUssS0FBSyxDQUFDLFdBQVcsTUFBRCxHQUFVLFFBQUEsQ0FBQSxLQUFBO1FBQzdCLElBQUcsQ0FBSSxLQUFQO1VBQWtCLE1BQUE7O1FBQ2xCLElBQUcsS0FBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBUCxDQUFQLFFBQUg7VUFBMkIsTUFBQTs7UUFDM0IsS0FBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBUCxDQUFXLENBQUEsQ0FBQSxDQUFFO1FBQ3BCLEtBQUMsQ0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQVAsQ0FBYSxDQUFBLENBQUEsQ0FBRTtRQUdwQixJQUFHLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFFLEtBQUMsQ0FBQSxLQUFNLENBQUEsRUFBQSxDQUFHLENBQUksS0FBQyxDQUFBLEtBQWhDO1VBQTJDLEtBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLEtBQUssQ0FBQzs7UUFDMUQsSUFBRyxLQUFLLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBRSxLQUFDLENBQUEsR0FBSSxDQUFBLEVBQUEsQ0FBRyxDQUFJLEtBQUMsQ0FBQSxHQUE1QjtVQUFxQyxLQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBRSxLQUFLLENBQUM7O2VBRWxELEtBQUMsQ0FBQSxNQUFEO09BVkc7YUFXTDs7O0lBdkNpRCIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcbiMgKiByZXF1aXJlXG5yZXF1aXJlISB7XG4gIGJsdWViaXJkOiBwXG4gIGxlc2hkYXNoOiB7IHcsIGZpbmQsIG9taXQsIGZpbHRlciwgcGljaywga2V5cywgdmFsdWVzLCBwb3AsIGFzc2lnbiwgZWFjaCwgcmVkdWNlLCBmbGF0dGVuRGVlcCwgcHVzaCwgbWFwLCBtYXBWYWx1ZXMsIG9taXQgfSAgXG4gIG1vbWVudFxuICAnbW9tZW50LXJhbmdlJ1xufVxuXG4jICogVHlwZSBjb2VyY2lvbiBmdW5jdGlvbnMgZm9yIGEgbW9yZSBjaGlsbGVkIG91dCBBUElcbmZvcm1hdCA9IGV4cG9ydHMuZm9ybWF0ID0gLT4gaXQuZm9ybWF0ICdZWVlZLU1NLUREJ1xuXG5wYXJzZSA9IGV4cG9ydHMucGFyc2UgPSBtYXBWYWx1ZXMgZG9cbiAgcGF0dGVybjogLT5cbiAgICB8IGl0P2lzRXZlbnQ/ID0+IFsgaXQucmFuZ2UhLCBwYXlsb2FkOiBpdC5wYXlsb2FkIF1cbiAgICB8IGl0P0BAIGlzIE9iamVjdCBhbmQgaXQucmFuZ2U/ID0+IFsgcGFyc2UucmFuZ2UoaXQucmFuZ2UpLCBvbWl0KGl0LCAncmFuZ2UnKSBdXG4gICAgfCBpdD9AQCBpcyBPYmplY3QgPT4gWyBmYWxzZSwgaXQgXVxuICAgIHwgb3RoZXJ3aXNlID0+IHRocm93IG5ldyBFcnJvciBcImludmFsaWQgdHlwZSBmb3IgcGF0ZXJuICN7aXQ/dG9TdHJpbmc/IX0gI3tpdD9AQH1cIlxuICAgIFxuICAjIChhbnkpIC0+IEV2ZW50IHwgRXJyb3JcbiAgZXZlbnQ6IC0+XG4gICAgaWYgaXQ/aXNFdmVudD8gdGhlbiByZXR1cm4gaXRcbiAgICBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgT2JqZWN0ID0+IG5ldyBFdmVudCBpdFxuICAgICAgfCBvdGhlcndpc2UgPT5cbiAgICAgICAgY29uc29sZS5sb2cgaXRcbiAgICAgICAgY29uc29sZS5sb2cgU3RyaW5nIGl0XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcImludmFsaWQgdHlwZSBmb3IgZXZlbnQgI3tpdD90b1N0cmluZz8hfSAje2l0P0BAfVwiXG5cbiAgIyAoYW55KSAtPiBNZW1FdmVudHMgfCBFcnJvclxuICBldmVudHM6IC0+XG4gICAgaWYgaXQ/aXNFdmVudHM/IHRoZW4gcmV0dXJuIGl0XG4gICAgICBcbiAgICBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgQXJyYXkgPT4gbmV3IE1lbUV2ZW50cyBpdFxuICAgICAgfCBvdGhlcndpc2UgPT4gbmV3IE1lbUV2ZW50cyBwYXJzZS5ldmVudCBpdFxuXG4gICMgKEFueSkgLT4gQXJyYXk8RXZlbnQ+IHwgRXJyb3JcbiAgZXZlbnRBcnJheTogLT5cbiAgICBmbGF0dGVuRGVlcCBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgQXJyYXkgPT4gbWFwIGl0LCBwYXJzZS5ldmVudEFycmF5XG4gICAgICB8IE1lbUV2ZW50cyA9PiBpdC50b0FycmF5KClcbiAgICAgIHwgb3RoZXJ3aXNlID0+IFsgcGFyc2UuZXZlbnQgaXQgXVxuICAgICAgICBcbiAgIyAoIEV2ZW50cyB8IEV2ZW50IHwgdm9pZCApIC0+IFJhbmdlXG4gIHJhbmdlOiAoc29tZXRoaW5nLCBkZWYpIC0+XG4gICAgc3dpdGNoIHNvbWV0aGluZz9AQFxuICAgICAgfCBmYWxzZSA9PiBkZWYgb3Igdm9pZFxuICAgICAgfCBPYmplY3QgPT4gbW9tZW50LnJhbmdlIHNvbWV0aGluZ1xuICAgICAgfCBBcnJheSA9PiBtb21lbnQucmFuZ2Ugc29tZXRoaW5nXG4gICAgICB8IEV2ZW50ID0+IHNvbWV0aGluZy5yYW5nZSFcbiAgICAgIHwgTWVtRXZlbnRzID0+IHNvbWV0aGluZy5yYW5nZSFcbiAgICAgIHwgb3RoZXJ3aXNlID0+IHNvbWV0aGluZy5yYW5nZT8hIG9yIHNvbWV0aGluZ1xuXG4gICAgXG4jICggRXZlbnRzIHwgQXJyYXk8RXZlbnQ+IHwgRXZlbnQgfCB2b2lkICkgLT4gQXJyYXk8RXZlbnQ+XG4gIGV2ZW50Q29sbGVjdGlvbjogKHNvbWV0aGluZykgLT5cbiAgICBzd2l0Y2ggc29tZXRoaW5nP0BAXG4gICAgICB8IHZvaWQgPT4gW11cbiAgICAgIHwgRXZlbnQgPT4gWyBFdmVudCBdXG4gICAgICB8IEV2ZW50cyA9PiBFdmVudHMudG9BcnJheSgpXG4gICAgICB8IEFycmF5ID0+IGZsYXR0ZW5EZWVwIHNvbWV0aGluZ1xuICAgICAgfCBvdGhlcndpc2UgPT4gdGhyb3cgJ3doYXQgaXMgdGhpcydcblxuICAoIGYsIG5hbWUgKSAtPiAtPiBmIGlmIGl0P0BAIGlzIEZ1bmN0aW9uIHRoZW4gaXQhIGVsc2UgaXRcbiAgICBcblxuTWF0Y2hlciA9IChyYW5nZSwgcGF0dGVybiwgZXZlbnQpIC0tPlxuICBcbiAgY2hlY2tSYW5nZSA9IChldmVudCkgLT5cbiAgICBpZiByYW5nZSB0aGVuIHJldHVybiByYW5nZS5jb250YWlucyBldmVudC5zdGFydC5jbG9uZSgpLmFkZCgxKSBvciByYW5nZS5jb250YWlucyBldmVudC5lbmQuY2xvbmUoKS5zdWJ0cmFjdCgxKSBvciBldmVudC5yYW5nZSEuY29udGFpbnMgcmFuZ2VcbiAgICBlbHNlIHJldHVybiB0cnVlXG5cbiAgY2hlY2tSYW5nZVN0cmljdCA9IChldmVudCkgLT4gcmFuZ2UuaXNFcXVhbCBldmVudC5yYW5nZSFcblxuICBjaGVja1BhdHRlcm4gPSAoZXZlbnQpIC0+XG4gICAgbm90IGZpbmQgcGF0dGVybiwgKHZhbHVlLCBrZXkpIC0+XG4gICAgICBzd2l0Y2ggdmFsdWVAQFxuICAgICAgXG4gICAgICAgIHwgQm9vbGVhbiA9PlxuICAgICAgICAgIGlmIHZhbHVlIGlzIHRydWUgdGhlbiByZXR1cm4gbm90IGV2ZW50W2tleV0/XG4gICAgICAgICAgZWxzZSByZXR1cm4gZXZlbnRba2V5XT9cbiAgICAgICAgICBcbiAgICAgICAgfCBGdW5jdGlvbiA9PiBub3QgdmFsdWUgZXZlbnRba2V5XVxuXG4gICAgICAgIHwgb3RoZXJ3aXNlID0+XG4gICAgICAgICAgaWYgbW9tZW50LmlzTW9tZW50IHZhbHVlIHRoZW4gbm90IHZhbHVlLmlzU2FtZSBldmVudFtrZXldXG4gICAgICAgICAgZWxzZSBpZiBldmVudFtrZXldIGlzIHZhbHVlIHRoZW4gcmV0dXJuIGZhbHNlIGVsc2UgcmV0dXJuIHRydWVcbiAgIFxuXG4gIGNoZWNrUmFuZ2UoZXZlbnQpIGFuZCBjaGVja1BhdHRlcm4oZXZlbnQpXG5cblxuIyAqIEV2ZW50TGlrZVxuIyBtb3JlIG9mIGEgc3BlYyB0aGVuIGFueXRoaW5nLCB0aGlzIGlzIGltcGxlbWVudGVkIGJ5IEV2ZW50ICYgRXZlbnRzXG5cbkV2ZW50TGlrZSA9IGV4cG9ydHMuRXZlbnRMaWtlID0gY2xhc3MgRXZlbnRMaWtlXG5cbiAgIyBmZXRjaGVzIGFsbCBldmVudHMgZnJvbSBhIGNvbGxlY3Rpb24gcmVsZXZhbnQgdG8gY3VycmVudCBldmVudCAoYnkgdHlwZSBhbmQgcmFuZ2UpXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgcmVsZXZhbnRFdmVudHM6IChldmVudHMpIC0+XG4gICAgcGFyc2UuZXZlbnRzIGV2ZW50c1xuICAgIC5maWx0ZXIgcmFuZ2U6IEByYW5nZSgpLCB0eXBlOiBAdHlwZVxuXG4gIG5laWdoYm91cnM6IChldmVudHMpIC0+XG4gICAgW1xuICAgICAgZXZlbnRzLmZpbHRlciBlbmQ6IEBzdGFydC5jbG9uZSgpXG4gICAgICBldmVudHMuZmlsdGVyIHN0YXJ0OiBAZW5kLmNsb25lKClcbiAgICBdXG5cbiAgIyBnZXQgb3Igc2V0IHJhbmdlXG4gICMgKHJhbmdlPykgLT4gbW9tZW50LnJhbmdlXG4gIHJhbmdlOiAoc2V0UmFuZ2UpIC0+XG4gICAgaWYgcmFuZ2UgPSBzZXRSYW5nZVxuICAgICAgQHN0YXJ0ID0gcmFuZ2Uuc3RhcnQuY2xvbmUoKVxuICAgICAgQGVuZCA9IHJhbmdlLmVuZC5jbG9uZSgpXG4gICAgZWxzZVxuICAgICAgcmFuZ2UgPSBuZXcgbW9tZW50LnJhbmdlIEBzdGFydCwgQGVuZFxuICAgICAgXG4gICAgcmFuZ2VcblxuICAjICggRXZlbnRMaWtlICkgLT4gRXZlbnRzXG4gIHB1c2g6IChldmVudCkgLT4gLi4uXG4gICAgXG4gICMgKCBFdmVudExpa2UgKSAtPiBFdmVudHNcbiAgc3VidHJhY3Q6IChzb21ldGhpbmcpIC0+XG4gICAgaWYgc29tZXRoaW5nIGluc3RhbmNlb2YgRXZlbnRzIHRoZW4gQHN1YnRyYWN0TWFueSBzb21ldGhpbmdcbiAgICBlbHNlIEBzdWJ0cmFjdE9uZSBzb21ldGhpbmdcbiAgICBcbiAgIyAoIEV2ZW50TGlrZSwgKEV2ZW50LCBFdmVudCkgLT4gRXZlbnRzKSAtPiBFdmVudHNcbiAgY29sbGlkZTogKGV2ZW50cywgY2IpIC0+IC4uLlxuXG4gIGVhY2g6IC0+IC4uLlxuXG4gIHN1YnRyYWN0TWFueTogLT4gLi4uXG5cbiAgc3VidHJhY3RPbmU6IC0+IC4uLlxuXG4jICogRXZlbnRcbiMgcmVwcmVzZW50cyBzb21lIGV2ZW50IGluIHRpbWUsIGRlZmluZWQgYnkgc3RhcnQgYW5kIGVuZCB0aW1lc3RhbXBzXG4jIGNhcmllcyBzb21lIHBheWxvYWQsIGxpa2UgYSBwcmljZSBvciBhIGJvb2tpbmdcblxucGFyc2VJbml0ID0gKGRhdGEpIC0+XG4gIGlmIG5vdCBkYXRhIHRoZW4gcmV0dXJuIHt9XG4gIGlmIGRhdGEuY2VudGVyIHRoZW4gcmV0dXJuIHsgc3RhcnQ6IGRhdGEuc3RhcnQsIGVuZDogZGF0YS5lbmQgfVxuICBpZiBkYXRhLnJhbmdlXG4gICAgZGF0YS5zdGFydCA9IGRhdGEucmFuZ2Uuc3RhcnRcbiAgICBkYXRhLmVuZCA9IGRhdGEucmFuZ2UuZW5kXG4gICAgZGVsZXRlIGRhdGEucmFuZ2VcblxuICBpZiBkYXRhLnN0YXJ0P0BAIGluIFsgU3RyaW5nLCBEYXRlIF0gdGhlbiBkYXRhLnN0YXJ0ID0gbW9tZW50IGRhdGEuc3RhcnRcbiAgaWYgZGF0YS5lbmQ/QEAgaW4gWyBTdHJpbmcsIERhdGUgXSB0aGVuIGRhdGEuZW5kID0gbW9tZW50IGRhdGEuZW5kXG4gICAgXG4gIGlmIGRhdGFAQCBpc250IE9iamVjdCB0aGVuIHJldHVybiBcInd1dCB3dXRcIlxuICBlbHNlIHJldHVybiBkYXRhXG5cbkV2ZW50ID0gZXhwb3J0cy5FdmVudCA9IGNsYXNzIEV2ZW50IGV4dGVuZHMgRXZlbnRMaWtlXG4gIGlzRXZlbnQ6IHRydWVcbiAgXG4gIChpbml0KSAtPiBhc3NpZ24gQCwgcGFyc2VJbml0IGluaXRcblxuICBjb21wYXJlOiAoZXZlbnQpIC0+XG4gICAgWyBAaXNTYW1lUmFuZ2UoZXZlbnQpLCBAaXNTYW1lUGF5bG9hZChldmVudCkgXVxuXG4gIGlzU2FtZTogKGV2ZW50KSAtPlxuICAgIEBpc1NhbWVSYW5nZShldmVudCkgYW5kIEBpc1NhbWVQYXlsb2FkKGV2ZW50KVxuXG4gIGlzU2FtZVJhbmdlOiAoZXZlbnQpIC0+XG4gICAgZXZlbnQgPSBwYXJzZS5ldmVudCBldmVudFxuICAgIEByYW5nZSEuaXNTYW1lIGV2ZW50LnJhbmdlIVxuICAgIFxuICBpc1NhbWVQYXlsb2FkOiAoZXZlbnQpIC0+XG4gICAgZXZlbnQgPSBwYXJzZS5ldmVudCBldmVudFxuICAgIChAdHlwZSBpcyBldmVudC50eXBlKSBhbmQgKEBwYXlsb2FkIGlzIGV2ZW50LnBheWxvYWQpXG4gIFxuICBjbG9uZTogKGRhdGE9e30pIC0+XG4gICAgcmV0ID0gbmV3IEV2ZW50IGFzc2lnbiB7fSwgQCwgeyBpZDogQGlkICsgJy1jbG9uZSd9LCBkYXRhXG4gICAgZGVsZXRlIHJldC5yZXByXG4gICAgcmV0XG5cbiAgIyAoKSAtPiBKc29uXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBwaWNrKEAsIDxbdHlwZSBwYXlsb2FkIGlkIHRhZ3NdPikgPDw8IG1hcFZhbHVlcyAocGljayBALCA8WyBzdGFydCBlbmQgXT4pLCAodmFsdWUpIC0+IHZhbHVlLmZvcm1hdCBcIllZWVktTU0tREQgSEg6bW06c3NcIlxuXG4gICMgKCkgLT4gU3RyaW5nXG4gIHRvU3RyaW5nOiAtPlxuICAgIHN0YXJ0ID0gZm9ybWF0IEBzdGFydFxuICAgIGVuZCA9IGZvcm1hdCBAZW5kXG4gICAgaWYgQHByaWNlIHRoZW4gXCJQcmljZShcIiArIEBwcmljZSArIFwiIFwiICsgc3RhcnQgKyBcIilcIlxuICAgIGVsc2UgXCJFdmVudChcIiArIChAaWQgb3IgXCJ1bnNhdmVkLVwiICsgQHR5cGUpICArIFwiKVwiXG4gICAgXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgc3VidHJhY3RNYW55OiAoZXZlbnRzKSAtPlxuICAgIEByZWxldmFudEV2ZW50cyBldmVudHNcbiAgICAucmVkdWNlIGRvXG4gICAgICAocmVzLCBldmVudCkgfj4gcmVzLnN1YnRyYWN0T25lIGV2ZW50XG4gICAgICBuZXcgTWVtRXZlbnRzIEBcbiAgICAgIFxuICAjICggRXZlbnQgKSAtPiBFdmVudHNcbiAgc3VidHJhY3RPbmU6IChldmVudCkgLT5cbiAgICBjbnQgPSAwXG4gICAgbmV3IE1lbUV2ZW50cyBtYXAgZG9cbiAgICAgIEByYW5nZSgpLnN1YnRyYWN0IGV2ZW50LnJhbmdlKClcbiAgICAgIH4+IEBjbG9uZSB7IHN0YXJ0OiBpdC5zdGFydCwgZW5kOiBpdC5lbmQsIGlkOiBAaWQgKyAnLScgKyBjbnQrKyB9ICMgZ2V0IHJpZCBvZiBwb3RlbnRpYWwgb2xkIHJlcHIsIHRoaXMgaXMgYSBuZXcgZXZlbnRcblxuICAjICggRXZlbnRzLCAoRXZlbnQsIEV2ZW50KSAtPiBFdmVudHMgKSAtPiBFdmVudHNcbiAgY29sbGlkZTogKGV2ZW50cywgY2IpIC0+XG4gICAgQHJlbGV2YW50RXZlbnRzIGV2ZW50c1xuICAgIC5yZWR1Y2UgKGV2ZW50cywgZXZlbnQpIH4+IGV2ZW50cy5wdXNobSBjYiBldmVudCwgQFxuXG4gIGVhY2g6IChjYikgLT4gY2IgQFxuICAgIFxuICBtZXJnZTogKGV2ZW50KSAtPlxuICAgIG5ld1NlbGYgPSBAY2xvbmUoKVxuICAgIGlmIGV2ZW50LnN0YXJ0IDwgbmV3U2VsZi5zdGFydCB0aGVuIG5ld1NlbGYuc3RhcnQgPSBldmVudC5zdGFydFxuICAgIGlmIGV2ZW50LmVuZCA+IG5ld1NlbGYuZW5kIHRoZW4gbmV3U2VsZi5lbmQgPSBldmVudC5lbmRcbiAgICBuZXdTZWxmXG4gICAgXG5cblBlcnNpc3RMYXllciA9IGV4cG9ydHMuUGVyc2lzdExheWVyID0gY2xhc3NcbiAgbWFya1JlbW92ZTogLT4gQHRvUmVtb3ZlID0gdHJ1ZVxuICBcbiAgc2F2ZTogLT4gbmV3IHAgKHJlc29sdmUscmVqZWN0KSB+PlxuICAgIGlmIEB0b1JlbW92ZSB0aGVuIHJlc29sdmUgQHJlbW92ZSFcbiAgICBlbHNlIC4uLlxuICAgICAgXG4gIHJlbW92ZTogLT4gbmV3IHAgKHJlc29sdmUscmVqZWN0KSB+PiAuLi5cblxuIyAqIEV2ZW50c1xuIyBhYnN0cmFjdCBldmVudCBjb2xsZWN0aW9uXG4jIHN1cHBvcnRpbmcgY29tbW9uIHNldCBvcGVyYXRpb25zLFxuIyBhbmQgc29tZSB1bmNvbW1vbiBvcGVyYXRpb25zIHJlbGF0ZWQgdG8gdGltZSAoY29sbGlkZSwgc3VidHJhY3QpXG4gXG5FdmVudHMgPSBleHBvcnRzLkV2ZW50cyA9IGNsYXNzIEV2ZW50cyBleHRlbmRzIEV2ZW50TGlrZVxuICAoLi4uZXZlbnRzKSAtPiBAcHVzaG0uYXBwbHkgQCwgZXZlbnRzXG5cbiAgIyBwZXIgZGF5IGRhdGEgKGFpcmJuYiBhcGkgaGVscGVyKVxuICBkYXlzOiAoY2IpIC0+IEBlYWNoIChldmVudCkgLT4gZXZlbnQucmFuZ2UhYnkgJ2RheXMnLCB+PiBjYiBpdCwgZXZlbnRcblxuICBpc0V2ZW50czogdHJ1ZVxuXG4gICMgKCBNb21lbnRSYW5nZSwgT2JqZWN0ICkgLT4gRXZlbnRzXG4gIGZpbmQ6IChyYW5nZSwgcGF0dGVybikgLT4gLi4uXG4gICAgXG4gICMgKCByYW5nZUVxdWl2YWxlbnQgKSAtPiBFdmVudHNcbiMgIGNsb25lOiAocmFuZ2VFcXVpdmFsZW50KSB+PiAuLi5cblxuICAjICggRXZlbnRDb2xsZWN0aW9uKSAtPiBFdmVudHNcbiAgcHVzaG06IChldmVudENvbGxlY3Rpb24pIC0+IC4uLlxuXG4gICMgKCBFdmVudENvbGxlY3Rpb24pIC0+IEV2ZW50c1xuICBwdXNoOiAoZXZlbnRDb2xsZWN0aW9uKSAtPiBAY2xvbmUgZXZlbnRDb2xsZWN0aW9uXG5cbiAgIyAoKSAtPiBFdmVudHNcbiAgd2l0aG91dDogLT4gIC4uLlxuXG4gICMgKCBGdW5jdGlvbiApIC0+IHZvaWRcbiAgZWFjaDogKGNiKSAtPiAuLi5cblxuICAjICgpIC0+IFN0cmluZ1xuICB0b1N0cmluZzogLT4gXCJFWyN7QGxlbmd0aH1dIDwgXCIgKyAoQG1hcCAoZXZlbnQpIC0+IFwiXCIgKyBldmVudCkuam9pbihcIiwgXCIpICsgXCIgPlwiXG5cbiAgIyAoKSAtPiBKc29uXG4gIHNlcmlhbGl6ZTogLT4gQG1hcCAoLnNlcmlhbGl6ZSEpXG5cbiAgIyAoKSAtPiBBcnJheTxFdmVudD5cbiAgdG9BcnJheTogLT5cbiAgICByZXQgPSBbXVxuICAgIEBlYWNoIC0+IHJldC5wdXNoIGl0XG4gICAgcmV0XG5cbiAgIyAoIChFdmVudCkgLT4gYW55KSApIC0+IEFycmF5PGFueT5cbiAgbWFwOiAoY2IpIC0+XG4gICAgcmV0ID0gW11cbiAgICBAZWFjaCAoZXZlbnQpIC0+IHJldC5wdXNoIGNiIGV2ZW50XG4gICAgcmV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgIyAoIChFdmVudHMsIEV2ZW50KSAtPiBFdmVudHMgKSAtPiBBcnJheTxhbnk+XG4gIHJhd1JlZHVjZTogKGNiLCBtZW1vKSAtPlxuICAgIEBlYWNoIChldmVudCkgLT4gbWVtbyA6PSBjYiBtZW1vLCBldmVudFxuICAgIG1lbW9cbiAgICBcbiAgIyAoIChFdmVudHMsIEV2ZW50KSAtPiBFdmVudHMgKSAtPiBFdmVudHNcbiAgcmVkdWNlOiAoY2IsIG1lbW8pIC0+XG4gICAgaWYgbm90IG1lbW8gdGhlbiBtZW1vID0gbmV3IE1lbUV2ZW50cygpXG4gICAgQHJhd1JlZHVjZSBjYiwgbWVtb1xuXG4gICMgKCBFdmVudCApIC0+IEJvb2xlYW5cbiAgaGFzOiAodGFyZ2V0RXZlbnQpIC0+XG4gICAgcmFuZ2UgPSB0YXJnZXRFdmVudC5yYW5nZSFcbiAgICBAX2ZpbmQgKGV2ZW50KSAtPiBldmVudC5wYXlsb2FkIGlzIHRhcmdldEV2ZW50LnBheWxvYWQgYW5kIGV2ZW50LnJhbmdlIWlzU2FtZSByYW5nZVxuICAgICAgICAgICAgXG4gICMgKCBFdmVudCB8IHsgcmFuZ2U6IFJhbmdlLCAuLi4gfSApIC0+IEV2ZW50c1xuICBmaW5kOiAtPlxuICAgIG1hdGNoZXIgPSBNYXRjaGVyLmFwcGx5IEAsIHBhcnNlLnBhdHRlcm4gaXRcbiAgICBAX2ZpbmQgbWF0Y2hlclxuICAgIFxuICAjICggeyByYW5nZTogUmFuZ2UsIC4uLiB9ICkgLT4gRXZlbnRzXG4gIGZpbHRlcjogKCBwYXR0ZXJuICktPlxuICAgIFxuICAgIG1hdGNoZXIgPSBNYXRjaGVyLmFwcGx5IEAsIHBhcnNlLnBhdHRlcm4gcGF0dGVyblxuICAgIEByZWR1Y2UgKHJldCwgZXZlbnQpIC0+IGlmIG1hdGNoZXIgZXZlbnQgdGhlbiByZXQucHVzaG0gZXZlbnQgZWxzZSByZXRcbiAgICBcbiAgZGlmZjogKGV2ZW50cykgLT5cbiAgICBtYWtlRGlmZiA9IChkaWZmLCBldmVudCkgfj5cbiAgICAgIGNvbGxpc2lvbnMgPSBldmVudC5yZWxldmFudEV2ZW50cyBkaWZmXG4gICAgICBpZiBub3QgY29sbGlzaW9ucy5sZW5ndGggdGhlbiByZXR1cm4gZGlmZlxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gZGlmZi5wb3BtKGNvbGxpc2lvbnMpLnB1c2htIGNvbGxpc2lvbnMucmVkdWNlIChyZXMsIGNvbGxpc2lvbikgLT5cbiAgICAgICAgICBbIHJhbmdlLCBwYXlsb2FkIF0gPSBldmVudC5jb21wYXJlIGNvbGxpc2lvblxuICAgICAgICAgIFxuICAgICAgICAgIGlmIG5vdCByYW5nZSBhbmQgbm90IHBheWxvYWQgdGhlbiByZXR1cm4gcmVzLnB1c2htIGNvbGxpc2lvblxuICAgICAgICAgIGlmIHBheWxvYWQgdGhlbiByZXR1cm4gcmVzLnB1c2htIGNvbGxpc2lvbi5zdWJ0cmFjdCBldmVudFxuICAgICAgICAgIGlmIHJhbmdlIHRoZW4gcmV0dXJuIHJlcy5wdXNobSBjb2xsaXNpb25cbiAgICAgICAgICByZXR1cm4gcmVzXG5cbiAgICBldmVudHMgPSBwYXJzZS5ldmVudHMgZXZlbnRzXG4gICAgQHJlZHVjZSBtYWtlRGlmZiwgZXZlbnRzLmNsb25lKClcblxuICAjIGNvbXBsYXRlbHkgdHJhbnNmb3JtcyB0aGUgZ3JvdXAgb2YgZXZlbnRzLCByZXR1cm5pbmcgcmFuZ2VzIGFkZGVkIGFuZCByZW1vdmVkLCBhbmQgZGIgZXZlbnRzIHRvIGRlbGV0ZSBhbmQgY3JlYXRlIHRvIGFwcGx5IHRoZSBjaGFuZ2VcbiAgIyAoIEV2ZW50cyApIC0+IHsgYnVzeTogRXZlbnRzLCBmcmVlOiBFdmVudHMsIGNyZWF0ZTogRXZlbnRzLCByZW1vdmU6IEV2ZW50cyB9XG4gIGNoYW5nZTogKG5ld0V2ZW50cykgLT5cbiAgICBuZXdFdmVudHMgPSBwYXJzZS5ldmVudHMgbmV3RXZlbnRzXG4gICAgYnVzeSA9IG5ld0V2ZW50cy5zdWJ0cmFjdCBAXG4gICAgZnJlZSA9IEBzdWJ0cmFjdCBuZXdFdmVudHNcblxuICAgIGNyZWF0ZSA9IG5ld0V2ZW50cy5yZWR1Y2UgKGNyZWF0ZSwgZXZlbnQpIH4+IGlmIG5vdCBAaGFzIGV2ZW50IHRoZW4gY3JlYXRlLnB1c2htIGV2ZW50IGVsc2UgY3JlYXRlXG4gICAgcmVtb3ZlID0gQHJlZHVjZSAocmVtb3ZlLCBldmVudCkgLT4gaWYgbm90IG5ld0V2ZW50cy5oYXMgZXZlbnQgdGhlbiByZW1vdmUucHVzaG0gZXZlbnQgZWxzZSByZW1vdmVcbiAgICAgICAgXG4gICAgYnVzeTogYnVzeSwgZnJlZTogZnJlZSwgY3JlYXRlOiBjcmVhdGUsIHJlbW92ZTogcmVtb3ZlXG5cbiAgIyB1cGF0ZXMgZXZlbnRzXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgdXBkYXRlOiAoZXZlbnRzKSAtPlxuICAgIEByZWR1Y2UgZG9cbiAgICAgIChbIGNyZWF0ZSwgcmVtb3ZlIF0sIGV2ZW50KSB+PlxuXG4gICAgICAgIGlmIChyZWxldmFudEV2ZW50cyA9IGV2ZW50LnJlbGV2YW50RXZlbnRzKGV2ZW50cykpLmxlbmd0aFxuICAgICAgICAgIHJlbW92ZS5wdXNobSBldmVudFxuICAgICAgICAgIGNyZWF0ZS5wdXNobSBldmVudC5zdWJ0cmFjdCByZWxldmFudEV2ZW50c1xuXG4gICAgICAgIFsgY3JlYXRlLCByZW1vdmUgXVxuXG4gICAgICBbIGV2ZW50cy5jbG9uZSgpLCBuZXcgTWVtRXZlbnRzKCkgXVxuICAgICAgICAgICAgXG4gIG1lcmdlOiAtPlxuICAgIEByZWR1Y2UgKHJlcywgZXZlbnQpIH4+XG4gICAgICBldmVudFxuICAgICAgLm5laWdoYm91cnMoQClcbiAgICAgIC5tYXAgKG9sZEV2ZW50KSAtPiBcbiAgICAgICAgaWYgb2xkRXZlbnQubGVuZ3RoIGFuZCBvbGRFdmVudC5wYXlsb2FkIGlzIG9sZEV2ZW50LnBheWxvYWQgdGhlbiBvbGRFdmVudC5tZXJnZSBldmVudFxuICAgIFxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHVuaW9uOiAoZXZlbnRzKSAtPlxuICAgIHJlcyA9IEBjbG9uZSgpXG4gICAgZXZlbnRzLmVhY2ggfj4gcmVzLnB1c2htIGl0XG4gICAgcmVzXG5cbiAgIyAoIChFdmVudHMsIChFdmVudDEsIEV2ZW50MikgLT4gRXZlbnRzICkgLT4gRXZlbnRzXG4gIGNvbGxpZGU6IChldmVudHMsIGNiKSAtPlxuICAgIEByZWR1Y2UgKG1lbW8sIGV2ZW50KSAtPiBtZW1vLnB1c2htIGV2ZW50LmNvbGxpZGUgZXZlbnRzLCBjYlxuXG4gICMgKCBFdmVudCApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE9uZTogKGV2ZW50KSAtPlxuICAgIEByZWR1Y2UgKHJldCwgY2hpbGQpIC0+IHJldC5wdXNobSBjaGlsZC5zdWJ0cmFjdCBldmVudFxuXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgc3VidHJhY3RNYW55OiAoZXZlbnRzKSAtPlxuICAgIEByZWR1Y2UgKHJldCwgY2hpbGQpIC0+IHJldC5wdXNobSBjaGlsZC5zdWJ0cmFjdE1hbnkgZXZlbnRzXG5cbiAgXG4jICogTWVtRXZlbnRzXG4jIEluIG1lbW9yeSBFdmVudCBjb2xsZWN0aW9uIGltcGxlbWVudGF0aW9uLFxuIyB0aGlzIGlzIGEgdmVyeSBuYWl2ZSBpbXBsZW1lbnRhdGlvblxuIyBcbiMgSSBndWVzcyB3ZSBzaG91bGQgdXNlIHJhbmdlIHRyZWUgZGF0YSBzdHJ1Y3R1cmUgb3Igc29tZXRoaW5nIHNtYXJ0IGxpa2UgdGhhdCBmb3IgZmFzdCByYW5nZSBzZWFyY2ggaW4gdGhlIGZ1dHVyZS5cbiMgaXRzIGdvb2QgZW5vdWdoIGZvciBub3cgZXZlbiBpZiB3ZSBlbmQgdXAgcXVhZHJhdGljIGNvbXBsZXhpdHkgZm9yIGFsZ29zLCB3ZSBhcmUgbm90IHBhcnNpbmcgbWFueSBldmVudHMgcGVyIHByb3BlcnR5LlxuIyBcbk1lbUV2ZW50cyA9IGV4cG9ydHMuTWVtRXZlbnRzID0gY2xhc3MgTWVtRXZlbnRzTmFpdmUgZXh0ZW5kcyBFdmVudHNcbiAgLT5cbiAgICBhc3NpZ24gQCwgZG9cbiAgICAgIGV2ZW50czogIHt9XG4gICAgICBsZW5ndGg6IDBcbiAgICAgIHR5cGU6IHt9XG4gICAgc3VwZXIgLi4uXG4gIFxuICB3aXRob3V0OiAoZXZlbnQpIC0+IG5ldyBNZW1FdmVudHMgZmlsdGVyICh2YWx1ZXMgQGV2ZW50cyksIC0+IGl0LmlkIGlzbnQgZXZlbnQuaWRcbiAgICBcbiAgdG9BcnJheTogLT4gdmFsdWVzIEBldmVudHNcblxuICBlYWNoOiAoY2IpIC0+IGVhY2ggQGV2ZW50cywgY2JcbiAgXG4gIF9maW5kOiAoY2IpIC0+IGZpbmQgQGV2ZW50cywgY2JcblxuICBjbG9uZTogKHJhbmdlKSAtPiBuZXcgTWVtRXZlbnRzIHZhbHVlcyBAZXZlbnRzXG5cbiAgcG9wbTogKC4uLmV2ZW50cykgLT4gXG4gICAgZWFjaCBwYXJzZS5ldmVudEFycmF5KGV2ZW50cyksIChldmVudCkgfj5cbiAgICAgIGlmIG5vdCBldmVudCB0aGVuIHJldHVyblxuICAgICAgaWYgbm90IEBldmVudHNbZXZlbnQuaWRdPyB0aGVuIHJldHVyblxuICAgICAgZWxzZVxuICAgICAgICBkZWxldGUgQGV2ZW50c1tldmVudC5pZF1cbiAgICAgICAgQGxlbmd0aC0tXG4gICAgQFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1c2htOiAoLi4uZXZlbnRzKSAtPlxuICAgIGVhY2ggcGFyc2UuZXZlbnRBcnJheShldmVudHMpLCAoZXZlbnQpIH4+XG4gICAgICBpZiBub3QgZXZlbnQgdGhlbiByZXR1cm5cbiAgICAgIGlmIEBldmVudHNbZXZlbnQuaWRdPyB0aGVuIHJldHVyblxuICAgICAgQGV2ZW50c1tldmVudC5pZF0gPSBldmVudFxuICAgICAgQHR5cGVbZXZlbnQudHlwZV0gPSB0cnVlXG5cblxuICAgICAgaWYgZXZlbnQuc3RhcnQgPCBAc3RhcnQgb3Igbm90IEBzdGFydCB0aGVuIEBzdGFydCA9IGV2ZW50LnN0YXJ0XG4gICAgICBpZiBldmVudC5lbmQgPCBAZW5kIG9yIG5vdCBAZW5kIHRoZW4gQGVuZCA9IGV2ZW50LmVuZFxuICAgICAgXG4gICAgICBAbGVuZ3RoKytcbiAgICBAXG4gIFxuIl19

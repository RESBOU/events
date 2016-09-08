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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9jb3JlL25vZGVfbW9kdWxlcy90aW1lRXZlbnRzL2luZGV4LmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBR1ksQ0FBVixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQTtFQUNBLElBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQVksQ0FBWixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVksQ0FBWixFQUFlLElBQWYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFlLElBQWYsRUFBcUIsSUFBckIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFxQixJQUFyQixFQUEyQixNQUEzQixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTJCLE1BQTNCLEVBQW1DLElBQW5DLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbUMsSUFBbkMsRUFBeUMsSUFBekMsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF5QyxJQUF6QyxFQUErQyxNQUEvQyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStDLE1BQS9DLEVBQXVELEdBQXZELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdUQsR0FBdkQsRUFBNEQsTUFBNUQsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE0RCxNQUE1RCxFQUFvRSxJQUFwRSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW9FLElBQXBFLEVBQTBFLE1BQTFFLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEUsTUFBMUUsRUFBa0YsV0FBbEYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFrRixXQUFsRixFQUErRixJQUEvRixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStGLElBQS9GLEVBQXFHLEdBQXJHLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcUcsR0FBckcsRUFBMEcsU0FBMUcsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEwRyxTQUExRyxFQUFxSCxJQUFySCxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXFIO0VBQ3JILE1BQUEsQ0FBQSxDQUFB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QSxLQUFNLENBQUEsRUFBQSxDQUFHLENBQUksS0FBQyxDQUFBLEtBQWhDO1VBQTJDLEtBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLEtBQUssQ0FBQzs7UUFDMUQsSUFBRyxLQUFLLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBRSxLQUFDLENBQUEsR0FBSSxDQUFBLEVBQUEsQ0FBRyxDQUFJLEtBQUMsQ0FBQSxHQUE1QjtVQUFxQyxLQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBRSxLQUFLLENBQUM7O2VBRWxELEtBQUMsQ0FBQSxNQUFEO09BVkc7YUFXTDs7O0lBdkNpRCIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcbiMgKiByZXF1aXJlXG5yZXF1aXJlISB7XG4gIGJsdWViaXJkOiBwXG4gIGxlc2hkYXNoOiB7IHcsIGZpbmQsIG9taXQsIGZpbHRlciwgcGljaywga2V5cywgdmFsdWVzLCBwb3AsIGFzc2lnbiwgZWFjaCwgcmVkdWNlLCBmbGF0dGVuRGVlcCwgcHVzaCwgbWFwLCBtYXBWYWx1ZXMsIG9taXQgfSAgXG4gIG1vbWVudFxuICAnbW9tZW50LXJhbmdlJ1xufVxuXG4jICogVHlwZSBjb2VyY2lvbiBmdW5jdGlvbnMgZm9yIGEgbW9yZSBjaGlsbGVkIG91dCBBUElcbmZvcm1hdCA9IGV4cG9ydHMuZm9ybWF0ID0gLT4gaXQuZm9ybWF0ICdZWVlZLU1NLUREJ1xuXG5wYXJzZSA9IGV4cG9ydHMucGFyc2UgPSBtYXBWYWx1ZXMgZG9cbiAgcGF0dGVybjogLT5cbiAgICB8IGl0P2lzRXZlbnQ/ID0+IFsgaXQucmFuZ2UhLCBwYXlsb2FkOiBpdC5wYXlsb2FkIF1cbiAgICB8IGl0P0BAIGlzIE9iamVjdCBhbmQgaXQucmFuZ2U/ID0+IFsgcGFyc2UucmFuZ2UoaXQucmFuZ2UpLCBvbWl0KGl0LCAncmFuZ2UnKSBdXG4gICAgfCBpdD9AQCBpcyBPYmplY3QgPT4gWyBmYWxzZSwgaXQgXVxuICAgIHwgb3RoZXJ3aXNlID0+IHRocm93IG5ldyBFcnJvciBcImludmFsaWQgdHlwZSBmb3IgcGF0ZXJuICN7aXQ/dG9TdHJpbmc/IX0gI3tpdD9AQH1cIlxuICAgIFxuICAjIChhbnkpIC0+IEV2ZW50IHwgRXJyb3JcbiAgZXZlbnQ6IC0+XG4gICAgaWYgaXQ/aXNFdmVudD8gdGhlbiByZXR1cm4gaXRcbiAgICBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgT2JqZWN0ID0+IG5ldyBFdmVudCBpdFxuICAgICAgfCBvdGhlcndpc2UgPT5cbiAgICAgICAgY29uc29sZS5sb2cgaXRcbiAgICAgICAgY29uc29sZS5sb2cgU3RyaW5nIGl0XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcImludmFsaWQgdHlwZSBmb3IgZXZlbnQgI3tpdD90b1N0cmluZz8hfSAje2l0P0BAfVwiXG5cbiAgIyAoYW55KSAtPiBNZW1FdmVudHMgfCBFcnJvclxuICBldmVudHM6IC0+XG4gICAgaWYgaXQ/aXNFdmVudHM/IHRoZW4gcmV0dXJuIGl0XG4gICAgICBcbiAgICBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgQXJyYXkgPT4gbmV3IE1lbUV2ZW50cyBpdFxuICAgICAgfCBvdGhlcndpc2UgPT4gbmV3IE1lbUV2ZW50cyBwYXJzZS5ldmVudCBpdFxuXG4gICMgKEFueSkgLT4gQXJyYXk8RXZlbnQ+IHwgRXJyb3JcbiAgZXZlbnRBcnJheTogLT5cbiAgICBmbGF0dGVuRGVlcCBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgQXJyYXkgPT4gbWFwIGl0LCBwYXJzZS5ldmVudEFycmF5XG4gICAgICB8IE1lbUV2ZW50cyA9PiBpdC50b0FycmF5KClcbiAgICAgIHwgb3RoZXJ3aXNlID0+IFsgcGFyc2UuZXZlbnQgaXQgXVxuICAgICAgICBcbiAgIyAoIEV2ZW50cyB8IEV2ZW50IHwgdm9pZCApIC0+IFJhbmdlXG4gIHJhbmdlOiAoc29tZXRoaW5nLCBkZWYpIC0+XG4gICAgc3dpdGNoIHNvbWV0aGluZz9AQFxuICAgICAgfCBmYWxzZSA9PiBkZWYgb3Igdm9pZFxuICAgICAgfCBPYmplY3QgPT4gbW9tZW50LnJhbmdlIHNvbWV0aGluZ1xuICAgICAgfCBBcnJheSA9PiBtb21lbnQucmFuZ2Ugc29tZXRoaW5nXG4gICAgICB8IEV2ZW50ID0+IHNvbWV0aGluZy5yYW5nZSFcbiAgICAgIHwgTWVtRXZlbnRzID0+IHNvbWV0aGluZy5yYW5nZSFcbiAgICAgIHwgb3RoZXJ3aXNlID0+IHNvbWV0aGluZy5yYW5nZT8hIG9yIHNvbWV0aGluZ1xuXG4gICAgXG4jICggRXZlbnRzIHwgQXJyYXk8RXZlbnQ+IHwgRXZlbnQgfCB2b2lkICkgLT4gQXJyYXk8RXZlbnQ+XG4gIGV2ZW50Q29sbGVjdGlvbjogKHNvbWV0aGluZykgLT5cbiAgICBzd2l0Y2ggc29tZXRoaW5nP0BAXG4gICAgICB8IHZvaWQgPT4gW11cbiAgICAgIHwgRXZlbnQgPT4gWyBFdmVudCBdXG4gICAgICB8IEV2ZW50cyA9PiBFdmVudHMudG9BcnJheSgpXG4gICAgICB8IEFycmF5ID0+IGZsYXR0ZW5EZWVwIHNvbWV0aGluZ1xuICAgICAgfCBvdGhlcndpc2UgPT4gdGhyb3cgJ3doYXQgaXMgdGhpcydcblxuICAoIGYsIG5hbWUgKSAtPiAtPiBmIGlmIGl0P0BAIGlzIEZ1bmN0aW9uIHRoZW4gaXQhIGVsc2UgaXRcbiAgICBcblxuTWF0Y2hlciA9IChyYW5nZSwgcGF0dGVybiwgZXZlbnQpIC0tPlxuICBcbiAgY2hlY2tSYW5nZSA9IChldmVudCkgLT5cbiAgICBpZiByYW5nZSB0aGVuIHJldHVybiByYW5nZS5jb250YWlucyBldmVudC5zdGFydC5jbG9uZSgpLmFkZCgxKSBvciByYW5nZS5jb250YWlucyBldmVudC5lbmQuY2xvbmUoKS5zdWJ0cmFjdCgxKSBvciBldmVudC5yYW5nZSEuY29udGFpbnMgcmFuZ2VcbiAgICBlbHNlIHJldHVybiB0cnVlXG5cbiAgY2hlY2tSYW5nZVN0cmljdCA9IChldmVudCkgLT4gcmFuZ2UuaXNFcXVhbCBldmVudC5yYW5nZSFcblxuICBjaGVja1BhdHRlcm4gPSAoZXZlbnQpIC0+XG4gICAgbm90IGZpbmQgcGF0dGVybiwgKHZhbHVlLCBrZXkpIC0+XG4gICAgICBpZiB2YWx1ZSBpcyB0cnVlIHRoZW4gcmV0dXJuIG5vdCBldmVudFtrZXldP1xuICAgICAgZWxzZVxuICAgICAgICBpZiBub3QgbW9tZW50LmlzTW9tZW50IHZhbHVlXG4gICAgICAgICAgaWYgZXZlbnRba2V5XSBpcyB2YWx1ZSB0aGVuIHJldHVybiBmYWxzZSBlbHNlIHJldHVybiB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gbm90IHZhbHVlLmlzU2FtZSBldmVudFtrZXldXG5cbiAgY2hlY2tSYW5nZShldmVudCkgYW5kIGNoZWNrUGF0dGVybihldmVudClcblxuXG5cbiMgKiBFdmVudExpa2VcbiMgbW9yZSBvZiBhIHNwZWMgdGhlbiBhbnl0aGluZywgdGhpcyBpcyBpbXBsZW1lbnRlZCBieSBFdmVudCAmIEV2ZW50c1xuXG5FdmVudExpa2UgPSBleHBvcnRzLkV2ZW50TGlrZSA9IGNsYXNzIEV2ZW50TGlrZVxuXG4gICMgZmV0Y2hlcyBhbGwgZXZlbnRzIGZyb20gYSBjb2xsZWN0aW9uIHJlbGV2YW50IHRvIGN1cnJlbnQgZXZlbnQgKGJ5IHR5cGUgYW5kIHJhbmdlKVxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHJlbGV2YW50RXZlbnRzOiAoZXZlbnRzKSAtPlxuICAgIHBhcnNlLmV2ZW50cyBldmVudHNcbiAgICAuZmlsdGVyIHJhbmdlOiBAcmFuZ2UoKSwgdHlwZTogQHR5cGVcblxuICBuZWlnaGJvdXJzOiAoZXZlbnRzKSAtPlxuICAgIFtcbiAgICAgIGV2ZW50cy5maWx0ZXIgZW5kOiBAc3RhcnQuY2xvbmUoKVxuICAgICAgZXZlbnRzLmZpbHRlciBzdGFydDogQGVuZC5jbG9uZSgpXG4gICAgXVxuXG4gICMgZ2V0IG9yIHNldCByYW5nZVxuICAjIChyYW5nZT8pIC0+IG1vbWVudC5yYW5nZVxuICByYW5nZTogKHNldFJhbmdlKSAtPlxuICAgIGlmIHJhbmdlID0gc2V0UmFuZ2VcbiAgICAgIEBzdGFydCA9IHJhbmdlLnN0YXJ0LmNsb25lKClcbiAgICAgIEBlbmQgPSByYW5nZS5lbmQuY2xvbmUoKVxuICAgIGVsc2VcbiAgICAgIHJhbmdlID0gbmV3IG1vbWVudC5yYW5nZSBAc3RhcnQsIEBlbmRcbiAgICAgIFxuICAgIHJhbmdlXG5cbiAgIyAoIEV2ZW50TGlrZSApIC0+IEV2ZW50c1xuICBwdXNoOiAoZXZlbnQpIC0+IC4uLlxuICAgIFxuICAjICggRXZlbnRMaWtlICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0OiAoc29tZXRoaW5nKSAtPlxuICAgIGlmIHNvbWV0aGluZyBpbnN0YW5jZW9mIEV2ZW50cyB0aGVuIEBzdWJ0cmFjdE1hbnkgc29tZXRoaW5nXG4gICAgZWxzZSBAc3VidHJhY3RPbmUgc29tZXRoaW5nXG4gICAgXG4gICMgKCBFdmVudExpa2UsIChFdmVudCwgRXZlbnQpIC0+IEV2ZW50cykgLT4gRXZlbnRzXG4gIGNvbGxpZGU6IChldmVudHMsIGNiKSAtPiAuLi5cblxuICBlYWNoOiAtPiAuLi5cblxuICBzdWJ0cmFjdE1hbnk6IC0+IC4uLlxuXG4gIHN1YnRyYWN0T25lOiAtPiAuLi5cblxuIyAqIEV2ZW50XG4jIHJlcHJlc2VudHMgc29tZSBldmVudCBpbiB0aW1lLCBkZWZpbmVkIGJ5IHN0YXJ0IGFuZCBlbmQgdGltZXN0YW1wc1xuIyBjYXJpZXMgc29tZSBwYXlsb2FkLCBsaWtlIGEgcHJpY2Ugb3IgYSBib29raW5nXG5cbnBhcnNlSW5pdCA9IChkYXRhKSAtPlxuICBpZiBub3QgZGF0YSB0aGVuIHJldHVybiB7fVxuICBpZiBkYXRhLmNlbnRlciB0aGVuIHJldHVybiB7IHN0YXJ0OiBkYXRhLnN0YXJ0LCBlbmQ6IGRhdGEuZW5kIH1cbiAgaWYgZGF0YS5yYW5nZVxuICAgIGRhdGEuc3RhcnQgPSBkYXRhLnJhbmdlLnN0YXJ0XG4gICAgZGF0YS5lbmQgPSBkYXRhLnJhbmdlLmVuZFxuICAgIGRlbGV0ZSBkYXRhLnJhbmdlXG5cbiAgaWYgZGF0YS5zdGFydD9AQCBpbiBbIFN0cmluZywgRGF0ZSBdIHRoZW4gZGF0YS5zdGFydCA9IG1vbWVudCBkYXRhLnN0YXJ0XG4gIGlmIGRhdGEuZW5kP0BAIGluIFsgU3RyaW5nLCBEYXRlIF0gdGhlbiBkYXRhLmVuZCA9IG1vbWVudCBkYXRhLmVuZFxuICAgIFxuICBpZiBkYXRhQEAgaXNudCBPYmplY3QgdGhlbiByZXR1cm4gXCJ3dXQgd3V0XCJcbiAgZWxzZSByZXR1cm4gZGF0YVxuXG5FdmVudCA9IGV4cG9ydHMuRXZlbnQgPSBjbGFzcyBFdmVudCBleHRlbmRzIEV2ZW50TGlrZVxuICBpc0V2ZW50OiB0cnVlXG4gIFxuICAoaW5pdCkgLT4gYXNzaWduIEAsIHBhcnNlSW5pdCBpbml0XG5cbiAgY29tcGFyZTogKGV2ZW50KSAtPlxuICAgIFsgQGlzU2FtZVJhbmdlKGV2ZW50KSwgQGlzU2FtZVBheWxvYWQoZXZlbnQpIF1cblxuICBpc1NhbWU6IChldmVudCkgLT5cbiAgICBAaXNTYW1lUmFuZ2UoZXZlbnQpIGFuZCBAaXNTYW1lUGF5bG9hZChldmVudClcblxuICBpc1NhbWVSYW5nZTogKGV2ZW50KSAtPlxuICAgIGV2ZW50ID0gcGFyc2UuZXZlbnQgZXZlbnRcbiAgICBAcmFuZ2UhLmlzU2FtZSBldmVudC5yYW5nZSFcbiAgICBcbiAgaXNTYW1lUGF5bG9hZDogKGV2ZW50KSAtPlxuICAgIGV2ZW50ID0gcGFyc2UuZXZlbnQgZXZlbnRcbiAgICAoQHR5cGUgaXMgZXZlbnQudHlwZSkgYW5kIChAcGF5bG9hZCBpcyBldmVudC5wYXlsb2FkKVxuICBcbiAgY2xvbmU6IChkYXRhPXt9KSAtPlxuICAgIHJldCA9IG5ldyBFdmVudCBhc3NpZ24ge30sIEAsIHsgaWQ6IEBpZCArICctY2xvbmUnfSwgZGF0YVxuICAgIGRlbGV0ZSByZXQucmVwclxuICAgIHJldFxuXG4gICMgKCkgLT4gSnNvblxuICBzZXJpYWxpemU6IC0+XG4gICAgcGljayhALCA8W3R5cGUgcGF5bG9hZCBpZCB0YWdzXT4pIDw8PCBtYXBWYWx1ZXMgKHBpY2sgQCwgPFsgc3RhcnQgZW5kIF0+KSwgKHZhbHVlKSAtPiB2YWx1ZS5mb3JtYXQgXCJZWVlZLU1NLUREIEhIOm1tOnNzXCJcblxuICAjICgpIC0+IFN0cmluZ1xuICB0b1N0cmluZzogLT5cbiAgICBzdGFydCA9IGZvcm1hdCBAc3RhcnRcbiAgICBlbmQgPSBmb3JtYXQgQGVuZFxuICAgIGlmIEBwcmljZSB0aGVuIFwiUHJpY2UoXCIgKyBAcHJpY2UgKyBcIiBcIiArIHN0YXJ0ICsgXCIpXCJcbiAgICBlbHNlIFwiRXZlbnQoXCIgKyAoQGlkIG9yIFwidW5zYXZlZC1cIiArIEB0eXBlKSAgKyBcIilcIlxuICAgIFxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0TWFueTogKGV2ZW50cykgLT5cbiAgICBAcmVsZXZhbnRFdmVudHMgZXZlbnRzXG4gICAgLnJlZHVjZSBkb1xuICAgICAgKHJlcywgZXZlbnQpIH4+IHJlcy5zdWJ0cmFjdE9uZSBldmVudFxuICAgICAgbmV3IE1lbUV2ZW50cyBAXG4gICAgICBcbiAgIyAoIEV2ZW50ICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0T25lOiAoZXZlbnQpIC0+XG4gICAgY250ID0gMFxuICAgIG5ldyBNZW1FdmVudHMgbWFwIGRvXG4gICAgICBAcmFuZ2UoKS5zdWJ0cmFjdCBldmVudC5yYW5nZSgpXG4gICAgICB+PiBAY2xvbmUgeyBzdGFydDogaXQuc3RhcnQsIGVuZDogaXQuZW5kLCBpZDogQGlkICsgJy0nICsgY250KysgfSAjIGdldCByaWQgb2YgcG90ZW50aWFsIG9sZCByZXByLCB0aGlzIGlzIGEgbmV3IGV2ZW50XG5cbiAgIyAoIEV2ZW50cywgKEV2ZW50LCBFdmVudCkgLT4gRXZlbnRzICkgLT4gRXZlbnRzXG4gIGNvbGxpZGU6IChldmVudHMsIGNiKSAtPlxuICAgIEByZWxldmFudEV2ZW50cyBldmVudHNcbiAgICAucmVkdWNlIChldmVudHMsIGV2ZW50KSB+PiBldmVudHMucHVzaG0gY2IgZXZlbnQsIEBcblxuICBlYWNoOiAoY2IpIC0+IGNiIEBcbiAgICBcbiAgbWVyZ2U6IChldmVudCkgLT5cbiAgICBuZXdTZWxmID0gQGNsb25lKClcbiAgICBpZiBldmVudC5zdGFydCA8IG5ld1NlbGYuc3RhcnQgdGhlbiBuZXdTZWxmLnN0YXJ0ID0gZXZlbnQuc3RhcnRcbiAgICBpZiBldmVudC5lbmQgPiBuZXdTZWxmLmVuZCB0aGVuIG5ld1NlbGYuZW5kID0gZXZlbnQuZW5kXG4gICAgbmV3U2VsZlxuICAgIFxuXG5QZXJzaXN0TGF5ZXIgPSBleHBvcnRzLlBlcnNpc3RMYXllciA9IGNsYXNzXG4gIG1hcmtSZW1vdmU6IC0+IEB0b1JlbW92ZSA9IHRydWVcbiAgXG4gIHNhdmU6IC0+IG5ldyBwIChyZXNvbHZlLHJlamVjdCkgfj5cbiAgICBpZiBAdG9SZW1vdmUgdGhlbiByZXNvbHZlIEByZW1vdmUhXG4gICAgZWxzZSAuLi5cbiAgICAgIFxuICByZW1vdmU6IC0+IG5ldyBwIChyZXNvbHZlLHJlamVjdCkgfj4gLi4uXG5cbiMgKiBFdmVudHNcbiMgYWJzdHJhY3QgZXZlbnQgY29sbGVjdGlvblxuIyBzdXBwb3J0aW5nIGNvbW1vbiBzZXQgb3BlcmF0aW9ucyxcbiMgYW5kIHNvbWUgdW5jb21tb24gb3BlcmF0aW9ucyByZWxhdGVkIHRvIHRpbWUgKGNvbGxpZGUsIHN1YnRyYWN0KVxuIFxuRXZlbnRzID0gZXhwb3J0cy5FdmVudHMgPSBjbGFzcyBFdmVudHMgZXh0ZW5kcyBFdmVudExpa2VcbiAgKC4uLmV2ZW50cykgLT4gQHB1c2htLmFwcGx5IEAsIGV2ZW50c1xuXG4gICMgcGVyIGRheSBkYXRhIChhaXJibmIgYXBpIGhlbHBlcilcbiAgZGF5czogKGNiKSAtPiBAZWFjaCAoZXZlbnQpIC0+IGV2ZW50LnJhbmdlIWJ5ICdkYXlzJywgfj4gY2IgaXQsIGV2ZW50XG5cbiAgaXNFdmVudHM6IHRydWVcblxuICAjICggTW9tZW50UmFuZ2UsIE9iamVjdCApIC0+IEV2ZW50c1xuICBmaW5kOiAocmFuZ2UsIHBhdHRlcm4pIC0+IC4uLlxuICAgIFxuICAjICggcmFuZ2VFcXVpdmFsZW50ICkgLT4gRXZlbnRzXG4jICBjbG9uZTogKHJhbmdlRXF1aXZhbGVudCkgfj4gLi4uXG5cbiAgIyAoIEV2ZW50Q29sbGVjdGlvbikgLT4gRXZlbnRzXG4gIHB1c2htOiAoZXZlbnRDb2xsZWN0aW9uKSAtPiAuLi5cblxuICAjICggRXZlbnRDb2xsZWN0aW9uKSAtPiBFdmVudHNcbiAgcHVzaDogKGV2ZW50Q29sbGVjdGlvbikgLT4gQGNsb25lIGV2ZW50Q29sbGVjdGlvblxuXG4gICMgKCkgLT4gRXZlbnRzXG4gIHdpdGhvdXQ6IC0+ICAuLi5cblxuICAjICggRnVuY3Rpb24gKSAtPiB2b2lkXG4gIGVhY2g6IChjYikgLT4gLi4uXG5cbiAgIyAoKSAtPiBTdHJpbmdcbiAgdG9TdHJpbmc6IC0+IFwiRVsje0BsZW5ndGh9XSA8IFwiICsgKEBtYXAgKGV2ZW50KSAtPiBcIlwiICsgZXZlbnQpLmpvaW4oXCIsIFwiKSArIFwiID5cIlxuXG4gICMgKCkgLT4gSnNvblxuICBzZXJpYWxpemU6IC0+IEBtYXAgKC5zZXJpYWxpemUhKVxuXG4gICMgKCkgLT4gQXJyYXk8RXZlbnQ+XG4gIHRvQXJyYXk6IC0+XG4gICAgcmV0ID0gW11cbiAgICBAZWFjaCAtPiByZXQucHVzaCBpdFxuICAgIHJldFxuXG4gICMgKCAoRXZlbnQpIC0+IGFueSkgKSAtPiBBcnJheTxhbnk+XG4gIG1hcDogKGNiKSAtPlxuICAgIHJldCA9IFtdXG4gICAgQGVhY2ggKGV2ZW50KSAtPiByZXQucHVzaCBjYiBldmVudFxuICAgIHJldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICMgKCAoRXZlbnRzLCBFdmVudCkgLT4gRXZlbnRzICkgLT4gQXJyYXk8YW55PlxuICByYXdSZWR1Y2U6IChjYiwgbWVtbykgLT5cbiAgICBAZWFjaCAoZXZlbnQpIC0+IG1lbW8gOj0gY2IgbWVtbywgZXZlbnRcbiAgICBtZW1vXG4gICAgXG4gICMgKCAoRXZlbnRzLCBFdmVudCkgLT4gRXZlbnRzICkgLT4gRXZlbnRzXG4gIHJlZHVjZTogKGNiLCBtZW1vKSAtPlxuICAgIGlmIG5vdCBtZW1vIHRoZW4gbWVtbyA9IG5ldyBNZW1FdmVudHMoKVxuICAgIEByYXdSZWR1Y2UgY2IsIG1lbW9cblxuICAjICggRXZlbnQgKSAtPiBCb29sZWFuXG4gIGhhczogKHRhcmdldEV2ZW50KSAtPlxuICAgIHJhbmdlID0gdGFyZ2V0RXZlbnQucmFuZ2UhXG4gICAgQF9maW5kIChldmVudCkgLT4gZXZlbnQucGF5bG9hZCBpcyB0YXJnZXRFdmVudC5wYXlsb2FkIGFuZCBldmVudC5yYW5nZSFpc1NhbWUgcmFuZ2VcbiAgICAgICAgICAgIFxuICAjICggRXZlbnQgfCB7IHJhbmdlOiBSYW5nZSwgLi4uIH0gKSAtPiBFdmVudHNcbiAgZmluZDogLT5cbiAgICBtYXRjaGVyID0gTWF0Y2hlci5hcHBseSBALCBwYXJzZS5wYXR0ZXJuIGl0XG4gICAgQF9maW5kIG1hdGNoZXJcbiAgICBcbiAgIyAoIHsgcmFuZ2U6IFJhbmdlLCAuLi4gfSApIC0+IEV2ZW50c1xuICBmaWx0ZXI6ICggcGF0dGVybiApLT5cbiAgICBtYXRjaGVyID0gTWF0Y2hlci5hcHBseSBALCBwYXJzZS5wYXR0ZXJuIHBhdHRlcm5cbiAgICBAcmVkdWNlIChyZXQsIGV2ZW50KSAtPiBpZiBtYXRjaGVyIGV2ZW50IHRoZW4gcmV0LnB1c2htIGV2ZW50IGVsc2UgcmV0XG4gICAgXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgdXBkYXRlUHJpY2U6IChwcmljZURhdGEpIC0+ICAgIFxuICAgIHBhcnNlLmV2ZW50cyBwcmljZURhdGFcbiAgICAucmVkdWNlIChyZXMsIGV2ZW50KSB+PlxuXG4gICAgICB0YXJnZXRzID0gZXZlbnQucmVsZXZhbnRFdmVudHMgQFxuICAgICAgXG4gICAgICBpZiBub3QgdGFyZ2V0cy5sZW5ndGggdGhlbiByZXR1cm4gcmVzLnB1c2htIGV2ZW50XG4gICAgICAgIFxuICAgICAgcmVzLnB1c2htIHRhcmdldHMuY29sbGlkZSBldmVudCwgKGV2ZW50MSwgZXZlbnQyKSAtPlxuICAgICAgICBpZiBldmVudDEucHJpY2UgaXMgZXZlbnQyLnByaWNlXG4gICAgICAgICAgcmVzLnB1c2htIGV2ZW50Mi5jbG9uZSByYW5nZTogZXZlbnQxLnJhbmdlIWFkZCBldmVudDIucmFuZ2UhXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXMucHVzaG0gWyBldmVudDEsIGV2ZW50Mi5zdWJ0cmFjdChldmVudDEpIF1cblxuICBkaWZmOiAoZXZlbnRzKSAtPlxuICAgIG1ha2VEaWZmID0gKGRpZmYsIGV2ZW50KSB+PlxuICAgICAgY29sbGlzaW9ucyA9IGV2ZW50LnJlbGV2YW50RXZlbnRzIGRpZmZcbiAgICAgIGlmIG5vdCBjb2xsaXNpb25zLmxlbmd0aCB0aGVuIHJldHVybiBkaWZmXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBkaWZmLnBvcG0oY29sbGlzaW9ucykucHVzaG0gY29sbGlzaW9ucy5yZWR1Y2UgKHJlcywgY29sbGlzaW9uKSAtPlxuICAgICAgICAgIFsgcmFuZ2UsIHBheWxvYWQgXSA9IGV2ZW50LmNvbXBhcmUgY29sbGlzaW9uXG4gICAgICAgICAgXG4gICAgICAgICAgaWYgbm90IHJhbmdlIGFuZCBub3QgcGF5bG9hZCB0aGVuIHJldHVybiByZXMucHVzaG0gY29sbGlzaW9uXG4gICAgICAgICAgaWYgcGF5bG9hZCB0aGVuIHJldHVybiByZXMucHVzaG0gY29sbGlzaW9uLnN1YnRyYWN0IGV2ZW50XG4gICAgICAgICAgaWYgcmFuZ2UgdGhlbiByZXR1cm4gcmVzLnB1c2htIGNvbGxpc2lvblxuICAgICAgICAgIHJldHVybiByZXNcblxuICAgIGV2ZW50cyA9IHBhcnNlLmV2ZW50cyBldmVudHNcbiAgICBAcmVkdWNlIG1ha2VEaWZmLCBldmVudHMuY2xvbmUoKVxuXG4gICMgY29tcGxhdGVseSB0cmFuc2Zvcm1zIHRoZSBncm91cCBvZiBldmVudHMsIHJldHVybmluZyByYW5nZXMgYWRkZWQgYW5kIHJlbW92ZWQsIGFuZCBkYiBldmVudHMgdG8gZGVsZXRlIGFuZCBjcmVhdGUgdG8gYXBwbHkgdGhlIGNoYW5nZVxuICAjICggRXZlbnRzICkgLT4geyBidXN5OiBFdmVudHMsIGZyZWU6IEV2ZW50cywgY3JlYXRlOiBFdmVudHMsIHJlbW92ZTogRXZlbnRzIH1cbiAgY2hhbmdlOiAobmV3RXZlbnRzKSAtPlxuICAgIG5ld0V2ZW50cyA9IHBhcnNlLmV2ZW50cyBuZXdFdmVudHNcbiAgICBidXN5ID0gbmV3RXZlbnRzLnN1YnRyYWN0IEBcbiAgICBmcmVlID0gQHN1YnRyYWN0IG5ld0V2ZW50c1xuXG4gICAgY3JlYXRlID0gbmV3RXZlbnRzLnJlZHVjZSAoY3JlYXRlLCBldmVudCkgfj4gaWYgbm90IEBoYXMgZXZlbnQgdGhlbiBjcmVhdGUucHVzaG0gZXZlbnQgZWxzZSBjcmVhdGVcbiAgICByZW1vdmUgPSBAcmVkdWNlIChyZW1vdmUsIGV2ZW50KSAtPiBpZiBub3QgbmV3RXZlbnRzLmhhcyBldmVudCB0aGVuIHJlbW92ZS5wdXNobSBldmVudCBlbHNlIHJlbW92ZVxuICAgICAgICBcbiAgICBidXN5OiBidXN5LCBmcmVlOiBmcmVlLCBjcmVhdGU6IGNyZWF0ZSwgcmVtb3ZlOiByZW1vdmVcblxuICAjIHVwYXRlcyBldmVudHNcbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICB1cGRhdGU6IChldmVudHMpIC0+XG4gICAgQHJlZHVjZSBkb1xuICAgICAgKFsgY3JlYXRlLCByZW1vdmUgXSwgZXZlbnQpIH4+XG5cbiAgICAgICAgaWYgKHJlbGV2YW50RXZlbnRzID0gZXZlbnQucmVsZXZhbnRFdmVudHMoZXZlbnRzKSkubGVuZ3RoXG4gICAgICAgICAgcmVtb3ZlLnB1c2htIGV2ZW50XG4gICAgICAgICAgY3JlYXRlLnB1c2htIGV2ZW50LnN1YnRyYWN0IHJlbGV2YW50RXZlbnRzXG5cbiAgICAgICAgWyBjcmVhdGUsIHJlbW92ZSBdXG5cbiAgICAgIFsgZXZlbnRzLmNsb25lKCksIG5ldyBNZW1FdmVudHMoKSBdXG5cbiAgICAgICAgICAgIFxuICBtZXJnZTogLT5cbiAgICBAcmVkdWNlIChyZXMsIGV2ZW50KSB+PlxuICAgICAgZXZlbnRcbiAgICAgIC5uZWlnaGJvdXJzKEApXG4gICAgICAubWFwIChvbGRFdmVudCkgLT4gXG4gICAgICAgIGlmIG9sZEV2ZW50Lmxlbmd0aCBhbmQgb2xkRXZlbnQucGF5bG9hZCBpcyBvbGRFdmVudC5wYXlsb2FkIHRoZW4gb2xkRXZlbnQubWVyZ2UgZXZlbnRcbiAgICBcbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICB1bmlvbjogKGV2ZW50cykgLT5cbiAgICByZXMgPSBAY2xvbmUoKVxuICAgIGV2ZW50cy5lYWNoIH4+IHJlcy5wdXNobSBpdFxuICAgIHJlc1xuXG4gICMgKCAoRXZlbnRzLCAoRXZlbnQxLCBFdmVudDIpIC0+IEV2ZW50cyApIC0+IEV2ZW50c1xuICBjb2xsaWRlOiAoZXZlbnRzLCBjYikgLT5cbiAgICBAcmVkdWNlIChtZW1vLCBldmVudCkgLT4gbWVtby5wdXNobSBldmVudC5jb2xsaWRlIGV2ZW50cywgY2JcblxuICAjICggRXZlbnQgKSAtPiBFdmVudHNcbiAgc3VidHJhY3RPbmU6IChldmVudCkgLT5cbiAgICBAcmVkdWNlIChyZXQsIGNoaWxkKSAtPiByZXQucHVzaG0gY2hpbGQuc3VidHJhY3QgZXZlbnRcblxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0TWFueTogKGV2ZW50cykgLT5cbiAgICBAcmVkdWNlIChyZXQsIGNoaWxkKSAtPiByZXQucHVzaG0gY2hpbGQuc3VidHJhY3RNYW55IGV2ZW50c1xuXG4gIFxuIyAqIE1lbUV2ZW50c1xuIyBJbiBtZW1vcnkgRXZlbnQgY29sbGVjdGlvbiBpbXBsZW1lbnRhdGlvbixcbiMgdGhpcyBpcyBhIHZlcnkgbmFpdmUgaW1wbGVtZW50YXRpb25cbiMgXG4jIEkgZ3Vlc3Mgd2Ugc2hvdWxkIHVzZSByYW5nZSB0cmVlIGRhdGEgc3RydWN0dXJlIG9yIHNvbWV0aGluZyBzbWFydCBsaWtlIHRoYXQgZm9yIGZhc3QgcmFuZ2Ugc2VhcmNoIGluIHRoZSBmdXR1cmUuXG4jIGl0cyBnb29kIGVub3VnaCBmb3Igbm93IGV2ZW4gaWYgd2UgZW5kIHVwIHF1YWRyYXRpYyBjb21wbGV4aXR5IGZvciBhbGdvcywgd2UgYXJlIG5vdCBwYXJzaW5nIG1hbnkgZXZlbnRzIHBlciBwcm9wZXJ0eS5cbiMgXG5NZW1FdmVudHMgPSBleHBvcnRzLk1lbUV2ZW50cyA9IGNsYXNzIE1lbUV2ZW50c05haXZlIGV4dGVuZHMgRXZlbnRzXG4gIC0+XG4gICAgYXNzaWduIEAsIGRvXG4gICAgICBldmVudHM6ICB7fVxuICAgICAgbGVuZ3RoOiAwXG4gICAgICB0eXBlOiB7fVxuICAgIHN1cGVyIC4uLlxuICBcbiAgd2l0aG91dDogKGV2ZW50KSAtPiBuZXcgTWVtRXZlbnRzIGZpbHRlciAodmFsdWVzIEBldmVudHMpLCAtPiBpdC5pZCBpc250IGV2ZW50LmlkXG4gICAgXG4gIHRvQXJyYXk6IC0+IHZhbHVlcyBAZXZlbnRzXG5cbiAgZWFjaDogKGNiKSAtPiBlYWNoIEBldmVudHMsIGNiXG4gIFxuICBfZmluZDogKGNiKSAtPiBmaW5kIEBldmVudHMsIGNiXG5cbiAgY2xvbmU6IChyYW5nZSkgLT4gbmV3IE1lbUV2ZW50cyB2YWx1ZXMgQGV2ZW50c1xuXG4gIHBvcG06ICguLi5ldmVudHMpIC0+IFxuICAgIGVhY2ggcGFyc2UuZXZlbnRBcnJheShldmVudHMpLCAoZXZlbnQpIH4+XG4gICAgICBpZiBub3QgZXZlbnQgdGhlbiByZXR1cm5cbiAgICAgIGlmIG5vdCBAZXZlbnRzW2V2ZW50LmlkXT8gdGhlbiByZXR1cm5cbiAgICAgIGVsc2VcbiAgICAgICAgZGVsZXRlIEBldmVudHNbZXZlbnQuaWRdXG4gICAgICAgIEBsZW5ndGgtLVxuICAgIEBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdXNobTogKC4uLmV2ZW50cykgLT5cbiAgICBlYWNoIHBhcnNlLmV2ZW50QXJyYXkoZXZlbnRzKSwgKGV2ZW50KSB+PlxuICAgICAgaWYgbm90IGV2ZW50IHRoZW4gcmV0dXJuXG4gICAgICBpZiBAZXZlbnRzW2V2ZW50LmlkXT8gdGhlbiByZXR1cm5cbiAgICAgIEBldmVudHNbZXZlbnQuaWRdID0gZXZlbnRcbiAgICAgIEB0eXBlW2V2ZW50LnR5cGVdID0gdHJ1ZVxuXG5cbiAgICAgIGlmIGV2ZW50LnN0YXJ0IDwgQHN0YXJ0IG9yIG5vdCBAc3RhcnQgdGhlbiBAc3RhcnQgPSBldmVudC5zdGFydFxuICAgICAgaWYgZXZlbnQuZW5kIDwgQGVuZCBvciBub3QgQGVuZCB0aGVuIEBlbmQgPSBldmVudC5lbmRcbiAgICAgIFxuICAgICAgQGxlbmd0aCsrXG4gICAgQFxuICBcbiJdfQ==

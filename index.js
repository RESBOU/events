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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9jb3JlL25vZGVfbW9kdWxlcy90aW1lRXZlbnRzL2luZGV4LmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBR1ksQ0FBVixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQTtFQUNBLElBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQVksQ0FBWixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVksQ0FBWixFQUFlLElBQWYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFlLElBQWYsRUFBcUIsSUFBckIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFxQixJQUFyQixFQUEyQixNQUEzQixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTJCLE1BQTNCLEVBQW1DLElBQW5DLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbUMsSUFBbkMsRUFBeUMsSUFBekMsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF5QyxJQUF6QyxFQUErQyxNQUEvQyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStDLE1BQS9DLEVBQXVELEdBQXZELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdUQsR0FBdkQsRUFBNEQsTUFBNUQsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE0RCxNQUE1RCxFQUFvRSxJQUFwRSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW9FLElBQXBFLEVBQTBFLE1BQTFFLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEUsTUFBMUUsRUFBa0YsV0FBbEYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFrRixXQUFsRixFQUErRixJQUEvRixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStGLElBQS9GLEVBQXFHLEdBQXJHLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcUcsR0FBckcsRUFBMEcsU0FBMUcsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEwRyxTQUExRyxFQUFxSCxJQUFySCxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXFIO0VBQ3JILE1BQUEsQ0FBQSxDQUFB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c0NvbnRlbnQiOlsiIyBhdXRvY29tcGlsZVxuIyAqIHJlcXVpcmVcbnJlcXVpcmUhIHtcbiAgYmx1ZWJpcmQ6IHBcbiAgbGVzaGRhc2g6IHsgdywgZmluZCwgb21pdCwgZmlsdGVyLCBwaWNrLCBrZXlzLCB2YWx1ZXMsIHBvcCwgYXNzaWduLCBlYWNoLCByZWR1Y2UsIGZsYXR0ZW5EZWVwLCBwdXNoLCBtYXAsIG1hcFZhbHVlcywgb21pdCB9ICBcbiAgbW9tZW50XG4gICdtb21lbnQtcmFuZ2UnXG59XG5cbiMgKiBUeXBlIGNvZXJjaW9uIGZ1bmN0aW9ucyBmb3IgYSBtb3JlIGNoaWxsZWQgb3V0IEFQSVxuZm9ybWF0ID0gZXhwb3J0cy5mb3JtYXQgPSAtPiBpdC5mb3JtYXQgJ1lZWVktTU0tREQnXG5cbnBhcnNlID0gZXhwb3J0cy5wYXJzZSA9IG1hcFZhbHVlcyBkb1xuICBwYXR0ZXJuOiAtPlxuICAgIHwgaXQ/aXNFdmVudD8gPT4gWyBpdC5yYW5nZSEsIHBheWxvYWQ6IGl0LnBheWxvYWQgXVxuICAgIHwgaXQ/QEAgaXMgT2JqZWN0IGFuZCBpdC5yYW5nZT8gPT4gWyBwYXJzZS5yYW5nZShpdC5yYW5nZSksIG9taXQoaXQsICdyYW5nZScpIF1cbiAgICB8IGl0P0BAIGlzIE9iamVjdCA9PiBbIGZhbHNlLCBpdCBdXG4gICAgfCBvdGhlcndpc2UgPT4gdGhyb3cgbmV3IEVycm9yIFwiaW52YWxpZCB0eXBlIGZvciBwYXRlcm4gI3tpdD90b1N0cmluZz8hfSAje2l0P0BAfVwiXG4gICAgXG4gICMgKGFueSkgLT4gRXZlbnQgfCBFcnJvclxuICBldmVudDogLT5cbiAgICBpZiBpdD9pc0V2ZW50PyB0aGVuIHJldHVybiBpdFxuICAgIHN3aXRjaCBpdD9AQFxuICAgICAgfCBPYmplY3QgPT4gbmV3IEV2ZW50IGl0XG4gICAgICB8IG90aGVyd2lzZSA9PlxuICAgICAgICBjb25zb2xlLmxvZyBpdFxuICAgICAgICBjb25zb2xlLmxvZyBTdHJpbmcgaXRcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwiaW52YWxpZCB0eXBlIGZvciBldmVudCAje2l0P3RvU3RyaW5nPyF9ICN7aXQ/QEB9XCJcblxuICAjIChhbnkpIC0+IE1lbUV2ZW50cyB8IEVycm9yXG4gIGV2ZW50czogLT5cbiAgICBpZiBpdD9pc0V2ZW50cz8gdGhlbiByZXR1cm4gaXRcbiAgICAgIFxuICAgIHN3aXRjaCBpdD9AQFxuICAgICAgfCBBcnJheSA9PiBuZXcgTWVtRXZlbnRzIGl0XG4gICAgICB8IG90aGVyd2lzZSA9PiBuZXcgTWVtRXZlbnRzIHBhcnNlLmV2ZW50IGl0XG5cbiAgIyAoQW55KSAtPiBBcnJheTxFdmVudD4gfCBFcnJvclxuICBldmVudEFycmF5OiAtPlxuICAgIGZsYXR0ZW5EZWVwIHN3aXRjaCBpdD9AQFxuICAgICAgfCBBcnJheSA9PiBtYXAgaXQsIHBhcnNlLmV2ZW50QXJyYXlcbiAgICAgIHwgTWVtRXZlbnRzID0+IGl0LnRvQXJyYXkoKVxuICAgICAgfCBvdGhlcndpc2UgPT4gWyBwYXJzZS5ldmVudCBpdCBdXG4gICAgICAgIFxuICAjICggRXZlbnRzIHwgRXZlbnQgfCB2b2lkICkgLT4gUmFuZ2VcbiAgcmFuZ2U6IChzb21ldGhpbmcsIGRlZikgLT5cbiAgICBzd2l0Y2ggc29tZXRoaW5nP0BAXG4gICAgICB8IGZhbHNlID0+IGRlZiBvciB2b2lkXG4gICAgICB8IE9iamVjdCA9PiBtb21lbnQucmFuZ2Ugc29tZXRoaW5nXG4gICAgICB8IEFycmF5ID0+IG1vbWVudC5yYW5nZSBzb21ldGhpbmdcbiAgICAgIHwgRXZlbnQgPT4gc29tZXRoaW5nLnJhbmdlIVxuICAgICAgfCBNZW1FdmVudHMgPT4gc29tZXRoaW5nLnJhbmdlIVxuICAgICAgfCBvdGhlcndpc2UgPT4gc29tZXRoaW5nLnJhbmdlPyEgb3Igc29tZXRoaW5nXG5cbiAgICBcbiMgKCBFdmVudHMgfCBBcnJheTxFdmVudD4gfCBFdmVudCB8IHZvaWQgKSAtPiBBcnJheTxFdmVudD5cbiAgZXZlbnRDb2xsZWN0aW9uOiAoc29tZXRoaW5nKSAtPlxuICAgIHN3aXRjaCBzb21ldGhpbmc/QEBcbiAgICAgIHwgdm9pZCA9PiBbXVxuICAgICAgfCBFdmVudCA9PiBbIEV2ZW50IF1cbiAgICAgIHwgRXZlbnRzID0+IEV2ZW50cy50b0FycmF5KClcbiAgICAgIHwgQXJyYXkgPT4gZmxhdHRlbkRlZXAgc29tZXRoaW5nXG4gICAgICB8IG90aGVyd2lzZSA9PiB0aHJvdyAnd2hhdCBpcyB0aGlzJ1xuXG4gICggZiwgbmFtZSApIC0+IC0+IGYgaWYgaXQ/QEAgaXMgRnVuY3Rpb24gdGhlbiBpdCEgZWxzZSBpdFxuICAgIFxuXG5NYXRjaGVyID0gKHJhbmdlLCBwYXR0ZXJuLCBldmVudCkgLS0+XG4gIFxuICBjaGVja1JhbmdlID0gKGV2ZW50KSAtPlxuICAgIGlmIHJhbmdlIHRoZW4gcmV0dXJuIHJhbmdlLmNvbnRhaW5zIGV2ZW50LnN0YXJ0LmNsb25lKCkuYWRkKDEpIG9yIHJhbmdlLmNvbnRhaW5zIGV2ZW50LmVuZC5jbG9uZSgpLnN1YnRyYWN0KDEpIG9yIGV2ZW50LnJhbmdlIS5jb250YWlucyByYW5nZVxuICAgIGVsc2UgcmV0dXJuIHRydWVcblxuICBjaGVja1JhbmdlU3RyaWN0ID0gKGV2ZW50KSAtPiByYW5nZS5pc0VxdWFsIGV2ZW50LnJhbmdlIVxuXG4gIGNoZWNrUGF0dGVybiA9IChldmVudCkgLT5cbiAgICBub3QgZmluZCBwYXR0ZXJuLCAodmFsdWUsIGtleSkgLT5cbiAgICAgIHN3aXRjaCB2YWx1ZT9AQFxuICAgICAgICB8IHVuZGVmaW5lZCA9PiB0cnVlXG4gICAgICAgIFxuICAgICAgICB8IEJvb2xlYW4gPT5cbiAgICAgICAgICBpZiB2YWx1ZSB0aGVuIG5vdCBldmVudFtrZXldP1xuICAgICAgICAgIGVsc2UgZXZlbnRba2V5XT9cbiAgICAgICAgICBcbiAgICAgICAgfCBGdW5jdGlvbiA9PiBub3QgdmFsdWUgZXZlbnRba2V5XVxuXG4gICAgICAgIHwgb3RoZXJ3aXNlID0+XG4gICAgICAgICAgaWYgbW9tZW50LmlzTW9tZW50IHZhbHVlIHRoZW4gbm90IHZhbHVlLmlzU2FtZSBldmVudFtrZXldXG4gICAgICAgICAgZWxzZSBpZiBldmVudFtrZXldIGlzIHZhbHVlIHRoZW4gZmFsc2UgZWxzZSB0cnVlXG5cbiAgY2hlY2tSYW5nZShldmVudCkgYW5kIGNoZWNrUGF0dGVybihldmVudClcblxuXG4jICogRXZlbnRMaWtlXG4jIG1vcmUgb2YgYSBzcGVjIHRoZW4gYW55dGhpbmcsIHRoaXMgaXMgaW1wbGVtZW50ZWQgYnkgRXZlbnQgJiBFdmVudHNcblxuRXZlbnRMaWtlID0gZXhwb3J0cy5FdmVudExpa2UgPSBjbGFzcyBFdmVudExpa2VcblxuICAjIGZldGNoZXMgYWxsIGV2ZW50cyBmcm9tIGEgY29sbGVjdGlvbiByZWxldmFudCB0byBjdXJyZW50IGV2ZW50IChieSB0eXBlIGFuZCByYW5nZSlcbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICByZWxldmFudEV2ZW50czogKGV2ZW50cykgLT5cbiAgICBwYXJzZS5ldmVudHMgZXZlbnRzXG4gICAgLmZpbHRlciByYW5nZTogQHJhbmdlKCksIHR5cGU6IEB0eXBlXG5cbiAgbmVpZ2hib3VyczogKGV2ZW50cykgLT5cbiAgICBbXG4gICAgICBldmVudHMuZmlsdGVyIGVuZDogQHN0YXJ0LmNsb25lKClcbiAgICAgIGV2ZW50cy5maWx0ZXIgc3RhcnQ6IEBlbmQuY2xvbmUoKVxuICAgIF1cblxuICAjIGdldCBvciBzZXQgcmFuZ2VcbiAgIyAocmFuZ2U/KSAtPiBtb21lbnQucmFuZ2VcbiAgcmFuZ2U6IChzZXRSYW5nZSkgLT5cbiAgICBpZiByYW5nZSA9IHNldFJhbmdlXG4gICAgICBAc3RhcnQgPSByYW5nZS5zdGFydC5jbG9uZSgpXG4gICAgICBAZW5kID0gcmFuZ2UuZW5kLmNsb25lKClcbiAgICBlbHNlXG4gICAgICByYW5nZSA9IG5ldyBtb21lbnQucmFuZ2UgQHN0YXJ0LCBAZW5kXG4gICAgICBcbiAgICByYW5nZVxuXG4gICMgKCBFdmVudExpa2UgKSAtPiBFdmVudHNcbiAgcHVzaDogKGV2ZW50KSAtPiAuLi5cbiAgICBcbiAgIyAoIEV2ZW50TGlrZSApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdDogKHNvbWV0aGluZykgLT5cbiAgICBpZiBzb21ldGhpbmcgaW5zdGFuY2VvZiBFdmVudHMgdGhlbiBAc3VidHJhY3RNYW55IHNvbWV0aGluZ1xuICAgIGVsc2UgQHN1YnRyYWN0T25lIHNvbWV0aGluZ1xuICAgIFxuICAjICggRXZlbnRMaWtlLCAoRXZlbnQsIEV2ZW50KSAtPiBFdmVudHMpIC0+IEV2ZW50c1xuICBjb2xsaWRlOiAoZXZlbnRzLCBjYikgLT4gLi4uXG5cbiAgZWFjaDogLT4gLi4uXG5cbiAgc3VidHJhY3RNYW55OiAtPiAuLi5cblxuICBzdWJ0cmFjdE9uZTogLT4gLi4uXG5cbiMgKiBFdmVudFxuIyByZXByZXNlbnRzIHNvbWUgZXZlbnQgaW4gdGltZSwgZGVmaW5lZCBieSBzdGFydCBhbmQgZW5kIHRpbWVzdGFtcHNcbiMgY2FyaWVzIHNvbWUgcGF5bG9hZCwgbGlrZSBhIHByaWNlIG9yIGEgYm9va2luZ1xuXG5wYXJzZUluaXQgPSAoZGF0YSkgLT5cbiAgaWYgbm90IGRhdGEgdGhlbiByZXR1cm4ge31cbiAgaWYgZGF0YS5jZW50ZXIgdGhlbiByZXR1cm4geyBzdGFydDogZGF0YS5zdGFydCwgZW5kOiBkYXRhLmVuZCB9XG4gIGlmIGRhdGEucmFuZ2VcbiAgICBkYXRhLnN0YXJ0ID0gZGF0YS5yYW5nZS5zdGFydFxuICAgIGRhdGEuZW5kID0gZGF0YS5yYW5nZS5lbmRcbiAgICBkZWxldGUgZGF0YS5yYW5nZVxuXG4gIGlmIGRhdGEuc3RhcnQ/QEAgaW4gWyBTdHJpbmcsIERhdGUgXSB0aGVuIGRhdGEuc3RhcnQgPSBtb21lbnQgZGF0YS5zdGFydFxuICBpZiBkYXRhLmVuZD9AQCBpbiBbIFN0cmluZywgRGF0ZSBdIHRoZW4gZGF0YS5lbmQgPSBtb21lbnQgZGF0YS5lbmRcbiAgICBcbiAgaWYgZGF0YUBAIGlzbnQgT2JqZWN0IHRoZW4gcmV0dXJuIFwid3V0IHd1dFwiXG4gIGVsc2UgcmV0dXJuIGRhdGFcblxuRXZlbnQgPSBleHBvcnRzLkV2ZW50ID0gY2xhc3MgRXZlbnQgZXh0ZW5kcyBFdmVudExpa2VcbiAgaXNFdmVudDogdHJ1ZVxuICBcbiAgKGluaXQpIC0+IGFzc2lnbiBALCBwYXJzZUluaXQgaW5pdFxuXG4gIGNvbXBhcmU6IChldmVudCkgLT5cbiAgICBbIEBpc1NhbWVSYW5nZShldmVudCksIEBpc1NhbWVQYXlsb2FkKGV2ZW50KSBdXG5cbiAgaXNTYW1lOiAoZXZlbnQpIC0+XG4gICAgQGlzU2FtZVJhbmdlKGV2ZW50KSBhbmQgQGlzU2FtZVBheWxvYWQoZXZlbnQpXG5cbiAgaXNTYW1lUmFuZ2U6IChldmVudCkgLT5cbiAgICBldmVudCA9IHBhcnNlLmV2ZW50IGV2ZW50XG4gICAgQHJhbmdlIS5pc1NhbWUgZXZlbnQucmFuZ2UhXG4gICAgXG4gIGlzU2FtZVBheWxvYWQ6IChldmVudCkgLT5cbiAgICBldmVudCA9IHBhcnNlLmV2ZW50IGV2ZW50XG4gICAgKEB0eXBlIGlzIGV2ZW50LnR5cGUpIGFuZCAoQHBheWxvYWQgaXMgZXZlbnQucGF5bG9hZClcbiAgXG4gIGNsb25lOiAoZGF0YT17fSkgLT5cbiAgICByZXQgPSBuZXcgRXZlbnQgYXNzaWduIHt9LCBALCB7IGlkOiBAaWQgKyAnLWNsb25lJ30sIGRhdGFcbiAgICBkZWxldGUgcmV0LnJlcHJcbiAgICByZXRcblxuICAjICgpIC0+IEpzb25cbiAgc2VyaWFsaXplOiAtPlxuICAgIHBpY2soQCwgPFt0eXBlIHBheWxvYWQgaWQgdGFnc10+KSA8PDwgbWFwVmFsdWVzIChwaWNrIEAsIDxbIHN0YXJ0IGVuZCBdPiksICh2YWx1ZSkgLT4gdmFsdWUuZm9ybWF0IFwiWVlZWS1NTS1ERCBISDptbTpzc1wiXG5cbiAgIyAoKSAtPiBTdHJpbmdcbiAgdG9TdHJpbmc6IC0+XG4gICAgc3RhcnQgPSBmb3JtYXQgQHN0YXJ0XG4gICAgZW5kID0gZm9ybWF0IEBlbmRcbiAgICBpZiBAcHJpY2UgdGhlbiBcIlByaWNlKFwiICsgQHByaWNlICsgXCIgXCIgKyBzdGFydCArIFwiKVwiXG4gICAgZWxzZSBcIkV2ZW50KFwiICsgKEBpZCBvciBcInVuc2F2ZWQtXCIgKyBAdHlwZSkgICsgXCIpXCJcbiAgICBcbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE1hbnk6IChldmVudHMpIC0+XG4gICAgQHJlbGV2YW50RXZlbnRzIGV2ZW50c1xuICAgIC5yZWR1Y2UgZG9cbiAgICAgIChyZXMsIGV2ZW50KSB+PiByZXMuc3VidHJhY3RPbmUgZXZlbnRcbiAgICAgIG5ldyBNZW1FdmVudHMgQFxuICAgICAgXG4gICMgKCBFdmVudCApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE9uZTogKGV2ZW50KSAtPlxuICAgIGNudCA9IDBcbiAgICBuZXcgTWVtRXZlbnRzIG1hcCBkb1xuICAgICAgQHJhbmdlKCkuc3VidHJhY3QgZXZlbnQucmFuZ2UoKVxuICAgICAgfj4gQGNsb25lIHsgc3RhcnQ6IGl0LnN0YXJ0LCBlbmQ6IGl0LmVuZCwgaWQ6IEBpZCArICctJyArIGNudCsrIH0gIyBnZXQgcmlkIG9mIHBvdGVudGlhbCBvbGQgcmVwciwgdGhpcyBpcyBhIG5ldyBldmVudFxuXG4gICMgKCBFdmVudHMsIChFdmVudCwgRXZlbnQpIC0+IEV2ZW50cyApIC0+IEV2ZW50c1xuICBjb2xsaWRlOiAoZXZlbnRzLCBjYikgLT5cbiAgICBAcmVsZXZhbnRFdmVudHMgZXZlbnRzXG4gICAgLnJlZHVjZSAoZXZlbnRzLCBldmVudCkgfj4gZXZlbnRzLnB1c2htIGNiIGV2ZW50LCBAXG5cbiAgZWFjaDogKGNiKSAtPiBjYiBAXG4gICAgXG4gIG1lcmdlOiAoZXZlbnQpIC0+XG4gICAgbmV3U2VsZiA9IEBjbG9uZSgpXG4gICAgaWYgZXZlbnQuc3RhcnQgPCBuZXdTZWxmLnN0YXJ0IHRoZW4gbmV3U2VsZi5zdGFydCA9IGV2ZW50LnN0YXJ0XG4gICAgaWYgZXZlbnQuZW5kID4gbmV3U2VsZi5lbmQgdGhlbiBuZXdTZWxmLmVuZCA9IGV2ZW50LmVuZFxuICAgIG5ld1NlbGZcbiAgICBcblxuUGVyc2lzdExheWVyID0gZXhwb3J0cy5QZXJzaXN0TGF5ZXIgPSBjbGFzc1xuICBtYXJrUmVtb3ZlOiAtPiBAdG9SZW1vdmUgPSB0cnVlXG4gIFxuICBzYXZlOiAtPiBuZXcgcCAocmVzb2x2ZSxyZWplY3QpIH4+XG4gICAgaWYgQHRvUmVtb3ZlIHRoZW4gcmVzb2x2ZSBAcmVtb3ZlIVxuICAgIGVsc2UgLi4uXG4gICAgICBcbiAgcmVtb3ZlOiAtPiBuZXcgcCAocmVzb2x2ZSxyZWplY3QpIH4+IC4uLlxuXG4jICogRXZlbnRzXG4jIGFic3RyYWN0IGV2ZW50IGNvbGxlY3Rpb25cbiMgc3VwcG9ydGluZyBjb21tb24gc2V0IG9wZXJhdGlvbnMsXG4jIGFuZCBzb21lIHVuY29tbW9uIG9wZXJhdGlvbnMgcmVsYXRlZCB0byB0aW1lIChjb2xsaWRlLCBzdWJ0cmFjdClcbiBcbkV2ZW50cyA9IGV4cG9ydHMuRXZlbnRzID0gY2xhc3MgRXZlbnRzIGV4dGVuZHMgRXZlbnRMaWtlXG4gICguLi5ldmVudHMpIC0+IEBwdXNobS5hcHBseSBALCBldmVudHNcblxuICAjIHBlciBkYXkgZGF0YSAoYWlyYm5iIGFwaSBoZWxwZXIpXG4gIGRheXM6IChjYikgLT4gQGVhY2ggKGV2ZW50KSAtPiBldmVudC5yYW5nZSFieSAnZGF5cycsIH4+IGNiIGl0LCBldmVudFxuXG4gIGlzRXZlbnRzOiB0cnVlXG5cbiAgIyAoIE1vbWVudFJhbmdlLCBPYmplY3QgKSAtPiBFdmVudHNcbiAgZmluZDogKHJhbmdlLCBwYXR0ZXJuKSAtPiAuLi5cbiAgICBcbiAgIyAoIHJhbmdlRXF1aXZhbGVudCApIC0+IEV2ZW50c1xuIyAgY2xvbmU6IChyYW5nZUVxdWl2YWxlbnQpIH4+IC4uLlxuXG4gICMgKCBFdmVudENvbGxlY3Rpb24pIC0+IEV2ZW50c1xuICBwdXNobTogKGV2ZW50Q29sbGVjdGlvbikgLT4gLi4uXG5cbiAgIyAoIEV2ZW50Q29sbGVjdGlvbikgLT4gRXZlbnRzXG4gIHB1c2g6IChldmVudENvbGxlY3Rpb24pIC0+IEBjbG9uZSBldmVudENvbGxlY3Rpb25cblxuICAjICgpIC0+IEV2ZW50c1xuICB3aXRob3V0OiAtPiAgLi4uXG5cbiAgIyAoIEZ1bmN0aW9uICkgLT4gdm9pZFxuICBlYWNoOiAoY2IpIC0+IC4uLlxuXG4gICMgKCkgLT4gU3RyaW5nXG4gIHRvU3RyaW5nOiAtPiBcIkVbI3tAbGVuZ3RofV0gPCBcIiArIChAbWFwIChldmVudCkgLT4gXCJcIiArIGV2ZW50KS5qb2luKFwiLCBcIikgKyBcIiA+XCJcblxuICAjICgpIC0+IEpzb25cbiAgc2VyaWFsaXplOiAtPiBAbWFwICguc2VyaWFsaXplISlcblxuICAjICgpIC0+IEFycmF5PEV2ZW50PlxuICB0b0FycmF5OiAtPlxuICAgIHJldCA9IFtdXG4gICAgQGVhY2ggLT4gcmV0LnB1c2ggaXRcbiAgICByZXRcblxuICAjICggKEV2ZW50KSAtPiBhbnkpICkgLT4gQXJyYXk8YW55PlxuICBtYXA6IChjYikgLT5cbiAgICByZXQgPSBbXVxuICAgIEBlYWNoIChldmVudCkgLT4gcmV0LnB1c2ggY2IgZXZlbnRcbiAgICByZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAjICggKEV2ZW50cywgRXZlbnQpIC0+IEV2ZW50cyApIC0+IEFycmF5PGFueT5cbiAgcmF3UmVkdWNlOiAoY2IsIG1lbW8pIC0+XG4gICAgQGVhY2ggKGV2ZW50KSAtPiBtZW1vIDo9IGNiIG1lbW8sIGV2ZW50XG4gICAgbWVtb1xuICAgIFxuICAjICggKEV2ZW50cywgRXZlbnQpIC0+IEV2ZW50cyApIC0+IEV2ZW50c1xuICByZWR1Y2U6IChjYiwgbWVtbykgLT5cbiAgICBpZiBub3QgbWVtbyB0aGVuIG1lbW8gPSBuZXcgTWVtRXZlbnRzKClcbiAgICBAcmF3UmVkdWNlIGNiLCBtZW1vXG5cbiAgIyAoIEV2ZW50ICkgLT4gQm9vbGVhblxuICBoYXM6ICh0YXJnZXRFdmVudCkgLT5cbiAgICByYW5nZSA9IHRhcmdldEV2ZW50LnJhbmdlIVxuICAgIEBfZmluZCAoZXZlbnQpIC0+IGV2ZW50LnBheWxvYWQgaXMgdGFyZ2V0RXZlbnQucGF5bG9hZCBhbmQgZXZlbnQucmFuZ2UhaXNTYW1lIHJhbmdlXG4gICAgICAgICAgICBcbiAgIyAoIEV2ZW50IHwgeyByYW5nZTogUmFuZ2UsIC4uLiB9ICkgLT4gRXZlbnRzXG4gIGZpbmQ6IC0+XG4gICAgbWF0Y2hlciA9IE1hdGNoZXIuYXBwbHkgQCwgcGFyc2UucGF0dGVybiBpdFxuICAgIEBfZmluZCBtYXRjaGVyXG4gICAgXG4gICMgKCB7IHJhbmdlOiBSYW5nZSwgLi4uIH0gKSAtPiBFdmVudHNcbiAgZmlsdGVyOiAoIHBhdHRlcm4gKS0+XG4gICAgbWF0Y2hlciA9IE1hdGNoZXIuYXBwbHkgQCwgcGFyc2UucGF0dGVybiBwYXR0ZXJuXG4gICAgQHJlZHVjZSAocmV0LCBldmVudCkgLT4gaWYgbWF0Y2hlciBldmVudCB0aGVuIHJldC5wdXNobSBldmVudCBlbHNlIHJldFxuICAgIFxuICBkaWZmOiAoZXZlbnRzKSAtPlxuICAgIG1ha2VEaWZmID0gKGRpZmYsIGV2ZW50KSB+PlxuICAgICAgY29sbGlzaW9ucyA9IGV2ZW50LnJlbGV2YW50RXZlbnRzIGRpZmZcbiAgICAgIGlmIG5vdCBjb2xsaXNpb25zLmxlbmd0aCB0aGVuIHJldHVybiBkaWZmXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBkaWZmLnBvcG0oY29sbGlzaW9ucykucHVzaG0gY29sbGlzaW9ucy5yZWR1Y2UgKHJlcywgY29sbGlzaW9uKSAtPlxuICAgICAgICAgIFsgcmFuZ2UsIHBheWxvYWQgXSA9IGV2ZW50LmNvbXBhcmUgY29sbGlzaW9uXG4gICAgICAgICAgXG4gICAgICAgICAgaWYgbm90IHJhbmdlIGFuZCBub3QgcGF5bG9hZCB0aGVuIHJldHVybiByZXMucHVzaG0gY29sbGlzaW9uXG4gICAgICAgICAgaWYgcGF5bG9hZCB0aGVuIHJldHVybiByZXMucHVzaG0gY29sbGlzaW9uLnN1YnRyYWN0IGV2ZW50XG4gICAgICAgICAgaWYgcmFuZ2UgdGhlbiByZXR1cm4gcmVzLnB1c2htIGNvbGxpc2lvblxuICAgICAgICAgIHJldHVybiByZXNcblxuICAgIGV2ZW50cyA9IHBhcnNlLmV2ZW50cyBldmVudHNcbiAgICBAcmVkdWNlIG1ha2VEaWZmLCBldmVudHMuY2xvbmUoKVxuXG4gICMgY29tcGxhdGVseSB0cmFuc2Zvcm1zIHRoZSBncm91cCBvZiBldmVudHMsIHJldHVybmluZyByYW5nZXMgYWRkZWQgYW5kIHJlbW92ZWQsIGFuZCBkYiBldmVudHMgdG8gZGVsZXRlIGFuZCBjcmVhdGUgdG8gYXBwbHkgdGhlIGNoYW5nZVxuICAjICggRXZlbnRzICkgLT4geyBidXN5OiBFdmVudHMsIGZyZWU6IEV2ZW50cywgY3JlYXRlOiBFdmVudHMsIHJlbW92ZTogRXZlbnRzIH1cbiAgY2hhbmdlOiAobmV3RXZlbnRzKSAtPlxuICAgIG5ld0V2ZW50cyA9IHBhcnNlLmV2ZW50cyBuZXdFdmVudHNcbiAgICBidXN5ID0gbmV3RXZlbnRzLnN1YnRyYWN0IEBcbiAgICBmcmVlID0gQHN1YnRyYWN0IG5ld0V2ZW50c1xuXG4gICAgY3JlYXRlID0gbmV3RXZlbnRzLnJlZHVjZSAoY3JlYXRlLCBldmVudCkgfj4gaWYgbm90IEBoYXMgZXZlbnQgdGhlbiBjcmVhdGUucHVzaG0gZXZlbnQgZWxzZSBjcmVhdGVcbiAgICByZW1vdmUgPSBAcmVkdWNlIChyZW1vdmUsIGV2ZW50KSAtPiBpZiBub3QgbmV3RXZlbnRzLmhhcyBldmVudCB0aGVuIHJlbW92ZS5wdXNobSBldmVudCBlbHNlIHJlbW92ZVxuICAgICAgICBcbiAgICBidXN5OiBidXN5LCBmcmVlOiBmcmVlLCBjcmVhdGU6IGNyZWF0ZSwgcmVtb3ZlOiByZW1vdmVcblxuICAjIHVwYXRlcyBldmVudHNcbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICB1cGRhdGU6IChldmVudHMpIC0+XG4gICAgQHJlZHVjZSBkb1xuICAgICAgKFsgY3JlYXRlLCByZW1vdmUgXSwgZXZlbnQpIH4+XG5cbiAgICAgICAgaWYgKHJlbGV2YW50RXZlbnRzID0gZXZlbnQucmVsZXZhbnRFdmVudHMoZXZlbnRzKSkubGVuZ3RoXG4gICAgICAgICAgcmVtb3ZlLnB1c2htIGV2ZW50XG4gICAgICAgICAgY3JlYXRlLnB1c2htIGV2ZW50LnN1YnRyYWN0IHJlbGV2YW50RXZlbnRzXG5cbiAgICAgICAgWyBjcmVhdGUsIHJlbW92ZSBdXG5cbiAgICAgIFsgZXZlbnRzLmNsb25lKCksIG5ldyBNZW1FdmVudHMoKSBdXG4gICAgICAgICAgICBcbiAgbWVyZ2U6IC0+XG4gICAgQHJlZHVjZSAocmVzLCBldmVudCkgfj5cbiAgICAgIGV2ZW50XG4gICAgICAubmVpZ2hib3VycyhAKVxuICAgICAgLm1hcCAob2xkRXZlbnQpIC0+IFxuICAgICAgICBpZiBvbGRFdmVudC5sZW5ndGggYW5kIG9sZEV2ZW50LnBheWxvYWQgaXMgb2xkRXZlbnQucGF5bG9hZCB0aGVuIG9sZEV2ZW50Lm1lcmdlIGV2ZW50XG4gICAgXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgdW5pb246IChldmVudHMpIC0+XG4gICAgcmVzID0gQGNsb25lKClcbiAgICBldmVudHMuZWFjaCB+PiByZXMucHVzaG0gaXRcbiAgICByZXNcblxuICAjICggKEV2ZW50cywgKEV2ZW50MSwgRXZlbnQyKSAtPiBFdmVudHMgKSAtPiBFdmVudHNcbiAgY29sbGlkZTogKGV2ZW50cywgY2IpIC0+XG4gICAgQHJlZHVjZSAobWVtbywgZXZlbnQpIC0+IG1lbW8ucHVzaG0gZXZlbnQuY29sbGlkZSBldmVudHMsIGNiXG5cbiAgIyAoIEV2ZW50ICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0T25lOiAoZXZlbnQpIC0+XG4gICAgQHJlZHVjZSAocmV0LCBjaGlsZCkgLT4gcmV0LnB1c2htIGNoaWxkLnN1YnRyYWN0IGV2ZW50XG5cbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE1hbnk6IChldmVudHMpIC0+XG4gICAgQHJlZHVjZSAocmV0LCBjaGlsZCkgLT4gcmV0LnB1c2htIGNoaWxkLnN1YnRyYWN0TWFueSBldmVudHNcblxuICBcbiMgKiBNZW1FdmVudHNcbiMgSW4gbWVtb3J5IEV2ZW50IGNvbGxlY3Rpb24gaW1wbGVtZW50YXRpb24sXG4jIHRoaXMgaXMgYSB2ZXJ5IG5haXZlIGltcGxlbWVudGF0aW9uXG4jIFxuIyBJIGd1ZXNzIHdlIHNob3VsZCB1c2UgcmFuZ2UgdHJlZSBkYXRhIHN0cnVjdHVyZSBvciBzb21ldGhpbmcgc21hcnQgbGlrZSB0aGF0IGZvciBmYXN0IHJhbmdlIHNlYXJjaCBpbiB0aGUgZnV0dXJlLlxuIyBpdHMgZ29vZCBlbm91Z2ggZm9yIG5vdyBldmVuIGlmIHdlIGVuZCB1cCBxdWFkcmF0aWMgY29tcGxleGl0eSBmb3IgYWxnb3MsIHdlIGFyZSBub3QgcGFyc2luZyBtYW55IGV2ZW50cyBwZXIgcHJvcGVydHkuXG4jIFxuTWVtRXZlbnRzID0gZXhwb3J0cy5NZW1FdmVudHMgPSBjbGFzcyBNZW1FdmVudHNOYWl2ZSBleHRlbmRzIEV2ZW50c1xuICAtPlxuICAgIGFzc2lnbiBALCBkb1xuICAgICAgZXZlbnRzOiAge31cbiAgICAgIGxlbmd0aDogMFxuICAgICAgdHlwZToge31cbiAgICBzdXBlciAuLi5cbiAgXG4gIHdpdGhvdXQ6IChldmVudCkgLT4gbmV3IE1lbUV2ZW50cyBmaWx0ZXIgKHZhbHVlcyBAZXZlbnRzKSwgLT4gaXQuaWQgaXNudCBldmVudC5pZFxuICAgIFxuICB0b0FycmF5OiAtPiB2YWx1ZXMgQGV2ZW50c1xuXG4gIGVhY2g6IChjYikgLT4gZWFjaCBAZXZlbnRzLCBjYlxuICBcbiAgX2ZpbmQ6IChjYikgLT4gZmluZCBAZXZlbnRzLCBjYlxuXG4gIGNsb25lOiAocmFuZ2UpIC0+IG5ldyBNZW1FdmVudHMgdmFsdWVzIEBldmVudHNcblxuICBwb3BtOiAoLi4uZXZlbnRzKSAtPiBcbiAgICBlYWNoIHBhcnNlLmV2ZW50QXJyYXkoZXZlbnRzKSwgKGV2ZW50KSB+PlxuICAgICAgaWYgbm90IGV2ZW50IHRoZW4gcmV0dXJuXG4gICAgICBpZiBub3QgQGV2ZW50c1tldmVudC5pZF0/IHRoZW4gcmV0dXJuXG4gICAgICBlbHNlXG4gICAgICAgIGRlbGV0ZSBAZXZlbnRzW2V2ZW50LmlkXVxuICAgICAgICBAbGVuZ3RoLS1cbiAgICBAXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVzaG06ICguLi5ldmVudHMpIC0+XG4gICAgZWFjaCBwYXJzZS5ldmVudEFycmF5KGV2ZW50cyksIChldmVudCkgfj5cbiAgICAgIGlmIG5vdCBldmVudCB0aGVuIHJldHVyblxuICAgICAgaWYgQGV2ZW50c1tldmVudC5pZF0/IHRoZW4gcmV0dXJuXG4gICAgICBAZXZlbnRzW2V2ZW50LmlkXSA9IGV2ZW50XG4gICAgICBAdHlwZVtldmVudC50eXBlXSA9IHRydWVcblxuXG4gICAgICBpZiBldmVudC5zdGFydCA8IEBzdGFydCBvciBub3QgQHN0YXJ0IHRoZW4gQHN0YXJ0ID0gZXZlbnQuc3RhcnRcbiAgICAgIGlmIGV2ZW50LmVuZCA8IEBlbmQgb3Igbm90IEBlbmQgdGhlbiBAZW5kID0gZXZlbnQuZW5kXG4gICAgICBcbiAgICAgIEBsZW5ndGgrK1xuICAgIEBcbiAgXG4iXX0=

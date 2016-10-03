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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9jb3JlL25vZGVfbW9kdWxlcy90aW1lRXZlbnRzL2luZGV4LmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBR1ksQ0FBVixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQTtFQUNBLElBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQVksQ0FBWixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVksQ0FBWixFQUFlLElBQWYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFlLElBQWYsRUFBcUIsSUFBckIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFxQixJQUFyQixFQUEyQixNQUEzQixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTJCLE1BQTNCLEVBQW1DLElBQW5DLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbUMsSUFBbkMsRUFBeUMsSUFBekMsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF5QyxJQUF6QyxFQUErQyxNQUEvQyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStDLE1BQS9DLEVBQXVELEdBQXZELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdUQsR0FBdkQsRUFBNEQsTUFBNUQsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE0RCxNQUE1RCxFQUFvRSxJQUFwRSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW9FLElBQXBFLEVBQTBFLE1BQTFFLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEUsTUFBMUUsRUFBa0YsV0FBbEYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFrRixXQUFsRixFQUErRixJQUEvRixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStGLElBQS9GLEVBQXFHLEdBQXJHLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcUcsR0FBckcsRUFBMEcsU0FBMUcsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEwRyxTQUExRyxFQUFxSCxJQUFySCxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXFIO0VBQ3JILE1BQUEsQ0FBQSxDQUFB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V0w7OztJQXZDaUQiLCJzb3VyY2VzQ29udGVudCI6WyIjIGF1dG9jb21waWxlXG4jICogcmVxdWlyZVxucmVxdWlyZSEge1xuICBibHVlYmlyZDogcFxuICBsZXNoZGFzaDogeyB3LCBmaW5kLCBvbWl0LCBmaWx0ZXIsIHBpY2ssIGtleXMsIHZhbHVlcywgcG9wLCBhc3NpZ24sIGVhY2gsIHJlZHVjZSwgZmxhdHRlbkRlZXAsIHB1c2gsIG1hcCwgbWFwVmFsdWVzLCBvbWl0IH0gIFxuICBtb21lbnRcbiAgJ21vbWVudC1yYW5nZSdcbn1cblxuIyAqIFR5cGUgY29lcmNpb24gZnVuY3Rpb25zIGZvciBhIG1vcmUgY2hpbGxlZCBvdXQgQVBJXG5mb3JtYXQgPSBleHBvcnRzLmZvcm1hdCA9IC0+IGl0LmZvcm1hdCAnWVlZWS1NTS1ERCdcblxucGFyc2UgPSBleHBvcnRzLnBhcnNlID0gbWFwVmFsdWVzIGRvXG4gIHBhdHRlcm46IC0+XG4gICAgfCBpdD9pc0V2ZW50PyA9PiBbIGl0LnJhbmdlISwgcGF5bG9hZDogaXQucGF5bG9hZCBdXG4gICAgfCBpdD9AQCBpcyBPYmplY3QgYW5kIGl0LnJhbmdlPyA9PiBbIHBhcnNlLnJhbmdlKGl0LnJhbmdlKSwgb21pdChpdCwgJ3JhbmdlJykgXVxuICAgIHwgaXQ/QEAgaXMgT2JqZWN0ID0+IFsgZmFsc2UsIGl0IF1cbiAgICB8IG90aGVyd2lzZSA9PiB0aHJvdyBuZXcgRXJyb3IgXCJpbnZhbGlkIHR5cGUgZm9yIHBhdGVybiAje2l0P3RvU3RyaW5nPyF9ICN7aXQ/QEB9XCJcbiAgICBcbiAgIyAoYW55KSAtPiBFdmVudCB8IEVycm9yXG4gIGV2ZW50OiAtPlxuICAgIGlmIGl0P2lzRXZlbnQ/IHRoZW4gcmV0dXJuIGl0XG4gICAgc3dpdGNoIGl0P0BAXG4gICAgICB8IE9iamVjdCA9PiBuZXcgRXZlbnQgaXRcbiAgICAgIHwgb3RoZXJ3aXNlID0+XG4gICAgICAgIGNvbnNvbGUubG9nIGl0XG4gICAgICAgIGNvbnNvbGUubG9nIFN0cmluZyBpdFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbnZhbGlkIHR5cGUgZm9yIGV2ZW50ICN7aXQ/dG9TdHJpbmc/IX0gI3tpdD9AQH1cIlxuXG4gICMgKGFueSkgLT4gTWVtRXZlbnRzIHwgRXJyb3JcbiAgZXZlbnRzOiAtPlxuICAgIGlmIGl0P2lzRXZlbnRzPyB0aGVuIHJldHVybiBpdFxuICAgICAgXG4gICAgc3dpdGNoIGl0P0BAXG4gICAgICB8IEFycmF5ID0+IG5ldyBNZW1FdmVudHMgaXRcbiAgICAgIHwgb3RoZXJ3aXNlID0+IG5ldyBNZW1FdmVudHMgcGFyc2UuZXZlbnQgaXRcblxuICAjIChBbnkpIC0+IEFycmF5PEV2ZW50PiB8IEVycm9yXG4gIGV2ZW50QXJyYXk6IC0+XG4gICAgZmxhdHRlbkRlZXAgc3dpdGNoIGl0P0BAXG4gICAgICB8IEFycmF5ID0+IG1hcCBpdCwgcGFyc2UuZXZlbnRBcnJheVxuICAgICAgfCBNZW1FdmVudHMgPT4gaXQudG9BcnJheSgpXG4gICAgICB8IG90aGVyd2lzZSA9PiBbIHBhcnNlLmV2ZW50IGl0IF1cbiAgICAgICAgXG4gICMgKCBFdmVudHMgfCBFdmVudCB8IHZvaWQgKSAtPiBSYW5nZVxuICByYW5nZTogKHNvbWV0aGluZywgZGVmKSAtPlxuICAgIHN3aXRjaCBzb21ldGhpbmc/QEBcbiAgICAgIHwgZmFsc2UgPT4gZGVmIG9yIHZvaWRcbiAgICAgIHwgT2JqZWN0ID0+IG1vbWVudC5yYW5nZSBzb21ldGhpbmdcbiAgICAgIHwgQXJyYXkgPT4gbW9tZW50LnJhbmdlIHNvbWV0aGluZ1xuICAgICAgfCBFdmVudCA9PiBzb21ldGhpbmcucmFuZ2UhXG4gICAgICB8IE1lbUV2ZW50cyA9PiBzb21ldGhpbmcucmFuZ2UhXG4gICAgICB8IG90aGVyd2lzZSA9PiBzb21ldGhpbmcucmFuZ2U/ISBvciBzb21ldGhpbmdcblxuICAgIFxuIyAoIEV2ZW50cyB8IEFycmF5PEV2ZW50PiB8IEV2ZW50IHwgdm9pZCApIC0+IEFycmF5PEV2ZW50PlxuICBldmVudENvbGxlY3Rpb246IChzb21ldGhpbmcpIC0+XG4gICAgc3dpdGNoIHNvbWV0aGluZz9AQFxuICAgICAgfCB2b2lkID0+IFtdXG4gICAgICB8IEV2ZW50ID0+IFsgRXZlbnQgXVxuICAgICAgfCBFdmVudHMgPT4gRXZlbnRzLnRvQXJyYXkoKVxuICAgICAgfCBBcnJheSA9PiBmbGF0dGVuRGVlcCBzb21ldGhpbmdcbiAgICAgIHwgb3RoZXJ3aXNlID0+IHRocm93ICd3aGF0IGlzIHRoaXMnXG5cbiAgKCBmLCBuYW1lICkgLT4gLT4gZiBpZiBpdD9AQCBpcyBGdW5jdGlvbiB0aGVuIGl0ISBlbHNlIGl0XG4gICAgXG5cbk1hdGNoZXIgPSAocmFuZ2UsIHBhdHRlcm4sIGV2ZW50KSAtLT5cbiAgXG4gIGNoZWNrUmFuZ2UgPSAoZXZlbnQpIC0+XG4gICAgaWYgcmFuZ2UgdGhlbiByZXR1cm4gcmFuZ2UuY29udGFpbnMgZXZlbnQuc3RhcnQuY2xvbmUoKS5hZGQoMSkgb3IgcmFuZ2UuY29udGFpbnMgZXZlbnQuZW5kLmNsb25lKCkuc3VidHJhY3QoMSkgb3IgZXZlbnQucmFuZ2UhLmNvbnRhaW5zIHJhbmdlXG4gICAgZWxzZSByZXR1cm4gdHJ1ZVxuXG4gIGNoZWNrUmFuZ2VTdHJpY3QgPSAoZXZlbnQpIC0+IHJhbmdlLmlzRXF1YWwgZXZlbnQucmFuZ2UhXG5cbiAgY2hlY2tQYXR0ZXJuID0gKGV2ZW50KSAtPlxuICAgIG5vdCBmaW5kIHBhdHRlcm4sICh2YWx1ZSwga2V5KSAtPlxuICAgICAgc3dpdGNoIHZhbHVlP0BAXG4gICAgICAgIHwgdW5kZWZpbmVkID0+IHJldHVybiB0cnVlXG4gICAgICAgIFxuICAgICAgICB8IEJvb2xlYW4gPT5cbiAgICAgICAgICBpZiB2YWx1ZSBpcyB0cnVlIHRoZW4gcmV0dXJuIG5vdCBldmVudFtrZXldP1xuICAgICAgICAgIGVsc2UgcmV0dXJuIGV2ZW50W2tleV0/XG4gICAgICAgICAgXG4gICAgICAgIHwgRnVuY3Rpb24gPT4gbm90IHZhbHVlIGV2ZW50W2tleV1cblxuICAgICAgICB8IG90aGVyd2lzZSA9PlxuICAgICAgICAgIGlmIG1vbWVudC5pc01vbWVudCB2YWx1ZSB0aGVuIG5vdCB2YWx1ZS5pc1NhbWUgZXZlbnRba2V5XVxuICAgICAgICAgIGVsc2UgaWYgZXZlbnRba2V5XSBpcyB2YWx1ZSB0aGVuIHJldHVybiBmYWxzZSBlbHNlIHJldHVybiB0cnVlXG4gICBcblxuICBjaGVja1JhbmdlKGV2ZW50KSBhbmQgY2hlY2tQYXR0ZXJuKGV2ZW50KVxuXG5cbiMgKiBFdmVudExpa2VcbiMgbW9yZSBvZiBhIHNwZWMgdGhlbiBhbnl0aGluZywgdGhpcyBpcyBpbXBsZW1lbnRlZCBieSBFdmVudCAmIEV2ZW50c1xuXG5FdmVudExpa2UgPSBleHBvcnRzLkV2ZW50TGlrZSA9IGNsYXNzIEV2ZW50TGlrZVxuXG4gICMgZmV0Y2hlcyBhbGwgZXZlbnRzIGZyb20gYSBjb2xsZWN0aW9uIHJlbGV2YW50IHRvIGN1cnJlbnQgZXZlbnQgKGJ5IHR5cGUgYW5kIHJhbmdlKVxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHJlbGV2YW50RXZlbnRzOiAoZXZlbnRzKSAtPlxuICAgIHBhcnNlLmV2ZW50cyBldmVudHNcbiAgICAuZmlsdGVyIHJhbmdlOiBAcmFuZ2UoKSwgdHlwZTogQHR5cGVcblxuICBuZWlnaGJvdXJzOiAoZXZlbnRzKSAtPlxuICAgIFtcbiAgICAgIGV2ZW50cy5maWx0ZXIgZW5kOiBAc3RhcnQuY2xvbmUoKVxuICAgICAgZXZlbnRzLmZpbHRlciBzdGFydDogQGVuZC5jbG9uZSgpXG4gICAgXVxuXG4gICMgZ2V0IG9yIHNldCByYW5nZVxuICAjIChyYW5nZT8pIC0+IG1vbWVudC5yYW5nZVxuICByYW5nZTogKHNldFJhbmdlKSAtPlxuICAgIGlmIHJhbmdlID0gc2V0UmFuZ2VcbiAgICAgIEBzdGFydCA9IHJhbmdlLnN0YXJ0LmNsb25lKClcbiAgICAgIEBlbmQgPSByYW5nZS5lbmQuY2xvbmUoKVxuICAgIGVsc2VcbiAgICAgIHJhbmdlID0gbmV3IG1vbWVudC5yYW5nZSBAc3RhcnQsIEBlbmRcbiAgICAgIFxuICAgIHJhbmdlXG5cbiAgIyAoIEV2ZW50TGlrZSApIC0+IEV2ZW50c1xuICBwdXNoOiAoZXZlbnQpIC0+IC4uLlxuICAgIFxuICAjICggRXZlbnRMaWtlICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0OiAoc29tZXRoaW5nKSAtPlxuICAgIGlmIHNvbWV0aGluZyBpbnN0YW5jZW9mIEV2ZW50cyB0aGVuIEBzdWJ0cmFjdE1hbnkgc29tZXRoaW5nXG4gICAgZWxzZSBAc3VidHJhY3RPbmUgc29tZXRoaW5nXG4gICAgXG4gICMgKCBFdmVudExpa2UsIChFdmVudCwgRXZlbnQpIC0+IEV2ZW50cykgLT4gRXZlbnRzXG4gIGNvbGxpZGU6IChldmVudHMsIGNiKSAtPiAuLi5cblxuICBlYWNoOiAtPiAuLi5cblxuICBzdWJ0cmFjdE1hbnk6IC0+IC4uLlxuXG4gIHN1YnRyYWN0T25lOiAtPiAuLi5cblxuIyAqIEV2ZW50XG4jIHJlcHJlc2VudHMgc29tZSBldmVudCBpbiB0aW1lLCBkZWZpbmVkIGJ5IHN0YXJ0IGFuZCBlbmQgdGltZXN0YW1wc1xuIyBjYXJpZXMgc29tZSBwYXlsb2FkLCBsaWtlIGEgcHJpY2Ugb3IgYSBib29raW5nXG5cbnBhcnNlSW5pdCA9IChkYXRhKSAtPlxuICBpZiBub3QgZGF0YSB0aGVuIHJldHVybiB7fVxuICBpZiBkYXRhLmNlbnRlciB0aGVuIHJldHVybiB7IHN0YXJ0OiBkYXRhLnN0YXJ0LCBlbmQ6IGRhdGEuZW5kIH1cbiAgaWYgZGF0YS5yYW5nZVxuICAgIGRhdGEuc3RhcnQgPSBkYXRhLnJhbmdlLnN0YXJ0XG4gICAgZGF0YS5lbmQgPSBkYXRhLnJhbmdlLmVuZFxuICAgIGRlbGV0ZSBkYXRhLnJhbmdlXG5cbiAgaWYgZGF0YS5zdGFydD9AQCBpbiBbIFN0cmluZywgRGF0ZSBdIHRoZW4gZGF0YS5zdGFydCA9IG1vbWVudCBkYXRhLnN0YXJ0XG4gIGlmIGRhdGEuZW5kP0BAIGluIFsgU3RyaW5nLCBEYXRlIF0gdGhlbiBkYXRhLmVuZCA9IG1vbWVudCBkYXRhLmVuZFxuICAgIFxuICBpZiBkYXRhQEAgaXNudCBPYmplY3QgdGhlbiByZXR1cm4gXCJ3dXQgd3V0XCJcbiAgZWxzZSByZXR1cm4gZGF0YVxuXG5FdmVudCA9IGV4cG9ydHMuRXZlbnQgPSBjbGFzcyBFdmVudCBleHRlbmRzIEV2ZW50TGlrZVxuICBpc0V2ZW50OiB0cnVlXG4gIFxuICAoaW5pdCkgLT4gYXNzaWduIEAsIHBhcnNlSW5pdCBpbml0XG5cbiAgY29tcGFyZTogKGV2ZW50KSAtPlxuICAgIFsgQGlzU2FtZVJhbmdlKGV2ZW50KSwgQGlzU2FtZVBheWxvYWQoZXZlbnQpIF1cblxuICBpc1NhbWU6IChldmVudCkgLT5cbiAgICBAaXNTYW1lUmFuZ2UoZXZlbnQpIGFuZCBAaXNTYW1lUGF5bG9hZChldmVudClcblxuICBpc1NhbWVSYW5nZTogKGV2ZW50KSAtPlxuICAgIGV2ZW50ID0gcGFyc2UuZXZlbnQgZXZlbnRcbiAgICBAcmFuZ2UhLmlzU2FtZSBldmVudC5yYW5nZSFcbiAgICBcbiAgaXNTYW1lUGF5bG9hZDogKGV2ZW50KSAtPlxuICAgIGV2ZW50ID0gcGFyc2UuZXZlbnQgZXZlbnRcbiAgICAoQHR5cGUgaXMgZXZlbnQudHlwZSkgYW5kIChAcGF5bG9hZCBpcyBldmVudC5wYXlsb2FkKVxuICBcbiAgY2xvbmU6IChkYXRhPXt9KSAtPlxuICAgIHJldCA9IG5ldyBFdmVudCBhc3NpZ24ge30sIEAsIHsgaWQ6IEBpZCArICctY2xvbmUnfSwgZGF0YVxuICAgIGRlbGV0ZSByZXQucmVwclxuICAgIHJldFxuXG4gICMgKCkgLT4gSnNvblxuICBzZXJpYWxpemU6IC0+XG4gICAgcGljayhALCA8W3R5cGUgcGF5bG9hZCBpZCB0YWdzXT4pIDw8PCBtYXBWYWx1ZXMgKHBpY2sgQCwgPFsgc3RhcnQgZW5kIF0+KSwgKHZhbHVlKSAtPiB2YWx1ZS5mb3JtYXQgXCJZWVlZLU1NLUREIEhIOm1tOnNzXCJcblxuICAjICgpIC0+IFN0cmluZ1xuICB0b1N0cmluZzogLT5cbiAgICBzdGFydCA9IGZvcm1hdCBAc3RhcnRcbiAgICBlbmQgPSBmb3JtYXQgQGVuZFxuICAgIGlmIEBwcmljZSB0aGVuIFwiUHJpY2UoXCIgKyBAcHJpY2UgKyBcIiBcIiArIHN0YXJ0ICsgXCIpXCJcbiAgICBlbHNlIFwiRXZlbnQoXCIgKyAoQGlkIG9yIFwidW5zYXZlZC1cIiArIEB0eXBlKSAgKyBcIilcIlxuICAgIFxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0TWFueTogKGV2ZW50cykgLT5cbiAgICBAcmVsZXZhbnRFdmVudHMgZXZlbnRzXG4gICAgLnJlZHVjZSBkb1xuICAgICAgKHJlcywgZXZlbnQpIH4+IHJlcy5zdWJ0cmFjdE9uZSBldmVudFxuICAgICAgbmV3IE1lbUV2ZW50cyBAXG4gICAgICBcbiAgIyAoIEV2ZW50ICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0T25lOiAoZXZlbnQpIC0+XG4gICAgY250ID0gMFxuICAgIG5ldyBNZW1FdmVudHMgbWFwIGRvXG4gICAgICBAcmFuZ2UoKS5zdWJ0cmFjdCBldmVudC5yYW5nZSgpXG4gICAgICB+PiBAY2xvbmUgeyBzdGFydDogaXQuc3RhcnQsIGVuZDogaXQuZW5kLCBpZDogQGlkICsgJy0nICsgY250KysgfSAjIGdldCByaWQgb2YgcG90ZW50aWFsIG9sZCByZXByLCB0aGlzIGlzIGEgbmV3IGV2ZW50XG5cbiAgIyAoIEV2ZW50cywgKEV2ZW50LCBFdmVudCkgLT4gRXZlbnRzICkgLT4gRXZlbnRzXG4gIGNvbGxpZGU6IChldmVudHMsIGNiKSAtPlxuICAgIEByZWxldmFudEV2ZW50cyBldmVudHNcbiAgICAucmVkdWNlIChldmVudHMsIGV2ZW50KSB+PiBldmVudHMucHVzaG0gY2IgZXZlbnQsIEBcblxuICBlYWNoOiAoY2IpIC0+IGNiIEBcbiAgICBcbiAgbWVyZ2U6IChldmVudCkgLT5cbiAgICBuZXdTZWxmID0gQGNsb25lKClcbiAgICBpZiBldmVudC5zdGFydCA8IG5ld1NlbGYuc3RhcnQgdGhlbiBuZXdTZWxmLnN0YXJ0ID0gZXZlbnQuc3RhcnRcbiAgICBpZiBldmVudC5lbmQgPiBuZXdTZWxmLmVuZCB0aGVuIG5ld1NlbGYuZW5kID0gZXZlbnQuZW5kXG4gICAgbmV3U2VsZlxuICAgIFxuXG5QZXJzaXN0TGF5ZXIgPSBleHBvcnRzLlBlcnNpc3RMYXllciA9IGNsYXNzXG4gIG1hcmtSZW1vdmU6IC0+IEB0b1JlbW92ZSA9IHRydWVcbiAgXG4gIHNhdmU6IC0+IG5ldyBwIChyZXNvbHZlLHJlamVjdCkgfj5cbiAgICBpZiBAdG9SZW1vdmUgdGhlbiByZXNvbHZlIEByZW1vdmUhXG4gICAgZWxzZSAuLi5cbiAgICAgIFxuICByZW1vdmU6IC0+IG5ldyBwIChyZXNvbHZlLHJlamVjdCkgfj4gLi4uXG5cbiMgKiBFdmVudHNcbiMgYWJzdHJhY3QgZXZlbnQgY29sbGVjdGlvblxuIyBzdXBwb3J0aW5nIGNvbW1vbiBzZXQgb3BlcmF0aW9ucyxcbiMgYW5kIHNvbWUgdW5jb21tb24gb3BlcmF0aW9ucyByZWxhdGVkIHRvIHRpbWUgKGNvbGxpZGUsIHN1YnRyYWN0KVxuIFxuRXZlbnRzID0gZXhwb3J0cy5FdmVudHMgPSBjbGFzcyBFdmVudHMgZXh0ZW5kcyBFdmVudExpa2VcbiAgKC4uLmV2ZW50cykgLT4gQHB1c2htLmFwcGx5IEAsIGV2ZW50c1xuXG4gICMgcGVyIGRheSBkYXRhIChhaXJibmIgYXBpIGhlbHBlcilcbiAgZGF5czogKGNiKSAtPiBAZWFjaCAoZXZlbnQpIC0+IGV2ZW50LnJhbmdlIWJ5ICdkYXlzJywgfj4gY2IgaXQsIGV2ZW50XG5cbiAgaXNFdmVudHM6IHRydWVcblxuICAjICggTW9tZW50UmFuZ2UsIE9iamVjdCApIC0+IEV2ZW50c1xuICBmaW5kOiAocmFuZ2UsIHBhdHRlcm4pIC0+IC4uLlxuICAgIFxuICAjICggcmFuZ2VFcXVpdmFsZW50ICkgLT4gRXZlbnRzXG4jICBjbG9uZTogKHJhbmdlRXF1aXZhbGVudCkgfj4gLi4uXG5cbiAgIyAoIEV2ZW50Q29sbGVjdGlvbikgLT4gRXZlbnRzXG4gIHB1c2htOiAoZXZlbnRDb2xsZWN0aW9uKSAtPiAuLi5cblxuICAjICggRXZlbnRDb2xsZWN0aW9uKSAtPiBFdmVudHNcbiAgcHVzaDogKGV2ZW50Q29sbGVjdGlvbikgLT4gQGNsb25lIGV2ZW50Q29sbGVjdGlvblxuXG4gICMgKCkgLT4gRXZlbnRzXG4gIHdpdGhvdXQ6IC0+ICAuLi5cblxuICAjICggRnVuY3Rpb24gKSAtPiB2b2lkXG4gIGVhY2g6IChjYikgLT4gLi4uXG5cbiAgIyAoKSAtPiBTdHJpbmdcbiAgdG9TdHJpbmc6IC0+IFwiRVsje0BsZW5ndGh9XSA8IFwiICsgKEBtYXAgKGV2ZW50KSAtPiBcIlwiICsgZXZlbnQpLmpvaW4oXCIsIFwiKSArIFwiID5cIlxuXG4gICMgKCkgLT4gSnNvblxuICBzZXJpYWxpemU6IC0+IEBtYXAgKC5zZXJpYWxpemUhKVxuXG4gICMgKCkgLT4gQXJyYXk8RXZlbnQ+XG4gIHRvQXJyYXk6IC0+XG4gICAgcmV0ID0gW11cbiAgICBAZWFjaCAtPiByZXQucHVzaCBpdFxuICAgIHJldFxuXG4gICMgKCAoRXZlbnQpIC0+IGFueSkgKSAtPiBBcnJheTxhbnk+XG4gIG1hcDogKGNiKSAtPlxuICAgIHJldCA9IFtdXG4gICAgQGVhY2ggKGV2ZW50KSAtPiByZXQucHVzaCBjYiBldmVudFxuICAgIHJldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICMgKCAoRXZlbnRzLCBFdmVudCkgLT4gRXZlbnRzICkgLT4gQXJyYXk8YW55PlxuICByYXdSZWR1Y2U6IChjYiwgbWVtbykgLT5cbiAgICBAZWFjaCAoZXZlbnQpIC0+IG1lbW8gOj0gY2IgbWVtbywgZXZlbnRcbiAgICBtZW1vXG4gICAgXG4gICMgKCAoRXZlbnRzLCBFdmVudCkgLT4gRXZlbnRzICkgLT4gRXZlbnRzXG4gIHJlZHVjZTogKGNiLCBtZW1vKSAtPlxuICAgIGlmIG5vdCBtZW1vIHRoZW4gbWVtbyA9IG5ldyBNZW1FdmVudHMoKVxuICAgIEByYXdSZWR1Y2UgY2IsIG1lbW9cblxuICAjICggRXZlbnQgKSAtPiBCb29sZWFuXG4gIGhhczogKHRhcmdldEV2ZW50KSAtPlxuICAgIHJhbmdlID0gdGFyZ2V0RXZlbnQucmFuZ2UhXG4gICAgQF9maW5kIChldmVudCkgLT4gZXZlbnQucGF5bG9hZCBpcyB0YXJnZXRFdmVudC5wYXlsb2FkIGFuZCBldmVudC5yYW5nZSFpc1NhbWUgcmFuZ2VcbiAgICAgICAgICAgIFxuICAjICggRXZlbnQgfCB7IHJhbmdlOiBSYW5nZSwgLi4uIH0gKSAtPiBFdmVudHNcbiAgZmluZDogLT5cbiAgICBtYXRjaGVyID0gTWF0Y2hlci5hcHBseSBALCBwYXJzZS5wYXR0ZXJuIGl0XG4gICAgQF9maW5kIG1hdGNoZXJcbiAgICBcbiAgIyAoIHsgcmFuZ2U6IFJhbmdlLCAuLi4gfSApIC0+IEV2ZW50c1xuICBmaWx0ZXI6ICggcGF0dGVybiApLT5cbiAgICBtYXRjaGVyID0gTWF0Y2hlci5hcHBseSBALCBwYXJzZS5wYXR0ZXJuIHBhdHRlcm5cbiAgICBAcmVkdWNlIChyZXQsIGV2ZW50KSAtPiBpZiBtYXRjaGVyIGV2ZW50IHRoZW4gcmV0LnB1c2htIGV2ZW50IGVsc2UgcmV0XG4gICAgXG4gIGRpZmY6IChldmVudHMpIC0+XG4gICAgbWFrZURpZmYgPSAoZGlmZiwgZXZlbnQpIH4+XG4gICAgICBjb2xsaXNpb25zID0gZXZlbnQucmVsZXZhbnRFdmVudHMgZGlmZlxuICAgICAgaWYgbm90IGNvbGxpc2lvbnMubGVuZ3RoIHRoZW4gcmV0dXJuIGRpZmZcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGRpZmYucG9wbShjb2xsaXNpb25zKS5wdXNobSBjb2xsaXNpb25zLnJlZHVjZSAocmVzLCBjb2xsaXNpb24pIC0+XG4gICAgICAgICAgWyByYW5nZSwgcGF5bG9hZCBdID0gZXZlbnQuY29tcGFyZSBjb2xsaXNpb25cbiAgICAgICAgICBcbiAgICAgICAgICBpZiBub3QgcmFuZ2UgYW5kIG5vdCBwYXlsb2FkIHRoZW4gcmV0dXJuIHJlcy5wdXNobSBjb2xsaXNpb25cbiAgICAgICAgICBpZiBwYXlsb2FkIHRoZW4gcmV0dXJuIHJlcy5wdXNobSBjb2xsaXNpb24uc3VidHJhY3QgZXZlbnRcbiAgICAgICAgICBpZiByYW5nZSB0aGVuIHJldHVybiByZXMucHVzaG0gY29sbGlzaW9uXG4gICAgICAgICAgcmV0dXJuIHJlc1xuXG4gICAgZXZlbnRzID0gcGFyc2UuZXZlbnRzIGV2ZW50c1xuICAgIEByZWR1Y2UgbWFrZURpZmYsIGV2ZW50cy5jbG9uZSgpXG5cbiAgIyBjb21wbGF0ZWx5IHRyYW5zZm9ybXMgdGhlIGdyb3VwIG9mIGV2ZW50cywgcmV0dXJuaW5nIHJhbmdlcyBhZGRlZCBhbmQgcmVtb3ZlZCwgYW5kIGRiIGV2ZW50cyB0byBkZWxldGUgYW5kIGNyZWF0ZSB0byBhcHBseSB0aGUgY2hhbmdlXG4gICMgKCBFdmVudHMgKSAtPiB7IGJ1c3k6IEV2ZW50cywgZnJlZTogRXZlbnRzLCBjcmVhdGU6IEV2ZW50cywgcmVtb3ZlOiBFdmVudHMgfVxuICBjaGFuZ2U6IChuZXdFdmVudHMpIC0+XG4gICAgbmV3RXZlbnRzID0gcGFyc2UuZXZlbnRzIG5ld0V2ZW50c1xuICAgIGJ1c3kgPSBuZXdFdmVudHMuc3VidHJhY3QgQFxuICAgIGZyZWUgPSBAc3VidHJhY3QgbmV3RXZlbnRzXG5cbiAgICBjcmVhdGUgPSBuZXdFdmVudHMucmVkdWNlIChjcmVhdGUsIGV2ZW50KSB+PiBpZiBub3QgQGhhcyBldmVudCB0aGVuIGNyZWF0ZS5wdXNobSBldmVudCBlbHNlIGNyZWF0ZVxuICAgIHJlbW92ZSA9IEByZWR1Y2UgKHJlbW92ZSwgZXZlbnQpIC0+IGlmIG5vdCBuZXdFdmVudHMuaGFzIGV2ZW50IHRoZW4gcmVtb3ZlLnB1c2htIGV2ZW50IGVsc2UgcmVtb3ZlXG4gICAgICAgIFxuICAgIGJ1c3k6IGJ1c3ksIGZyZWU6IGZyZWUsIGNyZWF0ZTogY3JlYXRlLCByZW1vdmU6IHJlbW92ZVxuXG4gICMgdXBhdGVzIGV2ZW50c1xuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHVwZGF0ZTogKGV2ZW50cykgLT5cbiAgICBAcmVkdWNlIGRvXG4gICAgICAoWyBjcmVhdGUsIHJlbW92ZSBdLCBldmVudCkgfj5cblxuICAgICAgICBpZiAocmVsZXZhbnRFdmVudHMgPSBldmVudC5yZWxldmFudEV2ZW50cyhldmVudHMpKS5sZW5ndGhcbiAgICAgICAgICByZW1vdmUucHVzaG0gZXZlbnRcbiAgICAgICAgICBjcmVhdGUucHVzaG0gZXZlbnQuc3VidHJhY3QgcmVsZXZhbnRFdmVudHNcblxuICAgICAgICBbIGNyZWF0ZSwgcmVtb3ZlIF1cblxuICAgICAgWyBldmVudHMuY2xvbmUoKSwgbmV3IE1lbUV2ZW50cygpIF1cbiAgICAgICAgICAgIFxuICBtZXJnZTogLT5cbiAgICBAcmVkdWNlIChyZXMsIGV2ZW50KSB+PlxuICAgICAgZXZlbnRcbiAgICAgIC5uZWlnaGJvdXJzKEApXG4gICAgICAubWFwIChvbGRFdmVudCkgLT4gXG4gICAgICAgIGlmIG9sZEV2ZW50Lmxlbmd0aCBhbmQgb2xkRXZlbnQucGF5bG9hZCBpcyBvbGRFdmVudC5wYXlsb2FkIHRoZW4gb2xkRXZlbnQubWVyZ2UgZXZlbnRcbiAgICBcbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICB1bmlvbjogKGV2ZW50cykgLT5cbiAgICByZXMgPSBAY2xvbmUoKVxuICAgIGV2ZW50cy5lYWNoIH4+IHJlcy5wdXNobSBpdFxuICAgIHJlc1xuXG4gICMgKCAoRXZlbnRzLCAoRXZlbnQxLCBFdmVudDIpIC0+IEV2ZW50cyApIC0+IEV2ZW50c1xuICBjb2xsaWRlOiAoZXZlbnRzLCBjYikgLT5cbiAgICBAcmVkdWNlIChtZW1vLCBldmVudCkgLT4gbWVtby5wdXNobSBldmVudC5jb2xsaWRlIGV2ZW50cywgY2JcblxuICAjICggRXZlbnQgKSAtPiBFdmVudHNcbiAgc3VidHJhY3RPbmU6IChldmVudCkgLT5cbiAgICBAcmVkdWNlIChyZXQsIGNoaWxkKSAtPiByZXQucHVzaG0gY2hpbGQuc3VidHJhY3QgZXZlbnRcblxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0TWFueTogKGV2ZW50cykgLT5cbiAgICBAcmVkdWNlIChyZXQsIGNoaWxkKSAtPiByZXQucHVzaG0gY2hpbGQuc3VidHJhY3RNYW55IGV2ZW50c1xuXG4gIFxuIyAqIE1lbUV2ZW50c1xuIyBJbiBtZW1vcnkgRXZlbnQgY29sbGVjdGlvbiBpbXBsZW1lbnRhdGlvbixcbiMgdGhpcyBpcyBhIHZlcnkgbmFpdmUgaW1wbGVtZW50YXRpb25cbiMgXG4jIEkgZ3Vlc3Mgd2Ugc2hvdWxkIHVzZSByYW5nZSB0cmVlIGRhdGEgc3RydWN0dXJlIG9yIHNvbWV0aGluZyBzbWFydCBsaWtlIHRoYXQgZm9yIGZhc3QgcmFuZ2Ugc2VhcmNoIGluIHRoZSBmdXR1cmUuXG4jIGl0cyBnb29kIGVub3VnaCBmb3Igbm93IGV2ZW4gaWYgd2UgZW5kIHVwIHF1YWRyYXRpYyBjb21wbGV4aXR5IGZvciBhbGdvcywgd2UgYXJlIG5vdCBwYXJzaW5nIG1hbnkgZXZlbnRzIHBlciBwcm9wZXJ0eS5cbiMgXG5NZW1FdmVudHMgPSBleHBvcnRzLk1lbUV2ZW50cyA9IGNsYXNzIE1lbUV2ZW50c05haXZlIGV4dGVuZHMgRXZlbnRzXG4gIC0+XG4gICAgYXNzaWduIEAsIGRvXG4gICAgICBldmVudHM6ICB7fVxuICAgICAgbGVuZ3RoOiAwXG4gICAgICB0eXBlOiB7fVxuICAgIHN1cGVyIC4uLlxuICBcbiAgd2l0aG91dDogKGV2ZW50KSAtPiBuZXcgTWVtRXZlbnRzIGZpbHRlciAodmFsdWVzIEBldmVudHMpLCAtPiBpdC5pZCBpc250IGV2ZW50LmlkXG4gICAgXG4gIHRvQXJyYXk6IC0+IHZhbHVlcyBAZXZlbnRzXG5cbiAgZWFjaDogKGNiKSAtPiBlYWNoIEBldmVudHMsIGNiXG4gIFxuICBfZmluZDogKGNiKSAtPiBmaW5kIEBldmVudHMsIGNiXG5cbiAgY2xvbmU6IChyYW5nZSkgLT4gbmV3IE1lbUV2ZW50cyB2YWx1ZXMgQGV2ZW50c1xuXG4gIHBvcG06ICguLi5ldmVudHMpIC0+IFxuICAgIGVhY2ggcGFyc2UuZXZlbnRBcnJheShldmVudHMpLCAoZXZlbnQpIH4+XG4gICAgICBpZiBub3QgZXZlbnQgdGhlbiByZXR1cm5cbiAgICAgIGlmIG5vdCBAZXZlbnRzW2V2ZW50LmlkXT8gdGhlbiByZXR1cm5cbiAgICAgIGVsc2VcbiAgICAgICAgZGVsZXRlIEBldmVudHNbZXZlbnQuaWRdXG4gICAgICAgIEBsZW5ndGgtLVxuICAgIEBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdXNobTogKC4uLmV2ZW50cykgLT5cbiAgICBlYWNoIHBhcnNlLmV2ZW50QXJyYXkoZXZlbnRzKSwgKGV2ZW50KSB+PlxuICAgICAgaWYgbm90IGV2ZW50IHRoZW4gcmV0dXJuXG4gICAgICBpZiBAZXZlbnRzW2V2ZW50LmlkXT8gdGhlbiByZXR1cm5cbiAgICAgIEBldmVudHNbZXZlbnQuaWRdID0gZXZlbnRcbiAgICAgIEB0eXBlW2V2ZW50LnR5cGVdID0gdHJ1ZVxuXG5cbiAgICAgIGlmIGV2ZW50LnN0YXJ0IDwgQHN0YXJ0IG9yIG5vdCBAc3RhcnQgdGhlbiBAc3RhcnQgPSBldmVudC5zdGFydFxuICAgICAgaWYgZXZlbnQuZW5kIDwgQGVuZCBvciBub3QgQGVuZCB0aGVuIEBlbmQgPSBldmVudC5lbmRcbiAgICAgIFxuICAgICAgQGxlbmd0aCsrXG4gICAgQFxuICBcbiJdfQ==

(function(){
  var p, ref$, w, find, omit, filter, pick, keys, values, pop, assign, each, reduce, flattenDeep, push, map, mapValues, moment, momentRange, format, parse, Matcher, EventLike, parseInit, Event, PersistLayer, Events, MemEvents, MemEventsNaive, slice$ = [].slice;
  p = require('bluebird');
  ref$ = require('leshdash'), w = ref$.w, find = ref$.find, omit = ref$.omit, filter = ref$.filter, pick = ref$.pick, keys = ref$.keys, values = ref$.values, pop = ref$.pop, assign = ref$.assign, each = ref$.each, reduce = ref$.reduce, flattenDeep = ref$.flattenDeep, push = ref$.push, map = ref$.map, mapValues = ref$.mapValues, omit = ref$.omit;
  moment = require('moment');
  momentRange = require('moment-range');
  format = exports.format = function(it){
    return it.format('YYYY-MM-DD');
  };
  parse = exports.parse = {
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
      if ((it != null ? it.isEvents : void 8) != null) {
        return it.toArray();
      }
      return flattenDeep((function(){
        switch (it != null && it.constructor) {
        case Array:
          return map(it, parse.eventArray);
        default:
          return [parse.event(it)];
        }
      }()));
    },
    range: function(something, def){
      if ((something != null ? something.isEvent : void 8) != null || (something != null ? something.isEvents : void 8) != null) {
        return something.range();
      }
      switch (something != null && something.constructor) {
      case false:
        return def || void 8;
      case Object:
        return moment.range(something);
      case Array:
        return moment.range(something);
      default:
        return (typeof something.range == 'function' ? something.range() : void 8) || something;
      }
    },
    eventCollection: function(something){
      if ((something != null ? something.isEvent : void 8) != null) {
        return [something];
      }
      if ((something != null ? something.isEvents : void 8) != null) {
        return something.toArray();
      }
      switch (something != null && something.constructor) {
      case void 8:
        return [];
      case Array:
        return flattenDeep(something);
      default:
        throw 'what is this';
      }
    }
  };
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9zZXJ2ZXJzaWRlL25vZGVfbW9kdWxlcy90aW1lRXZlbnRzL2luZGV4LmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBSVksQ0FBVixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQTtFQUNBLElBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQVksQ0FBWixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVksQ0FBWixFQUFlLElBQWYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFlLElBQWYsRUFBcUIsSUFBckIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFxQixJQUFyQixFQUEyQixNQUEzQixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTJCLE1BQTNCLEVBQW1DLElBQW5DLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbUMsSUFBbkMsRUFBeUMsSUFBekMsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF5QyxJQUF6QyxFQUErQyxNQUEvQyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStDLE1BQS9DLEVBQXVELEdBQXZELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdUQsR0FBdkQsRUFBNEQsTUFBNUQsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE0RCxNQUE1RCxFQUFvRSxJQUFwRSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW9FLElBQXBFLEVBQTBFLE1BQTFFLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEUsTUFBMUUsRUFBa0YsV0FBbEYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFrRixXQUFsRixFQUErRixJQUEvRixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStGLElBQS9GLEVBQXFHLEdBQXJHLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcUcsR0FBckcsRUFBMEcsU0FBMUcsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEwRyxTQUExRyxFQUFxSCxJQUFySCxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXFIO0VBQ3JILE1BQUEsQ0FB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c0NvbnRlbnQiOlsiIyBhdXRvY29tcGlsZVxuXG4jICogcmVxdWlyZVxucmVxdWlyZSEge1xuICBibHVlYmlyZDogcFxuICBsZXNoZGFzaDogeyB3LCBmaW5kLCBvbWl0LCBmaWx0ZXIsIHBpY2ssIGtleXMsIHZhbHVlcywgcG9wLCBhc3NpZ24sIGVhY2gsIHJlZHVjZSwgZmxhdHRlbkRlZXAsIHB1c2gsIG1hcCwgbWFwVmFsdWVzLCBvbWl0IH0gIFxuICBtb21lbnRcbiAgJ21vbWVudC1yYW5nZSdcbn1cblxuIyAqIFR5cGUgY29lcmNpb24gZnVuY3Rpb25zIGZvciBhIG1vcmUgY2hpbGxlZCBvdXQgQVBJXG5mb3JtYXQgPSBleHBvcnRzLmZvcm1hdCA9IC0+IGl0LmZvcm1hdCAnWVlZWS1NTS1ERCdcblxucGFyc2UgPSBleHBvcnRzLnBhcnNlID0gZG9cbiAgcGF0dGVybjogLT5cbiAgICB8IGl0P2lzRXZlbnQ/ID0+IFsgaXQucmFuZ2UhLCBwYXlsb2FkOiBpdC5wYXlsb2FkIF1cbiAgICB8IGl0P0BAIGlzIE9iamVjdCBhbmQgaXQucmFuZ2U/ID0+IFsgcGFyc2UucmFuZ2UoaXQucmFuZ2UpLCBvbWl0KGl0LCAncmFuZ2UnKSBdXG4gICAgfCBpdD9AQCBpcyBPYmplY3QgPT4gWyBmYWxzZSwgaXQgXVxuICAgIHwgb3RoZXJ3aXNlID0+IHRocm93IG5ldyBFcnJvciBcImludmFsaWQgdHlwZSBmb3IgcGF0ZXJuICN7aXQ/dG9TdHJpbmc/IX0gI3tpdD9AQH1cIlxuICAgIFxuICAjIChhbnkpIC0+IEV2ZW50IHwgRXJyb3JcbiAgZXZlbnQ6IC0+XG4gICAgaWYgaXQ/aXNFdmVudD8gdGhlbiByZXR1cm4gaXRcbiAgICBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgT2JqZWN0ID0+IG5ldyBFdmVudCBpdFxuICAgICAgfCBvdGhlcndpc2UgPT5cbiAgICAgICAgY29uc29sZS5sb2cgaXRcbiAgICAgICAgY29uc29sZS5sb2cgU3RyaW5nIGl0XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcImludmFsaWQgdHlwZSBmb3IgZXZlbnQgI3tpdD90b1N0cmluZz8hfSAje2l0P0BAfVwiXG5cbiAgIyAoYW55KSAtPiBNZW1FdmVudHMgfCBFcnJvclxuICBldmVudHM6IC0+XG4gICAgaWYgaXQ/aXNFdmVudHM/IHRoZW4gcmV0dXJuIGl0XG4gICAgICBcbiAgICBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgQXJyYXkgPT4gbmV3IE1lbUV2ZW50cyBpdFxuICAgICAgfCBvdGhlcndpc2UgPT4gbmV3IE1lbUV2ZW50cyBwYXJzZS5ldmVudCBpdFxuXG4gICMgKEFueSkgLT4gQXJyYXk8RXZlbnQ+IHwgRXJyb3JcbiAgZXZlbnRBcnJheTogLT5cbiAgICBpZiBpdD9pc0V2ZW50cz8gdGhlbiByZXR1cm4gaXQudG9BcnJheSgpXG4gICAgZmxhdHRlbkRlZXAgc3dpdGNoIGl0P0BAXG4gICAgICB8IEFycmF5ID0+IG1hcCBpdCwgcGFyc2UuZXZlbnRBcnJheVxuICAgICAgfCBvdGhlcndpc2UgPT4gWyBwYXJzZS5ldmVudCBpdCBdXG4gICAgICAgIFxuICAjICggRXZlbnRzIHwgRXZlbnQgfCB2b2lkICkgLT4gUmFuZ2VcbiAgcmFuZ2U6IChzb21ldGhpbmcsIGRlZikgLT5cbiAgICBpZiBzb21ldGhpbmc/aXNFdmVudD8gb3Igc29tZXRoaW5nP2lzRXZlbnRzPyB0aGVuIHJldHVybiBzb21ldGhpbmcucmFuZ2UhXG4gICAgICBcbiAgICBzd2l0Y2ggc29tZXRoaW5nP0BAXG4gICAgICB8IGZhbHNlID0+IGRlZiBvciB2b2lkXG4gICAgICB8IE9iamVjdCA9PiBtb21lbnQucmFuZ2Ugc29tZXRoaW5nXG4gICAgICB8IEFycmF5ID0+IG1vbWVudC5yYW5nZSBzb21ldGhpbmdcbiAgICAgIHwgb3RoZXJ3aXNlID0+IHNvbWV0aGluZy5yYW5nZT8hIG9yIHNvbWV0aGluZ1xuICAgIFxuIyAoIEV2ZW50cyB8IEFycmF5PEV2ZW50PiB8IEV2ZW50IHwgdm9pZCApIC0+IEFycmF5PEV2ZW50PlxuICBldmVudENvbGxlY3Rpb246IChzb21ldGhpbmcpIC0+XG4gICAgaWYgc29tZXRoaW5nP2lzRXZlbnQ/IHRoZW4gcmV0dXJuIFsgc29tZXRoaW5nIF1cbiAgICBpZiBzb21ldGhpbmc/aXNFdmVudHM/IHRoZW4gcmV0dXJuIHNvbWV0aGluZy50b0FycmF5IVxuICAgIFxuICAgIHN3aXRjaCBzb21ldGhpbmc/QEBcbiAgICAgIHwgdm9pZCA9PiBbXVxuICAgICAgfCBBcnJheSA9PiBmbGF0dGVuRGVlcCBzb21ldGhpbmdcbiAgICAgIHwgb3RoZXJ3aXNlID0+IHRocm93ICd3aGF0IGlzIHRoaXMnXG5cbk1hdGNoZXIgPSAocmFuZ2UsIHBhdHRlcm4sIGV2ZW50KSAtLT5cbiAgXG4gIGNoZWNrUmFuZ2UgPSAoZXZlbnQpIC0+XG4gICAgaWYgcmFuZ2UgdGhlbiByZXR1cm4gcmFuZ2UuY29udGFpbnMgZXZlbnQuc3RhcnQuY2xvbmUoKS5hZGQoMSkgb3IgcmFuZ2UuY29udGFpbnMgZXZlbnQuZW5kLmNsb25lKCkuc3VidHJhY3QoMSkgb3IgZXZlbnQucmFuZ2UhLmNvbnRhaW5zIHJhbmdlXG4gICAgZWxzZSByZXR1cm4gdHJ1ZVxuXG4gIGNoZWNrUmFuZ2VTdHJpY3QgPSAoZXZlbnQpIC0+IHJhbmdlLmlzRXF1YWwgZXZlbnQucmFuZ2UhXG5cbiAgY2hlY2tQYXR0ZXJuID0gKGV2ZW50KSAtPlxuICAgIG5vdCBmaW5kIHBhdHRlcm4sICh2YWx1ZSwga2V5KSAtPlxuICAgICAgc3dpdGNoIHZhbHVlP0BAXG4gICAgICAgIHwgdW5kZWZpbmVkID0+IHRydWVcbiAgICAgICAgXG4gICAgICAgIHwgQm9vbGVhbiA9PlxuICAgICAgICAgIGlmIHZhbHVlIHRoZW4gbm90IGV2ZW50W2tleV0/XG4gICAgICAgICAgZWxzZSBldmVudFtrZXldP1xuICAgICAgICAgIFxuICAgICAgICB8IEZ1bmN0aW9uID0+IG5vdCB2YWx1ZSBldmVudFtrZXldXG5cbiAgICAgICAgfCBvdGhlcndpc2UgPT5cbiAgICAgICAgICBpZiBtb21lbnQuaXNNb21lbnQgdmFsdWUgdGhlbiBub3QgdmFsdWUuaXNTYW1lIGV2ZW50W2tleV1cbiAgICAgICAgICBlbHNlIGlmIGV2ZW50W2tleV0gaXMgdmFsdWUgdGhlbiBmYWxzZSBlbHNlIHRydWVcblxuICBjaGVja1JhbmdlKGV2ZW50KSBhbmQgY2hlY2tQYXR0ZXJuKGV2ZW50KVxuXG5cbiMgKiBFdmVudExpa2VcbiMgbW9yZSBvZiBhIHNwZWMgdGhlbiBhbnl0aGluZywgdGhpcyBpcyBpbXBsZW1lbnRlZCBieSBFdmVudCAmIEV2ZW50c1xuXG5FdmVudExpa2UgPSBleHBvcnRzLkV2ZW50TGlrZSA9IGNsYXNzIEV2ZW50TGlrZVxuXG4gICMgZmV0Y2hlcyBhbGwgZXZlbnRzIGZyb20gYSBjb2xsZWN0aW9uIHJlbGV2YW50IHRvIGN1cnJlbnQgZXZlbnQgKGJ5IHR5cGUgYW5kIHJhbmdlKVxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHJlbGV2YW50RXZlbnRzOiAoZXZlbnRzKSAtPlxuICAgIHBhcnNlLmV2ZW50cyBldmVudHNcbiAgICAuZmlsdGVyIHJhbmdlOiBAcmFuZ2UoKSwgdHlwZTogQHR5cGVcblxuICBuZWlnaGJvdXJzOiAoZXZlbnRzKSAtPlxuICAgIFtcbiAgICAgIGV2ZW50cy5maWx0ZXIgZW5kOiBAc3RhcnQuY2xvbmUoKVxuICAgICAgZXZlbnRzLmZpbHRlciBzdGFydDogQGVuZC5jbG9uZSgpXG4gICAgXVxuXG4gICMgZ2V0IG9yIHNldCByYW5nZVxuICAjIChyYW5nZT8pIC0+IG1vbWVudC5yYW5nZVxuICByYW5nZTogKHNldFJhbmdlKSAtPlxuICAgIGlmIHJhbmdlID0gc2V0UmFuZ2VcbiAgICAgIEBzdGFydCA9IHJhbmdlLnN0YXJ0LmNsb25lKClcbiAgICAgIEBlbmQgPSByYW5nZS5lbmQuY2xvbmUoKVxuICAgIGVsc2VcbiAgICAgIHJhbmdlID0gbmV3IG1vbWVudC5yYW5nZSBAc3RhcnQsIEBlbmRcbiAgICAgIFxuICAgIHJhbmdlXG5cbiAgIyAoIEV2ZW50TGlrZSApIC0+IEV2ZW50c1xuICBwdXNoOiAoZXZlbnQpIC0+IC4uLlxuICAgIFxuICAjICggRXZlbnRMaWtlICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0OiAoc29tZXRoaW5nKSAtPlxuICAgIGlmIHNvbWV0aGluZyBpbnN0YW5jZW9mIEV2ZW50cyB0aGVuIEBzdWJ0cmFjdE1hbnkgc29tZXRoaW5nXG4gICAgZWxzZSBAc3VidHJhY3RPbmUgc29tZXRoaW5nXG4gICAgXG4gICMgKCBFdmVudExpa2UsIChFdmVudCwgRXZlbnQpIC0+IEV2ZW50cykgLT4gRXZlbnRzXG4gIGNvbGxpZGU6IChldmVudHMsIGNiKSAtPiAuLi5cblxuICBlYWNoOiAtPiAuLi5cblxuICBzdWJ0cmFjdE1hbnk6IC0+IC4uLlxuXG4gIHN1YnRyYWN0T25lOiAtPiAuLi5cblxuIyAqIEV2ZW50XG4jIHJlcHJlc2VudHMgc29tZSBldmVudCBpbiB0aW1lLCBkZWZpbmVkIGJ5IHN0YXJ0IGFuZCBlbmQgdGltZXN0YW1wc1xuIyBjYXJpZXMgc29tZSBwYXlsb2FkLCBsaWtlIGEgcHJpY2Ugb3IgYSBib29raW5nXG5cbnBhcnNlSW5pdCA9IChkYXRhKSAtPlxuICBpZiBub3QgZGF0YSB0aGVuIHJldHVybiB7fVxuICBpZiBkYXRhQEAgaXNudCBPYmplY3QgdGhlbiByZXR1cm4gXCJ3dXQgd3V0XCJcbiAgZGF0YSA9IHt9IDw8PCBkYXRhXG4gICAgXG4gIGlmIGRhdGEuY2VudGVyIHRoZW4gcmV0dXJuIHsgc3RhcnQ6IG1vbWVudC51dGMgZGF0YS5zdGFydCwgZW5kOiBtb21lbnQudXRjIGRhdGEuZW5kIH1cbiAgICBcbiAgaWYgZGF0YS5yYW5nZVxuICAgIGRhdGEuc3RhcnQgPSBkYXRhLnJhbmdlLnN0YXJ0XG4gICAgZGF0YS5lbmQgPSBkYXRhLnJhbmdlLmVuZFxuICAgIGRlbGV0ZSBkYXRhLnJhbmdlXG4gIFxuICBpZiBkYXRhLnN0YXJ0P0BAIGluIFsgRGF0ZSwgU3RyaW5nIF0gdGhlbiBkYXRhLnN0YXJ0ID0gbW9tZW50LnV0YyBkYXRhLnN0YXJ0XG5cbiAgaWYgZGF0YS5lbmQ/QEAgaW4gWyBEYXRlLCBTdHJpbmcgXSB0aGVuIGRhdGEuZW5kID0gbW9tZW50LnV0YyBkYXRhLmVuZFxuXG4gIGlmIG5vdCBkYXRhLmlkIHRoZW4gZGF0YS5pZCA9IGRhdGEuc3RhcnQuZm9ybWF0KCkgKyBcIiBcIiArIGRhdGEuZW5kLmZvcm1hdCgpICsgXCIgXCIgKyBkYXRhLnR5cGVcbiAgICAgICAgXG4gIHJldHVybiBkYXRhXG5cbkV2ZW50ID0gZXhwb3J0cy5FdmVudCA9IGNsYXNzIEV2ZW50IGV4dGVuZHMgRXZlbnRMaWtlXG4gIGlzRXZlbnQ6IHRydWVcbiAgXG4gIChpbml0KSAtPiBhc3NpZ24gQCwgcGFyc2VJbml0IGluaXRcblxuICBjb21wYXJlOiAoZXZlbnQpIC0+XG4gICAgWyBAaXNTYW1lUmFuZ2UoZXZlbnQpLCBAaXNTYW1lUGF5bG9hZChldmVudCkgXVxuXG4gIGlzU2FtZTogKGV2ZW50KSAtPlxuICAgIEBpc1NhbWVSYW5nZShldmVudCkgYW5kIEBpc1NhbWVQYXlsb2FkKGV2ZW50KVxuXG4gIGlzU2FtZVJhbmdlOiAoZXZlbnQpIC0+XG4gICAgZXZlbnQgPSBwYXJzZS5ldmVudCBldmVudFxuICAgIEByYW5nZSEuaXNTYW1lIGV2ZW50LnJhbmdlIVxuICAgIFxuICBpc1NhbWVQYXlsb2FkOiAoZXZlbnQpIC0+XG4gICAgZXZlbnQgPSBwYXJzZS5ldmVudCBldmVudFxuICAgIChAdHlwZSBpcyBldmVudC50eXBlKSBhbmQgKEBwYXlsb2FkIGlzIGV2ZW50LnBheWxvYWQpXG4gIFxuICBjbG9uZTogKGRhdGE9e30pIC0+XG4gICAgcmV0ID0gbmV3IEV2ZW50IGFzc2lnbiB7fSwgQCwgeyBpZDogQGlkICsgJy1jbG9uZSd9LCBkYXRhXG4gICAgZGVsZXRlIHJldC5yZXByXG4gICAgcmV0XG5cbiAgIyAoKSAtPiBKc29uXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBwaWNrKEAsIDxbdHlwZSBwYXlsb2FkIGlkIHRhZ3NdPikgPDw8IG1hcFZhbHVlcyAocGljayBALCA8WyBzdGFydCBlbmQgXT4pLCAodmFsdWUpIC0+IHZhbHVlLnV0YygpLmZvcm1hdCgpXG5cbiAgIyAoKSAtPiBTdHJpbmdcbiAgdG9TdHJpbmc6IC0+XG4gICAgc3RhcnQgPSBmb3JtYXQgQHN0YXJ0XG4gICAgZW5kID0gZm9ybWF0IEBlbmRcbiAgICBpZiBAcHJpY2UgdGhlbiBcIlByaWNlKFwiICsgQHByaWNlICsgXCIgXCIgKyBzdGFydCArIFwiKVwiXG4gICAgZWxzZSBcIkV2ZW50KFwiICsgKEBpZCBvciBcInVuc2F2ZWQtXCIgKyBAdHlwZSkgICsgXCIpXCJcbiAgICBcbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE1hbnk6IChldmVudHMpIC0+XG4gICAgQHJlbGV2YW50RXZlbnRzIGV2ZW50c1xuICAgIC5yZWR1Y2UgZG9cbiAgICAgIChyZXMsIGV2ZW50KSB+PiByZXMuc3VidHJhY3RPbmUgZXZlbnRcbiAgICAgIG5ldyBNZW1FdmVudHMgQFxuICAgICAgXG4gICMgKCBFdmVudCApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE9uZTogKGV2ZW50KSAtPlxuICAgIGNudCA9IDBcbiAgICByYW5nZSA9IGV2ZW50LnJhbmdlKClcbiAgICByYW5nZS5zdGFydC5zdWJ0cmFjdCAxLCAnc2Vjb25kJ1xuICAgIHJhbmdlLmVuZC5hZGQgMSAnc2Vjb25kJ1xuICAgIFxuICAgIG5ldyBNZW1FdmVudHMgbWFwIGRvXG4gICAgICBAcmFuZ2UoKS5zdWJ0cmFjdCByYW5nZVxuICAgICAgfj4gQGNsb25lIHsgc3RhcnQ6IGl0LnN0YXJ0LCBlbmQ6IGl0LmVuZCwgaWQ6IEBpZCArICctJyArIGNudCsrIH0gIyBnZXQgcmlkIG9mIHBvdGVudGlhbCBvbGQgcmVwciwgdGhpcyBpcyBhIG5ldyBldmVudFxuICAgICAgXG4gICMgKCBFdmVudHMsIChFdmVudCwgRXZlbnQpIC0+IEV2ZW50cyApIC0+IEV2ZW50c1xuICBjb2xsaWRlOiAoZXZlbnRzLCBjYikgLT5cbiAgICBAcmVsZXZhbnRFdmVudHMgZXZlbnRzXG4gICAgLnJlZHVjZSAoZXZlbnRzLCBldmVudCkgfj4gZXZlbnRzLnB1c2htIGNiIGV2ZW50LCBAXG5cbiAgZWFjaDogKGNiKSAtPiBjYiBAXG4gICAgXG4gIG1lcmdlOiAoZXZlbnQpIC0+XG4gICAgbmV3U2VsZiA9IEBjbG9uZSgpXG4gICAgaWYgZXZlbnQuc3RhcnQgPCBuZXdTZWxmLnN0YXJ0IHRoZW4gbmV3U2VsZi5zdGFydCA9IGV2ZW50LnN0YXJ0XG4gICAgaWYgZXZlbnQuZW5kID4gbmV3U2VsZi5lbmQgdGhlbiBuZXdTZWxmLmVuZCA9IGV2ZW50LmVuZFxuICAgIG5ld1NlbGZcbiAgICBcblxuUGVyc2lzdExheWVyID0gZXhwb3J0cy5QZXJzaXN0TGF5ZXIgPSBjbGFzc1xuICBtYXJrUmVtb3ZlOiAtPiBAdG9SZW1vdmUgPSB0cnVlXG4gIFxuICBzYXZlOiAtPiBuZXcgcCAocmVzb2x2ZSxyZWplY3QpIH4+XG4gICAgaWYgQHRvUmVtb3ZlIHRoZW4gcmVzb2x2ZSBAcmVtb3ZlIVxuICAgIGVsc2UgLi4uXG4gICAgICBcbiAgcmVtb3ZlOiAtPiBuZXcgcCAocmVzb2x2ZSxyZWplY3QpIH4+IC4uLlxuXG4jICogRXZlbnRzXG4jIGFic3RyYWN0IGV2ZW50IGNvbGxlY3Rpb25cbiMgc3VwcG9ydGluZyBjb21tb24gc2V0IG9wZXJhdGlvbnMsXG4jIGFuZCBzb21lIHVuY29tbW9uIG9wZXJhdGlvbnMgcmVsYXRlZCB0byB0aW1lIChjb2xsaWRlLCBzdWJ0cmFjdClcbiBcbkV2ZW50cyA9IGV4cG9ydHMuRXZlbnRzID0gY2xhc3MgRXZlbnRzIGV4dGVuZHMgRXZlbnRMaWtlXG4gICguLi5ldmVudHMpIC0+IEBwdXNobS5hcHBseSBALCBldmVudHNcblxuICAjIHBlciBkYXkgZGF0YSAoYWlyYm5iIGFwaSBoZWxwZXIpXG4gIGRheXM6IChjYikgLT4gQGVhY2ggKGV2ZW50KSAtPiBldmVudC5yYW5nZSFieSAnZGF5cycsIH4+IGNiIGl0LCBldmVudFxuXG4gIGlzRXZlbnRzOiB0cnVlXG5cbiAgIyAoIE1vbWVudFJhbmdlLCBPYmplY3QgKSAtPiBFdmVudHNcbiAgZmluZDogKHJhbmdlLCBwYXR0ZXJuKSAtPiAuLi5cbiAgICBcbiAgIyAoIHJhbmdlRXF1aXZhbGVudCApIC0+IEV2ZW50c1xuIyAgY2xvbmU6IChyYW5nZUVxdWl2YWxlbnQpIH4+IC4uLlxuXG4gICMgKCBFdmVudENvbGxlY3Rpb24pIC0+IEV2ZW50c1xuICBwdXNobTogKGV2ZW50Q29sbGVjdGlvbikgLT4gLi4uXG5cbiAgIyAoIEV2ZW50Q29sbGVjdGlvbikgLT4gRXZlbnRzXG4gIHB1c2g6IChldmVudENvbGxlY3Rpb24pIC0+IEBjbG9uZSBldmVudENvbGxlY3Rpb25cblxuICAjICgpIC0+IEV2ZW50c1xuICB3aXRob3V0OiAtPiAgLi4uXG5cbiAgIyAoIEZ1bmN0aW9uICkgLT4gdm9pZFxuICBlYWNoOiAoY2IpIC0+IC4uLlxuXG4gICMgKCkgLT4gU3RyaW5nXG4gIHRvU3RyaW5nOiAtPiBcIkVbI3tAbGVuZ3RofV0gPCBcIiArIChAbWFwIChldmVudCkgLT4gXCJcIiArIGV2ZW50KS5qb2luKFwiLCBcIikgKyBcIiA+XCJcblxuICAjICgpIC0+IEpzb25cbiAgc2VyaWFsaXplOiAtPiBAbWFwICguc2VyaWFsaXplISlcblxuICAjICgpIC0+IEFycmF5PEV2ZW50PlxuICB0b0FycmF5OiAtPlxuICAgIHJldCA9IFtdXG4gICAgQGVhY2ggLT4gcmV0LnB1c2ggaXRcbiAgICByZXRcblxuICAjICggKEV2ZW50KSAtPiBhbnkpICkgLT4gQXJyYXk8YW55PlxuICBtYXA6IChjYikgLT5cbiAgICByZXQgPSBbXVxuICAgIEBlYWNoIChldmVudCkgLT4gcmV0LnB1c2ggY2IgZXZlbnRcbiAgICByZXRcblxuICAjICgpIC0+IE9iamVjdFxuICBzdW1tYXJ5OiAtPlxuICAgIEByYXdSZWR1Y2UgKHN0YXRzLCBldmVudCkgLT4gKHN0YXRzIG9yIHt9KSA8PDwgXCIje2V2ZW50LnR5cGV9XCI6IChzdGF0cz9bZXZlbnQudHlwZV0gb3IgMCkgKyAxXG4gIFxuICAjICggKEV2ZW50cywgRXZlbnQpIC0+IEV2ZW50cyApIC0+IEFycmF5PGFueT5cbiAgcmF3UmVkdWNlOiAoY2IsIG1lbW8pIC0+XG4gICAgQGVhY2ggKGV2ZW50KSAtPiBtZW1vIDo9IGNiIG1lbW8sIGV2ZW50XG4gICAgbWVtb1xuICAgIFxuICAjICggKEV2ZW50cywgRXZlbnQpIC0+IEV2ZW50cyApIC0+IEV2ZW50c1xuICByZWR1Y2U6IChjYiwgbWVtbykgLT5cbiAgICBpZiBub3QgbWVtbyB0aGVuIG1lbW8gPSBuZXcgTWVtRXZlbnRzKClcbiAgICBAcmF3UmVkdWNlIGNiLCBtZW1vXG5cbiAgIyAoIEV2ZW50ICkgLT4gQm9vbGVhblxuICBoYXM6ICh0YXJnZXRFdmVudCkgLT5cbiAgICByYW5nZSA9IHRhcmdldEV2ZW50LnJhbmdlIVxuICAgIEBfZmluZCAoZXZlbnQpIC0+IGV2ZW50LnBheWxvYWQgaXMgdGFyZ2V0RXZlbnQucGF5bG9hZCBhbmQgZXZlbnQucmFuZ2UhaXNTYW1lIHJhbmdlXG4gICAgICAgICAgICBcbiAgIyAoIEV2ZW50IHwgeyByYW5nZTogUmFuZ2UsIC4uLiB9ICkgLT4gRXZlbnRzXG4gIGZpbmQ6IC0+XG4gICAgbWF0Y2hlciA9IE1hdGNoZXIuYXBwbHkgQCwgcGFyc2UucGF0dGVybiBpdFxuICAgIEBfZmluZCBtYXRjaGVyXG4gICAgXG4gICMgKCB7IHJhbmdlOiBSYW5nZSwgLi4uIH0gKSAtPiBFdmVudHNcbiAgZmlsdGVyOiAoIHBhdHRlcm4gKS0+XG4gICAgbWF0Y2hlciA9IE1hdGNoZXIuYXBwbHkgQCwgcGFyc2UucGF0dGVybiBwYXR0ZXJuXG4gICAgQHJlZHVjZSAocmV0LCBldmVudCkgLT4gaWYgbWF0Y2hlciBldmVudCB0aGVuIHJldC5wdXNobSBldmVudCBlbHNlIHJldFxuICAgIFxuICBkaWZmOiAoZXZlbnRzKSAtPlxuICAgIG1ha2VEaWZmID0gKGRpZmYsIGV2ZW50KSB+PlxuICAgICAgY29sbGlzaW9ucyA9IGV2ZW50LnJlbGV2YW50RXZlbnRzIGRpZmZcbiAgICAgIGlmIG5vdCBjb2xsaXNpb25zLmxlbmd0aCB0aGVuIHJldHVybiBkaWZmXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBkaWZmLnBvcG0oY29sbGlzaW9ucykucHVzaG0gY29sbGlzaW9ucy5yZWR1Y2UgKHJlcywgY29sbGlzaW9uKSAtPlxuICAgICAgICAgIFsgcmFuZ2UsIHBheWxvYWQgXSA9IGV2ZW50LmNvbXBhcmUgY29sbGlzaW9uXG4gICAgICAgICAgXG4gICAgICAgICAgaWYgbm90IHJhbmdlIGFuZCBub3QgcGF5bG9hZCB0aGVuIHJldHVybiByZXMucHVzaG0gY29sbGlzaW9uXG4gICAgICAgICAgaWYgcGF5bG9hZCB0aGVuIHJldHVybiByZXMucHVzaG0gY29sbGlzaW9uLnN1YnRyYWN0IGV2ZW50XG4gICAgICAgICAgaWYgcmFuZ2UgdGhlbiByZXR1cm4gcmVzLnB1c2htIGNvbGxpc2lvblxuICAgICAgICAgIHJldHVybiByZXNcblxuICAgIGV2ZW50cyA9IHBhcnNlLmV2ZW50cyBldmVudHNcbiAgICBAcmVkdWNlIG1ha2VEaWZmLCBldmVudHMuY2xvbmUoKVxuXG4gICMgY29tcGxhdGVseSB0cmFuc2Zvcm1zIHRoZSBncm91cCBvZiBldmVudHMsIHJldHVybmluZyByYW5nZXMgYWRkZWQgYW5kIHJlbW92ZWQsIGFuZCBkYiBldmVudHMgdG8gZGVsZXRlIGFuZCBjcmVhdGUgdG8gYXBwbHkgdGhlIGNoYW5nZVxuICAjICggRXZlbnRzICkgLT4geyBidXN5OiBFdmVudHMsIGZyZWU6IEV2ZW50cywgY3JlYXRlOiBFdmVudHMsIHJlbW92ZTogRXZlbnRzIH1cbiAgY2hhbmdlOiAobmV3RXZlbnRzKSAtPlxuICAgIG5ld0V2ZW50cyA9IHBhcnNlLmV2ZW50cyBuZXdFdmVudHNcbiAgICBidXN5ID0gbmV3RXZlbnRzLnN1YnRyYWN0IEBcbiAgICBmcmVlID0gQHN1YnRyYWN0IG5ld0V2ZW50c1xuXG4gICAgY3JlYXRlID0gbmV3RXZlbnRzLnJlZHVjZSAoY3JlYXRlLCBldmVudCkgfj4gaWYgbm90IEBoYXMgZXZlbnQgdGhlbiBjcmVhdGUucHVzaG0gZXZlbnQgZWxzZSBjcmVhdGVcbiAgICByZW1vdmUgPSBAcmVkdWNlIChyZW1vdmUsIGV2ZW50KSAtPiBpZiBub3QgbmV3RXZlbnRzLmhhcyBldmVudCB0aGVuIHJlbW92ZS5wdXNobSBldmVudCBlbHNlIHJlbW92ZVxuICAgICAgICBcbiAgICBidXN5OiBidXN5LCBmcmVlOiBmcmVlLCBjcmVhdGU6IGNyZWF0ZSwgcmVtb3ZlOiByZW1vdmVcblxuICAjIHVwYXRlcyBldmVudHNcbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICB1cGRhdGU6IChldmVudHMpIC0+XG4gICAgQHJlZHVjZSBkb1xuICAgICAgKFsgY3JlYXRlLCByZW1vdmUgXSwgZXZlbnQpIH4+XG5cbiAgICAgICAgaWYgKHJlbGV2YW50RXZlbnRzID0gZXZlbnQucmVsZXZhbnRFdmVudHMoZXZlbnRzKSkubGVuZ3RoXG4gICAgICAgICAgcmVtb3ZlLnB1c2htIGV2ZW50XG4gICAgICAgICAgY3JlYXRlLnB1c2htIGV2ZW50LnN1YnRyYWN0IHJlbGV2YW50RXZlbnRzXG5cbiAgICAgICAgWyBjcmVhdGUsIHJlbW92ZSBdXG5cbiAgICAgIFsgZXZlbnRzLmNsb25lKCksIG5ldyBNZW1FdmVudHMoKSBdXG4gICAgICAgICAgICBcbiAgbWVyZ2U6IC0+XG4gICAgQHJlZHVjZSAocmVzLCBldmVudCkgfj5cbiAgICAgIGV2ZW50XG4gICAgICAubmVpZ2hib3VycyhAKVxuICAgICAgLm1hcCAob2xkRXZlbnQpIC0+IFxuICAgICAgICBpZiBvbGRFdmVudC5sZW5ndGggYW5kIG9sZEV2ZW50LnBheWxvYWQgaXMgb2xkRXZlbnQucGF5bG9hZCB0aGVuIG9sZEV2ZW50Lm1lcmdlIGV2ZW50XG4gICAgXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgdW5pb246IChldmVudHMpIC0+XG4gICAgcmVzID0gQGNsb25lKClcbiAgICBldmVudHMuZWFjaCB+PiByZXMucHVzaG0gaXRcbiAgICByZXNcblxuICAjICggKEV2ZW50cywgKEV2ZW50MSwgRXZlbnQyKSAtPiBFdmVudHMgKSAtPiBFdmVudHNcbiAgY29sbGlkZTogKGV2ZW50cywgY2IpIC0+XG4gICAgQHJlZHVjZSAobWVtbywgZXZlbnQpIC0+IG1lbW8ucHVzaG0gZXZlbnQuY29sbGlkZSBldmVudHMsIGNiXG5cbiAgIyAoIEV2ZW50ICkgLT4gRXZlbnRzXG4gIHN1YnRyYWN0T25lOiAoZXZlbnQpIC0+XG4gICAgQHJlZHVjZSAocmV0LCBjaGlsZCkgLT4gcmV0LnB1c2htIGNoaWxkLnN1YnRyYWN0IGV2ZW50XG5cbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE1hbnk6IChldmVudHMpIC0+XG4gICAgQHJlZHVjZSAocmV0LCBjaGlsZCkgLT4gcmV0LnB1c2htIGNoaWxkLnN1YnRyYWN0TWFueSBldmVudHNcblxuIyAqIE1lbUV2ZW50c1xuIyBJbiBtZW1vcnkgRXZlbnQgY29sbGVjdGlvbiBpbXBsZW1lbnRhdGlvbixcbiMgdGhpcyBpcyBhIHZlcnkgbmFpdmUgaW1wbGVtZW50YXRpb25cbiMgXG4jIEkgZ3Vlc3Mgd2Ugc2hvdWxkIHVzZSByYW5nZSB0cmVlIGRhdGEgc3RydWN0dXJlIG9yIHNvbWV0aGluZyBzbWFydCBsaWtlIHRoYXQgZm9yIGZhc3QgcmFuZ2Ugc2VhcmNoIGluIHRoZSBmdXR1cmUuXG4jIGl0cyBnb29kIGVub3VnaCBmb3Igbm93IGV2ZW4gaWYgd2UgZW5kIHVwIHF1YWRyYXRpYyBjb21wbGV4aXR5IGZvciBhbGdvcywgd2UgYXJlIG5vdCBwYXJzaW5nIG1hbnkgZXZlbnRzIHBlciBwcm9wZXJ0eS5cbiMgXG5NZW1FdmVudHMgPSBleHBvcnRzLk1lbUV2ZW50cyA9IGNsYXNzIE1lbUV2ZW50c05haXZlIGV4dGVuZHMgRXZlbnRzXG4gIC0+XG4gICAgYXNzaWduIEAsIGRvXG4gICAgICBldmVudHM6ICB7fVxuICAgICAgbGVuZ3RoOiAwXG4gICAgICB0eXBlOiB7fVxuICAgIHN1cGVyIC4uLlxuICBcbiAgd2l0aG91dDogKGV2ZW50KSAtPiBuZXcgTWVtRXZlbnRzIGZpbHRlciAodmFsdWVzIEBldmVudHMpLCAtPiBpdC5pZCBpc250IGV2ZW50LmlkXG4gICAgXG4gIHRvQXJyYXk6IC0+IHZhbHVlcyBAZXZlbnRzXG5cbiAgZWFjaDogKGNiKSAtPiBlYWNoIEBldmVudHMsIGNiXG4gIFxuICBfZmluZDogKGNiKSAtPiBmaW5kIEBldmVudHMsIGNiXG5cbiAgY2xvbmU6IChyYW5nZSkgLT4gbmV3IE1lbUV2ZW50cyB2YWx1ZXMgQGV2ZW50c1xuXG4gIHBvcG06ICguLi5ldmVudHMpIC0+IFxuICAgIGVhY2ggcGFyc2UuZXZlbnRBcnJheShldmVudHMpLCAoZXZlbnQpIH4+XG4gICAgICBpZiBub3QgZXZlbnQgdGhlbiByZXR1cm5cbiAgICAgIGlmIG5vdCBAZXZlbnRzW2V2ZW50LmlkXT8gdGhlbiByZXR1cm5cbiAgICAgIGVsc2VcbiAgICAgICAgZGVsZXRlIEBldmVudHNbZXZlbnQuaWRdXG4gICAgICAgIEBsZW5ndGgtLVxuICAgIEBcblxuICBwdXNobTogKC4uLmV2ZW50cykgLT5cbiAgICBlYWNoIHBhcnNlLmV2ZW50QXJyYXkoZXZlbnRzKSwgKGV2ZW50KSB+PlxuICAgICAgaWYgbm90IGV2ZW50IHRoZW4gcmV0dXJuXG4gICAgICBpZiBAZXZlbnRzW2V2ZW50LmlkXT8gdGhlbiByZXR1cm5cbiAgICAgIEBldmVudHNbZXZlbnQuaWRdID0gZXZlbnRcbiAgICAgIEB0eXBlW2V2ZW50LnR5cGVdID0gdHJ1ZVxuXG4gICAgICBpZiBldmVudC5zdGFydCA8IEBzdGFydCBvciBub3QgQHN0YXJ0IHRoZW4gQHN0YXJ0ID0gZXZlbnQuc3RhcnRcbiAgICAgIGlmIGV2ZW50LmVuZCA8IEBlbmQgb3Igbm90IEBlbmQgdGhlbiBAZW5kID0gZXZlbnQuZW5kXG4gICAgICBcbiAgICAgIEBsZW5ndGgrK1xuICAgIEBcbiAgXG4iXX0=

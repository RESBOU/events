(function(){
  var p, ref$, w, find, omit, filter, pick, keys, values, pop, assign, each, reduce, flattenDeep, push, map, mapValues, moment, momentRange, format, parse, EventLike, parseInit, Event, PersistLayer, Events, MemEvents, MemEventsNaive, slice$ = [].slice;
  p = require('bluebird');
  ref$ = require('leshdash'), w = ref$.w, find = ref$.find, omit = ref$.omit, filter = ref$.filter, pick = ref$.pick, keys = ref$.keys, values = ref$.values, pop = ref$.pop, assign = ref$.assign, each = ref$.each, reduce = ref$.reduce, flattenDeep = ref$.flattenDeep, push = ref$.push, map = ref$.map, mapValues = ref$.mapValues, omit = ref$.omit;
  moment = require('moment');
  momentRange = require('moment-range');
  format = exports.format = function(it){
    return it.format('YYYY-MM-DD');
  };
  parse = exports.parse = {
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
  };
  EventLike = exports.EventLike = EventLike = (function(){
    EventLike.displayName = 'EventLike';
    var prototype = EventLike.prototype, constructor = EventLike;
    prototype.relevantEvents = function(events){
      return parse.events(events).filter({
        range: this
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
      return assign({}, this, mapValues(pick(this, ['start', 'end']), function(value){
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
    prototype.days = function(cb){
      return this.each(function(event){
        var this$ = this;
        return event.range().by('days', function(it){
          return cb(it, event);
        });
      });
    };
    prototype.isEvents = true;
    function Events(){
      var events;
      events = slice$.call(arguments);
      this.pushm.apply(this, events);
    }
    prototype._find = function(range, pattern){
      throw Error('unimplemented');
    };
    prototype.pushm = function(eventCollection){
      return true;
    };
    prototype.push = function(eventCollection){
      return this.clone(events);
    };
    prototype.without = function(){
      throw Error('unimplemented');
    };
    prototype.each = function(cb){
      return this._each(cb);
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
    prototype.filter = function(pattern){
      return this._filter(parse.range(pattern.range), omit(pattern, 'range'));
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
    prototype.apply = function(events){
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
    prototype._each = function(cb){
      return each(this.events, cb);
    };
    prototype._rangeSearch = function(range){
      return filter(this.events, function(it){
        return range.contains(it.start) || range.contains(it.end) || it.range().contains(range);
      });
    };
    prototype._filter = function(range, pattern){
      var ret, events, checkPattern;
      ret = new MemEvents();
      if (range) {
        events = this._rangeSearch(range);
      } else {
        events = values(this.events);
      }
      checkPattern = function(pattern){
        return function(event){
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
      };
      ret.pushm(filter(events, checkPattern(pattern)));
      return ret;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9jb3JlL25vZGVfbW9kdWxlcy90aW1lRXZlbnRzL2luZGV4LmxzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBR1ksQ0FBVixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQTtFQUNBLElBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQVksQ0FBWixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVksQ0FBWixFQUFlLElBQWYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFlLElBQWYsRUFBcUIsSUFBckIsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFxQixJQUFyQixFQUEyQixNQUEzQixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTJCLE1BQTNCLEVBQW1DLElBQW5DLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbUMsSUFBbkMsRUFBeUMsSUFBekMsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF5QyxJQUF6QyxFQUErQyxNQUEvQyxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStDLE1BQS9DLEVBQXVELEdBQXZELENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdUQsR0FBdkQsRUFBNEQsTUFBNUQsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE0RCxNQUE1RCxFQUFvRSxJQUFwRSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW9FLElBQXBFLEVBQTBFLE1BQTFFLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMEUsTUFBMUUsRUFBa0YsV0FBbEYsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFrRixXQUFsRixFQUErRixJQUEvRixDQUFBLENBQUEsQ0FBQSxJQUFBLENBQStGLElBQS9GLEVBQXFHLEdBQXJHLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcUcsR0FBckcsRUFBMEcsU0FBMUcsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEwRyxTQUExRyxFQUFxSCxJQUFySCxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXFIO0VBQ3JILE1BQUEsQ0FBQSxDQUFB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R0FBSSxDQUFBLEVBQUEsQ0FBRyxDQUFJLEtBQUMsQ0FBQSxHQUE1QjtVQUFxQyxLQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBRSxLQUFLLENBQUM7O2VBRWxELEtBQUMsQ0FBQSxNQUFEO09BVkc7YUFXTDs7O0lBOURpRCIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBpbGVcbiMgKiByZXF1aXJlXG5yZXF1aXJlISB7XG4gIGJsdWViaXJkOiBwXG4gIGxlc2hkYXNoOiB7IHcsIGZpbmQsIG9taXQsIGZpbHRlciwgcGljaywga2V5cywgdmFsdWVzLCBwb3AsIGFzc2lnbiwgZWFjaCwgcmVkdWNlLCBmbGF0dGVuRGVlcCwgcHVzaCwgbWFwLCBtYXBWYWx1ZXMsIG9taXQgfSAgXG4gIG1vbWVudFxuICAnbW9tZW50LXJhbmdlJ1xufVxuXG4jICogVHlwZSBjb2VyY2lvbiBmdW5jdGlvbnMgZm9yIGEgbW9yZSBjaGlsbGVkIG91dCBBUElcbmZvcm1hdCA9IGV4cG9ydHMuZm9ybWF0ID0gLT4gaXQuZm9ybWF0ICdZWVlZLU1NLUREJ1xuXG5wYXJzZSA9IGV4cG9ydHMucGFyc2UgPSBkbyBcbiAgIyAoYW55KSAtPiBFdmVudCB8IEVycm9yXG4gIGV2ZW50OiAtPlxuICAgIGlmIGl0P2lzRXZlbnQ/IHRoZW4gcmV0dXJuIGl0XG4gICAgICBcbiAgICBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgT2JqZWN0ID0+IG5ldyBFdmVudCBpdFxuICAgICAgfCBvdGhlcndpc2UgPT5cbiAgICAgICAgY29uc29sZS5sb2cgaXRcbiAgICAgICAgY29uc29sZS5sb2cgU3RyaW5nIGl0XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcImludmFsaWQgdHlwZSBmb3IgZXZlbnQgI3tpdD90b1N0cmluZz8hfSAje2l0P0BAfVwiXG5cbiAgIyAoYW55KSAtPiBNZW1FdmVudHMgfCBFcnJvclxuICBldmVudHM6IC0+XG4gICAgaWYgaXQ/aXNFdmVudHM/IHRoZW4gcmV0dXJuIGl0XG4gICAgICBcbiAgICBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgQXJyYXkgPT4gbmV3IE1lbUV2ZW50cyBpdFxuICAgICAgfCBvdGhlcndpc2UgPT4gbmV3IE1lbUV2ZW50cyBwYXJzZS5ldmVudCBpdFxuXG4gICMgKEFueSkgLT4gQXJyYXk8RXZlbnQ+IHwgRXJyb3JcbiAgZXZlbnRBcnJheTogLT5cbiAgICBmbGF0dGVuRGVlcCBzd2l0Y2ggaXQ/QEBcbiAgICAgIHwgQXJyYXkgPT4gbWFwIGl0LCBwYXJzZS5ldmVudEFycmF5XG4gICAgICB8IE1lbUV2ZW50cyA9PiBpdC50b0FycmF5KClcbiAgICAgIHwgb3RoZXJ3aXNlID0+IFsgcGFyc2UuZXZlbnQgaXQgXVxuICAgICAgICBcbiAgIyAoIEV2ZW50cyB8IEV2ZW50IHwgdm9pZCApIC0+IFJhbmdlXG4gIHJhbmdlOiAoc29tZXRoaW5nLCBkZWYpIC0+XG4gICAgc3dpdGNoIHNvbWV0aGluZz9AQFxuICAgICAgfCBmYWxzZSA9PiBkZWYgb3Igdm9pZFxuICAgICAgfCBPYmplY3QgPT4gbW9tZW50LnJhbmdlIHNvbWV0aGluZ1xuICAgICAgfCBBcnJheSA9PiBtb21lbnQucmFuZ2Ugc29tZXRoaW5nXG4gICAgICB8IEV2ZW50ID0+IHNvbWV0aGluZy5yYW5nZSFcbiAgICAgIHwgTWVtRXZlbnRzID0+IHNvbWV0aGluZy5yYW5nZSFcbiAgICAgIHwgb3RoZXJ3aXNlID0+IHNvbWV0aGluZy5yYW5nZT8hIG9yIHNvbWV0aGluZ1xuICAgIFxuIyAoIEV2ZW50cyB8IEFycmF5PEV2ZW50PiB8IEV2ZW50IHwgdm9pZCApIC0+IEFycmF5PEV2ZW50PlxuICBldmVudENvbGxlY3Rpb246IChzb21ldGhpbmcpIC0+XG4gICAgc3dpdGNoIHNvbWV0aGluZz9AQFxuICAgICAgfCB2b2lkID0+IFtdXG4gICAgICB8IEV2ZW50ID0+IFsgRXZlbnQgXVxuICAgICAgfCBFdmVudHMgPT4gRXZlbnRzLnRvQXJyYXkoKVxuICAgICAgfCBBcnJheSA9PiBmbGF0dGVuRGVlcCBzb21ldGhpbmdcbiAgICAgIHwgb3RoZXJ3aXNlID0+IHRocm93ICd3aGF0IGlzIHRoaXMnXG5cbiMgKiBFdmVudExpa2VcbiMgbW9yZSBvZiBhIHNwZWMgdGhlbiBhbnl0aGluZywgdGhpcyBpcyBpbXBsZW1lbnRlZCBieSBFdmVudCAmIEV2ZW50c1xuXG5FdmVudExpa2UgPSBleHBvcnRzLkV2ZW50TGlrZSA9IGNsYXNzIEV2ZW50TGlrZVxuXG4gICMgZmV0Y2hlcyBhbGwgZXZlbnRzIGZyb20gYSBjb2xsZWN0aW9uIHJlbGV2YW50IHRvIGN1cnJlbnQgZXZlbnQgKGJ5IHR5cGUgYW5kIHJhbmdlKVxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHJlbGV2YW50RXZlbnRzOiAoZXZlbnRzKSAtPlxuICAgIHBhcnNlLmV2ZW50cyBldmVudHNcbiAgICAuZmlsdGVyIHJhbmdlOiBAICMsIHR5cGU6IEB0eXBlICMjIFRPRE9cblxuICBuZWlnaGJvdXJzOiAoZXZlbnRzKSAtPlxuICAgIFtcbiAgICAgIGV2ZW50cy5maWx0ZXIgZW5kOiBAc3RhcnQuY2xvbmUoKVxuICAgICAgZXZlbnRzLmZpbHRlciBzdGFydDogQGVuZC5jbG9uZSgpXG4gICAgXVxuXG4gICMgZ2V0IG9yIHNldCByYW5nZVxuICAjIChyYW5nZT8pIC0+IG1vbWVudC5yYW5nZVxuICByYW5nZTogKHNldFJhbmdlKSAtPlxuICAgIGlmIHJhbmdlID0gc2V0UmFuZ2VcbiAgICAgIEBzdGFydCA9IHJhbmdlLnN0YXJ0LmNsb25lKClcbiAgICAgIEBlbmQgPSByYW5nZS5lbmQuY2xvbmUoKVxuICAgIGVsc2VcbiAgICAgIHJhbmdlID0gbmV3IG1vbWVudC5yYW5nZSBAc3RhcnQsIEBlbmRcbiAgICAgIFxuICAgIHJhbmdlXG5cbiAgIyAoIEV2ZW50TGlrZSApIC0+IEV2ZW50c1xuICBwdXNoOiAoZXZlbnQpIC0+IC4uLlxuICBcbiAgIyAoIEV2ZW50TGlrZSApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdDogKHNvbWV0aGluZykgLT5cbiAgICBpZiBzb21ldGhpbmcgaW5zdGFuY2VvZiBFdmVudHMgdGhlbiBAc3VidHJhY3RNYW55IHNvbWV0aGluZ1xuICAgIGVsc2UgQHN1YnRyYWN0T25lIHNvbWV0aGluZ1xuICAgIFxuICAjICggRXZlbnRMaWtlLCAoRXZlbnQsIEV2ZW50KSAtPiBFdmVudHMpIC0+IEV2ZW50c1xuICBjb2xsaWRlOiAoZXZlbnRzLCBjYikgLT4gLi4uXG5cbiAgZWFjaDogLT4gLi4uXG5cbiAgc3VidHJhY3RNYW55OiAtPiAuLi5cblxuICBzdWJ0cmFjdE9uZTogLT4gLi4uXG5cbiMgKiBFdmVudFxuIyByZXByZXNlbnRzIHNvbWUgZXZlbnQgaW4gdGltZSwgZGVmaW5lZCBieSBzdGFydCBhbmQgZW5kIHRpbWVzdGFtcHNcbiMgY2FyaWVzIHNvbWUgcGF5bG9hZCwgbGlrZSBhIHByaWNlIG9yIGEgYm9va2luZ1xuXG5wYXJzZUluaXQgPSAoZGF0YSkgLT5cbiAgaWYgbm90IGRhdGEgdGhlbiByZXR1cm4ge31cbiAgaWYgZGF0YS5jZW50ZXIgdGhlbiByZXR1cm4geyBzdGFydDogZGF0YS5zdGFydCwgZW5kOiBkYXRhLmVuZCB9XG4gIGlmIGRhdGEucmFuZ2VcbiAgICBkYXRhLnN0YXJ0ID0gZGF0YS5yYW5nZS5zdGFydFxuICAgIGRhdGEuZW5kID0gZGF0YS5yYW5nZS5lbmRcbiAgICBkZWxldGUgZGF0YS5yYW5nZVxuXG4gIGlmIGRhdGEuc3RhcnQ/QEAgaXMgU3RyaW5nIHRoZW4gZGF0YS5zdGFydCA9IG1vbWVudCBkYXRhLnN0YXJ0XG4gIGlmIGRhdGEuZW5kP0BAIGlzIFN0cmluZyB0aGVuIGRhdGEuZW5kID0gbW9tZW50IGRhdGEuZW5kXG4gICAgXG4gIGlmIGRhdGFAQCBpc250IE9iamVjdCB0aGVuIHJldHVybiBcInd1dCB3dXRcIlxuICBlbHNlIHJldHVybiBkYXRhXG5cbkV2ZW50ID0gZXhwb3J0cy5FdmVudCA9IGNsYXNzIEV2ZW50IGV4dGVuZHMgRXZlbnRMaWtlXG4gIGlzRXZlbnQ6IHRydWVcbiAgXG4gIChpbml0KSAtPiBhc3NpZ24gQCwgcGFyc2VJbml0IGluaXRcblxuICBjb21wYXJlOiAoZXZlbnQpIC0+XG4gICAgWyBAaXNTYW1lUmFuZ2UoZXZlbnQpLCBAaXNTYW1lUGF5bG9hZChldmVudCkgXVxuXG4gIGlzU2FtZTogKGV2ZW50KSAtPlxuICAgIEBpc1NhbWVSYW5nZShldmVudCkgYW5kIEBpc1NhbWVQYXlsb2FkKGV2ZW50KVxuXG4gIGlzU2FtZVJhbmdlOiAoZXZlbnQpIC0+XG4gICAgZXZlbnQgPSBwYXJzZS5ldmVudCBldmVudFxuICAgIEByYW5nZSEuaXNTYW1lIGV2ZW50LnJhbmdlIVxuICAgIFxuICBpc1NhbWVQYXlsb2FkOiAoZXZlbnQpIC0+XG4gICAgZXZlbnQgPSBwYXJzZS5ldmVudCBldmVudFxuICAgIEB0eXBlIGlzIGV2ZW50LnR5cGUgYW5kIEBwYXlsb2FkIGlzIGV2ZW50LnBheWxvYWRcbiAgXG4gIGNsb25lOiAoZGF0YT17fSkgLT5cbiAgICByZXQgPSBuZXcgRXZlbnQgYXNzaWduIHt9LCBALCB7IGlkOiBAaWQgKyAnLWNsb25lJ30sIGRhdGFcbiAgICBkZWxldGUgcmV0LnJlcHJcbiAgICByZXRcblxuICAjICgpIC0+IEpzb25cbiAgc2VyaWFsaXplOiAtPlxuICAgIGFzc2lnbiB7fSwgQCwgbWFwVmFsdWVzIChwaWNrIEAsIDxbIHN0YXJ0IGVuZCBdPiksICh2YWx1ZSkgLT4gdmFsdWUuZm9ybWF0IFwiWVlZWS1NTS1ERCBISDptbTpzc1wiXG5cbiAgIyAoKSAtPiBTdHJpbmdcbiAgdG9TdHJpbmc6IC0+XG4gICAgc3RhcnQgPSBmb3JtYXQgQHN0YXJ0XG4gICAgZW5kID0gZm9ybWF0IEBlbmRcbiAgICBpZiBAcHJpY2UgdGhlbiBcIlByaWNlKFwiICsgQHByaWNlICsgXCIgXCIgKyBzdGFydCArIFwiKVwiXG4gICAgZWxzZSBcIkV2ZW50KFwiICsgKEBpZCBvciBcInVuc2F2ZWQtXCIgKyBAdHlwZSkgICsgXCIpXCJcbiAgICBcbiAgIyAoIEV2ZW50cyApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE1hbnk6IChldmVudHMpIC0+XG4gICAgQHJlbGV2YW50RXZlbnRzIGV2ZW50c1xuICAgIC5yZWR1Y2UgZG9cbiAgICAgIChyZXMsIGV2ZW50KSB+PiByZXMuc3VidHJhY3RPbmUgZXZlbnRcbiAgICAgIG5ldyBNZW1FdmVudHMgQFxuICAgICAgXG4gICMgKCBFdmVudCApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE9uZTogKGV2ZW50KSAtPlxuICAgIGNudCA9IDBcbiAgICBuZXcgTWVtRXZlbnRzIG1hcCBkb1xuICAgICAgQHJhbmdlKCkuc3VidHJhY3QgZXZlbnQucmFuZ2UoKVxuICAgICAgfj4gQGNsb25lIHsgc3RhcnQ6IGl0LnN0YXJ0LCBlbmQ6IGl0LmVuZCwgaWQ6IEBpZCArICctJyArIGNudCsrIH0gIyBnZXQgcmlkIG9mIHBvdGVudGlhbCBvbGQgcmVwciwgdGhpcyBpcyBhIG5ldyBldmVudFxuXG4gICMgKCBFdmVudHMsIChFdmVudCwgRXZlbnQpIC0+IEV2ZW50cyApIC0+IEV2ZW50c1xuICBjb2xsaWRlOiAoZXZlbnRzLCBjYikgLT5cbiAgICBAcmVsZXZhbnRFdmVudHMgZXZlbnRzXG4gICAgLnJlZHVjZSAoZXZlbnRzLCBldmVudCkgfj4gZXZlbnRzLnB1c2htIGNiIGV2ZW50LCBAXG5cbiAgZWFjaDogKGNiKSAtPiBjYiBAXG4gICAgXG4gIG1lcmdlOiAoZXZlbnQpIC0+XG4gICAgbmV3U2VsZiA9IEBjbG9uZSgpXG4gICAgaWYgZXZlbnQuc3RhcnQgPCBuZXdTZWxmLnN0YXJ0IHRoZW4gbmV3U2VsZi5zdGFydCA9IGV2ZW50LnN0YXJ0XG4gICAgaWYgZXZlbnQuZW5kID4gbmV3U2VsZi5lbmQgdGhlbiBuZXdTZWxmLmVuZCA9IGV2ZW50LmVuZFxuICAgIG5ld1NlbGZcbiAgICBcblxuUGVyc2lzdExheWVyID0gZXhwb3J0cy5QZXJzaXN0TGF5ZXIgPSBjbGFzc1xuICBtYXJrUmVtb3ZlOiAtPiBAdG9SZW1vdmUgPSB0cnVlXG4gIFxuICBzYXZlOiAtPiBuZXcgcCAocmVzb2x2ZSxyZWplY3QpIH4+XG4gICAgaWYgQHRvUmVtb3ZlIHRoZW4gcmVzb2x2ZSBAcmVtb3ZlIVxuICAgIGVsc2UgLi4uXG4gICAgICBcbiAgcmVtb3ZlOiAtPiBuZXcgcCAocmVzb2x2ZSxyZWplY3QpIH4+IC4uLlxuXG4jICogRXZlbnRzXG4jIGFic3RyYWN0IGV2ZW50IGNvbGxlY3Rpb25cbiMgc3VwcG9ydGluZyBjb21tb24gc2V0IG9wZXJhdGlvbnMsXG4jIGFuZCBzb21lIHVuY29tbW9uIG9wZXJhdGlvbnMgcmVsYXRlZCB0byB0aW1lIChjb2xsaWRlLCBzdWJ0cmFjdClcbiBcbkV2ZW50cyA9IGV4cG9ydHMuRXZlbnRzID0gY2xhc3MgRXZlbnRzIGV4dGVuZHMgRXZlbnRMaWtlXG5cbiAgIyBwZXIgZGF5IGRhdGEgKGFpcmJuYiBhcGkgaGVscGVyKVxuICBkYXlzOiAoY2IpIC0+IEBlYWNoIChldmVudCkgLT4gZXZlbnQucmFuZ2UhYnkgJ2RheXMnLCB+PiBjYiBpdCwgZXZlbnRcblxuICBpc0V2ZW50czogdHJ1ZVxuICAoLi4uZXZlbnRzKSAtPiBAcHVzaG0uYXBwbHkgQCwgZXZlbnRzXG5cbiAgIyAoIE1vbWVudFJhbmdlLCBPYmplY3QgKSAtPiBFdmVudHNcbiAgX2ZpbmQ6IChyYW5nZSwgcGF0dGVybikgLT4gLi4uXG4gICAgXG4gICMgKCByYW5nZUVxdWl2YWxlbnQgKSAtPiBFdmVudHNcbiMgIGNsb25lOiAocmFuZ2VFcXVpdmFsZW50KSB+PiAuLi5cblxuICAjICggRXZlbnRDb2xsZWN0aW9uKSAtPiBFdmVudHNcbiAgcHVzaG06IChldmVudENvbGxlY3Rpb24pIC0+IHRydWVcblxuICAjICggRXZlbnRDb2xsZWN0aW9uKSAtPiBFdmVudHNcbiAgcHVzaDogKGV2ZW50Q29sbGVjdGlvbikgLT4gQGNsb25lIGV2ZW50c1xuXG4gICMgKCkgLT4gRXZlbnRzXG4gIHdpdGhvdXQ6IC0+ICAuLi5cblxuICAjICggRnVuY3Rpb24gKSAtPiB2b2lkXG4gIGVhY2g6IChjYikgLT4gQF9lYWNoIGNiXG5cbiAgIyAoKSAtPiBTdHJpbmdcbiAgdG9TdHJpbmc6IC0+IFwiRVsje0BsZW5ndGh9XSA8IFwiICsgKEBtYXAgKGV2ZW50KSAtPiBcIlwiICsgZXZlbnQpLmpvaW4oXCIsIFwiKSArIFwiID5cIlxuXG4gICMgKCkgLT4gSnNvblxuICBzZXJpYWxpemU6IC0+IEBtYXAgKC5zZXJpYWxpemUhKVxuXG4gICMgKCkgLT4gQXJyYXk8RXZlbnQ+XG4gIHRvQXJyYXk6IC0+XG4gICAgcmV0ID0gW11cbiAgICBAZWFjaCAtPiByZXQucHVzaCBpdFxuICAgIHJldFxuXG4gICMgKCAoRXZlbnQpIC0+IGFueSkgKSAtPiBBcnJheTxhbnk+XG4gIG1hcDogKGNiKSAtPlxuICAgIHJldCA9IFtdXG4gICAgQGVhY2ggKGV2ZW50KSAtPiByZXQucHVzaCBjYiBldmVudFxuICAgIHJldFxuICAgICAgICAgICAgXG4gICMgKCAoRXZlbnRzLCBFdmVudCkgLT4gRXZlbnRzICkgLT4gQXJyYXk8YW55PlxuICByYXdSZWR1Y2U6IChjYiwgbWVtbykgLT5cbiAgICBAZWFjaCAoZXZlbnQpIC0+IG1lbW8gOj0gY2IgbWVtbywgZXZlbnRcbiAgICBtZW1vXG4gICAgXG4gICMgKCAoRXZlbnRzLCBFdmVudCkgLT4gRXZlbnRzICkgLT4gRXZlbnRzXG4gIHJlZHVjZTogKGNiLCBtZW1vKSAtPlxuICAgIGlmIG5vdCBtZW1vIHRoZW4gbWVtbyA9IG5ldyBNZW1FdmVudHMoKVxuICAgIEByYXdSZWR1Y2UgY2IsIG1lbW9cblxuICAjICggeyByYW5nZTogUmFuZ2UsIC4uLiB9ICkgLT4gRXZlbnRzXG4gIGZpbHRlcjogKHBhdHRlcm4pIC0+XG4gICAgQF9maWx0ZXIgZG9cbiAgICAgIHBhcnNlLnJhbmdlIHBhdHRlcm4ucmFuZ2VcbiAgICAgIG9taXQgcGF0dGVybiwgJ3JhbmdlJ1xuXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgdXBkYXRlUHJpY2U6IChwcmljZURhdGEpIC0+ICAgIFxuICAgIHBhcnNlLmV2ZW50cyBwcmljZURhdGFcbiAgICAucmVkdWNlIChyZXMsIGV2ZW50KSB+PlxuXG4gICAgICB0YXJnZXRzID0gZXZlbnQucmVsZXZhbnRFdmVudHMgQFxuICAgICAgXG4gICAgICBpZiBub3QgdGFyZ2V0cy5sZW5ndGggdGhlbiByZXR1cm4gcmVzLnB1c2htIGV2ZW50XG4gICAgICAgIFxuICAgICAgcmVzLnB1c2htIHRhcmdldHMuY29sbGlkZSBldmVudCwgKGV2ZW50MSwgZXZlbnQyKSAtPlxuICAgICAgICBpZiBldmVudDEucHJpY2UgaXMgZXZlbnQyLnByaWNlXG4gICAgICAgICAgcmVzLnB1c2htIGV2ZW50Mi5jbG9uZSByYW5nZTogZXZlbnQxLnJhbmdlIWFkZCBldmVudDIucmFuZ2UhXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXMucHVzaG0gWyBldmVudDEsIGV2ZW50Mi5zdWJ0cmFjdChldmVudDEpIF1cblxuICBkaWZmOiAoZXZlbnRzKSAtPlxuICAgIG1ha2VEaWZmID0gKGRpZmYsIGV2ZW50KSB+PlxuICAgICAgY29sbGlzaW9ucyA9IGV2ZW50LnJlbGV2YW50RXZlbnRzIGRpZmZcbiAgICAgIGlmIG5vdCBjb2xsaXNpb25zLmxlbmd0aCB0aGVuIHJldHVybiBkaWZmXG4gICAgICBlbHNlXG4gICAgICBcbiAgICAgICAgcmV0dXJuIGRpZmYucG9wbShjb2xsaXNpb25zKS5wdXNobSBjb2xsaXNpb25zLnJlZHVjZSAocmVzLCBjb2xsaXNpb24pIC0+XG4gICAgICAgICAgWyByYW5nZSwgcGF5bG9hZCBdID0gZXZlbnQuY29tcGFyZSBjb2xsaXNpb25cbiAgICAgICAgICBcbiAgICAgICAgICBpZiBub3QgcmFuZ2UgYW5kIG5vdCBwYXlsb2FkIHRoZW4gcmV0dXJuIHJlcy5wdXNobSBjb2xsaXNpb25cbiAgICAgICAgICBpZiBwYXlsb2FkIHRoZW4gcmV0dXJuIHJlcy5wdXNobSBjb2xsaXNpb24uc3VidHJhY3QgZXZlbnRcbiAgICAgICAgICBpZiByYW5nZSB0aGVuIHJldHVybiByZXMucHVzaG0gY29sbGlzaW9uXG4gICAgICAgICAgcmV0dXJuIHJlc1xuXG4gICAgZXZlbnRzID0gcGFyc2UuZXZlbnRzIGV2ZW50c1xuICAgIEByZWR1Y2UgbWFrZURpZmYsIGV2ZW50cy5jbG9uZSgpXG5cbiAgYXBwbHk6IChldmVudHMpIC0+XG4gICAgQHJlZHVjZSBkb1xuICAgICAgKFsgY3JlYXRlLCByZW1vdmUgXSwgZXZlbnQpIH4+XG5cbiAgICAgICAgaWYgKHJlbGV2YW50RXZlbnRzID0gZXZlbnQucmVsZXZhbnRFdmVudHMoZXZlbnRzKSkubGVuZ3RoXG4gICAgICAgICAgcmVtb3ZlLnB1c2htIGV2ZW50XG4gICAgICAgICAgY3JlYXRlLnB1c2htIGV2ZW50LnN1YnRyYWN0IHJlbGV2YW50RXZlbnRzXG5cbiAgICAgICAgWyBjcmVhdGUsIHJlbW92ZSBdXG5cbiAgICAgIFsgZXZlbnRzLmNsb25lKCksIG5ldyBNZW1FdmVudHMoKSBdXG4gICAgXG4gIG1lcmdlOiAtPlxuICAgIEByZWR1Y2UgKHJlcywgZXZlbnQpIH4+XG4gICAgICBldmVudFxuICAgICAgLm5laWdoYm91cnMoQClcbiAgICAgIC5tYXAgKG9sZEV2ZW50KSAtPiBcbiAgICAgICAgaWYgb2xkRXZlbnQubGVuZ3RoIGFuZCBvbGRFdmVudC5wYXlsb2FkIGlzIG9sZEV2ZW50LnBheWxvYWQgdGhlbiBvbGRFdmVudC5tZXJnZSBldmVudFxuICAgIFxuICAjICggRXZlbnRzICkgLT4gRXZlbnRzXG4gIHVuaW9uOiAoZXZlbnRzKSAtPlxuICAgIHJlcyA9IEBjbG9uZSgpXG4gICAgZXZlbnRzLmVhY2ggfj4gcmVzLnB1c2htIGl0XG4gICAgcmVzXG5cbiAgIyAoIChFdmVudHMsIChFdmVudDEsIEV2ZW50MikgLT4gRXZlbnRzICkgLT4gRXZlbnRzXG4gIGNvbGxpZGU6IChldmVudHMsIGNiKSAtPlxuICAgIEByZWR1Y2UgKG1lbW8sIGV2ZW50KSAtPiBtZW1vLnB1c2htIGV2ZW50LmNvbGxpZGUgZXZlbnRzLCBjYlxuXG4gICMgKCBFdmVudCApIC0+IEV2ZW50c1xuICBzdWJ0cmFjdE9uZTogKGV2ZW50KSAtPlxuICAgIEByZWR1Y2UgKHJldCwgY2hpbGQpIC0+IHJldC5wdXNobSBjaGlsZC5zdWJ0cmFjdCBldmVudFxuXG4gICMgKCBFdmVudHMgKSAtPiBFdmVudHNcbiAgc3VidHJhY3RNYW55OiAoZXZlbnRzKSAtPlxuICAgIEByZWR1Y2UgKHJldCwgY2hpbGQpIC0+IHJldC5wdXNobSBjaGlsZC5zdWJ0cmFjdE1hbnkgZXZlbnRzXG5cbiAgXG4jICogTWVtRXZlbnRzXG4jIEluIG1lbW9yeSBFdmVudCBjb2xsZWN0aW9uIGltcGxlbWVudGF0aW9uLFxuIyB0aGlzIGlzIGEgdmVyeSBuYWl2ZSBpbXBsZW1lbnRhdGlvblxuIyBcbiMgSSBndWVzcyB3ZSBzaG91bGQgdXNlIHJhbmdlIHRyZWUgZGF0YSBzdHJ1Y3R1cmUgb3Igc29tZXRoaW5nIHNtYXJ0IGxpa2UgdGhhdCBmb3IgZmFzdCByYW5nZSBzZWFyY2ggaW4gdGhlIGZ1dHVyZS5cbiMgaXRzIGdvb2QgZW5vdWdoIGZvciBub3cgZXZlbiBpZiB3ZSBlbmQgdXAgcXVhZHJhdGljIGNvbXBsZXhpdHkgZm9yIGFsZ29zLCB3ZSBhcmUgbm90IHBhcnNpbmcgbWFueSBldmVudHMgcGVyIHByb3BlcnR5LlxuIyBcbk1lbUV2ZW50cyA9IGV4cG9ydHMuTWVtRXZlbnRzID0gY2xhc3MgTWVtRXZlbnRzTmFpdmUgZXh0ZW5kcyBFdmVudHNcbiAgLT5cbiAgICBhc3NpZ24gQCwgZG9cbiAgICAgIGV2ZW50czogIHt9XG4gICAgICBsZW5ndGg6IDBcbiAgICAgIHR5cGU6IHt9XG4gICAgc3VwZXIgLi4uXG4gIFxuICB3aXRob3V0OiAoZXZlbnQpIC0+XG4gICAgbmV3IE1lbUV2ZW50cyBmaWx0ZXIgKHZhbHVlcyBAZXZlbnRzKSwgLT4gaXQuaWQgaXNudCBldmVudC5pZFxuICAgIFxuICB0b0FycmF5OiAtPiB2YWx1ZXMgQGV2ZW50c1xuXG4gIF9lYWNoOiAoY2IpIC0+IGVhY2ggQGV2ZW50cywgY2JcblxuICBfcmFuZ2VTZWFyY2g6IChyYW5nZSkgLT5cbiAgICBmaWx0ZXIgQGV2ZW50cywgLT5cbiAgICAgIHJhbmdlLmNvbnRhaW5zIGl0LnN0YXJ0IG9yIHJhbmdlLmNvbnRhaW5zIGl0LmVuZCBvciBpdC5yYW5nZSEuY29udGFpbnMgcmFuZ2VcbiAgICAgICAgICAgICAgICAgIFxuICBfZmlsdGVyOiAocmFuZ2UsIHBhdHRlcm4pIC0+XG4gICAgcmV0ID0gbmV3IE1lbUV2ZW50cygpXG4gICAgXG4gICAgaWYgcmFuZ2UgdGhlbiBldmVudHMgPSBAX3JhbmdlU2VhcmNoIHJhbmdlXG4gICAgZWxzZSBldmVudHMgPSB2YWx1ZXMgQGV2ZW50c1xuXG4gICAgY2hlY2tQYXR0ZXJuID0gKHBhdHRlcm4pIC0+XG4gICAgICAoZXZlbnQpIC0+XG4gICAgICAgIG5vdCBmaW5kIHBhdHRlcm4sICh2YWx1ZSwga2V5KSAtPlxuICAgICAgICAgIGlmIHZhbHVlIGlzIHRydWUgdGhlbiByZXR1cm4gbm90IGV2ZW50W2tleV0/XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgbm90IG1vbWVudC5pc01vbWVudCB2YWx1ZVxuICAgICAgICAgICAgICBpZiBldmVudFtrZXldIGlzIHZhbHVlIHRoZW4gcmV0dXJuIGZhbHNlIGVsc2UgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIG5vdCB2YWx1ZS5pc1NhbWUgZXZlbnRba2V5XVxuICAgICAgICAgICAgICBcbiAgICByZXQucHVzaG0gZmlsdGVyIGV2ZW50cywgY2hlY2tQYXR0ZXJuIHBhdHRlcm5cbiAgICByZXRcblxuICBjbG9uZTogKHJhbmdlKSAtPlxuICAgIG5ldyBNZW1FdmVudHMgdmFsdWVzIEBldmVudHNcblxuICBwb3BtOiAoLi4uZXZlbnRzKSAtPiBcbiAgICBlYWNoIHBhcnNlLmV2ZW50QXJyYXkoZXZlbnRzKSwgKGV2ZW50KSB+PlxuICAgICAgaWYgbm90IGV2ZW50IHRoZW4gcmV0dXJuXG4gICAgICBpZiBub3QgQGV2ZW50c1tldmVudC5pZF0/IHRoZW4gcmV0dXJuXG4gICAgICBlbHNlXG4gICAgICAgIGRlbGV0ZSBAZXZlbnRzW2V2ZW50LmlkXVxuICAgICAgICBAbGVuZ3RoLS1cbiAgICBAXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVzaG06ICguLi5ldmVudHMpIC0+XG4gICAgZWFjaCBwYXJzZS5ldmVudEFycmF5KGV2ZW50cyksIChldmVudCkgfj5cbiAgICAgIGlmIG5vdCBldmVudCB0aGVuIHJldHVyblxuICAgICAgaWYgQGV2ZW50c1tldmVudC5pZF0/IHRoZW4gcmV0dXJuXG4gICAgICBAZXZlbnRzW2V2ZW50LmlkXSA9IGV2ZW50XG4gICAgICBAdHlwZVtldmVudC50eXBlXSA9IHRydWVcblxuXG4gICAgICBpZiBldmVudC5zdGFydCA8IEBzdGFydCBvciBub3QgQHN0YXJ0IHRoZW4gQHN0YXJ0ID0gZXZlbnQuc3RhcnRcbiAgICAgIGlmIGV2ZW50LmVuZCA8IEBlbmQgb3Igbm90IEBlbmQgdGhlbiBAZW5kID0gZXZlbnQuZW5kXG4gICAgICBcbiAgICAgIEBsZW5ndGgrK1xuICAgIEBcbiAgXG4iXX0=

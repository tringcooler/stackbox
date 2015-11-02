
var __extends = this.__extends || function (d, b) {
	// for property own by base_class itself
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	/*
	for property define in constructor
	inhert_class's constructor must excute base_class's constructor by base_class.apply(this)
	*/
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
	/*
	new object means:
	obj.__proto__ = class.prototype
	extends means:
	inhert_class.prototype.__proto__ = base_class.prototype
	then:
	inhert_class.prototype must be created by new base_class without constructor
	*/
    d.prototype = new __();
};

/*************************************************************************************/

var stackbox_main = (function() {
	function stackbox_main() {
		
	}
	return stackbox_main;
})();

/*************************************************************************************/

var stackbox_type_position = (function() {
	function stackbox_type_position(x, y, z) {
		this.x = x;
		this.y = y;
		if(z === undefined)
			z = null;
		this.z = z;
	}
	stackbox_type_position.prototype.dim = function() {
		if(this.z == null)
			return 2;
		else
			return 3;
	};
	stackbox_type_position.prototype.tuple = function() {
		if(this.z == null)
			return [this.x, this.y];
		else
			return [this.x, this.y, this.z];
	};
	stackbox_type_position.prototype.assign = function(p) {
		this.x = p.x;
		this.y = p.y;
		this.z = p.z;
	};
	stackbox_type_position.prototype.copy = function() {
		return new stackbox_type_position(this.x, this.y, this.z);
	};
	stackbox_type_position.prototype.eq = function(p) {
		return this.x == p.x && this.y == p.y;
	};
	stackbox_type_position.prototype.is_zero = function() {
		return this.x == 0 && this.y == 0;
	};
	stackbox_type_position.prototype.add = function(p) {
		this.x += p.x;
		this.y += p.y;
		if(this.z != null || p.z != null)
			this.z += p.z;
	};
	stackbox_type_position.prototype.sub = function(p) {
		this.x -= p.x;
		this.y -= p.y;
		if(this.z != null || p.z != null)
			this.z -= p.z;
	};
	stackbox_type_position.prototype.plus = function(p) {
		var r = this.copy();
		r.add(p);
		return r;
	};
	stackbox_type_position.prototype.minus = function(p) {
		var r = this.copy();
		r.sub(p);
		return r;
	};
	stackbox_type_position.prototype.flat = function() {
		var r = this.copy();
		r.z = null;
		return r;
	};
	return stackbox_type_position;
})();

var stackbox_type_range = (function() {
	function stackbox_type_range() {
		argv = stackbox_util.parse_argv(arguments, {
			"pos": ["top", "bot"],
			"poslen": ["top", "len", "dummy"],
			"val2": ["topx", "topy", "botx", "boty"],
			"val3": ["topx", "topy", "topz", "botx", "boty", "botz"],
		});
		var top, bot;
		switch(argv.patt) {
			case 'pos':
				top = argv.top;
				bot = argv.bot;
				break;
			case 'poslen':
				top = argv.top;
				bot = argv.len.plus(top);
				break;
			case 'val2':
				top = new stackbox_type_position(argv.topx, argv.topy);
				bot = new stackbox_type_position(argv.botx, argv.boty);
				break;
			case 'val3':
				top = new stackbox_type_position(argv.topx, argv.topy, argv.topz);
				bot = new stackbox_type_position(argv.botx, argv.boty, argv.botz);
				break;
			default:
				throw 'args error';
		}
		if(top.dim() != bot.dim()) throw 'range assert';
		if(top.x > bot.x || top.y > bot.y || (bot.z != null && top.z > bot.z)) throw 'range assert';
		this.top = top;
		this.bot = bot;
	}
	stackbox_type_range.prototype.dim = function() {
		if(this.top.dim() == 3)
			return 3;
		else
			return 2;
	};
	stackbox_type_range.prototype.add = function(pos) {
		this.top.add(pos);
		this.bot.add(pos);
	};
	stackbox_type_range.prototype.sub = function(pos) {
		this.top.sub(pos);
		this.bot.sub(pos);
	};
	stackbox_type_range.prototype.plus = function(pos) {
		return new stackbox_type_range(
			this.top.plus(pos),
			this.bot.plus(pos)
		);
	};
	stackbox_type_range.prototype.minus = function(pos) {
		return new stackbox_type_range(
			this.top.minus(pos),
			this.bot.minus(pos)
		);
	};
	stackbox_type_range.prototype.move_to = function(pos) {
		var _bot = this.len();
		var _top = pos.copy();
		if(this.dim() == 3 && _top.dim() == 2)
			_top.z = this.top.z;
		_bot.add(_top);
		return new stackbox_type_range(_top, _bot);
	};
	stackbox_type_range.prototype.len = function(dim) {
		if(dim !== undefined) {
			return this.bot.tuple()[dim] - this.top.tuple()[dim];
		} else {
			var _z = null;
			if(this.dim() == 3)
				_z = this.bot.z - this.top.z;
			return new stackbox_type_position(
				this.bot.x - this.top.x,
				this.bot.y - this.top.y,
				_z
			);
		}
	};
	stackbox_type_range.prototype.copy = function() {
		var _top = this.top.copy();
		var _bot = this.bot.copy();
		return new stackbox_type_range(_top, _bot); 
	};
	stackbox_type_range.prototype.flat = function() {
		var _r = this.copy();
		if(this.dim() == 3) {
			_r.top.z = null;
			_r.bot.z = null;
		}
		return _r;
	};
	stackbox_type_range.prototype.collision_with = function(dst) {
		return !(this.bot.x > dst.top.x
			|| this.top.x < dst.bot.x
			|| this.bot.y > dst.top.y
			|| this.top.y < dst.bot.y
			|| this.bot.z > dst.top.z
			|| this.top.z < dst.bot.z);
	};
	stackbox_type_range.prototype.distance_from = function(dst) {
		var _t1, _t2;
		var _r = [0, 0, null];
		(_t1 = this.bot.x - dst.top.x) > 0 || (_t1 = 0);
		(_t2 = dst.bot.x - this.top.x) > 0 || (_t2 = 0);
		_r[0] = _t2 - _t1;
		(_t1 = this.bot.y - dst.top.y) > 0 || (_t1 = 0);
		(_t2 = dst.bot.y - this.top.y) > 0 || (_t2 = 0);
		_r[1] = _t2 - _t1;
		if(this.dim() == 3 && dst.dim() == 3) {
			(_t1 = this.bot.z - dst.top.z) > 0 || (_t1 = 0);
			(_t2 = dst.bot.z - this.top.z) > 0 || (_t2 = 0);
			_r[2] = _t2 - _t1;
		}
	};
	stackbox_type_range.prototype.max = function(dst) {
		var _top = this.top.copy();
		var _bot = this.bot.copy();
		_top.x = (_top.x > dst.top.x) ? dst.top.x : _top.x;
		_bot.x = (_bot.x < dst.bot.x) ? dst.bot.x : _bot.x;
		_top.y = (_top.y > dst.top.y) ? dst.top.y : _top.y;
		_bot.y = (_bot.y < dst.bot.y) ? dst.bot.y : _bot.y;
		if(this.dim() == 3 && dst.dim() == 3) {
			_top.z = (_top.z > dst.top.z) ? dst.top.z : _top.z;
			_bot.z = (_bot.z < dst.bot.z) ? dst.bot.z : _bot.z;
		} else if(dst.dim() == 3) {
			_top.z = dst.top.z;
			_bot.z = dst.bot.z;
		}
		return new stackbox_type_range(_top, _bot);
	};
	stackbox_type_range.prototype.min = function(dst) {
		var _top = this.top.copy();
		var _bot = this.bot.copy();
		_top.x = (_top.x < dst.top.x) ? dst.top.x : _top.x;
		_bot.x = (_bot.x > dst.bot.x) ? dst.bot.x : _bot.x;
		_top.y = (_top.y < dst.top.y) ? dst.top.y : _top.y;
		_bot.y = (_bot.y > dst.bot.y) ? dst.bot.y : _bot.y;
		if(this.dim() == 3 && dst.dim() == 3) {
			_top.z = (_top.z < dst.top.z) ? dst.top.z : _top.z;
			_bot.z = (_bot.z > dst.bot.z) ? dst.bot.z : _bot.z;
		} else if(dst.dim() == 3) {
			_top.z = dst.top.z;
			_bot.z = dst.bot.z;
		}
		return new stackbox_type_range(_top, _bot);
	};
	return stackbox_type_range;
})();

var stackbox_type_collection = (function() {
	var g_cid = 1;
	function stackbox_type_collection() {
		this.vals = {};
	}
	stackbox_type_collection.prototype.add = function(val) {
		this.vals[g_cid] = val;
		return g_cid++;
	};
	stackbox_type_collection.prototype.remove = function(cid) {
		if(!(cid in this.vals)) return false;
		return (delete this.vals[cid]);
	};
	stackbox_type_collection.prototype.length = function() {
		return Object.keys(this.vals).length;
	};
	return stackbox_type_collection;
})();

var sbtp = {
	'pos': stackbox_type_position,
	'rng': stackbox_type_range,
};

/*************************************************************************************/

var stackbox_atom = (function() {
	function stackbox_atom(range) {
		this.spec = {};
		this.range = range;
	}
	return stackbox_atom;
})();

var stackbox_spec_graph = (function() {
	function stackbox_spec_graph(pos, type, frames) {
		this.pos = pos;
		this.type = type;
		if(frames === undefined)
			frames = {};
		this.frames = frames
	}
	stackbox_spec_graph.prototype.set_frame = function(name, frame) {
		if(frame === undefined)
			delete this.frames[name];
		else
			this.frames[name] = frame;
	};
	return stackbox_spec_graph;
})();

/***********************************DFAN***********************************************/
/*Deterministic Finite Automation Network*/

/* perf_importance: most */
var stackbox_dfan_hook = (function() {
	var g_fid = 1;
	var default_results = function(rslt_list) {return rslt_list[0];};
	function stackbox_dfan_hook() {
		this.func_list = {};
		this.results = default_results;
	}
	stackbox_dfan_hook.prototype.invoke_args = function(args) {
		var rs = [];
		//for(var k in this.func_list) {
		for(var ki = 0, kl = Object.keys(this.func_list), k;
			k = kl[ki], ki < kl.length; ki++) {
			var r = this.func_list[k].apply(this, args);
			if(r !== undefined)
				rs.push(r);
		}
		if(rs.length > 0)
			return this.results(rs);
	};
	stackbox_dfan_hook.prototype.invoke = function() {
		return this.invoke_args(arguments);
	};
	stackbox_dfan_hook.prototype.add = function(func) {
		this.func_list[g_fid] = func;
		return g_fid++;
	};
	stackbox_dfan_hook.prototype.remove = function(fid) {
		if(/*!in*/this.func_list[fid] === undefined) return false;
		return (delete this.func_list[fid]);
	};
	return stackbox_dfan_hook;
})();

/* perf_importance: most */
var stackbox_dfan_hooks = (function() {
	function stackbox_dfan_hooks() {
		this.hooks = {};
	}
	stackbox_dfan_hooks.prototype.invoke = function(hk) {
		if(/*!hasOwnProperty*/this.hooks[hk] === undefined) return;
		var args = Array.prototype.slice.call(arguments, 1);
		return this.hooks[hk].invoke_args(args);
	};
	stackbox_dfan_hooks.prototype.add = function(hk, func) {
		if(/*!hasOwnProperty*/this.hooks[hk] === undefined)
			this.hooks[hk] = new stackbox_dfan_hook();
		var fid = this.hooks[hk].add(func);
		return hk + ':' + fid;
	};
	stackbox_dfan_hooks.prototype.remove = function(hid) {
		var ids = hid.split(':');
		var hk = ids[0];
		var fid = ids[1];
		if(/*!hasOwnProperty*/this.hooks[hk] === undefined) return false;
		return this.hooks[hk].remove(fid);
	};
	stackbox_dfan_hooks.prototype.results_handle = function(hk, func) {
		if(/*!hasOwnProperty*/this.hooks[hk] === undefined) return;
		if(func !== undefined) 
			this.hooks[hk].results = func;
		return this.hooks[hk].results;
	};
	return stackbox_dfan_hooks;
})();

/* perf_importance: most */
var stackbox_dfan_lock_simple = (function() {
	function stackbox_dfan_lock_simple() {}
	stackbox_dfan_lock_simple.prototype.lock = function(hk) {
		this._lock = true;
	};
	stackbox_dfan_lock_simple.prototype.unlock = function(hk) {
		this._lock = false;
	};
	stackbox_dfan_lock_simple.prototype.enable = function() {
		this._disable = false;
	};
	stackbox_dfan_lock_simple.prototype.disable = function() {
		this._disable = true;
	};
	stackbox_dfan_lock_simple.prototype.check = function(hk) {
		return (!!this._lock) && (!this._disable);
	};
	return stackbox_dfan_lock_simple;
})();

var stackbox_dfan_property = (function() {
	var HK_GET = 'get';
	var HK_SET = 'set';
	var HK_CHANGE = 'change';
	var default_eq = function(a, b) {
		return a == b;
	};
	function stackbox_dfan_property(val) {
		if(val === undefined) val = null;
		this._value = val;
		this._hooks = new stackbox_dfan_hooks();
		this._hooks_lock = new stackbox_dfan_lock_simple();
		this.__eq__ = default_eq;
	}
	/* perf_importance: most */
	stackbox_dfan_property.prototype.get = function() {
		var val = this._value;
		if(!this._hooks_lock.check(HK_GET)) {
			this._hooks_lock.lock(HK_GET);
			var r = this._hooks.invoke(HK_GET, r, this);
			if(r !== undefined)
				val = r;
			this._hooks_lock.unlock(HK_GET);
		}
		return val;
	};
	/* perf_importance: most */
	stackbox_dfan_property.prototype.set = function(val) {
		if(!this._hooks_lock.check(HK_SET)) {
			this._hooks_lock.lock(HK_SET);
			var r = this._hooks.invoke(HK_SET, val, this._value, this);
			if(r !== undefined)
				val = r;
			this._hooks_lock.unlock(HK_SET);
		}
		if(!this._hooks_lock.check(HK_CHANGE)) {
			if(!this.__eq__(this._value, val)) {
				this._hooks_lock.lock(HK_CHANGE);
				var r = this._hooks.invoke(HK_CHANGE, val, this._value, this);
				if(r !== undefined)
					val = r;
				this._hooks_lock.unlock(HK_CHANGE);
			}
		}
		this._value = val;
		return val;
	};
	/* perf_importance: much */
	stackbox_dfan_property.prototype.hook = function(hk, func) {
		return this._hooks.add(hk, func);
	};
	/* perf_importance: most */
	stackbox_dfan_property.prototype.results_handle = function(hk, func) {
		return this._hooks.results_handle(hk, func);
	};
	stackbox_dfan_property.prototype.dishook = function(hid) {
		return this._hooks.remove(hid);
	};
	/* perf_importance: much */
	stackbox_dfan_property.prototype.islocked = function(hk) {
		return this._hooks_lock.check(hk);
	};
	return stackbox_dfan_property;
})();

var stackbox_dfan_automaton = (function() {
	var HK_GET = 'get';
	var HK_SET = 'set';
	var HK_CHANGE = 'change';
	var SYM_TRIG = '*';
	var SYM_TRIG_SPLIT = ':';
	var SYM_IMPT = '@';
	var SYM_EXPT = '#';
	var SYM_BYPS = '%';
	function stackbox_dfan_automaton() {
		this._props_info = {};
		this._state = null;
	}
	stackbox_dfan_automaton.prototype.handled_trigger = [
		//HK_GET, HK_SET, HK_CHANGE
		HK_CHANGE
	];
	/* perf_importance: most */
	stackbox_dfan_automaton.prototype._prop_handler = function(name, trigger) {
		if(/*!in*/this._props_info[name].triggers[this._state] === undefined
			|| /*!in*/this._props_info[name].triggers[this._state][trigger] === undefined) return;
		var args = Array.prototype.slice.call(arguments, 2);
		var info = {
			'name': name,
			'trigger': trigger,
		}
		switch(trigger) {
			case HK_GET:
				info['val'] = args[0];
				info['prop'] = args[1];
				break;
			case HK_SET:
			case HK_CHANGE:
				info['val'] = args[0];
				info['old_val'] = args[1];
				info['prop'] = args[2];
				break;
			default:
				info['args'] = args;
				break;
		}
		if(this._props_info[name].triggers[this._state][trigger])
			return this._props_info[name].triggers[this._state][trigger].call(this, info);
	};
	stackbox_dfan_automaton.prototype._clear_triggers = function() {
		if(this._last_trigs) {
			for(var i = 0; i < this._last_trigs.length; i++) {
				this._props_info[this._last_trigs[i]].triggers = {};
			}
		}
		this._last_trigs = [];
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._set_triggers = function(sta, trigs, func, prio) {
		for(var i = 0; i < trigs.length; i++) {
			var prop_trig = trigs[i];
			var prop = prop_trig;
			var hndl_trig = this.handled_trigger;
			if(prop_trig[0] == SYM_TRIG) {
				var _splt = prop_trig.slice(1).split(SYM_TRIG_SPLIT);
				var prop = _splt[0];
				var trig = _splt[1];
				if(/*in*/this._props_info[prop].handled_triggers !== undefined)
					hndl_trig = this._props_info[prop].handled_triggers;
				if(hndl_trig.indexOf(trig) < 0) continue;
				if(/*!in*/this._props_info[prop].triggers[sta] === undefined)
					this._props_info[prop].triggers[sta] = {};
				this._props_info[prop].triggers[sta][trig] = func;
			} else {
				if(/*in*/this._props_info[prop].handled_triggers !== undefined)
					hndl_trig = this._props_info[prop].handled_triggers;
				if(/*!in*/this._props_info[prop].triggers[sta] === undefined)
					this._props_info[prop].triggers[sta] = {};
				for(var j = 0; j < hndl_trig.length; j++) {
					this._props_info[prop].triggers[sta][hndl_trig[j]] = func;
				}
			}
		}
	};
	stackbox_dfan_automaton.prototype._get_state_func = function(state) {
		return this['state_' + state];
	};
	stackbox_dfan_automaton.prototype._get_state_trig = function(state) {
		var r = this['statrig_' + state];
		if(r === undefined) r = Object.keys(this._props_info);//this.prop_list();//[];
		return r;
	};
	var INTMAP_ST_ALL = '__all__';
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._parse_prio = function(s) {
		var re_p = /^(\w+)(\$(\$)?(\d*)(\$)?)?$/.exec(s);
		var prio = 1;
		if(re_p) {
			var rs = re_p[1];
			var term = !!re_p[5];
			if(re_p[2]) {
				if(re_p[4]) {
					prio = parseInt(re_p[4]);
					if(re_p[3])
						prio = - prio;
				} else {
					if(re_p[3])
						prio = '-';
					else
						prio = '+';
				}
			}
		} else {
			var rs = s;
			var term = false;
		}
		/*var prio = 0;
		var p_idx = s.indexOf('$');
		var rs = s;
		var term = false;
		if(p_idx > -1) {
			rs = s.slice(0, p_idx);
			var p_s = s.slice(p_idx + 1);
			var prio_neg = false;
			if(p_s[0] == '$') {
				prio_neg = true;
				p_s = p_s.slice(1);
			}
			if(p_s.slice(-1) == '$') {
				term = true;
				p_s = p_s.slice(0, -1);
			}
			if(p_s) {
				prio = parseInt(p_s);
				if(prio_neg)
					prio = - prio;
			} else {
				if(prio_neg)
					prio = '-';
				else
					prio = '+';
			}
		}*/
		return [rs, prio, term];
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._key_level = function(key) {
		if(/*!in*/this[key] === undefined) return -1;
		var r = this;
		var lvl = 0;
		while(r != Object.prototype) {
			if(r.hasOwnProperty(key)) break;
			lvl ++;
			r = r.__proto__;
		}
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._record_trig = function(rec, trig, func) {
		rec.tidx = rec.trig.length;
		rec.trig.push([trg, func]);
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._record_cond = function(rec, state, lvl, prio, term, tidx) {
		if(tidx === undefined) tidx = rec.tidx;
		var t = rec.cond;
		if(/*!in*/t[state] === undefined) t[state] = {};
		t = t[state];
		if(/*!in*/t[lvl] === undefined) t[lvl] = {};
		t = t[lvl];
		t[prio] = [tidx, term];
	};
	/* perf_importance: much n */
	stackbox_dfan_automaton.prototype._record_cond_ex = function(rec, state, lvl, prio, term) {
		if(/*!in*/rec.cond_ex[state] === undefined) rec.cond_ex[state] = {};
		rec.cond_ex[state][rec.tidx] = [lvl, prio, term];
	};
	/* perf_importance: much */
	stackbox_dfan_automaton.prototype._imp_record_ex = function(rec) {
		if(/*!in*/rec.cond_ex[INTMAP_ST_ALL] === undefined) return;
		var c_all = rec.cond_ex[INTMAP_ST_ALL];
		for(var i = 0, il = Object.keys(c_all); i < il.length; i++) {
			var c_i = il[i];
			var c_t = c_all[c_i];
			//for(var st in rec.cond) {
			for(var sti = 0, stl = Object.keys(rec.cond), st;
				st = stl[sti], sti < stl.length; sti++) {
				if(/*!in*/rec.cond_ex[st][c_i] === undefined) {
					this._record_cond(rec, st, c_t[0], c_t[1], c_t[2], c_i);
				}
			}
		}
	};
	/* perf_importance: much */
	stackbox_dfan_automaton.prototype._impl_record = function(rec) {
		this._imp_record_ex(rec);
		//for(var st in rec.cond) {
		for(var sti = 0, stl = Object.keys(rec.cond), st;
			st = stl[sti], sti < stl.length; sti++) {
			var rc_st = rec.cond[st];
			var lvl_ks = Object.keys(rc_st).sort(function(a, b){return a > b});
			var r_merg = {};
			for(var i = 0; i < lvl_ks.length; i++) {
				var lvl = lvl_ks[i];
				var term_prio = 0;
				var rc_lvl = rc_st[lvl];
				var prio_ks = Object.keys(rc_lvl);
				for(var j = 0; j < prio_ks.length; j++) {
					var prio = prio_ks[j];
					var rc_prio = rc_lvl[prio];
					var r_info = {
						'lvl': lvl,
						'tidx': rc_prio[0],
					};
					if(rc_prio[1]) {
						term_prio = rc_prio[1];
					}
					if(/*!in*/r_merg[prio] === undefined) {
						r_merg[prio] = r_info;
					}
				}
			}
		}
	};
	/* perf_importance: much */
	stackbox_dfan_automaton.prototype._init_interrupts = function() {
		var _rec = {
			'trig': [],
			'tidx': 0,
			'cond': {},
			'cond_ex': {},
		};
		//for(var key in this) {
		for(var keyi = 0, keyl = Object.keys(this), key;
			key = keyl[keyi], keyi < keyl.length; keyi++) {
			if(key.slice(0, 6) == 'state_') {
				var sta_lvl = this._key_level(key);
				var sta_name = key.slice(6);
				var sta_func = this[key];
				var sta_trig = this['statrig_' + sta_name];
				var _prio = this._parse_prio(sta_name);
				var sta_state = _prio[0];
				var sta_prio = _prio[1];
				var sta_term = _prio[2];
				this._record_trig(_rec, sta_trig, sta_func);
				this._record_cond(_rec, sta_state, sta_lvl, sta_prio, sta_term);
			} else if(key.slice(0, 10) == 'interrupt_') {
				var int_lvl = this._key_level(key);
				var int_cmds = key.slice(10).split('_');
				var int_name = int_cmds[0];
				var int_func = this[key];
				var int_trig = this['inttrig_' + int_name];
				var _prio = this._parse_prio(int_name);
				var int_prio = _prio[1];
				var int_term = _prio[2];
				var sta_no_set = true;
				var sta_ex_name = [];
				this._record_trig(_rec, int_trig, int_func);
				for(var i = 1; i < int_cmds.length; i++) {
					var cmd = int_cmds[i].split('$');
					switch(cmd[0]) {
						case 'st':
							for(var j = 1; j < cmd.length; j++) {
								this._record_cond(_rec, cmd[j], int_lvl, int_prio, int_term);
							}
							sta_no_set = false;
							break;
						case 'ex':
							for(var j = 1; j < cmd.length; j++) {
								sta_ex_name.push(cmd[j]);
								this._record_cond_ex(_rec, cmd[j], int_lvl, int_prio, int_term);
							}
							break;
						default:
							continue;
					}
				}
				if(sta_no_set) {
					this._record_cond(_rec, INTMAP_ST_ALL, int_lvl, int_prio, int_term);
				}
			}
		}
	};
	stackbox_dfan_automaton.prototype._set_interrupts = function(state) {
		if(!this._int_sta_map) {
			this._int_sta_map = this._init_interrupts();
		}
		if(state in this._int_sta_map.states) {
			var _st_q = this._int_sta_map.states[state];
			for(var i = 0; i < _st_q.length; i++) {
				var _int = this._int_sta_map.interrupts[_st_q[i]];
				this._set_triggers(state, _int.trig, _int.func);
			}
		}
		if(INTMAP_ST_ALL in this._int_sta_map.states) {
			var _st_q = this._int_sta_map.states[INTMAP_ST_ALL];
			for(var i = 0; i < _st_q.length; i++) {
				var _int_name = _st_q[i];
				var _ex_sta = INTMAP_ST_EX + state;
				if(_ex_sta in this._int_sta_map.states) {
					if(this._int_sta_map.states[_ex_sta].indexOf(_int_name) > -1)
						continue;
				}
				var _int = this._int_sta_map.interrupts[_int_name];
				this._set_triggers(state, _int.trig, _int.func);
			}
		}
	};
	/* perf_importance: most */
	stackbox_dfan_automaton.prototype.goto_state = function(state) {
		this._clear_triggers();
		this._set_triggers(state, this._get_state_trig(state), this._get_state_func(state));
		this._set_interrupts(state);
		console.log('goto', state);
	};
	/* perf_importance: most */
	stackbox_dfan_automaton.prototype.jump_state = function(state, info) {
		console.log('jump', state);
		if(info === undefined) info = {};
		this._get_state_func(state).call(this, info);
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.prop_islocked = function(name, trig) {
		return this._props_info[name].prop.islocked(trig);
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.prop_get = function(name) {
		if(name[0] == SYM_BYPS) return this._props_info[name].prop;
		return this._props_info[name].prop.get();
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.prop_set = function(name, val) {
		if(name[0] == SYM_IMPT) return; //Read only property (import from extra)
		if(name[0] == SYM_BYPS) return (this._props_info[name].prop = val);
		return this._props_info[name].prop.set(val);
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.prop_input = function(name, val) {
		if(name[0] != SYM_IMPT) return;
		return this._props_info[name].prop.set(val);
	};
	stackbox_dfan_automaton.prototype.prop_list = function(own) {
		var r = [];
		//for(var k in this._props_info) {
		for(var ki = 0, kl = Object.keys(this._props_info), k;
			k = kl[ki], ki < kl.length; ki++) {
			if(own) {
				if(k[0] != SYM_IMPT) r.push(k);
			} else {
				r.push(k);
			}
		}
		return r;
	};
	/* perf_importance: much */
	stackbox_dfan_automaton.prototype.prop_check = function(need_list) {
		for(var i = 0; i < need_list.length; i++) {
			if(/*!in*/this._props_info[need_list[i]] === undefined) return false;
		}
		return true;
	};
	/* perf_importance: much */
	stackbox_dfan_automaton.prototype.bind_prop = function(name, prop, hndl_trig) {
		if(/*in*/this._props_info[name] !== undefined) this.remove_prop(name);
		var prop_info = {
			'prop': prop,
			'hids': {},
			'triggers': {},
		};
		if(hndl_trig) {
			prop_info.handled_triggers = hndl_trig;
		} else {
			hndl_trig = this.handled_trigger;
		}
		if(name[0] != SYM_BYPS) {
			for(var i = 0; i < hndl_trig.length; i++) {
				var hk = hndl_trig[i];
				var hid = prop.hook(hk, this._prop_handler.bind(this, name, hk));
				prop_info.hids[hk] = hid;
			}
		}
		this._props_info[name] = prop_info;
	};
	stackbox_dfan_automaton.prototype.remove_prop = function(name) {
		if(/*!in*/this._props_info[name] === undefined)) return false;
		if(name[0] != SYM_BYPS) {
			var prop_info = this._props_info[name];
			var hndl_trig = this.handled_trigger;
			if(/*in*/prop_info.handled_triggers !== undefined) hndl_trig = prop_info.handled_triggers;
			for(var i = 0; i < hndl_trig.length; i++) {
				var hk = hndl_trig[i];
				prop_info.prop.dishook(prop_info.hids[hk]);
			}
		}
		return (delete this._props_info[name]);
	};
	/* perf_importance: more */
	stackbox_dfan_automaton.prototype.export_prop = function(name) {
		if(name[0] != SYM_EXPT) return;
		return this._props_info[name].prop;
	};
	return stackbox_dfan_automaton;
})();

/***********************************SPECS**********************************************/

var stackbox_spec_prop = stackbox_dfan_property;

var stackbox_spec_prop_eqtp = (function(_super) {
	__extends(stackbox_spec_prop_eqtp, _super);
	var pos_eq = function(a, b) {
		return a.eq(b);
	};
	function stackbox_spec_prop_eqtp(val) {
		_super.call(this, val);
		this.__eq__ = pos_eq;
	}
	return stackbox_spec_prop_eqtp;
})(stackbox_dfan_property);

var stackbox_spec_prop_pos = stackbox_spec_prop_eqtp;
var stackbox_spec_prop_trans = stackbox_spec_prop_eqtp;

var stackbox_spec_prop_range = (function(_super) {
	__extends(stackbox_spec_prop_range, _super);
	var HK_MOVE = 'rng_move';
	var HK_TRANS = 'rng_trans';
	var HK_COLLISION = 'rng_collision';
	function stackbox_spec_prop_range(val, collection) {
		_super.call(this, val);
		this._collection = collection;
	}
	stackbox_spec_prop_range.prototype.set_range = function() {
		argv = stackbox_util.parse_argv(arguments, {
			"pos": ["pos"],
			"range": ["top", "bot"],
		});
		var changed = false;
		switch(argv.patt) {
			case 'pos':
				if(!argv.pos.eq(this._value.top)) {
					this._value.move_to(argv.pos);
					changed = true;
				}
				break;
			case 'range':
				if(!argv.top.eq(this._value.top)) {
					this._value.top = argv.top;
					changed = true;
				}
				if(!argv.bot.eq(this._value.bot)) {
					this._value.bot = argv.bot;
					changed = true;
				}
				break;
			default:
				throw 'args error';
		}
		if(changed) {
			this.check_collision();
		}
	};
	stackbox_spec_prop_range.prototype.check_collision = function() {
		for(var cid in this._collection.vals) {
			var t_rng = this._collection.vals[cid];
			if(this._value.collision_with(t_rng)) {
				this._hooks_lock.lock(HK_COLLISION);
				var r = this._hooks.invoke(HK_COLLISION, t_rng, this._value, this);
				this._hooks_lock.unlock(HK_COLLISION);
			}
		}
	};
	return stackbox_spec_prop_range;
})(stackbox_dfan_property);

var stackbox_spec_actions = (function(_super) {
	__extends(stackbox_spec_actions, _super);
	var need_prop = [
		'#action',
		'%aniframe',
		'%duration',
		'@done',
		'@tick',
	];
	function stackbox_spec_actions() {
		_super.call(this);
		this.act_info = {};
	}
	stackbox_spec_actions.prototype.init = function() {
		if(!this.actions_check()) throw 'action uninited';
		this.bind_prop('#action', new stackbox_spec_prop('__none__'));
		this.bind_prop('%aniframe', 0);
		this.bind_prop('%duration', 0);
		if(!this.prop_check(need_prop)) throw 'properties unbind';
		this.goto_state('idle');
	};
	stackbox_spec_actions.prototype.actions_check = function() {
		/*
		{
			act_name: [
				{
					'frame': stackbox_graph_frame,
					'duration': number,
					(last)'loop': boolean,
				},
				...
			],
			...
		}
		*/
		if(!(this.act_info instanceof Object)) return false;
		for(var k in this.act_info) {
			var act = this.act_info[k];
			if(!(act instanceof Array)) return false;
			for(var i = 0; i < act.length; i++) {
				var fi = act[i];
				if(!(fi instanceof Object)) return false;
				//if(!(fi.frame instanceof stackbox_graph_frame)) return false;
				if(!(typeof(fi.duration) == 'number')) return false;
				if(i == act.length - 1) {
					if(!(typeof(fi.loop) == 'boolean')) return false;
				}
			}
		}
		return true;
	};
	stackbox_spec_actions.prototype.append_action = function(name, loop) {
		var frm_q = Array.prototype.slice.call(arguments, 2);
	};
	stackbox_spec_actions.prototype.set_frame = function(name, cnt) {
		console.log('set', name, cnt);
	};
	stackbox_spec_actions.prototype.statrig_idle = ['@tick'];
	stackbox_spec_actions.prototype.state_idle = function(info) {
		this.prop_set('#action', 'idle');
	};
	stackbox_spec_actions.prototype.inttrig_actset = ['#action'];
	stackbox_spec_actions.prototype.interrupt_actset = function(info) {
		this.prop_set('%aniframe', 0);
		this.prop_set('%duration', 0);
		this.set_frame(info.val, 0);
		this.goto_state('action');
	};
	stackbox_spec_actions.prototype.statrig_action = ['@tick'];
	stackbox_spec_actions.prototype.state_action = function(info) {
		var delt = info.val - info.old_val;
		if(delt < 0) throw 'tick down';
		var af = this.prop_get('%aniframe');
		var dur = this.prop_get('%duration') + delt;
		var act = this.act_info[this.prop_get('#action')];
		var fi = act[af];
		if(dur >= fi.duration) {
			this.prop_set('%duration', dur - fi.duration);
			if(af >= act.length - 1) {
				if(fi.loop) {
					this.prop_set('%aniframe', 0);
				} else {
					this.prop_input('@done', true);
					this.goto_state('idle');
					return;
				}
			} else {
				this.prop_set('%aniframe', af + 1);
			}
			this.set_frame(this.prop_get('#action'), this.prop_get('%aniframe'));
		} else {
			this.prop_set('%duration', dur);
		}
		this.goto_state('action');
	};
	return stackbox_spec_actions;
})(stackbox_dfan_automaton);

var stackbox_spec_graph = (function(_super) {
	__extends(stackbox_spec_graph, _super);
	var need_prop = [
		'@pos',
		'#trans',
		'%dirty',
	];
	function stackbox_spec_graph(sprite, box, layer) {
		_super.call(this);
		if(!this.prop_check(need_prop)) throw 'properties unbind';
		this.sprite = sprite;
	}
	stackbox_spec_graph.prototype.set_frame = function(name, cnt) {
		
	};
	return stackbox_spec_graph;
})(stackbox_spec_actions);

var stackbox_spec_prop_controller = (function(_super) {
	__extends(stackbox_spec_prop_controller, _super);
	var ctrl_eq = function(a, b) {
		return a[0] == b[0] && a[1] == b[1];
	};
	function stackbox_spec_prop_controller() {
		_super.call(this, [false, 0]);
		this.__eq__ = ctrl_eq;
		stackbox_keyboard_system.bind(this._handler.bind(this));
	}
	stackbox_spec_prop_controller.prototype._handler = function(down, key) {
		this.set([down, key]);
	};
	return stackbox_spec_prop_controller;
})(stackbox_dfan_property);

var stackbox_spec_prop_hotkey = (function(_super) {
	__extends(stackbox_spec_prop_hotkey, _super);
	var HK_SET = 'set';
	var HK_CHANGE = 'change';
	var HK_KEYDOWN = 'key_down';
	var HK_KEYUP = 'key_up';
	function stackbox_spec_prop_hotkey() {
		_super.call(this, false);
	}
	stackbox_spec_prop_hotkey.prototype.set = function(val) {
		if(!this._hooks_lock.check(HK_SET)) {
			this._hooks_lock.lock(HK_SET);
			var r = this._hooks.invoke(HK_SET, val, this._value, this);
			if(r !== undefined)
				val = r;
			this._hooks_lock.unlock(HK_SET);
		}
		if(!this.__eq__(this._value, val)) {
			if(!this._hooks_lock.check(HK_CHANGE)) {
				this._hooks_lock.lock(HK_CHANGE);
				var r = this._hooks.invoke(HK_CHANGE, val, this._value, this);
				if(r !== undefined)
					val = r;
				this._hooks_lock.unlock(HK_CHANGE);
			}
			if(val /*== true*/) {
				if(!this._hooks_lock.check(HK_KEYDOWN)) {
					this._hooks_lock.lock(HK_KEYDOWN);
					var r = this._hooks.invoke(HK_KEYDOWN, this);
					this._hooks_lock.unlock(HK_KEYDOWN);
				}
			} else {
				if(!this._hooks_lock.check(HK_KEYUP)) {
					this._hooks_lock.lock(HK_KEYUP);
					var r = this._hooks.invoke(HK_KEYUP, this);
					this._hooks_lock.unlock(HK_KEYUP);
				}
			}
		}
		this._value = val;
		return val;
	};
	return stackbox_spec_prop_hotkey;
})(stackbox_dfan_property);

var stackbox_spec_control = (function(_super) {
	__extends(stackbox_spec_control, _super);
	var need_prop = [
		'@controller',
	];
	var g_hkid = 1;
	function stackbox_spec_control() {
		_super.call(this);
		this.keymap = {};
	}
	stackbox_spec_control.prototype.add_key = function(key) {
		if(key in this.keymap) return this.keymap[key];
		var hotkey = new stackbox_spec_prop_hotkey();
		this.keymap[key] = hotkey;
		return hotkey;
	};
	stackbox_spec_control.prototype.remove_key = function(key) {
		if(!(key in this.keymap)) return false;
		return (delete this.keymap[key]);
	};
	stackbox_spec_control.prototype.change_key = function(key1, key2) {
		if(key1 in this.keymap) {
			var _k = this.keymap[key1];
			if(key2 in this.keymap) {
				this.keymap[key1] = this.keymap[key2];
			} else {
				delete this.keymap[key1];
			}
			this.keymap[key2] = _k;
		} else {
			if(key2 in this.keymap) {
				this.keymap[key1] = this.keymap[key2];
				delete this.keymap[key2];
			}
		}
	};
	stackbox_spec_control.prototype.init = function() {
		if(!this.prop_check(need_prop)) throw 'properties unbind';
		this.goto_state('ready');
	};
	stackbox_spec_control.prototype.statrig_ready = ['@controller'];
	stackbox_spec_control.prototype.state_ready = function(info) {
		var keystat = info.val;
		if(keystat[1] in this.keymap) {
			this.keymap[keystat[1]].set(keystat[0]);
		}
	};
	return stackbox_spec_control;
})(stackbox_dfan_automaton);

/***********************************GRAPH**********************************************/

var stackbox_graph = (function() {
	function stackbox_graph(layers) {
		this.layers = layers;
		
	}
	return stackbox_graph;
})();

var stackbox_graph_box = (function() {
	var default_ztp2layer = function(z, tp, box) {return z;};
	var default_layer2ztp = function(idx, box) {return [idx, 'stand'];};
	var default_layer_load = function(z, tp, box) {return null;};
	function stackbox_graph_box(deep) {
		this.static_layers ={};
		this.dynamic_layers = [];
		this.ztp2layer = default_ztp2layer;
		this.layer2ztp = default_layer2ztp;
		this.layer_load = default_layer_load;
		this.win_deep = deep;
		this.win_start = 0;
	}
	stackbox_graph_box.prototype.get_layer = function(idx) {
		var layer;
		if(typeof(idx) == 'number') {
			if(idx < this.win_start || idx >= this.win_start + this.win_deep)
				return null;
			layer = this.dynamic_layers[idx - this.win_start];
		} else {
			layer = this.static_layers[idx];
		}
		return layer;
	};
	stackbox_graph_box.prototype.z2layer = function(z) {
		var lyr_first = this.ztp2layer(z, null, this);
		var lyr_next = lyr_first;
		while(this.layer2ztp(lyr_next)[0] == z)
			lyr_next ++;
		return [lyr_first, lyr_next];
	};
	stackbox_graph_box.prototype.draw = function(frame, pos, tp, trans) {
		var layer_idx = this.ztp2layer(pos.z, tp, this);
		var layer = this.get_layer(layer_idx);
		if(!layer) 
			return {
				"id": -1,
				"err": "draw out of window",
			};
		var info = layer.draw(frame, pos.flat(), trans);
		info['z'] = pos.z;
		info['tp'] = tp;
		return info;
	};
	stackbox_graph_box.prototype.clear = function(info) {
		if(info.id == -1) return false;
		var layer_idx = this.ztp2layer(info.z, info.tp, this);
		var layer = this.get_layer(layer_idx);
		if(!layer) return false;
		return layer.clear(info);
	};
	stackbox_graph_box.prototype.move_to = function(z, tp) {
		var _ztp;
		var win_dst = this.ztp2layer(z, tp, this);
		if(win_dst >= this.win_start + this.win_deep || this.win_start >= win_dst + this.win_deep || this.dynamic_layers.length < this.win_deep) {
			this.dynamic_layers = [];
			for(var i = win_dst; i < win_dst + this.win_deep; i++) {
				_ztp = this.layer2ztp(i, this);
				this.dynamic_layers.push(this.layer_load(_ztp[0], _ztp[1], this));
			}
		} else if(win_dst < this.win_start) {
			this.dynamic_layers = this.dynamic_layers.slice(0, win_dst + this.win_deep - this.win_start);
			for(var i = this.win_start - 1; i >= win_dst; i--) {
				_ztp = this.layer2ztp(i, this);
				this.dynamic_layers.unshift(this.layer_load(_ztp[0], _ztp[1], this));
			}
		} else if(win_dst > this.win_start) {
			this.dynamic_layers = this.dynamic_layers.slice(win_dst - this.win_start);
			for(var i = this.win_start + this.win_deep; i < win_dst + this.win_deep; i++) {
				_ztp = this.layer2ztp(i, this);
				this.dynamic_layers.push(this.layer_load(_ztp[0], _ztp[1], this));
			}
		}
		this.win_start = win_dst;
	};
	stackbox_graph_box.prototype.set_static_layer = function(idx, layer) {
		if(!layer) {
			delete this.static_layers[idx];
		} else {
			this.static_layers[idx] = layer;
		}
	};
	return stackbox_graph_box;
})();

/* Simple layer, rects shouldn't overlap */
var stackbox_graph_layer = (function() {
	var layer_id = 1;
	var default_range2local = function(range) {return range;};
	function stackbox_graph_layer() {
		argv = stackbox_util.parse_argv(arguments, {
			"default": [],
			"surf": ["surface"],
			"new": ["width", "height"],
		});
		var surface;
		switch(argv.patt) {
			case 'surf':
				surface = argv.surface;
				break;
			case 'new':
				surface = new stackbox_graph_surface(argv.width, argv.height);
				break;
			case 'default':
			default:
				surface = new stackbox_graph_surface();
				break;
		}
		this.surface = surface;
		this.range2local = default_range2local;
		this.id = layer_id;
		layer_id ++;
	}
	stackbox_graph_layer.prototype.draw = function(frame, pos, trans) {
		var dst_range = frame.range.move_to(pos);
		var loc_range = this.range2local(dst_range);
		frame.blit(this.surface, loc_range.top, trans);
		return {
			"id": this.id,
			"range": loc_range,
		};
	};
	stackbox_graph_layer.prototype.blit = function(src_rng, dst_surf, dst_pos, dst_trans) {
		var loc_range = this.range2local(src_rng);
		this.surface.blit(loc_range, dst_surf, dst_pos, dst_trans);
	};
	stackbox_graph_layer.prototype.clear = function(info) {
		if(info.id != this.id) return false;
		this.surface.clear(info.range);
		return true;
	};
	stackbox_graph_layer.prototype.reset = function() {
		this.surface.reset();
	};
	return stackbox_graph_layer;
})();

/* Dynamic layer */
var stackbox_graph_layer_dynamic = (function() {
	var layer_id = 100000;
	var dl_id = 1;
	var default_range2local = function(range) {return range;};
	function stackbox_graph_layer_dynamic() {
		this.range2local = default_range2local;
		this.id = layer_id;
		layer_id ++;
		this.draw_list = {};
	}
	stackbox_graph_layer_dynamic.prototype.draw = function(frame, pos, trans) {
		var dst_range = frame.range.move_to(pos);
		var loc_range = this.range2local(dst_range);
		this.draw_list[dl_id] = [loc_range, frame, trans];
		return {
			"id": this.id,
			"dlid": dl_id++,
		};
	};
	stackbox_graph_layer_dynamic.prototype.blit = function(src_rng, dst_surf, dst_pos, dst_trans) {
		var loc_range = this.range2local(src_rng);
		var dl_keys = Object.keys(this.draw_list).sort(function(a,b){return a-b;});
		for(var i = 0; i < dl_keys.length; i++) {
			var dl = this.draw_list[dl_keys[i]];
			if(src_rng.collision_with(dl[0])) {
				dl[1].blit(
					dst_surf, dst_pos,
					stackbox_util.comb2(dst_trans, dl[2], dst_trans.plus(dl[2]))
				);
			}
		}
	};
	stackbox_graph_layer_dynamic.prototype.clear = function(info) {
		if(info.id != this.id) return false;
		return (delete this.draw_list[info.dlid]);
	};
	stackbox_graph_layer_dynamic.prototype.reset = function() {
		this.draw_list = {};
	};
	return stackbox_graph_layer_dynamic;
})();

var stackbox_graph_camera = (function() {
	function stackbox_graph_camera(box, range, order) {
		this.box = box;
		this.surfaces = {
			"static": {},
			"dynamic": [],
			"order": order,
		};
		this.range = range;
		this.base = range.top;
		this.size = range.len();
		this.win_deep = this.win_end() - this.win_start();
		this.moved = true;
		this.dirty_range = {
			"static": {},
			"dynamic": {},
		};
		this.init_surfaces();
	}
	stackbox_graph_camera.prototype.win_start = function() {
		return this.box.z2layer(this.range.top.z)[0];
	};
	stackbox_graph_camera.prototype.win_end = function() {
		return this.box.z2layer(this.range.bot.z)[1];
	};
	stackbox_graph_camera.prototype.init_surfaces = function() {
		for(var i = 0; i < this.surfaces.order.length; i++) {
			var key = this.surfaces.order[i];
			var surface;
			if(key == 'dynamic') {
				for(var j = 0; j < this.win_deep; j++) {
					surface = new stackbox_graph_surface();
					this.surfaces.dynamic.push(surface);
					stackbox_graph_system.append_ctx(surface.ctx);
				}
			} else {
				surface = new stackbox_graph_surface();
				this.surfaces.static[key] = surface;
				stackbox_graph_system.append_ctx(surface.ctx);
			}
		}
	};
	stackbox_graph_camera.prototype.move = function(pos) {
		if(!pos.is_zero()) {
			this.range.top.add(pos);
			this.moved = true;
		}
	};
	stackbox_graph_camera.prototype.move_to = function(pos) {
		if(!this.range.top.eq(pos)) {
			this.range.top.assign(pos);
			this.moved = true;
		}
	};
	stackbox_graph_camera.prototype.dirty = function(range, tp) {
		if(this.moved) return;
		var range_f = range.flat();
		if(tp && this.surfaces.static.hasOwnProperty(tp)) {
			if(range_f.collision_with(this.range.flat())) {
				if(this.dirty_range.static.hasOwnProperty(tp)) {
					range_f = this.dirty_range.static[tp][0].max(range_f);
				}
				this.dirty_range.static[tp] = range_f;
			}
		} else {
			if(range.collision_with(this.range)) {
				var lyr = this.box.ztp2layer(range.top.z, tp, this.box);
				if(this.dirty_range.dynamic.hasOwnProperty(lyr)) {
					range_f = this.dirty_range.dynamic[lyr][0].max(range_f);	
				}
				this.dirty_range.dynamic[lyr] = range_f;
			}
		}
	};
	stackbox_graph_camera.prototype.update = function() {
		if(this.moved) {
			for(var i = 0; i < this.surfaces.order.length; i++) {
				var key = this.surfaces.order[i];
				if(key == 'dynamic') {
					for(var j = 0; j < this.win_deep; j++) {
						this.box.get_layer(j + this.win_start()).blit(
							this.range.flat(),
							this.surfaces.dynamic[j],
							new stackbox_type_position(0, 0)
						);
					}
				} else {
					this.box.get_layer(key).blit(
						this.range.flat(),
						this.surfaces.static[key],
						new stackbox_type_position(0, 0)
					);
				}
			}
		} else {
			var range_s;
			for(var key in this.dirty_range.dynamic) {
				var ikey = Number(key);
				range_s = this.dirty_range.dynamic[key];
				range_s = range_s.min(this.range.flat());
				this.box.get_layer(ikey).blit(
					range_s,
					this.surfaces.dynamic[ikey - this.win_start()],
					range_s.top.minus(this.range.top)
				);
			}
			for(var key in this.dirty_range.static) {
				range_s = this.dirty_range.static[key];
				range_s = range_s.min(this.range.flat());
				this.box.get_layer(key).blit(
					range_s,
					this.surfaces.static[key],
					range_s.top.minus(this.range.top)
				);
			}
		}
		this.moved = false;
		this.dirty_range.static = {};
		this.dirty_range.dynamic = {};
	};
	return stackbox_graph_camera;
})();

var stackbox_graph_surface = (function() {
	function stackbox_graph_surface() {
		argv = stackbox_util.parse_argv(arguments, {
			"default": [],
			"ctx": ["ctx"],
			"new": ["width", "height"],
		});
		var ctx;
		switch(argv.patt) {
			case 'ctx':
				ctx = argv.ctx;
				break;
			case 'new':
				ctx = stackbox_graph_system.new_ctx(argv.width, argv.height);
				break
			case 'default':
			default:
				ctx = stackbox_graph_system.new_ctx();
				break;
		}
		this.ctx = ctx;
		var csize = stackbox_graph_system.get_size(ctx);
		this.width = csize[0];
		this.height = csize[1];
	}
	stackbox_graph_surface.prototype.blit = function(src_rng, dst, dst_pos, dst_trans) {
		if(dst_trans) {
		} else {
			stackbox_graph_system.blit(this.ctx, src_rng, dst.ctx, dst_pos);
		}
	};
	stackbox_graph_surface.prototype.clear = function(rng) {
		stackbox_graph_system.clear(this.ctx, rng);
	};
	stackbox_graph_surface.prototype.reset = function() {
		stackbox_graph_system.reset(this.ctx);
	};
	return stackbox_graph_surface;
})();

var stackbox_graph_trans = (function() {
	function stackbox_graph_trans(info) {
		this.info = info;
	}
	stackbox_graph_trans.prototype.copy = function() {
		var r = {};
		for(var k in this.info) {
			r[k] = this.info[k];
		}
		return new stackbox_graph_trans(r);
	};
	stackbox_graph_trans.prototype.eq = function(t) {
		return false;
	};
	stackbox_graph_trans.prototype.add = function(t) {
		for(var k in t.info) {
			switch(k) {
				case 'angle':
					var ang = this.info[k] + t.info[k];
					while(ang > 2 * Math.PI) ang -= 2 * Math.PI;
					while(ang < 0) ang += 2 * Math.PI;
					this.info[k] = ang;
					break;
				case 'flip':
				case 'scare':
				case 'scare2':
				default:
					break;
			}
		}
	};
	stackbox_graph_trans.prototype.plus = function(t) {
		var r = this.copy();
		r.add(t);
		return r;
	}
	return stackbox_graph_trans;
})();

var stackbox_graph_frame = (function() {
	function stackbox_graph_frame(surface, range, trans) {
		this.surface = surface;
		this.range = range;
		if(trans = undefined)
			trans = null;
		this.trans = trans;
	}
	stackbox_graph_frame.prototype.blit = function(dst, pos, trans) {
		if(!trans)
			trans = this.trans;
		else if(this.trans != null)
			trans = this.trans.plus(trans);
		this.surface.blit(this.range, dst, pos, trans);
	};
	return stackbox_graph_frame;
})();

var stackbox_graph_sprite = (function() {
	function stackbox_graph_sprite(surf, rect_size, actions) {
		this.surface = surf;
		this.rect = rect_size;
		this.acts = this._init_acts(actions);
	}
	stackbox_graph_sprite.prototype._init_acts = function(acts) {
		/*
		acts -> acts , act | act
		act -> name : infos
		infos -> infos , info | info
		info -> pos | dir pn cnt
		dir -> "x" | "y"
		pn -> + | -
		cnt -> number
		name -> string
		pos -> (number , number)
		acts = {
			name: [
				pos | brief_string , ...
			],
			...
		}
		*/
		result = {}
		for(var name in acts) {
			var trans = null;
			var pos = null;
			var frames = [];
			for(var i = 0; i < acts[name].length; i++) {
				info = acts[name][i];
				if(typeof(info) == 'string') {
					var re_trans = /^\s*trans\s*:\s*(.*?)\s*$/;
					var re_pos = /^\s*\(\s*(\d*)\s*,\s*(\d*)\s*\)\s*$/;
					var re_brief = /^\s*([xy])\s*([+-])\s*(\d*)\s*$/;
					if(re_trans) {
						trans = new stackbox_graph_trans(re_trans[1]);
					} else if(re_pos) {
						pos = new stackbox_type_position(
							parseInt(re_pos[1]), parseInt(re_pos[2])
						);
						frames.push(this._init_frames(pos, trans));
					} else if(re_brief) {
						if(!pos) throw 'pos need init.';
						var count = parseInt(re_brief[3]);
						var step;
						if(re_brief[2] == '+') step = 1;
						else step = -1;
						for(var j = 0; j < count; j++) {
							if(re_brief[1] == 'x') {
								pos.x += step;
							} else {
								pos.y += step;
							}
							frames.push(this._init_frames(pos, trans));
						}
					}
				} else if(info instanceof stackbox_type_position) {
					pos = info;
					frames.push(this._init_frames(pos, trans));
				}
			}
			result[name] = frames;
		}
		return result;
	};
	stackbox_graph_sprite.prototype._init_frames = function(pos, trans) {
		return new stackbox_graph_frame(
			this.surface,
			this._calc_range(pos),
			trans
		);
	};
	stackbox_graph_sprite.prototype._calc_range = function(pos) {
		var n_pos = new stackbox_type_position(pos.x * this.rect.x, pos.y * this.rect.y);
		return new stackbox_type_range(n_pos, this.rect, 'len-dummy');
	}
	stackbox_graph_sprite.prototype.frame = function(name, cnt) {
		return this.acts[name][cnt];
	};
	return stackbox_graph_sprite;
})();

/*************************************************************************************/

var stackbox_test_sprite = (function(_super) {
	__extends(stackbox_test_sprite, _super);
	function stackbox_test_sprite(rect_width, rect_height, grid_width, grid_height, actions) {
		var surf = new stackbox_graph_surface(grid_width * rect_width, grid_height * rect_height);
		var rect = new stackbox_type_position(rect_width, rect_height);
		_super.call(this, surf, rect, actions);
	}
	stackbox_test_sprite.prototype._draw_all = function() {
		var grid = {};
		for(var k in this.acts) {
			for(var i = 0; i < acts[k].length; i++) {
				var frame = acts[k][i];
				var x = frames.range.top.x;
				var y = frames.range.top.y;
				if(stackbox_util.dtab_op(grid, 'get', x, y)) {
					if(grid[x][y][2] != null)
						grid[x][y] = [k, i, frame.trans];
				} else {
					stackbox_util.dtab_op(grid, 'set', x, y, [k, i, frame.trans]);
				}
			}
		}
		for(var x in grid) {
			for(var y in grid[x]) {
				this._draw_frame(x, y, grid[x][y][0], grid[x][y][1]);
			}
		}
	};
	stackbox_test_sprite.prototype._draw_frame = function(x, y, name, cnt) {
		var cx = x + this.rect.x / 2;
		var cy = y + this.rect.y / 2;
		stackbox_graph_system.draw_text(this.surface.ctx, t_surf_rng.top, name + cnt, 'verdana', 'center', 'middle', null, null, true);
	};
	return stackbox_test_sprite;
})(stackbox_graph_sprite);

/*************************************************************************************/

var stackbox_graph_system = {
	screen_div: null,
	screen_width: 0,
	screen_height: 0,
	ctx_idx: 0,
	//ctxs: {},
	init: function(div, width, height) {
		this.screen_div = div;
		this.screen_width = width;
		this.screen_height = height;
	},
	new_ctx: function(width, height) {
		var new_canvas = document.createElement('canvas');
		if(!width) width = this.screen_width;
		if(!height) height = this.screen_height;
		new_canvas.width = width;
		new_canvas.height = height;
		var ctx = new_canvas.getContext("2d");
		//this.ctxs[this.ctx_idx] = [ctx, new_canvas];
		this.ctx_idx += 1;
		return ctx;
	},
	image_ctx: function(img) {
		var ctx = this.new_ctx(1,1);
		var image = new Image();
		var loading_id;
		image.onload = function() {
			ctx.canvas.width = this.width;
			ctx.canvas.height = this.height;
			ctx.drawImage(this, 0, 0);
			stackbox_util.loading_checker.done(loading_id);
		};
		image.src = img;
		loading_id = stackbox_util.loading_checker.start();
		return ctx;
	},
	get_canvas: function(ctx) {
		/*for(var k in this.ctxs) {
			if(this.ctxs[k][0] == ctx)
				return this.ctxs[k][1];
		}
		return null;*/
		return ctx.canvas;
	},
	get_size: function(ctx) {
		return [ctx.canvas.width, ctx.canvas.height];
	},
	append_ctx: function(ctx) {
		this.screen_div.appendChild(ctx.canvas);
	},
	blit: function(src_ctx, src_rng, dst_ctx, dst_pos) {
		var w = src_rng.len(0);
		var h = src_rng.len(1)
		dst_ctx.drawImage(src_ctx.canvas, src_rng.top.x, src_rng.top.y, w, h, dst_pos.x, dst_pos.y, w, h);
	},
	clear: function(ctx, rng) {
		ctx.clearRect(rng.top.x, rng.top.y, rng.len(0), rng.len(1));
	},
	reset: function(ctx) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	},
	set_fill_style: function(ctx, style) {
		ctx.fillStyle = style;
	},
	set_stroke_style: function(ctx, style) {
		ctx.strokeStyle = style;
	},
	draw_text: function(ctx, pos, text, font, align, baseline, width, stroke, rect) {
		if(!font) font = '20px Arial';
		if(!align) align = 'left';
		if(!baseline) baseline = 'top';
		ctx.save();
		ctx.font = font;
		ctx.textAlign = align;
		ctx.textBaseline = baseline;
		if(!width) {
			if(!stroke)
				ctx.fillText(text, pos.x, pos.y);
			else
				ctx.strokeText(text, pos.x, pos.y);
		} else {
			if(!stroke)
				ctx.fillText(text, pos.x, pos.y, width);
			else
				ctx.strokeText(text, pos.x, pos.y, width);
		}
		if(rect && !width) {
			var txt_width =  ctx.measureText(text).width;
			var txt_height = font.split(' ')[0].split('px')[0];
			ctx.strokeRect(pos.x, pos.y, txt_width, txt_height);
		}
		ctx.restore();
	},
	draw_rect: function(ctx, rng, stroke) {
		if(!stroke)
			ctx.fillRect(rng.top.x, rng.top.y, rng.len(0), rng.len(1));
		else
			ctx.strokeRect(rng.top.x, rng.top.y, rng.len(0), rng.len(1));
	},
};

/*************************************************************************************/

var stackbox_mainloop_system = {
	fps: 100, //dest
	tpf: 8, //tick_per_frame
	tick: new stackbox_dfan_property(0),
	current_fps: new stackbox_dfan_property(0),
	_last_time: 0,
	_loop_handle: null,
	init: function(fps, tpf) {
		if(fps) this.fps = fps;
		if(tpf) this.tpf = tpf;
	},
	start_loop: function() {
		var msec = 1000/this.fps;
		this._last_time = new Date();
		this._loop_handle = setInterval(this.mainloop.bind(this), msec);
	},
	stop_loop: function() {
		if(this._loop_handle != null)
			clearInterval(this._loop_handle);
	},
	mainloop: function() {
		var cur_time = new Date();
		var delt_time = cur_time - this._last_time;
		this._last_time = cur_time;
		this.current_fps.set(1000 / delt_time);
		this.tick.set(this.tick.get() + this.tpf);
	},
};

/*************************************************************************************/

var stackbox_keyboard_system = {
	bind: function(func) {
		document.addEventListener('keydown', function (event) {
			//console.log('keydown', event.which);
			func(true, event.which);
			event.preventDefault();
			return false;
		}, false);
		document.addEventListener('keyup', function (event) {
			//console.log('keyup', event.which);
			func(false, event.which);
			event.preventDefault();
			return false;
		}, false);
	},
};

/*************************************************************************************/

var stackbox_util = {
	parse_argv: function(argv, argtab) {
		var rslt = {};
		var len = argv.length;
		for(var patt in argtab) {
			if(argtab[patt].length == len) {
				rslt['patt'] = patt;
				for(var i = 0; i < len; i++) {
					rslt[argtab[patt][i]] = argv[i];
				}
				return rslt;
			}
		}
		rslt['patt'] = 'none';
		return rslt;
	},
	comb2: function(a, b, c) {
		if(a && b)
			return c;
		else if(a)
			return a;
		else if(b)
			return b;
		else
			return null;
	},
	dtab_op: function(dtab, op) {
		var r = dtab;
		switch(op) {
			case 'set':
				for(var i = 2; i < arguments.length - 2; i++) {
					if(!(arguments[i] in r)) r[arguments[i]] = {};
					r = r[arguments[i]];
				}
				if(i < arguments.length - 1) {
					r[arguments[i]] = arguments[i + 1];
				}
				return dtab;
			case 'get':
				for(var i = 2; i < arguments.length; i++) {
					if(typeof(r) != 'object' || !(arguments[i] in r)) return undefined;
					r = r[arguments[i]];
				}
				return r;
			case 'del':
				var _stck = [];
				for(var i = 2; i < arguments.length; i++) {
					if(typeof(r) != 'object' || !(arguments[i] in r)) return false;
					_stck.push([r, arguments[i]]);
					r = r[arguments[i]];
				}
				r = {};
				while(Object.keys(r).length == 0 && _stck.length > 0) {
					var _ti = _stck.pop();
					r = _ti[0];
					delete r[_ti[1]];
				}
				return true;
			default:
				return;
		}
	},
	async_checker: (function() {
		function async_checker() {
			this.que = [];
			this.idx = 1;
		}
		async_checker.prototype.start = function() {
			this.que.push(this.idx);
			return this.idx++;
		};
		async_checker.prototype.done = function(id) {
			var idx = this.que.indexOf(id);
			if(idx > -1) {
				this.que.splice(idx, 1);
			}
		};
		async_checker.prototype.check = function() {
			return this.que.length == 0;
		};
		return async_checker;
	})(),
	init: function() {
		this.loading_checker = new this.async_checker();
		return this;
	},
}.init();

/*************************************************************************************/

function test1() {
	stackbox_graph_system.screen_div = document.getElementById('sb_screen');
	stackbox_graph_system.screen_width = 600;
	stackbox_graph_system.screen_height = 500;
	var t_surf_rng = new sbtp['rng'](new sbtp['pos'](0, 0), new sbtp['pos'](200, 100));
	var t_surf = new stackbox_graph_surface(t_surf_rng.len(0), t_surf_rng.len(1));
	//stackbox_graph_system.draw_text(t_surf.ctx, t_surf_rng.top, 'Hello World!');
	//stackbox_graph_system.draw_rect(t_surf.ctx, t_surf_rng, true);
	//stackbox_graph_system.draw_text(t_surf.ctx, t_surf_rng.top, 'Hello World!', null, 'center', 'middle', null, null, true);
	stackbox_graph_system.draw_text(t_surf.ctx, t_surf_rng.top, 'Hello World!', null, null, null, null, null, true);
	var t_frame = new stackbox_graph_frame(t_surf, t_surf_rng);
	var box = new stackbox_graph_box(6);
	box.layer_load = function(z, tp, box) {
		console.log('load layer:', z, tp);
		return new stackbox_graph_layer();
	};
	box.move_to(0, 'stand');
	box.set_static_layer('bg', new stackbox_graph_layer());
	var camera = new stackbox_graph_camera(box,
		new sbtp['rng'](new sbtp['pos'](0, 0, 0), new sbtp['pos'](600, 500, 2)),
		['dynamic', 'bg']);
	box.draw(t_frame, new sbtp['pos'](0, 0, 0), 'stand');
	camera.update();
	//stackbox_graph_system.set_fill_style(camera.surfaces.dynamic[0].ctx, 'red');
	//stackbox_graph_system.draw_text(camera.surfaces.dynamic[0].ctx, t_surf_rng.top, 'Hello World');
}

function test2() {
	var inttest = (function(_super) {
		__extends(inttest, _super);
		var need_prop = [
			'@aa',
			'bb',
			'cc',
		];
		function inttest() {
			_super.call(this);
		}
		inttest.prototype.handled_trigger = [
			'get', 'set', 'change'
		];
		inttest.prototype.init = function() {
			this.prop_check(need_prop);
			this.goto_state('start');
		};
		inttest.prototype.statrig_start = ['@aa', 'bb'];
		inttest.prototype.state_start = function(info) {
			console.log('start', info, this);
			this.goto_state('end');
		};
		inttest.prototype.statrig_end = ['bb'];
		inttest.prototype.state_end = function(info) {
			console.log('end', info, this);
			this.goto_state('start');
		};
		inttest.prototype.statrig_int = ['@aa'];
		inttest.prototype.state_int = function(info) {
			console.log('int', info, this);
			this.goto_state('start');
		};
		inttest.prototype.inttrig_int1 = ['cc'];
		inttest.prototype.interrupt_int1 = function(info) {
			console.log('int1', info, this);
			this.goto_state('int');
		};
		inttest.prototype.inttrig_int2 = ['*@aa:get', '*bb:set'];
		inttest.prototype.interrupt_int2_st$start = function(info) {
			console.log('int2', info, this);
			this.goto_state('int');
		};
		inttest.prototype.inttrig_int3 = ['cc', '*bb:set'];
		inttest.prototype.interrupt_int3_ex$start$int = function(info) {
			console.log('int3', info, this);
			this.goto_state('int');
		};
		return inttest;
	})(stackbox_dfan_automaton);
	var t = new inttest();
	t.bind_prop('@aa', new stackbox_dfan_property(123));
	t.bind_prop('bb', new stackbox_dfan_property(123));
	t.bind_prop('cc', new stackbox_dfan_property(123));
	t.init();
	return t;
}

function test3() {
	var inttest = (function(_super) {
		__extends(inttest, _super);
		function inttest() {
			_super.call(this);
		}
		return inttest;
	})(stackbox_spec_actions);
	var sg = new inttest();
	sg.act_info = {
		'idle': [{'duration':1}, {'duration':3, 'loop':true}],
		'jump': [{'duration':5}, {'duration':10}, {'duration':4, 'loop':false}],
		'run': [{'duration':3}, {'duration':3}, {'duration':3}, {'duration':3, 'loop':true}],
	}
	var tck = new stackbox_dfan_property(0);
	sg.bind_prop('@tick', tck);
	
	var inttest2 = (function(_super) {
		__extends(inttest2, _super);
		function inttest2() {
			_super.call(this);
		}
		inttest2.prototype.state_done = function(info) {
			console.log('done', info.val, info.old_val);
			//this.prop_set('#done', false);
			this.goto_state('done');
			return false;
		};
		return inttest2;
	})(stackbox_dfan_automaton);
	var dc = new inttest2();
	dc.bind_prop('#done', new stackbox_dfan_property(false));
	dc.goto_state('done');
	
	sg.bind_prop('@done', dc.export_prop('#done'));
	sg.init();
	var act = sg.export_prop('#action');
	
	tck.add = function(a) {
		this.set(this.get() + a);
	};
	
	tck.add(10);
	tck.add(10);
	act.set('jump');
	tck.add(10);
	tck.add(10);
	tck.add(10);
	tck.add(10);
	act.set('jump');
	tck.add(10);
	tck.add(10);
	tck.add(10);
	tck.add(10);
	
	return [sg, tck, act, dc];
}

function test_key_loop_stepbystep() {
	var foo = {};
	var bar = {};
	var foobar = {};
	foo[1000] = 123;
	bar['aaa'] = 456;
	foobar[2000] = 321;
	foobar['bbb'] = 654;
	for(var k in foo) {
		console.log(k);
	}
	for(var k in bar) {
		console.log(k);
	}
	for(var k in foobar) {
		console.log(k);
	}
}

function test4() {
	var inttest = (function(_super) {
		__extends(inttest, _super);
		function inttest() {
			_super.call(this);
		}
		inttest.prototype.state_idle = function(info) {
			console.log('idle', info);
		};
		inttest.prototype.inttrig_int1 = ['*@ka:key_down'];
		inttest.prototype.interrupt_int1 = function(info) {
			console.log('ka down', info);
		};
		inttest.prototype.inttrig_int2 = ['*@ka:key_up'];
		inttest.prototype.interrupt_int2 = function(info) {
			console.log('ka up', info);
		};
		inttest.prototype.inttrig_int3 = ['*@kb:key_down'];
		inttest.prototype.interrupt_int3 = function(info) {
			console.log('kb down', info);
		};
		inttest.prototype.inttrig_int4 = ['*@kb:key_up'];
		inttest.prototype.interrupt_int4 = function(info) {
			console.log('kb up', info);
		};
		return inttest;
	})(stackbox_dfan_automaton);
	var pl = new inttest();
	var kb = new stackbox_spec_control();
	var kp = new stackbox_spec_prop_controller();
	kb.bind_prop('@controller', kp);
	kb.init();
	pl.bind_prop('@ka', kb.add_key(65), ['key_down', 'key_up']);
	pl.bind_prop('@kb', kb.add_key(66), ['key_down', 'key_up']);
	pl.goto_state('idle');
}

function test5() {
	var foo1 = (function() {
		function foo1() {
		}
		foo1.prototype.a = 123;
		foo1.prototype.b = 123;
		foo1.prototype.c = 123;
		return foo1;
	})();
	var foo2 = (function(_super) {
		__extends(foo2, _super);
		function foo2() {
			_super.call(this);
		}
		foo2.prototype.b = 456;
		foo2.prototype.c = 456;
		foo2.prototype.d = 456;
		return foo2;
	})(foo1);
	var foo3 = (function(_super) {
		__extends(foo3, _super);
		function foo3() {
			_super.call(this);
		}
		foo3.prototype.c = 789;
		foo3.prototype.d = 789;
		foo3.prototype.e = 789;
		return foo3;
	})(foo2);
	return new foo3();
}

$(document).ready(function() {
	console.log('ready');
	test1();
	console.log('done');
});

// prevent ctrl+R and F5
/*$(document).bind('keydown keyup', function(e) {
    if(e.which === 116) {
       return false;
    }
    if(e.which === 82 && e.ctrlKey) {
       return false;
    }
});*/

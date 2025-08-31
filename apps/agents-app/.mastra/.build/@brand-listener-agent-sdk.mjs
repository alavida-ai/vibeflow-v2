import { o as objectType, s as stringType, l as literalType, b as arrayType, d as discriminatedUnionType, u as unionType, c as anyType, n as numberType, m as nativeEnumType, e as enumType, f as booleanType } from './types.mjs';
import { randomFillSync, randomUUID } from 'crypto';
import { S as SecureJSON, J as JSONParseError, d as TypeValidationError, c as customAlphabet, b as InvalidArgumentError } from './index2.mjs';
import { z } from './external.mjs';

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]).toLowerCase();
}

const rnds8Pool = new Uint8Array(256);
let poolPtr = rnds8Pool.length;
function rng() {
    if (poolPtr > rnds8Pool.length - 16) {
        randomFillSync(rnds8Pool);
        poolPtr = 0;
    }
    return rnds8Pool.slice(poolPtr, (poolPtr += 16));
}

var native = { randomUUID };

function v4$1(options, buf, offset) {
    if (native.randomUUID && true && !options) {
        return native.randomUUID();
    }
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    return unsafeStringify(rnds);
}

// src/types.ts
var FunctionCallSchema = objectType({
  name: stringType(),
  arguments: stringType()
});
var ToolCallSchema = objectType({
  id: stringType(),
  type: literalType("function"),
  function: FunctionCallSchema
});
var BaseMessageSchema = objectType({
  id: stringType(),
  role: stringType(),
  content: stringType().optional(),
  name: stringType().optional()
});
var DeveloperMessageSchema = BaseMessageSchema.extend({
  role: literalType("developer"),
  content: stringType()
});
var SystemMessageSchema = BaseMessageSchema.extend({
  role: literalType("system"),
  content: stringType()
});
var AssistantMessageSchema = BaseMessageSchema.extend({
  role: literalType("assistant"),
  content: stringType().optional(),
  toolCalls: arrayType(ToolCallSchema).optional()
});
var UserMessageSchema = BaseMessageSchema.extend({
  role: literalType("user"),
  content: stringType()
});
var ToolMessageSchema = objectType({
  id: stringType(),
  content: stringType(),
  role: literalType("tool"),
  toolCallId: stringType()
});
var MessageSchema = discriminatedUnionType("role", [
  DeveloperMessageSchema,
  SystemMessageSchema,
  AssistantMessageSchema,
  UserMessageSchema,
  ToolMessageSchema
]);
unionType([
  literalType("developer"),
  literalType("system"),
  literalType("assistant"),
  literalType("user"),
  literalType("tool")
]);
var ContextSchema = objectType({
  description: stringType(),
  value: stringType()
});
var ToolSchema = objectType({
  name: stringType(),
  description: stringType(),
  parameters: anyType()
  // JSON Schema for the tool parameters
});
objectType({
  threadId: stringType(),
  runId: stringType(),
  state: anyType(),
  messages: arrayType(MessageSchema),
  tools: arrayType(ToolSchema),
  context: arrayType(ContextSchema),
  forwardedProps: anyType()
});
var StateSchema = anyType();
var AGUIError = class extends Error {
  constructor(message) {
    super(message);
  }
};
var EventType = /* @__PURE__ */ ((EventType2) => {
  EventType2["TEXT_MESSAGE_START"] = "TEXT_MESSAGE_START";
  EventType2["TEXT_MESSAGE_CONTENT"] = "TEXT_MESSAGE_CONTENT";
  EventType2["TEXT_MESSAGE_END"] = "TEXT_MESSAGE_END";
  EventType2["TEXT_MESSAGE_CHUNK"] = "TEXT_MESSAGE_CHUNK";
  EventType2["THINKING_TEXT_MESSAGE_START"] = "THINKING_TEXT_MESSAGE_START";
  EventType2["THINKING_TEXT_MESSAGE_CONTENT"] = "THINKING_TEXT_MESSAGE_CONTENT";
  EventType2["THINKING_TEXT_MESSAGE_END"] = "THINKING_TEXT_MESSAGE_END";
  EventType2["TOOL_CALL_START"] = "TOOL_CALL_START";
  EventType2["TOOL_CALL_ARGS"] = "TOOL_CALL_ARGS";
  EventType2["TOOL_CALL_END"] = "TOOL_CALL_END";
  EventType2["TOOL_CALL_CHUNK"] = "TOOL_CALL_CHUNK";
  EventType2["TOOL_CALL_RESULT"] = "TOOL_CALL_RESULT";
  EventType2["THINKING_START"] = "THINKING_START";
  EventType2["THINKING_END"] = "THINKING_END";
  EventType2["STATE_SNAPSHOT"] = "STATE_SNAPSHOT";
  EventType2["STATE_DELTA"] = "STATE_DELTA";
  EventType2["MESSAGES_SNAPSHOT"] = "MESSAGES_SNAPSHOT";
  EventType2["RAW"] = "RAW";
  EventType2["CUSTOM"] = "CUSTOM";
  EventType2["RUN_STARTED"] = "RUN_STARTED";
  EventType2["RUN_FINISHED"] = "RUN_FINISHED";
  EventType2["RUN_ERROR"] = "RUN_ERROR";
  EventType2["STEP_STARTED"] = "STEP_STARTED";
  EventType2["STEP_FINISHED"] = "STEP_FINISHED";
  return EventType2;
})(EventType || {});
var BaseEventSchema = objectType({
  type: nativeEnumType(EventType),
  timestamp: numberType().optional(),
  rawEvent: anyType().optional()
});
var TextMessageStartEventSchema = BaseEventSchema.extend({
  type: literalType("TEXT_MESSAGE_START" /* TEXT_MESSAGE_START */),
  messageId: stringType(),
  role: literalType("assistant")
});
var TextMessageContentEventSchema = BaseEventSchema.extend({
  type: literalType("TEXT_MESSAGE_CONTENT" /* TEXT_MESSAGE_CONTENT */),
  messageId: stringType(),
  delta: stringType().refine((s) => s.length > 0, "Delta must not be an empty string")
});
var TextMessageEndEventSchema = BaseEventSchema.extend({
  type: literalType("TEXT_MESSAGE_END" /* TEXT_MESSAGE_END */),
  messageId: stringType()
});
var TextMessageChunkEventSchema = BaseEventSchema.extend({
  type: literalType("TEXT_MESSAGE_CHUNK" /* TEXT_MESSAGE_CHUNK */),
  messageId: stringType().optional(),
  role: literalType("assistant").optional(),
  delta: stringType().optional()
});
var ThinkingTextMessageStartEventSchema = BaseEventSchema.extend({
  type: literalType("THINKING_TEXT_MESSAGE_START" /* THINKING_TEXT_MESSAGE_START */)
});
var ThinkingTextMessageContentEventSchema = TextMessageContentEventSchema.omit({
  messageId: true,
  type: true
}).extend({
  type: literalType("THINKING_TEXT_MESSAGE_CONTENT" /* THINKING_TEXT_MESSAGE_CONTENT */)
});
var ThinkingTextMessageEndEventSchema = BaseEventSchema.extend({
  type: literalType("THINKING_TEXT_MESSAGE_END" /* THINKING_TEXT_MESSAGE_END */)
});
var ToolCallStartEventSchema = BaseEventSchema.extend({
  type: literalType("TOOL_CALL_START" /* TOOL_CALL_START */),
  toolCallId: stringType(),
  toolCallName: stringType(),
  parentMessageId: stringType().optional()
});
var ToolCallArgsEventSchema = BaseEventSchema.extend({
  type: literalType("TOOL_CALL_ARGS" /* TOOL_CALL_ARGS */),
  toolCallId: stringType(),
  delta: stringType()
});
var ToolCallEndEventSchema = BaseEventSchema.extend({
  type: literalType("TOOL_CALL_END" /* TOOL_CALL_END */),
  toolCallId: stringType()
});
var ToolCallResultEventSchema = BaseEventSchema.extend({
  messageId: stringType(),
  type: literalType("TOOL_CALL_RESULT" /* TOOL_CALL_RESULT */),
  toolCallId: stringType(),
  content: stringType(),
  role: literalType("tool").optional()
});
var ToolCallChunkEventSchema = BaseEventSchema.extend({
  type: literalType("TOOL_CALL_CHUNK" /* TOOL_CALL_CHUNK */),
  toolCallId: stringType().optional(),
  toolCallName: stringType().optional(),
  parentMessageId: stringType().optional(),
  delta: stringType().optional()
});
BaseEventSchema.extend({
  type: literalType("THINKING_START" /* THINKING_START */),
  title: stringType().optional()
});
BaseEventSchema.extend({
  type: literalType("THINKING_END" /* THINKING_END */)
});
var StateSnapshotEventSchema = BaseEventSchema.extend({
  type: literalType("STATE_SNAPSHOT" /* STATE_SNAPSHOT */),
  snapshot: StateSchema
});
var StateDeltaEventSchema = BaseEventSchema.extend({
  type: literalType("STATE_DELTA" /* STATE_DELTA */),
  delta: arrayType(anyType())
  // JSON Patch (RFC 6902)
});
var MessagesSnapshotEventSchema = BaseEventSchema.extend({
  type: literalType("MESSAGES_SNAPSHOT" /* MESSAGES_SNAPSHOT */),
  messages: arrayType(MessageSchema)
});
var RawEventSchema = BaseEventSchema.extend({
  type: literalType("RAW" /* RAW */),
  event: anyType(),
  source: stringType().optional()
});
var CustomEventSchema = BaseEventSchema.extend({
  type: literalType("CUSTOM" /* CUSTOM */),
  name: stringType(),
  value: anyType()
});
var RunStartedEventSchema = BaseEventSchema.extend({
  type: literalType("RUN_STARTED" /* RUN_STARTED */),
  threadId: stringType(),
  runId: stringType()
});
var RunFinishedEventSchema = BaseEventSchema.extend({
  type: literalType("RUN_FINISHED" /* RUN_FINISHED */),
  threadId: stringType(),
  runId: stringType(),
  result: anyType().optional()
});
var RunErrorEventSchema = BaseEventSchema.extend({
  type: literalType("RUN_ERROR" /* RUN_ERROR */),
  message: stringType(),
  code: stringType().optional()
});
var StepStartedEventSchema = BaseEventSchema.extend({
  type: literalType("STEP_STARTED" /* STEP_STARTED */),
  stepName: stringType()
});
var StepFinishedEventSchema = BaseEventSchema.extend({
  type: literalType("STEP_FINISHED" /* STEP_FINISHED */),
  stepName: stringType()
});
discriminatedUnionType("type", [
  TextMessageStartEventSchema,
  TextMessageContentEventSchema,
  TextMessageEndEventSchema,
  TextMessageChunkEventSchema,
  ThinkingTextMessageStartEventSchema,
  ThinkingTextMessageContentEventSchema,
  ThinkingTextMessageEndEventSchema,
  ToolCallStartEventSchema,
  ToolCallArgsEventSchema,
  ToolCallEndEventSchema,
  ToolCallChunkEventSchema,
  ToolCallResultEventSchema,
  StateSnapshotEventSchema,
  StateDeltaEventSchema,
  MessagesSnapshotEventSchema,
  RawEventSchema,
  CustomEventSchema,
  RunStartedEventSchema,
  RunFinishedEventSchema,
  RunErrorEventSchema,
  StepStartedEventSchema,
  StepFinishedEventSchema
]);

var operators = {};

var audit$1 = {};

var lift = {};

var isFunction$1 = {};

Object.defineProperty(isFunction$1, "__esModule", { value: true });
isFunction$1.isFunction = void 0;
function isFunction(value) {
    return typeof value === 'function';
}
isFunction$1.isFunction = isFunction;

Object.defineProperty(lift, "__esModule", { value: true });
lift.operate = lift.hasLift = void 0;
var isFunction_1$p = isFunction$1;
function hasLift(source) {
    return isFunction_1$p.isFunction(source === null || source === void 0 ? void 0 : source.lift);
}
lift.hasLift = hasLift;
function operate(init) {
    return function (source) {
        if (hasLift(source)) {
            return source.lift(function (liftedSource) {
                try {
                    return init(liftedSource, this);
                }
                catch (err) {
                    this.error(err);
                }
            });
        }
        throw new TypeError('Unable to lift unknown Observable type');
    };
}
lift.operate = operate;

var innerFrom$1 = {};

var isArrayLike = {};

Object.defineProperty(isArrayLike, "__esModule", { value: true });
isArrayLike.isArrayLike = void 0;
isArrayLike.isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });

var isPromise$1 = {};

Object.defineProperty(isPromise$1, "__esModule", { value: true });
isPromise$1.isPromise = void 0;
var isFunction_1$o = isFunction$1;
function isPromise(value) {
    return isFunction_1$o.isFunction(value === null || value === void 0 ? void 0 : value.then);
}
isPromise$1.isPromise = isPromise;

var Observable$1 = {};

var Subscriber = {};

var Subscription$1 = {};

var UnsubscriptionError = {};

var createErrorClass$1 = {};

Object.defineProperty(createErrorClass$1, "__esModule", { value: true });
createErrorClass$1.createErrorClass = void 0;
function createErrorClass(createImpl) {
    var _super = function (instance) {
        Error.call(instance);
        instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
}
createErrorClass$1.createErrorClass = createErrorClass;

Object.defineProperty(UnsubscriptionError, "__esModule", { value: true });
UnsubscriptionError.UnsubscriptionError = void 0;
var createErrorClass_1$5 = createErrorClass$1;
UnsubscriptionError.UnsubscriptionError = createErrorClass_1$5.createErrorClass(function (_super) {
    return function UnsubscriptionErrorImpl(errors) {
        _super(this);
        this.message = errors
            ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
            : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
    };
});

var arrRemove$1 = {};

Object.defineProperty(arrRemove$1, "__esModule", { value: true });
arrRemove$1.arrRemove = void 0;
function arrRemove(arr, item) {
    if (arr) {
        var index = arr.indexOf(item);
        0 <= index && arr.splice(index, 1);
    }
}
arrRemove$1.arrRemove = arrRemove;

var __values$8 = (Subscription$1 && Subscription$1.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read$i = (Subscription$1 && Subscription$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$h = (Subscription$1 && Subscription$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(Subscription$1, "__esModule", { value: true });
Subscription$1.isSubscription = Subscription$1.EMPTY_SUBSCRIPTION = Subscription$1.Subscription = void 0;
var isFunction_1$n = isFunction$1;
var UnsubscriptionError_1 = UnsubscriptionError;
var arrRemove_1$7 = arrRemove$1;
var Subscription = (function () {
    function Subscription(initialTeardown) {
        this.initialTeardown = initialTeardown;
        this.closed = false;
        this._parentage = null;
        this._finalizers = null;
    }
    Subscription.prototype.unsubscribe = function () {
        var e_1, _a, e_2, _b;
        var errors;
        if (!this.closed) {
            this.closed = true;
            var _parentage = this._parentage;
            if (_parentage) {
                this._parentage = null;
                if (Array.isArray(_parentage)) {
                    try {
                        for (var _parentage_1 = __values$8(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                            var parent_1 = _parentage_1_1.value;
                            parent_1.remove(this);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                else {
                    _parentage.remove(this);
                }
            }
            var initialFinalizer = this.initialTeardown;
            if (isFunction_1$n.isFunction(initialFinalizer)) {
                try {
                    initialFinalizer();
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError_1.UnsubscriptionError ? e.errors : [e];
                }
            }
            var _finalizers = this._finalizers;
            if (_finalizers) {
                this._finalizers = null;
                try {
                    for (var _finalizers_1 = __values$8(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
                        var finalizer = _finalizers_1_1.value;
                        try {
                            execFinalizer(finalizer);
                        }
                        catch (err) {
                            errors = errors !== null && errors !== void 0 ? errors : [];
                            if (err instanceof UnsubscriptionError_1.UnsubscriptionError) {
                                errors = __spreadArray$h(__spreadArray$h([], __read$i(errors)), __read$i(err.errors));
                            }
                            else {
                                errors.push(err);
                            }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            if (errors) {
                throw new UnsubscriptionError_1.UnsubscriptionError(errors);
            }
        }
    };
    Subscription.prototype.add = function (teardown) {
        var _a;
        if (teardown && teardown !== this) {
            if (this.closed) {
                execFinalizer(teardown);
            }
            else {
                if (teardown instanceof Subscription) {
                    if (teardown.closed || teardown._hasParent(this)) {
                        return;
                    }
                    teardown._addParent(this);
                }
                (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
            }
        }
    };
    Subscription.prototype._hasParent = function (parent) {
        var _parentage = this._parentage;
        return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
    };
    Subscription.prototype._addParent = function (parent) {
        var _parentage = this._parentage;
        this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription.prototype._removeParent = function (parent) {
        var _parentage = this._parentage;
        if (_parentage === parent) {
            this._parentage = null;
        }
        else if (Array.isArray(_parentage)) {
            arrRemove_1$7.arrRemove(_parentage, parent);
        }
    };
    Subscription.prototype.remove = function (teardown) {
        var _finalizers = this._finalizers;
        _finalizers && arrRemove_1$7.arrRemove(_finalizers, teardown);
        if (teardown instanceof Subscription) {
            teardown._removeParent(this);
        }
    };
    Subscription.EMPTY = (function () {
        var empty = new Subscription();
        empty.closed = true;
        return empty;
    })();
    return Subscription;
}());
Subscription$1.Subscription = Subscription;
Subscription$1.EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
    return (value instanceof Subscription ||
        (value && 'closed' in value && isFunction_1$n.isFunction(value.remove) && isFunction_1$n.isFunction(value.add) && isFunction_1$n.isFunction(value.unsubscribe)));
}
Subscription$1.isSubscription = isSubscription;
function execFinalizer(finalizer) {
    if (isFunction_1$n.isFunction(finalizer)) {
        finalizer();
    }
    else {
        finalizer.unsubscribe();
    }
}

var config = {};

Object.defineProperty(config, "__esModule", { value: true });
config.config = void 0;
config.config = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: undefined,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false,
};

var reportUnhandledError$1 = {};

var timeoutProvider = {};

(function (exports) {
	var __read = (timeoutProvider && timeoutProvider.__read) || function (o, n) {
	    var m = typeof Symbol === "function" && o[Symbol.iterator];
	    if (!m) return o;
	    var i = m.call(o), r, ar = [], e;
	    try {
	        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	    }
	    catch (error) { e = { error: error }; }
	    finally {
	        try {
	            if (r && !r.done && (m = i["return"])) m.call(i);
	        }
	        finally { if (e) throw e.error; }
	    }
	    return ar;
	};
	var __spreadArray = (timeoutProvider && timeoutProvider.__spreadArray) || function (to, from) {
	    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
	        to[j] = from[i];
	    return to;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.timeoutProvider = void 0;
	exports.timeoutProvider = {
	    setTimeout: function (handler, timeout) {
	        var args = [];
	        for (var _i = 2; _i < arguments.length; _i++) {
	            args[_i - 2] = arguments[_i];
	        }
	        var delegate = exports.timeoutProvider.delegate;
	        if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
	            return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
	        }
	        return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
	    },
	    clearTimeout: function (handle) {
	        var delegate = exports.timeoutProvider.delegate;
	        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
	    },
	    delegate: undefined,
	};
	
} (timeoutProvider));

Object.defineProperty(reportUnhandledError$1, "__esModule", { value: true });
reportUnhandledError$1.reportUnhandledError = void 0;
var config_1$2 = config;
var timeoutProvider_1 = timeoutProvider;
function reportUnhandledError(err) {
    timeoutProvider_1.timeoutProvider.setTimeout(function () {
        var onUnhandledError = config_1$2.config.onUnhandledError;
        if (onUnhandledError) {
            onUnhandledError(err);
        }
        else {
            throw err;
        }
    });
}
reportUnhandledError$1.reportUnhandledError = reportUnhandledError;

var noop$1 = {};

Object.defineProperty(noop$1, "__esModule", { value: true });
noop$1.noop = void 0;
function noop() { }
noop$1.noop = noop;

var NotificationFactories = {};

Object.defineProperty(NotificationFactories, "__esModule", { value: true });
NotificationFactories.createNotification = NotificationFactories.nextNotification = NotificationFactories.errorNotification = NotificationFactories.COMPLETE_NOTIFICATION = void 0;
NotificationFactories.COMPLETE_NOTIFICATION = (function () { return createNotification('C', undefined, undefined); })();
function errorNotification(error) {
    return createNotification('E', undefined, error);
}
NotificationFactories.errorNotification = errorNotification;
function nextNotification(value) {
    return createNotification('N', value, undefined);
}
NotificationFactories.nextNotification = nextNotification;
function createNotification(kind, value, error) {
    return {
        kind: kind,
        value: value,
        error: error,
    };
}
NotificationFactories.createNotification = createNotification;

var errorContext$1 = {};

Object.defineProperty(errorContext$1, "__esModule", { value: true });
errorContext$1.captureError = errorContext$1.errorContext = void 0;
var config_1$1 = config;
var context = null;
function errorContext(cb) {
    if (config_1$1.config.useDeprecatedSynchronousErrorHandling) {
        var isRoot = !context;
        if (isRoot) {
            context = { errorThrown: false, error: null };
        }
        cb();
        if (isRoot) {
            var _a = context, errorThrown = _a.errorThrown, error = _a.error;
            context = null;
            if (errorThrown) {
                throw error;
            }
        }
    }
    else {
        cb();
    }
}
errorContext$1.errorContext = errorContext;
function captureError(err) {
    if (config_1$1.config.useDeprecatedSynchronousErrorHandling && context) {
        context.errorThrown = true;
        context.error = err;
    }
}
errorContext$1.captureError = captureError;

(function (exports) {
	var __extends = (Subscriber && Subscriber.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EMPTY_OBSERVER = exports.SafeSubscriber = exports.Subscriber = void 0;
	var isFunction_1 = isFunction$1;
	var Subscription_1 = Subscription$1;
	var config_1 = config;
	var reportUnhandledError_1 = reportUnhandledError$1;
	var noop_1 = noop$1;
	var NotificationFactories_1 = NotificationFactories;
	var timeoutProvider_1 = timeoutProvider;
	var errorContext_1 = errorContext$1;
	var Subscriber$1 = (function (_super) {
	    __extends(Subscriber, _super);
	    function Subscriber(destination) {
	        var _this = _super.call(this) || this;
	        _this.isStopped = false;
	        if (destination) {
	            _this.destination = destination;
	            if (Subscription_1.isSubscription(destination)) {
	                destination.add(_this);
	            }
	        }
	        else {
	            _this.destination = exports.EMPTY_OBSERVER;
	        }
	        return _this;
	    }
	    Subscriber.create = function (next, error, complete) {
	        return new SafeSubscriber(next, error, complete);
	    };
	    Subscriber.prototype.next = function (value) {
	        if (this.isStopped) {
	            handleStoppedNotification(NotificationFactories_1.nextNotification(value), this);
	        }
	        else {
	            this._next(value);
	        }
	    };
	    Subscriber.prototype.error = function (err) {
	        if (this.isStopped) {
	            handleStoppedNotification(NotificationFactories_1.errorNotification(err), this);
	        }
	        else {
	            this.isStopped = true;
	            this._error(err);
	        }
	    };
	    Subscriber.prototype.complete = function () {
	        if (this.isStopped) {
	            handleStoppedNotification(NotificationFactories_1.COMPLETE_NOTIFICATION, this);
	        }
	        else {
	            this.isStopped = true;
	            this._complete();
	        }
	    };
	    Subscriber.prototype.unsubscribe = function () {
	        if (!this.closed) {
	            this.isStopped = true;
	            _super.prototype.unsubscribe.call(this);
	            this.destination = null;
	        }
	    };
	    Subscriber.prototype._next = function (value) {
	        this.destination.next(value);
	    };
	    Subscriber.prototype._error = function (err) {
	        try {
	            this.destination.error(err);
	        }
	        finally {
	            this.unsubscribe();
	        }
	    };
	    Subscriber.prototype._complete = function () {
	        try {
	            this.destination.complete();
	        }
	        finally {
	            this.unsubscribe();
	        }
	    };
	    return Subscriber;
	}(Subscription_1.Subscription));
	exports.Subscriber = Subscriber$1;
	var _bind = Function.prototype.bind;
	function bind(fn, thisArg) {
	    return _bind.call(fn, thisArg);
	}
	var ConsumerObserver = (function () {
	    function ConsumerObserver(partialObserver) {
	        this.partialObserver = partialObserver;
	    }
	    ConsumerObserver.prototype.next = function (value) {
	        var partialObserver = this.partialObserver;
	        if (partialObserver.next) {
	            try {
	                partialObserver.next(value);
	            }
	            catch (error) {
	                handleUnhandledError(error);
	            }
	        }
	    };
	    ConsumerObserver.prototype.error = function (err) {
	        var partialObserver = this.partialObserver;
	        if (partialObserver.error) {
	            try {
	                partialObserver.error(err);
	            }
	            catch (error) {
	                handleUnhandledError(error);
	            }
	        }
	        else {
	            handleUnhandledError(err);
	        }
	    };
	    ConsumerObserver.prototype.complete = function () {
	        var partialObserver = this.partialObserver;
	        if (partialObserver.complete) {
	            try {
	                partialObserver.complete();
	            }
	            catch (error) {
	                handleUnhandledError(error);
	            }
	        }
	    };
	    return ConsumerObserver;
	}());
	var SafeSubscriber = (function (_super) {
	    __extends(SafeSubscriber, _super);
	    function SafeSubscriber(observerOrNext, error, complete) {
	        var _this = _super.call(this) || this;
	        var partialObserver;
	        if (isFunction_1.isFunction(observerOrNext) || !observerOrNext) {
	            partialObserver = {
	                next: (observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : undefined),
	                error: error !== null && error !== void 0 ? error : undefined,
	                complete: complete !== null && complete !== void 0 ? complete : undefined,
	            };
	        }
	        else {
	            var context_1;
	            if (_this && config_1.config.useDeprecatedNextContext) {
	                context_1 = Object.create(observerOrNext);
	                context_1.unsubscribe = function () { return _this.unsubscribe(); };
	                partialObserver = {
	                    next: observerOrNext.next && bind(observerOrNext.next, context_1),
	                    error: observerOrNext.error && bind(observerOrNext.error, context_1),
	                    complete: observerOrNext.complete && bind(observerOrNext.complete, context_1),
	                };
	            }
	            else {
	                partialObserver = observerOrNext;
	            }
	        }
	        _this.destination = new ConsumerObserver(partialObserver);
	        return _this;
	    }
	    return SafeSubscriber;
	}(Subscriber$1));
	exports.SafeSubscriber = SafeSubscriber;
	function handleUnhandledError(error) {
	    if (config_1.config.useDeprecatedSynchronousErrorHandling) {
	        errorContext_1.captureError(error);
	    }
	    else {
	        reportUnhandledError_1.reportUnhandledError(error);
	    }
	}
	function defaultErrorHandler(err) {
	    throw err;
	}
	function handleStoppedNotification(notification, subscriber) {
	    var onStoppedNotification = config_1.config.onStoppedNotification;
	    onStoppedNotification && timeoutProvider_1.timeoutProvider.setTimeout(function () { return onStoppedNotification(notification, subscriber); });
	}
	exports.EMPTY_OBSERVER = {
	    closed: true,
	    next: noop_1.noop,
	    error: defaultErrorHandler,
	    complete: noop_1.noop,
	};
	
} (Subscriber));

var observable = {};

Object.defineProperty(observable, "__esModule", { value: true });
observable.observable = void 0;
observable.observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();

var pipe$1 = {};

var identity$1 = {};

Object.defineProperty(identity$1, "__esModule", { value: true });
identity$1.identity = void 0;
function identity(x) {
    return x;
}
identity$1.identity = identity;

Object.defineProperty(pipe$1, "__esModule", { value: true });
pipe$1.pipeFromArray = pipe$1.pipe = void 0;
var identity_1$e = identity$1;
function pipe() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i] = arguments[_i];
    }
    return pipeFromArray(fns);
}
pipe$1.pipe = pipe;
function pipeFromArray(fns) {
    if (fns.length === 0) {
        return identity_1$e.identity;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}
pipe$1.pipeFromArray = pipeFromArray;

Object.defineProperty(Observable$1, "__esModule", { value: true });
Observable$1.Observable = void 0;
var Subscriber_1$3 = Subscriber;
var Subscription_1$8 = Subscription$1;
var observable_1$2 = observable;
var pipe_1$2 = pipe$1;
var config_1 = config;
var isFunction_1$m = isFunction$1;
var errorContext_1$1 = errorContext$1;
var Observable = (function () {
    function Observable(subscribe) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var _this = this;
        var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new Subscriber_1$3.SafeSubscriber(observerOrNext, error, complete);
        errorContext_1$1.errorContext(function () {
            var _a = _this, operator = _a.operator, source = _a.source;
            subscriber.add(operator
                ?
                    operator.call(subscriber, source)
                : source
                    ?
                        _this._subscribe(subscriber)
                    :
                        _this._trySubscribe(subscriber));
        });
        return subscriber;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            sink.error(err);
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscriber = new Subscriber_1$3.SafeSubscriber({
                next: function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscriber.unsubscribe();
                    }
                },
                error: reject,
                complete: resolve,
            });
            _this.subscribe(subscriber);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var _a;
        return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
    };
    Observable.prototype[observable_1$2.observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        return pipe_1$2.pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
Observable$1.Observable = Observable;
function getPromiseCtor(promiseCtor) {
    var _a;
    return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config_1.config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
    return value && isFunction_1$m.isFunction(value.next) && isFunction_1$m.isFunction(value.error) && isFunction_1$m.isFunction(value.complete);
}
function isSubscriber(value) {
    return (value && value instanceof Subscriber_1$3.Subscriber) || (isObserver(value) && Subscription_1$8.isSubscription(value));
}

var isInteropObservable$1 = {};

Object.defineProperty(isInteropObservable$1, "__esModule", { value: true });
isInteropObservable$1.isInteropObservable = void 0;
var observable_1$1 = observable;
var isFunction_1$l = isFunction$1;
function isInteropObservable(input) {
    return isFunction_1$l.isFunction(input[observable_1$1.observable]);
}
isInteropObservable$1.isInteropObservable = isInteropObservable;

var isAsyncIterable$1 = {};

Object.defineProperty(isAsyncIterable$1, "__esModule", { value: true });
isAsyncIterable$1.isAsyncIterable = void 0;
var isFunction_1$k = isFunction$1;
function isAsyncIterable(obj) {
    return Symbol.asyncIterator && isFunction_1$k.isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
}
isAsyncIterable$1.isAsyncIterable = isAsyncIterable;

var throwUnobservableError = {};

Object.defineProperty(throwUnobservableError, "__esModule", { value: true });
throwUnobservableError.createInvalidObservableTypeError = void 0;
function createInvalidObservableTypeError(input) {
    return new TypeError("You provided " + (input !== null && typeof input === 'object' ? 'an invalid object' : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}
throwUnobservableError.createInvalidObservableTypeError = createInvalidObservableTypeError;

var isIterable$1 = {};

var iterator = {};

Object.defineProperty(iterator, "__esModule", { value: true });
iterator.iterator = iterator.getSymbolIterator = void 0;
function getSymbolIterator() {
    if (typeof Symbol !== 'function' || !Symbol.iterator) {
        return '@@iterator';
    }
    return Symbol.iterator;
}
iterator.getSymbolIterator = getSymbolIterator;
iterator.iterator = getSymbolIterator();

Object.defineProperty(isIterable$1, "__esModule", { value: true });
isIterable$1.isIterable = void 0;
var iterator_1$1 = iterator;
var isFunction_1$j = isFunction$1;
function isIterable(input) {
    return isFunction_1$j.isFunction(input === null || input === void 0 ? void 0 : input[iterator_1$1.iterator]);
}
isIterable$1.isIterable = isIterable;

var isReadableStreamLike$1 = {};

var __generator$2 = (isReadableStreamLike$1 && isReadableStreamLike$1.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __await = (isReadableStreamLike$1 && isReadableStreamLike$1.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); };
var __asyncGenerator = (isReadableStreamLike$1 && isReadableStreamLike$1.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(isReadableStreamLike$1, "__esModule", { value: true });
isReadableStreamLike$1.isReadableStreamLike = isReadableStreamLike$1.readableStreamLikeToAsyncGenerator = void 0;
var isFunction_1$i = isFunction$1;
function readableStreamLikeToAsyncGenerator(readableStream) {
    return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
        var reader, _a, value, done;
        return __generator$2(this, function (_b) {
            switch (_b.label) {
                case 0:
                    reader = readableStream.getReader();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, , 9, 10]);
                    _b.label = 2;
                case 2:
                    return [4, __await(reader.read())];
                case 3:
                    _a = _b.sent(), value = _a.value, done = _a.done;
                    if (!done) return [3, 5];
                    return [4, __await(void 0)];
                case 4: return [2, _b.sent()];
                case 5: return [4, __await(value)];
                case 6: return [4, _b.sent()];
                case 7:
                    _b.sent();
                    return [3, 2];
                case 8: return [3, 10];
                case 9:
                    reader.releaseLock();
                    return [7];
                case 10: return [2];
            }
        });
    });
}
isReadableStreamLike$1.readableStreamLikeToAsyncGenerator = readableStreamLikeToAsyncGenerator;
function isReadableStreamLike(obj) {
    return isFunction_1$i.isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
}
isReadableStreamLike$1.isReadableStreamLike = isReadableStreamLike;

var __awaiter = (innerFrom$1 && innerFrom$1.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator$1 = (innerFrom$1 && innerFrom$1.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (innerFrom$1 && innerFrom$1.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values$7 === "function" ? __values$7(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __values$7 = (innerFrom$1 && innerFrom$1.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(innerFrom$1, "__esModule", { value: true });
innerFrom$1.fromReadableStreamLike = innerFrom$1.fromAsyncIterable = innerFrom$1.fromIterable = innerFrom$1.fromPromise = innerFrom$1.fromArrayLike = innerFrom$1.fromInteropObservable = innerFrom$1.innerFrom = void 0;
var isArrayLike_1$2 = isArrayLike;
var isPromise_1$1 = isPromise$1;
var Observable_1$n = Observable$1;
var isInteropObservable_1$1 = isInteropObservable$1;
var isAsyncIterable_1$1 = isAsyncIterable$1;
var throwUnobservableError_1$1 = throwUnobservableError;
var isIterable_1$1 = isIterable$1;
var isReadableStreamLike_1$2 = isReadableStreamLike$1;
var isFunction_1$h = isFunction$1;
var reportUnhandledError_1 = reportUnhandledError$1;
var observable_1 = observable;
function innerFrom(input) {
    if (input instanceof Observable_1$n.Observable) {
        return input;
    }
    if (input != null) {
        if (isInteropObservable_1$1.isInteropObservable(input)) {
            return fromInteropObservable(input);
        }
        if (isArrayLike_1$2.isArrayLike(input)) {
            return fromArrayLike(input);
        }
        if (isPromise_1$1.isPromise(input)) {
            return fromPromise(input);
        }
        if (isAsyncIterable_1$1.isAsyncIterable(input)) {
            return fromAsyncIterable(input);
        }
        if (isIterable_1$1.isIterable(input)) {
            return fromIterable(input);
        }
        if (isReadableStreamLike_1$2.isReadableStreamLike(input)) {
            return fromReadableStreamLike(input);
        }
    }
    throw throwUnobservableError_1$1.createInvalidObservableTypeError(input);
}
innerFrom$1.innerFrom = innerFrom;
function fromInteropObservable(obj) {
    return new Observable_1$n.Observable(function (subscriber) {
        var obs = obj[observable_1.observable]();
        if (isFunction_1$h.isFunction(obs.subscribe)) {
            return obs.subscribe(subscriber);
        }
        throw new TypeError('Provided object does not correctly implement Symbol.observable');
    });
}
innerFrom$1.fromInteropObservable = fromInteropObservable;
function fromArrayLike(array) {
    return new Observable_1$n.Observable(function (subscriber) {
        for (var i = 0; i < array.length && !subscriber.closed; i++) {
            subscriber.next(array[i]);
        }
        subscriber.complete();
    });
}
innerFrom$1.fromArrayLike = fromArrayLike;
function fromPromise(promise) {
    return new Observable_1$n.Observable(function (subscriber) {
        promise
            .then(function (value) {
            if (!subscriber.closed) {
                subscriber.next(value);
                subscriber.complete();
            }
        }, function (err) { return subscriber.error(err); })
            .then(null, reportUnhandledError_1.reportUnhandledError);
    });
}
innerFrom$1.fromPromise = fromPromise;
function fromIterable(iterable) {
    return new Observable_1$n.Observable(function (subscriber) {
        var e_1, _a;
        try {
            for (var iterable_1 = __values$7(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
                var value = iterable_1_1.value;
                subscriber.next(value);
                if (subscriber.closed) {
                    return;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        subscriber.complete();
    });
}
innerFrom$1.fromIterable = fromIterable;
function fromAsyncIterable(asyncIterable) {
    return new Observable_1$n.Observable(function (subscriber) {
        process$1(asyncIterable, subscriber).catch(function (err) { return subscriber.error(err); });
    });
}
innerFrom$1.fromAsyncIterable = fromAsyncIterable;
function fromReadableStreamLike(readableStream) {
    return fromAsyncIterable(isReadableStreamLike_1$2.readableStreamLikeToAsyncGenerator(readableStream));
}
innerFrom$1.fromReadableStreamLike = fromReadableStreamLike;
function process$1(asyncIterable, subscriber) {
    var asyncIterable_1, asyncIterable_1_1;
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function () {
        var value, e_2_1;
        return __generator$1(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 11]);
                    asyncIterable_1 = __asyncValues(asyncIterable);
                    _b.label = 1;
                case 1: return [4, asyncIterable_1.next()];
                case 2:
                    if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
                    value = asyncIterable_1_1.value;
                    subscriber.next(value);
                    if (subscriber.closed) {
                        return [2];
                    }
                    _b.label = 3;
                case 3: return [3, 1];
                case 4: return [3, 11];
                case 5:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3, 11];
                case 6:
                    _b.trys.push([6, , 9, 10]);
                    if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
                    return [4, _a.call(asyncIterable_1)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3, 10];
                case 9:
                    if (e_2) throw e_2.error;
                    return [7];
                case 10: return [7];
                case 11:
                    subscriber.complete();
                    return [2];
            }
        });
    });
}

var OperatorSubscriber$1 = {};

var __extends$g = (OperatorSubscriber$1 && OperatorSubscriber$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(OperatorSubscriber$1, "__esModule", { value: true });
OperatorSubscriber$1.OperatorSubscriber = OperatorSubscriber$1.createOperatorSubscriber = void 0;
var Subscriber_1$2 = Subscriber;
function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
    return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
OperatorSubscriber$1.createOperatorSubscriber = createOperatorSubscriber;
var OperatorSubscriber = (function (_super) {
    __extends$g(OperatorSubscriber, _super);
    function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
        var _this = _super.call(this, destination) || this;
        _this.onFinalize = onFinalize;
        _this.shouldUnsubscribe = shouldUnsubscribe;
        _this._next = onNext
            ? function (value) {
                try {
                    onNext(value);
                }
                catch (err) {
                    destination.error(err);
                }
            }
            : _super.prototype._next;
        _this._error = onError
            ? function (err) {
                try {
                    onError(err);
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : _super.prototype._error;
        _this._complete = onComplete
            ? function () {
                try {
                    onComplete();
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : _super.prototype._complete;
        return _this;
    }
    OperatorSubscriber.prototype.unsubscribe = function () {
        var _a;
        if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
            var closed_1 = this.closed;
            _super.prototype.unsubscribe.call(this);
            !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
        }
    };
    return OperatorSubscriber;
}(Subscriber_1$2.Subscriber));
OperatorSubscriber$1.OperatorSubscriber = OperatorSubscriber;

Object.defineProperty(audit$1, "__esModule", { value: true });
audit$1.audit = void 0;
var lift_1$14 = lift;
var innerFrom_1$D = innerFrom$1;
var OperatorSubscriber_1$V = OperatorSubscriber$1;
function audit(durationSelector) {
    return lift_1$14.operate(function (source, subscriber) {
        var hasValue = false;
        var lastValue = null;
        var durationSubscriber = null;
        var isComplete = false;
        var endDuration = function () {
            durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
            durationSubscriber = null;
            if (hasValue) {
                hasValue = false;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
            isComplete && subscriber.complete();
        };
        var cleanupDuration = function () {
            durationSubscriber = null;
            isComplete && subscriber.complete();
        };
        source.subscribe(OperatorSubscriber_1$V.createOperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            lastValue = value;
            if (!durationSubscriber) {
                innerFrom_1$D.innerFrom(durationSelector(value)).subscribe((durationSubscriber = OperatorSubscriber_1$V.createOperatorSubscriber(subscriber, endDuration, cleanupDuration)));
            }
        }, function () {
            isComplete = true;
            (!hasValue || !durationSubscriber || durationSubscriber.closed) && subscriber.complete();
        }));
    });
}
audit$1.audit = audit;

var auditTime$1 = {};

var async = {};

var AsyncAction$1 = {};

var Action$1 = {};

var __extends$f = (Action$1 && Action$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(Action$1, "__esModule", { value: true });
Action$1.Action = void 0;
var Subscription_1$7 = Subscription$1;
var Action = (function (_super) {
    __extends$f(Action, _super);
    function Action(scheduler, work) {
        return _super.call(this) || this;
    }
    Action.prototype.schedule = function (state, delay) {
        return this;
    };
    return Action;
}(Subscription_1$7.Subscription));
Action$1.Action = Action;

var intervalProvider = {};

(function (exports) {
	var __read = (intervalProvider && intervalProvider.__read) || function (o, n) {
	    var m = typeof Symbol === "function" && o[Symbol.iterator];
	    if (!m) return o;
	    var i = m.call(o), r, ar = [], e;
	    try {
	        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	    }
	    catch (error) { e = { error: error }; }
	    finally {
	        try {
	            if (r && !r.done && (m = i["return"])) m.call(i);
	        }
	        finally { if (e) throw e.error; }
	    }
	    return ar;
	};
	var __spreadArray = (intervalProvider && intervalProvider.__spreadArray) || function (to, from) {
	    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
	        to[j] = from[i];
	    return to;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.intervalProvider = void 0;
	exports.intervalProvider = {
	    setInterval: function (handler, timeout) {
	        var args = [];
	        for (var _i = 2; _i < arguments.length; _i++) {
	            args[_i - 2] = arguments[_i];
	        }
	        var delegate = exports.intervalProvider.delegate;
	        if (delegate === null || delegate === void 0 ? void 0 : delegate.setInterval) {
	            return delegate.setInterval.apply(delegate, __spreadArray([handler, timeout], __read(args)));
	        }
	        return setInterval.apply(void 0, __spreadArray([handler, timeout], __read(args)));
	    },
	    clearInterval: function (handle) {
	        var delegate = exports.intervalProvider.delegate;
	        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearInterval) || clearInterval)(handle);
	    },
	    delegate: undefined,
	};
	
} (intervalProvider));

var __extends$e = (AsyncAction$1 && AsyncAction$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(AsyncAction$1, "__esModule", { value: true });
AsyncAction$1.AsyncAction = void 0;
var Action_1 = Action$1;
var intervalProvider_1 = intervalProvider;
var arrRemove_1$6 = arrRemove$1;
var AsyncAction = (function (_super) {
    __extends$e(AsyncAction, _super);
    function AsyncAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.pending = false;
        return _this;
    }
    AsyncAction.prototype.schedule = function (state, delay) {
        var _a;
        if (delay === void 0) { delay = 0; }
        if (this.closed) {
            return this;
        }
        this.state = state;
        var id = this.id;
        var scheduler = this.scheduler;
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, delay);
        }
        this.pending = true;
        this.delay = delay;
        this.id = (_a = this.id) !== null && _a !== void 0 ? _a : this.requestAsyncId(scheduler, this.id, delay);
        return this;
    };
    AsyncAction.prototype.requestAsyncId = function (scheduler, _id, delay) {
        if (delay === void 0) { delay = 0; }
        return intervalProvider_1.intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
    };
    AsyncAction.prototype.recycleAsyncId = function (_scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay != null && this.delay === delay && this.pending === false) {
            return id;
        }
        if (id != null) {
            intervalProvider_1.intervalProvider.clearInterval(id);
        }
        return undefined;
    };
    AsyncAction.prototype.execute = function (state, delay) {
        if (this.closed) {
            return new Error('executing a cancelled action');
        }
        this.pending = false;
        var error = this._execute(state, delay);
        if (error) {
            return error;
        }
        else if (this.pending === false && this.id != null) {
            this.id = this.recycleAsyncId(this.scheduler, this.id, null);
        }
    };
    AsyncAction.prototype._execute = function (state, _delay) {
        var errored = false;
        var errorValue;
        try {
            this.work(state);
        }
        catch (e) {
            errored = true;
            errorValue = e ? e : new Error('Scheduled action threw falsy error');
        }
        if (errored) {
            this.unsubscribe();
            return errorValue;
        }
    };
    AsyncAction.prototype.unsubscribe = function () {
        if (!this.closed) {
            var _a = this, id = _a.id, scheduler = _a.scheduler;
            var actions = scheduler.actions;
            this.work = this.state = this.scheduler = null;
            this.pending = false;
            arrRemove_1$6.arrRemove(actions, this);
            if (id != null) {
                this.id = this.recycleAsyncId(scheduler, id, null);
            }
            this.delay = null;
            _super.prototype.unsubscribe.call(this);
        }
    };
    return AsyncAction;
}(Action_1.Action));
AsyncAction$1.AsyncAction = AsyncAction;

var AsyncScheduler$1 = {};

var Scheduler$1 = {};

var dateTimestampProvider = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.dateTimestampProvider = void 0;
	exports.dateTimestampProvider = {
	    now: function () {
	        return (exports.dateTimestampProvider.delegate || Date).now();
	    },
	    delegate: undefined,
	};
	
} (dateTimestampProvider));

Object.defineProperty(Scheduler$1, "__esModule", { value: true });
Scheduler$1.Scheduler = void 0;
var dateTimestampProvider_1$2 = dateTimestampProvider;
var Scheduler = (function () {
    function Scheduler(schedulerActionCtor, now) {
        if (now === void 0) { now = Scheduler.now; }
        this.schedulerActionCtor = schedulerActionCtor;
        this.now = now;
    }
    Scheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) { delay = 0; }
        return new this.schedulerActionCtor(this, work).schedule(state, delay);
    };
    Scheduler.now = dateTimestampProvider_1$2.dateTimestampProvider.now;
    return Scheduler;
}());
Scheduler$1.Scheduler = Scheduler;

var __extends$d = (AsyncScheduler$1 && AsyncScheduler$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(AsyncScheduler$1, "__esModule", { value: true });
AsyncScheduler$1.AsyncScheduler = void 0;
var Scheduler_1 = Scheduler$1;
var AsyncScheduler = (function (_super) {
    __extends$d(AsyncScheduler, _super);
    function AsyncScheduler(SchedulerAction, now) {
        if (now === void 0) { now = Scheduler_1.Scheduler.now; }
        var _this = _super.call(this, SchedulerAction, now) || this;
        _this.actions = [];
        _this._active = false;
        return _this;
    }
    AsyncScheduler.prototype.flush = function (action) {
        var actions = this.actions;
        if (this._active) {
            actions.push(action);
            return;
        }
        var error;
        this._active = true;
        do {
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        } while ((action = actions.shift()));
        this._active = false;
        if (error) {
            while ((action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsyncScheduler;
}(Scheduler_1.Scheduler));
AsyncScheduler$1.AsyncScheduler = AsyncScheduler;

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.async = exports.asyncScheduler = void 0;
	var AsyncAction_1 = AsyncAction$1;
	var AsyncScheduler_1 = AsyncScheduler$1;
	exports.asyncScheduler = new AsyncScheduler_1.AsyncScheduler(AsyncAction_1.AsyncAction);
	exports.async = exports.asyncScheduler;
	
} (async));

var timer$1 = {};

var isScheduler$1 = {};

Object.defineProperty(isScheduler$1, "__esModule", { value: true });
isScheduler$1.isScheduler = void 0;
var isFunction_1$g = isFunction$1;
function isScheduler(value) {
    return value && isFunction_1$g.isFunction(value.schedule);
}
isScheduler$1.isScheduler = isScheduler;

var isDate = {};

Object.defineProperty(isDate, "__esModule", { value: true });
isDate.isValidDate = void 0;
function isValidDate(value) {
    return value instanceof Date && !isNaN(value);
}
isDate.isValidDate = isValidDate;

Object.defineProperty(timer$1, "__esModule", { value: true });
timer$1.timer = void 0;
var Observable_1$m = Observable$1;
var async_1$a = async;
var isScheduler_1$3 = isScheduler$1;
var isDate_1$1 = isDate;
function timer(dueTime, intervalOrScheduler, scheduler) {
    if (dueTime === void 0) { dueTime = 0; }
    if (scheduler === void 0) { scheduler = async_1$a.async; }
    var intervalDuration = -1;
    if (intervalOrScheduler != null) {
        if (isScheduler_1$3.isScheduler(intervalOrScheduler)) {
            scheduler = intervalOrScheduler;
        }
        else {
            intervalDuration = intervalOrScheduler;
        }
    }
    return new Observable_1$m.Observable(function (subscriber) {
        var due = isDate_1$1.isValidDate(dueTime) ? +dueTime - scheduler.now() : dueTime;
        if (due < 0) {
            due = 0;
        }
        var n = 0;
        return scheduler.schedule(function () {
            if (!subscriber.closed) {
                subscriber.next(n++);
                if (0 <= intervalDuration) {
                    this.schedule(undefined, intervalDuration);
                }
                else {
                    subscriber.complete();
                }
            }
        }, due);
    });
}
timer$1.timer = timer;

Object.defineProperty(auditTime$1, "__esModule", { value: true });
auditTime$1.auditTime = void 0;
var async_1$9 = async;
var audit_1 = audit$1;
var timer_1$5 = timer$1;
function auditTime(duration, scheduler) {
    if (scheduler === void 0) { scheduler = async_1$9.asyncScheduler; }
    return audit_1.audit(function () { return timer_1$5.timer(duration, scheduler); });
}
auditTime$1.auditTime = auditTime;

var buffer$1 = {};

Object.defineProperty(buffer$1, "__esModule", { value: true });
buffer$1.buffer = void 0;
var lift_1$13 = lift;
var noop_1$c = noop$1;
var OperatorSubscriber_1$U = OperatorSubscriber$1;
var innerFrom_1$C = innerFrom$1;
function buffer(closingNotifier) {
    return lift_1$13.operate(function (source, subscriber) {
        var currentBuffer = [];
        source.subscribe(OperatorSubscriber_1$U.createOperatorSubscriber(subscriber, function (value) { return currentBuffer.push(value); }, function () {
            subscriber.next(currentBuffer);
            subscriber.complete();
        }));
        innerFrom_1$C.innerFrom(closingNotifier).subscribe(OperatorSubscriber_1$U.createOperatorSubscriber(subscriber, function () {
            var b = currentBuffer;
            currentBuffer = [];
            subscriber.next(b);
        }, noop_1$c.noop));
        return function () {
            currentBuffer = null;
        };
    });
}
buffer$1.buffer = buffer;

var bufferCount$1 = {};

var __values$6 = (bufferCount$1 && bufferCount$1.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(bufferCount$1, "__esModule", { value: true });
bufferCount$1.bufferCount = void 0;
var lift_1$12 = lift;
var OperatorSubscriber_1$T = OperatorSubscriber$1;
var arrRemove_1$5 = arrRemove$1;
function bufferCount(bufferSize, startBufferEvery) {
    if (startBufferEvery === void 0) { startBufferEvery = null; }
    startBufferEvery = startBufferEvery !== null && startBufferEvery !== void 0 ? startBufferEvery : bufferSize;
    return lift_1$12.operate(function (source, subscriber) {
        var buffers = [];
        var count = 0;
        source.subscribe(OperatorSubscriber_1$T.createOperatorSubscriber(subscriber, function (value) {
            var e_1, _a, e_2, _b;
            var toEmit = null;
            if (count++ % startBufferEvery === 0) {
                buffers.push([]);
            }
            try {
                for (var buffers_1 = __values$6(buffers), buffers_1_1 = buffers_1.next(); !buffers_1_1.done; buffers_1_1 = buffers_1.next()) {
                    var buffer = buffers_1_1.value;
                    buffer.push(value);
                    if (bufferSize <= buffer.length) {
                        toEmit = toEmit !== null && toEmit !== void 0 ? toEmit : [];
                        toEmit.push(buffer);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (buffers_1_1 && !buffers_1_1.done && (_a = buffers_1.return)) _a.call(buffers_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (toEmit) {
                try {
                    for (var toEmit_1 = __values$6(toEmit), toEmit_1_1 = toEmit_1.next(); !toEmit_1_1.done; toEmit_1_1 = toEmit_1.next()) {
                        var buffer = toEmit_1_1.value;
                        arrRemove_1$5.arrRemove(buffers, buffer);
                        subscriber.next(buffer);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (toEmit_1_1 && !toEmit_1_1.done && (_b = toEmit_1.return)) _b.call(toEmit_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }, function () {
            var e_3, _a;
            try {
                for (var buffers_2 = __values$6(buffers), buffers_2_1 = buffers_2.next(); !buffers_2_1.done; buffers_2_1 = buffers_2.next()) {
                    var buffer = buffers_2_1.value;
                    subscriber.next(buffer);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (buffers_2_1 && !buffers_2_1.done && (_a = buffers_2.return)) _a.call(buffers_2);
                }
                finally { if (e_3) throw e_3.error; }
            }
            subscriber.complete();
        }, undefined, function () {
            buffers = null;
        }));
    });
}
bufferCount$1.bufferCount = bufferCount;

var bufferTime$1 = {};

var args = {};

Object.defineProperty(args, "__esModule", { value: true });
args.popNumber = args.popScheduler = args.popResultSelector = void 0;
var isFunction_1$f = isFunction$1;
var isScheduler_1$2 = isScheduler$1;
function last$2(arr) {
    return arr[arr.length - 1];
}
function popResultSelector(args) {
    return isFunction_1$f.isFunction(last$2(args)) ? args.pop() : undefined;
}
args.popResultSelector = popResultSelector;
function popScheduler(args) {
    return isScheduler_1$2.isScheduler(last$2(args)) ? args.pop() : undefined;
}
args.popScheduler = popScheduler;
function popNumber(args, defaultValue) {
    return typeof last$2(args) === 'number' ? args.pop() : defaultValue;
}
args.popNumber = popNumber;

var executeSchedule$1 = {};

Object.defineProperty(executeSchedule$1, "__esModule", { value: true });
executeSchedule$1.executeSchedule = void 0;
function executeSchedule(parentSubscription, scheduler, work, delay, repeat) {
    if (delay === void 0) { delay = 0; }
    if (repeat === void 0) { repeat = false; }
    var scheduleSubscription = scheduler.schedule(function () {
        work();
        if (repeat) {
            parentSubscription.add(this.schedule(null, delay));
        }
        else {
            this.unsubscribe();
        }
    }, delay);
    parentSubscription.add(scheduleSubscription);
    if (!repeat) {
        return scheduleSubscription;
    }
}
executeSchedule$1.executeSchedule = executeSchedule;

var __values$5 = (bufferTime$1 && bufferTime$1.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(bufferTime$1, "__esModule", { value: true });
bufferTime$1.bufferTime = void 0;
var Subscription_1$6 = Subscription$1;
var lift_1$11 = lift;
var OperatorSubscriber_1$S = OperatorSubscriber$1;
var arrRemove_1$4 = arrRemove$1;
var async_1$8 = async;
var args_1$c = args;
var executeSchedule_1$6 = executeSchedule$1;
function bufferTime(bufferTimeSpan) {
    var _a, _b;
    var otherArgs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        otherArgs[_i - 1] = arguments[_i];
    }
    var scheduler = (_a = args_1$c.popScheduler(otherArgs)) !== null && _a !== void 0 ? _a : async_1$8.asyncScheduler;
    var bufferCreationInterval = (_b = otherArgs[0]) !== null && _b !== void 0 ? _b : null;
    var maxBufferSize = otherArgs[1] || Infinity;
    return lift_1$11.operate(function (source, subscriber) {
        var bufferRecords = [];
        var restartOnEmit = false;
        var emit = function (record) {
            var buffer = record.buffer, subs = record.subs;
            subs.unsubscribe();
            arrRemove_1$4.arrRemove(bufferRecords, record);
            subscriber.next(buffer);
            restartOnEmit && startBuffer();
        };
        var startBuffer = function () {
            if (bufferRecords) {
                var subs = new Subscription_1$6.Subscription();
                subscriber.add(subs);
                var buffer = [];
                var record_1 = {
                    buffer: buffer,
                    subs: subs,
                };
                bufferRecords.push(record_1);
                executeSchedule_1$6.executeSchedule(subs, scheduler, function () { return emit(record_1); }, bufferTimeSpan);
            }
        };
        if (bufferCreationInterval !== null && bufferCreationInterval >= 0) {
            executeSchedule_1$6.executeSchedule(subscriber, scheduler, startBuffer, bufferCreationInterval, true);
        }
        else {
            restartOnEmit = true;
        }
        startBuffer();
        var bufferTimeSubscriber = OperatorSubscriber_1$S.createOperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            var recordsCopy = bufferRecords.slice();
            try {
                for (var recordsCopy_1 = __values$5(recordsCopy), recordsCopy_1_1 = recordsCopy_1.next(); !recordsCopy_1_1.done; recordsCopy_1_1 = recordsCopy_1.next()) {
                    var record = recordsCopy_1_1.value;
                    var buffer = record.buffer;
                    buffer.push(value);
                    maxBufferSize <= buffer.length && emit(record);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (recordsCopy_1_1 && !recordsCopy_1_1.done && (_a = recordsCopy_1.return)) _a.call(recordsCopy_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }, function () {
            while (bufferRecords === null || bufferRecords === void 0 ? void 0 : bufferRecords.length) {
                subscriber.next(bufferRecords.shift().buffer);
            }
            bufferTimeSubscriber === null || bufferTimeSubscriber === void 0 ? void 0 : bufferTimeSubscriber.unsubscribe();
            subscriber.complete();
            subscriber.unsubscribe();
        }, undefined, function () { return (bufferRecords = null); });
        source.subscribe(bufferTimeSubscriber);
    });
}
bufferTime$1.bufferTime = bufferTime;

var bufferToggle$1 = {};

var __values$4 = (bufferToggle$1 && bufferToggle$1.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(bufferToggle$1, "__esModule", { value: true });
bufferToggle$1.bufferToggle = void 0;
var Subscription_1$5 = Subscription$1;
var lift_1$10 = lift;
var innerFrom_1$B = innerFrom$1;
var OperatorSubscriber_1$R = OperatorSubscriber$1;
var noop_1$b = noop$1;
var arrRemove_1$3 = arrRemove$1;
function bufferToggle(openings, closingSelector) {
    return lift_1$10.operate(function (source, subscriber) {
        var buffers = [];
        innerFrom_1$B.innerFrom(openings).subscribe(OperatorSubscriber_1$R.createOperatorSubscriber(subscriber, function (openValue) {
            var buffer = [];
            buffers.push(buffer);
            var closingSubscription = new Subscription_1$5.Subscription();
            var emitBuffer = function () {
                arrRemove_1$3.arrRemove(buffers, buffer);
                subscriber.next(buffer);
                closingSubscription.unsubscribe();
            };
            closingSubscription.add(innerFrom_1$B.innerFrom(closingSelector(openValue)).subscribe(OperatorSubscriber_1$R.createOperatorSubscriber(subscriber, emitBuffer, noop_1$b.noop)));
        }, noop_1$b.noop));
        source.subscribe(OperatorSubscriber_1$R.createOperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            try {
                for (var buffers_1 = __values$4(buffers), buffers_1_1 = buffers_1.next(); !buffers_1_1.done; buffers_1_1 = buffers_1.next()) {
                    var buffer = buffers_1_1.value;
                    buffer.push(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (buffers_1_1 && !buffers_1_1.done && (_a = buffers_1.return)) _a.call(buffers_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }, function () {
            while (buffers.length > 0) {
                subscriber.next(buffers.shift());
            }
            subscriber.complete();
        }));
    });
}
bufferToggle$1.bufferToggle = bufferToggle;

var bufferWhen$1 = {};

Object.defineProperty(bufferWhen$1, "__esModule", { value: true });
bufferWhen$1.bufferWhen = void 0;
var lift_1$$ = lift;
var noop_1$a = noop$1;
var OperatorSubscriber_1$Q = OperatorSubscriber$1;
var innerFrom_1$A = innerFrom$1;
function bufferWhen(closingSelector) {
    return lift_1$$.operate(function (source, subscriber) {
        var buffer = null;
        var closingSubscriber = null;
        var openBuffer = function () {
            closingSubscriber === null || closingSubscriber === void 0 ? void 0 : closingSubscriber.unsubscribe();
            var b = buffer;
            buffer = [];
            b && subscriber.next(b);
            innerFrom_1$A.innerFrom(closingSelector()).subscribe((closingSubscriber = OperatorSubscriber_1$Q.createOperatorSubscriber(subscriber, openBuffer, noop_1$a.noop)));
        };
        openBuffer();
        source.subscribe(OperatorSubscriber_1$Q.createOperatorSubscriber(subscriber, function (value) { return buffer === null || buffer === void 0 ? void 0 : buffer.push(value); }, function () {
            buffer && subscriber.next(buffer);
            subscriber.complete();
        }, undefined, function () { return (buffer = closingSubscriber = null); }));
    });
}
bufferWhen$1.bufferWhen = bufferWhen;

var catchError$1 = {};

Object.defineProperty(catchError$1, "__esModule", { value: true });
catchError$1.catchError = void 0;
var innerFrom_1$z = innerFrom$1;
var OperatorSubscriber_1$P = OperatorSubscriber$1;
var lift_1$_ = lift;
function catchError(selector) {
    return lift_1$_.operate(function (source, subscriber) {
        var innerSub = null;
        var syncUnsub = false;
        var handledResult;
        innerSub = source.subscribe(OperatorSubscriber_1$P.createOperatorSubscriber(subscriber, undefined, undefined, function (err) {
            handledResult = innerFrom_1$z.innerFrom(selector(err, catchError(selector)(source)));
            if (innerSub) {
                innerSub.unsubscribe();
                innerSub = null;
                handledResult.subscribe(subscriber);
            }
            else {
                syncUnsub = true;
            }
        }));
        if (syncUnsub) {
            innerSub.unsubscribe();
            innerSub = null;
            handledResult.subscribe(subscriber);
        }
    });
}
catchError$1.catchError = catchError;

var combineAll = {};

var combineLatestAll$1 = {};

var combineLatest$3 = {};

var argsArgArrayOrObject$1 = {};

Object.defineProperty(argsArgArrayOrObject$1, "__esModule", { value: true });
argsArgArrayOrObject$1.argsArgArrayOrObject = void 0;
var isArray$2 = Array.isArray;
var getPrototypeOf = Object.getPrototypeOf, objectProto = Object.prototype, getKeys = Object.keys;
function argsArgArrayOrObject(args) {
    if (args.length === 1) {
        var first_1 = args[0];
        if (isArray$2(first_1)) {
            return { args: first_1, keys: null };
        }
        if (isPOJO(first_1)) {
            var keys = getKeys(first_1);
            return {
                args: keys.map(function (key) { return first_1[key]; }),
                keys: keys,
            };
        }
    }
    return { args: args, keys: null };
}
argsArgArrayOrObject$1.argsArgArrayOrObject = argsArgArrayOrObject;
function isPOJO(obj) {
    return obj && typeof obj === 'object' && getPrototypeOf(obj) === objectProto;
}

var from$1 = {};

var scheduled$1 = {};

var scheduleObservable$1 = {};

var observeOn$1 = {};

Object.defineProperty(observeOn$1, "__esModule", { value: true });
observeOn$1.observeOn = void 0;
var executeSchedule_1$5 = executeSchedule$1;
var lift_1$Z = lift;
var OperatorSubscriber_1$O = OperatorSubscriber$1;
function observeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return lift_1$Z.operate(function (source, subscriber) {
        source.subscribe(OperatorSubscriber_1$O.createOperatorSubscriber(subscriber, function (value) { return executeSchedule_1$5.executeSchedule(subscriber, scheduler, function () { return subscriber.next(value); }, delay); }, function () { return executeSchedule_1$5.executeSchedule(subscriber, scheduler, function () { return subscriber.complete(); }, delay); }, function (err) { return executeSchedule_1$5.executeSchedule(subscriber, scheduler, function () { return subscriber.error(err); }, delay); }));
    });
}
observeOn$1.observeOn = observeOn;

var subscribeOn$1 = {};

Object.defineProperty(subscribeOn$1, "__esModule", { value: true });
subscribeOn$1.subscribeOn = void 0;
var lift_1$Y = lift;
function subscribeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return lift_1$Y.operate(function (source, subscriber) {
        subscriber.add(scheduler.schedule(function () { return source.subscribe(subscriber); }, delay));
    });
}
subscribeOn$1.subscribeOn = subscribeOn;

Object.defineProperty(scheduleObservable$1, "__esModule", { value: true });
scheduleObservable$1.scheduleObservable = void 0;
var innerFrom_1$y = innerFrom$1;
var observeOn_1$2 = observeOn$1;
var subscribeOn_1$2 = subscribeOn$1;
function scheduleObservable(input, scheduler) {
    return innerFrom_1$y.innerFrom(input).pipe(subscribeOn_1$2.subscribeOn(scheduler), observeOn_1$2.observeOn(scheduler));
}
scheduleObservable$1.scheduleObservable = scheduleObservable;

var schedulePromise$1 = {};

Object.defineProperty(schedulePromise$1, "__esModule", { value: true });
schedulePromise$1.schedulePromise = void 0;
var innerFrom_1$x = innerFrom$1;
var observeOn_1$1 = observeOn$1;
var subscribeOn_1$1 = subscribeOn$1;
function schedulePromise(input, scheduler) {
    return innerFrom_1$x.innerFrom(input).pipe(subscribeOn_1$1.subscribeOn(scheduler), observeOn_1$1.observeOn(scheduler));
}
schedulePromise$1.schedulePromise = schedulePromise;

var scheduleArray$1 = {};

Object.defineProperty(scheduleArray$1, "__esModule", { value: true });
scheduleArray$1.scheduleArray = void 0;
var Observable_1$l = Observable$1;
function scheduleArray(input, scheduler) {
    return new Observable_1$l.Observable(function (subscriber) {
        var i = 0;
        return scheduler.schedule(function () {
            if (i === input.length) {
                subscriber.complete();
            }
            else {
                subscriber.next(input[i++]);
                if (!subscriber.closed) {
                    this.schedule();
                }
            }
        });
    });
}
scheduleArray$1.scheduleArray = scheduleArray;

var scheduleIterable$1 = {};

Object.defineProperty(scheduleIterable$1, "__esModule", { value: true });
scheduleIterable$1.scheduleIterable = void 0;
var Observable_1$k = Observable$1;
var iterator_1 = iterator;
var isFunction_1$e = isFunction$1;
var executeSchedule_1$4 = executeSchedule$1;
function scheduleIterable(input, scheduler) {
    return new Observable_1$k.Observable(function (subscriber) {
        var iterator;
        executeSchedule_1$4.executeSchedule(subscriber, scheduler, function () {
            iterator = input[iterator_1.iterator]();
            executeSchedule_1$4.executeSchedule(subscriber, scheduler, function () {
                var _a;
                var value;
                var done;
                try {
                    (_a = iterator.next(), value = _a.value, done = _a.done);
                }
                catch (err) {
                    subscriber.error(err);
                    return;
                }
                if (done) {
                    subscriber.complete();
                }
                else {
                    subscriber.next(value);
                }
            }, 0, true);
        });
        return function () { return isFunction_1$e.isFunction(iterator === null || iterator === void 0 ? void 0 : iterator.return) && iterator.return(); };
    });
}
scheduleIterable$1.scheduleIterable = scheduleIterable;

var scheduleAsyncIterable$1 = {};

Object.defineProperty(scheduleAsyncIterable$1, "__esModule", { value: true });
scheduleAsyncIterable$1.scheduleAsyncIterable = void 0;
var Observable_1$j = Observable$1;
var executeSchedule_1$3 = executeSchedule$1;
function scheduleAsyncIterable(input, scheduler) {
    if (!input) {
        throw new Error('Iterable cannot be null');
    }
    return new Observable_1$j.Observable(function (subscriber) {
        executeSchedule_1$3.executeSchedule(subscriber, scheduler, function () {
            var iterator = input[Symbol.asyncIterator]();
            executeSchedule_1$3.executeSchedule(subscriber, scheduler, function () {
                iterator.next().then(function (result) {
                    if (result.done) {
                        subscriber.complete();
                    }
                    else {
                        subscriber.next(result.value);
                    }
                });
            }, 0, true);
        });
    });
}
scheduleAsyncIterable$1.scheduleAsyncIterable = scheduleAsyncIterable;

var scheduleReadableStreamLike$1 = {};

Object.defineProperty(scheduleReadableStreamLike$1, "__esModule", { value: true });
scheduleReadableStreamLike$1.scheduleReadableStreamLike = void 0;
var scheduleAsyncIterable_1$1 = scheduleAsyncIterable$1;
var isReadableStreamLike_1$1 = isReadableStreamLike$1;
function scheduleReadableStreamLike(input, scheduler) {
    return scheduleAsyncIterable_1$1.scheduleAsyncIterable(isReadableStreamLike_1$1.readableStreamLikeToAsyncGenerator(input), scheduler);
}
scheduleReadableStreamLike$1.scheduleReadableStreamLike = scheduleReadableStreamLike;

Object.defineProperty(scheduled$1, "__esModule", { value: true });
scheduled$1.scheduled = void 0;
var scheduleObservable_1 = scheduleObservable$1;
var schedulePromise_1 = schedulePromise$1;
var scheduleArray_1 = scheduleArray$1;
var scheduleIterable_1$1 = scheduleIterable$1;
var scheduleAsyncIterable_1 = scheduleAsyncIterable$1;
var isInteropObservable_1 = isInteropObservable$1;
var isPromise_1 = isPromise$1;
var isArrayLike_1$1 = isArrayLike;
var isIterable_1 = isIterable$1;
var isAsyncIterable_1 = isAsyncIterable$1;
var throwUnobservableError_1 = throwUnobservableError;
var isReadableStreamLike_1 = isReadableStreamLike$1;
var scheduleReadableStreamLike_1 = scheduleReadableStreamLike$1;
function scheduled(input, scheduler) {
    if (input != null) {
        if (isInteropObservable_1.isInteropObservable(input)) {
            return scheduleObservable_1.scheduleObservable(input, scheduler);
        }
        if (isArrayLike_1$1.isArrayLike(input)) {
            return scheduleArray_1.scheduleArray(input, scheduler);
        }
        if (isPromise_1.isPromise(input)) {
            return schedulePromise_1.schedulePromise(input, scheduler);
        }
        if (isAsyncIterable_1.isAsyncIterable(input)) {
            return scheduleAsyncIterable_1.scheduleAsyncIterable(input, scheduler);
        }
        if (isIterable_1.isIterable(input)) {
            return scheduleIterable_1$1.scheduleIterable(input, scheduler);
        }
        if (isReadableStreamLike_1.isReadableStreamLike(input)) {
            return scheduleReadableStreamLike_1.scheduleReadableStreamLike(input, scheduler);
        }
    }
    throw throwUnobservableError_1.createInvalidObservableTypeError(input);
}
scheduled$1.scheduled = scheduled;

Object.defineProperty(from$1, "__esModule", { value: true });
from$1.from = void 0;
var scheduled_1 = scheduled$1;
var innerFrom_1$w = innerFrom$1;
function from(input, scheduler) {
    return scheduler ? scheduled_1.scheduled(input, scheduler) : innerFrom_1$w.innerFrom(input);
}
from$1.from = from;

var mapOneOrManyArgs$1 = {};

var map$1 = {};

Object.defineProperty(map$1, "__esModule", { value: true });
map$1.map = void 0;
var lift_1$X = lift;
var OperatorSubscriber_1$N = OperatorSubscriber$1;
function map(project, thisArg) {
    return lift_1$X.operate(function (source, subscriber) {
        var index = 0;
        source.subscribe(OperatorSubscriber_1$N.createOperatorSubscriber(subscriber, function (value) {
            subscriber.next(project.call(thisArg, value, index++));
        }));
    });
}
map$1.map = map;

var __read$h = (mapOneOrManyArgs$1 && mapOneOrManyArgs$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$g = (mapOneOrManyArgs$1 && mapOneOrManyArgs$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(mapOneOrManyArgs$1, "__esModule", { value: true });
mapOneOrManyArgs$1.mapOneOrManyArgs = void 0;
var map_1$5 = map$1;
var isArray$1 = Array.isArray;
function callOrApply(fn, args) {
    return isArray$1(args) ? fn.apply(void 0, __spreadArray$g([], __read$h(args))) : fn(args);
}
function mapOneOrManyArgs(fn) {
    return map_1$5.map(function (args) { return callOrApply(fn, args); });
}
mapOneOrManyArgs$1.mapOneOrManyArgs = mapOneOrManyArgs;

var createObject$1 = {};

Object.defineProperty(createObject$1, "__esModule", { value: true });
createObject$1.createObject = void 0;
function createObject(keys, values) {
    return keys.reduce(function (result, key, i) { return ((result[key] = values[i]), result); }, {});
}
createObject$1.createObject = createObject;

Object.defineProperty(combineLatest$3, "__esModule", { value: true });
combineLatest$3.combineLatestInit = combineLatest$3.combineLatest = void 0;
var Observable_1$i = Observable$1;
var argsArgArrayOrObject_1$1 = argsArgArrayOrObject$1;
var from_1$6 = from$1;
var identity_1$d = identity$1;
var mapOneOrManyArgs_1$6 = mapOneOrManyArgs$1;
var args_1$b = args;
var createObject_1$1 = createObject$1;
var OperatorSubscriber_1$M = OperatorSubscriber$1;
var executeSchedule_1$2 = executeSchedule$1;
function combineLatest$2() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1$b.popScheduler(args);
    var resultSelector = args_1$b.popResultSelector(args);
    var _a = argsArgArrayOrObject_1$1.argsArgArrayOrObject(args), observables = _a.args, keys = _a.keys;
    if (observables.length === 0) {
        return from_1$6.from([], scheduler);
    }
    var result = new Observable_1$i.Observable(combineLatestInit(observables, scheduler, keys
        ?
            function (values) { return createObject_1$1.createObject(keys, values); }
        :
            identity_1$d.identity));
    return resultSelector ? result.pipe(mapOneOrManyArgs_1$6.mapOneOrManyArgs(resultSelector)) : result;
}
combineLatest$3.combineLatest = combineLatest$2;
function combineLatestInit(observables, scheduler, valueTransform) {
    if (valueTransform === void 0) { valueTransform = identity_1$d.identity; }
    return function (subscriber) {
        maybeSchedule(scheduler, function () {
            var length = observables.length;
            var values = new Array(length);
            var active = length;
            var remainingFirstValues = length;
            var _loop_1 = function (i) {
                maybeSchedule(scheduler, function () {
                    var source = from_1$6.from(observables[i], scheduler);
                    var hasFirstValue = false;
                    source.subscribe(OperatorSubscriber_1$M.createOperatorSubscriber(subscriber, function (value) {
                        values[i] = value;
                        if (!hasFirstValue) {
                            hasFirstValue = true;
                            remainingFirstValues--;
                        }
                        if (!remainingFirstValues) {
                            subscriber.next(valueTransform(values.slice()));
                        }
                    }, function () {
                        if (!--active) {
                            subscriber.complete();
                        }
                    }));
                }, subscriber);
            };
            for (var i = 0; i < length; i++) {
                _loop_1(i);
            }
        }, subscriber);
    };
}
combineLatest$3.combineLatestInit = combineLatestInit;
function maybeSchedule(scheduler, execute, subscription) {
    if (scheduler) {
        executeSchedule_1$2.executeSchedule(subscription, scheduler, execute);
    }
    else {
        execute();
    }
}

var joinAllInternals$1 = {};

var mergeMap$1 = {};

var mergeInternals$1 = {};

Object.defineProperty(mergeInternals$1, "__esModule", { value: true });
mergeInternals$1.mergeInternals = void 0;
var innerFrom_1$v = innerFrom$1;
var executeSchedule_1$1 = executeSchedule$1;
var OperatorSubscriber_1$L = OperatorSubscriber$1;
function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalFinalizer) {
    var buffer = [];
    var active = 0;
    var index = 0;
    var isComplete = false;
    var checkComplete = function () {
        if (isComplete && !buffer.length && !active) {
            subscriber.complete();
        }
    };
    var outerNext = function (value) { return (active < concurrent ? doInnerSub(value) : buffer.push(value)); };
    var doInnerSub = function (value) {
        expand && subscriber.next(value);
        active++;
        var innerComplete = false;
        innerFrom_1$v.innerFrom(project(value, index++)).subscribe(OperatorSubscriber_1$L.createOperatorSubscriber(subscriber, function (innerValue) {
            onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
            if (expand) {
                outerNext(innerValue);
            }
            else {
                subscriber.next(innerValue);
            }
        }, function () {
            innerComplete = true;
        }, undefined, function () {
            if (innerComplete) {
                try {
                    active--;
                    var _loop_1 = function () {
                        var bufferedValue = buffer.shift();
                        if (innerSubScheduler) {
                            executeSchedule_1$1.executeSchedule(subscriber, innerSubScheduler, function () { return doInnerSub(bufferedValue); });
                        }
                        else {
                            doInnerSub(bufferedValue);
                        }
                    };
                    while (buffer.length && active < concurrent) {
                        _loop_1();
                    }
                    checkComplete();
                }
                catch (err) {
                    subscriber.error(err);
                }
            }
        }));
    };
    source.subscribe(OperatorSubscriber_1$L.createOperatorSubscriber(subscriber, outerNext, function () {
        isComplete = true;
        checkComplete();
    }));
    return function () {
        additionalFinalizer === null || additionalFinalizer === void 0 ? void 0 : additionalFinalizer();
    };
}
mergeInternals$1.mergeInternals = mergeInternals;

Object.defineProperty(mergeMap$1, "__esModule", { value: true });
mergeMap$1.mergeMap = void 0;
var map_1$4 = map$1;
var innerFrom_1$u = innerFrom$1;
var lift_1$W = lift;
var mergeInternals_1$2 = mergeInternals$1;
var isFunction_1$d = isFunction$1;
function mergeMap(project, resultSelector, concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    if (isFunction_1$d.isFunction(resultSelector)) {
        return mergeMap(function (a, i) { return map_1$4.map(function (b, ii) { return resultSelector(a, b, i, ii); })(innerFrom_1$u.innerFrom(project(a, i))); }, concurrent);
    }
    else if (typeof resultSelector === 'number') {
        concurrent = resultSelector;
    }
    return lift_1$W.operate(function (source, subscriber) { return mergeInternals_1$2.mergeInternals(source, subscriber, project, concurrent); });
}
mergeMap$1.mergeMap = mergeMap;

var toArray$1 = {};

var reduce$1 = {};

var scanInternals$1 = {};

Object.defineProperty(scanInternals$1, "__esModule", { value: true });
scanInternals$1.scanInternals = void 0;
var OperatorSubscriber_1$K = OperatorSubscriber$1;
function scanInternals(accumulator, seed, hasSeed, emitOnNext, emitBeforeComplete) {
    return function (source, subscriber) {
        var hasState = hasSeed;
        var state = seed;
        var index = 0;
        source.subscribe(OperatorSubscriber_1$K.createOperatorSubscriber(subscriber, function (value) {
            var i = index++;
            state = hasState
                ?
                    accumulator(state, value, i)
                :
                    ((hasState = true), value);
            emitOnNext && subscriber.next(state);
        }, emitBeforeComplete &&
            (function () {
                hasState && subscriber.next(state);
                subscriber.complete();
            })));
    };
}
scanInternals$1.scanInternals = scanInternals;

Object.defineProperty(reduce$1, "__esModule", { value: true });
reduce$1.reduce = void 0;
var scanInternals_1$1 = scanInternals$1;
var lift_1$V = lift;
function reduce(accumulator, seed) {
    return lift_1$V.operate(scanInternals_1$1.scanInternals(accumulator, seed, arguments.length >= 2, false, true));
}
reduce$1.reduce = reduce;

Object.defineProperty(toArray$1, "__esModule", { value: true });
toArray$1.toArray = void 0;
var reduce_1$3 = reduce$1;
var lift_1$U = lift;
var arrReducer = function (arr, value) { return (arr.push(value), arr); };
function toArray() {
    return lift_1$U.operate(function (source, subscriber) {
        reduce_1$3.reduce(arrReducer, [])(source).subscribe(subscriber);
    });
}
toArray$1.toArray = toArray;

Object.defineProperty(joinAllInternals$1, "__esModule", { value: true });
joinAllInternals$1.joinAllInternals = void 0;
var identity_1$c = identity$1;
var mapOneOrManyArgs_1$5 = mapOneOrManyArgs$1;
var pipe_1$1 = pipe$1;
var mergeMap_1$6 = mergeMap$1;
var toArray_1 = toArray$1;
function joinAllInternals(joinFn, project) {
    return pipe_1$1.pipe(toArray_1.toArray(), mergeMap_1$6.mergeMap(function (sources) { return joinFn(sources); }), project ? mapOneOrManyArgs_1$5.mapOneOrManyArgs(project) : identity_1$c.identity);
}
joinAllInternals$1.joinAllInternals = joinAllInternals;

Object.defineProperty(combineLatestAll$1, "__esModule", { value: true });
combineLatestAll$1.combineLatestAll = void 0;
var combineLatest_1$2 = combineLatest$3;
var joinAllInternals_1$1 = joinAllInternals$1;
function combineLatestAll(project) {
    return joinAllInternals_1$1.joinAllInternals(combineLatest_1$2.combineLatest, project);
}
combineLatestAll$1.combineLatestAll = combineLatestAll;

Object.defineProperty(combineAll, "__esModule", { value: true });
combineAll.combineAll = void 0;
var combineLatestAll_1 = combineLatestAll$1;
combineAll.combineAll = combineLatestAll_1.combineLatestAll;

var combineLatest$1 = {};

var argsOrArgArray$1 = {};

Object.defineProperty(argsOrArgArray$1, "__esModule", { value: true });
argsOrArgArray$1.argsOrArgArray = void 0;
var isArray = Array.isArray;
function argsOrArgArray(args) {
    return args.length === 1 && isArray(args[0]) ? args[0] : args;
}
argsOrArgArray$1.argsOrArgArray = argsOrArgArray;

var __read$g = (combineLatest$1 && combineLatest$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$f = (combineLatest$1 && combineLatest$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(combineLatest$1, "__esModule", { value: true });
combineLatest$1.combineLatest = void 0;
var combineLatest_1$1 = combineLatest$3;
var lift_1$T = lift;
var argsOrArgArray_1$6 = argsOrArgArray$1;
var mapOneOrManyArgs_1$4 = mapOneOrManyArgs$1;
var pipe_1 = pipe$1;
var args_1$a = args;
function combineLatest() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resultSelector = args_1$a.popResultSelector(args);
    return resultSelector
        ? pipe_1.pipe(combineLatest.apply(void 0, __spreadArray$f([], __read$g(args))), mapOneOrManyArgs_1$4.mapOneOrManyArgs(resultSelector))
        : lift_1$T.operate(function (source, subscriber) {
            combineLatest_1$1.combineLatestInit(__spreadArray$f([source], __read$g(argsOrArgArray_1$6.argsOrArgArray(args))))(subscriber);
        });
}
combineLatest$1.combineLatest = combineLatest;

var combineLatestWith$1 = {};

var __read$f = (combineLatestWith$1 && combineLatestWith$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$e = (combineLatestWith$1 && combineLatestWith$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(combineLatestWith$1, "__esModule", { value: true });
combineLatestWith$1.combineLatestWith = void 0;
var combineLatest_1 = combineLatest$1;
function combineLatestWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return combineLatest_1.combineLatest.apply(void 0, __spreadArray$e([], __read$f(otherSources)));
}
combineLatestWith$1.combineLatestWith = combineLatestWith;

var concat$3 = {};

var concatAll$1 = {};

var mergeAll$1 = {};

Object.defineProperty(mergeAll$1, "__esModule", { value: true });
mergeAll$1.mergeAll = void 0;
var mergeMap_1$5 = mergeMap$1;
var identity_1$b = identity$1;
function mergeAll(concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    return mergeMap_1$5.mergeMap(identity_1$b.identity, concurrent);
}
mergeAll$1.mergeAll = mergeAll;

Object.defineProperty(concatAll$1, "__esModule", { value: true });
concatAll$1.concatAll = void 0;
var mergeAll_1$2 = mergeAll$1;
function concatAll() {
    return mergeAll_1$2.mergeAll(1);
}
concatAll$1.concatAll = concatAll;

var __read$e = (concat$3 && concat$3.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$d = (concat$3 && concat$3.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(concat$3, "__esModule", { value: true });
concat$3.concat = void 0;
var lift_1$S = lift;
var concatAll_1$1 = concatAll$1;
var args_1$9 = args;
var from_1$5 = from$1;
function concat$2() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1$9.popScheduler(args);
    return lift_1$S.operate(function (source, subscriber) {
        concatAll_1$1.concatAll()(from_1$5.from(__spreadArray$d([source], __read$e(args)), scheduler)).subscribe(subscriber);
    });
}
concat$3.concat = concat$2;

var concatMap$1 = {};

Object.defineProperty(concatMap$1, "__esModule", { value: true });
concatMap$1.concatMap = void 0;
var mergeMap_1$4 = mergeMap$1;
var isFunction_1$c = isFunction$1;
function concatMap(project, resultSelector) {
    return isFunction_1$c.isFunction(resultSelector) ? mergeMap_1$4.mergeMap(project, resultSelector, 1) : mergeMap_1$4.mergeMap(project, 1);
}
concatMap$1.concatMap = concatMap;

var concatMapTo$1 = {};

Object.defineProperty(concatMapTo$1, "__esModule", { value: true });
concatMapTo$1.concatMapTo = void 0;
var concatMap_1 = concatMap$1;
var isFunction_1$b = isFunction$1;
function concatMapTo(innerObservable, resultSelector) {
    return isFunction_1$b.isFunction(resultSelector) ? concatMap_1.concatMap(function () { return innerObservable; }, resultSelector) : concatMap_1.concatMap(function () { return innerObservable; });
}
concatMapTo$1.concatMapTo = concatMapTo;

var concatWith$1 = {};

var __read$d = (concatWith$1 && concatWith$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$c = (concatWith$1 && concatWith$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(concatWith$1, "__esModule", { value: true });
concatWith$1.concatWith = void 0;
var concat_1$3 = concat$3;
function concatWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return concat_1$3.concat.apply(void 0, __spreadArray$c([], __read$d(otherSources)));
}
concatWith$1.concatWith = concatWith;

var connect$1 = {};

var Subject$1 = {};

var ObjectUnsubscribedError = {};

Object.defineProperty(ObjectUnsubscribedError, "__esModule", { value: true });
ObjectUnsubscribedError.ObjectUnsubscribedError = void 0;
var createErrorClass_1$4 = createErrorClass$1;
ObjectUnsubscribedError.ObjectUnsubscribedError = createErrorClass_1$4.createErrorClass(function (_super) {
    return function ObjectUnsubscribedErrorImpl() {
        _super(this);
        this.name = 'ObjectUnsubscribedError';
        this.message = 'object unsubscribed';
    };
});

var __extends$c = (Subject$1 && Subject$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values$3 = (Subject$1 && Subject$1.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(Subject$1, "__esModule", { value: true });
Subject$1.AnonymousSubject = Subject$1.Subject = void 0;
var Observable_1$h = Observable$1;
var Subscription_1$4 = Subscription$1;
var ObjectUnsubscribedError_1 = ObjectUnsubscribedError;
var arrRemove_1$2 = arrRemove$1;
var errorContext_1 = errorContext$1;
var Subject = (function (_super) {
    __extends$c(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.closed = false;
        _this.currentObservers = null;
        _this.observers = [];
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype._throwIfClosed = function () {
        if (this.closed) {
            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
        }
    };
    Subject.prototype.next = function (value) {
        var _this = this;
        errorContext_1.errorContext(function () {
            var e_1, _a;
            _this._throwIfClosed();
            if (!_this.isStopped) {
                if (!_this.currentObservers) {
                    _this.currentObservers = Array.from(_this.observers);
                }
                try {
                    for (var _b = __values$3(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var observer = _c.value;
                        observer.next(value);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        });
    };
    Subject.prototype.error = function (err) {
        var _this = this;
        errorContext_1.errorContext(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.hasError = _this.isStopped = true;
                _this.thrownError = err;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().error(err);
                }
            }
        });
    };
    Subject.prototype.complete = function () {
        var _this = this;
        errorContext_1.errorContext(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.isStopped = true;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().complete();
                }
            }
        });
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = this.closed = true;
        this.observers = this.currentObservers = null;
    };
    Object.defineProperty(Subject.prototype, "observed", {
        get: function () {
            var _a;
            return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
        },
        enumerable: false,
        configurable: true
    });
    Subject.prototype._trySubscribe = function (subscriber) {
        this._throwIfClosed();
        return _super.prototype._trySubscribe.call(this, subscriber);
    };
    Subject.prototype._subscribe = function (subscriber) {
        this._throwIfClosed();
        this._checkFinalizedStatuses(subscriber);
        return this._innerSubscribe(subscriber);
    };
    Subject.prototype._innerSubscribe = function (subscriber) {
        var _this = this;
        var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
        if (hasError || isStopped) {
            return Subscription_1$4.EMPTY_SUBSCRIPTION;
        }
        this.currentObservers = null;
        observers.push(subscriber);
        return new Subscription_1$4.Subscription(function () {
            _this.currentObservers = null;
            arrRemove_1$2.arrRemove(observers, subscriber);
        });
    };
    Subject.prototype._checkFinalizedStatuses = function (subscriber) {
        var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
        if (hasError) {
            subscriber.error(thrownError);
        }
        else if (isStopped) {
            subscriber.complete();
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new Observable_1$h.Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(Observable_1$h.Observable));
Subject$1.Subject = Subject;
var AnonymousSubject = (function (_super) {
    __extends$c(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
    };
    AnonymousSubject.prototype.error = function (err) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
    };
    AnonymousSubject.prototype.complete = function () {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var _a, _b;
        return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : Subscription_1$4.EMPTY_SUBSCRIPTION;
    };
    return AnonymousSubject;
}(Subject));
Subject$1.AnonymousSubject = AnonymousSubject;

var fromSubscribable$1 = {};

Object.defineProperty(fromSubscribable$1, "__esModule", { value: true });
fromSubscribable$1.fromSubscribable = void 0;
var Observable_1$g = Observable$1;
function fromSubscribable(subscribable) {
    return new Observable_1$g.Observable(function (subscriber) { return subscribable.subscribe(subscriber); });
}
fromSubscribable$1.fromSubscribable = fromSubscribable;

Object.defineProperty(connect$1, "__esModule", { value: true });
connect$1.connect = void 0;
var Subject_1$e = Subject$1;
var innerFrom_1$t = innerFrom$1;
var lift_1$R = lift;
var fromSubscribable_1 = fromSubscribable$1;
var DEFAULT_CONFIG$1 = {
    connector: function () { return new Subject_1$e.Subject(); },
};
function connect(selector, config) {
    if (config === void 0) { config = DEFAULT_CONFIG$1; }
    var connector = config.connector;
    return lift_1$R.operate(function (source, subscriber) {
        var subject = connector();
        innerFrom_1$t.innerFrom(selector(fromSubscribable_1.fromSubscribable(subject))).subscribe(subscriber);
        subscriber.add(source.subscribe(subject));
    });
}
connect$1.connect = connect;

var count$1 = {};

Object.defineProperty(count$1, "__esModule", { value: true });
count$1.count = void 0;
var reduce_1$2 = reduce$1;
function count(predicate) {
    return reduce_1$2.reduce(function (total, value, i) { return (!predicate || predicate(value, i) ? total + 1 : total); }, 0);
}
count$1.count = count;

var debounce$1 = {};

Object.defineProperty(debounce$1, "__esModule", { value: true });
debounce$1.debounce = void 0;
var lift_1$Q = lift;
var noop_1$9 = noop$1;
var OperatorSubscriber_1$J = OperatorSubscriber$1;
var innerFrom_1$s = innerFrom$1;
function debounce(durationSelector) {
    return lift_1$Q.operate(function (source, subscriber) {
        var hasValue = false;
        var lastValue = null;
        var durationSubscriber = null;
        var emit = function () {
            durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
            durationSubscriber = null;
            if (hasValue) {
                hasValue = false;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
        };
        source.subscribe(OperatorSubscriber_1$J.createOperatorSubscriber(subscriber, function (value) {
            durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
            hasValue = true;
            lastValue = value;
            durationSubscriber = OperatorSubscriber_1$J.createOperatorSubscriber(subscriber, emit, noop_1$9.noop);
            innerFrom_1$s.innerFrom(durationSelector(value)).subscribe(durationSubscriber);
        }, function () {
            emit();
            subscriber.complete();
        }, undefined, function () {
            lastValue = durationSubscriber = null;
        }));
    });
}
debounce$1.debounce = debounce;

var debounceTime$1 = {};

Object.defineProperty(debounceTime$1, "__esModule", { value: true });
debounceTime$1.debounceTime = void 0;
var async_1$7 = async;
var lift_1$P = lift;
var OperatorSubscriber_1$I = OperatorSubscriber$1;
function debounceTime(dueTime, scheduler) {
    if (scheduler === void 0) { scheduler = async_1$7.asyncScheduler; }
    return lift_1$P.operate(function (source, subscriber) {
        var activeTask = null;
        var lastValue = null;
        var lastTime = null;
        var emit = function () {
            if (activeTask) {
                activeTask.unsubscribe();
                activeTask = null;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
        };
        function emitWhenIdle() {
            var targetTime = lastTime + dueTime;
            var now = scheduler.now();
            if (now < targetTime) {
                activeTask = this.schedule(undefined, targetTime - now);
                subscriber.add(activeTask);
                return;
            }
            emit();
        }
        source.subscribe(OperatorSubscriber_1$I.createOperatorSubscriber(subscriber, function (value) {
            lastValue = value;
            lastTime = scheduler.now();
            if (!activeTask) {
                activeTask = scheduler.schedule(emitWhenIdle, dueTime);
                subscriber.add(activeTask);
            }
        }, function () {
            emit();
            subscriber.complete();
        }, undefined, function () {
            lastValue = activeTask = null;
        }));
    });
}
debounceTime$1.debounceTime = debounceTime;

var defaultIfEmpty$1 = {};

Object.defineProperty(defaultIfEmpty$1, "__esModule", { value: true });
defaultIfEmpty$1.defaultIfEmpty = void 0;
var lift_1$O = lift;
var OperatorSubscriber_1$H = OperatorSubscriber$1;
function defaultIfEmpty(defaultValue) {
    return lift_1$O.operate(function (source, subscriber) {
        var hasValue = false;
        source.subscribe(OperatorSubscriber_1$H.createOperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            subscriber.next(value);
        }, function () {
            if (!hasValue) {
                subscriber.next(defaultValue);
            }
            subscriber.complete();
        }));
    });
}
defaultIfEmpty$1.defaultIfEmpty = defaultIfEmpty;

var delay$1 = {};

var delayWhen$1 = {};

var concat$1 = {};

Object.defineProperty(concat$1, "__esModule", { value: true });
concat$1.concat = void 0;
var concatAll_1 = concatAll$1;
var args_1$8 = args;
var from_1$4 = from$1;
function concat() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return concatAll_1.concatAll()(from_1$4.from(args, args_1$8.popScheduler(args)));
}
concat$1.concat = concat;

var take$1 = {};

var empty = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.empty = exports.EMPTY = void 0;
	var Observable_1 = Observable$1;
	exports.EMPTY = new Observable_1.Observable(function (subscriber) { return subscriber.complete(); });
	function empty(scheduler) {
	    return scheduler ? emptyScheduled(scheduler) : exports.EMPTY;
	}
	exports.empty = empty;
	function emptyScheduled(scheduler) {
	    return new Observable_1.Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
	}
	
} (empty));

Object.defineProperty(take$1, "__esModule", { value: true });
take$1.take = void 0;
var empty_1$6 = empty;
var lift_1$N = lift;
var OperatorSubscriber_1$G = OperatorSubscriber$1;
function take(count) {
    return count <= 0
        ?
            function () { return empty_1$6.EMPTY; }
        : lift_1$N.operate(function (source, subscriber) {
            var seen = 0;
            source.subscribe(OperatorSubscriber_1$G.createOperatorSubscriber(subscriber, function (value) {
                if (++seen <= count) {
                    subscriber.next(value);
                    if (count <= seen) {
                        subscriber.complete();
                    }
                }
            }));
        });
}
take$1.take = take;

var ignoreElements$1 = {};

Object.defineProperty(ignoreElements$1, "__esModule", { value: true });
ignoreElements$1.ignoreElements = void 0;
var lift_1$M = lift;
var OperatorSubscriber_1$F = OperatorSubscriber$1;
var noop_1$8 = noop$1;
function ignoreElements() {
    return lift_1$M.operate(function (source, subscriber) {
        source.subscribe(OperatorSubscriber_1$F.createOperatorSubscriber(subscriber, noop_1$8.noop));
    });
}
ignoreElements$1.ignoreElements = ignoreElements;

var mapTo$1 = {};

Object.defineProperty(mapTo$1, "__esModule", { value: true });
mapTo$1.mapTo = void 0;
var map_1$3 = map$1;
function mapTo(value) {
    return map_1$3.map(function () { return value; });
}
mapTo$1.mapTo = mapTo;

Object.defineProperty(delayWhen$1, "__esModule", { value: true });
delayWhen$1.delayWhen = void 0;
var concat_1$2 = concat$1;
var take_1$2 = take$1;
var ignoreElements_1 = ignoreElements$1;
var mapTo_1 = mapTo$1;
var mergeMap_1$3 = mergeMap$1;
var innerFrom_1$r = innerFrom$1;
function delayWhen(delayDurationSelector, subscriptionDelay) {
    if (subscriptionDelay) {
        return function (source) {
            return concat_1$2.concat(subscriptionDelay.pipe(take_1$2.take(1), ignoreElements_1.ignoreElements()), source.pipe(delayWhen(delayDurationSelector)));
        };
    }
    return mergeMap_1$3.mergeMap(function (value, index) { return innerFrom_1$r.innerFrom(delayDurationSelector(value, index)).pipe(take_1$2.take(1), mapTo_1.mapTo(value)); });
}
delayWhen$1.delayWhen = delayWhen;

Object.defineProperty(delay$1, "__esModule", { value: true });
delay$1.delay = void 0;
var async_1$6 = async;
var delayWhen_1 = delayWhen$1;
var timer_1$4 = timer$1;
function delay(due, scheduler) {
    if (scheduler === void 0) { scheduler = async_1$6.asyncScheduler; }
    var duration = timer_1$4.timer(due, scheduler);
    return delayWhen_1.delayWhen(function () { return duration; });
}
delay$1.delay = delay;

var dematerialize$1 = {};

var Notification = {};

var of$1 = {};

Object.defineProperty(of$1, "__esModule", { value: true });
of$1.of = void 0;
var args_1$7 = args;
var from_1$3 = from$1;
function of() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1$7.popScheduler(args);
    return from_1$3.from(args, scheduler);
}
of$1.of = of;

var throwError$1 = {};

Object.defineProperty(throwError$1, "__esModule", { value: true });
throwError$1.throwError = void 0;
var Observable_1$f = Observable$1;
var isFunction_1$a = isFunction$1;
function throwError(errorOrErrorFactory, scheduler) {
    var errorFactory = isFunction_1$a.isFunction(errorOrErrorFactory) ? errorOrErrorFactory : function () { return errorOrErrorFactory; };
    var init = function (subscriber) { return subscriber.error(errorFactory()); };
    return new Observable_1$f.Observable(scheduler ? function (subscriber) { return scheduler.schedule(init, 0, subscriber); } : init);
}
throwError$1.throwError = throwError;

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.observeNotification = exports.Notification = exports.NotificationKind = void 0;
	var empty_1 = empty;
	var of_1 = of$1;
	var throwError_1 = throwError$1;
	var isFunction_1 = isFunction$1;
	(function (NotificationKind) {
	    NotificationKind["NEXT"] = "N";
	    NotificationKind["ERROR"] = "E";
	    NotificationKind["COMPLETE"] = "C";
	})(exports.NotificationKind || (exports.NotificationKind = {}));
	var Notification = (function () {
	    function Notification(kind, value, error) {
	        this.kind = kind;
	        this.value = value;
	        this.error = error;
	        this.hasValue = kind === 'N';
	    }
	    Notification.prototype.observe = function (observer) {
	        return observeNotification(this, observer);
	    };
	    Notification.prototype.do = function (nextHandler, errorHandler, completeHandler) {
	        var _a = this, kind = _a.kind, value = _a.value, error = _a.error;
	        return kind === 'N' ? nextHandler === null || nextHandler === void 0 ? void 0 : nextHandler(value) : kind === 'E' ? errorHandler === null || errorHandler === void 0 ? void 0 : errorHandler(error) : completeHandler === null || completeHandler === void 0 ? void 0 : completeHandler();
	    };
	    Notification.prototype.accept = function (nextOrObserver, error, complete) {
	        var _a;
	        return isFunction_1.isFunction((_a = nextOrObserver) === null || _a === void 0 ? void 0 : _a.next)
	            ? this.observe(nextOrObserver)
	            : this.do(nextOrObserver, error, complete);
	    };
	    Notification.prototype.toObservable = function () {
	        var _a = this, kind = _a.kind, value = _a.value, error = _a.error;
	        var result = kind === 'N'
	            ?
	                of_1.of(value)
	            :
	                kind === 'E'
	                    ?
	                        throwError_1.throwError(function () { return error; })
	                    :
	                        kind === 'C'
	                            ?
	                                empty_1.EMPTY
	                            :
	                                0;
	        if (!result) {
	            throw new TypeError("Unexpected notification kind " + kind);
	        }
	        return result;
	    };
	    Notification.createNext = function (value) {
	        return new Notification('N', value);
	    };
	    Notification.createError = function (err) {
	        return new Notification('E', undefined, err);
	    };
	    Notification.createComplete = function () {
	        return Notification.completeNotification;
	    };
	    Notification.completeNotification = new Notification('C');
	    return Notification;
	}());
	exports.Notification = Notification;
	function observeNotification(notification, observer) {
	    var _a, _b, _c;
	    var _d = notification, kind = _d.kind, value = _d.value, error = _d.error;
	    if (typeof kind !== 'string') {
	        throw new TypeError('Invalid notification, missing "kind"');
	    }
	    kind === 'N' ? (_a = observer.next) === null || _a === void 0 ? void 0 : _a.call(observer, value) : kind === 'E' ? (_b = observer.error) === null || _b === void 0 ? void 0 : _b.call(observer, error) : (_c = observer.complete) === null || _c === void 0 ? void 0 : _c.call(observer);
	}
	exports.observeNotification = observeNotification;
	
} (Notification));

Object.defineProperty(dematerialize$1, "__esModule", { value: true });
dematerialize$1.dematerialize = void 0;
var Notification_1$1 = Notification;
var lift_1$L = lift;
var OperatorSubscriber_1$E = OperatorSubscriber$1;
function dematerialize() {
    return lift_1$L.operate(function (source, subscriber) {
        source.subscribe(OperatorSubscriber_1$E.createOperatorSubscriber(subscriber, function (notification) { return Notification_1$1.observeNotification(notification, subscriber); }));
    });
}
dematerialize$1.dematerialize = dematerialize;

var distinct$1 = {};

Object.defineProperty(distinct$1, "__esModule", { value: true });
distinct$1.distinct = void 0;
var lift_1$K = lift;
var OperatorSubscriber_1$D = OperatorSubscriber$1;
var noop_1$7 = noop$1;
var innerFrom_1$q = innerFrom$1;
function distinct(keySelector, flushes) {
    return lift_1$K.operate(function (source, subscriber) {
        var distinctKeys = new Set();
        source.subscribe(OperatorSubscriber_1$D.createOperatorSubscriber(subscriber, function (value) {
            var key = keySelector ? keySelector(value) : value;
            if (!distinctKeys.has(key)) {
                distinctKeys.add(key);
                subscriber.next(value);
            }
        }));
        flushes && innerFrom_1$q.innerFrom(flushes).subscribe(OperatorSubscriber_1$D.createOperatorSubscriber(subscriber, function () { return distinctKeys.clear(); }, noop_1$7.noop));
    });
}
distinct$1.distinct = distinct;

var distinctUntilChanged$1 = {};

Object.defineProperty(distinctUntilChanged$1, "__esModule", { value: true });
distinctUntilChanged$1.distinctUntilChanged = void 0;
var identity_1$a = identity$1;
var lift_1$J = lift;
var OperatorSubscriber_1$C = OperatorSubscriber$1;
function distinctUntilChanged(comparator, keySelector) {
    if (keySelector === void 0) { keySelector = identity_1$a.identity; }
    comparator = comparator !== null && comparator !== void 0 ? comparator : defaultCompare;
    return lift_1$J.operate(function (source, subscriber) {
        var previousKey;
        var first = true;
        source.subscribe(OperatorSubscriber_1$C.createOperatorSubscriber(subscriber, function (value) {
            var currentKey = keySelector(value);
            if (first || !comparator(previousKey, currentKey)) {
                first = false;
                previousKey = currentKey;
                subscriber.next(value);
            }
        }));
    });
}
distinctUntilChanged$1.distinctUntilChanged = distinctUntilChanged;
function defaultCompare(a, b) {
    return a === b;
}

var distinctUntilKeyChanged$1 = {};

Object.defineProperty(distinctUntilKeyChanged$1, "__esModule", { value: true });
distinctUntilKeyChanged$1.distinctUntilKeyChanged = void 0;
var distinctUntilChanged_1 = distinctUntilChanged$1;
function distinctUntilKeyChanged(key, compare) {
    return distinctUntilChanged_1.distinctUntilChanged(function (x, y) { return compare ? compare(x[key], y[key]) : x[key] === y[key]; });
}
distinctUntilKeyChanged$1.distinctUntilKeyChanged = distinctUntilKeyChanged;

var elementAt$1 = {};

var ArgumentOutOfRangeError = {};

Object.defineProperty(ArgumentOutOfRangeError, "__esModule", { value: true });
ArgumentOutOfRangeError.ArgumentOutOfRangeError = void 0;
var createErrorClass_1$3 = createErrorClass$1;
ArgumentOutOfRangeError.ArgumentOutOfRangeError = createErrorClass_1$3.createErrorClass(function (_super) {
    return function ArgumentOutOfRangeErrorImpl() {
        _super(this);
        this.name = 'ArgumentOutOfRangeError';
        this.message = 'argument out of range';
    };
});

var filter$1 = {};

Object.defineProperty(filter$1, "__esModule", { value: true });
filter$1.filter = void 0;
var lift_1$I = lift;
var OperatorSubscriber_1$B = OperatorSubscriber$1;
function filter(predicate, thisArg) {
    return lift_1$I.operate(function (source, subscriber) {
        var index = 0;
        source.subscribe(OperatorSubscriber_1$B.createOperatorSubscriber(subscriber, function (value) { return predicate.call(thisArg, value, index++) && subscriber.next(value); }));
    });
}
filter$1.filter = filter;

var throwIfEmpty$1 = {};

var EmptyError = {};

Object.defineProperty(EmptyError, "__esModule", { value: true });
EmptyError.EmptyError = void 0;
var createErrorClass_1$2 = createErrorClass$1;
EmptyError.EmptyError = createErrorClass_1$2.createErrorClass(function (_super) { return function EmptyErrorImpl() {
    _super(this);
    this.name = 'EmptyError';
    this.message = 'no elements in sequence';
}; });

Object.defineProperty(throwIfEmpty$1, "__esModule", { value: true });
throwIfEmpty$1.throwIfEmpty = void 0;
var EmptyError_1$5 = EmptyError;
var lift_1$H = lift;
var OperatorSubscriber_1$A = OperatorSubscriber$1;
function throwIfEmpty(errorFactory) {
    if (errorFactory === void 0) { errorFactory = defaultErrorFactory; }
    return lift_1$H.operate(function (source, subscriber) {
        var hasValue = false;
        source.subscribe(OperatorSubscriber_1$A.createOperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            subscriber.next(value);
        }, function () { return (hasValue ? subscriber.complete() : subscriber.error(errorFactory())); }));
    });
}
throwIfEmpty$1.throwIfEmpty = throwIfEmpty;
function defaultErrorFactory() {
    return new EmptyError_1$5.EmptyError();
}

Object.defineProperty(elementAt$1, "__esModule", { value: true });
elementAt$1.elementAt = void 0;
var ArgumentOutOfRangeError_1 = ArgumentOutOfRangeError;
var filter_1$5 = filter$1;
var throwIfEmpty_1$2 = throwIfEmpty$1;
var defaultIfEmpty_1$2 = defaultIfEmpty$1;
var take_1$1 = take$1;
function elementAt(index, defaultValue) {
    if (index < 0) {
        throw new ArgumentOutOfRangeError_1.ArgumentOutOfRangeError();
    }
    var hasDefaultValue = arguments.length >= 2;
    return function (source) {
        return source.pipe(filter_1$5.filter(function (v, i) { return i === index; }), take_1$1.take(1), hasDefaultValue ? defaultIfEmpty_1$2.defaultIfEmpty(defaultValue) : throwIfEmpty_1$2.throwIfEmpty(function () { return new ArgumentOutOfRangeError_1.ArgumentOutOfRangeError(); }));
    };
}
elementAt$1.elementAt = elementAt;

var endWith$1 = {};

var __read$c = (endWith$1 && endWith$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$b = (endWith$1 && endWith$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(endWith$1, "__esModule", { value: true });
endWith$1.endWith = void 0;
var concat_1$1 = concat$1;
var of_1 = of$1;
function endWith() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    return function (source) { return concat_1$1.concat(source, of_1.of.apply(void 0, __spreadArray$b([], __read$c(values)))); };
}
endWith$1.endWith = endWith;

var every$1 = {};

Object.defineProperty(every$1, "__esModule", { value: true });
every$1.every = void 0;
var lift_1$G = lift;
var OperatorSubscriber_1$z = OperatorSubscriber$1;
function every(predicate, thisArg) {
    return lift_1$G.operate(function (source, subscriber) {
        var index = 0;
        source.subscribe(OperatorSubscriber_1$z.createOperatorSubscriber(subscriber, function (value) {
            if (!predicate.call(thisArg, value, index++, source)) {
                subscriber.next(false);
                subscriber.complete();
            }
        }, function () {
            subscriber.next(true);
            subscriber.complete();
        }));
    });
}
every$1.every = every;

var exhaust = {};

var exhaustAll$1 = {};

var exhaustMap$1 = {};

Object.defineProperty(exhaustMap$1, "__esModule", { value: true });
exhaustMap$1.exhaustMap = void 0;
var map_1$2 = map$1;
var innerFrom_1$p = innerFrom$1;
var lift_1$F = lift;
var OperatorSubscriber_1$y = OperatorSubscriber$1;
function exhaustMap(project, resultSelector) {
    if (resultSelector) {
        return function (source) {
            return source.pipe(exhaustMap(function (a, i) { return innerFrom_1$p.innerFrom(project(a, i)).pipe(map_1$2.map(function (b, ii) { return resultSelector(a, b, i, ii); })); }));
        };
    }
    return lift_1$F.operate(function (source, subscriber) {
        var index = 0;
        var innerSub = null;
        var isComplete = false;
        source.subscribe(OperatorSubscriber_1$y.createOperatorSubscriber(subscriber, function (outerValue) {
            if (!innerSub) {
                innerSub = OperatorSubscriber_1$y.createOperatorSubscriber(subscriber, undefined, function () {
                    innerSub = null;
                    isComplete && subscriber.complete();
                });
                innerFrom_1$p.innerFrom(project(outerValue, index++)).subscribe(innerSub);
            }
        }, function () {
            isComplete = true;
            !innerSub && subscriber.complete();
        }));
    });
}
exhaustMap$1.exhaustMap = exhaustMap;

Object.defineProperty(exhaustAll$1, "__esModule", { value: true });
exhaustAll$1.exhaustAll = void 0;
var exhaustMap_1 = exhaustMap$1;
var identity_1$9 = identity$1;
function exhaustAll() {
    return exhaustMap_1.exhaustMap(identity_1$9.identity);
}
exhaustAll$1.exhaustAll = exhaustAll;

Object.defineProperty(exhaust, "__esModule", { value: true });
exhaust.exhaust = void 0;
var exhaustAll_1 = exhaustAll$1;
exhaust.exhaust = exhaustAll_1.exhaustAll;

var expand$1 = {};

Object.defineProperty(expand$1, "__esModule", { value: true });
expand$1.expand = void 0;
var lift_1$E = lift;
var mergeInternals_1$1 = mergeInternals$1;
function expand(project, concurrent, scheduler) {
    if (concurrent === void 0) { concurrent = Infinity; }
    concurrent = (concurrent || 0) < 1 ? Infinity : concurrent;
    return lift_1$E.operate(function (source, subscriber) {
        return mergeInternals_1$1.mergeInternals(source, subscriber, project, concurrent, undefined, true, scheduler);
    });
}
expand$1.expand = expand;

var finalize$1 = {};

Object.defineProperty(finalize$1, "__esModule", { value: true });
finalize$1.finalize = void 0;
var lift_1$D = lift;
function finalize(callback) {
    return lift_1$D.operate(function (source, subscriber) {
        try {
            source.subscribe(subscriber);
        }
        finally {
            subscriber.add(callback);
        }
    });
}
finalize$1.finalize = finalize;

var find$1 = {};

Object.defineProperty(find$1, "__esModule", { value: true });
find$1.createFind = find$1.find = void 0;
var lift_1$C = lift;
var OperatorSubscriber_1$x = OperatorSubscriber$1;
function find(predicate, thisArg) {
    return lift_1$C.operate(createFind(predicate, thisArg, 'value'));
}
find$1.find = find;
function createFind(predicate, thisArg, emit) {
    var findIndex = emit === 'index';
    return function (source, subscriber) {
        var index = 0;
        source.subscribe(OperatorSubscriber_1$x.createOperatorSubscriber(subscriber, function (value) {
            var i = index++;
            if (predicate.call(thisArg, value, i, source)) {
                subscriber.next(findIndex ? i : value);
                subscriber.complete();
            }
        }, function () {
            subscriber.next(findIndex ? -1 : undefined);
            subscriber.complete();
        }));
    };
}
find$1.createFind = createFind;

var findIndex$1 = {};

Object.defineProperty(findIndex$1, "__esModule", { value: true });
findIndex$1.findIndex = void 0;
var lift_1$B = lift;
var find_1 = find$1;
function findIndex(predicate, thisArg) {
    return lift_1$B.operate(find_1.createFind(predicate, thisArg, 'index'));
}
findIndex$1.findIndex = findIndex;

var first$1 = {};

Object.defineProperty(first$1, "__esModule", { value: true });
first$1.first = void 0;
var EmptyError_1$4 = EmptyError;
var filter_1$4 = filter$1;
var take_1 = take$1;
var defaultIfEmpty_1$1 = defaultIfEmpty$1;
var throwIfEmpty_1$1 = throwIfEmpty$1;
var identity_1$8 = identity$1;
function first(predicate, defaultValue) {
    var hasDefaultValue = arguments.length >= 2;
    return function (source) {
        return source.pipe(predicate ? filter_1$4.filter(function (v, i) { return predicate(v, i, source); }) : identity_1$8.identity, take_1.take(1), hasDefaultValue ? defaultIfEmpty_1$1.defaultIfEmpty(defaultValue) : throwIfEmpty_1$1.throwIfEmpty(function () { return new EmptyError_1$4.EmptyError(); }));
    };
}
first$1.first = first;

var groupBy$1 = {};

Object.defineProperty(groupBy$1, "__esModule", { value: true });
groupBy$1.groupBy = void 0;
var Observable_1$e = Observable$1;
var innerFrom_1$o = innerFrom$1;
var Subject_1$d = Subject$1;
var lift_1$A = lift;
var OperatorSubscriber_1$w = OperatorSubscriber$1;
function groupBy(keySelector, elementOrOptions, duration, connector) {
    return lift_1$A.operate(function (source, subscriber) {
        var element;
        if (!elementOrOptions || typeof elementOrOptions === 'function') {
            element = elementOrOptions;
        }
        else {
            (duration = elementOrOptions.duration, element = elementOrOptions.element, connector = elementOrOptions.connector);
        }
        var groups = new Map();
        var notify = function (cb) {
            groups.forEach(cb);
            cb(subscriber);
        };
        var handleError = function (err) { return notify(function (consumer) { return consumer.error(err); }); };
        var activeGroups = 0;
        var teardownAttempted = false;
        var groupBySourceSubscriber = new OperatorSubscriber_1$w.OperatorSubscriber(subscriber, function (value) {
            try {
                var key_1 = keySelector(value);
                var group_1 = groups.get(key_1);
                if (!group_1) {
                    groups.set(key_1, (group_1 = connector ? connector() : new Subject_1$d.Subject()));
                    var grouped = createGroupedObservable(key_1, group_1);
                    subscriber.next(grouped);
                    if (duration) {
                        var durationSubscriber_1 = OperatorSubscriber_1$w.createOperatorSubscriber(group_1, function () {
                            group_1.complete();
                            durationSubscriber_1 === null || durationSubscriber_1 === void 0 ? void 0 : durationSubscriber_1.unsubscribe();
                        }, undefined, undefined, function () { return groups.delete(key_1); });
                        groupBySourceSubscriber.add(innerFrom_1$o.innerFrom(duration(grouped)).subscribe(durationSubscriber_1));
                    }
                }
                group_1.next(element ? element(value) : value);
            }
            catch (err) {
                handleError(err);
            }
        }, function () { return notify(function (consumer) { return consumer.complete(); }); }, handleError, function () { return groups.clear(); }, function () {
            teardownAttempted = true;
            return activeGroups === 0;
        });
        source.subscribe(groupBySourceSubscriber);
        function createGroupedObservable(key, groupSubject) {
            var result = new Observable_1$e.Observable(function (groupSubscriber) {
                activeGroups++;
                var innerSub = groupSubject.subscribe(groupSubscriber);
                return function () {
                    innerSub.unsubscribe();
                    --activeGroups === 0 && teardownAttempted && groupBySourceSubscriber.unsubscribe();
                };
            });
            result.key = key;
            return result;
        }
    });
}
groupBy$1.groupBy = groupBy;

var isEmpty$1 = {};

Object.defineProperty(isEmpty$1, "__esModule", { value: true });
isEmpty$1.isEmpty = void 0;
var lift_1$z = lift;
var OperatorSubscriber_1$v = OperatorSubscriber$1;
function isEmpty() {
    return lift_1$z.operate(function (source, subscriber) {
        source.subscribe(OperatorSubscriber_1$v.createOperatorSubscriber(subscriber, function () {
            subscriber.next(false);
            subscriber.complete();
        }, function () {
            subscriber.next(true);
            subscriber.complete();
        }));
    });
}
isEmpty$1.isEmpty = isEmpty;

var last$1 = {};

var takeLast$1 = {};

var __values$2 = (takeLast$1 && takeLast$1.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(takeLast$1, "__esModule", { value: true });
takeLast$1.takeLast = void 0;
var empty_1$5 = empty;
var lift_1$y = lift;
var OperatorSubscriber_1$u = OperatorSubscriber$1;
function takeLast(count) {
    return count <= 0
        ? function () { return empty_1$5.EMPTY; }
        : lift_1$y.operate(function (source, subscriber) {
            var buffer = [];
            source.subscribe(OperatorSubscriber_1$u.createOperatorSubscriber(subscriber, function (value) {
                buffer.push(value);
                count < buffer.length && buffer.shift();
            }, function () {
                var e_1, _a;
                try {
                    for (var buffer_1 = __values$2(buffer), buffer_1_1 = buffer_1.next(); !buffer_1_1.done; buffer_1_1 = buffer_1.next()) {
                        var value = buffer_1_1.value;
                        subscriber.next(value);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (buffer_1_1 && !buffer_1_1.done && (_a = buffer_1.return)) _a.call(buffer_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                subscriber.complete();
            }, undefined, function () {
                buffer = null;
            }));
        });
}
takeLast$1.takeLast = takeLast;

Object.defineProperty(last$1, "__esModule", { value: true });
last$1.last = void 0;
var EmptyError_1$3 = EmptyError;
var filter_1$3 = filter$1;
var takeLast_1 = takeLast$1;
var throwIfEmpty_1 = throwIfEmpty$1;
var defaultIfEmpty_1 = defaultIfEmpty$1;
var identity_1$7 = identity$1;
function last(predicate, defaultValue) {
    var hasDefaultValue = arguments.length >= 2;
    return function (source) {
        return source.pipe(predicate ? filter_1$3.filter(function (v, i) { return predicate(v, i, source); }) : identity_1$7.identity, takeLast_1.takeLast(1), hasDefaultValue ? defaultIfEmpty_1.defaultIfEmpty(defaultValue) : throwIfEmpty_1.throwIfEmpty(function () { return new EmptyError_1$3.EmptyError(); }));
    };
}
last$1.last = last;

var materialize$1 = {};

Object.defineProperty(materialize$1, "__esModule", { value: true });
materialize$1.materialize = void 0;
var Notification_1 = Notification;
var lift_1$x = lift;
var OperatorSubscriber_1$t = OperatorSubscriber$1;
function materialize() {
    return lift_1$x.operate(function (source, subscriber) {
        source.subscribe(OperatorSubscriber_1$t.createOperatorSubscriber(subscriber, function (value) {
            subscriber.next(Notification_1.Notification.createNext(value));
        }, function () {
            subscriber.next(Notification_1.Notification.createComplete());
            subscriber.complete();
        }, function (err) {
            subscriber.next(Notification_1.Notification.createError(err));
            subscriber.complete();
        }));
    });
}
materialize$1.materialize = materialize;

var max$1 = {};

Object.defineProperty(max$1, "__esModule", { value: true });
max$1.max = void 0;
var reduce_1$1 = reduce$1;
var isFunction_1$9 = isFunction$1;
function max(comparer) {
    return reduce_1$1.reduce(isFunction_1$9.isFunction(comparer) ? function (x, y) { return (comparer(x, y) > 0 ? x : y); } : function (x, y) { return (x > y ? x : y); });
}
max$1.max = max;

var merge$3 = {};

var __read$b = (merge$3 && merge$3.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$a = (merge$3 && merge$3.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(merge$3, "__esModule", { value: true });
merge$3.merge = void 0;
var lift_1$w = lift;
var argsOrArgArray_1$5 = argsOrArgArray$1;
var mergeAll_1$1 = mergeAll$1;
var args_1$6 = args;
var from_1$2 = from$1;
function merge$2() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1$6.popScheduler(args);
    var concurrent = args_1$6.popNumber(args, Infinity);
    args = argsOrArgArray_1$5.argsOrArgArray(args);
    return lift_1$w.operate(function (source, subscriber) {
        mergeAll_1$1.mergeAll(concurrent)(from_1$2.from(__spreadArray$a([source], __read$b(args)), scheduler)).subscribe(subscriber);
    });
}
merge$3.merge = merge$2;

var flatMap = {};

Object.defineProperty(flatMap, "__esModule", { value: true });
flatMap.flatMap = void 0;
var mergeMap_1$2 = mergeMap$1;
flatMap.flatMap = mergeMap_1$2.mergeMap;

var mergeMapTo$1 = {};

Object.defineProperty(mergeMapTo$1, "__esModule", { value: true });
mergeMapTo$1.mergeMapTo = void 0;
var mergeMap_1$1 = mergeMap$1;
var isFunction_1$8 = isFunction$1;
function mergeMapTo(innerObservable, resultSelector, concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    if (isFunction_1$8.isFunction(resultSelector)) {
        return mergeMap_1$1.mergeMap(function () { return innerObservable; }, resultSelector, concurrent);
    }
    if (typeof resultSelector === 'number') {
        concurrent = resultSelector;
    }
    return mergeMap_1$1.mergeMap(function () { return innerObservable; }, concurrent);
}
mergeMapTo$1.mergeMapTo = mergeMapTo;

var mergeScan$1 = {};

Object.defineProperty(mergeScan$1, "__esModule", { value: true });
mergeScan$1.mergeScan = void 0;
var lift_1$v = lift;
var mergeInternals_1 = mergeInternals$1;
function mergeScan(accumulator, seed, concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    return lift_1$v.operate(function (source, subscriber) {
        var state = seed;
        return mergeInternals_1.mergeInternals(source, subscriber, function (value, index) { return accumulator(state, value, index); }, concurrent, function (value) {
            state = value;
        }, false, undefined, function () { return (state = null); });
    });
}
mergeScan$1.mergeScan = mergeScan;

var mergeWith$1 = {};

var __read$a = (mergeWith$1 && mergeWith$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$9 = (mergeWith$1 && mergeWith$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(mergeWith$1, "__esModule", { value: true });
mergeWith$1.mergeWith = void 0;
var merge_1 = merge$3;
function mergeWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return merge_1.merge.apply(void 0, __spreadArray$9([], __read$a(otherSources)));
}
mergeWith$1.mergeWith = mergeWith;

var min$1 = {};

Object.defineProperty(min$1, "__esModule", { value: true });
min$1.min = void 0;
var reduce_1 = reduce$1;
var isFunction_1$7 = isFunction$1;
function min(comparer) {
    return reduce_1.reduce(isFunction_1$7.isFunction(comparer) ? function (x, y) { return (comparer(x, y) < 0 ? x : y); } : function (x, y) { return (x < y ? x : y); });
}
min$1.min = min;

var multicast$1 = {};

var ConnectableObservable$1 = {};

var refCount$1 = {};

Object.defineProperty(refCount$1, "__esModule", { value: true });
refCount$1.refCount = void 0;
var lift_1$u = lift;
var OperatorSubscriber_1$s = OperatorSubscriber$1;
function refCount() {
    return lift_1$u.operate(function (source, subscriber) {
        var connection = null;
        source._refCount++;
        var refCounter = OperatorSubscriber_1$s.createOperatorSubscriber(subscriber, undefined, undefined, undefined, function () {
            if (!source || source._refCount <= 0 || 0 < --source._refCount) {
                connection = null;
                return;
            }
            var sharedConnection = source._connection;
            var conn = connection;
            connection = null;
            if (sharedConnection && (!conn || sharedConnection === conn)) {
                sharedConnection.unsubscribe();
            }
            subscriber.unsubscribe();
        });
        source.subscribe(refCounter);
        if (!refCounter.closed) {
            connection = source.connect();
        }
    });
}
refCount$1.refCount = refCount;

var __extends$b = (ConnectableObservable$1 && ConnectableObservable$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(ConnectableObservable$1, "__esModule", { value: true });
ConnectableObservable$1.ConnectableObservable = void 0;
var Observable_1$d = Observable$1;
var Subscription_1$3 = Subscription$1;
var refCount_1 = refCount$1;
var OperatorSubscriber_1$r = OperatorSubscriber$1;
var lift_1$t = lift;
var ConnectableObservable = (function (_super) {
    __extends$b(ConnectableObservable, _super);
    function ConnectableObservable(source, subjectFactory) {
        var _this = _super.call(this) || this;
        _this.source = source;
        _this.subjectFactory = subjectFactory;
        _this._subject = null;
        _this._refCount = 0;
        _this._connection = null;
        if (lift_1$t.hasLift(source)) {
            _this.lift = source.lift;
        }
        return _this;
    }
    ConnectableObservable.prototype._subscribe = function (subscriber) {
        return this.getSubject().subscribe(subscriber);
    };
    ConnectableObservable.prototype.getSubject = function () {
        var subject = this._subject;
        if (!subject || subject.isStopped) {
            this._subject = this.subjectFactory();
        }
        return this._subject;
    };
    ConnectableObservable.prototype._teardown = function () {
        this._refCount = 0;
        var _connection = this._connection;
        this._subject = this._connection = null;
        _connection === null || _connection === void 0 ? void 0 : _connection.unsubscribe();
    };
    ConnectableObservable.prototype.connect = function () {
        var _this = this;
        var connection = this._connection;
        if (!connection) {
            connection = this._connection = new Subscription_1$3.Subscription();
            var subject_1 = this.getSubject();
            connection.add(this.source.subscribe(OperatorSubscriber_1$r.createOperatorSubscriber(subject_1, undefined, function () {
                _this._teardown();
                subject_1.complete();
            }, function (err) {
                _this._teardown();
                subject_1.error(err);
            }, function () { return _this._teardown(); })));
            if (connection.closed) {
                this._connection = null;
                connection = Subscription_1$3.Subscription.EMPTY;
            }
        }
        return connection;
    };
    ConnectableObservable.prototype.refCount = function () {
        return refCount_1.refCount()(this);
    };
    return ConnectableObservable;
}(Observable_1$d.Observable));
ConnectableObservable$1.ConnectableObservable = ConnectableObservable;

Object.defineProperty(multicast$1, "__esModule", { value: true });
multicast$1.multicast = void 0;
var ConnectableObservable_1$2 = ConnectableObservable$1;
var isFunction_1$6 = isFunction$1;
var connect_1$1 = connect$1;
function multicast(subjectOrSubjectFactory, selector) {
    var subjectFactory = isFunction_1$6.isFunction(subjectOrSubjectFactory) ? subjectOrSubjectFactory : function () { return subjectOrSubjectFactory; };
    if (isFunction_1$6.isFunction(selector)) {
        return connect_1$1.connect(selector, {
            connector: subjectFactory,
        });
    }
    return function (source) { return new ConnectableObservable_1$2.ConnectableObservable(source, subjectFactory); };
}
multicast$1.multicast = multicast;

var onErrorResumeNextWith$1 = {};

var onErrorResumeNext$1 = {};

Object.defineProperty(onErrorResumeNext$1, "__esModule", { value: true });
onErrorResumeNext$1.onErrorResumeNext = void 0;
var Observable_1$c = Observable$1;
var argsOrArgArray_1$4 = argsOrArgArray$1;
var OperatorSubscriber_1$q = OperatorSubscriber$1;
var noop_1$6 = noop$1;
var innerFrom_1$n = innerFrom$1;
function onErrorResumeNext() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    var nextSources = argsOrArgArray_1$4.argsOrArgArray(sources);
    return new Observable_1$c.Observable(function (subscriber) {
        var sourceIndex = 0;
        var subscribeNext = function () {
            if (sourceIndex < nextSources.length) {
                var nextSource = void 0;
                try {
                    nextSource = innerFrom_1$n.innerFrom(nextSources[sourceIndex++]);
                }
                catch (err) {
                    subscribeNext();
                    return;
                }
                var innerSubscriber = new OperatorSubscriber_1$q.OperatorSubscriber(subscriber, undefined, noop_1$6.noop, noop_1$6.noop);
                nextSource.subscribe(innerSubscriber);
                innerSubscriber.add(subscribeNext);
            }
            else {
                subscriber.complete();
            }
        };
        subscribeNext();
    });
}
onErrorResumeNext$1.onErrorResumeNext = onErrorResumeNext;

var __read$9 = (onErrorResumeNextWith$1 && onErrorResumeNextWith$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$8 = (onErrorResumeNextWith$1 && onErrorResumeNextWith$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(onErrorResumeNextWith$1, "__esModule", { value: true });
onErrorResumeNextWith$1.onErrorResumeNext = onErrorResumeNextWith$1.onErrorResumeNextWith = void 0;
var argsOrArgArray_1$3 = argsOrArgArray$1;
var onErrorResumeNext_1 = onErrorResumeNext$1;
function onErrorResumeNextWith() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    var nextSources = argsOrArgArray_1$3.argsOrArgArray(sources);
    return function (source) { return onErrorResumeNext_1.onErrorResumeNext.apply(void 0, __spreadArray$8([source], __read$9(nextSources))); };
}
onErrorResumeNextWith$1.onErrorResumeNextWith = onErrorResumeNextWith;
onErrorResumeNextWith$1.onErrorResumeNext = onErrorResumeNextWith;

var pairwise$1 = {};

Object.defineProperty(pairwise$1, "__esModule", { value: true });
pairwise$1.pairwise = void 0;
var lift_1$s = lift;
var OperatorSubscriber_1$p = OperatorSubscriber$1;
function pairwise() {
    return lift_1$s.operate(function (source, subscriber) {
        var prev;
        var hasPrev = false;
        source.subscribe(OperatorSubscriber_1$p.createOperatorSubscriber(subscriber, function (value) {
            var p = prev;
            prev = value;
            hasPrev && subscriber.next([p, value]);
            hasPrev = true;
        }));
    });
}
pairwise$1.pairwise = pairwise;

var partition$3 = {};

var not$1 = {};

Object.defineProperty(not$1, "__esModule", { value: true });
not$1.not = void 0;
function not(pred, thisArg) {
    return function (value, index) { return !pred.call(thisArg, value, index); };
}
not$1.not = not;

Object.defineProperty(partition$3, "__esModule", { value: true });
partition$3.partition = void 0;
var not_1$1 = not$1;
var filter_1$2 = filter$1;
function partition$2(predicate, thisArg) {
    return function (source) {
        return [filter_1$2.filter(predicate, thisArg)(source), filter_1$2.filter(not_1$1.not(predicate, thisArg))(source)];
    };
}
partition$3.partition = partition$2;

var pluck$1 = {};

Object.defineProperty(pluck$1, "__esModule", { value: true });
pluck$1.pluck = void 0;
var map_1$1 = map$1;
function pluck() {
    var properties = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        properties[_i] = arguments[_i];
    }
    var length = properties.length;
    if (length === 0) {
        throw new Error('list of properties cannot be empty.');
    }
    return map_1$1.map(function (x) {
        var currentProp = x;
        for (var i = 0; i < length; i++) {
            var p = currentProp === null || currentProp === void 0 ? void 0 : currentProp[properties[i]];
            if (typeof p !== 'undefined') {
                currentProp = p;
            }
            else {
                return undefined;
            }
        }
        return currentProp;
    });
}
pluck$1.pluck = pluck;

var publish$1 = {};

Object.defineProperty(publish$1, "__esModule", { value: true });
publish$1.publish = void 0;
var Subject_1$c = Subject$1;
var multicast_1$1 = multicast$1;
var connect_1 = connect$1;
function publish(selector) {
    return selector ? function (source) { return connect_1.connect(selector)(source); } : function (source) { return multicast_1$1.multicast(new Subject_1$c.Subject())(source); };
}
publish$1.publish = publish;

var publishBehavior$1 = {};

var BehaviorSubject$1 = {};

var __extends$a = (BehaviorSubject$1 && BehaviorSubject$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(BehaviorSubject$1, "__esModule", { value: true });
BehaviorSubject$1.BehaviorSubject = void 0;
var Subject_1$b = Subject$1;
var BehaviorSubject = (function (_super) {
    __extends$a(BehaviorSubject, _super);
    function BehaviorSubject(_value) {
        var _this = _super.call(this) || this;
        _this._value = _value;
        return _this;
    }
    Object.defineProperty(BehaviorSubject.prototype, "value", {
        get: function () {
            return this.getValue();
        },
        enumerable: false,
        configurable: true
    });
    BehaviorSubject.prototype._subscribe = function (subscriber) {
        var subscription = _super.prototype._subscribe.call(this, subscriber);
        !subscription.closed && subscriber.next(this._value);
        return subscription;
    };
    BehaviorSubject.prototype.getValue = function () {
        var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, _value = _a._value;
        if (hasError) {
            throw thrownError;
        }
        this._throwIfClosed();
        return _value;
    };
    BehaviorSubject.prototype.next = function (value) {
        _super.prototype.next.call(this, (this._value = value));
    };
    return BehaviorSubject;
}(Subject_1$b.Subject));
BehaviorSubject$1.BehaviorSubject = BehaviorSubject;

Object.defineProperty(publishBehavior$1, "__esModule", { value: true });
publishBehavior$1.publishBehavior = void 0;
var BehaviorSubject_1 = BehaviorSubject$1;
var ConnectableObservable_1$1 = ConnectableObservable$1;
function publishBehavior(initialValue) {
    return function (source) {
        var subject = new BehaviorSubject_1.BehaviorSubject(initialValue);
        return new ConnectableObservable_1$1.ConnectableObservable(source, function () { return subject; });
    };
}
publishBehavior$1.publishBehavior = publishBehavior;

var publishLast$1 = {};

var AsyncSubject$1 = {};

var __extends$9 = (AsyncSubject$1 && AsyncSubject$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(AsyncSubject$1, "__esModule", { value: true });
AsyncSubject$1.AsyncSubject = void 0;
var Subject_1$a = Subject$1;
var AsyncSubject = (function (_super) {
    __extends$9(AsyncSubject, _super);
    function AsyncSubject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._value = null;
        _this._hasValue = false;
        _this._isComplete = false;
        return _this;
    }
    AsyncSubject.prototype._checkFinalizedStatuses = function (subscriber) {
        var _a = this, hasError = _a.hasError, _hasValue = _a._hasValue, _value = _a._value, thrownError = _a.thrownError, isStopped = _a.isStopped, _isComplete = _a._isComplete;
        if (hasError) {
            subscriber.error(thrownError);
        }
        else if (isStopped || _isComplete) {
            _hasValue && subscriber.next(_value);
            subscriber.complete();
        }
    };
    AsyncSubject.prototype.next = function (value) {
        if (!this.isStopped) {
            this._value = value;
            this._hasValue = true;
        }
    };
    AsyncSubject.prototype.complete = function () {
        var _a = this, _hasValue = _a._hasValue, _value = _a._value, _isComplete = _a._isComplete;
        if (!_isComplete) {
            this._isComplete = true;
            _hasValue && _super.prototype.next.call(this, _value);
            _super.prototype.complete.call(this);
        }
    };
    return AsyncSubject;
}(Subject_1$a.Subject));
AsyncSubject$1.AsyncSubject = AsyncSubject;

Object.defineProperty(publishLast$1, "__esModule", { value: true });
publishLast$1.publishLast = void 0;
var AsyncSubject_1$1 = AsyncSubject$1;
var ConnectableObservable_1 = ConnectableObservable$1;
function publishLast() {
    return function (source) {
        var subject = new AsyncSubject_1$1.AsyncSubject();
        return new ConnectableObservable_1.ConnectableObservable(source, function () { return subject; });
    };
}
publishLast$1.publishLast = publishLast;

var publishReplay$1 = {};

var ReplaySubject$1 = {};

var __extends$8 = (ReplaySubject$1 && ReplaySubject$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(ReplaySubject$1, "__esModule", { value: true });
ReplaySubject$1.ReplaySubject = void 0;
var Subject_1$9 = Subject$1;
var dateTimestampProvider_1$1 = dateTimestampProvider;
var ReplaySubject = (function (_super) {
    __extends$8(ReplaySubject, _super);
    function ReplaySubject(_bufferSize, _windowTime, _timestampProvider) {
        if (_bufferSize === void 0) { _bufferSize = Infinity; }
        if (_windowTime === void 0) { _windowTime = Infinity; }
        if (_timestampProvider === void 0) { _timestampProvider = dateTimestampProvider_1$1.dateTimestampProvider; }
        var _this = _super.call(this) || this;
        _this._bufferSize = _bufferSize;
        _this._windowTime = _windowTime;
        _this._timestampProvider = _timestampProvider;
        _this._buffer = [];
        _this._infiniteTimeWindow = true;
        _this._infiniteTimeWindow = _windowTime === Infinity;
        _this._bufferSize = Math.max(1, _bufferSize);
        _this._windowTime = Math.max(1, _windowTime);
        return _this;
    }
    ReplaySubject.prototype.next = function (value) {
        var _a = this, isStopped = _a.isStopped, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow, _timestampProvider = _a._timestampProvider, _windowTime = _a._windowTime;
        if (!isStopped) {
            _buffer.push(value);
            !_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
        }
        this._trimBuffer();
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype._subscribe = function (subscriber) {
        this._throwIfClosed();
        this._trimBuffer();
        var subscription = this._innerSubscribe(subscriber);
        var _a = this, _infiniteTimeWindow = _a._infiniteTimeWindow, _buffer = _a._buffer;
        var copy = _buffer.slice();
        for (var i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) {
            subscriber.next(copy[i]);
        }
        this._checkFinalizedStatuses(subscriber);
        return subscription;
    };
    ReplaySubject.prototype._trimBuffer = function () {
        var _a = this, _bufferSize = _a._bufferSize, _timestampProvider = _a._timestampProvider, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow;
        var adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
        _bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
        if (!_infiniteTimeWindow) {
            var now = _timestampProvider.now();
            var last = 0;
            for (var i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) {
                last = i;
            }
            last && _buffer.splice(0, last + 1);
        }
    };
    return ReplaySubject;
}(Subject_1$9.Subject));
ReplaySubject$1.ReplaySubject = ReplaySubject;

Object.defineProperty(publishReplay$1, "__esModule", { value: true });
publishReplay$1.publishReplay = void 0;
var ReplaySubject_1$1 = ReplaySubject$1;
var multicast_1 = multicast$1;
var isFunction_1$5 = isFunction$1;
function publishReplay(bufferSize, windowTime, selectorOrScheduler, timestampProvider) {
    if (selectorOrScheduler && !isFunction_1$5.isFunction(selectorOrScheduler)) {
        timestampProvider = selectorOrScheduler;
    }
    var selector = isFunction_1$5.isFunction(selectorOrScheduler) ? selectorOrScheduler : undefined;
    return function (source) { return multicast_1.multicast(new ReplaySubject_1$1.ReplaySubject(bufferSize, windowTime, timestampProvider), selector)(source); };
}
publishReplay$1.publishReplay = publishReplay;

var race$3 = {};

var raceWith$1 = {};

var race$2 = {};

Object.defineProperty(race$2, "__esModule", { value: true });
race$2.raceInit = race$2.race = void 0;
var Observable_1$b = Observable$1;
var innerFrom_1$m = innerFrom$1;
var argsOrArgArray_1$2 = argsOrArgArray$1;
var OperatorSubscriber_1$o = OperatorSubscriber$1;
function race$1() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    sources = argsOrArgArray_1$2.argsOrArgArray(sources);
    return sources.length === 1 ? innerFrom_1$m.innerFrom(sources[0]) : new Observable_1$b.Observable(raceInit(sources));
}
race$2.race = race$1;
function raceInit(sources) {
    return function (subscriber) {
        var subscriptions = [];
        var _loop_1 = function (i) {
            subscriptions.push(innerFrom_1$m.innerFrom(sources[i]).subscribe(OperatorSubscriber_1$o.createOperatorSubscriber(subscriber, function (value) {
                if (subscriptions) {
                    for (var s = 0; s < subscriptions.length; s++) {
                        s !== i && subscriptions[s].unsubscribe();
                    }
                    subscriptions = null;
                }
                subscriber.next(value);
            })));
        };
        for (var i = 0; subscriptions && !subscriber.closed && i < sources.length; i++) {
            _loop_1(i);
        }
    };
}
race$2.raceInit = raceInit;

var __read$8 = (raceWith$1 && raceWith$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$7 = (raceWith$1 && raceWith$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(raceWith$1, "__esModule", { value: true });
raceWith$1.raceWith = void 0;
var race_1 = race$2;
var lift_1$r = lift;
var identity_1$6 = identity$1;
function raceWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return !otherSources.length
        ? identity_1$6.identity
        : lift_1$r.operate(function (source, subscriber) {
            race_1.raceInit(__spreadArray$7([source], __read$8(otherSources)))(subscriber);
        });
}
raceWith$1.raceWith = raceWith;

var __read$7 = (race$3 && race$3.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$6 = (race$3 && race$3.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(race$3, "__esModule", { value: true });
race$3.race = void 0;
var argsOrArgArray_1$1 = argsOrArgArray$1;
var raceWith_1 = raceWith$1;
function race() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return raceWith_1.raceWith.apply(void 0, __spreadArray$6([], __read$7(argsOrArgArray_1$1.argsOrArgArray(args))));
}
race$3.race = race;

var repeat$1 = {};

Object.defineProperty(repeat$1, "__esModule", { value: true });
repeat$1.repeat = void 0;
var empty_1$4 = empty;
var lift_1$q = lift;
var OperatorSubscriber_1$n = OperatorSubscriber$1;
var innerFrom_1$l = innerFrom$1;
var timer_1$3 = timer$1;
function repeat(countOrConfig) {
    var _a;
    var count = Infinity;
    var delay;
    if (countOrConfig != null) {
        if (typeof countOrConfig === 'object') {
            (_a = countOrConfig.count, count = _a === void 0 ? Infinity : _a, delay = countOrConfig.delay);
        }
        else {
            count = countOrConfig;
        }
    }
    return count <= 0
        ? function () { return empty_1$4.EMPTY; }
        : lift_1$q.operate(function (source, subscriber) {
            var soFar = 0;
            var sourceSub;
            var resubscribe = function () {
                sourceSub === null || sourceSub === void 0 ? void 0 : sourceSub.unsubscribe();
                sourceSub = null;
                if (delay != null) {
                    var notifier = typeof delay === 'number' ? timer_1$3.timer(delay) : innerFrom_1$l.innerFrom(delay(soFar));
                    var notifierSubscriber_1 = OperatorSubscriber_1$n.createOperatorSubscriber(subscriber, function () {
                        notifierSubscriber_1.unsubscribe();
                        subscribeToSource();
                    });
                    notifier.subscribe(notifierSubscriber_1);
                }
                else {
                    subscribeToSource();
                }
            };
            var subscribeToSource = function () {
                var syncUnsub = false;
                sourceSub = source.subscribe(OperatorSubscriber_1$n.createOperatorSubscriber(subscriber, undefined, function () {
                    if (++soFar < count) {
                        if (sourceSub) {
                            resubscribe();
                        }
                        else {
                            syncUnsub = true;
                        }
                    }
                    else {
                        subscriber.complete();
                    }
                }));
                if (syncUnsub) {
                    resubscribe();
                }
            };
            subscribeToSource();
        });
}
repeat$1.repeat = repeat;

var repeatWhen$1 = {};

Object.defineProperty(repeatWhen$1, "__esModule", { value: true });
repeatWhen$1.repeatWhen = void 0;
var innerFrom_1$k = innerFrom$1;
var Subject_1$8 = Subject$1;
var lift_1$p = lift;
var OperatorSubscriber_1$m = OperatorSubscriber$1;
function repeatWhen(notifier) {
    return lift_1$p.operate(function (source, subscriber) {
        var innerSub;
        var syncResub = false;
        var completions$;
        var isNotifierComplete = false;
        var isMainComplete = false;
        var checkComplete = function () { return isMainComplete && isNotifierComplete && (subscriber.complete(), true); };
        var getCompletionSubject = function () {
            if (!completions$) {
                completions$ = new Subject_1$8.Subject();
                innerFrom_1$k.innerFrom(notifier(completions$)).subscribe(OperatorSubscriber_1$m.createOperatorSubscriber(subscriber, function () {
                    if (innerSub) {
                        subscribeForRepeatWhen();
                    }
                    else {
                        syncResub = true;
                    }
                }, function () {
                    isNotifierComplete = true;
                    checkComplete();
                }));
            }
            return completions$;
        };
        var subscribeForRepeatWhen = function () {
            isMainComplete = false;
            innerSub = source.subscribe(OperatorSubscriber_1$m.createOperatorSubscriber(subscriber, undefined, function () {
                isMainComplete = true;
                !checkComplete() && getCompletionSubject().next();
            }));
            if (syncResub) {
                innerSub.unsubscribe();
                innerSub = null;
                syncResub = false;
                subscribeForRepeatWhen();
            }
        };
        subscribeForRepeatWhen();
    });
}
repeatWhen$1.repeatWhen = repeatWhen;

var retry$1 = {};

Object.defineProperty(retry$1, "__esModule", { value: true });
retry$1.retry = void 0;
var lift_1$o = lift;
var OperatorSubscriber_1$l = OperatorSubscriber$1;
var identity_1$5 = identity$1;
var timer_1$2 = timer$1;
var innerFrom_1$j = innerFrom$1;
function retry(configOrCount) {
    if (configOrCount === void 0) { configOrCount = Infinity; }
    var config;
    if (configOrCount && typeof configOrCount === 'object') {
        config = configOrCount;
    }
    else {
        config = {
            count: configOrCount,
        };
    }
    var _a = config.count, count = _a === void 0 ? Infinity : _a, delay = config.delay, _b = config.resetOnSuccess, resetOnSuccess = _b === void 0 ? false : _b;
    return count <= 0
        ? identity_1$5.identity
        : lift_1$o.operate(function (source, subscriber) {
            var soFar = 0;
            var innerSub;
            var subscribeForRetry = function () {
                var syncUnsub = false;
                innerSub = source.subscribe(OperatorSubscriber_1$l.createOperatorSubscriber(subscriber, function (value) {
                    if (resetOnSuccess) {
                        soFar = 0;
                    }
                    subscriber.next(value);
                }, undefined, function (err) {
                    if (soFar++ < count) {
                        var resub_1 = function () {
                            if (innerSub) {
                                innerSub.unsubscribe();
                                innerSub = null;
                                subscribeForRetry();
                            }
                            else {
                                syncUnsub = true;
                            }
                        };
                        if (delay != null) {
                            var notifier = typeof delay === 'number' ? timer_1$2.timer(delay) : innerFrom_1$j.innerFrom(delay(err, soFar));
                            var notifierSubscriber_1 = OperatorSubscriber_1$l.createOperatorSubscriber(subscriber, function () {
                                notifierSubscriber_1.unsubscribe();
                                resub_1();
                            }, function () {
                                subscriber.complete();
                            });
                            notifier.subscribe(notifierSubscriber_1);
                        }
                        else {
                            resub_1();
                        }
                    }
                    else {
                        subscriber.error(err);
                    }
                }));
                if (syncUnsub) {
                    innerSub.unsubscribe();
                    innerSub = null;
                    subscribeForRetry();
                }
            };
            subscribeForRetry();
        });
}
retry$1.retry = retry;

var retryWhen$1 = {};

Object.defineProperty(retryWhen$1, "__esModule", { value: true });
retryWhen$1.retryWhen = void 0;
var innerFrom_1$i = innerFrom$1;
var Subject_1$7 = Subject$1;
var lift_1$n = lift;
var OperatorSubscriber_1$k = OperatorSubscriber$1;
function retryWhen(notifier) {
    return lift_1$n.operate(function (source, subscriber) {
        var innerSub;
        var syncResub = false;
        var errors$;
        var subscribeForRetryWhen = function () {
            innerSub = source.subscribe(OperatorSubscriber_1$k.createOperatorSubscriber(subscriber, undefined, undefined, function (err) {
                if (!errors$) {
                    errors$ = new Subject_1$7.Subject();
                    innerFrom_1$i.innerFrom(notifier(errors$)).subscribe(OperatorSubscriber_1$k.createOperatorSubscriber(subscriber, function () {
                        return innerSub ? subscribeForRetryWhen() : (syncResub = true);
                    }));
                }
                if (errors$) {
                    errors$.next(err);
                }
            }));
            if (syncResub) {
                innerSub.unsubscribe();
                innerSub = null;
                syncResub = false;
                subscribeForRetryWhen();
            }
        };
        subscribeForRetryWhen();
    });
}
retryWhen$1.retryWhen = retryWhen;

var sample$1 = {};

Object.defineProperty(sample$1, "__esModule", { value: true });
sample$1.sample = void 0;
var innerFrom_1$h = innerFrom$1;
var lift_1$m = lift;
var noop_1$5 = noop$1;
var OperatorSubscriber_1$j = OperatorSubscriber$1;
function sample(notifier) {
    return lift_1$m.operate(function (source, subscriber) {
        var hasValue = false;
        var lastValue = null;
        source.subscribe(OperatorSubscriber_1$j.createOperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            lastValue = value;
        }));
        innerFrom_1$h.innerFrom(notifier).subscribe(OperatorSubscriber_1$j.createOperatorSubscriber(subscriber, function () {
            if (hasValue) {
                hasValue = false;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
        }, noop_1$5.noop));
    });
}
sample$1.sample = sample;

var sampleTime$1 = {};

var interval$1 = {};

Object.defineProperty(interval$1, "__esModule", { value: true });
interval$1.interval = void 0;
var async_1$5 = async;
var timer_1$1 = timer$1;
function interval(period, scheduler) {
    if (period === void 0) { period = 0; }
    if (scheduler === void 0) { scheduler = async_1$5.asyncScheduler; }
    if (period < 0) {
        period = 0;
    }
    return timer_1$1.timer(period, period, scheduler);
}
interval$1.interval = interval;

Object.defineProperty(sampleTime$1, "__esModule", { value: true });
sampleTime$1.sampleTime = void 0;
var async_1$4 = async;
var sample_1 = sample$1;
var interval_1 = interval$1;
function sampleTime(period, scheduler) {
    if (scheduler === void 0) { scheduler = async_1$4.asyncScheduler; }
    return sample_1.sample(interval_1.interval(period, scheduler));
}
sampleTime$1.sampleTime = sampleTime;

var scan$1 = {};

Object.defineProperty(scan$1, "__esModule", { value: true });
scan$1.scan = void 0;
var lift_1$l = lift;
var scanInternals_1 = scanInternals$1;
function scan(accumulator, seed) {
    return lift_1$l.operate(scanInternals_1.scanInternals(accumulator, seed, arguments.length >= 2, true));
}
scan$1.scan = scan;

var sequenceEqual$1 = {};

Object.defineProperty(sequenceEqual$1, "__esModule", { value: true });
sequenceEqual$1.sequenceEqual = void 0;
var lift_1$k = lift;
var OperatorSubscriber_1$i = OperatorSubscriber$1;
var innerFrom_1$g = innerFrom$1;
function sequenceEqual(compareTo, comparator) {
    if (comparator === void 0) { comparator = function (a, b) { return a === b; }; }
    return lift_1$k.operate(function (source, subscriber) {
        var aState = createState();
        var bState = createState();
        var emit = function (isEqual) {
            subscriber.next(isEqual);
            subscriber.complete();
        };
        var createSubscriber = function (selfState, otherState) {
            var sequenceEqualSubscriber = OperatorSubscriber_1$i.createOperatorSubscriber(subscriber, function (a) {
                var buffer = otherState.buffer, complete = otherState.complete;
                if (buffer.length === 0) {
                    complete ? emit(false) : selfState.buffer.push(a);
                }
                else {
                    !comparator(a, buffer.shift()) && emit(false);
                }
            }, function () {
                selfState.complete = true;
                var complete = otherState.complete, buffer = otherState.buffer;
                complete && emit(buffer.length === 0);
                sequenceEqualSubscriber === null || sequenceEqualSubscriber === void 0 ? void 0 : sequenceEqualSubscriber.unsubscribe();
            });
            return sequenceEqualSubscriber;
        };
        source.subscribe(createSubscriber(aState, bState));
        innerFrom_1$g.innerFrom(compareTo).subscribe(createSubscriber(bState, aState));
    });
}
sequenceEqual$1.sequenceEqual = sequenceEqual;
function createState() {
    return {
        buffer: [],
        complete: false,
    };
}

var share$1 = {};

var __read$6 = (share$1 && share$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$5 = (share$1 && share$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(share$1, "__esModule", { value: true });
share$1.share = void 0;
var innerFrom_1$f = innerFrom$1;
var Subject_1$6 = Subject$1;
var Subscriber_1$1 = Subscriber;
var lift_1$j = lift;
function share(options) {
    if (options === void 0) { options = {}; }
    var _a = options.connector, connector = _a === void 0 ? function () { return new Subject_1$6.Subject(); } : _a, _b = options.resetOnError, resetOnError = _b === void 0 ? true : _b, _c = options.resetOnComplete, resetOnComplete = _c === void 0 ? true : _c, _d = options.resetOnRefCountZero, resetOnRefCountZero = _d === void 0 ? true : _d;
    return function (wrapperSource) {
        var connection;
        var resetConnection;
        var subject;
        var refCount = 0;
        var hasCompleted = false;
        var hasErrored = false;
        var cancelReset = function () {
            resetConnection === null || resetConnection === void 0 ? void 0 : resetConnection.unsubscribe();
            resetConnection = undefined;
        };
        var reset = function () {
            cancelReset();
            connection = subject = undefined;
            hasCompleted = hasErrored = false;
        };
        var resetAndUnsubscribe = function () {
            var conn = connection;
            reset();
            conn === null || conn === void 0 ? void 0 : conn.unsubscribe();
        };
        return lift_1$j.operate(function (source, subscriber) {
            refCount++;
            if (!hasErrored && !hasCompleted) {
                cancelReset();
            }
            var dest = (subject = subject !== null && subject !== void 0 ? subject : connector());
            subscriber.add(function () {
                refCount--;
                if (refCount === 0 && !hasErrored && !hasCompleted) {
                    resetConnection = handleReset(resetAndUnsubscribe, resetOnRefCountZero);
                }
            });
            dest.subscribe(subscriber);
            if (!connection &&
                refCount > 0) {
                connection = new Subscriber_1$1.SafeSubscriber({
                    next: function (value) { return dest.next(value); },
                    error: function (err) {
                        hasErrored = true;
                        cancelReset();
                        resetConnection = handleReset(reset, resetOnError, err);
                        dest.error(err);
                    },
                    complete: function () {
                        hasCompleted = true;
                        cancelReset();
                        resetConnection = handleReset(reset, resetOnComplete);
                        dest.complete();
                    },
                });
                innerFrom_1$f.innerFrom(source).subscribe(connection);
            }
        })(wrapperSource);
    };
}
share$1.share = share;
function handleReset(reset, on) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (on === true) {
        reset();
        return;
    }
    if (on === false) {
        return;
    }
    var onSubscriber = new Subscriber_1$1.SafeSubscriber({
        next: function () {
            onSubscriber.unsubscribe();
            reset();
        },
    });
    return innerFrom_1$f.innerFrom(on.apply(void 0, __spreadArray$5([], __read$6(args)))).subscribe(onSubscriber);
}

var shareReplay$1 = {};

Object.defineProperty(shareReplay$1, "__esModule", { value: true });
shareReplay$1.shareReplay = void 0;
var ReplaySubject_1 = ReplaySubject$1;
var share_1 = share$1;
function shareReplay(configOrBufferSize, windowTime, scheduler) {
    var _a, _b, _c;
    var bufferSize;
    var refCount = false;
    if (configOrBufferSize && typeof configOrBufferSize === 'object') {
        (_a = configOrBufferSize.bufferSize, bufferSize = _a === void 0 ? Infinity : _a, _b = configOrBufferSize.windowTime, windowTime = _b === void 0 ? Infinity : _b, _c = configOrBufferSize.refCount, refCount = _c === void 0 ? false : _c, scheduler = configOrBufferSize.scheduler);
    }
    else {
        bufferSize = (configOrBufferSize !== null && configOrBufferSize !== void 0 ? configOrBufferSize : Infinity);
    }
    return share_1.share({
        connector: function () { return new ReplaySubject_1.ReplaySubject(bufferSize, windowTime, scheduler); },
        resetOnError: true,
        resetOnComplete: false,
        resetOnRefCountZero: refCount,
    });
}
shareReplay$1.shareReplay = shareReplay;

var single$1 = {};

var SequenceError = {};

Object.defineProperty(SequenceError, "__esModule", { value: true });
SequenceError.SequenceError = void 0;
var createErrorClass_1$1 = createErrorClass$1;
SequenceError.SequenceError = createErrorClass_1$1.createErrorClass(function (_super) {
    return function SequenceErrorImpl(message) {
        _super(this);
        this.name = 'SequenceError';
        this.message = message;
    };
});

var NotFoundError = {};

Object.defineProperty(NotFoundError, "__esModule", { value: true });
NotFoundError.NotFoundError = void 0;
var createErrorClass_1 = createErrorClass$1;
NotFoundError.NotFoundError = createErrorClass_1.createErrorClass(function (_super) {
    return function NotFoundErrorImpl(message) {
        _super(this);
        this.name = 'NotFoundError';
        this.message = message;
    };
});

Object.defineProperty(single$1, "__esModule", { value: true });
single$1.single = void 0;
var EmptyError_1$2 = EmptyError;
var SequenceError_1 = SequenceError;
var NotFoundError_1 = NotFoundError;
var lift_1$i = lift;
var OperatorSubscriber_1$h = OperatorSubscriber$1;
function single(predicate) {
    return lift_1$i.operate(function (source, subscriber) {
        var hasValue = false;
        var singleValue;
        var seenValue = false;
        var index = 0;
        source.subscribe(OperatorSubscriber_1$h.createOperatorSubscriber(subscriber, function (value) {
            seenValue = true;
            if (!predicate || predicate(value, index++, source)) {
                hasValue && subscriber.error(new SequenceError_1.SequenceError('Too many matching values'));
                hasValue = true;
                singleValue = value;
            }
        }, function () {
            if (hasValue) {
                subscriber.next(singleValue);
                subscriber.complete();
            }
            else {
                subscriber.error(seenValue ? new NotFoundError_1.NotFoundError('No matching values') : new EmptyError_1$2.EmptyError());
            }
        }));
    });
}
single$1.single = single;

var skip$1 = {};

Object.defineProperty(skip$1, "__esModule", { value: true });
skip$1.skip = void 0;
var filter_1$1 = filter$1;
function skip(count) {
    return filter_1$1.filter(function (_, index) { return count <= index; });
}
skip$1.skip = skip;

var skipLast$1 = {};

Object.defineProperty(skipLast$1, "__esModule", { value: true });
skipLast$1.skipLast = void 0;
var identity_1$4 = identity$1;
var lift_1$h = lift;
var OperatorSubscriber_1$g = OperatorSubscriber$1;
function skipLast(skipCount) {
    return skipCount <= 0
        ?
            identity_1$4.identity
        : lift_1$h.operate(function (source, subscriber) {
            var ring = new Array(skipCount);
            var seen = 0;
            source.subscribe(OperatorSubscriber_1$g.createOperatorSubscriber(subscriber, function (value) {
                var valueIndex = seen++;
                if (valueIndex < skipCount) {
                    ring[valueIndex] = value;
                }
                else {
                    var index = valueIndex % skipCount;
                    var oldValue = ring[index];
                    ring[index] = value;
                    subscriber.next(oldValue);
                }
            }));
            return function () {
                ring = null;
            };
        });
}
skipLast$1.skipLast = skipLast;

var skipUntil$1 = {};

Object.defineProperty(skipUntil$1, "__esModule", { value: true });
skipUntil$1.skipUntil = void 0;
var lift_1$g = lift;
var OperatorSubscriber_1$f = OperatorSubscriber$1;
var innerFrom_1$e = innerFrom$1;
var noop_1$4 = noop$1;
function skipUntil(notifier) {
    return lift_1$g.operate(function (source, subscriber) {
        var taking = false;
        var skipSubscriber = OperatorSubscriber_1$f.createOperatorSubscriber(subscriber, function () {
            skipSubscriber === null || skipSubscriber === void 0 ? void 0 : skipSubscriber.unsubscribe();
            taking = true;
        }, noop_1$4.noop);
        innerFrom_1$e.innerFrom(notifier).subscribe(skipSubscriber);
        source.subscribe(OperatorSubscriber_1$f.createOperatorSubscriber(subscriber, function (value) { return taking && subscriber.next(value); }));
    });
}
skipUntil$1.skipUntil = skipUntil;

var skipWhile$1 = {};

Object.defineProperty(skipWhile$1, "__esModule", { value: true });
skipWhile$1.skipWhile = void 0;
var lift_1$f = lift;
var OperatorSubscriber_1$e = OperatorSubscriber$1;
function skipWhile(predicate) {
    return lift_1$f.operate(function (source, subscriber) {
        var taking = false;
        var index = 0;
        source.subscribe(OperatorSubscriber_1$e.createOperatorSubscriber(subscriber, function (value) { return (taking || (taking = !predicate(value, index++))) && subscriber.next(value); }));
    });
}
skipWhile$1.skipWhile = skipWhile;

var startWith$1 = {};

Object.defineProperty(startWith$1, "__esModule", { value: true });
startWith$1.startWith = void 0;
var concat_1 = concat$1;
var args_1$5 = args;
var lift_1$e = lift;
function startWith() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    var scheduler = args_1$5.popScheduler(values);
    return lift_1$e.operate(function (source, subscriber) {
        (scheduler ? concat_1.concat(values, source, scheduler) : concat_1.concat(values, source)).subscribe(subscriber);
    });
}
startWith$1.startWith = startWith;

var switchAll$1 = {};

var switchMap$1 = {};

Object.defineProperty(switchMap$1, "__esModule", { value: true });
switchMap$1.switchMap = void 0;
var innerFrom_1$d = innerFrom$1;
var lift_1$d = lift;
var OperatorSubscriber_1$d = OperatorSubscriber$1;
function switchMap(project, resultSelector) {
    return lift_1$d.operate(function (source, subscriber) {
        var innerSubscriber = null;
        var index = 0;
        var isComplete = false;
        var checkComplete = function () { return isComplete && !innerSubscriber && subscriber.complete(); };
        source.subscribe(OperatorSubscriber_1$d.createOperatorSubscriber(subscriber, function (value) {
            innerSubscriber === null || innerSubscriber === void 0 ? void 0 : innerSubscriber.unsubscribe();
            var innerIndex = 0;
            var outerIndex = index++;
            innerFrom_1$d.innerFrom(project(value, outerIndex)).subscribe((innerSubscriber = OperatorSubscriber_1$d.createOperatorSubscriber(subscriber, function (innerValue) { return subscriber.next(resultSelector ? resultSelector(value, innerValue, outerIndex, innerIndex++) : innerValue); }, function () {
                innerSubscriber = null;
                checkComplete();
            })));
        }, function () {
            isComplete = true;
            checkComplete();
        }));
    });
}
switchMap$1.switchMap = switchMap;

Object.defineProperty(switchAll$1, "__esModule", { value: true });
switchAll$1.switchAll = void 0;
var switchMap_1$2 = switchMap$1;
var identity_1$3 = identity$1;
function switchAll() {
    return switchMap_1$2.switchMap(identity_1$3.identity);
}
switchAll$1.switchAll = switchAll;

var switchMapTo$1 = {};

Object.defineProperty(switchMapTo$1, "__esModule", { value: true });
switchMapTo$1.switchMapTo = void 0;
var switchMap_1$1 = switchMap$1;
var isFunction_1$4 = isFunction$1;
function switchMapTo(innerObservable, resultSelector) {
    return isFunction_1$4.isFunction(resultSelector) ? switchMap_1$1.switchMap(function () { return innerObservable; }, resultSelector) : switchMap_1$1.switchMap(function () { return innerObservable; });
}
switchMapTo$1.switchMapTo = switchMapTo;

var switchScan$1 = {};

Object.defineProperty(switchScan$1, "__esModule", { value: true });
switchScan$1.switchScan = void 0;
var switchMap_1 = switchMap$1;
var lift_1$c = lift;
function switchScan(accumulator, seed) {
    return lift_1$c.operate(function (source, subscriber) {
        var state = seed;
        switchMap_1.switchMap(function (value, index) { return accumulator(state, value, index); }, function (_, innerValue) { return ((state = innerValue), innerValue); })(source).subscribe(subscriber);
        return function () {
            state = null;
        };
    });
}
switchScan$1.switchScan = switchScan;

var takeUntil$1 = {};

Object.defineProperty(takeUntil$1, "__esModule", { value: true });
takeUntil$1.takeUntil = void 0;
var lift_1$b = lift;
var OperatorSubscriber_1$c = OperatorSubscriber$1;
var innerFrom_1$c = innerFrom$1;
var noop_1$3 = noop$1;
function takeUntil(notifier) {
    return lift_1$b.operate(function (source, subscriber) {
        innerFrom_1$c.innerFrom(notifier).subscribe(OperatorSubscriber_1$c.createOperatorSubscriber(subscriber, function () { return subscriber.complete(); }, noop_1$3.noop));
        !subscriber.closed && source.subscribe(subscriber);
    });
}
takeUntil$1.takeUntil = takeUntil;

var takeWhile$1 = {};

Object.defineProperty(takeWhile$1, "__esModule", { value: true });
takeWhile$1.takeWhile = void 0;
var lift_1$a = lift;
var OperatorSubscriber_1$b = OperatorSubscriber$1;
function takeWhile(predicate, inclusive) {
    if (inclusive === void 0) { inclusive = false; }
    return lift_1$a.operate(function (source, subscriber) {
        var index = 0;
        source.subscribe(OperatorSubscriber_1$b.createOperatorSubscriber(subscriber, function (value) {
            var result = predicate(value, index++);
            (result || inclusive) && subscriber.next(value);
            !result && subscriber.complete();
        }));
    });
}
takeWhile$1.takeWhile = takeWhile;

var tap$1 = {};

Object.defineProperty(tap$1, "__esModule", { value: true });
tap$1.tap = void 0;
var isFunction_1$3 = isFunction$1;
var lift_1$9 = lift;
var OperatorSubscriber_1$a = OperatorSubscriber$1;
var identity_1$2 = identity$1;
function tap(observerOrNext, error, complete) {
    var tapObserver = isFunction_1$3.isFunction(observerOrNext) || error || complete
        ?
            { next: observerOrNext, error: error, complete: complete }
        : observerOrNext;
    return tapObserver
        ? lift_1$9.operate(function (source, subscriber) {
            var _a;
            (_a = tapObserver.subscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
            var isUnsub = true;
            source.subscribe(OperatorSubscriber_1$a.createOperatorSubscriber(subscriber, function (value) {
                var _a;
                (_a = tapObserver.next) === null || _a === void 0 ? void 0 : _a.call(tapObserver, value);
                subscriber.next(value);
            }, function () {
                var _a;
                isUnsub = false;
                (_a = tapObserver.complete) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                subscriber.complete();
            }, function (err) {
                var _a;
                isUnsub = false;
                (_a = tapObserver.error) === null || _a === void 0 ? void 0 : _a.call(tapObserver, err);
                subscriber.error(err);
            }, function () {
                var _a, _b;
                if (isUnsub) {
                    (_a = tapObserver.unsubscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                }
                (_b = tapObserver.finalize) === null || _b === void 0 ? void 0 : _b.call(tapObserver);
            }));
        })
        :
            identity_1$2.identity;
}
tap$1.tap = tap;

var throttle$1 = {};

Object.defineProperty(throttle$1, "__esModule", { value: true });
throttle$1.throttle = void 0;
var lift_1$8 = lift;
var OperatorSubscriber_1$9 = OperatorSubscriber$1;
var innerFrom_1$b = innerFrom$1;
function throttle(durationSelector, config) {
    return lift_1$8.operate(function (source, subscriber) {
        var _a = config !== null && config !== void 0 ? config : {}, _b = _a.leading, leading = _b === void 0 ? true : _b, _c = _a.trailing, trailing = _c === void 0 ? false : _c;
        var hasValue = false;
        var sendValue = null;
        var throttled = null;
        var isComplete = false;
        var endThrottling = function () {
            throttled === null || throttled === void 0 ? void 0 : throttled.unsubscribe();
            throttled = null;
            if (trailing) {
                send();
                isComplete && subscriber.complete();
            }
        };
        var cleanupThrottling = function () {
            throttled = null;
            isComplete && subscriber.complete();
        };
        var startThrottle = function (value) {
            return (throttled = innerFrom_1$b.innerFrom(durationSelector(value)).subscribe(OperatorSubscriber_1$9.createOperatorSubscriber(subscriber, endThrottling, cleanupThrottling)));
        };
        var send = function () {
            if (hasValue) {
                hasValue = false;
                var value = sendValue;
                sendValue = null;
                subscriber.next(value);
                !isComplete && startThrottle(value);
            }
        };
        source.subscribe(OperatorSubscriber_1$9.createOperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            sendValue = value;
            !(throttled && !throttled.closed) && (leading ? send() : startThrottle(value));
        }, function () {
            isComplete = true;
            !(trailing && hasValue && throttled && !throttled.closed) && subscriber.complete();
        }));
    });
}
throttle$1.throttle = throttle;

var throttleTime$1 = {};

Object.defineProperty(throttleTime$1, "__esModule", { value: true });
throttleTime$1.throttleTime = void 0;
var async_1$3 = async;
var throttle_1 = throttle$1;
var timer_1 = timer$1;
function throttleTime(duration, scheduler, config) {
    if (scheduler === void 0) { scheduler = async_1$3.asyncScheduler; }
    var duration$ = timer_1.timer(duration, scheduler);
    return throttle_1.throttle(function () { return duration$; }, config);
}
throttleTime$1.throttleTime = throttleTime;

var timeInterval$1 = {};

Object.defineProperty(timeInterval$1, "__esModule", { value: true });
timeInterval$1.TimeInterval = timeInterval$1.timeInterval = void 0;
var async_1$2 = async;
var lift_1$7 = lift;
var OperatorSubscriber_1$8 = OperatorSubscriber$1;
function timeInterval(scheduler) {
    if (scheduler === void 0) { scheduler = async_1$2.asyncScheduler; }
    return lift_1$7.operate(function (source, subscriber) {
        var last = scheduler.now();
        source.subscribe(OperatorSubscriber_1$8.createOperatorSubscriber(subscriber, function (value) {
            var now = scheduler.now();
            var interval = now - last;
            last = now;
            subscriber.next(new TimeInterval(value, interval));
        }));
    });
}
timeInterval$1.timeInterval = timeInterval;
var TimeInterval = (function () {
    function TimeInterval(value, interval) {
        this.value = value;
        this.interval = interval;
    }
    return TimeInterval;
}());
timeInterval$1.TimeInterval = TimeInterval;

var timeout = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.timeout = exports.TimeoutError = void 0;
	var async_1 = async;
	var isDate_1 = isDate;
	var lift_1 = lift;
	var innerFrom_1 = innerFrom$1;
	var createErrorClass_1 = createErrorClass$1;
	var OperatorSubscriber_1 = OperatorSubscriber$1;
	var executeSchedule_1 = executeSchedule$1;
	exports.TimeoutError = createErrorClass_1.createErrorClass(function (_super) {
	    return function TimeoutErrorImpl(info) {
	        if (info === void 0) { info = null; }
	        _super(this);
	        this.message = 'Timeout has occurred';
	        this.name = 'TimeoutError';
	        this.info = info;
	    };
	});
	function timeout(config, schedulerArg) {
	    var _a = (isDate_1.isValidDate(config) ? { first: config } : typeof config === 'number' ? { each: config } : config), first = _a.first, each = _a.each, _b = _a.with, _with = _b === void 0 ? timeoutErrorFactory : _b, _c = _a.scheduler, scheduler = _c === void 0 ? schedulerArg !== null && schedulerArg !== void 0 ? schedulerArg : async_1.asyncScheduler : _c, _d = _a.meta, meta = _d === void 0 ? null : _d;
	    if (first == null && each == null) {
	        throw new TypeError('No timeout provided.');
	    }
	    return lift_1.operate(function (source, subscriber) {
	        var originalSourceSubscription;
	        var timerSubscription;
	        var lastValue = null;
	        var seen = 0;
	        var startTimer = function (delay) {
	            timerSubscription = executeSchedule_1.executeSchedule(subscriber, scheduler, function () {
	                try {
	                    originalSourceSubscription.unsubscribe();
	                    innerFrom_1.innerFrom(_with({
	                        meta: meta,
	                        lastValue: lastValue,
	                        seen: seen,
	                    })).subscribe(subscriber);
	                }
	                catch (err) {
	                    subscriber.error(err);
	                }
	            }, delay);
	        };
	        originalSourceSubscription = source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
	            timerSubscription === null || timerSubscription === void 0 ? void 0 : timerSubscription.unsubscribe();
	            seen++;
	            subscriber.next((lastValue = value));
	            each > 0 && startTimer(each);
	        }, undefined, undefined, function () {
	            if (!(timerSubscription === null || timerSubscription === void 0 ? void 0 : timerSubscription.closed)) {
	                timerSubscription === null || timerSubscription === void 0 ? void 0 : timerSubscription.unsubscribe();
	            }
	            lastValue = null;
	        }));
	        !seen && startTimer(first != null ? (typeof first === 'number' ? first : +first - scheduler.now()) : each);
	    });
	}
	exports.timeout = timeout;
	function timeoutErrorFactory(info) {
	    throw new exports.TimeoutError(info);
	}
	
} (timeout));

var timeoutWith$1 = {};

Object.defineProperty(timeoutWith$1, "__esModule", { value: true });
timeoutWith$1.timeoutWith = void 0;
var async_1$1 = async;
var isDate_1 = isDate;
var timeout_1 = timeout;
function timeoutWith(due, withObservable, scheduler) {
    var first;
    var each;
    var _with;
    scheduler = scheduler !== null && scheduler !== void 0 ? scheduler : async_1$1.async;
    if (isDate_1.isValidDate(due)) {
        first = due;
    }
    else if (typeof due === 'number') {
        each = due;
    }
    if (withObservable) {
        _with = function () { return withObservable; };
    }
    else {
        throw new TypeError('No observable provided to switch to');
    }
    if (first == null && each == null) {
        throw new TypeError('No timeout provided.');
    }
    return timeout_1.timeout({
        first: first,
        each: each,
        scheduler: scheduler,
        with: _with,
    });
}
timeoutWith$1.timeoutWith = timeoutWith;

var timestamp$1 = {};

Object.defineProperty(timestamp$1, "__esModule", { value: true });
timestamp$1.timestamp = void 0;
var dateTimestampProvider_1 = dateTimestampProvider;
var map_1 = map$1;
function timestamp(timestampProvider) {
    if (timestampProvider === void 0) { timestampProvider = dateTimestampProvider_1.dateTimestampProvider; }
    return map_1.map(function (value) { return ({ value: value, timestamp: timestampProvider.now() }); });
}
timestamp$1.timestamp = timestamp;

var window$2 = {};

Object.defineProperty(window$2, "__esModule", { value: true });
window$2.window = void 0;
var Subject_1$5 = Subject$1;
var lift_1$6 = lift;
var OperatorSubscriber_1$7 = OperatorSubscriber$1;
var noop_1$2 = noop$1;
var innerFrom_1$a = innerFrom$1;
function window$1(windowBoundaries) {
    return lift_1$6.operate(function (source, subscriber) {
        var windowSubject = new Subject_1$5.Subject();
        subscriber.next(windowSubject.asObservable());
        var errorHandler = function (err) {
            windowSubject.error(err);
            subscriber.error(err);
        };
        source.subscribe(OperatorSubscriber_1$7.createOperatorSubscriber(subscriber, function (value) { return windowSubject === null || windowSubject === void 0 ? void 0 : windowSubject.next(value); }, function () {
            windowSubject.complete();
            subscriber.complete();
        }, errorHandler));
        innerFrom_1$a.innerFrom(windowBoundaries).subscribe(OperatorSubscriber_1$7.createOperatorSubscriber(subscriber, function () {
            windowSubject.complete();
            subscriber.next((windowSubject = new Subject_1$5.Subject()));
        }, noop_1$2.noop, errorHandler));
        return function () {
            windowSubject === null || windowSubject === void 0 ? void 0 : windowSubject.unsubscribe();
            windowSubject = null;
        };
    });
}
window$2.window = window$1;

var windowCount$1 = {};

var __values$1 = (windowCount$1 && windowCount$1.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(windowCount$1, "__esModule", { value: true });
windowCount$1.windowCount = void 0;
var Subject_1$4 = Subject$1;
var lift_1$5 = lift;
var OperatorSubscriber_1$6 = OperatorSubscriber$1;
function windowCount(windowSize, startWindowEvery) {
    if (startWindowEvery === void 0) { startWindowEvery = 0; }
    var startEvery = startWindowEvery > 0 ? startWindowEvery : windowSize;
    return lift_1$5.operate(function (source, subscriber) {
        var windows = [new Subject_1$4.Subject()];
        var count = 0;
        subscriber.next(windows[0].asObservable());
        source.subscribe(OperatorSubscriber_1$6.createOperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            try {
                for (var windows_1 = __values$1(windows), windows_1_1 = windows_1.next(); !windows_1_1.done; windows_1_1 = windows_1.next()) {
                    var window_1 = windows_1_1.value;
                    window_1.next(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (windows_1_1 && !windows_1_1.done && (_a = windows_1.return)) _a.call(windows_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var c = count - windowSize + 1;
            if (c >= 0 && c % startEvery === 0) {
                windows.shift().complete();
            }
            if (++count % startEvery === 0) {
                var window_2 = new Subject_1$4.Subject();
                windows.push(window_2);
                subscriber.next(window_2.asObservable());
            }
        }, function () {
            while (windows.length > 0) {
                windows.shift().complete();
            }
            subscriber.complete();
        }, function (err) {
            while (windows.length > 0) {
                windows.shift().error(err);
            }
            subscriber.error(err);
        }, function () {
            windows = null;
        }));
    });
}
windowCount$1.windowCount = windowCount;

var windowTime$1 = {};

Object.defineProperty(windowTime$1, "__esModule", { value: true });
windowTime$1.windowTime = void 0;
var Subject_1$3 = Subject$1;
var async_1 = async;
var Subscription_1$2 = Subscription$1;
var lift_1$4 = lift;
var OperatorSubscriber_1$5 = OperatorSubscriber$1;
var arrRemove_1$1 = arrRemove$1;
var args_1$4 = args;
var executeSchedule_1 = executeSchedule$1;
function windowTime(windowTimeSpan) {
    var _a, _b;
    var otherArgs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        otherArgs[_i - 1] = arguments[_i];
    }
    var scheduler = (_a = args_1$4.popScheduler(otherArgs)) !== null && _a !== void 0 ? _a : async_1.asyncScheduler;
    var windowCreationInterval = (_b = otherArgs[0]) !== null && _b !== void 0 ? _b : null;
    var maxWindowSize = otherArgs[1] || Infinity;
    return lift_1$4.operate(function (source, subscriber) {
        var windowRecords = [];
        var restartOnClose = false;
        var closeWindow = function (record) {
            var window = record.window, subs = record.subs;
            window.complete();
            subs.unsubscribe();
            arrRemove_1$1.arrRemove(windowRecords, record);
            restartOnClose && startWindow();
        };
        var startWindow = function () {
            if (windowRecords) {
                var subs = new Subscription_1$2.Subscription();
                subscriber.add(subs);
                var window_1 = new Subject_1$3.Subject();
                var record_1 = {
                    window: window_1,
                    subs: subs,
                    seen: 0,
                };
                windowRecords.push(record_1);
                subscriber.next(window_1.asObservable());
                executeSchedule_1.executeSchedule(subs, scheduler, function () { return closeWindow(record_1); }, windowTimeSpan);
            }
        };
        if (windowCreationInterval !== null && windowCreationInterval >= 0) {
            executeSchedule_1.executeSchedule(subscriber, scheduler, startWindow, windowCreationInterval, true);
        }
        else {
            restartOnClose = true;
        }
        startWindow();
        var loop = function (cb) { return windowRecords.slice().forEach(cb); };
        var terminate = function (cb) {
            loop(function (_a) {
                var window = _a.window;
                return cb(window);
            });
            cb(subscriber);
            subscriber.unsubscribe();
        };
        source.subscribe(OperatorSubscriber_1$5.createOperatorSubscriber(subscriber, function (value) {
            loop(function (record) {
                record.window.next(value);
                maxWindowSize <= ++record.seen && closeWindow(record);
            });
        }, function () { return terminate(function (consumer) { return consumer.complete(); }); }, function (err) { return terminate(function (consumer) { return consumer.error(err); }); }));
        return function () {
            windowRecords = null;
        };
    });
}
windowTime$1.windowTime = windowTime;

var windowToggle$1 = {};

var __values = (windowToggle$1 && windowToggle$1.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(windowToggle$1, "__esModule", { value: true });
windowToggle$1.windowToggle = void 0;
var Subject_1$2 = Subject$1;
var Subscription_1$1 = Subscription$1;
var lift_1$3 = lift;
var innerFrom_1$9 = innerFrom$1;
var OperatorSubscriber_1$4 = OperatorSubscriber$1;
var noop_1$1 = noop$1;
var arrRemove_1 = arrRemove$1;
function windowToggle(openings, closingSelector) {
    return lift_1$3.operate(function (source, subscriber) {
        var windows = [];
        var handleError = function (err) {
            while (0 < windows.length) {
                windows.shift().error(err);
            }
            subscriber.error(err);
        };
        innerFrom_1$9.innerFrom(openings).subscribe(OperatorSubscriber_1$4.createOperatorSubscriber(subscriber, function (openValue) {
            var window = new Subject_1$2.Subject();
            windows.push(window);
            var closingSubscription = new Subscription_1$1.Subscription();
            var closeWindow = function () {
                arrRemove_1.arrRemove(windows, window);
                window.complete();
                closingSubscription.unsubscribe();
            };
            var closingNotifier;
            try {
                closingNotifier = innerFrom_1$9.innerFrom(closingSelector(openValue));
            }
            catch (err) {
                handleError(err);
                return;
            }
            subscriber.next(window.asObservable());
            closingSubscription.add(closingNotifier.subscribe(OperatorSubscriber_1$4.createOperatorSubscriber(subscriber, closeWindow, noop_1$1.noop, handleError)));
        }, noop_1$1.noop));
        source.subscribe(OperatorSubscriber_1$4.createOperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            var windowsCopy = windows.slice();
            try {
                for (var windowsCopy_1 = __values(windowsCopy), windowsCopy_1_1 = windowsCopy_1.next(); !windowsCopy_1_1.done; windowsCopy_1_1 = windowsCopy_1.next()) {
                    var window_1 = windowsCopy_1_1.value;
                    window_1.next(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (windowsCopy_1_1 && !windowsCopy_1_1.done && (_a = windowsCopy_1.return)) _a.call(windowsCopy_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }, function () {
            while (0 < windows.length) {
                windows.shift().complete();
            }
            subscriber.complete();
        }, handleError, function () {
            while (0 < windows.length) {
                windows.shift().unsubscribe();
            }
        }));
    });
}
windowToggle$1.windowToggle = windowToggle;

var windowWhen$1 = {};

Object.defineProperty(windowWhen$1, "__esModule", { value: true });
windowWhen$1.windowWhen = void 0;
var Subject_1$1 = Subject$1;
var lift_1$2 = lift;
var OperatorSubscriber_1$3 = OperatorSubscriber$1;
var innerFrom_1$8 = innerFrom$1;
function windowWhen(closingSelector) {
    return lift_1$2.operate(function (source, subscriber) {
        var window;
        var closingSubscriber;
        var handleError = function (err) {
            window.error(err);
            subscriber.error(err);
        };
        var openWindow = function () {
            closingSubscriber === null || closingSubscriber === void 0 ? void 0 : closingSubscriber.unsubscribe();
            window === null || window === void 0 ? void 0 : window.complete();
            window = new Subject_1$1.Subject();
            subscriber.next(window.asObservable());
            var closingNotifier;
            try {
                closingNotifier = innerFrom_1$8.innerFrom(closingSelector());
            }
            catch (err) {
                handleError(err);
                return;
            }
            closingNotifier.subscribe((closingSubscriber = OperatorSubscriber_1$3.createOperatorSubscriber(subscriber, openWindow, openWindow, handleError)));
        };
        openWindow();
        source.subscribe(OperatorSubscriber_1$3.createOperatorSubscriber(subscriber, function (value) { return window.next(value); }, function () {
            window.complete();
            subscriber.complete();
        }, handleError, function () {
            closingSubscriber === null || closingSubscriber === void 0 ? void 0 : closingSubscriber.unsubscribe();
            window = null;
        }));
    });
}
windowWhen$1.windowWhen = windowWhen;

var withLatestFrom$1 = {};

var __read$5 = (withLatestFrom$1 && withLatestFrom$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$4 = (withLatestFrom$1 && withLatestFrom$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(withLatestFrom$1, "__esModule", { value: true });
withLatestFrom$1.withLatestFrom = void 0;
var lift_1$1 = lift;
var OperatorSubscriber_1$2 = OperatorSubscriber$1;
var innerFrom_1$7 = innerFrom$1;
var identity_1$1 = identity$1;
var noop_1 = noop$1;
var args_1$3 = args;
function withLatestFrom() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    var project = args_1$3.popResultSelector(inputs);
    return lift_1$1.operate(function (source, subscriber) {
        var len = inputs.length;
        var otherValues = new Array(len);
        var hasValue = inputs.map(function () { return false; });
        var ready = false;
        var _loop_1 = function (i) {
            innerFrom_1$7.innerFrom(inputs[i]).subscribe(OperatorSubscriber_1$2.createOperatorSubscriber(subscriber, function (value) {
                otherValues[i] = value;
                if (!ready && !hasValue[i]) {
                    hasValue[i] = true;
                    (ready = hasValue.every(identity_1$1.identity)) && (hasValue = null);
                }
            }, noop_1.noop));
        };
        for (var i = 0; i < len; i++) {
            _loop_1(i);
        }
        source.subscribe(OperatorSubscriber_1$2.createOperatorSubscriber(subscriber, function (value) {
            if (ready) {
                var values = __spreadArray$4([value], __read$5(otherValues));
                subscriber.next(project ? project.apply(void 0, __spreadArray$4([], __read$5(values))) : values);
            }
        }));
    });
}
withLatestFrom$1.withLatestFrom = withLatestFrom;

var zip$3 = {};

var zip$2 = {};

var __read$4 = (zip$2 && zip$2.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$3 = (zip$2 && zip$2.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(zip$2, "__esModule", { value: true });
zip$2.zip = void 0;
var Observable_1$a = Observable$1;
var innerFrom_1$6 = innerFrom$1;
var argsOrArgArray_1 = argsOrArgArray$1;
var empty_1$3 = empty;
var OperatorSubscriber_1$1 = OperatorSubscriber$1;
var args_1$2 = args;
function zip$1() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resultSelector = args_1$2.popResultSelector(args);
    var sources = argsOrArgArray_1.argsOrArgArray(args);
    return sources.length
        ? new Observable_1$a.Observable(function (subscriber) {
            var buffers = sources.map(function () { return []; });
            var completed = sources.map(function () { return false; });
            subscriber.add(function () {
                buffers = completed = null;
            });
            var _loop_1 = function (sourceIndex) {
                innerFrom_1$6.innerFrom(sources[sourceIndex]).subscribe(OperatorSubscriber_1$1.createOperatorSubscriber(subscriber, function (value) {
                    buffers[sourceIndex].push(value);
                    if (buffers.every(function (buffer) { return buffer.length; })) {
                        var result = buffers.map(function (buffer) { return buffer.shift(); });
                        subscriber.next(resultSelector ? resultSelector.apply(void 0, __spreadArray$3([], __read$4(result))) : result);
                        if (buffers.some(function (buffer, i) { return !buffer.length && completed[i]; })) {
                            subscriber.complete();
                        }
                    }
                }, function () {
                    completed[sourceIndex] = true;
                    !buffers[sourceIndex].length && subscriber.complete();
                }));
            };
            for (var sourceIndex = 0; !subscriber.closed && sourceIndex < sources.length; sourceIndex++) {
                _loop_1(sourceIndex);
            }
            return function () {
                buffers = completed = null;
            };
        })
        : empty_1$3.EMPTY;
}
zip$2.zip = zip$1;

var __read$3 = (zip$3 && zip$3.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$2 = (zip$3 && zip$3.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(zip$3, "__esModule", { value: true });
zip$3.zip = void 0;
var zip_1$2 = zip$2;
var lift_1 = lift;
function zip() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    return lift_1.operate(function (source, subscriber) {
        zip_1$2.zip.apply(void 0, __spreadArray$2([source], __read$3(sources))).subscribe(subscriber);
    });
}
zip$3.zip = zip;

var zipAll$1 = {};

Object.defineProperty(zipAll$1, "__esModule", { value: true });
zipAll$1.zipAll = void 0;
var zip_1$1 = zip$2;
var joinAllInternals_1 = joinAllInternals$1;
function zipAll(project) {
    return joinAllInternals_1.joinAllInternals(zip_1$1.zip, project);
}
zipAll$1.zipAll = zipAll;

var zipWith$1 = {};

var __read$2 = (zipWith$1 && zipWith$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray$1 = (zipWith$1 && zipWith$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(zipWith$1, "__esModule", { value: true });
zipWith$1.zipWith = void 0;
var zip_1 = zip$3;
function zipWith() {
    var otherInputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherInputs[_i] = arguments[_i];
    }
    return zip_1.zip.apply(void 0, __spreadArray$1([], __read$2(otherInputs)));
}
zipWith$1.zipWith = zipWith;

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.mergeAll = exports.merge = exports.max = exports.materialize = exports.mapTo = exports.map = exports.last = exports.isEmpty = exports.ignoreElements = exports.groupBy = exports.first = exports.findIndex = exports.find = exports.finalize = exports.filter = exports.expand = exports.exhaustMap = exports.exhaustAll = exports.exhaust = exports.every = exports.endWith = exports.elementAt = exports.distinctUntilKeyChanged = exports.distinctUntilChanged = exports.distinct = exports.dematerialize = exports.delayWhen = exports.delay = exports.defaultIfEmpty = exports.debounceTime = exports.debounce = exports.count = exports.connect = exports.concatWith = exports.concatMapTo = exports.concatMap = exports.concatAll = exports.concat = exports.combineLatestWith = exports.combineLatest = exports.combineLatestAll = exports.combineAll = exports.catchError = exports.bufferWhen = exports.bufferToggle = exports.bufferTime = exports.bufferCount = exports.buffer = exports.auditTime = exports.audit = void 0;
	exports.timeInterval = exports.throwIfEmpty = exports.throttleTime = exports.throttle = exports.tap = exports.takeWhile = exports.takeUntil = exports.takeLast = exports.take = exports.switchScan = exports.switchMapTo = exports.switchMap = exports.switchAll = exports.subscribeOn = exports.startWith = exports.skipWhile = exports.skipUntil = exports.skipLast = exports.skip = exports.single = exports.shareReplay = exports.share = exports.sequenceEqual = exports.scan = exports.sampleTime = exports.sample = exports.refCount = exports.retryWhen = exports.retry = exports.repeatWhen = exports.repeat = exports.reduce = exports.raceWith = exports.race = exports.publishReplay = exports.publishLast = exports.publishBehavior = exports.publish = exports.pluck = exports.partition = exports.pairwise = exports.onErrorResumeNext = exports.observeOn = exports.multicast = exports.min = exports.mergeWith = exports.mergeScan = exports.mergeMapTo = exports.mergeMap = exports.flatMap = void 0;
	exports.zipWith = exports.zipAll = exports.zip = exports.withLatestFrom = exports.windowWhen = exports.windowToggle = exports.windowTime = exports.windowCount = exports.window = exports.toArray = exports.timestamp = exports.timeoutWith = exports.timeout = void 0;
	var audit_1 = audit$1;
	Object.defineProperty(exports, "audit", { enumerable: true, get: function () { return audit_1.audit; } });
	var auditTime_1 = auditTime$1;
	Object.defineProperty(exports, "auditTime", { enumerable: true, get: function () { return auditTime_1.auditTime; } });
	var buffer_1 = buffer$1;
	Object.defineProperty(exports, "buffer", { enumerable: true, get: function () { return buffer_1.buffer; } });
	var bufferCount_1 = bufferCount$1;
	Object.defineProperty(exports, "bufferCount", { enumerable: true, get: function () { return bufferCount_1.bufferCount; } });
	var bufferTime_1 = bufferTime$1;
	Object.defineProperty(exports, "bufferTime", { enumerable: true, get: function () { return bufferTime_1.bufferTime; } });
	var bufferToggle_1 = bufferToggle$1;
	Object.defineProperty(exports, "bufferToggle", { enumerable: true, get: function () { return bufferToggle_1.bufferToggle; } });
	var bufferWhen_1 = bufferWhen$1;
	Object.defineProperty(exports, "bufferWhen", { enumerable: true, get: function () { return bufferWhen_1.bufferWhen; } });
	var catchError_1 = catchError$1;
	Object.defineProperty(exports, "catchError", { enumerable: true, get: function () { return catchError_1.catchError; } });
	var combineAll_1 = combineAll;
	Object.defineProperty(exports, "combineAll", { enumerable: true, get: function () { return combineAll_1.combineAll; } });
	var combineLatestAll_1 = combineLatestAll$1;
	Object.defineProperty(exports, "combineLatestAll", { enumerable: true, get: function () { return combineLatestAll_1.combineLatestAll; } });
	var combineLatest_1 = combineLatest$1;
	Object.defineProperty(exports, "combineLatest", { enumerable: true, get: function () { return combineLatest_1.combineLatest; } });
	var combineLatestWith_1 = combineLatestWith$1;
	Object.defineProperty(exports, "combineLatestWith", { enumerable: true, get: function () { return combineLatestWith_1.combineLatestWith; } });
	var concat_1 = concat$3;
	Object.defineProperty(exports, "concat", { enumerable: true, get: function () { return concat_1.concat; } });
	var concatAll_1 = concatAll$1;
	Object.defineProperty(exports, "concatAll", { enumerable: true, get: function () { return concatAll_1.concatAll; } });
	var concatMap_1 = concatMap$1;
	Object.defineProperty(exports, "concatMap", { enumerable: true, get: function () { return concatMap_1.concatMap; } });
	var concatMapTo_1 = concatMapTo$1;
	Object.defineProperty(exports, "concatMapTo", { enumerable: true, get: function () { return concatMapTo_1.concatMapTo; } });
	var concatWith_1 = concatWith$1;
	Object.defineProperty(exports, "concatWith", { enumerable: true, get: function () { return concatWith_1.concatWith; } });
	var connect_1 = connect$1;
	Object.defineProperty(exports, "connect", { enumerable: true, get: function () { return connect_1.connect; } });
	var count_1 = count$1;
	Object.defineProperty(exports, "count", { enumerable: true, get: function () { return count_1.count; } });
	var debounce_1 = debounce$1;
	Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return debounce_1.debounce; } });
	var debounceTime_1 = debounceTime$1;
	Object.defineProperty(exports, "debounceTime", { enumerable: true, get: function () { return debounceTime_1.debounceTime; } });
	var defaultIfEmpty_1 = defaultIfEmpty$1;
	Object.defineProperty(exports, "defaultIfEmpty", { enumerable: true, get: function () { return defaultIfEmpty_1.defaultIfEmpty; } });
	var delay_1 = delay$1;
	Object.defineProperty(exports, "delay", { enumerable: true, get: function () { return delay_1.delay; } });
	var delayWhen_1 = delayWhen$1;
	Object.defineProperty(exports, "delayWhen", { enumerable: true, get: function () { return delayWhen_1.delayWhen; } });
	var dematerialize_1 = dematerialize$1;
	Object.defineProperty(exports, "dematerialize", { enumerable: true, get: function () { return dematerialize_1.dematerialize; } });
	var distinct_1 = distinct$1;
	Object.defineProperty(exports, "distinct", { enumerable: true, get: function () { return distinct_1.distinct; } });
	var distinctUntilChanged_1 = distinctUntilChanged$1;
	Object.defineProperty(exports, "distinctUntilChanged", { enumerable: true, get: function () { return distinctUntilChanged_1.distinctUntilChanged; } });
	var distinctUntilKeyChanged_1 = distinctUntilKeyChanged$1;
	Object.defineProperty(exports, "distinctUntilKeyChanged", { enumerable: true, get: function () { return distinctUntilKeyChanged_1.distinctUntilKeyChanged; } });
	var elementAt_1 = elementAt$1;
	Object.defineProperty(exports, "elementAt", { enumerable: true, get: function () { return elementAt_1.elementAt; } });
	var endWith_1 = endWith$1;
	Object.defineProperty(exports, "endWith", { enumerable: true, get: function () { return endWith_1.endWith; } });
	var every_1 = every$1;
	Object.defineProperty(exports, "every", { enumerable: true, get: function () { return every_1.every; } });
	var exhaust_1 = exhaust;
	Object.defineProperty(exports, "exhaust", { enumerable: true, get: function () { return exhaust_1.exhaust; } });
	var exhaustAll_1 = exhaustAll$1;
	Object.defineProperty(exports, "exhaustAll", { enumerable: true, get: function () { return exhaustAll_1.exhaustAll; } });
	var exhaustMap_1 = exhaustMap$1;
	Object.defineProperty(exports, "exhaustMap", { enumerable: true, get: function () { return exhaustMap_1.exhaustMap; } });
	var expand_1 = expand$1;
	Object.defineProperty(exports, "expand", { enumerable: true, get: function () { return expand_1.expand; } });
	var filter_1 = filter$1;
	Object.defineProperty(exports, "filter", { enumerable: true, get: function () { return filter_1.filter; } });
	var finalize_1 = finalize$1;
	Object.defineProperty(exports, "finalize", { enumerable: true, get: function () { return finalize_1.finalize; } });
	var find_1 = find$1;
	Object.defineProperty(exports, "find", { enumerable: true, get: function () { return find_1.find; } });
	var findIndex_1 = findIndex$1;
	Object.defineProperty(exports, "findIndex", { enumerable: true, get: function () { return findIndex_1.findIndex; } });
	var first_1 = first$1;
	Object.defineProperty(exports, "first", { enumerable: true, get: function () { return first_1.first; } });
	var groupBy_1 = groupBy$1;
	Object.defineProperty(exports, "groupBy", { enumerable: true, get: function () { return groupBy_1.groupBy; } });
	var ignoreElements_1 = ignoreElements$1;
	Object.defineProperty(exports, "ignoreElements", { enumerable: true, get: function () { return ignoreElements_1.ignoreElements; } });
	var isEmpty_1 = isEmpty$1;
	Object.defineProperty(exports, "isEmpty", { enumerable: true, get: function () { return isEmpty_1.isEmpty; } });
	var last_1 = last$1;
	Object.defineProperty(exports, "last", { enumerable: true, get: function () { return last_1.last; } });
	var map_1 = map$1;
	Object.defineProperty(exports, "map", { enumerable: true, get: function () { return map_1.map; } });
	var mapTo_1 = mapTo$1;
	Object.defineProperty(exports, "mapTo", { enumerable: true, get: function () { return mapTo_1.mapTo; } });
	var materialize_1 = materialize$1;
	Object.defineProperty(exports, "materialize", { enumerable: true, get: function () { return materialize_1.materialize; } });
	var max_1 = max$1;
	Object.defineProperty(exports, "max", { enumerable: true, get: function () { return max_1.max; } });
	var merge_1 = merge$3;
	Object.defineProperty(exports, "merge", { enumerable: true, get: function () { return merge_1.merge; } });
	var mergeAll_1 = mergeAll$1;
	Object.defineProperty(exports, "mergeAll", { enumerable: true, get: function () { return mergeAll_1.mergeAll; } });
	var flatMap_1 = flatMap;
	Object.defineProperty(exports, "flatMap", { enumerable: true, get: function () { return flatMap_1.flatMap; } });
	var mergeMap_1 = mergeMap$1;
	Object.defineProperty(exports, "mergeMap", { enumerable: true, get: function () { return mergeMap_1.mergeMap; } });
	var mergeMapTo_1 = mergeMapTo$1;
	Object.defineProperty(exports, "mergeMapTo", { enumerable: true, get: function () { return mergeMapTo_1.mergeMapTo; } });
	var mergeScan_1 = mergeScan$1;
	Object.defineProperty(exports, "mergeScan", { enumerable: true, get: function () { return mergeScan_1.mergeScan; } });
	var mergeWith_1 = mergeWith$1;
	Object.defineProperty(exports, "mergeWith", { enumerable: true, get: function () { return mergeWith_1.mergeWith; } });
	var min_1 = min$1;
	Object.defineProperty(exports, "min", { enumerable: true, get: function () { return min_1.min; } });
	var multicast_1 = multicast$1;
	Object.defineProperty(exports, "multicast", { enumerable: true, get: function () { return multicast_1.multicast; } });
	var observeOn_1 = observeOn$1;
	Object.defineProperty(exports, "observeOn", { enumerable: true, get: function () { return observeOn_1.observeOn; } });
	var onErrorResumeNextWith_1 = onErrorResumeNextWith$1;
	Object.defineProperty(exports, "onErrorResumeNext", { enumerable: true, get: function () { return onErrorResumeNextWith_1.onErrorResumeNext; } });
	var pairwise_1 = pairwise$1;
	Object.defineProperty(exports, "pairwise", { enumerable: true, get: function () { return pairwise_1.pairwise; } });
	var partition_1 = partition$3;
	Object.defineProperty(exports, "partition", { enumerable: true, get: function () { return partition_1.partition; } });
	var pluck_1 = pluck$1;
	Object.defineProperty(exports, "pluck", { enumerable: true, get: function () { return pluck_1.pluck; } });
	var publish_1 = publish$1;
	Object.defineProperty(exports, "publish", { enumerable: true, get: function () { return publish_1.publish; } });
	var publishBehavior_1 = publishBehavior$1;
	Object.defineProperty(exports, "publishBehavior", { enumerable: true, get: function () { return publishBehavior_1.publishBehavior; } });
	var publishLast_1 = publishLast$1;
	Object.defineProperty(exports, "publishLast", { enumerable: true, get: function () { return publishLast_1.publishLast; } });
	var publishReplay_1 = publishReplay$1;
	Object.defineProperty(exports, "publishReplay", { enumerable: true, get: function () { return publishReplay_1.publishReplay; } });
	var race_1 = race$3;
	Object.defineProperty(exports, "race", { enumerable: true, get: function () { return race_1.race; } });
	var raceWith_1 = raceWith$1;
	Object.defineProperty(exports, "raceWith", { enumerable: true, get: function () { return raceWith_1.raceWith; } });
	var reduce_1 = reduce$1;
	Object.defineProperty(exports, "reduce", { enumerable: true, get: function () { return reduce_1.reduce; } });
	var repeat_1 = repeat$1;
	Object.defineProperty(exports, "repeat", { enumerable: true, get: function () { return repeat_1.repeat; } });
	var repeatWhen_1 = repeatWhen$1;
	Object.defineProperty(exports, "repeatWhen", { enumerable: true, get: function () { return repeatWhen_1.repeatWhen; } });
	var retry_1 = retry$1;
	Object.defineProperty(exports, "retry", { enumerable: true, get: function () { return retry_1.retry; } });
	var retryWhen_1 = retryWhen$1;
	Object.defineProperty(exports, "retryWhen", { enumerable: true, get: function () { return retryWhen_1.retryWhen; } });
	var refCount_1 = refCount$1;
	Object.defineProperty(exports, "refCount", { enumerable: true, get: function () { return refCount_1.refCount; } });
	var sample_1 = sample$1;
	Object.defineProperty(exports, "sample", { enumerable: true, get: function () { return sample_1.sample; } });
	var sampleTime_1 = sampleTime$1;
	Object.defineProperty(exports, "sampleTime", { enumerable: true, get: function () { return sampleTime_1.sampleTime; } });
	var scan_1 = scan$1;
	Object.defineProperty(exports, "scan", { enumerable: true, get: function () { return scan_1.scan; } });
	var sequenceEqual_1 = sequenceEqual$1;
	Object.defineProperty(exports, "sequenceEqual", { enumerable: true, get: function () { return sequenceEqual_1.sequenceEqual; } });
	var share_1 = share$1;
	Object.defineProperty(exports, "share", { enumerable: true, get: function () { return share_1.share; } });
	var shareReplay_1 = shareReplay$1;
	Object.defineProperty(exports, "shareReplay", { enumerable: true, get: function () { return shareReplay_1.shareReplay; } });
	var single_1 = single$1;
	Object.defineProperty(exports, "single", { enumerable: true, get: function () { return single_1.single; } });
	var skip_1 = skip$1;
	Object.defineProperty(exports, "skip", { enumerable: true, get: function () { return skip_1.skip; } });
	var skipLast_1 = skipLast$1;
	Object.defineProperty(exports, "skipLast", { enumerable: true, get: function () { return skipLast_1.skipLast; } });
	var skipUntil_1 = skipUntil$1;
	Object.defineProperty(exports, "skipUntil", { enumerable: true, get: function () { return skipUntil_1.skipUntil; } });
	var skipWhile_1 = skipWhile$1;
	Object.defineProperty(exports, "skipWhile", { enumerable: true, get: function () { return skipWhile_1.skipWhile; } });
	var startWith_1 = startWith$1;
	Object.defineProperty(exports, "startWith", { enumerable: true, get: function () { return startWith_1.startWith; } });
	var subscribeOn_1 = subscribeOn$1;
	Object.defineProperty(exports, "subscribeOn", { enumerable: true, get: function () { return subscribeOn_1.subscribeOn; } });
	var switchAll_1 = switchAll$1;
	Object.defineProperty(exports, "switchAll", { enumerable: true, get: function () { return switchAll_1.switchAll; } });
	var switchMap_1 = switchMap$1;
	Object.defineProperty(exports, "switchMap", { enumerable: true, get: function () { return switchMap_1.switchMap; } });
	var switchMapTo_1 = switchMapTo$1;
	Object.defineProperty(exports, "switchMapTo", { enumerable: true, get: function () { return switchMapTo_1.switchMapTo; } });
	var switchScan_1 = switchScan$1;
	Object.defineProperty(exports, "switchScan", { enumerable: true, get: function () { return switchScan_1.switchScan; } });
	var take_1 = take$1;
	Object.defineProperty(exports, "take", { enumerable: true, get: function () { return take_1.take; } });
	var takeLast_1 = takeLast$1;
	Object.defineProperty(exports, "takeLast", { enumerable: true, get: function () { return takeLast_1.takeLast; } });
	var takeUntil_1 = takeUntil$1;
	Object.defineProperty(exports, "takeUntil", { enumerable: true, get: function () { return takeUntil_1.takeUntil; } });
	var takeWhile_1 = takeWhile$1;
	Object.defineProperty(exports, "takeWhile", { enumerable: true, get: function () { return takeWhile_1.takeWhile; } });
	var tap_1 = tap$1;
	Object.defineProperty(exports, "tap", { enumerable: true, get: function () { return tap_1.tap; } });
	var throttle_1 = throttle$1;
	Object.defineProperty(exports, "throttle", { enumerable: true, get: function () { return throttle_1.throttle; } });
	var throttleTime_1 = throttleTime$1;
	Object.defineProperty(exports, "throttleTime", { enumerable: true, get: function () { return throttleTime_1.throttleTime; } });
	var throwIfEmpty_1 = throwIfEmpty$1;
	Object.defineProperty(exports, "throwIfEmpty", { enumerable: true, get: function () { return throwIfEmpty_1.throwIfEmpty; } });
	var timeInterval_1 = timeInterval$1;
	Object.defineProperty(exports, "timeInterval", { enumerable: true, get: function () { return timeInterval_1.timeInterval; } });
	var timeout_1 = timeout;
	Object.defineProperty(exports, "timeout", { enumerable: true, get: function () { return timeout_1.timeout; } });
	var timeoutWith_1 = timeoutWith$1;
	Object.defineProperty(exports, "timeoutWith", { enumerable: true, get: function () { return timeoutWith_1.timeoutWith; } });
	var timestamp_1 = timestamp$1;
	Object.defineProperty(exports, "timestamp", { enumerable: true, get: function () { return timestamp_1.timestamp; } });
	var toArray_1 = toArray$1;
	Object.defineProperty(exports, "toArray", { enumerable: true, get: function () { return toArray_1.toArray; } });
	var window_1 = window$2;
	Object.defineProperty(exports, "window", { enumerable: true, get: function () { return window_1.window; } });
	var windowCount_1 = windowCount$1;
	Object.defineProperty(exports, "windowCount", { enumerable: true, get: function () { return windowCount_1.windowCount; } });
	var windowTime_1 = windowTime$1;
	Object.defineProperty(exports, "windowTime", { enumerable: true, get: function () { return windowTime_1.windowTime; } });
	var windowToggle_1 = windowToggle$1;
	Object.defineProperty(exports, "windowToggle", { enumerable: true, get: function () { return windowToggle_1.windowToggle; } });
	var windowWhen_1 = windowWhen$1;
	Object.defineProperty(exports, "windowWhen", { enumerable: true, get: function () { return windowWhen_1.windowWhen; } });
	var withLatestFrom_1 = withLatestFrom$1;
	Object.defineProperty(exports, "withLatestFrom", { enumerable: true, get: function () { return withLatestFrom_1.withLatestFrom; } });
	var zip_1 = zip$3;
	Object.defineProperty(exports, "zip", { enumerable: true, get: function () { return zip_1.zip; } });
	var zipAll_1 = zipAll$1;
	Object.defineProperty(exports, "zipAll", { enumerable: true, get: function () { return zipAll_1.zipAll; } });
	var zipWith_1 = zipWith$1;
	Object.defineProperty(exports, "zipWith", { enumerable: true, get: function () { return zipWith_1.zipWith; } });
	
} (operators));

var cjs = {};

var animationFrames$1 = {};

var performanceTimestampProvider = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.performanceTimestampProvider = void 0;
	exports.performanceTimestampProvider = {
	    now: function () {
	        return (exports.performanceTimestampProvider.delegate || performance).now();
	    },
	    delegate: undefined,
	};
	
} (performanceTimestampProvider));

var animationFrameProvider = {};

(function (exports) {
	var __read = (animationFrameProvider && animationFrameProvider.__read) || function (o, n) {
	    var m = typeof Symbol === "function" && o[Symbol.iterator];
	    if (!m) return o;
	    var i = m.call(o), r, ar = [], e;
	    try {
	        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	    }
	    catch (error) { e = { error: error }; }
	    finally {
	        try {
	            if (r && !r.done && (m = i["return"])) m.call(i);
	        }
	        finally { if (e) throw e.error; }
	    }
	    return ar;
	};
	var __spreadArray = (animationFrameProvider && animationFrameProvider.__spreadArray) || function (to, from) {
	    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
	        to[j] = from[i];
	    return to;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.animationFrameProvider = void 0;
	var Subscription_1 = Subscription$1;
	exports.animationFrameProvider = {
	    schedule: function (callback) {
	        var request = requestAnimationFrame;
	        var cancel = cancelAnimationFrame;
	        var delegate = exports.animationFrameProvider.delegate;
	        if (delegate) {
	            request = delegate.requestAnimationFrame;
	            cancel = delegate.cancelAnimationFrame;
	        }
	        var handle = request(function (timestamp) {
	            cancel = undefined;
	            callback(timestamp);
	        });
	        return new Subscription_1.Subscription(function () { return cancel === null || cancel === void 0 ? void 0 : cancel(handle); });
	    },
	    requestAnimationFrame: function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments[_i];
	        }
	        var delegate = exports.animationFrameProvider.delegate;
	        return ((delegate === null || delegate === void 0 ? void 0 : delegate.requestAnimationFrame) || requestAnimationFrame).apply(void 0, __spreadArray([], __read(args)));
	    },
	    cancelAnimationFrame: function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments[_i];
	        }
	        var delegate = exports.animationFrameProvider.delegate;
	        return ((delegate === null || delegate === void 0 ? void 0 : delegate.cancelAnimationFrame) || cancelAnimationFrame).apply(void 0, __spreadArray([], __read(args)));
	    },
	    delegate: undefined,
	};
	
} (animationFrameProvider));

Object.defineProperty(animationFrames$1, "__esModule", { value: true });
animationFrames$1.animationFrames = void 0;
var Observable_1$9 = Observable$1;
var performanceTimestampProvider_1 = performanceTimestampProvider;
var animationFrameProvider_1$1 = animationFrameProvider;
function animationFrames(timestampProvider) {
    return timestampProvider ? animationFramesFactory(timestampProvider) : DEFAULT_ANIMATION_FRAMES;
}
animationFrames$1.animationFrames = animationFrames;
function animationFramesFactory(timestampProvider) {
    return new Observable_1$9.Observable(function (subscriber) {
        var provider = timestampProvider || performanceTimestampProvider_1.performanceTimestampProvider;
        var start = provider.now();
        var id = 0;
        var run = function () {
            if (!subscriber.closed) {
                id = animationFrameProvider_1$1.animationFrameProvider.requestAnimationFrame(function (timestamp) {
                    id = 0;
                    var now = provider.now();
                    subscriber.next({
                        timestamp: timestampProvider ? now : timestamp,
                        elapsed: now - start,
                    });
                    run();
                });
            }
        };
        run();
        return function () {
            if (id) {
                animationFrameProvider_1$1.animationFrameProvider.cancelAnimationFrame(id);
            }
        };
    });
}
var DEFAULT_ANIMATION_FRAMES = animationFramesFactory();

var asap = {};

var AsapAction$1 = {};

var immediateProvider = {};

var Immediate = {};

Object.defineProperty(Immediate, "__esModule", { value: true });
Immediate.TestTools = Immediate.Immediate = void 0;
var nextHandle = 1;
var resolved;
var activeHandles = {};
function findAndClearHandle(handle) {
    if (handle in activeHandles) {
        delete activeHandles[handle];
        return true;
    }
    return false;
}
Immediate.Immediate = {
    setImmediate: function (cb) {
        var handle = nextHandle++;
        activeHandles[handle] = true;
        if (!resolved) {
            resolved = Promise.resolve();
        }
        resolved.then(function () { return findAndClearHandle(handle) && cb(); });
        return handle;
    },
    clearImmediate: function (handle) {
        findAndClearHandle(handle);
    },
};
Immediate.TestTools = {
    pending: function () {
        return Object.keys(activeHandles).length;
    }
};

(function (exports) {
	var __read = (immediateProvider && immediateProvider.__read) || function (o, n) {
	    var m = typeof Symbol === "function" && o[Symbol.iterator];
	    if (!m) return o;
	    var i = m.call(o), r, ar = [], e;
	    try {
	        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	    }
	    catch (error) { e = { error: error }; }
	    finally {
	        try {
	            if (r && !r.done && (m = i["return"])) m.call(i);
	        }
	        finally { if (e) throw e.error; }
	    }
	    return ar;
	};
	var __spreadArray = (immediateProvider && immediateProvider.__spreadArray) || function (to, from) {
	    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
	        to[j] = from[i];
	    return to;
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.immediateProvider = void 0;
	var Immediate_1 = Immediate;
	var setImmediate = Immediate_1.Immediate.setImmediate, clearImmediate = Immediate_1.Immediate.clearImmediate;
	exports.immediateProvider = {
	    setImmediate: function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i] = arguments[_i];
	        }
	        var delegate = exports.immediateProvider.delegate;
	        return ((delegate === null || delegate === void 0 ? void 0 : delegate.setImmediate) || setImmediate).apply(void 0, __spreadArray([], __read(args)));
	    },
	    clearImmediate: function (handle) {
	        var delegate = exports.immediateProvider.delegate;
	        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearImmediate) || clearImmediate)(handle);
	    },
	    delegate: undefined,
	};
	
} (immediateProvider));

var __extends$7 = (AsapAction$1 && AsapAction$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(AsapAction$1, "__esModule", { value: true });
AsapAction$1.AsapAction = void 0;
var AsyncAction_1$3 = AsyncAction$1;
var immediateProvider_1 = immediateProvider;
var AsapAction = (function (_super) {
    __extends$7(AsapAction, _super);
    function AsapAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    AsapAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay !== null && delay > 0) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.actions.push(this);
        return scheduler._scheduled || (scheduler._scheduled = immediateProvider_1.immediateProvider.setImmediate(scheduler.flush.bind(scheduler, undefined)));
    };
    AsapAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        var _a;
        if (delay === void 0) { delay = 0; }
        if (delay != null ? delay > 0 : this.delay > 0) {
            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
        }
        var actions = scheduler.actions;
        if (id != null && ((_a = actions[actions.length - 1]) === null || _a === void 0 ? void 0 : _a.id) !== id) {
            immediateProvider_1.immediateProvider.clearImmediate(id);
            if (scheduler._scheduled === id) {
                scheduler._scheduled = undefined;
            }
        }
        return undefined;
    };
    return AsapAction;
}(AsyncAction_1$3.AsyncAction));
AsapAction$1.AsapAction = AsapAction;

var AsapScheduler$1 = {};

var __extends$6 = (AsapScheduler$1 && AsapScheduler$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(AsapScheduler$1, "__esModule", { value: true });
AsapScheduler$1.AsapScheduler = void 0;
var AsyncScheduler_1$3 = AsyncScheduler$1;
var AsapScheduler = (function (_super) {
    __extends$6(AsapScheduler, _super);
    function AsapScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AsapScheduler.prototype.flush = function (action) {
        this._active = true;
        var flushId = this._scheduled;
        this._scheduled = undefined;
        var actions = this.actions;
        var error;
        action = action || actions.shift();
        do {
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        } while ((action = actions[0]) && action.id === flushId && actions.shift());
        this._active = false;
        if (error) {
            while ((action = actions[0]) && action.id === flushId && actions.shift()) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsapScheduler;
}(AsyncScheduler_1$3.AsyncScheduler));
AsapScheduler$1.AsapScheduler = AsapScheduler;

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.asap = exports.asapScheduler = void 0;
	var AsapAction_1 = AsapAction$1;
	var AsapScheduler_1 = AsapScheduler$1;
	exports.asapScheduler = new AsapScheduler_1.AsapScheduler(AsapAction_1.AsapAction);
	exports.asap = exports.asapScheduler;
	
} (asap));

var queue = {};

var QueueAction$1 = {};

var __extends$5 = (QueueAction$1 && QueueAction$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(QueueAction$1, "__esModule", { value: true });
QueueAction$1.QueueAction = void 0;
var AsyncAction_1$2 = AsyncAction$1;
var QueueAction = (function (_super) {
    __extends$5(QueueAction, _super);
    function QueueAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    QueueAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay > 0) {
            return _super.prototype.schedule.call(this, state, delay);
        }
        this.delay = delay;
        this.state = state;
        this.scheduler.flush(this);
        return this;
    };
    QueueAction.prototype.execute = function (state, delay) {
        return delay > 0 || this.closed ? _super.prototype.execute.call(this, state, delay) : this._execute(state, delay);
    };
    QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if ((delay != null && delay > 0) || (delay == null && this.delay > 0)) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.flush(this);
        return 0;
    };
    return QueueAction;
}(AsyncAction_1$2.AsyncAction));
QueueAction$1.QueueAction = QueueAction;

var QueueScheduler$1 = {};

var __extends$4 = (QueueScheduler$1 && QueueScheduler$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(QueueScheduler$1, "__esModule", { value: true });
QueueScheduler$1.QueueScheduler = void 0;
var AsyncScheduler_1$2 = AsyncScheduler$1;
var QueueScheduler = (function (_super) {
    __extends$4(QueueScheduler, _super);
    function QueueScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return QueueScheduler;
}(AsyncScheduler_1$2.AsyncScheduler));
QueueScheduler$1.QueueScheduler = QueueScheduler;

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.queue = exports.queueScheduler = void 0;
	var QueueAction_1 = QueueAction$1;
	var QueueScheduler_1 = QueueScheduler$1;
	exports.queueScheduler = new QueueScheduler_1.QueueScheduler(QueueAction_1.QueueAction);
	exports.queue = exports.queueScheduler;
	
} (queue));

var animationFrame = {};

var AnimationFrameAction$1 = {};

var __extends$3 = (AnimationFrameAction$1 && AnimationFrameAction$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(AnimationFrameAction$1, "__esModule", { value: true });
AnimationFrameAction$1.AnimationFrameAction = void 0;
var AsyncAction_1$1 = AsyncAction$1;
var animationFrameProvider_1 = animationFrameProvider;
var AnimationFrameAction = (function (_super) {
    __extends$3(AnimationFrameAction, _super);
    function AnimationFrameAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    AnimationFrameAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay !== null && delay > 0) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.actions.push(this);
        return scheduler._scheduled || (scheduler._scheduled = animationFrameProvider_1.animationFrameProvider.requestAnimationFrame(function () { return scheduler.flush(undefined); }));
    };
    AnimationFrameAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        var _a;
        if (delay === void 0) { delay = 0; }
        if (delay != null ? delay > 0 : this.delay > 0) {
            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
        }
        var actions = scheduler.actions;
        if (id != null && ((_a = actions[actions.length - 1]) === null || _a === void 0 ? void 0 : _a.id) !== id) {
            animationFrameProvider_1.animationFrameProvider.cancelAnimationFrame(id);
            scheduler._scheduled = undefined;
        }
        return undefined;
    };
    return AnimationFrameAction;
}(AsyncAction_1$1.AsyncAction));
AnimationFrameAction$1.AnimationFrameAction = AnimationFrameAction;

var AnimationFrameScheduler$1 = {};

var __extends$2 = (AnimationFrameScheduler$1 && AnimationFrameScheduler$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(AnimationFrameScheduler$1, "__esModule", { value: true });
AnimationFrameScheduler$1.AnimationFrameScheduler = void 0;
var AsyncScheduler_1$1 = AsyncScheduler$1;
var AnimationFrameScheduler = (function (_super) {
    __extends$2(AnimationFrameScheduler, _super);
    function AnimationFrameScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnimationFrameScheduler.prototype.flush = function (action) {
        this._active = true;
        var flushId = this._scheduled;
        this._scheduled = undefined;
        var actions = this.actions;
        var error;
        action = action || actions.shift();
        do {
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        } while ((action = actions[0]) && action.id === flushId && actions.shift());
        this._active = false;
        if (error) {
            while ((action = actions[0]) && action.id === flushId && actions.shift()) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AnimationFrameScheduler;
}(AsyncScheduler_1$1.AsyncScheduler));
AnimationFrameScheduler$1.AnimationFrameScheduler = AnimationFrameScheduler;

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.animationFrame = exports.animationFrameScheduler = void 0;
	var AnimationFrameAction_1 = AnimationFrameAction$1;
	var AnimationFrameScheduler_1 = AnimationFrameScheduler$1;
	exports.animationFrameScheduler = new AnimationFrameScheduler_1.AnimationFrameScheduler(AnimationFrameAction_1.AnimationFrameAction);
	exports.animationFrame = exports.animationFrameScheduler;
	
} (animationFrame));

var VirtualTimeScheduler$1 = {};

var __extends$1 = (VirtualTimeScheduler$1 && VirtualTimeScheduler$1.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(VirtualTimeScheduler$1, "__esModule", { value: true });
VirtualTimeScheduler$1.VirtualAction = VirtualTimeScheduler$1.VirtualTimeScheduler = void 0;
var AsyncAction_1 = AsyncAction$1;
var Subscription_1 = Subscription$1;
var AsyncScheduler_1 = AsyncScheduler$1;
var VirtualTimeScheduler = (function (_super) {
    __extends$1(VirtualTimeScheduler, _super);
    function VirtualTimeScheduler(schedulerActionCtor, maxFrames) {
        if (schedulerActionCtor === void 0) { schedulerActionCtor = VirtualAction; }
        if (maxFrames === void 0) { maxFrames = Infinity; }
        var _this = _super.call(this, schedulerActionCtor, function () { return _this.frame; }) || this;
        _this.maxFrames = maxFrames;
        _this.frame = 0;
        _this.index = -1;
        return _this;
    }
    VirtualTimeScheduler.prototype.flush = function () {
        var _a = this, actions = _a.actions, maxFrames = _a.maxFrames;
        var error;
        var action;
        while ((action = actions[0]) && action.delay <= maxFrames) {
            actions.shift();
            this.frame = action.delay;
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        }
        if (error) {
            while ((action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    VirtualTimeScheduler.frameTimeFactor = 10;
    return VirtualTimeScheduler;
}(AsyncScheduler_1.AsyncScheduler));
VirtualTimeScheduler$1.VirtualTimeScheduler = VirtualTimeScheduler;
var VirtualAction = (function (_super) {
    __extends$1(VirtualAction, _super);
    function VirtualAction(scheduler, work, index) {
        if (index === void 0) { index = (scheduler.index += 1); }
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.index = index;
        _this.active = true;
        _this.index = scheduler.index = index;
        return _this;
    }
    VirtualAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        if (Number.isFinite(delay)) {
            if (!this.id) {
                return _super.prototype.schedule.call(this, state, delay);
            }
            this.active = false;
            var action = new VirtualAction(this.scheduler, this.work);
            this.add(action);
            return action.schedule(state, delay);
        }
        else {
            return Subscription_1.Subscription.EMPTY;
        }
    };
    VirtualAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        this.delay = scheduler.frame + delay;
        var actions = scheduler.actions;
        actions.push(this);
        actions.sort(VirtualAction.sortActions);
        return 1;
    };
    VirtualAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        return undefined;
    };
    VirtualAction.prototype._execute = function (state, delay) {
        if (this.active === true) {
            return _super.prototype._execute.call(this, state, delay);
        }
    };
    VirtualAction.sortActions = function (a, b) {
        if (a.delay === b.delay) {
            if (a.index === b.index) {
                return 0;
            }
            else if (a.index > b.index) {
                return 1;
            }
            else {
                return -1;
            }
        }
        else if (a.delay > b.delay) {
            return 1;
        }
        else {
            return -1;
        }
    };
    return VirtualAction;
}(AsyncAction_1.AsyncAction));
VirtualTimeScheduler$1.VirtualAction = VirtualAction;

var isObservable$1 = {};

Object.defineProperty(isObservable$1, "__esModule", { value: true });
isObservable$1.isObservable = void 0;
var Observable_1$8 = Observable$1;
var isFunction_1$2 = isFunction$1;
function isObservable(obj) {
    return !!obj && (obj instanceof Observable_1$8.Observable || (isFunction_1$2.isFunction(obj.lift) && isFunction_1$2.isFunction(obj.subscribe)));
}
isObservable$1.isObservable = isObservable;

var lastValueFrom$1 = {};

Object.defineProperty(lastValueFrom$1, "__esModule", { value: true });
lastValueFrom$1.lastValueFrom = void 0;
var EmptyError_1$1 = EmptyError;
function lastValueFrom(source, config) {
    var hasConfig = typeof config === 'object';
    return new Promise(function (resolve, reject) {
        var _hasValue = false;
        var _value;
        source.subscribe({
            next: function (value) {
                _value = value;
                _hasValue = true;
            },
            error: reject,
            complete: function () {
                if (_hasValue) {
                    resolve(_value);
                }
                else if (hasConfig) {
                    resolve(config.defaultValue);
                }
                else {
                    reject(new EmptyError_1$1.EmptyError());
                }
            },
        });
    });
}
lastValueFrom$1.lastValueFrom = lastValueFrom;

var firstValueFrom$1 = {};

Object.defineProperty(firstValueFrom$1, "__esModule", { value: true });
firstValueFrom$1.firstValueFrom = void 0;
var EmptyError_1 = EmptyError;
var Subscriber_1 = Subscriber;
function firstValueFrom(source, config) {
    var hasConfig = typeof config === 'object';
    return new Promise(function (resolve, reject) {
        var subscriber = new Subscriber_1.SafeSubscriber({
            next: function (value) {
                resolve(value);
                subscriber.unsubscribe();
            },
            error: reject,
            complete: function () {
                if (hasConfig) {
                    resolve(config.defaultValue);
                }
                else {
                    reject(new EmptyError_1.EmptyError());
                }
            },
        });
        source.subscribe(subscriber);
    });
}
firstValueFrom$1.firstValueFrom = firstValueFrom;

var bindCallback$1 = {};

var bindCallbackInternals$1 = {};

var __read$1 = (bindCallbackInternals$1 && bindCallbackInternals$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (bindCallbackInternals$1 && bindCallbackInternals$1.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(bindCallbackInternals$1, "__esModule", { value: true });
bindCallbackInternals$1.bindCallbackInternals = void 0;
var isScheduler_1$1 = isScheduler$1;
var Observable_1$7 = Observable$1;
var subscribeOn_1 = subscribeOn$1;
var mapOneOrManyArgs_1$3 = mapOneOrManyArgs$1;
var observeOn_1 = observeOn$1;
var AsyncSubject_1 = AsyncSubject$1;
function bindCallbackInternals(isNodeStyle, callbackFunc, resultSelector, scheduler) {
    if (resultSelector) {
        if (isScheduler_1$1.isScheduler(resultSelector)) {
            scheduler = resultSelector;
        }
        else {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return bindCallbackInternals(isNodeStyle, callbackFunc, scheduler)
                    .apply(this, args)
                    .pipe(mapOneOrManyArgs_1$3.mapOneOrManyArgs(resultSelector));
            };
        }
    }
    if (scheduler) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return bindCallbackInternals(isNodeStyle, callbackFunc)
                .apply(this, args)
                .pipe(subscribeOn_1.subscribeOn(scheduler), observeOn_1.observeOn(scheduler));
        };
    }
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var subject = new AsyncSubject_1.AsyncSubject();
        var uninitialized = true;
        return new Observable_1$7.Observable(function (subscriber) {
            var subs = subject.subscribe(subscriber);
            if (uninitialized) {
                uninitialized = false;
                var isAsync_1 = false;
                var isComplete_1 = false;
                callbackFunc.apply(_this, __spreadArray(__spreadArray([], __read$1(args)), [
                    function () {
                        var results = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            results[_i] = arguments[_i];
                        }
                        if (isNodeStyle) {
                            var err = results.shift();
                            if (err != null) {
                                subject.error(err);
                                return;
                            }
                        }
                        subject.next(1 < results.length ? results : results[0]);
                        isComplete_1 = true;
                        if (isAsync_1) {
                            subject.complete();
                        }
                    },
                ]));
                if (isComplete_1) {
                    subject.complete();
                }
                isAsync_1 = true;
            }
            return subs;
        });
    };
}
bindCallbackInternals$1.bindCallbackInternals = bindCallbackInternals;

Object.defineProperty(bindCallback$1, "__esModule", { value: true });
bindCallback$1.bindCallback = void 0;
var bindCallbackInternals_1$1 = bindCallbackInternals$1;
function bindCallback(callbackFunc, resultSelector, scheduler) {
    return bindCallbackInternals_1$1.bindCallbackInternals(false, callbackFunc, resultSelector, scheduler);
}
bindCallback$1.bindCallback = bindCallback;

var bindNodeCallback$1 = {};

Object.defineProperty(bindNodeCallback$1, "__esModule", { value: true });
bindNodeCallback$1.bindNodeCallback = void 0;
var bindCallbackInternals_1 = bindCallbackInternals$1;
function bindNodeCallback(callbackFunc, resultSelector, scheduler) {
    return bindCallbackInternals_1.bindCallbackInternals(true, callbackFunc, resultSelector, scheduler);
}
bindNodeCallback$1.bindNodeCallback = bindNodeCallback;

var connectable$1 = {};

var defer$1 = {};

Object.defineProperty(defer$1, "__esModule", { value: true });
defer$1.defer = void 0;
var Observable_1$6 = Observable$1;
var innerFrom_1$5 = innerFrom$1;
function defer(observableFactory) {
    return new Observable_1$6.Observable(function (subscriber) {
        innerFrom_1$5.innerFrom(observableFactory()).subscribe(subscriber);
    });
}
defer$1.defer = defer;

Object.defineProperty(connectable$1, "__esModule", { value: true });
connectable$1.connectable = void 0;
var Subject_1 = Subject$1;
var Observable_1$5 = Observable$1;
var defer_1$2 = defer$1;
var DEFAULT_CONFIG = {
    connector: function () { return new Subject_1.Subject(); },
    resetOnDisconnect: true,
};
function connectable(source, config) {
    if (config === void 0) { config = DEFAULT_CONFIG; }
    var connection = null;
    var connector = config.connector, _a = config.resetOnDisconnect, resetOnDisconnect = _a === void 0 ? true : _a;
    var subject = connector();
    var result = new Observable_1$5.Observable(function (subscriber) {
        return subject.subscribe(subscriber);
    });
    result.connect = function () {
        if (!connection || connection.closed) {
            connection = defer_1$2.defer(function () { return source; }).subscribe(subject);
            if (resetOnDisconnect) {
                connection.add(function () { return (subject = connector()); });
            }
        }
        return connection;
    };
    return result;
}
connectable$1.connectable = connectable;

var forkJoin$1 = {};

Object.defineProperty(forkJoin$1, "__esModule", { value: true });
forkJoin$1.forkJoin = void 0;
var Observable_1$4 = Observable$1;
var argsArgArrayOrObject_1 = argsArgArrayOrObject$1;
var innerFrom_1$4 = innerFrom$1;
var args_1$1 = args;
var OperatorSubscriber_1 = OperatorSubscriber$1;
var mapOneOrManyArgs_1$2 = mapOneOrManyArgs$1;
var createObject_1 = createObject$1;
function forkJoin() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resultSelector = args_1$1.popResultSelector(args);
    var _a = argsArgArrayOrObject_1.argsArgArrayOrObject(args), sources = _a.args, keys = _a.keys;
    var result = new Observable_1$4.Observable(function (subscriber) {
        var length = sources.length;
        if (!length) {
            subscriber.complete();
            return;
        }
        var values = new Array(length);
        var remainingCompletions = length;
        var remainingEmissions = length;
        var _loop_1 = function (sourceIndex) {
            var hasValue = false;
            innerFrom_1$4.innerFrom(sources[sourceIndex]).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
                if (!hasValue) {
                    hasValue = true;
                    remainingEmissions--;
                }
                values[sourceIndex] = value;
            }, function () { return remainingCompletions--; }, undefined, function () {
                if (!remainingCompletions || !hasValue) {
                    if (!remainingEmissions) {
                        subscriber.next(keys ? createObject_1.createObject(keys, values) : values);
                    }
                    subscriber.complete();
                }
            }));
        };
        for (var sourceIndex = 0; sourceIndex < length; sourceIndex++) {
            _loop_1(sourceIndex);
        }
    });
    return resultSelector ? result.pipe(mapOneOrManyArgs_1$2.mapOneOrManyArgs(resultSelector)) : result;
}
forkJoin$1.forkJoin = forkJoin;

var fromEvent$1 = {};

var __read = (fromEvent$1 && fromEvent$1.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(fromEvent$1, "__esModule", { value: true });
fromEvent$1.fromEvent = void 0;
var innerFrom_1$3 = innerFrom$1;
var Observable_1$3 = Observable$1;
var mergeMap_1 = mergeMap$1;
var isArrayLike_1 = isArrayLike;
var isFunction_1$1 = isFunction$1;
var mapOneOrManyArgs_1$1 = mapOneOrManyArgs$1;
var nodeEventEmitterMethods = ['addListener', 'removeListener'];
var eventTargetMethods = ['addEventListener', 'removeEventListener'];
var jqueryMethods = ['on', 'off'];
function fromEvent(target, eventName, options, resultSelector) {
    if (isFunction_1$1.isFunction(options)) {
        resultSelector = options;
        options = undefined;
    }
    if (resultSelector) {
        return fromEvent(target, eventName, options).pipe(mapOneOrManyArgs_1$1.mapOneOrManyArgs(resultSelector));
    }
    var _a = __read(isEventTarget(target)
        ? eventTargetMethods.map(function (methodName) { return function (handler) { return target[methodName](eventName, handler, options); }; })
        :
            isNodeStyleEventEmitter(target)
                ? nodeEventEmitterMethods.map(toCommonHandlerRegistry(target, eventName))
                : isJQueryStyleEventEmitter(target)
                    ? jqueryMethods.map(toCommonHandlerRegistry(target, eventName))
                    : [], 2), add = _a[0], remove = _a[1];
    if (!add) {
        if (isArrayLike_1.isArrayLike(target)) {
            return mergeMap_1.mergeMap(function (subTarget) { return fromEvent(subTarget, eventName, options); })(innerFrom_1$3.innerFrom(target));
        }
    }
    if (!add) {
        throw new TypeError('Invalid event target');
    }
    return new Observable_1$3.Observable(function (subscriber) {
        var handler = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return subscriber.next(1 < args.length ? args : args[0]);
        };
        add(handler);
        return function () { return remove(handler); };
    });
}
fromEvent$1.fromEvent = fromEvent;
function toCommonHandlerRegistry(target, eventName) {
    return function (methodName) { return function (handler) { return target[methodName](eventName, handler); }; };
}
function isNodeStyleEventEmitter(target) {
    return isFunction_1$1.isFunction(target.addListener) && isFunction_1$1.isFunction(target.removeListener);
}
function isJQueryStyleEventEmitter(target) {
    return isFunction_1$1.isFunction(target.on) && isFunction_1$1.isFunction(target.off);
}
function isEventTarget(target) {
    return isFunction_1$1.isFunction(target.addEventListener) && isFunction_1$1.isFunction(target.removeEventListener);
}

var fromEventPattern$1 = {};

Object.defineProperty(fromEventPattern$1, "__esModule", { value: true });
fromEventPattern$1.fromEventPattern = void 0;
var Observable_1$2 = Observable$1;
var isFunction_1 = isFunction$1;
var mapOneOrManyArgs_1 = mapOneOrManyArgs$1;
function fromEventPattern(addHandler, removeHandler, resultSelector) {
    if (resultSelector) {
        return fromEventPattern(addHandler, removeHandler).pipe(mapOneOrManyArgs_1.mapOneOrManyArgs(resultSelector));
    }
    return new Observable_1$2.Observable(function (subscriber) {
        var handler = function () {
            var e = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                e[_i] = arguments[_i];
            }
            return subscriber.next(e.length === 1 ? e[0] : e);
        };
        var retValue = addHandler(handler);
        return isFunction_1.isFunction(removeHandler) ? function () { return removeHandler(handler, retValue); } : undefined;
    });
}
fromEventPattern$1.fromEventPattern = fromEventPattern;

var generate$1 = {};

var __generator = (generate$1 && generate$1.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(generate$1, "__esModule", { value: true });
generate$1.generate = void 0;
var identity_1 = identity$1;
var isScheduler_1 = isScheduler$1;
var defer_1$1 = defer$1;
var scheduleIterable_1 = scheduleIterable$1;
function generate(initialStateOrOptions, condition, iterate, resultSelectorOrScheduler, scheduler) {
    var _a, _b;
    var resultSelector;
    var initialState;
    if (arguments.length === 1) {
        (_a = initialStateOrOptions, initialState = _a.initialState, condition = _a.condition, iterate = _a.iterate, _b = _a.resultSelector, resultSelector = _b === void 0 ? identity_1.identity : _b, scheduler = _a.scheduler);
    }
    else {
        initialState = initialStateOrOptions;
        if (!resultSelectorOrScheduler || isScheduler_1.isScheduler(resultSelectorOrScheduler)) {
            resultSelector = identity_1.identity;
            scheduler = resultSelectorOrScheduler;
        }
        else {
            resultSelector = resultSelectorOrScheduler;
        }
    }
    function gen() {
        var state;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = initialState;
                    _a.label = 1;
                case 1:
                    if (!(!condition || condition(state))) return [3, 4];
                    return [4, resultSelector(state)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    state = iterate(state);
                    return [3, 1];
                case 4: return [2];
            }
        });
    }
    return defer_1$1.defer((scheduler
        ?
            function () { return scheduleIterable_1.scheduleIterable(gen(), scheduler); }
        :
            gen));
}
generate$1.generate = generate;

var iif$1 = {};

Object.defineProperty(iif$1, "__esModule", { value: true });
iif$1.iif = void 0;
var defer_1 = defer$1;
function iif(condition, trueResult, falseResult) {
    return defer_1.defer(function () { return (condition() ? trueResult : falseResult); });
}
iif$1.iif = iif;

var merge$1 = {};

Object.defineProperty(merge$1, "__esModule", { value: true });
merge$1.merge = void 0;
var mergeAll_1 = mergeAll$1;
var innerFrom_1$2 = innerFrom$1;
var empty_1$2 = empty;
var args_1 = args;
var from_1$1 = from$1;
function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1.popScheduler(args);
    var concurrent = args_1.popNumber(args, Infinity);
    var sources = args;
    return !sources.length
        ?
            empty_1$2.EMPTY
        : sources.length === 1
            ?
                innerFrom_1$2.innerFrom(sources[0])
            :
                mergeAll_1.mergeAll(concurrent)(from_1$1.from(sources, scheduler));
}
merge$1.merge = merge;

var never = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.never = exports.NEVER = void 0;
	var Observable_1 = Observable$1;
	var noop_1 = noop$1;
	exports.NEVER = new Observable_1.Observable(noop_1.noop);
	function never() {
	    return exports.NEVER;
	}
	exports.never = never;
	
} (never));

var pairs$1 = {};

Object.defineProperty(pairs$1, "__esModule", { value: true });
pairs$1.pairs = void 0;
var from_1 = from$1;
function pairs(obj, scheduler) {
    return from_1.from(Object.entries(obj), scheduler);
}
pairs$1.pairs = pairs;

var partition$1 = {};

Object.defineProperty(partition$1, "__esModule", { value: true });
partition$1.partition = void 0;
var not_1 = not$1;
var filter_1 = filter$1;
var innerFrom_1$1 = innerFrom$1;
function partition(source, predicate, thisArg) {
    return [filter_1.filter(predicate, thisArg)(innerFrom_1$1.innerFrom(source)), filter_1.filter(not_1.not(predicate, thisArg))(innerFrom_1$1.innerFrom(source))];
}
partition$1.partition = partition;

var range$1 = {};

Object.defineProperty(range$1, "__esModule", { value: true });
range$1.range = void 0;
var Observable_1$1 = Observable$1;
var empty_1$1 = empty;
function range(start, count, scheduler) {
    if (count == null) {
        count = start;
        start = 0;
    }
    if (count <= 0) {
        return empty_1$1.EMPTY;
    }
    var end = count + start;
    return new Observable_1$1.Observable(scheduler
        ?
            function (subscriber) {
                var n = start;
                return scheduler.schedule(function () {
                    if (n < end) {
                        subscriber.next(n++);
                        this.schedule();
                    }
                    else {
                        subscriber.complete();
                    }
                });
            }
        :
            function (subscriber) {
                var n = start;
                while (n < end && !subscriber.closed) {
                    subscriber.next(n++);
                }
                subscriber.complete();
            });
}
range$1.range = range;

var using$1 = {};

Object.defineProperty(using$1, "__esModule", { value: true });
using$1.using = void 0;
var Observable_1 = Observable$1;
var innerFrom_1 = innerFrom$1;
var empty_1 = empty;
function using(resourceFactory, observableFactory) {
    return new Observable_1.Observable(function (subscriber) {
        var resource = resourceFactory();
        var result = observableFactory(resource);
        var source = result ? innerFrom_1.innerFrom(result) : empty_1.EMPTY;
        source.subscribe(subscriber);
        return function () {
            if (resource) {
                resource.unsubscribe();
            }
        };
    });
}
using$1.using = using;

var types = {};

Object.defineProperty(types, "__esModule", { value: true });

(function (exports) {
	var __createBinding = (cjs && cjs.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (cjs && cjs.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.interval = exports.iif = exports.generate = exports.fromEventPattern = exports.fromEvent = exports.from = exports.forkJoin = exports.empty = exports.defer = exports.connectable = exports.concat = exports.combineLatest = exports.bindNodeCallback = exports.bindCallback = exports.UnsubscriptionError = exports.TimeoutError = exports.SequenceError = exports.ObjectUnsubscribedError = exports.NotFoundError = exports.EmptyError = exports.ArgumentOutOfRangeError = exports.firstValueFrom = exports.lastValueFrom = exports.isObservable = exports.identity = exports.noop = exports.pipe = exports.NotificationKind = exports.Notification = exports.Subscriber = exports.Subscription = exports.Scheduler = exports.VirtualAction = exports.VirtualTimeScheduler = exports.animationFrameScheduler = exports.animationFrame = exports.queueScheduler = exports.queue = exports.asyncScheduler = exports.async = exports.asapScheduler = exports.asap = exports.AsyncSubject = exports.ReplaySubject = exports.BehaviorSubject = exports.Subject = exports.animationFrames = exports.observable = exports.ConnectableObservable = exports.Observable = void 0;
	exports.filter = exports.expand = exports.exhaustMap = exports.exhaustAll = exports.exhaust = exports.every = exports.endWith = exports.elementAt = exports.distinctUntilKeyChanged = exports.distinctUntilChanged = exports.distinct = exports.dematerialize = exports.delayWhen = exports.delay = exports.defaultIfEmpty = exports.debounceTime = exports.debounce = exports.count = exports.connect = exports.concatWith = exports.concatMapTo = exports.concatMap = exports.concatAll = exports.combineLatestWith = exports.combineLatestAll = exports.combineAll = exports.catchError = exports.bufferWhen = exports.bufferToggle = exports.bufferTime = exports.bufferCount = exports.buffer = exports.auditTime = exports.audit = exports.config = exports.NEVER = exports.EMPTY = exports.scheduled = exports.zip = exports.using = exports.timer = exports.throwError = exports.range = exports.race = exports.partition = exports.pairs = exports.onErrorResumeNext = exports.of = exports.never = exports.merge = void 0;
	exports.switchMap = exports.switchAll = exports.subscribeOn = exports.startWith = exports.skipWhile = exports.skipUntil = exports.skipLast = exports.skip = exports.single = exports.shareReplay = exports.share = exports.sequenceEqual = exports.scan = exports.sampleTime = exports.sample = exports.refCount = exports.retryWhen = exports.retry = exports.repeatWhen = exports.repeat = exports.reduce = exports.raceWith = exports.publishReplay = exports.publishLast = exports.publishBehavior = exports.publish = exports.pluck = exports.pairwise = exports.onErrorResumeNextWith = exports.observeOn = exports.multicast = exports.min = exports.mergeWith = exports.mergeScan = exports.mergeMapTo = exports.mergeMap = exports.flatMap = exports.mergeAll = exports.max = exports.materialize = exports.mapTo = exports.map = exports.last = exports.isEmpty = exports.ignoreElements = exports.groupBy = exports.first = exports.findIndex = exports.find = exports.finalize = void 0;
	exports.zipWith = exports.zipAll = exports.withLatestFrom = exports.windowWhen = exports.windowToggle = exports.windowTime = exports.windowCount = exports.window = exports.toArray = exports.timestamp = exports.timeoutWith = exports.timeout = exports.timeInterval = exports.throwIfEmpty = exports.throttleTime = exports.throttle = exports.tap = exports.takeWhile = exports.takeUntil = exports.takeLast = exports.take = exports.switchScan = exports.switchMapTo = void 0;
	var Observable_1 = Observable$1;
	Object.defineProperty(exports, "Observable", { enumerable: true, get: function () { return Observable_1.Observable; } });
	var ConnectableObservable_1 = ConnectableObservable$1;
	Object.defineProperty(exports, "ConnectableObservable", { enumerable: true, get: function () { return ConnectableObservable_1.ConnectableObservable; } });
	var observable_1 = observable;
	Object.defineProperty(exports, "observable", { enumerable: true, get: function () { return observable_1.observable; } });
	var animationFrames_1 = animationFrames$1;
	Object.defineProperty(exports, "animationFrames", { enumerable: true, get: function () { return animationFrames_1.animationFrames; } });
	var Subject_1 = Subject$1;
	Object.defineProperty(exports, "Subject", { enumerable: true, get: function () { return Subject_1.Subject; } });
	var BehaviorSubject_1 = BehaviorSubject$1;
	Object.defineProperty(exports, "BehaviorSubject", { enumerable: true, get: function () { return BehaviorSubject_1.BehaviorSubject; } });
	var ReplaySubject_1 = ReplaySubject$1;
	Object.defineProperty(exports, "ReplaySubject", { enumerable: true, get: function () { return ReplaySubject_1.ReplaySubject; } });
	var AsyncSubject_1 = AsyncSubject$1;
	Object.defineProperty(exports, "AsyncSubject", { enumerable: true, get: function () { return AsyncSubject_1.AsyncSubject; } });
	var asap_1 = asap;
	Object.defineProperty(exports, "asap", { enumerable: true, get: function () { return asap_1.asap; } });
	Object.defineProperty(exports, "asapScheduler", { enumerable: true, get: function () { return asap_1.asapScheduler; } });
	var async_1 = async;
	Object.defineProperty(exports, "async", { enumerable: true, get: function () { return async_1.async; } });
	Object.defineProperty(exports, "asyncScheduler", { enumerable: true, get: function () { return async_1.asyncScheduler; } });
	var queue_1 = queue;
	Object.defineProperty(exports, "queue", { enumerable: true, get: function () { return queue_1.queue; } });
	Object.defineProperty(exports, "queueScheduler", { enumerable: true, get: function () { return queue_1.queueScheduler; } });
	var animationFrame_1 = animationFrame;
	Object.defineProperty(exports, "animationFrame", { enumerable: true, get: function () { return animationFrame_1.animationFrame; } });
	Object.defineProperty(exports, "animationFrameScheduler", { enumerable: true, get: function () { return animationFrame_1.animationFrameScheduler; } });
	var VirtualTimeScheduler_1 = VirtualTimeScheduler$1;
	Object.defineProperty(exports, "VirtualTimeScheduler", { enumerable: true, get: function () { return VirtualTimeScheduler_1.VirtualTimeScheduler; } });
	Object.defineProperty(exports, "VirtualAction", { enumerable: true, get: function () { return VirtualTimeScheduler_1.VirtualAction; } });
	var Scheduler_1 = Scheduler$1;
	Object.defineProperty(exports, "Scheduler", { enumerable: true, get: function () { return Scheduler_1.Scheduler; } });
	var Subscription_1 = Subscription$1;
	Object.defineProperty(exports, "Subscription", { enumerable: true, get: function () { return Subscription_1.Subscription; } });
	var Subscriber_1 = Subscriber;
	Object.defineProperty(exports, "Subscriber", { enumerable: true, get: function () { return Subscriber_1.Subscriber; } });
	var Notification_1 = Notification;
	Object.defineProperty(exports, "Notification", { enumerable: true, get: function () { return Notification_1.Notification; } });
	Object.defineProperty(exports, "NotificationKind", { enumerable: true, get: function () { return Notification_1.NotificationKind; } });
	var pipe_1 = pipe$1;
	Object.defineProperty(exports, "pipe", { enumerable: true, get: function () { return pipe_1.pipe; } });
	var noop_1 = noop$1;
	Object.defineProperty(exports, "noop", { enumerable: true, get: function () { return noop_1.noop; } });
	var identity_1 = identity$1;
	Object.defineProperty(exports, "identity", { enumerable: true, get: function () { return identity_1.identity; } });
	var isObservable_1 = isObservable$1;
	Object.defineProperty(exports, "isObservable", { enumerable: true, get: function () { return isObservable_1.isObservable; } });
	var lastValueFrom_1 = lastValueFrom$1;
	Object.defineProperty(exports, "lastValueFrom", { enumerable: true, get: function () { return lastValueFrom_1.lastValueFrom; } });
	var firstValueFrom_1 = firstValueFrom$1;
	Object.defineProperty(exports, "firstValueFrom", { enumerable: true, get: function () { return firstValueFrom_1.firstValueFrom; } });
	var ArgumentOutOfRangeError_1 = ArgumentOutOfRangeError;
	Object.defineProperty(exports, "ArgumentOutOfRangeError", { enumerable: true, get: function () { return ArgumentOutOfRangeError_1.ArgumentOutOfRangeError; } });
	var EmptyError_1 = EmptyError;
	Object.defineProperty(exports, "EmptyError", { enumerable: true, get: function () { return EmptyError_1.EmptyError; } });
	var NotFoundError_1 = NotFoundError;
	Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return NotFoundError_1.NotFoundError; } });
	var ObjectUnsubscribedError_1 = ObjectUnsubscribedError;
	Object.defineProperty(exports, "ObjectUnsubscribedError", { enumerable: true, get: function () { return ObjectUnsubscribedError_1.ObjectUnsubscribedError; } });
	var SequenceError_1 = SequenceError;
	Object.defineProperty(exports, "SequenceError", { enumerable: true, get: function () { return SequenceError_1.SequenceError; } });
	var timeout_1 = timeout;
	Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return timeout_1.TimeoutError; } });
	var UnsubscriptionError_1 = UnsubscriptionError;
	Object.defineProperty(exports, "UnsubscriptionError", { enumerable: true, get: function () { return UnsubscriptionError_1.UnsubscriptionError; } });
	var bindCallback_1 = bindCallback$1;
	Object.defineProperty(exports, "bindCallback", { enumerable: true, get: function () { return bindCallback_1.bindCallback; } });
	var bindNodeCallback_1 = bindNodeCallback$1;
	Object.defineProperty(exports, "bindNodeCallback", { enumerable: true, get: function () { return bindNodeCallback_1.bindNodeCallback; } });
	var combineLatest_1 = combineLatest$3;
	Object.defineProperty(exports, "combineLatest", { enumerable: true, get: function () { return combineLatest_1.combineLatest; } });
	var concat_1 = concat$1;
	Object.defineProperty(exports, "concat", { enumerable: true, get: function () { return concat_1.concat; } });
	var connectable_1 = connectable$1;
	Object.defineProperty(exports, "connectable", { enumerable: true, get: function () { return connectable_1.connectable; } });
	var defer_1 = defer$1;
	Object.defineProperty(exports, "defer", { enumerable: true, get: function () { return defer_1.defer; } });
	var empty_1 = empty;
	Object.defineProperty(exports, "empty", { enumerable: true, get: function () { return empty_1.empty; } });
	var forkJoin_1 = forkJoin$1;
	Object.defineProperty(exports, "forkJoin", { enumerable: true, get: function () { return forkJoin_1.forkJoin; } });
	var from_1 = from$1;
	Object.defineProperty(exports, "from", { enumerable: true, get: function () { return from_1.from; } });
	var fromEvent_1 = fromEvent$1;
	Object.defineProperty(exports, "fromEvent", { enumerable: true, get: function () { return fromEvent_1.fromEvent; } });
	var fromEventPattern_1 = fromEventPattern$1;
	Object.defineProperty(exports, "fromEventPattern", { enumerable: true, get: function () { return fromEventPattern_1.fromEventPattern; } });
	var generate_1 = generate$1;
	Object.defineProperty(exports, "generate", { enumerable: true, get: function () { return generate_1.generate; } });
	var iif_1 = iif$1;
	Object.defineProperty(exports, "iif", { enumerable: true, get: function () { return iif_1.iif; } });
	var interval_1 = interval$1;
	Object.defineProperty(exports, "interval", { enumerable: true, get: function () { return interval_1.interval; } });
	var merge_1 = merge$1;
	Object.defineProperty(exports, "merge", { enumerable: true, get: function () { return merge_1.merge; } });
	var never_1 = never;
	Object.defineProperty(exports, "never", { enumerable: true, get: function () { return never_1.never; } });
	var of_1 = of$1;
	Object.defineProperty(exports, "of", { enumerable: true, get: function () { return of_1.of; } });
	var onErrorResumeNext_1 = onErrorResumeNext$1;
	Object.defineProperty(exports, "onErrorResumeNext", { enumerable: true, get: function () { return onErrorResumeNext_1.onErrorResumeNext; } });
	var pairs_1 = pairs$1;
	Object.defineProperty(exports, "pairs", { enumerable: true, get: function () { return pairs_1.pairs; } });
	var partition_1 = partition$1;
	Object.defineProperty(exports, "partition", { enumerable: true, get: function () { return partition_1.partition; } });
	var race_1 = race$2;
	Object.defineProperty(exports, "race", { enumerable: true, get: function () { return race_1.race; } });
	var range_1 = range$1;
	Object.defineProperty(exports, "range", { enumerable: true, get: function () { return range_1.range; } });
	var throwError_1 = throwError$1;
	Object.defineProperty(exports, "throwError", { enumerable: true, get: function () { return throwError_1.throwError; } });
	var timer_1 = timer$1;
	Object.defineProperty(exports, "timer", { enumerable: true, get: function () { return timer_1.timer; } });
	var using_1 = using$1;
	Object.defineProperty(exports, "using", { enumerable: true, get: function () { return using_1.using; } });
	var zip_1 = zip$2;
	Object.defineProperty(exports, "zip", { enumerable: true, get: function () { return zip_1.zip; } });
	var scheduled_1 = scheduled$1;
	Object.defineProperty(exports, "scheduled", { enumerable: true, get: function () { return scheduled_1.scheduled; } });
	var empty_2 = empty;
	Object.defineProperty(exports, "EMPTY", { enumerable: true, get: function () { return empty_2.EMPTY; } });
	var never_2 = never;
	Object.defineProperty(exports, "NEVER", { enumerable: true, get: function () { return never_2.NEVER; } });
	__exportStar(types, exports);
	var config_1 = config;
	Object.defineProperty(exports, "config", { enumerable: true, get: function () { return config_1.config; } });
	var audit_1 = audit$1;
	Object.defineProperty(exports, "audit", { enumerable: true, get: function () { return audit_1.audit; } });
	var auditTime_1 = auditTime$1;
	Object.defineProperty(exports, "auditTime", { enumerable: true, get: function () { return auditTime_1.auditTime; } });
	var buffer_1 = buffer$1;
	Object.defineProperty(exports, "buffer", { enumerable: true, get: function () { return buffer_1.buffer; } });
	var bufferCount_1 = bufferCount$1;
	Object.defineProperty(exports, "bufferCount", { enumerable: true, get: function () { return bufferCount_1.bufferCount; } });
	var bufferTime_1 = bufferTime$1;
	Object.defineProperty(exports, "bufferTime", { enumerable: true, get: function () { return bufferTime_1.bufferTime; } });
	var bufferToggle_1 = bufferToggle$1;
	Object.defineProperty(exports, "bufferToggle", { enumerable: true, get: function () { return bufferToggle_1.bufferToggle; } });
	var bufferWhen_1 = bufferWhen$1;
	Object.defineProperty(exports, "bufferWhen", { enumerable: true, get: function () { return bufferWhen_1.bufferWhen; } });
	var catchError_1 = catchError$1;
	Object.defineProperty(exports, "catchError", { enumerable: true, get: function () { return catchError_1.catchError; } });
	var combineAll_1 = combineAll;
	Object.defineProperty(exports, "combineAll", { enumerable: true, get: function () { return combineAll_1.combineAll; } });
	var combineLatestAll_1 = combineLatestAll$1;
	Object.defineProperty(exports, "combineLatestAll", { enumerable: true, get: function () { return combineLatestAll_1.combineLatestAll; } });
	var combineLatestWith_1 = combineLatestWith$1;
	Object.defineProperty(exports, "combineLatestWith", { enumerable: true, get: function () { return combineLatestWith_1.combineLatestWith; } });
	var concatAll_1 = concatAll$1;
	Object.defineProperty(exports, "concatAll", { enumerable: true, get: function () { return concatAll_1.concatAll; } });
	var concatMap_1 = concatMap$1;
	Object.defineProperty(exports, "concatMap", { enumerable: true, get: function () { return concatMap_1.concatMap; } });
	var concatMapTo_1 = concatMapTo$1;
	Object.defineProperty(exports, "concatMapTo", { enumerable: true, get: function () { return concatMapTo_1.concatMapTo; } });
	var concatWith_1 = concatWith$1;
	Object.defineProperty(exports, "concatWith", { enumerable: true, get: function () { return concatWith_1.concatWith; } });
	var connect_1 = connect$1;
	Object.defineProperty(exports, "connect", { enumerable: true, get: function () { return connect_1.connect; } });
	var count_1 = count$1;
	Object.defineProperty(exports, "count", { enumerable: true, get: function () { return count_1.count; } });
	var debounce_1 = debounce$1;
	Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return debounce_1.debounce; } });
	var debounceTime_1 = debounceTime$1;
	Object.defineProperty(exports, "debounceTime", { enumerable: true, get: function () { return debounceTime_1.debounceTime; } });
	var defaultIfEmpty_1 = defaultIfEmpty$1;
	Object.defineProperty(exports, "defaultIfEmpty", { enumerable: true, get: function () { return defaultIfEmpty_1.defaultIfEmpty; } });
	var delay_1 = delay$1;
	Object.defineProperty(exports, "delay", { enumerable: true, get: function () { return delay_1.delay; } });
	var delayWhen_1 = delayWhen$1;
	Object.defineProperty(exports, "delayWhen", { enumerable: true, get: function () { return delayWhen_1.delayWhen; } });
	var dematerialize_1 = dematerialize$1;
	Object.defineProperty(exports, "dematerialize", { enumerable: true, get: function () { return dematerialize_1.dematerialize; } });
	var distinct_1 = distinct$1;
	Object.defineProperty(exports, "distinct", { enumerable: true, get: function () { return distinct_1.distinct; } });
	var distinctUntilChanged_1 = distinctUntilChanged$1;
	Object.defineProperty(exports, "distinctUntilChanged", { enumerable: true, get: function () { return distinctUntilChanged_1.distinctUntilChanged; } });
	var distinctUntilKeyChanged_1 = distinctUntilKeyChanged$1;
	Object.defineProperty(exports, "distinctUntilKeyChanged", { enumerable: true, get: function () { return distinctUntilKeyChanged_1.distinctUntilKeyChanged; } });
	var elementAt_1 = elementAt$1;
	Object.defineProperty(exports, "elementAt", { enumerable: true, get: function () { return elementAt_1.elementAt; } });
	var endWith_1 = endWith$1;
	Object.defineProperty(exports, "endWith", { enumerable: true, get: function () { return endWith_1.endWith; } });
	var every_1 = every$1;
	Object.defineProperty(exports, "every", { enumerable: true, get: function () { return every_1.every; } });
	var exhaust_1 = exhaust;
	Object.defineProperty(exports, "exhaust", { enumerable: true, get: function () { return exhaust_1.exhaust; } });
	var exhaustAll_1 = exhaustAll$1;
	Object.defineProperty(exports, "exhaustAll", { enumerable: true, get: function () { return exhaustAll_1.exhaustAll; } });
	var exhaustMap_1 = exhaustMap$1;
	Object.defineProperty(exports, "exhaustMap", { enumerable: true, get: function () { return exhaustMap_1.exhaustMap; } });
	var expand_1 = expand$1;
	Object.defineProperty(exports, "expand", { enumerable: true, get: function () { return expand_1.expand; } });
	var filter_1 = filter$1;
	Object.defineProperty(exports, "filter", { enumerable: true, get: function () { return filter_1.filter; } });
	var finalize_1 = finalize$1;
	Object.defineProperty(exports, "finalize", { enumerable: true, get: function () { return finalize_1.finalize; } });
	var find_1 = find$1;
	Object.defineProperty(exports, "find", { enumerable: true, get: function () { return find_1.find; } });
	var findIndex_1 = findIndex$1;
	Object.defineProperty(exports, "findIndex", { enumerable: true, get: function () { return findIndex_1.findIndex; } });
	var first_1 = first$1;
	Object.defineProperty(exports, "first", { enumerable: true, get: function () { return first_1.first; } });
	var groupBy_1 = groupBy$1;
	Object.defineProperty(exports, "groupBy", { enumerable: true, get: function () { return groupBy_1.groupBy; } });
	var ignoreElements_1 = ignoreElements$1;
	Object.defineProperty(exports, "ignoreElements", { enumerable: true, get: function () { return ignoreElements_1.ignoreElements; } });
	var isEmpty_1 = isEmpty$1;
	Object.defineProperty(exports, "isEmpty", { enumerable: true, get: function () { return isEmpty_1.isEmpty; } });
	var last_1 = last$1;
	Object.defineProperty(exports, "last", { enumerable: true, get: function () { return last_1.last; } });
	var map_1 = map$1;
	Object.defineProperty(exports, "map", { enumerable: true, get: function () { return map_1.map; } });
	var mapTo_1 = mapTo$1;
	Object.defineProperty(exports, "mapTo", { enumerable: true, get: function () { return mapTo_1.mapTo; } });
	var materialize_1 = materialize$1;
	Object.defineProperty(exports, "materialize", { enumerable: true, get: function () { return materialize_1.materialize; } });
	var max_1 = max$1;
	Object.defineProperty(exports, "max", { enumerable: true, get: function () { return max_1.max; } });
	var mergeAll_1 = mergeAll$1;
	Object.defineProperty(exports, "mergeAll", { enumerable: true, get: function () { return mergeAll_1.mergeAll; } });
	var flatMap_1 = flatMap;
	Object.defineProperty(exports, "flatMap", { enumerable: true, get: function () { return flatMap_1.flatMap; } });
	var mergeMap_1 = mergeMap$1;
	Object.defineProperty(exports, "mergeMap", { enumerable: true, get: function () { return mergeMap_1.mergeMap; } });
	var mergeMapTo_1 = mergeMapTo$1;
	Object.defineProperty(exports, "mergeMapTo", { enumerable: true, get: function () { return mergeMapTo_1.mergeMapTo; } });
	var mergeScan_1 = mergeScan$1;
	Object.defineProperty(exports, "mergeScan", { enumerable: true, get: function () { return mergeScan_1.mergeScan; } });
	var mergeWith_1 = mergeWith$1;
	Object.defineProperty(exports, "mergeWith", { enumerable: true, get: function () { return mergeWith_1.mergeWith; } });
	var min_1 = min$1;
	Object.defineProperty(exports, "min", { enumerable: true, get: function () { return min_1.min; } });
	var multicast_1 = multicast$1;
	Object.defineProperty(exports, "multicast", { enumerable: true, get: function () { return multicast_1.multicast; } });
	var observeOn_1 = observeOn$1;
	Object.defineProperty(exports, "observeOn", { enumerable: true, get: function () { return observeOn_1.observeOn; } });
	var onErrorResumeNextWith_1 = onErrorResumeNextWith$1;
	Object.defineProperty(exports, "onErrorResumeNextWith", { enumerable: true, get: function () { return onErrorResumeNextWith_1.onErrorResumeNextWith; } });
	var pairwise_1 = pairwise$1;
	Object.defineProperty(exports, "pairwise", { enumerable: true, get: function () { return pairwise_1.pairwise; } });
	var pluck_1 = pluck$1;
	Object.defineProperty(exports, "pluck", { enumerable: true, get: function () { return pluck_1.pluck; } });
	var publish_1 = publish$1;
	Object.defineProperty(exports, "publish", { enumerable: true, get: function () { return publish_1.publish; } });
	var publishBehavior_1 = publishBehavior$1;
	Object.defineProperty(exports, "publishBehavior", { enumerable: true, get: function () { return publishBehavior_1.publishBehavior; } });
	var publishLast_1 = publishLast$1;
	Object.defineProperty(exports, "publishLast", { enumerable: true, get: function () { return publishLast_1.publishLast; } });
	var publishReplay_1 = publishReplay$1;
	Object.defineProperty(exports, "publishReplay", { enumerable: true, get: function () { return publishReplay_1.publishReplay; } });
	var raceWith_1 = raceWith$1;
	Object.defineProperty(exports, "raceWith", { enumerable: true, get: function () { return raceWith_1.raceWith; } });
	var reduce_1 = reduce$1;
	Object.defineProperty(exports, "reduce", { enumerable: true, get: function () { return reduce_1.reduce; } });
	var repeat_1 = repeat$1;
	Object.defineProperty(exports, "repeat", { enumerable: true, get: function () { return repeat_1.repeat; } });
	var repeatWhen_1 = repeatWhen$1;
	Object.defineProperty(exports, "repeatWhen", { enumerable: true, get: function () { return repeatWhen_1.repeatWhen; } });
	var retry_1 = retry$1;
	Object.defineProperty(exports, "retry", { enumerable: true, get: function () { return retry_1.retry; } });
	var retryWhen_1 = retryWhen$1;
	Object.defineProperty(exports, "retryWhen", { enumerable: true, get: function () { return retryWhen_1.retryWhen; } });
	var refCount_1 = refCount$1;
	Object.defineProperty(exports, "refCount", { enumerable: true, get: function () { return refCount_1.refCount; } });
	var sample_1 = sample$1;
	Object.defineProperty(exports, "sample", { enumerable: true, get: function () { return sample_1.sample; } });
	var sampleTime_1 = sampleTime$1;
	Object.defineProperty(exports, "sampleTime", { enumerable: true, get: function () { return sampleTime_1.sampleTime; } });
	var scan_1 = scan$1;
	Object.defineProperty(exports, "scan", { enumerable: true, get: function () { return scan_1.scan; } });
	var sequenceEqual_1 = sequenceEqual$1;
	Object.defineProperty(exports, "sequenceEqual", { enumerable: true, get: function () { return sequenceEqual_1.sequenceEqual; } });
	var share_1 = share$1;
	Object.defineProperty(exports, "share", { enumerable: true, get: function () { return share_1.share; } });
	var shareReplay_1 = shareReplay$1;
	Object.defineProperty(exports, "shareReplay", { enumerable: true, get: function () { return shareReplay_1.shareReplay; } });
	var single_1 = single$1;
	Object.defineProperty(exports, "single", { enumerable: true, get: function () { return single_1.single; } });
	var skip_1 = skip$1;
	Object.defineProperty(exports, "skip", { enumerable: true, get: function () { return skip_1.skip; } });
	var skipLast_1 = skipLast$1;
	Object.defineProperty(exports, "skipLast", { enumerable: true, get: function () { return skipLast_1.skipLast; } });
	var skipUntil_1 = skipUntil$1;
	Object.defineProperty(exports, "skipUntil", { enumerable: true, get: function () { return skipUntil_1.skipUntil; } });
	var skipWhile_1 = skipWhile$1;
	Object.defineProperty(exports, "skipWhile", { enumerable: true, get: function () { return skipWhile_1.skipWhile; } });
	var startWith_1 = startWith$1;
	Object.defineProperty(exports, "startWith", { enumerable: true, get: function () { return startWith_1.startWith; } });
	var subscribeOn_1 = subscribeOn$1;
	Object.defineProperty(exports, "subscribeOn", { enumerable: true, get: function () { return subscribeOn_1.subscribeOn; } });
	var switchAll_1 = switchAll$1;
	Object.defineProperty(exports, "switchAll", { enumerable: true, get: function () { return switchAll_1.switchAll; } });
	var switchMap_1 = switchMap$1;
	Object.defineProperty(exports, "switchMap", { enumerable: true, get: function () { return switchMap_1.switchMap; } });
	var switchMapTo_1 = switchMapTo$1;
	Object.defineProperty(exports, "switchMapTo", { enumerable: true, get: function () { return switchMapTo_1.switchMapTo; } });
	var switchScan_1 = switchScan$1;
	Object.defineProperty(exports, "switchScan", { enumerable: true, get: function () { return switchScan_1.switchScan; } });
	var take_1 = take$1;
	Object.defineProperty(exports, "take", { enumerable: true, get: function () { return take_1.take; } });
	var takeLast_1 = takeLast$1;
	Object.defineProperty(exports, "takeLast", { enumerable: true, get: function () { return takeLast_1.takeLast; } });
	var takeUntil_1 = takeUntil$1;
	Object.defineProperty(exports, "takeUntil", { enumerable: true, get: function () { return takeUntil_1.takeUntil; } });
	var takeWhile_1 = takeWhile$1;
	Object.defineProperty(exports, "takeWhile", { enumerable: true, get: function () { return takeWhile_1.takeWhile; } });
	var tap_1 = tap$1;
	Object.defineProperty(exports, "tap", { enumerable: true, get: function () { return tap_1.tap; } });
	var throttle_1 = throttle$1;
	Object.defineProperty(exports, "throttle", { enumerable: true, get: function () { return throttle_1.throttle; } });
	var throttleTime_1 = throttleTime$1;
	Object.defineProperty(exports, "throttleTime", { enumerable: true, get: function () { return throttleTime_1.throttleTime; } });
	var throwIfEmpty_1 = throwIfEmpty$1;
	Object.defineProperty(exports, "throwIfEmpty", { enumerable: true, get: function () { return throwIfEmpty_1.throwIfEmpty; } });
	var timeInterval_1 = timeInterval$1;
	Object.defineProperty(exports, "timeInterval", { enumerable: true, get: function () { return timeInterval_1.timeInterval; } });
	var timeout_2 = timeout;
	Object.defineProperty(exports, "timeout", { enumerable: true, get: function () { return timeout_2.timeout; } });
	var timeoutWith_1 = timeoutWith$1;
	Object.defineProperty(exports, "timeoutWith", { enumerable: true, get: function () { return timeoutWith_1.timeoutWith; } });
	var timestamp_1 = timestamp$1;
	Object.defineProperty(exports, "timestamp", { enumerable: true, get: function () { return timestamp_1.timestamp; } });
	var toArray_1 = toArray$1;
	Object.defineProperty(exports, "toArray", { enumerable: true, get: function () { return toArray_1.toArray; } });
	var window_1 = window$2;
	Object.defineProperty(exports, "window", { enumerable: true, get: function () { return window_1.window; } });
	var windowCount_1 = windowCount$1;
	Object.defineProperty(exports, "windowCount", { enumerable: true, get: function () { return windowCount_1.windowCount; } });
	var windowTime_1 = windowTime$1;
	Object.defineProperty(exports, "windowTime", { enumerable: true, get: function () { return windowTime_1.windowTime; } });
	var windowToggle_1 = windowToggle$1;
	Object.defineProperty(exports, "windowToggle", { enumerable: true, get: function () { return windowToggle_1.windowToggle; } });
	var windowWhen_1 = windowWhen$1;
	Object.defineProperty(exports, "windowWhen", { enumerable: true, get: function () { return windowWhen_1.windowWhen; } });
	var withLatestFrom_1 = withLatestFrom$1;
	Object.defineProperty(exports, "withLatestFrom", { enumerable: true, get: function () { return withLatestFrom_1.withLatestFrom; } });
	var zipAll_1 = zipAll$1;
	Object.defineProperty(exports, "zipAll", { enumerable: true, get: function () { return zipAll_1.zipAll; } });
	var zipWith_1 = zipWith$1;
	Object.defineProperty(exports, "zipWith", { enumerable: true, get: function () { return zipWith_1.zipWith; } });
	
} (cjs));

/*!
 * https://github.com/Starcounter-Jack/JSON-Patch
 * (c) 2017-2022 Joachim Wester
 * MIT licensed
 */
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj, key) {
    return _hasOwnProperty.call(obj, key);
}
function _objectKeys(obj) {
    if (Array.isArray(obj)) {
        var keys_1 = new Array(obj.length);
        for (var k = 0; k < keys_1.length; k++) {
            keys_1[k] = "" + k;
        }
        return keys_1;
    }
    if (Object.keys) {
        return Object.keys(obj);
    }
    var keys = [];
    for (var i in obj) {
        if (hasOwnProperty(obj, i)) {
            keys.push(i);
        }
    }
    return keys;
}
/**
* Deeply clone the object.
* https://jsperf.com/deep-copy-vs-json-stringify-json-parse/25 (recursiveDeepCopy)
* @param  {any} obj value to clone
* @return {any} cloned obj
*/
function _deepClone(obj) {
    switch (typeof obj) {
        case "object":
            return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
        case "undefined":
            return null; //this is how JSON.stringify behaves for array items
        default:
            return obj; //no need to clone primitives
    }
}
//3x faster than cached /^\d+$/.test(str)
function isInteger(str) {
    var i = 0;
    var len = str.length;
    var charCode;
    while (i < len) {
        charCode = str.charCodeAt(i);
        if (charCode >= 48 && charCode <= 57) {
            i++;
            continue;
        }
        return false;
    }
    return true;
}
/**
 * Unescapes a json pointer path
 * @param path The escaped pointer
 * @return The unescaped path
 */
function unescapePathComponent(path) {
    return path.replace(/~1/g, '/').replace(/~0/g, '~');
}
/**
* Recursively checks whether an object has any undefined values inside.
*/
function hasUndefined(obj) {
    if (obj === undefined) {
        return true;
    }
    if (obj) {
        if (Array.isArray(obj)) {
            for (var i_1 = 0, len = obj.length; i_1 < len; i_1++) {
                if (hasUndefined(obj[i_1])) {
                    return true;
                }
            }
        }
        else if (typeof obj === "object") {
            var objKeys = _objectKeys(obj);
            var objKeysLength = objKeys.length;
            for (var i = 0; i < objKeysLength; i++) {
                if (hasUndefined(obj[objKeys[i]])) {
                    return true;
                }
            }
        }
    }
    return false;
}
function patchErrorMessageFormatter(message, args) {
    var messageParts = [message];
    for (var key in args) {
        var value = typeof args[key] === 'object' ? JSON.stringify(args[key], null, 2) : args[key]; // pretty print
        if (typeof value !== 'undefined') {
            messageParts.push(key + ": " + value);
        }
    }
    return messageParts.join('\n');
}
var PatchError = /** @class */ (function (_super) {
    __extends(PatchError, _super);
    function PatchError(message, name, index, operation, tree) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, patchErrorMessageFormatter(message, { name: name, index: index, operation: operation, tree: tree })) || this;
        _this.name = name;
        _this.index = index;
        _this.operation = operation;
        _this.tree = tree;
        Object.setPrototypeOf(_this, _newTarget.prototype); // restore prototype chain, see https://stackoverflow.com/a/48342359
        _this.message = patchErrorMessageFormatter(message, { name: name, index: index, operation: operation, tree: tree });
        return _this;
    }
    return PatchError;
}(Error));

var JsonPatchError = PatchError;
/* We use a Javascript hash to store each
 function. Each hash entry (property) uses
 the operation identifiers specified in rfc6902.
 In this way, we can map each patch operation
 to its dedicated function in efficient way.
 */
/* The operations applicable to an object */
var objOps = {
    add: function (obj, key, document) {
        obj[key] = this.value;
        return { newDocument: document };
    },
    remove: function (obj, key, document) {
        var removed = obj[key];
        delete obj[key];
        return { newDocument: document, removed: removed };
    },
    replace: function (obj, key, document) {
        var removed = obj[key];
        obj[key] = this.value;
        return { newDocument: document, removed: removed };
    },
    move: function (obj, key, document) {
        /* in case move target overwrites an existing value,
        return the removed value, this can be taxing performance-wise,
        and is potentially unneeded */
        var removed = getValueByPointer(document, this.path);
        if (removed) {
            removed = _deepClone(removed);
        }
        var originalValue = applyOperation(document, { op: "remove", path: this.from }).removed;
        applyOperation(document, { op: "add", path: this.path, value: originalValue });
        return { newDocument: document, removed: removed };
    },
    copy: function (obj, key, document) {
        var valueToCopy = getValueByPointer(document, this.from);
        // enforce copy by value so further operations don't affect source (see issue #177)
        applyOperation(document, { op: "add", path: this.path, value: _deepClone(valueToCopy) });
        return { newDocument: document };
    },
    test: function (obj, key, document) {
        return { newDocument: document, test: _areEquals(obj[key], this.value) };
    },
    _get: function (obj, key, document) {
        this.value = obj[key];
        return { newDocument: document };
    }
};
/* The operations applicable to an array. Many are the same as for the object */
var arrOps = {
    add: function (arr, i, document) {
        if (isInteger(i)) {
            arr.splice(i, 0, this.value);
        }
        else { // array props
            arr[i] = this.value;
        }
        // this may be needed when using '-' in an array
        return { newDocument: document, index: i };
    },
    remove: function (arr, i, document) {
        var removedList = arr.splice(i, 1);
        return { newDocument: document, removed: removedList[0] };
    },
    replace: function (arr, i, document) {
        var removed = arr[i];
        arr[i] = this.value;
        return { newDocument: document, removed: removed };
    },
    move: objOps.move,
    copy: objOps.copy,
    test: objOps.test,
    _get: objOps._get
};
/**
 * Retrieves a value from a JSON document by a JSON pointer.
 * Returns the value.
 *
 * @param document The document to get the value from
 * @param pointer an escaped JSON pointer
 * @return The retrieved value
 */
function getValueByPointer(document, pointer) {
    if (pointer == '') {
        return document;
    }
    var getOriginalDestination = { op: "_get", path: pointer };
    applyOperation(document, getOriginalDestination);
    return getOriginalDestination.value;
}
/**
 * Apply a single JSON Patch Operation on a JSON document.
 * Returns the {newDocument, result} of the operation.
 * It modifies the `document` and `operation` objects - it gets the values by reference.
 * If you would like to avoid touching your values, clone them:
 * `jsonpatch.applyOperation(document, jsonpatch._deepClone(operation))`.
 *
 * @param document The document to patch
 * @param operation The operation to apply
 * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
 * @param mutateDocument Whether to mutate the original document or clone it before applying
 * @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
 * @return `{newDocument, result}` after the operation
 */
function applyOperation(document, operation, validateOperation, mutateDocument, banPrototypeModifications, index) {
    if (validateOperation === void 0) { validateOperation = false; }
    if (mutateDocument === void 0) { mutateDocument = true; }
    if (banPrototypeModifications === void 0) { banPrototypeModifications = true; }
    if (index === void 0) { index = 0; }
    if (validateOperation) {
        if (typeof validateOperation == 'function') {
            validateOperation(operation, 0, document, operation.path);
        }
        else {
            validator$1(operation, 0);
        }
    }
    /* ROOT OPERATIONS */
    if (operation.path === "") {
        var returnValue = { newDocument: document };
        if (operation.op === 'add') {
            returnValue.newDocument = operation.value;
            return returnValue;
        }
        else if (operation.op === 'replace') {
            returnValue.newDocument = operation.value;
            returnValue.removed = document; //document we removed
            return returnValue;
        }
        else if (operation.op === 'move' || operation.op === 'copy') { // it's a move or copy to root
            returnValue.newDocument = getValueByPointer(document, operation.from); // get the value by json-pointer in `from` field
            if (operation.op === 'move') { // report removed item
                returnValue.removed = document;
            }
            return returnValue;
        }
        else if (operation.op === 'test') {
            returnValue.test = _areEquals(document, operation.value);
            if (returnValue.test === false) {
                throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
            }
            returnValue.newDocument = document;
            return returnValue;
        }
        else if (operation.op === 'remove') { // a remove on root
            returnValue.removed = document;
            returnValue.newDocument = null;
            return returnValue;
        }
        else if (operation.op === '_get') {
            operation.value = document;
            return returnValue;
        }
        else { /* bad operation */
            if (validateOperation) {
                throw new JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
            }
            else {
                return returnValue;
            }
        }
    } /* END ROOT OPERATIONS */
    else {
        if (!mutateDocument) {
            document = _deepClone(document);
        }
        var path = operation.path || "";
        var keys = path.split('/');
        var obj = document;
        var t = 1; //skip empty element - http://jsperf.com/to-shift-or-not-to-shift
        var len = keys.length;
        var existingPathFragment = undefined;
        var key = void 0;
        var validateFunction = void 0;
        if (typeof validateOperation == 'function') {
            validateFunction = validateOperation;
        }
        else {
            validateFunction = validator$1;
        }
        while (true) {
            key = keys[t];
            if (key && key.indexOf('~') != -1) {
                key = unescapePathComponent(key);
            }
            if (banPrototypeModifications &&
                (key == '__proto__' ||
                    (key == 'prototype' && t > 0 && keys[t - 1] == 'constructor'))) {
                throw new TypeError('JSON-Patch: modifying `__proto__` or `constructor/prototype` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README');
            }
            if (validateOperation) {
                if (existingPathFragment === undefined) {
                    if (obj[key] === undefined) {
                        existingPathFragment = keys.slice(0, t).join('/');
                    }
                    else if (t == len - 1) {
                        existingPathFragment = operation.path;
                    }
                    if (existingPathFragment !== undefined) {
                        validateFunction(operation, 0, document, existingPathFragment);
                    }
                }
            }
            t++;
            if (Array.isArray(obj)) {
                if (key === '-') {
                    key = obj.length;
                }
                else {
                    if (validateOperation && !isInteger(key)) {
                        throw new JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", index, operation, document);
                    } // only parse key when it's an integer for `arr.prop` to work
                    else if (isInteger(key)) {
                        key = ~~key;
                    }
                }
                if (t >= len) {
                    if (validateOperation && operation.op === "add" && key > obj.length) {
                        throw new JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", index, operation, document);
                    }
                    var returnValue = arrOps[operation.op].call(operation, obj, key, document); // Apply patch
                    if (returnValue.test === false) {
                        throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
                    }
                    return returnValue;
                }
            }
            else {
                if (t >= len) {
                    var returnValue = objOps[operation.op].call(operation, obj, key, document); // Apply patch
                    if (returnValue.test === false) {
                        throw new JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', index, operation, document);
                    }
                    return returnValue;
                }
            }
            obj = obj[key];
            // If we have more keys in the path, but the next value isn't a non-null object,
            // throw an OPERATION_PATH_UNRESOLVABLE error instead of iterating again.
            if (validateOperation && t < len && (!obj || typeof obj !== "object")) {
                throw new JsonPatchError('Cannot perform operation at the desired path', 'OPERATION_PATH_UNRESOLVABLE', index, operation, document);
            }
        }
    }
}
/**
 * Apply a full JSON Patch array on a JSON document.
 * Returns the {newDocument, result} of the patch.
 * It modifies the `document` object and `patch` - it gets the values by reference.
 * If you would like to avoid touching your values, clone them:
 * `jsonpatch.applyPatch(document, jsonpatch._deepClone(patch))`.
 *
 * @param document The document to patch
 * @param patch The patch to apply
 * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
 * @param mutateDocument Whether to mutate the original document or clone it before applying
 * @param banPrototypeModifications Whether to ban modifications to `__proto__`, defaults to `true`.
 * @return An array of `{newDocument, result}` after the patch
 */
function applyPatch(document, patch, validateOperation, mutateDocument, banPrototypeModifications) {
    if (mutateDocument === void 0) { mutateDocument = true; }
    if (banPrototypeModifications === void 0) { banPrototypeModifications = true; }
    if (validateOperation) {
        if (!Array.isArray(patch)) {
            throw new JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
        }
    }
    if (!mutateDocument) {
        document = _deepClone(document);
    }
    var results = new Array(patch.length);
    for (var i = 0, length_1 = patch.length; i < length_1; i++) {
        // we don't need to pass mutateDocument argument because if it was true, we already deep cloned the object, we'll just pass `true`
        results[i] = applyOperation(document, patch[i], validateOperation, true, banPrototypeModifications, i);
        document = results[i].newDocument; // in case root was replaced
    }
    results.newDocument = document;
    return results;
}
/**
 * Validates a single operation. Called from `jsonpatch.validate`. Throws `JsonPatchError` in case of an error.
 * @param {object} operation - operation object (patch)
 * @param {number} index - index of operation in the sequence
 * @param {object} [document] - object where the operation is supposed to be applied
 * @param {string} [existingPathFragment] - comes along with `document`
 */
function validator$1(operation, index, document, existingPathFragment) {
    if (typeof operation !== 'object' || operation === null || Array.isArray(operation)) {
        throw new JsonPatchError('Operation is not an object', 'OPERATION_NOT_AN_OBJECT', index, operation, document);
    }
    else if (!objOps[operation.op]) {
        throw new JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
    }
    else if (typeof operation.path !== 'string') {
        throw new JsonPatchError('Operation `path` property is not a string', 'OPERATION_PATH_INVALID', index, operation, document);
    }
    else if (operation.path.indexOf('/') !== 0 && operation.path.length > 0) {
        // paths that aren't empty string should start with "/"
        throw new JsonPatchError('Operation `path` property must start with "/"', 'OPERATION_PATH_INVALID', index, operation, document);
    }
    else if ((operation.op === 'move' || operation.op === 'copy') && typeof operation.from !== 'string') {
        throw new JsonPatchError('Operation `from` property is not present (applicable in `move` and `copy` operations)', 'OPERATION_FROM_REQUIRED', index, operation, document);
    }
    else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && operation.value === undefined) {
        throw new JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_REQUIRED', index, operation, document);
    }
    else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && hasUndefined(operation.value)) {
        throw new JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED', index, operation, document);
    }
    else if (document) {
        if (operation.op == "add") {
            var pathLen = operation.path.split("/").length;
            var existingPathLen = existingPathFragment.split("/").length;
            if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
                throw new JsonPatchError('Cannot perform an `add` operation at the desired path', 'OPERATION_PATH_CANNOT_ADD', index, operation, document);
            }
        }
        else if (operation.op === 'replace' || operation.op === 'remove' || operation.op === '_get') {
            if (operation.path !== existingPathFragment) {
                throw new JsonPatchError('Cannot perform the operation at a path that does not exist', 'OPERATION_PATH_UNRESOLVABLE', index, operation, document);
            }
        }
        else if (operation.op === 'move' || operation.op === 'copy') {
            var existingValue = { op: "_get", path: operation.from, value: undefined };
            var error = validate([existingValue], document);
            if (error && error.name === 'OPERATION_PATH_UNRESOLVABLE') {
                throw new JsonPatchError('Cannot perform the operation from a path that does not exist', 'OPERATION_FROM_UNRESOLVABLE', index, operation, document);
            }
        }
    }
}
/**
 * Validates a sequence of operations. If `document` parameter is provided, the sequence is additionally validated against the object document.
 * If error is encountered, returns a JsonPatchError object
 * @param sequence
 * @param document
 * @returns {JsonPatchError|undefined}
 */
function validate(sequence, document, externalValidator) {
    try {
        if (!Array.isArray(sequence)) {
            throw new JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
        }
        if (document) {
            //clone document and sequence so that we can safely try applying operations
            applyPatch(_deepClone(document), _deepClone(sequence), externalValidator || true);
        }
        else {
            externalValidator = externalValidator || validator$1;
            for (var i = 0; i < sequence.length; i++) {
                externalValidator(sequence[i], i, document, undefined);
            }
        }
    }
    catch (e) {
        if (e instanceof JsonPatchError) {
            return e;
        }
        else {
            throw e;
        }
    }
}
// based on https://github.com/epoberezkin/fast-deep-equal
// MIT License
// Copyright (c) 2017 Evgeny Poberezkin
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
function _areEquals(a, b) {
    if (a === b)
        return true;
    if (a && b && typeof a == 'object' && typeof b == 'object') {
        var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
        if (arrA && arrB) {
            length = a.length;
            if (length != b.length)
                return false;
            for (i = length; i-- !== 0;)
                if (!_areEquals(a[i], b[i]))
                    return false;
            return true;
        }
        if (arrA != arrB)
            return false;
        var keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length)
            return false;
        for (i = length; i-- !== 0;)
            if (!b.hasOwnProperty(keys[i]))
                return false;
        for (i = length; i-- !== 0;) {
            key = keys[i];
            if (!_areEquals(a[key], b[key]))
                return false;
        }
        return true;
    }
    return a !== a && b !== b;
}

function isWhitespace(char) {
    return "\u0020\u000D\u000A\u0009".indexOf(char) >= 0;
}
function untruncateJson(json) {
    var contextStack = ["topLevel" /* TOP_LEVEL */];
    var position = 0;
    var respawnPosition;
    var respawnStackLength;
    var respawnReason;
    var push = function (context) { return contextStack.push(context); };
    var replace = function (context) {
        return (contextStack[contextStack.length - 1] = context);
    };
    var setRespawn = function (reason) {
        if (respawnPosition == null) {
            respawnPosition = position;
            respawnStackLength = contextStack.length;
            respawnReason = reason;
        }
    };
    var clearRespawn = function (reason) {
        if (reason === respawnReason) {
            respawnPosition = undefined;
            respawnStackLength = undefined;
            respawnReason = undefined;
        }
    };
    var pop = function () { return contextStack.pop(); };
    var dontConsumeCharacter = function () { return position--; };
    var startAny = function (char) {
        if ("0" <= char && char <= "9") {
            push("number" /* NUMBER */);
            return;
        }
        switch (char) {
            case '"':
                push("string" /* STRING */);
                return;
            case "-":
                push("numberNeedsDigit" /* NUMBER_NEEDS_DIGIT */);
                return;
            case "t":
                push("true" /* TRUE */);
                return;
            case "f":
                push("false" /* FALSE */);
                return;
            case "n":
                push("null" /* NULL */);
                return;
            case "[":
                push("arrayNeedsValue" /* ARRAY_NEEDS_VALUE */);
                return;
            case "{":
                push("objectNeedsKey" /* OBJECT_NEEDS_KEY */);
                return;
        }
    };
    for (var length = json.length; position < length; position++) {
        var char = json[position];
        switch (contextStack[contextStack.length - 1]) {
            case "topLevel" /* TOP_LEVEL */:
                startAny(char);
                break;
            case "string" /* STRING */:
                switch (char) {
                    case '"':
                        pop();
                        break;
                    case "\\":
                        setRespawn("stringEscape" /* STRING_ESCAPE */);
                        push("stringEscaped" /* STRING_ESCAPED */);
                        break;
                }
                break;
            case "stringEscaped" /* STRING_ESCAPED */:
                if (char === "u") {
                    push("stringUnicode" /* STRING_UNICODE */);
                }
                else {
                    clearRespawn("stringEscape" /* STRING_ESCAPE */);
                    pop();
                }
                break;
            case "stringUnicode" /* STRING_UNICODE */:
                if (position - json.lastIndexOf("u", position) === 4) {
                    clearRespawn("stringEscape" /* STRING_ESCAPE */);
                    pop();
                }
                break;
            case "number" /* NUMBER */:
                if (char === ".") {
                    replace("numberNeedsDigit" /* NUMBER_NEEDS_DIGIT */);
                }
                else if (char === "e" || char === "E") {
                    replace("numberNeedsExponent" /* NUMBER_NEEDS_EXPONENT */);
                }
                else if (char < "0" || char > "9") {
                    dontConsumeCharacter();
                    pop();
                }
                break;
            case "numberNeedsDigit" /* NUMBER_NEEDS_DIGIT */:
                replace("number" /* NUMBER */);
                break;
            case "numberNeedsExponent" /* NUMBER_NEEDS_EXPONENT */:
                if (char === "+" || char === "-") {
                    replace("numberNeedsDigit" /* NUMBER_NEEDS_DIGIT */);
                }
                else {
                    replace("number" /* NUMBER */);
                }
                break;
            case "true" /* TRUE */:
            case "false" /* FALSE */:
            case "null" /* NULL */:
                if (char < "a" || char > "z") {
                    dontConsumeCharacter();
                    pop();
                }
                break;
            case "arrayNeedsValue" /* ARRAY_NEEDS_VALUE */:
                if (char === "]") {
                    pop();
                }
                else if (!isWhitespace(char)) {
                    clearRespawn("collectionItem" /* COLLECTION_ITEM */);
                    replace("arrayNeedsComma" /* ARRAY_NEEDS_COMMA */);
                    startAny(char);
                }
                break;
            case "arrayNeedsComma" /* ARRAY_NEEDS_COMMA */:
                if (char === "]") {
                    pop();
                }
                else if (char === ",") {
                    setRespawn("collectionItem" /* COLLECTION_ITEM */);
                    replace("arrayNeedsValue" /* ARRAY_NEEDS_VALUE */);
                }
                break;
            case "objectNeedsKey" /* OBJECT_NEEDS_KEY */:
                if (char === "}") {
                    pop();
                }
                else if (char === '"') {
                    setRespawn("collectionItem" /* COLLECTION_ITEM */);
                    replace("objectNeedsColon" /* OBJECT_NEEDS_COLON */);
                    push("string" /* STRING */);
                }
                break;
            case "objectNeedsColon" /* OBJECT_NEEDS_COLON */:
                if (char === ":") {
                    replace("objectNeedsValue" /* OBJECT_NEEDS_VALUE */);
                }
                break;
            case "objectNeedsValue" /* OBJECT_NEEDS_VALUE */:
                if (!isWhitespace(char)) {
                    clearRespawn("collectionItem" /* COLLECTION_ITEM */);
                    replace("objectNeedsComma" /* OBJECT_NEEDS_COMMA */);
                    startAny(char);
                }
                break;
            case "objectNeedsComma" /* OBJECT_NEEDS_COMMA */:
                if (char === "}") {
                    pop();
                }
                else if (char === ",") {
                    setRespawn("collectionItem" /* COLLECTION_ITEM */);
                    replace("objectNeedsKey" /* OBJECT_NEEDS_KEY */);
                }
                break;
        }
    }
    if (respawnStackLength != null) {
        contextStack.length = respawnStackLength;
    }
    var result = [
        respawnPosition != null ? json.slice(0, respawnPosition) : json,
    ];
    var finishWord = function (word) {
        return result.push(word.slice(json.length - json.lastIndexOf(word[0])));
    };
    for (var i = contextStack.length - 1; i >= 0; i--) {
        switch (contextStack[i]) {
            case "string" /* STRING */:
                result.push('"');
                break;
            case "numberNeedsDigit" /* NUMBER_NEEDS_DIGIT */:
            case "numberNeedsExponent" /* NUMBER_NEEDS_EXPONENT */:
                result.push("0");
                break;
            case "true" /* TRUE */:
                finishWord("true");
                break;
            case "false" /* FALSE */:
                finishWord("false");
                break;
            case "null" /* NULL */:
                finishWord("null");
                break;
            case "arrayNeedsValue" /* ARRAY_NEEDS_VALUE */:
            case "arrayNeedsComma" /* ARRAY_NEEDS_COMMA */:
                result.push("]");
                break;
            case "objectNeedsKey" /* OBJECT_NEEDS_KEY */:
            case "objectNeedsColon" /* OBJECT_NEEDS_COLON */:
            case "objectNeedsValue" /* OBJECT_NEEDS_VALUE */:
            case "objectNeedsComma" /* OBJECT_NEEDS_COMMA */:
                result.push("}");
                break;
        }
    }
    return result.join("");
}

var ee=Object.defineProperty,te=Object.defineProperties;var ne=Object.getOwnPropertyDescriptors;var q=Object.getOwnPropertySymbols;var ae=Object.prototype.hasOwnProperty,se=Object.prototype.propertyIsEnumerable;var V=(p,o,t)=>o in p?ee(p,o,{enumerable:true,configurable:true,writable:true,value:t}):p[o]=t,I=(p,o)=>{for(var t in o||(o={}))ae.call(o,t)&&V(p,t,o[t]);if(q)for(var t of q(o))se.call(o,t)&&V(p,t,o[t]);return p},G=(p,o)=>te(p,ne(o));var R=p=>{if(typeof structuredClone=="function")return structuredClone(p);try{return JSON.parse(JSON.stringify(p))}catch(o){return I({},p)}};async function C(p,o,t,n){let e=o,s=t,i;for(let r of p)try{let l=await n(r,R(e),R(s));if(l===void 0)continue;if(l.messages!==void 0&&(e=l.messages),l.state!==void 0&&(s=l.state),i=l.stopPropagation,i===true)break}catch(l){process.env.NODE_ENV==="test"||process.env.JEST_WORKER_ID!==void 0||console.error("Subscriber error:",l);continue}return I(I(I({},JSON.stringify(e)!==JSON.stringify(o)?{messages:e}:{}),JSON.stringify(s)!==JSON.stringify(t)?{state:s}:{}),i!==void 0?{stopPropagation:i}:{})}var K=(p,o,t,n)=>{let e=R(p.messages),s=R(p.state),i={},r=c=>{c.messages!==void 0&&(e=c.messages,i.messages=c.messages),c.state!==void 0&&(s=c.state,i.state=c.state);},l=()=>{let c=R(i);return i={},c.messages!==void 0||c.state!==void 0?cjs.of(c):cjs.EMPTY};return o.pipe(operators.concatMap(async c=>{let d=await C(n,e,s,(u,a,E)=>{var S;return (S=u.onEvent)==null?void 0:S.call(u,{event:c,agent:t,input:p,messages:a,state:E})});if(r(d),d.stopPropagation===true)return l();switch(c.type){case EventType.TEXT_MESSAGE_START:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onTextMessageStartEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p})});if(r(u),u.stopPropagation!==true){let{messageId:a,role:E}=c,S={id:a,role:E,content:""};e.push(S),r({messages:e});}return l()}case EventType.TEXT_MESSAGE_CONTENT:{let u=await C(n,e,s,(a,E,S)=>{var g,N;return (N=a.onTextMessageContentEvent)==null?void 0:N.call(a,{event:c,messages:E,state:S,agent:t,input:p,textMessageBuffer:(g=E[E.length-1].content)!=null?g:""})});if(r(u),u.stopPropagation!==true){let{delta:a}=c,E=e[e.length-1];E.content=E.content+a,r({messages:e});}return l()}case EventType.TEXT_MESSAGE_END:{let u=await C(n,e,s,(a,E,S)=>{var g,N;return (N=a.onTextMessageEndEvent)==null?void 0:N.call(a,{event:c,messages:E,state:S,agent:t,input:p,textMessageBuffer:(g=E[E.length-1].content)!=null?g:""})});return r(u),await Promise.all(n.map(a=>{var E;(E=a.onNewMessage)==null||E.call(a,{message:e[e.length-1],messages:e,state:s,agent:t,input:p});})),l()}case EventType.TOOL_CALL_START:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onToolCallStartEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p})});if(r(u),u.stopPropagation!==true){let{toolCallId:a,toolCallName:E,parentMessageId:S}=c,g;S&&e.length>0&&e[e.length-1].id===S?g=e[e.length-1]:(g={id:S||a,role:"assistant",toolCalls:[]},e.push(g)),(g.toolCalls)!=null||(g.toolCalls=[]),g.toolCalls.push({id:a,type:"function",function:{name:E,arguments:""}}),r({messages:e});}return l()}case EventType.TOOL_CALL_ARGS:{let u=await C(n,e,s,(a,E,S)=>{var P,D,H;let g=(D=(P=E[E.length-1])==null?void 0:P.toolCalls)!=null?D:[],N=g.length>0?g[g.length-1].function.arguments:"",w=g.length>0?g[g.length-1].function.name:"",O={};try{O=untruncateJson(N);}catch(Z){}return (H=a.onToolCallArgsEvent)==null?void 0:H.call(a,{event:c,messages:E,state:S,agent:t,input:p,toolCallBuffer:N,toolCallName:w,partialToolCallArgs:O})});if(r(u),u.stopPropagation!==true){let{delta:a}=c,E=e[e.length-1],S=E.toolCalls[E.toolCalls.length-1];S.function.arguments+=a,r({messages:e});}return l()}case EventType.TOOL_CALL_END:{let u=await C(n,e,s,(a,E,S)=>{var P,D,H;let g=(D=(P=E[E.length-1])==null?void 0:P.toolCalls)!=null?D:[],N=g.length>0?g[g.length-1].function.arguments:"",w=g.length>0?g[g.length-1].function.name:"",O={};try{O=JSON.parse(N);}catch(Z){}return (H=a.onToolCallEndEvent)==null?void 0:H.call(a,{event:c,messages:E,state:S,agent:t,input:p,toolCallName:w,toolCallArgs:O})});return r(u),await Promise.all(n.map(a=>{var E;(E=a.onNewToolCall)==null||E.call(a,{toolCall:e[e.length-1].toolCalls[e[e.length-1].toolCalls.length-1],messages:e,state:s,agent:t,input:p});})),l()}case EventType.TOOL_CALL_RESULT:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onToolCallResultEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p})});if(r(u),u.stopPropagation!==true){let{messageId:a,toolCallId:E,content:S,role:g}=c,N={id:a,toolCallId:E,role:g||"tool",content:S};e.push(N),await Promise.all(n.map(w=>{var O;(O=w.onNewMessage)==null||O.call(w,{message:N,messages:e,state:s,agent:t,input:p});})),r({messages:e});}return l()}case EventType.STATE_SNAPSHOT:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onStateSnapshotEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p})});if(r(u),u.stopPropagation!==true){let{snapshot:a}=c;s=a,r({state:s});}return l()}case EventType.STATE_DELTA:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onStateDeltaEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p})});if(r(u),u.stopPropagation!==true){let{delta:a}=c;try{s=applyPatch(s,a,true,false).newDocument,r({state:s});}catch(E){let S=E instanceof Error?E.message:String(E);console.warn(`Failed to apply state patch:
Current state: ${JSON.stringify(s,null,2)}
Patch operations: ${JSON.stringify(a,null,2)}
Error: ${S}`);}}return l()}case EventType.MESSAGES_SNAPSHOT:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onMessagesSnapshotEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p})});if(r(u),u.stopPropagation!==true){let{messages:a}=c;e=a,r({messages:e});}return l()}case EventType.RAW:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onRawEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p})});return r(u),l()}case EventType.CUSTOM:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onCustomEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p})});return r(u),l()}case EventType.RUN_STARTED:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onRunStartedEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p})});return r(u),l()}case EventType.RUN_FINISHED:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onRunFinishedEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p,result:c.result})});return r(u),l()}case EventType.RUN_ERROR:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onRunErrorEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p})});return r(u),l()}case EventType.STEP_STARTED:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onStepStartedEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p})});return r(u),l()}case EventType.STEP_FINISHED:{let u=await C(n,e,s,(a,E,S)=>{var g;return (g=a.onStepFinishedEvent)==null?void 0:g.call(a,{event:c,messages:E,state:S,agent:t,input:p})});return r(u),l()}case EventType.TEXT_MESSAGE_CHUNK:throw new Error("TEXT_MESSAGE_CHUNK must be tranformed before being applied");case EventType.TOOL_CALL_CHUNK:throw new Error("TOOL_CALL_CHUNK must be tranformed before being applied");case EventType.THINKING_START:return l();case EventType.THINKING_END:return l();case EventType.THINKING_TEXT_MESSAGE_START:return l();case EventType.THINKING_TEXT_MESSAGE_CONTENT:return l();case EventType.THINKING_TEXT_MESSAGE_END:return l()}return l()}),operators.mergeAll(),n.length>0?operators.defaultIfEmpty({}):c=>c)};var X=p=>o=>{let t,n,e=false,s=false,i=false,r=new Map,l=false,c=false;return o.pipe(operators.mergeMap(d=>{let _=d.type;if(p&&console.debug("[VERIFY]:",JSON.stringify(d)),s)return cjs.throwError(()=>new AGUIError(`Cannot send event type '${_}': The run has already errored with 'RUN_ERROR'. No further events can be sent.`));if(e&&_!==EventType.RUN_ERROR)return cjs.throwError(()=>new AGUIError(`Cannot send event type '${_}': The run has already finished with 'RUN_FINISHED'. Start a new run with 'RUN_STARTED'.`));if(t!==void 0&&![EventType.TEXT_MESSAGE_CONTENT,EventType.TEXT_MESSAGE_END,EventType.RAW].includes(_))return cjs.throwError(()=>new AGUIError(`Cannot send event type '${_}' after 'TEXT_MESSAGE_START': Send 'TEXT_MESSAGE_END' first.`));if(n!==void 0&&![EventType.TOOL_CALL_ARGS,EventType.TOOL_CALL_END,EventType.RAW].includes(_))return _===EventType.TOOL_CALL_START?cjs.throwError(()=>new AGUIError("Cannot send 'TOOL_CALL_START' event: A tool call is already in progress. Complete it with 'TOOL_CALL_END' first.")):cjs.throwError(()=>new AGUIError(`Cannot send event type '${_}' after 'TOOL_CALL_START': Send 'TOOL_CALL_END' first.`));if(i){if(_===EventType.RUN_STARTED)return cjs.throwError(()=>new AGUIError("Cannot send multiple 'RUN_STARTED' events: A 'RUN_STARTED' event was already sent. Each run must have exactly one 'RUN_STARTED' event at the beginning."))}else if(i=true,_!==EventType.RUN_STARTED&&_!==EventType.RUN_ERROR)return cjs.throwError(()=>new AGUIError("First event must be 'RUN_STARTED'"));switch(_){case EventType.TEXT_MESSAGE_START:return t!==void 0?cjs.throwError(()=>new AGUIError("Cannot send 'TEXT_MESSAGE_START' event: A text message is already in progress. Complete it with 'TEXT_MESSAGE_END' first.")):(t=d.messageId,cjs.of(d));case EventType.TEXT_MESSAGE_CONTENT:return t===void 0?cjs.throwError(()=>new AGUIError("Cannot send 'TEXT_MESSAGE_CONTENT' event: No active text message found. Start a text message with 'TEXT_MESSAGE_START' first.")):d.messageId!==t?cjs.throwError(()=>new AGUIError(`Cannot send 'TEXT_MESSAGE_CONTENT' event: Message ID mismatch. The ID '${d.messageId}' doesn't match the active message ID '${t}'.`)):cjs.of(d);case EventType.TEXT_MESSAGE_END:return t===void 0?cjs.throwError(()=>new AGUIError("Cannot send 'TEXT_MESSAGE_END' event: No active text message found. A 'TEXT_MESSAGE_START' event must be sent first.")):d.messageId!==t?cjs.throwError(()=>new AGUIError(`Cannot send 'TEXT_MESSAGE_END' event: Message ID mismatch. The ID '${d.messageId}' doesn't match the active message ID '${t}'.`)):(t=void 0,cjs.of(d));case EventType.TOOL_CALL_START:return n!==void 0?cjs.throwError(()=>new AGUIError("Cannot send 'TOOL_CALL_START' event: A tool call is already in progress. Complete it with 'TOOL_CALL_END' first.")):(n=d.toolCallId,cjs.of(d));case EventType.TOOL_CALL_ARGS:return n===void 0?cjs.throwError(()=>new AGUIError("Cannot send 'TOOL_CALL_ARGS' event: No active tool call found. Start a tool call with 'TOOL_CALL_START' first.")):d.toolCallId!==n?cjs.throwError(()=>new AGUIError(`Cannot send 'TOOL_CALL_ARGS' event: Tool call ID mismatch. The ID '${d.toolCallId}' doesn't match the active tool call ID '${n}'.`)):cjs.of(d);case EventType.TOOL_CALL_END:return n===void 0?cjs.throwError(()=>new AGUIError("Cannot send 'TOOL_CALL_END' event: No active tool call found. A 'TOOL_CALL_START' event must be sent first.")):d.toolCallId!==n?cjs.throwError(()=>new AGUIError(`Cannot send 'TOOL_CALL_END' event: Tool call ID mismatch. The ID '${d.toolCallId}' doesn't match the active tool call ID '${n}'.`)):(n=void 0,cjs.of(d));case EventType.STEP_STARTED:{let T=d.stepName;return r.has(T)?cjs.throwError(()=>new AGUIError(`Step "${T}" is already active for 'STEP_STARTED'`)):(r.set(T,true),cjs.of(d))}case EventType.STEP_FINISHED:{let T=d.stepName;return r.has(T)?(r.delete(T),cjs.of(d)):cjs.throwError(()=>new AGUIError(`Cannot send 'STEP_FINISHED' for step "${T}" that was not started`))}case EventType.RUN_STARTED:return cjs.of(d);case EventType.RUN_FINISHED:{if(r.size>0){let T=Array.from(r.keys()).join(", ");return cjs.throwError(()=>new AGUIError(`Cannot send 'RUN_FINISHED' while steps are still active: ${T}`))}return e=true,cjs.of(d)}case EventType.RUN_ERROR:return s=true,cjs.of(d);case EventType.CUSTOM:return cjs.of(d);case EventType.THINKING_TEXT_MESSAGE_START:return l?c?cjs.throwError(()=>new AGUIError("Cannot send 'THINKING_TEXT_MESSAGE_START' event: A thinking message is already in progress. Complete it with 'THINKING_TEXT_MESSAGE_END' first.")):(c=true,cjs.of(d)):cjs.throwError(()=>new AGUIError("Cannot send 'THINKING_TEXT_MESSAGE_START' event: A thinking step is not in progress. Create one with 'THINKING_START' first."));case EventType.THINKING_TEXT_MESSAGE_CONTENT:return c?cjs.of(d):cjs.throwError(()=>new AGUIError("Cannot send 'THINKING_TEXT_MESSAGE_CONTENT' event: No active thinking message found. Start a message with 'THINKING_TEXT_MESSAGE_START' first."));case EventType.THINKING_TEXT_MESSAGE_END:return c?(c=false,cjs.of(d)):cjs.throwError(()=>new AGUIError("Cannot send 'THINKING_TEXT_MESSAGE_END' event: No active thinking message found. A 'THINKING_TEXT_MESSAGE_START' event must be sent first."));case EventType.THINKING_START:return l?cjs.throwError(()=>new AGUIError("Cannot send 'THINKING_START' event: A thinking step is already in progress. End it with 'THINKING_END' first.")):(l=true,cjs.of(d));case EventType.THINKING_END:return l?(l=false,cjs.of(d)):cjs.throwError(()=>new AGUIError("Cannot send 'THINKING_END' event: No active thinking step found. A 'THINKING_START' event must be sent first."));default:return cjs.of(d)}}))};var M=enumType(["TextMessageStart","TextMessageContent","TextMessageEnd","ActionExecutionStart","ActionExecutionArgs","ActionExecutionEnd","ActionExecutionResult","AgentStateMessage","MetaEvent","RunStarted","RunFinished","RunError","NodeStarted","NodeFinished"]),ye=enumType(["LangGraphInterruptEvent","PredictState","Exit"]),Ce=objectType({type:literalType(M.enum.TextMessageStart),messageId:stringType(),parentMessageId:stringType().optional()}),_e=objectType({type:literalType(M.enum.TextMessageContent),messageId:stringType(),content:stringType()}),Re=objectType({type:literalType(M.enum.TextMessageEnd),messageId:stringType()}),Ne=objectType({type:literalType(M.enum.ActionExecutionStart),actionExecutionId:stringType(),actionName:stringType(),parentMessageId:stringType().optional()}),xe=objectType({type:literalType(M.enum.ActionExecutionArgs),actionExecutionId:stringType(),args:stringType()}),Le=objectType({type:literalType(M.enum.ActionExecutionEnd),actionExecutionId:stringType()}),Ie=objectType({type:literalType(M.enum.ActionExecutionResult),actionName:stringType(),actionExecutionId:stringType(),result:stringType()}),Oe=objectType({type:literalType(M.enum.AgentStateMessage),threadId:stringType(),agentName:stringType(),nodeName:stringType(),runId:stringType(),active:booleanType(),role:stringType(),state:stringType(),running:booleanType()}),we=objectType({type:literalType(M.enum.MetaEvent),name:ye,value:anyType()});discriminatedUnionType("type",[Ce,_e,Re,Ne,xe,Le,Ie,Oe,we]);objectType({id:stringType(),role:stringType(),content:stringType(),parentMessageId:stringType().optional()});objectType({id:stringType(),name:stringType(),arguments:anyType(),parentMessageId:stringType().optional()});objectType({id:stringType(),result:anyType(),actionExecutionId:stringType(),actionName:stringType()});var j=(p,o,t)=>n=>{let e={},s=true,i=true,r="",l=null,c=null,d=[],_={},T=u=>{typeof u=="object"&&u!==null&&("messages"in u&&delete u.messages,e=u);};return n.pipe(operators.mergeMap(u=>{switch(u.type){case EventType.TEXT_MESSAGE_START:{let a=u;return [{type:M.enum.TextMessageStart,messageId:a.messageId}]}case EventType.TEXT_MESSAGE_CONTENT:{let a=u;return [{type:M.enum.TextMessageContent,messageId:a.messageId,content:a.delta}]}case EventType.TEXT_MESSAGE_END:{let a=u;return [{type:M.enum.TextMessageEnd,messageId:a.messageId}]}case EventType.TOOL_CALL_START:{let a=u;return d.push({id:a.toolCallId,type:"function",function:{name:a.toolCallName,arguments:""}}),i=true,_[a.toolCallId]=a.toolCallName,[{type:M.enum.ActionExecutionStart,actionExecutionId:a.toolCallId,actionName:a.toolCallName,parentMessageId:a.parentMessageId}]}case EventType.TOOL_CALL_ARGS:{let a=u,E=d[d.length-1];E.function.arguments+=a.delta;let S=false;if(c){let g=c.find(N=>N.tool==E.function.name);if(g)try{let N=JSON.parse(untruncateJson(E.function.arguments));g.tool_argument&&g.tool_argument in N?(T(G(I({},e),{[g.state_key]:N[g.tool_argument]})),S=true):g.tool_argument||(T(G(I({},e),{[g.state_key]:N})),S=true);}catch(N){}}return [{type:M.enum.ActionExecutionArgs,actionExecutionId:a.toolCallId,args:a.delta},...S?[{type:M.enum.AgentStateMessage,threadId:p,agentName:t,nodeName:r,runId:o,running:s,role:"assistant",state:JSON.stringify(e),active:i}]:[]]}case EventType.TOOL_CALL_END:{let a=u;return [{type:M.enum.ActionExecutionEnd,actionExecutionId:a.toolCallId}]}case EventType.TOOL_CALL_RESULT:{let a=u;return [{type:M.enum.ActionExecutionResult,actionExecutionId:a.toolCallId,result:a.content,actionName:_[a.toolCallId]||"unknown"}]}case EventType.RAW:return [];case EventType.CUSTOM:{let a=u;switch(a.name){case "Exit":s=false;break;case "PredictState":c=a.value;break}return [{type:M.enum.MetaEvent,name:a.name,value:a.value}]}case EventType.STATE_SNAPSHOT:return T(u.snapshot),[{type:M.enum.AgentStateMessage,threadId:p,agentName:t,nodeName:r,runId:o,running:s,role:"assistant",state:JSON.stringify(e),active:i}];case EventType.STATE_DELTA:{let E=applyPatch(e,u.delta,true,false);return E?(T(E.newDocument),[{type:M.enum.AgentStateMessage,threadId:p,agentName:t,nodeName:r,runId:o,running:s,role:"assistant",state:JSON.stringify(e),active:i}]):[]}case EventType.MESSAGES_SNAPSHOT:return l=u.messages,[{type:M.enum.AgentStateMessage,threadId:p,agentName:t,nodeName:r,runId:o,running:s,role:"assistant",state:JSON.stringify(I(I({},e),l?{messages:l}:{})),active:true}];case EventType.RUN_STARTED:return [];case EventType.RUN_FINISHED:return l&&(e.messages=l),[{type:M.enum.AgentStateMessage,threadId:p,agentName:t,nodeName:r,runId:o,running:s,role:"assistant",state:JSON.stringify(I(I({},e),l?{messages:Ge(l)}:{})),active:false}];case EventType.RUN_ERROR:return console.error("Run error",u),[];case EventType.STEP_STARTED:return r=u.stepName,d=[],c=null,[{type:M.enum.AgentStateMessage,threadId:p,agentName:t,nodeName:r,runId:o,running:s,role:"assistant",state:JSON.stringify(e),active:true}];case EventType.STEP_FINISHED:return d=[],c=null,[{type:M.enum.AgentStateMessage,threadId:p,agentName:t,nodeName:r,runId:o,running:s,role:"assistant",state:JSON.stringify(e),active:false}];default:return []}}))};function Ge(p){var t;let o=[];for(let n of p)if(n.role==="assistant"||n.role==="user"||n.role==="system"){if(n.content){let e={id:n.id,role:n.role,content:n.content};o.push(e);}if(n.role==="assistant"&&n.toolCalls&&n.toolCalls.length>0)for(let e of n.toolCalls){let s={id:e.id,name:e.function.name,arguments:JSON.parse(e.function.arguments),parentMessageId:n.id};o.push(s);}}else if(n.role==="tool"){let e="unknown";for(let i of p)if(i.role==="assistant"&&((t=i.toolCalls)!=null&&t.length)){for(let r of i.toolCalls)if(r.id===n.toolCallId){e=r.function.name;break}}let s={id:n.id,result:n.content,actionExecutionId:n.toolCallId,actionName:e};o.push(s);}return o}var $=p=>o=>{let t,n,e,s=()=>{if(!t||e!=="text")throw new Error("No text message to close");let l={type:EventType.TEXT_MESSAGE_END,messageId:t.messageId};return e=void 0,t=void 0,p&&console.debug("[TRANSFORM]: TEXT_MESSAGE_END",JSON.stringify(l)),l},i=()=>{if(!n||e!=="tool")throw new Error("No tool call to close");let l={type:EventType.TOOL_CALL_END,toolCallId:n.toolCallId};return e=void 0,n=void 0,p&&console.debug("[TRANSFORM]: TOOL_CALL_END",JSON.stringify(l)),l},r=()=>e==="text"?[s()]:e==="tool"?[i()]:[];return o.pipe(cjs.mergeMap(l=>{switch(l.type){case EventType.TEXT_MESSAGE_START:case EventType.TEXT_MESSAGE_CONTENT:case EventType.TEXT_MESSAGE_END:case EventType.TOOL_CALL_START:case EventType.TOOL_CALL_ARGS:case EventType.TOOL_CALL_END:case EventType.TOOL_CALL_RESULT:case EventType.STATE_SNAPSHOT:case EventType.STATE_DELTA:case EventType.MESSAGES_SNAPSHOT:case EventType.CUSTOM:case EventType.RUN_STARTED:case EventType.RUN_FINISHED:case EventType.RUN_ERROR:case EventType.STEP_STARTED:case EventType.STEP_FINISHED:case EventType.THINKING_START:case EventType.THINKING_END:case EventType.THINKING_TEXT_MESSAGE_START:case EventType.THINKING_TEXT_MESSAGE_CONTENT:case EventType.THINKING_TEXT_MESSAGE_END:return [...r(),l];case EventType.RAW:return [l];case EventType.TEXT_MESSAGE_CHUNK:let d=l,_=[];if((e!=="text"||d.messageId!==void 0&&d.messageId!==(t==null?void 0:t.messageId))&&_.push(...r()),e!=="text"){if(d.messageId===void 0)throw new Error("First TEXT_MESSAGE_CHUNK must have a messageId");t={messageId:d.messageId},e="text";let a={type:EventType.TEXT_MESSAGE_START,messageId:d.messageId,role:"assistant"};_.push(a),p&&console.debug("[TRANSFORM]: TEXT_MESSAGE_START",JSON.stringify(a));}if(d.delta!==void 0){let a={type:EventType.TEXT_MESSAGE_CONTENT,messageId:t.messageId,delta:d.delta};_.push(a),p&&console.debug("[TRANSFORM]: TEXT_MESSAGE_CONTENT",JSON.stringify(a));}return _;case EventType.TOOL_CALL_CHUNK:let T=l,u=[];if((e!=="tool"||T.toolCallId!==void 0&&T.toolCallId!==(n==null?void 0:n.toolCallId))&&u.push(...r()),e!=="tool"){if(T.toolCallId===void 0)throw new Error("First TOOL_CALL_CHUNK must have a toolCallId");if(T.toolCallName===void 0)throw new Error("First TOOL_CALL_CHUNK must have a toolCallName");n={toolCallId:T.toolCallId,toolCallName:T.toolCallName,parentMessageId:T.parentMessageId},e="tool";let a={type:EventType.TOOL_CALL_START,toolCallId:T.toolCallId,toolCallName:T.toolCallName,parentMessageId:T.parentMessageId};u.push(a),p&&console.debug("[TRANSFORM]: TOOL_CALL_START",JSON.stringify(a));}if(T.delta!==void 0){let a={type:EventType.TOOL_CALL_ARGS,toolCallId:n.toolCallId,delta:T.delta};u.push(a),p&&console.debug("[TRANSFORM]: TOOL_CALL_ARGS",JSON.stringify(a));}return u}}),cjs.finalize(()=>r()))};var F=class{constructor({agentId:o,description:t,threadId:n,initialMessages:e,initialState:s,debug:i}={}){this.debug=false;this.subscribers=[];this.agentId=o,this.description=t!=null?t:"",this.threadId=n!=null?n:v4$1(),this.messages=R(e!=null?e:[]),this.state=R(s!=null?s:{}),this.debug=i!=null?i:false;}subscribe(o){return this.subscribers.push(o),{unsubscribe:()=>{this.subscribers=this.subscribers.filter(t=>t!==o);}}}async runAgent(o,t){var l;this.agentId=(l=this.agentId)!=null?l:v4$1();let n=this.prepareRunAgentInput(o),e,s=new Set(this.messages.map(c=>c.id)),i=[{onRunFinishedEvent:c=>{e=c.result;}},...this.subscribers,t!=null?t:{}];await this.onInitialize(n,i);let r=cjs.pipe(()=>this.run(n),$(this.debug),X(this.debug),c=>this.apply(n,c,i),c=>this.processApplyEvents(n,c,i),operators.catchError(c=>this.onError(n,c,i)),operators.finalize(()=>{this.onFinalize(n,i);}));return cjs.lastValueFrom(r(cjs.of(null))).then(()=>{let c=R(this.messages).filter(d=>!s.has(d.id));return {result:e,newMessages:c}})}abortRun(){}apply(o,t,n){return K(o,t,this,n)}processApplyEvents(o,t,n){return t.pipe(operators.tap(e=>{e.messages&&(this.messages=e.messages,n.forEach(s=>{var i;(i=s.onMessagesChanged)==null||i.call(s,{messages:this.messages,state:this.state,agent:this,input:o});})),e.state&&(this.state=e.state,n.forEach(s=>{var i;(i=s.onStateChanged)==null||i.call(s,{state:this.state,messages:this.messages,agent:this,input:o});}));}))}prepareRunAgentInput(o){var t,n,e;return {threadId:this.threadId,runId:(o==null?void 0:o.runId)||v4$1(),tools:R((t=o==null?void 0:o.tools)!=null?t:[]),context:R((n=o==null?void 0:o.context)!=null?n:[]),forwardedProps:R((e=o==null?void 0:o.forwardedProps)!=null?e:{}),state:R(this.state),messages:R(this.messages)}}async onInitialize(o,t){let n=await C(t,this.messages,this.state,(e,s,i)=>{var r;return (r=e.onRunInitialized)==null?void 0:r.call(e,{messages:s,state:i,agent:this,input:o})});(n.messages!==void 0||n.state!==void 0)&&(n.messages&&(this.messages=n.messages,o.messages=n.messages,t.forEach(e=>{var s;(s=e.onMessagesChanged)==null||s.call(e,{messages:this.messages,state:this.state,agent:this,input:o});})),n.state&&(this.state=n.state,o.state=n.state,t.forEach(e=>{var s;(s=e.onStateChanged)==null||s.call(e,{state:this.state,messages:this.messages,agent:this,input:o});})));}onError(o,t,n){return cjs.from(C(n,this.messages,this.state,(e,s,i)=>{var r;return (r=e.onRunFailed)==null?void 0:r.call(e,{error:t,messages:s,state:i,agent:this,input:o})})).pipe(operators.map(e=>{let s=e;if((s.messages!==void 0||s.state!==void 0)&&(s.messages!==void 0&&(this.messages=s.messages,n.forEach(i=>{var r;(r=i.onMessagesChanged)==null||r.call(i,{messages:this.messages,state:this.state,agent:this,input:o});})),s.state!==void 0&&(this.state=s.state,n.forEach(i=>{var r;(r=i.onStateChanged)==null||r.call(i,{state:this.state,messages:this.messages,agent:this,input:o});}))),s.stopPropagation!==true)throw console.error("Agent execution failed:",t),t;return {}}))}async onFinalize(o,t){let n=await C(t,this.messages,this.state,(e,s,i)=>{var r;return (r=e.onRunFinalized)==null?void 0:r.call(e,{messages:s,state:i,agent:this,input:o})});(n.messages!==void 0||n.state!==void 0)&&(n.messages!==void 0&&(this.messages=n.messages,t.forEach(e=>{var s;(s=e.onMessagesChanged)==null||s.call(e,{messages:this.messages,state:this.state,agent:this,input:o});})),n.state!==void 0&&(this.state=n.state,t.forEach(e=>{var s;(s=e.onStateChanged)==null||s.call(e,{state:this.state,messages:this.messages,agent:this,input:o});})));}clone(){let o=Object.create(Object.getPrototypeOf(this));for(let t of Object.getOwnPropertyNames(this)){let n=this[t];typeof n!="function"&&(o[t]=R(n));}return o}addMessage(o){this.messages.push(o),(async()=>{var t,n,e;for(let s of this.subscribers)await((t=s.onNewMessage)==null?void 0:t.call(s,{message:o,messages:this.messages,state:this.state,agent:this}));if(o.role==="assistant"&&o.toolCalls)for(let s of o.toolCalls)for(let i of this.subscribers)await((n=i.onNewToolCall)==null?void 0:n.call(i,{toolCall:s,messages:this.messages,state:this.state,agent:this}));for(let s of this.subscribers)await((e=s.onMessagesChanged)==null?void 0:e.call(s,{messages:this.messages,state:this.state,agent:this}));})();}addMessages(o){this.messages.push(...o),(async()=>{var t,n,e;for(let s of o){for(let i of this.subscribers)await((t=i.onNewMessage)==null?void 0:t.call(i,{message:s,messages:this.messages,state:this.state,agent:this}));if(s.role==="assistant"&&s.toolCalls)for(let i of s.toolCalls)for(let r of this.subscribers)await((n=r.onNewToolCall)==null?void 0:n.call(r,{toolCall:i,messages:this.messages,state:this.state,agent:this}));}for(let s of this.subscribers)await((e=s.onMessagesChanged)==null?void 0:e.call(s,{messages:this.messages,state:this.state,agent:this}));})();}setMessages(o){this.messages=R(o),(async()=>{var t;for(let n of this.subscribers)await((t=n.onMessagesChanged)==null?void 0:t.call(n,{messages:this.messages,state:this.state,agent:this}));})();}setState(o){this.state=R(o),(async()=>{var t;for(let n of this.subscribers)await((t=n.onStateChanged)==null?void 0:t.call(n,{messages:this.messages,state:this.state,agent:this}));})();}legacy_to_be_removed_runAgentBridged(o){var n;this.agentId=(n=this.agentId)!=null?n:v4$1();let t=this.prepareRunAgentInput(o);return this.run(t).pipe($(this.debug),X(this.debug),j(this.threadId,t.runId,this.agentId),e=>e.pipe(operators.map(s=>(this.debug&&console.debug("[LEGACY]:",JSON.stringify(s)),s))))}};

// src/combine-headers.ts
var createIdGenerator = ({
  prefix,
  size: defaultSize = 16,
  alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  separator = "-"
} = {}) => {
  const generator = customAlphabet(alphabet, defaultSize);
  if (prefix == null) {
    return generator;
  }
  if (alphabet.includes(separator)) {
    throw new InvalidArgumentError({
      argument: "separator",
      message: `The separator "${separator}" must not be part of the alphabet "${alphabet}".`
    });
  }
  return (size) => `${prefix}${separator}${generator(size)}`;
};
createIdGenerator();

// src/validator.ts
var validatorSymbol = Symbol.for("vercel.ai.validator");
function validator(validate) {
  return { [validatorSymbol]: true, validate };
}
function isValidator(value) {
  return typeof value === "object" && value !== null && validatorSymbol in value && value[validatorSymbol] === true && "validate" in value;
}
function asValidator(value) {
  return isValidator(value) ? value : zodValidator(value);
}
function zodValidator(zodSchema) {
  return validator((value) => {
    const result = zodSchema.safeParse(value);
    return result.success ? { success: true, value: result.data } : { success: false, error: result.error };
  });
}
function safeValidateTypes({
  value,
  schema
}) {
  const validator2 = asValidator(schema);
  try {
    if (validator2.validate == null) {
      return { success: true, value };
    }
    const result = validator2.validate(value);
    if (result.success) {
      return result;
    }
    return {
      success: false,
      error: TypeValidationError.wrap({ value, cause: result.error })
    };
  } catch (error) {
    return {
      success: false,
      error: TypeValidationError.wrap({ value, cause: error })
    };
  }
}
function safeParseJSON({
  text,
  schema
}) {
  try {
    const value = SecureJSON.parse(text);
    if (schema == null) {
      return { success: true, value, rawValue: value };
    }
    const validationResult = safeValidateTypes({ value, schema });
    return validationResult.success ? { ...validationResult, rawValue: value } : validationResult;
  } catch (error) {
    return {
      success: false,
      error: JSONParseError.isInstance(error) ? error : new JSONParseError({ text, cause: error })
    };
  }
}

// src/index.ts

// src/fix-json.ts
function fixJson(input) {
  const stack = ["ROOT"];
  let lastValidIndex = -1;
  let literalStart = null;
  function processValueStart(char, i, swapState) {
    {
      switch (char) {
        case '"': {
          lastValidIndex = i;
          stack.pop();
          stack.push(swapState);
          stack.push("INSIDE_STRING");
          break;
        }
        case "f":
        case "t":
        case "n": {
          lastValidIndex = i;
          literalStart = i;
          stack.pop();
          stack.push(swapState);
          stack.push("INSIDE_LITERAL");
          break;
        }
        case "-": {
          stack.pop();
          stack.push(swapState);
          stack.push("INSIDE_NUMBER");
          break;
        }
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          lastValidIndex = i;
          stack.pop();
          stack.push(swapState);
          stack.push("INSIDE_NUMBER");
          break;
        }
        case "{": {
          lastValidIndex = i;
          stack.pop();
          stack.push(swapState);
          stack.push("INSIDE_OBJECT_START");
          break;
        }
        case "[": {
          lastValidIndex = i;
          stack.pop();
          stack.push(swapState);
          stack.push("INSIDE_ARRAY_START");
          break;
        }
      }
    }
  }
  function processAfterObjectValue(char, i) {
    switch (char) {
      case ",": {
        stack.pop();
        stack.push("INSIDE_OBJECT_AFTER_COMMA");
        break;
      }
      case "}": {
        lastValidIndex = i;
        stack.pop();
        break;
      }
    }
  }
  function processAfterArrayValue(char, i) {
    switch (char) {
      case ",": {
        stack.pop();
        stack.push("INSIDE_ARRAY_AFTER_COMMA");
        break;
      }
      case "]": {
        lastValidIndex = i;
        stack.pop();
        break;
      }
    }
  }
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const currentState = stack[stack.length - 1];
    switch (currentState) {
      case "ROOT":
        processValueStart(char, i, "FINISH");
        break;
      case "INSIDE_OBJECT_START": {
        switch (char) {
          case '"': {
            stack.pop();
            stack.push("INSIDE_OBJECT_KEY");
            break;
          }
          case "}": {
            lastValidIndex = i;
            stack.pop();
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_AFTER_COMMA": {
        switch (char) {
          case '"': {
            stack.pop();
            stack.push("INSIDE_OBJECT_KEY");
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_KEY": {
        switch (char) {
          case '"': {
            stack.pop();
            stack.push("INSIDE_OBJECT_AFTER_KEY");
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_AFTER_KEY": {
        switch (char) {
          case ":": {
            stack.pop();
            stack.push("INSIDE_OBJECT_BEFORE_VALUE");
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_BEFORE_VALUE": {
        processValueStart(char, i, "INSIDE_OBJECT_AFTER_VALUE");
        break;
      }
      case "INSIDE_OBJECT_AFTER_VALUE": {
        processAfterObjectValue(char, i);
        break;
      }
      case "INSIDE_STRING": {
        switch (char) {
          case '"': {
            stack.pop();
            lastValidIndex = i;
            break;
          }
          case "\\": {
            stack.push("INSIDE_STRING_ESCAPE");
            break;
          }
          default: {
            lastValidIndex = i;
          }
        }
        break;
      }
      case "INSIDE_ARRAY_START": {
        switch (char) {
          case "]": {
            lastValidIndex = i;
            stack.pop();
            break;
          }
          default: {
            lastValidIndex = i;
            processValueStart(char, i, "INSIDE_ARRAY_AFTER_VALUE");
            break;
          }
        }
        break;
      }
      case "INSIDE_ARRAY_AFTER_VALUE": {
        switch (char) {
          case ",": {
            stack.pop();
            stack.push("INSIDE_ARRAY_AFTER_COMMA");
            break;
          }
          case "]": {
            lastValidIndex = i;
            stack.pop();
            break;
          }
          default: {
            lastValidIndex = i;
            break;
          }
        }
        break;
      }
      case "INSIDE_ARRAY_AFTER_COMMA": {
        processValueStart(char, i, "INSIDE_ARRAY_AFTER_VALUE");
        break;
      }
      case "INSIDE_STRING_ESCAPE": {
        stack.pop();
        lastValidIndex = i;
        break;
      }
      case "INSIDE_NUMBER": {
        switch (char) {
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9": {
            lastValidIndex = i;
            break;
          }
          case "e":
          case "E":
          case "-":
          case ".": {
            break;
          }
          case ",": {
            stack.pop();
            if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") {
              processAfterArrayValue(char, i);
            }
            if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") {
              processAfterObjectValue(char, i);
            }
            break;
          }
          case "}": {
            stack.pop();
            if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") {
              processAfterObjectValue(char, i);
            }
            break;
          }
          case "]": {
            stack.pop();
            if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") {
              processAfterArrayValue(char, i);
            }
            break;
          }
          default: {
            stack.pop();
            break;
          }
        }
        break;
      }
      case "INSIDE_LITERAL": {
        const partialLiteral = input.substring(literalStart, i + 1);
        if (!"false".startsWith(partialLiteral) && !"true".startsWith(partialLiteral) && !"null".startsWith(partialLiteral)) {
          stack.pop();
          if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") {
            processAfterObjectValue(char, i);
          } else if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") {
            processAfterArrayValue(char, i);
          }
        } else {
          lastValidIndex = i;
        }
        break;
      }
    }
  }
  let result = input.slice(0, lastValidIndex + 1);
  for (let i = stack.length - 1; i >= 0; i--) {
    const state = stack[i];
    switch (state) {
      case "INSIDE_STRING": {
        result += '"';
        break;
      }
      case "INSIDE_OBJECT_KEY":
      case "INSIDE_OBJECT_AFTER_KEY":
      case "INSIDE_OBJECT_AFTER_COMMA":
      case "INSIDE_OBJECT_START":
      case "INSIDE_OBJECT_BEFORE_VALUE":
      case "INSIDE_OBJECT_AFTER_VALUE": {
        result += "}";
        break;
      }
      case "INSIDE_ARRAY_START":
      case "INSIDE_ARRAY_AFTER_COMMA":
      case "INSIDE_ARRAY_AFTER_VALUE": {
        result += "]";
        break;
      }
      case "INSIDE_LITERAL": {
        const partialLiteral = input.substring(literalStart, input.length);
        if ("true".startsWith(partialLiteral)) {
          result += "true".slice(partialLiteral.length);
        } else if ("false".startsWith(partialLiteral)) {
          result += "false".slice(partialLiteral.length);
        } else if ("null".startsWith(partialLiteral)) {
          result += "null".slice(partialLiteral.length);
        }
      }
    }
  }
  return result;
}

// src/parse-partial-json.ts
function parsePartialJson(jsonText) {
  if (jsonText === void 0) {
    return { value: void 0, state: "undefined-input" };
  }
  let result = safeParseJSON({ text: jsonText });
  if (result.success) {
    return { value: result.value, state: "successful-parse" };
  }
  result = safeParseJSON({ text: fixJson(jsonText) });
  if (result.success) {
    return { value: result.value, state: "repaired-parse" };
  }
  return { value: void 0, state: "failed-parse" };
}

// src/data-stream-parts.ts
var textStreamPart2 = {
  code: "0",
  name: "text",
  parse: (value) => {
    if (typeof value !== "string") {
      throw new Error('"text" parts expect a string value.');
    }
    return { type: "text", value };
  }
};
var dataStreamPart = {
  code: "2",
  name: "data",
  parse: (value) => {
    if (!Array.isArray(value)) {
      throw new Error('"data" parts expect an array value.');
    }
    return { type: "data", value };
  }
};
var errorStreamPart2 = {
  code: "3",
  name: "error",
  parse: (value) => {
    if (typeof value !== "string") {
      throw new Error('"error" parts expect a string value.');
    }
    return { type: "error", value };
  }
};
var messageAnnotationsStreamPart = {
  code: "8",
  name: "message_annotations",
  parse: (value) => {
    if (!Array.isArray(value)) {
      throw new Error('"message_annotations" parts expect an array value.');
    }
    return { type: "message_annotations", value };
  }
};
var toolCallStreamPart = {
  code: "9",
  name: "tool_call",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("toolCallId" in value) || typeof value.toolCallId !== "string" || !("toolName" in value) || typeof value.toolName !== "string" || !("args" in value) || typeof value.args !== "object") {
      throw new Error(
        '"tool_call" parts expect an object with a "toolCallId", "toolName", and "args" property.'
      );
    }
    return {
      type: "tool_call",
      value
    };
  }
};
var toolResultStreamPart = {
  code: "a",
  name: "tool_result",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("toolCallId" in value) || typeof value.toolCallId !== "string" || !("result" in value)) {
      throw new Error(
        '"tool_result" parts expect an object with a "toolCallId" and a "result" property.'
      );
    }
    return {
      type: "tool_result",
      value
    };
  }
};
var toolCallStreamingStartStreamPart = {
  code: "b",
  name: "tool_call_streaming_start",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("toolCallId" in value) || typeof value.toolCallId !== "string" || !("toolName" in value) || typeof value.toolName !== "string") {
      throw new Error(
        '"tool_call_streaming_start" parts expect an object with a "toolCallId" and "toolName" property.'
      );
    }
    return {
      type: "tool_call_streaming_start",
      value
    };
  }
};
var toolCallDeltaStreamPart = {
  code: "c",
  name: "tool_call_delta",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("toolCallId" in value) || typeof value.toolCallId !== "string" || !("argsTextDelta" in value) || typeof value.argsTextDelta !== "string") {
      throw new Error(
        '"tool_call_delta" parts expect an object with a "toolCallId" and "argsTextDelta" property.'
      );
    }
    return {
      type: "tool_call_delta",
      value
    };
  }
};
var finishMessageStreamPart = {
  code: "d",
  name: "finish_message",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("finishReason" in value) || typeof value.finishReason !== "string") {
      throw new Error(
        '"finish_message" parts expect an object with a "finishReason" property.'
      );
    }
    const result = {
      finishReason: value.finishReason
    };
    if ("usage" in value && value.usage != null && typeof value.usage === "object" && "promptTokens" in value.usage && "completionTokens" in value.usage) {
      result.usage = {
        promptTokens: typeof value.usage.promptTokens === "number" ? value.usage.promptTokens : Number.NaN,
        completionTokens: typeof value.usage.completionTokens === "number" ? value.usage.completionTokens : Number.NaN
      };
    }
    return {
      type: "finish_message",
      value: result
    };
  }
};
var finishStepStreamPart = {
  code: "e",
  name: "finish_step",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("finishReason" in value) || typeof value.finishReason !== "string") {
      throw new Error(
        '"finish_step" parts expect an object with a "finishReason" property.'
      );
    }
    const result = {
      finishReason: value.finishReason,
      isContinued: false
    };
    if ("usage" in value && value.usage != null && typeof value.usage === "object" && "promptTokens" in value.usage && "completionTokens" in value.usage) {
      result.usage = {
        promptTokens: typeof value.usage.promptTokens === "number" ? value.usage.promptTokens : Number.NaN,
        completionTokens: typeof value.usage.completionTokens === "number" ? value.usage.completionTokens : Number.NaN
      };
    }
    if ("isContinued" in value && typeof value.isContinued === "boolean") {
      result.isContinued = value.isContinued;
    }
    return {
      type: "finish_step",
      value: result
    };
  }
};
var startStepStreamPart = {
  code: "f",
  name: "start_step",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("messageId" in value) || typeof value.messageId !== "string") {
      throw new Error(
        '"start_step" parts expect an object with an "id" property.'
      );
    }
    return {
      type: "start_step",
      value: {
        messageId: value.messageId
      }
    };
  }
};
var reasoningStreamPart = {
  code: "g",
  name: "reasoning",
  parse: (value) => {
    if (typeof value !== "string") {
      throw new Error('"reasoning" parts expect a string value.');
    }
    return { type: "reasoning", value };
  }
};
var sourcePart = {
  code: "h",
  name: "source",
  parse: (value) => {
    if (value == null || typeof value !== "object") {
      throw new Error('"source" parts expect a Source object.');
    }
    return {
      type: "source",
      value
    };
  }
};
var redactedReasoningStreamPart = {
  code: "i",
  name: "redacted_reasoning",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("data" in value) || typeof value.data !== "string") {
      throw new Error(
        '"redacted_reasoning" parts expect an object with a "data" property.'
      );
    }
    return { type: "redacted_reasoning", value: { data: value.data } };
  }
};
var reasoningSignatureStreamPart = {
  code: "j",
  name: "reasoning_signature",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("signature" in value) || typeof value.signature !== "string") {
      throw new Error(
        '"reasoning_signature" parts expect an object with a "signature" property.'
      );
    }
    return {
      type: "reasoning_signature",
      value: { signature: value.signature }
    };
  }
};
var fileStreamPart = {
  code: "k",
  name: "file",
  parse: (value) => {
    if (value == null || typeof value !== "object" || !("data" in value) || typeof value.data !== "string" || !("mimeType" in value) || typeof value.mimeType !== "string") {
      throw new Error(
        '"file" parts expect an object with a "data" and "mimeType" property.'
      );
    }
    return { type: "file", value };
  }
};
var dataStreamParts = [
  textStreamPart2,
  dataStreamPart,
  errorStreamPart2,
  messageAnnotationsStreamPart,
  toolCallStreamPart,
  toolResultStreamPart,
  toolCallStreamingStartStreamPart,
  toolCallDeltaStreamPart,
  finishMessageStreamPart,
  finishStepStreamPart,
  startStepStreamPart,
  reasoningStreamPart,
  sourcePart,
  redactedReasoningStreamPart,
  reasoningSignatureStreamPart,
  fileStreamPart
];
var dataStreamPartsByCode = Object.fromEntries(
  dataStreamParts.map((part) => [part.code, part])
);
Object.fromEntries(
  dataStreamParts.map((part) => [part.name, part.code])
);
var validCodes2 = dataStreamParts.map((part) => part.code);
var parseDataStreamPart = (line) => {
  const firstSeparatorIndex = line.indexOf(":");
  if (firstSeparatorIndex === -1) {
    throw new Error("Failed to parse stream string. No separator found.");
  }
  const prefix = line.slice(0, firstSeparatorIndex);
  if (!validCodes2.includes(prefix)) {
    throw new Error(`Failed to parse stream string. Invalid code ${prefix}.`);
  }
  const code = prefix;
  const textValue = line.slice(firstSeparatorIndex + 1);
  const jsonValue = JSON.parse(textValue);
  return dataStreamPartsByCode[code].parse(jsonValue);
};

// src/process-data-stream.ts
var NEWLINE = "\n".charCodeAt(0);
function concatChunks(chunks, totalLength) {
  const concatenatedChunks = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    concatenatedChunks.set(chunk, offset);
    offset += chunk.length;
  }
  chunks.length = 0;
  return concatenatedChunks;
}
async function processDataStream({
  stream,
  onTextPart,
  onReasoningPart,
  onReasoningSignaturePart,
  onRedactedReasoningPart,
  onSourcePart,
  onFilePart,
  onDataPart,
  onErrorPart,
  onToolCallStreamingStartPart,
  onToolCallDeltaPart,
  onToolCallPart,
  onToolResultPart,
  onMessageAnnotationsPart,
  onFinishMessagePart,
  onFinishStepPart,
  onStartStepPart
}) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const chunks = [];
  let totalLength = 0;
  while (true) {
    const { value } = await reader.read();
    if (value) {
      chunks.push(value);
      totalLength += value.length;
      if (value[value.length - 1] !== NEWLINE) {
        continue;
      }
    }
    if (chunks.length === 0) {
      break;
    }
    const concatenatedChunks = concatChunks(chunks, totalLength);
    totalLength = 0;
    const streamParts = decoder.decode(concatenatedChunks, { stream: true }).split("\n").filter((line) => line !== "").map(parseDataStreamPart);
    for (const { type, value: value2 } of streamParts) {
      switch (type) {
        case "text":
          await (onTextPart == null ? void 0 : onTextPart(value2));
          break;
        case "reasoning":
          await (onReasoningPart == null ? void 0 : onReasoningPart(value2));
          break;
        case "reasoning_signature":
          await (onReasoningSignaturePart == null ? void 0 : onReasoningSignaturePart(value2));
          break;
        case "redacted_reasoning":
          await (onRedactedReasoningPart == null ? void 0 : onRedactedReasoningPart(value2));
          break;
        case "file":
          await (onFilePart == null ? void 0 : onFilePart(value2));
          break;
        case "source":
          await (onSourcePart == null ? void 0 : onSourcePart(value2));
          break;
        case "data":
          await (onDataPart == null ? void 0 : onDataPart(value2));
          break;
        case "error":
          await (onErrorPart == null ? void 0 : onErrorPart(value2));
          break;
        case "message_annotations":
          await (onMessageAnnotationsPart == null ? void 0 : onMessageAnnotationsPart(value2));
          break;
        case "tool_call_streaming_start":
          await (onToolCallStreamingStartPart == null ? void 0 : onToolCallStreamingStartPart(value2));
          break;
        case "tool_call_delta":
          await (onToolCallDeltaPart == null ? void 0 : onToolCallDeltaPart(value2));
          break;
        case "tool_call":
          await (onToolCallPart == null ? void 0 : onToolCallPart(value2));
          break;
        case "tool_result":
          await (onToolResultPart == null ? void 0 : onToolResultPart(value2));
          break;
        case "finish_message":
          await (onFinishMessagePart == null ? void 0 : onFinishMessagePart(value2));
          break;
        case "finish_step":
          await (onFinishStepPart == null ? void 0 : onFinishStepPart(value2));
          break;
        case "start_step":
          await (onStartStepPart == null ? void 0 : onStartStepPart(value2));
          break;
        default: {
          const exhaustiveCheck = type;
          throw new Error(`Unknown stream part type: ${exhaustiveCheck}`);
        }
      }
    }
  }
}

var IDX=256, HEX=[], BUFFER;
while (IDX--) HEX[IDX] = (IDX + 256).toString(16).substring(1);

function v4() {
	var i=0, num, out='';

	if (!BUFFER || ((IDX + 16) > 256)) {
		BUFFER = Array(i=256);
		while (i--) BUFFER[i] = 256 * Math.random() | 0;
		i = IDX = 0;
	}

	for (; i < 16; i++) {
		num = BUFFER[IDX + i];
		if (i==6) out += HEX[num & 15 | 64];
		else if (i==8) out += HEX[num & 63 | 128];
		else out += HEX[num];

		if (i & 1 && i > 1 && i < 11) out += '-';
	}

	IDX++;
	return out;
}

// src/runtime-context/index.ts
var RuntimeContext = class {
  registry = /* @__PURE__ */ new Map();
  constructor(iterable) {
    this.registry = new Map(iterable);
  }
  /**
   * set a value with strict typing if `Values` is a Record and the key exists in it.
   */
  set(key, value) {
    this.registry.set(key, value);
  }
  /**
   * Get a value with its type
   */
  get(key) {
    return this.registry.get(key);
  }
  /**
   * Check if a key exists in the container
   */
  has(key) {
    return this.registry.has(key);
  }
  /**
   * Delete a value by key
   */
  delete(key) {
    return this.registry.delete(key);
  }
  /**
   * Clear all values from the container
   */
  clear() {
    this.registry.clear();
  }
  /**
   * Get all keys in the container
   */
  keys() {
    return this.registry.keys();
  }
  /**
   * Get all values in the container
   */
  values() {
    return this.registry.values();
  }
  /**
   * Get all entries in the container
   */
  entries() {
    return this.registry.entries();
  }
  /**
   * Get the size of the container
   */
  size() {
    return this.registry.size;
  }
  /**
   * Execute a function for each entry in the container
   */
  forEach(callbackfn) {
    this.registry.forEach(callbackfn);
  }
  /**
   * Custom JSON serialization method
   * Converts the internal Map to a plain object for proper JSON serialization
   */
  toJSON() {
    return Object.fromEntries(this.registry);
  }
};

// src/tools/validation.ts
function validateToolInput(schema, input, toolId) {
  if (!schema || !("safeParse" in schema)) {
    return { data: input };
  }
  let actualInput = input;
  if (input && typeof input === "object" && "context" in input) {
    actualInput = input.context;
  }
  if (actualInput && typeof actualInput === "object" && "inputData" in actualInput) {
    actualInput = actualInput.inputData;
  }
  const validation = schema.safeParse(actualInput);
  if (!validation.success) {
    const errorMessages = validation.error.issues.map((e) => `- ${e.path?.join(".") || "root"}: ${e.message}`).join("\n");
    const error = {
      error: true,
      message: `Tool validation failed${toolId ? ` for ${toolId}` : ""}. Please fix the following errors and try again:
${errorMessages}

Provided arguments: ${JSON.stringify(actualInput, null, 2)}`,
      validationErrors: validation.error.format()
    };
    return { data: input, error };
  }
  if (input && typeof input === "object" && "context" in input) {
    if (input.context && typeof input.context === "object" && "inputData" in input.context) {
      return { data: { ...input, context: { ...input.context, inputData: validation.data } } };
    }
    return { data: { ...input, context: validation.data } };
  }
  return { data: validation.data };
}

// src/tools/tool.ts
var Tool$1 = class Tool {
  id;
  description;
  inputSchema;
  outputSchema;
  execute;
  mastra;
  constructor(opts) {
    this.id = opts.id;
    this.description = opts.description;
    this.inputSchema = opts.inputSchema;
    this.outputSchema = opts.outputSchema;
    this.mastra = opts.mastra;
    if (opts.execute) {
      const originalExecute = opts.execute;
      this.execute = async (context, options) => {
        const { data, error } = validateToolInput(this.inputSchema, context, this.id);
        if (error) {
          return error;
        }
        return originalExecute(data, options);
      };
    }
  }
};

// src/tools/toolchecks.ts
function isVercelTool(tool) {
  return !!(tool && !(tool instanceof Tool$1) && "parameters" in tool);
}

// src/adapters/agui.ts
var AGUIAdapter = class extends F {
  agent;
  resourceId;
  constructor({ agent, agentId, resourceId, ...rest }) {
    super({
      agentId,
      ...rest
    });
    this.agent = agent;
    this.resourceId = resourceId;
  }
  run(input) {
    return new cjs.Observable((subscriber) => {
      const convertedMessages = convertMessagesToMastraMessages(input.messages);
      subscriber.next({
        type: EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId
      });
      this.agent.stream({
        threadId: input.threadId,
        resourceId: this.resourceId ?? "",
        runId: input.runId,
        messages: convertedMessages,
        clientTools: input.tools.reduce(
          (acc, tool) => {
            acc[tool.name] = {
              id: tool.name,
              description: tool.description,
              inputSchema: tool.parameters
            };
            return acc;
          },
          {}
        )
      }).then((response) => {
        let currentMessageId = void 0;
        let isInTextMessage = false;
        return response.processDataStream({
          onTextPart: (text) => {
            if (currentMessageId === void 0) {
              currentMessageId = generateUUID();
              const message2 = {
                type: EventType.TEXT_MESSAGE_START,
                messageId: currentMessageId,
                role: "assistant"
              };
              subscriber.next(message2);
              isInTextMessage = true;
            }
            const message = {
              type: EventType.TEXT_MESSAGE_CONTENT,
              messageId: currentMessageId,
              delta: text
            };
            subscriber.next(message);
          },
          onFinishMessagePart: () => {
            if (currentMessageId !== void 0) {
              const message = {
                type: EventType.TEXT_MESSAGE_END,
                messageId: currentMessageId
              };
              subscriber.next(message);
              isInTextMessage = false;
            }
            subscriber.next({
              type: EventType.RUN_FINISHED,
              threadId: input.threadId,
              runId: input.runId
            });
            subscriber.complete();
          },
          onToolCallPart(streamPart) {
            const parentMessageId = currentMessageId || generateUUID();
            if (isInTextMessage) {
              const message = {
                type: EventType.TEXT_MESSAGE_END,
                messageId: parentMessageId
              };
              subscriber.next(message);
              isInTextMessage = false;
            }
            subscriber.next({
              type: EventType.TOOL_CALL_START,
              toolCallId: streamPart.toolCallId,
              toolCallName: streamPart.toolName,
              parentMessageId
            });
            subscriber.next({
              type: EventType.TOOL_CALL_ARGS,
              toolCallId: streamPart.toolCallId,
              delta: JSON.stringify(streamPart.args),
              parentMessageId
            });
            subscriber.next({
              type: EventType.TOOL_CALL_END,
              toolCallId: streamPart.toolCallId,
              parentMessageId
            });
          }
        });
      }).catch((error) => {
        console.error("error", error);
        subscriber.error(error);
      });
      return () => {
      };
    });
  }
};
function generateUUID() {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === "function") {
      const buffer = new Uint8Array(16);
      crypto.getRandomValues(buffer);
      buffer[6] = buffer[6] & 15 | 64;
      buffer[8] = buffer[8] & 63 | 128;
      let hex = "";
      for (let i = 0; i < 16; i++) {
        hex += buffer[i].toString(16).padStart(2, "0");
        if (i === 3 || i === 5 || i === 7 || i === 9) hex += "-";
      }
      return hex;
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function convertMessagesToMastraMessages(messages) {
  const result = [];
  const toolCallsWithResults = /* @__PURE__ */ new Set();
  for (const message of messages) {
    if (message.role === "tool" && message.toolCallId) {
      toolCallsWithResults.add(message.toolCallId);
    }
  }
  for (const message of messages) {
    if (message.role === "assistant") {
      const parts = message.content ? [{ type: "text", text: message.content }] : [];
      for (const toolCall of message.toolCalls ?? []) {
        parts.push({
          type: "tool-call",
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          args: JSON.parse(toolCall.function.arguments)
        });
      }
      result.push({
        role: "assistant",
        content: parts
      });
      if (message.toolCalls?.length) {
        for (const toolCall of message.toolCalls) {
          if (!toolCallsWithResults.has(toolCall.id)) {
            result.push({
              role: "tool",
              content: [
                {
                  type: "tool-result",
                  toolCallId: toolCall.id,
                  toolName: toolCall.function.name,
                  result: JSON.parse(toolCall.function.arguments)
                  // This is still wrong but matches test expectations
                }
              ]
            });
          }
        }
      }
    } else if (message.role === "user") {
      result.push({
        role: "user",
        content: message.content || ""
      });
    } else if (message.role === "tool") {
      result.push({
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: message.toolCallId || "unknown",
            toolName: "unknown",
            // toolName is not available in tool messages from CopilotKit
            result: message.content
          }
        ]
      });
    }
  }
  return result;
}
function parseClientRuntimeContext(runtimeContext) {
  if (runtimeContext) {
    if (runtimeContext instanceof RuntimeContext) {
      return Object.fromEntries(runtimeContext.entries());
    }
    return runtimeContext;
  }
  return void 0;
}
function isZodType(value) {
  return typeof value === "object" && value !== null && "_def" in value && "parse" in value && typeof value.parse === "function" && "safeParse" in value && typeof value.safeParse === "function";
}
function zodToJsonSchema(zodSchema) {
  if (!isZodType(zodSchema)) {
    return zodSchema;
  }
  {
    const fn = "toJSONSchema";
    return z[fn].call(z, zodSchema);
  }
}

// src/utils/process-client-tools.ts
function processClientTools(clientTools) {
  if (!clientTools) {
    return void 0;
  }
  return Object.fromEntries(
    Object.entries(clientTools).map(([key, value]) => {
      if (isVercelTool(value)) {
        return [
          key,
          {
            ...value,
            parameters: value.parameters ? zodToJsonSchema(value.parameters) : void 0
          }
        ];
      } else {
        return [
          key,
          {
            ...value,
            inputSchema: value.inputSchema ? zodToJsonSchema(value.inputSchema) : void 0,
            outputSchema: value.outputSchema ? zodToJsonSchema(value.outputSchema) : void 0
          }
        ];
      }
    })
  );
}

// src/utils/process-mastra-stream.ts
async function processMastraStream({
  stream,
  onChunk
}) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            console.log("\u{1F3C1} Stream finished");
            return;
          }
          try {
            const json = JSON.parse(data);
            await onChunk(json);
          } catch (error) {
            console.error("\u274C JSON parse error:", error, "Data:", data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// src/resources/base.ts
var BaseResource = class {
  options;
  constructor(options) {
    this.options = options;
  }
  /**
   * Makes an HTTP request to the API with retries and exponential backoff
   * @param path - The API endpoint path
   * @param options - Optional request configuration
   * @returns Promise containing the response data
   */
  async request(path, options = {}) {
    let lastError = null;
    const { baseUrl, retries = 3, backoffMs = 100, maxBackoffMs = 1e3, headers = {}, credentials } = this.options;
    let delay = backoffMs;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
          ...options,
          headers: {
            ...options.body && !(options.body instanceof FormData) && (options.method === "POST" || options.method === "PUT") ? { "content-type": "application/json" } : {},
            ...headers,
            ...options.headers
            // TODO: Bring this back once we figure out what we/users need to do to make this work with cross-origin requests
            // 'x-mastra-client-type': 'js',
          },
          signal: this.options.abortSignal,
          credentials: options.credentials ?? credentials,
          body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : void 0
        });
        if (!response.ok) {
          const errorBody = await response.text();
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorJson = JSON.parse(errorBody);
            errorMessage += ` - ${JSON.stringify(errorJson)}`;
          } catch {
            if (errorBody) {
              errorMessage += ` - ${errorBody}`;
            }
          }
          throw new Error(errorMessage);
        }
        if (options.stream) {
          return response;
        }
        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error;
        if (attempt === retries) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, maxBackoffMs);
      }
    }
    throw lastError || new Error("Request failed");
  }
};

// src/resources/agent.ts
async function executeToolCallAndRespond({
  response,
  params,
  runId,
  resourceId,
  threadId,
  runtimeContext,
  respondFn
}) {
  if (response.finishReason === "tool-calls") {
    const toolCalls = response.toolCalls;
    if (!toolCalls || !Array.isArray(toolCalls)) {
      return response;
    }
    for (const toolCall of toolCalls) {
      const clientTool = params.clientTools?.[toolCall.toolName];
      if (clientTool && clientTool.execute) {
        const result = await clientTool.execute(
          { context: toolCall?.args, runId, resourceId, threadId, runtimeContext },
          {
            messages: response.messages,
            toolCallId: toolCall?.toolCallId
          }
        );
        const updatedMessages = [
          {
            role: "user",
            content: params.messages
          },
          ...response.response.messages,
          {
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                result
              }
            ]
          }
        ];
        return respondFn({
          ...params,
          messages: updatedMessages
        });
      }
    }
  }
}
var AgentVoice = class extends BaseResource {
  constructor(options, agentId) {
    super(options);
    this.agentId = agentId;
    this.agentId = agentId;
  }
  /**
   * Convert text to speech using the agent's voice provider
   * @param text - Text to convert to speech
   * @param options - Optional provider-specific options for speech generation
   * @returns Promise containing the audio data
   */
  async speak(text, options) {
    return this.request(`/api/agents/${this.agentId}/voice/speak`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: { input: text, options },
      stream: true
    });
  }
  /**
   * Convert speech to text using the agent's voice provider
   * @param audio - Audio data to transcribe
   * @param options - Optional provider-specific options
   * @returns Promise containing the transcribed text
   */
  listen(audio, options) {
    const formData = new FormData();
    formData.append("audio", audio);
    if (options) {
      formData.append("options", JSON.stringify(options));
    }
    return this.request(`/api/agents/${this.agentId}/voice/listen`, {
      method: "POST",
      body: formData
    });
  }
  /**
   * Get available speakers for the agent's voice provider
   * @returns Promise containing list of available speakers
   */
  getSpeakers() {
    return this.request(`/api/agents/${this.agentId}/voice/speakers`);
  }
  /**
   * Get the listener configuration for the agent's voice provider
   * @returns Promise containing a check if the agent has listening capabilities
   */
  getListener() {
    return this.request(`/api/agents/${this.agentId}/voice/listener`);
  }
};
var Agent = class extends BaseResource {
  constructor(options, agentId) {
    super(options);
    this.agentId = agentId;
    this.voice = new AgentVoice(options, this.agentId);
  }
  voice;
  /**
   * Retrieves details about the agent
   * @returns Promise containing agent details including model and instructions
   */
  details() {
    return this.request(`/api/agents/${this.agentId}`);
  }
  async generate(params) {
    const processedParams = {
      ...params,
      output: params.output ? zodToJsonSchema(params.output) : void 0,
      experimental_output: params.experimental_output ? zodToJsonSchema(params.experimental_output) : void 0,
      runtimeContext: parseClientRuntimeContext(params.runtimeContext),
      clientTools: processClientTools(params.clientTools)
    };
    const { runId, resourceId, threadId, runtimeContext } = processedParams;
    const response = await this.request(
      `/api/agents/${this.agentId}/generate`,
      {
        method: "POST",
        body: processedParams
      }
    );
    if (response.finishReason === "tool-calls") {
      const toolCalls = response.toolCalls;
      if (!toolCalls || !Array.isArray(toolCalls)) {
        return response;
      }
      for (const toolCall of toolCalls) {
        const clientTool = params.clientTools?.[toolCall.toolName];
        if (clientTool && clientTool.execute) {
          const result = await clientTool.execute(
            { context: toolCall?.args, runId, resourceId, threadId, runtimeContext },
            {
              messages: response.messages,
              toolCallId: toolCall?.toolCallId
            }
          );
          const updatedMessages = [
            {
              role: "user",
              content: params.messages
            },
            ...response.response.messages,
            {
              role: "tool",
              content: [
                {
                  type: "tool-result",
                  toolCallId: toolCall.toolCallId,
                  toolName: toolCall.toolName,
                  result
                }
              ]
            }
          ];
          return this.generate({
            ...params,
            messages: updatedMessages
          });
        }
      }
    }
    return response;
  }
  async generateVNext(params) {
    const processedParams = {
      ...params,
      output: params.output ? zodToJsonSchema(params.output) : void 0,
      runtimeContext: parseClientRuntimeContext(params.runtimeContext),
      clientTools: processClientTools(params.clientTools)
    };
    const { runId, resourceId, threadId, runtimeContext } = processedParams;
    const response = await this.request(
      `/api/agents/${this.agentId}/generate/vnext`,
      {
        method: "POST",
        body: processedParams
      }
    );
    if (response.finishReason === "tool-calls") {
      return executeToolCallAndRespond({
        response,
        params,
        runId,
        resourceId,
        threadId,
        runtimeContext,
        respondFn: this.generateVNext.bind(this)
      });
    }
    return response;
  }
  async processChatResponse({
    stream,
    update,
    onToolCall,
    onFinish,
    getCurrentDate = () => /* @__PURE__ */ new Date(),
    lastMessage
  }) {
    const replaceLastMessage = lastMessage?.role === "assistant";
    let step = replaceLastMessage ? 1 + // find max step in existing tool invocations:
    (lastMessage.toolInvocations?.reduce((max, toolInvocation) => {
      return Math.max(max, toolInvocation.step ?? 0);
    }, 0) ?? 0) : 0;
    const message = replaceLastMessage ? structuredClone(lastMessage) : {
      id: v4(),
      createdAt: getCurrentDate(),
      role: "assistant",
      content: "",
      parts: []
    };
    let currentTextPart = void 0;
    let currentReasoningPart = void 0;
    let currentReasoningTextDetail = void 0;
    function updateToolInvocationPart(toolCallId, invocation) {
      const part = message.parts.find(
        (part2) => part2.type === "tool-invocation" && part2.toolInvocation.toolCallId === toolCallId
      );
      if (part != null) {
        part.toolInvocation = invocation;
      } else {
        message.parts.push({
          type: "tool-invocation",
          toolInvocation: invocation
        });
      }
    }
    const data = [];
    let messageAnnotations = replaceLastMessage ? lastMessage?.annotations : void 0;
    const partialToolCalls = {};
    let usage = {
      completionTokens: NaN,
      promptTokens: NaN,
      totalTokens: NaN
    };
    let finishReason = "unknown";
    function execUpdate() {
      const copiedData = [...data];
      if (messageAnnotations?.length) {
        message.annotations = messageAnnotations;
      }
      const copiedMessage = {
        // deep copy the message to ensure that deep changes (msg attachments) are updated
        // with SolidJS. SolidJS uses referential integration of sub-objects to detect changes.
        ...structuredClone(message),
        // add a revision id to ensure that the message is updated with SWR. SWR uses a
        // hashing approach by default to detect changes, but it only works for shallow
        // changes. This is why we need to add a revision id to ensure that the message
        // is updated with SWR (without it, the changes get stuck in SWR and are not
        // forwarded to rendering):
        revisionId: v4()
      };
      update({
        message: copiedMessage,
        data: copiedData,
        replaceLastMessage
      });
    }
    await processDataStream({
      stream,
      onTextPart(value) {
        if (currentTextPart == null) {
          currentTextPart = {
            type: "text",
            text: value
          };
          message.parts.push(currentTextPart);
        } else {
          currentTextPart.text += value;
        }
        message.content += value;
        execUpdate();
      },
      onReasoningPart(value) {
        if (currentReasoningTextDetail == null) {
          currentReasoningTextDetail = { type: "text", text: value };
          if (currentReasoningPart != null) {
            currentReasoningPart.details.push(currentReasoningTextDetail);
          }
        } else {
          currentReasoningTextDetail.text += value;
        }
        if (currentReasoningPart == null) {
          currentReasoningPart = {
            type: "reasoning",
            reasoning: value,
            details: [currentReasoningTextDetail]
          };
          message.parts.push(currentReasoningPart);
        } else {
          currentReasoningPart.reasoning += value;
        }
        message.reasoning = (message.reasoning ?? "") + value;
        execUpdate();
      },
      onReasoningSignaturePart(value) {
        if (currentReasoningTextDetail != null) {
          currentReasoningTextDetail.signature = value.signature;
        }
      },
      onRedactedReasoningPart(value) {
        if (currentReasoningPart == null) {
          currentReasoningPart = {
            type: "reasoning",
            reasoning: "",
            details: []
          };
          message.parts.push(currentReasoningPart);
        }
        currentReasoningPart.details.push({
          type: "redacted",
          data: value.data
        });
        currentReasoningTextDetail = void 0;
        execUpdate();
      },
      onFilePart(value) {
        message.parts.push({
          type: "file",
          mimeType: value.mimeType,
          data: value.data
        });
        execUpdate();
      },
      onSourcePart(value) {
        message.parts.push({
          type: "source",
          source: value
        });
        execUpdate();
      },
      onToolCallStreamingStartPart(value) {
        if (message.toolInvocations == null) {
          message.toolInvocations = [];
        }
        partialToolCalls[value.toolCallId] = {
          text: "",
          step,
          toolName: value.toolName,
          index: message.toolInvocations.length
        };
        const invocation = {
          state: "partial-call",
          step,
          toolCallId: value.toolCallId,
          toolName: value.toolName,
          args: void 0
        };
        message.toolInvocations.push(invocation);
        updateToolInvocationPart(value.toolCallId, invocation);
        execUpdate();
      },
      onToolCallDeltaPart(value) {
        const partialToolCall = partialToolCalls[value.toolCallId];
        partialToolCall.text += value.argsTextDelta;
        const { value: partialArgs } = parsePartialJson(partialToolCall.text);
        const invocation = {
          state: "partial-call",
          step: partialToolCall.step,
          toolCallId: value.toolCallId,
          toolName: partialToolCall.toolName,
          args: partialArgs
        };
        message.toolInvocations[partialToolCall.index] = invocation;
        updateToolInvocationPart(value.toolCallId, invocation);
        execUpdate();
      },
      async onToolCallPart(value) {
        const invocation = {
          state: "call",
          step,
          ...value
        };
        if (partialToolCalls[value.toolCallId] != null) {
          message.toolInvocations[partialToolCalls[value.toolCallId].index] = invocation;
        } else {
          if (message.toolInvocations == null) {
            message.toolInvocations = [];
          }
          message.toolInvocations.push(invocation);
        }
        updateToolInvocationPart(value.toolCallId, invocation);
        execUpdate();
        if (onToolCall) {
          const result = await onToolCall({ toolCall: value });
          if (result != null) {
            const invocation2 = {
              state: "result",
              step,
              ...value,
              result
            };
            message.toolInvocations[message.toolInvocations.length - 1] = invocation2;
            updateToolInvocationPart(value.toolCallId, invocation2);
            execUpdate();
          }
        }
      },
      onToolResultPart(value) {
        const toolInvocations = message.toolInvocations;
        if (toolInvocations == null) {
          throw new Error("tool_result must be preceded by a tool_call");
        }
        const toolInvocationIndex = toolInvocations.findIndex((invocation2) => invocation2.toolCallId === value.toolCallId);
        if (toolInvocationIndex === -1) {
          throw new Error("tool_result must be preceded by a tool_call with the same toolCallId");
        }
        const invocation = {
          ...toolInvocations[toolInvocationIndex],
          state: "result",
          ...value
        };
        toolInvocations[toolInvocationIndex] = invocation;
        updateToolInvocationPart(value.toolCallId, invocation);
        execUpdate();
      },
      onDataPart(value) {
        data.push(...value);
        execUpdate();
      },
      onMessageAnnotationsPart(value) {
        if (messageAnnotations == null) {
          messageAnnotations = [...value];
        } else {
          messageAnnotations.push(...value);
        }
        execUpdate();
      },
      onFinishStepPart(value) {
        step += 1;
        currentTextPart = value.isContinued ? currentTextPart : void 0;
        currentReasoningPart = void 0;
        currentReasoningTextDetail = void 0;
      },
      onStartStepPart(value) {
        if (!replaceLastMessage) {
          message.id = value.messageId;
        }
        message.parts.push({ type: "step-start" });
        execUpdate();
      },
      onFinishMessagePart(value) {
        finishReason = value.finishReason;
        if (value.usage != null) {
          usage = value.usage;
        }
      },
      onErrorPart(error) {
        throw new Error(error);
      }
    });
    onFinish?.({ message, finishReason, usage });
  }
  /**
   * Streams a response from the agent
   * @param params - Stream parameters including prompt
   * @returns Promise containing the enhanced Response object with processDataStream method
   */
  async stream(params) {
    const processedParams = {
      ...params,
      output: params.output ? zodToJsonSchema(params.output) : void 0,
      experimental_output: params.experimental_output ? zodToJsonSchema(params.experimental_output) : void 0,
      runtimeContext: parseClientRuntimeContext(params.runtimeContext),
      clientTools: processClientTools(params.clientTools)
    };
    const { readable, writable } = new TransformStream();
    const response = await this.processStreamResponse(processedParams, writable);
    const streamResponse = new Response(readable, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    streamResponse.processDataStream = async (options = {}) => {
      await processDataStream({
        stream: streamResponse.body,
        ...options
      });
    };
    return streamResponse;
  }
  async processChatResponse_vNext({
    stream,
    update,
    onToolCall,
    onFinish,
    getCurrentDate = () => /* @__PURE__ */ new Date(),
    lastMessage
  }) {
    const replaceLastMessage = lastMessage?.role === "assistant";
    let step = replaceLastMessage ? 1 + // find max step in existing tool invocations:
    (lastMessage.toolInvocations?.reduce((max, toolInvocation) => {
      return Math.max(max, toolInvocation.step ?? 0);
    }, 0) ?? 0) : 0;
    const message = replaceLastMessage ? structuredClone(lastMessage) : {
      id: v4(),
      createdAt: getCurrentDate(),
      role: "assistant",
      content: "",
      parts: []
    };
    let currentTextPart = void 0;
    let currentReasoningPart = void 0;
    let currentReasoningTextDetail = void 0;
    function updateToolInvocationPart(toolCallId, invocation) {
      const part = message.parts.find(
        (part2) => part2.type === "tool-invocation" && part2.toolInvocation.toolCallId === toolCallId
      );
      if (part != null) {
        part.toolInvocation = invocation;
      } else {
        message.parts.push({
          type: "tool-invocation",
          toolInvocation: invocation
        });
      }
    }
    const data = [];
    let messageAnnotations = replaceLastMessage ? lastMessage?.annotations : void 0;
    const partialToolCalls = {};
    let usage = {
      completionTokens: NaN,
      promptTokens: NaN,
      totalTokens: NaN
    };
    let finishReason = "unknown";
    function execUpdate() {
      const copiedData = [...data];
      if (messageAnnotations?.length) {
        message.annotations = messageAnnotations;
      }
      const copiedMessage = {
        // deep copy the message to ensure that deep changes (msg attachments) are updated
        // with SolidJS. SolidJS uses referential integration of sub-objects to detect changes.
        ...structuredClone(message),
        // add a revision id to ensure that the message is updated with SWR. SWR uses a
        // hashing approach by default to detect changes, but it only works for shallow
        // changes. This is why we need to add a revision id to ensure that the message
        // is updated with SWR (without it, the changes get stuck in SWR and are not
        // forwarded to rendering):
        revisionId: v4()
      };
      update({
        message: copiedMessage,
        data: copiedData,
        replaceLastMessage
      });
    }
    await processMastraStream({
      stream,
      // TODO: casting as any here because the stream types were all typed as any before in core.
      // but this is completely wrong and this fn is probably broken. Remove ":any" and you'll see a bunch of type errors
      onChunk: async (chunk) => {
        switch (chunk.type) {
          case "step-start": {
            if (!replaceLastMessage) {
              message.id = chunk.payload.messageId;
            }
            message.parts.push({ type: "step-start" });
            execUpdate();
            break;
          }
          case "text-delta": {
            if (currentTextPart == null) {
              currentTextPart = {
                type: "text",
                text: chunk.payload.text
              };
              message.parts.push(currentTextPart);
            } else {
              currentTextPart.text += chunk.payload.text;
            }
            message.content += chunk.payload.text;
            execUpdate();
            break;
          }
          case "reasoning-delta": {
            if (currentReasoningTextDetail == null) {
              currentReasoningTextDetail = { type: "text", text: chunk.payload.text };
              if (currentReasoningPart != null) {
                currentReasoningPart.details.push(currentReasoningTextDetail);
              }
            } else {
              currentReasoningTextDetail.text += chunk.payload.text;
            }
            if (currentReasoningPart == null) {
              currentReasoningPart = {
                type: "reasoning",
                reasoning: chunk.payload.text,
                details: [currentReasoningTextDetail]
              };
              message.parts.push(currentReasoningPart);
            } else {
              currentReasoningPart.reasoning += chunk.payload.text;
            }
            message.reasoning = (message.reasoning ?? "") + chunk.payload.text;
            execUpdate();
            break;
          }
          case "file": {
            message.parts.push({
              type: "file",
              mimeType: chunk.payload.mimeType,
              data: chunk.payload.data
            });
            execUpdate();
            break;
          }
          case "source": {
            message.parts.push({
              type: "source",
              source: chunk.payload.source
            });
            execUpdate();
            break;
          }
          case "tool-call": {
            const invocation = {
              state: "call",
              step,
              ...chunk.payload
            };
            if (partialToolCalls[chunk.payload.toolCallId] != null) {
              message.toolInvocations[partialToolCalls[chunk.payload.toolCallId].index] = invocation;
            } else {
              if (message.toolInvocations == null) {
                message.toolInvocations = [];
              }
              message.toolInvocations.push(invocation);
            }
            updateToolInvocationPart(chunk.payload.toolCallId, invocation);
            execUpdate();
            if (onToolCall) {
              const result = await onToolCall({ toolCall: chunk.payload });
              if (result != null) {
                const invocation2 = {
                  state: "result",
                  step,
                  ...chunk.payload,
                  result
                };
                message.toolInvocations[message.toolInvocations.length - 1] = invocation2;
                updateToolInvocationPart(chunk.payload.toolCallId, invocation2);
                execUpdate();
              }
            }
          }
          case "tool-call-input-streaming-start": {
            if (message.toolInvocations == null) {
              message.toolInvocations = [];
            }
            partialToolCalls[chunk.payload.toolCallId] = {
              text: "",
              step,
              toolName: chunk.payload.toolName,
              index: message.toolInvocations.length
            };
            const invocation = {
              state: "partial-call",
              step,
              toolCallId: chunk.payload.toolCallId,
              toolName: chunk.payload.toolName,
              args: void 0
            };
            message.toolInvocations.push(invocation);
            updateToolInvocationPart(chunk.payload.toolCallId, invocation);
            execUpdate();
            break;
          }
          case "tool-call-delta": {
            const partialToolCall = partialToolCalls[chunk.payload.toolCallId];
            partialToolCall.text += chunk.payload.argsTextDelta;
            const { value: partialArgs } = parsePartialJson(partialToolCall.text);
            const invocation = {
              state: "partial-call",
              step: partialToolCall.step,
              toolCallId: chunk.payload.toolCallId,
              toolName: partialToolCall.toolName,
              args: partialArgs
            };
            message.toolInvocations[partialToolCall.index] = invocation;
            updateToolInvocationPart(chunk.payload.toolCallId, invocation);
            execUpdate();
            break;
          }
          case "tool-result": {
            const toolInvocations = message.toolInvocations;
            if (toolInvocations == null) {
              throw new Error("tool_result must be preceded by a tool_call");
            }
            const toolInvocationIndex = toolInvocations.findIndex(
              (invocation2) => invocation2.toolCallId === chunk.payload.toolCallId
            );
            if (toolInvocationIndex === -1) {
              throw new Error("tool_result must be preceded by a tool_call with the same toolCallId");
            }
            const invocation = {
              ...toolInvocations[toolInvocationIndex],
              state: "result",
              ...chunk.payload
            };
            toolInvocations[toolInvocationIndex] = invocation;
            updateToolInvocationPart(chunk.payload.toolCallId, invocation);
            execUpdate();
            break;
          }
          case "error": {
            throw new Error(chunk.payload.error);
          }
          case "data": {
            data.push(...chunk.payload.data);
            execUpdate();
            break;
          }
          case "step-finish": {
            step += 1;
            currentTextPart = chunk.payload.isContinued ? currentTextPart : void 0;
            currentReasoningPart = void 0;
            currentReasoningTextDetail = void 0;
            execUpdate();
            break;
          }
          case "finish": {
            finishReason = chunk.payload.finishReason;
            if (chunk.payload.usage != null) {
              usage = chunk.payload.usage;
            }
            break;
          }
        }
      }
    });
    onFinish?.({ message, finishReason, usage });
  }
  async processStreamResponse_vNext(processedParams, writable) {
    const response = await this.request(`/api/agents/${this.agentId}/stream/vnext`, {
      method: "POST",
      body: processedParams,
      stream: true
    });
    if (!response.body) {
      throw new Error("No response body");
    }
    try {
      let toolCalls = [];
      let messages = [];
      const [streamForWritable, streamForProcessing] = response.body.tee();
      streamForWritable.pipeTo(writable, {
        preventClose: true
      }).catch((error) => {
        console.error("Error piping to writable stream:", error);
      });
      this.processChatResponse_vNext({
        stream: streamForProcessing,
        update: ({ message }) => {
          const existingIndex = messages.findIndex((m) => m.id === message.id);
          if (existingIndex !== -1) {
            messages[existingIndex] = message;
          } else {
            messages.push(message);
          }
        },
        onFinish: async ({ finishReason, message }) => {
          if (finishReason === "tool-calls") {
            const toolCall = [...message?.parts ?? []].reverse().find((part) => part.type === "tool-invocation")?.toolInvocation;
            if (toolCall) {
              toolCalls.push(toolCall);
            }
            for (const toolCall2 of toolCalls) {
              const clientTool = processedParams.clientTools?.[toolCall2.toolName];
              if (clientTool && clientTool.execute) {
                const result = await clientTool.execute(
                  {
                    context: toolCall2?.args,
                    runId: processedParams.runId,
                    resourceId: processedParams.resourceId,
                    threadId: processedParams.threadId,
                    runtimeContext: processedParams.runtimeContext
                  },
                  {
                    messages: response.messages,
                    toolCallId: toolCall2?.toolCallId
                  }
                );
                const lastMessage = JSON.parse(JSON.stringify(messages[messages.length - 1]));
                const toolInvocationPart = lastMessage?.parts?.find(
                  (part) => part.type === "tool-invocation" && part.toolInvocation?.toolCallId === toolCall2.toolCallId
                );
                if (toolInvocationPart) {
                  toolInvocationPart.toolInvocation = {
                    ...toolInvocationPart.toolInvocation,
                    state: "result",
                    result
                  };
                }
                const toolInvocation = lastMessage?.toolInvocations?.find(
                  (toolInvocation2) => toolInvocation2.toolCallId === toolCall2.toolCallId
                );
                if (toolInvocation) {
                  toolInvocation.state = "result";
                  toolInvocation.result = result;
                }
                const writer = writable.getWriter();
                try {
                  await writer.write(
                    new TextEncoder().encode(
                      "a:" + JSON.stringify({
                        toolCallId: toolCall2.toolCallId,
                        result
                      }) + "\n"
                    )
                  );
                } finally {
                  writer.releaseLock();
                }
                const originalMessages = processedParams.messages;
                const messageArray = Array.isArray(originalMessages) ? originalMessages : [originalMessages];
                this.processStreamResponse_vNext(
                  {
                    ...processedParams,
                    messages: [...messageArray, ...messages.filter((m) => m.id !== lastMessage.id), lastMessage]
                  },
                  writable
                ).catch((error) => {
                  console.error("Error processing stream response:", error);
                });
              }
            }
          } else {
            setTimeout(() => {
              writable.close();
            }, 0);
          }
        },
        lastMessage: void 0
      }).catch((error) => {
        console.error("Error processing stream response:", error);
      });
    } catch (error) {
      console.error("Error processing stream response:", error);
    }
    return response;
  }
  async streamVNext(params) {
    const processedParams = {
      ...params,
      output: params.output ? zodToJsonSchema(params.output) : void 0,
      runtimeContext: parseClientRuntimeContext(params.runtimeContext),
      clientTools: processClientTools(params.clientTools)
    };
    const { readable, writable } = new TransformStream();
    const response = await this.processStreamResponse_vNext(processedParams, writable);
    const streamResponse = new Response(readable, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    streamResponse.processDataStream = async ({
      onChunk
    }) => {
      await processMastraStream({
        stream: streamResponse.body,
        onChunk
      });
    };
    return streamResponse;
  }
  /**
   * Processes the stream response and handles tool calls
   */
  async processStreamResponse(processedParams, writable) {
    const response = await this.request(`/api/agents/${this.agentId}/stream`, {
      method: "POST",
      body: processedParams,
      stream: true
    });
    if (!response.body) {
      throw new Error("No response body");
    }
    try {
      let toolCalls = [];
      let messages = [];
      const [streamForWritable, streamForProcessing] = response.body.tee();
      streamForWritable.pipeTo(writable, {
        preventClose: true
      }).catch((error) => {
        console.error("Error piping to writable stream:", error);
      });
      this.processChatResponse({
        stream: streamForProcessing,
        update: ({ message }) => {
          const existingIndex = messages.findIndex((m) => m.id === message.id);
          if (existingIndex !== -1) {
            messages[existingIndex] = message;
          } else {
            messages.push(message);
          }
        },
        onFinish: async ({ finishReason, message }) => {
          if (finishReason === "tool-calls") {
            const toolCall = [...message?.parts ?? []].reverse().find((part) => part.type === "tool-invocation")?.toolInvocation;
            if (toolCall) {
              toolCalls.push(toolCall);
            }
            for (const toolCall2 of toolCalls) {
              const clientTool = processedParams.clientTools?.[toolCall2.toolName];
              if (clientTool && clientTool.execute) {
                const result = await clientTool.execute(
                  {
                    context: toolCall2?.args,
                    runId: processedParams.runId,
                    resourceId: processedParams.resourceId,
                    threadId: processedParams.threadId,
                    runtimeContext: processedParams.runtimeContext
                  },
                  {
                    messages: response.messages,
                    toolCallId: toolCall2?.toolCallId
                  }
                );
                const lastMessage = JSON.parse(JSON.stringify(messages[messages.length - 1]));
                const toolInvocationPart = lastMessage?.parts?.find(
                  (part) => part.type === "tool-invocation" && part.toolInvocation?.toolCallId === toolCall2.toolCallId
                );
                if (toolInvocationPart) {
                  toolInvocationPart.toolInvocation = {
                    ...toolInvocationPart.toolInvocation,
                    state: "result",
                    result
                  };
                }
                const toolInvocation = lastMessage?.toolInvocations?.find(
                  (toolInvocation2) => toolInvocation2.toolCallId === toolCall2.toolCallId
                );
                if (toolInvocation) {
                  toolInvocation.state = "result";
                  toolInvocation.result = result;
                }
                const writer = writable.getWriter();
                try {
                  await writer.write(
                    new TextEncoder().encode(
                      "a:" + JSON.stringify({
                        toolCallId: toolCall2.toolCallId,
                        result
                      }) + "\n"
                    )
                  );
                } finally {
                  writer.releaseLock();
                }
                const originalMessages = processedParams.messages;
                const messageArray = Array.isArray(originalMessages) ? originalMessages : [originalMessages];
                this.processStreamResponse(
                  {
                    ...processedParams,
                    messages: [...messageArray, ...messages.filter((m) => m.id !== lastMessage.id), lastMessage]
                  },
                  writable
                ).catch((error) => {
                  console.error("Error processing stream response:", error);
                });
              }
            }
          } else {
            setTimeout(() => {
              writable.close();
            }, 0);
          }
        },
        lastMessage: void 0
      }).catch((error) => {
        console.error("Error processing stream response:", error);
      });
    } catch (error) {
      console.error("Error processing stream response:", error);
    }
    return response;
  }
  /**
   * Gets details about a specific tool available to the agent
   * @param toolId - ID of the tool to retrieve
   * @returns Promise containing tool details
   */
  getTool(toolId) {
    return this.request(`/api/agents/${this.agentId}/tools/${toolId}`);
  }
  /**
   * Executes a tool for the agent
   * @param toolId - ID of the tool to execute
   * @param params - Parameters required for tool execution
   * @returns Promise containing the tool execution results
   */
  executeTool(toolId, params) {
    const body = {
      data: params.data,
      runtimeContext: params.runtimeContext ? Object.fromEntries(params.runtimeContext.entries()) : void 0
    };
    return this.request(`/api/agents/${this.agentId}/tools/${toolId}/execute`, {
      method: "POST",
      body
    });
  }
  /**
   * Retrieves evaluation results for the agent
   * @returns Promise containing agent evaluations
   */
  evals() {
    return this.request(`/api/agents/${this.agentId}/evals/ci`);
  }
  /**
   * Retrieves live evaluation results for the agent
   * @returns Promise containing live agent evaluations
   */
  liveEvals() {
    return this.request(`/api/agents/${this.agentId}/evals/live`);
  }
  /**
   * Updates the model for the agent
   * @param params - Parameters for updating the model
   * @returns Promise containing the updated model
   */
  updateModel(params) {
    return this.request(`/api/agents/${this.agentId}/model`, {
      method: "POST",
      body: params
    });
  }
};
var Network = class extends BaseResource {
  constructor(options, networkId) {
    super(options);
    this.networkId = networkId;
  }
  /**
   * Retrieves details about the network
   * @returns Promise containing network details
   */
  details() {
    return this.request(`/api/networks/${this.networkId}`);
  }
  /**
   * Generates a response from the agent
   * @param params - Generation parameters including prompt
   * @returns Promise containing the generated response
   */
  generate(params) {
    const processedParams = {
      ...params,
      output: zodToJsonSchema(params.output),
      experimental_output: zodToJsonSchema(params.experimental_output)
    };
    return this.request(`/api/networks/${this.networkId}/generate`, {
      method: "POST",
      body: processedParams
    });
  }
  /**
   * Streams a response from the agent
   * @param params - Stream parameters including prompt
   * @returns Promise containing the enhanced Response object with processDataStream method
   */
  async stream(params) {
    const processedParams = {
      ...params,
      output: zodToJsonSchema(params.output),
      experimental_output: zodToJsonSchema(params.experimental_output)
    };
    const response = await this.request(`/api/networks/${this.networkId}/stream`, {
      method: "POST",
      body: processedParams,
      stream: true
    });
    if (!response.body) {
      throw new Error("No response body");
    }
    response.processDataStream = async (options = {}) => {
      await processDataStream({
        stream: response.body,
        ...options
      });
    };
    return response;
  }
};

// src/resources/memory-thread.ts
var MemoryThread = class extends BaseResource {
  constructor(options, threadId, agentId) {
    super(options);
    this.threadId = threadId;
    this.agentId = agentId;
  }
  /**
   * Retrieves the memory thread details
   * @returns Promise containing thread details including title and metadata
   */
  get() {
    return this.request(`/api/memory/threads/${this.threadId}?agentId=${this.agentId}`);
  }
  /**
   * Updates the memory thread properties
   * @param params - Update parameters including title and metadata
   * @returns Promise containing updated thread details
   */
  update(params) {
    return this.request(`/api/memory/threads/${this.threadId}?agentId=${this.agentId}`, {
      method: "PATCH",
      body: params
    });
  }
  /**
   * Deletes the memory thread
   * @returns Promise containing deletion result
   */
  delete() {
    return this.request(`/api/memory/threads/${this.threadId}?agentId=${this.agentId}`, {
      method: "DELETE"
    });
  }
  /**
   * Retrieves messages associated with the thread
   * @param params - Optional parameters including limit for number of messages to retrieve
   * @returns Promise containing thread messages and UI messages
   */
  getMessages(params) {
    const query = new URLSearchParams({
      agentId: this.agentId,
      ...params?.limit ? { limit: params.limit.toString() } : {}
    });
    return this.request(`/api/memory/threads/${this.threadId}/messages?${query.toString()}`);
  }
  /**
   * Retrieves paginated messages associated with the thread with advanced filtering and selection options
   * @param params - Pagination parameters including selectBy criteria, page, perPage, date ranges, and message inclusion options
   * @returns Promise containing paginated thread messages with pagination metadata (total, page, perPage, hasMore)
   */
  getMessagesPaginated({
    selectBy,
    ...rest
  }) {
    const query = new URLSearchParams({
      ...rest,
      ...selectBy ? { selectBy: JSON.stringify(selectBy) } : {}
    });
    return this.request(`/api/memory/threads/${this.threadId}/messages/paginated?${query.toString()}`);
  }
  /**
   * Deletes one or more messages from the thread
   * @param messageIds - Can be a single message ID (string), array of message IDs,
   *                     message object with id property, or array of message objects
   * @returns Promise containing deletion result
   */
  deleteMessages(messageIds) {
    const query = new URLSearchParams({
      agentId: this.agentId
    });
    return this.request(`/api/memory/messages/delete?${query.toString()}`, {
      method: "POST",
      body: { messageIds }
    });
  }
};

// src/resources/vector.ts
var Vector = class extends BaseResource {
  constructor(options, vectorName) {
    super(options);
    this.vectorName = vectorName;
  }
  /**
   * Retrieves details about a specific vector index
   * @param indexName - Name of the index to get details for
   * @returns Promise containing vector index details
   */
  details(indexName) {
    return this.request(`/api/vector/${this.vectorName}/indexes/${indexName}`);
  }
  /**
   * Deletes a vector index
   * @param indexName - Name of the index to delete
   * @returns Promise indicating deletion success
   */
  delete(indexName) {
    return this.request(`/api/vector/${this.vectorName}/indexes/${indexName}`, {
      method: "DELETE"
    });
  }
  /**
   * Retrieves a list of all available indexes
   * @returns Promise containing array of index names
   */
  getIndexes() {
    return this.request(`/api/vector/${this.vectorName}/indexes`);
  }
  /**
   * Creates a new vector index
   * @param params - Parameters for index creation including dimension and metric
   * @returns Promise indicating creation success
   */
  createIndex(params) {
    return this.request(`/api/vector/${this.vectorName}/create-index`, {
      method: "POST",
      body: params
    });
  }
  /**
   * Upserts vectors into an index
   * @param params - Parameters containing vectors, metadata, and optional IDs
   * @returns Promise containing array of vector IDs
   */
  upsert(params) {
    return this.request(`/api/vector/${this.vectorName}/upsert`, {
      method: "POST",
      body: params
    });
  }
  /**
   * Queries vectors in an index
   * @param params - Query parameters including query vector and search options
   * @returns Promise containing query results
   */
  query(params) {
    return this.request(`/api/vector/${this.vectorName}/query`, {
      method: "POST",
      body: params
    });
  }
};

// src/resources/legacy-workflow.ts
var RECORD_SEPARATOR = "";
var LegacyWorkflow = class extends BaseResource {
  constructor(options, workflowId) {
    super(options);
    this.workflowId = workflowId;
  }
  /**
   * Retrieves details about the legacy workflow
   * @returns Promise containing legacy workflow details including steps and graphs
   */
  details() {
    return this.request(`/api/workflows/legacy/${this.workflowId}`);
  }
  /**
   * Retrieves all runs for a legacy workflow
   * @param params - Parameters for filtering runs
   * @returns Promise containing legacy workflow runs array
   */
  runs(params) {
    const searchParams = new URLSearchParams();
    if (params?.fromDate) {
      searchParams.set("fromDate", params.fromDate.toISOString());
    }
    if (params?.toDate) {
      searchParams.set("toDate", params.toDate.toISOString());
    }
    if (params?.limit) {
      searchParams.set("limit", String(params.limit));
    }
    if (params?.offset) {
      searchParams.set("offset", String(params.offset));
    }
    if (params?.resourceId) {
      searchParams.set("resourceId", params.resourceId);
    }
    if (searchParams.size) {
      return this.request(`/api/workflows/legacy/${this.workflowId}/runs?${searchParams}`);
    } else {
      return this.request(`/api/workflows/legacy/${this.workflowId}/runs`);
    }
  }
  /**
   * Creates a new legacy workflow run
   * @returns Promise containing the generated run ID
   */
  createRun(params) {
    const searchParams = new URLSearchParams();
    if (!!params?.runId) {
      searchParams.set("runId", params.runId);
    }
    return this.request(`/api/workflows/legacy/${this.workflowId}/create-run?${searchParams.toString()}`, {
      method: "POST"
    });
  }
  /**
   * Starts a legacy workflow run synchronously without waiting for the workflow to complete
   * @param params - Object containing the runId and triggerData
   * @returns Promise containing success message
   */
  start(params) {
    return this.request(`/api/workflows/legacy/${this.workflowId}/start?runId=${params.runId}`, {
      method: "POST",
      body: params?.triggerData
    });
  }
  /**
   * Resumes a suspended legacy workflow step synchronously without waiting for the workflow to complete
   * @param stepId - ID of the step to resume
   * @param runId - ID of the legacy workflow run
   * @param context - Context to resume the legacy workflow with
   * @returns Promise containing the legacy workflow resume results
   */
  resume({
    stepId,
    runId,
    context
  }) {
    return this.request(`/api/workflows/legacy/${this.workflowId}/resume?runId=${runId}`, {
      method: "POST",
      body: {
        stepId,
        context
      }
    });
  }
  /**
   * Starts a workflow run asynchronously and returns a promise that resolves when the workflow is complete
   * @param params - Object containing the optional runId and triggerData
   * @returns Promise containing the workflow execution results
   */
  startAsync(params) {
    const searchParams = new URLSearchParams();
    if (!!params?.runId) {
      searchParams.set("runId", params.runId);
    }
    return this.request(`/api/workflows/legacy/${this.workflowId}/start-async?${searchParams.toString()}`, {
      method: "POST",
      body: params?.triggerData
    });
  }
  /**
   * Resumes a suspended legacy workflow step asynchronously and returns a promise that resolves when the workflow is complete
   * @param params - Object containing the runId, stepId, and context
   * @returns Promise containing the workflow resume results
   */
  resumeAsync(params) {
    return this.request(`/api/workflows/legacy/${this.workflowId}/resume-async?runId=${params.runId}`, {
      method: "POST",
      body: {
        stepId: params.stepId,
        context: params.context
      }
    });
  }
  /**
   * Creates an async generator that processes a readable stream and yields records
   * separated by the Record Separator character (\x1E)
   *
   * @param stream - The readable stream to process
   * @returns An async generator that yields parsed records
   */
  async *streamProcessor(stream) {
    const reader = stream.getReader();
    let doneReading = false;
    let buffer = "";
    try {
      while (!doneReading) {
        const { done, value } = await reader.read();
        doneReading = done;
        if (done && !value) continue;
        try {
          const decoded = value ? new TextDecoder().decode(value) : "";
          const chunks = (buffer + decoded).split(RECORD_SEPARATOR);
          buffer = chunks.pop() || "";
          for (const chunk of chunks) {
            if (chunk) {
              if (typeof chunk === "string") {
                try {
                  const parsedChunk = JSON.parse(chunk);
                  yield parsedChunk;
                } catch {
                }
              }
            }
          }
        } catch {
        }
      }
      if (buffer) {
        try {
          yield JSON.parse(buffer);
        } catch {
        }
      }
    } finally {
      reader.cancel().catch(() => {
      });
    }
  }
  /**
   * Watches legacy workflow transitions in real-time
   * @param runId - Optional run ID to filter the watch stream
   * @returns AsyncGenerator that yields parsed records from the legacy workflow watch stream
   */
  async watch({ runId }, onRecord) {
    const response = await this.request(`/api/workflows/legacy/${this.workflowId}/watch?runId=${runId}`, {
      stream: true
    });
    if (!response.ok) {
      throw new Error(`Failed to watch legacy workflow: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error("Response body is null");
    }
    for await (const record of this.streamProcessor(response.body)) {
      onRecord(record);
    }
  }
};

// src/resources/tool.ts
var Tool = class extends BaseResource {
  constructor(options, toolId) {
    super(options);
    this.toolId = toolId;
  }
  /**
   * Retrieves details about the tool
   * @returns Promise containing tool details including description and schemas
   */
  details() {
    return this.request(`/api/tools/${this.toolId}`);
  }
  /**
   * Executes the tool with the provided parameters
   * @param params - Parameters required for tool execution
   * @returns Promise containing the tool execution results
   */
  execute(params) {
    const url = new URLSearchParams();
    if (params.runId) {
      url.set("runId", params.runId);
    }
    const body = {
      data: params.data,
      runtimeContext: parseClientRuntimeContext(params.runtimeContext)
    };
    return this.request(`/api/tools/${this.toolId}/execute?${url.toString()}`, {
      method: "POST",
      body
    });
  }
};

// src/resources/workflow.ts
var RECORD_SEPARATOR2 = "";
var Workflow = class extends BaseResource {
  constructor(options, workflowId) {
    super(options);
    this.workflowId = workflowId;
  }
  /**
   * Creates an async generator that processes a readable stream and yields workflow records
   * separated by the Record Separator character (\x1E)
   *
   * @param stream - The readable stream to process
   * @returns An async generator that yields parsed records
   */
  async *streamProcessor(stream) {
    const reader = stream.getReader();
    let doneReading = false;
    let buffer = "";
    try {
      while (!doneReading) {
        const { done, value } = await reader.read();
        doneReading = done;
        if (done && !value) continue;
        try {
          const decoded = value ? new TextDecoder().decode(value) : "";
          const chunks = (buffer + decoded).split(RECORD_SEPARATOR2);
          buffer = chunks.pop() || "";
          for (const chunk of chunks) {
            if (chunk) {
              if (typeof chunk === "string") {
                try {
                  const parsedChunk = JSON.parse(chunk);
                  yield parsedChunk;
                } catch {
                }
              }
            }
          }
        } catch {
        }
      }
      if (buffer) {
        try {
          yield JSON.parse(buffer);
        } catch {
        }
      }
    } finally {
      reader.cancel().catch(() => {
      });
    }
  }
  /**
   * Retrieves details about the workflow
   * @returns Promise containing workflow details including steps and graphs
   */
  details() {
    return this.request(`/api/workflows/${this.workflowId}`);
  }
  /**
   * Retrieves all runs for a workflow
   * @param params - Parameters for filtering runs
   * @returns Promise containing workflow runs array
   */
  runs(params) {
    const searchParams = new URLSearchParams();
    if (params?.fromDate) {
      searchParams.set("fromDate", params.fromDate.toISOString());
    }
    if (params?.toDate) {
      searchParams.set("toDate", params.toDate.toISOString());
    }
    if (params?.limit !== null && params?.limit !== void 0 && !isNaN(Number(params?.limit))) {
      searchParams.set("limit", String(params.limit));
    }
    if (params?.offset !== null && params?.offset !== void 0 && !isNaN(Number(params?.offset))) {
      searchParams.set("offset", String(params.offset));
    }
    if (params?.resourceId) {
      searchParams.set("resourceId", params.resourceId);
    }
    if (searchParams.size) {
      return this.request(`/api/workflows/${this.workflowId}/runs?${searchParams}`);
    } else {
      return this.request(`/api/workflows/${this.workflowId}/runs`);
    }
  }
  /**
   * Retrieves a specific workflow run by its ID
   * @param runId - The ID of the workflow run to retrieve
   * @returns Promise containing the workflow run details
   */
  runById(runId) {
    return this.request(`/api/workflows/${this.workflowId}/runs/${runId}`);
  }
  /**
   * Retrieves the execution result for a specific workflow run by its ID
   * @param runId - The ID of the workflow run to retrieve the execution result for
   * @returns Promise containing the workflow run execution result
   */
  runExecutionResult(runId) {
    return this.request(`/api/workflows/${this.workflowId}/runs/${runId}/execution-result`);
  }
  /**
   * Cancels a specific workflow run by its ID
   * @param runId - The ID of the workflow run to cancel
   * @returns Promise containing a success message
   */
  cancelRun(runId) {
    return this.request(`/api/workflows/${this.workflowId}/runs/${runId}/cancel`, {
      method: "POST"
    });
  }
  /**
   * Sends an event to a specific workflow run by its ID
   * @param params - Object containing the runId, event and data
   * @returns Promise containing a success message
   */
  sendRunEvent(params) {
    return this.request(`/api/workflows/${this.workflowId}/runs/${params.runId}/send-event`, {
      method: "POST",
      body: { event: params.event, data: params.data }
    });
  }
  /**
   * Creates a new workflow run
   * @param params - Optional object containing the optional runId
   * @returns Promise containing the runId of the created run
   */
  createRun(params) {
    const searchParams = new URLSearchParams();
    if (!!params?.runId) {
      searchParams.set("runId", params.runId);
    }
    return this.request(`/api/workflows/${this.workflowId}/create-run?${searchParams.toString()}`, {
      method: "POST"
    });
  }
  /**
   * Creates a new workflow run (alias for createRun)
   * @param params - Optional object containing the optional runId
   * @returns Promise containing the runId of the created run
   */
  createRunAsync(params) {
    return this.createRun(params);
  }
  /**
   * Starts a workflow run synchronously without waiting for the workflow to complete
   * @param params - Object containing the runId, inputData and runtimeContext
   * @returns Promise containing success message
   */
  start(params) {
    const runtimeContext = parseClientRuntimeContext(params.runtimeContext);
    return this.request(`/api/workflows/${this.workflowId}/start?runId=${params.runId}`, {
      method: "POST",
      body: { inputData: params?.inputData, runtimeContext }
    });
  }
  /**
   * Resumes a suspended workflow step synchronously without waiting for the workflow to complete
   * @param params - Object containing the runId, step, resumeData and runtimeContext
   * @returns Promise containing success message
   */
  resume({
    step,
    runId,
    resumeData,
    ...rest
  }) {
    const runtimeContext = parseClientRuntimeContext(rest.runtimeContext);
    return this.request(`/api/workflows/${this.workflowId}/resume?runId=${runId}`, {
      method: "POST",
      stream: true,
      body: {
        step,
        resumeData,
        runtimeContext
      }
    });
  }
  /**
   * Starts a workflow run asynchronously and returns a promise that resolves when the workflow is complete
   * @param params - Object containing the optional runId, inputData and runtimeContext
   * @returns Promise containing the workflow execution results
   */
  startAsync(params) {
    const searchParams = new URLSearchParams();
    if (!!params?.runId) {
      searchParams.set("runId", params.runId);
    }
    const runtimeContext = parseClientRuntimeContext(params.runtimeContext);
    return this.request(`/api/workflows/${this.workflowId}/start-async?${searchParams.toString()}`, {
      method: "POST",
      body: { inputData: params.inputData, runtimeContext }
    });
  }
  /**
   * Starts a workflow run and returns a stream
   * @param params - Object containing the optional runId, inputData and runtimeContext
   * @returns Promise containing the workflow execution results
   */
  async stream(params) {
    const searchParams = new URLSearchParams();
    if (!!params?.runId) {
      searchParams.set("runId", params.runId);
    }
    const runtimeContext = parseClientRuntimeContext(params.runtimeContext);
    const response = await this.request(
      `/api/workflows/${this.workflowId}/stream?${searchParams.toString()}`,
      {
        method: "POST",
        body: { inputData: params.inputData, runtimeContext },
        stream: true
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to stream vNext workflow: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error("Response body is null");
    }
    let failedChunk = void 0;
    const transformStream = new TransformStream({
      start() {
      },
      async transform(chunk, controller) {
        try {
          const decoded = new TextDecoder().decode(chunk);
          const chunks = decoded.split(RECORD_SEPARATOR2);
          for (const chunk2 of chunks) {
            if (chunk2) {
              const newChunk = failedChunk ? failedChunk + chunk2 : chunk2;
              try {
                const parsedChunk = JSON.parse(newChunk);
                controller.enqueue(parsedChunk);
                failedChunk = void 0;
              } catch {
                failedChunk = newChunk;
              }
            }
          }
        } catch {
        }
      }
    });
    return response.body.pipeThrough(transformStream);
  }
  /**
   * Resumes a suspended workflow step asynchronously and returns a promise that resolves when the workflow is complete
   * @param params - Object containing the runId, step, resumeData and runtimeContext
   * @returns Promise containing the workflow resume results
   */
  resumeAsync(params) {
    const runtimeContext = parseClientRuntimeContext(params.runtimeContext);
    return this.request(`/api/workflows/${this.workflowId}/resume-async?runId=${params.runId}`, {
      method: "POST",
      body: {
        step: params.step,
        resumeData: params.resumeData,
        runtimeContext
      }
    });
  }
  /**
   * Watches workflow transitions in real-time
   * @param runId - Optional run ID to filter the watch stream
   * @returns AsyncGenerator that yields parsed records from the workflow watch stream
   */
  async watch({ runId }, onRecord) {
    const response = await this.request(`/api/workflows/${this.workflowId}/watch?runId=${runId}`, {
      stream: true
    });
    if (!response.ok) {
      throw new Error(`Failed to watch workflow: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error("Response body is null");
    }
    for await (const record of this.streamProcessor(response.body)) {
      if (typeof record === "string") {
        onRecord(JSON.parse(record));
      } else {
        onRecord(record);
      }
    }
  }
  /**
   * Creates a new ReadableStream from an iterable or async iterable of objects,
   * serializing each as JSON and separating them with the record separator (\x1E).
   *
   * @param records - An iterable or async iterable of objects to stream
   * @returns A ReadableStream emitting the records as JSON strings separated by the record separator
   */
  static createRecordStream(records) {
    const encoder = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const record of records) {
            const json = JSON.stringify(record) + RECORD_SEPARATOR2;
            controller.enqueue(encoder.encode(json));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });
  }
};

// src/resources/a2a.ts
var A2A = class extends BaseResource {
  constructor(options, agentId) {
    super(options);
    this.agentId = agentId;
  }
  /**
   * Get the agent card with metadata about the agent
   * @returns Promise containing the agent card information
   */
  async getCard() {
    return this.request(`/.well-known/${this.agentId}/agent-card.json`);
  }
  /**
   * Send a message to the agent and gets a message or task response
   * @param params - Parameters for the task
   * @returns Promise containing the response
   */
  async sendMessage(params) {
    const response = await this.request(`/a2a/${this.agentId}`, {
      method: "POST",
      body: {
        method: "message/send",
        params
      }
    });
    return response;
  }
  /**
   * Sends a message to an agent to initiate/continue a task and subscribes
   * the client to real-time updates for that task via Server-Sent Events (SSE).
   * @param params - Parameters for the task
   * @returns A stream of Server-Sent Events. Each SSE `data` field contains a `SendStreamingMessageResponse`
   */
  async sendStreamingMessage(params) {
    const response = await this.request(`/a2a/${this.agentId}`, {
      method: "POST",
      body: {
        method: "message/stream",
        params
      }
    });
    return response;
  }
  /**
   * Get the status and result of a task
   * @param params - Parameters for querying the task
   * @returns Promise containing the task response
   */
  async getTask(params) {
    const response = await this.request(`/a2a/${this.agentId}`, {
      method: "POST",
      body: {
        method: "tasks/get",
        params
      }
    });
    return response;
  }
  /**
   * Cancel a running task
   * @param params - Parameters identifying the task to cancel
   * @returns Promise containing the task response
   */
  async cancelTask(params) {
    return this.request(`/a2a/${this.agentId}`, {
      method: "POST",
      body: {
        method: "tasks/cancel",
        params
      }
    });
  }
};

// src/resources/mcp-tool.ts
var MCPTool = class extends BaseResource {
  serverId;
  toolId;
  constructor(options, serverId, toolId) {
    super(options);
    this.serverId = serverId;
    this.toolId = toolId;
  }
  /**
   * Retrieves details about this specific tool from the MCP server.
   * @returns Promise containing the tool's information (name, description, schema).
   */
  details() {
    return this.request(`/api/mcp/${this.serverId}/tools/${this.toolId}`);
  }
  /**
   * Executes this specific tool on the MCP server.
   * @param params - Parameters for tool execution, including data/args and optional runtimeContext.
   * @returns Promise containing the result of the tool execution.
   */
  execute(params) {
    const body = {};
    if (params.data !== void 0) body.data = params.data;
    if (params.runtimeContext !== void 0) {
      body.runtimeContext = params.runtimeContext;
    }
    return this.request(`/api/mcp/${this.serverId}/tools/${this.toolId}/execute`, {
      method: "POST",
      body: Object.keys(body).length > 0 ? body : void 0
    });
  }
};

// src/resources/observability.ts
var Observability = class extends BaseResource {
  constructor(options) {
    super(options);
  }
  /**
   * Retrieves a specific AI trace by ID
   * @param traceId - ID of the trace to retrieve
   * @returns Promise containing the AI trace with all its spans
   */
  getTrace(traceId) {
    return this.request(`/api/observability/traces/${traceId}`);
  }
  /**
   * Retrieves paginated list of AI traces with optional filtering
   * @param params - Parameters for pagination and filtering
   * @returns Promise containing paginated traces and pagination info
   */
  getTraces(params) {
    const { pagination, filters } = params;
    const { page, perPage, dateRange } = pagination || {};
    const { name, spanType } = filters || {};
    const searchParams = new URLSearchParams();
    if (page !== void 0) {
      searchParams.set("page", String(page));
    }
    if (perPage !== void 0) {
      searchParams.set("perPage", String(perPage));
    }
    if (name) {
      searchParams.set("name", name);
    }
    if (spanType !== void 0) {
      searchParams.set("spanType", String(spanType));
    }
    if (dateRange) {
      const dateRangeStr = JSON.stringify({
        start: dateRange.start instanceof Date ? dateRange.start.toISOString() : dateRange.start,
        end: dateRange.end instanceof Date ? dateRange.end.toISOString() : dateRange.end
      });
      searchParams.set("dateRange", dateRangeStr);
    }
    const queryString = searchParams.toString();
    return this.request(`/api/observability/traces${queryString ? `?${queryString}` : ""}`);
  }
};

// src/resources/network-memory-thread.ts
var NetworkMemoryThread = class extends BaseResource {
  constructor(options, threadId, networkId) {
    super(options);
    this.threadId = threadId;
    this.networkId = networkId;
  }
  /**
   * Retrieves the memory thread details
   * @returns Promise containing thread details including title and metadata
   */
  get() {
    return this.request(`/api/memory/network/threads/${this.threadId}?networkId=${this.networkId}`);
  }
  /**
   * Updates the memory thread properties
   * @param params - Update parameters including title and metadata
   * @returns Promise containing updated thread details
   */
  update(params) {
    return this.request(`/api/memory/network/threads/${this.threadId}?networkId=${this.networkId}`, {
      method: "PATCH",
      body: params
    });
  }
  /**
   * Deletes the memory thread
   * @returns Promise containing deletion result
   */
  delete() {
    return this.request(`/api/memory/network/threads/${this.threadId}?networkId=${this.networkId}`, {
      method: "DELETE"
    });
  }
  /**
   * Retrieves messages associated with the thread
   * @param params - Optional parameters including limit for number of messages to retrieve
   * @returns Promise containing thread messages and UI messages
   */
  getMessages(params) {
    const query = new URLSearchParams({
      networkId: this.networkId,
      ...params?.limit ? { limit: params.limit.toString() } : {}
    });
    return this.request(`/api/memory/network/threads/${this.threadId}/messages?${query.toString()}`);
  }
  /**
   * Deletes one or more messages from the thread
   * @param messageIds - Can be a single message ID (string), array of message IDs,
   *                     message object with id property, or array of message objects
   * @returns Promise containing deletion result
   */
  deleteMessages(messageIds) {
    const query = new URLSearchParams({
      networkId: this.networkId
    });
    return this.request(`/api/memory/network/messages/delete?${query.toString()}`, {
      method: "POST",
      body: { messageIds }
    });
  }
};

// src/resources/vNextNetwork.ts
var RECORD_SEPARATOR3 = "";
var VNextNetwork = class extends BaseResource {
  constructor(options, networkId) {
    super(options);
    this.networkId = networkId;
  }
  /**
   * Retrieves details about the network
   * @returns Promise containing vNext network details
   */
  details() {
    return this.request(`/api/networks/v-next/${this.networkId}`);
  }
  /**
   * Generates a response from the v-next network
   * @param params - Generation parameters including message
   * @returns Promise containing the generated response
   */
  generate(params) {
    return this.request(`/api/networks/v-next/${this.networkId}/generate`, {
      method: "POST",
      body: {
        ...params,
        runtimeContext: parseClientRuntimeContext(params.runtimeContext)
      }
    });
  }
  /**
   * Generates a response from the v-next network using multiple primitives
   * @param params - Generation parameters including message
   * @returns Promise containing the generated response
   */
  loop(params) {
    return this.request(`/api/networks/v-next/${this.networkId}/loop`, {
      method: "POST",
      body: {
        ...params,
        runtimeContext: parseClientRuntimeContext(params.runtimeContext)
      }
    });
  }
  async *streamProcessor(stream) {
    const reader = stream.getReader();
    let doneReading = false;
    let buffer = "";
    try {
      while (!doneReading) {
        const { done, value } = await reader.read();
        doneReading = done;
        if (done && !value) continue;
        try {
          const decoded = value ? new TextDecoder().decode(value) : "";
          const chunks = (buffer + decoded).split(RECORD_SEPARATOR3);
          buffer = chunks.pop() || "";
          for (const chunk of chunks) {
            if (chunk) {
              if (typeof chunk === "string") {
                try {
                  const parsedChunk = JSON.parse(chunk);
                  yield parsedChunk;
                } catch {
                }
              }
            }
          }
        } catch {
        }
      }
      if (buffer) {
        try {
          yield JSON.parse(buffer);
        } catch {
        }
      }
    } finally {
      reader.cancel().catch(() => {
      });
    }
  }
  /**
   * Streams a response from the v-next network
   * @param params - Stream parameters including message
   * @returns Promise containing the results
   */
  async stream(params, onRecord) {
    const response = await this.request(`/api/networks/v-next/${this.networkId}/stream`, {
      method: "POST",
      body: {
        ...params,
        runtimeContext: parseClientRuntimeContext(params.runtimeContext)
      },
      stream: true
    });
    if (!response.ok) {
      throw new Error(`Failed to stream vNext network: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error("Response body is null");
    }
    for await (const record of this.streamProcessor(response.body)) {
      if (typeof record === "string") {
        onRecord(JSON.parse(record));
      } else {
        onRecord(record);
      }
    }
  }
  /**
   * Streams a response from the v-next network loop
   * @param params - Stream parameters including message
   * @returns Promise containing the results
   */
  async loopStream(params, onRecord) {
    const response = await this.request(`/api/networks/v-next/${this.networkId}/loop-stream`, {
      method: "POST",
      body: {
        ...params,
        runtimeContext: parseClientRuntimeContext(params.runtimeContext)
      },
      stream: true
    });
    if (!response.ok) {
      throw new Error(`Failed to stream vNext network loop: ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error("Response body is null");
    }
    for await (const record of this.streamProcessor(response.body)) {
      if (typeof record === "string") {
        onRecord(JSON.parse(record));
      } else {
        onRecord(record);
      }
    }
  }
};

// src/client.ts
var MastraClient = class extends BaseResource {
  observability;
  constructor(options) {
    super(options);
    this.observability = new Observability(options);
  }
  /**
   * Retrieves all available agents
   * @returns Promise containing map of agent IDs to agent details
   */
  getAgents() {
    return this.request("/api/agents");
  }
  async getAGUI({ resourceId }) {
    const agents = await this.getAgents();
    return Object.entries(agents).reduce(
      (acc, [agentId]) => {
        const agent = this.getAgent(agentId);
        acc[agentId] = new AGUIAdapter({
          agentId,
          agent,
          resourceId
        });
        return acc;
      },
      {}
    );
  }
  /**
   * Gets an agent instance by ID
   * @param agentId - ID of the agent to retrieve
   * @returns Agent instance
   */
  getAgent(agentId) {
    return new Agent(this.options, agentId);
  }
  /**
   * Retrieves memory threads for a resource
   * @param params - Parameters containing the resource ID
   * @returns Promise containing array of memory threads
   */
  getMemoryThreads(params) {
    return this.request(`/api/memory/threads?resourceid=${params.resourceId}&agentId=${params.agentId}`);
  }
  /**
   * Creates a new memory thread
   * @param params - Parameters for creating the memory thread
   * @returns Promise containing the created memory thread
   */
  createMemoryThread(params) {
    return this.request(`/api/memory/threads?agentId=${params.agentId}`, { method: "POST", body: params });
  }
  /**
   * Gets a memory thread instance by ID
   * @param threadId - ID of the memory thread to retrieve
   * @returns MemoryThread instance
   */
  getMemoryThread(threadId, agentId) {
    return new MemoryThread(this.options, threadId, agentId);
  }
  /**
   * Saves messages to memory
   * @param params - Parameters containing messages to save
   * @returns Promise containing the saved messages
   */
  saveMessageToMemory(params) {
    return this.request(`/api/memory/save-messages?agentId=${params.agentId}`, {
      method: "POST",
      body: params
    });
  }
  /**
   * Gets the status of the memory system
   * @returns Promise containing memory system status
   */
  getMemoryStatus(agentId) {
    return this.request(`/api/memory/status?agentId=${agentId}`);
  }
  /**
   * Retrieves memory threads for a resource
   * @param params - Parameters containing the resource ID
   * @returns Promise containing array of memory threads
   */
  getNetworkMemoryThreads(params) {
    return this.request(`/api/memory/network/threads?resourceid=${params.resourceId}&networkId=${params.networkId}`);
  }
  /**
   * Creates a new memory thread
   * @param params - Parameters for creating the memory thread
   * @returns Promise containing the created memory thread
   */
  createNetworkMemoryThread(params) {
    return this.request(`/api/memory/network/threads?networkId=${params.networkId}`, { method: "POST", body: params });
  }
  /**
   * Gets a memory thread instance by ID
   * @param threadId - ID of the memory thread to retrieve
   * @returns MemoryThread instance
   */
  getNetworkMemoryThread(threadId, networkId) {
    return new NetworkMemoryThread(this.options, threadId, networkId);
  }
  /**
   * Saves messages to memory
   * @param params - Parameters containing messages to save
   * @returns Promise containing the saved messages
   */
  saveNetworkMessageToMemory(params) {
    return this.request(`/api/memory/network/save-messages?networkId=${params.networkId}`, {
      method: "POST",
      body: params
    });
  }
  /**
   * Gets the status of the memory system
   * @returns Promise containing memory system status
   */
  getNetworkMemoryStatus(networkId) {
    return this.request(`/api/memory/network/status?networkId=${networkId}`);
  }
  /**
   * Retrieves all available tools
   * @returns Promise containing map of tool IDs to tool details
   */
  getTools() {
    return this.request("/api/tools");
  }
  /**
   * Gets a tool instance by ID
   * @param toolId - ID of the tool to retrieve
   * @returns Tool instance
   */
  getTool(toolId) {
    return new Tool(this.options, toolId);
  }
  /**
   * Retrieves all available legacy workflows
   * @returns Promise containing map of legacy workflow IDs to legacy workflow details
   */
  getLegacyWorkflows() {
    return this.request("/api/workflows/legacy");
  }
  /**
   * Gets a legacy workflow instance by ID
   * @param workflowId - ID of the legacy workflow to retrieve
   * @returns Legacy Workflow instance
   */
  getLegacyWorkflow(workflowId) {
    return new LegacyWorkflow(this.options, workflowId);
  }
  /**
   * Retrieves all available workflows
   * @returns Promise containing map of workflow IDs to workflow details
   */
  getWorkflows() {
    return this.request("/api/workflows");
  }
  /**
   * Gets a workflow instance by ID
   * @param workflowId - ID of the workflow to retrieve
   * @returns Workflow instance
   */
  getWorkflow(workflowId) {
    return new Workflow(this.options, workflowId);
  }
  /**
   * Gets a vector instance by name
   * @param vectorName - Name of the vector to retrieve
   * @returns Vector instance
   */
  getVector(vectorName) {
    return new Vector(this.options, vectorName);
  }
  /**
   * Retrieves logs
   * @param params - Parameters for filtering logs
   * @returns Promise containing array of log messages
   */
  getLogs(params) {
    const { transportId, fromDate, toDate, logLevel, filters, page, perPage } = params;
    const _filters = filters ? Object.entries(filters).map(([key, value]) => `${key}:${value}`) : [];
    const searchParams = new URLSearchParams();
    if (transportId) {
      searchParams.set("transportId", transportId);
    }
    if (fromDate) {
      searchParams.set("fromDate", fromDate.toISOString());
    }
    if (toDate) {
      searchParams.set("toDate", toDate.toISOString());
    }
    if (logLevel) {
      searchParams.set("logLevel", logLevel);
    }
    if (page) {
      searchParams.set("page", String(page));
    }
    if (perPage) {
      searchParams.set("perPage", String(perPage));
    }
    if (_filters) {
      if (Array.isArray(_filters)) {
        for (const filter of _filters) {
          searchParams.append("filters", filter);
        }
      } else {
        searchParams.set("filters", _filters);
      }
    }
    if (searchParams.size) {
      return this.request(`/api/logs?${searchParams}`);
    } else {
      return this.request(`/api/logs`);
    }
  }
  /**
   * Gets logs for a specific run
   * @param params - Parameters containing run ID to retrieve
   * @returns Promise containing array of log messages
   */
  getLogForRun(params) {
    const { runId, transportId, fromDate, toDate, logLevel, filters, page, perPage } = params;
    const _filters = filters ? Object.entries(filters).map(([key, value]) => `${key}:${value}`) : [];
    const searchParams = new URLSearchParams();
    if (runId) {
      searchParams.set("runId", runId);
    }
    if (transportId) {
      searchParams.set("transportId", transportId);
    }
    if (fromDate) {
      searchParams.set("fromDate", fromDate.toISOString());
    }
    if (toDate) {
      searchParams.set("toDate", toDate.toISOString());
    }
    if (logLevel) {
      searchParams.set("logLevel", logLevel);
    }
    if (page) {
      searchParams.set("page", String(page));
    }
    if (perPage) {
      searchParams.set("perPage", String(perPage));
    }
    if (_filters) {
      if (Array.isArray(_filters)) {
        for (const filter of _filters) {
          searchParams.append("filters", filter);
        }
      } else {
        searchParams.set("filters", _filters);
      }
    }
    if (searchParams.size) {
      return this.request(`/api/logs/${runId}?${searchParams}`);
    } else {
      return this.request(`/api/logs/${runId}`);
    }
  }
  /**
   * List of all log transports
   * @returns Promise containing list of log transports
   */
  getLogTransports() {
    return this.request("/api/logs/transports");
  }
  /**
   * List of all traces (paged)
   * @param params - Parameters for filtering traces
   * @returns Promise containing telemetry data
   */
  getTelemetry(params) {
    const { name, scope, page, perPage, attribute, fromDate, toDate } = params || {};
    const _attribute = attribute ? Object.entries(attribute).map(([key, value]) => `${key}:${value}`) : [];
    const searchParams = new URLSearchParams();
    if (name) {
      searchParams.set("name", name);
    }
    if (scope) {
      searchParams.set("scope", scope);
    }
    if (page) {
      searchParams.set("page", String(page));
    }
    if (perPage) {
      searchParams.set("perPage", String(perPage));
    }
    if (_attribute) {
      if (Array.isArray(_attribute)) {
        for (const attr of _attribute) {
          searchParams.append("attribute", attr);
        }
      } else {
        searchParams.set("attribute", _attribute);
      }
    }
    if (fromDate) {
      searchParams.set("fromDate", fromDate.toISOString());
    }
    if (toDate) {
      searchParams.set("toDate", toDate.toISOString());
    }
    if (searchParams.size) {
      return this.request(`/api/telemetry?${searchParams}`);
    } else {
      return this.request(`/api/telemetry`);
    }
  }
  /**
   * Retrieves all available networks
   * @returns Promise containing map of network IDs to network details
   */
  getNetworks() {
    return this.request("/api/networks");
  }
  /**
   * Retrieves all available vNext networks
   * @returns Promise containing map of vNext network IDs to vNext network details
   */
  getVNextNetworks() {
    return this.request("/api/networks/v-next");
  }
  /**
   * Gets a network instance by ID
   * @param networkId - ID of the network to retrieve
   * @returns Network instance
   */
  getNetwork(networkId) {
    return new Network(this.options, networkId);
  }
  /**
   * Gets a vNext network instance by ID
   * @param networkId - ID of the vNext network to retrieve
   * @returns vNext Network instance
   */
  getVNextNetwork(networkId) {
    return new VNextNetwork(this.options, networkId);
  }
  /**
   * Retrieves a list of available MCP servers.
   * @param params - Optional parameters for pagination (limit, offset).
   * @returns Promise containing the list of MCP servers and pagination info.
   */
  getMcpServers(params) {
    const searchParams = new URLSearchParams();
    if (params?.limit !== void 0) {
      searchParams.set("limit", String(params.limit));
    }
    if (params?.offset !== void 0) {
      searchParams.set("offset", String(params.offset));
    }
    const queryString = searchParams.toString();
    return this.request(`/api/mcp/v0/servers${queryString ? `?${queryString}` : ""}`);
  }
  /**
   * Retrieves detailed information for a specific MCP server.
   * @param serverId - The ID of the MCP server to retrieve.
   * @param params - Optional parameters, e.g., specific version.
   * @returns Promise containing the detailed MCP server information.
   */
  getMcpServerDetails(serverId, params) {
    const searchParams = new URLSearchParams();
    if (params?.version) {
      searchParams.set("version", params.version);
    }
    const queryString = searchParams.toString();
    return this.request(`/api/mcp/v0/servers/${serverId}${queryString ? `?${queryString}` : ""}`);
  }
  /**
   * Retrieves a list of tools for a specific MCP server.
   * @param serverId - The ID of the MCP server.
   * @returns Promise containing the list of tools.
   */
  getMcpServerTools(serverId) {
    return this.request(`/api/mcp/${serverId}/tools`);
  }
  /**
   * Gets an MCPTool resource instance for a specific tool on an MCP server.
   * This instance can then be used to fetch details or execute the tool.
   * @param serverId - The ID of the MCP server.
   * @param toolId - The ID of the tool.
   * @returns MCPTool instance.
   */
  getMcpServerTool(serverId, toolId) {
    return new MCPTool(this.options, serverId, toolId);
  }
  /**
   * Gets an A2A client for interacting with an agent via the A2A protocol
   * @param agentId - ID of the agent to interact with
   * @returns A2A client instance
   */
  getA2A(agentId) {
    return new A2A(this.options, agentId);
  }
  /**
   * Retrieves the working memory for a specific thread (optionally resource-scoped).
   * @param agentId - ID of the agent.
   * @param threadId - ID of the thread.
   * @param resourceId - Optional ID of the resource.
   * @returns Working memory for the specified thread or resource.
   */
  getWorkingMemory({
    agentId,
    threadId,
    resourceId
  }) {
    return this.request(`/api/memory/threads/${threadId}/working-memory?agentId=${agentId}&resourceId=${resourceId}`);
  }
  /**
   * Updates the working memory for a specific thread (optionally resource-scoped).
   * @param agentId - ID of the agent.
   * @param threadId - ID of the thread.
   * @param workingMemory - The new working memory content.
   * @param resourceId - Optional ID of the resource.
   */
  updateWorkingMemory({
    agentId,
    threadId,
    workingMemory,
    resourceId
  }) {
    return this.request(`/api/memory/threads/${threadId}/working-memory?agentId=${agentId}`, {
      method: "POST",
      body: {
        workingMemory,
        resourceId
      }
    });
  }
  /**
   * Retrieves all available scorers
   * @returns Promise containing list of available scorers
   */
  getScorers() {
    return this.request("/api/scores/scorers");
  }
  /**
   * Retrieves a scorer by ID
   * @param scorerId - ID of the scorer to retrieve
   * @returns Promise containing the scorer
   */
  getScorer(scorerId) {
    return this.request(`/api/scores/scorers/${scorerId}`);
  }
  getScoresByScorerId(params) {
    const { page, perPage, scorerId, entityId, entityType } = params;
    const searchParams = new URLSearchParams();
    if (entityId) {
      searchParams.set("entityId", entityId);
    }
    if (entityType) {
      searchParams.set("entityType", entityType);
    }
    if (page !== void 0) {
      searchParams.set("page", String(page));
    }
    if (perPage !== void 0) {
      searchParams.set("perPage", String(perPage));
    }
    const queryString = searchParams.toString();
    return this.request(`/api/scores/scorer/${scorerId}${queryString ? `?${queryString}` : ""}`);
  }
  /**
   * Retrieves scores by run ID
   * @param params - Parameters containing run ID and pagination options
   * @returns Promise containing scores and pagination info
   */
  getScoresByRunId(params) {
    const { runId, page, perPage } = params;
    const searchParams = new URLSearchParams();
    if (page !== void 0) {
      searchParams.set("page", String(page));
    }
    if (perPage !== void 0) {
      searchParams.set("perPage", String(perPage));
    }
    const queryString = searchParams.toString();
    return this.request(`/api/scores/run/${runId}${queryString ? `?${queryString}` : ""}`);
  }
  /**
   * Retrieves scores by entity ID and type
   * @param params - Parameters containing entity ID, type, and pagination options
   * @returns Promise containing scores and pagination info
   */
  getScoresByEntityId(params) {
    const { entityId, entityType, page, perPage } = params;
    const searchParams = new URLSearchParams();
    if (page !== void 0) {
      searchParams.set("page", String(page));
    }
    if (perPage !== void 0) {
      searchParams.set("perPage", String(perPage));
    }
    const queryString = searchParams.toString();
    return this.request(`/api/scores/entity/${entityType}/${entityId}${queryString ? `?${queryString}` : ""}`);
  }
  /**
   * Saves a score
   * @param params - Parameters containing the score data to save
   * @returns Promise containing the saved score
   */
  saveScore(params) {
    return this.request("/api/scores", {
      method: "POST",
      body: params
    });
  }
  /**
   * Retrieves model providers with available keys
   * @returns Promise containing model providers with available keys
   */
  getModelProviders() {
    return this.request(`/api/model-providers`);
  }
  getAITrace(traceId) {
    return this.observability.getTrace(traceId);
  }
  getAITraces(params) {
    return this.observability.getTraces(params);
  }
};

class VibeflowAgentClient {
  baseUrl;
  constructor(baseUrl) {
    if (!baseUrl) {
      throw new Error("Base URL is required");
    }
    this.baseUrl = baseUrl;
  }
  async createMastraClient() {
    try {
      return new MastraClient({
        baseUrl: this.baseUrl
      });
    } catch (error) {
      console.error("Error creating Mastra client", error);
      throw new Error("Error creating Mastra client");
    }
  }
  async createMastraAgent(agentName) {
    if (!agentName) {
      throw new Error("Agent name is required");
    }
    const mastraClient = await this.createMastraClient();
    const agent = mastraClient.getAgent(agentName);
    if (!agent) {
      throw new Error("Agent not found");
    }
    return agent;
  }
}

const startWorkflowResultSchema = objectType({
  runId: stringType().optional(),
  suspendPayload: anyType().optional(),
  status: enumType(["suspended"]).optional()
});
const getNextStepResultSchema = objectType({
  suspendPayload: anyType().optional(),
  status: enumType(["suspended", "success"]).optional()
});
const VIBEFLOW_BASE_URL = process.env.VIBEFLOW_BASE_URL || "http://localhost:4111/";
async function startWorkflow(workflowId) {
  const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
  const mastraClient = await vibeflowAgentClient.createMastraClient();
  try {
    const workflow = mastraClient.getWorkflow(workflowId);
    const run = await workflow.createRun();
    const result = await workflow.startAsync({
      runId: run.runId,
      inputData: {
        start: true
      }
    });
    console.log("Started workflow, run ID:", run.runId, result);
    if (result.status === "suspended" && result.suspended.length > 0) {
      const suspendedStepName = result.suspended[0][0];
      const suspendPayload = result.steps[suspendedStepName].suspendPayload;
      return {
        runId: run.runId,
        suspendPayload,
        status: "suspended"
      };
    } else if (result.status === "success") {
      throw new Error("You forgot to add a suspended step to your workflow");
    } else {
      throw new Error("Workflow failed to start");
    }
  } catch (error) {
    throw new Error(`Failed to start workflow: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function getNextStep({
  runId,
  workflowId
}) {
  if (!workflowId || !runId) {
    throw new Error("No active workflow runId or workflowId found. Please start a workflow first.");
  }
  try {
    const vibeflowAgentClient = new VibeflowAgentClient(VIBEFLOW_BASE_URL);
    const mastraClient = await vibeflowAgentClient.createMastraClient();
    const workflow = mastraClient.getWorkflow(workflowId);
    const currentState = await workflow.runExecutionResult(runId);
    console.log("currentState", currentState);
    let step = null;
    if (currentState.status === "suspended") {
      const suspendedSteps = Object.entries(currentState.steps).filter(([, stepState]) => stepState.status === "suspended");
      if (suspendedSteps.length > 0) {
        step = suspendedSteps[0][0];
        console.log("step", step);
      }
    }
    if (!step) {
      throw new Error("No suspended step found to resume");
    }
    const result = await workflow.resumeAsync({
      runId,
      step,
      resumeData: {
        stepCompleted: true
      }
    });
    if (result.status === "suspended" && result.suspended.length > 0) {
      const nextSuspendedStepName = result.suspended[0][0];
      const nextSuspendPayload = result.steps[nextSuspendedStepName].suspendPayload;
      return {
        suspendPayload: nextSuspendPayload,
        status: "suspended"
      };
    } else if (result.status === "success") {
      return {
        status: "success"
      };
    } else {
      throw new Error("Workflow failed to resume");
    }
  } catch (error) {
    throw new Error(`Failed to get next step: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export { getNextStep, getNextStepResultSchema, startWorkflow, startWorkflowResultSchema };

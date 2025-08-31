import { M as Mutex, e } from './xxhash-wasm.mjs';
import require$$8 from 'pg';
import { M as MastraBase } from './chunk-6GF5M4GX.mjs';
import { c as commonjsGlobal, g as getDefaultExportFromCjs } from './_commonjsHelpers.mjs';
import require$$0 from 'util';
import require$$0$1 from 'path';
import require$$1 from 'os';
import require$$0$2 from 'fs';
import Stream from 'stream';
import { M as MastraError, E as ErrorCategory, a as ErrorDomain } from './chunk-MCOVMKIS.mjs';
import { p as parseSqlIdentifier, b as parseFieldKey } from './utils.mjs';
import { T as TABLE_WORKFLOW_SNAPSHOT, a as TABLE_EVALS, b as TABLE_MESSAGES, c as TABLE_THREADS, d as TABLE_TRACES, e as TABLE_SCHEMAS, f as TABLE_SCORERS, g as TABLE_RESOURCES, h as TABLE_AI_SPANS } from './storage.mjs';
import { M as MessageList } from './chunk-C5C4PN54.mjs';

// src/storage/base.ts
function ensureDate(date) {
  if (!date) return void 0;
  return date instanceof Date ? date : new Date(date);
}
function serializeDate(date) {
  if (!date) return void 0;
  const dateObj = ensureDate(date);
  return dateObj?.toISOString();
}
function resolveMessageLimit({
  last,
  defaultLimit
}) {
  if (typeof last === "number") return Math.max(0, last);
  if (last === false) return 0;
  return defaultLimit;
}
var MastraStorage = class extends MastraBase {
  /** @deprecated import from { TABLE_WORKFLOW_SNAPSHOT } '@mastra/core/storage' instead */
  static TABLE_WORKFLOW_SNAPSHOT = TABLE_WORKFLOW_SNAPSHOT;
  /** @deprecated import from { TABLE_EVALS } '@mastra/core/storage' instead */
  static TABLE_EVALS = TABLE_EVALS;
  /** @deprecated import from { TABLE_MESSAGES } '@mastra/core/storage' instead */
  static TABLE_MESSAGES = TABLE_MESSAGES;
  /** @deprecated import from { TABLE_THREADS } '@mastra/core/storage' instead */
  static TABLE_THREADS = TABLE_THREADS;
  /** @deprecated import { TABLE_TRACES } from '@mastra/core/storage' instead */
  static TABLE_TRACES = TABLE_TRACES;
  hasInitialized = null;
  shouldCacheInit = true;
  stores;
  constructor({ name }) {
    super({
      component: "STORAGE",
      name
    });
  }
  get supports() {
    return {
      selectByIncludeResourceScope: false,
      resourceWorkingMemory: false,
      hasColumn: false,
      createTable: false,
      deleteMessages: false,
      aiTracing: false
    };
  }
  ensureDate(date) {
    return ensureDate(date);
  }
  serializeDate(date) {
    return serializeDate(date);
  }
  /**
   * Resolves limit for how many messages to fetch
   *
   * @param last The number of messages to fetch
   * @param defaultLimit The default limit to use if last is not provided
   * @returns The resolved limit
   */
  resolveMessageLimit({
    last,
    defaultLimit
  }) {
    return resolveMessageLimit({ last, defaultLimit });
  }
  getSqlType(type) {
    switch (type) {
      case "text":
        return "TEXT";
      case "timestamp":
        return "TIMESTAMP";
      case "float":
        return "FLOAT";
      case "integer":
        return "INTEGER";
      case "bigint":
        return "BIGINT";
      case "jsonb":
        return "JSONB";
      case "float":
        return "FLOAT";
      default:
        return "TEXT";
    }
  }
  getDefaultValue(type) {
    switch (type) {
      case "text":
      case "uuid":
        return "DEFAULT ''";
      case "timestamp":
        return "DEFAULT '1970-01-01 00:00:00'";
      case "integer":
      case "float":
      case "bigint":
        return "DEFAULT 0";
      case "jsonb":
        return "DEFAULT '{}'";
      default:
        return "DEFAULT ''";
    }
  }
  batchTraceInsert({ records }) {
    if (this.stores?.traces) {
      return this.stores.traces.batchTraceInsert({ records });
    }
    return this.batchInsert({ tableName: TABLE_TRACES, records });
  }
  async getResourceById(_) {
    throw new Error(
      `Resource working memory is not supported by this storage adapter (${this.constructor.name}). Supported storage adapters: LibSQL (@mastra/libsql), PostgreSQL (@mastra/pg), Upstash (@mastra/upstash). To use per-resource working memory, switch to one of these supported storage adapters.`
    );
  }
  async saveResource(_) {
    throw new Error(
      `Resource working memory is not supported by this storage adapter (${this.constructor.name}). Supported storage adapters: LibSQL (@mastra/libsql), PostgreSQL (@mastra/pg), Upstash (@mastra/upstash). To use per-resource working memory, switch to one of these supported storage adapters.`
    );
  }
  async updateResource(_) {
    throw new Error(
      `Resource working memory is not supported by this storage adapter (${this.constructor.name}). Supported storage adapters: LibSQL (@mastra/libsql), PostgreSQL (@mastra/pg), Upstash (@mastra/upstash). To use per-resource working memory, switch to one of these supported storage adapters.`
    );
  }
  async deleteMessages(_messageIds) {
    throw new Error(
      `Message deletion is not supported by this storage adapter (${this.constructor.name}). The deleteMessages method needs to be implemented in the storage adapter.`
    );
  }
  async init() {
    if (this.shouldCacheInit && await this.hasInitialized) {
      return;
    }
    const tableCreationTasks = [
      this.createTable({
        tableName: TABLE_WORKFLOW_SNAPSHOT,
        schema: TABLE_SCHEMAS[TABLE_WORKFLOW_SNAPSHOT]
      }),
      this.createTable({
        tableName: TABLE_EVALS,
        schema: TABLE_SCHEMAS[TABLE_EVALS]
      }),
      this.createTable({
        tableName: TABLE_THREADS,
        schema: TABLE_SCHEMAS[TABLE_THREADS]
      }),
      this.createTable({
        tableName: TABLE_MESSAGES,
        schema: TABLE_SCHEMAS[TABLE_MESSAGES]
      }),
      this.createTable({
        tableName: TABLE_TRACES,
        schema: TABLE_SCHEMAS[TABLE_TRACES]
      }),
      this.createTable({
        tableName: TABLE_SCORERS,
        schema: TABLE_SCHEMAS[TABLE_SCORERS]
      })
    ];
    if (this.supports.resourceWorkingMemory) {
      tableCreationTasks.push(
        this.createTable({
          tableName: TABLE_RESOURCES,
          schema: TABLE_SCHEMAS[TABLE_RESOURCES]
        })
      );
    }
    if (this.supports.aiTracing) {
      tableCreationTasks.push(
        this.createTable({
          tableName: TABLE_AI_SPANS,
          schema: TABLE_SCHEMAS[TABLE_AI_SPANS]
        })
      );
    }
    this.hasInitialized = Promise.all(tableCreationTasks).then(() => true);
    await this.hasInitialized;
    await this?.alterTable?.({
      tableName: TABLE_MESSAGES,
      schema: TABLE_SCHEMAS[TABLE_MESSAGES],
      ifNotExists: ["resourceId"]
    });
  }
  async persistWorkflowSnapshot({
    workflowName,
    runId,
    snapshot
  }) {
    await this.init();
    const data = {
      workflow_name: workflowName,
      run_id: runId,
      snapshot,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.logger.debug("Persisting workflow snapshot", { workflowName, runId, data });
    await this.insert({
      tableName: TABLE_WORKFLOW_SNAPSHOT,
      record: data
    });
  }
  async loadWorkflowSnapshot({
    workflowName,
    runId
  }) {
    if (!this.hasInitialized) {
      await this.init();
    }
    this.logger.debug("Loading workflow snapshot", { workflowName, runId });
    const d = await this.load({
      tableName: TABLE_WORKFLOW_SNAPSHOT,
      keys: { workflow_name: workflowName, run_id: runId }
    });
    return d ? d.snapshot : null;
  }
  /**
   * OBSERVABILITY
   */
  /**
   * Creates a single AI span record in the storage provider.
   */
  async createAISpan(span) {
    if (this.stores?.observability) {
      return this.stores.observability.createAISpan(span);
    }
    throw new MastraError({
      id: "MASTRA_STORAGE_CREATE_AI_SPAN_NOT_SUPPORTED",
      domain: "STORAGE" /* STORAGE */,
      category: "SYSTEM" /* SYSTEM */,
      text: `AI tracing is not supported by this storage adapter (${this.constructor.name})`
    });
  }
  /**
   * Updates a single AI span with partial data. Primarily used for realtime trace creation.
   */
  async updateAISpan(params) {
    if (this.stores?.observability) {
      return this.stores.observability.updateAISpan(params);
    }
    throw new MastraError({
      id: "MASTRA_STORAGE_UPDATE_AI_SPAN_NOT_SUPPORTED",
      domain: "STORAGE" /* STORAGE */,
      category: "SYSTEM" /* SYSTEM */,
      text: `AI tracing is not supported by this storage adapter (${this.constructor.name})`
    });
  }
  /**
   * Retrieves a single AI trace with all its associated spans.
   */
  async getAITrace(traceId) {
    if (this.stores?.observability) {
      return this.stores.observability.getAITrace(traceId);
    }
    throw new MastraError({
      id: "MASTRA_STORAGE_GET_AI_TRACE_NOT_SUPPORTED",
      domain: "STORAGE" /* STORAGE */,
      category: "SYSTEM" /* SYSTEM */,
      text: `AI tracing is not supported by this storage adapter (${this.constructor.name})`
    });
  }
  /**
   * Retrieves a paginated list of AI traces with optional filtering.
   */
  async getAITracesPaginated(args) {
    if (this.stores?.observability) {
      return this.stores.observability.getAITracesPaginated(args);
    }
    throw new MastraError({
      id: "MASTRA_STORAGE_GET_AI_TRACES_PAGINATED_NOT_SUPPORTED",
      domain: "STORAGE" /* STORAGE */,
      category: "SYSTEM" /* SYSTEM */,
      text: `AI tracing is not supported by this storage adapter (${this.constructor.name})`
    });
  }
  /**
   * Creates multiple AI spans in a single batch.
   */
  async batchCreateAISpans(args) {
    if (this.stores?.observability) {
      return this.stores.observability.batchCreateAISpans(args);
    }
    throw new MastraError({
      id: "MASTRA_STORAGE_BATCH_CREATE_AI_SPANS_NOT_SUPPORTED",
      domain: "STORAGE" /* STORAGE */,
      category: "SYSTEM" /* SYSTEM */,
      text: `AI tracing is not supported by this storage adapter (${this.constructor.name})`
    });
  }
  /**
   * Updates multiple AI spans in a single batch.
   */
  async batchUpdateAISpans(args) {
    if (this.stores?.observability) {
      return this.stores.observability.batchUpdateAISpans(args);
    }
    throw new MastraError({
      id: "MASTRA_STORAGE_BATCH_UPDATE_AI_SPANS_NOT_SUPPORTED",
      domain: "STORAGE" /* STORAGE */,
      category: "SYSTEM" /* SYSTEM */,
      text: `AI tracing is not supported by this storage adapter (${this.constructor.name})`
    });
  }
  /**
   * Deletes multiple AI traces and all their associated spans in a single batch operation.
   */
  async batchDeleteAITraces(args) {
    if (this.stores?.observability) {
      return this.stores.observability.batchDeleteAITraces(args);
    }
    throw new MastraError({
      id: "MASTRA_STORAGE_BATCH_DELETE_AI_TRACES_NOT_SUPPORTED",
      domain: "STORAGE" /* STORAGE */,
      category: "SYSTEM" /* SYSTEM */,
      text: `AI tracing is not supported by this storage adapter (${this.constructor.name})`
    });
  }
};

// src/storage/domains/legacy-evals/base.ts
var LegacyEvalsStorage = class extends MastraBase {
  constructor() {
    super({
      component: "STORAGE",
      name: "LEGACY_EVALS"
    });
  }
};

// src/storage/domains/memory/base.ts
var MemoryStorage = class extends MastraBase {
  constructor() {
    super({
      component: "STORAGE",
      name: "MEMORY"
    });
  }
  async deleteMessages(_messageIds) {
    throw new Error(
      `Message deletion is not supported by this storage adapter (${this.constructor.name}). The deleteMessages method needs to be implemented in the storage adapter.`
    );
  }
  async getResourceById(_) {
    throw new Error(
      `Resource working memory is not supported by this storage adapter (${this.constructor.name}). Supported storage adapters: LibSQL (@mastra/libsql), PostgreSQL (@mastra/pg), Upstash (@mastra/upstash). To use per-resource working memory, switch to one of these supported storage adapters.`
    );
  }
  async saveResource(_) {
    throw new Error(
      `Resource working memory is not supported by this storage adapter (${this.constructor.name}). Supported storage adapters: LibSQL (@mastra/libsql), PostgreSQL (@mastra/pg), Upstash (@mastra/upstash). To use per-resource working memory, switch to one of these supported storage adapters.`
    );
  }
  async updateResource(_) {
    throw new Error(
      `Resource working memory is not supported by this storage adapter (${this.constructor.name}). Supported storage adapters: LibSQL (@mastra/libsql), PostgreSQL (@mastra/pg), Upstash (@mastra/upstash). To use per-resource working memory, switch to one of these supported storage adapters.`
    );
  }
  castThreadOrderBy(v) {
    return v in THREAD_ORDER_BY_SET ? v : "createdAt";
  }
  castThreadSortDirection(v) {
    return v in THREAD_THREAD_SORT_DIRECTION_SET ? v : "DESC";
  }
};
var THREAD_ORDER_BY_SET = {
  createdAt: true,
  updatedAt: true
};
var THREAD_THREAD_SORT_DIRECTION_SET = {
  ASC: true,
  DESC: true
};

// src/storage/domains/operations/base.ts
var StoreOperations = class extends MastraBase {
  constructor() {
    super({
      component: "STORAGE",
      name: "OPERATIONS"
    });
  }
  getSqlType(type) {
    switch (type) {
      case "text":
        return "TEXT";
      case "timestamp":
        return "TIMESTAMP";
      case "float":
        return "FLOAT";
      case "integer":
        return "INTEGER";
      case "bigint":
        return "BIGINT";
      case "jsonb":
        return "JSONB";
      default:
        return "TEXT";
    }
  }
  getDefaultValue(type) {
    switch (type) {
      case "text":
      case "uuid":
        return "DEFAULT ''";
      case "timestamp":
        return "DEFAULT '1970-01-01 00:00:00'";
      case "integer":
      case "bigint":
      case "float":
        return "DEFAULT 0";
      case "jsonb":
        return "DEFAULT '{}'";
      default:
        return "DEFAULT ''";
    }
  }
};

// src/storage/domains/scores/base.ts
var ScoresStorage = class extends MastraBase {
  constructor() {
    super({
      component: "STORAGE",
      name: "SCORES"
    });
  }
};

// src/storage/domains/traces/base.ts
var TracesStorage = class extends MastraBase {
  constructor() {
    super({
      component: "STORAGE",
      name: "TRACES"
    });
  }
};

// src/storage/domains/workflows/base.ts
var WorkflowsStorage = class extends MastraBase {
  constructor() {
    super({
      component: "STORAGE",
      name: "WORKFLOWS"
    });
  }
};

// src/storage/utils.ts
function safelyParseJSON(input) {
  if (input && typeof input === "object") return input;
  if (input == null) return {};
  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch {
      return input;
    }
  }
  return {};
}

// src/vector/vector.ts
var MastraVector = class extends MastraBase {
  constructor() {
    super({ name: "MastraVector", component: "VECTOR" });
  }
  get indexSeparator() {
    return "_";
  }
  async validateExistingIndex(indexName, dimension, metric) {
    let info;
    try {
      info = await this.describeIndex({ indexName });
    } catch (infoError) {
      const mastraError = new MastraError(
        {
          id: "VECTOR_VALIDATE_INDEX_FETCH_FAILED",
          text: `Index "${indexName}" already exists, but failed to fetch index info for dimension check.`,
          domain: "MASTRA_VECTOR" /* MASTRA_VECTOR */,
          category: "SYSTEM" /* SYSTEM */,
          details: { indexName }
        },
        infoError
      );
      this.logger?.trackException(mastraError);
      this.logger?.error(mastraError.toString());
      throw mastraError;
    }
    const existingDim = info?.dimension;
    const existingMetric = info?.metric;
    if (existingDim === dimension) {
      this.logger?.info(
        `Index "${indexName}" already exists with ${existingDim} dimensions and metric ${existingMetric}, skipping creation.`
      );
      if (existingMetric !== metric) {
        this.logger?.warn(
          `Attempted to create index with metric "${metric}", but index already exists with metric "${existingMetric}". To use a different metric, delete and recreate the index.`
        );
      }
    } else if (info) {
      const mastraError = new MastraError({
        id: "VECTOR_VALIDATE_INDEX_DIMENSION_MISMATCH",
        text: `Index "${indexName}" already exists with ${existingDim} dimensions, but ${dimension} dimensions were requested`,
        domain: "MASTRA_VECTOR" /* MASTRA_VECTOR */,
        category: "USER" /* USER */,
        details: { indexName, existingDim, requestedDim: dimension }
      });
      this.logger?.trackException(mastraError);
      this.logger?.error(mastraError.toString());
      throw mastraError;
    } else {
      const mastraError = new MastraError({
        id: "VECTOR_VALIDATE_INDEX_NO_DIMENSION",
        text: `Index "${indexName}" already exists, but could not retrieve its dimensions for validation.`,
        domain: "MASTRA_VECTOR" /* MASTRA_VECTOR */,
        category: "SYSTEM" /* SYSTEM */,
        details: { indexName }
      });
      this.logger?.trackException(mastraError);
      this.logger?.error(mastraError.toString());
      throw mastraError;
    }
  }
};

// src/vector/filter/base.ts
var BaseFilterTranslator = class _BaseFilterTranslator {
  /**
   * Operator type checks
   */
  isOperator(key) {
    return key.startsWith("$");
  }
  static BASIC_OPERATORS = ["$eq", "$ne"];
  static NUMERIC_OPERATORS = ["$gt", "$gte", "$lt", "$lte"];
  static ARRAY_OPERATORS = ["$in", "$nin", "$all", "$elemMatch"];
  static LOGICAL_OPERATORS = ["$and", "$or", "$not", "$nor"];
  static ELEMENT_OPERATORS = ["$exists"];
  static REGEX_OPERATORS = ["$regex", "$options"];
  static DEFAULT_OPERATORS = {
    logical: _BaseFilterTranslator.LOGICAL_OPERATORS,
    basic: _BaseFilterTranslator.BASIC_OPERATORS,
    numeric: _BaseFilterTranslator.NUMERIC_OPERATORS,
    array: _BaseFilterTranslator.ARRAY_OPERATORS,
    element: _BaseFilterTranslator.ELEMENT_OPERATORS,
    regex: _BaseFilterTranslator.REGEX_OPERATORS
  };
  isLogicalOperator(key) {
    return _BaseFilterTranslator.DEFAULT_OPERATORS.logical.includes(key);
  }
  isBasicOperator(key) {
    return _BaseFilterTranslator.DEFAULT_OPERATORS.basic.includes(key);
  }
  isNumericOperator(key) {
    return _BaseFilterTranslator.DEFAULT_OPERATORS.numeric.includes(key);
  }
  isArrayOperator(key) {
    return _BaseFilterTranslator.DEFAULT_OPERATORS.array.includes(key);
  }
  isElementOperator(key) {
    return _BaseFilterTranslator.DEFAULT_OPERATORS.element.includes(key);
  }
  isRegexOperator(key) {
    return _BaseFilterTranslator.DEFAULT_OPERATORS.regex.includes(key);
  }
  isFieldOperator(key) {
    return this.isOperator(key) && !this.isLogicalOperator(key);
  }
  isCustomOperator(key) {
    const support = this.getSupportedOperators();
    return support.custom?.includes(key) ?? false;
  }
  getSupportedOperators() {
    return _BaseFilterTranslator.DEFAULT_OPERATORS;
  }
  isValidOperator(key) {
    const support = this.getSupportedOperators();
    const allSupported = Object.values(support).flat();
    return allSupported.includes(key);
  }
  /**
   * Value normalization for comparison operators
   */
  normalizeComparisonValue(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === "number" && Object.is(value, -0)) {
      return 0;
    }
    return value;
  }
  /**
   * Helper method to simulate $all operator using $and + $eq when needed.
   * Some vector stores don't support $all natively.
   */
  simulateAllOperator(field, values) {
    return {
      $and: values.map((value) => ({
        [field]: { $in: [this.normalizeComparisonValue(value)] }
      }))
    };
  }
  /**
   * Utility functions for type checking
   */
  isPrimitive(value) {
    return value === null || value === void 0 || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
  }
  isRegex(value) {
    return value instanceof RegExp;
  }
  isEmpty(obj) {
    return obj === null || obj === void 0 || typeof obj === "object" && Object.keys(obj).length === 0;
  }
  static ErrorMessages = {
    UNSUPPORTED_OPERATOR: (op) => `Unsupported operator: ${op}`,
    INVALID_LOGICAL_OPERATOR_LOCATION: (op, path) => `Logical operator ${op} cannot be used at field level: ${path}`,
    NOT_REQUIRES_OBJECT: `$not operator requires an object`,
    NOT_CANNOT_BE_EMPTY: `$not operator cannot be empty`,
    INVALID_LOGICAL_OPERATOR_CONTENT: (path) => `Logical operators must contain field conditions, not direct operators: ${path}`,
    INVALID_TOP_LEVEL_OPERATOR: (op) => `Invalid top-level operator: ${op}`,
    ELEM_MATCH_REQUIRES_OBJECT: `$elemMatch requires an object with conditions`
  };
  /**
   * Helper to handle array value normalization consistently
   */
  normalizeArrayValues(values) {
    return values.map((value) => this.normalizeComparisonValue(value));
  }
  validateFilter(filter) {
    const validation = this.validateFilterSupport(filter);
    if (!validation.supported) {
      throw new Error(validation.messages.join(", "));
    }
  }
  /**
   * Validates if a filter structure is supported by the specific vector DB
   * and returns detailed validation information.
   */
  validateFilterSupport(node, path = "") {
    const messages = [];
    if (this.isPrimitive(node) || this.isEmpty(node)) {
      return { supported: true, messages: [] };
    }
    if (Array.isArray(node)) {
      const arrayResults = node.map((item) => this.validateFilterSupport(item, path));
      const arrayMessages = arrayResults.flatMap((r) => r.messages);
      return {
        supported: arrayResults.every((r) => r.supported),
        messages: arrayMessages
      };
    }
    const nodeObj = node;
    let isSupported = true;
    for (const [key, value] of Object.entries(nodeObj)) {
      const newPath = path ? `${path}.${key}` : key;
      if (this.isOperator(key)) {
        if (!this.isValidOperator(key)) {
          isSupported = false;
          messages.push(_BaseFilterTranslator.ErrorMessages.UNSUPPORTED_OPERATOR(key));
          continue;
        }
        if (!path && !this.isLogicalOperator(key)) {
          isSupported = false;
          messages.push(_BaseFilterTranslator.ErrorMessages.INVALID_TOP_LEVEL_OPERATOR(key));
          continue;
        }
        if (key === "$elemMatch" && (typeof value !== "object" || Array.isArray(value))) {
          isSupported = false;
          messages.push(_BaseFilterTranslator.ErrorMessages.ELEM_MATCH_REQUIRES_OBJECT);
          continue;
        }
        if (this.isLogicalOperator(key)) {
          if (key === "$not") {
            if (Array.isArray(value) || typeof value !== "object") {
              isSupported = false;
              messages.push(_BaseFilterTranslator.ErrorMessages.NOT_REQUIRES_OBJECT);
              continue;
            }
            if (this.isEmpty(value)) {
              isSupported = false;
              messages.push(_BaseFilterTranslator.ErrorMessages.NOT_CANNOT_BE_EMPTY);
              continue;
            }
            continue;
          }
          if (path && !this.isLogicalOperator(path.split(".").pop())) {
            isSupported = false;
            messages.push(_BaseFilterTranslator.ErrorMessages.INVALID_LOGICAL_OPERATOR_LOCATION(key, newPath));
            continue;
          }
          if (Array.isArray(value)) {
            const hasDirectOperators = value.some(
              (item) => typeof item === "object" && Object.keys(item).length === 1 && this.isFieldOperator(Object.keys(item)[0])
            );
            if (hasDirectOperators) {
              isSupported = false;
              messages.push(_BaseFilterTranslator.ErrorMessages.INVALID_LOGICAL_OPERATOR_CONTENT(newPath));
              continue;
            }
          }
        }
      }
      const nestedValidation = this.validateFilterSupport(value, newPath);
      if (!nestedValidation.supported) {
        isSupported = false;
        messages.push(...nestedValidation.messages);
      }
    }
    return { supported: isSupported, messages };
  }
};

var src = {};

var assert$e = {};

var handler = {};

var types$1 = {};

Object.defineProperty(types$1, "__esModule", { value: true });
types$1.OptionsError = void 0;
/**
 * All errors that can occur inside an assert function.
 */
var OptionsError;
(function (OptionsError) {
    OptionsError[OptionsError["invalidOptionsParam"] = 0] = "invalidOptionsParam";
    OptionsError[OptionsError["invalidDefaultsParam"] = 1] = "invalidDefaultsParam";
    OptionsError[OptionsError["optionNotRecognized"] = 2] = "optionNotRecognized";
})(OptionsError || (types$1.OptionsError = OptionsError = {}));

Object.defineProperty(handler, "__esModule", { value: true });
handler.DefaultErrorHandler = void 0;
/**
 * Protocol for handling options-related issues.
 */
const types_1$1 = types$1;
/**
 * Default handler for options-related issues.
 */
class DefaultErrorHandler {
    handle(err, ctx) {
        switch (err) {
            case types_1$1.OptionsError.invalidOptionsParam:
                throw new TypeError(`Invalid "options" parameter: ${JSON.stringify(ctx.options)}`);
            case types_1$1.OptionsError.invalidDefaultsParam:
                throw new TypeError(`Invalid "defaults" parameter: ${JSON.stringify(ctx.defaults)}`);
            case types_1$1.OptionsError.optionNotRecognized:
                throw new Error(`Option "${ctx.key}" is not recognized.`);
            // istanbul ignore next:
            default:
                return ctx.options; // this will never happen
        }
    }
}
handler.DefaultErrorHandler = DefaultErrorHandler;

Object.defineProperty(assert$e, "__esModule", { value: true });
assert$e.assertOptions = void 0;
assert$e.createAssert = createAssert;
const handler_1 = handler;
const types_1 = types$1;
/**
 * Creates an options-assert function that uses specified error handler.
 */
function createAssert(errHandler) {
    return function (options, defaults) {
        if (options !== null && options !== undefined && typeof options !== 'object') {
            return errHandler.handle(types_1.OptionsError.invalidOptionsParam, { options, defaults });
        }
        const isArray = Array.isArray(defaults);
        if (!isArray && (!defaults || typeof defaults !== 'object')) {
            return errHandler.handle(types_1.OptionsError.invalidDefaultsParam, { options, defaults });
        }
        if (options) {
            for (const key of Object.keys(options)) {
                if ((isArray && defaults.indexOf(key) === -1) || (!isArray && !(key in defaults))) {
                    return errHandler.handle(types_1.OptionsError.optionNotRecognized, { options, defaults, key });
                }
            }
        }
        else {
            options = {};
        }
        if (!isArray) {
            const defs = defaults;
            for (const d of Object.keys(defs)) {
                if (options[d] === undefined && defs[d] !== undefined) {
                    options[d] = defs[d];
                }
            }
        }
        return options;
    };
}
/**
 * Default options-assert function.
 */
assert$e.assertOptions = createAssert(new handler_1.DefaultErrorHandler());

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DefaultErrorHandler = exports.OptionsError = exports.createAssert = exports.assertOptions = void 0;
	var assert_1 = assert$e;
	Object.defineProperty(exports, "assertOptions", { enumerable: true, get: function () { return assert_1.assertOptions; } });
	Object.defineProperty(exports, "createAssert", { enumerable: true, get: function () { return assert_1.createAssert; } });
	var types_1 = types$1;
	Object.defineProperty(exports, "OptionsError", { enumerable: true, get: function () { return types_1.OptionsError; } });
	var handler_1 = handler;
	Object.defineProperty(exports, "DefaultErrorHandler", { enumerable: true, get: function () { return handler_1.DefaultErrorHandler; } }); 
} (src));

const {assertOptions} = src;

// this to allow override options-related errors globally (for pg-promise)
commonjsGlobal.pgPromiseAssert = assertOptions;

var assert$d = {
    assert() {
        return commonjsGlobal.pgPromiseAssert.apply(null, [...arguments]);
    }
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {assert: assert$c} = assert$d;

/**
 * @class PromiseAdapter
 * @summary Adapter for the primary promise operations.
 * @description
 * Provides compatibility with promise libraries that cannot be recognized automatically,
 * via functions that implement the primary operations with promises:
 *
 *  - construct a new promise with a callback function
 *  - resolve a promise with some result data
 *  - reject a promise with a reason
 *  - resolve an array of promises
 *
 * The type is available from the library's root: `pgp.PromiseAdapter`.
 *
 * @param {object} api
 * Promise API configuration object.
 *
 * Passing in anything other than an object will throw {@link external:TypeError TypeError} = `Adapter requires an api configuration object.`
 *
 * @param {function} api.create
 * A function that takes a callback parameter and returns a new promise object.
 * The callback parameter is expected to be `function(resolve, reject)`.
 *
 * Passing in anything other than a function will throw {@link external:TypeError TypeError} = `Function 'create' must be specified.`
 *
 * @param {function} api.resolve
 * A function that takes an optional data parameter and resolves a promise with it.
 *
 * Passing in anything other than a function will throw {@link external:TypeError TypeError} = `Function 'resolve' must be specified.`
 *
 * @param {function} api.reject
 * A function that takes an optional error parameter and rejects a promise with it.
 *
 * Passing in anything other than a function will throw {@link external:TypeError TypeError} = `Function 'reject' must be specified.`
 *
 * @param {function} api.all
 * A function that resolves an array of promises.
 *
 * Passing in anything other than a function will throw {@link external:TypeError TypeError} = `Function 'all' must be specified.`
 *
 * @returns {PromiseAdapter}
 */
let PromiseAdapter$3 = class PromiseAdapter {
    constructor(api) {

        if (!api || typeof api !== 'object') {
            throw new TypeError('Adapter requires an api configuration object.');
        }

        api = assert$c(api, ['create', 'resolve', 'reject', 'all']);

        this.create = api.create;
        this.resolve = api.resolve;
        this.reject = api.reject;
        this.all = api.all;

        if (typeof this.create !== 'function') {
            throw new TypeError('Function \'create\' must be specified.');
        }

        if (typeof this.resolve !== 'function') {
            throw new TypeError('Function \'resolve\' must be specified.');
        }

        if (typeof this.reject !== 'function') {
            throw new TypeError('Function \'reject\' must be specified.');
        }

        if (typeof this.all !== 'function') {
            throw new TypeError('Function \'all\' must be specified.');
        }
    }
};

var promiseAdapter = {PromiseAdapter: PromiseAdapter$3};

const util$1 = require$$0;

let ColorConsole$4 = class ColorConsole {

    static log() {
        ColorConsole.writeNormal([...arguments], 39); // white
    }

    static info() {
        ColorConsole.writeNormal([...arguments], 36); // cyan
    }

    static success() {
        ColorConsole.writeNormal([...arguments], 32); // green
    }

    static warn() {
        ColorConsole.writeNormal([...arguments], 33); // yellow
    }

    static error() {
        ColorConsole.writeError([...arguments], 31); // red
    }

    static writeNormal(params, color) {
        // istanbul ignore else
        if (process.stdout.isTTY) {
            console.log.apply(null, ColorConsole.formatColor(params, color)); // eslint-disable-line no-console
        } else {
            console.log.apply(null, params); // eslint-disable-line no-console
        }
    }

    static writeError(params, color) {
        // istanbul ignore else
        if (process.stderr.isTTY) {
            console.error.apply(null, ColorConsole.formatColor(params, color)); // eslint-disable-line no-console
        } else {
            console.error.apply(null, params); // eslint-disable-line no-console
        }
    }

    static formatColor(args, color) {
        return args.map(a => `\x1b[${color}m${util$1.format(a)}\x1b[0m`);
    }
};

ColorConsole$4.log.bright = function () {
    ColorConsole$4.writeNormal([...arguments], 97); // light white
};

ColorConsole$4.info.bright = function () {
    ColorConsole$4.writeNormal([...arguments], 93); // light cyan
};

ColorConsole$4.success.bright = function () {
    ColorConsole$4.writeNormal([...arguments], 92); // light green
};

ColorConsole$4.warn.bright = function () {
    ColorConsole$4.writeNormal([...arguments], 93); // light yellow
};

ColorConsole$4.error.bright = function () {
    ColorConsole$4.writeError([...arguments], 91); // light red
};

var color = {ColorConsole: ColorConsole$4};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

/*
  The most important regular expressions and data as used by the library,
  isolated here to help with possible edge cases during integration.
*/

var patterns = {
    // Searches for all Named Parameters, supporting any of the following syntax:
    // ${propName}, $(propName), $[propName], $/propName/, $<propName>
    // Nested property names are also supported: ${propName.abc}
    namedParameters: /\$(?:({)|(\()|(<)|(\[)|(\/))\s*[a-zA-Z0-9$_.]+(\^|~|#|:raw|:alias|:name|:json|:csv|:list|:value)?\s*(?:(?=\2)(?=\3)(?=\4)(?=\5)}|(?=\1)(?=\3)(?=\4)(?=\5)\)|(?=\1)(?=\2)(?=\4)(?=\5)>|(?=\1)(?=\2)(?=\3)(?=\5)]|(?=\1)(?=\2)(?=\3)(?=\4)\/)/g,

    // Searches for all variables $1, $2, ...$100000, and while it will find greater than $100000
    // variables, the formatting engine is expected to throw an error for those.
    multipleValues: /\$([1-9][0-9]{0,16}(?![0-9])(\^|~|#|:raw|:alias|:name|:json|:csv|:list|:value)?)/g,

    // Searches for all occurrences of variable $1
    singleValue: /\$1(?![0-9])(\^|~|#|:raw|:alias|:name|:json|:csv|:list|:value)?/g,

    // Matches a valid column name for the Column type parser, according to the following rules:
    // - can contain: any combination of a-z, A-Z, 0-9, $ or _
    // - can contain ? at the start
    // - can contain one of the supported filters/modifiers
    validColumn: /\??[a-zA-Z0-9$_]+(\^|~|#|:raw|:alias|:name|:json|:csv|:list|:value)?/,

    // Matches a valid open-name JavaScript variable, according to the following rules:
    // - can contain: any combination of a-z, A-Z, 0-9, $ or _
    validVariable: /[a-zA-Z0-9$_]+/,

    // Matches a valid modifier in a column/property:
    hasValidModifier: /\^|~|#|:raw|:alias|:name|:json|:csv|:list|:value/,

    // List of all supported formatting modifiers:
    validModifiers: ['^', '~', '#', ':raw', ':alias', ':name', ':json', ':csv', ':list', ':value']
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const npm$w = {
    path: require$$0$1,
    util: require$$0};

////////////////////////////////////////////
// Simpler check for null/undefined;
function isNull$1(value) {
    return value === null || value === undefined;
}

////////////////////////////////////////////////////////
// Verifies parameter for being a non-empty text string;
function isText(txt) {
    return txt && typeof txt === 'string' && /\S/.test(txt);
}

///////////////////////////////////////////////////////////
// Approximates the environment as being for development.
//
// Proper configuration is having NODE_ENV = 'development', but this
// method only checks for 'dev' being present, and regardless of the case.
function isDev() {
    const env = process.env.NODE_ENV || '';
    return env.toLowerCase().indexOf('dev') !== -1;
}

/////////////////////////////////////////////
// Adds properties from source to the target,
// making them read-only and enumerable.
function addReadProperties(target, source) {
    for (const p in source) {
        addReadProp$1(target, p, source[p]);
    }
}

///////////////////////////////////////////////////////
// Adds a read-only, non-deletable enumerable property.
function addReadProp$1(obj, name, value, hidden) {
    Object.defineProperty(obj, name, {
        value,
        configurable: false,
        enumerable: !hidden,
        writable: false
    });
}

//////////////////////////////////////////////////////////////
// Converts a connection string or object into its safe copy:
// if password is present, it is masked with symbol '#'.
function getSafeConnection(cn) {
    const maskPassword = cs => cs.replace(/:(?![/])([^@]+)/, (_, m) => ':' + new Array(m.length + 1).join('#'));
    if (typeof cn === 'object') {
        const copy = Object.assign({}, cn);
        if (typeof copy.password === 'string') {
            copy.password = copy.password.replace(/./g, '#');
        }
        if (typeof copy.connectionString === 'string') {
            copy.connectionString = maskPassword(copy.connectionString);
        }
        return copy;
    }
    return maskPassword(cn);
}

///////////////////////////////////////////
// Returns a space gap for console output;
function messageGap$3(level) {
    return ' '.repeat(level * 4);
}

/////////////////////////////////////////
// Provides platform-neutral inheritance;
function inherits(child, parent) {
    child.prototype.__proto__ = parent.prototype;
}

// istanbul ignore next
function getLocalStack(startIdx, maxLines) {
    // from the call stack, we take up to maximum lines,
    // starting with specified line index:
    startIdx = startIdx || 0;
    const endIdx = maxLines > 0 ? startIdx + maxLines : undefined;
    return new Error().stack
        .split('\n')
        .filter(line => line.match(/\(.+\)/))
        .slice(startIdx, endIdx)
        .join('\n');
}

//////////////////////////////
// Internal error container;
function InternalError$1(error) {
    this.error = error;
}

/////////////////////////////////////////////////////////////////
// Parses a property name, and gets its name from the object,
// if the property exists. Returns object {valid, has, target, value}:
//  - valid - true/false, whether the syntax is valid
//  - has - a flag that property exists; set when 'valid' = true
//  - target - the target object that contains the property; set when 'has' = true
//  - value - the value; set when 'has' = true
function getIfHas(obj, prop) {
    const result = {valid: true};
    if (prop.indexOf('.') === -1) {
        result.has = prop in obj;
        result.target = obj;
        if (result.has) {
            result.value = obj[prop];
        }
    } else {
        const names = prop.split('.');
        let missing, target;
        for (let i = 0; i < names.length; i++) {
            const n = names[i];
            if (!n) {
                result.valid = false;
                return result;
            }
            if (!missing && hasProperty(obj, n)) {
                target = obj;
                obj = obj[n];
            } else {
                missing = true;
            }
        }
        result.has = !missing;
        if (result.has) {
            result.target = target;
            result.value = obj;
        }
    }
    return result;
}

/////////////////////////////////////////////////////////////////////////
// Checks if the property exists in the object or value or its prototype;
function hasProperty(value, prop) {
    return (value && typeof value === 'object' && prop in value) ||
        value !== null && value !== undefined && value[prop] !== undefined;
}

////////////////////////////////////////////////////////
// Adds prototype inspection
function addInspection$5(type, cb) {
    type.prototype[npm$w.util.inspect.custom] = cb;
}

/////////////////////////////////////////////////////////////////////////////////////////
// Identifies a general connectivity error, after which no more queries can be executed.
// This is for detecting when to skip executing ROLLBACK for a failed transaction.
function isConnectivityError(err) {
    const code = err && typeof err.code === 'string' && err.code;
    const cls = code && code.substring(0, 2); // Error Class
    // istanbul ignore next (we cannot test-cover all error cases):
    return code === 'ECONNRESET' || (cls === '08' && code !== '08P01') || (cls === '57' && code !== '57014');
    // Code 'ECONNRESET' - Connectivity issue handled by the driver.
    // Class 08 - Connection Exception (except for 08P01, for protocol violation).
    // Class 57 - Operator Intervention (except for 57014, for cancelled queries).
    //
    // ERROR CODES: https://www.postgresql.org/docs/9.6/static/errcodes-appendix.html
}

///////////////////////////////////////////////////////////////
// Does JSON.stringify, with support for BigInt (irreversible)
function toJson(data) {
    if (data !== undefined) {
        return JSON.stringify(data, (_, v) => typeof v === 'bigint' ? `${v}#bigint` : v)
            .replace(/"(-?\d+)#bigint"/g, (_, a) => a);
    }
}

const exp = {
    toJson,
    getIfHas,
    addInspection: addInspection$5,
    InternalError: InternalError$1,
    getLocalStack,
    isText,
    isNull: isNull$1,
    isDev,
    addReadProp: addReadProp$1,
    addReadProperties,
    getSafeConnection,
    messageGap: messageGap$3,
    inherits,
    isConnectivityError
};

const mainFile = process.argv[1];

// istanbul ignore next
exp.startDir = mainFile ? npm$w.path.dirname(mainFile) : process.cwd();

var utils$4 = exp;

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {ColorConsole: ColorConsole$3} = color;

const npm$v = {
    utils: utils$4
};

/**
 * @class DatabasePool
 * @static
 * @private
 */
let DatabasePool$2 = class DatabasePool {

    /**
     * Global instance of the database pool repository.
     *
     * @returns {{dbMap: {}, dbs: Array}}
     */
    static get instance() {
        const s = Symbol.for('pgPromiseDatabasePool');
        let scope = commonjsGlobal[s];
        if (!scope) {
            scope = {
                dbMap: {}, // map of used database context keys (connection + dc)
                dbs: [] // all database objects
            };
            commonjsGlobal[s] = scope;
        }
        return scope;
    }

    /**
     * @method DatabasePool.register
     * @static
     * @description
     *  - Registers each database object, to make sure no duplicates connections are used,
     *    and if they are, produce a warning;
     *  - Registers each Pool object, to be able to release them all when requested.
     *
     * @param {Database} db - The new Database object being registered.
     */
    static register(db) {
        const cnKey = DatabasePool.createContextKey(db);
        npm$v.utils.addReadProp(db, '$cnKey', cnKey, true);
        const {dbMap, dbs} = DatabasePool.instance;
        if (cnKey in dbMap) {
            dbMap[cnKey]++;
            /* istanbul ignore if */
            if (!db.$config.options.noWarnings) {
                ColorConsole$3.warn(`WARNING: Creating a duplicate database object for the same connection.\n${npm$v.utils.getLocalStack(4, 3)}\n`);
            }
        } else {
            dbMap[cnKey] = 1;
        }
        dbs.push(db);
    }

    /**
     * @method DatabasePool.unregister
     * @static
     * @param db
     */
    static unregister(db) {
        const cnKey = db.$cnKey;
        const {dbMap} = DatabasePool.instance;
        if (!--dbMap[cnKey]) {
            delete dbMap[cnKey];
        }
    }

    /**
     * @method DatabasePool.shutDown
     * @static
     */
    static shutDown() {
        const {instance} = DatabasePool;
        instance.dbs.forEach(db => {
            db.$destroy();
        });
        instance.dbs.length = 0;
        instance.dbMap = {};
    }

    /**
     * @method DatabasePool.createContextKey
     * @static
     * @description
     * For connections that are objects it reorders the keys alphabetically,
     * and then serializes the result into a JSON string.
     *
     * @param {Database} db - Database instance.
     */
    static createContextKey(db) {
        let cn = db.$cn;
        if (typeof cn === 'object') {
            const obj = {}, keys = Object.keys(cn).sort();
            keys.forEach(name => {
                obj[name] = cn[name];
            });
            cn = obj;
        }
        return npm$v.utils.toJson(npm$v.utils.getSafeConnection(cn)) + npm$v.utils.toJson(db.$dc);
    }
};

var databasePool = {DatabasePool: DatabasePool$2};

const {addReadProp} = utils$4;

/**
 * @private
 * @class InnerState
 * @description
 * Implements support for private/inner state object inside the class,
 * which can be accessed by a derived class via hidden read-only property _inner.
 */
let InnerState$5 = class InnerState {

    constructor(initialState) {
        addReadProp(this, '_inner', {}, true);
        if (initialState && typeof initialState === 'object') {
            this.extendState(initialState);
        }
    }

    /**
     * Extends or overrides inner state with the specified properties.
     *
     * Only own properties are used, i.e. inherited ones are skipped.
     */
    extendState(state) {
        for (const a in state) {
            // istanbul ignore else
            if (Object.prototype.hasOwnProperty.call(state, a)) {
                this._inner[a] = state[a];
            }
        }
    }
};

/**
 * @member InnerState#_inner
 * Private/Inner object state.
 */

var innerState = {InnerState: InnerState$5};

const {InnerState: InnerState$4} = innerState;
const {addInspection: addInspection$4} = utils$4;
const utils$3 = utils$4;

/**
 * @private
 * @class ServerFormatting
 */
let ServerFormatting$4 = class ServerFormatting extends InnerState$4 {

    constructor(options) {
        const _inner = {
            options,
            changed: true,
            currentError: undefined,
            target: {}
        };
        super(_inner);
        setValues.call(this, options.values);
    }

    get error() {
        return this._inner.currentError;
    }

    get text() {
        return this._inner.options.text;
    }

    set text(value) {
        const _i = this._inner;
        if (value !== _i.options.text) {
            _i.options.text = value;
            _i.changed = true;
        }
    }

    get binary() {
        return this._inner.options.binary;
    }

    set binary(value) {
        const _i = this._inner;
        if (value !== _i.options.binary) {
            _i.options.binary = value;
            _i.changed = true;
        }
    }

    get rowMode() {
        return this._inner.options.rowMode;
    }

    set rowMode(value) {
        const _i = this._inner;
        if (value !== _i.options.rowMode) {
            _i.options.rowMode = value;
            _i.changed = true;
        }
    }

    get values() {
        return this._inner.target.values;
    }

    set values(values) {
        setValues.call(this, values);
    }

};

/**
 * @member ServerFormatting#parse
 */

function setValues(v) {
    const target = this._inner.target;
    if (Array.isArray(v)) {
        if (v.length) {
            target.values = v;
        } else {
            delete target.values;
        }
    } else {
        if (utils$3.isNull(v)) {
            delete target.values;
        } else {
            target.values = [v];
        }
    }
}

addInspection$4(ServerFormatting$4, function () {
    return this.toString();
});

var serverFormatting = {ServerFormatting: ServerFormatting$4};

var name = "pg-promise";
var version = "11.15.0";
var description = "PostgreSQL interface for Node.js";
var main$2 = "lib/index.js";
var typings = "typescript/pg-promise.d.ts";
var scripts = {
	spelling: "cspell --config=.cspell.json \"**/*.{md,ts,js}\" --no-progress",
	coverage: "istanbul cover ./node_modules/jasmine-node/bin/jasmine-node --captureExceptions test",
	doc: "jsdoc -c ./jsdoc/jsdoc.js ./jsdoc/README.md -t ./jsdoc/templates/custom",
	lint: "eslint ./lib ./test/*.js ./test/db --fix",
	test: "jasmine-node --captureExceptions test",
	"test:init": "node test/db/init.js",
	"test:native": "jasmine-node test --config PG_NATIVE true",
	tslint: "tslint ./typescript/*.ts"
};
var files = [
	"lib",
	"typescript"
];
var homepage = "https://github.com/vitaly-t/pg-promise";
var repository = {
	type: "git",
	url: "https://github.com/vitaly-t/pg-promise.git"
};
var bugs = {
	url: "https://github.com/vitaly-t/pg-promise/issues",
	email: "vitaly.tomilov@gmail.com"
};
var keywords = [
	"pg",
	"promise",
	"postgres"
];
var author = {
	name: "Vitaly Tomilov",
	email: "vitaly.tomilov@gmail.com"
};
var license = "MIT";
var engines = {
	node: ">=16.0"
};
var dependencies = {
	"assert-options": "0.8.3",
	pg: "8.16.3",
	"pg-minify": "1.8.0",
	spex: "3.4.1"
};
var peerDependencies = {
	"pg-query-stream": "4.10.3"
};
var devDependencies = {
	"@eslint/js": "9.30.1",
	"@types/node": "24.0.10",
	bluebird: "3.7.2",
	coveralls: "3.1.1",
	cspell: "9.1.3",
	eslint: "9.30.1",
	globals: "16.3.0",
	istanbul: "0.4.5",
	"jasmine-node": "3.0.0",
	jsdoc: "4.0.4",
	JSONStream: "1.3.5",
	tslint: "6.1.3",
	typescript: "5.8.3"
};
var require$$16 = {
	name: name,
	version: version,
	description: description,
	main: main$2,
	typings: typings,
	scripts: scripts,
	files: files,
	homepage: homepage,
	repository: repository,
	bugs: bugs,
	keywords: keywords,
	author: author,
	license: license,
	engines: engines,
	dependencies: dependencies,
	peerDependencies: peerDependencies,
	devDependencies: devDependencies
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

/* All error messages used in the module */

const streamVersion = require$$16
    .devDependencies['pg-query-stream'];

var text = {
    nativeError: 'Failed to initialize Native Bindings.',

    /* Database errors */
    queryDisconnected: 'Cannot execute a query on a disconnected client.',
    invalidQuery: 'Invalid query format.',
    invalidFunction: 'Invalid function name.',
    invalidProc: 'Invalid procedure name.',
    invalidMask: 'Invalid Query Result Mask specified.',
    looseQuery: 'Querying against a released or lost connection.',

    /* result errors */
    notEmpty: 'No return data was expected.',
    noData: 'No data returned from the query.',
    multiple: 'Multiple rows were not expected.',

    /* streaming support */
    nativeStreaming: 'Streaming doesn\'t work with Native Bindings.',
    invalidStream: `Invalid or missing stream object: pg-query-stream >= v${streamVersion} was expected`,
    invalidStreamState: 'Invalid stream state.',
    invalidStreamCB: 'Invalid or missing stream initialization callback.',

    /* connection errors */
    poolDestroyed: 'Connection pool of the database object has been destroyed.',
    clientEnd: 'Abnormal client.end() call, due to invalid code or failed server connection.'
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const npm$u = {
    os: require$$1,
    utils: utils$4,
    text: text
};

/**
 * @enum {number}
 * @alias errors.queryResultErrorCode
 * @readonly
 * @description
 * `queryResultErrorCode` enumerator, available from the {@link errors} namespace.
 *
 * Represents an integer code for each type of error supported by type {@link errors.QueryResultError}.
 *
 * @see {@link errors.QueryResultError}
 */
const queryResultErrorCode$1 = {
    /** No data returned from the query. */
    noData: 0,

    /** No return data was expected. */
    notEmpty: 1,

    /** Multiple rows were not expected. */
    multiple: 2
};

const errorMessages$1 = [
    {name: 'noData', message: npm$u.text.noData},
    {name: 'notEmpty', message: npm$u.text.notEmpty},
    {name: 'multiple', message: npm$u.text.multiple}
];

/**
 * @class errors.QueryResultError
 * @augments external:Error
 * @description
 *
 * This error is specified as the rejection reason for all result-specific methods when the result doesn't match
 * the expectation, i.e. when a query result doesn't match its Query Result Mask - the value of {@link queryResult}.
 *
 * The error applies to the result from the following methods: {@link Database#none none},
 * {@link Database#one one}, {@link Database#oneOrNone oneOrNone} and {@link Database#many many}.
 *
 * Supported errors:
 *
 * - `No return data was expected.`, method {@link Database#none none}
 * - `No data returned from the query.`, methods {@link Database#one one} and {@link Database#many many}
 * - `Multiple rows were not expected.`, methods {@link Database#one one} and {@link Database#oneOrNone oneOrNone}
 *
 * Like any other error, this one is notified with through the global event {@link event:error error}.
 *
 * The type is available from the {@link errors} namespace.
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `QueryResultError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {object} result
 * The original $[Result] object that was received.
 *
 * @property {number} received
 * Total number of rows received. It is simply the value of `result.rows.length`.
 *
 * @property {number} code
 * Error code - {@link errors.queryResultErrorCode queryResultErrorCode} value.
 *
 * @property {string} query
 * Query that was executed.
 *
 * Normally, it is the query already formatted with values, if there were any.
 * But if you are using initialization option `pgFormatting`, then the query string is before formatting.
 *
 * @property {*} values
 * Values passed in as query parameters. Available only when initialization option `pgFormatting` is used.
 * Otherwise, the values are within the pre-formatted `query` string.
 *
 * @example
 *
 * const QueryResultError = pgp.errors.QueryResultError;
 * const qrec = pgp.errors.queryResultErrorCode;
 *
 * const initOptions = {
 *
 *   // pg-promise initialization options...
 *
 *   error(err, e) {
 *       if (err instanceof QueryResultError) {
 *           // A query returned unexpected number of records, and thus rejected;
 *           
 *           // we can check the error code, if we want specifics:
 *           if(err.code === qrec.noData) {
 *               // expected some data, but received none;
 *           }
 *
 *           // If you write QueryResultError into the console,
 *           // you will get a nicely formatted output.
 *
 *           console.log(err);
 *           
 *           // See also: err, e.query, e.params, etc.
 *       }
 *   }
 * };
 *
 * @see
 * {@link queryResult}, {@link Database#none none}, {@link Database#one one},
 * {@link Database#oneOrNone oneOrNone}, {@link Database#many many}
 *
 */
let QueryResultError$2 = class QueryResultError extends Error {
    constructor(code, result, query, values) {
        const message = errorMessages$1[code].message;
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.result = result;
        this.query = query;
        this.values = values;
        this.received = result.rows.length;
        Error.captureStackTrace(this, this.constructor);
    }
};

/**
 * @method errors.QueryResultError#toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
QueryResultError$2.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    const gap0 = npm$u.utils.messageGap(level),
        gap1 = npm$u.utils.messageGap(level + 1),
        lines = [
            'QueryResultError {',
            gap1 + 'code: queryResultErrorCode.' + errorMessages$1[this.code].name,
            gap1 + 'message: "' + this.message + '"',
            gap1 + 'received: ' + this.received,
            gap1 + 'query: ' + (typeof this.query === 'string' ? '"' + this.query + '"' : npm$u.utils.toJson(this.query))
        ];
    if (this.values !== undefined) {
        lines.push(gap1 + 'values: ' + npm$u.utils.toJson(this.values));
    }
    lines.push(gap0 + '}');
    return lines.join(npm$u.os.EOL);
};

npm$u.utils.addInspection(QueryResultError$2, function () {
    return this.toString();
});

var queryResultError = {
    QueryResultError: QueryResultError$2,
    queryResultErrorCode: queryResultErrorCode$1
};

const {inspect} = require$$0;

/////////////////////////////////////////////////////////////
// Returns {line, column} of an index within multi-line text.
function getIndexPos$1(text, index) {
    let lineIdx = 0, colIdx = index, pos = 0;
    do {
        pos = text.indexOf('\n', pos);
        if (pos === -1 || index < pos + 1) {
            break;
        }
        lineIdx++;
        pos++;
        colIdx = index - pos;
    } while (pos < index);
    return {
        line: lineIdx + 1,
        column: colIdx + 1
    };
}

///////////////////////////////////////////
// Returns a space gap for console output.
function messageGap$2(level) {
    return ' '.repeat(level * 4);
}

////////////////////////////////////////////////////
// Type inspection
function addInspection$3(type, cb) {
    type[inspect.custom] = cb;
}

var utils$2 = {
    getIndexPos: getIndexPos$1,
    messageGap: messageGap$2,
    addInspection: addInspection$3
};

const {EOL} = require$$1;
const {addInspection: addInspection$2, messageGap: messageGap$1} = utils$2;

const parsingErrorCode$1 = {
    unclosedMLC: 0, // Unclosed multi-line comment.
    unclosedText: 1, // Unclosed text block.
    unclosedQI: 2, // Unclosed quoted identifier.
    multiLineQI: 3 // Multi-line quoted identifiers are not supported.
};

Object.freeze(parsingErrorCode$1);

const errorMessages = [
    {name: 'unclosedMLC', message: 'Unclosed multi-line comment.'},
    {name: 'unclosedText', message: 'Unclosed text block.'},
    {name: 'unclosedQI', message: 'Unclosed quoted identifier.'},
    {name: 'multiLineQI', message: 'Multi-line quoted identifiers are not supported.'}
];

let SQLParsingError$1 = class SQLParsingError extends Error {
    constructor(code, position) {
        const err = errorMessages[code].message;
        const message = `Error parsing SQL at {line:${position.line},col:${position.column}}: ${err}`;
        super(message);
        this.name = this.constructor.name;
        this.error = err;
        this.code = code;
        this.position = position;
        Error.captureStackTrace(this, this.constructor);
    }
};

SQLParsingError$1.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    const gap = messageGap$1(level + 1);
    const lines = [
        'SQLParsingError {',
        `${gap}code: parsingErrorCode.${errorMessages[this.code].name}`,
        `${gap}error: "${this.error}"`,
        `${gap}position: {line: ${this.position.line}, col: ${this.position.column}}`,
        `${messageGap$1(level)}}`
    ];
    return lines.join(EOL);
};

addInspection$2(SQLParsingError$1.prototype, function () {
    return this.toString();
});

var error$1 = {
    SQLParsingError: SQLParsingError$1,
    parsingErrorCode: parsingErrorCode$1
};

const {parsingErrorCode, SQLParsingError} = error$1;
const {getIndexPos} = utils$2;

// symbols that need no spaces around them:
const compressors = '.,;:()[]=<>+-*/|!?@#';

////////////////////////////////////////////
// Parses and minimizes a PostgreSQL script.
function minify(sql, options) {

    if (typeof sql !== 'string') {
        throw new TypeError('Input SQL must be a text string.');
    }

    if (!sql.length) {
        return '';
    }

    sql = sql.replace(/\r\n/g, '\n');

    options = options || {};

    let idx = 0, // current index
        result = '', // resulting sql
        space = false; // add a space on the next step

    const len = sql.length;

    do {
        const s = sql[idx], // current symbol;
            s1 = sql[idx + 1]; // next symbol;

        if (isGap(s)) {
            while (++idx < len && isGap(sql[idx])) ;
            if (idx < len) {
                space = true;
            }
            idx--;
            continue;
        }

        if (s === '-' && s1 === '-') {
            const lb = sql.indexOf('\n', idx + 2);
            if (lb < 0) {
                break;
            }
            idx = lb - 1;
            skipGaps();
            continue;
        }

        if (s === '/' && s1 === '*') {
            let c = idx + 1, open = 0, close = 0, lastOpen, lastClose;
            while (++c < len - 1 && close <= open) {
                if (sql[c] === '/' && sql[c + 1] === '*') {
                    lastOpen = c;
                    open++;
                    c++;
                } else {
                    if (sql[c] === '*' && sql[c + 1] === '/') {
                        lastClose = c;
                        close++;
                        c++;
                    }
                }
            }
            if (close <= open) {
                idx = lastOpen;
                throwError(parsingErrorCode.unclosedMLC);
            }
            if (sql[idx + 2] === '!' && !options.removeAll) {
                if (options.compress) {
                    space = false;
                }
                addSpace();
                result += sql.substring(idx, lastClose + 2)
                    .replace(/\n/g, '\r\n');
            }
            idx = lastClose + 1;
            skipGaps();
            continue;
        }

        let closeIdx, text;

        if (s === '"') {
            closeIdx = sql.indexOf('"', idx + 1);
            if (closeIdx < 0) {
                throwError(parsingErrorCode.unclosedQI);
            }
            text = sql.substring(idx, closeIdx + 1);
            if (text.indexOf('\n') > 0) {
                throwError(parsingErrorCode.multiLineQI);
            }
            if (options.compress) {
                space = false;
            }
            addSpace();
            result += text;
            idx = closeIdx;
            skipGaps();
            continue;
        }

        if (s === '\'') {
            closeIdx = idx;
            do {
                closeIdx = sql.indexOf('\'', closeIdx + 1);
                if (closeIdx > 0) {
                    let i = closeIdx;
                    while (sql[--i] === '\\') ;
                    if ((closeIdx - i) % 2) {
                        let step = closeIdx;
                        while (++step < len && sql[step] === '\'') ;
                        if ((step - closeIdx) % 2) {
                            closeIdx = step - 1;
                            break;
                        }
                        closeIdx = step === len ? -1 : step;
                    }
                }
            } while (closeIdx > 0);
            if (closeIdx < 0) {
                throwError(parsingErrorCode.unclosedText);
            }
            if (options.compress) {
                space = false;
            }
            addSpace();
            text = sql.substring(idx, closeIdx + 1);
            const hasLB = text.indexOf('\n') > 0;
            if (hasLB) {
                text = text.split('\n').map(m => {
                    return m.replace(/^\s+|\s+$/g, '');
                }).join('\\n');
            }
            const hasTabs = text.indexOf('\t') > 0;
            if (hasLB || hasTabs) {
                const prev = idx ? sql[idx - 1] : '';
                if (prev !== 'E' && prev !== 'e') {
                    const r = result ? result[result.length - 1] : '';
                    if (r && r !== ' ' && compressors.indexOf(r) < 0) {
                        result += ' ';
                    }
                    result += 'E';
                }
                if (hasTabs) {
                    text = text.replace(/\t/g, '\\t');
                }
            }
            result += text;
            idx = closeIdx;
            skipGaps();
            continue;
        }

        if (options.compress && compressors.indexOf(s) >= 0) {
            space = false;
            skipGaps();
        }

        addSpace();
        result += s;

    } while (++idx < len);

    return result;

    function skipGaps() {
        if (options.compress) {
            while (idx < len - 1 && isGap(sql[idx + 1]) && idx++) ;
        }
    }

    function addSpace() {
        if (space) {
            if (result.length) {
                result += ' ';
            }
            space = false;
        }
    }

    function throwError(code) {
        const position = getIndexPos(sql, idx);
        throw new SQLParsingError(code, position);
    }
}

////////////////////////////////////
// Identifies a gap / empty symbol.
function isGap(s) {
    return s === ' ' || s === '\t' || s === '\r' || s === '\n';
}

var parser$1 = minify;

const parser = parser$1;
const error = error$1;

parser.SQLParsingError = error.SQLParsingError;
parser.parsingErrorCode = error.parsingErrorCode;

var lib$2 = parser;

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const npm$t = {
    os: require$$1,
    utils: utils$4,
    minify: lib$2
};

/**
 * @class errors.QueryFileError
 * @augments external:Error
 * @description
 * {@link errors.QueryFileError QueryFileError} class, available from the {@link errors} namespace.
 *
 * This type represents all errors related to {@link QueryFile}.
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `QueryFileError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {string} file
 * File path/name that was passed into the {@link QueryFile} constructor.
 *
 * @property {object} options
 * Set of options that was used by the {@link QueryFile} object.
 *
 * @property {SQLParsingError} error
 * Internal $[SQLParsingError] object.
 *
 * It is set only when the error was thrown by $[pg-minify] while parsing the SQL file.
 *
 * @see QueryFile
 *
 */
let QueryFileError$4 = class QueryFileError extends Error {
    constructor(error, qf) {
        const isSqlError = error instanceof npm$t.minify.SQLParsingError;
        const message = isSqlError ? 'Failed to parse the SQL.' : error.message;
        super(message);
        this.name = this.constructor.name;
        if (isSqlError) {
            this.error = error;
        }
        this.file = qf.file;
        this.options = qf.options;
        Error.captureStackTrace(this, this.constructor);
    }
};

/**
 * @method errors.QueryFileError#toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
QueryFileError$4.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    const gap0 = npm$t.utils.messageGap(level),
        gap1 = npm$t.utils.messageGap(level + 1),
        lines = [
            'QueryFileError {',
            gap1 + 'message: "' + this.message + '"',
            gap1 + 'options: ' + npm$t.utils.toJson(this.options),
            gap1 + 'file: "' + this.file + '"'
        ];
    if (this.error) {
        lines.push(gap1 + 'error: ' + this.error.toString(level + 1));
    }
    lines.push(gap0 + '}');
    return lines.join(npm$t.os.EOL);
};

npm$t.utils.addInspection(QueryFileError$4, function () {
    return this.toString();
});

var queryFileError = {QueryFileError: QueryFileError$4};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {QueryFileError: QueryFileError$3} = queryFileError;

const npm$s = {
    os: require$$1,
    utils: utils$4
};

/**
 * @class errors.PreparedStatementError
 * @augments external:Error
 * @description
 * {@link errors.PreparedStatementError PreparedStatementError} class, available from the {@link errors} namespace.
 *
 * This type represents all errors that can be reported by class {@link PreparedStatement}, whether it is used
 * explicitly or implicitly (via a simple `{name, text, values}` object).
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `PreparedStatementError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {errors.QueryFileError} error
 * Internal {@link errors.QueryFileError} object.
 *
 * It is set only when the source {@link PreparedStatement} used a {@link QueryFile} which threw the error.
 *
 * @property {object} result
 * Resulting Prepared Statement object.
 *
 * @see PreparedStatement
 */
let PreparedStatementError$2 = class PreparedStatementError extends Error {
    constructor(error, ps) {
        const isQueryFileError = error instanceof QueryFileError$3;
        const message = isQueryFileError ? 'Failed to initialize \'text\' from a QueryFile.' : error;
        super(message);
        this.name = this.constructor.name;
        if (isQueryFileError) {
            this.error = error;
        }
        this.result = ps;
        Error.captureStackTrace(this, this.constructor);
    }
};

/**
 * @method errors.PreparedStatementError#toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
PreparedStatementError$2.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    const gap0 = npm$s.utils.messageGap(level),
        gap1 = npm$s.utils.messageGap(level + 1),
        gap2 = npm$s.utils.messageGap(level + 2),
        lines = [
            'PreparedStatementError {',
            gap1 + 'message: "' + this.message + '"',
            gap1 + 'result: {',
            gap2 + 'name: ' + npm$s.utils.toJson(this.result.name),
            gap2 + 'text: ' + npm$s.utils.toJson(this.result.text),
            gap2 + 'values: ' + npm$s.utils.toJson(this.result.values),
            gap1 + '}'
        ];
    if (this.error) {
        lines.push(gap1 + 'error: ' + this.error.toString(level + 1));
    }
    lines.push(gap0 + '}');
    return lines.join(npm$s.os.EOL);
};

npm$s.utils.addInspection(PreparedStatementError$2, function () {
    return this.toString();
});

var preparedStatementError = {PreparedStatementError: PreparedStatementError$2};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {QueryFileError: QueryFileError$2} = queryFileError;

const npm$r = {
    os: require$$1,
    utils: utils$4
};

/**
 * @class errors.ParameterizedQueryError
 * @augments external:Error
 * @description
 * {@link errors.ParameterizedQueryError ParameterizedQueryError} class, available from the {@link errors} namespace.
 *
 * This type represents all errors that can be reported by class {@link ParameterizedQuery}, whether it is used
 * explicitly or implicitly (via a simple `{text, values}` object).
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `ParameterizedQueryError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {errors.QueryFileError} error
 * Internal {@link errors.QueryFileError} object.
 *
 * It is set only when the source {@link ParameterizedQuery} used a {@link QueryFile} which threw the error.
 *
 * @property {object} result
 * Resulting Parameterized Query object.
 *
 * @see ParameterizedQuery
 */
let ParameterizedQueryError$2 = class ParameterizedQueryError extends Error {
    constructor(error, pq) {
        const isQueryFileError = error instanceof QueryFileError$2;
        const message = isQueryFileError ? 'Failed to initialize \'text\' from a QueryFile.' : error;
        super(message);
        this.name = this.constructor.name;
        if (isQueryFileError) {
            this.error = error;
        }
        this.result = pq;
        Error.captureStackTrace(this, this.constructor);
    }
};

/**
 * @method errors.ParameterizedQueryError#toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
ParameterizedQueryError$2.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    const gap0 = npm$r.utils.messageGap(level),
        gap1 = npm$r.utils.messageGap(level + 1),
        gap2 = npm$r.utils.messageGap(level + 2),
        lines = [
            'ParameterizedQueryError {',
            gap1 + 'message: "' + this.message + '"',
            gap1 + 'result: {',
            gap2 + 'text: ' + npm$r.utils.toJson(this.result.text),
            gap2 + 'values: ' + npm$r.utils.toJson(this.result.values),
            gap1 + '}'
        ];
    if (this.error) {
        lines.push(gap1 + 'error: ' + this.error.toString(level + 1));
    }
    lines.push(gap0 + '}');
    return lines.join(npm$r.os.EOL);
};

npm$r.utils.addInspection(ParameterizedQueryError$2, function () {
    return this.toString();
});

var parameterizedQueryError = {ParameterizedQueryError: ParameterizedQueryError$2};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {QueryResultError: QueryResultError$1, queryResultErrorCode} = queryResultError;
const {PreparedStatementError: PreparedStatementError$1} = preparedStatementError;
const {ParameterizedQueryError: ParameterizedQueryError$1} = parameterizedQueryError;
const {QueryFileError: QueryFileError$1} = queryFileError;

/**
 * @namespace errors
 * @description
 * Error types namespace, available as `pgp.errors`, before and after initializing the library.
 *
 * @property {function} PreparedStatementError
 * {@link errors.PreparedStatementError PreparedStatementError} class constructor.
 *
 * Represents all errors that can be reported by class {@link PreparedStatement}.
 *
 * @property {function} ParameterizedQueryError
 * {@link errors.ParameterizedQueryError ParameterizedQueryError} class constructor.
 *
 * Represents all errors that can be reported by class {@link ParameterizedQuery}.
 *
 * @property {function} QueryFileError
 * {@link errors.QueryFileError QueryFileError} class constructor.
 *
 * Represents all errors that can be reported by class {@link QueryFile}.
 *
 * @property {function} QueryResultError
 * {@link errors.QueryResultError QueryResultError} class constructor.
 *
 * Represents all result-specific errors from query methods.
 *
 * @property {errors.queryResultErrorCode} queryResultErrorCode
 * Error codes `enum` used by class {@link errors.QueryResultError QueryResultError}.
 *
 */

var errors$1 = {
    QueryResultError: QueryResultError$1,
    queryResultErrorCode,
    PreparedStatementError: PreparedStatementError$1,
    ParameterizedQueryError: ParameterizedQueryError$1,
    QueryFileError: QueryFileError$1
};

var defaults$1 = {exports: {}};

var pgTypes = {};

var postgresArray = {};

postgresArray.parse = function (source, transform) {
  return new ArrayParser(source, transform).parse()
};

class ArrayParser {
  constructor (source, transform) {
    this.source = source;
    this.transform = transform || identity;
    this.position = 0;
    this.entries = [];
    this.recorded = [];
    this.dimension = 0;
  }

  isEof () {
    return this.position >= this.source.length
  }

  nextCharacter () {
    var character = this.source[this.position++];
    if (character === '\\') {
      return {
        value: this.source[this.position++],
        escaped: true
      }
    }
    return {
      value: character,
      escaped: false
    }
  }

  record (character) {
    this.recorded.push(character);
  }

  newEntry (includeEmpty) {
    var entry;
    if (this.recorded.length > 0 || includeEmpty) {
      entry = this.recorded.join('');
      if (entry === 'NULL' && !includeEmpty) {
        entry = null;
      }
      if (entry !== null) entry = this.transform(entry);
      this.entries.push(entry);
      this.recorded = [];
    }
  }

  consumeDimensions () {
    if (this.source[0] === '[') {
      while (!this.isEof()) {
        var char = this.nextCharacter();
        if (char.value === '=') break
      }
    }
  }

  parse (nested) {
    var character, parser, quote;
    this.consumeDimensions();
    while (!this.isEof()) {
      character = this.nextCharacter();
      if (character.value === '{' && !quote) {
        this.dimension++;
        if (this.dimension > 1) {
          parser = new ArrayParser(this.source.substr(this.position - 1), this.transform);
          this.entries.push(parser.parse(true));
          this.position += parser.position - 2;
        }
      } else if (character.value === '}' && !quote) {
        this.dimension--;
        if (!this.dimension) {
          this.newEntry();
          if (nested) return this.entries
        }
      } else if (character.value === '"' && !character.escaped) {
        if (quote) this.newEntry(true);
        quote = !quote;
      } else if (character.value === ',' && !quote) {
        this.newEntry();
      } else {
        this.record(character.value);
      }
    }
    if (this.dimension !== 0) {
      throw new Error('array dimension not balanced')
    }
    return this.entries
  }
}

function identity (value) {
  return value
}

var array$1 = postgresArray;

var arrayParser$2 = {
  create: function (source, transform) {
    return {
      parse: function() {
        return array$1.parse(source, transform);
      }
    };
  }
};

var DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/;
var DATE = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/;
var TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/;
var INFINITY = /^-?infinity$/;

var postgresDate = function parseDate (isoDate) {
  if (INFINITY.test(isoDate)) {
    // Capitalize to Infinity before passing to Number
    return Number(isoDate.replace('i', 'I'))
  }
  var matches = DATE_TIME.exec(isoDate);

  if (!matches) {
    // Force YYYY-MM-DD dates to be parsed as local time
    return getDate(isoDate) || null
  }

  var isBC = !!matches[8];
  var year = parseInt(matches[1], 10);
  if (isBC) {
    year = bcYearToNegativeYear(year);
  }

  var month = parseInt(matches[2], 10) - 1;
  var day = matches[3];
  var hour = parseInt(matches[4], 10);
  var minute = parseInt(matches[5], 10);
  var second = parseInt(matches[6], 10);

  var ms = matches[7];
  ms = ms ? 1000 * parseFloat(ms) : 0;

  var date;
  var offset = timeZoneOffset(isoDate);
  if (offset != null) {
    date = new Date(Date.UTC(year, month, day, hour, minute, second, ms));

    // Account for years from 0 to 99 being interpreted as 1900-1999
    // by Date.UTC / the multi-argument form of the Date constructor
    if (is0To99(year)) {
      date.setUTCFullYear(year);
    }

    if (offset !== 0) {
      date.setTime(date.getTime() - offset);
    }
  } else {
    date = new Date(year, month, day, hour, minute, second, ms);

    if (is0To99(year)) {
      date.setFullYear(year);
    }
  }

  return date
};

function getDate (isoDate) {
  var matches = DATE.exec(isoDate);
  if (!matches) {
    return
  }

  var year = parseInt(matches[1], 10);
  var isBC = !!matches[4];
  if (isBC) {
    year = bcYearToNegativeYear(year);
  }

  var month = parseInt(matches[2], 10) - 1;
  var day = matches[3];
  // YYYY-MM-DD will be parsed as local time
  var date = new Date(year, month, day);

  if (is0To99(year)) {
    date.setFullYear(year);
  }

  return date
}

// match timezones:
// Z (UTC)
// -05
// +06:30
function timeZoneOffset (isoDate) {
  if (isoDate.endsWith('+00')) {
    return 0
  }

  var zone = TIME_ZONE.exec(isoDate.split(' ')[1]);
  if (!zone) return
  var type = zone[1];

  if (type === 'Z') {
    return 0
  }
  var sign = type === '-' ? -1 : 1;
  var offset = parseInt(zone[2], 10) * 3600 +
    parseInt(zone[3] || 0, 10) * 60 +
    parseInt(zone[4] || 0, 10);

  return offset * sign * 1000
}

function bcYearToNegativeYear (year) {
  // Account for numerical difference between representations of BC years
  // See: https://github.com/bendrucker/postgres-date/issues/5
  return -(year - 1)
}

function is0To99 (num) {
  return num >= 0 && num < 100
}

var mutable = extend$2;

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend$2(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }

    return target
}

var extend$1 = mutable;

var postgresInterval = PostgresInterval;

function PostgresInterval (raw) {
  if (!(this instanceof PostgresInterval)) {
    return new PostgresInterval(raw)
  }
  extend$1(this, parse$1(raw));
}
var properties = ['seconds', 'minutes', 'hours', 'days', 'months', 'years'];
PostgresInterval.prototype.toPostgres = function () {
  var filtered = properties.filter(this.hasOwnProperty, this);

  // In addition to `properties`, we need to account for fractions of seconds.
  if (this.milliseconds && filtered.indexOf('seconds') < 0) {
    filtered.push('seconds');
  }

  if (filtered.length === 0) return '0'
  return filtered
    .map(function (property) {
      var value = this[property] || 0;

      // Account for fractional part of seconds,
      // remove trailing zeroes.
      if (property === 'seconds' && this.milliseconds) {
        value = (value + this.milliseconds / 1000).toFixed(6).replace(/\.?0+$/, '');
      }

      return value + ' ' + property
    }, this)
    .join(' ')
};

var propertiesISOEquivalent = {
  years: 'Y',
  months: 'M',
  days: 'D',
  hours: 'H',
  minutes: 'M',
  seconds: 'S'
};
var dateProperties = ['years', 'months', 'days'];
var timeProperties = ['hours', 'minutes', 'seconds'];
// according to ISO 8601
PostgresInterval.prototype.toISOString = PostgresInterval.prototype.toISO = function () {
  var datePart = dateProperties
    .map(buildProperty, this)
    .join('');

  var timePart = timeProperties
    .map(buildProperty, this)
    .join('');

  return 'P' + datePart + 'T' + timePart

  function buildProperty (property) {
    var value = this[property] || 0;

    // Account for fractional part of seconds,
    // remove trailing zeroes.
    if (property === 'seconds' && this.milliseconds) {
      value = (value + this.milliseconds / 1000).toFixed(6).replace(/0+$/, '');
    }

    return value + propertiesISOEquivalent[property]
  }
};

var NUMBER = '([+-]?\\d+)';
var YEAR = NUMBER + '\\s+years?';
var MONTH = NUMBER + '\\s+mons?';
var DAY = NUMBER + '\\s+days?';
var TIME = '([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?';
var INTERVAL = new RegExp([YEAR, MONTH, DAY, TIME].map(function (regexString) {
  return '(' + regexString + ')?'
})
  .join('\\s*'));

// Positions of values in regex match
var positions = {
  years: 2,
  months: 4,
  days: 6,
  hours: 9,
  minutes: 10,
  seconds: 11,
  milliseconds: 12
};
// We can use negative time
var negatives = ['hours', 'minutes', 'seconds', 'milliseconds'];

function parseMilliseconds (fraction) {
  // add omitted zeroes
  var microseconds = fraction + '000000'.slice(fraction.length);
  return parseInt(microseconds, 10) / 1000
}

function parse$1 (interval) {
  if (!interval) return {}
  var matches = INTERVAL.exec(interval);
  var isNegative = matches[8] === '-';
  return Object.keys(positions)
    .reduce(function (parsed, property) {
      var position = positions[property];
      var value = matches[position];
      // no empty string
      if (!value) return parsed
      // milliseconds are actually microseconds (up to 6 digits)
      // with omitted trailing zeroes.
      value = property === 'milliseconds'
        ? parseMilliseconds(value)
        : parseInt(value, 10);
      // no zeros
      if (!value) return parsed
      if (isNegative && ~negatives.indexOf(property)) {
        value *= -1;
      }
      parsed[property] = value;
      return parsed
    }, {})
}

var postgresBytea = function parseBytea (input) {
  if (/^\\x/.test(input)) {
    // new 'hex' style response (pg >9.0)
    return new Buffer(input.substr(2), 'hex')
  }
  var output = '';
  var i = 0;
  while (i < input.length) {
    if (input[i] !== '\\') {
      output += input[i];
      ++i;
    } else {
      if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
        output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8));
        i += 4;
      } else {
        var backslashes = 1;
        while (i + backslashes < input.length && input[i + backslashes] === '\\') {
          backslashes++;
        }
        for (var k = 0; k < Math.floor(backslashes / 2); ++k) {
          output += '\\';
        }
        i += Math.floor(backslashes / 2) * 2;
      }
    }
  }
  return new Buffer(output, 'binary')
};

var array = postgresArray;
var arrayParser$1 = arrayParser$2;
var parseDate$1 = postgresDate;
var parseInterval = postgresInterval;
var parseByteA = postgresBytea;

function allowNull (fn) {
  return function nullAllowed (value) {
    if (value === null) return value
    return fn(value)
  }
}

function parseBool$1 (value) {
  if (value === null) return value
  return value === 'TRUE' ||
    value === 't' ||
    value === 'true' ||
    value === 'y' ||
    value === 'yes' ||
    value === 'on' ||
    value === '1';
}

function parseBoolArray (value) {
  if (!value) return null
  return array.parse(value, parseBool$1)
}

function parseBaseTenInt (string) {
  return parseInt(string, 10)
}

function parseIntegerArray (value) {
  if (!value) return null
  return array.parse(value, allowNull(parseBaseTenInt))
}

function parseBigIntegerArray (value) {
  if (!value) return null
  return array.parse(value, allowNull(function (entry) {
    return parseBigInteger(entry).trim()
  }))
}

var parsePointArray = function(value) {
  if(!value) { return null; }
  var p = arrayParser$1.create(value, function(entry) {
    if(entry !== null) {
      entry = parsePoint(entry);
    }
    return entry;
  });

  return p.parse();
};

var parseFloatArray = function(value) {
  if(!value) { return null; }
  var p = arrayParser$1.create(value, function(entry) {
    if(entry !== null) {
      entry = parseFloat(entry);
    }
    return entry;
  });

  return p.parse();
};

var parseStringArray = function(value) {
  if(!value) { return null; }

  var p = arrayParser$1.create(value);
  return p.parse();
};

var parseDateArray = function(value) {
  if (!value) { return null; }

  var p = arrayParser$1.create(value, function(entry) {
    if (entry !== null) {
      entry = parseDate$1(entry);
    }
    return entry;
  });

  return p.parse();
};

var parseIntervalArray = function(value) {
  if (!value) { return null; }

  var p = arrayParser$1.create(value, function(entry) {
    if (entry !== null) {
      entry = parseInterval(entry);
    }
    return entry;
  });

  return p.parse();
};

var parseByteAArray = function(value) {
  if (!value) { return null; }

  return array.parse(value, allowNull(parseByteA));
};

var parseInteger = function(value) {
  return parseInt(value, 10);
};

var parseBigInteger = function(value) {
  var valStr = String(value);
  if (/^\d+$/.test(valStr)) { return valStr; }
  return value;
};

var parseJsonArray = function(value) {
  if (!value) { return null; }

  return array.parse(value, allowNull(JSON.parse));
};

var parsePoint = function(value) {
  if (value[0] !== '(') { return null; }

  value = value.substring( 1, value.length - 1 ).split(',');

  return {
    x: parseFloat(value[0])
  , y: parseFloat(value[1])
  };
};

var parseCircle = function(value) {
  if (value[0] !== '<' && value[1] !== '(') { return null; }

  var point = '(';
  var radius = '';
  var pointParsed = false;
  for (var i = 2; i < value.length - 1; i++){
    if (!pointParsed) {
      point += value[i];
    }

    if (value[i] === ')') {
      pointParsed = true;
      continue;
    } else if (!pointParsed) {
      continue;
    }

    if (value[i] === ','){
      continue;
    }

    radius += value[i];
  }
  var result = parsePoint(point);
  result.radius = parseFloat(radius);

  return result;
};

var init$1 = function(register) {
  register(20, parseBigInteger); // int8
  register(21, parseInteger); // int2
  register(23, parseInteger); // int4
  register(26, parseInteger); // oid
  register(700, parseFloat); // float4/real
  register(701, parseFloat); // float8/double
  register(16, parseBool$1);
  register(1082, parseDate$1); // date
  register(1114, parseDate$1); // timestamp without timezone
  register(1184, parseDate$1); // timestamp
  register(600, parsePoint); // point
  register(651, parseStringArray); // cidr[]
  register(718, parseCircle); // circle
  register(1000, parseBoolArray);
  register(1001, parseByteAArray);
  register(1005, parseIntegerArray); // _int2
  register(1007, parseIntegerArray); // _int4
  register(1028, parseIntegerArray); // oid[]
  register(1016, parseBigIntegerArray); // _int8
  register(1017, parsePointArray); // point[]
  register(1021, parseFloatArray); // _float4
  register(1022, parseFloatArray); // _float8
  register(1231, parseFloatArray); // _numeric
  register(1014, parseStringArray); //char
  register(1015, parseStringArray); //varchar
  register(1008, parseStringArray);
  register(1009, parseStringArray);
  register(1040, parseStringArray); // macaddr[]
  register(1041, parseStringArray); // inet[]
  register(1115, parseDateArray); // timestamp without time zone[]
  register(1182, parseDateArray); // _date
  register(1185, parseDateArray); // timestamp with time zone[]
  register(1186, parseInterval);
  register(1187, parseIntervalArray);
  register(17, parseByteA);
  register(114, JSON.parse.bind(JSON)); // json
  register(3802, JSON.parse.bind(JSON)); // jsonb
  register(199, parseJsonArray); // json[]
  register(3807, parseJsonArray); // jsonb[]
  register(3907, parseStringArray); // numrange[]
  register(2951, parseStringArray); // uuid[]
  register(791, parseStringArray); // money[]
  register(1183, parseStringArray); // time[]
  register(1270, parseStringArray); // timetz[]
};

var textParsers$1 = {
  init: init$1
};

// selected so (BASE - 1) * 0x100000000 + 0xffffffff is a safe integer
var BASE = 1000000;

function readInt8(buffer) {
	var high = buffer.readInt32BE(0);
	var low = buffer.readUInt32BE(4);
	var sign = '';

	if (high < 0) {
		high = ~high + (low === 0);
		low = (~low + 1) >>> 0;
		sign = '-';
	}

	var result = '';
	var carry;
	var t;
	var digits;
	var pad;
	var l;
	var i;

	{
		carry = high % BASE;
		high = high / BASE >>> 0;

		t = 0x100000000 * carry + low;
		low = t / BASE >>> 0;
		digits = '' + (t - BASE * low);

		if (low === 0 && high === 0) {
			return sign + digits + result;
		}

		pad = '';
		l = 6 - digits.length;

		for (i = 0; i < l; i++) {
			pad += '0';
		}

		result = pad + digits + result;
	}

	{
		carry = high % BASE;
		high = high / BASE >>> 0;

		t = 0x100000000 * carry + low;
		low = t / BASE >>> 0;
		digits = '' + (t - BASE * low);

		if (low === 0 && high === 0) {
			return sign + digits + result;
		}

		pad = '';
		l = 6 - digits.length;

		for (i = 0; i < l; i++) {
			pad += '0';
		}

		result = pad + digits + result;
	}

	{
		carry = high % BASE;
		high = high / BASE >>> 0;

		t = 0x100000000 * carry + low;
		low = t / BASE >>> 0;
		digits = '' + (t - BASE * low);

		if (low === 0 && high === 0) {
			return sign + digits + result;
		}

		pad = '';
		l = 6 - digits.length;

		for (i = 0; i < l; i++) {
			pad += '0';
		}

		result = pad + digits + result;
	}

	{
		carry = high % BASE;
		t = 0x100000000 * carry + low;
		digits = '' + t % BASE;

		return sign + digits + result;
	}
}

var pgInt8 = readInt8;

var parseInt64 = pgInt8;

var parseBits = function(data, bits, offset, invert, callback) {
  offset = offset || 0;
  invert = invert || false;
  callback = callback || function(lastValue, newValue, bits) { return (lastValue * Math.pow(2, bits)) + newValue; };
  var offsetBytes = offset >> 3;

  var inv = function(value) {
    if (invert) {
      return ~value & 0xff;
    }

    return value;
  };

  // read first (maybe partial) byte
  var mask = 0xff;
  var firstBits = 8 - (offset % 8);
  if (bits < firstBits) {
    mask = (0xff << (8 - bits)) & 0xff;
    firstBits = bits;
  }

  if (offset) {
    mask = mask >> (offset % 8);
  }

  var result = 0;
  if ((offset % 8) + bits >= 8) {
    result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
  }

  // read bytes
  var bytes = (bits + offset) >> 3;
  for (var i = offsetBytes + 1; i < bytes; i++) {
    result = callback(result, inv(data[i]), 8);
  }

  // bits to read, that are not a complete byte
  var lastBits = (bits + offset) % 8;
  if (lastBits > 0) {
    result = callback(result, inv(data[bytes]) >> (8 - lastBits), lastBits);
  }

  return result;
};

var parseFloatFromBits = function(data, precisionBits, exponentBits) {
  var bias = Math.pow(2, exponentBits - 1) - 1;
  var sign = parseBits(data, 1);
  var exponent = parseBits(data, exponentBits, 1);

  if (exponent === 0) {
    return 0;
  }

  // parse mantissa
  var precisionBitsCounter = 1;
  var parsePrecisionBits = function(lastValue, newValue, bits) {
    if (lastValue === 0) {
      lastValue = 1;
    }

    for (var i = 1; i <= bits; i++) {
      precisionBitsCounter /= 2;
      if ((newValue & (0x1 << (bits - i))) > 0) {
        lastValue += precisionBitsCounter;
      }
    }

    return lastValue;
  };

  var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);

  // special cases
  if (exponent == (Math.pow(2, exponentBits + 1) - 1)) {
    if (mantissa === 0) {
      return (sign === 0) ? Infinity : -Infinity;
    }

    return NaN;
  }

  // normale number
  return ((sign === 0) ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
};

var parseInt16 = function(value) {
  if (parseBits(value, 1) == 1) {
    return -1 * (parseBits(value, 15, 1, true) + 1);
  }

  return parseBits(value, 15, 1);
};

var parseInt32 = function(value) {
  if (parseBits(value, 1) == 1) {
    return -1 * (parseBits(value, 31, 1, true) + 1);
  }

  return parseBits(value, 31, 1);
};

var parseFloat32 = function(value) {
  return parseFloatFromBits(value, 23, 8);
};

var parseFloat64 = function(value) {
  return parseFloatFromBits(value, 52, 11);
};

var parseNumeric = function(value) {
  var sign = parseBits(value, 16, 32);
  if (sign == 0xc000) {
    return NaN;
  }

  var weight = Math.pow(10000, parseBits(value, 16, 16));
  var result = 0;
  var ndigits = parseBits(value, 16);
  for (var i = 0; i < ndigits; i++) {
    result += parseBits(value, 16, 64 + (16 * i)) * weight;
    weight /= 10000;
  }

  var scale = Math.pow(10, parseBits(value, 16, 48));
  return ((sign === 0) ? 1 : -1) * Math.round(result * scale) / scale;
};

var parseDate = function(isUTC, value) {
  var sign = parseBits(value, 1);
  var rawValue = parseBits(value, 63, 1);

  // discard usecs and shift from 2000 to 1970
  var result = new Date((((sign === 0) ? 1 : -1) * rawValue / 1000) + 946684800000);

  if (!isUTC) {
    result.setTime(result.getTime() + result.getTimezoneOffset() * 60000);
  }

  // add microseconds to the date
  result.usec = rawValue % 1000;
  result.getMicroSeconds = function() {
    return this.usec;
  };
  result.setMicroSeconds = function(value) {
    this.usec = value;
  };
  result.getUTCMicroSeconds = function() {
    return this.usec;
  };

  return result;
};

var parseArray = function(value) {
  var dim = parseBits(value, 32);

  parseBits(value, 32, 32);
  var elementType = parseBits(value, 32, 64);

  var offset = 96;
  var dims = [];
  for (var i = 0; i < dim; i++) {
    // parse dimension
    dims[i] = parseBits(value, 32, offset);
    offset += 32;

    // ignore lower bounds
    offset += 32;
  }

  var parseElement = function(elementType) {
    // parse content length
    var length = parseBits(value, 32, offset);
    offset += 32;

    // parse null values
    if (length == 0xffffffff) {
      return null;
    }

    var result;
    if ((elementType == 0x17) || (elementType == 0x14)) {
      // int/bigint
      result = parseBits(value, length * 8, offset);
      offset += length * 8;
      return result;
    }
    else if (elementType == 0x19) {
      // string
      result = value.toString(this.encoding, offset >> 3, (offset += (length << 3)) >> 3);
      return result;
    }
    else {
      console.log("ERROR: ElementType not implemented: " + elementType);
    }
  };

  var parse = function(dimension, elementType) {
    var array = [];
    var i;

    if (dimension.length > 1) {
      var count = dimension.shift();
      for (i = 0; i < count; i++) {
        array[i] = parse(dimension, elementType);
      }
      dimension.unshift(count);
    }
    else {
      for (i = 0; i < dimension[0]; i++) {
        array[i] = parseElement(elementType);
      }
    }

    return array;
  };

  return parse(dims, elementType);
};

var parseText = function(value) {
  return value.toString('utf8');
};

var parseBool = function(value) {
  if(value === null) return null;
  return (parseBits(value, 8) > 0);
};

var init = function(register) {
  register(20, parseInt64);
  register(21, parseInt16);
  register(23, parseInt32);
  register(26, parseInt32);
  register(1700, parseNumeric);
  register(700, parseFloat32);
  register(701, parseFloat64);
  register(16, parseBool);
  register(1114, parseDate.bind(null, false));
  register(1184, parseDate.bind(null, true));
  register(1000, parseArray);
  register(1007, parseArray);
  register(1016, parseArray);
  register(1008, parseArray);
  register(1009, parseArray);
  register(25, parseText);
};

var binaryParsers$1 = {
  init: init
};

/**
 * Following query was used to generate this file:

 SELECT json_object_agg(UPPER(PT.typname), PT.oid::int4 ORDER BY pt.oid)
 FROM pg_type PT
 WHERE typnamespace = (SELECT pgn.oid FROM pg_namespace pgn WHERE nspname = 'pg_catalog') -- Take only builting Postgres types with stable OID (extension types are not guaranted to be stable)
 AND typtype = 'b' -- Only basic types
 AND typelem = 0 -- Ignore aliases
 AND typisdefined -- Ignore undefined types
 */

var builtins = {
    BOOL: 16,
    BYTEA: 17,
    CHAR: 18,
    INT8: 20,
    INT2: 21,
    INT4: 23,
    REGPROC: 24,
    TEXT: 25,
    OID: 26,
    TID: 27,
    XID: 28,
    CID: 29,
    JSON: 114,
    XML: 142,
    PG_NODE_TREE: 194,
    SMGR: 210,
    PATH: 602,
    POLYGON: 604,
    CIDR: 650,
    FLOAT4: 700,
    FLOAT8: 701,
    ABSTIME: 702,
    RELTIME: 703,
    TINTERVAL: 704,
    CIRCLE: 718,
    MACADDR8: 774,
    MONEY: 790,
    MACADDR: 829,
    INET: 869,
    ACLITEM: 1033,
    BPCHAR: 1042,
    VARCHAR: 1043,
    DATE: 1082,
    TIME: 1083,
    TIMESTAMP: 1114,
    TIMESTAMPTZ: 1184,
    INTERVAL: 1186,
    TIMETZ: 1266,
    BIT: 1560,
    VARBIT: 1562,
    NUMERIC: 1700,
    REFCURSOR: 1790,
    REGPROCEDURE: 2202,
    REGOPER: 2203,
    REGOPERATOR: 2204,
    REGCLASS: 2205,
    REGTYPE: 2206,
    UUID: 2950,
    TXID_SNAPSHOT: 2970,
    PG_LSN: 3220,
    PG_NDISTINCT: 3361,
    PG_DEPENDENCIES: 3402,
    TSVECTOR: 3614,
    TSQUERY: 3615,
    GTSVECTOR: 3642,
    REGCONFIG: 3734,
    REGDICTIONARY: 3769,
    JSONB: 3802,
    REGNAMESPACE: 4089,
    REGROLE: 4096
};

var textParsers = textParsers$1;
var binaryParsers = binaryParsers$1;
var arrayParser = arrayParser$2;
var builtinTypes = builtins;

pgTypes.getTypeParser = getTypeParser;
pgTypes.setTypeParser = setTypeParser;
pgTypes.arrayParser = arrayParser;
pgTypes.builtins = builtinTypes;

var typeParsers = {
  text: {},
  binary: {}
};

//the empty parse function
function noParse (val) {
  return String(val);
}
//returns a function used to convert a specific type (specified by
//oid) into a result javascript type
//note: the oid can be obtained via the following sql query:
//SELECT oid FROM pg_type WHERE typname = 'TYPE_NAME_HERE';
function getTypeParser (oid, format) {
  format = format || 'text';
  if (!typeParsers[format]) {
    return noParse;
  }
  return typeParsers[format][oid] || noParse;
}
function setTypeParser (oid, format, parseFn) {
  if(typeof format == 'function') {
    parseFn = format;
    format = 'text';
  }
  typeParsers[format][oid] = parseFn;
}
textParsers.init(function(oid, converter) {
  typeParsers.text[oid] = converter;
});

binaryParsers.init(function(oid, converter) {
  typeParsers.binary[oid] = converter;
});

(function (module) {

	module.exports = {
	  // database host. defaults to localhost
	  host: 'localhost',

	  // database user's name
	  user: process.platform === 'win32' ? process.env.USERNAME : process.env.USER,

	  // name of database to connect
	  database: undefined,

	  // database user's password
	  password: null,

	  // a Postgres connection string to be used instead of setting individual connection items
	  // NOTE:  Setting this value will cause it to override any other value (such as database or user) defined
	  // in the defaults object.
	  connectionString: undefined,

	  // database port
	  port: 5432,

	  // number of rows to return at a time from a prepared statement's
	  // portal. 0 will return all rows at once
	  rows: 0,

	  // binary result mode
	  binary: false,

	  // Connection pool options - see https://github.com/brianc/node-pg-pool

	  // number of connections to use in connection pool
	  // 0 will disable connection pooling
	  max: 10,

	  // max milliseconds a client can go unused before it is removed
	  // from the pool and destroyed
	  idleTimeoutMillis: 30000,

	  client_encoding: '',

	  ssl: false,

	  application_name: undefined,

	  fallback_application_name: undefined,

	  options: undefined,

	  parseInputDatesAsUTC: false,

	  // max milliseconds any query using this connection will execute for before timing out in error.
	  // false=unlimited
	  statement_timeout: false,

	  // Abort any statement that waits longer than the specified duration in milliseconds while attempting to acquire a lock.
	  // false=unlimited
	  lock_timeout: false,

	  // Terminate any session with an open transaction that has been idle for longer than the specified duration in milliseconds
	  // false=unlimited
	  idle_in_transaction_session_timeout: false,

	  // max milliseconds to wait for query to complete (client side)
	  query_timeout: false,

	  connect_timeout: 0,

	  keepalives: 1,

	  keepalives_idle: 0,
	};

	const pgTypes$1 = pgTypes;
	// save default parsers
	const parseBigInteger = pgTypes$1.getTypeParser(20, 'text');
	const parseBigIntegerArray = pgTypes$1.getTypeParser(1016, 'text');

	// parse int8 so you can get your count values as actual numbers
	module.exports.__defineSetter__('parseInt8', function (val) {
	  pgTypes$1.setTypeParser(20, 'text', val ? pgTypes$1.getTypeParser(23, 'text') : parseBigInteger);
	  pgTypes$1.setTypeParser(1016, 'text', val ? pgTypes$1.getTypeParser(1007, 'text') : parseBigIntegerArray);
	}); 
} (defaults$1));

var defaultsExports = defaults$1.exports;

const defaults = defaultsExports;

const util = require$$0;
const { isDate } = util.types || util; // Node 8 doesn't have `util.types`

function escapeElement(elementRepresentation) {
  const escaped = elementRepresentation.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  return '"' + escaped + '"'
}

// convert a JS array to a postgres array literal
// uses comma separator so won't work for types like box that use
// a different array separator.
function arrayString(val) {
  let result = '{';
  for (let i = 0; i < val.length; i++) {
    if (i > 0) {
      result = result + ',';
    }
    if (val[i] === null || typeof val[i] === 'undefined') {
      result = result + 'NULL';
    } else if (Array.isArray(val[i])) {
      result = result + arrayString(val[i]);
    } else if (ArrayBuffer.isView(val[i])) {
      let item = val[i];
      if (!(item instanceof Buffer)) {
        const buf = Buffer.from(item.buffer, item.byteOffset, item.byteLength);
        if (buf.length === item.byteLength) {
          item = buf;
        } else {
          item = buf.slice(item.byteOffset, item.byteOffset + item.byteLength);
        }
      }
      result += '\\\\x' + item.toString('hex');
    } else {
      result += escapeElement(prepareValue(val[i]));
    }
  }
  result = result + '}';
  return result
}

// converts values from javascript types
// to their 'raw' counterparts for use as a postgres parameter
// note: you can override this function to provide your own conversion mechanism
// for complex types, etc...
const prepareValue = function (val, seen) {
  // null and undefined are both null for postgres
  if (val == null) {
    return null
  }
  if (typeof val === 'object') {
    if (val instanceof Buffer) {
      return val
    }
    if (ArrayBuffer.isView(val)) {
      const buf = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
      if (buf.length === val.byteLength) {
        return buf
      }
      return buf.slice(val.byteOffset, val.byteOffset + val.byteLength) // Node.js v4 does not support those Buffer.from params
    }
    if (isDate(val)) {
      if (defaults.parseInputDatesAsUTC) {
        return dateToStringUTC(val)
      } else {
        return dateToString(val)
      }
    }
    if (Array.isArray(val)) {
      return arrayString(val)
    }

    return prepareObject(val, seen)
  }
  return val.toString()
};

function prepareObject(val, seen) {
  if (val && typeof val.toPostgres === 'function') {
    seen = seen || [];
    if (seen.indexOf(val) !== -1) {
      throw new Error('circular reference detected while preparing "' + val + '" for query')
    }
    seen.push(val);

    return prepareValue(val.toPostgres(prepareValue), seen)
  }
  return JSON.stringify(val)
}

function dateToString(date) {
  let offset = -date.getTimezoneOffset();

  let year = date.getFullYear();
  const isBCYear = year < 1;
  if (isBCYear) year = Math.abs(year) + 1; // negative years are 1 off their BC representation

  let ret =
    String(year).padStart(4, '0') +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0') +
    'T' +
    String(date.getHours()).padStart(2, '0') +
    ':' +
    String(date.getMinutes()).padStart(2, '0') +
    ':' +
    String(date.getSeconds()).padStart(2, '0') +
    '.' +
    String(date.getMilliseconds()).padStart(3, '0');

  if (offset < 0) {
    ret += '-';
    offset *= -1;
  } else {
    ret += '+';
  }

  ret += String(Math.floor(offset / 60)).padStart(2, '0') + ':' + String(offset % 60).padStart(2, '0');
  if (isBCYear) ret += ' BC';
  return ret
}

function dateToStringUTC(date) {
  let year = date.getUTCFullYear();
  const isBCYear = year < 1;
  if (isBCYear) year = Math.abs(year) + 1; // negative years are 1 off their BC representation

  let ret =
    String(year).padStart(4, '0') +
    '-' +
    String(date.getUTCMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getUTCDate()).padStart(2, '0') +
    'T' +
    String(date.getUTCHours()).padStart(2, '0') +
    ':' +
    String(date.getUTCMinutes()).padStart(2, '0') +
    ':' +
    String(date.getUTCSeconds()).padStart(2, '0') +
    '.' +
    String(date.getUTCMilliseconds()).padStart(3, '0');

  ret += '+00:00';
  if (isBCYear) ret += ' BC';
  return ret
}

function normalizeQueryConfig(config, values, callback) {
  // can take in strings or config objects
  config = typeof config === 'string' ? { text: config } : config;
  if (values) {
    if (typeof values === 'function') {
      config.callback = values;
    } else {
      config.values = values;
    }
  }
  if (callback) {
    config.callback = callback;
  }
  return config
}

// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
const escapeIdentifier = function (str) {
  return '"' + str.replace(/"/g, '""') + '"'
};

const escapeLiteral = function (str) {
  let hasBackslash = false;
  let escaped = "'";

  if (str == null) {
    return "''"
  }

  if (typeof str !== 'string') {
    return "''"
  }

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === "'") {
      escaped += c + c;
    } else if (c === '\\') {
      escaped += c + c;
      hasBackslash = true;
    } else {
      escaped += c;
    }
  }

  escaped += "'";

  if (hasBackslash === true) {
    escaped = ' E' + escaped;
  }

  return escaped
};

var utils$1 = {
  prepareValue: function prepareValueWrapper(value) {
    // this ensures that extra arguments do not get passed into prepareValue
    // by accident, eg: from calling values.map(utils.prepareValue)
    return prepareValue(value)
  },
  normalizeQueryConfig,
  escapeIdentifier,
  escapeLiteral,
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {assert: assert$b} = assert$d;

const npm$q = {
    pgUtils: utils$1,
    patterns: patterns,
    utils: utils$4
};

// Format Modification Flags;
const fmFlags = {
    raw: 1, // Raw-Text variable
    alias: 2, // SQL Alias
    name: 4, // SQL Name/Identifier
    json: 8, // JSON modifier
    csv: 16, // CSV modifier
    value: 32 // escaped, but without ''
};

// Format Modification Map;
const fmMap = {
    '^': fmFlags.raw,
    ':raw': fmFlags.raw,
    ':alias': fmFlags.alias,
    '~': fmFlags.name,
    ':name': fmFlags.name,
    ':json': fmFlags.json,
    ':csv': fmFlags.csv,
    ':list': fmFlags.csv,
    ':value': fmFlags.value,
    '#': fmFlags.value
};

// Global symbols for Custom Type Formatting:
const ctfSymbols = {
    toPostgres: Symbol.for('ctf.toPostgres'),
    rawType: Symbol.for('ctf.rawType')
};

const maxVariable = 100000; // maximum supported variable is '$100000'

////////////////////////////////////////////////////
// Converts a single value into its Postgres format.
function formatValue({value, fm, cc, options}) {

    if (typeof value === 'function') {
        return formatValue({value: resolveFunc(value, cc), fm, cc});
    }

    const ctf = getCTF(value); // Custom Type Formatting
    if (ctf) {
        fm |= ctf.rawType ? fmFlags.raw : 0;
        return formatValue({value: resolveFunc(ctf.toPostgres, value), fm, cc});
    }

    const isRaw = !!(fm & fmFlags.raw);
    fm &= -2;

    switch (fm) {
        case fmFlags.alias:
            return $as.alias(value);
        case fmFlags.name:
            return $as.name(value);
        case fmFlags.json:
            return $as.json(value, isRaw);
        case fmFlags.csv:
            return $to.csv(value, options);
        case fmFlags.value:
            return $as.value(value);
    }

    if (isNull(value)) {
        throwIfRaw(isRaw);
        return 'null';
    }

    switch (typeof value) {
        case 'string':
            return $to.text(value, isRaw);
        case 'boolean':
            return $to.bool(value);
        case 'number':
        case 'bigint':
            return $to.number(value);
        case 'symbol':
            throw new TypeError(`Type Symbol has no meaning for PostgreSQL: ${value.toString()}`);
        default:
            if (value instanceof Date) {
                return $to.date(value, isRaw);
            }
            if (Array.isArray(value)) {
                return $to.array(value, options);
            }
            if (Buffer.isBuffer(value)) {
                return $to.buffer(value, isRaw);
            }
            return $to.json(value, isRaw);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Converts array of values into PostgreSQL Array Constructor: array[...], as per PostgreSQL documentation:
// http://www.postgresql.org/docs/9.6/static/arrays.html
//
// Arrays of any depth/dimension are supported.
//
// Top-level empty arrays are formatted as literal '{}' to avoid the necessity of explicit type casting,
// as the server cannot automatically infer the type of empty non-literal array.
function formatArray(array, options) {
    const loop = a => '[' + a.map(value => Array.isArray(value) ? loop(value) : formatValue({
        value,
        options
    })).join() + ']';
    const prefix = options && options.capSQL ? 'ARRAY' : 'array';
    return array.length ? (prefix + loop(array)) : '\'{}\'';
}

///////////////////////////////////////////////////////////////////
// Formats array/object/value as a list of comma-separated values.
function formatCSV(values, options) {
    if (Array.isArray(values)) {
        return values.map(value => formatValue({value, options})).join();
    }
    if (typeof values === 'object' && values !== null) {
        return Object.keys(values).map(v => formatValue({value: values[v], options})).join();
    }
    return values === undefined ? '' : formatValue({value: values, options});
}

///////////////////////////////
// Query formatting helpers;
const formatAs = {

    object({query, obj, raw, options}) {
        options = options && typeof options === 'object' ? options : {};
        return query.replace(npm$q.patterns.namedParameters, name => {
            const v = formatAs.stripName(name.replace(/^\$[{(<[/]|[\s})>\]/]/g, ''), raw),
                c = npm$q.utils.getIfHas(obj, v.name);
            if (!c.valid) {
                throw new Error(`Invalid property name '${v.name}'.`);
            }
            if (c.has) {
                return formatValue({value: c.value, fm: v.fm, cc: c.target, options});
            }
            if (v.name === 'this') {
                return formatValue({value: obj, fm: v.fm, options});
            }
            if ('def' in options) {
                const d = options.def, value = typeof d === 'function' ? d.call(obj, v.name, obj) : d;
                return formatValue({value, fm: v.fm, cc: obj, options});
            }
            if (options.partial) {
                return name;
            }
            // property must exist as the object's own or inherited;
            throw new Error(`Property '${v.name}' doesn't exist.`);
        });
    },

    array({query, array, raw, options}) {
        options = options && typeof options === 'object' ? options : {};
        return query.replace(npm$q.patterns.multipleValues, name => {
            const v = formatAs.stripName(name.substring(1), raw);
            const idx = v.name - 1;
            if (idx >= maxVariable) {
                throw new RangeError(`Variable $${v.name} exceeds supported maximum of $${maxVariable}`);
            }
            if (idx < array.length) {
                return formatValue({value: array[idx], fm: v.fm, options});
            }
            if ('def' in options) {
                const d = options.def, value = typeof d === 'function' ? d.call(array, idx, array) : d;
                return formatValue({value, fm: v.fm, options});
            }
            if (options.partial) {
                return name;
            }
            throw new RangeError(`Variable $${v.name} out of range. Parameters array length: ${array.length}`);
        });
    },

    value({query, value, raw, options}) {
        return query.replace(npm$q.patterns.singleValue, name => {
            const v = formatAs.stripName(name, raw);
            return formatValue({value, fm: v.fm, options});
        });
    },

    stripName(name, raw) {
        const mod = name.match(npm$q.patterns.hasValidModifier);
        if (mod) {
            return {
                name: name.substring(0, mod.index),
                fm: fmMap[mod[0]] | (raw ? fmFlags.raw : 0)
            };
        }
        return {
            name,
            fm: raw ? fmFlags.raw : null
        };
    }
};

////////////////////////////////////////////
// Simpler check for null/undefined;
function isNull(value) {
    return value === undefined || value === null;
}

//////////////////////////////////////////////////////////////////
// Checks if the value supports Custom Type Formatting,
// to return {toPostgres, rawType}, if it does, or null otherwise.
function getCTF(value) {
    if (!isNull(value)) {
        let toPostgres = value[ctfSymbols.toPostgres], rawType = !!value[ctfSymbols.rawType];
        if (typeof toPostgres !== 'function') {
            toPostgres = value.toPostgres;
            rawType = !!value.rawType;
        }
        if (typeof toPostgres === 'function') {
            if (toPostgres.constructor.name !== 'Function') {
                throw new Error('CTF does not support asynchronous toPostgres functions.');
            }
            return {toPostgres, rawType};
        }
    }
    return null;
}

/////////////////////////////////////////
// Wraps a text string in single quotes;
function wrapText(text) {
    return `'${text}'`;
}

////////////////////////////////////////////////
// Replaces each single-quote symbol ' with two,
// for compliance with PostgreSQL strings.
function safeText(text) {
    return text.replace(/'/g, '\'\'');
}

/////////////////////////////////////////////
// Throws an exception, if flag 'raw' is set.
function throwIfRaw(raw) {
    if (raw) {
        throw new TypeError('Values null/undefined cannot be used as raw text.');
    }
}

/////////////////////////////////////////////////////////////////////////////
// Recursively resolves parameter-function, with an optional Calling Context.
function resolveFunc(value, cc) {
    while (typeof value === 'function') {
        if (value.constructor.name !== 'Function') {
            // Constructor name for asynchronous functions have different names:
            // - 'GeneratorFunction' for ES6 generators
            // - 'AsyncFunction' for ES7 async functions
            throw new Error('Cannot use asynchronous functions with query formatting.');
        }
        value = value.call(cc, cc);
    }
    return value;
}

///////////////////////////////////////////////////////////////////////////////////
// It implements two types of formatting, depending on the 'values' passed:
//
// 1. format '$1, $2, etc', when 'values' is of type string, boolean, number, date,
//    function or null (or an array of the same types, plus undefined values);
// 2. format $*propName*, when 'values' is an object (not null and not Date),
//    and where * is any of the supported open-close pairs: {}, (), [], <>, //
//
function formatQuery(query, values, raw, options) {
    if (typeof query !== 'string') {
        throw new TypeError('Parameter \'query\' must be a text string.');
    }
    const ctf = getCTF(values);
    if (ctf) {
        // Custom Type Formatting
        return formatQuery(query, resolveFunc(ctf.toPostgres, values), raw || ctf.rawType, options);
    }
    if (typeof values === 'object' && values !== null) {
        if (Array.isArray(values)) {
            // $1, $2,... formatting to be applied;
            return formatAs.array({query, array: values, raw, options});
        }
        if (!(values instanceof Date || values instanceof Buffer)) {
            // $*propName* formatting to be applied;
            return formatAs.object({query, obj: values, raw, options});
        }
    }
    // $1 formatting to be applied, if values != undefined;
    return values === undefined ? query : formatAs.value({query, value: values, raw, options});
}

//////////////////////////////////////////////////////
// Formats a function or stored procedure call query;
function formatEntity(entity, values, {capSQL, type}) {
    let prefix = type === 'func' ? 'select * from' : 'call';
    if (capSQL) {
        prefix = prefix.toUpperCase();
    }
    return `${prefix} ${$as.alias(entity)}(${formatCSV(values, {capSQL})})`;
}

function formatSqlName(name) {
    return `"${name.replace(/"/g, '""')}"`;
}

/**
 * @namespace formatting
 * @description
 * Namespace for all query-formatting functions, available from `pgp.as` before and after initializing the library.
 *
 * @property {formatting.ctf} ctf
 * Namespace for symbols used by $[Custom Type Formatting].
 *
 * @property {function} alias
 * {@link formatting.alias alias} - formats an SQL alias.
 *
 * @property {function} name
 * {@link formatting.name name} - formats an SQL Name/Identifier.
 *
 * @property {function} text
 * {@link formatting.text text} - formats a text string.
 *
 * @property {function} number
 * {@link formatting.number number} - formats a number.
 *
 * @property {function} buffer
 * {@link formatting.buffer buffer} - formats a `Buffer` object.
 *
 * @property {function} value
 * {@link formatting.value value} - formats text as an open value.
 *
 * @property {function} json
 * {@link formatting.json json} - formats any value as JSON.
 *
 * @property {function} array
 * {@link formatting.array array} - formats an array of any depth.
 *
 * @property {function} csv
 * {@link formatting.csv csv} - formats an array as a list of comma-separated values.
 *
 * @property {function} func
 * {@link formatting.func func} - formats the value returned from a function.
 *
 * @property {function} format
 * {@link formatting.format format} - formats a query, according to parameters.
 *
 */
const $as = {

    /**
     * @namespace formatting.ctf
     * @description
     * Namespace for ES6 symbols used by $[Custom Type Formatting], available from `pgp.as.ctf` before and after initializing the library.
     *
     * It was added to avoid explicit/enumerable extension of types that need to be used as formatting parameters, to keep their type signature intact.
     *
     * @property {external:Symbol} toPostgres
     * Property name for the $[Custom Type Formatting] callback function `toPostgres`.
     *
     * @property {external:Symbol} rawType
     * Property name for the $[Custom Type Formatting] flag `rawType`.
     *
     * @example
     * const {toPostgres, rawType} = pgp.as.ctf; // Custom Type Formatting symbols
     *
     * class MyType {
     *     constructor() {
     *         this[rawType] = true; // set it only when toPostgres returns a pre-formatted result
     *     }
     *
     *     [toPostgres](self) {
     *         // self = this
     *
     *         // return the custom/actual value here
     *     }
     * }
     *
     * const a = new MyType();
     *
     * const s = pgp.as.format('$1', a); // will be custom-formatted
     */
    ctf: ctfSymbols,

    /**
     * @method formatting.text
     * @description
     * Converts a value into PostgreSQL text presentation, escaped as required.
     *
     * Escaping the result means:
     *  1. Every single-quote (apostrophe) is replaced with two
     *  2. The resulting text is wrapped in apostrophes
     *
     * @param {value|function} value
     * Value to be converted, or a function that returns the value.
     *
     * If the `value` resolves as `null` or `undefined`, while `raw`=`true`,
     * it will throw {@link external:TypeError TypeError} = `Values null/undefined cannot be used as raw text.`
     *
     * @param {boolean} [raw=false]
     * Indicates when not to escape the resulting text.
     *
     * @returns {string}
     *
     * - `null` string, if the `value` resolves as `null` or `undefined`
     * - escaped result of `value.toString()`, if the `value` isn't a string
     * - escaped string version, if `value` is a string.
     *
     *  The result is not escaped, if `raw` was passed in as `true`.
     */
    text(value, raw) {
        value = resolveFunc(value);
        if (isNull(value)) {
            throwIfRaw(raw);
            return 'null';
        }
        if (typeof value !== 'string') {
            value = value.toString();
        }
        return $to.text(value, raw);
    },

    /**
     * @method formatting.name
     * @description
     * Properly escapes an sql name or identifier, fixing double-quote symbols and wrapping the result in double quotes.
     *
     * Implements a safe way to format $[SQL Names] that neutralizes SQL Injection.
     *
     * When formatting a query, a variable makes use of this method via modifier `:name` or `~`. See method {@link formatting.format format}.
     *
     * @param {string|function|array|object} name
     * SQL name or identifier, or a function that returns it.
     *
     * The name must be at least 1 character long.
     *
     * If `name` doesn't resolve into a non-empty string, it throws {@link external:TypeError TypeError} = `Invalid sql name: ...`
     *
     * If the `name` contains only a single `*` (trailing spaces are ignored), then `name` is returned exactly as is (unescaped).
     *
     * - If `name` is an Array, it is formatted as a comma-separated list of $[SQL Names]
     * - If `name` is a non-Array object, its keys are formatted as a comma-separated list of $[SQL Names]
     *
     * Passing in an empty array/object will throw {@link external:Error Error} = `Cannot retrieve sql names from an empty array/object.`
     *
     * @returns {string}
     * The SQL Name/Identifier, properly escaped for compliance with the PostgreSQL standard for $[SQL Names] and identifiers.
     *
     * @see
     * {@link formatting.alias alias},
     * {@link formatting.format format}
     *
     * @example
     *
     * // automatically list object properties as sql names:
     * format('INSERT INTO table(${this~}) VALUES(${one}, ${two})', {
     *     one: 1,
     *     two: 2
     * });
     * //=> INSERT INTO table("one","two") VALUES(1, 2)
     *
     */
    name(name) {
        name = resolveFunc(name);
        if (name) {
            if (typeof name === 'string') {
                return /^\s*\*(\s*)$/.test(name) ? name : formatSqlName(name);
            }
            if (typeof name === 'object') {
                const keys = Array.isArray(name) ? name : Object.keys(name);
                if (!keys.length) {
                    throw new Error('Cannot retrieve sql names from an empty array/object.');
                }
                return keys.map(value => {
                    if (!value || typeof value !== 'string') {
                        throw new Error(`Invalid sql name: ${npm$q.utils.toJson(value)}`);
                    }
                    return formatSqlName(value);
                }).join();
            }
        }
        throw new TypeError(`Invalid sql name: ${npm$q.utils.toJson(name)}`);
    },

    /**
     * @method formatting.alias
     * @description
     * Simpler (non-verbose) version of method {@link formatting.name name}, to handle only a regular string-identifier
     * that's mostly used as an SQL alias, i.e. it doesn't support `*` or an array/object of names, which in the context of
     * an SQL alias would be incorrect. However, it supports `.` as name-separator, for simpler escaping of composite names.
     *
     * The surrounding double quotes are not added when the alias uses a simple syntax:
     *  - it is a same-case single word, without spaces
     *  - it can contain underscores, and can even start with them
     *  - it can contain digits and `$`, but cannot start with those
     *
     * The method will automatically split the string with `.`, to support composite SQL names.
     *
     * When formatting a query, a variable makes use of this method via modifier `:alias`. See method {@link formatting.format format}.
     *
     * @param {string|function} name
     * SQL alias name, or a function that returns it.
     *
     * The name must be at least 1 character long. And it can contain `.`, to split into multiple SQL names.
     *
     * If `name` doesn't resolve into a non-empty string, it throws {@link external:TypeError TypeError} = `Invalid sql alias: ...`
     *
     * @returns {string}
     * The SQL alias, properly escaped for compliance with the PostgreSQL standard for $[SQL Names] and identifiers.
     *
     * @see
     * {@link formatting.name name},
     * {@link formatting.format format}
     *
     */
    alias(name) {
        name = resolveFunc(name);
        if (name && typeof name === 'string') {
            return name.split('.')
                .filter(f => f)
                .map(a => {
                    const m = a.match(/^([a-z_][a-z0-9_$]*|[A-Z_][A-Z0-9_$]*)$/);
                    if (m && m[0] === a) {
                        return a;
                    }
                    return `"${a.replace(/"/g, '""')}"`;
                }).join('.');
        }
        throw new TypeError(`Invalid sql alias: ${npm$q.utils.toJson(name)}`);
    },

    /**
     * @method formatting.value
     * @description
     * Represents an open value, one to be formatted according to its type, properly escaped, but without surrounding quotes for text types.
     *
     * When formatting a query, a variable makes use of this method via modifier `:value` or `#`. See method {@link formatting.format format}.
     *
     * @param {value|function} value
     * Value to be converted, or a function that returns the value.
     *
     * If `value` resolves as `null` or `undefined`, it will throw {@link external:TypeError TypeError} = `Open values cannot be null or undefined.`
     *
     * @returns {string}
     * Formatted and properly escaped string, but without surrounding quotes for text types.
     *
     * @see {@link formatting.format format}
     *
     */
    value(value) {
        value = resolveFunc(value);
        if (isNull(value)) {
            throw new TypeError('Open values cannot be null or undefined.');
        }
        return safeText(formatValue({value, fm: fmFlags.raw}));
    },

    /**
     * @method formatting.buffer
     * @description
     * Converts an object of type `Buffer` into a hex string compatible with PostgreSQL type `bytea`.
     *
     * @param {Buffer|function} obj
     * Object to be converted, or a function that returns one.
     *
     * @param {boolean} [raw=false]
     * Indicates when not to wrap the resulting string in quotes.
     *
     * The generated hex string doesn't need to be escaped.
     *
     * @returns {string}
     */
    buffer(obj, raw) {
        obj = resolveFunc(obj);
        if (isNull(obj)) {
            throwIfRaw(raw);
            return 'null';
        }
        if (obj instanceof Buffer) {
            return $to.buffer(obj, raw);
        }
        throw new TypeError(`${wrapText(obj)} is not a Buffer object.`);
    },

    /**
     * @method formatting.bool
     * @description
     * Converts a truthy value into PostgreSQL boolean presentation.
     *
     * @param {boolean|function} value
     * Value to be converted, or a function that returns the value.
     *
     * @returns {string}
     */
    bool(value) {
        value = resolveFunc(value);
        if (isNull(value)) {
            return 'null';
        }
        return $to.bool(value);
    },

    /**
     * @method formatting.date
     * @description
     * Converts a `Date`-type value into PostgreSQL date/time presentation,
     * wrapped in quotes (unless flag `raw` is set).
     *
     * @param {Date|function} d
     * Date object to be converted, or a function that returns one.
     *
     * @param {boolean} [raw=false]
     * Indicates when not to escape the value.
     *
     * @returns {string}
     */
    date(d, raw) {
        d = resolveFunc(d);
        if (isNull(d)) {
            throwIfRaw(raw);
            return 'null';
        }
        if (d instanceof Date) {
            return $to.date(d, raw);
        }
        throw new TypeError(`${wrapText(d)} is not a Date object.`);
    },

    /**
     * @method formatting.number
     * @description
     * Converts a numeric value into its PostgreSQL number presentation, with support
     * for special values of `NaN`, `+Infinity` and `-Infinity`.
     *
     * @param {number|bigint|function} num
     * Number to be converted, or a function that returns one.
     *
     * @returns {string}
     */
    number(num) {
        num = resolveFunc(num);
        if (isNull(num)) {
            return 'null';
        }
        const t = typeof num;
        if (t !== 'number' && t !== 'bigint') {
            throw new TypeError(`${wrapText(num)} is not a number.`);
        }
        return $to.number(num);
    },

    /**
     * @method formatting.array
     * @description
     * Converts an array of values into its PostgreSQL presentation as an Array-Type constructor string: `array[]`.
     *
     * Top-level empty arrays are formatted as literal `{}`, to avoid the necessity of explicit type casting,
     * as the server cannot automatically infer type of empty non-literal array.
     *
     * @param {Array|function} arr
     * Array to be converted, or a function that returns one.
     *
     * @param {{}} [options]
     * Array-Formatting Options.
     *
     * @param {boolean} [options.capSQL=false]
     * When `true`, outputs `ARRAY` instead of `array`.
     *
     * @returns {string}
     */
    array(arr, options) {
        options = assert$b(options, ['capSQL']);
        arr = resolveFunc(arr);
        if (isNull(arr)) {
            return 'null';
        }
        if (Array.isArray(arr)) {
            return $to.array(arr, options);
        }
        throw new TypeError(`${wrapText(arr)} is not an Array object.`);
    },

    /**
     * @method formatting.csv
     * @description
     * Converts a single value or an array of values into a CSV (comma-separated values) string, with all values formatted
     * according to their JavaScript type.
     *
     * When formatting a query, a variable makes use of this method via modifier `:csv` or its alias `:list`.
     *
     * When `values` is an object that's not `null` or `Array`, its properties are enumerated for the actual values.
     *
     * @param {Array|Object|value|function} values
     * Value(s) to be converted, or a function that returns it.
     *
     * @returns {string}
     *
     * @see {@link formatting.format format}
     */
    csv(values) {
        return $to.csv(values);
    },

    /**
     * @method formatting.json
     * @description
     * Converts any value into JSON (includes `BigInt` support), and returns it as a valid string,
     * with single-quote symbols fixed, unless flag `raw` is set.
     *
     * When formatting a query, a variable makes use of this method via modifier `:json`. See method {@link formatting.format format}.
     *
     * @param {*} data
     * Object/value to be converted, or a function that returns it.
     *
     * @param {boolean} [raw=false]
     * Indicates when not to escape the result.
     *
     * @returns {string}
     *
     * @see {@link formatting.format format}
     */
    json(data, raw) {
        data = resolveFunc(data);
        if (isNull(data)) {
            throwIfRaw(raw);
            return 'null';
        }
        return $to.json(data, raw);
    },

    /**
     * @method formatting.func
     * @description
     * Calls the function to get the actual value, and then formats the result according to its type + `raw` flag.
     *
     * @param {function} func
     * Function to be called, with support for nesting.
     *
     * @param {boolean} [raw=false]
     * Indicates when not to escape the result.
     *
     * @param {*} [cc]
     * Calling Context: `this` + the only value to be passed into the function on all nested levels.
     *
     * @returns {string}
     */
    func(func, raw, cc) {
        if (isNull(func)) {
            throwIfRaw(raw);
            return 'null';
        }
        if (typeof func !== 'function') {
            throw new TypeError(`${wrapText(func)} is not a function.`);
        }
        const fm = raw ? fmFlags.raw : null;
        return formatValue({value: resolveFunc(func, cc), fm, cc});
    },

    /**
     * @method formatting.format
     * @description
     * Replaces variables in a string according to the type of `values`:
     *
     * - Replaces `$1` occurrences when `values` is of type `string`, `boolean`, `number`, `bigint`, `Date`, `Buffer` or when it is `null`.
     *
     * - Replaces variables `$1`, `$2`, ...`$100000` when `values` is an array of parameters. It throws a {@link external:RangeError RangeError}
     * when the values or variables are out of range.
     *
     * - Replaces `$*propName*`, where `*` is any of `{}`, `()`, `[]`, `<>`, `//`, when `values` is an object that's not a
     * `Date`, `Buffer`, {@link QueryFile} or `null`. Special property name `this` refers to the formatting object itself,
     *   to be injected as a JSON string. When referencing a property that doesn't exist in the formatting object, it throws
     *   {@link external:Error Error} = `Property 'PropName' doesn't exist`, unless option `partial` is used.
     *
     * - Supports $[Nested Named Parameters] of any depth.
     *
     * By default, each variable is automatically formatted according to its type, unless it is a special variable:
     *
     * - Raw-text variables end with `:raw` or symbol `^`, and prevent escaping the text. Such variables are not
     *   allowed to be `null` or `undefined`, or the method will throw {@link external:TypeError TypeError} = `Values null/undefined cannot be used as raw text.`
     *   - `$1:raw`, `$2:raw`,..., and `$*propName:raw*` (see `*` above)
     *   - `$1^`, `$2^`,..., and `$*propName^*` (see `*` above)
     *
     * - Open-value variables end with `:value` or symbol `#`, to be escaped, but not wrapped in quotes. Such variables are
     *   not allowed to be `null` or `undefined`, or the method will throw {@link external:TypeError TypeError} = `Open values cannot be null or undefined.`
     *   - `$1:value`, `$2:value`,..., and `$*propName:value*` (see `*` above)
     *   - `$1#`, `$2#`,..., and `$*propName#*` (see `*` above)
     *
     * - SQL name variables end with `:name` or symbol `~` (tilde), and provide proper escaping for SQL names/identifiers:
     *   - `$1:name`, `$2:name`,..., and `$*propName:name*` (see `*` above)
     *   - `$1~`, `$2~`,..., and `$*propName~*` (see `*` above)
     *
     * - Modifier `:alias` - non-verbose $[SQL Names] escaping.
     *
     * - JSON override ends with `:json` to format the value of any type as a JSON string
     *
     * - CSV override ends with `:csv` or `:list` to format an array as a properly escaped comma-separated list of values.
     *
     * @param {string|QueryFile|object} query
     * A query string, a {@link QueryFile} or any object that implements $[Custom Type Formatting], to be formatted according to `values`.
     *
     * @param {array|object|value} [values]
     * Formatting parameter(s) / variable value(s).
     *
     * @param {{}} [options]
     * Formatting Options.
     *
     * @param {boolean} [options.capSQL=false]
     * Formats reserved SQL words capitalized. Presently, this only concerns arrays, to output `ARRAY` when required.
     *
     * @param {boolean} [options.partial=false]
     * Indicates that we intend to do only a partial replacement, i.e. throw no error when encountering a variable or
     * property name that's missing within the formatting parameters.
     *
     * **NOTE:** This option has no meaning when option `def` is used.
     *
     * @param {*} [options.def]
     * Sets default value for every variable that's missing, consequently preventing errors when encountering a variable
     * or property name that's missing within the formatting parameters.
     *
     * It can also be set to a function, to be called with two parameters that depend on the type of formatting being used,
     * and to return the actual default value:
     *
     * - For $[Named Parameters] formatting:
     *   - `name` - name of the property missing in the formatting object
     *   - `obj` - the formatting object, and is the same as `this` context
     *
     * - For $[Index Variables] formatting:
     *   - `index` - element's index (starts with 1) that's outside the input array
     *   - `arr` - the formatting/input array, and is the same as `this` context
     *
     *   You can tell which type of call it is by checking the type of the first parameter.
     *
     * @returns {string}
     * Formatted query string.
     *
     * The function will throw an error, if any occurs during formatting.
     */
    format(query, values, options) {
        options = assert$b(options, ['capSQL', 'partial', 'def']);
        const ctf = getCTF(query);
        if (ctf) {
            query = ctf.toPostgres.call(query, query);
        }
        return formatQuery(query, values, false, options);
    }
};

/* Pre-parsed type formatting */
const $to = {
    array(arr, options) {
        return formatArray(arr, options);
    },
    csv(values, options) {
        return formatCSV(resolveFunc(values), options);
    },
    bool(value) {
        return value ? 'true' : 'false';
    },
    buffer(obj, raw) {
        const s = `\\x${obj.toString('hex')}`;
        return raw ? s : wrapText(s);
    },
    date(d, raw) {
        const s = npm$q.pgUtils.prepareValue(d);
        return raw ? s : wrapText(s);
    },
    json(data, raw) {
        const s = npm$q.utils.toJson(data);
        return raw ? s : wrapText(safeText(s));
    },
    number(num) {
        if (typeof num === 'bigint' || Number.isFinite(num)) {
            const s = num.toString();
            return num < 0 ? `(${s})` : s;
        }
        // Converting NaN/+Infinity/-Infinity according to Postgres documentation:
        // http://www.postgresql.org/docs/9.6/static/datatype-numeric.html#DATATYPE-FLOAT
        //
        // NOTE: strings for 'NaN'/'+Infinity'/'-Infinity' are not case-sensitive.
        if (num === Number.POSITIVE_INFINITY) {
            return wrapText('+Infinity');
        }
        if (num === Number.NEGATIVE_INFINITY) {
            return wrapText('-Infinity');
        }
        return wrapText('NaN');
    },
    text(value, raw) {
        return raw ? value : wrapText(safeText(value));
    }
};

var formatting = {
    formatQuery,
    formatEntity,
    resolveFunc,
    as: $as
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {InnerState: InnerState$3} = innerState;
const {QueryFileError} = errors$1;
const {assert: assert$a} = assert$d;
const {ColorConsole: ColorConsole$2} = color;

const npm$p = {
    fs: require$$0$2,
    os: require$$1,
    path: require$$0$1,
    minify: lib$2,
    utils: utils$4,
    formatting: formatting
};

const file$query = Symbol('QueryFile.query');

/**
 * @class QueryFile
 * @description
 *
 * Represents an external SQL file. The type is available from the library's root: `pgp.QueryFile`.
 *
 * Reads a file with SQL and prepares it for execution, also parses and minifies it, if required.
 * The SQL can be of any complexity, with both single and multi-line comments.
 *
 * The type can be used in place of the `query` parameter, with any query method directly, plus as `text` in {@link PreparedStatement}
 * and {@link ParameterizedQuery}.
 *
 * It never throws any error, leaving it for query methods to reject with {@link errors.QueryFileError QueryFileError}.
 *
 * **IMPORTANT:** You should only create a single reusable object per file, in order to avoid repeated file reads,
 * as the IO is a very expensive resource. If you do not follow it, you will be seeing the following warning:
 * `Creating a duplicate QueryFile object for the same file`, which signals a bad-use pattern.
 *
 * @param {string} file
 * Path to the SQL file with the query, either absolute or relative to the application's entry point file.
 *
 * If there is any problem reading the file, it will be reported when executing the query.
 *
 * @param {QueryFile.Options} [options]
 * Set of configuration options, as documented by {@link QueryFile.Options}.
 *
 * @returns {QueryFile}
 *
 * @see
 * {@link errors.QueryFileError QueryFileError},
 * {@link QueryFile#toPostgres toPostgres}
 *
 * @example
 * // File sql.js
 *
 * // Proper way to organize an sql provider:
 * //
 * // - have all sql files for Users in ./sql/users
 * // - have all sql files for Products in ./sql/products
 * // - have your sql provider module as ./sql/index.js
 *
 * const {QueryFile} = require('pg-promise');
 * const {join: joinPath} = require('path');
 *
 * // Helper for linking to external query files:
 * function sql(file) {
 *     const fullPath = joinPath(__dirname, file); // generating full path;
 *     return new QueryFile(fullPath, {minify: true});
 * }
 *
 * module.exports = {
 *     // external queries for Users:
 *     users: {
 *         add: sql('users/create.sql'),
 *         search: sql('users/search.sql'),
 *         report: sql('users/report.sql'),
 *     },
 *     // external queries for Products:
 *     products: {
 *         add: sql('products/add.sql'),
 *         quote: sql('products/quote.sql'),
 *         search: sql('products/search.sql'),
 *     }
 * };
 *
 * @example
 * // Testing our SQL provider
 *
 * const db = require('./db'); // our database module;
 * const {users: sql} = require('./sql'); // sql for users;
 *
 * module.exports = {
 *     addUser: (name, age) => db.none(sql.add, [name, age]),
 *     findUser: name => db.any(sql.search, name)
 * };
 *
 */
let QueryFile$5 = class QueryFile extends InnerState$3 {

    constructor(file, options) {

        let filePath = file;

        options = assert$a(options, {
            debug: npm$p.utils.isDev(),
            minify: (options && options.compress && options.minify === undefined) ? true : undefined,
            compress: undefined,
            params: undefined,
            noWarnings: undefined
        });

        if (npm$p.utils.isText(filePath) && !npm$p.path.isAbsolute(filePath)) {
            filePath = npm$p.path.join(npm$p.utils.startDir, filePath);
        }

        const {usedPath} = QueryFile.instance;

        // istanbul ignore next:
        if (!options.noWarnings) {
            if (filePath in usedPath) {
                usedPath[filePath]++;
                ColorConsole$2.warn(`WARNING: Creating a duplicate QueryFile object for the same file - \n    ${filePath}\n${npm$p.utils.getLocalStack(2, 3)}\n`);
            } else {
                usedPath[filePath] = 0;
            }
        }

        const _inner = {
            file,
            filePath,
            options,
            sql: undefined,
            error: undefined,
            ready: undefined,
            modTime: undefined
        };

        super(_inner);

        this.prepare();
    }

    /**
     * Global instance of the file-path repository.
     *
     * @return {{usedPath: {}}}
     */
    static get instance() {
        const s = Symbol.for('pgPromiseQueryFile');
        let scope = commonjsGlobal[s];
        if (!scope) {
            scope = {
                usedPath: {} // used-path look-up dictionary
            };
            commonjsGlobal[s] = scope;
        }
        return scope;
    }

    /**
     * @name QueryFile#Symbol(QueryFile.$query)
     * @type {string}
     * @default undefined
     * @readonly
     * @private
     * @summary Prepared query string.
     * @description
     * When property {@link QueryFile#error error} is set, the query is `undefined`.
     *
     * **IMPORTANT:** This property is for internal use by the library only, never use this
     * property directly from your code.
     */
    get [file$query]() {
        return this._inner.sql;
    }

    /**
     * @name QueryFile#error
     * @type {errors.QueryFileError}
     * @default undefined
     * @readonly
     * @description
     * When in an error state, it is set to a {@link errors.QueryFileError QueryFileError} object. Otherwise, it is `undefined`.
     */
    get error() {
        return this._inner.error;
    }

    /**
     * @name QueryFile#file
     * @type {string}
     * @readonly
     * @description
     * File name that was passed into the constructor.
     *
     * This property is primarily for internal use by the library.
     */
    get file() {
        return this._inner.file;
    }

    /**
     * @name QueryFile#options
     * @type {QueryFile.Options}
     * @readonly
     * @description
     * Set of options, as configured during the object's construction.
     *
     * This property is primarily for internal use by the library.
     */
    get options() {
        return this._inner.options;
    }

    /**
     * @summary Prepares the query for execution.
     * @description
     * If the query hasn't been prepared yet, it will read the file and process the content according
     * to the parameters passed into the constructor.
     *
     * This method is primarily for internal use by the library.
     *
     * @param {boolean} [throwErrors=false]
     * Throw any error encountered.
     */
    prepare(throwErrors) {
        const i = this._inner, options = i.options;
        let lastMod;
        if (options.debug && i.ready) {
            try {
                lastMod = npm$p.fs.statSync(i.filePath).mtime.getTime();
                // istanbul ignore if;
                if (lastMod === i.modTime) {
                    return;
                }
                i.ready = false;
            } catch (e) {
                i.sql = undefined;
                i.ready = false;
                i.error = e;
                if (throwErrors) {
                    throw i.error;
                }
                return;
            }
        }
        if (i.ready) {
            return;
        }
        try {
            i.sql = npm$p.fs.readFileSync(i.filePath, 'utf8');
            i.modTime = lastMod || npm$p.fs.statSync(i.filePath).mtime.getTime();
            if (options.minify && options.minify !== 'after') {
                i.sql = npm$p.minify(i.sql, {compress: options.compress});
            }
            if (options.params !== undefined) {
                i.sql = npm$p.formatting.as.format(i.sql, options.params, {partial: true});
            }
            if (options.minify && options.minify === 'after') {
                i.sql = npm$p.minify(i.sql, {compress: options.compress});
            }
            i.ready = true;
            i.error = undefined;
        } catch (e) {
            i.sql = undefined;
            i.error = new QueryFileError(e, this);
            if (throwErrors) {
                throw i.error;
            }
        }
    }

};

// Hiding the query as a symbol within the type,
// to make it even more difficult to misuse it:
QueryFile$5.$query = file$query;

/**
 * @method QueryFile#toPostgres
 * @description
 * $[Custom Type Formatting], based on $[Symbolic CTF], i.e. the actual method is available only via {@link external:Symbol Symbol}:
 *
 * ```js
 * const {toPostgres} = pgp.as.ctf; // Custom Type Formatting symbols namespace
 * const query = qf[toPostgres](); // qf = an object of type QueryFile
 * ```
 *
 * This is a raw formatting type (`rawType = true`), i.e. when used as a query-formatting parameter, type `QueryFile` injects SQL as raw text.
 *
 * If you need to support type `QueryFile` outside of query methods, this is the only safe way to get the most current SQL.
 * And you would want to use this method dynamically, as it reloads the SQL automatically, if option `debug` is set.
 * See {@link QueryFile.Options Options}.
 *
 * @param {QueryFile} [self]
 * Optional self-reference, for ES6 arrow functions.
 *
 * @returns {string}
 * SQL string from the file, according to the {@link QueryFile.Options options} specified.
 *
 */
QueryFile$5.prototype[npm$p.formatting.as.ctf.toPostgres] = function (self) {
    self = this instanceof QueryFile$5 && this || self;
    self.prepare(true);
    return self[QueryFile$5.$query];
};

QueryFile$5.prototype[npm$p.formatting.as.ctf.rawType] = true; // use as pre-formatted

/**
 * @method QueryFile#toString
 * @description
 * Creates a well-formatted multi-line string that represents the object's current state.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
QueryFile$5.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    const gap = npm$p.utils.messageGap(level + 1);
    const lines = [
        'QueryFile {'
    ];
    this.prepare();
    lines.push(gap + 'file: "' + this.file + '"');
    lines.push(gap + 'options: ' + npm$p.utils.toJson(this.options));
    if (this.error) {
        lines.push(gap + 'error: ' + this.error.toString(level + 1));
    } else {
        lines.push(gap + 'query: "' + this[QueryFile$5.$query] + '"');
    }
    lines.push(npm$p.utils.messageGap(level) + '}');
    return lines.join(npm$p.os.EOL);
};

npm$p.utils.addInspection(QueryFile$5, function () {
    return this.toString();
});

var queryFile = {QueryFile: QueryFile$5};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {ServerFormatting: ServerFormatting$3} = serverFormatting;
const {PreparedStatementError} = errors$1;
const {QueryFile: QueryFile$4} = queryFile;
const {assert: assert$9} = assert$d;

const npm$o = {
    EOL: require$$1.EOL,
    utils: utils$4
};

/**
 * @class PreparedStatement
 * @description
 * Constructs a new $[Prepared Statement] object. All properties can also be set after the object's construction.
 *
 * This type extends the basic `{name, text, values}` object, i.e. when the basic object is used
 * with a query method, a new {@link PreparedStatement} object is created in its place.
 *
 * The type can be used in place of the `query` parameter, with any query method directly.
 *
 * The type is available from the library's root: `pgp.PreparedStatement`.
 *
 * @param {Object} [options]
 * Object configuration options / properties.
 *
 * @param {string} [options.name] - See property {@link PreparedStatement#name name}.
 * @param {string|QueryFile} [options.text] - See property {@link PreparedStatement#text text}.
 * @param {array} [options.values] - See property {@link PreparedStatement#values values}.
 * @param {boolean} [options.binary] - See property {@link PreparedStatement#binary binary}.
 * @param {string} [options.rowMode] - See property {@link PreparedStatement#rowMode rowMode}.
 * @param {number} [options.rows] - See property {@link PreparedStatement#rows rows}.
 * @param {ITypes} [options.types] - See property {@link PreparedStatement#types types}.
 *
 * @returns {PreparedStatement}
 *
 * @see
 * {@link errors.PreparedStatementError PreparedStatementError},
 * {@link http://www.postgresql.org/docs/9.6/static/sql-prepare.html PostgreSQL Prepared Statements}
 *
 * @example
 *
 * const {PreparedStatement: PS} = require('pg-promise');
 *
 * // Creating a complete Prepared Statement with parameters:
 * const findUser = new PS({name: 'find-user', text: 'SELECT * FROM Users WHERE id = $1', values: [123]});
 *
 * db.one(findUser)
 *     .then(user => {
 *         // user found;
 *     })
 *     .catch(error => {
 *         // error;
 *     });
 *
 * @example
 *
 * const {PreparedStatement: PS} = require('pg-promise');
 *
 * // Creating a reusable Prepared Statement without values:
 * const addUser = new PS({name: 'add-user', text: 'INSERT INTO Users(name, age) VALUES($1, $2)'});
 *
 * // setting values explicitly:
 * addUser.values = ['John', 30];
 *
 * db.none(addUser)
 *     .then(() => {
 *         // user added;
 *     })
 *     .catch(error => {
 *         // error;
 *     });
 *
 * // setting values implicitly, by passing them into the query method:
 * db.none(addUser, ['Mike', 25])
 *     .then(() => {
 *         // user added;
 *     })
 *     .catch(error => {
 *         // error;
 *     });
 */
let PreparedStatement$3 = class PreparedStatement extends ServerFormatting$3 {
    constructor(options) {
        options = assert$9(options, ['name', 'text', 'values', 'binary', 'rowMode', 'rows', 'types']);
        super(options);
    }

    /**
     * @name PreparedStatement#name
     * @type {string}
     * @description
     * An arbitrary name given to this particular prepared statement. It must be unique within a single session and is
     * subsequently used to execute or deallocate a previously prepared statement.
     */
    get name() {
        return this._inner.options.name;
    }

    set name(value) {
        const _i = this._inner;
        if (value !== _i.options.name) {
            _i.options.name = value;
            _i.changed = true;
        }
    }

    /**
     * @name PreparedStatement#rows
     * @type {number}
     * @description
     * Number of rows to return at a time from a Prepared Statement's portal.
     * The default is 0, which means that all rows must be returned at once.
     */
    get rows() {
        return this._inner.options.rows;
    }

    set rows(value) {
        const _i = this._inner;
        if (value !== _i.options.rows) {
            _i.options.rows = value;
            _i.changed = true;
        }
    }
};

/**
 * @method PreparedStatement#parse
 * @description
 * Parses the current object and returns a simple `{name, text, values}`, if successful,
 * or else it returns a {@link errors.PreparedStatementError PreparedStatementError} object.
 *
 * This method is primarily for internal use by the library.
 *
 * @returns {{name, text, values}|errors.PreparedStatementError}
 */
PreparedStatement$3.prototype.parse = function () {

    const _i = this._inner, options = _i.options;

    const qf = options.text instanceof QueryFile$4 ? options.text : null;

    if (!_i.changed && !qf) {
        return _i.target;
    }

    const errors = [], values = _i.target.values;
    _i.target = {
        name: options.name,
        text: options.text
    };
    _i.changed = true;
    _i.currentError = undefined;

    if (!npm$o.utils.isText(_i.target.name)) {
        errors.push('Property \'name\' must be a non-empty text string.');
    }

    if (qf) {
        qf.prepare();
        if (qf.error) {
            errors.push(qf.error);
        } else {
            _i.target.text = qf[QueryFile$4.$query];
        }
    }
    if (!npm$o.utils.isText(_i.target.text)) {
        errors.push('Property \'text\' must be a non-empty text string.');
    }

    if (!npm$o.utils.isNull(values)) {
        _i.target.values = values;
    }

    if (options.binary !== undefined) {
        _i.target.binary = !!options.binary;
    }

    if (options.rowMode !== undefined) {
        _i.target.rowMode = options.rowMode;
    }

    if (options.rows !== undefined) {
        _i.target.rows = options.rows;
    }

    if (options.types !== undefined) {
        _i.target.types = options.types;
    }

    if (errors.length) {
        return _i.currentError = new PreparedStatementError(errors[0], _i.target);
    }

    _i.changed = false;

    return _i.target;
};

/**
 * @method PreparedStatement#toString
 * @description
 * Creates a well-formatted multi-line string that represents the object's current state.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
PreparedStatement$3.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    const gap = npm$o.utils.messageGap(level + 1);
    const ps = this.parse();
    const lines = [
        'PreparedStatement {',
        gap + 'name: ' + npm$o.utils.toJson(this.name)
    ];
    if (npm$o.utils.isText(ps.text)) {
        lines.push(gap + 'text: "' + ps.text + '"');
    }
    if (this.values !== undefined) {
        lines.push(gap + 'values: ' + npm$o.utils.toJson(this.values));
    }
    if (this.binary !== undefined) {
        lines.push(gap + 'binary: ' + npm$o.utils.toJson(this.binary));
    }
    if (this.rowMode !== undefined) {
        lines.push(gap + 'rowMode: ' + npm$o.utils.toJson(this.rowMode));
    }
    if (this.rows !== undefined) {
        lines.push(gap + 'rows: ' + npm$o.utils.toJson(this.rows));
    }
    if (this.error) {
        lines.push(gap + 'error: ' + this.error.toString(level + 1));
    }
    lines.push(npm$o.utils.messageGap(level) + '}');
    return lines.join(npm$o.EOL);
};

var preparedStatement = {PreparedStatement: PreparedStatement$3};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {ServerFormatting: ServerFormatting$2} = serverFormatting;
const {ParameterizedQueryError} = errors$1;
const {QueryFile: QueryFile$3} = queryFile;
const {assert: assert$8} = assert$d;

const npm$n = {
    EOL: require$$1.EOL,
    utils: utils$4
};

/**
 * @class ParameterizedQuery
 * @description
 * Constructs a new {@link ParameterizedQuery} object. All properties can also be set after the object's construction.
 *
 * This type extends the basic `{text, values}` object, i.e. when the basic object is used with a query method,
 * a new {@link ParameterizedQuery} object is created in its place.
 *
 * The type can be used in place of the `query` parameter, with any query method directly.
 *
 * The type is available from the library's root: `pgp.ParameterizedQuery`.
 *
 * @param {string|QueryFile|Object} [options]
 * Object configuration options / properties.
 *
 * @param {string|QueryFile} [options.text] - See property {@link ParameterizedQuery#text text}.
 * @param {array} [options.values] - See property {@link ParameterizedQuery#values values}.
 * @param {boolean} [options.binary] - See property {@link ParameterizedQuery#binary binary}.
 * @param {string} [options.rowMode] - See property {@link ParameterizedQuery#rowMode rowMode}.
 * @param {ITypes} [options.types] - See property {@link ParameterizedQuery#types types}.
 *
 * @returns {ParameterizedQuery}
 *
 * @see
 * {@link errors.ParameterizedQueryError ParameterizedQueryError}
 *
 * @example
 *
 * const {ParameterizedQuery: PQ} = require('pg-promise');
 *
 * // Creating a complete Parameterized Query with parameters:
 * const findUser = new PQ({text: 'SELECT * FROM Users WHERE id = $1', values: [123]});
 *
 * db.one(findUser)
 *     .then(user => {
 *         // user found;
 *     })
 *     .catch(error => {
 *         // error;
 *     });
 *
 * @example
 *
 * const {ParameterizedQuery: PQ} = require('pg-promise');
 *
 * // Creating a reusable Parameterized Query without values:
 * const addUser = new PQ('INSERT INTO Users(name, age) VALUES($1, $2)');
 *
 * // setting values explicitly:
 * addUser.values = ['John', 30];
 *
 * db.none(addUser)
 *     .then(() => {
 *         // user added;
 *     })
 *     .catch(error=> {
 *         // error;
 *     });
 *
 * // setting values implicitly, by passing them into the query method:
 * db.none(addUser, ['Mike', 25])
 *     .then(() => {
 *         // user added;
 *     })
 *     .catch(error=> {
 *         // error;
 *     });
 */
let ParameterizedQuery$3 = class ParameterizedQuery extends ServerFormatting$2 {
    constructor(options) {
        if (typeof options === 'string' || options instanceof QueryFile$3) {
            options = {
                text: options
            };
        } else {
            options = assert$8(options, ['text', 'values', 'binary', 'rowMode', 'types']);
        }
        super(options);
    }
};

/**
 * @method ParameterizedQuery#parse
 * @description
 * Parses the current object and returns a simple `{text, values}`, if successful,
 * or else it returns a {@link errors.ParameterizedQueryError ParameterizedQueryError} object.
 *
 * This method is primarily for internal use by the library.
 *
 * @returns {{text, values}|errors.ParameterizedQueryError}
 */
ParameterizedQuery$3.prototype.parse = function () {

    const _i = this._inner, options = _i.options;
    const qf = options.text instanceof QueryFile$3 ? options.text : null;

    if (!_i.changed && !qf) {
        return _i.target;
    }

    const errors = [], values = _i.target.values;
    _i.target = {
        text: options.text
    };
    _i.changed = true;
    _i.currentError = undefined;

    if (qf) {
        qf.prepare();
        if (qf.error) {
            errors.push(qf.error);
        } else {
            _i.target.text = qf[QueryFile$3.$query];
        }
    }

    if (!npm$n.utils.isText(_i.target.text)) {
        errors.push('Property \'text\' must be a non-empty text string.');
    }

    if (!npm$n.utils.isNull(values)) {
        _i.target.values = values;
    }

    if (options.binary !== undefined) {
        _i.target.binary = !!options.binary;
    }

    if (options.rowMode !== undefined) {
        _i.target.rowMode = options.rowMode;
    }

    if (options.types !== undefined) {
        _i.target.types = options.types;
    }

    if (errors.length) {
        return _i.currentError = new ParameterizedQueryError(errors[0], _i.target);
    }

    _i.changed = false;

    return _i.target;
};

/**
 * @method ParameterizedQuery#toString
 * @description
 * Creates a well-formatted multi-line string that represents the object's current state.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
ParameterizedQuery$3.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    const gap = npm$n.utils.messageGap(level + 1);
    const pq = this.parse();
    const lines = [
        'ParameterizedQuery {'
    ];
    if (npm$n.utils.isText(pq.text)) {
        lines.push(gap + 'text: "' + pq.text + '"');
    }
    if (this.values !== undefined) {
        lines.push(gap + 'values: ' + npm$n.utils.toJson(this.values));
    }
    if (this.binary !== undefined) {
        lines.push(gap + 'binary: ' + npm$n.utils.toJson(this.binary));
    }
    if (this.rowMode !== undefined) {
        lines.push(gap + 'rowMode: ' + npm$n.utils.toJson(this.rowMode));
    }
    if (this.error !== undefined) {
        lines.push(gap + 'error: ' + this.error.toString(level + 1));
    }
    lines.push(npm$n.utils.messageGap(level) + '}');
    return lines.join(npm$n.EOL);
};

var parameterizedQuery = {ParameterizedQuery: ParameterizedQuery$3};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {ServerFormatting: ServerFormatting$1} = serverFormatting;
const {PreparedStatement: PreparedStatement$2} = preparedStatement;
const {ParameterizedQuery: ParameterizedQuery$2} = parameterizedQuery;

var types = {
    ServerFormatting: ServerFormatting$1,
    PreparedStatement: PreparedStatement$2,
    ParameterizedQuery: ParameterizedQuery$2
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

/**
 * @enum {number}
 * @alias queryResult
 * @readonly
 * @description
 * **Query Result Mask**
 *
 * Binary mask that represents the number of rows expected from a query method,
 * used by generic {@link Database#query query} method, plus {@link Database#func func}.
 *
 * The mask is always the last optional parameter, which defaults to `queryResult.any`.
 *
 * Any combination of flags is supported, except for `one + many`.
 *
 * The type is available from the library's root: `pgp.queryResult`.
 *
 * @see {@link Database#query Database.query}, {@link Database#func Database.func}
 */
const queryResult$3 = {
    /** Single row is expected, to be resolved as a single row-object. */
    one: 1,
    /** One or more rows expected, to be resolved as an array, with at least 1 row-object. */
    many: 2,
    /** Expecting no rows, to be resolved with `null`. */
    none: 4,
    /** `many|none` - any result is expected, to be resolved with an array of rows-objects. */
    any: 6
};

var queryResult_1 = {queryResult: queryResult$3};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {PromiseAdapter: PromiseAdapter$2} = promiseAdapter;

//////////////////////////////////////////
// Parses and validates a promise library;
function parse(pl) {

    let promise;
    if (pl instanceof PromiseAdapter$2) {
        promise = function (func) {
            return pl.create(func);
        };
        promise.resolve = pl.resolve;
        promise.reject = pl.reject;
        promise.all = pl.all;
        return promise;
    }
    const t = typeof pl;
    if (t === 'function' || t === 'object') {
        const Root = typeof pl.Promise === 'function' ? pl.Promise : pl;
        promise = function (func) {
            return new Root(func);
        };
        promise.resolve = Root.resolve;
        promise.reject = Root.reject;
        promise.all = Root.all;
        if (typeof promise.resolve === 'function' &&
            typeof promise.reject === 'function' &&
            typeof promise.all === 'function') {
            return promise;
        }
    }

    throw new TypeError('Invalid promise library specified.');
}

function parsePromise$1(promiseLib) {
    const result = {promiseLib};
    if (promiseLib) {
        result.promise = parse(promiseLib);
    } else {
        result.promise = parse(Promise);
        result.promiseLib = Promise;
    }
    return result;
}

var promiseParser = {parsePromise: parsePromise$1};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {InnerState: InnerState$2} = innerState;
const {assert: assert$7} = assert$d;

const npm$m = {
    os: require$$1,
    utils: utils$4,
    formatting: formatting,
    patterns: patterns
};

/**
 *
 * @class helpers.Column
 * @description
 *
 * Read-only structure with details for a single column. Used primarily by {@link helpers.ColumnSet ColumnSet}.
 *
 * The class parses details into a template, to be used for query generation.
 *
 * @param {string|helpers.ColumnConfig} col
 * Column details, depending on the type.
 *
 * When it is a string, it is expected to contain a name for both the column and the source property, assuming that the two are the same.
 * The name must adhere to JavaScript syntax for variable names. The name can be appended with any format modifier as supported by
 * {@link formatting.format as.format} (`^`, `~`, `#`, `:csv`, `:list`, `:json`, `:alias`, `:name`, `:raw`, `:value`), which is then removed from the name and put
 * into property `mod`. If the name starts with `?`, it is removed, while setting flag `cnd` = `true`.
 *
 * If the string doesn't adhere to the above requirements, the method will throw {@link external:TypeError TypeError} = `Invalid column syntax`.
 *
 * When `col` is a simple {@link helpers.ColumnConfig ColumnConfig}-like object, it is used as an input configurator to set all the properties
 * of the class.
 *
 * @property {string} name
 * Destination column name + source property name (if `prop` is skipped). The name must adhere to JavaScript syntax for variables,
 * unless `prop` is specified, in which case `name` represents only the column name, and therefore can be any non-empty string.
 *
 * @property {string} [prop]
 * Source property name, if different from the column's name. It must adhere to JavaScript syntax for variables.
 *
 * It is ignored when it is the same as `name`.
 *
 * @property {string} [mod]
 * Formatting modifier, as supported by method {@link formatting.format as.format}: `^`, `~`, `#`, `:csv`, `:list`, `:json`, `:alias`, `:name`, `:raw`, `:value`.
 *
 * @property {string} [cast]
 * Server-side type casting, without `::` in front.
 *
 * @property {boolean} [cnd]
 * Conditional column flag.
 *
 * Used by methods {@link helpers.update update} and {@link helpers.sets sets}, ignored by methods {@link helpers.insert insert} and
 * {@link helpers.values values}. It indicates that the column is reserved for a `WHERE` condition, not to be set or updated.
 *
 * It can be set from a string initialization, by adding `?` in front of the name.
 *
 * @property {*} [def]
 * Default value for the property, to be used only when the source object doesn't have the property.
 * It is ignored when property `init` is set.
 *
 * @property {helpers.initCB} [init]
 * Override callback for the value.
 *
 * @property {helpers.skipCB} [skip]
 * An override for skipping columns dynamically.
 *
 * Used by methods {@link helpers.update update} (for a single object) and {@link helpers.sets sets}, ignored by methods
 * {@link helpers.insert insert} and {@link helpers.values values}.
 *
 * It is also ignored when conditional flag `cnd` is set.
 *
 * @returns {helpers.Column}
 *
 * @see
 * {@link helpers.ColumnConfig ColumnConfig},
 * {@link helpers.Column#castText castText},
 * {@link helpers.Column#escapedName escapedName},
 * {@link helpers.Column#variable variable}
 *
 * @example
 *
 * const pgp = require('pg-promise')({
 *     capSQL: true // if you want all generated SQL capitalized
 * });
 *
 * const {Column} = pgp.helpers;
 *
 * // creating a column from just a name:
 * const col1 = new Column('colName');
 * console.log(col1);
 * //=>
 * // Column {
 * //    name: "colName"
 * // }
 *
 * // creating a column from a name + modifier:
 * const col2 = new Column('colName:csv');
 * console.log(col2);
 * //=>
 * // Column {
 * //    name: "colName"
 * //    mod: ":csv"
 * // }
 *
 * // creating a column from a configurator:
 * const col3 = new Column({
 *     name: 'colName', // required
 *     prop: 'propName', // optional
 *     mod: '^', // optional
 *     def: 123 // optional
 * });
 * console.log(col3);
 * //=>
 * // Column {
 * //    name: "colName"
 * //    prop: "propName"
 * //    mod: "^"
 * //    def: 123
 * // }
 *
 */
let Column$2 = class Column extends InnerState$2 {

    constructor(col) {
        super();

        if (typeof col === 'string') {
            const info = parseColumn(col);
            this.name = info.name;
            if ('mod' in info) {
                this.mod = info.mod;
            }
            if ('cnd' in info) {
                this.cnd = info.cnd;
            }
        } else {
            col = assert$7(col, ['name', 'prop', 'mod', 'cast', 'cnd', 'def', 'init', 'skip']);
            if ('name' in col) {
                if (!npm$m.utils.isText(col.name)) {
                    throw new TypeError(`Invalid 'name' value: ${npm$m.utils.toJson(col.name)}. A non-empty string was expected.`);
                }
                if (npm$m.utils.isNull(col.prop) && !isValidVariable(col.name)) {
                    throw new TypeError(`Invalid 'name' syntax: ${npm$m.utils.toJson(col.name)}.`);
                }
                this.name = col.name; // column name + property name (if 'prop' isn't specified)

                if (!npm$m.utils.isNull(col.prop)) {
                    if (!npm$m.utils.isText(col.prop)) {
                        throw new TypeError(`Invalid 'prop' value: ${npm$m.utils.toJson(col.prop)}. A non-empty string was expected.`);
                    }
                    if (!isValidVariable(col.prop)) {
                        throw new TypeError(`Invalid 'prop' syntax: ${npm$m.utils.toJson(col.prop)}.`);
                    }
                    if (col.prop !== col.name) {
                        // optional property name, if different from the column's name;
                        this.prop = col.prop;
                    }
                }
                if (!npm$m.utils.isNull(col.mod)) {
                    if (typeof col.mod !== 'string' || !isValidMod(col.mod)) {
                        throw new TypeError(`Invalid 'mod' value: ${npm$m.utils.toJson(col.mod)}.`);
                    }
                    this.mod = col.mod; // optional format modifier;
                }
                if (!npm$m.utils.isNull(col.cast)) {
                    this.cast = parseCast(col.cast); // optional SQL type casting
                }
                if ('cnd' in col) {
                    this.cnd = !!col.cnd;
                }
                if ('def' in col) {
                    this.def = col.def; // optional default
                }
                if (typeof col.init === 'function') {
                    this.init = col.init; // optional value override (overrides 'def' also)
                }
                if (typeof col.skip === 'function') {
                    this.skip = col.skip;
                }
            } else {
                throw new TypeError('Invalid column details.');
            }
        }

        const variable = '${' + (this.prop || this.name) + (this.mod || '') + '}';
        const castText = this.cast ? ('::' + this.cast) : '';
        const escapedName = npm$m.formatting.as.name(this.name);

        this.extendState({variable, castText, escapedName});
        Object.freeze(this);
    }

    /**
     * @name helpers.Column#variable
     * @type string
     * @readonly
     * @description
     * Full-syntax formatting variable, ready for direct use in query templates.
     *
     * @example
     *
     * const cs = new ColumnSet([
     *     'id',
     *     'coordinate:json',
     *     {
     *         name: 'places',
     *         mod: ':csv',
     *         cast: 'int[]'
     *     }
     * ]);
     *
     * // cs.columns[0].variable = ${id}
     * // cs.columns[1].variable = ${coordinate:json}
     * // cs.columns[2].variable = ${places:csv}::int[]
     */
    get variable() {
        return this._inner.variable;
    }

    /**
     * @name helpers.Column#castText
     * @type string
     * @readonly
     * @description
     * Full-syntax sql type casting, if there is any, or else an empty string.
     */
    get castText() {
        return this._inner.castText;
    }

    /**
     * @name helpers.Column#escapedName
     * @type string
     * @readonly
     * @description
     * Escaped name of the column, ready to be injected into queries directly.
     *
     */
    get escapedName() {
        return this._inner.escapedName;
    }

};

function parseCast(name) {
    if (typeof name === 'string') {
        const s = name.replace(/^[:\s]*|\s*$/g, '');
        if (s) {
            return s;
        }
    }
    throw new TypeError(`Invalid 'cast' value: ${npm$m.utils.toJson(name)}.`);
}

function parseColumn(name) {
    const m = name.match(npm$m.patterns.validColumn);
    if (m && m[0] === name) {
        const res = {};
        if (name[0] === '?') {
            res.cnd = true;
            name = name.substring(1);
        }
        const mod = name.match(npm$m.patterns.hasValidModifier);
        if (mod) {
            res.name = name.substring(0, mod.index);
            res.mod = mod[0];
        } else {
            res.name = name;
        }
        return res;
    }
    throw new TypeError(`Invalid column syntax: ${npm$m.utils.toJson(name)}.`);
}

function isValidMod(mod) {
    return npm$m.patterns.validModifiers.indexOf(mod) !== -1;
}

function isValidVariable(name) {
    const m = name.match(npm$m.patterns.validVariable);
    return !!m && m[0] === name;
}

/**
 * @method helpers.Column#toString
 * @description
 * Creates a well-formatted multi-line string that represents the object.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
Column$2.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    const gap0 = npm$m.utils.messageGap(level),
        gap1 = npm$m.utils.messageGap(level + 1),
        lines = [
            gap0 + 'Column {',
            gap1 + 'name: ' + npm$m.utils.toJson(this.name)
        ];
    if ('prop' in this) {
        lines.push(gap1 + 'prop: ' + npm$m.utils.toJson(this.prop));
    }
    if ('mod' in this) {
        lines.push(gap1 + 'mod: ' + npm$m.utils.toJson(this.mod));
    }
    if ('cast' in this) {
        lines.push(gap1 + 'cast: ' + npm$m.utils.toJson(this.cast));
    }
    if ('cnd' in this) {
        lines.push(gap1 + 'cnd: ' + npm$m.utils.toJson(this.cnd));
    }
    if ('def' in this) {
        lines.push(gap1 + 'def: ' + npm$m.utils.toJson(this.def));
    }
    if ('init' in this) {
        lines.push(gap1 + 'init: [Function]');
    }
    if ('skip' in this) {
        lines.push(gap1 + 'skip: [Function]');
    }
    lines.push(gap0 + '}');
    return lines.join(npm$m.os.EOL);
};

npm$m.utils.addInspection(Column$2, function () {
    return this.toString();
});

/**
 * @typedef helpers.ColumnConfig
 * @description
 * A simple structure with column details, to be passed into the {@link helpers.Column Column} constructor for initialization.
 *
 * @property {string} name
 * Destination column name + source property name (if `prop` is skipped). The name must adhere to JavaScript syntax for variables,
 * unless `prop` is specified, in which case `name` represents only the column name, and therefore can be any non-empty string.
 *
 * @property {string} [prop]
 * Source property name, if different from the column's name. It must adhere to JavaScript syntax for variables.
 *
 * It is ignored when it is the same as `name`.
 *
 * @property {string} [mod]
 * Formatting modifier, as supported by method {@link formatting.format as.format}: `^`, `~`, `#`, `:csv`, `:list`, `:json`, `:alias`, `:name`, `:raw`, `:value`.
 *
 * @property {string} [cast]
 * Server-side type casting. Leading `::` is allowed, but not needed (automatically removed when specified).
 *
 * @property {boolean} [cnd]
 * Conditional column flag.
 *
 * Used by methods {@link helpers.update update} and {@link helpers.sets sets}, ignored by methods {@link helpers.insert insert} and
 * {@link helpers.values values}. It indicates that the column is reserved for a `WHERE` condition, not to be set or updated.
 *
 * It can be set from a string initialization, by adding `?` in front of the name.
 *
 * @property {*} [def]
 * Default value for the property, to be used only when the source object doesn't have the property.
 * It is ignored when property `init` is set.
 *
 * @property {helpers.initCB} [init]
 * Override callback for the value.
 *
 * @property {helpers.skipCB} [skip]
 * An override for skipping columns dynamically.
 *
 * Used by methods {@link helpers.update update} (for a single object) and {@link helpers.sets sets}, ignored by methods
 * {@link helpers.insert insert} and {@link helpers.values values}.
 *
 * It is also ignored when conditional flag `cnd` is set.
 *
 */

/**
 * @callback helpers.initCB
 * @description
 * A callback function type used by parameter `init` within {@link helpers.ColumnConfig ColumnConfig}.
 *
 * It works as an override for the corresponding property value in the `source` object.
 *
 * The function is called with `this` set to the `source` object.
 *
 * @param {*} col
 * Column-to-property descriptor.
 *
 * @param {object} col.source
 * The source object, equals to `this` that's passed into the function.
 *
 * @param {string} col.name
 * Resolved name of the property within the `source` object, i.e. the value of `name` when `prop` is not used
 * for the column, or the value of `prop` when it is specified.
 *
 * @param {*} col.value
 *
 * Property value, set to one of the following:
 *
 * - Value of the property within the `source` object (`value` = `source[name]`), if the property exists
 * - If the property doesn't exist and `def` is set in the column, then `value` is set to the value of `def`
 * - If the property doesn't exist and `def` is not set in the column, then `value` is set to `undefined`
 *
 * @param {boolean} col.exists
 * Indicates whether the property exists in the `source` object (`exists = name in source`).
 *
 * @returns {*}
 * The new value to be used for the corresponding column.
 */

/**
 * @callback helpers.skipCB
 * @description
 * A callback function type used by parameter `skip` within {@link helpers.ColumnConfig ColumnConfig}.
 *
 * It is to dynamically determine when the property with specified `name` in the `source` object is to be skipped.
 *
 * The function is called with `this` set to the `source` object.
 *
 * @param {*} col
 * Column-to-property descriptor.
 *
 * @param {object} col.source
 * The source object, equals to `this` that's passed into the function.
 *
 * @param {string} col.name
 * Resolved name of the property within the `source` object, i.e. the value of `name` when `prop` is not used
 * for the column, or the value of `prop` when it is specified.
 *
 * @param {*} col.value
 *
 * Property value, set to one of the following:
 *
 * - Value of the property within the `source` object (`value` = `source[name]`), if the property exists
 * - If the property doesn't exist and `def` is set in the column, then `value` is set to the value of `def`
 * - If the property doesn't exist and `def` is not set in the column, then `value` is set to `undefined`
 *
 * @param {boolean} col.exists
 * Indicates whether the property exists in the `source` object (`exists = name in source`).
 *
 * @returns {boolean}
 * A truthy value that indicates whether the column is to be skipped.
 *
 */

var column = {Column: Column$2};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {assert: assert$6} = assert$d;

const npm$l = {
    utils: utils$4,
    format: formatting.as // formatting namespace
};

/**
 * @class helpers.TableName
 * @description
 * Represents a full table name that can be injected into queries directly.
 *
 * This is a read-only type that can be used wherever parameter `table` is supported.
 *
 * It supports $[Custom Type Formatting], which means you can use the type directly as a formatting
 * parameter, without specifying any escaping.
 *
 * Filter `:alias` is an alternative approach to splitting an SQL name into multiple ones.
 *
 * @param {string|Table} table
 * Table name details, depending on the type:
 *
 * - table name, if `table` is a string
 * - {@link Table} object
 *
 * @property {string} name
 * Formatted/escaped full table name, combining `schema` + `table`.
 *
 * @property {string} table
 * Table name.
 *
 * @property {string} schema
 * Database schema name.
 *
 * It is `undefined` when no valid schema was specified.
 *
 * @returns {helpers.TableName}
 *
 * @see
 * {@link helpers._TN _TN},
 * {@link helpers.TableName#toPostgres toPostgres}
 *
 * @example
 *
 * const table = new pgp.helpers.TableName({table: 'my-table', schema: 'my-schema'});
 * console.log(table);
 * //=> "my-schema"."my-table"
 *
 * // Formatting the type directly:
 * pgp.as.format('SELECT * FROM $1', table);
 * //=> SELECT * FROM "my-schema"."my-table"
 *
 */
let TableName$4 = class TableName {

    constructor(table) {
        if (typeof table === 'string') {
            this.table = table;
        } else {
            const config = assert$6(table, ['table', 'schema']);
            this.table = config.table;
            if (npm$l.utils.isText(config.schema)) {
                this.schema = config.schema;
            }
        }
        if (!npm$l.utils.isText(this.table)) {
            throw new TypeError('Table name must be a non-empty text string.');
        }
        this.name = npm$l.format.name(this.table);
        if (this.schema) {
            this.name = npm$l.format.name(this.schema) + '.' + this.name;
        }
        Object.freeze(this);
    }
};

/**
 * @method helpers.TableName#toPostgres
 * @description
 * $[Custom Type Formatting], based on $[Symbolic CTF], i.e. the actual method is available only via {@link external:Symbol Symbol}:
 *
 * ```js
 * const {toPostgres} = pgp.as.ctf; // Custom Type Formatting symbols namespace
 * const fullName = tn[toPostgres]; // tn = an object of type TableName
 * ```
 *
 * This is a raw formatting type (`rawType = true`), i.e. when used as a query-formatting parameter, type `TableName`
 * injects full table name as raw text.
 *
 * @param {helpers.TableName} [self]
 * Optional self-reference, for ES6 arrow functions.
 *
 * @returns {string}
 * Escaped full table name that includes optional schema name, if specified.
 */
TableName$4.prototype[npm$l.format.ctf.toPostgres] = function (self) {
    self = this instanceof TableName$4 && this || self;
    return self.name;
};

TableName$4.prototype[npm$l.format.ctf.rawType] = true; // use as pre-formatted

/**
 * @method helpers.TableName#toString
 * @description
 * Creates a well-formatted string that represents the object.
 *
 * It is called automatically when writing the object into the console.
 *
 * @returns {string}
 */
TableName$4.prototype.toString = function () {
    return this.name;
};

npm$l.utils.addInspection(TableName$4, function () {
    return this.toString();
});

/**
 * @interface Table
 * @description
 * Structure for any table name/path.
 *
 * Function {@link helpers._TN _TN} can help you construct it from a string.
 *
 * @property {string} [schema] - schema name, if specified
 * @property {string} table - table name
 *
 * @see {@link helpers.TableName TableName}, {@link helpers._TN _TN}
 */

/**
 * @external TemplateStringsArray
 * @see https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_es5_d_.templatestringsarray.html
 */

/**
 * @function helpers._TN
 * @description
 * Table-Name helper function, to convert any `"schema.table"` string
 * into `{schema, table}` object. It also works as a template-tag function.
 *
 * @param {string|TemplateStringsArray} path
 * Table-name path, as a simple string or a template string (with parameters).
 *
 * @example
 * const {ColumnSet, _TN} = pgp.helpers;
 *
 * // Using as a regular function:
 * const cs1 = new ColumnSet(['id', 'name'], {table: _TN('schema.table')});
 *
 * // Using as a template-tag function:
 * const schema = 'schema';
 * const cs2 = new ColumnSet(['id', 'name'], {table: _TN`${schema}.table`});
 *
 * @returns {Table}
 *
 * @see {@link helpers.TableName TableName}, {@link external:TemplateStringsArray TemplateStringsArray}
 */
function _TN$1(path, ...args) {
    if (Array.isArray(path)) {
        path = path.reduce((a, c, i) => a + c + (args[i] ?? ''), '');
    } // else 'path' is a string
    const [schema, table] = path.split('.');
    if (table === undefined) {
        return {table: schema};
    }
    return schema ? {schema, table} : {table};
}

var tableName = {TableName: TableName$4, _TN: _TN$1};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {InnerState: InnerState$1} = innerState;
const {assert: assert$5} = assert$d;
const {TableName: TableName$3} = tableName;
const {Column: Column$1} = column;

const npm$k = {
    os: require$$1,
    utils: utils$4,
    formatting: formatting
};

/**
 * @class helpers.ColumnSet
 * @description
 * Performance-optimized, read-only structure with query-formatting columns.
 *
 * In order to avail from performance optimization provided by this class, it should be created
 * only once, statically, and then reused.
 *
 * @param {object|helpers.Column|array} columns
 * Columns information object, depending on the type:
 *
 * - When it is a simple object, its properties are enumerated to represent both column names and property names
 *   within the source objects. See also option `inherit` that's applicable in this case.
 *
 * - When it is a single {@link helpers.Column Column} object, property {@link helpers.ColumnSet#columns columns} is initialized with
 *   just a single column. It is not a unique situation when only a single column is required for an update operation.
 *
 * - When it is an array, each element is assumed to represent details for a column. If the element is already of type {@link helpers.Column Column},
 *   it is used directly; otherwise the element is passed into {@link helpers.Column Column} constructor for initialization.
 *   On any duplicate column name (case-sensitive) it will throw {@link external:Error Error} = `Duplicate column name "name".`
 *
 * - When it is none of the above, it will throw {@link external:TypeError TypeError} = `Invalid parameter 'columns' specified.`
 *
 * @param {object} [options]
 *
 * @param {helpers.TableName|Table|string} [options.table]
 * Table details.
 *
 * When it is a non-null value, and not a {@link helpers.TableName TableName} object, a new {@link helpers.TableName TableName} is constructed from the value.
 *
 * It can be used as the default for methods {@link helpers.insert insert} and {@link helpers.update update} when their parameter
 * `table` is omitted, and for logging purposes.
 *
 * @param {boolean} [options.inherit = false]
 * Use inherited properties in addition to the object's own properties.
 *
 * By default, only the object's own properties are enumerated for column names.
 *
 * @returns {helpers.ColumnSet}
 *
 * @see
 *
 * {@link helpers.ColumnSet#columns columns},
 * {@link helpers.ColumnSet#names names},
 * {@link helpers.ColumnSet#table table},
 * {@link helpers.ColumnSet#variables variables} |
 * {@link helpers.ColumnSet#assign assign},
 * {@link helpers.ColumnSet#assignColumns assignColumns},
 * {@link helpers.ColumnSet#extend extend},
 * {@link helpers.ColumnSet#merge merge},
 * {@link helpers.ColumnSet#prepare prepare}
 *
 * @example
 *
 * // A complex insert/update object scenario for table 'purchases' in schema 'fiscal'.
 * // For a good performance, you should declare such objects once and then reuse them.
 * //
 * // Column Requirements:
 * //
 * // 1. Property 'id' is only to be used for a WHERE condition in updates
 * // 2. Property 'list' needs to be formatted as a csv
 * // 3. Property 'code' is to be used as raw text, and to be defaulted to 0 when the
 * //    property is missing in the source object
 * // 4. Property 'log' is a JSON object with 'log-entry' for the column name
 * // 5. Property 'data' requires SQL type casting '::int[]'
 * // 6. Property 'amount' needs to be set to 100, if it is 0
 * // 7. Property 'total' must be skipped during updates, if 'amount' was 0, plus its
 * //    column name is 'total-val'
 * const {ColumnSet} = pgp.helpers;
 *
 * const cs = new ColumnSet([
 *     '?id', // ColumnConfig equivalent: {name: 'id', cnd: true}
 *     'list:csv', // ColumnConfig equivalent: {name: 'list', mod: ':csv'}
 *     {
 *         name: 'code',
 *         mod: '^', // format as raw text
 *         def: 0 // default to 0 when the property doesn't exist
 *     },
 *     {
 *         name: 'log-entry',
 *         prop: 'log',
 *         mod: ':json' // format as JSON
 *     },
 *     {
 *         name: 'data',
 *         cast: 'int[]' // use SQL type casting '::int[]'
 *     },
 *     {
 *         name: 'amount',
 *         init(col) {
 *             // set to 100, if the value is 0:
 *             return col.value === 0 ? 100 : col.value;
 *         }
 *     },
 *     {
 *         name: 'total-val',
 *         prop: 'total',
 *         skip(col) {
 *             // skip from updates, if 'amount' is 0:
 *             return col.source.amount === 0;
 *         }
 *     }
 * ], {table: {table: 'purchases', schema: 'fiscal'}});
 *
 * // Alternatively, you could take the table declaration out:
 * // const table = new pgp.helpers.TableName('purchases', 'fiscal');
 *
 * console.log(cs); // console output for the object:
 * //=>
 * // ColumnSet {
 * //    table: "fiscal"."purchases"
 * //    columns: [
 * //        Column {
 * //            name: "id"
 * //            cnd: true
 * //        }
 * //        Column {
 * //            name: "list"
 * //            mod: ":csv"
 * //        }
 * //        Column {
 * //            name: "code"
 * //            mod: "^"
 * //            def: 0
 * //        }
 * //        Column {
 * //            name: "log-entry"
 * //            prop: "log"
 * //            mod: ":json"
 * //        }
 * //        Column {
 * //            name: "data"
 * //            cast: "int[]"
 * //        }
 * //        Column {
 * //            name: "amount"
 * //            init: [Function]
 * //        }
 * //        Column {
 * //            name: "total-val"
 * //            prop: "total"
 * //            skip: [Function]
 * //        }
 * //    ]
 * // }
 */
let ColumnSet$5 = class ColumnSet extends InnerState$1 {

    constructor(columns, opt) {
        super();

        if (!columns || typeof columns !== 'object') {
            throw new TypeError('Invalid parameter \'columns\' specified.');
        }

        opt = assert$5(opt, ['table', 'inherit']);

        if (!npm$k.utils.isNull(opt.table)) {
            this.table = (opt.table instanceof TableName$3) ? opt.table : new TableName$3(opt.table);
        }

        /**
         * @name helpers.ColumnSet#table
         * @type {helpers.TableName}
         * @readonly
         * @description
         * Destination table. It can be specified for two purposes:
         *
         * - **primary:** to be used as the default table when it is omitted during a call into methods {@link helpers.insert insert} and {@link helpers.update update}
         * - **secondary:** to be automatically written into the console (for logging purposes).
         */


        /**
         * @name helpers.ColumnSet#columns
         * @type helpers.Column[]
         * @readonly
         * @description
         * Array of {@link helpers.Column Column} objects.
         */
        if (Array.isArray(columns)) {
            const colNames = {};
            this.columns = columns.map(c => {
                const col = (c instanceof Column$1) ? c : new Column$1(c);
                if (col.name in colNames) {
                    throw new Error(`Duplicate column name "${col.name}".`);
                }
                colNames[col.name] = true;
                return col;
            });
        } else {
            if (columns instanceof Column$1) {
                this.columns = [columns];
            } else {
                this.columns = [];
                for (const name in columns) {
                    if (opt.inherit || Object.prototype.hasOwnProperty.call(columns, name)) {
                        this.columns.push(new Column$1(name));
                    }
                }
            }
        }

        Object.freeze(this.columns);
        Object.freeze(this);

        this.extendState({
            names: undefined,
            variables: undefined,
            updates: undefined,
            isSimple: true
        });

        for (let i = 0; i < this.columns.length; i++) {
            const c = this.columns[i];
            // ColumnSet is simple when the source objects require no preparation,
            // and should be used directly:
            if (c.prop || c.init || 'def' in c) {
                this._inner.isSimple = false;
                break;
            }
        }
    }

    /**
     * @name helpers.ColumnSet#names
     * @type string
     * @readonly
     * @description
     * Returns a string - comma-separated list of all column names, properly escaped.
     *
     * @example
     * const cs = new ColumnSet(['id^', {name: 'cells', cast: 'int[]'}, 'doc:json']);
     * console.log(cs.names);
     * //=> "id","cells","doc"
     */
    get names() {
        const _i = this._inner;
        if (!_i.names) {
            _i.names = this.columns.map(c => c.escapedName).join();
        }
        return _i.names;
    }

    /**
     * @name helpers.ColumnSet#variables
     * @type string
     * @readonly
     * @description
     * Returns a string - formatting template for all column values.
     *
     * @see {@link helpers.ColumnSet#assign assign}
     *
     * @example
     * const cs = new ColumnSet(['id^', {name: 'cells', cast: 'int[]'}, 'doc:json']);
     * console.log(cs.variables);
     * //=> ${id^},${cells}::int[],${doc:json}
     */
    get variables() {
        const _i = this._inner;
        if (!_i.variables) {
            _i.variables = this.columns.map(c => c.variable + c.castText).join();
        }
        return _i.variables;
    }

};

/**
 * @method helpers.ColumnSet#assign
 * @description
 * Returns a formatting template of SET assignments, either generic or for a single object.
 *
 * The method is optimized to cache the output string when there are no columns that can be skipped dynamically.
 *
 * This method is primarily for internal use, that's why it does not validate the input.
 *
 * @param {object} [options]
 * Assignment/formatting options.
 *
 * @param {object} [options.source]
 * Source - a single object that contains values for columns.
 *
 * The object is only necessary to correctly apply the logic of skipping columns dynamically, based on the source data
 * and the rules defined in the {@link helpers.ColumnSet ColumnSet}. If, however, you do not care about that, then you do not need to specify any object.
 *
 * Note that even if you do not specify the object, the columns marked as conditional (`cnd: true`) will always be skipped.
 *
 * @param {string} [options.prefix]
 * In cases where needed, an alias prefix to be added before each column.
 *
 * @returns {string}
 * Comma-separated list of variable-to-column assignments.
 *
 * @see {@link helpers.ColumnSet#variables variables}
 *
 * @example
 *
 * const cs = new pgp.helpers.ColumnSet([
 *     '?first', // = {name: 'first', cnd: true}
 *     'second:json',
 *     {name: 'third', mod: ':raw', cast: 'text'}
 * ]);
 *
 * cs.assign();
 * //=> "second"=${second:json},"third"=${third:raw}::text
 *
 * cs.assign({prefix: 'a b c'});
 * //=> "a b c"."second"=${second:json},"a b c"."third"=${third:raw}::text
 */
ColumnSet$5.prototype.assign = function (options) {
    const _i = this._inner;
    const hasPrefix = options && options.prefix && typeof options.prefix === 'string';
    if (_i.updates && !hasPrefix) {
        return _i.updates;
    }
    let dynamic = hasPrefix;
    const hasSource = options && options.source && typeof options.source === 'object';
    let list = this.columns.filter(c => {
        if (c.cnd) {
            return false;
        }
        if (c.skip) {
            dynamic = true;
            if (hasSource) {
                const a = colDesc(c, options.source);
                if (c.skip.call(options.source, a)) {
                    return false;
                }
            }
        }
        return true;
    });

    const prefix = hasPrefix ? npm$k.formatting.as.alias(options.prefix) + '.' : '';
    list = list.map(c => prefix + c.escapedName + '=' + c.variable + c.castText).join();

    if (!dynamic) {
        _i.updates = list;
    }
    return list;
};

/**
 * @method helpers.ColumnSet#assignColumns
 * @description
 * Generates assignments for all columns in the set, with support for aliases and column-skipping logic.
 * Aliases are set by using method {@link formatting.alias as.alias}.
 *
 * @param {{}} [options]
 * Optional Parameters.
 *
 * @param {string} [options.from]
 * Alias for the source columns.
 *
 * @param {string} [options.to]
 * Alias for the destination columns.
 *
 * @param {string | Array<string> | function} [options.skip]
 * Name(s) of the column(s) to be skipped (case-sensitive). It can be either a single string or an array of strings.
 *
 * It can also be a function - iterator, to be called for every column, passing in {@link helpers.Column Column} as
 * `this` context, and plus as a single parameter. The function would return a truthy value for every column that needs to be skipped.
 *
 * @returns {string}
 * A string of comma-separated column assignments.
 *
 * @example
 *
 * const cs = new ColumnSet(['id', 'city', 'street']);
 *
 * cs.assignColumns({from: 'EXCLUDED', skip: 'id'})
 * //=> "city"=EXCLUDED."city","street"=EXCLUDED."street"
 *
 * @example
 *
 * const cs = new ColumnSet(['?id', 'city', 'street']);
 *
 * cs.assignColumns({from: 'source', to: 'target', skip: c => c.cnd})
 * //=> target."city"=source."city",target."street"=source."street"
 *
 */
ColumnSet$5.prototype.assignColumns = function (options) {
    options = assert$5(options, ['from', 'to', 'skip']);
    const skip = (typeof options.skip === 'string' && [options.skip]) || ((Array.isArray(options.skip) || typeof options.skip === 'function') && options.skip);
    const from = (typeof options.from === 'string' && options.from && (npm$k.formatting.as.alias(options.from) + '.')) || '';
    const to = (typeof options.to === 'string' && options.to && (npm$k.formatting.as.alias(options.to) + '.')) || '';
    const iterator = typeof skip === 'function' ? c => !skip.call(c, c) : c => skip.indexOf(c.name) === -1;
    const cols = skip ? this.columns.filter(iterator) : this.columns;
    return cols.map(c => to + c.escapedName + '=' + from + c.escapedName).join();
};

/**
 * @method helpers.ColumnSet#extend
 * @description
 * Creates a new {@link helpers.ColumnSet ColumnSet}, by joining the two sets of columns.
 *
 * If the two sets contain a column with the same `name` (case-sensitive), an error is thrown.
 *
 * @param {helpers.Column|helpers.ColumnSet|array} columns
 * Columns to be appended, of the same type as parameter `columns` during {@link helpers.ColumnSet ColumnSet} construction, except:
 * - it can also be of type {@link helpers.ColumnSet ColumnSet}
 * - it cannot be a simple object (properties enumeration is not supported here)
 *
 * @returns {helpers.ColumnSet}
 * New {@link helpers.ColumnSet ColumnSet} object with the extended/concatenated list of columns.
 *
 * @see
 * {@link helpers.Column Column},
 * {@link helpers.ColumnSet#merge merge}
 *
 * @example
 *
 * const pgp = require('pg-promise')();
 *
 * const cs = new pgp.helpers.ColumnSet(['one', 'two'], {table: 'my-table'});
 * console.log(cs);
 * //=>
 * // ColumnSet {
 * //    table: "my-table"
 * //    columns: [
 * //        Column {
 * //            name: "one"
 * //        }
 * //        Column {
 * //            name: "two"
 * //        }
 * //    ]
 * // }
 * const csExtended = cs.extend(['three']);
 * console.log(csExtended);
 * //=>
 * // ColumnSet {
 * //    table: "my-table"
 * //    columns: [
 * //        Column {
 * //            name: "one"
 * //        }
 * //        Column {
 * //            name: "two"
 * //        }
 * //        Column {
 * //            name: "three"
 * //        }
 * //    ]
 * // }
 */
ColumnSet$5.prototype.extend = function (columns) {
    let cs = columns;
    if (!(cs instanceof ColumnSet$5)) {
        cs = new ColumnSet$5(columns);
    }
    // Any duplicate column will throw Error = 'Duplicate column name "name".',
    return new ColumnSet$5(this.columns.concat(cs.columns), {table: this.table});
};

/**
 * @method helpers.ColumnSet#merge
 * @description
 * Creates a new {@link helpers.ColumnSet ColumnSet}, by joining the two sets of columns.
 *
 * Items in `columns` with the same `name` (case-sensitive) override the original columns.
 *
 * @param {helpers.Column|helpers.ColumnSet|array} columns
 * Columns to be appended, of the same type as parameter `columns` during {@link helpers.ColumnSet ColumnSet} construction, except:
 * - it can also be of type {@link helpers.ColumnSet ColumnSet}
 * - it cannot be a simple object (properties enumeration is not supported here)
 *
 * @see
 * {@link helpers.Column Column},
 * {@link helpers.ColumnSet#extend extend}
 *
 * @returns {helpers.ColumnSet}
 * New {@link helpers.ColumnSet ColumnSet} object with the merged list of columns.
 *
 * @example
 *
 * const pgp = require('pg-promise')();
 * const {ColumnSet} = pgp.helpers;
 *
 * const cs = new ColumnSet(['?one', 'two:json'], {table: 'my-table'});
 * console.log(cs);
 * //=>
 * // ColumnSet {
 * //    table: "my-table"
 * //    columns: [
 * //        Column {
 * //            name: "one"
 * //            cnd: true
 * //        }
 * //        Column {
 * //            name: "two"
 * //            mod: ":json"
 * //        }
 * //    ]
 * // }
 * const csMerged = cs.merge(['two', 'three^']);
 * console.log(csMerged);
 * //=>
 * // ColumnSet {
 * //    table: "my-table"
 * //    columns: [
 * //        Column {
 * //            name: "one"
 * //            cnd: true
 * //        }
 * //        Column {
 * //            name: "two"
 * //        }
 * //        Column {
 * //            name: "three"
 * //            mod: "^"
 * //        }
 * //    ]
 * // }
 *
 */
ColumnSet$5.prototype.merge = function (columns) {
    let cs = columns;
    if (!(cs instanceof ColumnSet$5)) {
        cs = new ColumnSet$5(columns);
    }
    const colNames = {}, cols = [];
    this.columns.forEach((c, idx) => {
        cols.push(c);
        colNames[c.name] = idx;
    });
    cs.columns.forEach(c => {
        if (c.name in colNames) {
            cols[colNames[c.name]] = c;
        } else {
            cols.push(c);
        }
    });
    return new ColumnSet$5(cols, {table: this.table});
};

/**
 * @method helpers.ColumnSet#prepare
 * @description
 * Prepares a source object to be formatted, by cloning it and applying the rules as set by the
 * columns configuration.
 *
 * This method is primarily for internal use, that's why it does not validate the input parameters.
 *
 * @param {object} source
 * The source object to be prepared, if required.
 *
 * It must be a non-`null` object, which the method does not validate, as it is
 * intended primarily for internal use by the library.
 *
 * @returns {object}
 * When the object needs to be prepared, the method returns a clone of the source object,
 * with all properties and values set according to the columns configuration.
 *
 * When the object does not need to be prepared, the original object is returned.
 */
ColumnSet$5.prototype.prepare = function (source) {
    if (this._inner.isSimple) {
        return source; // a simple ColumnSet requires no object preparation;
    }
    const target = {};
    this.columns.forEach(c => {
        const a = colDesc(c, source);
        if (c.init) {
            target[a.name] = c.init.call(source, a);
        } else {
            if (a.exists || 'def' in c) {
                target[a.name] = a.value;
            }
        }
    });
    return target;
};

function colDesc(column, source) {
    const a = {
        source,
        name: column.prop || column.name
    };
    a.exists = a.name in source;
    if (a.exists) {
        a.value = source[a.name];
    } else {
        a.value = 'def' in column ? column.def : undefined;
    }
    return a;
}

/**
 * @method helpers.ColumnSet#toString
 * @description
 * Creates a well-formatted multi-line string that represents the object.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
ColumnSet$5.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    const gap0 = npm$k.utils.messageGap(level),
        gap1 = npm$k.utils.messageGap(level + 1),
        lines = [
            'ColumnSet {'
        ];
    if (this.table) {
        lines.push(gap1 + 'table: ' + this.table);
    }
    if (this.columns.length) {
        lines.push(gap1 + 'columns: [');
        this.columns.forEach(c => {
            lines.push(c.toString(2));
        });
        lines.push(gap1 + ']');
    } else {
        lines.push(gap1 + 'columns: []');
    }
    lines.push(gap0 + '}');
    return lines.join(npm$k.os.EOL);
};

npm$k.utils.addInspection(ColumnSet$5, function () {
    return this.toString();
});

var columnSet = {ColumnSet: ColumnSet$5};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {QueryFile: QueryFile$2} = queryFile;

const npm$j = {
    formatting: formatting
};

/**
 * @method helpers.concat
 * @description
 * Formats and concatenates multiple queries into a single query string.
 *
 * Before joining the queries, the method does the following:
 *  - Formats each query, if `values` are provided;
 *  - Removes all leading and trailing spaces, tabs and semi-colons;
 *  - Automatically skips all empty queries.
 *
 * @param {array<string|helpers.QueryFormat|QueryFile>} queries
 * Array of mixed-type elements:
 * - a simple query string, to be used as is
 * - a {@link helpers.QueryFormat QueryFormat}-like object = `{query, [values], [options]}`
 * - a {@link QueryFile} object
 *
 * @returns {string}
 * Concatenated string with all queries.
 *
 * @example
 *
 * const pgp = require('pg-promise')();
 *
 * const qf1 = new pgp.QueryFile('./query1.sql', {minify: true});
 * const qf2 = new pgp.QueryFile('./query2.sql', {minify: true});
 *
 * const query = pgp.helpers.concat([
 *     {query: 'INSERT INTO Users(name, age) VALUES($1, $2)', values: ['John', 23]}, // QueryFormat-like object
 *     {query: qf1, values: [1, 'Name']}, // QueryFile with formatting parameters
 *     'SELECT count(*) FROM Users', // a simple-string query,
 *     qf2 // direct QueryFile object
 * ]);
 *
 * // query = concatenated string with all the queries
 */
function concat$1(queries, capSQL) {
    if (!Array.isArray(queries)) {
        throw new TypeError('Parameter \'queries\' must be an array.');
    }
    const fmOptions = {capSQL};
    const all = queries.map((q, index) => {
        if (typeof q === 'string') {
            // a simple query string without parameters:
            return clean(q);
        }
        if (q && typeof q === 'object') {
            if (q instanceof QueryFile$2) {
                // QueryFile object:
                return clean(q[npm$j.formatting.as.ctf.toPostgres]());
            }
            if ('query' in q) {
                // object {query, values, options}:
                let opt = q.options && typeof q.options === 'object' ? q.options : {};
                opt = opt.capSQL === undefined ? Object.assign(opt, fmOptions) : opt;
                return clean(npm$j.formatting.as.format(q.query, q.values, opt));
            }
        }
        throw new Error(`Invalid query element at index ${index}.`);
    });

    return all.filter(q => q).join(';');
}

function clean(q) {
    // removes from the query all leading and trailing symbols ' ', '\t' and ';'
    return q.replace(/^[\s;]*|[\s;]*$/g, '');
}

var concat_1 = {concat: concat$1};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {TableName: TableName$2} = tableName;
const {ColumnSet: ColumnSet$4} = columnSet;

const npm$i = {
    formatting: formatting,
    utils: utils$4
};

/**
 * @method helpers.insert
 * @description
 * Generates an `INSERT` query for either one object or an array of objects.
 *
 * @param {object|object[]} data
 * An insert object with properties for insert values, or an array of such objects.
 *
 * When `data` is not a non-null object and not an array, it will throw {@link external:TypeError TypeError} = `Invalid parameter 'data' specified.`
 *
 * When `data` is an empty array, it will throw {@link external:TypeError TypeError} = `Cannot generate an INSERT from an empty array.`
 *
 * When `data` is an array that contains a non-object value, the method will throw {@link external:Error Error} =
 * `Invalid insert object at index N.`
 *
 * @param {array|helpers.Column|helpers.ColumnSet} [columns]
 * Set of columns to be inserted.
 *
 * It is optional when `data` is a single object, and required when `data` is an array of objects. If not specified for an array
 * of objects, the method will throw {@link external:TypeError TypeError} = `Parameter 'columns' is required when inserting multiple records.`
 *
 * When `columns` is not a {@link helpers.ColumnSet ColumnSet} object, a temporary {@link helpers.ColumnSet ColumnSet}
 * is created - from the value of `columns` (if it was specified), or from the value of `data` (if it is not an array).
 *
 * When the final {@link helpers.ColumnSet ColumnSet} is empty (no columns in it), the method will throw
 * {@link external:Error Error} = `Cannot generate an INSERT without any columns.`
 *
 * @param {helpers.TableName|Table|string} [table]
 * Destination table.
 *
 * It is normally a required parameter. But when `columns` is passed in as a {@link helpers.ColumnSet ColumnSet} object
 * with `table` set in it, that will be used when this parameter isn't specified. When neither is available, the method
 * will throw {@link external:Error Error} = `Table name is unknown.`
 *
 * @returns {string}
 * An `INSERT` query string.
 *
 * @see
 *  {@link helpers.Column Column},
 *  {@link helpers.ColumnSet ColumnSet},
 *  {@link helpers.TableName TableName}
 *
 * @example
 *
 * const pgp = require('pg-promise')({
 *    capSQL: true // if you want all generated SQL capitalized
 * });
 * const {insert} = pgp.helpers;
 *
 * const dataSingle = {val: 123, msg: 'hello'};
 * const dataMulti = [{val: 123, msg: 'hello'}, {val: 456, msg: 'world!'}];
 *
 * // Column details can be taken from the data object:
 *
 * insert(dataSingle, null, 'my-table');
 * //=> INSERT INTO "my-table"("val","msg") VALUES(123,'hello')
 *
 * @example
 *
 * // Column details are required for a multi-row `INSERT`:
 * const {insert} = pgp.helpers;
 *
 * insert(dataMulti, ['val', 'msg'], 'my-table');
 * //=> INSERT INTO "my-table"("val","msg") VALUES(123,'hello'),(456,'world!')
 *
 * @example
 *
 * // Column details from a reusable ColumnSet (recommended for performance):
 * const {ColumnSet, insert} = pgp.helpers;
 *
 * const cs = new ColumnSet(['val', 'msg'], {table: 'my-table'});
 *
 * insert(dataMulti, cs);
 * //=> INSERT INTO "my-table"("val","msg") VALUES(123,'hello'),(456,'world!')
 *
 */
function insert$1(data, columns, table, capSQL) {

    if (!data || typeof data !== 'object') {
        throw new TypeError('Invalid parameter \'data\' specified.');
    }

    const isArray = Array.isArray(data);

    if (isArray && !data.length) {
        throw new TypeError('Cannot generate an INSERT from an empty array.');
    }

    if (columns instanceof ColumnSet$4) {
        if (npm$i.utils.isNull(table)) {
            table = columns.table;
        }
    } else {
        if (isArray && npm$i.utils.isNull(columns)) {
            throw new TypeError('Parameter \'columns\' is required when inserting multiple records.');
        }
        columns = new ColumnSet$4(columns || data);
    }

    if (!columns.columns.length) {
        throw new Error('Cannot generate an INSERT without any columns.');
    }

    if (!table) {
        throw new Error('Table name is unknown.');
    }

    if (!(table instanceof TableName$2)) {
        table = new TableName$2(table);
    }

    let query = capSQL ? sql$1.capCase : sql$1.lowCase;
    const fmOptions = {capSQL};

    const format = npm$i.formatting.as.format;
    query = format(query, [table.name, columns.names], fmOptions);

    if (isArray) {
        return query + data.map((d, index) => {
            if (!d || typeof d !== 'object') {
                throw new Error(`Invalid insert object at index ${index}.`);
            }
            return '(' + format(columns.variables, columns.prepare(d), fmOptions) + ')';
        }).join();
    }
    return query + '(' + format(columns.variables, columns.prepare(data), fmOptions) + ')';
}

const sql$1 = {
    lowCase: 'insert into $1^($2^) values',
    capCase: 'INSERT INTO $1^($2^) VALUES'
};

var insert_1 = {insert: insert$1};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {assert: assert$4} = assert$d;
const {TableName: TableName$1} = tableName;
const {ColumnSet: ColumnSet$3} = columnSet;

const npm$h = {
    formatting: formatting,
    utils: utils$4
};

/**
 * @method helpers.update
 * @description
 * Generates a simplified `UPDATE` query for either one object or an array of objects.
 *
 * The resulting query needs a `WHERE` clause to be appended to it, to specify the update logic.
 * This is to allow for update conditions of any complexity that are easy to add.
 *
 * @param {object|object[]} data
 * An update object with properties for update values, or an array of such objects.
 *
 * When `data` is not a non-null object and not an array, it will throw {@link external:TypeError TypeError} = `Invalid parameter 'data' specified.`
 *
 * When `data` is an empty array, it will throw {@link external:TypeError TypeError} = `Cannot generate an UPDATE from an empty array.`
 *
 * When `data` is an array that contains a non-object value, the method will throw {@link external:Error Error} =
 * `Invalid update object at index N.`
 *
 * @param {array|helpers.Column|helpers.ColumnSet} [columns]
 * Set of columns to be updated.
 *
 * It is optional when `data` is a single object, and required when `data` is an array of objects. If not specified for an array
 * of objects, the method will throw {@link external:TypeError TypeError} = `Parameter 'columns' is required when updating multiple records.`
 *
 * When `columns` is not a {@link helpers.ColumnSet ColumnSet} object, a temporary {@link helpers.ColumnSet ColumnSet}
 * is created - from the value of `columns` (if it was specified), or from the value of `data` (if it is not an array).
 *
 * When the final {@link helpers.ColumnSet ColumnSet} is empty (no columns in it), the method will throw
 * {@link external:Error Error} = `Cannot generate an UPDATE without any columns.`, unless option `emptyUpdate` was specified.
 *
 * @param {helpers.TableName|Table|string} [table]
 * Table to be updated.
 *
 * It is normally a required parameter. But when `columns` is passed in as a {@link helpers.ColumnSet ColumnSet} object
 * with `table` set in it, that will be used when this parameter isn't specified. When neither is available, the method
 * will throw {@link external:Error Error} = `Table name is unknown.`
 *
 * @param {{}} [options]
 * An object with formatting options for multi-row `UPDATE` queries.
 *
 * @param {string} [options.tableAlias=t]
 * Name of the SQL variable that represents the destination table.
 *
 * @param {string} [options.valueAlias=v]
 * Name of the SQL variable that represents the values.
 *
 * @param {*} [options.emptyUpdate]
 * This is a convenience option, to avoid throwing an error when generating a conditional update results in no columns.
 *
 * When present, regardless of the value, this option overrides the method's behavior when applying `skip` logic results in no columns,
 * i.e. when every column is being skipped.
 *
 * By default, in that situation the method throws {@link external:Error Error} = `Cannot generate an UPDATE without any columns.`
 * But when this option is present, the method will instead return whatever value the option was passed.
 *
 * @returns {*}
 * An `UPDATE` query string that needs a `WHERE` condition appended.
 *
 * If it results in an empty update, and option `emptyUpdate` was passed in, then the method returns the value
 * to which the option was set.
 *
 * @see
 *  {@link helpers.Column Column},
 *  {@link helpers.ColumnSet ColumnSet},
 *  {@link helpers.TableName TableName}
 *
 * @example
 *
 * const pgp = require('pg-promise')({
 *    capSQL: true // if you want all generated SQL capitalized
 * });
 * const {update} = pgp.helpers;
 *
 * const dataSingle = {id: 1, val: 123, msg: 'hello'};
 * const dataMulti = [{id: 1, val: 123, msg: 'hello'}, {id: 2, val: 456, msg: 'world!'}];
 *
 * // Although column details can be taken from the data object, it is not
 * // a likely scenario for an update, unless updating the whole table:
 *
 * update(dataSingle, null, 'my-table');
 * //=> UPDATE "my-table" SET "id"=1,"val"=123,"msg"='hello'
 *
 * @example
 *
 * // A typical single-object update:
 *
 * // Dynamic conditions must be escaped/formatted properly:
 * const condition = pgp.as.format(' WHERE id = ${id}', dataSingle);
 *
 * update(dataSingle, ['val', 'msg'], 'my-table') + condition;
 * //=> UPDATE "my-table" SET "val"=123,"msg"='hello' WHERE id = 1
 *
 * @example
 *
 * // Column details are required for a multi-row `UPDATE`;
 * // Adding '?' in front of a column name means it is only for a WHERE condition:
 *
 * update(dataMulti, ['?id', 'val', 'msg'], 'my-table') + ' WHERE v.id = t.id';
 * //=> UPDATE "my-table" AS t SET "val"=v."val","msg"=v."msg" FROM (VALUES(1,123,'hello'),(2,456,'world!'))
 * //   AS v("id","val","msg") WHERE v.id = t.id
 *
 * @example
 *
 * // Column details from a reusable ColumnSet (recommended for performance):
 * const {ColumnSet, update} = pgp.helpers;
 *
 * const cs = new ColumnSet(['?id', 'val', 'msg'], {table: 'my-table'});
 *
 * update(dataMulti, cs) + ' WHERE v.id = t.id';
 * //=> UPDATE "my-table" AS t SET "val"=v."val","msg"=v."msg" FROM (VALUES(1,123,'hello'),(2,456,'world!'))
 * //   AS v("id","val","msg") WHERE v.id = t.id
 *
 * @example
 *
 * // Using parameter `options` to change the default alias names:
 *
 * update(dataMulti, cs, null, {tableAlias: 'X', valueAlias: 'Y'}) + ' WHERE Y.id = X.id';
 * //=> UPDATE "my-table" AS X SET "val"=Y."val","msg"=Y."msg" FROM (VALUES(1,123,'hello'),(2,456,'world!'))
 * //   AS Y("id","val","msg") WHERE Y.id = X.id
 *
 * @example
 *
 * // Handling an empty update
 * const {ColumnSet, update} = pgp.helpers;
 *
 * const cs = new ColumnSet(['?id', '?name'], {table: 'tt'}); // no actual update-able columns
 * const result = update(dataMulti, cs, null, {emptyUpdate: 123});
 * if(result === 123) {
 *    // We know the update is empty, i.e. no columns that can be updated;
 *    // And it didn't throw because we specified `emptyUpdate` option.
 * }
 */
function update$1(data, columns, table, options, capSQL) {

    if (!data || typeof data !== 'object') {
        throw new TypeError('Invalid parameter \'data\' specified.');
    }

    const isArray = Array.isArray(data);

    if (isArray && !data.length) {
        throw new TypeError('Cannot generate an UPDATE from an empty array.');
    }

    if (columns instanceof ColumnSet$3) {
        if (npm$h.utils.isNull(table)) {
            table = columns.table;
        }
    } else {
        if (isArray && npm$h.utils.isNull(columns)) {
            throw new TypeError('Parameter \'columns\' is required when updating multiple records.');
        }
        columns = new ColumnSet$3(columns || data);
    }

    options = assert$4(options, ['tableAlias', 'valueAlias', 'emptyUpdate']);

    const format = npm$h.formatting.as.format,
        useEmptyUpdate = 'emptyUpdate' in options,
        fmOptions = {capSQL};

    if (isArray) {
        const tableAlias = npm$h.formatting.as.alias(npm$h.utils.isNull(options.tableAlias) ? 't' : options.tableAlias);
        const valueAlias = npm$h.formatting.as.alias(npm$h.utils.isNull(options.valueAlias) ? 'v' : options.valueAlias);

        const q = capSQL ? sql.multi.capCase : sql.multi.lowCase;

        const actualColumns = columns.columns.filter(c => !c.cnd);

        if (checkColumns(actualColumns)) {
            return options.emptyUpdate;
        }

        checkTable();

        const targetCols = actualColumns.map(c => c.escapedName + '=' + valueAlias + '.' + c.escapedName).join();

        const values = data.map((d, index) => {
            if (!d || typeof d !== 'object') {
                throw new Error(`Invalid update object at index ${index}.`);
            }
            return '(' + format(columns.variables, columns.prepare(d), fmOptions) + ')';
        }).join();

        return format(q, [table.name, tableAlias, targetCols, values, valueAlias, columns.names], fmOptions);
    }

    const updates = columns.assign({source: data});

    if (checkColumns(updates)) {
        return options.emptyUpdate;
    }

    checkTable();

    const query = capSQL ? sql.single.capCase : sql.single.lowCase;

    return format(query, table.name) + format(updates, columns.prepare(data), fmOptions);

    function checkTable() {
        if (table && !(table instanceof TableName$1)) {
            table = new TableName$1(table);
        }
        if (!table) {
            throw new Error('Table name is unknown.');
        }
    }

    function checkColumns(cols) {
        if (!cols.length) {
            if (useEmptyUpdate) {
                return true;
            }
            throw new Error('Cannot generate an UPDATE without any columns.');
        }
    }
}

const sql = {
    single: {
        lowCase: 'update $1^ set ',
        capCase: 'UPDATE $1^ SET '
    },
    multi: {
        lowCase: 'update $1^ as $2^ set $3^ from (values$4^) as $5^($6^)',
        capCase: 'UPDATE $1^ AS $2^ SET $3^ FROM (VALUES$4^) AS $5^($6^)'
    }
};

var update_1 = {update: update$1};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {ColumnSet: ColumnSet$2} = columnSet;

const npm$g = {
    formatting: formatting,
    utils: utils$4
};

/**
 * @method helpers.values
 * @description
 * Generates a string of comma-separated value groups from either one object or an array of objects,
 * to be used as part of a query:
 *
 * - from a single object: `(val_1, val_2, ...)`
 * - from an array of objects: `(val_11, val_12, ...), (val_21, val_22, ...)`
 *
 * @param {object|object[]} data
 * A source object with properties as values, or an array of such objects.
 *
 * If it is anything else, the method will throw {@link external:TypeError TypeError} = `Invalid parameter 'data' specified.`
 *
 * When `data` is an array that contains a non-object value, the method will throw {@link external:Error Error} =
 * `Invalid object at index N.`
 *
 * When `data` is an empty array, an empty string is returned.
 *
 * @param {array|helpers.Column|helpers.ColumnSet} [columns]
 * Columns for which to return values.
 *
 * It is optional when `data` is a single object, and required when `data` is an array of objects. If not specified for an array
 * of objects, the method will throw {@link external:TypeError TypeError} = `Parameter 'columns' is required when generating multi-row values.`
 *
 * When the final {@link helpers.ColumnSet ColumnSet} is empty (no columns in it), the method will throw
 * {@link external:Error Error} = `Cannot generate values without any columns.`
 *
 * @returns {string}
 * - comma-separated value groups, according to `data`
 * - an empty string, if `data` is an empty array
 *
 * @see
 *  {@link helpers.Column Column},
 *  {@link helpers.ColumnSet ColumnSet}
 *
 * @example
 *
 * const pgp = require('pg-promise')();
 *
 * const dataSingle = {val: 123, msg: 'hello'};
 * const dataMulti = [{val: 123, msg: 'hello'}, {val: 456, msg: 'world!'}];
 *
 * // Properties can be pulled automatically from a single object:
 *
 * pgp.helpers.values(dataSingle);
 * //=> (123,'hello')
 *
 * @example
 *
 * // Column details are required when using an array of objects:
 *
 * pgp.helpers.values(dataMulti, ['val', 'msg']);
 * //=> (123,'hello'),(456,'world!')
 *
 * @example
 *
 * // Column details from a reusable ColumnSet (recommended for performance):
 * const {ColumnSet, values} = pgp.helpers;
 *
 * const cs = new ColumnSet(['val', 'msg']);
 *
 * values(dataMulti, cs);
 * //=> (123,'hello'),(456,'world!')
 *
 */
function values$1(data, columns, capSQL) {

    if (!data || typeof data !== 'object') {
        throw new TypeError('Invalid parameter \'data\' specified.');
    }

    const isArray = Array.isArray(data);

    if (!(columns instanceof ColumnSet$2)) {
        if (isArray && npm$g.utils.isNull(columns)) {
            throw new TypeError('Parameter \'columns\' is required when generating multi-row values.');
        }
        columns = new ColumnSet$2(columns || data);
    }

    if (!columns.columns.length) {
        throw new Error('Cannot generate values without any columns.');
    }

    const format = npm$g.formatting.as.format,
        fmOptions = {capSQL};

    if (isArray) {
        return data.map((d, index) => {
            if (!d || typeof d !== 'object') {
                throw new Error(`Invalid object at index ${index}.`);
            }
            return '(' + format(columns.variables, columns.prepare(d), fmOptions) + ')';
        }).join();
    }
    return '(' + format(columns.variables, columns.prepare(data), fmOptions) + ')';
}

var values_1 = {values: values$1};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {ColumnSet: ColumnSet$1} = columnSet;

const npm$f = {
    format: formatting.as.format,
    utils: utils$4
};

/**
 * @method helpers.sets
 * @description
 * Generates a string of comma-separated value-set statements from a single object: `col1=val1, col2=val2, ...`,
 * to be used as part of a query.
 *
 * Since it is to be used as part of `UPDATE` queries, {@link helpers.Column Column} properties `cnd` and `skip` apply.
 *
 * @param {object} data
 * A simple, non-null and non-array source object.
 *
 * If it is anything else, the method will throw {@link external:TypeError TypeError} = `Invalid parameter 'data' specified.`
 *
 * @param {array|helpers.Column|helpers.ColumnSet} [columns]
 * Columns for which to set values.
 *
 * When not specified, properties of the `data` object are used.
 *
 * When no effective columns are found, an empty string is returned.
 *
 * @returns {string}
 * - comma-separated value-set statements for the `data` object
 * - an empty string, if no effective columns found
 *
 * @see
 *  {@link helpers.Column Column},
 *  {@link helpers.ColumnSet ColumnSet}
 *
 * @example
 *
 * const pgp = require('pg-promise')();
 *
 * const data = {id: 1, val: 123, msg: 'hello'};
 *
 * // Properties can be pulled automatically from the object:
 *
 * pgp.helpers.sets(data);
 * //=> "id"=1,"val"=123,"msg"='hello'
 *
 * @example
 *
 * // Column details from a reusable ColumnSet (recommended for performance);
 * // NOTE: Conditional columns (start with '?') are skipped:
 * const {ColumnSet, sets} = pgp.helpers;
 *
 * const cs = new ColumnSet(['?id','val', 'msg']);
 *
 * sets(data, cs);
 * //=> "val"=123,"msg"='hello'
 *
 */
function sets$1(data, columns, capSQL) {

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new TypeError('Invalid parameter \'data\' specified.');
    }

    if (!(columns instanceof ColumnSet$1)) {
        columns = new ColumnSet$1(columns || data);
    }

    return npm$f.format(columns.assign({source: data}), columns.prepare(data), {capSQL});
}

var sets_1 = {sets: sets$1};

const {concat} = concat_1;
const {insert} = insert_1;
const {update} = update_1;
const {values} = values_1;
const {sets} = sets_1;

var methods = {
    concat,
    insert,
    update,
    values,
    sets
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {Column} = column;
const {ColumnSet} = columnSet;
const {TableName, _TN} = tableName;
const method = methods;

/**
 * @namespace helpers
 * @description
 * Namespace for query-formatting generators, available as {@link module:pg-promise~helpers pgp.helpers}, after initializing the library.
 *
 * It unifies the approach to generating multi-row `INSERT` / `UPDATE` queries with the single-row ones.
 *
 * See also: $[Performance Boost].
 *
 * @property {function} TableName
 * {@link helpers.TableName TableName} class constructor.
 *
 * @property {function} _TN
 * {@link helpers._TN _TN} Table-Name conversion function.
 *
 * @property {function} ColumnSet
 * {@link helpers.ColumnSet ColumnSet} class constructor.
 *
 * @property {function} Column
 * {@link helpers.Column Column} class constructor.
 *
 * @property {function} insert
 * {@link helpers.insert insert} static method.
 *
 * @property {function} update
 * {@link helpers.update update} static method.
 *
 * @property {function} values
 * {@link helpers.values values} static method.
 *
 * @property {function} sets
 * {@link helpers.sets sets} static method.
 *
 * @property {function} concat
 * {@link helpers.concat concat} static method.
 */
var helpers = config => {
    const capSQL = () => config.options && config.options.capSQL;
    const res = {
        insert(data, columns, table) {
            return method.insert(data, columns, table, capSQL());
        },
        update(data, columns, table, options) {
            return method.update(data, columns, table, options, capSQL());
        },
        concat(queries) {
            return method.concat(queries, capSQL());
        },
        values(data, columns) {
            return method.values(data, columns, capSQL());
        },
        sets(data, columns) {
            return method.sets(data, columns, capSQL());
        },
        TableName,
        _TN,
        ColumnSet,
        Column
    };
    return res;
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {assert: assert$3} = assert$d;

const npm$e = {
    fs: require$$0$2,
    path: require$$0$1,
    utils: utils$4};

/**
 * @method utils.camelize
 * @description
 * Camelizes a text string.
 *
 * Case-changing characters include:
 * - _hyphen_
 * - _underscore_
 * - _period_
 * - _space_
 *
 * @param {string} text
 * Input text string.
 *
 * @returns {string}
 * Camelized text string.
 *
 * @see
 * {@link utils.camelizeVar camelizeVar}
 *
 */
function camelize(text) {
    text = text.replace(/[-_\s.]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    return text.substring(0, 1).toLowerCase() + text.substring(1);
}

/**
 * @method utils.camelizeVar
 * @description
 * Camelizes a text string, while making it compliant with JavaScript variable names:
 * - contains symbols `a-z`, `A-Z`, `0-9`, `_` and `$`
 * - cannot have leading digits
 *
 * First, it removes all symbols that do not meet the above criteria, except for _hyphen_, _period_ and _space_,
 * and then it forwards into {@link utils.camelize camelize}.
 *
 * @param {string} text
 * Input text string.
 *
 * If it doesn't contain any symbols to make up a valid variable name, the result will be an empty string.
 *
 * @returns {string}
 * Camelized text string that can be used as an open property name.
 *
 * @see
 * {@link utils.camelize camelize}
 *
 */
function camelizeVar(text) {
    text = text.replace(/[^a-zA-Z0-9$_\-\s.]/g, '').replace(/^[0-9_\-\s.]+/, '');
    return camelize(text);
}

function _enumSql(dir, options, cb, namePath) {
    const tree = {};
    npm$e.fs.readdirSync(dir).forEach(file => {
        let stat;
        const fullPath = npm$e.path.join(dir, file);
        try {
            stat = npm$e.fs.statSync(fullPath);
        } catch (e) {
            // while it is very easy to test manually, it is very difficult to test for
            // access-denied errors automatically; therefore excluding from the coverage:
            // istanbul ignore next
            if (options.ignoreErrors) {
                return; // on to the next file/folder;
            }
            // istanbul ignore next
            throw e;
        }
        if (stat.isDirectory()) {
            if (options.recursive) {
                const dirName = camelizeVar(file);
                const np = namePath ? (namePath + '.' + dirName) : dirName;
                const t = _enumSql(fullPath, options, cb, np);
                if (Object.keys(t).length) {
                    if (!dirName.length || dirName in tree) {
                        if (!options.ignoreErrors) {
                            throw new Error('Empty or duplicate camelized folder name: ' + fullPath);
                        }
                    }
                    tree[dirName] = t;
                }
            }
        } else {
            if (npm$e.path.extname(file).toLowerCase() === '.sql') {
                const name = camelizeVar(file.replace(/\.[^/.]+$/, ''));
                if (!name.length || name in tree) {
                    if (!options.ignoreErrors) {
                        throw new Error('Empty or duplicate camelized file name: ' + fullPath);
                    }
                }
                tree[name] = fullPath;
                if (cb) {
                    const result = cb(fullPath, name, namePath ? (namePath + '.' + name) : name);
                    if (result !== undefined) {
                        tree[name] = result;
                    }
                }
            }
        }
    });
    return tree;
}

/**
 * @method utils.enumSql
 * @description
 * Synchronously enumerates all SQL files (within a given directory) into a camelized SQL tree.
 *
 * All property names within the tree are camelized via {@link utils.camelizeVar camelizeVar},
 * so they can be used in the code directly, as open property names.
 *
 * @param {string} dir
 * Directory path where SQL files are located, either absolute or relative to the current directory.
 *
 * SQL files are identified by using `.sql` extension (case-insensitive).
 *
 * @param {{}} [options]
 * Search options.
 *
 * @param {boolean} [options.recursive=false]
 * Include sub-directories into the search.
 *
 * Sub-directories without SQL files will be skipped from the result.
 *
 * @param {boolean} [options.ignoreErrors=false]
 * Ignore the following types of errors:
 * - access errors, when there is no read access to a file or folder
 * - empty or duplicate camelized property names
 *
 * This flag does not affect errors related to invalid input parameters, or if you pass in a
 * non-existing directory.
 *
 * @param {function} [cb]
 * A callback function that takes three arguments:
 * - `file` - SQL file path, relative or absolute, according to how you specified the search directory
 * - `name` - name of the property that represents the SQL file
 * - `path` - property resolution path (full property name)
 *
 * If the function returns anything other than `undefined`, it overrides the corresponding property value in the tree.
 *
 * @returns {object}
 * Camelized SQL tree object, with each value being an SQL file path (unless changed via the callback).
 *
 * @example
 *
 * // simple SQL tree generation for further processing:
 * const tree = pgp.utils.enumSql('../sql', {recursive: true});
 *
 * @example
 *
 * // generating an SQL tree for dynamic use of names:
 * const sql = pgp.utils.enumSql(__dirname, {recursive: true}, file => {
 *     return new pgp.QueryFile(file, {minify: true});
 * });
 *
 * @example
 *
 * const {join: joinPath} = require('path');
 *
 * // replacing each relative path in the tree with a full one:
 * const tree = pgp.utils.enumSql('../sql', {recursive: true}, file => {
 *     return joinPath(__dirname, file);
 * });
 *
 */
function enumSql(dir, options, cb) {
    if (!npm$e.utils.isText(dir)) {
        throw new TypeError('Parameter \'dir\' must be a non-empty text string.');
    }
    options = assert$3(options, ['recursive', 'ignoreErrors']);
    cb = (typeof cb === 'function') ? cb : null;
    return _enumSql(dir, options, cb, '');
}

/**
 * @method utils.taskArgs
 * @description
 * Normalizes/prepares arguments for tasks and transactions.
 *
 * Its main purpose is to simplify adding custom methods {@link Database#task task}, {@link Database#taskIf taskIf},
 * {@link Database#tx tx} and {@link Database#txIf txIf} within event {@link event:extend extend}, as the those methods use fairly
 * complex logic for parsing inputs.
 *
 * @param args {Object}
 * Array-like object of `arguments` that was passed into the method. It is expected that the `arguments`
 * are always made of two parameters - `(options, cb)`, same as all the default task/transaction methods.
 *
 * And if your custom method needs additional parameters, they should be passed in as extra properties within `options`.
 *
 * @returns {Array}
 * Array of arguments that can be passed into a task or transaction.
 *
 * It is extended with properties `options` and `cb` to access the corresponding array elements `[0]` and `[1]` by name.
 *
 * @example
 *
 * // Registering a custom transaction method that assigns a default Transaction Mode:
 *
 * const initOptions = {
 *     extend: obj => {
 *         obj.myTx = function(options, cb) {
 *             const args = pgp.utils.taskArgs(arguments); // prepare arguments
 *
 *             if (!('mode' in args.options)) {
 *                 // if no 'mode' was specified, set default for transaction mode:
 *                 args.options.mode = myTxModeObject; // of type pgp.txMode.TransactionMode
 *             }
 *
 *             return obj.tx.apply(this, args);
 *             // or explicitly, if needed:
 *             // return obj.tx.call(this, args.options, args.cb);
 *         }
 *     }
 * };
 *
 */
function taskArgs(args) {

    if (!args || typeof args.length !== 'number') {
        throw new TypeError('Parameter \'args\' must be an array-like object of arguments.');
    }

    let options = args[0], cb;
    if (typeof options === 'function') {
        cb = options;
        options = {};
        if (cb.name) {
            options.tag = cb.name;
        }
    } else {
        if (typeof args[1] === 'function') {
            cb = args[1];
        }
        if (typeof options === 'string' || typeof options === 'number') {
            options = {tag: options};
        } else {
            options = (typeof options === 'object' && options) || {};
            if (!('tag' in options) && cb && cb.name) {
                options.tag = cb.name;
            }
        }
    }

    const res = [options, cb];

    Object.defineProperty(res, 'options', {
        get: function () {
            return this[0];
        },
        set: function (newValue) {
            this[0] = newValue;
        },
        enumerable: true
    });

    Object.defineProperty(res, 'cb', {
        get: function () {
            return this[1];
        },
        set: function (newValue) {
            this[1] = newValue;
        },
        enumerable: true
    });

    return res;
}

/**
 * @namespace utils
 *
 * @description
 * Namespace for general-purpose static functions, available as `pgp.utils`, before and after initializing the library.
 *
 * @property {function} camelize
 * {@link utils.camelize camelize} - camelizes a text string
 *
 * @property {function} camelizeVar
 * {@link utils.camelizeVar camelizeVar} - camelizes a text string as a variable
 *
 * @property {function} enumSql
 * {@link utils.enumSql enumSql} - enumerates SQL files in a directory
 *
 * @property {function} taskArgs
 * {@link utils.taskArgs taskArgs} - prepares arguments for tasks and transactions
 */
var _public = {
    camelize,
    camelizeVar,
    enumSql,
    taskArgs
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {InnerState} = innerState;
const {addInspection: addInspection$1} = utils$4;
const {assert: assert$2} = assert$d;

/**
 * @enum {number}
 * @alias txMode.isolationLevel
 * @readonly
 * @summary Transaction Isolation Level.
 * @description
 * The type is available from the {@link txMode} namespace.
 *
 * @see $[Transaction Isolation]
 */
const isolationLevel = {
    /** Isolation level not specified. */
    none: 0,

    /** ISOLATION LEVEL SERIALIZABLE */
    serializable: 1,

    /** ISOLATION LEVEL REPEATABLE READ */
    repeatableRead: 2,

    /** ISOLATION LEVEL READ COMMITTED */
    readCommitted: 3

    // From the official documentation: http://www.postgresql.org/docs/9.5/static/sql-set-transaction.html
    // The SQL standard defines one additional level, READ UNCOMMITTED. In PostgreSQL READ UNCOMMITTED is treated as READ COMMITTED.
    // => skipping `READ UNCOMMITTED`.
};

/**
 * @class txMode.TransactionMode
 * @description
 * Constructs a complete transaction-opening `BEGIN` command, from these options:
 *  - isolation level
 *  - access mode
 *  - deferrable mode
 *
 * The type is available from the {@link txMode} namespace.
 *
 * @param {} [options]
 * Transaction Mode options.
 *
 * @param {txMode.isolationLevel} [options.tiLevel]
 * Transaction Isolation Level.
 *
 * @param {boolean} [options.readOnly]
 * Sets transaction access mode based on the read-only flag:
 *  - `undefined` - access mode not specified (default)
 *  - `true` - access mode is set to `READ ONLY`
 *  - `false` - access mode is set to `READ WRITE`
 *
 * @param {boolean} [options.deferrable]
 * Sets transaction deferrable mode based on the boolean value:
 *  - `undefined` - deferrable mode not specified (default)
 *  - `true` - mode is set to `DEFERRABLE`
 *  - `false` - mode is set to `NOT DEFERRABLE`
 *
 * It is used only when `tiLevel`=`isolationLevel.serializable`
 * and `readOnly`=`true`, or else it is ignored.
 *
 * @returns {txMode.TransactionMode}
 *
 * @see $[BEGIN], {@link txMode.isolationLevel}
 *
 * @example
 *
 * const {TransactionMode, isolationLevel} = pgp.txMode;
 *
 * // Create a reusable transaction mode (serializable + read-only + deferrable):
 * const mode = new TransactionMode({
 *     tiLevel: isolationLevel.serializable,
 *     readOnly: true,
 *     deferrable: true
 * });
 *
 * db.tx({mode}, t => {
 *     return t.any('SELECT * FROM table');
 * })
 *     .then(data => {
 *         // success;
 *     })
 *     .catch(error => {
 *         // error
 *     });
 *
 * // Instead of the default BEGIN, such transaction will start with:
 *
 * // BEGIN ISOLATION LEVEL SERIALIZABLE READ ONLY DEFERRABLE
 *
 */
class TransactionMode extends InnerState {

    constructor(options) {
        options = assert$2(options, ['tiLevel', 'deferrable', 'readOnly']);
        const {readOnly, deferrable} = options;
        let {tiLevel} = options;
        let level, accessMode, deferrableMode, begin = 'begin';
        tiLevel = (tiLevel > 0) ? parseInt(tiLevel) : 0;

        if (tiLevel > 0 && tiLevel < 4) {
            const values = ['serializable', 'repeatable read', 'read committed'];
            level = 'isolation level ' + values[tiLevel - 1];
        }
        if (readOnly) {
            accessMode = 'read only';
        } else {
            if (readOnly !== undefined) {
                accessMode = 'read write';
            }
        }
        // From the official documentation: http://www.postgresql.org/docs/9.5/static/sql-set-transaction.html
        // The DEFERRABLE transaction property has no effect unless the transaction is also SERIALIZABLE and READ ONLY
        if (tiLevel === isolationLevel.serializable && readOnly) {
            if (deferrable) {
                deferrableMode = 'deferrable';
            } else {
                if (deferrable !== undefined) {
                    deferrableMode = 'not deferrable';
                }
            }
        }
        if (level) {
            begin += ' ' + level;
        }
        if (accessMode) {
            begin += ' ' + accessMode;
        }
        if (deferrableMode) {
            begin += ' ' + deferrableMode;
        }

        super({begin, capBegin: begin.toUpperCase()});
    }

    /**
     * @method txMode.TransactionMode#begin
     * @description
     * Returns a complete BEGIN statement, according to all the parameters passed into the class.
     *
     * This method is primarily for internal use by the library.
     *
     * @param {boolean} [cap=false]
     * Indicates whether the returned SQL must be capitalized.
     *
     * @returns {string}
     */
    begin(cap) {
        return cap ? this._inner.capBegin : this._inner.begin;
    }
}

addInspection$1(TransactionMode, function () {
    return this.begin(true);
});

/**
 * @namespace txMode
 * @description
 * Transaction Mode namespace, available as `pgp.txMode`, before and after initializing the library.
 *
 * Extends the default `BEGIN` with Transaction Mode parameters:
 *  - isolation level
 *  - access mode
 *  - deferrable mode
 *
 * @property {function} TransactionMode
 * {@link txMode.TransactionMode TransactionMode} class constructor.
 *
 * @property {txMode.isolationLevel} isolationLevel
 * Transaction Isolation Level enumerator
 *
 * @see $[BEGIN]
 */
var txMode = {
    isolationLevel,
    TransactionMode
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {ColorConsole: ColorConsole$1} = color;

const npm$d = {
    main: lib,
    utils: utils$4
};

/////////////////////////////////
// Client notification helpers;
let Events$5 = class Events {

    /**
     * @event connect
     * @description
     * Global notification of acquiring a new database connection from the connection pool, i.e. a virtual connection.
     *
     * However, for direct calls to method {@link Database#connect Database.connect} with parameter `{direct: true}`,
     * this event represents a physical connection.
     *
     * The library will suppress any error thrown by the handler and write it into the console.
     *
     * @param {{}} e Event Properties
     *
     * @param {external:Client} e.client
     * $[pg.Client] object that represents the connection.
     *
     * @param {*} e.dc
     * Database Context that was used when creating the database object (see {@link Database}).
     *
     * @param {number} e.useCount
     * Number of times the connection has been previously used, starting with 0, for a freshly
     * allocated physical connection.
     *
     * This parameter is always 0 for direct connections (created by calling {@link Database#connect Database.connect}
     * with parameter `{direct: true}`).
     *
     * @example
     *
     * const initOptions = {
     *
     *     // pg-promise initialization options...
     *
     *     connect(e) {
     *         const cp = e.client.connectionParameters;
     *         console.log('Connected to database:', cp.database);
     *     }
     *
     * };
     */
    static connect(ctx, client, useCount) {
        if (typeof ctx.options.connect === 'function') {
            try {
                ctx.options.connect({client, dc: ctx.dc, useCount});
            } catch (e) {
                // have to silence errors here;
                // cannot allow unhandled errors while connecting to the database,
                // as it will break the connection logic;
                Events.unexpected('connect', e);
            }
        }
    }

    /**
     * @event disconnect
     * @description
     * Global notification of releasing a database connection back to the connection pool, i.e. releasing the virtual connection.
     *
     * However, when releasing a direct connection (created by calling {@link Database#connect Database.connect} with parameter
     * `{direct: true}`), this event represents a physical disconnection.
     *
     * The library will suppress any error thrown by the handler and write it into the console.
     *
     * @param {{}} e Event Properties
     *
     * @param {external:Client} e.client - $[pg.Client] object that represents connection with the database.
     *
     * @param {*} e.dc - Database Context that was used when creating the database object (see {@link Database}).
     *
     * @example
     *
     * const initOptions = {
     *
     *     // pg-promise initialization options...
     *
     *     disconnect(e) {
     *        const cp = e.client.connectionParameters;
     *        console.log('Disconnecting from database:', cp.database);
     *     }
     *
     * };
     */
    static disconnect(ctx, client) {
        if (typeof ctx.options.disconnect === 'function') {
            try {
                ctx.options.disconnect({client, dc: ctx.dc});
            } catch (e) {
                // have to silence errors here;
                // cannot allow unhandled errors while disconnecting from the database,
                // as it will break the disconnection logic;
                Events.unexpected('disconnect', e);
            }
        }
    }

    /**
     * @event query
     * @description
     *
     * Global notification of a query that's about to execute.
     *
     * Notification happens just before the query execution. And if the handler throws an error, the query execution
     * will be rejected with that error.
     *
     * @param {EventContext} e
     * Event Context Object.
     *
     * @example
     *
     * const initOptions = {
     *
     *     // pg-promise initialization options...
     *
     *     query(e) {
     *         console.log('QUERY:', e.query);
     *     }
     * };
     */
    static query(options, context) {
        if (typeof options.query === 'function') {
            try {
                options.query(context);
            } catch (e) {
                // throwing an error during event 'query'
                // will result in a reject for the request.
                return e instanceof Error ? e : new npm$d.utils.InternalError(e);
            }
        }
    }

    /**
     * @event receive
     * @description
     * Global notification of any data received from the database, coming from a regular query or from a stream.
     *
     * The event is fired before the data reaches the client, and it serves two purposes:
     *  - Providing selective data logging for debugging;
     *  - Pre-processing data before it reaches the client.
     *
     * **NOTES:**
     * - If you alter the size of `data` directly or through the `result` object, it may affect `QueryResultMask`
     *   validation for regular queries, which is executed right after.
     * - Any data pre-processing needs to be fast here, to avoid performance penalties.
     * - If the event handler throws an error, the original request will be rejected with that error.
     *
     * For methods {@link Database#multi Database.multi} and {@link Database#multiResult Database.multiResult},
     * this event is called for every result that's returned. And for method {@link Database#stream Database.stream},
     * the event occurs for every record.
     *
     * @param {{}} e Event Properties
     *
     * @param {Array<Object>} e.data
     * Array of received objects/rows.
     *
     * If any of those objects are modified during notification, the client will receive the modified data.
     *
     * @param {external:Result} e.result
     * - Original $[Result] object, if the data is from a non-stream query, in which case `data = result.rows`.
     *   For single-query requests, $[Result] object is extended with property `duration` - number of milliseconds
     *   it took to send the query, execute it and get the result back.
     * - It is `undefined` when the data comes from a stream (method {@link Database#stream Database.stream}).
     *
     * @param {EventContext} e.ctx
     * Event Context Object.
     *
     * @example
     *
     * // Example below shows the fastest way to camelize all column names.
     * // NOTE: The example does not do processing for nested JSON objects.
     *
     * const initOptions = {
     *
     *     // pg-promise initialization options...
     *
     *     receive(e) {
     *         camelizeColumns(e.data);
     *     }
     * };
     *
     * function camelizeColumns(data) {
     *     const tmp = data[0];
     *     for (const prop in tmp) {
     *         const camel = pgp.utils.camelize(prop);
     *         if (!(camel in tmp)) {
     *             for (let i = 0; i < data.length; i++) {
     *                 const d = data[i];
     *                 d[camel] = d[prop];
     *                 delete d[prop];
     *             }
     *         }
     *     }
     * }
     */
    static receive(options, data, result, ctx) {
        if (typeof options.receive === 'function') {
            try {
                options.receive({data, result, ctx});
            } catch (e) {
                // throwing an error during event 'receive'
                // will result in a reject for the request.
                return e instanceof Error ? e : new npm$d.utils.InternalError(e);
            }
        }
    }

    /**
     * @event task
     * @description
     * Global notification of a task start / finish events, as executed via
     * {@link Database#task Database.task} or {@link Database#taskIf Database.taskIf}.
     *
     * The library will suppress any error thrown by the handler and write it into the console.
     *
     * @param {EventContext} e
     * Event Context Object.
     *
     * @example
     *
     * const initOptions = {
     *
     *     // pg-promise initialization options...
     *
     *     task(e) {
     *         if (e.ctx.finish) {
     *             // this is a task->finish event;
     *             console.log('Duration:', e.ctx.duration);
     *             if (e.ctx.success) {
     *                 // e.ctx.result = resolved data;
     *             } else {
     *                 // e.ctx.result = error/rejection reason;
     *             }
     *         } else {
     *             // this is a task->start event;
     *             console.log('Start Time:', e.ctx.start);
     *         }
     *     }
     * };
     *
     */
    static task(options, context) {
        if (typeof options.task === 'function') {
            try {
                options.task(context);
            } catch (e) {
                // silencing the error, to avoid breaking the task;
                Events.unexpected('task', e);
            }
        }
    }

    /**
     * @event transact
     * @description
     * Global notification of a transaction start / finish events, as executed via {@link Database#tx Database.tx}
     * or {@link Database#txIf Database.txIf}.
     *
     * The library will suppress any error thrown by the handler and write it into the console.
     *
     * @param {EventContext} e
     * Event Context Object.
     *
     * @example
     *
     * const initOptions = {
     *
     *     // pg-promise initialization options...
     *
     *     transact(e) {
     *         if (e.ctx.finish) {
     *             // this is a transaction->finish event;
     *             console.log('Duration:', e.ctx.duration);
     *             if (e.ctx.success) {
     *                 // e.ctx.result = resolved data;
     *             } else {
     *                 // e.ctx.result = error/rejection reason;
     *             }
     *         } else {
     *             // this is a transaction->start event;
     *             console.log('Start Time:', e.ctx.start);
     *         }
     *     }
     * };
     *
     */
    static transact(options, context) {
        if (typeof options.transact === 'function') {
            try {
                options.transact(context);
            } catch (e) {
                // silencing the error, to avoid breaking the transaction;
                Events.unexpected('transact', e);
            }
        }
    }

    /**
     * @event error
     * @description
     * Global notification of every error encountered by this library.
     *
     * The library will suppress any error thrown by the handler and write it into the console.
     *
     * @param {*} err
     * The error encountered, of the same value and type as it was reported.
     *
     * @param {EventContext} e
     * Event Context Object.
     *
     * @example
     * const initOptions = {
     *
     *     // pg-promise initialization options...
     *
     *     error(err, e) {
     *
     *         if (e.cn) {
     *             // this is a connection-related error
     *             // cn = safe connection details passed into the library:
     *             //      if password is present, it is masked by #
     *         }
     *
     *         if (e.query) {
     *             // query string is available
     *             if (e.params) {
     *                 // query parameters are available
     *             }
     *         }
     *
     *         if (e.ctx) {
     *             // occurred inside a task or transaction
     *         }
     *       }
     * };
     *
     */
    static error(options, err, context) {
        if (typeof options.error === 'function') {
            try {
                options.error(err, context);
            } catch (e) {
                // have to silence errors here;
                // throwing unhandled errors while handling an error
                // notification is simply not acceptable.
                Events.unexpected('error', e);
            }
        }
    }

    /**
     * @event extend
     * @description
     * Extends {@link Database} protocol with custom methods and properties.
     *
     * Override this event to extend the existing access layer with your own functions and
     * properties best suited for your application.
     *
     * The extension thus becomes available across all access layers:
     *
     * - Within the root/default database protocol;
     * - Inside transactions, including nested ones;
     * - Inside tasks, including nested ones.
     *
     * All pre-defined methods and properties are read-only, so you will get an error,
     * if you try overriding them.
     *
     * The library will suppress any error thrown by the handler and write it into the console.
     *
     * @param {object} obj - Protocol object to be extended.
     *
     * @param {*} dc - Database Context that was used when creating the {@link Database} object.
     *
     * @see $[pg-promise-demo]
     *
     * @example
     *
     * // In the example below we extend the protocol with function `addImage`
     * // that will insert one binary image and resolve with the new record id.
     *
     * const initOptions = {
     *
     *     // pg-promise initialization options...
     *
     *     extend(obj, dc) {
     *         // dc = database context;
     *         obj.addImage = data => {
     *             // adds a new image and resolves with its record id:
     *             return obj.one('INSERT INTO images(data) VALUES($1) RETURNING id', data, a => a.id);
     *         }
     *     }
     * };
     *
     * @example
     *
     * // It is best to extend the protocol by adding whole entity repositories to it as shown in the following example.
     * // For a comprehensive example see https://github.com/vitaly-t/pg-promise-demo
     *
     * class UsersRepository {
     *     constructor(rep, pgp) {
     *         this.rep = rep;
     *         this.pgp = pgp;
     *     }
     *
     *     add(name) {
     *         return this.rep.one('INSERT INTO users(name) VALUES($1) RETURNING id', name, a => a.id);
     *     }
     *
     *     remove(id) {
     *         return this.rep.none('DELETE FROM users WHERE id = $1', id);
     *     }
     * }
     *
     * // Overriding 'extend' event;
     * const initOptions = {
     *
     *     // pg-promise initialization options...
     *
     *     extend(obj, dc) {
     *         // dc = database context;
     *         obj.users = new UsersRepository(obj, pgp);
     *         // You can set different repositories based on `dc`
     *     }
     * };
     *
     * // Usage example:
     * db.users.add('John', true)
     *     .then(id => {
     *         // user added successfully, id = new user's id
     *     })
     *     .catch(error => {
     *         // failed to add the user;
     *     });
     *
     */
    static extend(options, obj, dc) {
        if (typeof options.extend === 'function') {
            try {
                options.extend.call(obj, obj, dc);
            } catch (e) {
                // have to silence errors here;
                // the result of throwing unhandled errors while
                // extending the protocol would be unpredictable.
                Events.unexpected('extend', e);
            }
        }
    }

    /**
     * @event unexpected
     * @param {string} event - unhandled event name.
     * @param {string|Error} e - unhandled error.
     * @private
     */
    static unexpected(event, e) {
        // If you should ever get here, your app is definitely broken, and you need to fix
        // your event handler to prevent unhandled errors during event notifications.
        //
        // Console output is suppressed when running tests, to avoid polluting test output
        // with error messages that are intentional and of no value to the test.

        /* istanbul ignore if */
        if (!npm$d.main.suppressErrors) {
            const stack = e instanceof Error ? e.stack : new Error().stack;
            ColorConsole$1.error(`Unexpected error in '${event}' event handler.\n${stack}\n`);
        }
    }
};

var events = {Events: Events$5};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const specialQueryType = {
    result: 0,
    multiResult: 1,
    stream: 2
};

let SpecialQuery$1 = class SpecialQuery {
    constructor(type) {
        this.isResult = type === specialQueryType.result; // type used implicitly
        this.isStream = type === specialQueryType.stream;
        this.isMultiResult = type === specialQueryType.multiResult;
    }
};

const cache = {
    resultQuery: new SpecialQuery$1(specialQueryType.result),
    multiResultQuery: new SpecialQuery$1(specialQueryType.multiResult),
    streamQuery: new SpecialQuery$1(specialQueryType.stream)
};

var specialQuery = Object.assign({SpecialQuery: SpecialQuery$1}, cache);

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

/**
 * @class ConnectionContext
 * @private
 * @summary Internal connection context.
 *
 * @param {object} cc
 * Connection Context.
 *
 * @param {object} cc.cn
 * Connection details
 *
 * @param {*} cc.dc
 * Database Context
 *
 * @param {object} cc.options
 * Library's Initialization Options
 *
 * @param {object} cc.db
 * Database Session we're attached to, if any.
 *
 * @param {number} cc.level
 * Task Level
 *
 * @param {number} cc.txLevel
 * Transaction Level
 *
 * @param {object} cc.parentCtx
 * Connection Context of the parent operation, if any.
 *
 */
let ConnectionContext$1 = class ConnectionContext {

    constructor(cc) {
        this.cn = cc.cn; // connection details;
        this.dc = cc.dc; // database context;
        this.options = cc.options; // library options;
        this.db = cc.db; // database session;
        this.level = cc.level; // task level;
        this.txLevel = cc.txLevel; // transaction level;
        this.parentCtx = null; // parent context
        this.taskCtx = null; // task context
        this.start = null; // Date/Time when connected
        this.txCount = 0;
    }

    connect(db) {
        this.db = db;
        this.start = new Date();
    }

    disconnect(kill) {
        if (this.db) {
            const p = this.db.release(kill);
            this.db = null;
            return p;
        }
    }

    clone() {
        const obj = new ConnectionContext(this);
        obj.parent = this;
        obj.parentCtx = this.taskCtx;
        return obj;
    }

    get nextTxCount() {
        let txCurrent = this, txTop = this;
        while (txCurrent.parent) {
            txCurrent = txCurrent.parent;
            if (txCurrent.taskCtx && txCurrent.taskCtx.isTX) {
                txTop = txCurrent;
            }
        }
        return txTop.txCount++;
    }
};

/**
 * Connection Context
 * @module context
 * @author Vitaly Tomilov
 * @private
 */
var context = {ConnectionContext: ConnectionContext$1};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {Events: Events$4} = events;
const {ColorConsole} = color;

const npm$c = {
    utils: utils$4,
    text: text,
    formatting: formatting
};

function poolConnect(ctx, db, config) {
    return config.promise((resolve, reject) => {
        const p = db.$pool;
        if (p.ending) {
            db.$destroy();
            const err = new Error(npm$c.text.poolDestroyed);
            Events$4.error(ctx.options, err, {
                dc: ctx.dc
            });
            reject(err);
            return;
        }
        p.connect((err, client) => {
            if (err) {
                Events$4.error(ctx.options, err, {
                    cn: npm$c.utils.getSafeConnection(ctx.cn),
                    dc: ctx.dc
                });
                reject(err);
            } else {
                if ('$useCount' in client) {
                    // Make sure useCount drops to 1, if it ever reaches maximum integer number;
                    // We do not drop it to zero, to avoid rerun of initialization queries that
                    // usually check for useCount === 0;
                    // istanbul ignore if
                    if (client.$useCount >= Number.MAX_SAFE_INTEGER) {
                        client.$useCount = 1; // resetting; cannot auto-test this
                    } else {
                        client.$useCount = ++client.$useCount;
                    }
                } else {
                    Object.defineProperty(client, '$useCount', {
                        value: 0,
                        configurable: false,
                        enumerable: false,
                        writable: true
                    });
                    setSchema(client, ctx);
                }
                setCtx(client, ctx);
                const end = lockClientEnd(client);
                client.on('error', onError$1);
                resolve({
                    client,
                    useCount: client.$useCount,
                    release(kill) {
                        client.end = end;
                        client.release(kill || client.$connectionError);
                        Events$4.disconnect(ctx, client);
                        client.removeListener('error', onError$1);
                    }
                });
                Events$4.connect(ctx, client, client.$useCount);
            }
        });
    });
}

function directConnect(ctx, config) {
    return config.promise((resolve, reject) => {
        const client = new config.pgp.pg.Client(ctx.cn);
        client.connect(err => {
            if (err) {
                Events$4.error(ctx.options, err, {
                    cn: npm$c.utils.getSafeConnection(ctx.cn),
                    dc: ctx.dc
                });
                reject(err);
            } else {
                setSchema(client, ctx);
                setCtx(client, ctx);
                const end = lockClientEnd(client);
                client.on('error', onError$1);
                resolve({
                    client,
                    useCount: 0,
                    release() {
                        client.end = end;
                        const p = config.promise((res, rej) => client.end().then(res).catch(rej));
                        Events$4.disconnect(ctx, client);
                        client.removeListener('error', onError$1);
                        return p;
                    }
                });
                Events$4.connect(ctx, client, 0);
            }
        });
    });
}

// this event only happens when the connection is lost physically,
// which cannot be tested automatically; removing from coverage:
// istanbul ignore next
function onError$1(err) {
    const ctx = this.$ctx;
    const cn = npm$c.utils.getSafeConnection(ctx.cn);
    Events$4.error(ctx.options, err, {cn, dc: ctx.dc});
    if (ctx.cnOptions && typeof ctx.cnOptions.onLost === 'function' && !ctx.notified) {
        try {
            ctx.cnOptions.onLost.call(this, err, {
                cn,
                dc: ctx.dc,
                start: ctx.start,
                client: this
            });
        } catch (e) {
            ColorConsole.error(e && e.stack || e);
        }
        ctx.notified = true;
    }
}

function lockClientEnd(client) {
    const end = client.end;
    client.end = doNotCall => {
        // This call can happen only in the following two cases:
        // 1. the client made the call directly, against the library's documentation (invalid code)
        // 2. connection with the server broke, and the pool is terminating all clients forcefully.
        ColorConsole.error(`${npm$c.text.clientEnd}\n${npm$c.utils.getLocalStack(1, 3)}\n`);
        if (!doNotCall) {
            end.call(client);
        }
    };
    return end;
}

function setCtx(client, ctx) {
    Object.defineProperty(client, '$ctx', {
        value: ctx,
        writable: true
    });
}

function setSchema(client, ctx) {
    let s = ctx.options.schema;
    if (!s) {
        return;
    }
    if (typeof s === 'function') {
        s = s.call(ctx.dc, ctx.dc);
    }
    if (Array.isArray(s)) {
        s = s.filter(a => a && typeof a === 'string');
    }
    if (typeof s === 'string' || (Array.isArray(s) && s.length)) {
        client.query(npm$c.formatting.as.format('SET search_path TO $1:name', [s]), err => {
            // istanbul ignore if;
            if (err) {
                // This is unlikely to ever happen, unless the connection is created faulty,
                // and fails on the very first query, which is impossible to test automatically.
                throw err;
            }
        });
    }
}

var connect = config => ({
    pool: (ctx, db) => poolConnect(ctx, db, config),
    direct: ctx => directConnect(ctx, config)
});

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {Events: Events$3} = events;

const npm$b = {
    utils: utils$4,
    text: text
};

////////////////////////////////////////////
// Streams query data into any destination,
// with the help of pg-query-stream library.
function $stream(ctx, qs, initCB, config) {

    const $p = config.promise;

    // istanbul ignore next:
    // we do not provide code coverage for the Native Bindings specifics
    if (ctx.options.pgNative) {
        return $p.reject(new Error(npm$b.text.nativeStreaming));
    }
    // Stream class was renamed again, see the following issue:
    // https://github.com/brianc/node-postgres/issues/2412
    if (!qs || !qs.constructor || qs.constructor.name !== 'QueryStream') {
        // invalid or missing stream object;
        return $p.reject(new TypeError(npm$b.text.invalidStream));
    }
    if (qs._reading || qs._closed) {
        // stream object is in the wrong state;
        return $p.reject(new Error(npm$b.text.invalidStreamState));
    }
    if (typeof initCB !== 'function') {
        // parameter `initCB` must be passed as the initialization callback;
        return $p.reject(new TypeError(npm$b.text.invalidStreamCB));
    }

    let error = Events$3.query(ctx.options, getContext());

    if (error) {
        error = getError(error);
        Events$3.error(ctx.options, error, getContext());
        return $p.reject(error);
    }

    const stream = ctx.db.client.query(qs);

    stream.on('data', onData);
    stream.on('error', onError);
    stream.on('end', onEnd);

    try {
        initCB.call(this, stream); // the stream must be initialized during the call;
    } catch (e) {
        release();
        error = getError(e);
        Events$3.error(ctx.options, error, getContext());
        return $p.reject(error);
    }

    const start = Date.now();
    let resolve, reject, nRows = 0;

    function onData(data) {
        nRows++;
        error = Events$3.receive(ctx.options, [data], undefined, getContext());
        if (error) {
            onError(error);
        }
    }

    function onError(e) {
        release();
        stream.destroy();
        e = getError(e);
        Events$3.error(ctx.options, e, getContext());
        reject(e);
    }

    function onEnd() {
        release();
        resolve({
            processed: nRows, // total number of rows processed;
            duration: Date.now() - start // duration, in milliseconds;
        });
    }

    function release() {
        stream.removeListener('data', onData);
        stream.removeListener('error', onError);
        stream.removeListener('end', onEnd);
    }

    function getError(e) {
        return e instanceof npm$b.utils.InternalError ? e.error : e;
    }

    function getContext() {
        let client;
        if (ctx.db) {
            client = ctx.db.client;
        } else {
            error = new Error(npm$b.text.looseQuery);
        }
        return {
            client,
            dc: ctx.dc,
            query: qs.cursor.text,
            params: qs.cursor.values,
            ctx: ctx.ctx
        };
    }

    return $p((res, rej) => {
        resolve = res;
        reject = rej;
    });

}

var stream$1 = $stream;

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {Events: Events$2} = events;
const {QueryFile: QueryFile$1} = queryFile;
const {ServerFormatting, PreparedStatement: PreparedStatement$1, ParameterizedQuery: ParameterizedQuery$1} = types;
const {SpecialQuery} = specialQuery;
const {queryResult: queryResult$2} = queryResult_1;

const npm$a = {
    util: require$$0,
    utils: utils$4,
    formatting: formatting,
    errors: errors$1,
    stream: stream$1,
    text: text
};

const QueryResultError = npm$a.errors.QueryResultError,
    InternalError = npm$a.utils.InternalError,
    qrec = npm$a.errors.queryResultErrorCode;

const badMask = queryResult$2.one | queryResult$2.many; // unsupported combination bit-mask;

//////////////////////////////
// Generic query method;
function $query(ctx, query, values, qrm, config) {

    const special = qrm instanceof SpecialQuery && qrm;
    const $p = config.promise;

    if (special && special.isStream) {
        return npm$a.stream.call(this, ctx, query, values, config);
    }

    const opt = ctx.options,
        capSQL = opt.capSQL;

    let error, entityType, queryFilePath,
        pgFormatting = opt.pgFormatting,
        params = pgFormatting ? values : undefined;

    if (typeof query === 'function') {
        try {
            query = npm$a.formatting.resolveFunc(query, values);
        } catch (e) {
            error = e;
            params = values;
            query = npm$a.util.inspect(query);
        }
    }

    if (!error && !query) {
        error = new TypeError(npm$a.text.invalidQuery);
    }

    if (!error && typeof query === 'object') {
        if (query instanceof QueryFile$1) {
            query.prepare();
            if (query.error) {
                error = query.error;
                query = query.file;
            } else {
                queryFilePath = query.file;
                query = query[QueryFile$1.$query];
            }
        } else {
            if ('entity' in query) {
                entityType = query.type;
                query = query.entity; // query is a function name;
            } else {
                if (query instanceof ServerFormatting) {
                    pgFormatting = true;
                } else {
                    if ('name' in query) {
                        query = new PreparedStatement$1(query);
                        pgFormatting = true;
                    } else {
                        if ('text' in query) {
                            query = new ParameterizedQuery$1(query);
                            pgFormatting = true;
                        }
                    }
                }
                if (query instanceof ServerFormatting && !npm$a.utils.isNull(values)) {
                    query.values = values;
                }
            }
        }
    }

    if (!error) {
        if (!pgFormatting && !npm$a.utils.isText(query)) {
            const errTxt = entityType ? (entityType === 'func' ? npm$a.text.invalidFunction : npm$a.text.invalidProc) : npm$a.text.invalidQuery;
            error = new TypeError(errTxt);
        }
        if (query instanceof ServerFormatting) {
            const qp = query.parse();
            if (qp instanceof Error) {
                error = qp;
            } else {
                query = qp;
            }
        }
    }

    if (!error && !special) {
        if (npm$a.utils.isNull(qrm)) {
            qrm = queryResult$2.any; // default query result;
        } else {
            if (qrm !== parseInt(qrm) || (qrm & badMask) === badMask || qrm < 1 || qrm > 6) {
                error = new TypeError(npm$a.text.invalidMask);
            }
        }
    }

    if (!error && (!pgFormatting || entityType)) {
        try {
            // use 'pg-promise' implementation of values formatting;
            if (entityType) {
                params = undefined;
                query = npm$a.formatting.formatEntity(query, values, {capSQL, type: entityType});
            } else {
                query = npm$a.formatting.formatQuery(query, values);
            }
        } catch (e) {
            if (entityType) {
                let prefix = entityType === 'func' ? 'select * from' : 'call';
                if (capSQL) {
                    prefix = prefix.toUpperCase();
                }
                query = prefix + ' ' + query + '(...)';
            } else {
                params = values;
            }
            error = e instanceof Error ? e : new npm$a.utils.InternalError(e);
        }
    }

    return $p((resolve, reject) => {

        if (notifyReject()) {
            return;
        }
        error = Events$2.query(opt, getContext());
        if (notifyReject()) {
            return;
        }
        try {
            const start = Date.now();
            ctx.db.client.query(query, params, (err, result) => {
                let data, multiResult, lastResult = result;
                if (err) {
                    // istanbul ignore if (auto-testing connectivity issues is too problematic)
                    if (npm$a.utils.isConnectivityError(err)) {
                        ctx.db.client.$connectionError = err;
                    }
                    err.query = err.query || query;
                    err.params = err.params || params;
                    error = err;
                } else {
                    multiResult = Array.isArray(result);
                    if (multiResult) {
                        lastResult = result[result.length - 1];
                        for (let i = 0; i < result.length; i++) {
                            const r = result[i];
                            makeIterable(r);
                            error = Events$2.receive(opt, r.rows, r, getContext());
                            if (error) {
                                break;
                            }
                        }
                    } else {
                        makeIterable(result);
                        result.duration = Date.now() - start;
                        error = Events$2.receive(opt, result.rows, result, getContext());
                    }
                }
                if (!error) {
                    data = lastResult;
                    if (special) {
                        if (special.isMultiResult) {
                            data = multiResult ? result : [result]; // method .multiResult() is called
                        }
                        // else, method .result() is called
                    } else {
                        data = data.rows;
                        const len = data.length;
                        if (len) {
                            if (len > 1 && qrm & queryResult$2.one) {
                                // one row was expected, but returned multiple;
                                error = new QueryResultError(qrec.multiple, lastResult, query, params);
                            } else {
                                if (!(qrm & (queryResult$2.one | queryResult$2.many))) {
                                    // no data should have been returned;
                                    error = new QueryResultError(qrec.notEmpty, lastResult, query, params);
                                } else {
                                    if (!(qrm & queryResult$2.many)) {
                                        data = data[0];
                                    }
                                }
                            }
                        } else {
                            // no data returned;
                            if (qrm & queryResult$2.none) {
                                if (qrm & queryResult$2.one) {
                                    data = null;
                                } else {
                                    data = qrm & queryResult$2.many ? data : null;
                                }
                            } else {
                                error = new QueryResultError(qrec.noData, lastResult, query, params);
                            }
                        }
                    }
                }

                if (!notifyReject()) {
                    resolve(data);
                }
            });
        } catch (e) {
            // this can only happen as a result of an internal failure within node-postgres,
            // like during a sudden loss of communications, which is impossible to reproduce
            // automatically, so removing it from the test coverage:
            // istanbul ignore next
            error = e;
        }

        function getContext() {
            let client;
            if (ctx.db) {
                client = ctx.db.client;
            } else {
                error = new Error(npm$a.text.looseQuery);
            }
            return {
                client, query, params, queryFilePath, values,
                dc: ctx.dc,
                ctx: ctx.ctx
            };
        }

        notifyReject();

        function notifyReject() {
            const context = getContext();
            if (error) {
                if (error instanceof InternalError) {
                    error = error.error;
                }
                Events$2.error(opt, error, context);
                reject(error);
                return true;
            }
        }
    });
}

// Extends Result to provide iterable for the rows;
// See: https://github.com/brianc/node-postgres/pull/2861
function makeIterable(r) {
    r[Symbol.iterator] = function () {
        return this.rows.values();
    };
}

var query = config => {
    return function (ctx, query, values, qrm) {
        return $query.call(this, ctx, query, values, qrm, config);
    };
};

const npm$9 = {
    stream: Stream,
    util: require$$0
};

/////////////////////////////////////
// Checks if the value is a promise;
function isPromise(value) {
    return value && typeof value.then === 'function';
}

////////////////////////////////////////////
// Checks object for being a readable stream;
function isReadableStream(obj) {
    return obj instanceof npm$9.stream.Stream &&
        typeof obj._read === 'function' &&
        typeof obj._readableState === 'object';
}

////////////////////////////////////////////////////////////
// Sets an object property as read-only and non-enumerable.
function extend(obj, name, value) {
    Object.defineProperty(obj, name, {
        value,
        configurable: false,
        enumerable: false,
        writable: false
    });
}

///////////////////////////////////////////
// Returns a space gap for console output;
function messageGap(level) {
    return ' '.repeat(level * 4);
}

function formatError(error, level) {
    const names = ['BatchError', 'PageError', 'SequenceError'];
    let msg = npm$9.util.inspect(error);
    if (error instanceof Error) {
        if (names.indexOf(error.name) === -1) {
            const gap = messageGap(level);
            msg = msg.split('\n').map((line, index) => {
                return (index ? gap : '') + line;
            }).join('\n');
        } else {
            msg = error.toString(level);
        }
    }
    return msg;
}

////////////////////////////////////////////////////////
// Adds prototype inspection, with support of the newer
// Custom Inspection, which was added in Node.js 6.x
function addInspection(type, cb) {
    // istanbul ignore next;
    if (npm$9.util.inspect.custom) {
        // Custom inspection is supported:
        type.prototype[npm$9.util.inspect.custom] = cb;
    } else {
        // Use classic inspection:
        type.prototype.inspect = cb;
    }
}

var _static = {
    addInspection,
    formatError,
    isPromise,
    isReadableStream,
    messageGap,
    extend
};

const npm$8 = {
    stat: _static
};

var utils = function ($p) {

    const exp = {
        formatError: npm$8.stat.formatError,
        isPromise: npm$8.stat.isPromise,
        isReadableStream: npm$8.stat.isReadableStream,
        messageGap: npm$8.stat.messageGap,
        extend: npm$8.stat.extend,
        resolve,
        wrap
    };

    return exp;

    //////////////////////////////////////////
    // Checks if the function is a generator,
    // and if so - wraps it up into a promise;
    function wrap(func) {
        if (typeof func === 'function') {
            if (func.constructor.name === 'GeneratorFunction') {
                return asyncAdapter(func);
            }
            return func;
        }
        return null;
    }

    /////////////////////////////////////////////////////
    // Resolves a mixed value into the actual value,
    // consistent with the way mixed values are defined:
    // https://github.com/vitaly-t/spex/wiki/Mixed-Values
    function resolve(value, params, onSuccess, onError) {

        const self = this;
        let delayed = false;

        function loop() {
            while (typeof value === 'function') {
                if (value.constructor.name === 'GeneratorFunction') {
                    value = asyncAdapter(value);
                }
                try {
                    value = params ? value.apply(self, params) : value.call(self);
                } catch (e) {
                    onError(e, false); // false means 'threw an error'
                    return;
                }
            }
            if (exp.isPromise(value)) {
                value
                    .then(data => {
                        delayed = true;
                        value = data;
                        loop();
                        return null; // this dummy return is just to prevent Bluebird warnings;
                    })
                    .catch(error => {
                        onError(error, true); // true means 'rejected'
                    });
            } else {
                onSuccess(value, delayed);
            }
        }

        loop();
    }

    // Generator-to-Promise adapter;
    // Based on: https://www.promisejs.org/generators/#both
    function asyncAdapter(generator) {
        return function () {
            const g = generator.apply(this, arguments);

            function handle(result) {
                if (result.done) {
                    return $p.resolve(result.value);
                }
                return $p.resolve(result.value)
                    .then(res => handle(g.next(res)), err => handle(g.throw(err)));
            }

            return handle(g.next());
        };
    }

};

const npm$7 = {
    u: require$$0,
    os: require$$1,
    utils: _static
};

/**
 * @class errors.BatchError
 * @augments external:Error
 * @description
 * This type represents all errors rejected by method {@link batch}, except for {@link external:TypeError TypeError}
 * when the method receives invalid input parameters.
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `BatchError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * It represents the message of the first error encountered in the batch, and is a safe
 * version of using `first.message`.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {array} data
 * Array of objects `{success, result, [origin]}`:
 * - `success` = true/false, indicates whether the corresponding value in the input array was resolved.
 * - `result` = resolved data, if `success`=`true`, or else the rejection reason.
 * - `origin` - set only when failed as a result of an unsuccessful call into the notification callback
 *    (parameter `cb` of method {@link batch})
 *
 * The array has the same size as the input one that was passed into method {@link batch}, providing direct mapping.
 *
 * @property {} stat
 * Resolution Statistics.
 *
 * @property {number} stat.total
 * Total number of elements in the batch.
 *
 * @property {number} stat.succeeded
 * Number of resolved values in the batch.
 *
 * @property {number} stat.failed
 * Number of rejected values in the batch.
 *
 * @property {number} stat.duration
 * Time in milliseconds it took to settle all values.
 *
 * @property {} first
 * The very first error within the batch, with support for nested batch results, it is also the same error
 * as $[promise.all] would provide.
 *
 * @see {@link batch}
 *
 */
let BatchError$1 = class BatchError extends Error {

    constructor(result, errors, duration) {

        function getErrors() {
            const err = new Array(errors.length);
            for (let i = 0; i < errors.length; i++) {
                err[i] = result[errors[i]].result;
                if (err[i] instanceof BatchError) {
                    err[i] = err[i].getErrors();
                }
            }
            npm$7.utils.extend(err, '$isErrorList', true);
            return err;
        }

        const e = getErrors();

        let first = e[0];

        while (first && first.$isErrorList) {
            first = first[0];
        }

        let message;

        if (first instanceof Error) {
            message = first.message;
        } else {
            if (typeof first !== 'string') {
                first = npm$7.u.inspect(first);
            }
            message = first;
        }

        super(message);
        this.name = this.constructor.name;

        this.data = result;

        // we do not show it within the inspect, because when the error
        // happens for a nested result, the output becomes a mess.
        this.first = first;

        this.stat = {
            total: result.length,
            succeeded: result.length - e.length,
            failed: e.length,
            duration
        };

        this.getErrors = getErrors;

        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * @method errors.BatchError.getErrors
     * @description
     * Returns the complete list of errors only.
     *
     * It supports nested batch results, presented as a sub-array.
     *
     * @returns {array}
     */
};

/**
 * @method errors.BatchError.toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * The output is an abbreviated version of the error, because the complete error
 * is often too much for displaying or even logging, as a batch can be of any size.
 * Therefore, only errors are rendered from the `data` property, alongside their indexes,
 * and only up to the first 5, to avoid polluting the screen or the log file.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
BatchError$1.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    const gap0 = npm$7.utils.messageGap(level),
        gap1 = npm$7.utils.messageGap(level + 1),
        gap2 = npm$7.utils.messageGap(level + 2),
        lines = [
            'BatchError {',
            gap1 + 'stat: { total: ' + this.stat.total + ', succeeded: ' + this.stat.succeeded +
            ', failed: ' + this.stat.failed + ', duration: ' + this.stat.duration + ' }',
            gap1 + 'errors: ['
        ];

    // In order to avoid polluting the error log or the console, 
    // we limit the log output to the top 5 errors:
    const maxErrors = 5;
    let counter = 0;
    this.data.forEach((d, index) => {
        if (!d.success && counter < maxErrors) {
            lines.push(gap2 + index + ': ' + npm$7.utils.formatError(d.result, level + 2));
            counter++;
        }
    });
    lines.push(gap1 + ']');
    lines.push(gap0 + '}');
    return lines.join(npm$7.os.EOL);
};

npm$7.utils.addInspection(BatchError$1, function () {
    return this.toString();
});

var batch$1 = {BatchError: BatchError$1};

const {BatchError} = batch$1;

/**
 * @method batch
 * @description
 * Settles (resolves or rejects) every [mixed value]{@tutorial mixed} in the input array.
 *
 * The method resolves with an array of results, the same as the standard $[promise.all],
 * while providing comprehensive error details in case of a reject, in the form of
 * type {@link errors.BatchError BatchError}.
 *
 * @param {Array} values
 * Array of [mixed values]{@tutorial mixed} (it can be empty), to be resolved asynchronously, in no particular order.
 *
 * Passing in anything other than an array will reject with {@link external:TypeError TypeError} =
 * `Method 'batch' requires an array of values.`
 *
 * @param {Object} [options]
 * Optional Parameters.
 *
 * @param {Function|generator} [options.cb]
 * Optional callback (or generator) to receive the result for each settled value.
 *
 * Callback Parameters:
 *  - `index` = index of the value in the source array
 *  - `success` - indicates whether the value was resolved (`true`), or rejected (`false`)
 *  - `result` = resolved data, if `success`=`true`, or else the rejection reason
 *  - `delay` = number of milliseconds since the last call (`undefined` when `index=0`)
 *
 * The function inherits `this` context from the calling method.
 *
 * It can optionally return a promise to indicate that notifications are handled asynchronously.
 * And if the returned promise resolves, it signals a successful handling, while any resolved
 * data is ignored.
 *
 * If the function returns a rejected promise or throws an error, the entire method rejects
 * with {@link errors.BatchError BatchError} where the corresponding value in property `data`
 * is set to `{success, result, origin}`:
 *  - `success` = `false`
 *  - `result` = the rejection reason or the error thrown by the notification callback
 *  - `origin` = the original data passed into the callback as object `{success, result}`
 *
 * @returns {external:Promise}
 *
 * The method resolves with an array of individual resolved results, the same as the standard $[promise.all].
 * In addition, the array is extended with a hidden read-only property `duration` - number of milliseconds
 * spent resolving all the data.
 *
 * The method rejects with {@link errors.BatchError BatchError} when any of the following occurs:
 *  - one or more values rejected or threw an error while being resolved as a [mixed value]{@tutorial mixed}
 *  - notification callback `cb` returned a rejected promise or threw an error
 *
 */
function batch(values, options, config) {

    const $p = config.promise, utils = config.utils;

    if (!Array.isArray(values)) {
        return $p.reject(new TypeError('Method \'batch\' requires an array of values.'));
    }

    if (!values.length) {
        const empty = [];
        utils.extend(empty, 'duration', 0);
        return $p.resolve(empty);
    }

    options = options || {};

    const cb = utils.wrap(options.cb),
        self = this, start = Date.now();

    return $p((resolve, reject) => {
        let cbTime, remaining = values.length;
        const errors = [], result = new Array(remaining);
        values.forEach((item, i) => {
            utils.resolve.call(self, item, null, data => {
                result[i] = data;
                step(i, true, data);
            }, reason => {
                result[i] = {success: false, result: reason};
                errors.push(i);
                step(i, false, reason);
            });
        });

        function step(idx, pass, data) {
            if (cb) {
                const cbNow = Date.now(),
                    cbDelay = idx ? (cbNow - cbTime) : undefined;
                let cbResult;
                cbTime = cbNow;
                try {
                    cbResult = cb.call(self, idx, pass, data, cbDelay);
                } catch (e) {
                    setError(e);
                }
                if (utils.isPromise(cbResult)) {
                    cbResult
                        .then(check)
                        .catch(error => {
                            setError(error);
                            check();
                        });
                } else {
                    check();
                }
            } else {
                check();
            }

            function setError(e) {
                const r = pass ? {success: false} : result[idx];
                if (pass) {
                    result[idx] = r;
                    errors.push(idx);
                }
                r.result = e;
                r.origin = {success: pass, result: data};
            }

            function check() {
                if (!--remaining) {
                    if (errors.length) {
                        errors.sort();
                        if (errors.length < result.length) {
                            for (let i = 0, k = 0; i < result.length; i++) {
                                if (i === errors[k]) {
                                    k++;
                                } else {
                                    result[i] = {success: true, result: result[i]};
                                }
                            }
                        }
                        reject(new BatchError(result, errors, Date.now() - start));
                    } else {
                        utils.extend(result, 'duration', Date.now() - start);
                        resolve(result);
                    }
                }
                return null; // this dummy return is just to prevent Bluebird warnings;
            }
        }
    });
}

var batch_1 = function (config) {
    return function (values, options) {
        return batch.call(this, values, options, config);
    };
};

const npm$6 = {
    u: require$$0,
    os: require$$1,
    utils: _static
};

const errorReasons$1 = {
    0: 'Page with index %d rejected.',
    1: 'Source %s returned a rejection at index %d.',
    2: 'Source %s threw an error at index %d.',
    3: 'Destination %s returned a rejection at index %d.',
    4: 'Destination %s threw an error at index %d.',
    5: 'Source %s returned a non-array value at index %d.'
};

/**
 * @class errors.PageError
 * @augments external:Error
 * @description
 * This type represents all errors rejected by method {@link page}, except for {@link external:TypeError TypeError}
 * when the method receives invalid input parameters.
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `PageError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {} error
 * The error that was thrown, or the rejection reason.
 *
 * @property {number} index
 * Index of the element in the sequence for which the error/rejection occurred.
 *
 * @property {number} duration
 * Duration (in milliseconds) of processing until the error/rejection occurred.
 *
 * @property {string} reason
 * Textual explanation of why the method failed.
 *
 * @property {} source
 * Resolved `data` parameter that was passed into the `source` function.
 *
 * It is only set when the error/rejection occurred inside the `source` function.
 *
 * @property {} dest
 * Resolved `data` parameter that was passed into the `dest` function.
 *
 * It is only set when the error/rejection occurred inside the `dest` function.
 *
 * @see
 * {@link page},
 * {@link batch}
 *
 */
let PageError$1 = class PageError extends Error {

    constructor(e, code, cbName, duration) {

        let message;
        if (e.error instanceof Error) {
            message = e.error.message;
        } else {
            message = e.error;
            if (typeof message !== 'string') {
                message = npm$6.u.inspect(message);
            }
        }
        super(message);
        this.name = this.constructor.name;

        this.index = e.index;
        this.duration = duration;
        this.error = e.error;

        if ('source' in e) {
            this.source = e.source;
        }

        if ('dest' in e) {
            this.dest = e.dest;
        }

        if (code) {
            cbName = cbName ? ('\'' + cbName + '\'') : '<anonymous>';
            this.reason = npm$6.u.format(errorReasons$1[code], cbName, e.index);
        } else {
            this.reason = npm$6.u.format(errorReasons$1[code], e.index);
        }

        Error.captureStackTrace(this, this.constructor);
    }

};

/**
 * @method errors.PageError.toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
PageError$1.prototype.toString = function (level) {

    level = level > 0 ? parseInt(level) : 0;

    const gap0 = npm$6.utils.messageGap(level),
        gap1 = npm$6.utils.messageGap(level + 1),
        lines = [
            'PageError {',
            gap1 + 'message: ' + JSON.stringify(this.message),
            gap1 + 'reason: ' + this.reason,
            gap1 + 'index: ' + this.index,
            gap1 + 'duration: ' + this.duration
        ];

    lines.push(gap1 + 'error: ' + npm$6.utils.formatError(this.error, level + 1));
    lines.push(gap0 + '}');
    return lines.join(npm$6.os.EOL);
};

npm$6.utils.addInspection(PageError$1, function () {
    return this.toString();
});

var page$1 = {PageError: PageError$1};

const {PageError} = page$1;

/**
 * @method page
 * @description
 * Resolves a dynamic sequence of pages/arrays with [mixed values]{@tutorial mixed}.
 *
 * The method acquires pages (arrays of [mixed values]{@tutorial mixed}) from the `source` function, one by one,
 * and resolves each page as a {@link batch}, till no more pages left or an error/reject occurs.
 *
 * @param {Function|generator} source
 * Expected to return a [mixed value]{@tutorial mixed} that resolves with the next page of data (array of [mixed values]{@tutorial mixed}).
 * Returning or resolving with `undefined` ends the sequence, and the method resolves.
 *
 * The function inherits `this` context from the calling method.
 *
 * Parameters:
 *  - `index` = index of the page being requested
 *  - `data` = previously returned page, resolved as a {@link batch} (`undefined` when `index=0`)
 *  - `delay` = number of milliseconds since the last call (`undefined` when `index=0`)
 *
 * If the function throws an error or returns a rejected promise, the method rejects with
 * {@link errors.PageError PageError}, which will have property `source` set.
 *
 * And if the function returns or resolves with anything other than an array or `undefined`,
 * the method rejects with the same {@link errors.PageError PageError}, but with `error` set to
 * `Unexpected data returned from the source.`
 *
 * Passing in anything other than a function will reject with {@link external:TypeError TypeError} = `Parameter 'source' must be a function.`
 *
 * @param {Object} [options]
 * Optional Parameters.
 *
 * @param {Function|generator} [options.dest]
 * Optional destination function (or generator), to receive a resolved {@link batch} of data
 * for each page, process it and respond as required.
 *
 * Parameters:
 *  - `index` = page index in the sequence
 *  - `data` = page data resolved as a {@link batch}
 *  - `delay` = number of milliseconds since the last call (`undefined` when `index=0`)
 *
 * The function inherits `this` context from the calling method.
 *
 * It can optionally return a promise object, if notifications are handled asynchronously.
 * And if a promise is returned, the method will not request another page from the `source`
 * function until the promise has been resolved.
 *
 * If the function throws an error or returns a rejected promise, the sequence terminates,
 * and the method rejects with {@link errors.PageError PageError}, which will have property `dest` set.
 *
 * @param {Number} [options.limit=0]
 * Limits the maximum number of pages to be requested from the `source`. If the value is greater
 * than 0, the method will successfully resolve once the specified limit has been reached.
 *
 * When `limit` isn't specified (default), the sequence is unlimited, and it will continue
 * till one of the following occurs:
 *  - `source` returns or resolves with `undefined` or an invalid value (non-array)
 *  - either `source` or `dest` functions throw an error or return a rejected promise
 *
 * @returns {external:Promise}
 *
 * When successful, the method resolves with object `{pages, total, duration}`:
 *  - `pages` = number of pages resolved
 *  - `total` = the sum of all page sizes (total number of values resolved)
 *  - `duration` = number of milliseconds consumed by the method
 *
 * When the method fails, it rejects with {@link errors.PageError PageError}.
 *
 */
function page(source, options, config) {

    const $p = config.promise, spex = config.spex, utils = config.utils;

    if (typeof source !== 'function') {
        return $p.reject(new TypeError('Parameter \'source\' must be a function.'));
    }

    options = options || {};
    source = utils.wrap(source);

    const limit = (options.limit > 0) ? parseInt(options.limit) : 0,
        dest = utils.wrap(options.dest), self = this, start = Date.now();
    let request, srcTime, destTime, total = 0;

    return $p((resolve, reject) => {

        function loop(idx) {
            const srcNow = Date.now(),
                srcDelay = idx ? (srcNow - srcTime) : undefined;
            srcTime = srcNow;
            utils.resolve.call(self, source, [idx, request, srcDelay], value => {
                if (value === undefined) {
                    success();
                } else {
                    if (value instanceof Array) {
                        spex.batch(value)
                            .then(data => {
                                request = data;
                                total += data.length;
                                if (dest) {
                                    const destNow = Date.now(),
                                        destDelay = idx ? (destNow - destTime) : undefined;
                                    let destResult;
                                    destTime = destNow;
                                    try {
                                        destResult = dest.call(self, idx, data, destDelay);
                                    } catch (err) {
                                        fail({
                                            error: err,
                                            dest: data
                                        }, 4, dest.name);
                                        return;
                                    }
                                    if (utils.isPromise(destResult)) {
                                        destResult
                                            .then(next)
                                            .catch(error => {
                                                fail({
                                                    error,
                                                    dest: data
                                                }, 3, dest.name);
                                            });
                                    } else {
                                        next();
                                    }
                                } else {
                                    next();
                                }
                                return null; // this dummy return is just to prevent Bluebird warnings;
                            })
                            .catch(error => {
                                fail({error}, 0);
                            });
                    } else {
                        fail({
                            error: new Error('Unexpected data returned from the source.'),
                            source: request
                        }, 5, source.name);
                    }
                }
            }, (reason, isRej) => {
                fail({
                    error: reason,
                    source: request
                }, isRej ? 1 : 2, source.name);
            });

            function next() {
                if (limit === ++idx) {
                    success();
                } else {
                    loop(idx);
                }
                return null; // this dummy return is just to prevent Bluebird warnings;
            }

            function success() {
                resolve({
                    pages: idx,
                    total,
                    duration: Date.now() - start
                });
            }

            function fail(reason, code, cbName) {
                reason.index = idx;
                reject(new PageError(reason, code, cbName, Date.now() - start));
            }
        }

        loop(0);
    });
}

var page_1 = function (config) {
    return function (source, options) {
        return page.call(this, source, options, config);
    };
};

const npm$5 = {
    u: require$$0,
    os: require$$1,
    utils: _static
};

const errorReasons = {
    0: 'Source %s returned a rejection at index %d.',
    1: 'Source %s threw an error at index %d.',
    2: 'Destination %s returned a rejection at index %d.',
    3: 'Destination %s threw an error at index %d.'
};

/**
 * @class errors.SequenceError
 * @augments external:Error
 * @description
 * This type represents all errors rejected by method {@link sequence}, except for {@link external:TypeError TypeError}
 * when the method receives invalid input parameters.
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `SequenceError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {} error
 * The error that was thrown or the rejection reason.
 *
 * @property {number} index
 * Index of the element in the sequence for which the error/rejection occurred.
 *
 * @property {number} duration
 * Duration (in milliseconds) of processing until the error/rejection occurred.
 *
 * @property {string} reason
 * Textual explanation of why the method failed.
 *
 * @property {} source
 * Resolved `data` parameter that was passed into the `source` function.
 *
 * It is only set when the error/rejection occurred inside the `source` function.
 *
 * @property {} dest
 * Resolved `data` parameter that was passed into the `dest` function.
 *
 * It is only set when the error/rejection occurred inside the `dest` function.
 *
 * @see {@link sequence}
 *
 */
let SequenceError$1 = class SequenceError extends Error {

    constructor(e, code, cbName, duration) {

        let message;
        if (e.error instanceof Error) {
            message = e.error.message;
        } else {
            message = e.error;
            if (typeof message !== 'string') {
                message = npm$5.u.inspect(message);
            }
        }

        super(message);
        this.name = this.constructor.name;

        this.index = e.index;
        this.duration = duration;
        this.error = e.error;

        if ('source' in e) {
            this.source = e.source;
        } else {
            this.dest = e.dest;
        }

        cbName = cbName ? ('\'' + cbName + '\'') : '<anonymous>';
        this.reason = npm$5.u.format(errorReasons[code], cbName, e.index);

        Error.captureStackTrace(this, this.constructor);
    }
};

/**
 * @method errors.SequenceError.toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
SequenceError$1.prototype.toString = function (level) {

    level = level > 0 ? parseInt(level) : 0;

    const gap0 = npm$5.utils.messageGap(level),
        gap1 = npm$5.utils.messageGap(level + 1),
        lines = [
            'SequenceError {',
            gap1 + 'message: ' + JSON.stringify(this.message),
            gap1 + 'reason: ' + this.reason,
            gap1 + 'index: ' + this.index,
            gap1 + 'duration: ' + this.duration
        ];

    lines.push(gap1 + 'error: ' + npm$5.utils.formatError(this.error, level + 1));
    lines.push(gap0 + '}');
    return lines.join(npm$5.os.EOL);
};

npm$5.utils.addInspection(SequenceError$1, function () {
    return this.toString();
});

var sequence$1 = {SequenceError: SequenceError$1};

const {SequenceError} = sequence$1;

/**
 * @method sequence
 * @description
 * Resolves a dynamic sequence of [mixed values]{@tutorial mixed}.
 *
 * The method acquires [mixed values]{@tutorial mixed} from the `source` function, one at a time, and resolves them,
 * till either no more values left in the sequence or an error/reject occurs.
 *
 * It supports both [linked and detached sequencing]{@tutorial sequencing}.
 *
 * @param {Function|generator} source
 * Expected to return the next [mixed value]{@tutorial mixed} to be resolved. Returning or resolving
 * with `undefined` ends the sequence, and the method resolves.
 *
 * Parameters:
 *  - `index` = current request index in the sequence
 *  - `data` = resolved data from the previous call (`undefined` when `index=0`)
 *  - `delay` = number of milliseconds since the last call (`undefined` when `index=0`)
 *
 * The function inherits `this` context from the calling method.
 *
 * If the function throws an error or returns a rejected promise, the sequence terminates,
 * and the method rejects with {@link errors.SequenceError SequenceError}, which will have property `source` set.
 *
 * Passing in anything other than a function will reject with {@link external:TypeError TypeError} = `Parameter 'source' must be a function.`
 *
 * @param {Object} [options]
 * Optional Parameters.
 *
 * @param {Function|generator} [options.dest=null]
 * Optional destination function (or generator), to receive resolved data for each index,
 * process it and respond as required.
 *
 * Parameters:
 *  - `index` = index of the resolved data in the sequence
 *  - `data` = the data resolved
 *  - `delay` = number of milliseconds since the last call (`undefined` when `index=0`)
 *
 * The function inherits `this` context from the calling method.
 *
 * It can optionally return a promise object, if data processing is done asynchronously.
 * If a promise is returned, the method will not request another value from the `source` function,
 * until the promise has been resolved (the resolved value is ignored).
 *
 * If the function throws an error or returns a rejected promise, the sequence terminates,
 * and the method rejects with {@link errors.SequenceError SequenceError}, which will have property `dest` set.
 *
 * @param {Number} [options.limit=0]
 * Limits the maximum size of the sequence. If the value is greater than 0, the method will
 * successfully resolve once the specified limit has been reached.
 *
 * When `limit` isn't specified (default), the sequence is unlimited, and it will continue
 * till one of the following occurs:
 *  - `source` either returns or resolves with `undefined`
 *  - either `source` or `dest` functions throw an error or return a rejected promise
 *
 * @param {Boolean} [options.track=false]
 * Changes the type of data to be resolved by this method. By default, it is `false`
 * (see the return result). When set to be `true`, the method tracks/collects all resolved data
 * into an array internally, and resolves with that array once the method has finished successfully.
 *
 * It must be used with caution, as to the size of the sequence, because accumulating data for
 * a very large sequence can result in consuming too much memory.
 *
 * @returns {external:Promise}
 *
 * When successful, the resolved data depends on parameter `track`. When `track` is `false`
 * (default), the method resolves with object `{total, duration}`:
 *  - `total` = number of values resolved by the sequence
 *  - `duration` = number of milliseconds consumed by the method
 *
 * When `track` is `true`, the method resolves with an array of all the data that has been resolved,
 * the same way that the standard $[promise.all] resolves. In addition, the array comes extended with
 * a hidden read-only property `duration` - number of milliseconds consumed by the method.
 *
 * When the method fails, it rejects with {@link errors.SequenceError SequenceError}.
 */
function sequence(source, options, config) {

    const $p = config.promise, utils = config.utils;

    if (typeof source !== 'function') {
        return $p.reject(new TypeError('Parameter \'source\' must be a function.'));
    }

    source = utils.wrap(source);

    options = options || {};

    const limit = (options.limit > 0) ? parseInt(options.limit) : 0,
        dest = utils.wrap(options.dest),
        self = this, start = Date.now();
    let data, srcTime, destTime, result = [];

    return $p((resolve, reject) => {

        function loop(idx) {
            const srcNow = Date.now(),
                srcDelay = idx ? (srcNow - srcTime) : undefined;
            srcTime = srcNow;
            utils.resolve.call(self, source, [idx, data, srcDelay], (value, delayed) => {
                data = value;
                if (data === undefined) {
                    success();
                } else {
                    if (options.track) {
                        result.push(data);
                    }
                    if (dest) {
                        const destNow = Date.now(),
                            destDelay = idx ? (destNow - destTime) : undefined;
                        let destResult;
                        destTime = destNow;
                        try {
                            destResult = dest.call(self, idx, data, destDelay);
                        } catch (e) {
                            fail({
                                error: e,
                                dest: data
                            }, 3, dest.name);
                            return;
                        }
                        if (utils.isPromise(destResult)) {
                            destResult
                                .then(() => {
                                    next(true);
                                    return null; // this dummy return is just to prevent Bluebird warnings;
                                })
                                .catch(error => {
                                    fail({
                                        error,
                                        dest: data
                                    }, 2, dest.name);
                                });
                        } else {
                            next(delayed);
                        }
                    } else {
                        next(delayed);
                    }
                }
            }, (reason, isRej) => {
                fail({
                    error: reason,
                    source: data
                }, isRej ? 0 : 1, source.name);
            });

            function next(delayed) {
                if (limit === ++idx) {
                    success();
                } else {
                    if (delayed) {
                        loop(idx);
                    } else {
                        $p.resolve()
                            .then(() => {
                                loop(idx);
                                return null; // this dummy return is just to prevent Bluebird warnings;
                            });
                    }
                }
            }

            function success() {
                const length = Date.now() - start;
                if (options.track) {
                    utils.extend(result, 'duration', length);
                } else {
                    result = {
                        total: idx,
                        duration: length
                    };
                }
                resolve(result);
            }

            function fail(reason, code, cbName) {
                reason.index = idx;
                reject(new SequenceError(reason, code, cbName, Date.now() - start));
            }
        }

        loop(0);
    });
}

var sequence_1 = function (config) {
    return function (source, options) {
        return sequence.call(this, source, options, config);
    };
};

/**
 * @method stream.read
 * @description
 * Consumes and processes data from a $[Readable] stream.
 *
 * It reads the entire stream, using either **paused mode** (default), or in chunks (see `options.readChunks`)
 * with support for both synchronous and asynchronous data processing.
 *
 * **NOTE:** Once the method has finished, the onus is on the caller to release the stream
 * according to its protocol.
 *
 * @param {Object} stream
 * $[Readable] stream object.
 *
 * Passing in anything else will throw `Readable stream is required.`
 *
 * @param {Function|generator} receiver
 * Data processing callback (or generator).
 *
 * Passing in anything else will throw `Invalid stream receiver.`
 *
 * Parameters:
 *  - `index` = index of the call made to the function
 *  - `data` = array of all data reads from the stream's buffer
 *  - `delay` = number of milliseconds since the last call (`undefined` when `index=0`)
 *
 * The function is called with the same `this` context as the calling method.
 *
 * It can optionally return a promise object, if data processing is asynchronous.
 * And if a promise is returned, the method will not read data from the stream again,
 * until the promise has been resolved.
 *
 * If the function throws an error or returns a rejected promise, the method rejects
 * with the same error / rejection reason.
 *
 * @param {Object} [options]
 * Optional Parameters.
 *
 * @param {Boolean} [options.closable=false]
 * Instructs the method to resolve on event `close` supported by the stream, as opposed to event
 * `end` that's used by default.
 *
 * @param {Boolean} [options.readChunks=false]
 * By default, the method handles event `readable` of the stream to consume data in a simplified form,
 * item by item. If you enable this option, the method will instead handle event `data` of the stream,
 * to consume chunks of data.
 *
 * @param {Number} [options.readSize]
 * When the value is greater than 0, it sets the read size from the stream's buffer
 * when the next data is available. By default, the method uses as few reads as possible
 * to get all the data currently available in the buffer.
 *
 * NOTE: This option is ignored when option `readChunks` is enabled.
 *
 * @returns {external:Promise}
 *
 * When finished successfully, resolves with object `{calls, reads, length, duration}`:
 *  - `calls` = number of calls made into the `receiver`
 *  - `reads` = number of successful reads from the stream
 *  - `length` = total length for all the data reads from the stream
 *  - `duration` = number of milliseconds consumed by the method
 *
 * When it fails, the method rejects with the error/reject specified,
 * which can happen as a result of:
 *  - event `error` emitted by the stream
 *  - receiver throws an error or returns a rejected promise
 */

function read(stream, receiver, options, config) {

    const $p = config.promise, utils = config.utils;

    if (!utils.isReadableStream(stream)) {
        return $p.reject(new TypeError('Readable stream is required.'));
    }

    if (typeof receiver !== 'function') {
        return $p.reject(new TypeError('Invalid stream receiver.'));
    }

    receiver = utils.wrap(receiver);

    options = options || {};

    const readSize = (options.readSize > 0) ? parseInt(options.readSize) : null,
        self = this, start = Date.now(), receiveEvent = options.readChunks ? 'data' : 'readable';
    let cbTime, ready, waiting, stop, reads = 0, length = 0, index = 0;

    return $p((resolve, reject) => {

        function onReceive(data) {
            ready = true;
            process(data);
        }

        function onEnd() {
            if (!options.closable) {
                success();
            }
        }

        function onClose() {
            success();
        }

        function onError(error) {
            fail(error);
        }

        stream.on(receiveEvent, onReceive);
        stream.on('end', onEnd);
        stream.on('close', onClose);
        stream.on('error', onError);

        function process(data) {
            if (!ready || stop || waiting) {
                return;
            }
            ready = false;
            let cache;
            if (options.readChunks) {
                cache = data;
                // istanbul ignore else;
                // we cannot test the else condition, as it requires a special broken stream interface.
                if (!Array.isArray(cache)) {
                    cache = [cache];
                }
                length += cache.length;
                reads++;
            } else {
                cache = [];
                waiting = true;
                let page;
                do {
                    page = stream.read(readSize);
                    if (page) {
                        cache.push(page);
                        // istanbul ignore next: requires a unique stream that
                        // creates objects without property `length` defined.
                        length += page.length || 0;
                        reads++;
                    }
                } while (page);

                if (!cache.length) {
                    waiting = false;
                    return;
                }
            }

            const cbNow = Date.now(),
                cbDelay = index ? (cbNow - cbTime) : undefined;
            let result;
            cbTime = cbNow;
            try {
                result = receiver.call(self, index++, cache, cbDelay);
            } catch (e) {
                fail(e);
                return;
            }

            if (utils.isPromise(result)) {
                result
                    .then(() => {
                        waiting = false;
                        process();
                        return null; // this dummy return is just to prevent Bluebird warnings;
                    })
                    .catch(error => {
                        fail(error);
                    });
            } else {
                waiting = false;
                process();
            }
        }

        function success() {
            cleanup();
            resolve({
                calls: index,
                reads,
                length,
                duration: Date.now() - start
            });
        }

        function fail(error) {
            stop = true;
            cleanup();
            reject(error);
        }

        function cleanup() {
            stream.removeListener(receiveEvent, onReceive);
            stream.removeListener('close', onClose);
            stream.removeListener('error', onError);
            stream.removeListener('end', onEnd);
        }
    });
}

var read_1 = function (config) {
    return function (stream, receiver, options) {
        return read.call(this, stream, receiver, options, config);
    };
};

const npm$4 = {
    read: read_1
};

/**
 * @namespace stream
 * @description
 * Namespace with methods that implement stream operations, and {@link stream.read read} is the only method currently supported.
 *
 * **Synchronous Stream Processing**
 *
 * ```js
 * const stream = require('spex')(Promise).stream;
 * const fs = require('fs');
 *
 * const rs = fs.createReadStream('values.txt');
 *
 * function receiver(index, data, delay) {
 *    console.log('RECEIVED:', index, data, delay);
 * }
 *
 * stream.read(rs, receiver)
 *     .then(data => {
 *         console.log('DATA:', data);
 *     })
 *     .catch(error => {
 *         console.log('ERROR:', error);
 *     });
 * ```
 *
 * **Asynchronous Stream Processing**
 *
 * ```js
 * const stream = require('spex')(Promise).stream;
 * const fs = require('fs');
 *
 * const rs = fs.createReadStream('values.txt');
 *
 * function receiver(index, data, delay) {
 *    return new Promise(resolve => {
 *        console.log('RECEIVED:', index, data, delay);
 *        resolve();
 *    });
 * }
 *
 * stream.read(rs, receiver)
 *     .then(data => {
 *         console.log('DATA:', data);
 *     })
 *     .catch(error => {
 *         console.log('ERROR:', error);
 *    });
 * ```
 *
 * @property {function} stream.read
 * Consumes and processes data from a $[Readable] stream.
 *
 */
var stream = function (config) {
    const res = {
        read: npm$4.read(config)
    };
    Object.freeze(res);
    return res;
};

var errors = {exports: {}};

(function (module) {
	const {BatchError} = batch$1;
	const {PageError} = page$1;
	const {SequenceError} = sequence$1;


	/**
	 * @namespace errors
	 * @description
	 * Namespace for all custom error types supported by the library.
	 *
	 * In addition to the custom error type used by each method (regular error), they can also reject with
	 * {@link external:TypeError TypeError} when receiving invalid input parameters.
	 *
	 * @property {function} BatchError
	 * {@link errors.BatchError BatchError} class.
	 *
	 * Represents regular errors that can be reported by method {@link batch}.
	 *
	 * @property {function} PageError
	 * {@link errors.PageError PageError} class.
	 *
	 * Represents regular errors that can be reported by method {@link page}.
	 *
	 * @property {function} SequenceError
	 * {@link errors.SequenceError SequenceError} class.
	 *
	 * Represents regular errors that can be reported by method {@link sequence}.
	 *
	 */
	module.exports = {
	    BatchError,
	    PageError,
	    SequenceError
	};

	Object.freeze(module.exports); 
} (errors));

var errorsExports = errors.exports;

/**
 * @class PromiseAdapter
 * @description
 * Adapter for the primary promise operations.
 *
 * Provides compatibility with promise libraries that cannot be recognized automatically,
 * via functions that implement the primary operations with promises:
 *
 *  - construct a new promise with a callback function
 *  - resolve a promise with some result data
 *  - reject a promise with a reason
 *
 * #### Example
 *
 * Below is an example of setting up a [client-side]{@tutorial client} adapter for AngularJS $q.
 *
 * ```js
 * const spexLib = require('spex'); // or include client-side spex.js
 *
 * const adapter = new spexLib.PromiseAdapter(
 *    cb => $q(cb), // creating a new promise;
 *    data => $q.when(data), // resolving a promise;
 *    reason => $q.reject(reason) // rejecting a promise;
 *    );
 *
 * const spex = spexLib(adapter);
 * ```
 *
 * @param {Function} create
 * A function that takes a callback parameter and returns a new promise object.
 * The callback parameter is expected to be `function(resolve, reject)`.
 *
 * Passing in anything other than a function will throw `Adapter requires a function to create a promise.`
 *
 * @param {Function} resolve
 * A function that takes an optional data parameter and resolves a promise with it.
 *
 * Passing in anything other than a function will throw `Adapter requires a function to resolve a promise.`
 *
 * @param {Function} reject
 * A function that takes an optional error parameter and rejects a promise with it.
 *
 * Passing in anything other than a function will throw `Adapter requires a function to reject a promise.`
 *
 * @see {@tutorial client}
 *
 */

let PromiseAdapter$1 = class PromiseAdapter {
    constructor(create, resolve, reject) {
        this.create = create;
        this.resolve = resolve;
        this.reject = reject;

        if (typeof create !== 'function') {
            throw new TypeError('Adapter requires a function to create a promise.');
        }

        if (typeof resolve !== 'function') {
            throw new TypeError('Adapter requires a function to resolve a promise.');
        }

        if (typeof reject !== 'function') {
            throw new TypeError('Adapter requires a function to reject a promise.');
        }
    }
};

var adapter = PromiseAdapter$1;

const npm$3 = {
    utils: utils,
    batch: batch_1,
    page: page_1,
    sequence: sequence_1,
    stream: stream,
    errors: errorsExports
};

/**
 * @module spex
 * @summary Specialized Promise Extensions
 * @author Vitaly Tomilov
 *
 * @description
 * Attaches to an external promise library and provides additional methods built solely
 * on the basic promise operations:
 *  - construct a new promise with a callback function
 *  - resolve a promise with some result data
 *  - reject a promise with a reason
 *
 * ### usage
 * For any third-party promise library:
 * ```js
 * const promise = require('bluebird');
 * const spex = require('spex')(promise);
 * ```
 * For ES6 promises:
 * ```js
 * const spex = require('spex')(Promise);
 * ```
 *
 * @param {Object|Function} promiseLib
 * Instance of a promise library to be used by this module.
 *
 * Some implementations use `Promise` constructor to create a new promise, while
 * others use the module's function for it. Both types are supported the same.
 *
 * Alternatively, an object of type {@link PromiseAdapter} can be passed in, which provides
 * compatibility with any promise library outside of the standard.
 *
 * Passing in a promise library that cannot be recognized will throw
 * `Invalid promise library specified.`
 *
 * @returns {Object}
 * Namespace with all supported methods.
 *
 * @see {@link PromiseAdapter}, {@link batch}, {@link page}, {@link sequence}, {@link stream}
 */
function main$1(promiseLib) {

    const spex = {}, // library instance;
        promise = parsePromiseLib(promiseLib); // promise library parsing;

    const config = {
        spex,
        promise,
        utils: npm$3.utils(promise)
    };

    spex.errors = npm$3.errors;
    spex.batch = npm$3.batch(config);
    spex.page = npm$3.page(config);
    spex.sequence = npm$3.sequence(config);
    spex.stream = npm$3.stream(config);

    config.utils.extend(spex, '$p', promise);

    Object.freeze(spex);

    return spex;
}

//////////////////////////////////////////
// Parses and validates a promise library;
function parsePromiseLib(lib) {
    if (lib) {
        let promise;
        if (lib instanceof main$1.PromiseAdapter) {
            promise = function (func) {
                return lib.create(func);
            };
            promise.resolve = lib.resolve;
            promise.reject = lib.reject;
            return promise;
        }
        const t = typeof lib;
        if (t === 'function' || t === 'object') {
            const Root = typeof lib.Promise === 'function' ? lib.Promise : lib;
            promise = function (func) {
                return new Root(func);
            };
            promise.resolve = Root.resolve;
            promise.reject = Root.reject;
            if (typeof promise.resolve === 'function' && typeof promise.reject === 'function') {
                return promise;
            }
        }
    }
    throw new TypeError('Invalid promise library specified.');
}

main$1.PromiseAdapter = adapter;
main$1.errors = npm$3.errors;

Object.freeze(main$1);

var lib$1 = main$1;

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {Events: Events$1} = events;

const npm$2 = {
    spex: lib$1,
    utils: utils$4,
    mode: txMode,
    query: query,
    text: text
};

/**
 * @interface Task
 * @description
 * Extends {@link Database} for an automatic connection session, with methods for executing multiple database queries.
 *
 * The type isn't available directly, it can only be created via methods {@link Database#task Database.task}, {@link Database#tx Database.tx},
 * or their derivations.
 *
 * When executing more than one request at a time, one should allocate and release the connection only once,
 * while executing all the required queries within the same connection session. More importantly, a transaction
 * can only work within a single connection.
 *
 * This is an interface for tasks/transactions to implement a connection session, during which you can
 * execute multiple queries against the same connection that's released automatically when the task/transaction is finished.
 *
 * Each task/transaction manages the connection automatically. When executed on the root {@link Database} object, the connection
 * is allocated from the pool, and once the method's callback has finished, the connection is released back to the pool.
 * However, when invoked inside another task or transaction, the method reuses the parent connection.
 *
 * @see
 * {@link Task#ctx ctx},
 * {@link Task#batch batch},
 * {@link Task#sequence sequence},
 * {@link Task#page page}
 *
 * @example
 * db.task(t => {
 *       // t = task protocol context;
 *       // t.ctx = Task Context;
 *       return t.one('select * from users where id=$1', 123)
 *           .then(user => {
 *               return t.any('select * from events where login=$1', user.name);
 *           });
 *   })
 * .then(events => {
 *       // success;
 *   })
 * .catch(error => {
 *       // error;
 *   });
 *
 */
function Task(ctx, tag, isTX, config) {

    const $p = config.promise;

    /**
     * @member {TaskContext} Task#ctx
     * @readonly
     * @description
     * Task/Transaction Context object - contains individual properties for each task/transaction.
     *
     * @see event {@link event:query query}
     *
     * @example
     *
     * db.task(t => {
     *     return t.ctx; // task context object
     * })
     *     .then(ctx => {
     *         console.log('Task Duration:', ctx.duration);
     *     });
     *
     * @example
     *
     * db.tx(t => {
     *     return t.ctx; // transaction context object
     * })
     *     .then(ctx => {
     *         console.log('Transaction Duration:', ctx.duration);
     *     });
     */
    this.ctx = ctx.ctx = {}; // task context object;

    npm$2.utils.addReadProp(this.ctx, 'isTX', isTX);

    if ('context' in ctx) {
        npm$2.utils.addReadProp(this.ctx, 'context', ctx.context);
    }

    npm$2.utils.addReadProp(this.ctx, 'connected', !ctx.db);
    npm$2.utils.addReadProp(this.ctx, 'tag', tag);
    npm$2.utils.addReadProp(this.ctx, 'dc', ctx.dc);
    npm$2.utils.addReadProp(this.ctx, 'level', ctx.level);
    npm$2.utils.addReadProp(this.ctx, 'inTransaction', ctx.inTransaction);

    if (isTX) {
        npm$2.utils.addReadProp(this.ctx, 'txLevel', ctx.txLevel);
    }

    npm$2.utils.addReadProp(this.ctx, 'parent', ctx.parentCtx);

    // generic query method;
    this.query = function (query, values, qrm) {
        if (!ctx.db) {
            return $p.reject(new Error(npm$2.text.looseQuery));
        }
        return config.$npm.query.call(this, ctx, query, values, qrm);
    };

    /**
     * @deprecated
     * Consider using <b>async/await</b> syntax instead, or if you must have
     * pre-generated promises, then $[Promise.allSettled].
     *
     * @method Task#batch
     * @description
     * Settles a predefined array of mixed values by redirecting to method $[spex.batch].
     *
     * For complete method documentation see $[spex.batch].
     *
     * @param {array} values
     * @param {Object} [options]
     * Optional Parameters.
     * @param {function} [options.cb]
     *
     * @returns {external:Promise}
     */
    this.batch = function (values, options) {
        return config.$npm.spex.batch.call(this, values, options);
    };

    /**
     * @method Task#page
     * @description
     * Resolves a dynamic sequence of arrays/pages with mixed values, by redirecting to method $[spex.page].
     *
     * For complete method documentation see $[spex.page].
     *
     * @param {function} source
     * @param {Object} [options]
     * Optional Parameters.
     * @param {function} [options.dest]
     * @param {number} [options.limit=0]
     *
     * @returns {external:Promise}
     */
    this.page = function (source, options) {
        return config.$npm.spex.page.call(this, source, options);
    };

    /**
     * @method Task#sequence
     * @description
     * Resolves a dynamic sequence of mixed values by redirecting to method $[spex.sequence].
     *
     * For complete method documentation see $[spex.sequence].
     *
     * @param {function} source
     * @param {Object} [options]
     * Optional Parameters.
     * @param {function} [options.dest]
     * @param {number} [options.limit=0]
     * @param {boolean} [options.track=false]
     *
     * @returns {external:Promise}
     */
    this.sequence = function (source, options) {
        return config.$npm.spex.sequence.call(this, source, options);
    };

}

/**
 * @private
 * @method Task.callback
 * Callback invocation helper.
 *
 * @param ctx
 * @param obj
 * @param cb
 * @param config
 * @returns {Promise.<TResult>}
 */
const callback = (ctx, obj, cb, config) => {

    const $p = config.promise;
    let result;

    try {
        if (cb.constructor.name === 'GeneratorFunction') {
            // v9.0 dropped all support for ES6 generator functions;
            // Clients should use the new ES7 async/await syntax.
            throw new TypeError('ES6 generator functions are no longer supported!');
        }
        result = cb.call(obj, obj); // invoking the callback function;
    } catch (err) {
        Events$1.error(ctx.options, err, {
            client: ctx.db && ctx.db.client, // the error can be due to loss of connectivity
            dc: ctx.dc,
            ctx: ctx.ctx
        });
        return $p.reject(err); // reject with the error;
    }
    if (result && typeof result.then === 'function') {
        return result; // result is a valid promise object;
    }
    return $p.resolve(result);
};

/**
 * @private
 * @method Task.execute
 * Executes a task.
 *
 * @param ctx
 * @param obj
 * @param isTX
 * @param config
 * @returns {Promise.<TResult>}
 */
const execute = (ctx, obj, isTX, config) => {

    const $p = config.promise;

    // updates the task context and notifies the client;
    function update(start, success, result) {
        const c = ctx.ctx;
        if (start) {
            npm$2.utils.addReadProp(c, 'start', new Date());
        } else {
            c.finish = new Date();
            c.success = success;
            c.result = result;
            c.duration = c.finish - c.start;
        }
        (isTX ? Events$1.transact : Events$1.task)(ctx.options, {
            client: ctx.db && ctx.db.client, // loss of connectivity is possible at this point
            dc: ctx.dc,
            ctx: c
        });
    }

    let cbData, cbReason, success,
        spName; // Save-Point Name;

    const capSQL = ctx.options.capSQL; // capitalize sql;

    update(true);

    if (isTX) {
        // executing a transaction;
        spName = `sp_${ctx.txLevel}_${ctx.nextTxCount}`;
        return begin()
            .then(() => callback(ctx, obj, ctx.cb, config)
                .then(data => {
                    cbData = data; // save callback data;
                    success = true;
                    return commit();
                }, err => {
                    cbReason = err; // save callback failure reason;
                    return rollback();
                })
                .then(() => {
                    if (success) {
                        update(false, true, cbData);
                        return cbData;
                    }
                    update(false, false, cbReason);
                    return $p.reject(cbReason);
                },
                err => {
                    // either COMMIT or ROLLBACK has failed, which is impossible
                    // to replicate in a test environment, so skipping from the test;
                    // istanbul ignore next:
                    update(false, false, err);
                    // istanbul ignore next:
                    return $p.reject(err);
                }),
            err => {
                // BEGIN has failed, which is impossible to replicate in a test
                // environment, so skipping the whole block from the test;
                // istanbul ignore next:
                update(false, false, err);
                // istanbul ignore next:
                return $p.reject(err);
            });
    }

    function begin() {
        if (!ctx.txLevel && ctx.mode instanceof npm$2.mode.TransactionMode) {
            return exec(ctx.mode.begin(capSQL), 'savepoint');
        }
        return exec('begin', 'savepoint');
    }

    function commit() {
        return exec('commit', 'release savepoint');
    }

    function rollback() {
        return exec('rollback', 'rollback to savepoint');
    }

    function exec(top, nested) {
        if (ctx.txLevel) {
            return obj.none((capSQL ? nested.toUpperCase() : nested) + ' ' + spName);
        }
        return obj.none(capSQL ? top.toUpperCase() : top);
    }

    // executing a task;
    return callback(ctx, obj, ctx.cb, config)
        .then(data => {
            update(false, true, data);
            return data;
        })
        .catch(error => {
            update(false, false, error);
            return $p.reject(error);
        });
};

var task = config => {
    const npmLocal = config.$npm;

    // istanbul ignore next:
    // we keep 'npm.query' initialization here, even though it is always
    // pre-initialized by the 'database' module, for integrity purpose.
    npmLocal.query = npmLocal.query || npm$2.query(config);
    npmLocal.spex = npmLocal.spex || npm$2.spex(config.promiseLib);

    return {
        Task, execute, callback
    };
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {Events} = events;
const {assert: assert$1} = assert$d;
const {resultQuery, multiResultQuery, streamQuery} = specialQuery;
const {ConnectionContext} = context;
const {DatabasePool: DatabasePool$1} = databasePool;
const {queryResult: queryResult$1} = queryResult_1;

const npm$1 = {
    utils: utils$4,
    pubUtils: _public,
    connect: connect,
    query: query,
    task: task,
    text: text
};

/**
 * @class Database
 * @description
 *
 * Represents the database protocol, extensible via event {@link event:extend extend}.
 * This type is not available directly, it can only be created via the library's base call.
 *
 * **IMPORTANT:**
 *
 * For any given connection, you should only create a single {@link Database} object in a separate module,
 * to be shared in your application (see the code example below). If instead you keep creating the {@link Database}
 * object dynamically, your application will suffer from loss in performance, and will be getting a warning in a
 * development environment (when `NODE_ENV` = `development`):
 *
 * `WARNING: Creating a duplicate database object for the same connection.`
 *
 * If you ever see this warning, rectify your {@link Database} object initialization, so there is only one object
 * per connection details. See the example provided below.
 *
 * See also: property `noWarnings` in {@link module:pg-promise Initialization Options}.
 *
 * Note however, that in special cases you may need to re-create the database object, if its connection pool has been
 * shut-down externally. And in this case the library won't be showing any warning.
 *
 * @param {string|object} cn
 * Database connection details, which can be:
 *
 * - a configuration object
 * - a connection string
 *
 * For details see {@link https://github.com/vitaly-t/pg-promise/wiki/Connection-Syntax Connection Syntax}.
 *
 * The value can be accessed from the database object via property {@link Database.$cn $cn}.
 *
 * @param {*} [dc]
 * Database Context.
 *
 * Any object or value to be propagated through the protocol, to allow implementations and event handling
 * that depend on the database context.
 *
 * This is mainly to facilitate the use of multiple databases which may need separate protocol extensions,
 * or different implementations within a single task / transaction callback, depending on the database context.
 *
 * This parameter also adds uniqueness to the connection context that's used in combination with the connection
 * parameters, i.e. use of unique database context will prevent getting the warning about creating a duplicate
 * Database object.
 *
 * The value can be accessed from the database object via property {@link Database#$dc $dc}.
 *
 * @returns {Database}
 *
 * @see
 *
 * {@link Database#query query},
 * {@link Database#none none},
 * {@link Database#one one},
 * {@link Database#oneOrNone oneOrNone},
 * {@link Database#many many},
 * {@link Database#manyOrNone manyOrNone},
 * {@link Database#any any},
 * {@link Database#func func},
 * {@link Database#proc proc},
 * {@link Database#result result},
 * {@link Database#multiResult multiResult},
 * {@link Database#multi multi},
 * {@link Database#map map},
 * {@link Database#each each},
 * {@link Database#stream stream},
 * {@link Database#task task},
 * {@link Database#taskIf taskIf},
 * {@link Database#tx tx},
 * {@link Database#txIf txIf},
 * {@link Database#connect connect},
 * {@link Database#$config $config},
 * {@link Database#$cn $cn},
 * {@link Database#$dc $dc},
 * {@link Database#$pool $pool},
 * {@link event:extend extend}
 *
 * @example
 * // Proper way to initialize and share the Database object
 *
 * // Loading and initializing the library:
 * const pgp = require('pg-promise')({
 *     // Initialization Options
 * });
 *
 * // Preparing the connection details:
 * const cn = 'postgres://username:password@host:port/database';
 *
 * // Creating a new database instance from the connection details:
 * const db = pgp(cn);
 *
 * // Exporting the database object for shared use:
 * module.exports = db;
 */
function Database(cn, dc, config) {

    const dbThis = this,
        $p = config.promise,
        poolConnection = typeof cn === 'string' ? {connectionString: cn} : cn,
        pool = new config.pgp.pg.Pool(poolConnection),
        endMethod = pool.end;

    let destroyed;

    pool.end = cb => {
        const res = endMethod.call(pool, cb);
        dbThis.$destroy();
        return res;
    };

    pool.on('error', onError);

    /**
     * @method Database#connect
     *
     * @description
     * Acquires a new or existing connection, depending on the current state of the connection pool, and parameter `direct`.
     *
     * This method creates a shared connection for executing a chain of queries against it. The connection must be released
     * in the end of the chain by calling `done()` on the connection object.
     *
     * Method `done` takes one optional parameter - boolean `kill` flag, to signal the connection pool that you want it to kill
     * the physical connection. This flag is ignored for direct connections, as they always close when released.
     *
     * It should not be used just for chaining queries on the same connection, methods {@link Database#task task} and
     * {@link Database#tx tx} (for transactions) are to be used for that. This method is primarily for special cases, like
     * `LISTEN` notifications.
     *
     * **NOTE:** Even though this method exposes a {@link external:Client Client} object via property `client`,
     * you cannot call `client.end()` directly, or it will print an error into the console:
     * `Abnormal client.end() call, due to invalid code or failed server connection.`
     * You should only call method `done()` to release the connection.
     *
     * @param {object} [options]
     * Connection Options.
     *
     * @param {boolean} [options.direct=false]
     * Creates a new connection directly, as a stand-alone {@link external:Client Client} object, bypassing the connection pool.
     *
     * By default, all connections are acquired from the connection pool. But if you set this option, the library will instead
     * create a new {@link external:Client Client} object directly (separately from the pool), and then call its `connect` method.
     *
     * Note that specifically for direct connections, method `done` returns a {@link external:Promise Promise}, because those connections
     * are closed physically, which may take time.
     *
     * **WARNING:**
     *
     * Do not use this option for regular query execution, because it exclusively occupies one physical channel, and it cannot scale.
     * This option is only suitable for global connection usage, such as event listeners.
     *
     * @param {function} [options.onLost]
     * Notification callback of the lost/broken connection, called with the following parameters:
     *  - `err` - the original connectivity error
     *  - `e` - error context object, which contains:
     *    - `cn` - safe connection string/config (with the password hashed);
     *    - `dc` - Database Context, as was used during {@link Database} construction;
     *    - `start` - Date/Time (`Date` type) when the connection was established;
     *    - `client` - {@link external:Client Client} object that has lost the connection.
     *
     * The notification is mostly valuable with `direct: true`, to be able to re-connect direct/permanent connections by calling
     * method {@link Database#connect connect} again.
     *
     * You do not need to call `done` on lost connections, as it happens automatically. However, if you had event listeners
     * set up on the connection's `client` object, you should remove them to avoid leaks:
     *
     * ```js
     * function onLostConnection(err, e) {
     *     e.client.removeListener('my-event', myHandler);
     * }
     * ```
     *
     * For a complete example see $[Robust Listeners].
     *
     * @returns {external:Promise}
     * A promise object that represents the connection result:
     *  - resolves with the complete {@link Database} protocol, extended with:
     *    - property `client` of type {@link external:Client Client} that represents the open connection
     *    - method `done` that must be called in the end, in order to release the connection (returns a {@link external:Promise Promise}
     *      in case of direct connections)
     *    - methods `batch`, `page` and `sequence`, same as inside a {@link Task}
     *  - rejects with a connection-related error when it fails to connect.
     *
     * @see
     * {@link Database#task Database.task},
     * {@link Database#taskIf Database.taskIf},
     * {@link Database#tx Database.tx},
     * {@link Database#txIf Database.txIf}
     *
     * @example
     *
     * let sco; // shared connection object;
     *
     * db.connect()
     *     .then(obj => {
     *         // obj.client = new connected Client object;
     *
     *         sco = obj; // save the connection object;
     *
     *         // execute all the queries you need:
     *         return sco.any('SELECT * FROM Users');
     *     })
     *     .then(data => {
     *         // success
     *     })
     *     .catch(error => {
     *         // error
     *     })
     *     .finally(() => {
     *         // release the connection, if it was successful:
     *         if (sco) {
     *             // if you pass `true` into method done, i.e. done(true),
     *             // it will make the pool kill the physical connection.
     *             sco.done();
     *         }
     *     });
     *
     */
    this.connect = function (options) {
        options = options || {};
        const ctx = createContext();
        ctx.cnOptions = options;
        const self = {
            query(query, values, qrm) {
                if (!ctx.db) {
                    return $p.reject(new Error(npm$1.text.queryDisconnected));
                }
                return config.$npm.query.call(this, ctx, query, values, qrm);
            },
            done(kill) {
                if (!ctx.db) {
                    throw new Error(npm$1.text.looseQuery);
                }
                return ctx.disconnect(kill);
            },
            batch(values, opt) {
                return config.$npm.spex.batch.call(this, values, opt);
            },
            page(source, opt) {
                return config.$npm.spex.page.call(this, source, opt);
            },
            sequence(source, opt) {
                return config.$npm.spex.sequence.call(this, source, opt);
            }
        };
        const connection = options.direct ? config.$npm.connect.direct(ctx) : config.$npm.connect.pool(ctx, dbThis);
        return connection
            .then(db => {
                ctx.connect(db);
                self.client = db.client;
                extend(ctx, self);
                return self;
            });
    };

    /**
     * @method Database#query
     *
     * @description
     * Base query method that executes a generic query, expecting the return data according to parameter `qrm`.
     *
     * It performs the following steps:
     *
     *  1. Validates and formats the query via {@link formatting.format as.format}, according to the `query` and `values` passed in;
     *  2. For a root-level query (against the {@link Database} object), it requests a new connection from the pool;
     *  3. Executes the query;
     *  4. For a root-level query (against the {@link Database} object), it releases the connection back to the pool;
     *  5. Resolves/rejects, according to the data returned from the query and the value of `qrm`.
     *
     * Direct use of this method is not suitable for chaining queries, for performance reasons. It should be done
     * through either task or transaction context, see $[Chaining Queries].
     *
     * When receiving a multi-query result, only the last result is processed, ignoring the rest.
     *
     * @param {string|function|object} query
     * Query to be executed, which can be any of the following types:
     * - A non-empty query string
     * - A function that returns a query string or another function, i.e. recursive resolution
     *   is supported, passing in `values` as `this`, and as the first parameter.
     * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
     * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
     * - {@link QueryFile} object
     *
     * @param {array|value|function} [values]
     * Query formatting parameter(s), or a function that returns it.
     *
     * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
     * - a single value - to replace all `$1` occurrences
     * - an array of values - to replace all `$1`, `$2`, ... variables
     * - an object - to apply $[Named Parameters] formatting
     *
     * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
     * and `values` is not `null` or `undefined`, it is automatically set within such object,
     * as an override for its internal `values`.
     *
     * @param {queryResult} [qrm=queryResult.any]
     * {@link queryResult Query Result Mask}
     *
     * @returns {external:Promise}
     * A promise object that represents the query result according to `qrm`.
     */
    this.query = function (query, values, qrm) {
        const self = this, ctx = createContext();
        return config.$npm.connect.pool(ctx, dbThis)
            .then(db => {
                ctx.connect(db);
                return config.$npm.query.call(self, ctx, query, values, qrm);
            })
            .then(data => {
                ctx.disconnect();
                return data;
            })
            .catch(error => {
                ctx.disconnect();
                return $p.reject(error);
            });
    };

    /**
     * @member {object} Database#$config
     * @readonly
     * @description
     * This is a hidden property, to help integrating type {@link Database} directly with third-party libraries.
     *
     * Properties available in the object:
     * - `pgp` - instance of the entire library after initialization
     * - `options` - the library's {@link module:pg-promise Initialization Options} object
     * - `promiseLib` - instance of the promise library that's used
     * - `promise` - generic promise interface that uses `promiseLib` via 4 basic methods:
     *   - `promise((resolve, reject) => {})` - to create a new promise
     *   - `promise.resolve(value)` - to resolve with a value
     *   - `promise.reject(reason)` - to reject with a reason
     *   - `promise.all(iterable)` - to resolve an iterable list of promises
     * - `version` - this library's version
     * - `$npm` _(hidden property)_ - internal module cache
     *
     * @example
     *
     * // Using the promise protocol as configured by pg-promise:
     *
     * const $p = db.$config.promise;
     *
     * const resolvedPromise = $p.resolve('some data');
     * const rejectedPromise = $p.reject('some reason');
     *
     * const newPromise = $p((resolve, reject) => {
     *     // call either resolve(data) or reject(reason) here
     * });
     */
    npm$1.utils.addReadProp(this, '$config', config, true);

    /**
     * @member {string|object} Database#$cn
     * @readonly
     * @description
     * Database connection, as was passed in during the object's construction.
     *
     * This is a hidden property, to help integrating type {@link Database} directly with third-party libraries.
     *
     * @see Database
     */
    npm$1.utils.addReadProp(this, '$cn', cn, true);

    /**
     * @member {*} Database#$dc
     * @readonly
     * @description
     * Database Context, as was passed in during the object's construction.
     *
     * This is a hidden property, to help integrating type {@link Database} directly with third-party libraries.
     *
     * @see Database
     */
    npm$1.utils.addReadProp(this, '$dc', dc, true);

    /**
     * @member {external:pg-pool} Database#$pool
     * @readonly
     * @description
     * A $[pg-pool] object associated with the database object, as each {@link Database} creates its own $[pg-pool] instance.
     *
     * This is a hidden property, primarily for integrating type {@link Database} with third-party libraries that support
     * $[pg-pool] directly. Note however, that if you pass the pool object into a library that calls `pool.end()`, you will no longer be able
     * to use this {@link Database} object, and each query method will be rejecting with {@link external:Error Error} =
     * `Connection pool of the database object has been destroyed.`
     *
     * You can also use this object to shut down the pool, by calling `$pool.end()`.
     *
     * For more details see $[Library de-initialization].
     *
     * @see
     * {@link Database}
     * {@link module:pg-promise~end pgp.end}
     *
     * @example
     *
     * // Shutting down the connection pool of this database object,
     * // after all queries have finished in a run-though process:
     *
     * .then(() => {}) // processing the data
     * .catch() => {}) // handling the error
     * .finally(db.$pool.end); // shutting down the pool
     *
     */
    npm$1.utils.addReadProp(this, '$pool', pool, true);

    /**
     * @member {function} Database.$destroy
     * @readonly
     * @private
     * @description
     * Permanently shuts down the database object.
     */
    npm$1.utils.addReadProp(this, '$destroy', () => {
        if (!destroyed) {
            if (!pool.ending) {
                endMethod.call(pool);
            }
            DatabasePool$1.unregister(dbThis);
            pool.removeListener('error', onError);
            destroyed = true;
        }
    }, true);

    DatabasePool$1.register(this);

    extend(createContext(), this); // extending root protocol;

    function createContext() {
        return new ConnectionContext({cn, dc, options: config.options});
    }

    // Optional value-transformation helper:
    function transform(value, cb, thisArg) {
        return typeof cb === 'function' ? value.then(data => cb.call(thisArg, data)) : value;
    }

    ////////////////////////////////////////////////////
    // Injects additional methods into an access object,
    // extending the protocol's base method 'query'.
    function extend(ctx, obj) {

        /**
         * @method Database#none
         * @description
         * Executes a query that expects no data to be returned. If the query returns any data,
         * the method rejects.
         *
         * When receiving a multi-query result, only the last result is processed, ignoring the rest.
         *
         * @param {string|function|object} query
         * Query to be executed, which can be any of the following types:
         * - A non-empty query string
         * - A function that returns a query string or another function, i.e. recursive resolution
         *   is supported, passing in `values` as `this`, and as the first parameter.
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value|function} [values]
         * Query formatting parameter(s), or a function that returns it.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @returns {external:Promise<null>}
         * A promise object that represents the query result:
         * - When no records are returned, it resolves with `null`.
         * - When any data is returned, it rejects with {@link errors.QueryResultError QueryResultError}:
         *   - `.message` = `No return data was expected.`
         *   - `.code` = {@link errors.queryResultErrorCode.notEmpty queryResultErrorCode.notEmpty}
         */
        obj.none = function (query, values) {
            return obj.query.call(this, query, values, queryResult$1.none);
        };

        /**
         * @method Database#one
         * @description
         * Executes a query that expects exactly 1 row to be returned. When 0 or more than 1 rows are returned,
         * the method rejects.
         *
         * When receiving a multi-query result, only the last result is processed, ignoring the rest.
         *
         * @param {string|function|object} query
         * Query to be executed, which can be any of the following types:
         * - A non-empty query string
         * - A function that returns a query string or another function, i.e. recursive resolution
         *   is supported, passing in `values` as `this`, and as the first parameter.
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value|function} [values]
         * Query formatting parameter(s), or a function that returns it.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @param {function} [cb]
         * Value-transformation callback, to allow in-line value change.
         * When specified, the returned value replaces the original one.
         *
         * The function takes only one parameter - value resolved from the query.
         *
         * @param {*} [thisArg]
         * Value to use as `this` when executing the transformation callback.
         *
         * @returns {external:Promise}
         * A promise object that represents the query result:
         * - When 1 row is returned, it resolves with that row as a single object.
         * - When no rows are returned, it rejects with {@link errors.QueryResultError QueryResultError}:
         *   - `.message` = `No data returned from the query.`
         *   - `.code` = {@link errors.queryResultErrorCode.noData queryResultErrorCode.noData}
         * - When multiple rows are returned, it rejects with {@link errors.QueryResultError QueryResultError}:
         *   - `.message` = `Multiple rows were not expected.`
         *   - `.code` = {@link errors.queryResultErrorCode.multiple queryResultErrorCode.multiple}
         * - Resolves with the new value, if transformation callback `cb` was specified.
         *
         * @see
         * {@link Database#oneOrNone oneOrNone}
         *
         * @example
         *
         * // a query with in-line value transformation:
         * db.one('INSERT INTO Events VALUES($1) RETURNING id', [123], event => event.id)
         *     .then(data => {
         *         // data = a new event id, rather than an object with it
         *     });
         *
         * @example
         *
         * // a query with in-line value transformation + conversion:
         * db.one('SELECT count(*) FROM Users', [], c => +c.count)
         *     .then(count => {
         *         // count = a proper integer value, rather than an object with a string
         *     });
         *
         */
        obj.one = function (query, values, cb, thisArg) {
            const v = obj.query.call(this, query, values, queryResult$1.one);
            return transform(v, cb, thisArg);
        };

        /**
         * @method Database#many
         * @description
         * Executes a query that expects one or more rows to be returned. When the query returns no rows, the method rejects.
         *
         * When receiving a multi-query result, only the last result is processed, ignoring the rest.
         *
         * @param {string|function|object} query
         * Query to be executed, which can be any of the following types:
         * - A non-empty query string
         * - A function that returns a query string or another function, i.e. recursive resolution
         *   is supported, passing in `values` as `this`, and as the first parameter.
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value|function} [values]
         * Query formatting parameter(s), or a function that returns it.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @returns {external:Promise}
         * A promise object that represents the query result:
         * - When 1 or more rows are returned, it resolves with the array of rows.
         * - When no rows are returned, it rejects with {@link errors.QueryResultError QueryResultError}:
         *   - `.message` = `No data returned from the query.`
         *   - `.code` = {@link errors.queryResultErrorCode.noData queryResultErrorCode.noData}
         */
        obj.many = function (query, values) {
            return obj.query.call(this, query, values, queryResult$1.many);
        };

        /**
         * @method Database#oneOrNone
         * @description
         * Executes a query that expects 0 or 1 rows to be returned. It resolves with the row-object when 1 row is returned,
         * or with `null` when nothing is returned. When the query returns more than 1 row, the method rejects.
         *
         * When receiving a multi-query result, only the last result is processed, ignoring the rest.
         *
         * @param {string|function|object} query
         * Query to be executed, which can be any of the following types:
         * - A non-empty query string
         * - A function that returns a query string or another function, i.e. recursive resolution
         *   is supported, passing in `values` as `this`, and as the first parameter.
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value|function} [values]
         * Query formatting parameter(s), or a function that returns it.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @param {function} [cb]
         * Value-transformation callback, to allow in-line value change.
         * When specified, the returned value replaces the original one.
         *
         * The function takes only one parameter - value resolved from the query.
         *
         * @param {*} [thisArg]
         * Value to use as `this` when executing the transformation callback.
         *
         * @returns {external:Promise}
         * A promise object that represents the query result:
         * - When no rows are returned, it resolves with `null`.
         * - When 1 row is returned, it resolves with that row as a single object.
         * - When multiple rows are returned, it rejects with {@link errors.QueryResultError QueryResultError}:
         *   - `.message` = `Multiple rows were not expected.`
         *   - `.code` = {@link errors.queryResultErrorCode.multiple queryResultErrorCode.multiple}
         * - Resolves with the new value, if transformation callback `cb` was specified.
         *
         * @see
         * {@link Database#one one},
         * {@link Database#none none},
         * {@link Database#manyOrNone manyOrNone}
         *
         * @example
         *
         * // a query with in-line value transformation:
         * db.oneOrNone('SELECT id FROM Events WHERE type = $1', ['entry'], e => e && e.id)
         *     .then(data => {
         *         // data = the event id or null (rather than object or null)
         *     });
         *
         */
        obj.oneOrNone = function (query, values, cb, thisArg) {
            const v = obj.query.call(this, query, values, queryResult$1.one | queryResult$1.none);
            return transform(v, cb, thisArg);
        };

        /**
         * @method Database#manyOrNone
         * @description
         * Executes a query that can return any number of rows.
         *
         * When receiving a multi-query result, only the last result is processed, ignoring the rest.
         *
         * @param {string|function|object} query
         * Query to be executed, which can be any of the following types:
         * - A non-empty query string
         * - A function that returns a query string or another function, i.e. recursive resolution
         *   is supported, passing in `values` as `this`, and as the first parameter.
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value|function} [values]
         * Query formatting parameter(s), or a function that returns it.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @returns {external:Promise<Array>}
         * A promise object that represents the query result:
         * - When no rows are returned, it resolves with an empty array.
         * - When 1 or more rows are returned, it resolves with the array of rows.
         *
         * @see
         * {@link Database#any any},
         * {@link Database#many many},
         * {@link Database#none none}
         *
         */
        obj.manyOrNone = function (query, values) {
            return obj.query.call(this, query, values, queryResult$1.many | queryResult$1.none);
        };

        /**
         * @method Database#any
         * @description
         * Executes a query that can return any number of rows.
         * This is simply a shorter alias for method {@link Database#manyOrNone manyOrNone}.
         *
         * When receiving a multi-query result, only the last result is processed, ignoring the rest.
         *
         * @param {string|function|object} query
         * Query to be executed, which can be any of the following types:
         * - A non-empty query string
         * - A function that returns a query string or another function, i.e. recursive resolution
         *   is supported, passing in `values` as `this`, and as the first parameter.
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value|function} [values]
         * Query formatting parameter(s), or a function that returns it.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @returns {external:Promise<Array>}
         * A promise object that represents the query result:
         * - When no rows are returned, it resolves with an empty array.
         * - When 1 or more rows are returned, it resolves with the array of rows.
         *
         * @see
         * {@link Database#manyOrNone manyOrNone},
         * {@link Database#map map},
         * {@link Database#each each}
         *
         */
        obj.any = function (query, values) {
            return obj.query.call(this, query, values, queryResult$1.any);
        };

        /**
         * @method Database#result
         * @description
         * Executes a query without any expectation for the return data, and resolves with the
         * original $[Result] object when successful.
         *
         * When receiving a multi-query result, only the last result is processed, ignoring the rest.
         *
         * @param {string|function|object} query
         * Query to be executed, which can be any of the following types:
         * - A non-empty query string
         * - A function that returns a query string or another function, i.e. recursive resolution
         *   is supported, passing in `values` as `this`, and as the first parameter.
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value|function} [values]
         * Query formatting parameter(s), or a function that returns it.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @param {function} [cb]
         * Value-transformation callback, to allow in-line value change.
         * When specified, the returned value replaces the original one.
         *
         * The function takes only one parameter - value resolved from the query.
         *
         * @param {*} [thisArg]
         * Value to use as `this` when executing the transformation callback.
         *
         * @returns {external:Promise}
         * A promise object that represents the query result:
         * - resolves with the original $[Result] object (by default);
         * - resolves with the new value, if transformation callback `cb` was specified.
         *
         * @example
         *
         * // use of value transformation:
         * // deleting rows and returning the number of rows deleted
         * db.result('DELETE FROM Events WHERE id = $1', [123], r => r.rowCount)
         *     .then(data => {
         *         // data = number of rows that were deleted
         *     });
         *
         * @example
         *
         * // use of value transformation:
         * // getting only column details from a table
         * db.result('SELECT * FROM Users LIMIT 0', null, r => r.fields)
         *     .then(data => {
         *         // data = array of column descriptors
         *     });
         *
         */
        obj.result = function (query, values, cb, thisArg) {
            const v = obj.query.call(this, query, values, resultQuery);
            return transform(v, cb, thisArg);
        };

        /**
         * @method Database#multiResult
         * @description
         * Executes a multi-query string, without any expectation for the return data, and resolves with an array
         * of the original $[Result] objects when successful.
         *
         * The operation is atomic, i.e. all queries are executed in a single transaction, unless there are explicit
         * `BEGIN/COMMIT` commands included in the query string to divide it into multiple transactions.
         *
         * @param {string|function|object} query
         * Multi-query string to be executed, which can be any of the following types:
         * - A non-empty string that can contain any number of queries
         * - A function that returns a query string or another function, i.e. recursive resolution
         *   is supported, passing in `values` as `this`, and as the first parameter.
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value|function} [values]
         * Query formatting parameter(s), or a function that returns it.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @returns {external:Promise<external:Result[]>}
         *
         * @see {@link Database#multi multi}
         *
         */
        obj.multiResult = function (query, values) {
            return obj.query.call(this, query, values, multiResultQuery);
        };

        /**
         * @method Database#multi
         * @description
         * Executes a multi-query string, without any expectation for the return data, and resolves with an array
         * of arrays of rows when successful.
         *
         * The operation is atomic, i.e. all queries are executed in a single transaction, unless there are explicit
         * `BEGIN/COMMIT` commands included in the query string to divide it into multiple transactions.
         *
         * @param {string|function|object} query
         * Multi-query string to be executed, which can be any of the following types:
         * - A non-empty string that can contain any number of queries
         * - A function that returns a query string or another function, i.e. recursive resolution
         *   is supported, passing in `values` as `this`, and as the first parameter.
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value|function} [values]
         * Query formatting parameter(s), or a function that returns it.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @returns {external:Promise<Array<Array>>}
         *
         * @see {@link Database#multiResult multiResult}
         *
         * @example
         *
         * // Get data from 2 tables in a single request:
         * const [users, products] = await db.multi('SELECT * FROM users;SELECT * FROM products');
         *
         */
        obj.multi = function (query, values) {
            return obj.query.call(this, query, values, multiResultQuery)
                .then(data => data.map(a => a.rows));
        };

        /**
         * @method Database#stream
         * @description
         * Custom data streaming, with the help of $[pg-query-stream].
         *
         * This method doesn't work with the $[Native Bindings], and if option `pgNative`
         * is set, it will reject with `Streaming doesn't work with Native Bindings.`
         *
         * @param {QueryStream} qs
         * Stream object of type $[QueryStream].
         *
         * @param {Database.streamInitCB} initCB
         * Stream initialization callback.
         *
         * It is invoked with the same `this` context as the calling method.
         *
         * @returns {external:Promise}
         * Result of the streaming operation.
         *
         * Once the streaming has finished successfully, the method resolves with
         * `{processed, duration}`:
         * - `processed` - total number of rows processed;
         * - `duration` - streaming duration, in milliseconds.
         *
         * Possible rejections messages:
         * - `Invalid or missing stream object.`
         * - `Invalid stream state.`
         * - `Invalid or missing stream initialization callback.`
         */
        obj.stream = function (qs, init) {
            return obj.query.call(this, qs, init, streamQuery);
        };

        /**
         * @method Database#func
         * @description
         * Executes a database function that returns a table, abbreviating the full syntax
         * of `query('SELECT * FROM $1:alias($2:csv)', [funcName, values], qrm)`.
         *
         * @param {string} funcName
         * Name of the function to be executed.
         * When it is not same-case, or contains extended symbols, it is double-quoted, as per the `:alias` filter,
         * which also supports `.`, to auto-split into a composite name.
         *
         * @param {array|value|function} [values]
         * Parameters for the function - one value | array of values | function returning value(s).
         *
         * @param {queryResult} [qrm=queryResult.any] - {@link queryResult Query Result Mask}.
         *
         * @returns {external:Promise}
         *
         * A promise object as returned from method {@link Database#query query}, according to parameter `qrm`.
         *
         * @see
         * {@link Database#query query},
         * {@link Database#proc proc}
         */
        obj.func = function (funcName, values, qrm) {
            return obj.query.call(this, {entity: funcName, type: 'func'}, values, qrm);
        };

        /**
         * @method Database#proc
         * @description
         * Executes a stored procedure by name, abbreviating the full syntax of
         * `oneOrNone('CALL $1:alias($2:csv)', [procName, values], cb, thisArg)`.
         *
         * **NOTE:** This method uses the new `CALL` syntax that requires PostgreSQL v11 or later.
         *
         * @param {string} procName
         * Name of the stored procedure to be executed.
         * When it is not same-case, or contains extended symbols, it is double-quoted, as per the `:alias` filter,
         * which also supports `.`, to auto-split into a composite SQL name.
         *
         * @param {array|value|function} [values]
         * Parameters for the procedure - one value | array of values | function returning value(s).
         *
         * @param {function} [cb]
         * Value-transformation callback, to allow in-line value change.
         * When specified, the returned value replaces the original one.
         *
         * The function takes only one parameter - value resolved from the query.
         *
         * @param {*} [thisArg]
         * Value to use as `this` when executing the transformation callback.
         *
         * @returns {external:Promise}
         * When the procedure takes output parameters, a single object is returned, with
         * properties for the output values. Otherwise, the method resolves with `null`.
         * And if the value-transformation callback is provided, it overrides the result.
         *
         * @see
         * {@link Database#func func}
         */
        obj.proc = function (procName, values, cb, thisArg) {
            const v = obj.query.call(this, {
                entity: procName,
                type: 'proc'
            }, values, queryResult$1.one | queryResult$1.none);
            return transform(v, cb, thisArg);
        };

        /**
         * @method Database#map
         * @description
         * Creates a new array with the results of calling a provided function on every element in the array of rows
         * resolved by method {@link Database#any any}.
         *
         * It is a convenience method, to reduce the following code:
         *
         * ```js
         * db.any(query, values)
         *     .then(data => {
         *         return data.map((row, index, data) => {
         *              // return a new element
         *         });
         *     });
         * ```
         *
         * When receiving a multi-query result, only the last result is processed, ignoring the rest.
         *
         * @param {string|function|object} query
         * Query to be executed, which can be any of the following types:
         * - A non-empty query string
         * - A function that returns a query string or another function, i.e. recursive resolution
         *   is supported, passing in `values` as `this`, and as the first parameter.
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value|function} values
         * Query formatting parameter(s), or a function that returns it.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @param {function} cb
         * Function that produces an element of the new array, taking three arguments:
         * - `row` - the current row object being processed in the array
         * - `index` - the index of the current row being processed in the array
         * - `data` - the original array of rows resolved by method {@link Database#any any}
         *
         * @param {*} [thisArg]
         * Value to use as `this` when executing the callback.
         *
         * @returns {external:Promise<Array>}
         * Resolves with the new array of values returned from the callback.
         *
         * @see
         * {@link Database#any any},
         * {@link Database#each each},
         * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map Array.map}
         *
         * @example
         *
         * db.map('SELECT id FROM Users WHERE status = $1', ['active'], row => row.id)
         *     .then(data => {
         *         // data = array of active user id-s
         *     })
         *     .catch(error => {
         *        // error
         *     });
         *
         * @example
         *
         * db.tx(t => {
         *     return t.map('SELECT id FROM Users WHERE status = $1', ['active'], row => {
         *        return t.none('UPDATE Events SET checked = $1 WHERE userId = $2', [true, row.id]);
         *     }).then(t.batch);
         * })
         *     .then(data => {
         *         // success
         *     })
         *     .catch(error => {
         *         // error
         *     });
         *
         * @example
         *
         * // Build a list of active users, each with the list of user events:
         * db.task(t => {
         *     return t.map('SELECT id FROM Users WHERE status = $1', ['active'], user => {
         *         return t.any('SELECT * FROM Events WHERE userId = $1', user.id)
         *             .then(events=> {
         *                 user.events = events;
         *                 return user;
         *             });
         *     }).then(t.batch);
         * })
         *     .then(data => {
         *         // success
         *     })
         *     .catch(error => {
         *         // error
         *     });
         *
         */
        obj.map = function (query, values, cb, thisArg) {
            return obj.any.call(this, query, values)
                .then(data => data.map(cb, thisArg));
        };

        /**
         * @method Database#each
         * @description
         * Executes a provided function once per array element, for an array of rows resolved by method {@link Database#any any}.
         *
         * It is a convenience method to reduce the following code:
         *
         * ```js
         * db.any(query, values)
         *     .then(data => {
         *         data.forEach((row, index, data) => {
         *              // process the row
         *         });
         *         return data;
         *     });
         * ```
         *
         * When receiving a multi-query result, only the last result is processed, ignoring the rest.
         *
         * @param {string|function|object} query
         * Query to be executed, which can be any of the following types:
         * - A non-empty query string
         * - A function that returns a query string or another function, i.e. recursive resolution
         *   is supported, passing in `values` as `this`, and as the first parameter.
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value|function} [values]
         * Query formatting parameter(s), or a function that returns it.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @param {function} cb
         * Function to execute for each row, taking three arguments:
         * - `row` - the current row object being processed in the array
         * - `index` - the index of the current row being processed in the array
         * - `data` - the array of rows resolved by method {@link Database#any any}
         *
         * @param {*} [thisArg]
         * Value to use as `this` when executing the callback.
         *
         * @returns {external:Promise<Array<Object>>}
         * Resolves with the original array of rows.
         *
         * @see
         * {@link Database#any any},
         * {@link Database#map map},
         * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach Array.forEach}
         *
         * @example
         *
         * db.each('SELECT id, code, name FROM Events', [], row => {
         *     row.code = parseInt(row.code);
         * })
         *     .then(data => {
         *         // data = array of events, with 'code' converted into integer
         *     })
         *     .catch(error => {
         *         // error
         *     });
         *
         */
        obj.each = function (query, values, cb, thisArg) {
            return obj.any.call(this, query, values)
                .then(data => {
                    data.forEach(cb, thisArg);
                    return data;
                });
        };

        /**
         * @method Database#task
         * @description
         * Executes a callback function with automatically managed connection.
         *
         * When invoked on the root {@link Database} object, the method allocates the connection from the pool,
         * executes the callback, and once finished - releases the connection back to the pool.
         * However, when invoked inside another task or transaction, the method reuses the parent connection.
         *
         * This method should be used whenever executing more than one query at once, so the allocated connection
         * is reused between all queries, and released only after the task has finished (see $[Chaining Queries]).
         *
         * The callback function is called with one parameter - database protocol (same as `this`), extended with methods
         * {@link Task#batch batch}, {@link Task#page page}, {@link Task#sequence sequence}, plus property {@link Task#ctx ctx} -
         * the task context object. See class {@link Task} for more details.
         *
         * @param {string|number|Object} [options]
         * This parameter is optional, and presumed skipped when the first parameter is a function (`cb` parameter).
         *
         * When it is of type `string` or `number`, it is assumed to be option `tag` passed in directly. Otherwise,
         * it is expected to be an object with options as listed below.
         *
         * @param {} [options.tag]
         * Traceable context for the task (see $[tags]).
         *
         * @param {function} cb
         * Task callback function, to return the result that will determine either success or failure for the operation.
         *
         * The function can be either the first of the second parameter passed into the method.
         *
         * It also can be an ES7 `async` function.
         *
         * @returns {external:Promise}
         * A promise object with the result from the callback function.
         *
         * @see
         * {@link Task},
         * {@link Database#taskIf taskIf},
         * {@link Database#tx tx},
         * $[tags],
         * $[Chaining Queries]
         *
         * @example
         *
         * db.task('my-task', t => {
         *         // t.ctx = task context object
         *
         *         return t.one('SELECT id FROM Users WHERE name = $1', 'John')
         *             .then(user => {
         *                 return t.any('SELECT * FROM Events WHERE userId = $1', user.id);
         *             });
         *     })
         *     .then(data => {
         *         // success
         *         // data = as returned from the task's callback
         *     })
         *     .catch(error => {
         *         // error
         *     });
         *
         * @example
         *
         * // using an ES7 syntax for the callback:
         * db.task('my-task', async t {
         *         // t.ctx = task context object
         *
         *         const user = await t.one('SELECT id FROM Users WHERE name = $1', 'John');
         *         return t.any('SELECT * FROM Events WHERE userId = $1', user.id);
         *     })
         *     .then(data => {
         *         // success
         *         // data = as returned from the task's callback
         *     })
         *     .catch(error => {
         *         // error
         *     });
         *
         */
        obj.task = function () {
            const args = npm$1.pubUtils.taskArgs(arguments);
            assert$1(args.options, ['tag']);
            return taskProcessor.call(this, args, false);
        };

        /**
         * @method Database#taskIf
         * @description
         * Executes a conditional task that results in an actual new {@link Database#task task}, if either condition is met or
         * when it is necessary (on the top level), or else it reuses the current connection context.
         *
         * The default condition is `not in task or transaction`, to start a task only if currently not inside another task or transaction,
         * which is the same as calling the following:
         *
         * ```js
         * db.taskIf({cnd: t => !t.ctx}, cb => {})
         * ```
         *
         * It can be useful, if you want to simplify/reduce the task + log events footprint, by creating new tasks only when necessary.
         *
         * @param {string|number|Object} [options]
         * This parameter is optional, and presumed skipped when the first parameter is a function (`cb` parameter).
         *
         * When it is of type `string` or `number`, it is assumed to be option `tag` passed in directly. Otherwise,
         * it is expected to be an object with options as listed below.
         *
         * @param {} [options.tag]
         * Traceable context for the task/transaction (see $[tags]).
         *
         * @param {boolean|function} [options.cnd]
         * Condition for creating a ({@link Database#task task}), if it is met.
         * It can be either a simple boolean, or a callback function that takes the task context as `this` and as the first parameter.
         *
         * Default condition (when it is not specified):
         *
         * ```js
         * {cnd: t => !t.ctx}
         * ```
         *
         * @param {function} cb
         * Task callback function, to return the result that will determine either success or failure for the operation.
         *
         * The function can be either the first or the second parameter passed into the method.
         *
         * It also can be an ES7 `async` function.
         *
         * @returns {external:Promise}
         * A promise object with the result from the callback function.
         *
         * @see
         * {@link Task},
         * {@link Database#task Database.task},
         * {@link Database#tx Database.tx},
         * {@link Database#txIf Database.txIf},
         * {@link TaskContext}
         *
         */
        obj.taskIf = function () {
            const args = npm$1.pubUtils.taskArgs(arguments);
            assert$1(args.options, ['tag', 'cnd']);
            try {
                let cnd = args.options.cnd;
                if ('cnd' in args.options) {
                    cnd = typeof cnd === 'function' ? cnd.call(obj, obj) : !!cnd;
                } else {
                    cnd = !obj.ctx; // create task, if it is the top level
                }
                // reusable only if condition fails, and not top-level:
                args.options.reusable = !cnd && !!obj.ctx;
            } catch (e) {
                return $p.reject(e);
            }
            return taskProcessor.call(this, args, false);
        };

        /**
         * @method Database#tx
         * @description
         * Executes a callback function as a transaction, with automatically managed connection.
         *
         * When invoked on the root {@link Database} object, the method allocates the connection from the pool,
         * executes the callback, and once finished - releases the connection back to the pool.
         * However, when invoked inside another task or transaction, the method reuses the parent connection.
         *
         * A transaction wraps a regular {@link Database#task task} into additional queries:
         * - it executes `BEGIN` just before invoking the callback function
         * - it executes `COMMIT`, if the callback didn't throw any error or return a rejected promise
         * - it executes `ROLLBACK`, if the callback did throw an error or return a rejected promise
         * - it executes corresponding `SAVEPOINT` commands when the method is called recursively.
         *
         * The callback function is called with one parameter - database protocol (same as `this`), extended with methods
         * {@link Task#batch batch}, {@link Task#page page}, {@link Task#sequence sequence}, plus property {@link Task#ctx ctx} -
         * the transaction context object. See class {@link Task} for more details.
         *
         * Note that transactions should be chosen over tasks only where necessary, because unlike regular tasks,
         * transactions are blocking operations.
         *
         * @param {string|number|Object} [options]
         * This parameter is optional, and presumed skipped when the first parameter is a function (`cb` parameter).
         *
         * When it is of type `string` or `number`, it is assumed to be option `tag` passed in directly. Otherwise,
         * it is expected to be an object with options as listed below.
         *
         * @param {} [options.tag]
         * Traceable context for the transaction (see $[tags]).
         *
         * @param {txMode.TransactionMode} [options.mode]
         * Transaction Configuration Mode - extends the transaction-opening command with additional configuration.
         *
         * @param {function} cb
         * Transaction callback function, to return the result that will determine either success or failure for the operation.
         *
         * The function can be either the first of the second parameter passed into the method.
         *
         * It also can be an ES7 `async` function.
         *
         * @returns {external:Promise}
         * A promise object with the result from the callback function.
         *
         * @see
         * {@link Task},
         * {@link Database#task Database.task},
         * {@link Database#taskIf Database.taskIf},
         * {@link TaskContext},
         * $[tags],
         * $[Chaining Queries]
         *
         * @example
         *
         * db.tx('my-transaction', t => {
         *         // t.ctx = transaction context object
         *
         *         return t.one('INSERT INTO Users(name, age) VALUES($1, $2) RETURNING id', ['Mike', 25])
         *             .then(user => {
         *                 return t.batch([
         *                     t.none('INSERT INTO Events(userId, name) VALUES($1, $2)', [user.id, 'created']),
         *                     t.none('INSERT INTO Events(userId, name) VALUES($1, $2)', [user.id, 'login'])
         *                 ]);
         *             });
         *     })
         *     .then(data => {
         *         // success
         *         // data = as returned from the transaction's callback
         *     })
         *     .catch(error => {
         *         // error
         *     });
         *
         * @example
         *
         * // using an ES7 syntax for the callback:
         * db.tx('my-transaction', async t {
         *         // t.ctx = transaction context object
         *
         *         const user = await t.one('INSERT INTO Users(name, age) VALUES($1, $2) RETURNING id', ['Mike', 25]);
         *         return t.none('INSERT INTO Events(userId, name) VALUES($1, $2)', [user.id, 'created']);
         *     })
         *     .then(data => {
         *         // success
         *         // data = as returned from the transaction's callback
         *     })
         *     .catch(error => {
         *         // error
         *     });
         *
         */
        obj.tx = function () {
            const args = npm$1.pubUtils.taskArgs(arguments);
            assert$1(args.options, ['tag', 'mode']);
            return taskProcessor.call(this, args, true);
        };

        /**
         * @method Database#txIf
         * @description
         * Executes a conditional transaction that results in an actual transaction ({@link Database#tx tx}), if the condition is met,
         * or else it executes a regular {@link Database#task task}.
         *
         * The default condition is `not in transaction`, to start a transaction only if currently not in transaction,
         * or else start a task, which is the same as calling the following:
         *
         * ```js
         * db.txIf({cnd: t => !t.ctx || !t.ctx.inTransaction}, cb => {})
         * ```
         *
         * It is useful when you want to avoid $[Nested Transactions] - savepoints.
         *
         * @param {string|number|Object} [options]
         * This parameter is optional, and presumed skipped when the first parameter is a function (`cb` parameter).
         *
         * When it is of type `string` or `number`, it is assumed to be option `tag` passed in directly. Otherwise,
         * it is expected to be an object with options as listed below.
         *
         * @param {} [options.tag]
         * Traceable context for the task/transaction (see $[tags]).
         *
         * @param {txMode.TransactionMode} [options.mode]
         * Transaction Configuration Mode - extends the transaction-opening command with additional configuration.
         *
         * @param {boolean|function} [options.cnd]
         * Condition for opening a transaction ({@link Database#tx tx}), if it is met, or a {@link Database#task task} when the condition is not met.
         * It can be either a simple boolean, or a callback function that takes the task/tx context as `this` and as the first parameter.
         *
         * Default condition (when it is not specified):
         *
         * ```js
         * {cnd: t => !t.ctx || !t.ctx.inTransaction}
         * ```
         *
         * @param {boolean|function} [options.reusable=false]
         * When `cnd` is/returns false, reuse context of the current task/transaction, if one exists.
         * It can be either a simple boolean, or a callback function that takes the task/tx context as `this`
         * and as the first parameter.
         *
         * By default, when `cnd` is/returns false, the method creates a new task. This option tells
         * the method to reuse the current task/transaction context, and not create a new task.
         *
         * This option is ignored when executing against the top level of the protocol, because on
         * that level, if no transaction is suddenly needed, a new task becomes necessary.
         *
         * @param {function} cb
         * Transaction/task callback function, to return the result that will determine either
         * success or failure for the operation.
         *
         * The function can be either the first or the second parameter passed into the method.
         *
         * It also can be an ES7 `async` function.
         *
         * @returns {external:Promise}
         * A promise object with the result from the callback function.
         *
         * @see
         * {@link Task},
         * {@link Database#task Database.task},
         * {@link Database#taskIf Database.taskIf},
         * {@link Database#tx Database.tx},
         * {@link TaskContext}
         */
        obj.txIf = function () {
            const args = npm$1.pubUtils.taskArgs(arguments);
            assert$1(args.options, ['tag', 'mode', 'cnd', 'reusable']);
            try {
                let cnd;
                if ('cnd' in args.options) {
                    cnd = args.options.cnd;
                    cnd = typeof cnd === 'function' ? cnd.call(obj, obj) : !!cnd;
                } else {
                    cnd = !obj.ctx || !obj.ctx.inTransaction;
                }
                args.options.cnd = cnd;
                const reusable = args.options.reusable;
                args.options.reusable = !cnd && obj.ctx && typeof reusable === 'function' ? reusable.call(obj, obj) : !!reusable;
            } catch (e) {
                return $p.reject(e);
            }
            return taskProcessor.call(this, args, args.options.cnd);
        };

        // Task method;
        // Resolves with result from the callback function;
        function taskProcessor(params, isTX) {

            if (typeof params.cb !== 'function') {
                return $p.reject(new TypeError('Callback function is required.'));
            }

            if (params.options.reusable) {
                return config.$npm.task.callback(obj.ctx, obj, params.cb, config);
            }

            const taskCtx = ctx.clone(); // task context object;
            if (isTX) {
                taskCtx.txLevel = taskCtx.txLevel >= 0 ? (taskCtx.txLevel + 1) : 0;
            }
            taskCtx.inTransaction = taskCtx.txLevel >= 0;
            taskCtx.level = taskCtx.level >= 0 ? (taskCtx.level + 1) : 0;
            taskCtx.cb = params.cb; // callback function;
            taskCtx.mode = params.options.mode; // transaction mode;
            if (this !== obj) {
                taskCtx.context = this; // calling context object;
            }

            const tsk = new config.$npm.task.Task(taskCtx, params.options.tag, isTX, config);
            taskCtx.taskCtx = tsk.ctx;
            extend(taskCtx, tsk);

            if (taskCtx.db) {
                // reuse existing connection;
                npm$1.utils.addReadProp(tsk.ctx, 'useCount', taskCtx.db.useCount);
                addServerVersion(tsk.ctx, taskCtx.db.client);
                return config.$npm.task.execute(taskCtx, tsk, isTX, config);
            }

            // connection required;
            return config.$npm.connect.pool(taskCtx, dbThis)
                .then(db => {
                    taskCtx.connect(db);
                    npm$1.utils.addReadProp(tsk.ctx, 'useCount', db.useCount);
                    addServerVersion(tsk.ctx, db.client);
                    return config.$npm.task.execute(taskCtx, tsk, isTX, config);
                })
                .then(data => {
                    taskCtx.disconnect();
                    return data;
                })
                .catch(error => {
                    taskCtx.disconnect();
                    return $p.reject(error);
                });
        }

        function addServerVersion(target, client) {
            // Exclude else-case from coverage, because it can only occur with Native Bindings.
            // istanbul ignore else
            if (client.serverVersion) {
                npm$1.utils.addReadProp(target, 'serverVersion', client.serverVersion);
            }
        }

        // extending the protocol;
        Events.extend(ctx.options, obj, ctx.dc);
    }

}

// this event only happens when the connection is lost physically,
// which cannot be tested automatically; removing from coverage:
// istanbul ignore next
function onError(err) {
    // this client was never seen by pg-promise, which
    // can happen if it failed to initialize
    if (!err.client.$ctx) {
        return;
    }
    const ctx = err.client.$ctx;
    Events.error(ctx.options, err, {
        cn: npm$1.utils.getSafeConnection(ctx.cn),
        dc: ctx.dc
    });
}

var database = config => {
    const npmLocal = config.$npm;
    npmLocal.connect = npmLocal.connect || npm$1.connect(config);
    npmLocal.query = npmLocal.query || npm$1.query(config);
    npmLocal.task = npmLocal.task || npm$1.task(config);
    return Database;
};

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

const {PromiseAdapter} = promiseAdapter;
const {DatabasePool} = databasePool;
const {PreparedStatement, ParameterizedQuery} = types;
const {QueryFile} = queryFile;
const {queryResult} = queryResult_1;
const {parsePromise} = promiseParser;
const {assert} = assert$d;

const npm = {
    path: require$$0$1,
    pg: require$$8,
    minify: lib$2,
    formatting: formatting,
    helpers: helpers,
    errors: errors$1,
    utils: utils$4,
    pubUtils: _public,
    mode: txMode,
    package: require$$16,
    text: text
};

let originalClientConnect;

/**
 * @author Vitaly Tomilov
 * @module pg-promise
 *
 * @description
 * ## pg-promise v11.15
 * All documentation here is for the latest official release only.
 *
 * ### Initialization Options
 *
 * Below is the complete list of _Initialization Options_ for the library that can be passed in during
 * the library's initialization:
 *
 * ```js
 * const initOptions = {&#47;* options as documented below *&#47;};
 *
 * const pgp = require('pg-promise')(initOptions);
 * ```
 *
 * @property {{}} [options]
 * Library Initialization Options.
 *
 * @property {boolean} [options.pgFormatting=false]
 * Redirects all query formatting to the $[pg] driver.
 *
 * By default (`false`), the library uses its own advanced query-formatting engine.
 * If you set this option to a truthy value, query formatting will be done entirely by the
 * $[pg] driver, which means you won't be able to use any of the feature-rich query formatting
 * that this library implements, restricting yourself to the very basic `$1, $2,...` syntax.
 *
 * This option is dynamic (can be set before or after initialization).
 *
 * @property {boolean} [options.pgNative=false]
 * Use $[Native Bindings]. Library $[pg-native] must be included and installed independently, or else there will
 * be an error thrown: {@link external:Error Error} = `Failed to initialize Native Bindings.`
 *
 * This is a static option (can only be set prior to initialization).
 *
 * @property {object|function} [options.promiseLib=Promise]
 * Overrides the default (ES6 Promise) promise library for its internal use.
 *
 * Example below sets to use $[Bluebird] - the best and recommended promise library. It is the fastest one,
 * and supports $[Long Stack Traces], essential for debugging promises.
 *
 * ```js
 * const Promise = require('bluebird');
 * const initOptions = {
 *     promiseLib: Promise
 * };
 * const pgp = require('pg-promise')(initOptions);
 * ```
 *
 * All existing promise libraries are supported. The ones with recognizable signature are used automatically,
 * while the rest can be configured via the $[Promise Adapter].
 *
 * This is a static option (can only be set prior to initialization).
 *
 * @property {boolean} [options.capSQL=false]
 * Capitalizes any SQL generated by the library.
 *
 * By default, all internal SQL within the library is generated using the low case.
 * If, however, you want all SQL to be capitalized instead, set `capSQL` = `true`.
 *
 * It is purely a cosmetic feature.
 *
 * This option is dynamic (can be set before or after initialization).
 *
 * @property {string|Array<string>|null|undefined|function} [options.schema]
 * Forces change of the default database schema(s) for every fresh connection, i.e.
 * the library will execute `SET search_path TO schema_1, schema_2, ...` in the background
 * whenever a fresh physical connection is allocated.
 *
 * Normally, one changes the default schema(s) by $[changing the database or the role], but sometimes you
 * may want to switch the default schema(s) without persisting the change, and then use this option.
 *
 * It can be a string, an array of strings, or a callback function that takes `dc` (database context)
 * as the only parameter (and as `this`), and returns schema(s) according to the database context. A callback function
 * can also return nothing (`undefined` or `null`), if no schema change needed for the specified database context.
 *
 * The order of schema names matters, so if a table name exists in more than one schema, its default access resolves
 * to the table from the first such schema on the list.
 *
 * This option is dynamic (can be set before or after initialization).
 *
 * @property {boolean} [options.noWarnings=false]
 * Disables all diagnostic warnings in the library (it is ill-advised).
 *
 * This option is dynamic (can be set before or after initialization).
 *
 * @property {function} [options.connect]
 * Global event {@link event:connect connect} handler.
 *
 * This option is dynamic (can be set before or after initialization).
 *
 * @property {function} [options.disconnect]
 * Global event {@link event:disconnect disconnect} handler.
 *
 * This option is dynamic (can be set before or after initialization).
 *
 * @property {function} [options.query]
 * Global event {@link event:query query} handler.
 *
 * This option is dynamic (can be set before or after initialization).
 *
 * @property {function} [options.receive]
 * Global event {@link event:receive receive} handler.
 *
 * This option is dynamic (can be set before or after initialization).
 *
 * @property {function} [options.task]
 * Global event {@link event:task task} handler.
 *
 * This option is dynamic (can be set before or after initialization).
 *
 * @property {function} [options.transact]
 * Global event {@link event:transact transact} handler.
 *
 * This option is dynamic (can be set before or after initialization).
 *
 * @property {function} [options.error]
 * Global event {@link event:error error} handler.
 *
 * This option is dynamic (can be set before or after initialization).
 *
 * @property {function} [options.extend]
 * Global event {@link event:extend extend} handler.
 *
 * This option is dynamic (can be set before or after initialization).
 *
 * @see
 * {@link module:pg-promise~end end},
 * {@link module:pg-promise~as as},
 * {@link module:pg-promise~errors errors},
 * {@link module:pg-promise~helpers helpers},
 * {@link module:pg-promise~minify minify},
 * {@link module:pg-promise~ParameterizedQuery ParameterizedQuery},
 * {@link module:pg-promise~PreparedStatement PreparedStatement},
 * {@link module:pg-promise~pg pg},
 * {@link module:pg-promise~QueryFile QueryFile},
 * {@link module:pg-promise~queryResult queryResult},
 * {@link module:pg-promise~spex spex},
 * {@link module:pg-promise~txMode txMode},
 * {@link module:pg-promise~utils utils}
 *
 */
function $main(options) {

    options = assert(options, ['pgFormatting', 'pgNative', 'promiseLib', 'capSQL', 'noWarnings',
        'connect', 'disconnect', 'query', 'receive', 'task', 'transact', 'error', 'extend', 'schema']);

    let pg = npm.pg;
    const p = parsePromise(options.promiseLib);

    const config = {
        version: npm.package.version,
        promiseLib: p.promiseLib,
        promise: p.promise
    };

    npm.utils.addReadProp(config, '$npm', {}, true);

    // Locking properties that cannot be changed later:
    npm.utils.addReadProp(options, 'promiseLib', options.promiseLib);
    npm.utils.addReadProp(options, 'pgNative', !!options.pgNative);

    config.options = options;

    // istanbul ignore next:
    // we do not cover code specific to Native Bindings
    if (options.pgNative) {
        pg = npm.pg.native;
        if (npm.utils.isNull(pg)) {
            throw new Error(npm.text.nativeError);
        }
    } else {
        if (!originalClientConnect) {
            originalClientConnect = pg.Client.prototype.connect;
            pg.Client.prototype.connect = function () {
                const handler = msg => {
                    if (msg.parameterName === 'server_version') {
                        this.serverVersion = msg.parameterValue;
                        this.connection.removeListener('parameterStatus', handler);
                    }
                };
                this.connection.on('parameterStatus', handler);
                return originalClientConnect.call(this, ...arguments);
            };
        }
    }

    const Database = database(config);

    const inst = (cn, dc) => {
        if (npm.utils.isText(cn) || (cn && typeof cn === 'object')) {
            return new Database(cn, dc, config);
        }
        throw new TypeError('Invalid connection details: ' + npm.utils.toJson(cn));
    };

    npm.utils.addReadProperties(inst, rootNameSpace);

    /**
     * @member {external:PG} pg
     * @description
     * Instance of the $[pg] library that's being used, depending on initialization option `pgNative`:
     *  - regular `pg` module instance, without option `pgNative`, or equal to `false` (default)
     *  - `pg` module instance with $[Native Bindings], if option `pgNative` was set.
     *
     * Available as `pgp.pg`, after initializing the library.
     */
    inst.pg = pg; // keep it modifiable, so the protocol can be mocked

    /**
     * @member {function} end
     * @readonly
     * @description
     * Shuts down all connection pools created in the process, so it can terminate without delay.
     * It is available as `pgp.end`, after initializing the library.
     *
     * All {@link Database} objects created previously can no longer be used, and their query methods will be rejecting
     * with {@link external:Error Error} = `Connection pool of the database object has been destroyed.`
     *
     * And if you want to shut down only a specific connection pool, you do so via the {@link Database}
     * object that owns the pool: `db.$pool.end()` (see {@link Database#$pool Database.$pool}).
     *
     * For more details see $[Library de-initialization].
     */
    npm.utils.addReadProp(inst, 'end', () => {
        DatabasePool.shutDown();
    });

    /**
     * @member {helpers} helpers
     * @readonly
     * @description
     * Namespace for {@link helpers all query-formatting helper functions}.
     *
     * Available as `pgp.helpers`, after initializing the library.
     *
     * @see {@link helpers}.
     */
    npm.utils.addReadProp(inst, 'helpers', npm.helpers(config));

    /**
     * @member {external:spex} spex
     * @readonly
     * @description
     * Initialized instance of the $[spex] module, used by the library within tasks and transactions.
     *
     * Available as `pgp.spex`, after initializing the library.
     *
     * @see
     * {@link Task#batch},
     * {@link Task#page},
     * {@link Task#sequence}
     */
    npm.utils.addReadProp(inst, 'spex', config.$npm.spex);

    config.pgp = inst;

    return inst;
}

const rootNameSpace = {

    /**
     * @member {formatting} as
     * @readonly
     * @description
     * Namespace for {@link formatting all query-formatting functions}.
     *
     * Available as `pgp.as`, before and after initializing the library.
     *
     * @see {@link formatting}.
     */
    as: npm.formatting.as,

    /**
     * @member {external:pg-minify} minify
     * @readonly
     * @description
     * Instance of the $[pg-minify] library used internally to minify SQL scripts.
     *
     * Available as `pgp.minify`, before and after initializing the library.
     */
    minify: npm.minify,

    /**
     * @member {queryResult} queryResult
     * @readonly
     * @description
     * Query Result Mask enumerator.
     *
     * Available as `pgp.queryResult`, before and after initializing the library.
     */
    queryResult,

    /**
     * @member {PromiseAdapter} PromiseAdapter
     * @readonly
     * @description
     * {@link PromiseAdapter} class.
     *
     * Available as `pgp.PromiseAdapter`, before and after initializing the library.
     */
    PromiseAdapter,

    /**
     * @member {ParameterizedQuery} ParameterizedQuery
     * @readonly
     * @description
     * {@link ParameterizedQuery} class.
     *
     * Available as `pgp.ParameterizedQuery`, before and after initializing the library.
     */
    ParameterizedQuery,

    /**
     * @member {PreparedStatement} PreparedStatement
     * @readonly
     * @description
     * {@link PreparedStatement} class.
     *
     * Available as `pgp.PreparedStatement`, before and after initializing the library.
     */
    PreparedStatement,

    /**
     * @member {QueryFile} QueryFile
     * @readonly
     * @description
     * {@link QueryFile} class.
     *
     * Available as `pgp.QueryFile`, before and after initializing the library.
     */
    QueryFile,

    /**
     * @member {errors} errors
     * @readonly
     * @description
     * {@link errors} - namespace for all error types.
     *
     * Available as `pgp.errors`, before and after initializing the library.
     */
    errors: npm.errors,

    /**
     * @member {utils} utils
     * @readonly
     * @description
     * {@link utils} - namespace for utility functions.
     *
     * Available as `pgp.utils`, before and after initializing the library.
     */
    utils: npm.pubUtils,

    /**
     * @member {txMode} txMode
     * @readonly
     * @description
     * {@link txMode Transaction Mode} namespace.
     *
     * Available as `pgp.txMode`, before and after initializing the library.
     */
    txMode: npm.mode
};

npm.utils.addReadProperties($main, rootNameSpace);

var main = $main;

/*
 * Copyright (c) 2015-present, Vitaly Tomilov
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

/* eslint no-var: off */
var v = process.versions.node.split('.'),
    highVer = +v[0];

// istanbul ignore next
if (highVer < 16) {

    // From pg-promise v11.15.0, the oldest supported Node.js is v16.0.0

    // Node.js v14.x was supported up to pg-promise v11.14.0
    // Node.js v12.x was supported up to pg-promise v10.15.4
    // Node.js v8.x was supported up to pg-promise v10.14.2
    // Node.js v7.6.0 was supported up to pg-promise v10.3.5
    // Node.js v4.5.0 was supported up to pg-promise v8.7.5
    // Node.js v0.10 was supported up to pg-promise v5.5.8

    throw new Error('Minimum Node.js version supported by pg-promise is 16.0.0');
}

var lib = main;

var pgPromise = /*@__PURE__*/getDefaultExportFromCjs(lib);

// src/vector/index.ts
var PGFilterTranslator = class extends BaseFilterTranslator {
  getSupportedOperators() {
    return {
      ...BaseFilterTranslator.DEFAULT_OPERATORS,
      custom: ["$contains", "$size"]
    };
  }
  translate(filter) {
    if (this.isEmpty(filter)) {
      return filter;
    }
    this.validateFilter(filter);
    return this.translateNode(filter);
  }
  translateNode(node, currentPath = "") {
    const withPath = (result2) => currentPath ? { [currentPath]: result2 } : result2;
    if (this.isPrimitive(node)) {
      return withPath({ $eq: this.normalizeComparisonValue(node) });
    }
    if (Array.isArray(node)) {
      return withPath({ $in: this.normalizeArrayValues(node) });
    }
    if (node instanceof RegExp) {
      return withPath(this.translateRegexPattern(node.source, node.flags));
    }
    const entries = Object.entries(node);
    const result = {};
    if (node && "$options" in node && !("$regex" in node)) {
      throw new Error("$options is not valid without $regex");
    }
    if (node && "$regex" in node) {
      const options = node.$options || "";
      return withPath(this.translateRegexPattern(node.$regex, options));
    }
    for (const [key, value] of entries) {
      if (key === "$options") continue;
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      if (this.isLogicalOperator(key)) {
        result[key] = Array.isArray(value) ? value.map((filter) => this.translateNode(filter)) : this.translateNode(value);
      } else if (this.isOperator(key)) {
        if (this.isArrayOperator(key) && !Array.isArray(value) && key !== "$elemMatch") {
          result[key] = [value];
        } else if (this.isBasicOperator(key) && Array.isArray(value)) {
          result[key] = JSON.stringify(value);
        } else {
          result[key] = value;
        }
      } else if (typeof value === "object" && value !== null) {
        const hasOperators = Object.keys(value).some((k) => this.isOperator(k));
        if (hasOperators) {
          result[newPath] = this.translateNode(value);
        } else {
          Object.assign(result, this.translateNode(value, newPath));
        }
      } else {
        result[newPath] = this.translateNode(value);
      }
    }
    return result;
  }
  translateRegexPattern(pattern, options = "") {
    if (!options) return { $regex: pattern };
    const flags = options.split("").filter((f) => "imsux".includes(f)).join("");
    return { $regex: flags ? `(?${flags})${pattern}` : pattern };
  }
};
var createBasicOperator = (symbol) => {
  return (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `CASE 
        WHEN $${paramIndex}::text IS NULL THEN metadata#>>'{${jsonPathKey}}' IS ${symbol === "=" ? "" : "NOT"} NULL
        ELSE metadata#>>'{${jsonPathKey}}' ${symbol} $${paramIndex}::text
      END`,
      needsValue: true
    };
  };
};
var createNumericOperator = (symbol) => {
  return (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `(metadata#>>'{${jsonPathKey}}')::numeric ${symbol} $${paramIndex}`,
      needsValue: true
    };
  };
};
function buildElemMatchConditions(value, paramIndex) {
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("$elemMatch requires an object with conditions");
  }
  const conditions = [];
  const values = [];
  Object.entries(value).forEach(([field, val]) => {
    const nextParamIndex = paramIndex + values.length;
    let paramOperator;
    let paramKey;
    let paramValue;
    if (field.startsWith("$")) {
      paramOperator = field;
      paramKey = "";
      paramValue = val;
    } else if (typeof val === "object" && !Array.isArray(val)) {
      const [op, opValue] = Object.entries(val || {})[0] || [];
      paramOperator = op;
      paramKey = field;
      paramValue = opValue;
    } else {
      paramOperator = "$eq";
      paramKey = field;
      paramValue = val;
    }
    const operatorFn = FILTER_OPERATORS[paramOperator];
    if (!operatorFn) {
      throw new Error(`Invalid operator: ${paramOperator}`);
    }
    const result = operatorFn(paramKey, nextParamIndex, paramValue);
    const sql = result.sql.replaceAll("metadata#>>", "elem#>>");
    conditions.push(sql);
    if (result.needsValue) {
      values.push(paramValue);
    }
  });
  return {
    sql: conditions.join(" AND "),
    values
  };
}
var FILTER_OPERATORS = {
  $eq: createBasicOperator("="),
  $ne: createBasicOperator("!="),
  $gt: createNumericOperator(">"),
  $gte: createNumericOperator(">="),
  $lt: createNumericOperator("<"),
  $lte: createNumericOperator("<="),
  // Array Operators
  $in: (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `(
        CASE
          WHEN jsonb_typeof(metadata->'${jsonPathKey}') = 'array' THEN
            EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(metadata->'${jsonPathKey}') as elem
              WHERE elem = ANY($${paramIndex}::text[])
            )
          ELSE metadata#>>'{${jsonPathKey}}' = ANY($${paramIndex}::text[])
        END
      )`,
      needsValue: true
    };
  },
  $nin: (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `(
        CASE
          WHEN jsonb_typeof(metadata->'${jsonPathKey}') = 'array' THEN
            NOT EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(metadata->'${jsonPathKey}') as elem
              WHERE elem = ANY($${paramIndex}::text[])
            )
          ELSE metadata#>>'{${jsonPathKey}}' != ALL($${paramIndex}::text[])
        END
      )`,
      needsValue: true
    };
  },
  $all: (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `CASE WHEN array_length($${paramIndex}::text[], 1) IS NULL THEN false 
            ELSE (metadata#>'{${jsonPathKey}}')::jsonb ?& $${paramIndex}::text[] END`,
      needsValue: true
    };
  },
  $elemMatch: (key, paramIndex, value) => {
    const { sql, values } = buildElemMatchConditions(value, paramIndex);
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `(
        CASE
          WHEN jsonb_typeof(metadata->'${jsonPathKey}') = 'array' THEN
            EXISTS (
              SELECT 1 
              FROM jsonb_array_elements(metadata->'${jsonPathKey}') as elem
              WHERE ${sql}
            )
          ELSE FALSE
        END
      )`,
      needsValue: true,
      transformValue: () => values
    };
  },
  // Element Operators
  $exists: (key) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `metadata ? '${jsonPathKey}'`,
      needsValue: false
    };
  },
  // Logical Operators
  $and: (key) => ({ sql: `(${key})`, needsValue: false }),
  $or: (key) => ({ sql: `(${key})`, needsValue: false }),
  $not: (key) => ({ sql: `NOT (${key})`, needsValue: false }),
  $nor: (key) => ({ sql: `NOT (${key})`, needsValue: false }),
  // Regex Operators
  $regex: (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `metadata#>>'{${jsonPathKey}}' ~ $${paramIndex}`,
      needsValue: true
    };
  },
  $contains: (key, paramIndex, value) => {
    const jsonPathKey = parseJsonPathKey(key);
    let sql;
    if (Array.isArray(value)) {
      sql = `(metadata->'${jsonPathKey}') ?& $${paramIndex}`;
    } else if (typeof value === "string") {
      sql = `metadata->>'${jsonPathKey}' ILIKE '%' || $${paramIndex} || '%' ESCAPE '\\'`;
    } else {
      sql = `metadata->>'${jsonPathKey}' = $${paramIndex}`;
    }
    return {
      sql,
      needsValue: true,
      transformValue: () => Array.isArray(value) ? value.map(String) : typeof value === "string" ? escapeLikePattern(value) : value
    };
  },
  /**
   * $objectContains: Postgres-only operator for true JSONB object containment.
   * Usage: { field: { $objectContains: { ...subobject } } }
   */
  // $objectContains: (key, paramIndex) => ({
  //   sql: `metadata @> $${paramIndex}::jsonb`,
  //   needsValue: true,
  //   transformValue: value => {
  //     const parts = key.split('.');
  //     return JSON.stringify(parts.reduceRight((value, key) => ({ [key]: value }), value));
  //   },
  // }),
  $size: (key, paramIndex) => {
    const jsonPathKey = parseJsonPathKey(key);
    return {
      sql: `(
      CASE
        WHEN jsonb_typeof(metadata#>'{${jsonPathKey}}') = 'array' THEN 
          jsonb_array_length(metadata#>'{${jsonPathKey}}') = $${paramIndex}
        ELSE FALSE
      END
    )`,
      needsValue: true
    };
  }
};
var parseJsonPathKey = (key) => {
  const parsedKey = key !== "" ? parseFieldKey(key) : "";
  return parsedKey.replace(/\./g, ",");
};
function escapeLikePattern(str) {
  return str.replace(/([%_\\])/g, "\\$1");
}
function buildFilterQuery(filter, minScore, topK) {
  const values = [minScore, topK];
  function buildCondition(key, value, parentPath) {
    if (["$and", "$or", "$not", "$nor"].includes(key)) {
      return handleLogicalOperator(key, value);
    }
    if (!value || typeof value !== "object") {
      values.push(value);
      return `metadata#>>'{${parseJsonPathKey(key)}}' = $${values.length}`;
    }
    const [[operator, operatorValue] = []] = Object.entries(value);
    if (operator === "$not") {
      const entries = Object.entries(operatorValue);
      const conditions2 = entries.map(([nestedOp, nestedValue]) => {
        if (!FILTER_OPERATORS[nestedOp]) {
          throw new Error(`Invalid operator in $not condition: ${nestedOp}`);
        }
        const operatorFn2 = FILTER_OPERATORS[nestedOp];
        const operatorResult2 = operatorFn2(key, values.length + 1, nestedValue);
        if (operatorResult2.needsValue) {
          values.push(nestedValue);
        }
        return operatorResult2.sql;
      }).join(" AND ");
      return `NOT (${conditions2})`;
    }
    const operatorFn = FILTER_OPERATORS[operator];
    const operatorResult = operatorFn(key, values.length + 1, operatorValue);
    if (operatorResult.needsValue) {
      const transformedValue = operatorResult.transformValue ? operatorResult.transformValue() : operatorValue;
      if (Array.isArray(transformedValue) && operator === "$elemMatch") {
        values.push(...transformedValue);
      } else {
        values.push(transformedValue);
      }
    }
    return operatorResult.sql;
  }
  function handleLogicalOperator(key, value, parentPath) {
    if (key === "$not") {
      const entries = Object.entries(value);
      const conditions3 = entries.map(([fieldKey, fieldValue]) => buildCondition(fieldKey, fieldValue)).join(" AND ");
      return `NOT (${conditions3})`;
    }
    if (!value || value.length === 0) {
      switch (key) {
        case "$and":
        case "$nor":
          return "true";
        // Empty $and/$nor match everything
        case "$or":
          return "false";
        // Empty $or matches nothing
        default:
          return "true";
      }
    }
    const joinOperator = key === "$or" || key === "$nor" ? "OR" : "AND";
    const conditions2 = value.map((f) => {
      const entries = Object.entries(f || {});
      if (entries.length === 0) return "";
      const [firstKey, firstValue] = entries[0] || [];
      if (["$and", "$or", "$not", "$nor"].includes(firstKey)) {
        return buildCondition(firstKey, firstValue);
      }
      return entries.map(([k, v]) => buildCondition(k, v)).join(` ${joinOperator} `);
    });
    const joined = conditions2.join(` ${joinOperator} `);
    const operatorFn = FILTER_OPERATORS[key];
    return operatorFn(joined, 0, value).sql;
  }
  if (!filter) {
    return { sql: "", values };
  }
  const conditions = Object.entries(filter).map(([key, value]) => buildCondition(key, value)).filter(Boolean).join(" AND ");
  return { sql: conditions ? `WHERE ${conditions}` : "", values };
}

// src/vector/index.ts
var PgVector = class extends MastraVector {
  pool;
  describeIndexCache = /* @__PURE__ */ new Map();
  createdIndexes = /* @__PURE__ */ new Map();
  mutexesByName = /* @__PURE__ */ new Map();
  schema;
  setupSchemaPromise = null;
  installVectorExtensionPromise = null;
  vectorExtensionInstalled = void 0;
  schemaSetupComplete = void 0;
  constructor({
    connectionString,
    schemaName,
    pgPoolOptions
  }) {
    try {
      if (!connectionString || connectionString.trim() === "") {
        throw new Error(
          "PgVector: connectionString must be provided and cannot be empty. Passing an empty string may cause fallback to local Postgres defaults."
        );
      }
      super();
      this.schema = schemaName;
      const basePool = new require$$8.Pool({
        connectionString,
        max: 20,
        // Maximum number of clients in the pool
        idleTimeoutMillis: 3e4,
        // Close idle connections after 30 seconds
        connectionTimeoutMillis: 2e3,
        // Fail fast if can't connect
        ...pgPoolOptions
      });
      const telemetry = this.__getTelemetry();
      this.pool = telemetry?.traceClass(basePool, {
        spanNamePrefix: "pg-vector",
        attributes: {
          "vector.type": "postgres"
        }
      }) ?? basePool;
      void (async () => {
        const existingIndexes = await this.listIndexes();
        void existingIndexes.map(async (indexName) => {
          const info = await this.getIndexInfo({ indexName });
          const key = await this.getIndexCacheKey({
            indexName,
            metric: info.metric,
            dimension: info.dimension,
            type: info.type
          });
          this.createdIndexes.set(indexName, key);
        });
      })();
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_INITIALIZATION_FAILED",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            schemaName: schemaName ?? ""
          }
        },
        error
      );
    }
  }
  getMutexByName(indexName) {
    if (!this.mutexesByName.has(indexName)) this.mutexesByName.set(indexName, new Mutex());
    return this.mutexesByName.get(indexName);
  }
  getTableName(indexName) {
    const parsedIndexName = parseSqlIdentifier(indexName, "index name");
    const quotedIndexName = `"${parsedIndexName}"`;
    const quotedSchemaName = this.getSchemaName();
    const quotedVectorName = `"${parsedIndexName}_vector_idx"`;
    return {
      tableName: quotedSchemaName ? `${quotedSchemaName}.${quotedIndexName}` : quotedIndexName,
      vectorIndexName: quotedVectorName
    };
  }
  getSchemaName() {
    return this.schema ? `"${parseSqlIdentifier(this.schema, "schema name")}"` : void 0;
  }
  transformFilter(filter) {
    const translator = new PGFilterTranslator();
    return translator.translate(filter);
  }
  async getIndexInfo({ indexName }) {
    if (!this.describeIndexCache.has(indexName)) {
      this.describeIndexCache.set(indexName, await this.describeIndex({ indexName }));
    }
    return this.describeIndexCache.get(indexName);
  }
  async query({
    indexName,
    queryVector,
    topK = 10,
    filter,
    includeVector = false,
    minScore = -1,
    ef,
    probes
  }) {
    try {
      if (!Number.isInteger(topK) || topK <= 0) {
        throw new Error("topK must be a positive integer");
      }
      if (!Array.isArray(queryVector) || !queryVector.every((x) => typeof x === "number" && Number.isFinite(x))) {
        throw new Error("queryVector must be an array of finite numbers");
      }
    } catch (error) {
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_QUERY_INVALID_INPUT",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.USER,
          details: {
            indexName
          }
        },
        error
      );
      this.logger?.trackException(mastraError);
      throw mastraError;
    }
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const vectorStr = `[${queryVector.join(",")}]`;
      const translatedFilter = this.transformFilter(filter);
      const { sql: filterQuery, values: filterValues } = buildFilterQuery(translatedFilter, minScore, topK);
      const indexInfo = await this.getIndexInfo({ indexName });
      if (indexInfo.type === "hnsw") {
        const calculatedEf = ef ?? Math.max(topK, (indexInfo?.config?.m ?? 16) * topK);
        const searchEf = Math.min(1e3, Math.max(1, calculatedEf));
        await client.query(`SET LOCAL hnsw.ef_search = ${searchEf}`);
      }
      if (indexInfo.type === "ivfflat" && probes) {
        await client.query(`SET LOCAL ivfflat.probes = ${probes}`);
      }
      const { tableName } = this.getTableName(indexName);
      const query = `
        WITH vector_scores AS (
          SELECT
            vector_id as id,
            1 - (embedding <=> '${vectorStr}'::vector) as score,
            metadata
            ${includeVector ? ", embedding" : ""}
          FROM ${tableName}
          ${filterQuery}
        )
        SELECT *
        FROM vector_scores
        WHERE score > $1
        ORDER BY score DESC
        LIMIT $2`;
      const result = await client.query(query, filterValues);
      await client.query("COMMIT");
      return result.rows.map(({ id, score, metadata, embedding }) => ({
        id,
        score,
        metadata,
        ...includeVector && embedding && { vector: JSON.parse(embedding) }
      }));
    } catch (error) {
      await client.query("ROLLBACK");
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_QUERY_FAILED",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            indexName
          }
        },
        error
      );
      this.logger?.trackException(mastraError);
      throw mastraError;
    } finally {
      client.release();
    }
  }
  async upsert({ indexName, vectors, metadata, ids }) {
    const { tableName } = this.getTableName(indexName);
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const vectorIds = ids || vectors.map(() => crypto.randomUUID());
      for (let i = 0; i < vectors.length; i++) {
        const query = `
          INSERT INTO ${tableName} (vector_id, embedding, metadata)
          VALUES ($1, $2::vector, $3::jsonb)
          ON CONFLICT (vector_id)
          DO UPDATE SET
            embedding = $2::vector,
            metadata = $3::jsonb
          RETURNING embedding::text
        `;
        await client.query(query, [vectorIds[i], `[${vectors[i]?.join(",")}]`, JSON.stringify(metadata?.[i] || {})]);
      }
      await client.query("COMMIT");
      return vectorIds;
    } catch (error) {
      await client.query("ROLLBACK");
      if (error instanceof Error && error.message?.includes("expected") && error.message?.includes("dimensions")) {
        const match = error.message.match(/expected (\d+) dimensions, not (\d+)/);
        if (match) {
          const [, expected, actual] = match;
          const mastraError2 = new MastraError(
            {
              id: "MASTRA_STORAGE_PG_VECTOR_UPSERT_INVALID_INPUT",
              domain: ErrorDomain.MASTRA_VECTOR,
              category: ErrorCategory.USER,
              text: `Vector dimension mismatch: Index "${indexName}" expects ${expected} dimensions but got ${actual} dimensions. Either use a matching embedding model or delete and recreate the index with the new dimension.`,
              details: {
                indexName,
                expected: expected ?? "",
                actual: actual ?? ""
              }
            },
            error
          );
          this.logger?.trackException(mastraError2);
          throw mastraError2;
        }
      }
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_UPSERT_FAILED",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            indexName
          }
        },
        error
      );
      this.logger?.trackException(mastraError);
      throw mastraError;
    } finally {
      client.release();
    }
  }
  hasher = e();
  async getIndexCacheKey({
    indexName,
    dimension,
    metric,
    type
  }) {
    const input = indexName + dimension + metric + (type || "ivfflat");
    return (await this.hasher).h32(input);
  }
  cachedIndexExists(indexName, newKey) {
    const existingIndexCacheKey = this.createdIndexes.get(indexName);
    return existingIndexCacheKey && existingIndexCacheKey === newKey;
  }
  async setupSchema(client) {
    if (!this.schema || this.schemaSetupComplete) {
      return;
    }
    if (!this.setupSchemaPromise) {
      this.setupSchemaPromise = (async () => {
        try {
          const schemaCheck = await client.query(
            `
            SELECT EXISTS (
              SELECT 1 FROM information_schema.schemata 
              WHERE schema_name = $1
            )
          `,
            [this.schema]
          );
          const schemaExists = schemaCheck.rows[0].exists;
          if (!schemaExists) {
            try {
              await client.query(`CREATE SCHEMA IF NOT EXISTS ${this.getSchemaName()}`);
              this.logger.info(`Schema "${this.schema}" created successfully`);
            } catch (error) {
              this.logger.error(`Failed to create schema "${this.schema}"`, { error });
              throw new Error(
                `Unable to create schema "${this.schema}". This requires CREATE privilege on the database. Either create the schema manually or grant CREATE privilege to the user.`
              );
            }
          }
          this.schemaSetupComplete = true;
          this.logger.debug(`Schema "${this.schema}" is ready for use`);
        } catch (error) {
          this.schemaSetupComplete = void 0;
          this.setupSchemaPromise = null;
          throw error;
        } finally {
          this.setupSchemaPromise = null;
        }
      })();
    }
    await this.setupSchemaPromise;
  }
  async createIndex({
    indexName,
    dimension,
    metric = "cosine",
    indexConfig = {},
    buildIndex = true
  }) {
    const { tableName } = this.getTableName(indexName);
    try {
      if (!indexName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        throw new Error("Invalid index name format");
      }
      if (!Number.isInteger(dimension) || dimension <= 0) {
        throw new Error("Dimension must be a positive integer");
      }
    } catch (error) {
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_CREATE_INDEX_INVALID_INPUT",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.USER,
          details: {
            indexName
          }
        },
        error
      );
      this.logger?.trackException(mastraError);
      throw mastraError;
    }
    const indexCacheKey = await this.getIndexCacheKey({ indexName, dimension, type: indexConfig.type, metric });
    if (this.cachedIndexExists(indexName, indexCacheKey)) {
      return;
    }
    const mutex = this.getMutexByName(`create-${indexName}`);
    await mutex.runExclusive(async () => {
      if (this.cachedIndexExists(indexName, indexCacheKey)) {
        return;
      }
      const client = await this.pool.connect();
      try {
        await this.setupSchema(client);
        await this.installVectorExtension(client);
        await client.query(`
          CREATE TABLE IF NOT EXISTS ${tableName} (
            id SERIAL PRIMARY KEY,
            vector_id TEXT UNIQUE NOT NULL,
            embedding vector(${dimension}),
            metadata JSONB DEFAULT '{}'::jsonb
          );
        `);
        this.createdIndexes.set(indexName, indexCacheKey);
        if (buildIndex) {
          await this.setupIndex({ indexName, metric, indexConfig }, client);
        }
      } catch (error) {
        this.createdIndexes.delete(indexName);
        throw error;
      } finally {
        client.release();
      }
    }).catch((error) => {
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_CREATE_INDEX_FAILED",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            indexName
          }
        },
        error
      );
      this.logger?.trackException(mastraError);
      throw mastraError;
    });
  }
  async buildIndex({ indexName, metric = "cosine", indexConfig }) {
    const client = await this.pool.connect();
    try {
      await this.setupIndex({ indexName, metric, indexConfig }, client);
    } catch (error) {
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_BUILD_INDEX_FAILED",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            indexName
          }
        },
        error
      );
      this.logger?.trackException(mastraError);
      throw mastraError;
    } finally {
      client.release();
    }
  }
  async setupIndex({ indexName, metric, indexConfig }, client) {
    const mutex = this.getMutexByName(`build-${indexName}`);
    await mutex.runExclusive(async () => {
      const { tableName, vectorIndexName } = this.getTableName(indexName);
      if (this.createdIndexes.has(indexName)) {
        await client.query(`DROP INDEX IF EXISTS ${vectorIndexName}`);
      }
      if (indexConfig.type === "flat") {
        this.describeIndexCache.delete(indexName);
        return;
      }
      const metricOp = metric === "cosine" ? "vector_cosine_ops" : metric === "euclidean" ? "vector_l2_ops" : "vector_ip_ops";
      let indexSQL;
      if (indexConfig.type === "hnsw") {
        const m = indexConfig.hnsw?.m ?? 8;
        const efConstruction = indexConfig.hnsw?.efConstruction ?? 32;
        indexSQL = `
          CREATE INDEX IF NOT EXISTS ${vectorIndexName} 
          ON ${tableName} 
          USING hnsw (embedding ${metricOp})
          WITH (
            m = ${m},
            ef_construction = ${efConstruction}
          )
        `;
      } else {
        let lists;
        if (indexConfig.ivf?.lists) {
          lists = indexConfig.ivf.lists;
        } else {
          const size = (await client.query(`SELECT COUNT(*) FROM ${tableName}`)).rows[0].count;
          lists = Math.max(100, Math.min(4e3, Math.floor(Math.sqrt(size) * 2)));
        }
        indexSQL = `
          CREATE INDEX IF NOT EXISTS ${vectorIndexName}
          ON ${tableName}
          USING ivfflat (embedding ${metricOp})
          WITH (lists = ${lists});
        `;
      }
      await client.query(indexSQL);
    });
  }
  async installVectorExtension(client) {
    if (this.vectorExtensionInstalled) {
      return;
    }
    if (!this.installVectorExtensionPromise) {
      this.installVectorExtensionPromise = (async () => {
        try {
          const extensionCheck = await client.query(`
            SELECT EXISTS (
              SELECT 1 FROM pg_extension WHERE extname = 'vector'
            );
          `);
          this.vectorExtensionInstalled = extensionCheck.rows[0].exists;
          if (!this.vectorExtensionInstalled) {
            try {
              await client.query("CREATE EXTENSION IF NOT EXISTS vector");
              this.vectorExtensionInstalled = true;
              this.logger.info("Vector extension installed successfully");
            } catch {
              this.logger.warn(
                "Could not install vector extension. This requires superuser privileges. If the extension is already installed globally, you can ignore this warning."
              );
            }
          } else {
            this.logger.debug("Vector extension already installed, skipping installation");
          }
        } catch (error) {
          this.logger.error("Error checking vector extension status", { error });
          this.vectorExtensionInstalled = void 0;
          this.installVectorExtensionPromise = null;
          throw error;
        } finally {
          this.installVectorExtensionPromise = null;
        }
      })();
    }
    await this.installVectorExtensionPromise;
  }
  async listIndexes() {
    const client = await this.pool.connect();
    try {
      const vectorTablesQuery = `
            SELECT DISTINCT table_name
            FROM information_schema.columns
            WHERE table_schema = $1
            AND udt_name = 'vector';
        `;
      const vectorTables = await client.query(vectorTablesQuery, [this.schema || "public"]);
      return vectorTables.rows.map((row) => row.table_name);
    } catch (e) {
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_LIST_INDEXES_FAILED",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.THIRD_PARTY
        },
        e
      );
      this.logger?.trackException(mastraError);
      throw mastraError;
    } finally {
      client.release();
    }
  }
  /**
   * Retrieves statistics about a vector index.
   *
   * @param {string} indexName - The name of the index to describe
   * @returns A promise that resolves to the index statistics including dimension, count and metric
   */
  async describeIndex({ indexName }) {
    const client = await this.pool.connect();
    try {
      const { tableName } = this.getTableName(indexName);
      const tableExistsQuery = `
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name = $2
          AND udt_name = 'vector'
        LIMIT 1;
      `;
      const tableExists = await client.query(tableExistsQuery, [this.schema || "public", indexName]);
      if (tableExists.rows.length === 0) {
        throw new Error(`Vector table ${tableName} does not exist`);
      }
      const dimensionQuery = `
                SELECT atttypmod as dimension
                FROM pg_attribute
                WHERE attrelid = $1::regclass
                AND attname = 'embedding';
            `;
      const countQuery = `
                SELECT COUNT(*) as count
                FROM ${tableName};
            `;
      const indexQuery = `
            SELECT
                am.amname as index_method,
                pg_get_indexdef(i.indexrelid) as index_def,
                opclass.opcname as operator_class
            FROM pg_index i
            JOIN pg_class c ON i.indexrelid = c.oid
            JOIN pg_am am ON c.relam = am.oid
            JOIN pg_opclass opclass ON i.indclass[0] = opclass.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE c.relname = $1
            AND n.nspname = $2;
            `;
      const [dimResult, countResult, indexResult] = await Promise.all([
        client.query(dimensionQuery, [tableName]),
        client.query(countQuery),
        client.query(indexQuery, [`${indexName}_vector_idx`, this.schema || "public"])
      ]);
      const { index_method, index_def, operator_class } = indexResult.rows[0] || {
        index_method: "flat",
        index_def: "",
        operator_class: "cosine"
      };
      const metric = operator_class.includes("l2") ? "euclidean" : operator_class.includes("ip") ? "dotproduct" : "cosine";
      const config = {};
      if (index_method === "hnsw") {
        const m = index_def.match(/m\s*=\s*'?(\d+)'?/)?.[1];
        const efConstruction = index_def.match(/ef_construction\s*=\s*'?(\d+)'?/)?.[1];
        if (m) config.m = parseInt(m);
        if (efConstruction) config.efConstruction = parseInt(efConstruction);
      } else if (index_method === "ivfflat") {
        const lists = index_def.match(/lists\s*=\s*'?(\d+)'?/)?.[1];
        if (lists) config.lists = parseInt(lists);
      }
      return {
        dimension: dimResult.rows[0].dimension,
        count: parseInt(countResult.rows[0].count),
        metric,
        type: index_method,
        config
      };
    } catch (e) {
      await client.query("ROLLBACK");
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_DESCRIBE_INDEX_FAILED",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            indexName
          }
        },
        e
      );
      this.logger?.trackException(mastraError);
      throw mastraError;
    } finally {
      client.release();
    }
  }
  async deleteIndex({ indexName }) {
    const client = await this.pool.connect();
    try {
      const { tableName } = this.getTableName(indexName);
      await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
      this.createdIndexes.delete(indexName);
    } catch (error) {
      await client.query("ROLLBACK");
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_DELETE_INDEX_FAILED",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            indexName
          }
        },
        error
      );
      this.logger?.trackException(mastraError);
      throw mastraError;
    } finally {
      client.release();
    }
  }
  async truncateIndex({ indexName }) {
    const client = await this.pool.connect();
    try {
      const { tableName } = this.getTableName(indexName);
      await client.query(`TRUNCATE ${tableName}`);
    } catch (e) {
      await client.query("ROLLBACK");
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_TRUNCATE_INDEX_FAILED",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            indexName
          }
        },
        e
      );
      this.logger?.trackException(mastraError);
      throw mastraError;
    } finally {
      client.release();
    }
  }
  async disconnect() {
    await this.pool.end();
  }
  /**
   * Updates a vector by its ID with the provided vector and/or metadata.
   * @param indexName - The name of the index containing the vector.
   * @param id - The ID of the vector to update.
   * @param update - An object containing the vector and/or metadata to update.
   * @param update.vector - An optional array of numbers representing the new vector.
   * @param update.metadata - An optional record containing the new metadata.
   * @returns A promise that resolves when the update is complete.
   * @throws Will throw an error if no updates are provided or if the update operation fails.
   */
  async updateVector({ indexName, id, update }) {
    let client;
    try {
      if (!update.vector && !update.metadata) {
        throw new Error("No updates provided");
      }
      client = await this.pool.connect();
      let updateParts = [];
      let values = [id];
      let valueIndex = 2;
      if (update.vector) {
        updateParts.push(`embedding = $${valueIndex}::vector`);
        values.push(`[${update.vector.join(",")}]`);
        valueIndex++;
      }
      if (update.metadata) {
        updateParts.push(`metadata = $${valueIndex}::jsonb`);
        values.push(JSON.stringify(update.metadata));
      }
      if (updateParts.length === 0) {
        return;
      }
      const { tableName } = this.getTableName(indexName);
      const query = `
        UPDATE ${tableName}
        SET ${updateParts.join(", ")}
        WHERE vector_id = $1
      `;
      await client.query(query, values);
    } catch (error) {
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_UPDATE_VECTOR_FAILED",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            indexName,
            id
          }
        },
        error
      );
      this.logger?.trackException(mastraError);
      throw mastraError;
    } finally {
      client?.release();
    }
  }
  /**
   * Deletes a vector by its ID.
   * @param indexName - The name of the index containing the vector.
   * @param id - The ID of the vector to delete.
   * @returns A promise that resolves when the deletion is complete.
   * @throws Will throw an error if the deletion operation fails.
   */
  async deleteVector({ indexName, id }) {
    let client;
    try {
      client = await this.pool.connect();
      const { tableName } = this.getTableName(indexName);
      const query = `
        DELETE FROM ${tableName}
        WHERE vector_id = $1
      `;
      await client.query(query, [id]);
    } catch (error) {
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_VECTOR_DELETE_VECTOR_FAILED",
          domain: ErrorDomain.MASTRA_VECTOR,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            indexName,
            id
          }
        },
        error
      );
      this.logger?.trackException(mastraError);
      throw mastraError;
    } finally {
      client?.release();
    }
  }
};
function getSchemaName(schema) {
  return schema ? `"${parseSqlIdentifier(schema, "schema name")}"` : void 0;
}
function getTableName({ indexName, schemaName }) {
  const parsedIndexName = parseSqlIdentifier(indexName, "index name");
  const quotedIndexName = `"${parsedIndexName}"`;
  const quotedSchemaName = schemaName;
  return quotedSchemaName ? `${quotedSchemaName}.${quotedIndexName}` : quotedIndexName;
}

// src/storage/domains/legacy-evals/index.ts
function transformEvalRow(row) {
  let testInfoValue = null;
  if (row.test_info) {
    try {
      testInfoValue = typeof row.test_info === "string" ? JSON.parse(row.test_info) : row.test_info;
    } catch (e) {
      console.warn("Failed to parse test_info:", e);
    }
  }
  return {
    agentName: row.agent_name,
    input: row.input,
    output: row.output,
    result: row.result,
    metricName: row.metric_name,
    instructions: row.instructions,
    testInfo: testInfoValue,
    globalRunId: row.global_run_id,
    runId: row.run_id,
    createdAt: row.created_atZ || row.created_at
  };
}
var LegacyEvalsPG = class extends LegacyEvalsStorage {
  client;
  schema;
  constructor({ client, schema }) {
    super();
    this.client = client;
    this.schema = schema;
  }
  /** @deprecated use getEvals instead */
  async getEvalsByAgentName(agentName, type) {
    try {
      const baseQuery = `SELECT * FROM ${getTableName({ indexName: TABLE_EVALS, schemaName: getSchemaName(this.schema) })} WHERE agent_name = $1`;
      const typeCondition = type === "test" ? " AND test_info IS NOT NULL AND test_info->>'testPath' IS NOT NULL" : type === "live" ? " AND (test_info IS NULL OR test_info->>'testPath' IS NULL)" : "";
      const query = `${baseQuery}${typeCondition} ORDER BY created_at DESC`;
      const rows = await this.client.manyOrNone(query, [agentName]);
      return rows?.map((row) => transformEvalRow(row)) ?? [];
    } catch (error) {
      if (error instanceof Error && error.message.includes("relation") && error.message.includes("does not exist")) {
        return [];
      }
      console.error("Failed to get evals for the specified agent: " + error?.message);
      throw error;
    }
  }
  async getEvals(options = {}) {
    const tableName = getTableName({ indexName: TABLE_EVALS, schemaName: getSchemaName(this.schema) });
    const { agentName, type, page = 0, perPage = 100, dateRange } = options;
    const fromDate = dateRange?.start;
    const toDate = dateRange?.end;
    const conditions = [];
    const queryParams = [];
    let paramIndex = 1;
    if (agentName) {
      conditions.push(`agent_name = $${paramIndex++}`);
      queryParams.push(agentName);
    }
    if (type === "test") {
      conditions.push(`(test_info IS NOT NULL AND test_info->>'testPath' IS NOT NULL)`);
    } else if (type === "live") {
      conditions.push(`(test_info IS NULL OR test_info->>'testPath' IS NULL)`);
    }
    if (fromDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      queryParams.push(fromDate);
    }
    if (toDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      queryParams.push(toDate);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countQuery = `SELECT COUNT(*) FROM ${tableName} ${whereClause}`;
    try {
      const countResult = await this.client.one(countQuery, queryParams);
      const total = parseInt(countResult.count, 10);
      const currentOffset = page * perPage;
      if (total === 0) {
        return {
          evals: [],
          total: 0,
          page,
          perPage,
          hasMore: false
        };
      }
      const dataQuery = `SELECT * FROM ${tableName} ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      const rows = await this.client.manyOrNone(dataQuery, [...queryParams, perPage, currentOffset]);
      return {
        evals: rows?.map((row) => transformEvalRow(row)) ?? [],
        total,
        page,
        perPage,
        hasMore: currentOffset + (rows?.length ?? 0) < total
      };
    } catch (error) {
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_EVALS_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            agentName: agentName || "all",
            type: type || "all",
            page,
            perPage
          }
        },
        error
      );
      this.logger?.error?.(mastraError.toString());
      this.logger?.trackException(mastraError);
      throw mastraError;
    }
  }
};
var MemoryPG = class extends MemoryStorage {
  client;
  schema;
  operations;
  constructor({
    client,
    schema,
    operations
  }) {
    super();
    this.client = client;
    this.schema = schema;
    this.operations = operations;
  }
  async getThreadById({ threadId }) {
    try {
      const tableName = getTableName({ indexName: TABLE_THREADS, schemaName: getSchemaName(this.schema) });
      const thread = await this.client.oneOrNone(
        `SELECT * FROM ${tableName} WHERE id = $1`,
        [threadId]
      );
      if (!thread) {
        return null;
      }
      return {
        id: thread.id,
        resourceId: thread.resourceId,
        title: thread.title,
        metadata: typeof thread.metadata === "string" ? JSON.parse(thread.metadata) : thread.metadata,
        createdAt: thread.createdAtZ || thread.createdAt,
        updatedAt: thread.updatedAtZ || thread.updatedAt
      };
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_THREAD_BY_ID_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            threadId
          }
        },
        error
      );
    }
  }
  /**
   * @deprecated use getThreadsByResourceIdPaginated instead
   */
  async getThreadsByResourceId(args) {
    const resourceId = args.resourceId;
    const orderBy = this.castThreadOrderBy(args.orderBy);
    const sortDirection = this.castThreadSortDirection(args.sortDirection);
    try {
      const tableName = getTableName({ indexName: TABLE_THREADS, schemaName: getSchemaName(this.schema) });
      const baseQuery = `FROM ${tableName} WHERE "resourceId" = $1`;
      const queryParams = [resourceId];
      const dataQuery = `SELECT id, "resourceId", title, metadata, "createdAt", "updatedAt" ${baseQuery} ORDER BY "${orderBy}" ${sortDirection}`;
      const rows = await this.client.manyOrNone(dataQuery, queryParams);
      return (rows || []).map((thread) => ({
        ...thread,
        metadata: typeof thread.metadata === "string" ? JSON.parse(thread.metadata) : thread.metadata,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt
      }));
    } catch (error) {
      this.logger.error(`Error getting threads for resource ${resourceId}:`, error);
      return [];
    }
  }
  async getThreadsByResourceIdPaginated(args) {
    const { resourceId, page = 0, perPage: perPageInput } = args;
    const orderBy = this.castThreadOrderBy(args.orderBy);
    const sortDirection = this.castThreadSortDirection(args.sortDirection);
    try {
      const tableName = getTableName({ indexName: TABLE_THREADS, schemaName: getSchemaName(this.schema) });
      const baseQuery = `FROM ${tableName} WHERE "resourceId" = $1`;
      const queryParams = [resourceId];
      const perPage = perPageInput !== void 0 ? perPageInput : 100;
      const currentOffset = page * perPage;
      const countQuery = `SELECT COUNT(*) ${baseQuery}`;
      const countResult = await this.client.one(countQuery, queryParams);
      const total = parseInt(countResult.count, 10);
      if (total === 0) {
        return {
          threads: [],
          total: 0,
          page,
          perPage,
          hasMore: false
        };
      }
      const dataQuery = `SELECT id, "resourceId", title, metadata, "createdAt", "updatedAt" ${baseQuery} ORDER BY "${orderBy}" ${sortDirection} LIMIT $2 OFFSET $3`;
      const rows = await this.client.manyOrNone(dataQuery, [...queryParams, perPage, currentOffset]);
      const threads = (rows || []).map((thread) => ({
        ...thread,
        metadata: typeof thread.metadata === "string" ? JSON.parse(thread.metadata) : thread.metadata,
        createdAt: thread.createdAt,
        // Assuming already Date objects or ISO strings
        updatedAt: thread.updatedAt
      }));
      return {
        threads,
        total,
        page,
        perPage,
        hasMore: currentOffset + threads.length < total
      };
    } catch (error) {
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_THREADS_BY_RESOURCE_ID_PAGINATED_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            resourceId,
            page
          }
        },
        error
      );
      this.logger?.error?.(mastraError.toString());
      this.logger?.trackException(mastraError);
      return { threads: [], total: 0, page, perPage: perPageInput || 100, hasMore: false };
    }
  }
  async saveThread({ thread }) {
    try {
      const tableName = getTableName({ indexName: TABLE_THREADS, schemaName: getSchemaName(this.schema) });
      await this.client.none(
        `INSERT INTO ${tableName} (
          id,
          "resourceId",
          title,
          metadata,
          "createdAt",
          "createdAtZ",
          "updatedAt",
          "updatedAtZ"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          "resourceId" = EXCLUDED."resourceId",
          title = EXCLUDED.title,
          metadata = EXCLUDED.metadata,
          "createdAt" = EXCLUDED."createdAt",
          "createdAtZ" = EXCLUDED."createdAtZ",
          "updatedAt" = EXCLUDED."updatedAt",
          "updatedAtZ" = EXCLUDED."updatedAtZ"`,
        [
          thread.id,
          thread.resourceId,
          thread.title,
          thread.metadata ? JSON.stringify(thread.metadata) : null,
          thread.createdAt,
          thread.createdAt,
          thread.updatedAt,
          thread.updatedAt
        ]
      );
      return thread;
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_SAVE_THREAD_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            threadId: thread.id
          }
        },
        error
      );
    }
  }
  async updateThread({
    id,
    title,
    metadata
  }) {
    const threadTableName = getTableName({ indexName: TABLE_THREADS, schemaName: getSchemaName(this.schema) });
    const existingThread = await this.getThreadById({ threadId: id });
    if (!existingThread) {
      throw new MastraError({
        id: "MASTRA_STORAGE_PG_STORE_UPDATE_THREAD_FAILED",
        domain: ErrorDomain.STORAGE,
        category: ErrorCategory.USER,
        text: `Thread ${id} not found`,
        details: {
          threadId: id,
          title
        }
      });
    }
    const mergedMetadata = {
      ...existingThread.metadata,
      ...metadata
    };
    try {
      const thread = await this.client.one(
        `UPDATE ${threadTableName}
                    SET 
                        title = $1,
                        metadata = $2,
                        "updatedAt" = $3,
                        "updatedAtZ" = $3
                    WHERE id = $4
                    RETURNING *
                `,
        [title, mergedMetadata, (/* @__PURE__ */ new Date()).toISOString(), id]
      );
      return {
        id: thread.id,
        resourceId: thread.resourceId,
        title: thread.title,
        metadata: typeof thread.metadata === "string" ? JSON.parse(thread.metadata) : thread.metadata,
        createdAt: thread.createdAtZ || thread.createdAt,
        updatedAt: thread.updatedAtZ || thread.updatedAt
      };
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_UPDATE_THREAD_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            threadId: id,
            title
          }
        },
        error
      );
    }
  }
  async deleteThread({ threadId }) {
    try {
      const tableName = getTableName({ indexName: TABLE_MESSAGES, schemaName: getSchemaName(this.schema) });
      const threadTableName = getTableName({ indexName: TABLE_THREADS, schemaName: getSchemaName(this.schema) });
      await this.client.tx(async (t) => {
        await t.none(`DELETE FROM ${tableName} WHERE thread_id = $1`, [threadId]);
        await t.none(`DELETE FROM ${threadTableName} WHERE id = $1`, [threadId]);
      });
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_DELETE_THREAD_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            threadId
          }
        },
        error
      );
    }
  }
  async _getIncludedMessages({
    threadId,
    selectBy,
    orderByStatement
  }) {
    const include = selectBy?.include;
    if (!include) return null;
    const unionQueries = [];
    const params = [];
    let paramIdx = 1;
    const tableName = getTableName({ indexName: TABLE_MESSAGES, schemaName: getSchemaName(this.schema) });
    for (const inc of include) {
      const { id, withPreviousMessages = 0, withNextMessages = 0 } = inc;
      const searchId = inc.threadId || threadId;
      unionQueries.push(
        `
            SELECT * FROM (
              WITH ordered_messages AS (
                SELECT 
                  *,
                  ROW_NUMBER() OVER (${orderByStatement}) as row_num
                FROM ${tableName}
                WHERE thread_id = $${paramIdx}
              )
              SELECT
                m.id, 
                m.content, 
                m.role, 
                m.type,
                m."createdAt", 
                m.thread_id AS "threadId",
                m."resourceId"
              FROM ordered_messages m
              WHERE m.id = $${paramIdx + 1}
              OR EXISTS (
                SELECT 1 FROM ordered_messages target
                WHERE target.id = $${paramIdx + 1}
                AND (
                  -- Get previous messages based on the max withPreviousMessages
                  (m.row_num <= target.row_num + $${paramIdx + 2} AND m.row_num > target.row_num)
                  OR
                  -- Get next messages based on the max withNextMessages
                  (m.row_num >= target.row_num - $${paramIdx + 3} AND m.row_num < target.row_num)
                )
              )
            ) AS query_${paramIdx}
            `
        // Keep ASC for final sorting after fetching context
      );
      params.push(searchId, id, withPreviousMessages, withNextMessages);
      paramIdx += 4;
    }
    const finalQuery = unionQueries.join(" UNION ALL ") + ' ORDER BY "createdAt" ASC';
    const includedRows = await this.client.manyOrNone(finalQuery, params);
    const seen = /* @__PURE__ */ new Set();
    const dedupedRows = includedRows.filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });
    return dedupedRows;
  }
  parseRow(row) {
    let content = row.content;
    try {
      content = JSON.parse(row.content);
    } catch {
    }
    return {
      id: row.id,
      content,
      role: row.role,
      createdAt: new Date(row.createdAt),
      threadId: row.threadId,
      resourceId: row.resourceId,
      ...row.type && row.type !== "v2" ? { type: row.type } : {}
    };
  }
  async getMessages(args) {
    const { threadId, format, selectBy } = args;
    const selectStatement = `SELECT id, content, role, type, "createdAt", thread_id AS "threadId", "resourceId"`;
    const orderByStatement = `ORDER BY "createdAt" DESC`;
    const limit = resolveMessageLimit({ last: selectBy?.last, defaultLimit: 40 });
    try {
      let rows = [];
      const include = selectBy?.include || [];
      if (include?.length) {
        const includeMessages = await this._getIncludedMessages({ threadId, selectBy, orderByStatement });
        if (includeMessages) {
          rows.push(...includeMessages);
        }
      }
      const excludeIds = rows.map((m) => m.id);
      const tableName = getTableName({ indexName: TABLE_MESSAGES, schemaName: getSchemaName(this.schema) });
      const excludeIdsParam = excludeIds.map((_, idx) => `$${idx + 2}`).join(", ");
      let query = `${selectStatement} FROM ${tableName} WHERE thread_id = $1 
        ${excludeIds.length ? `AND id NOT IN (${excludeIdsParam})` : ""}
        ${orderByStatement}
        LIMIT $${excludeIds.length + 2}
        `;
      const queryParams = [threadId, ...excludeIds, limit];
      const remainingRows = await this.client.manyOrNone(query, queryParams);
      rows.push(...remainingRows);
      const fetchedMessages = (rows || []).map((message) => {
        if (typeof message.content === "string") {
          try {
            message.content = JSON.parse(message.content);
          } catch {
          }
        }
        if (message.type === "v2") delete message.type;
        return message;
      });
      const sortedMessages = fetchedMessages.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return format === "v2" ? sortedMessages.map(
        (m) => ({ ...m, content: m.content || { format: 2, parts: [{ type: "text", text: "" }] } })
      ) : sortedMessages;
    } catch (error) {
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_MESSAGES_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            threadId
          }
        },
        error
      );
      this.logger?.error?.(mastraError.toString());
      this.logger?.trackException(mastraError);
      return [];
    }
  }
  async getMessagesById({
    messageIds,
    format
  }) {
    if (messageIds.length === 0) return [];
    const selectStatement = `SELECT id, content, role, type, "createdAt", thread_id AS "threadId", "resourceId"`;
    try {
      const tableName = getTableName({ indexName: TABLE_MESSAGES, schemaName: getSchemaName(this.schema) });
      const query = `
        ${selectStatement} FROM ${tableName} 
        WHERE id IN (${messageIds.map((_, i) => `$${i + 1}`).join(", ")})
        ORDER BY "createdAt" DESC
      `;
      const resultRows = await this.client.manyOrNone(query, messageIds);
      const list = new MessageList().add(resultRows.map(this.parseRow), "memory");
      if (format === `v1`) return list.get.all.v1();
      return list.get.all.v2();
    } catch (error) {
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_MESSAGES_BY_ID_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            messageIds: JSON.stringify(messageIds)
          }
        },
        error
      );
      this.logger?.error?.(mastraError.toString());
      this.logger?.trackException(mastraError);
      return [];
    }
  }
  async getMessagesPaginated(args) {
    const { threadId, format, selectBy } = args;
    const { page = 0, perPage: perPageInput, dateRange } = selectBy?.pagination || {};
    const fromDate = dateRange?.start;
    const toDate = dateRange?.end;
    const selectStatement = `SELECT id, content, role, type, "createdAt", thread_id AS "threadId", "resourceId"`;
    const orderByStatement = `ORDER BY "createdAt" DESC`;
    const messages = [];
    if (selectBy?.include?.length) {
      const includeMessages = await this._getIncludedMessages({ threadId, selectBy, orderByStatement });
      if (includeMessages) {
        messages.push(...includeMessages);
      }
    }
    try {
      const perPage = perPageInput !== void 0 ? perPageInput : resolveMessageLimit({ last: selectBy?.last, defaultLimit: 40 });
      const currentOffset = page * perPage;
      const conditions = [`thread_id = $1`];
      const queryParams = [threadId];
      let paramIndex = 2;
      if (fromDate) {
        conditions.push(`"createdAt" >= $${paramIndex++}`);
        queryParams.push(fromDate);
      }
      if (toDate) {
        conditions.push(`"createdAt" <= $${paramIndex++}`);
        queryParams.push(toDate);
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const tableName = getTableName({ indexName: TABLE_MESSAGES, schemaName: getSchemaName(this.schema) });
      const countQuery = `SELECT COUNT(*) FROM ${tableName} ${whereClause}`;
      const countResult = await this.client.one(countQuery, queryParams);
      const total = parseInt(countResult.count, 10);
      if (total === 0 && messages.length === 0) {
        return {
          messages: [],
          total: 0,
          page,
          perPage,
          hasMore: false
        };
      }
      const excludeIds = messages.map((m) => m.id);
      const excludeIdsParam = excludeIds.map((_, idx) => `$${idx + paramIndex}`).join(", ");
      paramIndex += excludeIds.length;
      const dataQuery = `${selectStatement} FROM ${tableName} ${whereClause} ${excludeIds.length ? `AND id NOT IN (${excludeIdsParam})` : ""}${orderByStatement} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      const rows = await this.client.manyOrNone(dataQuery, [...queryParams, ...excludeIds, perPage, currentOffset]);
      messages.push(...rows || []);
      const messagesWithParsedContent = messages.map((message) => {
        if (typeof message.content === "string") {
          try {
            return { ...message, content: JSON.parse(message.content) };
          } catch {
            return message;
          }
        }
        return message;
      });
      const list = new MessageList().add(messagesWithParsedContent, "memory");
      const messagesToReturn = format === `v2` ? list.get.all.v2() : list.get.all.v1();
      return {
        messages: messagesToReturn,
        total,
        page,
        perPage,
        hasMore: currentOffset + rows.length < total
      };
    } catch (error) {
      const mastraError = new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_MESSAGES_PAGINATED_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            threadId,
            page
          }
        },
        error
      );
      this.logger?.error?.(mastraError.toString());
      this.logger?.trackException(mastraError);
      return { messages: [], total: 0, page, perPage: perPageInput || 40, hasMore: false };
    }
  }
  async saveMessages({
    messages,
    format
  }) {
    if (messages.length === 0) return messages;
    const threadId = messages[0]?.threadId;
    if (!threadId) {
      throw new MastraError({
        id: "MASTRA_STORAGE_PG_STORE_SAVE_MESSAGES_FAILED",
        domain: ErrorDomain.STORAGE,
        category: ErrorCategory.THIRD_PARTY,
        text: `Thread ID is required`
      });
    }
    const thread = await this.getThreadById({ threadId });
    if (!thread) {
      throw new MastraError({
        id: "MASTRA_STORAGE_PG_STORE_SAVE_MESSAGES_FAILED",
        domain: ErrorDomain.STORAGE,
        category: ErrorCategory.THIRD_PARTY,
        text: `Thread ${threadId} not found`,
        details: {
          threadId
        }
      });
    }
    try {
      const tableName = getTableName({ indexName: TABLE_MESSAGES, schemaName: getSchemaName(this.schema) });
      await this.client.tx(async (t) => {
        const messageInserts = messages.map((message) => {
          if (!message.threadId) {
            throw new Error(
              `Expected to find a threadId for message, but couldn't find one. An unexpected error has occurred.`
            );
          }
          if (!message.resourceId) {
            throw new Error(
              `Expected to find a resourceId for message, but couldn't find one. An unexpected error has occurred.`
            );
          }
          return t.none(
            `INSERT INTO ${tableName} (id, thread_id, content, "createdAt", "createdAtZ", role, type, "resourceId") 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO UPDATE SET
              thread_id = EXCLUDED.thread_id,
              content = EXCLUDED.content,
              role = EXCLUDED.role,
              type = EXCLUDED.type,
              "resourceId" = EXCLUDED."resourceId"`,
            [
              message.id,
              message.threadId,
              typeof message.content === "string" ? message.content : JSON.stringify(message.content),
              message.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
              message.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
              message.role,
              message.type || "v2",
              message.resourceId
            ]
          );
        });
        const threadTableName = getTableName({ indexName: TABLE_THREADS, schemaName: getSchemaName(this.schema) });
        const threadUpdate = t.none(
          `UPDATE ${threadTableName} 
                        SET 
                            "updatedAt" = $1,
                            "updatedAtZ" = $1
                        WHERE id = $2
                    `,
          [(/* @__PURE__ */ new Date()).toISOString(), threadId]
        );
        await Promise.all([...messageInserts, threadUpdate]);
      });
      const messagesWithParsedContent = messages.map((message) => {
        if (typeof message.content === "string") {
          try {
            return { ...message, content: JSON.parse(message.content) };
          } catch {
            return message;
          }
        }
        return message;
      });
      const list = new MessageList().add(messagesWithParsedContent, "memory");
      if (format === `v2`) return list.get.all.v2();
      return list.get.all.v1();
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_SAVE_MESSAGES_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            threadId
          }
        },
        error
      );
    }
  }
  async updateMessages({
    messages
  }) {
    if (messages.length === 0) {
      return [];
    }
    const messageIds = messages.map((m) => m.id);
    const selectQuery = `SELECT id, content, role, type, "createdAt", thread_id AS "threadId", "resourceId" FROM ${getTableName({ indexName: TABLE_MESSAGES, schemaName: getSchemaName(this.schema) })} WHERE id IN ($1:list)`;
    const existingMessagesDb = await this.client.manyOrNone(selectQuery, [messageIds]);
    if (existingMessagesDb.length === 0) {
      return [];
    }
    const existingMessages = existingMessagesDb.map((msg) => {
      if (typeof msg.content === "string") {
        try {
          msg.content = JSON.parse(msg.content);
        } catch {
        }
      }
      return msg;
    });
    const threadIdsToUpdate = /* @__PURE__ */ new Set();
    await this.client.tx(async (t) => {
      const queries = [];
      const columnMapping = {
        threadId: "thread_id"
      };
      for (const existingMessage of existingMessages) {
        const updatePayload = messages.find((m) => m.id === existingMessage.id);
        if (!updatePayload) continue;
        const { id, ...fieldsToUpdate } = updatePayload;
        if (Object.keys(fieldsToUpdate).length === 0) continue;
        threadIdsToUpdate.add(existingMessage.threadId);
        if (updatePayload.threadId && updatePayload.threadId !== existingMessage.threadId) {
          threadIdsToUpdate.add(updatePayload.threadId);
        }
        const setClauses = [];
        const values = [];
        let paramIndex = 1;
        const updatableFields = { ...fieldsToUpdate };
        if (updatableFields.content) {
          const newContent = {
            ...existingMessage.content,
            ...updatableFields.content,
            // Deep merge metadata if it exists on both
            ...existingMessage.content?.metadata && updatableFields.content.metadata ? {
              metadata: {
                ...existingMessage.content.metadata,
                ...updatableFields.content.metadata
              }
            } : {}
          };
          setClauses.push(`content = $${paramIndex++}`);
          values.push(newContent);
          delete updatableFields.content;
        }
        for (const key in updatableFields) {
          if (Object.prototype.hasOwnProperty.call(updatableFields, key)) {
            const dbColumn = columnMapping[key] || key;
            setClauses.push(`"${dbColumn}" = $${paramIndex++}`);
            values.push(updatableFields[key]);
          }
        }
        if (setClauses.length > 0) {
          values.push(id);
          const sql = `UPDATE ${getTableName({ indexName: TABLE_MESSAGES, schemaName: getSchemaName(this.schema) })} SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`;
          queries.push(t.none(sql, values));
        }
      }
      if (threadIdsToUpdate.size > 0) {
        queries.push(
          t.none(
            `UPDATE ${getTableName({ indexName: TABLE_THREADS, schemaName: getSchemaName(this.schema) })} SET "updatedAt" = NOW(), "updatedAtZ" = NOW() WHERE id IN ($1:list)`,
            [Array.from(threadIdsToUpdate)]
          )
        );
      }
      if (queries.length > 0) {
        await t.batch(queries);
      }
    });
    const updatedMessages = await this.client.manyOrNone(selectQuery, [messageIds]);
    return (updatedMessages || []).map((message) => {
      if (typeof message.content === "string") {
        try {
          message.content = JSON.parse(message.content);
        } catch {
        }
      }
      return message;
    });
  }
  async deleteMessages(messageIds) {
    if (!messageIds || messageIds.length === 0) {
      return;
    }
    try {
      const messageTableName = getTableName({ indexName: TABLE_MESSAGES, schemaName: getSchemaName(this.schema) });
      const threadTableName = getTableName({ indexName: TABLE_THREADS, schemaName: getSchemaName(this.schema) });
      await this.client.tx(async (t) => {
        const placeholders = messageIds.map((_, idx) => `$${idx + 1}`).join(",");
        const messages = await t.manyOrNone(
          `SELECT DISTINCT thread_id FROM ${messageTableName} WHERE id IN (${placeholders})`,
          messageIds
        );
        const threadIds = messages?.map((msg) => msg.thread_id).filter(Boolean) || [];
        await t.none(`DELETE FROM ${messageTableName} WHERE id IN (${placeholders})`, messageIds);
        if (threadIds.length > 0) {
          const updatePromises = threadIds.map(
            (threadId) => t.none(`UPDATE ${threadTableName} SET "updatedAt" = NOW(), "updatedAtZ" = NOW() WHERE id = $1`, [threadId])
          );
          await Promise.all(updatePromises);
        }
      });
    } catch (error) {
      throw new MastraError(
        {
          id: "PG_STORE_DELETE_MESSAGES_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: { messageIds: messageIds.join(", ") }
        },
        error
      );
    }
  }
  async getResourceById({ resourceId }) {
    const tableName = getTableName({ indexName: TABLE_RESOURCES, schemaName: getSchemaName(this.schema) });
    const result = await this.client.oneOrNone(
      `SELECT * FROM ${tableName} WHERE id = $1`,
      [resourceId]
    );
    if (!result) {
      return null;
    }
    return {
      id: result.id,
      createdAt: result.createdAtZ || result.createdAt,
      updatedAt: result.updatedAtZ || result.updatedAt,
      workingMemory: result.workingMemory,
      metadata: typeof result.metadata === "string" ? JSON.parse(result.metadata) : result.metadata
    };
  }
  async saveResource({ resource }) {
    await this.operations.insert({
      tableName: TABLE_RESOURCES,
      record: {
        ...resource,
        metadata: JSON.stringify(resource.metadata)
      }
    });
    return resource;
  }
  async updateResource({
    resourceId,
    workingMemory,
    metadata
  }) {
    const existingResource = await this.getResourceById({ resourceId });
    if (!existingResource) {
      const newResource = {
        id: resourceId,
        workingMemory,
        metadata: metadata || {},
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      return this.saveResource({ resource: newResource });
    }
    const updatedResource = {
      ...existingResource,
      workingMemory: workingMemory !== void 0 ? workingMemory : existingResource.workingMemory,
      metadata: {
        ...existingResource.metadata,
        ...metadata
      },
      updatedAt: /* @__PURE__ */ new Date()
    };
    const tableName = getTableName({ indexName: TABLE_RESOURCES, schemaName: getSchemaName(this.schema) });
    const updates = [];
    const values = [];
    let paramIndex = 1;
    if (workingMemory !== void 0) {
      updates.push(`"workingMemory" = $${paramIndex}`);
      values.push(workingMemory);
      paramIndex++;
    }
    if (metadata) {
      updates.push(`metadata = $${paramIndex}`);
      values.push(JSON.stringify(updatedResource.metadata));
      paramIndex++;
    }
    updates.push(`"updatedAt" = $${paramIndex}`);
    values.push(updatedResource.updatedAt.toISOString());
    updates.push(`"updatedAtZ" = $${paramIndex++}`);
    values.push(updatedResource.updatedAt.toISOString());
    paramIndex++;
    values.push(resourceId);
    await this.client.none(`UPDATE ${tableName} SET ${updates.join(", ")} WHERE id = $${paramIndex}`, values);
    return updatedResource;
  }
};
var StoreOperationsPG = class extends StoreOperations {
  client;
  schemaName;
  setupSchemaPromise = null;
  schemaSetupComplete = void 0;
  constructor({ client, schemaName }) {
    super();
    this.client = client;
    this.schemaName = schemaName;
  }
  async hasColumn(table, column) {
    const schema = this.schemaName || "public";
    const result = await this.client.oneOrNone(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND (column_name = $3 OR column_name = $4)`,
      [schema, table, column, column.toLowerCase()]
    );
    return !!result;
  }
  async setupSchema() {
    if (!this.schemaName || this.schemaSetupComplete) {
      return;
    }
    const schemaName = getSchemaName(this.schemaName);
    if (!this.setupSchemaPromise) {
      this.setupSchemaPromise = (async () => {
        try {
          const schemaExists = await this.client.oneOrNone(
            `
                SELECT EXISTS (
                  SELECT 1 FROM information_schema.schemata
                  WHERE schema_name = $1
                )
              `,
            [this.schemaName]
          );
          if (!schemaExists?.exists) {
            try {
              await this.client.none(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
              this.logger.info(`Schema "${this.schemaName}" created successfully`);
            } catch (error) {
              this.logger.error(`Failed to create schema "${this.schemaName}"`, { error });
              throw new Error(
                `Unable to create schema "${this.schemaName}". This requires CREATE privilege on the database. Either create the schema manually or grant CREATE privilege to the user.`
              );
            }
          }
          this.schemaSetupComplete = true;
          this.logger.debug(`Schema "${schemaName}" is ready for use`);
        } catch (error) {
          this.schemaSetupComplete = void 0;
          this.setupSchemaPromise = null;
          throw error;
        } finally {
          this.setupSchemaPromise = null;
        }
      })();
    }
    await this.setupSchemaPromise;
  }
  async insert({ tableName, record }) {
    try {
      if (record.createdAt) {
        record.createdAtZ = record.createdAt;
      }
      if (record.created_at) {
        record.created_atZ = record.created_at;
      }
      if (record.updatedAt) {
        record.updatedAtZ = record.updatedAt;
      }
      const schemaName = getSchemaName(this.schemaName);
      const columns = Object.keys(record).map((col) => parseSqlIdentifier(col, "column name"));
      const values = Object.values(record);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
      await this.client.none(
        `INSERT INTO ${getTableName({ indexName: tableName, schemaName })} (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})`,
        values
      );
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_INSERT_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            tableName
          }
        },
        error
      );
    }
  }
  async clearTable({ tableName }) {
    try {
      const schemaName = getSchemaName(this.schemaName);
      const tableNameWithSchema = getTableName({ indexName: tableName, schemaName });
      await this.client.none(`TRUNCATE TABLE ${tableNameWithSchema} CASCADE`);
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_CLEAR_TABLE_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            tableName
          }
        },
        error
      );
    }
  }
  getDefaultValue(type) {
    switch (type) {
      case "timestamp":
        return "DEFAULT NOW()";
      case "jsonb":
        return "DEFAULT '{}'::jsonb";
      default:
        return super.getDefaultValue(type);
    }
  }
  async createTable({
    tableName,
    schema
  }) {
    try {
      const timeZColumnNames = Object.entries(schema).filter(([_, def]) => def.type === "timestamp").map(([name]) => name);
      const timeZColumns = Object.entries(schema).filter(([_, def]) => def.type === "timestamp").map(([name]) => {
        const parsedName = parseSqlIdentifier(name, "column name");
        return `"${parsedName}Z" TIMESTAMPTZ DEFAULT NOW()`;
      });
      const columns = Object.entries(schema).map(([name, def]) => {
        const parsedName = parseSqlIdentifier(name, "column name");
        const constraints = [];
        if (def.primaryKey) constraints.push("PRIMARY KEY");
        if (!def.nullable) constraints.push("NOT NULL");
        return `"${parsedName}" ${def.type.toUpperCase()} ${constraints.join(" ")}`;
      });
      if (this.schemaName) {
        await this.setupSchema();
      }
      const finalColumns = [...columns, ...timeZColumns].join(",\n");
      const constraintPrefix = this.schemaName ? `${this.schemaName}_` : "";
      const sql = `
            CREATE TABLE IF NOT EXISTS ${getTableName({ indexName: tableName, schemaName: getSchemaName(this.schemaName) })} (
              ${finalColumns}
            );
            ${tableName === TABLE_WORKFLOW_SNAPSHOT ? `
            DO $$ BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = '${constraintPrefix}mastra_workflow_snapshot_workflow_name_run_id_key'
              ) THEN
                ALTER TABLE ${getTableName({ indexName: tableName, schemaName: getSchemaName(this.schemaName) })}
                ADD CONSTRAINT ${constraintPrefix}mastra_workflow_snapshot_workflow_name_run_id_key
                UNIQUE (workflow_name, run_id);
              END IF;
            END $$;
            ` : ""}
          `;
      await this.client.none(sql);
      await this.alterTable({
        tableName,
        schema,
        ifNotExists: timeZColumnNames
      });
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_CREATE_TABLE_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            tableName
          }
        },
        error
      );
    }
  }
  /**
   * Alters table schema to add columns if they don't exist
   * @param tableName Name of the table
   * @param schema Schema of the table
   * @param ifNotExists Array of column names to add if they don't exist
   */
  async alterTable({
    tableName,
    schema,
    ifNotExists
  }) {
    const fullTableName = getTableName({ indexName: tableName, schemaName: getSchemaName(this.schemaName) });
    try {
      for (const columnName of ifNotExists) {
        if (schema[columnName]) {
          const columnDef = schema[columnName];
          const sqlType = this.getSqlType(columnDef.type);
          const nullable = columnDef.nullable === false ? "NOT NULL" : "";
          const defaultValue = columnDef.nullable === false ? this.getDefaultValue(columnDef.type) : "";
          const parsedColumnName = parseSqlIdentifier(columnName, "column name");
          const alterSql = `ALTER TABLE ${fullTableName} ADD COLUMN IF NOT EXISTS "${parsedColumnName}" ${sqlType} ${nullable} ${defaultValue}`.trim();
          await this.client.none(alterSql);
          if (sqlType === "TIMESTAMP") {
            const alterSql2 = `ALTER TABLE ${fullTableName} ADD COLUMN IF NOT EXISTS "${parsedColumnName}Z" TIMESTAMPTZ DEFAULT NOW()`.trim();
            await this.client.none(alterSql2);
          }
          this.logger?.debug?.(`Ensured column ${parsedColumnName} exists in table ${fullTableName}`);
        }
      }
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_ALTER_TABLE_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            tableName
          }
        },
        error
      );
    }
  }
  async load({ tableName, keys }) {
    try {
      const keyEntries = Object.entries(keys).map(([key, value]) => [parseSqlIdentifier(key, "column name"), value]);
      const conditions = keyEntries.map(([key], index) => `"${key}" = $${index + 1}`).join(" AND ");
      const values = keyEntries.map(([_, value]) => value);
      const result = await this.client.oneOrNone(
        `SELECT * FROM ${getTableName({ indexName: tableName, schemaName: getSchemaName(this.schemaName) })} WHERE ${conditions} ORDER BY "createdAt" DESC LIMIT 1`,
        values
      );
      if (!result) {
        return null;
      }
      if (tableName === TABLE_WORKFLOW_SNAPSHOT) {
        const snapshot = result;
        if (typeof snapshot.snapshot === "string") {
          snapshot.snapshot = JSON.parse(snapshot.snapshot);
        }
        return snapshot;
      }
      return result;
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_LOAD_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            tableName
          }
        },
        error
      );
    }
  }
  async batchInsert({ tableName, records }) {
    try {
      await this.client.query("BEGIN");
      for (const record of records) {
        await this.insert({ tableName, record });
      }
      await this.client.query("COMMIT");
    } catch (error) {
      await this.client.query("ROLLBACK");
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_BATCH_INSERT_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            tableName,
            numberOfRecords: records.length
          }
        },
        error
      );
    }
  }
  async dropTable({ tableName }) {
    try {
      const schemaName = getSchemaName(this.schemaName);
      const tableNameWithSchema = getTableName({ indexName: tableName, schemaName });
      await this.client.none(`DROP TABLE IF EXISTS ${tableNameWithSchema}`);
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_DROP_TABLE_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            tableName
          }
        },
        error
      );
    }
  }
};
function transformScoreRow(row) {
  console.log(`row is`, JSON.stringify(row, null, 2));
  return {
    ...row,
    input: safelyParseJSON(row.input),
    scorer: safelyParseJSON(row.scorer),
    preprocessStepResult: safelyParseJSON(row.preprocessStepResult),
    analyzeStepResult: safelyParseJSON(row.analyzeStepResult),
    metadata: safelyParseJSON(row.metadata),
    output: safelyParseJSON(row.output),
    additionalContext: safelyParseJSON(row.additionalContext),
    runtimeContext: safelyParseJSON(row.runtimeContext),
    entity: safelyParseJSON(row.entity),
    createdAt: row.createdAtZ || row.createdAt,
    updatedAt: row.updatedAtZ || row.updatedAt
  };
}
var ScoresPG = class extends ScoresStorage {
  client;
  operations;
  schema;
  constructor({
    client,
    operations,
    schema
  }) {
    super();
    this.client = client;
    this.operations = operations;
    this.schema = schema;
  }
  async getScoreById({ id }) {
    try {
      const result = await this.client.oneOrNone(
        `SELECT * FROM ${getTableName({ indexName: TABLE_SCORERS, schemaName: this.schema })} WHERE id = $1`,
        [id]
      );
      return result ? transformScoreRow(result) : null;
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_SCORE_BY_ID_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY
        },
        error
      );
    }
  }
  async getScoresByScorerId({
    scorerId,
    pagination,
    entityId,
    entityType,
    source
  }) {
    try {
      const conditions = [`"scorerId" = $1`];
      const queryParams = [scorerId];
      let paramIndex = 2;
      if (entityId) {
        conditions.push(`"entityId" = $${paramIndex++}`);
        queryParams.push(entityId);
      }
      if (entityType) {
        conditions.push(`"entityType" = $${paramIndex++}`);
        queryParams.push(entityType);
      }
      if (source) {
        conditions.push(`"source" = $${paramIndex++}`);
        queryParams.push(source);
      }
      const whereClause = conditions.join(" AND ");
      const total = await this.client.oneOrNone(
        `SELECT COUNT(*) FROM ${getTableName({ indexName: TABLE_SCORERS, schemaName: this.schema })} WHERE ${whereClause}`,
        queryParams
      );
      if (total?.count === "0" || !total?.count) {
        return {
          pagination: {
            total: 0,
            page: pagination.page,
            perPage: pagination.perPage,
            hasMore: false
          },
          scores: []
        };
      }
      const result = await this.client.manyOrNone(
        `SELECT * FROM ${getTableName({ indexName: TABLE_SCORERS, schemaName: this.schema })} WHERE ${whereClause} ORDER BY "createdAt" DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...queryParams, pagination.perPage, pagination.page * pagination.perPage]
      );
      return {
        pagination: {
          total: Number(total?.count) || 0,
          page: pagination.page,
          perPage: pagination.perPage,
          hasMore: Number(total?.count) > (pagination.page + 1) * pagination.perPage
        },
        scores: result.map(transformScoreRow)
      };
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_SCORES_BY_SCORER_ID_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY
        },
        error
      );
    }
  }
  async saveScore(score) {
    try {
      const id = crypto.randomUUID();
      const {
        scorer,
        preprocessStepResult,
        analyzeStepResult,
        metadata,
        input,
        output,
        additionalContext,
        runtimeContext,
        entity,
        ...rest
      } = score;
      console.log(`saving score with id: ${id}`);
      await this.operations.insert({
        tableName: TABLE_SCORERS,
        record: {
          id,
          ...rest,
          input: JSON.stringify(input) || "",
          output: JSON.stringify(output) || "",
          scorer: scorer ? JSON.stringify(scorer) : null,
          preprocessStepResult: preprocessStepResult ? JSON.stringify(preprocessStepResult) : null,
          analyzeStepResult: analyzeStepResult ? JSON.stringify(analyzeStepResult) : null,
          metadata: metadata ? JSON.stringify(metadata) : null,
          additionalContext: additionalContext ? JSON.stringify(additionalContext) : null,
          runtimeContext: runtimeContext ? JSON.stringify(runtimeContext) : null,
          entity: entity ? JSON.stringify(entity) : null,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      const scoreFromDb = await this.getScoreById({ id });
      return { score: scoreFromDb };
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_SAVE_SCORE_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY
        },
        error
      );
    }
  }
  async getScoresByRunId({
    runId,
    pagination
  }) {
    try {
      const total = await this.client.oneOrNone(
        `SELECT COUNT(*) FROM ${getTableName({ indexName: TABLE_SCORERS, schemaName: this.schema })} WHERE "runId" = $1`,
        [runId]
      );
      if (total?.count === "0" || !total?.count) {
        return {
          pagination: {
            total: 0,
            page: pagination.page,
            perPage: pagination.perPage,
            hasMore: false
          },
          scores: []
        };
      }
      const result = await this.client.manyOrNone(
        `SELECT * FROM ${getTableName({ indexName: TABLE_SCORERS, schemaName: this.schema })} WHERE "runId" = $1 LIMIT $2 OFFSET $3`,
        [runId, pagination.perPage, pagination.page * pagination.perPage]
      );
      return {
        pagination: {
          total: Number(total?.count) || 0,
          page: pagination.page,
          perPage: pagination.perPage,
          hasMore: Number(total?.count) > (pagination.page + 1) * pagination.perPage
        },
        scores: result.map(transformScoreRow)
      };
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_SCORES_BY_RUN_ID_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY
        },
        error
      );
    }
  }
  async getScoresByEntityId({
    entityId,
    entityType,
    pagination
  }) {
    try {
      const total = await this.client.oneOrNone(
        `SELECT COUNT(*) FROM ${getTableName({ indexName: TABLE_SCORERS, schemaName: this.schema })} WHERE "entityId" = $1 AND "entityType" = $2`,
        [entityId, entityType]
      );
      if (total?.count === "0" || !total?.count) {
        return {
          pagination: {
            total: 0,
            page: pagination.page,
            perPage: pagination.perPage,
            hasMore: false
          },
          scores: []
        };
      }
      const result = await this.client.manyOrNone(
        `SELECT * FROM ${getTableName({ indexName: TABLE_SCORERS, schemaName: this.schema })} WHERE "entityId" = $1 AND "entityType" = $2 LIMIT $3 OFFSET $4`,
        [entityId, entityType, pagination.perPage, pagination.page * pagination.perPage]
      );
      return {
        pagination: {
          total: Number(total?.count) || 0,
          page: pagination.page,
          perPage: pagination.perPage,
          hasMore: Number(total?.count) > (pagination.page + 1) * pagination.perPage
        },
        scores: result.map(transformScoreRow)
      };
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_SCORES_BY_ENTITY_ID_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY
        },
        error
      );
    }
  }
};
var TracesPG = class extends TracesStorage {
  client;
  operations;
  schema;
  constructor({
    client,
    operations,
    schema
  }) {
    super();
    this.client = client;
    this.operations = operations;
    this.schema = schema;
  }
  async getTraces(args) {
    if (args.fromDate || args.toDate) {
      args.dateRange = {
        start: args.fromDate,
        end: args.toDate
      };
    }
    try {
      const result = await this.getTracesPaginated(args);
      return result.traces;
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_TRACES_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY
        },
        error
      );
    }
  }
  async getTracesPaginated(args) {
    const { name, scope, page = 0, perPage = 100, attributes, filters, dateRange } = args;
    const fromDate = dateRange?.start;
    const toDate = dateRange?.end;
    const currentOffset = page * perPage;
    const queryParams = [];
    const conditions = [];
    let paramIndex = 1;
    if (name) {
      conditions.push(`name LIKE $${paramIndex++}`);
      queryParams.push(`${name}%`);
    }
    if (scope) {
      conditions.push(`scope = $${paramIndex++}`);
      queryParams.push(scope);
    }
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        const parsedKey = parseFieldKey(key);
        conditions.push(`attributes->>'${parsedKey}' = $${paramIndex++}`);
        queryParams.push(value);
      });
    }
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        const parsedKey = parseFieldKey(key);
        conditions.push(`"${parsedKey}" = $${paramIndex++}`);
        queryParams.push(value);
      });
    }
    if (fromDate) {
      conditions.push(`"createdAt" >= $${paramIndex++}`);
      queryParams.push(fromDate);
    }
    if (toDate) {
      conditions.push(`"createdAt" <= $${paramIndex++}`);
      queryParams.push(toDate);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    try {
      const countResult = await this.client.oneOrNone(
        `SELECT COUNT(*) FROM ${getTableName({ indexName: TABLE_TRACES, schemaName: getSchemaName(this.schema) })} ${whereClause}`,
        queryParams
      );
      const total = Number(countResult?.count ?? 0);
      if (total === 0) {
        return {
          traces: [],
          total: 0,
          page,
          perPage,
          hasMore: false
        };
      }
      const dataResult = await this.client.manyOrNone(
        `SELECT * FROM ${getTableName({ indexName: TABLE_TRACES, schemaName: getSchemaName(this.schema) })} ${whereClause} ORDER BY "startTime" DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...queryParams, perPage, currentOffset]
      );
      const traces = dataResult.map((row) => ({
        id: row.id,
        parentSpanId: row.parentSpanId,
        traceId: row.traceId,
        name: row.name,
        scope: row.scope,
        kind: row.kind,
        status: safelyParseJSON(row.status),
        events: safelyParseJSON(row.events),
        links: safelyParseJSON(row.links),
        attributes: safelyParseJSON(row.attributes),
        startTime: row.startTime,
        endTime: row.endTime,
        other: safelyParseJSON(row.other),
        createdAt: row.createdAtZ || row.createdAt
      }));
      return {
        traces,
        total,
        page,
        perPage,
        hasMore: currentOffset + traces.length < total
      };
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_TRACES_PAGINATED_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY
        },
        error
      );
    }
  }
  async batchTraceInsert({ records }) {
    this.logger.debug("Batch inserting traces", { count: records.length });
    await this.operations.batchInsert({
      tableName: TABLE_TRACES,
      records
    });
  }
};
function parseWorkflowRun(row) {
  let parsedSnapshot = row.snapshot;
  if (typeof parsedSnapshot === "string") {
    try {
      parsedSnapshot = JSON.parse(row.snapshot);
    } catch (e) {
      console.warn(`Failed to parse snapshot for workflow ${row.workflow_name}: ${e}`);
    }
  }
  return {
    workflowName: row.workflow_name,
    runId: row.run_id,
    snapshot: parsedSnapshot,
    resourceId: row.resourceId,
    createdAt: new Date(row.createdAtZ || row.createdAt),
    updatedAt: new Date(row.updatedAtZ || row.updatedAt)
  };
}
var WorkflowsPG = class extends WorkflowsStorage {
  client;
  operations;
  schema;
  constructor({
    client,
    operations,
    schema
  }) {
    super();
    this.client = client;
    this.operations = operations;
    this.schema = schema;
  }
  updateWorkflowResults({
    // workflowName,
    // runId,
    // stepId,
    // result,
    // runtimeContext,
  }) {
    throw new Error("Method not implemented.");
  }
  updateWorkflowState({
    // workflowName,
    // runId,
    // opts,
  }) {
    throw new Error("Method not implemented.");
  }
  async persistWorkflowSnapshot({
    workflowName,
    runId,
    snapshot
  }) {
    try {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      await this.client.none(
        `INSERT INTO ${getTableName({ indexName: TABLE_WORKFLOW_SNAPSHOT, schemaName: this.schema })} (workflow_name, run_id, snapshot, "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (workflow_name, run_id) DO UPDATE
                 SET snapshot = $3, "updatedAt" = $5`,
        [workflowName, runId, JSON.stringify(snapshot), now, now]
      );
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_PERSIST_WORKFLOW_SNAPSHOT_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY
        },
        error
      );
    }
  }
  async loadWorkflowSnapshot({
    workflowName,
    runId
  }) {
    try {
      const result = await this.operations.load({
        tableName: TABLE_WORKFLOW_SNAPSHOT,
        keys: { workflow_name: workflowName, run_id: runId }
      });
      return result ? result.snapshot : null;
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_LOAD_WORKFLOW_SNAPSHOT_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY
        },
        error
      );
    }
  }
  async getWorkflowRunById({
    runId,
    workflowName
  }) {
    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;
      if (runId) {
        conditions.push(`run_id = $${paramIndex}`);
        values.push(runId);
        paramIndex++;
      }
      if (workflowName) {
        conditions.push(`workflow_name = $${paramIndex}`);
        values.push(workflowName);
        paramIndex++;
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const query = `
          SELECT * FROM ${getTableName({ indexName: TABLE_WORKFLOW_SNAPSHOT, schemaName: this.schema })}
          ${whereClause}
          ORDER BY "createdAt" DESC LIMIT 1
        `;
      const queryValues = values;
      const result = await this.client.oneOrNone(query, queryValues);
      if (!result) {
        return null;
      }
      return parseWorkflowRun(result);
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_WORKFLOW_RUN_BY_ID_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            runId,
            workflowName: workflowName || ""
          }
        },
        error
      );
    }
  }
  async getWorkflowRuns({
    workflowName,
    fromDate,
    toDate,
    limit,
    offset,
    resourceId
  } = {}) {
    try {
      const conditions = [];
      const values = [];
      let paramIndex = 1;
      if (workflowName) {
        conditions.push(`workflow_name = $${paramIndex}`);
        values.push(workflowName);
        paramIndex++;
      }
      if (resourceId) {
        const hasResourceId = await this.operations.hasColumn(TABLE_WORKFLOW_SNAPSHOT, "resourceId");
        if (hasResourceId) {
          conditions.push(`"resourceId" = $${paramIndex}`);
          values.push(resourceId);
          paramIndex++;
        } else {
          console.warn(`[${TABLE_WORKFLOW_SNAPSHOT}] resourceId column not found. Skipping resourceId filter.`);
        }
      }
      if (fromDate) {
        conditions.push(`"createdAt" >= $${paramIndex}`);
        values.push(fromDate);
        paramIndex++;
      }
      if (toDate) {
        conditions.push(`"createdAt" <= $${paramIndex}`);
        values.push(toDate);
        paramIndex++;
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      let total = 0;
      if (limit !== void 0 && offset !== void 0) {
        const countResult = await this.client.one(
          `SELECT COUNT(*) as count FROM ${getTableName({ indexName: TABLE_WORKFLOW_SNAPSHOT, schemaName: this.schema })} ${whereClause}`,
          values
        );
        total = Number(countResult.count);
      }
      const query = `
          SELECT * FROM ${getTableName({ indexName: TABLE_WORKFLOW_SNAPSHOT, schemaName: this.schema })}
          ${whereClause}
          ORDER BY "createdAt" DESC
          ${limit !== void 0 && offset !== void 0 ? ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}` : ""}
        `;
      const queryValues = limit !== void 0 && offset !== void 0 ? [...values, limit, offset] : values;
      const result = await this.client.manyOrNone(query, queryValues);
      const runs = (result || []).map((row) => {
        return parseWorkflowRun(row);
      });
      return { runs, total: total || runs.length };
    } catch (error) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_GET_WORKFLOW_RUNS_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY,
          details: {
            workflowName: workflowName || "all"
          }
        },
        error
      );
    }
  }
};

// src/storage/index.ts
var PostgresStore = class extends MastraStorage {
  #db;
  #pgp;
  #config;
  schema;
  isConnected = false;
  stores;
  constructor(config) {
    try {
      if ("connectionString" in config) {
        if (!config.connectionString || typeof config.connectionString !== "string" || config.connectionString.trim() === "") {
          throw new Error(
            "PostgresStore: connectionString must be provided and cannot be empty. Passing an empty string may cause fallback to local Postgres defaults."
          );
        }
      } else {
        const required = ["host", "database", "user", "password"];
        for (const key of required) {
          if (!(key in config) || typeof config[key] !== "string" || config[key].trim() === "") {
            throw new Error(
              `PostgresStore: ${key} must be provided and cannot be empty. Passing an empty string may cause fallback to local Postgres defaults.`
            );
          }
        }
      }
      super({ name: "PostgresStore" });
      this.schema = config.schemaName || "public";
      this.#config = {
        max: config.max,
        idleTimeoutMillis: config.idleTimeoutMillis,
        ...`connectionString` in config ? { connectionString: config.connectionString } : {
          host: config.host,
          port: config.port,
          database: config.database,
          user: config.user,
          password: config.password,
          ssl: config.ssl
        }
      };
      this.stores = {};
    } catch (e) {
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_PG_STORE_INITIALIZATION_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.USER
        },
        e
      );
    }
  }
  async init() {
    if (this.isConnected) {
      return;
    }
    try {
      this.isConnected = true;
      this.#pgp = pgPromise();
      this.#db = this.#pgp(this.#config);
      const operations = new StoreOperationsPG({ client: this.#db, schemaName: this.schema });
      const scores = new ScoresPG({ client: this.#db, operations, schema: this.schema });
      const traces = new TracesPG({ client: this.#db, operations, schema: this.schema });
      const workflows = new WorkflowsPG({ client: this.#db, operations, schema: this.schema });
      const legacyEvals = new LegacyEvalsPG({ client: this.#db, schema: this.schema });
      const memory = new MemoryPG({ client: this.#db, schema: this.schema, operations });
      this.stores = {
        operations,
        scores,
        traces,
        workflows,
        legacyEvals,
        memory
      };
      await super.init();
    } catch (error) {
      this.isConnected = false;
      throw new MastraError(
        {
          id: "MASTRA_STORAGE_POSTGRES_STORE_INIT_FAILED",
          domain: ErrorDomain.STORAGE,
          category: ErrorCategory.THIRD_PARTY
        },
        error
      );
    }
  }
  get db() {
    if (!this.#db) {
      throw new Error(`PostgresStore: Store is not initialized, please call "init()" first.`);
    }
    return this.#db;
  }
  get pgp() {
    if (!this.#pgp) {
      throw new Error(`PostgresStore: Store is not initialized, please call "init()" first.`);
    }
    return this.#pgp;
  }
  get supports() {
    return {
      selectByIncludeResourceScope: true,
      resourceWorkingMemory: true,
      hasColumn: true,
      createTable: true,
      deleteMessages: true
    };
  }
  /** @deprecated use getEvals instead */
  async getEvalsByAgentName(agentName, type) {
    return this.stores.legacyEvals.getEvalsByAgentName(agentName, type);
  }
  async getEvals(options = {}) {
    return this.stores.legacyEvals.getEvals(options);
  }
  /**
   * @deprecated use getTracesPaginated instead
   */
  async getTraces(args) {
    return this.stores.traces.getTraces(args);
  }
  async getTracesPaginated(args) {
    return this.stores.traces.getTracesPaginated(args);
  }
  async batchTraceInsert({ records }) {
    return this.stores.traces.batchTraceInsert({ records });
  }
  async createTable({
    tableName,
    schema
  }) {
    return this.stores.operations.createTable({ tableName, schema });
  }
  async alterTable({
    tableName,
    schema,
    ifNotExists
  }) {
    return this.stores.operations.alterTable({ tableName, schema, ifNotExists });
  }
  async clearTable({ tableName }) {
    return this.stores.operations.clearTable({ tableName });
  }
  async dropTable({ tableName }) {
    return this.stores.operations.dropTable({ tableName });
  }
  async insert({ tableName, record }) {
    return this.stores.operations.insert({ tableName, record });
  }
  async batchInsert({ tableName, records }) {
    return this.stores.operations.batchInsert({ tableName, records });
  }
  async load({ tableName, keys }) {
    return this.stores.operations.load({ tableName, keys });
  }
  /**
   * Memory
   */
  async getThreadById({ threadId }) {
    return this.stores.memory.getThreadById({ threadId });
  }
  /**
   * @deprecated use getThreadsByResourceIdPaginated instead
   */
  async getThreadsByResourceId(args) {
    return this.stores.memory.getThreadsByResourceId(args);
  }
  async getThreadsByResourceIdPaginated(args) {
    return this.stores.memory.getThreadsByResourceIdPaginated(args);
  }
  async saveThread({ thread }) {
    return this.stores.memory.saveThread({ thread });
  }
  async updateThread({
    id,
    title,
    metadata
  }) {
    return this.stores.memory.updateThread({ id, title, metadata });
  }
  async deleteThread({ threadId }) {
    return this.stores.memory.deleteThread({ threadId });
  }
  async getMessages(args) {
    return this.stores.memory.getMessages(args);
  }
  async getMessagesById({
    messageIds,
    format
  }) {
    return this.stores.memory.getMessagesById({ messageIds, format });
  }
  async getMessagesPaginated(args) {
    return this.stores.memory.getMessagesPaginated(args);
  }
  async saveMessages(args) {
    return this.stores.memory.saveMessages(args);
  }
  async updateMessages({
    messages
  }) {
    return this.stores.memory.updateMessages({ messages });
  }
  async deleteMessages(messageIds) {
    return this.stores.memory.deleteMessages(messageIds);
  }
  async getResourceById({ resourceId }) {
    return this.stores.memory.getResourceById({ resourceId });
  }
  async saveResource({ resource }) {
    return this.stores.memory.saveResource({ resource });
  }
  async updateResource({
    resourceId,
    workingMemory,
    metadata
  }) {
    return this.stores.memory.updateResource({ resourceId, workingMemory, metadata });
  }
  /**
   * Workflows
   */
  async updateWorkflowResults({
    workflowName,
    runId,
    stepId,
    result,
    runtimeContext
  }) {
    return this.stores.workflows.updateWorkflowResults({ workflowName, runId, stepId, result, runtimeContext });
  }
  async updateWorkflowState({
    workflowName,
    runId,
    opts
  }) {
    return this.stores.workflows.updateWorkflowState({ workflowName, runId, opts });
  }
  async persistWorkflowSnapshot({
    workflowName,
    runId,
    snapshot
  }) {
    return this.stores.workflows.persistWorkflowSnapshot({ workflowName, runId, snapshot });
  }
  async loadWorkflowSnapshot({
    workflowName,
    runId
  }) {
    return this.stores.workflows.loadWorkflowSnapshot({ workflowName, runId });
  }
  async getWorkflowRuns({
    workflowName,
    fromDate,
    toDate,
    limit,
    offset,
    resourceId
  } = {}) {
    return this.stores.workflows.getWorkflowRuns({ workflowName, fromDate, toDate, limit, offset, resourceId });
  }
  async getWorkflowRunById({
    runId,
    workflowName
  }) {
    return this.stores.workflows.getWorkflowRunById({ runId, workflowName });
  }
  async close() {
    this.pgp.end();
  }
  /**
   * Scorers
   */
  async getScoreById({ id: _id }) {
    return this.stores.scores.getScoreById({ id: _id });
  }
  async getScoresByScorerId({
    scorerId,
    pagination,
    entityId,
    entityType,
    source
  }) {
    return this.stores.scores.getScoresByScorerId({ scorerId, pagination, entityId, entityType, source });
  }
  async saveScore(_score) {
    return this.stores.scores.saveScore(_score);
  }
  async getScoresByRunId({
    runId: _runId,
    pagination: _pagination
  }) {
    return this.stores.scores.getScoresByRunId({ runId: _runId, pagination: _pagination });
  }
  async getScoresByEntityId({
    entityId: _entityId,
    entityType: _entityType,
    pagination: _pagination
  }) {
    return this.stores.scores.getScoresByEntityId({
      entityId: _entityId,
      entityType: _entityType,
      pagination: _pagination
    });
  }
};

export { PgVector, PostgresStore };

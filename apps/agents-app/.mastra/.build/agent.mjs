import { I as InstrumentClass, T as Telemetry, c as context } from './telemetry.mjs';
import { M as MastraError } from './chunk-MCOVMKIS.mjs';
import { M as MastraBase, R as RegisteredLogger, C as ConsoleLogger } from './chunk-6GF5M4GX.mjs';
import { O as OpenAIReasoningSchemaCompatLayer, f as OpenAISchemaCompatLayer, G as GoogleSchemaCompatLayer, A as AnthropicSchemaCompatLayer, D as DeepSeekSchemaCompatLayer, M as MetaSchemaCompatLayer, h as applyCompatLayer, i as isZodType, j as jsonSchema, o as output_exports, k as generateText, l as generateObject, s as streamText, n as streamObject, q as delay, r as ensureToolProperties, m as makeCoreTool, t as createMastraProxy, T as ToolStream } from './utils.mjs';
import { z as zodToJsonSchema } from './zod-to-json.mjs';
import { y as ZodArray, o as objectType, s as stringType, c as anyType, r as recordType, f as booleanType, b as arrayType } from './types.mjs';
import { M as MessageList, s as stepCountIs, g as generateId, c as consumeStream, a as createTextStreamResponse, b as createUIMessageStreamResponse, d as createUIMessageStream, f as getErrorMessage, h as asSchema, i as isAbortError, D as DefaultGeneratedFile, j as DefaultGeneratedFileWithType, p as parsePartialJson, k as isDeepEqualData, t as tool, T as TypeValidationError } from './chunk-C5C4PN54.mjs';
import { e as executeHook } from './hooks.mjs';
import { RuntimeContext } from './@mastra-core-runtime-context.mjs';
import { T as Tool } from './tools.mjs';
import { b as getSelectedAITracing, w as wrapMastra } from './ai-tracing.mjs';
import { randomUUID } from 'crypto';
import EventEmitter from 'events';
import { TransformStream as TransformStream$1, ReadableStream as ReadableStream$1 } from 'stream/web';
import { z } from './zod.mjs';
import { t as trace } from './trace-api.mjs';
import { m as isAbortError$1 } from './index.mjs';

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = msg => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", {
  value,
  configurable: true
});
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = {
    exports: {}
  }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
// If the importer is in node compatibility mode or this is not an ESM
// file that has been converted to a CommonJS file using a Babel-
// compatible transform (i.e. "__esModule" has not been set), then set
// "default" to the CommonJS "module.exports" for node compatibility.
__defProp(target, "default", {
  value: mod,
  enumerable: true
}) , mod));
var __decoratorStart = base => [,,, __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = fn => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({
  kind: __decoratorStrings[kind],
  name,
  metadata,
  addInitializer: fn => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null))
});
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self) ;
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var it,
    done,
    ctx,
    k = flags & 7,
    p = false;
  var j = 0;
  var extraInitializers = array[j] || (array[j] = []);
  var desc = k && ((target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(target , name));
  __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn(it) && (target = it);
  }
  return __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};

// src/voice/voice.ts
var _MastraVoice_decorators, _init$1, _a$1;
_MastraVoice_decorators = [InstrumentClass({
  prefix: "voice",
  excludeMethods: ["__setTools", "__setLogger", "__setTelemetry", "#log"]
})];
var MastraVoice = class extends (_a$1 = MastraBase) {
  listeningModel;
  speechModel;
  speaker;
  realtimeConfig;
  constructor({
    listeningModel,
    speechModel,
    speaker,
    realtimeConfig,
    name
  } = {}) {
    super({
      component: "VOICE",
      name
    });
    this.listeningModel = listeningModel;
    this.speechModel = speechModel;
    this.speaker = speaker;
    this.realtimeConfig = realtimeConfig;
  }
  traced(method, methodName) {
    return this.telemetry?.traceMethod(method, {
      spanName: `voice.${methodName}`,
      attributes: {
        "voice.type": this.speechModel?.name || this.listeningModel?.name || "unknown"
      }
    }) ?? method;
  }
  updateConfig(_options) {
    this.logger.warn("updateConfig not implemented by this voice provider");
  }
  /**
   * Initializes a WebSocket or WebRTC connection for real-time communication
   * @returns Promise that resolves when the connection is established
   */
  connect(_options) {
    this.logger.warn("connect not implemented by this voice provider");
    return Promise.resolve();
  }
  /**
   * Relay audio data to the voice provider for real-time processing
   * @param audioData Audio data to relay
   */
  send(_audioData) {
    this.logger.warn("relay not implemented by this voice provider");
    return Promise.resolve();
  }
  /**
   * Trigger voice providers to respond
   */
  answer(_options) {
    this.logger.warn("answer not implemented by this voice provider");
    return Promise.resolve();
  }
  /**
   * Equip the voice provider with instructions
   * @param instructions Instructions to add
   */
  addInstructions(_instructions) {}
  /**
   * Equip the voice provider with tools
   * @param tools Array of tools to add
   */
  addTools(_tools) {}
  /**
   * Disconnect from the WebSocket or WebRTC connection
   */
  close() {
    this.logger.warn("close not implemented by this voice provider");
  }
  /**
   * Register an event listener
   * @param event Event name (e.g., 'speaking', 'writing', 'error')
   * @param callback Callback function that receives event data
   */
  on(_event, _callback) {
    this.logger.warn("on not implemented by this voice provider");
  }
  /**
   * Remove an event listener
   * @param event Event name (e.g., 'speaking', 'writing', 'error')
   * @param callback Callback function to remove
   */
  off(_event, _callback) {
    this.logger.warn("off not implemented by this voice provider");
  }
  /**
   * Get available speakers/voices
   * @returns Array of available voice IDs and their metadata
   */
  getSpeakers() {
    this.logger.warn("getSpeakers not implemented by this voice provider");
    return Promise.resolve([]);
  }
  /**
   * Get available speakers/voices
   * @returns Array of available voice IDs and their metadata
   */
  getListener() {
    this.logger.warn("getListener not implemented by this voice provider");
    return Promise.resolve({
      enabled: false
    });
  }
};
MastraVoice = /*@__PURE__*/(_ => {
  _init$1 = __decoratorStart(_a$1);
  MastraVoice = __decorateElement(_init$1, 0, "MastraVoice", _MastraVoice_decorators, MastraVoice);
  __runInitializers(_init$1, 1, MastraVoice);

  // src/voice/composite-voice.ts
  return MastraVoice;
})();

// src/voice/default-voice.ts
var DefaultVoice = class extends MastraVoice {
  constructor() {
    super();
  }
  async speak(_input) {
    throw new MastraError({
      id: "VOICE_DEFAULT_NO_SPEAK_PROVIDER",
      text: "No voice provider configured",
      domain: "MASTRA_VOICE" /* MASTRA_VOICE */,
      category: "USER" /* USER */
    });
  }
  async listen(_input) {
    throw new MastraError({
      id: "VOICE_DEFAULT_NO_LISTEN_PROVIDER",
      text: "No voice provider configured",
      domain: "MASTRA_VOICE" /* MASTRA_VOICE */,
      category: "USER" /* USER */
    });
  }
  async getSpeakers() {
    throw new MastraError({
      id: "VOICE_DEFAULT_NO_SPEAKERS_PROVIDER",
      text: "No voice provider configured",
      domain: "MASTRA_VOICE" /* MASTRA_VOICE */,
      category: "USER" /* USER */
    });
  }
  async getListener() {
    throw new MastraError({
      id: "VOICE_DEFAULT_NO_LISTENER_PROVIDER",
      text: "No voice provider configured",
      domain: "MASTRA_VOICE" /* MASTRA_VOICE */,
      category: "USER" /* USER */
    });
  }
};

// src/workflows/constants.ts
var EMITTER_SYMBOL = Symbol("emitter");

var MastraLLMV1 = class extends MastraBase {
  #model;
  #mastra;
  constructor({ model, mastra }) {
    super({ name: "aisdk" });
    this.#model = model;
    if (mastra) {
      this.#mastra = mastra;
      if (mastra.getLogger()) {
        this.__setLogger(this.#mastra.getLogger());
      }
    }
  }
  __registerPrimitives(p) {
    if (p.telemetry) {
      this.__setTelemetry(p.telemetry);
    }
    if (p.logger) {
      this.__setLogger(p.logger);
    }
  }
  __registerMastra(p) {
    this.#mastra = p;
  }
  getProvider() {
    return this.#model.provider;
  }
  getModelId() {
    return this.#model.modelId;
  }
  getModel() {
    return this.#model;
  }
  _applySchemaCompat(schema) {
    const model = this.#model;
    const schemaCompatLayers = [];
    if (model) {
      const modelInfo = {
        modelId: model.modelId,
        supportsStructuredOutputs: model.supportsStructuredOutputs ?? false,
        provider: model.provider
      };
      schemaCompatLayers.push(
        new OpenAIReasoningSchemaCompatLayer(modelInfo),
        new OpenAISchemaCompatLayer(modelInfo),
        new GoogleSchemaCompatLayer(modelInfo),
        new AnthropicSchemaCompatLayer(modelInfo),
        new DeepSeekSchemaCompatLayer(modelInfo),
        new MetaSchemaCompatLayer(modelInfo)
      );
    }
    return applyCompatLayer({
      schema,
      compatLayers: schemaCompatLayers,
      mode: "aiSdkSchema"
    });
  }
  _startAISpan(model, agentAISpan, name, streaming, options) {
    return agentAISpan?.createChildSpan({
      name,
      type: "llm_generation" /* LLM_GENERATION */,
      input: options.prompt,
      attributes: {
        model: model.modelId,
        provider: model.provider,
        parameters: {
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          topP: options.topP,
          frequencyPenalty: options.frequencyPenalty,
          presencePenalty: options.presencePenalty,
          stop: options.stop
        },
        streaming
      }
    });
  }
  _wrapModel(model, agentAISpan) {
    if (!agentAISpan) {
      return model;
    }
    const wrappedDoGenerate = async (options) => {
      const llmSpan = this._startAISpan(model, agentAISpan, `llm generate: '${model.modelId}'`, false, options);
      try {
        const result = await model.doGenerate(options);
        llmSpan.end({
          output: result.text,
          attributes: {
            usage: result.usage ? {
              promptTokens: result.usage.promptTokens,
              completionTokens: result.usage.completionTokens
            } : void 0
          }
        });
        return result;
      } catch (error) {
        llmSpan.error({ error });
        throw error;
      }
    };
    const wrappedDoStream = async (options) => {
      const llmSpan = this._startAISpan(model, agentAISpan, `llm stream: '${model.modelId}'`, true, options);
      try {
        const result = await model.doStream(options);
        const originalStream = result.stream;
        let finishReason;
        let finalUsage = null;
        const wrappedStream = originalStream.pipeThrough(
          new TransformStream({
            // this gets called on each chunk output
            transform(chunk, controller) {
              if (chunk.type === "finish") {
                finishReason = chunk.finishReason;
                finalUsage = chunk.usage;
              }
              controller.enqueue(chunk);
            },
            // this gets called at the end of the stream
            flush() {
              llmSpan.end({
                attributes: {
                  usage: finalUsage ? {
                    promptTokens: finalUsage.promptTokens,
                    completionTokens: finalUsage.completionTokens,
                    totalTokens: finalUsage.totalTokens
                  } : void 0
                },
                metadata: {
                  finishReason
                }
              });
            }
          })
        );
        return {
          ...result,
          stream: wrappedStream
        };
      } catch (error) {
        llmSpan.error({ error });
        throw error;
      }
    };
    return {
      ...model,
      doGenerate: wrappedDoGenerate,
      doStream: wrappedDoStream
    };
  }
  async __text({
    runId,
    messages,
    maxSteps = 5,
    tools = {},
    temperature,
    toolChoice = "auto",
    onStepFinish,
    experimental_output,
    telemetry,
    threadId,
    resourceId,
    runtimeContext,
    agentAISpan,
    ...rest
  }) {
    const model = this.#model;
    this.logger.debug(`[LLM] - Generating text`, {
      runId,
      messages,
      maxSteps,
      threadId,
      resourceId,
      tools: Object.keys(tools)
    });
    let schema = void 0;
    if (experimental_output) {
      this.logger.debug("[LLM] - Using experimental output", {
        runId
      });
      if (isZodType(experimental_output)) {
        schema = experimental_output;
        if (schema instanceof ZodArray) {
          schema = schema._def.type;
        }
        let jsonSchemaToUse;
        {
          jsonSchemaToUse = zodToJsonSchema(schema, {
            $refStrategy: "none",
            target: "jsonSchema7"
          });
        }
        schema = jsonSchema(jsonSchemaToUse);
      } else {
        schema = jsonSchema(experimental_output);
      }
    }
    const argsForExecute = {
      ...rest,
      messages,
      model: this._wrapModel(model, agentAISpan),
      temperature,
      tools: {
        ...tools
      },
      toolChoice,
      maxSteps,
      onStepFinish: async (props) => {
        try {
          await onStepFinish?.({ ...props, runId });
        } catch (e) {
          const mastraError = new MastraError(
            {
              id: "LLM_TEXT_ON_STEP_FINISH_CALLBACK_EXECUTION_FAILED",
              domain: "LLM" /* LLM */,
              category: "USER" /* USER */,
              details: {
                modelId: model.modelId,
                modelProvider: model.provider,
                runId: runId ?? "unknown",
                threadId: threadId ?? "unknown",
                resourceId: resourceId ?? "unknown",
                finishReason: props?.finishReason,
                toolCalls: props?.toolCalls ? JSON.stringify(props.toolCalls) : "",
                toolResults: props?.toolResults ? JSON.stringify(props.toolResults) : "",
                usage: props?.usage ? JSON.stringify(props.usage) : ""
              }
            },
            e
          );
          throw mastraError;
        }
        this.logger.debug("[LLM] - Text Step Change:", {
          text: props?.text,
          toolCalls: props?.toolCalls,
          toolResults: props?.toolResults,
          finishReason: props?.finishReason,
          usage: props?.usage,
          runId
        });
        if (props?.response?.headers?.["x-ratelimit-remaining-tokens"] && parseInt(props?.response?.headers?.["x-ratelimit-remaining-tokens"], 10) < 2e3) {
          this.logger.warn("Rate limit approaching, waiting 10 seconds", { runId });
          await delay(10 * 1e3);
        }
      },
      experimental_telemetry: {
        ...this.experimental_telemetry,
        ...telemetry
      },
      experimental_output: schema ? output_exports.object({
        schema
      }) : void 0
    };
    try {
      const result = await generateText(argsForExecute);
      if (schema && result.finishReason === "stop") {
        result.object = result.experimental_output;
      }
      return result;
    } catch (e) {
      const mastraError = new MastraError(
        {
          id: "LLM_GENERATE_TEXT_AI_SDK_EXECUTION_FAILED",
          domain: "LLM" /* LLM */,
          category: "THIRD_PARTY" /* THIRD_PARTY */,
          details: {
            modelId: model.modelId,
            modelProvider: model.provider,
            runId: runId ?? "unknown",
            threadId: threadId ?? "unknown",
            resourceId: resourceId ?? "unknown"
          }
        },
        e
      );
      throw mastraError;
    }
  }
  async __textObject({
    messages,
    structuredOutput,
    runId,
    telemetry,
    threadId,
    resourceId,
    runtimeContext,
    agentAISpan,
    ...rest
  }) {
    const model = this.#model;
    this.logger.debug(`[LLM] - Generating a text object`, { runId });
    try {
      let output = "object";
      if (structuredOutput instanceof ZodArray) {
        output = "array";
        structuredOutput = structuredOutput._def.type;
      }
      const processedSchema = this._applySchemaCompat(structuredOutput);
      const argsForExecute = {
        ...rest,
        messages,
        model: this._wrapModel(model, agentAISpan),
        // @ts-expect-error - output in our implementation can only be object or array
        output,
        schema: processedSchema,
        experimental_telemetry: {
          ...this.experimental_telemetry,
          ...telemetry
        }
      };
      try {
        return await generateObject(argsForExecute);
      } catch (e) {
        const mastraError = new MastraError(
          {
            id: "LLM_GENERATE_OBJECT_AI_SDK_EXECUTION_FAILED",
            domain: "LLM" /* LLM */,
            category: "THIRD_PARTY" /* THIRD_PARTY */,
            details: {
              modelId: model.modelId,
              modelProvider: model.provider,
              runId: runId ?? "unknown",
              threadId: threadId ?? "unknown",
              resourceId: resourceId ?? "unknown"
            }
          },
          e
        );
        throw mastraError;
      }
    } catch (e) {
      if (e instanceof MastraError) {
        throw e;
      }
      const mastraError = new MastraError(
        {
          id: "LLM_GENERATE_OBJECT_AI_SDK_SCHEMA_CONVERSION_FAILED",
          domain: "LLM" /* LLM */,
          category: "USER" /* USER */,
          details: {
            modelId: model.modelId,
            modelProvider: model.provider,
            runId: runId ?? "unknown",
            threadId: threadId ?? "unknown",
            resourceId: resourceId ?? "unknown"
          }
        },
        e
      );
      throw mastraError;
    }
  }
  __stream({
    messages,
    onStepFinish,
    onFinish,
    maxSteps = 5,
    tools = {},
    runId,
    temperature,
    toolChoice = "auto",
    experimental_output,
    telemetry,
    threadId,
    resourceId,
    runtimeContext,
    agentAISpan,
    ...rest
  }) {
    const model = this.#model;
    this.logger.debug(`[LLM] - Streaming text`, {
      runId,
      threadId,
      resourceId,
      messages,
      maxSteps,
      tools: Object.keys(tools || {})
    });
    let schema;
    if (experimental_output) {
      this.logger.debug("[LLM] - Using experimental output", {
        runId
      });
      if (typeof experimental_output.parse === "function") {
        schema = experimental_output;
        if (schema instanceof ZodArray) {
          schema = schema._def.type;
        }
      } else {
        schema = jsonSchema(experimental_output);
      }
    }
    const argsForExecute = {
      model: this._wrapModel(model, agentAISpan),
      temperature,
      tools: {
        ...tools
      },
      maxSteps,
      toolChoice,
      onStepFinish: async (props) => {
        try {
          await onStepFinish?.({ ...props, runId });
        } catch (e) {
          const mastraError = new MastraError(
            {
              id: "LLM_STREAM_ON_STEP_FINISH_CALLBACK_EXECUTION_FAILED",
              domain: "LLM" /* LLM */,
              category: "USER" /* USER */,
              details: {
                modelId: model.modelId,
                modelProvider: model.provider,
                runId: runId ?? "unknown",
                threadId: threadId ?? "unknown",
                resourceId: resourceId ?? "unknown",
                finishReason: props?.finishReason,
                toolCalls: props?.toolCalls ? JSON.stringify(props.toolCalls) : "",
                toolResults: props?.toolResults ? JSON.stringify(props.toolResults) : "",
                usage: props?.usage ? JSON.stringify(props.usage) : ""
              }
            },
            e
          );
          this.logger.trackException(mastraError);
          throw mastraError;
        }
        this.logger.debug("[LLM] - Stream Step Change:", {
          text: props?.text,
          toolCalls: props?.toolCalls,
          toolResults: props?.toolResults,
          finishReason: props?.finishReason,
          usage: props?.usage,
          runId
        });
        if (props?.response?.headers?.["x-ratelimit-remaining-tokens"] && parseInt(props?.response?.headers?.["x-ratelimit-remaining-tokens"], 10) < 2e3) {
          this.logger.warn("Rate limit approaching, waiting 10 seconds", { runId });
          await delay(10 * 1e3);
        }
      },
      onFinish: async (props) => {
        try {
          await onFinish?.({ ...props, runId });
        } catch (e) {
          const mastraError = new MastraError(
            {
              id: "LLM_STREAM_ON_FINISH_CALLBACK_EXECUTION_FAILED",
              domain: "LLM" /* LLM */,
              category: "USER" /* USER */,
              details: {
                modelId: model.modelId,
                modelProvider: model.provider,
                runId: runId ?? "unknown",
                threadId: threadId ?? "unknown",
                resourceId: resourceId ?? "unknown",
                finishReason: props?.finishReason,
                toolCalls: props?.toolCalls ? JSON.stringify(props.toolCalls) : "",
                toolResults: props?.toolResults ? JSON.stringify(props.toolResults) : "",
                usage: props?.usage ? JSON.stringify(props.usage) : ""
              }
            },
            e
          );
          this.logger.trackException(mastraError);
          throw mastraError;
        }
        this.logger.debug("[LLM] - Stream Finished:", {
          text: props?.text,
          toolCalls: props?.toolCalls,
          toolResults: props?.toolResults,
          finishReason: props?.finishReason,
          usage: props?.usage,
          runId,
          threadId,
          resourceId
        });
      },
      ...rest,
      messages,
      experimental_telemetry: {
        ...this.experimental_telemetry,
        ...telemetry
      },
      experimental_output: schema ? output_exports.object({
        schema
      }) : void 0
    };
    try {
      return streamText(argsForExecute);
    } catch (e) {
      const mastraError = new MastraError(
        {
          id: "LLM_STREAM_TEXT_AI_SDK_EXECUTION_FAILED",
          domain: "LLM" /* LLM */,
          category: "THIRD_PARTY" /* THIRD_PARTY */,
          details: {
            modelId: model.modelId,
            modelProvider: model.provider,
            runId: runId ?? "unknown",
            threadId: threadId ?? "unknown",
            resourceId: resourceId ?? "unknown"
          }
        },
        e
      );
      throw mastraError;
    }
  }
  __streamObject({
    messages,
    runId,
    runtimeContext,
    threadId,
    resourceId,
    onFinish,
    structuredOutput,
    telemetry,
    agentAISpan,
    ...rest
  }) {
    const model = this.#model;
    this.logger.debug(`[LLM] - Streaming structured output`, {
      runId,
      messages
    });
    try {
      let output = "object";
      if (structuredOutput instanceof ZodArray) {
        output = "array";
        structuredOutput = structuredOutput._def.type;
      }
      const processedSchema = this._applySchemaCompat(structuredOutput);
      const argsForExecute = {
        ...rest,
        model: this._wrapModel(model, agentAISpan),
        onFinish: async (props) => {
          try {
            await onFinish?.({ ...props, runId });
          } catch (e) {
            const mastraError = new MastraError(
              {
                id: "LLM_STREAM_OBJECT_ON_FINISH_CALLBACK_EXECUTION_FAILED",
                domain: "LLM" /* LLM */,
                category: "USER" /* USER */,
                details: {
                  modelId: model.modelId,
                  modelProvider: model.provider,
                  runId: runId ?? "unknown",
                  threadId: threadId ?? "unknown",
                  resourceId: resourceId ?? "unknown",
                  toolCalls: "",
                  toolResults: "",
                  finishReason: "",
                  usage: props?.usage ? JSON.stringify(props.usage) : ""
                }
              },
              e
            );
            this.logger.trackException(mastraError);
            throw mastraError;
          }
          this.logger.debug("[LLM] - Object Stream Finished:", {
            usage: props?.usage,
            runId,
            threadId,
            resourceId
          });
        },
        messages,
        // @ts-expect-error - output in our implementation can only be object or array
        output,
        experimental_telemetry: {
          ...this.experimental_telemetry,
          ...telemetry
        },
        schema: processedSchema
      };
      try {
        return streamObject(argsForExecute);
      } catch (e) {
        const mastraError = new MastraError(
          {
            id: "LLM_STREAM_OBJECT_AI_SDK_EXECUTION_FAILED",
            domain: "LLM" /* LLM */,
            category: "THIRD_PARTY" /* THIRD_PARTY */,
            details: {
              modelId: model.modelId,
              modelProvider: model.provider,
              runId: runId ?? "unknown",
              threadId: threadId ?? "unknown",
              resourceId: resourceId ?? "unknown"
            }
          },
          e
        );
        throw mastraError;
      }
    } catch (e) {
      if (e instanceof MastraError) {
        throw e;
      }
      const mastraError = new MastraError(
        {
          id: "LLM_STREAM_OBJECT_AI_SDK_SCHEMA_CONVERSION_FAILED",
          domain: "LLM" /* LLM */,
          category: "USER" /* USER */,
          details: {
            modelId: model.modelId,
            modelProvider: model.provider,
            runId: runId ?? "unknown",
            threadId: threadId ?? "unknown",
            resourceId: resourceId ?? "unknown"
          }
        },
        e
      );
      throw mastraError;
    }
  }
  convertToMessages(messages) {
    if (Array.isArray(messages)) {
      return messages.map((m) => {
        if (typeof m === "string") {
          return {
            role: "user",
            content: m
          };
        }
        return m;
      });
    }
    return [
      {
        role: "user",
        content: messages
      }
    ];
  }
  async generate(messages, {
    output,
    ...rest
  }) {
    const msgs = this.convertToMessages(messages);
    if (!output) {
      const { maxSteps, onStepFinish, ...textOptions } = rest;
      return await this.__text({
        messages: msgs,
        maxSteps,
        onStepFinish,
        ...textOptions
      });
    }
    return await this.__textObject({
      messages: msgs,
      structuredOutput: output,
      ...rest
    });
  }
  stream(messages, {
    maxSteps = 5,
    output,
    onFinish,
    ...rest
  }) {
    const msgs = this.convertToMessages(messages);
    if (!output) {
      return this.__stream({
        messages: msgs,
        maxSteps,
        onFinish,
        ...rest
      });
    }
    return this.__streamObject({
      messages: msgs,
      structuredOutput: output,
      onFinish,
      ...rest
    });
  }
};

// ../../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "../../node_modules/.pnpm/fast-deep-equal@3.1.3/node_modules/fast-deep-equal/index.js"(exports, module) {

    module.exports = function equal(a, b) {
      if (a === b) return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) return false;
          for (i = length; i-- !== 0;) if (!equal(a[i], b[i])) return false;
          return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for (i = length; i-- !== 0;) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for (i = length; i-- !== 0;) {
          var key = keys[i];
          if (!equal(a[key], b[key])) return false;
        }
        return true;
      }
      return a !== a && b !== b;
    };
  }
});

// src/agent/index.ts
var import_fast_deep_equal = __toESM(require_fast_deep_equal());

// src/agent/trip-wire.ts
var TripWire = class extends Error {
  constructor(reason) {
    super(reason);
    Object.setPrototypeOf(this, new.target.prototype);
  }
};

// src/processors/runner.ts
var ProcessorState = class {
  constructor(processorName) {
    this.processorName = processorName;
  }
  accumulatedText = "";
  customState = {};
  streamParts = [];
  // Internal methods for the runner
  addPart(part) {
    if (part.type === "text-delta") {
      this.accumulatedText += part.payload.text;
    }
    this.streamParts.push(part);
  }
};
var ProcessorRunner = class {
  inputProcessors;
  outputProcessors;
  logger;
  agentName;
  constructor({
    inputProcessors,
    outputProcessors,
    logger,
    agentName
  }) {
    this.inputProcessors = inputProcessors ?? [];
    this.outputProcessors = outputProcessors ?? [];
    this.logger = logger;
    this.agentName = agentName;
  }
  async runOutputProcessors(messageList, telemetry) {
    const responseMessages = messageList.clear.response.v2();
    let processableMessages = [...responseMessages];
    const ctx = {
      abort: () => {
        throw new TripWire("Tripwire triggered");
      }
    };
    for (const [index, processor] of this.outputProcessors.entries()) {
      const abort = reason => {
        throw new TripWire(reason || `Tripwire triggered by ${processor.name}`);
      };
      ctx.abort = abort;
      const processMethod = processor.processOutputResult?.bind(processor);
      if (!processMethod) {
        continue;
      }
      if (!telemetry) {
        processableMessages = await processMethod({
          messages: processableMessages,
          abort: ctx.abort
        });
      } else {
        await telemetry.traceMethod(async () => {
          processableMessages = await processMethod({
            messages: processableMessages,
            abort: ctx.abort
          });
          return processableMessages;
        }, {
          spanName: `agent.outputProcessor.${processor.name}`,
          attributes: {
            "processor.name": processor.name,
            "processor.index": index.toString(),
            "processor.total": this.outputProcessors.length.toString()
          }
        })();
      }
    }
    if (processableMessages.length > 0) {
      messageList.add(processableMessages, "response");
    }
    return messageList;
  }
  /**
   * Process a stream part through all output processors with state management
   */
  async processPart(part, processorStates) {
    if (!this.outputProcessors.length) {
      return {
        part,
        blocked: false
      };
    }
    try {
      let processedPart = part;
      for (const processor of this.outputProcessors) {
        try {
          if (processor.processOutputStream && processedPart) {
            let state = processorStates.get(processor.name);
            if (!state) {
              state = new ProcessorState(processor.name);
              processorStates.set(processor.name, state);
            }
            state.addPart(processedPart);
            const result = await processor.processOutputStream({
              part: processedPart,
              streamParts: state.streamParts,
              state: state.customState,
              abort: reason => {
                throw new TripWire(reason || `Stream part blocked by ${processor.name}`);
              }
            });
            processedPart = result;
          }
        } catch (error) {
          if (error instanceof TripWire) {
            return {
              part: null,
              blocked: true,
              reason: error.message
            };
          }
          this.logger.error(`[Agent:${this.agentName}] - Output processor ${processor.name} failed:`, error);
        }
      }
      return {
        part: processedPart,
        blocked: false
      };
    } catch (error) {
      this.logger.error(`[Agent:${this.agentName}] - Stream part processing failed:`, error);
      return {
        part,
        blocked: false
      };
    }
  }
  async runOutputProcessorsForStream(streamResult) {
    return new ReadableStream({
      start: async controller => {
        const reader = streamResult.fullStream.getReader();
        const processorStates = /* @__PURE__ */new Map();
        try {
          while (true) {
            const {
              done,
              value
            } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            const {
              part: processedPart,
              blocked,
              reason
            } = await this.processPart(value, processorStates);
            if (blocked) {
              void this.logger.debug(`[Agent:${this.agentName}] - Stream part blocked by output processor`, {
                reason,
                originalPart: value
              });
              controller.enqueue({
                type: "tripwire",
                tripwireReason: reason || "Output processor blocked content"
              });
              controller.close();
              break;
            } else if (processedPart !== null) {
              controller.enqueue(processedPart);
            }
          }
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }
  async runInputProcessors(messageList, telemetry) {
    const userMessages = messageList.clear.input.v2();
    let processableMessages = [...userMessages];
    const ctx = {
      abort: () => {
        throw new TripWire("Tripwire triggered");
      }
    };
    for (const [index, processor] of this.inputProcessors.entries()) {
      const abort = reason => {
        throw new TripWire(reason || `Tripwire triggered by ${processor.name}`);
      };
      ctx.abort = abort;
      const processMethod = processor.processInput?.bind(processor);
      if (!processMethod) {
        continue;
      }
      if (!telemetry) {
        processableMessages = await processMethod({
          messages: processableMessages,
          abort: ctx.abort
        });
      } else {
        await telemetry.traceMethod(async () => {
          processableMessages = await processMethod({
            messages: processableMessages,
            abort: ctx.abort
          });
          return processableMessages;
        }, {
          spanName: `agent.inputProcessor.${processor.name}`,
          attributes: {
            "processor.name": processor.name,
            "processor.index": index.toString(),
            "processor.total": this.inputProcessors.length.toString()
          }
        })();
      }
    }
    if (processableMessages.length > 0) {
      messageList.add(processableMessages, "user");
    }
    return messageList;
  }
};
function convertFullStreamChunkToUIMessageStream({
  part,
  messageMetadataValue,
  sendReasoning,
  sendSources,
  onError,
  sendStart,
  sendFinish,
  responseMessageId
}) {
  const partType = part.type;
  switch (partType) {
    case "text-start":
      {
        return {
          type: "text-start",
          id: part.id,
          ...(part.providerMetadata != null ? {
            providerMetadata: part.providerMetadata
          } : {})
        };
      }
    case "text-delta":
      {
        return {
          type: "text-delta",
          id: part.id,
          delta: part.text,
          ...(part.providerMetadata != null ? {
            providerMetadata: part.providerMetadata
          } : {})
        };
      }
    case "text-end":
      {
        return {
          type: "text-end",
          id: part.id,
          ...(part.providerMetadata != null ? {
            providerMetadata: part.providerMetadata
          } : {})
        };
      }
    case "reasoning-start":
      {
        return {
          type: "reasoning-start",
          id: part.id,
          ...(part.providerMetadata != null ? {
            providerMetadata: part.providerMetadata
          } : {})
        };
      }
    case "reasoning-delta":
      {
        if (sendReasoning) {
          return {
            type: "reasoning-delta",
            id: part.id,
            delta: part.text,
            ...(part.providerMetadata != null ? {
              providerMetadata: part.providerMetadata
            } : {})
          };
        }
        return;
      }
    case "reasoning-end":
      {
        return {
          type: "reasoning-end",
          id: part.id,
          ...(part.providerMetadata != null ? {
            providerMetadata: part.providerMetadata
          } : {})
        };
      }
    case "file":
      {
        return {
          type: "file",
          mediaType: part.file.mediaType,
          url: `data:${part.file.mediaType};base64,${part.file.base64}`
        };
      }
    case "source":
      {
        if (sendSources && part.sourceType === "url") {
          return {
            type: "source-url",
            sourceId: part.id,
            url: part.url,
            title: part.title,
            ...(part.providerMetadata != null ? {
              providerMetadata: part.providerMetadata
            } : {})
          };
        }
        if (sendSources && part.sourceType === "document") {
          return {
            type: "source-document",
            sourceId: part.id,
            mediaType: part.mediaType,
            title: part.title,
            filename: part.filename,
            ...(part.providerMetadata != null ? {
              providerMetadata: part.providerMetadata
            } : {})
          };
        }
        return;
      }
    case "tool-input-start":
      {
        return {
          type: "tool-input-start",
          toolCallId: part.id,
          toolName: part.toolName,
          ...(part.providerExecuted != null ? {
            providerExecuted: part.providerExecuted
          } : {}),
          ...(part.dynamic != null ? {
            dynamic: part.dynamic
          } : {})
        };
      }
    case "tool-input-delta":
      {
        return {
          type: "tool-input-delta",
          toolCallId: part.id,
          inputTextDelta: part.delta
        };
      }
    case "tool-call":
      {
        return {
          type: "tool-input-available",
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          input: part.input,
          ...(part.providerExecuted != null ? {
            providerExecuted: part.providerExecuted
          } : {}),
          ...(part.providerMetadata != null ? {
            providerMetadata: part.providerMetadata
          } : {}),
          ...(part.dynamic != null ? {
            dynamic: part.dynamic
          } : {})
        };
      }
    case "tool-result":
      {
        return {
          type: "tool-output-available",
          toolCallId: part.toolCallId,
          output: part.output,
          ...(part.providerExecuted != null ? {
            providerExecuted: part.providerExecuted
          } : {}),
          ...(part.dynamic != null ? {
            dynamic: part.dynamic
          } : {})
        };
      }
    case "tool-error":
      {
        return {
          type: "tool-output-error",
          toolCallId: part.toolCallId,
          errorText: onError(part.error),
          ...(part.providerExecuted != null ? {
            providerExecuted: part.providerExecuted
          } : {}),
          ...(part.dynamic != null ? {
            dynamic: part.dynamic
          } : {})
        };
      }
    case "error":
      {
        return {
          type: "error",
          errorText: onError(part.error)
        };
      }
    case "start-step":
      {
        return {
          type: "start-step"
        };
      }
    case "finish-step":
      {
        return {
          type: "finish-step"
        };
      }
    case "start":
      {
        if (sendStart) {
          return {
            type: "start",
            ...(messageMetadataValue != null ? {
              messageMetadata: messageMetadataValue
            } : {}),
            ...(responseMessageId != null ? {
              messageId: responseMessageId
            } : {})
          };
        }
        return;
      }
    case "finish":
      {
        if (sendFinish) {
          return {
            type: "finish",
            ...(messageMetadataValue != null ? {
              messageMetadata: messageMetadataValue
            } : {})
          };
        }
        return;
      }
    case "abort":
      {
        return part;
      }
    case "tool-input-end":
      {
        return;
      }
    case "raw":
      {
        return;
      }
    default:
      {
        const exhaustiveCheck = partType;
        throw new Error(`Unknown chunk type: ${exhaustiveCheck}`);
      }
  }
}
function getResponseUIMessageId({
  originalMessages,
  responseMessageId
}) {
  if (originalMessages == null) {
    return void 0;
  }
  const lastMessage = originalMessages[originalMessages.length - 1];
  return lastMessage?.role === "assistant" ? lastMessage.id : typeof responseMessageId === "function" ? responseMessageId() : responseMessageId;
}
async function safeValidateTypes({
  value,
  schema
}) {
  try {
    if (!schema.validate) {
      return {
        success: true,
        value
      };
    }
    const result = await schema.validate(value);
    if (!result.success) {
      return {
        success: false,
        error: new TypeValidationError({
          value,
          cause: "Validation failed"
        })
      };
    }
    return {
      success: true,
      value: result.value
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
function prepareToolsAndToolChoice({
  tools,
  toolChoice,
  activeTools
}) {
  if (Object.keys(tools || {}).length === 0) {
    return {
      tools: void 0,
      toolChoice: void 0
    };
  }
  const filteredTools = activeTools != null ? Object.entries(tools || {}).filter(([name]) => activeTools.includes(name)) : Object.entries(tools || {});
  return {
    tools: filteredTools.map(([name, tool$1]) => {
      try {
        let inputSchema;
        if ("inputSchema" in tool$1) {
          inputSchema = tool$1.inputSchema;
        } else if ("parameters" in tool$1) {
          inputSchema = tool$1.parameters;
        }
        const sdkTool = tool({
          type: "function",
          ...tool$1,
          inputSchema
        });
        const toolType = sdkTool?.type ?? "function";
        switch (toolType) {
          case void 0:
          case "dynamic":
          case "function":
            return {
              type: "function",
              name,
              description: sdkTool.description,
              inputSchema: asSchema(sdkTool.inputSchema).jsonSchema,
              providerOptions: sdkTool.providerOptions
            };
          case "provider-defined":
            return {
              type: "provider-defined",
              name,
              // TODO: as any seems wrong here. are there cases where we don't have an id?
              id: sdkTool.id,
              args: sdkTool.args
            };
          default:
            {
              const exhaustiveCheck = toolType;
              throw new Error(`Unsupported tool type: ${exhaustiveCheck}`);
            }
        }
      } catch (e) {
        console.error("Error preparing tool", e);
        return null;
      }
    }).filter(tool => tool !== null),
    toolChoice: toolChoice == null ? {
      type: "auto"
    } : typeof toolChoice === "string" ? {
      type: toolChoice
    } : {
      type: "tool",
      toolName: toolChoice.toolName
    }
  };
}
var DelayedPromise = class {
  status = {
    type: "pending"
  };
  _promise;
  _resolve = void 0;
  _reject = void 0;
  get promise() {
    if (this._promise) {
      return this._promise;
    }
    this._promise = new Promise((resolve, reject) => {
      if (this.status.type === "resolved") {
        resolve(this.status.value);
      } else if (this.status.type === "rejected") {
        reject(this.status.error);
      }
      this._resolve = resolve;
      this._reject = reject;
    });
    return this._promise;
  }
  resolve(value) {
    this.status = {
      type: "resolved",
      value
    };
    if (this._promise) {
      this._resolve?.(value);
    }
  }
  reject(error) {
    this.status = {
      type: "rejected",
      error
    };
    if (this._promise) {
      this._reject?.(error);
    }
  }
};
function getTransformedSchema(schema) {
  const jsonSchema = schema ? asSchema(schema).jsonSchema : void 0;
  if (!jsonSchema) {
    return void 0;
  }
  const {
    $schema,
    ...itemSchema
  } = jsonSchema;
  if (itemSchema.type === "array") {
    const innerElement = itemSchema.items;
    const arrayOutputSchema = {
      $schema,
      type: "object",
      properties: {
        elements: {
          type: "array",
          items: innerElement
        }
      },
      required: ["elements"],
      additionalProperties: false
    };
    return {
      jsonSchema: arrayOutputSchema,
      outputFormat: "array"
    };
  }
  if (itemSchema.enum && Array.isArray(itemSchema.enum)) {
    const enumOutputSchema = {
      $schema,
      type: "object",
      properties: {
        result: {
          type: itemSchema.type || "string",
          enum: itemSchema.enum
        }
      },
      required: ["result"],
      additionalProperties: false
    };
    return {
      jsonSchema: enumOutputSchema,
      outputFormat: "enum"
    };
  }
  return {
    jsonSchema,
    outputFormat: jsonSchema.type
    // 'object'
  };
}
function getResponseFormat(schema) {
  if (schema) {
    const transformedSchema = getTransformedSchema(schema);
    return {
      type: "json",
      schema: transformedSchema?.jsonSchema
    };
  }
  return {
    type: "text"
  };
}

// src/stream/aisdk/v5/output-helpers.ts
var DefaultStepResult = class {
  content;
  finishReason;
  usage;
  warnings;
  request;
  response;
  providerMetadata;
  constructor({
    content,
    finishReason,
    usage,
    warnings,
    request,
    response,
    providerMetadata
  }) {
    this.content = content;
    this.finishReason = finishReason;
    this.usage = usage;
    this.warnings = warnings;
    this.request = request;
    this.response = response;
    this.providerMetadata = providerMetadata;
  }
  get text() {
    return this.content.filter(part => part.type === "text").map(part => part.text).join("");
  }
  get reasoning() {
    return this.content.filter(part => part.type === "reasoning");
  }
  get reasoningText() {
    return this.reasoning.length === 0 ? void 0 : this.reasoning.map(part => part.text).join("");
  }
  get files() {
    return this.content.filter(part => part.type === "file").map(part => part.file);
  }
  get sources() {
    return this.content.filter(part => part.type === "source");
  }
  get toolCalls() {
    return this.content.filter(part => part.type === "tool-call");
  }
  get staticToolCalls() {
    return this.toolCalls.filter(toolCall => toolCall.dynamic === false);
  }
  get dynamicToolCalls() {
    return this.toolCalls.filter(toolCall => toolCall.dynamic === true);
  }
  get toolResults() {
    return this.content.filter(part => part.type === "tool-result");
  }
  get staticToolResults() {
    return this.toolResults.filter(toolResult => toolResult.dynamic === false);
  }
  get dynamicToolResults() {
    return this.toolResults.filter(toolResult => toolResult.dynamic === true);
  }
};
function reasoningDetailsFromMessages(messages) {
  return messages.flatMap(msg => {
    if (msg.content?.parts && Array.isArray(msg.content.parts)) {
      return msg.content.parts;
    }
    return [];
  }).filter(part => part.type === `reasoning`).flatMap(part => {
    return {
      type: "reasoning",
      text: part.reasoning,
      details: part.details
    };
  });
}
function transformSteps({
  steps
}) {
  return steps.map(step => {
    if (!step.response) throw new Error(`No step response found while transforming steps but one was expected.`);
    if (!step.request) throw new Error(`No step request found while transforming steps but one was expected.`);
    return new DefaultStepResult({
      content: step.content,
      warnings: step.warnings ?? [],
      providerMetadata: step.providerMetadata,
      finishReason: step.finishReason || "unknown",
      response: step.response,
      request: step.request,
      usage: step.usage || {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0
      }
    });
  });
}

// src/stream/aisdk/v5/transform.ts
function convertFullStreamChunkToMastra(value, ctx) {
  switch (value.type) {
    case "response-metadata":
      return {
        type: "response-metadata",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: value
      };
    case "text-start":
      return {
        type: "text-start",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: {
          id: value.id,
          providerMetadata: value.providerMetadata
        }
      };
    case "text-delta":
      if (value.delta) {
        return {
          type: "text-delta",
          runId: ctx.runId,
          from: "AGENT" /* AGENT */,
          payload: {
            id: value.id,
            providerMetadata: value.providerMetadata,
            text: value.delta
          }
        };
      }
      return;
    case "text-end":
      return {
        type: "text-end",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: value
      };
    case "reasoning-start":
      return {
        type: "reasoning-start",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: {
          id: value.id,
          providerMetadata: value.providerMetadata
        }
      };
    case "reasoning-delta":
      return {
        type: "reasoning-delta",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: {
          id: value.id,
          providerMetadata: value.providerMetadata,
          text: value.delta
        }
      };
    case "reasoning-end":
      return {
        type: "reasoning-end",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: {
          id: value.id,
          providerMetadata: value.providerMetadata
        }
      };
    case "source":
      return {
        type: "source",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: {
          id: value.id,
          sourceType: value.sourceType,
          title: value.title || "",
          mimeType: value.sourceType === "document" ? value.mediaType : void 0,
          filename: value.sourceType === "document" ? value.filename : void 0,
          url: value.sourceType === "url" ? value.url : void 0,
          providerMetadata: value.providerMetadata
        }
      };
    case "file":
      return {
        type: "file",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: {
          data: value.data,
          base64: typeof value.data === "string" ? value.data : void 0,
          mimeType: value.mediaType
        }
      };
    case "tool-call":
      return {
        type: "tool-call",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: {
          toolCallId: value.toolCallId,
          toolName: value.toolName,
          args: value.input ? JSON.parse(value.input) : void 0,
          providerExecuted: value.providerExecuted,
          providerMetadata: value.providerMetadata
        }
      };
    case "tool-result":
      return {
        type: "tool-result",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: {
          toolCallId: value.toolCallId,
          toolName: value.toolName,
          result: value.result,
          isError: value.isError,
          providerExecuted: value.providerExecuted,
          providerMetadata: value.providerMetadata
        }
      };
    case "tool-input-start":
      return {
        type: "tool-call-input-streaming-start",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: {
          toolCallId: value.id,
          toolName: value.toolName,
          providerExecuted: value.providerExecuted,
          providerMetadata: value.providerMetadata
        }
      };
    case "tool-input-delta":
      if (value.delta) {
        return {
          type: "tool-call-delta",
          runId: ctx.runId,
          from: "AGENT" /* AGENT */,
          payload: {
            argsTextDelta: value.delta,
            toolCallId: value.id,
            providerMetadata: value.providerMetadata
          }
        };
      }
      return;
    case "tool-input-end":
      return {
        type: "tool-call-input-streaming-end",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: {
          toolCallId: value.id,
          providerMetadata: value.providerMetadata
        }
      };
    case "finish":
      const {
        finishReason,
        usage,
        providerMetadata,
        messages,
        ...rest
      } = value;
      return {
        type: "finish",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: {
          stepResult: {
            reason: value.finishReason
          },
          output: {
            usage: {
              ...(value.usage ?? {}),
              totalTokens: value?.usage?.totalTokens ?? (value.usage?.inputTokens ?? 0) + (value.usage?.outputTokens ?? 0)
            }
          },
          metadata: {
            providerMetadata: value.providerMetadata
          },
          messages,
          ...rest
        }
      };
    case "error":
      return {
        type: "error",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: value
      };
    case "raw":
      return {
        type: "raw",
        runId: ctx.runId,
        from: "AGENT" /* AGENT */,
        payload: value.rawValue
      };
  }
  return;
}
function convertMastraChunkToAISDKv5({
  chunk,
  mode = "stream"
}) {
  switch (chunk.type) {
    case "start":
      return {
        type: "start"
      };
    case "step-start":
      const {
        messageId: _messageId,
        ...rest
      } = chunk.payload;
      return {
        type: "start-step",
        request: rest.request,
        warnings: rest.warnings || []
      };
    case "raw":
      return {
        type: "raw",
        rawValue: chunk.payload
      };
    case "finish":
      {
        return {
          type: "finish",
          finishReason: chunk.payload.stepResult.reason,
          totalUsage: chunk.payload.output.usage
        };
      }
    case "reasoning-start":
      return {
        type: "reasoning-start",
        id: chunk.payload.id,
        providerMetadata: chunk.payload.providerMetadata
      };
    case "reasoning-delta":
      return {
        type: "reasoning-delta",
        id: chunk.payload.id,
        text: chunk.payload.text,
        providerMetadata: chunk.payload.providerMetadata
      };
    case "reasoning-signature":
      throw new Error('AISDKv5 chunk type "reasoning-signature" not supported');
    // return {
    //   type: 'reasoning-signature' as const,
    //   id: chunk.payload.id,
    //   signature: chunk.payload.signature,
    // };
    case "redacted-reasoning":
      throw new Error('AISDKv5 chunk type "redacted-reasoning" not supported');
    // return {
    //   type: 'redacted-reasoning',
    //   id: chunk.payload.id,
    //   data: chunk.payload.data,
    // };
    case "reasoning-end":
      return {
        type: "reasoning-end",
        id: chunk.payload.id,
        providerMetadata: chunk.payload.providerMetadata
      };
    case "source":
      return {
        type: "source",
        id: chunk.payload.id,
        sourceType: chunk.payload.sourceType,
        filename: chunk.payload.filename,
        mediaType: chunk.payload.mimeType,
        title: chunk.payload.title,
        url: chunk.payload.url,
        providerMetadata: chunk.payload.providerMetadata
      };
    case "file":
      if (mode === "generate") {
        return {
          type: "file",
          file: new DefaultGeneratedFile({
            data: chunk.payload.data,
            mediaType: chunk.payload.mimeType
          })
        };
      }
      return {
        type: "file",
        file: new DefaultGeneratedFileWithType({
          data: chunk.payload.data,
          mediaType: chunk.payload.mimeType
        })
      };
    case "tool-call":
      return {
        type: "tool-call",
        toolCallId: chunk.payload.toolCallId,
        providerMetadata: chunk.payload.providerMetadata,
        providerExecuted: chunk.payload.providerExecuted,
        toolName: chunk.payload.toolName,
        input: chunk.payload.args
      };
    case "tool-call-input-streaming-start":
      return {
        type: "tool-input-start",
        id: chunk.payload.toolCallId,
        toolName: chunk.payload.toolName,
        dynamic: !!chunk.payload.dynamic,
        providerMetadata: chunk.payload.providerMetadata,
        providerExecuted: chunk.payload.providerExecuted
      };
    case "tool-call-input-streaming-end":
      return {
        type: "tool-input-end",
        id: chunk.payload.toolCallId,
        providerMetadata: chunk.payload.providerMetadata
      };
    case "tool-call-delta":
      return {
        type: "tool-input-delta",
        id: chunk.payload.toolCallId,
        delta: chunk.payload.argsTextDelta,
        providerMetadata: chunk.payload.providerMetadata
      };
    case "step-finish":
      {
        const {
          request: _request,
          providerMetadata,
          ...rest2
        } = chunk.payload.metadata;
        return {
          type: "finish-step",
          response: rest2,
          usage: chunk.payload.output.usage,
          // ?
          finishReason: chunk.payload.stepResult.reason,
          providerMetadata
        };
      }
    case "text-delta":
      return {
        type: "text-delta",
        id: chunk.payload.id,
        text: chunk.payload.text,
        providerMetadata: chunk.payload.providerMetadata
      };
    case "text-end":
      return {
        type: "text-end",
        id: chunk.payload.id,
        providerMetadata: chunk.payload.providerMetadata
      };
    case "text-start":
      return {
        type: "text-start",
        id: chunk.payload.id,
        providerMetadata: chunk.payload.providerMetadata
      };
    case "tool-result":
      return {
        type: "tool-result",
        input: chunk.payload.args,
        toolCallId: chunk.payload.toolCallId,
        providerExecuted: chunk.payload.providerExecuted,
        toolName: chunk.payload.toolName,
        output: chunk.payload.result
        // providerMetadata: chunk.payload.providerMetadata, // AI v5 types don't show this?
      };
    case "tool-error":
      return {
        type: "tool-error",
        error: chunk.payload.error,
        input: chunk.payload.args,
        toolCallId: chunk.payload.toolCallId,
        providerExecuted: chunk.payload.providerExecuted,
        toolName: chunk.payload.toolName
        // providerMetadata: chunk.payload.providerMetadata, // AI v5 types don't show this?
      };
    case "abort":
      return {
        type: "abort"
      };
    case "error":
      return {
        type: "error",
        error: chunk.payload.error
      };
    case "object":
      return {
        type: "object",
        object: chunk.object
      };
    default:
      if (chunk.type && chunk.payload) {
        return {
          type: chunk.type,
          ...(chunk.payload || {})
        };
      }
      return;
  }
}

// src/stream/aisdk/v5/output.ts
var AISDKV5OutputStream = class {
  #modelOutput;
  #options;
  #messageList;
  constructor({
    modelOutput,
    options,
    messageList
  }) {
    this.#modelOutput = modelOutput;
    this.#options = options;
    this.#messageList = messageList;
  }
  toTextStreamResponse(init) {
    return createTextStreamResponse({
      textStream: this.#modelOutput.textStream,
      ...init
    });
  }
  toUIMessageStreamResponse({
    // @ts-ignore
    generateMessageId,
    originalMessages,
    sendFinish,
    sendReasoning,
    sendSources,
    onError,
    sendStart,
    messageMetadata,
    onFinish,
    ...init
  } = {}) {
    return createUIMessageStreamResponse({
      stream: this.toUIMessageStream({
        // @ts-ignore
        generateMessageId,
        originalMessages,
        sendFinish,
        sendReasoning,
        sendSources,
        onError,
        sendStart,
        messageMetadata,
        onFinish
      }),
      ...init
    });
  }
  toUIMessageStream({
    // @ts-ignore
    generateMessageId,
    originalMessages,
    sendFinish = true,
    sendReasoning = true,
    sendSources = false,
    onError = getErrorMessage,
    sendStart = true,
    messageMetadata,
    onFinish
  } = {}) {
    const responseMessageId = generateMessageId != null ? getResponseUIMessageId({
      originalMessages,
      responseMessageId: generateMessageId
    }) : void 0;
    return createUIMessageStream({
      onError,
      onFinish,
      generateId: () => responseMessageId ?? generateMessageId?.(),
      execute: async ({
        writer
      }) => {
        for await (const part of this.fullStream) {
          const messageMetadataValue = messageMetadata?.({
            part
          });
          const partType = part.type;
          const transformedChunk = convertFullStreamChunkToUIMessageStream({
            part,
            sendReasoning,
            messageMetadataValue,
            sendSources,
            sendStart,
            sendFinish,
            responseMessageId,
            onError
          });
          if (transformedChunk) {
            writer.write(transformedChunk);
          }
          if (messageMetadataValue != null && partType !== "start" && partType !== "finish") {
            writer.write({
              type: "message-metadata",
              messageMetadata: messageMetadataValue
            });
          }
        }
      }
    });
  }
  async consumeStream(options) {
    try {
      await consumeStream({
        stream: this.fullStream.pipeThrough(new TransformStream$1({
          transform(chunk, controller) {
            controller.enqueue(chunk);
          }
        })),
        onError: options?.onError
      });
    } catch (error) {
      console.log("consumeStream error", error);
      options?.onError?.(error);
    }
  }
  get sources() {
    return this.#modelOutput.sources.then(sources => sources.map(source => {
      return convertMastraChunkToAISDKv5({
        chunk: source
      });
    }));
  }
  get files() {
    return this.#modelOutput.files.then(files => files.map(file => {
      if (file.type === "file") {
        return convertMastraChunkToAISDKv5({
          chunk: file
        })?.file;
      }
      return;
    }).filter(Boolean));
  }
  get text() {
    return this.#modelOutput.text;
  }
  /**
   * Stream of valid JSON chunks. The final JSON result is validated against the output schema when the stream ends.
   */
  get objectStream() {
    return this.#modelOutput.objectStream;
  }
  get generateTextFiles() {
    return this.#modelOutput.files.then(files => files.map(file => {
      if (file.type === "file") {
        return convertMastraChunkToAISDKv5({
          chunk: file,
          mode: "generate"
        })?.file;
      }
      return;
    }).filter(Boolean));
  }
  get toolCalls() {
    return this.#modelOutput.toolCalls.then(toolCalls => toolCalls.map(toolCall => {
      return convertMastraChunkToAISDKv5({
        chunk: toolCall
      });
    }));
  }
  get toolResults() {
    return this.#modelOutput.toolResults.then(toolResults => toolResults.map(toolResult => {
      return convertMastraChunkToAISDKv5({
        chunk: toolResult
      });
    }));
  }
  get reasoningText() {
    return this.#modelOutput.reasoningText;
  }
  get reasoning() {
    return this.#modelOutput.reasoningDetails;
  }
  get response() {
    return this.#modelOutput.response.then(response => ({
      ...response
    }));
  }
  get steps() {
    return this.#modelOutput.steps.then(steps => transformSteps({
      steps
    }));
  }
  get generateTextSteps() {
    return this.#modelOutput.steps.then(steps => transformSteps({
      steps
    }));
  }
  get content() {
    return this.#messageList.get.response.aiV5.modelContent();
  }
  /**
   * Stream of only text content, compatible with streaming text responses.
   */
  get textStream() {
    return this.#modelOutput.textStream;
  }
  /**
   * Stream of individual array elements when output schema is an array type.
   */
  get elementStream() {
    return this.#modelOutput.elementStream;
  }
  /**
   * Stream of all chunks in AI SDK v5 format.
   */
  get fullStream() {
    let startEvent;
    let hasStarted = false;
    const responseFormat = getResponseFormat(this.#options.output);
    const fullStream = this.#modelOutput.fullStream;
    const transformedStream = fullStream.pipeThrough(new TransformStream$1({
      transform(chunk, controller) {
        if (responseFormat?.type === "json" && chunk.type === "object") {
          controller.enqueue(chunk);
          return;
        }
        if (chunk.type === "step-start" && !startEvent) {
          startEvent = convertMastraChunkToAISDKv5({
            chunk
          });
          return;
        } else if (chunk.type !== "error") {
          hasStarted = true;
        }
        if (startEvent && hasStarted) {
          controller.enqueue(startEvent);
          startEvent = void 0;
        }
        if ("payload" in chunk) {
          const transformedChunk = convertMastraChunkToAISDKv5({
            chunk
          });
          if (transformedChunk) {
            controller.enqueue(transformedChunk);
          }
        }
      }
    }));
    return transformedStream;
  }
  async getFullOutput() {
    await this.consumeStream();
    const object = await this.object;
    const fullOutput = {
      text: await this.#modelOutput.text,
      usage: await this.#modelOutput.usage,
      steps: await this.generateTextSteps,
      finishReason: await this.#modelOutput.finishReason,
      warnings: await this.#modelOutput.warnings,
      providerMetadata: await this.#modelOutput.providerMetadata,
      request: await this.#modelOutput.request,
      reasoning: await this.reasoning,
      reasoningText: await this.reasoningText,
      toolCalls: await this.toolCalls,
      toolResults: await this.toolResults,
      sources: await this.sources,
      files: await this.generateTextFiles,
      response: await this.response,
      content: this.content,
      totalUsage: await this.#modelOutput.totalUsage,
      error: this.error,
      tripwire: this.#modelOutput.tripwire,
      tripwireReason: this.#modelOutput.tripwireReason,
      ...(object ? {
        object
      } : {})
    };
    fullOutput.response.messages = this.#modelOutput.messageList.get.response.aiV5.model();
    return fullOutput;
  }
  get tripwire() {
    return this.#modelOutput.tripwire;
  }
  get tripwireReason() {
    return this.#modelOutput.tripwireReason;
  }
  get error() {
    return this.#modelOutput.error;
  }
  get object() {
    return this.#modelOutput.object;
  }
};
var BaseFormatHandler = class {
  /**
   * The user-provided schema to validate the final result against.
   */
  schema;
  /**
   * Whether to validate partial chunks. @planned
   */
  validatePartialChunks = false;
  /**
   * Partial schema for validating partial chunks as they are streamed. @planned
   */
  partialSchema;
  constructor(schema, options = {}) {
    if (!schema) {
      this.schema = void 0;
    } else {
      this.schema = asSchema(schema);
    }
    if (options.validatePartialChunks) {
      if (schema !== void 0 && "partial" in schema && typeof schema.partial === "function") {
        this.validatePartialChunks = true;
        this.partialSchema = schema.partial();
      }
    }
  }
};
var ObjectFormatHandler = class extends BaseFormatHandler {
  type = "object";
  async processPartialChunk({
    accumulatedText,
    previousObject
  }) {
    const {
      value: currentObjectJson,
      state
    } = await parsePartialJson(accumulatedText);
    if (this.validatePartialChunks && this.partialSchema) {
      const result = this.partialSchema?.safeParse(currentObjectJson);
      if (result.success && result.data && result.data !== void 0 && !isDeepEqualData(previousObject, result.data)) {
        return {
          shouldEmit: true,
          emitValue: result.data,
          newPreviousResult: result.data
        };
      }
      return {
        shouldEmit: false
      };
    }
    if (currentObjectJson !== void 0 && currentObjectJson !== null && typeof currentObjectJson === "object" && !isDeepEqualData(previousObject, currentObjectJson)) {
      return {
        shouldEmit: ["successful-parse", "repaired-parse"].includes(state),
        emitValue: currentObjectJson,
        newPreviousResult: currentObjectJson
      };
    }
    return {
      shouldEmit: false
    };
  }
  async validateAndTransformFinal(finalValue) {
    if (!finalValue) {
      return {
        success: false,
        error: new Error("No object generated: could not parse the response.")
      };
    }
    if (!this.schema) {
      return {
        success: true,
        value: finalValue
      };
    }
    try {
      const result = await safeValidateTypes({
        value: finalValue,
        schema: this.schema
      });
      if (result.success) {
        return {
          success: true,
          value: result.value
        };
      } else {
        return {
          success: false,
          error: result.error ?? new Error("Validation failed", {
            cause: result.error
          })
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Validation failed", {
          cause: error
        })
      };
    }
  }
};
var ArrayFormatHandler = class extends BaseFormatHandler {
  type = "array";
  /** Previously filtered array to track changes */
  textPreviousFilteredArray = [];
  /** Whether we've emitted the initial empty array */
  hasEmittedInitialArray = false;
  async processPartialChunk({
    accumulatedText,
    previousObject
  }) {
    const {
      value: currentObjectJson,
      state: parseState
    } = await parsePartialJson(accumulatedText);
    if (currentObjectJson !== void 0 && !isDeepEqualData(previousObject, currentObjectJson)) {
      const rawElements = currentObjectJson?.elements || [];
      const filteredElements = [];
      for (let i = 0; i < rawElements.length; i++) {
        const element = rawElements[i];
        if (i === rawElements.length - 1 && parseState !== "successful-parse") {
          if (element && typeof element === "object" && Object.keys(element).length > 0) {
            filteredElements.push(element);
          }
        } else {
          if (element && typeof element === "object" && Object.keys(element).length > 0) {
            filteredElements.push(element);
          }
        }
      }
      if (!this.hasEmittedInitialArray) {
        this.hasEmittedInitialArray = true;
        if (filteredElements.length === 0) {
          this.textPreviousFilteredArray = [];
          return {
            shouldEmit: true,
            emitValue: [],
            newPreviousResult: currentObjectJson
          };
        }
      }
      if (!isDeepEqualData(this.textPreviousFilteredArray, filteredElements)) {
        this.textPreviousFilteredArray = [...filteredElements];
        return {
          shouldEmit: true,
          emitValue: filteredElements,
          newPreviousResult: currentObjectJson
        };
      }
    }
    return {
      shouldEmit: false
    };
  }
  async validateAndTransformFinal(_finalValue) {
    const resultValue = this.textPreviousFilteredArray;
    if (!resultValue) {
      return {
        success: false,
        error: new Error("No object generated: could not parse the response.")
      };
    }
    if (!this.schema) {
      return {
        success: true,
        value: resultValue
      };
    }
    try {
      const result = await safeValidateTypes({
        value: resultValue,
        schema: this.schema
      });
      if (result.success) {
        return {
          success: true,
          value: result.value
        };
      } else {
        return {
          success: false,
          error: result.error ?? new Error("Validation failed", {
            cause: result.error
          })
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Validation failed", {
          cause: error
        })
      };
    }
  }
};
var EnumFormatHandler = class extends BaseFormatHandler {
  type = "enum";
  /** Previously emitted enum result to avoid duplicate emissions */
  textPreviousEnumResult;
  /**
   * Finds the best matching enum value for a partial result string.
   * If multiple values match, returns the partial string. If only one matches, returns that value.
   * @param partialResult - Partial enum string from streaming
   * @returns Best matching enum value or undefined if no matches
   */
  findBestEnumMatch(partialResult) {
    if (!this.schema?.jsonSchema?.enum) {
      return void 0;
    }
    const enumValues = this.schema.jsonSchema.enum;
    const possibleEnumValues = enumValues.filter(value => typeof value === "string").filter(enumValue => enumValue.startsWith(partialResult));
    if (possibleEnumValues.length === 0) {
      return void 0;
    }
    const firstMatch = possibleEnumValues[0];
    return possibleEnumValues.length === 1 && firstMatch !== void 0 ? firstMatch : partialResult;
  }
  async processPartialChunk({
    accumulatedText,
    previousObject
  }) {
    const {
      value: currentObjectJson
    } = await parsePartialJson(accumulatedText);
    if (currentObjectJson !== void 0 && currentObjectJson !== null && typeof currentObjectJson === "object" && !Array.isArray(currentObjectJson) && "result" in currentObjectJson && typeof currentObjectJson.result === "string" && !isDeepEqualData(previousObject, currentObjectJson)) {
      const partialResult = currentObjectJson.result;
      const bestMatch = this.findBestEnumMatch(partialResult);
      if (partialResult.length > 0 && bestMatch && bestMatch !== this.textPreviousEnumResult) {
        this.textPreviousEnumResult = bestMatch;
        return {
          shouldEmit: true,
          emitValue: bestMatch,
          newPreviousResult: currentObjectJson
        };
      }
    }
    return {
      shouldEmit: false
    };
  }
  async validateAndTransformFinal(finalValue) {
    if (!finalValue || typeof finalValue !== "object" || typeof finalValue.result !== "string") {
      return {
        success: false,
        error: new Error("Invalid enum format: expected object with result property")
      };
    }
    if (!this.schema) {
      return {
        success: true,
        value: finalValue.result
      };
    }
    try {
      const result = await safeValidateTypes({
        value: finalValue.result,
        schema: this.schema
      });
      if (result.success) {
        return {
          success: true,
          value: result.value
        };
      } else {
        return {
          success: false,
          error: result.error ?? new Error("Enum validation failed")
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error("Validation failed")
      };
    }
  }
};
function createOutputHandler({
  schema,
  transformedSchema
}) {
  switch (transformedSchema?.outputFormat) {
    case "array":
      return new ArrayFormatHandler(schema);
    case "enum":
      return new EnumFormatHandler(schema);
    case "object":
    default:
      return new ObjectFormatHandler(schema);
  }
}
function createObjectStreamTransformer({
  schema,
  onFinish
}) {
  const responseFormat = getResponseFormat(schema);
  const transformedSchema = getTransformedSchema(schema);
  const handler = createOutputHandler({
    transformedSchema,
    schema
  });
  let accumulatedText = "";
  let previousObject = void 0;
  let finishReason;
  let currentRunId;
  return new TransformStream$1({
    async transform(chunk, controller) {
      if (chunk.runId) {
        currentRunId = chunk.runId;
      }
      if (chunk.type === "finish") {
        finishReason = chunk.payload.stepResult.reason;
        controller.enqueue(chunk);
        return;
      }
      if (responseFormat?.type !== "json") {
        controller.enqueue(chunk);
        return;
      }
      if (chunk.type === "text-delta" && typeof chunk.payload?.text === "string") {
        accumulatedText += chunk.payload.text;
        const result = await handler.processPartialChunk({
          accumulatedText,
          previousObject
        });
        if (result.shouldEmit) {
          previousObject = result.newPreviousResult ?? previousObject;
          controller.enqueue({
            from: chunk.from,
            runId: chunk.runId,
            type: "object",
            object: result.emitValue
            // TODO: handle partial runtime type validation of json chunks
          });
        }
      }
      controller.enqueue(chunk);
    },
    async flush(controller) {
      if (responseFormat?.type !== "json") {
        return;
      }
      if (["tool-calls"].includes(finishReason ?? "")) {
        onFinish(void 0);
        return;
      }
      const finalResult = await handler.validateAndTransformFinal(previousObject);
      if (!finalResult.success) {
        controller.enqueue({
          from: "AGENT" /* AGENT */,
          runId: currentRunId ?? "",
          type: "error",
          payload: {
            error: finalResult.error ?? new Error("Validation failed")
          }
        });
        return;
      }
      onFinish(finalResult.value);
    }
  });
}
function createJsonTextStreamTransformer(schema) {
  let previousArrayLength = 0;
  let hasStartedArray = false;
  let chunkCount = 0;
  const outputSchema = getTransformedSchema(schema);
  return new TransformStream$1({
    transform(chunk, controller) {
      if (chunk.type !== "object" || !chunk.object) {
        return;
      }
      if (outputSchema?.outputFormat === "array") {
        chunkCount++;
        if (chunkCount === 1) {
          if (chunk.object.length > 0) {
            controller.enqueue(JSON.stringify(chunk.object));
            previousArrayLength = chunk.object.length;
            hasStartedArray = true;
            return;
          }
        }
        if (!hasStartedArray) {
          controller.enqueue("[");
          hasStartedArray = true;
        }
        for (let i = previousArrayLength; i < chunk.object.length; i++) {
          const elementJson = JSON.stringify(chunk.object[i]);
          if (i > 0) {
            controller.enqueue("," + elementJson);
          } else {
            controller.enqueue(elementJson);
          }
        }
        previousArrayLength = chunk.object.length;
      } else {
        controller.enqueue(JSON.stringify(chunk.object));
      }
    },
    flush(controller) {
      if (hasStartedArray && outputSchema?.outputFormat === "array" && chunkCount > 1) {
        controller.enqueue("]");
      }
    }
  });
}

// src/stream/base/output.ts
var MastraModelOutput = class extends MastraBase {
  #aisdkv5;
  #error;
  #baseStream;
  #bufferedSteps = [];
  #bufferedReasoningDetails = {};
  #bufferedByStep = {
    text: "",
    reasoning: "",
    sources: [],
    files: [],
    toolCalls: [],
    toolResults: [],
    msgCount: 0
  };
  #bufferedText = [];
  #bufferedTextChunks = {};
  #bufferedSources = [];
  #bufferedReasoning = [];
  #bufferedFiles = [];
  #toolCallArgsDeltas = {};
  #toolCallDeltaIdNameMap = {};
  #toolCalls = [];
  // TODO: add type
  #toolResults = [];
  // TODO: add type
  #warnings = [];
  #finishReason;
  #request;
  #usageCount = {};
  #tripwire = false;
  #tripwireReason = "";
  #delayedPromises = {
    object: new DelayedPromise(),
    finishReason: new DelayedPromise(),
    usage: new DelayedPromise(),
    warnings: new DelayedPromise(),
    providerMetadata: new DelayedPromise(),
    response: new DelayedPromise(),
    // TODO: add type
    request: new DelayedPromise(),
    // TODO: add type
    text: new DelayedPromise(),
    reasoning: new DelayedPromise(),
    reasoningText: new DelayedPromise(),
    sources: new DelayedPromise(),
    // TODO: add type
    files: new DelayedPromise(),
    // TODO: add type
    toolCalls: new DelayedPromise(),
    // TODO: add type
    toolResults: new DelayedPromise(),
    // TODO: add type
    steps: new DelayedPromise(),
    totalUsage: new DelayedPromise(),
    content: new DelayedPromise(),
    reasoningDetails: new DelayedPromise()
  };
  #streamConsumed = false;
  /**
   * Unique identifier for this execution run.
   */
  runId;
  #options;
  /**
   * The processor runner for this stream.
   */
  processorRunner;
  /**
   * The message list for this stream.
   */
  messageList;
  constructor({
    stream,
    options,
    model: _model,
    messageList
  }) {
    super({
      component: "LLM",
      name: "MastraModelOutput"
    });
    this.#options = options;
    this.runId = options.runId;
    if (options.outputProcessors?.length) {
      this.processorRunner = new ProcessorRunner({
        inputProcessors: [],
        outputProcessors: options.outputProcessors,
        logger: this.logger,
        agentName: "MastraModelOutput"
      });
    }
    this.messageList = messageList;
    const self = this;
    this.#baseStream = stream.pipeThrough(new TransformStream$1({
      transform: async (chunk, controller) => {
        switch (chunk.type) {
          case "source":
            self.#bufferedSources.push(chunk);
            self.#bufferedByStep.sources.push(chunk);
            break;
          case "text-delta":
            self.#bufferedText.push(chunk.payload.text);
            self.#bufferedByStep.text += chunk.payload.text;
            if (chunk.payload.id) {
              const ary = self.#bufferedTextChunks[chunk.payload.id] ?? [];
              ary.push(chunk.payload.text);
              self.#bufferedTextChunks[chunk.payload.id] = ary;
            }
            break;
          case "tool-call-input-streaming-start":
            self.#toolCallDeltaIdNameMap[chunk.payload.toolCallId] = chunk.payload.toolName;
            break;
          case "tool-call-delta":
            if (!self.#toolCallArgsDeltas[chunk.payload.toolCallId]) {
              self.#toolCallArgsDeltas[chunk.payload.toolCallId] = [];
            }
            self.#toolCallArgsDeltas?.[chunk.payload.toolCallId]?.push(chunk.payload.argsTextDelta);
            chunk.payload.toolName ||= self.#toolCallDeltaIdNameMap[chunk.payload.toolCallId];
            break;
          case "file":
            self.#bufferedFiles.push(chunk);
            self.#bufferedByStep.files.push(chunk);
            break;
          case "reasoning-start":
            self.#bufferedReasoningDetails[chunk.payload.id] = {
              type: "reasoning",
              text: "",
              providerMetadata: chunk.payload.providerMetadata || {}
            };
            break;
          case "reasoning-delta":
            {
              self.#bufferedReasoning.push(chunk.payload.text);
              self.#bufferedByStep.reasoning += chunk.payload.text;
              const bufferedReasoning = self.#bufferedReasoningDetails[chunk.payload.id];
              if (bufferedReasoning) {
                bufferedReasoning.text += chunk.payload.text;
                if (chunk.payload.providerMetadata) {
                  bufferedReasoning.providerMetadata = chunk.payload.providerMetadata;
                }
              }
              break;
            }
          case "reasoning-end":
            {
              const bufferedReasoning = self.#bufferedReasoningDetails[chunk.payload.id];
              if (chunk.payload.providerMetadata && bufferedReasoning) {
                bufferedReasoning.providerMetadata = chunk.payload.providerMetadata;
              }
              break;
            }
          case "tool-call":
            self.#toolCalls.push(chunk);
            self.#bufferedByStep.toolCalls.push(chunk);
            if (chunk.payload?.output?.from === "AGENT" && chunk.payload?.output?.type === "finish") {
              const finishPayload = chunk.payload?.output.payload;
              self.updateUsageCount(finishPayload.usage);
            }
            break;
          case "tool-result":
            self.#toolResults.push(chunk);
            self.#bufferedByStep.toolResults.push(chunk);
            break;
          case "step-finish":
            {
              self.updateUsageCount(chunk.payload.output.usage);
              self.#warnings = chunk.payload.stepResult.warnings || [];
              if (chunk.payload.metadata.request) {
                self.#request = chunk.payload.metadata.request;
              }
              const reasoningDetails = reasoningDetailsFromMessages(chunk.payload.messages.all.slice(self.#bufferedByStep.msgCount));
              const {
                providerMetadata,
                request,
                ...otherMetadata
              } = chunk.payload.metadata;
              const stepResult = {
                stepType: self.#bufferedSteps.length === 0 ? "initial" : "tool-result",
                text: self.#bufferedByStep.text,
                reasoning: self.#bufferedByStep.reasoning || void 0,
                sources: self.#bufferedByStep.sources,
                files: self.#bufferedByStep.files,
                toolCalls: self.#bufferedByStep.toolCalls,
                toolResults: self.#bufferedByStep.toolResults,
                warnings: self.#warnings,
                reasoningDetails,
                providerMetadata,
                experimental_providerMetadata: providerMetadata,
                isContinued: chunk.payload.stepResult.isContinued,
                logprobs: chunk.payload.stepResult.logprobs,
                finishReason: chunk.payload.stepResult.reason,
                response: {
                  ...otherMetadata,
                  messages: chunk.payload.messages.nonUser
                },
                request,
                usage: chunk.payload.output.usage,
                // TODO: need to be able to pass a step id into this fn to get the content for a specific step id
                content: messageList.get.response.aiV5.stepContent()
              };
              await options?.onStepFinish?.(stepResult);
              self.#bufferedSteps.push(stepResult);
              self.#bufferedByStep = {
                text: "",
                reasoning: "",
                sources: [],
                files: [],
                toolCalls: [],
                toolResults: [],
                msgCount: chunk.payload.messages.all.length
              };
              break;
            }
          case "finish":
            if (chunk.payload.stepResult.reason) {
              self.#finishReason = chunk.payload.stepResult.reason;
            }
            let response = {};
            if (chunk.payload.metadata) {
              const {
                providerMetadata,
                request,
                ...otherMetadata
              } = chunk.payload.metadata;
              response = {
                ...otherMetadata,
                messages: messageList.get.response.aiV5.model()
              };
            }
            this.populateUsageCount(chunk.payload.output.usage);
            chunk.payload.output.usage = self.#usageCount;
            try {
              if (self.processorRunner) {
                await self.processorRunner.runOutputProcessors(self.messageList);
                const outputText = self.messageList.get.response.aiV4.core().map(m => MessageList.coreContentToString(m.content)).join("\n");
                const messages = self.messageList.get.response.v2();
                const messagesWithStructuredData = messages.filter(msg => msg.content.metadata && msg.content.metadata.structuredOutput);
                if (messagesWithStructuredData[0] && messagesWithStructuredData[0].content.metadata?.structuredOutput) {
                  const structuredOutput = messagesWithStructuredData[0].content.metadata.structuredOutput;
                  self.#delayedPromises.object.resolve(structuredOutput);
                } else if (!self.#options.output) {
                  self.#delayedPromises.object.resolve(void 0);
                }
                self.#delayedPromises.text.resolve(outputText);
                self.#delayedPromises.finishReason.resolve(self.#finishReason);
              } else {
                self.#delayedPromises.text.resolve(self.#bufferedText.join(""));
                self.#delayedPromises.finishReason.resolve(self.#finishReason);
                if (!self.#options.output) {
                  self.#delayedPromises.object.resolve(void 0);
                }
              }
            } catch (error2) {
              if (error2 instanceof TripWire) {
                self.#tripwire = true;
                self.#tripwireReason = error2.message;
                self.#delayedPromises.finishReason.resolve("other");
              } else {
                self.#error = error2 instanceof Error ? error2.message : String(error2);
                self.#delayedPromises.finishReason.resolve("error");
              }
              self.#delayedPromises.object.resolve(void 0);
            }
            self.#delayedPromises.usage.resolve(self.#usageCount);
            self.#delayedPromises.warnings.resolve(self.#warnings);
            self.#delayedPromises.providerMetadata.resolve(chunk.payload.metadata?.providerMetadata);
            self.#delayedPromises.response.resolve(response);
            self.#delayedPromises.request.resolve(self.#request || {});
            self.#delayedPromises.text.resolve(self.#bufferedText.join(""));
            self.#delayedPromises.reasoning.resolve(self.#bufferedReasoning.join(""));
            const reasoningText = self.#bufferedReasoning.length > 0 ? self.#bufferedReasoning.join("") : void 0;
            self.#delayedPromises.reasoningText.resolve(reasoningText);
            self.#delayedPromises.sources.resolve(self.#bufferedSources);
            self.#delayedPromises.files.resolve(self.#bufferedFiles);
            self.#delayedPromises.toolCalls.resolve(self.#toolCalls);
            self.#delayedPromises.toolResults.resolve(self.#toolResults);
            self.#delayedPromises.steps.resolve(self.#bufferedSteps);
            self.#delayedPromises.totalUsage.resolve(self.#getTotalUsage());
            self.#delayedPromises.content.resolve(messageList.get.response.aiV5.stepContent());
            self.#delayedPromises.reasoningDetails.resolve(Object.values(self.#bufferedReasoningDetails || {}));
            const baseFinishStep = self.#bufferedSteps[self.#bufferedSteps.length - 1];
            if (baseFinishStep) {
              const onFinishPayload = {
                text: baseFinishStep.text,
                warnings: baseFinishStep.warnings ?? [],
                finishReason: chunk.payload.stepResult.reason,
                // TODO: we should add handling for step IDs in message list so you can retrieve step content by step id. And on finish should the content here be from all steps?
                content: messageList.get.response.aiV5.stepContent(),
                request: await self.request,
                error: self.error,
                reasoning: await self.aisdk.v5.reasoning,
                reasoningText: await self.aisdk.v5.reasoningText,
                sources: await self.aisdk.v5.sources,
                files: await self.aisdk.v5.files,
                steps: transformSteps({
                  steps: self.#bufferedSteps
                }),
                response: {
                  ...(await self.response),
                  messages: messageList.get.response.aiV5.model()
                },
                usage: chunk.payload.output.usage,
                totalUsage: self.#getTotalUsage(),
                toolCalls: await self.aisdk.v5.toolCalls,
                toolResults: await self.aisdk.v5.toolResults,
                staticToolCalls: (await self.aisdk.v5.toolCalls).filter(toolCall => toolCall.dynamic === false),
                staticToolResults: (await self.aisdk.v5.toolResults).filter(toolResult => toolResult.dynamic === false),
                dynamicToolCalls: (await self.aisdk.v5.toolCalls).filter(toolCall => toolCall.dynamic === true),
                dynamicToolResults: (await self.aisdk.v5.toolResults).filter(toolResult => toolResult.dynamic === true)
              };
              await options?.onFinish?.(onFinishPayload);
            }
            if (options?.rootSpan) {
              options.rootSpan.setAttributes({
                ...(baseFinishStep?.usage?.reasoningTokens ? {
                  "stream.usage.reasoningTokens": baseFinishStep.usage.reasoningTokens
                } : {}),
                ...(baseFinishStep?.usage?.totalTokens ? {
                  "stream.usage.totalTokens": baseFinishStep.usage.totalTokens
                } : {}),
                ...(baseFinishStep?.usage?.inputTokens ? {
                  "stream.usage.inputTokens": baseFinishStep.usage.inputTokens
                } : {}),
                ...(baseFinishStep?.usage?.outputTokens ? {
                  "stream.usage.outputTokens": baseFinishStep.usage.outputTokens
                } : {}),
                ...(baseFinishStep?.usage?.cachedInputTokens ? {
                  "stream.usage.cachedInputTokens": baseFinishStep.usage.cachedInputTokens
                } : {}),
                ...(baseFinishStep?.providerMetadata ? {
                  "stream.response.providerMetadata": JSON.stringify(baseFinishStep?.providerMetadata)
                } : {}),
                ...(baseFinishStep?.finishReason ? {
                  "stream.response.finishReason": baseFinishStep?.finishReason
                } : {}),
                ...(options?.telemetry_settings?.recordOutputs !== false ? {
                  "stream.response.text": baseFinishStep?.text
                } : {}),
                ...(baseFinishStep?.toolCalls && options?.telemetry_settings?.recordOutputs !== false ? {
                  "stream.response.toolCalls": JSON.stringify(baseFinishStep?.toolCalls?.map(chunk2 => {
                    return {
                      type: "tool-call",
                      toolCallId: chunk2.payload.toolCallId,
                      args: chunk2.payload.args,
                      toolName: chunk2.payload.toolName
                    };
                  }))
                } : {})
              });
              options.rootSpan.end();
            }
            break;
          case "error":
            self.#error = chunk.payload.error;
            const error = typeof self.#error === "object" ? new Error(self.#error.message) : new Error(String(self.#error));
            Object.values(self.#delayedPromises).forEach(promise => promise.reject(error));
            break;
        }
        controller.enqueue(chunk);
      }
    }));
    this.#aisdkv5 = new AISDKV5OutputStream({
      modelOutput: this,
      messageList,
      options: {
        toolCallStreaming: options?.toolCallStreaming,
        output: options?.output
      }
    });
  }
  #getDelayedPromise(promise) {
    if (!this.#streamConsumed) {
      void this.consumeStream();
    }
    return promise.promise;
  }
  /**
   * Resolves to the complete text response after streaming completes.
   */
  get text() {
    return this.#getDelayedPromise(this.#delayedPromises.text);
  }
  /**
   * Resolves to complete reasoning text for models that support reasoning.
   */
  get reasoning() {
    return this.#getDelayedPromise(this.#delayedPromises.reasoning);
  }
  get reasoningText() {
    return this.#getDelayedPromise(this.#delayedPromises.reasoningText);
  }
  get reasoningDetails() {
    return this.#getDelayedPromise(this.#delayedPromises.reasoningDetails);
  }
  get sources() {
    return this.#getDelayedPromise(this.#delayedPromises.sources);
  }
  get files() {
    return this.#getDelayedPromise(this.#delayedPromises.files);
  }
  get steps() {
    return this.#getDelayedPromise(this.#delayedPromises.steps);
  }
  teeStream() {
    const [stream1, stream2] = this.#baseStream.tee();
    this.#baseStream = stream2;
    return stream1;
  }
  /**
   * Stream of all chunks. Provides complete control over stream processing.
   */
  get fullStream() {
    const self = this;
    let fullStream = this.teeStream();
    const processorStates = /* @__PURE__ */new Map();
    return fullStream.pipeThrough(new TransformStream$1({
      async transform(chunk, controller) {
        if (self.processorRunner) {
          const {
            part: processedPart,
            blocked,
            reason
          } = await self.processorRunner.processPart(chunk, processorStates);
          if (blocked) {
            controller.enqueue({
              type: "tripwire",
              payload: {
                tripwireReason: reason || "Output processor blocked content"
              }
            });
            controller.terminate();
            return;
          }
          if (processedPart) {
            controller.enqueue(processedPart);
          }
        } else {
          controller.enqueue(chunk);
        }
      }
    })).pipeThrough(createObjectStreamTransformer({
      schema: self.#options.output,
      onFinish: data => self.#delayedPromises.object.resolve(data)
    })).pipeThrough(new TransformStream$1({
      transform(chunk, controller) {
        if (chunk.type === "raw" && !self.#options.includeRawChunks) {
          return;
        }
        controller.enqueue(chunk);
      },
      flush: () => {
        Object.entries(self.#delayedPromises).forEach(([key, promise]) => {
          if (promise.status.type === "pending") {
            promise.reject(new Error(`Stream ${key} terminated unexpectedly`));
          }
        });
      }
    }));
  }
  /**
   * Resolves to the reason generation finished.
   */
  get finishReason() {
    return this.#getDelayedPromise(this.#delayedPromises.finishReason);
  }
  /**
   * Resolves to array of all tool calls made during execution.
   */
  get toolCalls() {
    return this.#getDelayedPromise(this.#delayedPromises.toolCalls);
  }
  /**
   * Resolves to array of all tool execution results.
   */
  get toolResults() {
    return this.#getDelayedPromise(this.#delayedPromises.toolResults);
  }
  /**
   * Resolves to token usage statistics including inputTokens, outputTokens, and totalTokens.
   */
  get usage() {
    return this.#getDelayedPromise(this.#delayedPromises.usage);
  }
  /**
   * Resolves to array of all warnings generated during execution.
   */
  get warnings() {
    return this.#getDelayedPromise(this.#delayedPromises.warnings);
  }
  /**
   * Resolves to provider metadata generated during execution.
   */
  get providerMetadata() {
    return this.#getDelayedPromise(this.#delayedPromises.providerMetadata);
  }
  /**
   * Resolves to the complete response from the model.
   */
  get response() {
    return this.#getDelayedPromise(this.#delayedPromises.response);
  }
  /**
   * Resolves to the complete request sent to the model.
   */
  get request() {
    return this.#getDelayedPromise(this.#delayedPromises.request);
  }
  /**
   * Resolves to an error if an error occurred during streaming.
   */
  get error() {
    if (typeof this.#error === "object") {
      const error = new Error(this.#error.message);
      error.stack = this.#error.stack;
      return error;
    }
    return this.#error;
  }
  updateUsageCount(usage) {
    if (!usage) {
      return;
    }
    for (const [key, value] of Object.entries(usage)) {
      this.#usageCount[key] = (this.#usageCount[key] ?? 0) + (value ?? 0);
    }
  }
  populateUsageCount(usage) {
    if (!usage) {
      return;
    }
    for (const [key, value] of Object.entries(usage)) {
      if (!this.#usageCount[key]) {
        this.#usageCount[key] = value;
      }
    }
  }
  async consumeStream(options) {
    this.#streamConsumed = true;
    try {
      await consumeStream({
        stream: this.fullStream.pipeThrough(new TransformStream$1({
          transform(chunk, controller) {
            controller.enqueue(chunk);
          }
        })),
        onError: options?.onError
      });
    } catch (error) {
      options?.onError?.(error);
    }
  }
  /**
   * Returns complete output including text, usage, tool calls, and all metadata.
   */
  async getFullOutput() {
    await this.consumeStream({
      onError: error => {
        console.error(error);
        throw error;
      }
    });
    const fullOutput = {
      text: await this.text,
      usage: await this.usage,
      steps: await this.steps,
      finishReason: await this.finishReason,
      warnings: await this.warnings,
      providerMetadata: await this.providerMetadata,
      request: await this.request,
      reasoning: await this.reasoning,
      reasoningText: await this.reasoningText,
      toolCalls: await this.toolCalls,
      toolResults: await this.toolResults,
      sources: await this.sources,
      files: await this.files,
      response: await this.response,
      totalUsage: await this.totalUsage,
      object: await this.object,
      error: this.error,
      tripwire: this.#tripwire,
      tripwireReason: this.#tripwireReason
    };
    fullOutput.response.messages = this.messageList.get.response.aiV5.model();
    return fullOutput;
  }
  /**
   * The tripwire flag is set when the stream is aborted due to an output processor blocking the content.
   */
  get tripwire() {
    return this.#tripwire;
  }
  /**
   * The reason for the tripwire.
   */
  get tripwireReason() {
    return this.#tripwireReason;
  }
  /**
   * The total usage of the stream.
   */
  get totalUsage() {
    return this.#getDelayedPromise(this.#delayedPromises.totalUsage);
  }
  get content() {
    return this.#getDelayedPromise(this.#delayedPromises.content);
  }
  /**
   * Other output stream formats.
   */
  get aisdk() {
    return {
      /**
       * The AI SDK v5 output stream format.
       */
      v5: this.#aisdkv5
    };
  }
  /**
   * Stream of valid JSON chunks. The final JSON result is validated against the output schema when the stream ends.
   *
   * @example
   * ```typescript
   * const stream = await agent.streamVNext("Extract data", {
   *   output: z.object({ name: z.string(), age: z.number() })
   * });
   * // partial json chunks
   * for await (const data of stream.objectStream) {
   *   console.log(data); // { name: 'John' }, { name: 'John', age: 30 }
   * }
   * ```
   */
  get objectStream() {
    return this.fullStream.pipeThrough(new TransformStream$1({
      transform(chunk, controller) {
        if (chunk.type === "object") {
          controller.enqueue(chunk.object);
        }
      }
    }));
  }
  /**
   * Stream of individual array elements when output schema is an array type.
   */
  get elementStream() {
    let publishedElements = 0;
    return this.fullStream.pipeThrough(new TransformStream$1({
      transform(chunk, controller) {
        if (chunk.type === "object") {
          if (Array.isArray(chunk.object)) {
            for (; publishedElements < chunk.object.length; publishedElements++) {
              controller.enqueue(chunk.object[publishedElements]);
            }
          }
        }
      }
    }));
  }
  /**
   * Stream of only text content, filtering out metadata and other chunk types.
   */
  get textStream() {
    const self = this;
    const outputSchema = getTransformedSchema(self.#options.output);
    if (outputSchema?.outputFormat === "array") {
      return this.fullStream.pipeThrough(createJsonTextStreamTransformer(self.#options.output));
    }
    return this.teeStream().pipeThrough(new TransformStream$1({
      transform(chunk, controller) {
        if (chunk.type === "text-delta") {
          controller.enqueue(chunk.payload.text);
        }
      }
    }));
  }
  /**
   * Resolves to the complete object response from the model. Validated against the 'output' schema when the stream ends.
   *
   * @example
   * ```typescript
   * const stream = await agent.streamVNext("Extract data", {
   *   output: z.object({ name: z.string(), age: z.number() })
   * });
   * // final validated json
   * const data = await stream.object // { name: 'John', age: 30 }
   * ```
   */
  get object() {
    if (!this.processorRunner && !this.#options.output) {
      this.#delayedPromises.object.resolve(void 0);
    }
    return this.#getDelayedPromise(this.#delayedPromises.object);
  }
  // Internal methods for immediate values - used internally by Mastra (llm-execution.ts bailing on errors/abort signals with current state)
  // These are not part of the public API
  /** @internal */
  _getImmediateToolCalls() {
    return this.#toolCalls;
  }
  /** @internal */
  _getImmediateToolResults() {
    return this.#toolResults;
  }
  /** @internal */
  _getImmediateText() {
    return this.#bufferedText.join("");
  }
  /** @internal */
  _getImmediateUsage() {
    return this.#usageCount;
  }
  /** @internal */
  _getImmediateWarnings() {
    return this.#warnings;
  }
  /** @internal */
  _getImmediateFinishReason() {
    return this.#finishReason;
  }
  #getTotalUsage() {
    let total = 0;
    for (const [key, value] of Object.entries(this.#usageCount)) {
      if (key !== "totalTokens" && value && !key.startsWith("cached")) {
        total += value;
      }
    }
    return {
      ...this.#usageCount,
      totalTokens: total
    };
  }
};

// src/loop/telemetry/noop.ts
var noopSpanContext = {
  traceId: "",
  spanId: "",
  traceFlags: 0
};
var noopSpan = {
  spanContext() {
    return noopSpanContext;
  },
  setAttribute() {
    return this;
  },
  setAttributes() {
    return this;
  },
  addEvent() {
    return this;
  },
  addLink() {
    return this;
  },
  addLinks() {
    return this;
  },
  setStatus() {
    return this;
  },
  updateName() {
    return this;
  },
  end() {
    return this;
  },
  isRecording() {
    return false;
  },
  recordException() {
    return this;
  }
};
var noopTracer = {
  startSpan() {
    return noopSpan;
  },
  startActiveSpan(name, arg1, arg2, arg3) {
    if (typeof arg1 === "function") {
      return arg1(noopSpan);
    }
    if (typeof arg2 === "function") {
      return arg2(noopSpan);
    }
    if (typeof arg3 === "function") {
      return arg3(noopSpan);
    }
  }
};

// src/loop/telemetry/index.ts
function getTracer({
  isEnabled = false,
  tracer
} = {}) {
  if (!isEnabled) {
    return noopTracer;
  }
  if (tracer) {
    return tracer;
  }
  return trace.getTracer("mastra");
}
function assembleOperationName({
  operationId,
  telemetry
}) {
  return {
    "mastra.operationId": operationId,
    "operation.name": `${operationId}${telemetry?.functionId != null ? ` ${telemetry.functionId}` : ""}`,
    ...(telemetry?.functionId ? {
      "resource.name": telemetry?.functionId
    } : {})
  };
}
function getTelemetryAttributes({
  model,
  settings,
  telemetry,
  headers
}) {
  return {
    "aisdk.model.provider": model.provider,
    "aisdk.model.id": model.modelId,
    // settings:
    ...Object.entries(settings).reduce((attributes, [key, value]) => {
      attributes[`stream.settings.${key}`] = value;
      return attributes;
    }, {}),
    // add metadata as attributes:
    ...Object.entries(telemetry?.metadata ?? {}).reduce((attributes, [key, value]) => {
      attributes[`stream.telemetry.metadata.${key}`] = value;
      return attributes;
    }, {}),
    // request headers
    ...Object.entries(headers ?? {}).reduce((attributes, [key, value]) => {
      if (value !== void 0) {
        attributes[`stream.request.headers.${key}`] = value;
      }
      return attributes;
    }, {})
  };
}
function getRootSpan({
  operationId,
  model,
  modelSettings,
  telemetry_settings,
  headers
}) {
  const tracer = getTracer({
    isEnabled: telemetry_settings?.isEnabled,
    tracer: telemetry_settings?.tracer
  });
  const baseTelemetryAttributes = getTelemetryAttributes({
    model: {
      modelId: model.modelId,
      provider: model.provider
    },
    settings: modelSettings ?? {
      maxRetries: 2
    },
    telemetry: telemetry_settings,
    headers
  });
  const rootSpan = tracer.startSpan(operationId).setAttributes({
    ...assembleOperationName({
      operationId,
      telemetry: telemetry_settings
    }),
    ...baseTelemetryAttributes
  });
  return {
    rootSpan
  };
}

// src/stream/base/input.ts
var MastraModelInput = class extends MastraBase {
  initialize({
    runId,
    createStream,
    onResult
  }) {
    const self = this;
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const stream2 = await createStream();
          onResult({
            warnings: stream2.warnings,
            request: stream2.request,
            rawResponse: stream2.rawResponse || stream2.response || {}
          });
          await self.transform({
            runId,
            stream: stream2.stream,
            controller
          });
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
    return stream;
  }
};

// src/stream/aisdk/v5/input.ts
var AISDKV5InputStream = class extends MastraModelInput {
  constructor({
    component,
    name
  }) {
    super({
      component,
      name
    });
  }
  async transform({
    runId,
    stream,
    controller
  }) {
    for await (const chunk of stream) {
      const transformedChunk = convertFullStreamChunkToMastra(chunk, {
        runId
      });
      if (transformedChunk) {
        controller.enqueue(transformedChunk);
      }
    }
  }
};

// src/stream/aisdk/v5/execute.ts
function execute({
  runId,
  model,
  providerOptions,
  inputMessages,
  tools,
  toolChoice,
  options,
  onResult,
  modelStreamSpan,
  telemetry_settings,
  includeRawChunks,
  modelSettings,
  output,
  headers
}) {
  const v5 = new AISDKV5InputStream({
    component: "LLM",
    name: model.modelId
  });
  const toolsAndToolChoice = prepareToolsAndToolChoice({
    tools,
    toolChoice,
    activeTools: options?.activeTools
  });
  if (modelStreamSpan && toolsAndToolChoice?.tools?.length && telemetry_settings?.recordOutputs !== false) {
    modelStreamSpan.setAttributes({
      "stream.prompt.tools": toolsAndToolChoice?.tools?.map(tool => JSON.stringify(tool))
    });
  }
  const stream = v5.initialize({
    runId,
    onResult,
    createStream: async () => {
      try {
        const stream2 = await model.doStream({
          ...toolsAndToolChoice,
          prompt: inputMessages,
          providerOptions,
          abortSignal: options?.abortSignal,
          includeRawChunks,
          responseFormat: output ? getResponseFormat(output) : void 0,
          ...(modelSettings ?? {}),
          headers
        });
        return stream2;
      } catch (error) {
        console.error("Error creating stream", error);
        if (isAbortError$1(error) && options?.abortSignal?.aborted) {
          console.log("Abort error", error);
        }
        return {
          stream: new ReadableStream({
            start: async controller => {
              controller.enqueue({
                type: "error",
                error: {
                  message: error instanceof Error ? error.message : JSON.stringify(error),
                  stack: error instanceof Error ? error.stack : void 0
                }
              });
              controller.close();
            }
          }),
          warnings: [],
          request: {},
          rawResponse: {}
        };
      }
    }
  });
  return stream;
}

// src/loop/workflow/run-state.ts
var AgenticRunState = class {
  #state;
  constructor({
    _internal,
    model
  }) {
    this.#state = {
      responseMetadata: {
        id: _internal?.generateId?.(),
        timestamp: _internal?.currentDate?.(),
        modelId: model.modelId,
        headers: void 0
      },
      isReasoning: false,
      isStreaming: false,
      providerOptions: void 0,
      hasToolCallStreaming: false,
      hasErrored: false,
      reasoningDeltas: [],
      textDeltas: [],
      stepResult: void 0
    };
  }
  setState(state) {
    this.#state = {
      ...this.#state,
      ...state
    };
  }
  get state() {
    return this.#state;
  }
};
var llmIterationOutputSchema = z.object({
  messageId: z.string(),
  messages: z.object({
    all: z.array(z.any()),
    user: z.array(z.any()),
    nonUser: z.array(z.any())
  }),
  output: z.any(),
  metadata: z.any(),
  stepResult: z.any().optional()
});
var toolCallInputSchema = z.object({
  toolCallId: z.string(),
  toolName: z.string(),
  args: z.any(),
  providerMetadata: z.any()
});
var toolCallOutputSchema = toolCallInputSchema.extend({
  result: z.any(),
  error: z.any().optional()
});

// src/loop/workflow/llm-execution.ts
async function processOutputStream({
  tools,
  messageId,
  messageList,
  outputStream,
  runState,
  options,
  controller,
  responseFromModel,
  includeRawChunks
}) {
  for await (const chunk of outputStream.fullStream) {
    if (!chunk) {
      continue;
    }
    if (chunk.type == "object") {
      continue;
    }
    if (chunk.type !== "reasoning-delta" && chunk.type !== "reasoning-signature" && chunk.type !== "redacted-reasoning" && runState.state.isReasoning) {
      if (runState.state.reasoningDeltas.length) {
        messageList.add({
          id: messageId,
          role: "assistant",
          content: [{
            type: "reasoning",
            text: runState.state.reasoningDeltas.join(""),
            signature: chunk.payload.signature,
            providerOptions: chunk.payload.providerMetadata ?? runState.state.providerOptions
          }]
        }, "response");
      }
      runState.setState({
        isReasoning: false,
        reasoningDeltas: []
      });
    }
    if (chunk.type !== "text-delta" && chunk.type !== "tool-call" && runState.state.isStreaming) {
      if (runState.state.textDeltas.length) {
        const textStartPayload = chunk.payload;
        const providerMetadata = textStartPayload.providerMetadata ?? runState.state.providerOptions;
        messageList.add({
          id: messageId,
          role: "assistant",
          content: [providerMetadata ? {
            type: "text",
            text: runState.state.textDeltas.join(""),
            providerOptions: providerMetadata
          } : {
            type: "text",
            text: runState.state.textDeltas.join("")
          }]
        }, "response");
      }
      runState.setState({
        isStreaming: false,
        textDeltas: []
      });
    }
    switch (chunk.type) {
      case "response-metadata":
        runState.setState({
          responseMetadata: {
            id: chunk.payload.id,
            timestamp: chunk.payload.timestamp,
            modelId: chunk.payload.modelId,
            headers: chunk.payload.headers
          }
        });
        break;
      case "text-delta":
        {
          const textDeltasFromState = runState.state.textDeltas;
          textDeltasFromState.push(chunk.payload.text);
          runState.setState({
            textDeltas: textDeltasFromState,
            isStreaming: true
          });
          controller.enqueue(chunk);
          break;
        }
      case "tool-call-input-streaming-start":
        {
          const tool = tools?.[chunk.payload.toolName] || Object.values(tools || {})?.find(tool2 => `id` in tool2 && tool2.id === chunk.payload.toolName);
          if (tool && "onInputStart" in tool) {
            try {
              await tool?.onInputStart?.({
                toolCallId: chunk.payload.toolCallId,
                messages: messageList.get.input.aiV5.model(),
                abortSignal: options?.abortSignal
              });
            } catch (error) {
              console.error("Error calling onInputStart", error);
            }
          }
          controller.enqueue(chunk);
          break;
        }
      case "tool-call-delta":
        {
          const tool = tools?.[chunk.payload.toolName || ""] || Object.values(tools || {})?.find(tool2 => `id` in tool2 && tool2.id === chunk.payload.toolName);
          if (tool && "onInputDelta" in tool) {
            try {
              await tool?.onInputDelta?.({
                inputTextDelta: chunk.payload.argsTextDelta,
                toolCallId: chunk.payload.toolCallId,
                messages: messageList.get.input.aiV5.model(),
                abortSignal: options?.abortSignal
              });
            } catch (error) {
              console.error("Error calling onInputDelta", error);
            }
          }
          controller.enqueue(chunk);
          break;
        }
      case "reasoning-start":
        {
          runState.setState({
            providerOptions: chunk.payload.providerMetadata ?? runState.state.providerOptions
          });
          if (Object.values(chunk.payload.providerMetadata || {}).find(v => v?.redactedData)) {
            messageList.add({
              id: messageId,
              role: "assistant",
              content: [{
                type: "reasoning",
                text: "",
                providerOptions: chunk.payload.providerMetadata ?? runState.state.providerOptions
              }]
            }, "response");
            controller.enqueue(chunk);
            break;
          }
          controller.enqueue(chunk);
          break;
        }
      case "reasoning-delta":
        {
          const reasoningDeltasFromState = runState.state.reasoningDeltas;
          reasoningDeltasFromState.push(chunk.payload.text);
          runState.setState({
            isReasoning: true,
            reasoningDeltas: reasoningDeltasFromState,
            providerOptions: chunk.payload.providerMetadata ?? runState.state.providerOptions
          });
          controller.enqueue(chunk);
          break;
        }
      case "file":
        messageList.add({
          id: messageId,
          role: "assistant",
          content: [{
            type: "file",
            data: chunk.payload.data,
            mimeType: chunk.payload.mimeType
          }]
        }, "response");
        controller.enqueue(chunk);
        break;
      case "source":
        messageList.add({
          id: messageId,
          role: "assistant",
          content: {
            format: 2,
            parts: [{
              type: "source",
              source: {
                sourceType: "url",
                id: chunk.payload.id,
                url: chunk.payload.url || "",
                title: chunk.payload.title,
                providerMetadata: chunk.payload.providerMetadata
              }
            }]
          },
          createdAt: /* @__PURE__ */new Date()
        }, "response");
        controller.enqueue(chunk);
        break;
      case "finish":
        runState.setState({
          providerOptions: chunk.payload.metadata.providerMetadata,
          stepResult: {
            reason: chunk.payload.reason,
            logprobs: chunk.payload.logprobs,
            warnings: responseFromModel.warnings,
            totalUsage: chunk.payload.totalUsage,
            headers: responseFromModel.rawResponse?.headers,
            messageId,
            isContinued: !["stop", "error"].includes(chunk.payload.reason),
            request: responseFromModel.request
          }
        });
        break;
      case "error":
        if (isAbortError(chunk.payload.error) && options?.abortSignal?.aborted) {
          break;
        }
        runState.setState({
          hasErrored: true
        });
        runState.setState({
          stepResult: {
            isContinued: false,
            reason: "error"
          }
        });
        let e = chunk.payload.error;
        if (typeof e === "object") {
          e = new Error(e?.message || "Unknown error");
          Object.assign(e, chunk.payload.error);
        }
        controller.enqueue({
          ...chunk,
          payload: {
            ...chunk.payload,
            error: e
          }
        });
        await options?.onError?.({
          error: e
        });
        break;
      default:
        controller.enqueue(chunk);
    }
    if (["text-delta", "reasoning-delta", "source", "tool-call", "tool-call-input-streaming-start", "tool-call-delta", "raw"].includes(chunk.type)) {
      const transformedChunk = convertMastraChunkToAISDKv5({
        chunk
      });
      if (chunk.type === "raw" && !includeRawChunks) {
        return;
      }
      await options?.onChunk?.({
        chunk: transformedChunk
      });
    }
    if (runState.state.hasErrored) {
      break;
    }
  }
}
function createLLMExecutionStep({
  model,
  _internal,
  messageId,
  runId,
  modelStreamSpan,
  telemetry_settings,
  tools,
  toolChoice,
  messageList,
  includeRawChunks,
  modelSettings,
  providerOptions,
  options,
  toolCallStreaming,
  controller,
  output,
  headers
}) {
  return createStep({
    id: "llm-execution",
    inputSchema: llmIterationOutputSchema,
    outputSchema: llmIterationOutputSchema,
    execute: async ({
      inputData,
      bail
    }) => {
      const runState = new AgenticRunState({
        _internal,
        model
      });
      let modelResult;
      let warnings;
      let request;
      let rawResponse;
      switch (model.specificationVersion) {
        case "v2":
          {
            modelResult = execute({
              runId,
              model,
              providerOptions,
              inputMessages: messageList.get.all.aiV5.llmPrompt(),
              tools,
              toolChoice,
              options,
              modelSettings,
              telemetry_settings,
              includeRawChunks,
              output,
              headers,
              onResult: ({
                warnings: warningsFromStream,
                request: requestFromStream,
                rawResponse: rawResponseFromStream
              }) => {
                warnings = warningsFromStream;
                request = requestFromStream || {};
                rawResponse = rawResponseFromStream;
                controller.enqueue({
                  runId,
                  from: "AGENT" /* AGENT */,
                  type: "step-start",
                  payload: {
                    request: request || {},
                    warnings: [],
                    messageId
                  }
                });
              },
              modelStreamSpan
            });
            break;
          }
        default:
          {
            throw new Error(`Unsupported model version: ${model.specificationVersion}`);
          }
      }
      const outputStream = new MastraModelOutput({
        model: {
          modelId: model.modelId,
          provider: model.provider,
          version: model.specificationVersion
        },
        stream: modelResult,
        messageList,
        options: {
          runId,
          rootSpan: modelStreamSpan,
          toolCallStreaming,
          telemetry_settings,
          includeRawChunks,
          output
        }
      });
      try {
        await processOutputStream({
          outputStream,
          includeRawChunks,
          tools,
          messageId,
          messageList,
          runState,
          options,
          controller,
          responseFromModel: {
            warnings,
            request,
            rawResponse
          }
        });
      } catch (error) {
        console.log("Error in LLM Execution Step", error);
        if (isAbortError(error) && options?.abortSignal?.aborted) {
          await options?.onAbort?.({
            steps: inputData?.output?.steps ?? []
          });
          controller.enqueue({
            type: "abort",
            runId,
            from: "AGENT" /* AGENT */,
            payload: {}
          });
          const usage2 = outputStream._getImmediateUsage();
          const responseMetadata2 = runState.state.responseMetadata;
          const text2 = outputStream._getImmediateText();
          return bail({
            messageId,
            stepResult: {
              reason: "abort",
              warnings,
              isContinued: false
            },
            metadata: {
              providerMetadata: providerOptions,
              ...responseMetadata2,
              headers: rawResponse?.headers,
              request
            },
            output: {
              text: text2,
              toolCalls: [],
              usage: usage2 ?? inputData.output?.usage,
              steps: []
            },
            messages: {
              all: messageList.get.all.aiV5.model(),
              user: messageList.get.input.aiV5.model(),
              nonUser: messageList.get.response.aiV5.model()
            }
          });
        }
        controller.enqueue({
          type: "error",
          runId,
          from: "AGENT" /* AGENT */,
          payload: {
            error
          }
        });
        runState.setState({
          hasErrored: true,
          stepResult: {
            isContinued: false,
            reason: "error"
          }
        });
      }
      const toolCalls = outputStream._getImmediateToolCalls()?.map(chunk => {
        return chunk.payload;
      });
      if (toolCalls.length > 0) {
        const assistantContent = [...toolCalls.map(toolCall => {
          return {
            type: "tool-call",
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            args: toolCall.args
          };
        })];
        messageList.add({
          id: messageId,
          role: "assistant",
          content: assistantContent
        }, "response");
      }
      const finishReason = runState?.state?.stepResult?.reason ?? outputStream._getImmediateFinishReason();
      const hasErrored = runState.state.hasErrored;
      const usage = outputStream._getImmediateUsage();
      const responseMetadata = runState.state.responseMetadata;
      const text = outputStream._getImmediateText();
      const steps = inputData.output?.steps || [];
      steps.push(new DefaultStepResult({
        warnings: outputStream._getImmediateWarnings(),
        providerMetadata: providerOptions,
        finishReason: runState.state.stepResult?.reason,
        content: messageList.get.response.aiV5.modelContent(),
        // @ts-ignore this is how it worked internally for transformResponse which was removed TODO: how should this actually work?
        response: {
          ...responseMetadata,
          ...rawResponse,
          messages: messageList.get.response.aiV5.model()
        },
        request,
        usage: outputStream._getImmediateUsage()
      }));
      const messages = {
        all: messageList.get.all.aiV5.model(),
        user: messageList.get.input.aiV5.model(),
        nonUser: messageList.get.response.aiV5.model()
      };
      return {
        messageId,
        stepResult: {
          reason: hasErrored ? "error" : finishReason,
          warnings,
          isContinued: !["stop", "error"].includes(finishReason)
        },
        metadata: {
          providerMetadata: runState.state.providerOptions,
          ...responseMetadata,
          ...rawResponse,
          headers: rawResponse?.headers,
          request
        },
        output: {
          text,
          toolCalls,
          usage: usage ?? inputData.output?.usage,
          steps
        },
        messages
      };
    }
  });
}

// src/loop/workflow/tool-call-step.ts
function createToolCallStep({
  tools,
  messageList,
  options,
  telemetry_settings,
  writer
}) {
  return createStep({
    id: "toolCallStep",
    inputSchema: toolCallInputSchema,
    outputSchema: toolCallOutputSchema,
    execute: async ({
      inputData
    }) => {
      const tool = tools?.[inputData.toolName] || Object.values(tools || {})?.find(tool2 => `id` in tool2 && tool2.id === inputData.toolName);
      if (!tool) {
        throw new Error(`Tool ${inputData.toolName} not found`);
      }
      if (tool && "onInputAvailable" in tool) {
        try {
          await tool?.onInputAvailable?.({
            toolCallId: inputData.toolCallId,
            input: inputData.args,
            messages: messageList.get.input.aiV5.model(),
            abortSignal: options?.abortSignal
          });
        } catch (error) {
          console.error("Error calling onInputAvailable", error);
        }
      }
      if (!tool.execute) {
        return inputData;
      }
      const tracer = getTracer({
        isEnabled: telemetry_settings?.isEnabled,
        tracer: telemetry_settings?.tracer
      });
      const span = tracer.startSpan("mastra.stream.toolCall").setAttributes({
        ...assembleOperationName({
          operationId: "mastra.stream.toolCall",
          telemetry: telemetry_settings
        }),
        "stream.toolCall.toolName": inputData.toolName,
        "stream.toolCall.toolCallId": inputData.toolCallId,
        "stream.toolCall.args": JSON.stringify(inputData.args)
      });
      try {
        const result = await tool.execute(inputData.args, {
          abortSignal: options?.abortSignal,
          toolCallId: inputData.toolCallId,
          messages: messageList.get.input.aiV5.model(),
          writableStream: writer
        });
        span.setAttributes({
          "stream.toolCall.result": JSON.stringify(result)
        });
        span.end();
        return {
          result,
          ...inputData
        };
      } catch (error) {
        span.setStatus({
          code: 2,
          message: error?.message ?? error
        });
        span.recordException(error);
        return {
          error,
          ...inputData
        };
      }
    }
  });
}

// src/loop/workflow/outer-llm-step.ts
function createOuterLLMWorkflow({
  model,
  telemetry_settings,
  _internal,
  modelStreamSpan,
  ...rest
}) {
  const llmExecutionStep = createLLMExecutionStep({
    model,
    _internal,
    modelStreamSpan,
    telemetry_settings,
    ...rest
  });
  const toolCallStep = createToolCallStep({
    telemetry_settings,
    ...rest
  });
  const messageList = rest.messageList;
  const llmMappingStep = createStep({
    id: "llmExecutionMappingStep",
    inputSchema: z.array(toolCallOutputSchema),
    outputSchema: llmIterationOutputSchema,
    execute: async ({
      inputData,
      getStepResult: getStepResult2,
      bail
    }) => {
      const initialResult = getStepResult2(llmExecutionStep);
      if (inputData?.every(toolCall => toolCall?.result === void 0)) {
        const errorResults = inputData.filter(toolCall => toolCall?.error);
        const toolResultMessageId = rest.experimental_generateMessageId?.() || _internal?.generateId?.();
        if (errorResults?.length) {
          errorResults.forEach(toolCall => {
            const chunk = {
              type: "tool-error",
              runId: rest.runId,
              from: "AGENT" /* AGENT */,
              payload: {
                error: toolCall.error,
                args: toolCall.args,
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                providerMetadata: toolCall.providerMetadata
              }
            };
            rest.controller.enqueue(chunk);
          });
          rest.messageList.add({
            id: toolResultMessageId,
            role: "tool",
            content: errorResults.map(toolCall => {
              return {
                type: "tool-result",
                args: toolCall.args,
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                result: {
                  tool_execution_error: toolCall.error?.message ?? toolCall.error
                }
              };
            })
          }, "response");
        }
        initialResult.stepResult.isContinued = false;
        return bail(initialResult);
      }
      if (inputData?.length) {
        for (const toolCall of inputData) {
          const chunk = {
            type: "tool-result",
            runId: rest.runId,
            from: "AGENT" /* AGENT */,
            payload: {
              args: toolCall.args,
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              result: toolCall.result,
              providerMetadata: toolCall.providerMetadata
            }
          };
          rest.controller.enqueue(chunk);
          if (model.specificationVersion === "v2") {
            await rest.options?.onChunk?.({
              chunk: convertMastraChunkToAISDKv5({
                chunk
              })
            });
          }
          const toolResultMessageId = rest.experimental_generateMessageId?.() || _internal?.generateId?.();
          messageList.add({
            id: toolResultMessageId,
            role: "tool",
            content: inputData.map(toolCall2 => {
              return {
                type: "tool-result",
                args: toolCall2.args,
                toolCallId: toolCall2.toolCallId,
                toolName: toolCall2.toolName,
                result: toolCall2.result
              };
            })
          }, "response");
        }
        return {
          ...initialResult,
          messages: {
            all: messageList.get.all.aiV5.model(),
            user: messageList.get.input.aiV5.model(),
            nonUser: messageList.get.response.aiV5.model()
          }
        };
      }
    }
  });
  return createWorkflow({
    id: "executionWorkflow",
    inputSchema: llmIterationOutputSchema,
    outputSchema: z.any()
  }).then(llmExecutionStep).map(({
    inputData
  }) => {
    if (modelStreamSpan && telemetry_settings?.recordOutputs !== false && inputData.output.toolCalls?.length) {
      modelStreamSpan.setAttribute("stream.response.toolCalls", JSON.stringify(inputData.output.toolCalls?.map(toolCall => {
        return {
          toolCallId: toolCall.toolCallId,
          args: toolCall.args,
          toolName: toolCall.toolName
        };
      })));
    }
    return inputData.output.toolCalls || [];
  }).foreach(toolCallStep).then(llmMappingStep).commit();
}

// src/loop/workflow/stream.ts
function workflowLoopStream({
  telemetry_settings,
  model,
  toolChoice,
  modelSettings,
  _internal,
  modelStreamSpan,
  ...rest
}) {
  return new ReadableStream$1({
    start: async controller => {
      const writer = new WritableStream({
        write: chunk => {
          controller.enqueue(chunk);
        }
      });
      const messageId = rest.experimental_generateMessageId?.() || _internal?.generateId?.();
      modelStreamSpan.setAttributes({
        ...(telemetry_settings?.recordInputs !== false ? {
          "stream.prompt.toolChoice": toolChoice ? JSON.stringify(toolChoice) : "auto"
        } : {})
      });
      const outerLLMWorkflow = createOuterLLMWorkflow({
        messageId,
        model,
        telemetry_settings,
        _internal,
        modelSettings,
        toolChoice,
        modelStreamSpan,
        controller,
        writer,
        ...rest
      });
      const mainWorkflow = createWorkflow({
        id: "agentic-loop",
        inputSchema: llmIterationOutputSchema,
        outputSchema: z.any()
      }).dowhile(outerLLMWorkflow, async ({
        inputData
      }) => {
        let hasFinishedSteps = false;
        if (rest.stopWhen) {
          const conditions = await Promise.all((Array.isArray(rest.stopWhen) ? rest.stopWhen : [rest.stopWhen]).map(condition => {
            return condition({
              steps: inputData.output.steps
            });
          }));
          const hasStopped = conditions.some(condition => condition);
          hasFinishedSteps = hasStopped;
        }
        inputData.stepResult.isContinued = hasFinishedSteps ? false : inputData.stepResult.isContinued;
        if (inputData.stepResult.reason !== "abort") {
          controller.enqueue({
            type: "step-finish",
            runId: rest.runId,
            from: "AGENT" /* AGENT */,
            payload: inputData
          });
        }
        modelStreamSpan.setAttributes({
          "stream.response.id": inputData.metadata.id,
          "stream.response.model": model.modelId,
          ...(inputData.metadata.providerMetadata ? {
            "stream.response.providerMetadata": JSON.stringify(inputData.metadata.providerMetadata)
          } : {}),
          "stream.response.finishReason": inputData.stepResult.reason,
          "stream.usage.inputTokens": inputData.output.usage?.inputTokens,
          "stream.usage.outputTokens": inputData.output.usage?.outputTokens,
          "stream.usage.totalTokens": inputData.output.usage?.totalTokens,
          ...(telemetry_settings?.recordOutputs !== false ? {
            "stream.response.text": inputData.output.text,
            "stream.prompt.messages": JSON.stringify(rest.messageList.get.input.aiV5.model())
          } : {})
        });
        modelStreamSpan.end();
        const reason = inputData.stepResult.reason;
        if (reason === void 0) {
          return false;
        }
        return inputData.stepResult.isContinued;
      }).map(({
        inputData
      }) => {
        const toolCalls = rest.messageList.get.response.aiV5.model().filter(message => message.role === "tool");
        inputData.output.toolCalls = toolCalls;
        return inputData;
      }).commit();
      const msToFirstChunk = _internal?.now?.() - rest.startTimestamp;
      modelStreamSpan.addEvent("ai.stream.firstChunk", {
        "ai.response.msToFirstChunk": msToFirstChunk
      });
      modelStreamSpan.setAttributes({
        "stream.response.timestamp": new Date(rest.startTimestamp).toISOString(),
        "stream.response.msToFirstChunk": msToFirstChunk
      });
      controller.enqueue({
        type: "start",
        runId: rest.runId,
        from: "AGENT" /* AGENT */,
        payload: {}
      });
      const run = await mainWorkflow.createRunAsync({
        runId: rest.runId
      });
      const executionResult = await run.start({
        inputData: {
          messageId,
          messages: {
            all: rest.messageList.get.all.aiV5.model(),
            user: rest.messageList.get.input.aiV5.model(),
            nonUser: []
          }
        }
      });
      if (executionResult.status !== "success") {
        controller.close();
        return;
      }
      if (executionResult.result.stepResult.reason === "abort") {
        console.log("aborted_result", JSON.stringify(executionResult.result, null, 2));
        controller.close();
        return;
      }
      controller.enqueue({
        type: "finish",
        runId: rest.runId,
        from: "AGENT" /* AGENT */,
        payload: executionResult.result
      });
      const msToFinish = (_internal?.now?.() ?? Date.now()) - rest.startTimestamp;
      modelStreamSpan.addEvent("ai.stream.finish");
      modelStreamSpan.setAttributes({
        "stream.response.msToFinish": msToFinish,
        "stream.response.avgOutputTokensPerSecond": 1e3 * (executionResult?.result?.output?.usage?.outputTokens ?? 0) / msToFinish
      });
      controller.close();
    }
  });
}

// src/loop/loop.ts
function loop({
  model,
  logger,
  runId,
  idGenerator,
  telemetry_settings,
  messageList,
  includeRawChunks,
  modelSettings,
  tools,
  _internal,
  mode = "stream",
  outputProcessors,
  ...rest
}) {
  let loggerToUse = logger || new ConsoleLogger({
    level: "debug"
  });
  let runIdToUse = runId;
  if (!runIdToUse) {
    runIdToUse = idGenerator?.() || crypto.randomUUID();
  }
  const internalToUse = {
    now: _internal?.now || (() => Date.now()),
    generateId: _internal?.generateId || (() => generateId()),
    currentDate: _internal?.currentDate || (() => /* @__PURE__ */new Date())
  };
  let startTimestamp = internalToUse.now?.();
  const {
    rootSpan
  } = getRootSpan({
    operationId: mode === "stream" ? `mastra.stream` : `mastra.generate`,
    model: {
      modelId: model.modelId,
      provider: model.provider
    },
    modelSettings,
    headers: modelSettings?.headers ?? rest.headers,
    telemetry_settings
  });
  rootSpan.setAttributes({
    ...(telemetry_settings?.recordOutputs !== false ? {
      "stream.prompt.messages": JSON.stringify(messageList.get.input.aiV5.model())
    } : {})
  });
  const {
    rootSpan: modelStreamSpan
  } = getRootSpan({
    operationId: `mastra.${mode}.aisdk.doStream`,
    model: {
      modelId: model.modelId,
      provider: model.provider
    },
    modelSettings,
    headers: modelSettings?.headers ?? rest.headers,
    telemetry_settings
  });
  const workflowLoopProps = {
    model,
    runId: runIdToUse,
    logger: loggerToUse,
    startTimestamp,
    messageList,
    includeRawChunks: !!includeRawChunks,
    _internal: internalToUse,
    tools,
    modelStreamSpan,
    telemetry_settings,
    modelSettings,
    outputProcessors,
    ...rest
  };
  const streamFn = workflowLoopStream(workflowLoopProps);
  return new MastraModelOutput({
    model: {
      modelId: model.modelId,
      provider: model.provider,
      version: model.specificationVersion
    },
    stream: streamFn,
    messageList,
    options: {
      runId: runIdToUse,
      telemetry_settings,
      rootSpan,
      toolCallStreaming: rest.toolCallStreaming,
      onFinish: rest.options?.onFinish,
      onStepFinish: rest.options?.onStepFinish,
      includeRawChunks: !!includeRawChunks,
      output: rest.output,
      outputProcessors
    }
  });
}

// src/llm/model/model.loop.ts
var MastraLLMVNext = class extends MastraBase {
  #model;
  #mastra;
  constructor({
    model,
    mastra
  }) {
    super({
      name: "aisdk"
    });
    this.#model = model;
    if (mastra) {
      this.#mastra = mastra;
      if (mastra.getLogger()) {
        this.__setLogger(this.#mastra.getLogger());
      }
    }
  }
  __registerPrimitives(p) {
    if (p.telemetry) {
      this.__setTelemetry(p.telemetry);
    }
    if (p.logger) {
      this.__setLogger(p.logger);
    }
  }
  __registerMastra(p) {
    this.#mastra = p;
  }
  getProvider() {
    return this.#model.provider;
  }
  getModelId() {
    return this.#model.modelId;
  }
  getModel() {
    return this.#model;
  }
  _applySchemaCompat(schema) {
    const model = this.#model;
    const schemaCompatLayers = [];
    if (model) {
      const modelInfo = {
        modelId: model.modelId,
        supportsStructuredOutputs: true,
        provider: model.provider
      };
      schemaCompatLayers.push(new OpenAIReasoningSchemaCompatLayer(modelInfo), new OpenAISchemaCompatLayer(modelInfo), new GoogleSchemaCompatLayer(modelInfo), new AnthropicSchemaCompatLayer(modelInfo), new DeepSeekSchemaCompatLayer(modelInfo), new MetaSchemaCompatLayer(modelInfo));
    }
    return applyCompatLayer({
      schema,
      compatLayers: schemaCompatLayers,
      mode: "aiSdkSchema"
    });
  }
  convertToMessages(messages) {
    if (Array.isArray(messages)) {
      return messages.map(m => {
        if (typeof m === "string") {
          return {
            role: "user",
            content: m
          };
        }
        return m;
      });
    }
    return [{
      role: "user",
      content: messages
    }];
  }
  stream({
    messages,
    stopWhen = stepCountIs(5),
    tools = {},
    runId,
    modelSettings,
    toolChoice = "auto",
    telemetry_settings,
    threadId,
    resourceId,
    output,
    options,
    outputProcessors
    // ...rest
  }) {
    const model = this.#model;
    this.logger.debug(`[LLM] - Streaming text`, {
      runId,
      threadId,
      resourceId,
      messages,
      tools: Object.keys(tools || {})
    });
    if (output) {
      output = this._applySchemaCompat(output);
    }
    try {
      const messageList = new MessageList({
        threadId,
        resourceId
      });
      messageList.add(messages, "input");
      const loopOptions = {
        messageList,
        model: this.#model,
        tools,
        stopWhen,
        toolChoice,
        modelSettings,
        telemetry_settings: {
          ...this.experimental_telemetry,
          ...telemetry_settings
        },
        output,
        outputProcessors,
        options: {
          ...options,
          onStepFinish: async props => {
            try {
              await options?.onStepFinish?.({
                ...props,
                runId
              });
            } catch (e) {
              const mastraError = new MastraError({
                id: "LLM_STREAM_ON_STEP_FINISH_CALLBACK_EXECUTION_FAILED",
                domain: "LLM" /* LLM */,
                category: "USER" /* USER */,
                details: {
                  modelId: model.modelId,
                  modelProvider: model.provider,
                  runId: runId ?? "unknown",
                  threadId: threadId ?? "unknown",
                  resourceId: resourceId ?? "unknown",
                  finishReason: props?.finishReason,
                  toolCalls: props?.toolCalls ? JSON.stringify(props.toolCalls) : "",
                  toolResults: props?.toolResults ? JSON.stringify(props.toolResults) : "",
                  usage: props?.usage ? JSON.stringify(props.usage) : ""
                }
              }, e);
              this.logger.trackException(mastraError);
              throw mastraError;
            }
            this.logger.debug("[LLM] - Stream Step Change:", {
              text: props?.text,
              toolCalls: props?.toolCalls,
              toolResults: props?.toolResults,
              finishReason: props?.finishReason,
              usage: props?.usage,
              runId
            });
            if (props?.response?.headers?.["x-ratelimit-remaining-tokens"] && parseInt(props?.response?.headers?.["x-ratelimit-remaining-tokens"], 10) < 2e3) {
              this.logger.warn("Rate limit approaching, waiting 10 seconds", {
                runId
              });
              await delay(10 * 1e3);
            }
          },
          onFinish: async props => {
            try {
              await options?.onFinish?.({
                ...props,
                runId
              });
            } catch (e) {
              const mastraError = new MastraError({
                id: "LLM_STREAM_ON_FINISH_CALLBACK_EXECUTION_FAILED",
                domain: "LLM" /* LLM */,
                category: "USER" /* USER */,
                details: {
                  modelId: model.modelId,
                  modelProvider: model.provider,
                  runId: runId ?? "unknown",
                  threadId: threadId ?? "unknown",
                  resourceId: resourceId ?? "unknown",
                  finishReason: props?.finishReason,
                  toolCalls: props?.toolCalls ? JSON.stringify(props.toolCalls) : "",
                  toolResults: props?.toolResults ? JSON.stringify(props.toolResults) : "",
                  usage: props?.usage ? JSON.stringify(props.usage) : ""
                }
              }, e);
              this.logger.trackException(mastraError);
              throw mastraError;
            }
            this.logger.debug("[LLM] - Stream Finished:", {
              text: props?.text,
              toolCalls: props?.toolCalls,
              toolResults: props?.toolResults,
              finishReason: props?.finishReason,
              usage: props?.usage,
              runId,
              threadId,
              resourceId
            });
          }
        }
      };
      return loop(loopOptions);
    } catch (e) {
      const mastraError = new MastraError({
        id: "LLM_STREAM_TEXT_AI_SDK_EXECUTION_FAILED",
        domain: "LLM" /* LLM */,
        category: "THIRD_PARTY" /* THIRD_PARTY */,
        details: {
          modelId: model.modelId,
          modelProvider: model.provider,
          runId: runId ?? "unknown",
          threadId: threadId ?? "unknown",
          resourceId: resourceId ?? "unknown"
        }
      }, e);
      throw mastraError;
    }
  }
};

// src/processors/processors/structured-output.ts
var StructuredOutputProcessor = class {
  name = "structured-output";
  schema;
  structuringAgent;
  errorStrategy;
  fallbackValue;
  constructor(options) {
    this.schema = options.schema;
    this.errorStrategy = options.errorStrategy ?? "strict";
    this.fallbackValue = options.fallbackValue;
    this.structuringAgent = new Agent({
      name: "structured-output-structurer",
      instructions: options.instructions || this.generateInstructions(),
      model: options.model
    });
  }
  async processOutputResult(args) {
    const {
      messages,
      abort
    } = args;
    const processedMessages = await Promise.all(messages.map(async message => {
      if (message.role !== "assistant") {
        return message;
      }
      const textContent = this.extractTextContent(message);
      if (!textContent.trim()) {
        return message;
      }
      try {
        const modelDef = await this.structuringAgent.getModel();
        let structuredResult;
        const prompt = `Extract and structure the key information from the following text according to the specified schema. Keep the original meaning and details:

${textContent}`;
        const schema = this.schema;
        if (modelDef.specificationVersion === "v2") {
          structuredResult = await this.structuringAgent.generateVNext(prompt, {
            output: schema
          });
        } else {
          structuredResult = await this.structuringAgent.generate(prompt, {
            output: schema
          });
        }
        if (!structuredResult.object) {
          this.handleError("Structuring failed", "Internal agent did not generate structured output", abort);
          if (this.errorStrategy === "fallback" && this.fallbackValue !== void 0) {
            return {
              ...message,
              content: {
                ...message.content,
                metadata: {
                  ...(message.content.metadata || {}),
                  structuredOutput: this.fallbackValue
                }
              }
            };
          }
          return message;
        }
        return {
          ...message,
          content: {
            ...message.content,
            parts: [{
              type: "text",
              text: textContent
              // Keep original text unchanged
            }],
            metadata: {
              ...(message.content.metadata || {}),
              structuredOutput: structuredResult.object
            }
          }
        };
      } catch (error) {
        this.handleError("Processing failed", error instanceof Error ? error.message : "Unknown error", abort);
        if (this.errorStrategy === "fallback" && this.fallbackValue !== void 0) {
          return {
            ...message,
            content: {
              ...message.content,
              metadata: {
                ...(message.content.metadata || {}),
                structuredOutput: this.fallbackValue
              }
            }
          };
        }
        return message;
      }
    }));
    return processedMessages;
  }
  /**
   * Extract text content from a message
   */
  extractTextContent(message) {
    let text = "";
    if (message.content.parts) {
      for (const part of message.content.parts) {
        if (part.type === "text" && "text" in part && typeof part.text === "string") {
          text += part.text + " ";
        }
      }
    }
    if (!text.trim() && typeof message.content.content === "string") {
      text = message.content.content;
    }
    return text.trim();
  }
  /**
   * Generate instructions for the structuring agent based on the schema
   */
  generateInstructions() {
    return `You are a data structuring specialist. Your job is to convert unstructured text into a specific JSON format.

TASK: Convert the provided unstructured text into valid JSON that matches the following schema:

REQUIREMENTS:
- Return ONLY valid JSON, no additional text or explanation
- Extract relevant information from the input text
- If information is missing, use reasonable defaults or null values
- Maintain data types as specified in the schema
- Be consistent and accurate in your conversions

The input text may be in any format (sentences, bullet points, paragraphs, etc.). Extract the relevant data and structure it according to the schema.`;
  }
  /**
   * Handle errors based on the configured strategy
   */
  handleError(context, error, abort) {
    const message = `[StructuredOutputProcessor] ${context}: ${error}`;
    console.error(`ERROR from StructuredOutputProcessor: ${message}`);
    switch (this.errorStrategy) {
      case "strict":
        abort(message);
        break;
      case "warn":
        console.warn(message);
        break;
      case "fallback":
        console.info(`${message} (using fallback)`);
        break;
    }
  }
};

// src/scores/hooks.ts
function runScorer({
  runId,
  scorerId,
  scorerObject,
  input,
  output,
  runtimeContext,
  entity,
  structuredOutput,
  source,
  entityType,
  threadId,
  resourceId
}) {
  let shouldExecute = false;
  if (!scorerObject?.sampling || scorerObject?.sampling?.type === "none") {
    shouldExecute = true;
  }
  if (scorerObject?.sampling?.type) {
    switch (scorerObject?.sampling?.type) {
      case "ratio":
        shouldExecute = Math.random() < scorerObject?.sampling?.rate;
        break;
      default:
        shouldExecute = true;
    }
  }
  if (!shouldExecute) {
    return;
  }
  const payload = {
    scorer: {
      id: scorerId,
      name: scorerObject.scorer.name,
      description: scorerObject.scorer.description
    },
    input,
    output,
    runtimeContext: Object.fromEntries(runtimeContext.entries()),
    runId,
    source,
    entity,
    structuredOutput,
    entityType,
    threadId,
    resourceId
  };
  executeHook("onScorerRun" /* ON_SCORER_RUN */, payload);
}

// src/workflows/legacy/step.ts
var LegacyStep = class {
  id;
  description;
  inputSchema;
  outputSchema;
  payload;
  execute;
  retryConfig;
  mastra;
  constructor({
    id,
    description,
    execute: execute2,
    payload,
    outputSchema,
    inputSchema,
    retryConfig
  }) {
    this.id = id;
    this.description = description ?? "";
    this.inputSchema = inputSchema;
    this.payload = payload;
    this.outputSchema = outputSchema;
    this.execute = execute2;
    this.retryConfig = retryConfig;
  }
};
function agentToStep(agent, {
  mastra
} = {}) {
  return {
    id: agent.name,
    inputSchema: objectType({
      prompt: stringType(),
      resourceId: stringType().optional(),
      threadId: stringType().optional()
    }),
    outputSchema: objectType({
      text: stringType()
    }),
    execute: async ({
      context,
      runId,
      mastra: mastraFromExecute
    }) => {
      const realMastra = mastraFromExecute ?? mastra;
      if (!realMastra) {
        throw new Error("Mastra instance not found");
      }
      agent.__registerMastra(realMastra);
      agent.__registerPrimitives({
        logger: realMastra.getLogger(),
        telemetry: realMastra.getTelemetry()
      });
      const result = await agent.generate(context.inputData.prompt, {
        runId,
        resourceId: context.inputData.resourceId,
        threadId: context.inputData.threadId
      });
      return {
        text: result.text
      };
    }
  };
}

// src/agent/save-queue/index.ts
var SaveQueueManager = class _SaveQueueManager {
  logger;
  debounceMs;
  memory;
  static MAX_STALENESS_MS = 1e3;
  constructor({
    logger,
    debounceMs,
    memory
  }) {
    this.logger = logger;
    this.debounceMs = debounceMs || 100;
    this.memory = memory;
  }
  saveQueues = /* @__PURE__ */new Map();
  saveDebounceTimers = /* @__PURE__ */new Map();
  /**
   * Debounces save operations for a thread, ensuring that consecutive save requests
   * are batched and only the latest is executed after a short delay.
   * @param threadId - The ID of the thread to debounce saves for.
   * @param saveFn - The save function to debounce.
   */
  debounceSave(threadId, messageList, memoryConfig) {
    if (this.saveDebounceTimers.has(threadId)) {
      clearTimeout(this.saveDebounceTimers.get(threadId));
    }
    this.saveDebounceTimers.set(threadId, setTimeout(() => {
      this.enqueueSave(threadId, messageList, memoryConfig).catch(err => {
        this.logger?.error?.("Error in debounceSave", {
          err,
          threadId
        });
      });
      this.saveDebounceTimers.delete(threadId);
    }, this.debounceMs));
  }
  /**
   * Enqueues a save operation for a thread, ensuring that saves are executed in order and
   * only one save runs at a time per thread. If a save is already in progress for the thread,
   * the new save is queued to run after the previous completes.
   *
   * @param threadId - The ID of the thread whose messages should be saved.
   * @param messageList - The MessageList instance containing unsaved messages.
   * @param memoryConfig - Optional memory configuration to use for saving.
   */
  enqueueSave(threadId, messageList, memoryConfig) {
    const prev = this.saveQueues.get(threadId) || Promise.resolve();
    const next = prev.then(() => this.persistUnsavedMessages(messageList, memoryConfig)).catch(err => {
      this.logger?.error?.("Error in enqueueSave", {
        err,
        threadId
      });
    }).then(() => {
      if (this.saveQueues.get(threadId) === next) {
        this.saveQueues.delete(threadId);
      }
    });
    this.saveQueues.set(threadId, next);
    return next;
  }
  /**
   * Clears any pending debounced save for a thread, preventing the scheduled save
   * from executing if it hasn't already fired.
   *
   * @param threadId - The ID of the thread whose debounced save should be cleared.
   */
  clearDebounce(threadId) {
    if (this.saveDebounceTimers.has(threadId)) {
      clearTimeout(this.saveDebounceTimers.get(threadId));
      this.saveDebounceTimers.delete(threadId);
    }
  }
  /**
   * Persists any unsaved messages from the MessageList to memory storage.
   * Drains the list of unsaved messages and writes them using the memory backend.
   * @param messageList - The MessageList instance for the current thread.
   * @param memoryConfig - The memory configuration for saving.
   */
  async persistUnsavedMessages(messageList, memoryConfig) {
    const newMessages = messageList.drainUnsavedMessages();
    if (newMessages.length > 0 && this.memory) {
      await this.memory.saveMessages({
        messages: newMessages,
        memoryConfig
      });
    }
  }
  /**
   * Batches a save of unsaved messages for a thread, using debouncing to batch rapid updates.
   * If the oldest unsaved message is stale (older than MAX_STALENESS_MS), the save is performed immediately.
   * Otherwise, the save is delayed to batch multiple updates and reduce redundant writes.
   *
   * @param messageList - The MessageList instance containing unsaved messages.
   * @param threadId - The ID of the thread whose messages are being saved.
   * @param memoryConfig - Optional memory configuration for saving.
   */
  async batchMessages(messageList, threadId, memoryConfig) {
    if (!threadId) return;
    const earliest = messageList.getEarliestUnsavedMessageTimestamp();
    const now = Date.now();
    if (earliest && now - earliest > _SaveQueueManager.MAX_STALENESS_MS) {
      return this.flushMessages(messageList, threadId, memoryConfig);
    } else {
      return this.debounceSave(threadId, messageList, memoryConfig);
    }
  }
  /**
   * Forces an immediate save of unsaved messages for a thread, bypassing any debounce delay.
   * This is used when a flush to persistent storage is required (e.g., on shutdown or critical transitions).
   *
   * @param messageList - The MessageList instance containing unsaved messages.
   * @param threadId - The ID of the thread whose messages are being saved.
   * @param memoryConfig - Optional memory configuration for saving.
   */
  async flushMessages(messageList, threadId, memoryConfig) {
    if (!threadId) return;
    this.clearDebounce(threadId);
    return this.enqueueSave(threadId, messageList, memoryConfig);
  }
};

// src/agent/index.ts
function resolveMaybePromise(value, cb) {
  if (value instanceof Promise) {
    return value.then(cb);
  }
  return cb(value);
}
function resolveThreadIdFromArgs(args) {
  if (args?.memory?.thread) {
    if (typeof args.memory.thread === "string") return {
      id: args.memory.thread
    };
    if (typeof args.memory.thread === "object" && args.memory.thread.id) return args.memory.thread;
  }
  if (args?.threadId) return {
    id: args.threadId
  };
  return void 0;
}
var _Agent_decorators, _init, _a;
_Agent_decorators = [InstrumentClass({
  prefix: "agent",
  excludeMethods: ["hasOwnMemory", "getMemory", "__primitive", "__registerMastra", "__registerPrimitives", "__runInputProcessors", "__runOutputProcessors", "_wrapToolsWithAITracing", "getProcessorRunner", "__setTools", "__setLogger", "__setTelemetry", "log", "getModel", "getInstructions", "getTools", "getLLM", "getWorkflows", "getDefaultGenerateOptions", "getDefaultStreamOptions", "getDescription", "getScorers", "getVoice"]
})];
var Agent = class extends (_a = MastraBase) {
  id;
  name;
  #instructions;
  #description;
  model;
  #mastra;
  #memory;
  #workflows;
  #defaultGenerateOptions;
  #defaultStreamOptions;
  #defaultVNextStreamOptions;
  #tools;
  evals;
  #scorers;
  #voice;
  #inputProcessors;
  #outputProcessors;
  // This flag is for agent network messages. We should change the agent network formatting and remove this flag after.
  _agentNetworkAppend = false;
  constructor(config) {
    super({
      component: RegisteredLogger.AGENT
    });
    this.name = config.name;
    this.id = config.id ?? config.name;
    this.#instructions = config.instructions;
    this.#description = config.description;
    if (!config.model) {
      const mastraError = new MastraError({
        id: "AGENT_CONSTRUCTOR_MODEL_REQUIRED",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: config.name
        },
        text: `LanguageModel is required to create an Agent. Please provide the 'model'.`
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    this.model = config.model;
    if (config.workflows) {
      this.#workflows = config.workflows;
    }
    this.#defaultGenerateOptions = config.defaultGenerateOptions || {};
    this.#defaultStreamOptions = config.defaultStreamOptions || {};
    this.#defaultVNextStreamOptions = config.defaultVNextStreamOptions || {};
    this.#tools = config.tools || {};
    this.evals = {};
    if (config.mastra) {
      this.__registerMastra(config.mastra);
      this.__registerPrimitives({
        telemetry: config.mastra.getTelemetry(),
        logger: config.mastra.getLogger()
      });
    }
    this.#scorers = config.scorers || {};
    if (config.evals) {
      this.evals = config.evals;
    }
    if (config.memory) {
      this.#memory = config.memory;
    }
    if (config.voice) {
      this.#voice = config.voice;
      if (typeof config.tools !== "function") {
        this.#voice?.addTools(this.tools);
      }
      if (typeof config.instructions === "string") {
        this.#voice?.addInstructions(config.instructions);
      }
    } else {
      this.#voice = new DefaultVoice();
    }
    if (config.inputProcessors) {
      this.#inputProcessors = config.inputProcessors;
    }
    if (config.outputProcessors) {
      this.#outputProcessors = config.outputProcessors;
    }
    this._agentNetworkAppend = config._agentNetworkAppend || false;
  }
  async getProcessorRunner({
    runtimeContext,
    inputProcessorOverrides,
    outputProcessorOverrides
  }) {
    const inputProcessors = inputProcessorOverrides ?? (this.#inputProcessors ? typeof this.#inputProcessors === "function" ? await this.#inputProcessors({
      runtimeContext
    }) : this.#inputProcessors : []);
    const outputProcessors = outputProcessorOverrides ?? (this.#outputProcessors ? typeof this.#outputProcessors === "function" ? await this.#outputProcessors({
      runtimeContext
    }) : this.#outputProcessors : []);
    this.logger.debug("outputProcessors", outputProcessors);
    return new ProcessorRunner({
      inputProcessors,
      outputProcessors,
      logger: this.logger,
      agentName: this.name
    });
  }
  hasOwnMemory() {
    return Boolean(this.#memory);
  }
  async getMemory({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (!this.#memory) {
      return void 0;
    }
    let resolvedMemory;
    if (typeof this.#memory !== "function") {
      resolvedMemory = this.#memory;
    } else {
      const result = this.#memory({
        runtimeContext,
        mastra: this.#mastra
      });
      resolvedMemory = await Promise.resolve(result);
      if (!resolvedMemory) {
        const mastraError = new MastraError({
          id: "AGENT_GET_MEMORY_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - Function-based memory returned empty value`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
    }
    if (this.#mastra && resolvedMemory) {
      resolvedMemory.__registerMastra(this.#mastra);
      if (!resolvedMemory.hasOwnStorage) {
        const storage = this.#mastra.getStorage();
        if (storage) {
          resolvedMemory.setStorage(storage);
        }
      }
    }
    return resolvedMemory;
  }
  get voice() {
    if (typeof this.#instructions === "function") {
      const mastraError = new MastraError({
        id: "AGENT_VOICE_INCOMPATIBLE_WITH_FUNCTION_INSTRUCTIONS",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "Voice is not compatible when instructions are a function. Please use getVoice() instead."
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    return this.#voice;
  }
  async getWorkflows({
    runtimeContext = new RuntimeContext()
  } = {}) {
    let workflowRecord;
    if (typeof this.#workflows === "function") {
      workflowRecord = await Promise.resolve(this.#workflows({
        runtimeContext,
        mastra: this.#mastra
      }));
    } else {
      workflowRecord = this.#workflows ?? {};
    }
    Object.entries(workflowRecord || {}).forEach(([_workflowName, workflow]) => {
      if (this.#mastra) {
        workflow.__registerMastra(this.#mastra);
      }
    });
    return workflowRecord;
  }
  async getScorers({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (typeof this.#scorers !== "function") {
      return this.#scorers;
    }
    const result = this.#scorers({
      runtimeContext,
      mastra: this.#mastra
    });
    return resolveMaybePromise(result, scorers => {
      if (!scorers) {
        const mastraError = new MastraError({
          id: "AGENT_GET_SCORERS_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - Function-based scorers returned empty value`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return scorers;
    });
  }
  async getVoice({
    runtimeContext
  } = {}) {
    if (this.#voice) {
      const voice = this.#voice;
      voice?.addTools(await this.getTools({
        runtimeContext
      }));
      voice?.addInstructions(await this.getInstructions({
        runtimeContext
      }));
      return voice;
    } else {
      return new DefaultVoice();
    }
  }
  get instructions() {
    this.logger.warn("The instructions property is deprecated. Please use getInstructions() instead.");
    if (typeof this.#instructions === "function") {
      const mastraError = new MastraError({
        id: "AGENT_INSTRUCTIONS_INCOMPATIBLE_WITH_FUNCTION_INSTRUCTIONS",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "Instructions are not compatible when instructions are a function. Please use getInstructions() instead."
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    return this.#instructions;
  }
  getInstructions({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (typeof this.#instructions === "string") {
      return this.#instructions;
    }
    const result = this.#instructions({
      runtimeContext,
      mastra: this.#mastra
    });
    return resolveMaybePromise(result, instructions => {
      if (!instructions) {
        const mastraError = new MastraError({
          id: "AGENT_GET_INSTRUCTIONS_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: "Instructions are required to use an Agent. The function-based instructions returned an empty value."
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return instructions;
    });
  }
  getDescription() {
    return this.#description ?? "";
  }
  getDefaultGenerateOptions({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (typeof this.#defaultGenerateOptions !== "function") {
      return this.#defaultGenerateOptions;
    }
    const result = this.#defaultGenerateOptions({
      runtimeContext,
      mastra: this.#mastra
    });
    return resolveMaybePromise(result, options => {
      if (!options) {
        const mastraError = new MastraError({
          id: "AGENT_GET_DEFAULT_GENERATE_OPTIONS_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - Function-based default generate options returned empty value`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return options;
    });
  }
  getDefaultStreamOptions({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (typeof this.#defaultStreamOptions !== "function") {
      return this.#defaultStreamOptions;
    }
    const result = this.#defaultStreamOptions({
      runtimeContext,
      mastra: this.#mastra
    });
    return resolveMaybePromise(result, options => {
      if (!options) {
        const mastraError = new MastraError({
          id: "AGENT_GET_DEFAULT_STREAM_OPTIONS_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - Function-based default stream options returned empty value`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return options;
    });
  }
  getDefaultVNextStreamOptions({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (typeof this.#defaultVNextStreamOptions !== "function") {
      return this.#defaultVNextStreamOptions;
    }
    const result = this.#defaultVNextStreamOptions({
      runtimeContext,
      mastra: this.#mastra
    });
    return resolveMaybePromise(result, options => {
      if (!options) {
        const mastraError = new MastraError({
          id: "AGENT_GET_DEFAULT_VNEXT_STREAM_OPTIONS_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - Function-based default vnext stream options returned empty value`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return options;
    });
  }
  get tools() {
    this.logger.warn("The tools property is deprecated. Please use getTools() instead.");
    if (typeof this.#tools === "function") {
      const mastraError = new MastraError({
        id: "AGENT_GET_TOOLS_FUNCTION_INCOMPATIBLE_WITH_TOOL_FUNCTION_TYPE",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "Tools are not compatible when tools are a function. Please use getTools() instead."
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    return ensureToolProperties(this.#tools);
  }
  getTools({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (typeof this.#tools !== "function") {
      return ensureToolProperties(this.#tools);
    }
    const result = this.#tools({
      runtimeContext,
      mastra: this.#mastra
    });
    return resolveMaybePromise(result, tools => {
      if (!tools) {
        const mastraError = new MastraError({
          id: "AGENT_GET_TOOLS_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - Function-based tools returned empty value`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return ensureToolProperties(tools);
    });
  }
  get llm() {
    this.logger.warn("The llm property is deprecated. Please use getLLM() instead.");
    if (typeof this.model === "function") {
      const mastraError = new MastraError({
        id: "AGENT_LLM_GETTER_INCOMPATIBLE_WITH_FUNCTION_MODEL",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "LLM is not compatible when model is a function. Please use getLLM() instead."
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    return this.getLLM();
  }
  /**
   * Gets or creates an LLM instance based on the current model
   * @param options Options for getting the LLM
   * @returns A promise that resolves to the LLM instance
   */
  getLLM({
    runtimeContext = new RuntimeContext(),
    model
  } = {}) {
    const modelToUse = model ? typeof model === "function" ? model({
      runtimeContext,
      mastra: this.#mastra
    }) : model : this.getModel({
      runtimeContext
    });
    return resolveMaybePromise(modelToUse, resolvedModel => {
      let llm;
      if (resolvedModel.specificationVersion === "v2") {
        llm = new MastraLLMVNext({
          model: resolvedModel,
          mastra: this.#mastra
        });
      } else {
        llm = new MastraLLMV1({
          model: resolvedModel,
          mastra: this.#mastra
        });
      }
      if (this.#primitives) {
        llm.__registerPrimitives(this.#primitives);
      }
      if (this.#mastra) {
        llm.__registerMastra(this.#mastra);
      }
      return llm;
    });
  }
  /**
   * Gets the model, resolving it if it's a function
   * @param options Options for getting the model
   * @returns A promise that resolves to the model
   */
  getModel({
    runtimeContext = new RuntimeContext()
  } = {}) {
    if (typeof this.model !== "function") {
      if (!this.model) {
        const mastraError = new MastraError({
          id: "AGENT_GET_MODEL_MISSING_MODEL_INSTANCE",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - No model provided`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return this.model;
    }
    const result = this.model({
      runtimeContext,
      mastra: this.#mastra
    });
    return resolveMaybePromise(result, model => {
      if (!model) {
        const mastraError = new MastraError({
          id: "AGENT_GET_MODEL_FUNCTION_EMPTY_RETURN",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          details: {
            agentName: this.name
          },
          text: `[Agent:${this.name}] - Function-based model returned empty value`
        });
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
      return model;
    });
  }
  __updateInstructions(newInstructions) {
    this.#instructions = newInstructions;
    this.logger.debug(`[Agents:${this.name}] Instructions updated.`, {
      model: this.model,
      name: this.name
    });
  }
  __updateModel({
    model
  }) {
    this.model = model;
    this.logger.debug(`[Agents:${this.name}] Model updated.`, {
      model: this.model,
      name: this.name
    });
  }
  #primitives;
  __registerPrimitives(p) {
    if (p.telemetry) {
      this.__setTelemetry(p.telemetry);
    }
    if (p.logger) {
      this.__setLogger(p.logger);
    }
    this.#primitives = p;
    this.logger.debug(`[Agents:${this.name}] initialized.`, {
      model: this.model,
      name: this.name
    });
  }
  __registerMastra(mastra) {
    this.#mastra = mastra;
  }
  /**
   * Set the concrete tools for the agent
   * @param tools
   */
  __setTools(tools) {
    this.#tools = tools;
    this.logger.debug(`[Agents:${this.name}] Tools set for agent ${this.name}`, {
      model: this.model,
      name: this.name
    });
  }
  async generateTitleFromUserMessage({
    message,
    runtimeContext = new RuntimeContext(),
    model,
    instructions
  }) {
    const llm = await this.getLLM({
      runtimeContext,
      model
    });
    const normMessage = new MessageList().add(message, "user").get.all.ui().at(-1);
    if (!normMessage) {
      throw new Error(`Could not generate title from input ${JSON.stringify(message)}`);
    }
    const partsToGen = [];
    for (const part of normMessage.parts) {
      if (part.type === `text`) {
        partsToGen.push(part);
      } else if (part.type === `source`) {
        partsToGen.push({
          type: "text",
          text: `User added URL: ${part.source.url.substring(0, 100)}`
        });
      } else if (part.type === `file`) {
        partsToGen.push({
          type: "text",
          text: `User added ${part.mimeType} file: ${part.data.substring(0, 100)}`
        });
      }
    }
    const systemInstructions = await this.resolveTitleInstructions(runtimeContext, instructions);
    let text = "";
    if (llm.getModel().specificationVersion === "v2") {
      const result = llm.stream({
        runtimeContext,
        messages: [{
          role: "system",
          content: systemInstructions
        }, {
          role: "user",
          content: JSON.stringify(partsToGen)
        }]
      });
      text = await result.text;
    } else {
      const result = await llm.__text({
        runtimeContext,
        messages: [{
          role: "system",
          content: systemInstructions
        }, {
          role: "user",
          content: JSON.stringify(partsToGen)
        }]
      });
      text = result.text;
    }
    const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    return cleanedText;
  }
  getMostRecentUserMessage(messages) {
    const userMessages = messages.filter(message => message.role === "user");
    return userMessages.at(-1);
  }
  async genTitle(userMessage, runtimeContext, model, instructions) {
    try {
      if (userMessage) {
        const normMessage = new MessageList().add(userMessage, "user").get.all.ui().at(-1);
        if (normMessage) {
          return await this.generateTitleFromUserMessage({
            message: normMessage,
            runtimeContext,
            model,
            instructions
          });
        }
      }
      return `New Thread ${(/* @__PURE__ */new Date()).toISOString()}`;
    } catch (e) {
      this.logger.error("Error generating title:", e);
      return void 0;
    }
  }
  /* @deprecated use agent.getMemory() and query memory directly */
  async fetchMemory({
    threadId,
    thread: passedThread,
    memoryConfig,
    resourceId,
    runId,
    userMessages,
    systemMessage,
    messageList = new MessageList({
      threadId,
      resourceId
    }),
    runtimeContext = new RuntimeContext()
  }) {
    const memory = await this.getMemory({
      runtimeContext
    });
    if (memory) {
      const thread = passedThread ?? (await memory.getThreadById({
        threadId
      }));
      if (!thread) {
        return {
          threadId: threadId || "",
          messages: userMessages || []
        };
      }
      if (userMessages && userMessages.length > 0) {
        messageList.add(userMessages, "memory");
      }
      if (systemMessage?.role === "system") {
        messageList.addSystem(systemMessage, "memory");
      }
      const [memoryMessages, memorySystemMessage] = threadId && memory ? await Promise.all([memory.rememberMessages({
        threadId,
        resourceId,
        config: memoryConfig,
        vectorMessageSearch: messageList.getLatestUserContent() || ""
      }).then(r => r.messagesV2), memory.getSystemMessage({
        threadId,
        memoryConfig
      })]) : [[], null];
      this.logger.debug("Fetched messages from memory", {
        threadId,
        runId,
        fetchedCount: memoryMessages.length
      });
      if (memorySystemMessage) {
        messageList.addSystem(memorySystemMessage, "memory");
      }
      messageList.add(memoryMessages, "memory");
      const systemMessages = messageList.getSystemMessages()?.map(m => m.content)?.join(`
`) ?? void 0;
      const newMessages = messageList.get.input.v1();
      const processedMemoryMessages = await memory.processMessages({
        // these will be processed
        messages: messageList.get.remembered.v1(),
        // these are here for inspecting but shouldn't be returned by the processor
        // - ex TokenLimiter needs to measure all tokens even though it's only processing remembered messages
        newMessages,
        systemMessage: systemMessages,
        memorySystemMessage: memorySystemMessage || void 0
      });
      const returnList = new MessageList().addSystem(systemMessages).add(processedMemoryMessages, "memory").add(newMessages, "user");
      return {
        threadId: thread.id,
        messages: returnList.get.all.prompt()
      };
    }
    return {
      threadId: threadId || "",
      messages: userMessages || []
    };
  }
  async getMemoryTools({
    runId,
    resourceId,
    threadId,
    runtimeContext,
    mastraProxy,
    agentAISpan
  }) {
    let convertedMemoryTools = {};
    const memory = await this.getMemory({
      runtimeContext
    });
    const memoryTools = memory?.getTools?.();
    if (memoryTools) {
      this.logger.debug(`[Agent:${this.name}] - Adding tools from memory ${Object.keys(memoryTools || {}).join(", ")}`, {
        runId
      });
      for (const [toolName, tool] of Object.entries(memoryTools)) {
        const toolObj = tool;
        const options = {
          name: toolName,
          runId,
          threadId,
          resourceId,
          logger: this.logger,
          mastra: mastraProxy,
          memory,
          agentName: this.name,
          runtimeContext,
          model: typeof this.model === "function" ? await this.getModel({
            runtimeContext
          }) : this.model,
          agentAISpan
        };
        const convertedToCoreTool = makeCoreTool(toolObj, options);
        convertedMemoryTools[toolName] = convertedToCoreTool;
      }
    }
    return convertedMemoryTools;
  }
  async __runInputProcessors({
    runtimeContext,
    messageList,
    inputProcessorOverrides
  }) {
    let tripwireTriggered = false;
    let tripwireReason = "";
    if (inputProcessorOverrides?.length || this.#inputProcessors) {
      const runner = await this.getProcessorRunner({
        runtimeContext,
        inputProcessorOverrides
      });
      const tracedRunInputProcessors = messageList2 => {
        const telemetry = this.#mastra?.getTelemetry();
        if (!telemetry) {
          return runner.runInputProcessors(messageList2, void 0);
        }
        return telemetry.traceMethod(async data => {
          return runner.runInputProcessors(data.messageList, telemetry);
        }, {
          spanName: `agent.${this.name}.inputProcessors`,
          attributes: {
            "agent.name": this.name,
            "inputProcessors.count": runner.inputProcessors.length.toString(),
            "inputProcessors.names": runner.inputProcessors.map(p => p.name).join(",")
          }
        })({
          messageList: messageList2
        });
      };
      try {
        messageList = await tracedRunInputProcessors(messageList);
      } catch (error) {
        if (error instanceof TripWire) {
          tripwireTriggered = true;
          tripwireReason = error.message;
        } else {
          throw new MastraError({
            id: "AGENT_INPUT_PROCESSOR_ERROR",
            domain: "AGENT" /* AGENT */,
            category: "USER" /* USER */,
            text: `[Agent:${this.name}] - Input processor error`
          }, error);
        }
      }
    }
    return {
      messageList,
      tripwireTriggered,
      tripwireReason
    };
  }
  async __runOutputProcessors({
    runtimeContext,
    messageList,
    outputProcessorOverrides
  }) {
    let tripwireTriggered = false;
    let tripwireReason = "";
    if (outputProcessorOverrides?.length || this.#outputProcessors) {
      const runner = await this.getProcessorRunner({
        runtimeContext,
        outputProcessorOverrides
      });
      const tracedRunOutputProcessors = messageList2 => {
        const telemetry = this.#mastra?.getTelemetry();
        if (!telemetry) {
          return runner.runOutputProcessors(messageList2, void 0);
        }
        return telemetry.traceMethod(async data => {
          return runner.runOutputProcessors(data.messageList, telemetry);
        }, {
          spanName: `agent.${this.name}.outputProcessors`,
          attributes: {
            "agent.name": this.name,
            "outputProcessors.count": runner.outputProcessors.length.toString(),
            "outputProcessors.names": runner.outputProcessors.map(p => p.name).join(",")
          }
        })({
          messageList: messageList2
        });
      };
      try {
        messageList = await tracedRunOutputProcessors(messageList);
      } catch (e) {
        if (e instanceof TripWire) {
          tripwireTriggered = true;
          tripwireReason = e.message;
          this.logger.debug(`[Agent:${this.name}] - Output processor tripwire triggered: ${e.message}`);
        } else {
          throw e;
        }
      }
    }
    return {
      messageList,
      tripwireTriggered,
      tripwireReason
    };
  }
  async getMemoryMessages({
    resourceId,
    threadId,
    vectorMessageSearch,
    memoryConfig,
    runtimeContext
  }) {
    const memory = await this.getMemory({
      runtimeContext
    });
    if (!memory) {
      return [];
    }
    return memory.rememberMessages({
      threadId,
      resourceId,
      config: memoryConfig,
      // The new user messages aren't in the list yet cause we add memory messages first to try to make sure ordering is correct (memory comes before new user messages)
      vectorMessageSearch
    }).then(r => r.messagesV2);
  }
  async getAssignedTools({
    runtimeContext,
    runId,
    resourceId,
    threadId,
    mastraProxy,
    writableStream,
    agentAISpan
  }) {
    let toolsForRequest = {};
    this.logger.debug(`[Agents:${this.name}] - Assembling assigned tools`, {
      runId,
      threadId,
      resourceId
    });
    const memory = await this.getMemory({
      runtimeContext
    });
    const assignedTools = await this.getTools({
      runtimeContext
    });
    const assignedToolEntries = Object.entries(assignedTools || {});
    const assignedCoreToolEntries = await Promise.all(assignedToolEntries.map(async ([k, tool]) => {
      if (!tool) {
        return;
      }
      const options = {
        name: k,
        runId,
        threadId,
        resourceId,
        logger: this.logger,
        mastra: mastraProxy,
        memory,
        agentName: this.name,
        runtimeContext,
        model: typeof this.model === "function" ? await this.getModel({
          runtimeContext
        }) : this.model,
        writableStream,
        agentAISpan
      };
      return [k, makeCoreTool(tool, options)];
    }));
    const assignedToolEntriesConverted = Object.fromEntries(assignedCoreToolEntries.filter(entry => Boolean(entry)));
    toolsForRequest = {
      ...assignedToolEntriesConverted
    };
    return toolsForRequest;
  }
  async getToolsets({
    runId,
    threadId,
    resourceId,
    toolsets,
    runtimeContext,
    mastraProxy,
    agentAISpan
  }) {
    let toolsForRequest = {};
    const memory = await this.getMemory({
      runtimeContext
    });
    const toolsFromToolsets = Object.values(toolsets || {});
    if (toolsFromToolsets.length > 0) {
      this.logger.debug(`[Agent:${this.name}] - Adding tools from toolsets ${Object.keys(toolsets || {}).join(", ")}`, {
        runId
      });
      for (const toolset of toolsFromToolsets) {
        for (const [toolName, tool] of Object.entries(toolset)) {
          const toolObj = tool;
          const options = {
            name: toolName,
            runId,
            threadId,
            resourceId,
            logger: this.logger,
            mastra: mastraProxy,
            memory,
            agentName: this.name,
            runtimeContext,
            model: typeof this.model === "function" ? await this.getModel({
              runtimeContext
            }) : this.model,
            agentAISpan
          };
          const convertedToCoreTool = makeCoreTool(toolObj, options, "toolset");
          toolsForRequest[toolName] = convertedToCoreTool;
        }
      }
    }
    return toolsForRequest;
  }
  async getClientTools({
    runId,
    threadId,
    resourceId,
    runtimeContext,
    mastraProxy,
    clientTools,
    agentAISpan
  }) {
    let toolsForRequest = {};
    const memory = await this.getMemory({
      runtimeContext
    });
    const clientToolsForInput = Object.entries(clientTools || {});
    if (clientToolsForInput.length > 0) {
      this.logger.debug(`[Agent:${this.name}] - Adding client tools ${Object.keys(clientTools || {}).join(", ")}`, {
        runId
      });
      for (const [toolName, tool] of clientToolsForInput) {
        const {
          execute: execute2,
          ...rest
        } = tool;
        const options = {
          name: toolName,
          runId,
          threadId,
          resourceId,
          logger: this.logger,
          mastra: mastraProxy,
          memory,
          agentName: this.name,
          runtimeContext,
          model: typeof this.model === "function" ? await this.getModel({
            runtimeContext
          }) : this.model,
          agentAISpan
        };
        const convertedToCoreTool = makeCoreTool(rest, options, "client-tool");
        toolsForRequest[toolName] = convertedToCoreTool;
      }
    }
    return toolsForRequest;
  }
  async getWorkflowTools({
    runId,
    threadId,
    resourceId,
    runtimeContext,
    agentAISpan
  }) {
    let convertedWorkflowTools = {};
    const workflows = await this.getWorkflows({
      runtimeContext
    });
    if (Object.keys(workflows).length > 0) {
      convertedWorkflowTools = Object.entries(workflows).reduce((memo, [workflowName, workflow]) => {
        memo[workflowName] = {
          description: workflow.description || `Workflow: ${workflowName}`,
          parameters: workflow.inputSchema || {
            type: "object",
            properties: {}
          },
          // manually wrap workflow tools with ai tracing, so that we can pass the
          // current tool span onto the workflow to maintain continuity of the trace
          execute: async args => {
            const toolAISpan = agentAISpan?.createChildSpan({
              type: "tool_call" /* TOOL_CALL */,
              name: `tool: '${workflowName}'`,
              input: args,
              attributes: {
                toolId: workflowName,
                toolType: "workflow"
              }
            });
            try {
              this.logger.debug(`[Agent:${this.name}] - Executing workflow as tool ${workflowName}`, {
                name: workflowName,
                description: workflow.description,
                args,
                runId,
                threadId,
                resourceId
              });
              const run = workflow.createRun();
              const result = await run.start({
                inputData: args,
                runtimeContext,
                currentSpan: toolAISpan
              });
              toolAISpan?.end({
                output: result
              });
              return result;
            } catch (err) {
              const mastraError = new MastraError({
                id: "AGENT_WORKFLOW_TOOL_EXECUTION_FAILED",
                domain: "AGENT" /* AGENT */,
                category: "USER" /* USER */,
                details: {
                  agentName: this.name,
                  runId: runId || "",
                  threadId: threadId || "",
                  resourceId: resourceId || ""
                },
                text: `[Agent:${this.name}] - Failed workflow tool execution`
              }, err);
              this.logger.trackException(mastraError);
              this.logger.error(mastraError.toString());
              toolAISpan?.error({
                error: mastraError
              });
              throw mastraError;
            }
          }
        };
        return memo;
      }, {});
    }
    return convertedWorkflowTools;
  }
  _wrapToolWithAITracing(tool, toolType, aiSpan) {
    if (!aiSpan || !tool.execute) {
      return tool;
    }
    const wrappedExecute = async (params, options) => {
      const toolSpan = aiSpan.createChildSpan({
        type: "tool_call" /* TOOL_CALL */,
        name: `tool: ${tool.id}`,
        input: params,
        attributes: {
          toolId: tool.id,
          toolDescription: tool.description,
          toolType
        }
      });
      try {
        const result = await tool.execute?.(params, options);
        toolSpan.end({
          output: result
        });
        return result;
      } catch (error) {
        toolSpan.error({
          error
        });
        throw error;
      }
    };
    return {
      ...tool,
      execute: wrappedExecute
    };
  }
  _wrapToolsWithAITracing(tools, toolType, agentAISpan) {
    return Object.fromEntries(Object.entries(tools).map(([key, tool]) => [key, this._wrapToolWithAITracing(tool, toolType, agentAISpan)]));
  }
  async convertTools({
    toolsets,
    clientTools,
    threadId,
    resourceId,
    runId,
    runtimeContext,
    writableStream,
    agentAISpan
  }) {
    let mastraProxy = void 0;
    const logger = this.logger;
    if (this.#mastra) {
      mastraProxy = createMastraProxy({
        mastra: this.#mastra,
        logger
      });
    }
    const assignedTools = await this.getAssignedTools({
      runId,
      resourceId,
      threadId,
      runtimeContext,
      mastraProxy,
      writableStream,
      agentAISpan
    });
    const memoryTools = await this.getMemoryTools({
      runId,
      resourceId,
      threadId,
      runtimeContext,
      mastraProxy,
      agentAISpan
    });
    const toolsetTools = await this.getToolsets({
      runId,
      resourceId,
      threadId,
      runtimeContext,
      mastraProxy,
      toolsets,
      agentAISpan
    });
    const clientSideTools = await this.getClientTools({
      runId,
      resourceId,
      threadId,
      runtimeContext,
      mastraProxy,
      clientTools,
      agentAISpan
    });
    const workflowTools = await this.getWorkflowTools({
      runId,
      resourceId,
      threadId,
      runtimeContext,
      agentAISpan
    });
    return this.formatTools({
      ...this._wrapToolsWithAITracing(assignedTools, "assigned", agentAISpan),
      ...this._wrapToolsWithAITracing(memoryTools, "memory", agentAISpan),
      ...this._wrapToolsWithAITracing(toolsetTools, "toolset", agentAISpan),
      ...this._wrapToolsWithAITracing(clientSideTools, "client", agentAISpan),
      ...workflowTools
      //workflow tools are already wrapped with AI tracing
    });
  }
  formatTools(tools) {
    const INVALID_CHAR_REGEX = /[^a-zA-Z0-9_\-]/g;
    const STARTING_CHAR_REGEX = /[a-zA-Z_]/;
    for (const key of Object.keys(tools)) {
      if (tools[key] && (key.length > 63 || key.match(INVALID_CHAR_REGEX) || !key[0].match(STARTING_CHAR_REGEX))) {
        let newKey = key.replace(INVALID_CHAR_REGEX, "_");
        if (!newKey[0].match(STARTING_CHAR_REGEX)) {
          newKey = "_" + newKey;
        }
        newKey = newKey.slice(0, 63);
        if (tools[newKey]) {
          const mastraError = new MastraError({
            id: "AGENT_TOOL_NAME_COLLISION",
            domain: "AGENT" /* AGENT */,
            category: "USER" /* USER */,
            details: {
              agentName: this.name,
              toolName: newKey
            },
            text: `Two or more tools resolve to the same name "${newKey}". Please rename one of the tools to avoid this collision.`
          });
          this.logger.trackException(mastraError);
          this.logger.error(mastraError.toString());
          throw mastraError;
        }
        tools[newKey] = tools[key];
        delete tools[key];
      }
    }
    return tools;
  }
  /**
   * Adds response messages from a step to the MessageList and schedules persistence.
   * This is used for incremental saving: after each agent step, messages are added to a save queue
   * and a debounced save operation is triggered to avoid redundant writes.
   *
   * @param result - The step result containing response messages.
   * @param messageList - The MessageList instance for the current thread.
   * @param threadId - The thread ID.
   * @param memoryConfig - The memory configuration for saving.
   * @param runId - (Optional) The run ID for logging.
   */
  async saveStepMessages({
    saveQueueManager,
    result,
    messageList,
    threadId,
    memoryConfig,
    runId
  }) {
    try {
      messageList.add(result.response.messages, "response");
      await saveQueueManager.batchMessages(messageList, threadId, memoryConfig);
    } catch (e) {
      await saveQueueManager.flushMessages(messageList, threadId, memoryConfig);
      this.logger.error("Error saving memory on step finish", {
        error: e,
        runId
      });
      throw e;
    }
  }
  __primitive({
    instructions,
    messages,
    context,
    thread,
    memoryConfig,
    resourceId,
    runId,
    toolsets,
    clientTools,
    runtimeContext,
    saveQueueManager,
    writableStream,
    currentSpan
  }) {
    return {
      before: async () => {
        if (process.env.NODE_ENV !== "test") {
          this.logger.debug(`[Agents:${this.name}] - Starting generation`, {
            runId
          });
        }
        const spanArgs = {
          name: `agent run: '${this.id}'`,
          attributes: {
            agentId: this.id,
            instructions,
            availableTools: [...(toolsets ? Object.keys(toolsets) : []), ...(clientTools ? Object.keys(clientTools) : [])]
          },
          metadata: {
            runId,
            resourceId,
            threadId: thread ? thread.id : void 0
          }
        };
        let agentAISpan;
        if (currentSpan) {
          agentAISpan = currentSpan.createChildSpan({
            type: "agent_run" /* AGENT_RUN */,
            ...spanArgs
          });
        } else {
          const aiTracing = getSelectedAITracing({
            runtimeContext
          });
          if (aiTracing) {
            agentAISpan = aiTracing.startSpan({
              type: "agent_run" /* AGENT_RUN */,
              ...spanArgs,
              startOptions: {
                runtimeContext
              }
            });
          }
        }
        const memory = await this.getMemory({
          runtimeContext
        });
        const toolEnhancements = [
        // toolsets
        toolsets && Object.keys(toolsets || {}).length > 0 ? `toolsets present (${Object.keys(toolsets || {}).length} tools)` : void 0,
        // memory tools
        memory && resourceId ? "memory and resourceId available" : void 0].filter(Boolean).join(", ");
        this.logger.debug(`[Agent:${this.name}] - Enhancing tools: ${toolEnhancements}`, {
          runId,
          toolsets: toolsets ? Object.keys(toolsets) : void 0,
          clientTools: clientTools ? Object.keys(clientTools) : void 0,
          hasMemory: !!memory,
          hasResourceId: !!resourceId
        });
        const threadId = thread?.id;
        const convertedTools = await this.convertTools({
          toolsets,
          clientTools,
          threadId,
          resourceId,
          runId,
          runtimeContext,
          writableStream,
          agentAISpan
        });
        const messageList = new MessageList({
          threadId,
          resourceId,
          generateMessageId: this.#mastra?.generateId?.bind(this.#mastra),
          // @ts-ignore Flag for agent network messages
          _agentNetworkAppend: this._agentNetworkAppend
        }).addSystem({
          role: "system",
          content: instructions || `${this.instructions}.`
        }).add(context || [], "context");
        if (!memory || !threadId && !resourceId) {
          messageList.add(messages, "user");
          const {
            tripwireTriggered: tripwireTriggered2,
            tripwireReason: tripwireReason2
          } = await this.__runInputProcessors({
            runtimeContext,
            messageList
          });
          return {
            messageObjects: messageList.get.all.prompt(),
            convertedTools,
            threadExists: false,
            thread: void 0,
            messageList,
            agentAISpan,
            ...(tripwireTriggered2 && {
              tripwire: true,
              tripwireReason: tripwireReason2
            })
          };
        }
        if (!threadId || !resourceId) {
          const mastraError = new MastraError({
            id: "AGENT_MEMORY_MISSING_RESOURCE_ID",
            domain: "AGENT" /* AGENT */,
            category: "USER" /* USER */,
            details: {
              agentName: this.name,
              threadId: threadId || "",
              resourceId: resourceId || ""
            },
            text: `A resourceId and a threadId must be provided when using Memory. Saw threadId "${threadId}" and resourceId "${resourceId}"`
          });
          this.logger.trackException(mastraError);
          this.logger.error(mastraError.toString());
          agentAISpan?.error({
            error: mastraError
          });
          throw mastraError;
        }
        const store = memory.constructor.name;
        this.logger.debug(`[Agent:${this.name}] - Memory persistence enabled: store=${store}, resourceId=${resourceId}`, {
          runId,
          resourceId,
          threadId,
          memoryStore: store
        });
        let threadObject = void 0;
        const existingThread = await memory.getThreadById({
          threadId
        });
        if (existingThread) {
          if (!existingThread.metadata && thread.metadata || thread.metadata && !(0, import_fast_deep_equal.default)(existingThread.metadata, thread.metadata)) {
            threadObject = await memory.saveThread({
              thread: {
                ...existingThread,
                metadata: thread.metadata
              },
              memoryConfig
            });
          } else {
            threadObject = existingThread;
          }
        } else {
          threadObject = await memory.createThread({
            threadId,
            metadata: thread.metadata,
            title: thread.title,
            memoryConfig,
            resourceId,
            saveThread: false
          });
        }
        let [memoryMessages, memorySystemMessage] = await Promise.all([existingThread ? this.getMemoryMessages({
          resourceId,
          threadId: threadObject.id,
          vectorMessageSearch: new MessageList().add(messages, `user`).getLatestUserContent() || "",
          memoryConfig,
          runtimeContext
        }) : [], memory.getSystemMessage({
          threadId: threadObject.id,
          resourceId,
          memoryConfig
        })]);
        this.logger.debug("Fetched messages from memory", {
          threadId: threadObject.id,
          runId,
          fetchedCount: memoryMessages.length
        });
        const resultsFromOtherThreads = memoryMessages.filter(m => m.threadId !== threadObject.id);
        if (resultsFromOtherThreads.length && !memorySystemMessage) {
          memorySystemMessage = ``;
        }
        if (resultsFromOtherThreads.length) {
          memorySystemMessage += `
The following messages were remembered from a different conversation:
<remembered_from_other_conversation>
${(() => {
            let result = ``;
            const messages2 = new MessageList().add(resultsFromOtherThreads, "memory").get.all.v1();
            let lastYmd = null;
            for (const msg of messages2) {
              const date = msg.createdAt;
              const year = date.getUTCFullYear();
              const month = date.toLocaleString("default", {
                month: "short"
              });
              const day = date.getUTCDate();
              const ymd = `${year}, ${month}, ${day}`;
              const utcHour = date.getUTCHours();
              const utcMinute = date.getUTCMinutes();
              const hour12 = utcHour % 12 || 12;
              const ampm = utcHour < 12 ? "AM" : "PM";
              const timeofday = `${hour12}:${utcMinute < 10 ? "0" : ""}${utcMinute} ${ampm}`;
              if (!lastYmd || lastYmd !== ymd) {
                result += `
the following messages are from ${ymd}
`;
              }
              result += `
Message ${msg.threadId && msg.threadId !== threadObject.id ? "from previous conversation" : ""} at ${timeofday}: ${JSON.stringify(msg)}`;
              lastYmd = ymd;
            }
            return result;
          })()}
<end_remembered_from_other_conversation>`;
        }
        if (memorySystemMessage) {
          messageList.addSystem(memorySystemMessage, "memory");
        }
        messageList.add(memoryMessages.filter(m => m.threadId === threadObject.id),
        // filter out messages from other threads. those are added to system message above
        "memory").add(messages, "user");
        const {
          tripwireTriggered,
          tripwireReason
        } = await this.__runInputProcessors({
          runtimeContext,
          messageList
        });
        const systemMessage = [...messageList.getSystemMessages(), ...messageList.getSystemMessages("memory")]?.map(m => m.content)?.join(`
`) ?? void 0;
        const processedMemoryMessages = await memory.processMessages({
          // these will be processed
          messages: messageList.get.remembered.v1(),
          // these are here for inspecting but shouldn't be returned by the processor
          // - ex TokenLimiter needs to measure all tokens even though it's only processing remembered messages
          newMessages: messageList.get.input.v1(),
          systemMessage,
          memorySystemMessage: memorySystemMessage || void 0
        });
        const processedList = new MessageList({
          threadId: threadObject.id,
          resourceId,
          generateMessageId: this.#mastra?.generateId?.bind(this.#mastra),
          // @ts-ignore Flag for agent network messages
          _agentNetworkAppend: this._agentNetworkAppend
        }).addSystem(instructions || `${this.instructions}.`).addSystem(memorySystemMessage).add(context || [], "context").add(processedMemoryMessages, "memory").add(messageList.get.input.v2(), "user").get.all.prompt();
        return {
          convertedTools,
          thread: threadObject,
          messageList,
          // add old processed messages + new input messages
          messageObjects: processedList,
          agentAISpan,
          ...(tripwireTriggered && {
            tripwire: true,
            tripwireReason
          }),
          threadExists: !!existingThread
        };
      },
      after: async ({
        result,
        thread: threadAfter,
        threadId,
        memoryConfig: memoryConfig2,
        outputText,
        runId: runId2,
        messageList,
        threadExists,
        structuredOutput = false,
        overrideScorers,
        agentAISpan
      }) => {
        const resToLog = {
          text: result?.text,
          object: result?.object,
          toolResults: result?.toolResults,
          toolCalls: result?.toolCalls,
          usage: result?.usage,
          steps: result?.steps?.map(s => {
            return {
              stepType: s?.stepType,
              text: result?.text,
              object: result?.object,
              toolResults: result?.toolResults,
              toolCalls: result?.toolCalls,
              usage: result?.usage
            };
          })
        };
        agentAISpan?.end({
          output: {
            text: result?.text,
            object: result?.object
          },
          metadata: {
            usage: result?.usage,
            toolResults: result?.toolResults,
            toolCalls: result?.toolCalls
          }
        });
        this.logger.debug(`[Agent:${this.name}] - Post processing LLM response`, {
          runId: runId2,
          result: resToLog,
          threadId
        });
        const messageListResponses = new MessageList({
          threadId,
          resourceId,
          generateMessageId: this.#mastra?.generateId?.bind(this.#mastra),
          // @ts-ignore Flag for agent network messages
          _agentNetworkAppend: this._agentNetworkAppend
        }).add(result.response.messages, "response").get.all.core();
        const usedWorkingMemory = messageListResponses?.some(m => m.role === "tool" && m?.content?.some(c => c?.toolName === "updateWorkingMemory"));
        const memory = await this.getMemory({
          runtimeContext
        });
        const thread2 = usedWorkingMemory ? threadId ? await memory?.getThreadById({
          threadId
        }) : void 0 : threadAfter;
        if (memory && resourceId && thread2) {
          try {
            let responseMessages = result.response.messages;
            if (!responseMessages && result.object) {
              responseMessages = [{
                role: "assistant",
                content: [{
                  type: "text",
                  text: outputText
                  // outputText contains the stringified object
                }]
              }];
            }
            if (responseMessages) {
              const messagesWithoutIds = responseMessages.map(m => {
                const {
                  id,
                  ...messageWithoutId
                } = m;
                return messageWithoutId;
              });
              messageList.add(messagesWithoutIds, "response");
            }
            if (!threadExists) {
              await memory.createThread({
                threadId: thread2.id,
                metadata: thread2.metadata,
                title: thread2.title,
                memoryConfig: memoryConfig2,
                resourceId: thread2.resourceId
              });
            }
            const promises = [saveQueueManager.flushMessages(messageList, threadId, memoryConfig2)];
            if (thread2.title?.startsWith("New Thread")) {
              const config = memory.getMergedThreadConfig(memoryConfig2);
              const userMessage = this.getMostRecentUserMessage(messageList.get.all.ui());
              const {
                shouldGenerate,
                model: titleModel,
                instructions: titleInstructions
              } = this.resolveTitleGenerationConfig(config?.threads?.generateTitle);
              if (shouldGenerate && userMessage) {
                promises.push(this.genTitle(userMessage, runtimeContext, titleModel, titleInstructions).then(title => {
                  if (title) {
                    return memory.createThread({
                      threadId: thread2.id,
                      resourceId,
                      memoryConfig: memoryConfig2,
                      title,
                      metadata: thread2.metadata
                    });
                  }
                }));
              }
            }
            await Promise.all(promises);
          } catch (e) {
            await saveQueueManager.flushMessages(messageList, threadId, memoryConfig2);
            if (e instanceof MastraError) {
              throw e;
            }
            const mastraError = new MastraError({
              id: "AGENT_MEMORY_PERSIST_RESPONSE_MESSAGES_FAILED",
              domain: "AGENT" /* AGENT */,
              category: "SYSTEM" /* SYSTEM */,
              details: {
                agentName: this.name,
                runId: runId2 || "",
                threadId: threadId || "",
                result: JSON.stringify(resToLog)
              }
            }, e);
            this.logger.trackException(mastraError);
            this.logger.error(mastraError.toString());
            throw mastraError;
          }
        } else {
          let responseMessages = result.response.messages;
          if (!responseMessages && result.object) {
            responseMessages = [{
              role: "assistant",
              content: [{
                type: "text",
                text: outputText
                // outputText contains the stringified object
              }]
            }];
          }
          if (responseMessages) {
            messageList.add(responseMessages, "response");
          }
        }
        await this.#runScorers({
          messageList,
          runId: runId2,
          outputText,
          instructions,
          runtimeContext,
          structuredOutput,
          overrideScorers,
          threadId,
          resourceId
        });
        const scoringData = {
          input: {
            inputMessages: messageList.getPersisted.input.ui(),
            rememberedMessages: messageList.getPersisted.remembered.ui(),
            systemMessages: messageList.getSystemMessages(),
            taggedSystemMessages: messageList.getPersisted.taggedSystemMessages
          },
          output: messageList.getPersisted.response.ui()
        };
        return {
          scoringData
        };
      }
    };
  }
  async #runScorers({
    messageList,
    runId,
    outputText,
    instructions,
    runtimeContext,
    structuredOutput,
    overrideScorers,
    threadId,
    resourceId
  }) {
    const agentName = this.name;
    const userInputMessages = messageList.get.all.ui().filter(m => m.role === "user");
    const input = userInputMessages.map(message => typeof message.content === "string" ? message.content : "").join("\n");
    const runIdToUse = runId || this.#mastra?.generateId() || randomUUID();
    if (Object.keys(this.evals || {}).length > 0) {
      for (const metric of Object.values(this.evals || {})) {
        executeHook("onGeneration" /* ON_GENERATION */, {
          input,
          output: outputText,
          runId: runIdToUse,
          metric,
          agentName,
          instructions
        });
      }
    }
    const scorers = overrideScorers ?? (await this.getScorers({
      runtimeContext
    }));
    const scorerInput = {
      inputMessages: messageList.getPersisted.input.ui(),
      rememberedMessages: messageList.getPersisted.remembered.ui(),
      systemMessages: messageList.getSystemMessages(),
      taggedSystemMessages: messageList.getPersisted.taggedSystemMessages
    };
    const scorerOutput = messageList.getPersisted.response.ui();
    if (Object.keys(scorers || {}).length > 0) {
      for (const [id, scorerObject] of Object.entries(scorers)) {
        runScorer({
          scorerId: id,
          scorerObject,
          runId,
          input: scorerInput,
          output: scorerOutput,
          runtimeContext,
          entity: {
            id: this.id,
            name: this.name
          },
          source: "LIVE",
          entityType: "AGENT",
          structuredOutput: !!structuredOutput,
          threadId,
          resourceId
        });
      }
    }
  }
  async prepareLLMOptions(messages, options) {
    const {
      context,
      memoryOptions: memoryConfigFromArgs,
      resourceId: resourceIdFromArgs,
      maxSteps,
      onStepFinish,
      toolsets,
      clientTools,
      temperature,
      toolChoice = "auto",
      runtimeContext = new RuntimeContext(),
      savePerStep,
      writableStream,
      ...args
    } = options;
    const threadFromArgs = resolveThreadIdFromArgs({
      threadId: args.threadId,
      memory: args.memory
    });
    const resourceId = args.memory?.resource || resourceIdFromArgs;
    const memoryConfig = args.memory?.options || memoryConfigFromArgs;
    if (resourceId && threadFromArgs && !this.hasOwnMemory()) {
      this.logger.warn(`[Agent:${this.name}] - No memory is configured but resourceId and threadId were passed in args. This will not work.`);
    }
    const runId = args.runId || this.#mastra?.generateId() || randomUUID();
    const instructions = args.instructions || (await this.getInstructions({
      runtimeContext
    }));
    const llm = await this.getLLM({
      runtimeContext
    });
    const activeSpan = Telemetry.getActiveSpan();
    const baggageEntries = {};
    if (threadFromArgs?.id) {
      if (activeSpan) {
        activeSpan.setAttribute("threadId", threadFromArgs.id);
      }
      baggageEntries.threadId = {
        value: threadFromArgs.id
      };
    }
    if (resourceId) {
      if (activeSpan) {
        activeSpan.setAttribute("resourceId", resourceId);
      }
      baggageEntries.resourceId = {
        value: resourceId
      };
    }
    if (Object.keys(baggageEntries).length > 0) {
      Telemetry.setBaggage(baggageEntries);
    }
    const memory = await this.getMemory({
      runtimeContext
    });
    const saveQueueManager = new SaveQueueManager({
      logger: this.logger,
      memory
    });
    const {
      before,
      after
    } = this.__primitive({
      messages,
      instructions,
      context,
      thread: threadFromArgs,
      memoryConfig,
      resourceId,
      runId,
      toolsets,
      clientTools,
      runtimeContext,
      saveQueueManager,
      writableStream,
      currentSpan: args.tracingContext?.currentSpan
    });
    let messageList;
    let thread;
    let threadExists;
    return {
      llm,
      before: async () => {
        const beforeResult = await before();
        const {
          messageObjects,
          convertedTools,
          agentAISpan
        } = beforeResult;
        threadExists = beforeResult.threadExists || false;
        messageList = beforeResult.messageList;
        thread = beforeResult.thread;
        const threadId = thread?.id;
        const result = {
          ...options,
          messages: messageObjects,
          tools: convertedTools,
          runId,
          temperature,
          toolChoice,
          threadId,
          resourceId,
          runtimeContext,
          onStepFinish: async props => {
            if (savePerStep) {
              if (!threadExists && memory && thread) {
                await memory.createThread({
                  threadId,
                  title: thread.title,
                  metadata: thread.metadata,
                  resourceId: thread.resourceId,
                  memoryConfig
                });
                threadExists = true;
              }
              await this.saveStepMessages({
                saveQueueManager,
                result: props,
                messageList,
                threadId,
                memoryConfig,
                runId
              });
            }
            return onStepFinish?.({
              ...props,
              runId
            });
          },
          ...(beforeResult.tripwire && {
            tripwire: beforeResult.tripwire,
            tripwireReason: beforeResult.tripwireReason
          }),
          ...args,
          agentAISpan
        };
        return result;
      },
      after: async ({
        result,
        outputText,
        structuredOutput = false,
        agentAISpan
      }) => {
        const afterResult = await after({
          result,
          outputText,
          threadId: thread?.id,
          thread,
          memoryConfig,
          runId,
          messageList,
          structuredOutput,
          threadExists,
          agentAISpan
        });
        return afterResult;
      }
    };
  }
  async #execute(options) {
    const runtimeContext = options.runtimeContext || new RuntimeContext();
    const threadFromArgs = resolveThreadIdFromArgs({
      threadId: options.threadId,
      memory: options.memory
    });
    const resourceId = options.memory?.resource || options.resourceId;
    const memoryConfig = options.memory?.options;
    if (resourceId && threadFromArgs && !this.hasOwnMemory()) {
      this.logger.warn(`[Agent:${this.name}] - No memory is configured but resourceId and threadId were passed in args. This will not work.`);
    }
    const llm = await this.getLLM({
      runtimeContext
    });
    const runId = options.runId || this.#mastra?.generateId() || randomUUID();
    const instructions = options.instructions || (await this.getInstructions({
      runtimeContext
    }));
    const activeSpan = Telemetry.getActiveSpan();
    const baggageEntries = {};
    if (threadFromArgs?.id) {
      if (activeSpan) {
        activeSpan.setAttribute("threadId", threadFromArgs.id);
      }
      baggageEntries.threadId = {
        value: threadFromArgs.id
      };
    }
    if (resourceId) {
      if (activeSpan) {
        activeSpan.setAttribute("resourceId", resourceId);
      }
      baggageEntries.resourceId = {
        value: resourceId
      };
    }
    if (Object.keys(baggageEntries).length > 0) {
      Telemetry.setBaggage(baggageEntries);
    }
    const memory = await this.getMemory({
      runtimeContext
    });
    const saveQueueManager = new SaveQueueManager({
      logger: this.logger,
      memory
    });
    if (process.env.NODE_ENV !== "test") {
      this.logger.debug(`[Agents:${this.name}] - Starting generation`, {
        runId
      });
    }
    const prepareToolsStep = createStep({
      id: "prepare-tools-step",
      inputSchema: anyType(),
      outputSchema: objectType({
        convertedTools: recordType(stringType(), anyType())
      }),
      execute: async () => {
        const toolEnhancements = [
        // toolsets
        options?.toolsets && Object.keys(options?.toolsets || {}).length > 0 ? `toolsets present (${Object.keys(options?.toolsets || {}).length} tools)` : void 0,
        // memory tools
        memory && resourceId ? "memory and resourceId available" : void 0].filter(Boolean).join(", ");
        this.logger.debug(`[Agent:${this.name}] - Enhancing tools: ${toolEnhancements}`, {
          runId,
          toolsets: options?.toolsets ? Object.keys(options?.toolsets) : void 0,
          clientTools: options?.clientTools ? Object.keys(options?.clientTools) : void 0,
          hasMemory: !!memory,
          hasResourceId: !!resourceId
        });
        const threadId = threadFromArgs?.id;
        const convertedTools = await this.convertTools({
          toolsets: options?.toolsets,
          clientTools: options?.clientTools,
          threadId,
          resourceId,
          runId,
          runtimeContext,
          writableStream: options.writableStream
        });
        return {
          convertedTools
        };
      }
    });
    const prepareMemory = createStep({
      id: "prepare-memory-step",
      inputSchema: anyType(),
      outputSchema: objectType({
        messageObjects: arrayType(anyType()),
        threadExists: booleanType(),
        thread: anyType(),
        messageList: anyType(),
        tripwire: booleanType().optional(),
        tripwireReason: stringType().optional()
      }),
      execute: async () => {
        const thread = threadFromArgs;
        const messageList = new MessageList({
          threadId: thread?.id,
          resourceId,
          generateMessageId: this.#mastra?.generateId?.bind(this.#mastra),
          // @ts-ignore Flag for agent network messages
          _agentNetworkAppend: this._agentNetworkAppend
        }).addSystem({
          role: "system",
          content: instructions || `${this.instructions}.`
        }).add(options.context || [], "context");
        if (!memory || !thread?.id && !resourceId) {
          messageList.add(options.messages, "user");
          const {
            tripwireTriggered: tripwireTriggered2,
            tripwireReason: tripwireReason2
          } = await this.__runInputProcessors({
            runtimeContext,
            messageList
          });
          return {
            messageObjects: messageList.get.all.prompt(),
            threadExists: false,
            thread: void 0,
            messageList,
            ...(tripwireTriggered2 && {
              tripwire: true,
              tripwireReason: tripwireReason2
            })
          };
        }
        if (!thread?.id || !resourceId) {
          const mastraError = new MastraError({
            id: "AGENT_MEMORY_MISSING_RESOURCE_ID",
            domain: "AGENT" /* AGENT */,
            category: "USER" /* USER */,
            details: {
              agentName: this.name,
              threadId: thread?.id || "",
              resourceId: resourceId || ""
            },
            text: `A resourceId and a threadId must be provided when using Memory. Saw threadId "${thread?.id}" and resourceId "${resourceId}"`
          });
          this.logger.trackException(mastraError);
          this.logger.error(mastraError.toString());
          throw mastraError;
        }
        const store = memory.constructor.name;
        this.logger.debug(`[Agent:${this.name}] - Memory persistence enabled: store=${store}, resourceId=${resourceId}`, {
          runId,
          resourceId,
          threadId: thread?.id,
          memoryStore: store
        });
        let threadObject = void 0;
        const existingThread = await memory.getThreadById({
          threadId: thread?.id
        });
        if (existingThread) {
          if (!existingThread.metadata && thread.metadata || thread.metadata && !(0, import_fast_deep_equal.default)(existingThread.metadata, thread.metadata)) {
            threadObject = await memory.saveThread({
              thread: {
                ...existingThread,
                metadata: thread.metadata
              },
              memoryConfig
            });
          } else {
            threadObject = existingThread;
          }
        } else {
          threadObject = await memory.createThread({
            threadId: thread?.id,
            metadata: thread.metadata,
            title: thread.title,
            memoryConfig,
            resourceId,
            saveThread: false
          });
        }
        let [memoryMessages, memorySystemMessage] = await Promise.all([existingThread ? this.getMemoryMessages({
          resourceId,
          threadId: threadObject.id,
          vectorMessageSearch: new MessageList().add(options.messages, `user`).getLatestUserContent() || "",
          memoryConfig,
          runtimeContext
        }) : [], memory.getSystemMessage({
          threadId: threadObject.id,
          resourceId,
          memoryConfig
        })]);
        this.logger.debug("Fetched messages from memory", {
          threadId: threadObject.id,
          runId,
          fetchedCount: memoryMessages.length
        });
        const resultsFromOtherThreads = memoryMessages.filter(m => m.threadId !== threadObject.id);
        if (resultsFromOtherThreads.length && !memorySystemMessage) {
          memorySystemMessage = ``;
        }
        if (resultsFromOtherThreads.length) {
          memorySystemMessage += `
The following messages were remembered from a different conversation:
<remembered_from_other_conversation>
${(() => {
            let result = ``;
            const messages = new MessageList().add(resultsFromOtherThreads, "memory").get.all.v1();
            let lastYmd = null;
            for (const msg of messages) {
              const date = msg.createdAt;
              const year = date.getUTCFullYear();
              const month = date.toLocaleString("default", {
                month: "short"
              });
              const day = date.getUTCDate();
              const ymd = `${year}, ${month}, ${day}`;
              const utcHour = date.getUTCHours();
              const utcMinute = date.getUTCMinutes();
              const hour12 = utcHour % 12 || 12;
              const ampm = utcHour < 12 ? "AM" : "PM";
              const timeofday = `${hour12}:${utcMinute < 10 ? "0" : ""}${utcMinute} ${ampm}`;
              if (!lastYmd || lastYmd !== ymd) {
                result += `
the following messages are from ${ymd}
`;
              }
              result += `
Message ${msg.threadId && msg.threadId !== threadObject.id ? "from previous conversation" : ""} at ${timeofday}: ${JSON.stringify(msg)}`;
              lastYmd = ymd;
            }
            return result;
          })()}
<end_remembered_from_other_conversation>`;
        }
        if (memorySystemMessage) {
          messageList.addSystem(memorySystemMessage, "memory");
        }
        messageList.add(memoryMessages.filter(m => m.threadId === threadObject.id),
        // filter out messages from other threads. those are added to system message above
        "memory").add(options.messages, "user");
        const {
          tripwireTriggered,
          tripwireReason
        } = await this.__runInputProcessors({
          runtimeContext,
          messageList
        });
        const systemMessage = [...messageList.getSystemMessages(), ...messageList.getSystemMessages("memory")]?.map(m => m.content)?.join(`
`) ?? void 0;
        const processedMemoryMessages = await memory.processMessages({
          // these will be processed
          messages: messageList.get.remembered.v1(),
          // these are here for inspecting but shouldn't be returned by the processor
          // - ex TokenLimiter needs to measure all tokens even though it's only processing remembered messages
          newMessages: messageList.get.input.v1(),
          systemMessage,
          memorySystemMessage: memorySystemMessage || void 0
        });
        const processedList = new MessageList({
          threadId: threadObject.id,
          resourceId,
          generateMessageId: this.#mastra?.generateId?.bind(this.#mastra),
          // @ts-ignore Flag for agent network messages
          _agentNetworkAppend: this._agentNetworkAppend
        }).addSystem(instructions || `${this.instructions}.`).addSystem(memorySystemMessage).add(options.context || [], "context").add(processedMemoryMessages, "memory").add(messageList.get.input.v2(), "user").get.all.prompt();
        return {
          thread: threadObject,
          messageList,
          // add old processed messages + new input messages
          messageObjects: processedList,
          ...(tripwireTriggered && {
            tripwire: true,
            tripwireReason
          }),
          threadExists: !!existingThread
        };
      }
    });
    const streamStep = createStep({
      id: "stream-text-step",
      inputSchema: anyType(),
      outputSchema: anyType(),
      execute: async ({
        inputData
      }) => {
        this.logger.debug(`Starting agent ${this.name} llm stream call`, {
          runId
        });
        const outputProcessors = inputData.outputProcessors || (this.#outputProcessors ? typeof this.#outputProcessors === "function" ? await this.#outputProcessors({
          runtimeContext: inputData.runtimeContext || new RuntimeContext()
        }) : this.#outputProcessors : []);
        const streamResult = llm.stream({
          ...inputData,
          outputProcessors
        });
        if (options.format === "aisdk") {
          return streamResult.aisdk.v5;
        }
        return streamResult;
      }
    });
    const executionWorkflow = createWorkflow({
      id: "execution-workflow",
      inputSchema: anyType(),
      outputSchema: anyType(),
      steps: [prepareToolsStep, prepareMemory]
    }).parallel([prepareToolsStep, prepareMemory]).map(async ({
      inputData,
      bail
    }) => {
      const result = {
        ...options,
        messages: inputData["prepare-memory-step"].messageObjects,
        tools: inputData["prepare-tools-step"].convertedTools,
        runId,
        temperature: options.modelSettings?.temperature,
        toolChoice: options.toolChoice,
        thread: inputData["prepare-memory-step"].thread,
        threadId: inputData["prepare-memory-step"].thread?.id,
        resourceId,
        runtimeContext,
        onStepFinish: async props => {
          if (options.savePerStep) {
            if (!inputData["prepare-memory-step"].threadExists && memory && inputData["prepare-memory-step"].thread) {
              await memory.createThread({
                threadId: inputData["prepare-memory-step"].thread?.id,
                title: inputData["prepare-memory-step"].thread?.title,
                metadata: inputData["prepare-memory-step"].thread?.metadata,
                resourceId: inputData["prepare-memory-step"].thread?.resourceId,
                memoryConfig
              });
              inputData["prepare-memory-step"].threadExists = true;
            }
            await this.saveStepMessages({
              saveQueueManager,
              result: props,
              messageList: inputData["prepare-memory-step"].messageList,
              threadId: inputData["prepare-memory-step"].thread?.id,
              memoryConfig,
              runId
            });
          }
          return options.onStepFinish?.({
            ...props,
            runId
          });
        },
        ...(inputData["prepare-memory-step"].tripwire && {
          tripwire: inputData["prepare-memory-step"].tripwire,
          tripwireReason: inputData["prepare-memory-step"].tripwireReason
        })
      };
      if (result.tripwire) {
        const emptyResult = {
          textStream: async function* () {}(),
          fullStream: new globalThis.ReadableStream({
            start(controller) {
              controller.close();
            }
          }),
          objectStream: new globalThis.ReadableStream({
            start(controller) {
              controller.close();
            }
          }),
          text: Promise.resolve(""),
          usage: Promise.resolve({
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0
          }),
          finishReason: Promise.resolve("other"),
          tripwire: true,
          tripwireReason: result.tripwireReason,
          response: {
            id: randomUUID(),
            timestamp: /* @__PURE__ */new Date(),
            modelId: "tripwire",
            messages: []
          },
          toolCalls: Promise.resolve([]),
          toolResults: Promise.resolve([]),
          warnings: Promise.resolve(void 0),
          request: {
            body: JSON.stringify({
              messages: []
            })
          },
          object: void 0,
          experimental_output: void 0,
          steps: void 0,
          experimental_providerMetadata: void 0
        };
        return bail(emptyResult);
      }
      let effectiveOutputProcessors = options.outputProcessors || (this.#outputProcessors ? typeof this.#outputProcessors === "function" ? await this.#outputProcessors({
        runtimeContext: result.runtimeContext
      }) : this.#outputProcessors : []);
      if (options.structuredOutput) {
        const structuredProcessor = new StructuredOutputProcessor(options.structuredOutput);
        effectiveOutputProcessors = effectiveOutputProcessors ? [...effectiveOutputProcessors, structuredProcessor] : [structuredProcessor];
      }
      const loopOptions = {
        messages: result.messages,
        runtimeContext: result.runtimeContext,
        runId,
        toolChoice: result.toolChoice,
        tools: result.tools,
        resourceId: result.resourceId,
        threadId: result.threadId,
        structuredOutput: result.structuredOutput,
        stopWhen: result.stopWhen,
        options: {
          onFinish: async payload => {
            if (payload.finishReason === "error") {
              this.logger.error("Error in agent stream", {
                error: payload.error,
                runId
              });
              return;
            }
            const messageList = inputData["prepare-memory-step"].messageList;
            messageList.add(payload.response.messages, "response");
            try {
              const outputText = messageList.get.all.core().map(m => m.content).join("\n");
              await this.#executeOnFinish({
                result: payload,
                outputText,
                instructions,
                thread: result.thread,
                threadId: result.threadId,
                resourceId,
                memoryConfig,
                runtimeContext,
                runId,
                messageList,
                threadExists: inputData["prepare-memory-step"].threadExists,
                structuredOutput: !!options.output,
                saveQueueManager
              });
            } catch (e) {
              this.logger.error("Error saving memory on finish", {
                error: e,
                runId
              });
            }
            await options?.onFinish?.({
              ...result,
              runId
            });
          },
          onStepFinish: result.onStepFinish
        },
        output: options.output,
        outputProcessors: effectiveOutputProcessors,
        modelSettings: {
          temperature: 0,
          ...(options.modelSettings || {})
        }
      };
      return loopOptions;
    }).then(streamStep).commit();
    const run = await executionWorkflow.createRunAsync();
    return await run.start({});
  }
  async #executeOnFinish({
    result,
    instructions,
    thread: threadAfter,
    threadId,
    resourceId,
    memoryConfig,
    outputText,
    runtimeContext,
    runId,
    messageList,
    threadExists,
    structuredOutput = false,
    saveQueueManager
  }) {
    const resToLog = {
      text: result?.text,
      object: result?.object,
      toolResults: result?.toolResults,
      toolCalls: result?.toolCalls,
      usage: result?.usage,
      steps: result?.steps?.map(s => {
        return {
          stepType: s?.stepType,
          text: result?.text,
          object: result?.object,
          toolResults: result?.toolResults,
          toolCalls: result?.toolCalls,
          usage: result?.usage
        };
      })
    };
    this.logger.debug(`[Agent:${this.name}] - Post processing LLM response`, {
      runId,
      result: resToLog,
      threadId,
      resourceId
    });
    const messageListResponses = messageList.get.response.aiV4.core();
    const usedWorkingMemory = messageListResponses?.some(m => m.role === "tool" && m?.content?.some(c => c?.toolName === "updateWorkingMemory"));
    const memory = await this.getMemory({
      runtimeContext
    });
    const thread = usedWorkingMemory ? threadId ? await memory?.getThreadById({
      threadId
    }) : void 0 : threadAfter;
    if (memory && resourceId && thread) {
      try {
        let responseMessages = result.response.messages;
        if (!responseMessages && result.object) {
          responseMessages = [{
            role: "assistant",
            content: [{
              type: "text",
              text: outputText
              // outputText contains the stringified object
            }]
          }];
        }
        if (responseMessages) {
          const messagesWithoutIds = responseMessages.map(m => {
            const {
              id,
              ...messageWithoutId
            } = m;
            return messageWithoutId;
          }).filter(m => m.role !== "user");
          messageList.add(messagesWithoutIds, "response");
        }
        if (!threadExists) {
          await memory.createThread({
            threadId: thread.id,
            metadata: thread.metadata,
            title: thread.title,
            memoryConfig,
            resourceId: thread.resourceId
          });
        }
        const promises = [saveQueueManager.flushMessages(messageList, threadId, memoryConfig)];
        if (thread.title?.startsWith("New Thread")) {
          const config = memory.getMergedThreadConfig(memoryConfig);
          const userMessage = this.getMostRecentUserMessage(messageList.get.all.ui());
          const {
            shouldGenerate,
            model: titleModel,
            instructions: titleInstructions
          } = this.resolveTitleGenerationConfig(config?.threads?.generateTitle);
          if (shouldGenerate && userMessage) {
            promises.push(this.genTitle(userMessage, runtimeContext, titleModel, titleInstructions).then(title => {
              if (title) {
                return memory.createThread({
                  threadId: thread.id,
                  resourceId,
                  memoryConfig,
                  title,
                  metadata: thread.metadata
                });
              }
            }));
          }
        }
        await Promise.all(promises);
      } catch (e) {
        await saveQueueManager.flushMessages(messageList, threadId, memoryConfig);
        if (e instanceof MastraError) {
          throw e;
        }
        const mastraError = new MastraError({
          id: "AGENT_MEMORY_PERSIST_RESPONSE_MESSAGES_FAILED",
          domain: "AGENT" /* AGENT */,
          category: "SYSTEM" /* SYSTEM */,
          details: {
            agentName: this.name,
            runId: runId || "",
            threadId: threadId || "",
            result: JSON.stringify(resToLog)
          }
        }, e);
        this.logger.trackException(mastraError);
        this.logger.error(mastraError.toString());
        throw mastraError;
      }
    } else {
      let responseMessages = result.response.messages;
      if (!responseMessages && result.object) {
        responseMessages = [{
          role: "assistant",
          content: [{
            type: "text",
            text: outputText
            // outputText contains the stringified object
          }]
        }];
      }
      if (responseMessages) {
        messageList.add(responseMessages, "response");
      }
    }
    await this.#runScorers({
      messageList,
      runId,
      outputText,
      instructions,
      runtimeContext,
      structuredOutput
    });
  }
  async generateVNext(messages, options) {
    const result = await this.streamVNext(messages, options);
    if (result.tripwire) {
      return result;
    }
    let fullOutput = await result.getFullOutput();
    const error = fullOutput.error;
    if (fullOutput.finishReason === "error" && error) {
      throw error;
    }
    return fullOutput;
  }
  async streamVNext(messages, streamOptions) {
    const defaultStreamOptions = await this.getDefaultVNextStreamOptions({
      runtimeContext: streamOptions?.runtimeContext
    });
    const mergedStreamOptions = {
      ...defaultStreamOptions,
      ...streamOptions
    };
    const llm = await this.getLLM({
      runtimeContext: mergedStreamOptions.runtimeContext
    });
    if (llm.getModel().specificationVersion !== "v2") {
      throw new MastraError({
        id: "AGENT_STREAM_VNEXT_V1_MODEL_NOT_SUPPORTED",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        text: "V1 models are not supported for streamVNext. Please use stream instead."
      });
    }
    const result = await this.#execute({
      ...mergedStreamOptions,
      messages
    });
    if (result.status !== "success") {
      if (result.status === "failed") {
        throw new MastraError({
          id: "AGENT_STREAM_VNEXT_FAILED",
          domain: "AGENT" /* AGENT */,
          category: "USER" /* USER */,
          text: result.error.message,
          details: {
            error: result.error.message
          }
        });
      }
      throw new MastraError({
        id: "AGENT_STREAM_VNEXT_UNKNOWN_ERROR",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        text: "An unknown error occurred while streaming"
      });
    }
    return result.result;
  }
  async generate(messages, generateOptions = {}) {
    const defaultGenerateOptions = await this.getDefaultGenerateOptions({
      runtimeContext: generateOptions.runtimeContext
    });
    const mergedGenerateOptions = {
      ...defaultGenerateOptions,
      ...generateOptions
    };
    const {
      llm,
      before,
      after
    } = await this.prepareLLMOptions(messages, mergedGenerateOptions);
    if (llm.getModel().specificationVersion !== "v1") {
      this.logger.error("V2 models are not supported for the current version of generate. Please use generateVNext instead.", {
        modelId: llm.getModel().modelId
      });
      throw new MastraError({
        id: "AGENT_GENERATE_V2_MODEL_NOT_SUPPORTED",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          modelId: llm.getModel().modelId
        },
        text: "V2 models are not supported for the current version of generate. Please use generateVNext instead."
      });
    }
    let llmToUse = llm;
    const beforeResult = await before();
    if (beforeResult.tripwire) {
      const tripwireResult = {
        text: "",
        object: void 0,
        usage: {
          totalTokens: 0,
          promptTokens: 0,
          completionTokens: 0
        },
        finishReason: "other",
        response: {
          id: randomUUID(),
          timestamp: /* @__PURE__ */new Date(),
          modelId: "tripwire",
          messages: []
        },
        responseMessages: [],
        toolCalls: [],
        toolResults: [],
        warnings: void 0,
        request: {
          body: JSON.stringify({
            messages: []
          })
        },
        experimental_output: void 0,
        steps: void 0,
        experimental_providerMetadata: void 0,
        tripwire: true,
        tripwireReason: beforeResult.tripwireReason
      };
      return tripwireResult;
    }
    const {
      experimental_output,
      output,
      agentAISpan,
      ...llmOptions
    } = beforeResult;
    let finalOutputProcessors = mergedGenerateOptions.outputProcessors;
    if (mergedGenerateOptions.structuredOutput) {
      const structuredProcessor = new StructuredOutputProcessor(mergedGenerateOptions.structuredOutput);
      finalOutputProcessors = finalOutputProcessors ? [...finalOutputProcessors, structuredProcessor] : [structuredProcessor];
    }
    if (!output || experimental_output) {
      const result2 = await llmToUse.__text({
        ...llmOptions,
        agentAISpan,
        experimental_output
      });
      const outputProcessorResult2 = await this.__runOutputProcessors({
        runtimeContext: mergedGenerateOptions.runtimeContext || new RuntimeContext(),
        outputProcessorOverrides: finalOutputProcessors,
        messageList: new MessageList({
          threadId: llmOptions.threadId || "",
          resourceId: llmOptions.resourceId || ""
        }).add({
          role: "assistant",
          content: [{
            type: "text",
            text: result2.text
          }]
        }, "response")
      });
      if (outputProcessorResult2.tripwireTriggered) {
        const tripwireResult = {
          text: "",
          object: void 0,
          usage: {
            totalTokens: 0,
            promptTokens: 0,
            completionTokens: 0
          },
          finishReason: "other",
          response: {
            id: randomUUID(),
            timestamp: /* @__PURE__ */new Date(),
            modelId: "tripwire",
            messages: []
          },
          responseMessages: [],
          toolCalls: [],
          toolResults: [],
          warnings: void 0,
          request: {
            body: JSON.stringify({
              messages: []
            })
          },
          experimental_output: void 0,
          steps: void 0,
          experimental_providerMetadata: void 0,
          tripwire: true,
          tripwireReason: outputProcessorResult2.tripwireReason
        };
        return tripwireResult;
      }
      const newText2 = outputProcessorResult2.messageList.get.response.v2().map(msg => msg.content.parts.map(part => part.type === "text" ? part.text : "").join("")).join("");
      result2.text = newText2;
      if (finalOutputProcessors && finalOutputProcessors.length > 0) {
        const messages2 = outputProcessorResult2.messageList.get.response.v2();
        this.logger.debug("Checking messages for experimentalOutput metadata:", messages2.map(m => ({
          role: m.role,
          hasContentMetadata: !!m.content.metadata,
          contentMetadata: m.content.metadata
        })));
        const messagesWithStructuredData = messages2.filter(msg => msg.content.metadata && msg.content.metadata.structuredOutput);
        this.logger.debug("Messages with structured data:", messagesWithStructuredData.length);
        if (messagesWithStructuredData[0] && messagesWithStructuredData[0].content.metadata?.structuredOutput) {
          result2.object = messagesWithStructuredData[0].content.metadata.structuredOutput;
          this.logger.debug("Using structured data from processor metadata for result.object");
        } else {
          try {
            const processedOutput = JSON.parse(newText2);
            result2.object = processedOutput;
            this.logger.debug("Using fallback JSON parsing for result.object");
          } catch (error) {
            this.logger.warn("Failed to parse processed output as JSON, updating text only", {
              error
            });
          }
        }
      }
      const afterResult2 = await after({
        result: result2,
        outputText: newText2,
        agentAISpan,
        ...(generateOptions.scorers ? {
          overrideScorers: generateOptions.scorers
        } : {})
      });
      if (generateOptions.returnScorerData) {
        result2.scoringData = afterResult2.scoringData;
      }
      return result2;
    }
    const result = await llmToUse.__textObject({
      ...llmOptions,
      agentAISpan,
      structuredOutput: output
    });
    const outputText = JSON.stringify(result.object);
    const outputProcessorResult = await this.__runOutputProcessors({
      runtimeContext: mergedGenerateOptions.runtimeContext || new RuntimeContext(),
      messageList: new MessageList({
        threadId: llmOptions.threadId || "",
        resourceId: llmOptions.resourceId || ""
      }).add({
        role: "assistant",
        content: [{
          type: "text",
          text: outputText
        }]
      }, "response")
    });
    if (outputProcessorResult.tripwireTriggered) {
      const tripwireResult = {
        text: "",
        object: void 0,
        usage: {
          totalTokens: 0,
          promptTokens: 0,
          completionTokens: 0
        },
        finishReason: "other",
        response: {
          id: randomUUID(),
          timestamp: /* @__PURE__ */new Date(),
          modelId: "tripwire",
          messages: []
        },
        responseMessages: [],
        toolCalls: [],
        toolResults: [],
        warnings: void 0,
        request: {
          body: JSON.stringify({
            messages: []
          })
        },
        experimental_output: void 0,
        steps: void 0,
        experimental_providerMetadata: void 0,
        tripwire: true,
        tripwireReason: outputProcessorResult.tripwireReason
      };
      return tripwireResult;
    }
    const newText = outputProcessorResult.messageList.get.response.v2().map(msg => msg.content.parts.map(part => part.type === "text" ? part.text : "").join("")).join("");
    try {
      const processedObject = JSON.parse(newText);
      result.object = processedObject;
    } catch (error) {
      this.logger.warn("Failed to parse processed output as JSON, keeping original result", {
        error
      });
    }
    const afterResult = await after({
      result,
      outputText: newText,
      ...(generateOptions.scorers ? {
        overrideScorers: generateOptions.scorers
      } : {}),
      structuredOutput: true,
      agentAISpan
    });
    if (generateOptions.returnScorerData) {
      result.scoringData = afterResult.scoringData;
    }
    return result;
  }
  async stream(messages, streamOptions = {}) {
    const defaultStreamOptions = await this.getDefaultStreamOptions({
      runtimeContext: streamOptions.runtimeContext
    });
    const mergedStreamOptions = {
      ...defaultStreamOptions,
      ...streamOptions
    };
    const {
      llm,
      before,
      after
    } = await this.prepareLLMOptions(messages, mergedStreamOptions);
    if (llm.getModel().specificationVersion !== "v1") {
      this.logger.error("V2 models are not supported for stream. Please use streamVNext instead.", {
        modelId: llm.getModel().modelId
      });
      throw new MastraError({
        id: "AGENT_STREAM_V2_MODEL_NOT_SUPPORTED",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          modelId: llm.getModel().modelId
        },
        text: "V2 models are not supported for stream. Please use streamVNext instead."
      });
    }
    const beforeResult = await before();
    if (beforeResult.tripwire) {
      const emptyResult = {
        textStream: async function* () {}(),
        fullStream: Promise.resolve("").then(() => {
          const emptyStream = new globalThis.ReadableStream({
            start(controller) {
              controller.close();
            }
          });
          return emptyStream;
        }),
        text: Promise.resolve(""),
        usage: Promise.resolve({
          totalTokens: 0,
          promptTokens: 0,
          completionTokens: 0
        }),
        finishReason: Promise.resolve("other"),
        tripwire: true,
        tripwireReason: beforeResult.tripwireReason,
        response: {
          id: randomUUID(),
          timestamp: /* @__PURE__ */new Date(),
          modelId: "tripwire",
          messages: []
        },
        toolCalls: Promise.resolve([]),
        toolResults: Promise.resolve([]),
        warnings: Promise.resolve(void 0),
        request: {
          body: JSON.stringify({
            messages: []
          })
        },
        experimental_output: void 0,
        steps: void 0,
        experimental_providerMetadata: void 0,
        toAIStream: () => Promise.resolve("").then(() => {
          const emptyStream = new globalThis.ReadableStream({
            start(controller) {
              controller.close();
            }
          });
          return emptyStream;
        }),
        get experimental_partialOutputStream() {
          return async function* () {}();
        },
        pipeDataStreamToResponse: () => Promise.resolve(),
        pipeTextStreamToResponse: () => Promise.resolve(),
        toDataStreamResponse: () => new Response("", {
          status: 200,
          headers: {
            "Content-Type": "text/plain"
          }
        }),
        toTextStreamResponse: () => new Response("", {
          status: 200,
          headers: {
            "Content-Type": "text/plain"
          }
        })
      };
      return emptyResult;
    }
    const {
      onFinish,
      runId,
      output,
      experimental_output,
      agentAISpan,
      ...llmOptions
    } = beforeResult;
    if (!output || experimental_output) {
      this.logger.debug(`Starting agent ${this.name} llm stream call`, {
        runId
      });
      const streamResult = llm.__stream({
        ...llmOptions,
        experimental_output,
        agentAISpan,
        onFinish: async result => {
          try {
            const outputText = result.text;
            await after({
              result,
              outputText,
              agentAISpan
            });
          } catch (e) {
            this.logger.error("Error saving memory on finish", {
              error: e,
              runId
            });
          }
          await onFinish?.({
            ...result,
            runId
          });
        },
        runId
      });
      return streamResult;
    }
    this.logger.debug(`Starting agent ${this.name} llm streamObject call`, {
      runId
    });
    return llm.__streamObject({
      ...llmOptions,
      agentAISpan,
      onFinish: async result => {
        try {
          const outputText = JSON.stringify(result.object);
          await after({
            result,
            outputText,
            structuredOutput: true,
            agentAISpan
          });
        } catch (e) {
          this.logger.error("Error saving memory on finish", {
            error: e,
            runId
          });
        }
        await onFinish?.({
          ...result,
          runId
        });
      },
      runId,
      structuredOutput: output
    });
  }
  /**
   * Convert text to speech using the configured voice provider
   * @param input Text or text stream to convert to speech
   * @param options Speech options including speaker and provider-specific options
   * @returns Audio stream
   * @deprecated Use agent.voice.speak() instead
   */
  async speak(input, options) {
    if (!this.voice) {
      const mastraError = new MastraError({
        id: "AGENT_SPEAK_METHOD_VOICE_NOT_CONFIGURED",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "No voice provider configured"
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    this.logger.warn("Warning: agent.speak() is deprecated. Please use agent.voice.speak() instead.");
    try {
      return this.voice.speak(input, options);
    } catch (e) {
      let err;
      if (e instanceof MastraError) {
        err = e;
      } else {
        err = new MastraError({
          id: "AGENT_SPEAK_METHOD_ERROR",
          domain: "AGENT" /* AGENT */,
          category: "UNKNOWN" /* UNKNOWN */,
          details: {
            agentName: this.name
          },
          text: "Error during agent speak"
        }, e);
      }
      this.logger.trackException(err);
      this.logger.error(err.toString());
      throw err;
    }
  }
  /**
   * Convert speech to text using the configured voice provider
   * @param audioStream Audio stream to transcribe
   * @param options Provider-specific transcription options
   * @returns Text or text stream
   * @deprecated Use agent.voice.listen() instead
   */
  async listen(audioStream, options) {
    if (!this.voice) {
      const mastraError = new MastraError({
        id: "AGENT_LISTEN_METHOD_VOICE_NOT_CONFIGURED",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "No voice provider configured"
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    this.logger.warn("Warning: agent.listen() is deprecated. Please use agent.voice.listen() instead");
    try {
      return this.voice.listen(audioStream, options);
    } catch (e) {
      let err;
      if (e instanceof MastraError) {
        err = e;
      } else {
        err = new MastraError({
          id: "AGENT_LISTEN_METHOD_ERROR",
          domain: "AGENT" /* AGENT */,
          category: "UNKNOWN" /* UNKNOWN */,
          details: {
            agentName: this.name
          },
          text: "Error during agent listen"
        }, e);
      }
      this.logger.trackException(err);
      this.logger.error(err.toString());
      throw err;
    }
  }
  /**
   * Get a list of available speakers from the configured voice provider
   * @throws {Error} If no voice provider is configured
   * @returns {Promise<Array<{voiceId: string}>>} List of available speakers
   * @deprecated Use agent.voice.getSpeakers() instead
   */
  async getSpeakers() {
    if (!this.voice) {
      const mastraError = new MastraError({
        id: "AGENT_SPEAKERS_METHOD_VOICE_NOT_CONFIGURED",
        domain: "AGENT" /* AGENT */,
        category: "USER" /* USER */,
        details: {
          agentName: this.name
        },
        text: "No voice provider configured"
      });
      this.logger.trackException(mastraError);
      this.logger.error(mastraError.toString());
      throw mastraError;
    }
    this.logger.warn("Warning: agent.getSpeakers() is deprecated. Please use agent.voice.getSpeakers() instead.");
    try {
      return await this.voice.getSpeakers();
    } catch (e) {
      let err;
      if (e instanceof MastraError) {
        err = e;
      } else {
        err = new MastraError({
          id: "AGENT_GET_SPEAKERS_METHOD_ERROR",
          domain: "AGENT" /* AGENT */,
          category: "UNKNOWN" /* UNKNOWN */,
          details: {
            agentName: this.name
          },
          text: "Error during agent getSpeakers"
        }, e);
      }
      this.logger.trackException(err);
      this.logger.error(err.toString());
      throw err;
    }
  }
  toStep() {
    const x = agentToStep(this);
    return new LegacyStep(x);
  }
  /**
   * Resolves the configuration for title generation.
   * @private
   */
  resolveTitleGenerationConfig(generateTitleConfig) {
    if (typeof generateTitleConfig === "boolean") {
      return {
        shouldGenerate: generateTitleConfig
      };
    }
    if (typeof generateTitleConfig === "object" && generateTitleConfig !== null) {
      return {
        shouldGenerate: true,
        model: generateTitleConfig.model,
        instructions: generateTitleConfig.instructions
      };
    }
    return {
      shouldGenerate: false
    };
  }
  /**
   * Resolves title generation instructions, handling both static strings and dynamic functions
   * @private
   */
  async resolveTitleInstructions(runtimeContext, instructions) {
    const DEFAULT_TITLE_INSTRUCTIONS = `
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons
    - the entire text you return will be used as the title`;
    if (!instructions) {
      return DEFAULT_TITLE_INSTRUCTIONS;
    }
    if (typeof instructions === "string") {
      return instructions;
    } else {
      const result = instructions({
        runtimeContext,
        mastra: this.#mastra
      });
      return resolveMaybePromise(result, resolvedInstructions => {
        return resolvedInstructions || DEFAULT_TITLE_INSTRUCTIONS;
      });
    }
  }
};
Agent = /*@__PURE__*/(_ => {
  _init = __decoratorStart(_a);
  Agent = __decorateElement(_init, 0, "Agent", _Agent_decorators, Agent);
  __runInitializers(_init, 1, Agent);

  // src/stream/MastraWorkflowStream.ts
  return Agent;
})();
var MastraWorkflowStream = class extends ReadableStream$1 {
  #usageCount = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0
  };
  #streamPromise;
  #run;
  constructor({
    createStream,
    run
  }) {
    const deferredPromise = {
      promise: null,
      resolve: null,
      reject: null
    };
    deferredPromise.promise = new Promise((resolve, reject) => {
      deferredPromise.resolve = resolve;
      deferredPromise.reject = reject;
    });
    const updateUsageCount = usage => {
      this.#usageCount.promptTokens += parseInt(usage.promptTokens?.toString() ?? "0", 10);
      this.#usageCount.completionTokens += parseInt(usage.completionTokens?.toString() ?? "0", 10);
      this.#usageCount.totalTokens += parseInt(usage.totalTokens?.toString() ?? "0", 10);
    };
    super({
      start: async controller => {
        const writer = new WritableStream({
          write: chunk => {
            if (chunk.type === "step-output" && chunk.payload?.output?.from === "AGENT" && chunk.payload?.output?.type === "finish" || chunk.type === "step-output" && chunk.payload?.output?.from === "WORKFLOW" && chunk.payload?.output?.type === "finish") {
              const finishPayload = chunk.payload?.output.payload;
              updateUsageCount(finishPayload.usage);
            }
            controller.enqueue(chunk);
          }
        });
        controller.enqueue({
          type: "start",
          runId: run.runId,
          from: "WORKFLOW" /* WORKFLOW */,
          payload: {}
        });
        const stream = await createStream(writer);
        for await (const chunk of stream) {
          if (chunk.type === "step-output" && chunk.payload?.output?.from === "AGENT" && chunk.payload?.output?.type === "finish" || chunk.type === "step-output" && chunk.payload?.output?.from === "WORKFLOW" && chunk.payload?.output?.type === "finish") {
            const finishPayload = chunk.payload?.output.payload;
            updateUsageCount(finishPayload.usage);
          }
          controller.enqueue(chunk);
        }
        controller.enqueue({
          type: "finish",
          runId: run.runId,
          from: "WORKFLOW" /* WORKFLOW */,
          payload: {
            stepResult: {
              reason: "stop"
            },
            output: {
              usage: this.#usageCount
            },
            metadata: {},
            messages: {
              all: [],
              user: [],
              nonUser: []
            }
          }
        });
        controller.close();
        deferredPromise.resolve();
      }
    });
    this.#run = run;
    this.#streamPromise = deferredPromise;
  }
  get status() {
    return this.#streamPromise.promise.then(() => this.#run._getExecutionResults()).then(res => res.status);
  }
  get result() {
    return this.#streamPromise.promise.then(() => this.#run._getExecutionResults());
  }
  get usage() {
    return this.#streamPromise.promise.then(() => this.#usageCount);
  }
};

// src/workflows/execution-engine.ts
var ExecutionEngine = class extends MastraBase {
  mastra;
  constructor({
    mastra
  }) {
    super({
      name: "ExecutionEngine",
      component: RegisteredLogger.WORKFLOW
    });
    this.mastra = mastra;
  }
  __registerMastra(mastra) {
    this.mastra = mastra;
  }
};

// src/workflows/default.ts
var DefaultExecutionEngine = class extends ExecutionEngine {
  /**
   * The runCounts map is used to keep track of the run count for each step.
   * The step id is used as the key and the run count is the value.
   */
  runCounts = /* @__PURE__ */new Map();
  /**
   * Get or generate the run count for a step.
   * If the step id is not in the map, it will be added and the run count will be 0.
   * If the step id is in the map, it will return the run count.
   *
   * @param stepId - The id of the step.
   * @returns The run count for the step.
   */
  getOrGenerateRunCount(stepId) {
    if (this.runCounts.has(stepId)) {
      const currentRunCount = this.runCounts.get(stepId);
      const nextRunCount = currentRunCount + 1;
      this.runCounts.set(stepId, nextRunCount);
      return nextRunCount;
    }
    const runCount = 0;
    this.runCounts.set(stepId, runCount);
    return runCount;
  }
  async fmtReturnValue(executionSpan, emitter, stepResults, lastOutput, error) {
    const base = {
      status: lastOutput.status,
      steps: stepResults
    };
    if (lastOutput.status === "success") {
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          workflowState: {
            status: lastOutput.status,
            steps: stepResults,
            result: lastOutput.output
          }
        },
        eventTimestamp: Date.now()
      });
      base.result = lastOutput.output;
    } else if (lastOutput.status === "failed") {
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          workflowState: {
            status: lastOutput.status,
            steps: stepResults,
            result: null,
            error: lastOutput.error
          }
        },
        eventTimestamp: Date.now()
      });
      base.error = error instanceof Error ? error?.stack ?? error : lastOutput.error ?? (typeof error === "string" ? error : new Error("Unknown error: " + error)?.stack ?? new Error("Unknown error: " + error));
    } else if (lastOutput.status === "suspended") {
      const suspendedStepIds = Object.entries(stepResults).flatMap(([stepId, stepResult]) => {
        if (stepResult?.status === "suspended") {
          const nestedPath = stepResult?.suspendPayload?.__workflow_meta?.path;
          return nestedPath ? [[stepId, ...nestedPath]] : [[stepId]];
        }
        return [];
      });
      base.suspended = suspendedStepIds;
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          workflowState: {
            status: lastOutput.status,
            steps: stepResults,
            result: null,
            error: null
          }
        },
        eventTimestamp: Date.now()
      });
    }
    executionSpan?.end();
    return base;
  }
  /**
   * Executes a workflow run with the provided execution graph and input
   * @param graph The execution graph to execute
   * @param input The input data for the workflow
   * @returns A promise that resolves to the workflow output
   */
  async execute(params) {
    const {
      workflowId,
      runId,
      graph,
      input,
      resume,
      retryConfig,
      runtimeContext,
      currentSpan
    } = params;
    const {
      attempts = 0,
      delay: delay2 = 0
    } = retryConfig ?? {};
    const steps = graph.steps;
    this.runCounts.clear();
    const spanArgs = {
      name: `workflow run: '${workflowId}'`,
      input,
      attributes: {
        workflowId
      }
    };
    let workflowAISpan;
    if (currentSpan) {
      workflowAISpan = currentSpan.createChildSpan({
        type: "workflow_run" /* WORKFLOW_RUN */,
        ...spanArgs
      });
    } else {
      const aiTracing = getSelectedAITracing({
        runtimeContext
      });
      if (aiTracing) {
        workflowAISpan = aiTracing.startSpan({
          type: "workflow_run" /* WORKFLOW_RUN */,
          ...spanArgs,
          startOptions: {
            runtimeContext
          }
        });
      }
    }
    if (steps.length === 0) {
      const empty_graph_error = new MastraError({
        id: "WORKFLOW_EXECUTE_EMPTY_GRAPH",
        text: "Workflow must have at least one step",
        domain: "MASTRA_WORKFLOW" /* MASTRA_WORKFLOW */,
        category: "USER" /* USER */
      });
      workflowAISpan?.error({
        error: empty_graph_error
      });
      throw empty_graph_error;
    }
    const executionSpan = this.mastra?.getTelemetry()?.tracer.startSpan(`workflow.${workflowId}.execute`, {
      attributes: {
        componentName: workflowId,
        runId
      }
    });
    let startIdx = 0;
    if (resume?.resumePath) {
      startIdx = resume.resumePath[0];
      resume.resumePath.shift();
    }
    const stepResults = resume?.stepResults || {
      input
    };
    let lastOutput;
    for (let i = startIdx; i < steps.length; i++) {
      const entry = steps[i];
      try {
        lastOutput = await this.executeEntry({
          workflowId,
          runId,
          entry,
          serializedStepGraph: params.serializedStepGraph,
          prevStep: steps[i - 1],
          stepResults,
          resume,
          executionContext: {
            workflowId,
            runId,
            executionPath: [i],
            suspendedPaths: {},
            retryConfig: {
              attempts,
              delay: delay2
            },
            executionSpan
          },
          tracingContext: {
            currentSpan: workflowAISpan
          },
          abortController: params.abortController,
          emitter: params.emitter,
          runtimeContext: params.runtimeContext,
          writableStream: params.writableStream
        });
        if (lastOutput.result.status !== "success") {
          if (lastOutput.result.status === "bailed") {
            lastOutput.result.status = "success";
          }
          const result2 = await this.fmtReturnValue(executionSpan, params.emitter, stepResults, lastOutput.result);
          await this.persistStepUpdate({
            workflowId,
            runId,
            stepResults: lastOutput.stepResults,
            serializedStepGraph: params.serializedStepGraph,
            executionContext: lastOutput.executionContext,
            workflowStatus: result2.status,
            result: result2.result,
            error: result2.error,
            runtimeContext: params.runtimeContext
          });
          if (result2.error) {
            workflowAISpan?.error({
              error: result2.error,
              attributes: {
                status: result2.status
              }
            });
          } else {
            workflowAISpan?.end({
              output: result2.result,
              attributes: {
                status: result2.status
              }
            });
          }
          return result2;
        }
      } catch (e) {
        const error = e instanceof MastraError ? e : new MastraError({
          id: "WORKFLOW_ENGINE_STEP_EXECUTION_FAILED",
          domain: "MASTRA_WORKFLOW" /* MASTRA_WORKFLOW */,
          category: "USER" /* USER */,
          details: {
            workflowId,
            runId
          }
        }, e);
        this.logger?.trackException(error);
        this.logger?.error(`Error executing step: ${error?.stack}`);
        const result2 = await this.fmtReturnValue(executionSpan, params.emitter, stepResults, lastOutput.result, e);
        await this.persistStepUpdate({
          workflowId,
          runId,
          stepResults: lastOutput.stepResults,
          serializedStepGraph: params.serializedStepGraph,
          executionContext: lastOutput.executionContext,
          workflowStatus: result2.status,
          result: result2.result,
          error: result2.error,
          runtimeContext: params.runtimeContext
        });
        workflowAISpan?.error({
          error,
          attributes: {
            status: result2.status
          }
        });
        return result2;
      }
    }
    const result = await this.fmtReturnValue(executionSpan, params.emitter, stepResults, lastOutput.result);
    await this.persistStepUpdate({
      workflowId,
      runId,
      stepResults: lastOutput.stepResults,
      serializedStepGraph: params.serializedStepGraph,
      executionContext: lastOutput.executionContext,
      workflowStatus: result.status,
      result: result.result,
      error: result.error,
      runtimeContext: params.runtimeContext
    });
    workflowAISpan?.end({
      output: result.result,
      attributes: {
        status: result.status
      }
    });
    return result;
  }
  getStepOutput(stepResults, step) {
    if (!step) {
      return stepResults.input;
    } else if (step.type === "step" || step.type === "waitForEvent") {
      return stepResults[step.step.id]?.output;
    } else if (step.type === "sleep" || step.type === "sleepUntil") {
      return stepResults[step.id]?.output;
    } else if (step.type === "parallel" || step.type === "conditional") {
      return step.steps.reduce((acc, entry) => {
        if (entry.type === "step" || entry.type === "waitForEvent") {
          acc[entry.step.id] = stepResults[entry.step.id]?.output;
        } else if (entry.type === "parallel" || entry.type === "conditional") {
          const parallelResult = this.getStepOutput(stepResults, entry)?.output;
          acc = {
            ...acc,
            ...parallelResult
          };
        } else if (entry.type === "loop") {
          acc[entry.step.id] = stepResults[entry.step.id]?.output;
        } else if (entry.type === "foreach") {
          acc[entry.step.id] = stepResults[entry.step.id]?.output;
        } else if (entry.type === "sleep" || entry.type === "sleepUntil") {
          acc[entry.id] = stepResults[entry.id]?.output;
        }
        return acc;
      }, {});
    } else if (step.type === "loop") {
      return stepResults[step.step.id]?.output;
    } else if (step.type === "foreach") {
      return stepResults[step.step.id]?.output;
    }
  }
  async executeSleep({
    workflowId,
    runId,
    entry,
    prevOutput,
    stepResults,
    emitter,
    abortController,
    runtimeContext,
    writableStream,
    tracingContext
  }) {
    let {
      duration,
      fn
    } = entry;
    const sleepSpan = tracingContext.currentSpan?.createChildSpan({
      type: "workflow_sleep" /* WORKFLOW_SLEEP */,
      name: `sleep: ${duration ? `${duration}ms` : "dynamic"}`,
      attributes: {
        durationMs: duration,
        sleepType: fn ? "dynamic" : "fixed"
      }
    });
    if (fn) {
      const stepCallId = randomUUID();
      duration = await fn({
        runId,
        workflowId,
        mastra: this.mastra,
        runtimeContext,
        inputData: prevOutput,
        runCount: -1,
        tracingContext: {
          currentSpan: sleepSpan
        },
        getInitData: () => stepResults?.input,
        getStepResult: step => {
          if (!step?.id) {
            return null;
          }
          const result = stepResults[step.id];
          if (result?.status === "success") {
            return result.output;
          }
          return null;
        },
        // TODO: this function shouldn't have suspend probably?
        suspend: async _suspendPayload => {},
        bail: () => {},
        abort: () => {
          abortController?.abort();
        },
        [EMITTER_SYMBOL]: emitter,
        engine: {},
        abortSignal: abortController?.signal,
        writer: new ToolStream({
          prefix: "step",
          callId: stepCallId,
          name: "sleep",
          runId
        }, writableStream)
      });
      sleepSpan?.update({
        attributes: {
          durationMs: duration
        }
      });
    }
    try {
      await new Promise(resolve => setTimeout(resolve, !duration || duration < 0 ? 0 : duration));
      sleepSpan?.end();
    } catch (e) {
      sleepSpan?.error({
        error: e
      });
    }
  }
  async executeSleepUntil({
    workflowId,
    runId,
    entry,
    prevOutput,
    stepResults,
    emitter,
    abortController,
    runtimeContext,
    writableStream,
    tracingContext
  }) {
    let {
      date,
      fn
    } = entry;
    const sleepUntilSpan = tracingContext.currentSpan?.createChildSpan({
      type: "workflow_sleep" /* WORKFLOW_SLEEP */,
      name: `sleepUntil: ${date ? date.toISOString() : "dynamic"}`,
      attributes: {
        untilDate: date,
        durationMs: date ? Math.max(0, date.getTime() - Date.now()) : void 0,
        sleepType: fn ? "dynamic" : "fixed"
      }
    });
    if (fn) {
      const stepCallId = randomUUID();
      date = await fn({
        runId,
        workflowId,
        mastra: this.mastra,
        runtimeContext,
        inputData: prevOutput,
        runCount: -1,
        tracingContext: {
          currentSpan: sleepUntilSpan
        },
        getInitData: () => stepResults?.input,
        getStepResult: step => {
          if (!step?.id) {
            return null;
          }
          const result = stepResults[step.id];
          if (result?.status === "success") {
            return result.output;
          }
          return null;
        },
        // TODO: this function shouldn't have suspend probably?
        suspend: async _suspendPayload => {},
        bail: () => {},
        abort: () => {
          abortController?.abort();
        },
        [EMITTER_SYMBOL]: emitter,
        engine: {},
        abortSignal: abortController?.signal,
        writer: new ToolStream({
          prefix: "step",
          callId: stepCallId,
          name: "sleepUntil",
          runId
        }, writableStream)
      });
      const time2 = !date ? 0 : date.getTime() - Date.now();
      sleepUntilSpan?.update({
        attributes: {
          durationMs: Math.max(0, time2)
        }
      });
    }
    const time = !date ? 0 : date?.getTime() - Date.now();
    try {
      await new Promise(resolve => setTimeout(resolve, time < 0 ? 0 : time));
      sleepUntilSpan?.end();
    } catch (e) {
      sleepUntilSpan?.error({
        error: e
      });
    }
  }
  async executeWaitForEvent({
    event,
    emitter,
    timeout,
    tracingContext
  }) {
    const waitSpan = tracingContext?.currentSpan?.createChildSpan({
      type: "workflow_wait_event" /* WORKFLOW_WAIT_EVENT */,
      name: `wait: ${event}`,
      attributes: {
        eventName: event,
        timeoutMs: timeout
      }
    });
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const cb = eventData => {
        waitSpan?.end({
          output: eventData,
          attributes: {
            eventReceived: true,
            waitDurationMs: Date.now() - startTime
          }
        });
        resolve(eventData);
      };
      if (timeout) {
        setTimeout(() => {
          emitter.off(`user-event-${event}`, cb);
          const error = new Error("Timeout waiting for event");
          waitSpan?.error({
            error,
            attributes: {
              eventReceived: false,
              waitDurationMs: Date.now() - startTime
            }
          });
          reject(error);
        }, timeout);
      }
      emitter.once(`user-event-${event}`, cb);
    });
  }
  async executeStep({
    workflowId,
    runId,
    step,
    stepResults,
    executionContext,
    resume,
    prevOutput,
    emitter,
    abortController,
    runtimeContext,
    skipEmits = false,
    writableStream,
    serializedStepGraph,
    tracingContext
  }) {
    const startTime = resume?.steps[0] === step.id ? void 0 : Date.now();
    const resumeTime = resume?.steps[0] === step.id ? Date.now() : void 0;
    const stepCallId = randomUUID();
    const stepInfo = {
      ...stepResults[step.id],
      ...(resume?.steps[0] === step.id ? {
        resumePayload: resume?.resumePayload
      } : {
        payload: prevOutput
      }),
      ...(startTime ? {
        startedAt: startTime
      } : {}),
      ...(resumeTime ? {
        resumedAt: resumeTime
      } : {}),
      status: "running"
    };
    const stepAISpan = tracingContext.currentSpan?.createChildSpan({
      name: `workflow step: '${step.id}'`,
      type: "workflow_step" /* WORKFLOW_STEP */,
      input: prevOutput,
      attributes: {
        stepId: step.id
      }
    });
    if (!skipEmits) {
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          currentStep: {
            id: step.id,
            ...stepInfo
          },
          workflowState: {
            status: "running",
            steps: {
              ...stepResults,
              [step.id]: {
                ...stepInfo
              }
            },
            result: null,
            error: null
          }
        },
        eventTimestamp: Date.now()
      });
      await emitter.emit("watch-v2", {
        type: "step-start",
        payload: {
          id: step.id,
          stepCallId,
          ...stepInfo
        }
      });
    }
    await this.persistStepUpdate({
      workflowId,
      runId,
      serializedStepGraph,
      stepResults: {
        ...stepResults,
        [step.id]: stepInfo
      },
      executionContext,
      workflowStatus: "running",
      runtimeContext
    });
    const _runStep = (step2, spanName, attributes) => {
      return async data => {
        const telemetry = this.mastra?.getTelemetry();
        const span = executionContext.executionSpan;
        if (!telemetry || !span) {
          return step2.execute(data);
        }
        return context.with(trace.setSpan(context.active(), span), async () => {
          return telemetry.traceMethod(step2.execute.bind(step2), {
            spanName,
            attributes
          })(data);
        });
      };
    };
    const runStep = _runStep(step, `workflow.${workflowId}.step.${step.id}`, {
      componentName: workflowId,
      runId
    });
    let execResults;
    const retries = step.retries ?? executionContext.retryConfig.attempts ?? 0;
    const delay2 = executionContext.retryConfig.delay ?? 0;
    for (let i = 0; i < retries + 1; i++) {
      if (i > 0 && delay2) {
        await new Promise(resolve => setTimeout(resolve, delay2));
      }
      try {
        let suspended;
        let bailed;
        const result = await runStep({
          runId,
          workflowId,
          mastra: this.mastra ? wrapMastra(this.mastra, {
            currentSpan: stepAISpan
          }) : void 0,
          runtimeContext,
          inputData: prevOutput,
          runCount: this.getOrGenerateRunCount(step.id),
          resumeData: resume?.steps[0] === step.id ? resume?.resumePayload : void 0,
          tracingContext: {
            currentSpan: stepAISpan
          },
          getInitData: () => stepResults?.input,
          getStepResult: step2 => {
            if (!step2?.id) {
              return null;
            }
            const result2 = stepResults[step2.id];
            if (result2?.status === "success") {
              return result2.output;
            }
            return null;
          },
          suspend: async suspendPayload => {
            executionContext.suspendedPaths[step.id] = executionContext.executionPath;
            suspended = {
              payload: suspendPayload
            };
          },
          bail: result2 => {
            bailed = {
              payload: result2
            };
          },
          abort: () => {
            abortController?.abort();
          },
          // Only pass resume data if this step was actually suspended before
          // This prevents pending nested workflows from trying to resume instead of start
          resume: stepResults[step.id]?.status === "suspended" ? {
            steps: resume?.steps?.slice(1) || [],
            resumePayload: resume?.resumePayload,
            // @ts-ignore
            runId: stepResults[step.id]?.suspendPayload?.__workflow_meta?.runId
          } : void 0,
          [EMITTER_SYMBOL]: emitter,
          engine: {},
          abortSignal: abortController?.signal,
          writer: new ToolStream({
            prefix: "step",
            callId: stepCallId,
            name: step.id,
            runId
          }, writableStream)
        });
        if (suspended) {
          execResults = {
            status: "suspended",
            suspendPayload: suspended.payload,
            suspendedAt: Date.now()
          };
        } else if (bailed) {
          execResults = {
            status: "bailed",
            output: bailed.payload,
            endedAt: Date.now()
          };
        } else {
          execResults = {
            status: "success",
            output: result,
            endedAt: Date.now()
          };
        }
        break;
      } catch (e) {
        const error = e instanceof MastraError ? e : new MastraError({
          id: "WORKFLOW_STEP_INVOKE_FAILED",
          domain: "MASTRA_WORKFLOW" /* MASTRA_WORKFLOW */,
          category: "USER" /* USER */,
          details: {
            workflowId,
            runId,
            stepId: step.id
          }
        }, e);
        this.logger.trackException(error);
        this.logger.error(`Error executing step ${step.id}: ` + error?.stack);
        stepAISpan?.error({
          error,
          attributes: {
            status: "failed"
          }
        });
        execResults = {
          status: "failed",
          error: error?.stack,
          endedAt: Date.now()
        };
      }
    }
    if (!skipEmits) {
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          currentStep: {
            id: step.id,
            ...stepInfo,
            ...execResults
          },
          workflowState: {
            status: "running",
            steps: {
              ...stepResults,
              [step.id]: {
                ...stepInfo,
                ...execResults
              }
            },
            result: null,
            error: null
          }
        },
        eventTimestamp: Date.now()
      });
      if (execResults.status === "suspended") {
        await emitter.emit("watch-v2", {
          type: "step-suspended",
          payload: {
            id: step.id,
            stepCallId,
            ...execResults
          }
        });
      } else {
        await emitter.emit("watch-v2", {
          type: "step-result",
          payload: {
            id: step.id,
            stepCallId,
            ...execResults
          }
        });
        await emitter.emit("watch-v2", {
          type: "step-finish",
          payload: {
            id: step.id,
            stepCallId,
            metadata: {}
          }
        });
      }
    }
    if (execResults.status != "failed") {
      stepAISpan?.end({
        output: execResults.output,
        attributes: {
          status: execResults.status
        }
      });
    }
    return {
      ...stepInfo,
      ...execResults
    };
  }
  async executeParallel({
    workflowId,
    runId,
    entry,
    prevStep,
    serializedStepGraph,
    stepResults,
    resume,
    executionContext,
    tracingContext,
    emitter,
    abortController,
    runtimeContext,
    writableStream
  }) {
    const parallelSpan = tracingContext.currentSpan?.createChildSpan({
      type: "workflow_parallel" /* WORKFLOW_PARALLEL */,
      name: `parallel: ${entry.steps.length} branches`,
      input: this.getStepOutput(stepResults, prevStep),
      attributes: {
        branchCount: entry.steps.length,
        parallelSteps: entry.steps.map(s => s.type === "step" ? s.step.id : `control-${s.type}`)
      }
    });
    let execResults;
    const results = await Promise.all(entry.steps.map((step, i) => this.executeEntry({
      workflowId,
      runId,
      entry: step,
      prevStep,
      stepResults,
      serializedStepGraph,
      resume,
      executionContext: {
        workflowId,
        runId,
        executionPath: [...executionContext.executionPath, i],
        suspendedPaths: executionContext.suspendedPaths,
        retryConfig: executionContext.retryConfig,
        executionSpan: executionContext.executionSpan
      },
      tracingContext: {
        currentSpan: parallelSpan
      },
      emitter,
      abortController,
      runtimeContext,
      writableStream
    })));
    const hasFailed = results.find(result => result.result.status === "failed");
    const hasSuspended = results.find(result => result.result.status === "suspended");
    if (hasFailed) {
      execResults = {
        status: "failed",
        error: hasFailed.result.error
      };
    } else if (hasSuspended) {
      execResults = {
        status: "suspended",
        payload: hasSuspended.result.suspendPayload
      };
    } else if (abortController?.signal?.aborted) {
      execResults = {
        status: "canceled"
      };
    } else {
      execResults = {
        status: "success",
        output: results.reduce((acc, result, index) => {
          if (result.result.status === "success") {
            acc[entry.steps[index].step.id] = result.result.output;
          }
          return acc;
        }, {})
      };
    }
    if (execResults.status === "failed") {
      parallelSpan?.error({
        error: new Error(execResults.error)
      });
    } else {
      parallelSpan?.end({
        output: execResults.output || execResults
      });
    }
    return execResults;
  }
  async executeConditional({
    workflowId,
    runId,
    entry,
    prevOutput,
    prevStep,
    serializedStepGraph,
    stepResults,
    resume,
    executionContext,
    tracingContext,
    emitter,
    abortController,
    runtimeContext,
    writableStream
  }) {
    const conditionalSpan = tracingContext.currentSpan?.createChildSpan({
      type: "workflow_conditional" /* WORKFLOW_CONDITIONAL */,
      name: `conditional: ${entry.conditions.length} conditions`,
      input: prevOutput,
      attributes: {
        conditionCount: entry.conditions.length
      }
    });
    let execResults;
    const truthyIndexes = (await Promise.all(entry.conditions.map(async (cond, index) => {
      const evalSpan = conditionalSpan?.createChildSpan({
        type: "workflow_conditional_eval" /* WORKFLOW_CONDITIONAL_EVAL */,
        name: `condition ${index}`,
        input: prevOutput,
        attributes: {
          conditionIndex: index
        }
      });
      try {
        const result = await cond({
          runId,
          workflowId,
          mastra: this.mastra,
          runtimeContext,
          inputData: prevOutput,
          runCount: -1,
          tracingContext: {
            currentSpan: evalSpan
          },
          getInitData: () => stepResults?.input,
          getStepResult: step => {
            if (!step?.id) {
              return null;
            }
            const result2 = stepResults[step.id];
            if (result2?.status === "success") {
              return result2.output;
            }
            return null;
          },
          // TODO: this function shouldn't have suspend probably?
          suspend: async _suspendPayload => {},
          bail: () => {},
          abort: () => {
            abortController?.abort();
          },
          [EMITTER_SYMBOL]: emitter,
          engine: {},
          abortSignal: abortController?.signal,
          writer: new ToolStream({
            prefix: "step",
            callId: randomUUID(),
            name: "conditional",
            runId
          }, writableStream)
        });
        evalSpan?.end({
          output: result,
          attributes: {
            result: !!result
          }
        });
        return result ? index : null;
      } catch (e) {
        const error = e instanceof MastraError ? e : new MastraError({
          id: "WORKFLOW_CONDITION_EVALUATION_FAILED",
          domain: "MASTRA_WORKFLOW" /* MASTRA_WORKFLOW */,
          category: "USER" /* USER */,
          details: {
            workflowId,
            runId
          }
        }, e);
        this.logger.trackException(error);
        this.logger.error("Error evaluating condition: " + error?.stack);
        evalSpan?.error({
          error,
          attributes: {
            result: false
          }
        });
        return null;
      }
    }))).filter(index => index !== null);
    const stepsToRun = entry.steps.filter((_, index) => truthyIndexes.includes(index));
    conditionalSpan?.update({
      attributes: {
        truthyIndexes,
        selectedSteps: stepsToRun.map(s => s.type === "step" ? s.step.id : `control-${s.type}`)
      }
    });
    const stepsToExecute = stepsToRun.filter(step => {
      if (resume && step.type === "step") {
        const existingResult = stepResults[step.step.id];
        return !existingResult || existingResult.status === "suspended" || existingResult.status === "failed";
      }
      return true;
    });
    const results = await Promise.all(stepsToExecute.map((step, _index) => this.executeEntry({
      workflowId,
      runId,
      entry: step,
      prevStep,
      stepResults,
      serializedStepGraph,
      resume,
      executionContext: {
        workflowId,
        runId,
        executionPath: [...executionContext.executionPath, stepsToRun.indexOf(step)],
        suspendedPaths: executionContext.suspendedPaths,
        retryConfig: executionContext.retryConfig,
        executionSpan: executionContext.executionSpan
      },
      tracingContext: {
        currentSpan: conditionalSpan
      },
      emitter,
      abortController,
      runtimeContext,
      writableStream
    })));
    const mergedStepResults = {
      ...stepResults
    };
    results.forEach(result => {
      if ("stepResults" in result && result.stepResults) {
        Object.assign(mergedStepResults, result.stepResults);
      }
    });
    const allResults = stepsToRun.map(step => {
      if (step.type === "step") {
        const stepResult = mergedStepResults[step.step.id];
        if (stepResult) {
          return {
            result: stepResult
          };
        }
      }
      return {
        result: {
          status: "success",
          output: {}
        }
      };
    }).filter(Boolean);
    const hasFailed = allResults.find(result => result.result.status === "failed");
    const hasSuspended = allResults.find(result => result.result.status === "suspended");
    if (hasFailed) {
      execResults = {
        status: "failed",
        error: hasFailed.result.error
      };
    } else if (hasSuspended) {
      execResults = {
        status: "suspended",
        payload: hasSuspended.result.suspendPayload
      };
    } else if (abortController?.signal?.aborted) {
      execResults = {
        status: "canceled"
      };
    } else {
      execResults = {
        status: "success",
        output: allResults.reduce((acc, result, index) => {
          if (result.result.status === "success") {
            acc[stepsToRun[index].step.id] = result.result.output;
          }
          return acc;
        }, {})
      };
    }
    if (execResults.status === "failed") {
      conditionalSpan?.error({
        error: new Error(execResults.error)
      });
    } else {
      conditionalSpan?.end({
        output: execResults.output || execResults
      });
    }
    return execResults;
  }
  async executeLoop({
    workflowId,
    runId,
    entry,
    prevOutput,
    stepResults,
    resume,
    executionContext,
    tracingContext,
    emitter,
    abortController,
    runtimeContext,
    writableStream,
    serializedStepGraph
  }) {
    const {
      step,
      condition
    } = entry;
    const loopSpan = tracingContext.currentSpan?.createChildSpan({
      type: "workflow_loop" /* WORKFLOW_LOOP */,
      name: `loop: ${entry.loopType}`,
      input: prevOutput,
      attributes: {
        loopType: entry.loopType
      }
    });
    let isTrue = true;
    let iteration = 0;
    const prevPayload = stepResults[step.id]?.payload;
    let result = {
      status: "success",
      output: prevPayload ?? prevOutput
    };
    let currentResume = resume;
    do {
      result = await this.executeStep({
        workflowId,
        runId,
        step,
        stepResults,
        executionContext,
        resume: currentResume,
        prevOutput: result.output,
        tracingContext: {
          currentSpan: loopSpan
        },
        emitter,
        abortController,
        runtimeContext,
        writableStream,
        serializedStepGraph
      });
      if (currentResume && result.status !== "suspended") {
        currentResume = void 0;
      }
      if (result.status !== "success") {
        loopSpan?.end({
          attributes: {
            totalIterations: iteration
          }
        });
        return result;
      }
      const evalSpan = loopSpan?.createChildSpan({
        type: "workflow_conditional_eval" /* WORKFLOW_CONDITIONAL_EVAL */,
        name: `condition: ${entry.loopType}`,
        input: result.output,
        attributes: {
          conditionIndex: iteration
        }
      });
      isTrue = await condition({
        workflowId,
        runId,
        mastra: this.mastra,
        runtimeContext,
        inputData: result.output,
        runCount: -1,
        tracingContext: {
          currentSpan: evalSpan
        },
        getInitData: () => stepResults?.input,
        getStepResult: step2 => {
          if (!step2?.id) {
            return null;
          }
          const result2 = stepResults[step2.id];
          return result2?.status === "success" ? result2.output : null;
        },
        suspend: async _suspendPayload => {},
        bail: () => {},
        abort: () => {
          abortController?.abort();
        },
        [EMITTER_SYMBOL]: emitter,
        engine: {},
        abortSignal: abortController?.signal,
        writer: new ToolStream({
          prefix: "step",
          callId: randomUUID(),
          name: "loop",
          runId
        }, writableStream)
      });
      evalSpan?.end({
        output: isTrue
      });
      iteration++;
    } while (entry.loopType === "dowhile" ? isTrue : !isTrue);
    loopSpan?.end({
      output: result.output,
      attributes: {
        totalIterations: iteration
      }
    });
    return result;
  }
  async executeForeach({
    workflowId,
    runId,
    entry,
    prevOutput,
    stepResults,
    resume,
    executionContext,
    tracingContext,
    emitter,
    abortController,
    runtimeContext,
    writableStream,
    serializedStepGraph
  }) {
    const {
      step,
      opts
    } = entry;
    const results = [];
    const concurrency = opts.concurrency;
    const startTime = resume?.steps[0] === step.id ? void 0 : Date.now();
    const resumeTime = resume?.steps[0] === step.id ? Date.now() : void 0;
    const stepInfo = {
      ...stepResults[step.id],
      ...(resume?.steps[0] === step.id ? {
        resumePayload: resume?.resumePayload
      } : {
        payload: prevOutput
      }),
      ...(startTime ? {
        startedAt: startTime
      } : {}),
      ...(resumeTime ? {
        resumedAt: resumeTime
      } : {})
    };
    const loopSpan = tracingContext.currentSpan?.createChildSpan({
      type: "workflow_loop" /* WORKFLOW_LOOP */,
      name: `loop: foreach`,
      input: prevOutput,
      attributes: {
        loopType: "foreach",
        concurrency
      }
    });
    await emitter.emit("watch", {
      type: "watch",
      payload: {
        currentStep: {
          id: step.id,
          status: "running",
          ...stepInfo
        },
        workflowState: {
          status: "running",
          steps: {
            ...stepResults,
            [step.id]: {
              status: "running",
              ...stepInfo
            }
          },
          result: null,
          error: null
        }
      },
      eventTimestamp: Date.now()
    });
    await emitter.emit("watch-v2", {
      type: "step-start",
      payload: {
        id: step.id,
        ...stepInfo,
        status: "running"
      }
    });
    for (let i = 0; i < prevOutput.length; i += concurrency) {
      const items = prevOutput.slice(i, i + concurrency);
      const itemsResults = await Promise.all(items.map(item => {
        return this.executeStep({
          workflowId,
          runId,
          step,
          stepResults,
          executionContext,
          resume,
          prevOutput: item,
          tracingContext,
          emitter,
          abortController,
          runtimeContext,
          skipEmits: true,
          writableStream,
          serializedStepGraph
        });
      }));
      for (const result of itemsResults) {
        if (result.status !== "success") {
          const {
            status,
            error,
            suspendPayload,
            suspendedAt,
            endedAt,
            output
          } = result;
          const execResults = {
            status,
            error,
            suspendPayload,
            suspendedAt,
            endedAt,
            output
          };
          await emitter.emit("watch", {
            type: "watch",
            payload: {
              currentStep: {
                id: step.id,
                ...stepInfo,
                ...execResults
              },
              workflowState: {
                status: "running",
                steps: {
                  ...stepResults,
                  [step.id]: {
                    ...stepInfo,
                    ...execResults
                  }
                },
                result: null,
                error: null
              }
            },
            eventTimestamp: Date.now()
          });
          if (execResults.status === "suspended") {
            await emitter.emit("watch-v2", {
              type: "step-suspended",
              payload: {
                id: step.id,
                ...execResults
              }
            });
          } else {
            await emitter.emit("watch-v2", {
              type: "step-result",
              payload: {
                id: step.id,
                ...execResults
              }
            });
            await emitter.emit("watch-v2", {
              type: "step-finish",
              payload: {
                id: step.id,
                metadata: {}
              }
            });
          }
          if (execResults.error) {
            loopSpan?.error({
              error: execResults.error
            });
          } else {
            loopSpan?.end({
              output: result
            });
          }
          return result;
        }
        results.push(result?.output);
      }
    }
    await emitter.emit("watch", {
      type: "watch",
      payload: {
        currentStep: {
          id: step.id,
          ...stepInfo,
          status: "success",
          output: results,
          endedAt: Date.now()
        },
        workflowState: {
          status: "running",
          steps: {
            ...stepResults,
            [step.id]: {
              ...stepInfo,
              status: "success",
              output: results,
              endedAt: Date.now()
            }
          },
          result: null,
          error: null
        }
      },
      eventTimestamp: Date.now()
    });
    await emitter.emit("watch-v2", {
      type: "step-result",
      payload: {
        id: step.id,
        status: "success",
        output: results,
        endedAt: Date.now()
      }
    });
    await emitter.emit("watch-v2", {
      type: "step-finish",
      payload: {
        id: step.id,
        metadata: {}
      }
    });
    loopSpan?.end({
      output: results
    });
    return {
      ...stepInfo,
      status: "success",
      output: results,
      //@ts-ignore
      endedAt: Date.now()
    };
  }
  async persistStepUpdate({
    workflowId,
    runId,
    stepResults,
    serializedStepGraph,
    executionContext,
    workflowStatus,
    result,
    error,
    runtimeContext
  }) {
    const runtimeContextObj = {};
    runtimeContext.forEach((value, key) => {
      runtimeContextObj[key] = value;
    });
    await this.mastra?.getStorage()?.persistWorkflowSnapshot({
      workflowName: workflowId,
      runId,
      snapshot: {
        runId,
        status: workflowStatus,
        value: {},
        context: stepResults,
        activePaths: [],
        serializedStepGraph,
        suspendedPaths: executionContext.suspendedPaths,
        waitingPaths: {},
        result,
        error,
        runtimeContext: runtimeContextObj,
        // @ts-ignore
        timestamp: Date.now()
      }
    });
  }
  async executeEntry({
    workflowId,
    runId,
    entry,
    prevStep,
    serializedStepGraph,
    stepResults,
    resume,
    executionContext,
    tracingContext,
    emitter,
    abortController,
    runtimeContext,
    writableStream
  }) {
    const prevOutput = this.getStepOutput(stepResults, prevStep);
    let execResults;
    if (entry.type === "step") {
      const {
        step
      } = entry;
      execResults = await this.executeStep({
        workflowId,
        runId,
        step,
        stepResults,
        executionContext,
        resume,
        prevOutput,
        tracingContext,
        emitter,
        abortController,
        runtimeContext,
        writableStream,
        serializedStepGraph
      });
    } else if (resume?.resumePath?.length && entry.type === "parallel") {
      const idx = resume.resumePath.shift();
      const resumedStepResult = await this.executeEntry({
        workflowId,
        runId,
        entry: entry.steps[idx],
        prevStep,
        serializedStepGraph,
        stepResults,
        resume,
        executionContext: {
          workflowId,
          runId,
          executionPath: [...executionContext.executionPath, idx],
          suspendedPaths: executionContext.suspendedPaths,
          retryConfig: executionContext.retryConfig,
          executionSpan: executionContext.executionSpan
        },
        tracingContext,
        emitter,
        abortController,
        runtimeContext,
        writableStream
      });
      if (resumedStepResult.stepResults) {
        Object.assign(stepResults, resumedStepResult.stepResults);
      }
      const allParallelStepsComplete = entry.steps.every(parallelStep => {
        if (parallelStep.type === "step") {
          const stepResult = stepResults[parallelStep.step.id];
          return stepResult && stepResult.status === "success";
        }
        return true;
      });
      if (allParallelStepsComplete) {
        execResults = {
          status: "success",
          output: entry.steps.reduce((acc, parallelStep) => {
            if (parallelStep.type === "step") {
              const stepResult = stepResults[parallelStep.step.id];
              if (stepResult && stepResult.status === "success") {
                acc[parallelStep.step.id] = stepResult.output;
              }
            }
            return acc;
          }, {})
        };
      } else {
        const stillSuspended = entry.steps.find(parallelStep => {
          if (parallelStep.type === "step") {
            const stepResult = stepResults[parallelStep.step.id];
            return stepResult && stepResult.status === "suspended";
          }
          return false;
        });
        execResults = {
          status: "suspended",
          payload: stillSuspended && stillSuspended.type === "step" ? stepResults[stillSuspended.step.id]?.suspendPayload : {}
        };
      }
      const updatedExecutionContext = {
        ...executionContext,
        ...resumedStepResult.executionContext,
        suspendedPaths: {
          ...executionContext.suspendedPaths,
          ...resumedStepResult.executionContext?.suspendedPaths
        }
      };
      if (execResults.status === "suspended") {
        entry.steps.forEach((parallelStep, stepIndex) => {
          if (parallelStep.type === "step") {
            const stepResult = stepResults[parallelStep.step.id];
            if (stepResult && stepResult.status === "suspended") {
              updatedExecutionContext.suspendedPaths[parallelStep.step.id] = [...executionContext.executionPath, stepIndex];
            }
          }
        });
      }
      return {
        result: execResults,
        stepResults: resumedStepResult.stepResults,
        executionContext: updatedExecutionContext
      };
    } else if (entry.type === "parallel") {
      execResults = await this.executeParallel({
        workflowId,
        runId,
        entry,
        prevStep,
        stepResults,
        serializedStepGraph,
        resume,
        executionContext,
        tracingContext,
        emitter,
        abortController,
        runtimeContext,
        writableStream
      });
    } else if (entry.type === "conditional") {
      execResults = await this.executeConditional({
        workflowId,
        runId,
        entry,
        prevStep,
        prevOutput,
        stepResults,
        serializedStepGraph,
        resume,
        executionContext,
        tracingContext,
        emitter,
        abortController,
        runtimeContext,
        writableStream
      });
    } else if (entry.type === "loop") {
      execResults = await this.executeLoop({
        workflowId,
        runId,
        entry,
        prevStep,
        prevOutput,
        stepResults,
        resume,
        executionContext,
        tracingContext,
        emitter,
        abortController,
        runtimeContext,
        writableStream,
        serializedStepGraph
      });
    } else if (entry.type === "foreach") {
      execResults = await this.executeForeach({
        workflowId,
        runId,
        entry,
        prevStep,
        prevOutput,
        stepResults,
        resume,
        executionContext,
        tracingContext,
        emitter,
        abortController,
        runtimeContext,
        writableStream,
        serializedStepGraph
      });
    } else if (entry.type === "sleep") {
      const startedAt = Date.now();
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          currentStep: {
            id: entry.id,
            status: "waiting",
            payload: prevOutput,
            startedAt
          },
          workflowState: {
            status: "waiting",
            steps: {
              ...stepResults,
              [entry.id]: {
                status: "waiting",
                payload: prevOutput,
                startedAt
              }
            },
            result: null,
            error: null
          }
        },
        eventTimestamp: Date.now()
      });
      await emitter.emit("watch-v2", {
        type: "step-waiting",
        payload: {
          id: entry.id,
          payload: prevOutput,
          startedAt,
          status: "waiting"
        }
      });
      await this.persistStepUpdate({
        workflowId,
        runId,
        serializedStepGraph,
        stepResults,
        executionContext,
        workflowStatus: "waiting",
        runtimeContext
      });
      await this.executeSleep({
        workflowId,
        runId,
        entry,
        prevStep,
        prevOutput,
        stepResults,
        serializedStepGraph,
        resume,
        executionContext,
        tracingContext,
        emitter,
        abortController,
        runtimeContext,
        writableStream
      });
      await this.persistStepUpdate({
        workflowId,
        runId,
        serializedStepGraph,
        stepResults,
        executionContext,
        workflowStatus: "running",
        runtimeContext
      });
      const endedAt = Date.now();
      const stepInfo = {
        payload: prevOutput,
        startedAt,
        endedAt
      };
      execResults = {
        ...stepInfo,
        status: "success",
        output: prevOutput
      };
      stepResults[entry.id] = {
        ...stepInfo,
        status: "success",
        output: prevOutput
      };
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          currentStep: {
            id: entry.id,
            ...execResults
          },
          workflowState: {
            status: "running",
            steps: {
              ...stepResults,
              [entry.id]: {
                ...execResults
              }
            },
            result: null,
            error: null
          }
        },
        eventTimestamp: Date.now()
      });
      await emitter.emit("watch-v2", {
        type: "step-result",
        payload: {
          id: entry.id,
          endedAt,
          status: "success",
          output: prevOutput
        }
      });
      await emitter.emit("watch-v2", {
        type: "step-finish",
        payload: {
          id: entry.id,
          metadata: {}
        }
      });
    } else if (entry.type === "sleepUntil") {
      const startedAt = Date.now();
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          currentStep: {
            id: entry.id,
            status: "waiting",
            payload: prevOutput,
            startedAt
          },
          workflowState: {
            status: "waiting",
            steps: {
              ...stepResults,
              [entry.id]: {
                status: "waiting",
                payload: prevOutput,
                startedAt
              }
            },
            result: null,
            error: null
          }
        },
        eventTimestamp: Date.now()
      });
      await emitter.emit("watch-v2", {
        type: "step-waiting",
        payload: {
          id: entry.id,
          payload: prevOutput,
          startedAt,
          status: "waiting"
        }
      });
      await this.persistStepUpdate({
        workflowId,
        runId,
        serializedStepGraph,
        stepResults,
        executionContext,
        workflowStatus: "waiting",
        runtimeContext
      });
      await this.executeSleepUntil({
        workflowId,
        runId,
        entry,
        prevStep,
        prevOutput,
        stepResults,
        serializedStepGraph,
        resume,
        executionContext,
        tracingContext,
        emitter,
        abortController,
        runtimeContext,
        writableStream
      });
      await this.persistStepUpdate({
        workflowId,
        runId,
        serializedStepGraph,
        stepResults,
        executionContext,
        workflowStatus: "running",
        runtimeContext
      });
      const endedAt = Date.now();
      const stepInfo = {
        payload: prevOutput,
        startedAt,
        endedAt
      };
      execResults = {
        ...stepInfo,
        status: "success",
        output: prevOutput
      };
      stepResults[entry.id] = {
        ...stepInfo,
        status: "success",
        output: prevOutput
      };
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          currentStep: {
            id: entry.id,
            ...execResults
          },
          workflowState: {
            status: "running",
            steps: {
              ...stepResults,
              [entry.id]: {
                ...execResults
              }
            },
            result: null,
            error: null
          }
        },
        eventTimestamp: Date.now()
      });
      await emitter.emit("watch-v2", {
        type: "step-result",
        payload: {
          id: entry.id,
          endedAt,
          status: "success",
          output: prevOutput
        }
      });
      await emitter.emit("watch-v2", {
        type: "step-finish",
        payload: {
          id: entry.id,
          metadata: {}
        }
      });
    } else if (entry.type === "waitForEvent") {
      const startedAt = Date.now();
      let eventData;
      await emitter.emit("watch", {
        type: "watch",
        payload: {
          currentStep: {
            id: entry.step.id,
            status: "waiting",
            payload: prevOutput,
            startedAt
          },
          workflowState: {
            status: "waiting",
            steps: {
              ...stepResults,
              [entry.step.id]: {
                status: "waiting",
                payload: prevOutput,
                startedAt
              }
            },
            result: null,
            error: null
          }
        },
        eventTimestamp: Date.now()
      });
      await emitter.emit("watch-v2", {
        type: "step-waiting",
        payload: {
          id: entry.step.id,
          payload: prevOutput,
          startedAt,
          status: "waiting"
        }
      });
      await this.persistStepUpdate({
        workflowId,
        runId,
        serializedStepGraph,
        stepResults,
        executionContext,
        workflowStatus: "waiting",
        runtimeContext
      });
      try {
        eventData = await this.executeWaitForEvent({
          event: entry.event,
          emitter,
          timeout: entry.timeout,
          tracingContext
        });
        const {
          step
        } = entry;
        execResults = await this.executeStep({
          workflowId,
          runId,
          step,
          stepResults,
          executionContext,
          resume: {
            resumePayload: eventData,
            steps: [entry.step.id]
          },
          prevOutput,
          tracingContext,
          emitter,
          abortController,
          runtimeContext,
          writableStream,
          serializedStepGraph
        });
      } catch (error) {
        execResults = {
          status: "failed",
          error
        };
      }
      const endedAt = Date.now();
      const stepInfo = {
        payload: prevOutput,
        startedAt,
        endedAt
      };
      execResults = {
        ...execResults,
        ...stepInfo
      };
    }
    if (entry.type === "step" || entry.type === "waitForEvent" || entry.type === "loop" || entry.type === "foreach") {
      stepResults[entry.step.id] = execResults;
    }
    if (abortController?.signal?.aborted) {
      execResults = {
        ...execResults,
        status: "canceled"
      };
    }
    await this.persistStepUpdate({
      workflowId,
      runId,
      serializedStepGraph,
      stepResults,
      executionContext,
      workflowStatus: execResults.status === "success" ? "running" : execResults.status,
      runtimeContext
    });
    return {
      result: execResults,
      stepResults,
      executionContext
    };
  }
};
function createStep(params) {
  const wrapExecute = execute2 => {
    return async executeParams => {
      const executeResult = await execute2(executeParams);
      if (params instanceof Agent || params instanceof Tool) {
        return executeResult;
      }
      let scorersToUse = params.scorers;
      if (typeof scorersToUse === "function") {
        scorersToUse = await scorersToUse({
          runtimeContext: executeParams.runtimeContext
        });
      }
      if (scorersToUse && Object.keys(scorersToUse || {}).length > 0) {
        for (const [id, scorerObject] of Object.entries(scorersToUse || {})) {
          runScorer({
            scorerId: id,
            scorerObject,
            runId: executeParams.runId,
            input: [executeParams.inputData],
            output: executeResult,
            runtimeContext: executeParams.runtimeContext,
            entity: {
              id: executeParams.workflowId,
              stepId: params.id
            },
            structuredOutput: true,
            source: "LIVE",
            entityType: "WORKFLOW"
          });
        }
      }
      return executeResult;
    };
  };
  if (params instanceof Agent) {
    return {
      id: params.name,
      // @ts-ignore
      inputSchema: objectType({
        prompt: stringType()
        // resourceId: z.string().optional(),
        // threadId: z.string().optional(),
      }),
      // @ts-ignore
      outputSchema: objectType({
        text: stringType()
      }),
      execute: wrapExecute(async ({
        inputData,
        [EMITTER_SYMBOL]: emitter,
        runtimeContext,
        abortSignal,
        abort
      }) => {
        let streamPromise = {};
        streamPromise.promise = new Promise((resolve, reject) => {
          streamPromise.resolve = resolve;
          streamPromise.reject = reject;
        });
        const toolData = {
          name: params.name,
          args: inputData
        };
        await emitter.emit("watch-v2", {
          type: "tool-call-streaming-start",
          ...toolData
        });
        const {
          fullStream
        } = await params.stream(inputData.prompt, {
          // resourceId: inputData.resourceId,
          // threadId: inputData.threadId,
          runtimeContext,
          onFinish: result => {
            streamPromise.resolve(result.text);
          },
          abortSignal
        });
        if (abortSignal.aborted) {
          return abort();
        }
        for await (const chunk of fullStream) {
          switch (chunk.type) {
            case "text-delta":
              await emitter.emit("watch-v2", {
                type: "tool-call-delta",
                ...toolData,
                argsTextDelta: chunk.textDelta
              });
              break;
            case "step-start":
            case "step-finish":
            case "finish":
              break;
            case "tool-call":
            case "tool-result":
            case "tool-call-streaming-start":
            case "tool-call-delta":
            case "source":
            case "file":
            default:
              await emitter.emit("watch-v2", chunk);
              break;
          }
        }
        return {
          text: await streamPromise.promise
        };
      })
    };
  }
  if (params instanceof Tool) {
    if (!params.inputSchema || !params.outputSchema) {
      throw new Error("Tool must have input and output schemas defined");
    }
    return {
      // TODO: tool probably should have strong id type
      // @ts-ignore
      id: params.id,
      inputSchema: params.inputSchema,
      outputSchema: params.outputSchema,
      execute: wrapExecute(async ({
        inputData,
        mastra,
        runtimeContext
      }) => {
        return params.execute({
          context: inputData,
          mastra,
          runtimeContext
        });
      })
    };
  }
  return {
    id: params.id,
    description: params.description,
    inputSchema: params.inputSchema,
    outputSchema: params.outputSchema,
    resumeSchema: params.resumeSchema,
    suspendSchema: params.suspendSchema,
    scorers: params.scorers,
    retries: params.retries,
    execute: wrapExecute(params.execute)
  };
}
function createWorkflow(params) {
  return new Workflow(params);
}
var Workflow = class extends MastraBase {
  id;
  description;
  inputSchema;
  outputSchema;
  steps;
  stepDefs;
  stepFlow;
  serializedStepFlow;
  executionEngine;
  executionGraph;
  retryConfig;
  #mastra;
  #runs = /* @__PURE__ */new Map();
  constructor({
    mastra,
    id,
    inputSchema,
    outputSchema,
    description,
    executionEngine,
    retryConfig,
    steps
  }) {
    super({
      name: id,
      component: RegisteredLogger.WORKFLOW
    });
    this.id = id;
    this.description = description;
    this.inputSchema = inputSchema;
    this.outputSchema = outputSchema;
    this.retryConfig = retryConfig ?? {
      attempts: 0,
      delay: 0
    };
    this.executionGraph = this.buildExecutionGraph();
    this.stepFlow = [];
    this.serializedStepFlow = [];
    this.#mastra = mastra;
    this.steps = {};
    this.stepDefs = steps;
    if (!executionEngine) {
      this.executionEngine = new DefaultExecutionEngine({
        mastra: this.#mastra
      });
    } else {
      this.executionEngine = executionEngine;
    }
    this.#runs = /* @__PURE__ */new Map();
  }
  get runs() {
    return this.#runs;
  }
  get mastra() {
    return this.#mastra;
  }
  __registerMastra(mastra) {
    this.#mastra = mastra;
    this.executionEngine.__registerMastra(mastra);
  }
  __registerPrimitives(p) {
    if (p.telemetry) {
      this.__setTelemetry(p.telemetry);
    }
    if (p.logger) {
      this.__setLogger(p.logger);
    }
  }
  setStepFlow(stepFlow) {
    this.stepFlow = stepFlow;
  }
  /**
   * Adds a step to the workflow
   * @param step The step to add to the workflow
   * @returns The workflow instance for chaining
   */
  then(step) {
    this.stepFlow.push({
      type: "step",
      step
    });
    this.serializedStepFlow.push({
      type: "step",
      step: {
        id: step.id,
        description: step.description,
        component: step.component,
        serializedStepFlow: step.serializedStepFlow
      }
    });
    this.steps[step.id] = step;
    return this;
  }
  /**
   * Adds a sleep step to the workflow
   * @param duration The duration to sleep for
   * @returns The workflow instance for chaining
   */
  sleep(duration) {
    const id = `sleep_${this.#mastra?.generateId() || randomUUID()}`;
    const opts = typeof duration === "function" ? {
      type: "sleep",
      id,
      fn: duration
    } : {
      type: "sleep",
      id,
      duration
    };
    const serializedOpts = typeof duration === "function" ? {
      type: "sleep",
      id,
      fn: duration.toString()
    } : {
      type: "sleep",
      id,
      duration
    };
    this.stepFlow.push(opts);
    this.serializedStepFlow.push(serializedOpts);
    this.steps[id] = createStep({
      id,
      inputSchema: objectType({}),
      outputSchema: objectType({}),
      execute: async () => {
        return {};
      }
    });
    return this;
  }
  /**
   * Adds a sleep until step to the workflow
   * @param date The date to sleep until
   * @returns The workflow instance for chaining
   */
  sleepUntil(date) {
    const id = `sleep_${this.#mastra?.generateId() || randomUUID()}`;
    const opts = typeof date === "function" ? {
      type: "sleepUntil",
      id,
      fn: date
    } : {
      type: "sleepUntil",
      id,
      date
    };
    const serializedOpts = typeof date === "function" ? {
      type: "sleepUntil",
      id,
      fn: date.toString()
    } : {
      type: "sleepUntil",
      id,
      date
    };
    this.stepFlow.push(opts);
    this.serializedStepFlow.push(serializedOpts);
    this.steps[id] = createStep({
      id,
      inputSchema: objectType({}),
      outputSchema: objectType({}),
      execute: async () => {
        return {};
      }
    });
    return this;
  }
  waitForEvent(event, step, opts) {
    this.stepFlow.push({
      type: "waitForEvent",
      event,
      step,
      timeout: opts?.timeout
    });
    this.serializedStepFlow.push({
      type: "waitForEvent",
      event,
      step: {
        id: step.id,
        description: step.description,
        component: step.component,
        serializedStepFlow: step.serializedStepFlow
      },
      timeout: opts?.timeout
    });
    this.steps[step.id] = step;
    return this;
  }
  map(mappingConfig, stepOptions) {
    if (typeof mappingConfig === "function") {
      const mappingStep2 = createStep({
        id: stepOptions?.id || `mapping_${this.#mastra?.generateId() || randomUUID()}`,
        inputSchema: objectType({}),
        outputSchema: objectType({}),
        execute: mappingConfig
      });
      this.stepFlow.push({
        type: "step",
        step: mappingStep2
      });
      this.serializedStepFlow.push({
        type: "step",
        step: {
          id: mappingStep2.id,
          mapConfig: mappingConfig.toString()
        }
      });
      return this;
    }
    const newMappingConfig = Object.entries(mappingConfig).reduce((a, [key, mapping]) => {
      const m = mapping;
      if (m.value !== void 0) {
        a[key] = m;
      } else if (m.fn !== void 0) {
        a[key] = {
          fn: m.fn.toString(),
          schema: m.schema
        };
      } else if (m.runtimeContextPath) {
        a[key] = {
          runtimeContextPath: m.runtimeContextPath,
          schema: m.schema
        };
      } else {
        a[key] = m;
      }
      return a;
    }, {});
    const mappingStep = createStep({
      id: stepOptions?.id || `mapping_${this.#mastra?.generateId() || randomUUID()}`,
      inputSchema: objectType({}),
      outputSchema: objectType({}),
      execute: async ctx => {
        const {
          getStepResult: getStepResult2,
          getInitData,
          runtimeContext
        } = ctx;
        const result = {};
        for (const [key, mapping] of Object.entries(mappingConfig)) {
          const m = mapping;
          if (m.value !== void 0) {
            result[key] = m.value;
            continue;
          }
          if (m.fn !== void 0) {
            result[key] = await m.fn(ctx);
            continue;
          }
          if (m.runtimeContextPath) {
            result[key] = runtimeContext.get(m.runtimeContextPath);
            continue;
          }
          const stepResult = m.initData ? getInitData() : getStepResult2(Array.isArray(m.step) ? m.step.find(s => getStepResult2(s)) : m.step);
          if (m.path === ".") {
            result[key] = stepResult;
            continue;
          }
          const pathParts = m.path.split(".");
          let value = stepResult;
          for (const part of pathParts) {
            if (typeof value === "object" && value !== null) {
              value = value[part];
            } else {
              throw new Error(`Invalid path ${m.path} in step ${m?.step?.id ?? "initData"}`);
            }
          }
          result[key] = value;
        }
        return result;
      }
    });
    this.stepFlow.push({
      type: "step",
      step: mappingStep
    });
    this.serializedStepFlow.push({
      type: "step",
      step: {
        id: mappingStep.id,
        mapConfig: JSON.stringify(newMappingConfig, null, 2)
      }
    });
    return this;
  }
  // TODO: make typing better here
  parallel(steps) {
    this.stepFlow.push({
      type: "parallel",
      steps: steps.map(step => ({
        type: "step",
        step
      }))
    });
    this.serializedStepFlow.push({
      type: "parallel",
      steps: steps.map(step => ({
        type: "step",
        step: {
          id: step.id,
          description: step.description,
          component: step.component,
          serializedStepFlow: step.serializedStepFlow
        }
      }))
    });
    steps.forEach(step => {
      this.steps[step.id] = step;
    });
    return this;
  }
  // TODO: make typing better here
  branch(steps) {
    this.stepFlow.push({
      type: "conditional",
      steps: steps.map(([_cond, step]) => ({
        type: "step",
        step
      })),
      // @ts-ignore
      conditions: steps.map(([cond]) => cond),
      serializedConditions: steps.map(([cond, _step]) => ({
        id: `${_step.id}-condition`,
        fn: cond.toString()
      }))
    });
    this.serializedStepFlow.push({
      type: "conditional",
      steps: steps.map(([_cond, step]) => ({
        type: "step",
        step: {
          id: step.id,
          description: step.description,
          component: step.component,
          serializedStepFlow: step.serializedStepFlow
        }
      })),
      serializedConditions: steps.map(([cond, _step]) => ({
        id: `${_step.id}-condition`,
        fn: cond.toString()
      }))
    });
    steps.forEach(([_, step]) => {
      this.steps[step.id] = step;
    });
    return this;
  }
  dowhile(step, condition) {
    this.stepFlow.push({
      type: "loop",
      step,
      // @ts-ignore
      condition,
      loopType: "dowhile",
      serializedCondition: {
        id: `${step.id}-condition`,
        fn: condition.toString()
      }
    });
    this.serializedStepFlow.push({
      type: "loop",
      step: {
        id: step.id,
        description: step.description,
        component: step.component,
        serializedStepFlow: step.serializedStepFlow
      },
      serializedCondition: {
        id: `${step.id}-condition`,
        fn: condition.toString()
      },
      loopType: "dowhile"
    });
    this.steps[step.id] = step;
    return this;
  }
  dountil(step, condition) {
    this.stepFlow.push({
      type: "loop",
      step,
      // @ts-ignore
      condition,
      loopType: "dountil",
      serializedCondition: {
        id: `${step.id}-condition`,
        fn: condition.toString()
      }
    });
    this.serializedStepFlow.push({
      type: "loop",
      step: {
        id: step.id,
        description: step.description,
        component: step.component,
        serializedStepFlow: step.serializedStepFlow
      },
      serializedCondition: {
        id: `${step.id}-condition`,
        fn: condition.toString()
      },
      loopType: "dountil"
    });
    this.steps[step.id] = step;
    return this;
  }
  foreach(step, opts) {
    this.stepFlow.push({
      type: "foreach",
      step,
      opts: opts ?? {
        concurrency: 1
      }
    });
    this.serializedStepFlow.push({
      type: "foreach",
      step: {
        id: step.id,
        description: step.description,
        component: step.component,
        serializedStepFlow: step.serializedStepFlow
      },
      opts: opts ?? {
        concurrency: 1
      }
    });
    this.steps[step.id] = step;
    return this;
  }
  /**
   * Builds the execution graph for this workflow
   * @returns The execution graph that can be used to execute the workflow
   */
  buildExecutionGraph() {
    return {
      id: this.id,
      steps: this.stepFlow
    };
  }
  /**
   * Finalizes the workflow definition and prepares it for execution
   * This method should be called after all steps have been added to the workflow
   * @returns A built workflow instance ready for execution
   */
  commit() {
    this.executionGraph = this.buildExecutionGraph();
    return this;
  }
  get stepGraph() {
    return this.stepFlow;
  }
  get serializedStepGraph() {
    return this.serializedStepFlow;
  }
  /**
   * Creates a new workflow run instance
   * @param options Optional configuration for the run
   * @returns A Run instance that can be used to execute the workflow
   */
  createRun(options) {
    if (this.stepFlow.length === 0) {
      throw new Error("Execution flow of workflow is not defined. Add steps to the workflow via .then(), .branch(), etc.");
    }
    if (!this.executionGraph.steps) {
      throw new Error("Uncommitted step flow changes detected. Call .commit() to register the steps.");
    }
    const runIdToUse = options?.runId || this.#mastra?.generateId() || randomUUID();
    const run = this.#runs.get(runIdToUse) ?? new Run({
      workflowId: this.id,
      runId: runIdToUse,
      executionEngine: this.executionEngine,
      executionGraph: this.executionGraph,
      mastra: this.#mastra,
      retryConfig: this.retryConfig,
      serializedStepGraph: this.serializedStepGraph,
      cleanup: () => this.#runs.delete(runIdToUse)
    });
    this.#runs.set(runIdToUse, run);
    this.mastra?.getLogger().warn("createRun() is deprecated. Use createRunAsync() instead.");
    return run;
  }
  /**
   * Creates a new workflow run instance and stores a snapshot of the workflow in the storage
   * @param options Optional configuration for the run
   * @returns A Run instance that can be used to execute the workflow
   */
  async createRunAsync(options) {
    if (this.stepFlow.length === 0) {
      throw new Error("Execution flow of workflow is not defined. Add steps to the workflow via .then(), .branch(), etc.");
    }
    if (!this.executionGraph.steps) {
      throw new Error("Uncommitted step flow changes detected. Call .commit() to register the steps.");
    }
    const runIdToUse = options?.runId || this.#mastra?.generateId() || randomUUID();
    const run = this.#runs.get(runIdToUse) ?? new Run({
      workflowId: this.id,
      runId: runIdToUse,
      executionEngine: this.executionEngine,
      executionGraph: this.executionGraph,
      mastra: this.#mastra,
      retryConfig: this.retryConfig,
      serializedStepGraph: this.serializedStepGraph,
      cleanup: () => this.#runs.delete(runIdToUse)
    });
    this.#runs.set(runIdToUse, run);
    const workflowSnapshotInStorage = await this.getWorkflowRunExecutionResult(runIdToUse);
    if (!workflowSnapshotInStorage) {
      await this.mastra?.getStorage()?.persistWorkflowSnapshot({
        workflowName: this.id,
        runId: runIdToUse,
        snapshot: {
          runId: runIdToUse,
          status: "pending",
          value: {},
          context: {},
          activePaths: [],
          serializedStepGraph: this.serializedStepGraph,
          suspendedPaths: {},
          waitingPaths: {},
          result: void 0,
          error: void 0,
          // @ts-ignore
          timestamp: Date.now()
        }
      });
    }
    return run;
  }
  async getScorers({
    runtimeContext = new RuntimeContext()
  } = {}) {
    const steps = this.steps;
    if (!steps || Object.keys(steps).length === 0) {
      return {};
    }
    const scorers = {};
    for (const step of Object.values(steps)) {
      if (step.scorers) {
        let scorersToUse = step.scorers;
        if (typeof scorersToUse === "function") {
          scorersToUse = await scorersToUse({
            runtimeContext
          });
        }
        for (const [id, scorer] of Object.entries(scorersToUse)) {
          scorers[id] = scorer;
        }
      }
    }
    return scorers;
  }
  async execute({
    inputData,
    resumeData,
    suspend,
    resume,
    [EMITTER_SYMBOL]: emitter,
    mastra,
    runtimeContext,
    abort,
    abortSignal,
    runCount,
    currentSpan
  }) {
    this.__registerMastra(mastra);
    const isResume = !!(resume?.steps && resume.steps.length > 0);
    const run = isResume ? await this.createRunAsync({
      runId: resume.runId
    }) : await this.createRunAsync();
    const nestedAbortCb = () => {
      abort();
    };
    run.abortController.signal.addEventListener("abort", nestedAbortCb);
    abortSignal.addEventListener("abort", async () => {
      run.abortController.signal.removeEventListener("abort", nestedAbortCb);
      await run.cancel();
    });
    const unwatchV2 = run.watch(event => {
      emitter.emit("nested-watch-v2", {
        event,
        workflowId: this.id
      });
    }, "watch-v2");
    const unwatch = run.watch(event => {
      emitter.emit("nested-watch", {
        event,
        workflowId: this.id,
        runId: run.runId,
        isResume: !!resume?.steps?.length
      });
    }, "watch");
    if (runCount && runCount > 0 && resume?.steps?.length && runtimeContext) {
      runtimeContext.set("__mastraWorflowInputData", inputData);
    }
    const res = isResume ? await run.resume({
      resumeData,
      step: resume.steps,
      runtimeContext,
      currentSpan
    }) : await run.start({
      inputData,
      runtimeContext,
      currentSpan
    });
    unwatch();
    unwatchV2();
    const suspendedSteps = Object.entries(res.steps).filter(([_stepName, stepResult]) => {
      const stepRes = stepResult;
      return stepRes?.status === "suspended";
    });
    if (suspendedSteps?.length) {
      for (const [stepName, stepResult] of suspendedSteps) {
        const suspendPath = [stepName, ...(stepResult?.suspendPayload?.__workflow_meta?.path ?? [])];
        await suspend({
          ...stepResult?.suspendPayload,
          __workflow_meta: {
            runId: run.runId,
            path: suspendPath
          }
        });
      }
    }
    if (res.status === "failed") {
      throw res.error;
    }
    return res.status === "success" ? res.result : void 0;
  }
  async getWorkflowRuns(args) {
    const storage = this.#mastra?.getStorage();
    if (!storage) {
      this.logger.debug("Cannot get workflow runs. Mastra storage is not initialized");
      return {
        runs: [],
        total: 0
      };
    }
    return storage.getWorkflowRuns({
      workflowName: this.id,
      ...(args ?? {})
    });
  }
  async getWorkflowRunById(runId) {
    const storage = this.#mastra?.getStorage();
    if (!storage) {
      this.logger.debug("Cannot get workflow runs from storage. Mastra storage is not initialized");
      return this.#runs.get(runId) ? {
        ...this.#runs.get(runId),
        workflowName: this.id
      } : null;
    }
    const run = await storage.getWorkflowRunById({
      runId,
      workflowName: this.id
    });
    return run ?? (this.#runs.get(runId) ? {
      ...this.#runs.get(runId),
      workflowName: this.id
    } : null);
  }
  async getWorkflowRunExecutionResult(runId) {
    const storage = this.#mastra?.getStorage();
    if (!storage) {
      this.logger.debug("Cannot get workflow run execution result. Mastra storage is not initialized");
      return null;
    }
    const run = await storage.getWorkflowRunById({
      runId,
      workflowName: this.id
    });
    let snapshot = run?.snapshot;
    if (!snapshot) {
      return null;
    }
    if (typeof snapshot === "string") {
      try {
        snapshot = JSON.parse(snapshot);
      } catch (e) {
        this.logger.debug("Cannot get workflow run execution result. Snapshot is not a valid JSON string", e);
        return null;
      }
    }
    return {
      status: snapshot.status,
      result: snapshot.result,
      error: snapshot.error,
      payload: snapshot.context?.input,
      steps: snapshot.context
    };
  }
};
var Run = class {
  #abortController;
  emitter;
  /**
   * Unique identifier for this workflow
   */
  workflowId;
  /**
   * Unique identifier for this run
   */
  runId;
  /**
   * Internal state of the workflow run
   */
  state = {};
  /**
   * The execution engine for this run
   */
  executionEngine;
  /**
   * The execution graph for this run
   */
  executionGraph;
  /**
   * The serialized step graph for this run
   */
  serializedStepGraph;
  /**
   * The storage for this run
   */
  #mastra;
  get mastra() {
    return this.#mastra;
  }
  closeStreamAction;
  executionResults;
  cleanup;
  retryConfig;
  constructor(params) {
    this.workflowId = params.workflowId;
    this.runId = params.runId;
    this.serializedStepGraph = params.serializedStepGraph;
    this.executionEngine = params.executionEngine;
    this.executionGraph = params.executionGraph;
    this.#mastra = params.mastra;
    this.emitter = new EventEmitter();
    this.retryConfig = params.retryConfig;
    this.cleanup = params.cleanup;
  }
  get abortController() {
    if (!this.#abortController) {
      this.#abortController = new AbortController();
    }
    return this.#abortController;
  }
  /**
   * Cancels the workflow execution
   */
  async cancel() {
    this.abortController?.abort();
  }
  async sendEvent(event, data) {
    this.emitter.emit(`user-event-${event}`, data);
  }
  /**
   * Starts the workflow execution with the provided input
   * @param input The input data for the workflow
   * @returns A promise that resolves to the workflow output
   */
  async start({
    inputData,
    runtimeContext,
    writableStream,
    currentSpan
  }) {
    const result = await this.executionEngine.execute({
      workflowId: this.workflowId,
      runId: this.runId,
      graph: this.executionGraph,
      serializedStepGraph: this.serializedStepGraph,
      input: inputData,
      emitter: {
        emit: async (event, data) => {
          this.emitter.emit(event, data);
        },
        on: (event, callback) => {
          this.emitter.on(event, callback);
        },
        off: (event, callback) => {
          this.emitter.off(event, callback);
        },
        once: (event, callback) => {
          this.emitter.once(event, callback);
        }
      },
      retryConfig: this.retryConfig,
      runtimeContext: runtimeContext ?? new RuntimeContext(),
      abortController: this.abortController,
      writableStream,
      currentSpan
    });
    if (result.status !== "suspended") {
      this.cleanup?.();
    }
    return result;
  }
  /**
   * Starts the workflow execution with the provided input as a stream
   * @param input The input data for the workflow
   * @returns A promise that resolves to the workflow output
   */
  stream({
    inputData,
    runtimeContext
  } = {}) {
    const {
      readable,
      writable
    } = new TransformStream$1();
    const writer = writable.getWriter();
    const unwatch = this.watch(async event => {
      try {
        await writer.write(event);
      } catch {}
    }, "watch-v2");
    this.closeStreamAction = async () => {
      this.emitter.emit("watch-v2", {
        type: "finish",
        payload: {
          runId: this.runId
        }
      });
      unwatch();
      try {
        await writer.close();
      } catch (err) {
        console.error("Error closing stream:", err);
      } finally {
        writer.releaseLock();
      }
    };
    this.emitter.emit("watch-v2", {
      type: "start",
      payload: {
        runId: this.runId
      }
    });
    this.executionResults = this.start({
      inputData,
      runtimeContext
    }).then(result => {
      if (result.status !== "suspended") {
        this.closeStreamAction?.().catch(() => {});
      }
      return result;
    });
    return {
      stream: readable,
      getWorkflowState: () => this.executionResults
    };
  }
  async streamAsync({
    inputData,
    runtimeContext
  } = {}) {
    return this.stream({
      inputData,
      runtimeContext
    });
  }
  /**
   * Starts the workflow execution with the provided input as a stream
   * @param input The input data for the workflow
   * @returns A promise that resolves to the workflow output
   */
  streamVNext({
    inputData,
    runtimeContext
  } = {}) {
    this.closeStreamAction = async () => {};
    return new MastraWorkflowStream({
      run: this,
      createStream: writer => {
        const {
          readable,
          writable
        } = new TransformStream$1({
          transform(chunk, controller) {
            controller.enqueue(chunk);
          }
        });
        let buffer = [];
        let isWriting = false;
        const tryWrite = async () => {
          const chunkToWrite = buffer;
          buffer = [];
          if (chunkToWrite.length === 0 || isWriting) {
            return;
          }
          isWriting = true;
          let watchWriter = writer.getWriter();
          try {
            for (const chunk of chunkToWrite) {
              await watchWriter.write(chunk);
            }
          } finally {
            watchWriter.releaseLock();
          }
          isWriting = false;
          setImmediate(tryWrite);
        };
        const unwatch = this.watch(async ({
          type,
          payload
        }) => {
          let newPayload = payload;
          if (type === "step-start") {
            const {
              payload: args,
              id,
              ...rest
            } = newPayload;
            newPayload = {
              args,
              ...rest
            };
          } else if (type === "step-result") {
            const {
              output,
              id,
              ...rest
            } = newPayload;
            newPayload = {
              result: output,
              ...rest
            };
          }
          buffer.push({
            type,
            runId: this.runId,
            from: "WORKFLOW" /* WORKFLOW */,
            payload: {
              stepName: payload.id,
              ...newPayload
            }
          });
          await tryWrite();
        }, "watch-v2");
        this.closeStreamAction = async () => {
          unwatch();
          try {
            await writable.close();
          } catch (err) {
            console.error("Error closing stream:", err);
          }
        };
        const executionResults = this.start({
          inputData,
          runtimeContext,
          writableStream: writable
        }).then(result => {
          if (result.status !== "suspended") {
            this.closeStreamAction?.().catch(() => {});
          }
          return result;
        });
        this.executionResults = executionResults;
        return readable;
      }
    });
  }
  watch(cb, type = "watch") {
    const watchCb = event => {
      this.updateState(event.payload);
      cb({
        type: event.type,
        payload: this.getState(),
        eventTimestamp: event.eventTimestamp
      });
    };
    const nestedWatchCb = ({
      event,
      workflowId
    }) => {
      try {
        const {
          type: type2,
          payload,
          eventTimestamp
        } = event;
        const prefixedSteps = Object.fromEntries(Object.entries(payload?.workflowState?.steps ?? {}).map(([stepId, step]) => [`${workflowId}.${stepId}`, step]));
        const newPayload = {
          currentStep: {
            ...payload?.currentStep,
            id: `${workflowId}.${payload?.currentStep?.id}`
          },
          workflowState: {
            steps: prefixedSteps
          }
        };
        this.updateState(newPayload);
        cb({
          type: type2,
          payload: this.getState(),
          eventTimestamp
        });
      } catch (e) {
        console.error(e);
      }
    };
    const nestedWatchV2Cb = ({
      event,
      workflowId
    }) => {
      this.emitter.emit("watch-v2", {
        ...event,
        ...(event.payload?.id ? {
          payload: {
            ...event.payload,
            id: `${workflowId}.${event.payload.id}`
          }
        } : {})
      });
    };
    if (type === "watch") {
      this.emitter.on("watch", watchCb);
      this.emitter.on("nested-watch", nestedWatchCb);
    } else if (type === "watch-v2") {
      this.emitter.on("watch-v2", cb);
      this.emitter.on("nested-watch-v2", nestedWatchV2Cb);
    }
    return () => {
      if (type === "watch-v2") {
        this.emitter.off("watch-v2", cb);
        this.emitter.off("nested-watch-v2", nestedWatchV2Cb);
      } else {
        this.emitter.off("watch", watchCb);
        this.emitter.off("nested-watch", nestedWatchCb);
      }
    };
  }
  async watchAsync(cb, type = "watch") {
    return this.watch(cb, type);
  }
  async resume(params) {
    const snapshot = await this.#mastra?.getStorage()?.loadWorkflowSnapshot({
      workflowName: this.workflowId,
      runId: this.runId
    });
    if (!snapshot) {
      throw new Error("No snapshot found for this workflow run");
    }
    let steps;
    if (params.step) {
      steps = (Array.isArray(params.step) ? params.step : [params.step]).map(step => typeof step === "string" ? step : step?.id);
    } else {
      const suspendedStepPaths = [];
      Object.entries(snapshot?.suspendedPaths ?? {}).forEach(([stepId, _executionPath]) => {
        const stepResult = snapshot?.context?.[stepId];
        if (stepResult && typeof stepResult === "object" && "status" in stepResult) {
          const stepRes = stepResult;
          if (stepRes.status === "suspended") {
            const nestedPath = stepRes.suspendPayload?.__workflow_meta?.path;
            if (nestedPath && Array.isArray(nestedPath)) {
              suspendedStepPaths.push([stepId, ...nestedPath]);
            } else {
              suspendedStepPaths.push([stepId]);
            }
          }
        }
      });
      if (suspendedStepPaths.length === 0) {
        throw new Error("No suspended steps found in this workflow run");
      }
      if (suspendedStepPaths.length === 1) {
        steps = suspendedStepPaths[0];
      } else {
        const pathStrings = suspendedStepPaths.map(path => `[${path.join(", ")}]`);
        throw new Error(`Multiple suspended steps found: ${pathStrings.join(", ")}. Please specify which step to resume using the "step" parameter.`);
      }
    }
    if (!params.runCount) {
      if (snapshot.status !== "suspended") {
        throw new Error("This workflow run was not suspended");
      }
      const suspendedStepIds = Object.keys(snapshot?.suspendedPaths ?? {});
      const isStepSuspended = suspendedStepIds.includes(steps?.[0] ?? "");
      if (!isStepSuspended) {
        throw new Error(`This workflow step "${steps?.[0]}" was not suspended. Available suspended steps: [${suspendedStepIds.join(", ")}]`);
      }
    }
    let runtimeContextInput;
    if (params.runCount && params.runCount > 0 && params.runtimeContext) {
      runtimeContextInput = params.runtimeContext.get("__mastraWorflowInputData");
      params.runtimeContext.delete("__mastraWorflowInputData");
    }
    const stepResults = {
      ...(snapshot?.context ?? {}),
      input: runtimeContextInput ?? snapshot?.context?.input
    };
    let runtimeContextToUse = params.runtimeContext ?? new RuntimeContext();
    Object.entries(snapshot?.runtimeContext ?? {}).forEach(([key, value]) => {
      if (!runtimeContextToUse.has(key)) {
        runtimeContextToUse.set(key, value);
      }
    });
    const executionResultPromise = this.executionEngine.execute({
      workflowId: this.workflowId,
      runId: this.runId,
      graph: this.executionGraph,
      serializedStepGraph: this.serializedStepGraph,
      input: snapshot?.context?.input,
      resume: {
        steps,
        stepResults,
        resumePayload: params.resumeData,
        // @ts-ignore
        resumePath: snapshot?.suspendedPaths?.[steps?.[0]]
      },
      emitter: {
        emit: (event, data) => {
          this.emitter.emit(event, data);
          return Promise.resolve();
        },
        on: (event, callback) => {
          this.emitter.on(event, callback);
        },
        off: (event, callback) => {
          this.emitter.off(event, callback);
        },
        once: (event, callback) => {
          this.emitter.once(event, callback);
        }
      },
      runtimeContext: runtimeContextToUse,
      abortController: this.abortController,
      currentSpan: params.currentSpan
    }).then(result => {
      if (result.status !== "suspended") {
        this.closeStreamAction?.().catch(() => {});
      }
      return result;
    });
    this.executionResults = executionResultPromise;
    return executionResultPromise;
  }
  /**
   * Returns the current state of the workflow run
   * @returns The current state of the workflow run
   */
  getState() {
    return this.state;
  }
  updateState(state) {
    if (state.currentStep) {
      this.state.currentStep = state.currentStep;
    } else if (state.workflowState?.status !== "running") {
      delete this.state.currentStep;
    }
    if (state.workflowState) {
      this.state.workflowState = deepMergeWorkflowState(this.state.workflowState ?? {}, state.workflowState ?? {});
    }
  }
  /**
   * @access private
   * @returns The execution results of the workflow run
   */
  _getExecutionResults() {
    return this.executionResults;
  }
};
function deepMergeWorkflowState(a, b) {
  if (!a || typeof a !== "object") return b;
  if (!b || typeof b !== "object") return a;
  const result = {
    ...a
  };
  for (const key in b) {
    if (b[key] === void 0) continue;
    if (b[key] !== null && typeof b[key] === "object") {
      const aVal = result[key];
      const bVal = b[key];
      if (Array.isArray(bVal)) {
        result[key] = bVal.filter(item => item !== void 0);
      } else if (typeof aVal === "object" && aVal !== null) {
        result[key] = deepMergeWorkflowState(aVal, bVal);
      } else {
        result[key] = bVal;
      }
    } else {
      result[key] = b[key];
    }
  }
  return result;
}

export { Agent as A, EMITTER_SYMBOL as E, Run as R, Workflow as W, __decoratorStart as _, __decorateElement as a, __runInitializers as b, createWorkflow as c, createStep as d };

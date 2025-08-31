import { w as withoutTrailingSlash, p as postJsonToApi, c as combineHeaders, g as generateId, i as isParsableJson, l as loadApiKey, a as convertUint8ArrayToBase64, b as createJsonResponseHandler, d as createEventSourceResponseHandler, e as createJsonErrorResponseHandler } from './index.mjs';
import { U as UnsupportedFunctionalityError, I as InvalidResponseDataError, a as InvalidPromptError } from './index2.mjs';
import { o as objectType, s as stringType, l as literalType, u as unionType, a as unknownType, b as arrayType, c as anyType, n as numberType, e as enumType, r as recordType } from './types.mjs';

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var ReasoningDetailSummarySchema = objectType({
  type: literalType("reasoning.summary" /* Summary */),
  summary: stringType()
});
var ReasoningDetailEncryptedSchema = objectType({
  type: literalType("reasoning.encrypted" /* Encrypted */),
  data: stringType()
});
var ReasoningDetailTextSchema = objectType({
  type: literalType("reasoning.text" /* Text */),
  text: stringType().nullish(),
  signature: stringType().nullish()
});
var ReasoningDetailUnionSchema = unionType([
  ReasoningDetailSummarySchema,
  ReasoningDetailEncryptedSchema,
  ReasoningDetailTextSchema
]);
var ReasoningDetailsWithUnknownSchema = unionType([
  ReasoningDetailUnionSchema,
  unknownType().transform(() => null)
]);
var ReasoningDetailArraySchema = arrayType(ReasoningDetailsWithUnknownSchema).transform((d) => d.filter((d2) => !!d2));
function getCacheControl(providerMetadata) {
  var _a, _b, _c;
  const anthropic = providerMetadata == null ? void 0 : providerMetadata.anthropic;
  const openrouter2 = providerMetadata == null ? void 0 : providerMetadata.openrouter;
  return (_c = (_b = (_a = openrouter2 == null ? void 0 : openrouter2.cacheControl) != null ? _a : openrouter2 == null ? void 0 : openrouter2.cache_control) != null ? _b : anthropic == null ? void 0 : anthropic.cacheControl) != null ? _c : anthropic == null ? void 0 : anthropic.cache_control;
}
function convertToOpenRouterChatMessages(prompt) {
  var _a, _b, _c;
  const messages = [];
  for (const { role, content, providerMetadata } of prompt) {
    switch (role) {
      case "system": {
        messages.push({
          role: "system",
          content,
          cache_control: getCacheControl(providerMetadata)
        });
        break;
      }
      case "user": {
        if (content.length === 1 && ((_a = content[0]) == null ? void 0 : _a.type) === "text") {
          const cacheControl = (_b = getCacheControl(providerMetadata)) != null ? _b : getCacheControl(content[0].providerMetadata);
          const contentWithCacheControl = cacheControl ? [
            {
              type: "text",
              text: content[0].text,
              cache_control: cacheControl
            }
          ] : content[0].text;
          messages.push({
            role: "user",
            content: contentWithCacheControl
          });
          break;
        }
        const messageCacheControl = getCacheControl(providerMetadata);
        const contentParts = content.map(
          (part) => {
            var _a2, _b2, _c2, _d, _e, _f;
            const cacheControl = (_a2 = getCacheControl(part.providerMetadata)) != null ? _a2 : messageCacheControl;
            switch (part.type) {
              case "text":
                return {
                  type: "text",
                  text: part.text,
                  // For text parts, only use part-specific cache control
                  cache_control: cacheControl
                };
              case "image":
                return {
                  type: "image_url",
                  image_url: {
                    url: part.image instanceof URL ? part.image.toString() : `data:${(_b2 = part.mimeType) != null ? _b2 : "image/jpeg"};base64,${convertUint8ArrayToBase64(
                      part.image
                    )}`
                  },
                  // For image parts, use part-specific or message-level cache control
                  cache_control: cacheControl
                };
              case "file":
                return {
                  type: "file",
                  file: {
                    filename: String(
                      (_f = (_e = (_d = (_c2 = part.providerMetadata) == null ? void 0 : _c2.openrouter) == null ? void 0 : _d.filename) != null ? _e : part.filename) != null ? _f : ""
                    ),
                    file_data: part.data instanceof Uint8Array ? `data:${part.mimeType};base64,${convertUint8ArrayToBase64(part.data)}` : `data:${part.mimeType};base64,${part.data}`
                  },
                  cache_control: cacheControl
                };
              default: {
                const _exhaustiveCheck = part;
                throw new Error(
                  `Unsupported content part type: ${_exhaustiveCheck}`
                );
              }
            }
          }
        );
        messages.push({
          role: "user",
          content: contentParts
        });
        break;
      }
      case "assistant": {
        let text = "";
        let reasoning = "";
        const reasoningDetails = [];
        const toolCalls = [];
        for (const part of content) {
          switch (part.type) {
            case "text": {
              text += part.text;
              break;
            }
            case "tool-call": {
              toolCalls.push({
                id: part.toolCallId,
                type: "function",
                function: {
                  name: part.toolName,
                  arguments: JSON.stringify(part.args)
                }
              });
              break;
            }
            case "reasoning": {
              reasoning += part.text;
              reasoningDetails.push({
                type: "reasoning.text" /* Text */,
                text: part.text,
                signature: part.signature
              });
              break;
            }
            case "redacted-reasoning": {
              reasoningDetails.push({
                type: "reasoning.encrypted" /* Encrypted */,
                data: part.data
              });
              break;
            }
            case "file":
              break;
            default: {
              const _exhaustiveCheck = part;
              throw new Error(`Unsupported part: ${_exhaustiveCheck}`);
            }
          }
        }
        messages.push({
          role: "assistant",
          content: text,
          tool_calls: toolCalls.length > 0 ? toolCalls : void 0,
          reasoning: reasoning || void 0,
          reasoning_details: reasoningDetails.length > 0 ? reasoningDetails : void 0,
          cache_control: getCacheControl(providerMetadata)
        });
        break;
      }
      case "tool": {
        for (const toolResponse of content) {
          messages.push({
            role: "tool",
            tool_call_id: toolResponse.toolCallId,
            content: JSON.stringify(toolResponse.result),
            cache_control: (_c = getCacheControl(providerMetadata)) != null ? _c : getCacheControl(toolResponse.providerMetadata)
          });
        }
        break;
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  return messages;
}

// src/map-openrouter-chat-logprobs.ts
function mapOpenRouterChatLogProbsOutput(logprobs) {
  var _a, _b;
  return (_b = (_a = logprobs == null ? void 0 : logprobs.content) == null ? void 0 : _a.map(({ token, logprob, top_logprobs }) => ({
    token,
    logprob,
    topLogprobs: top_logprobs ? top_logprobs.map(({ token: token2, logprob: logprob2 }) => ({
      token: token2,
      logprob: logprob2
    })) : []
  }))) != null ? _b : void 0;
}

// src/map-openrouter-finish-reason.ts
function mapOpenRouterFinishReason(finishReason) {
  switch (finishReason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "content_filter":
      return "content-filter";
    case "function_call":
    case "tool_calls":
      return "tool-calls";
    default:
      return "unknown";
  }
}
var OpenRouterErrorResponseSchema = objectType({
  error: objectType({
    code: unionType([stringType(), numberType()]).nullable(),
    message: stringType(),
    type: stringType().nullable(),
    param: anyType().nullable()
  })
});
var openrouterFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: OpenRouterErrorResponseSchema,
  errorToMessage: (data) => data.error.message
});

// src/openrouter-chat-language-model.ts
function isFunctionTool(tool) {
  return "parameters" in tool;
}
var OpenRouterChatLanguageModel = class {
  constructor(modelId, settings, config) {
    this.specificationVersion = "v1";
    this.defaultObjectGenerationMode = "tool";
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  getArgs({
    mode,
    prompt,
    maxTokens,
    temperature,
    topP,
    frequencyPenalty,
    presencePenalty,
    seed,
    stopSequences,
    responseFormat,
    topK,
    providerMetadata
  }) {
    var _a;
    const type = mode.type;
    const extraCallingBody = (_a = providerMetadata == null ? void 0 : providerMetadata.openrouter) != null ? _a : {};
    const baseArgs = __spreadValues(__spreadValues(__spreadValues({
      // model id:
      model: this.modelId,
      models: this.settings.models,
      // model specific settings:
      logit_bias: this.settings.logitBias,
      logprobs: this.settings.logprobs === true || typeof this.settings.logprobs === "number" ? true : void 0,
      top_logprobs: typeof this.settings.logprobs === "number" ? this.settings.logprobs : typeof this.settings.logprobs === "boolean" ? this.settings.logprobs ? 0 : void 0 : void 0,
      user: this.settings.user,
      parallel_tool_calls: this.settings.parallelToolCalls,
      // standardized settings:
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      seed,
      stop: stopSequences,
      response_format: responseFormat,
      top_k: topK,
      // messages:
      messages: convertToOpenRouterChatMessages(prompt),
      // OpenRouter specific settings:
      include_reasoning: this.settings.includeReasoning,
      reasoning: this.settings.reasoning,
      usage: this.settings.usage
    }, this.config.extraBody), this.settings.extraBody), extraCallingBody);
    switch (type) {
      case "regular": {
        return __spreadValues(__spreadValues({}, baseArgs), prepareToolsAndToolChoice(mode));
      }
      case "object-json": {
        return __spreadProps(__spreadValues({}, baseArgs), {
          response_format: { type: "json_object" }
        });
      }
      case "object-tool": {
        return __spreadProps(__spreadValues({}, baseArgs), {
          tool_choice: { type: "function", function: { name: mode.tool.name } },
          tools: [
            {
              type: "function",
              function: {
                name: mode.tool.name,
                description: mode.tool.description,
                parameters: mode.tool.parameters
              }
            }
          ]
        });
      }
      // Handle all non-text types with a single default case
      default: {
        const _exhaustiveCheck = type;
        throw new UnsupportedFunctionalityError({
          functionality: `${_exhaustiveCheck} mode`
        });
      }
    }
  }
  async doGenerate(options) {
    var _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const args = this.getArgs(options);
    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: openrouterFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        OpenRouterNonStreamChatCompletionResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const _a = args, { messages: rawPrompt } = _a, rawSettings = __objRest(_a, ["messages"]);
    const choice = response.choices[0];
    if (!choice) {
      throw new Error("No choice in response");
    }
    const usageInfo = response.usage ? {
      promptTokens: (_b = response.usage.prompt_tokens) != null ? _b : 0,
      completionTokens: (_c = response.usage.completion_tokens) != null ? _c : 0
    } : {
      promptTokens: 0,
      completionTokens: 0
    };
    const providerMetadata = {};
    if (response.usage && ((_d = this.settings.usage) == null ? void 0 : _d.include)) {
      providerMetadata.openrouter = {
        usage: {
          promptTokens: response.usage.prompt_tokens,
          promptTokensDetails: response.usage.prompt_tokens_details ? {
            cachedTokens: (_e = response.usage.prompt_tokens_details.cached_tokens) != null ? _e : 0
          } : void 0,
          completionTokens: response.usage.completion_tokens,
          completionTokensDetails: response.usage.completion_tokens_details ? {
            reasoningTokens: (_f = response.usage.completion_tokens_details.reasoning_tokens) != null ? _f : 0
          } : void 0,
          cost: response.usage.cost,
          totalTokens: (_g = response.usage.total_tokens) != null ? _g : 0
        }
      };
    }
    const hasProviderMetadata = Object.keys(providerMetadata).length > 0;
    const reasoningDetails = (_h = choice.message.reasoning_details) != null ? _h : [];
    const reasoning = reasoningDetails.length > 0 ? reasoningDetails.map((detail) => {
      var _a2;
      switch (detail.type) {
        case "reasoning.text" /* Text */: {
          if (detail.text) {
            return {
              type: "text",
              text: detail.text,
              signature: (_a2 = detail.signature) != null ? _a2 : void 0
            };
          }
          break;
        }
        case "reasoning.summary" /* Summary */: {
          if (detail.summary) {
            return {
              type: "text",
              text: detail.summary
            };
          }
          break;
        }
        case "reasoning.encrypted" /* Encrypted */: {
          if (detail.data) {
            return {
              type: "redacted",
              data: detail.data
            };
          }
          break;
        }
      }
      return null;
    }).filter((p) => p !== null) : choice.message.reasoning ? [
      {
        type: "text",
        text: choice.message.reasoning
      }
    ] : [];
    return __spreadValues({
      response: {
        id: response.id,
        modelId: response.model
      },
      text: (_i = choice.message.content) != null ? _i : void 0,
      reasoning,
      toolCalls: (_j = choice.message.tool_calls) == null ? void 0 : _j.map((toolCall) => {
        var _a2;
        return {
          toolCallType: "function",
          toolCallId: (_a2 = toolCall.id) != null ? _a2 : generateId(),
          toolName: toolCall.function.name,
          args: toolCall.function.arguments
        };
      }),
      finishReason: mapOpenRouterFinishReason(choice.finish_reason),
      usage: usageInfo,
      rawCall: { rawPrompt, rawSettings },
      rawResponse: { headers: responseHeaders },
      warnings: [],
      logprobs: mapOpenRouterChatLogProbsOutput(choice.logprobs)
    }, hasProviderMetadata ? { providerMetadata } : {});
  }
  async doStream(options) {
    var _a, _c;
    const args = this.getArgs(options);
    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: "/chat/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: __spreadProps(__spreadValues({}, args), {
        stream: true,
        // only include stream_options when in strict compatibility mode:
        stream_options: this.config.compatibility === "strict" ? __spreadValues({
          include_usage: true
        }, ((_a = this.settings.usage) == null ? void 0 : _a.include) ? { include_usage: true } : {}) : void 0
      }),
      failedResponseHandler: openrouterFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        OpenRouterStreamChatCompletionChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const _b = args, { messages: rawPrompt } = _b, rawSettings = __objRest(_b, ["messages"]);
    const toolCalls = [];
    let finishReason = "other";
    let usage = {
      promptTokens: Number.NaN,
      completionTokens: Number.NaN
    };
    let logprobs;
    const openrouterUsage = {};
    const shouldIncludeUsageAccounting = !!((_c = this.settings.usage) == null ? void 0 : _c.include);
    return {
      stream: response.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            var _a2, _b2, _c2, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
            if (!chunk.success) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if ("error" in value) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: value.error });
              return;
            }
            if (value.id) {
              controller.enqueue({
                type: "response-metadata",
                id: value.id
              });
            }
            if (value.model) {
              controller.enqueue({
                type: "response-metadata",
                modelId: value.model
              });
            }
            if (value.usage != null) {
              usage = {
                promptTokens: value.usage.prompt_tokens,
                completionTokens: value.usage.completion_tokens
              };
              openrouterUsage.promptTokens = value.usage.prompt_tokens;
              if (value.usage.prompt_tokens_details) {
                openrouterUsage.promptTokensDetails = {
                  cachedTokens: (_a2 = value.usage.prompt_tokens_details.cached_tokens) != null ? _a2 : 0
                };
              }
              openrouterUsage.completionTokens = value.usage.completion_tokens;
              if (value.usage.completion_tokens_details) {
                openrouterUsage.completionTokensDetails = {
                  reasoningTokens: (_b2 = value.usage.completion_tokens_details.reasoning_tokens) != null ? _b2 : 0
                };
              }
              openrouterUsage.cost = value.usage.cost;
              openrouterUsage.totalTokens = value.usage.total_tokens;
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = mapOpenRouterFinishReason(choice.finish_reason);
            }
            if ((choice == null ? void 0 : choice.delta) == null) {
              return;
            }
            const delta = choice.delta;
            if (delta.content != null) {
              controller.enqueue({
                type: "text-delta",
                textDelta: delta.content
              });
            }
            if (delta.reasoning_details && delta.reasoning_details.length > 0) {
              for (const detail of delta.reasoning_details) {
                switch (detail.type) {
                  case "reasoning.text" /* Text */: {
                    if (detail.text) {
                      controller.enqueue({
                        type: "reasoning",
                        textDelta: detail.text
                      });
                    }
                    if (detail.signature) {
                      controller.enqueue({
                        type: "reasoning-signature",
                        signature: detail.signature
                      });
                    }
                    break;
                  }
                  case "reasoning.encrypted" /* Encrypted */: {
                    if (detail.data) {
                      controller.enqueue({
                        type: "redacted-reasoning",
                        data: detail.data
                      });
                    }
                    break;
                  }
                  case "reasoning.summary" /* Summary */: {
                    if (detail.summary) {
                      controller.enqueue({
                        type: "reasoning",
                        textDelta: detail.summary
                      });
                    }
                    break;
                  }
                }
              }
            } else if (delta.reasoning != null) {
              controller.enqueue({
                type: "reasoning",
                textDelta: delta.reasoning
              });
            }
            const mappedLogprobs = mapOpenRouterChatLogProbsOutput(
              choice == null ? void 0 : choice.logprobs
            );
            if (mappedLogprobs == null ? void 0 : mappedLogprobs.length) {
              if (logprobs === void 0) {
                logprobs = [];
              }
              logprobs.push(...mappedLogprobs);
            }
            if (delta.tool_calls != null) {
              for (const toolCallDelta of delta.tool_calls) {
                const index = toolCallDelta.index;
                if (toolCalls[index] == null) {
                  if (toolCallDelta.type !== "function") {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'function' type.`
                    });
                  }
                  if (toolCallDelta.id == null) {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'id' to be a string.`
                    });
                  }
                  if (((_c2 = toolCallDelta.function) == null ? void 0 : _c2.name) == null) {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'function.name' to be a string.`
                    });
                  }
                  toolCalls[index] = {
                    id: toolCallDelta.id,
                    type: "function",
                    function: {
                      name: toolCallDelta.function.name,
                      arguments: (_d = toolCallDelta.function.arguments) != null ? _d : ""
                    },
                    sent: false
                  };
                  const toolCall2 = toolCalls[index];
                  if (toolCall2 == null) {
                    throw new Error("Tool call is missing");
                  }
                  if (((_e = toolCall2.function) == null ? void 0 : _e.name) != null && ((_f = toolCall2.function) == null ? void 0 : _f.arguments) != null && isParsableJson(toolCall2.function.arguments)) {
                    controller.enqueue({
                      type: "tool-call-delta",
                      toolCallType: "function",
                      toolCallId: toolCall2.id,
                      toolName: toolCall2.function.name,
                      argsTextDelta: toolCall2.function.arguments
                    });
                    controller.enqueue({
                      type: "tool-call",
                      toolCallType: "function",
                      toolCallId: (_g = toolCall2.id) != null ? _g : generateId(),
                      toolName: toolCall2.function.name,
                      args: toolCall2.function.arguments
                    });
                    toolCall2.sent = true;
                  }
                  continue;
                }
                const toolCall = toolCalls[index];
                if (toolCall == null) {
                  throw new Error("Tool call is missing");
                }
                if (((_h = toolCallDelta.function) == null ? void 0 : _h.arguments) != null) {
                  toolCall.function.arguments += (_j = (_i = toolCallDelta.function) == null ? void 0 : _i.arguments) != null ? _j : "";
                }
                controller.enqueue({
                  type: "tool-call-delta",
                  toolCallType: "function",
                  toolCallId: toolCall.id,
                  toolName: toolCall.function.name,
                  argsTextDelta: (_k = toolCallDelta.function.arguments) != null ? _k : ""
                });
                if (((_l = toolCall.function) == null ? void 0 : _l.name) != null && ((_m = toolCall.function) == null ? void 0 : _m.arguments) != null && isParsableJson(toolCall.function.arguments)) {
                  controller.enqueue({
                    type: "tool-call",
                    toolCallType: "function",
                    toolCallId: (_n = toolCall.id) != null ? _n : generateId(),
                    toolName: toolCall.function.name,
                    args: toolCall.function.arguments
                  });
                  toolCall.sent = true;
                }
              }
            }
          },
          flush(controller) {
            var _a2;
            if (finishReason === "tool-calls") {
              for (const toolCall of toolCalls) {
                if (!toolCall.sent) {
                  controller.enqueue({
                    type: "tool-call",
                    toolCallType: "function",
                    toolCallId: (_a2 = toolCall.id) != null ? _a2 : generateId(),
                    toolName: toolCall.function.name,
                    // Coerce invalid arguments to an empty JSON object
                    args: isParsableJson(toolCall.function.arguments) ? toolCall.function.arguments : "{}"
                  });
                  toolCall.sent = true;
                }
              }
            }
            const providerMetadata = {};
            if (shouldIncludeUsageAccounting && (openrouterUsage.totalTokens !== void 0 || openrouterUsage.cost !== void 0 || openrouterUsage.promptTokensDetails !== void 0 || openrouterUsage.completionTokensDetails !== void 0)) {
              providerMetadata.openrouter = {
                usage: openrouterUsage
              };
            }
            const hasProviderMetadata = Object.keys(providerMetadata).length > 0 && shouldIncludeUsageAccounting;
            controller.enqueue(__spreadValues({
              type: "finish",
              finishReason,
              logprobs,
              usage
            }, hasProviderMetadata ? { providerMetadata } : {}));
          }
        })
      ),
      rawCall: { rawPrompt, rawSettings },
      rawResponse: { headers: responseHeaders },
      warnings: []
    };
  }
};
var OpenRouterChatCompletionBaseResponseSchema = objectType({
  id: stringType().optional(),
  model: stringType().optional(),
  usage: objectType({
    prompt_tokens: numberType(),
    prompt_tokens_details: objectType({
      cached_tokens: numberType()
    }).nullish(),
    completion_tokens: numberType(),
    completion_tokens_details: objectType({
      reasoning_tokens: numberType()
    }).nullish(),
    total_tokens: numberType(),
    cost: numberType().optional()
  }).nullish()
});
var OpenRouterNonStreamChatCompletionResponseSchema = OpenRouterChatCompletionBaseResponseSchema.extend({
  choices: arrayType(
    objectType({
      message: objectType({
        role: literalType("assistant"),
        content: stringType().nullable().optional(),
        reasoning: stringType().nullable().optional(),
        reasoning_details: ReasoningDetailArraySchema.nullish(),
        tool_calls: arrayType(
          objectType({
            id: stringType().optional().nullable(),
            type: literalType("function"),
            function: objectType({
              name: stringType(),
              arguments: stringType()
            })
          })
        ).optional()
      }),
      index: numberType(),
      logprobs: objectType({
        content: arrayType(
          objectType({
            token: stringType(),
            logprob: numberType(),
            top_logprobs: arrayType(
              objectType({
                token: stringType(),
                logprob: numberType()
              })
            )
          })
        ).nullable()
      }).nullable().optional(),
      finish_reason: stringType().optional().nullable()
    })
  )
});
var OpenRouterStreamChatCompletionChunkSchema = unionType([
  OpenRouterChatCompletionBaseResponseSchema.extend({
    choices: arrayType(
      objectType({
        delta: objectType({
          role: enumType(["assistant"]).optional(),
          content: stringType().nullish(),
          reasoning: stringType().nullish().optional(),
          reasoning_details: ReasoningDetailArraySchema.nullish(),
          tool_calls: arrayType(
            objectType({
              index: numberType(),
              id: stringType().nullish(),
              type: literalType("function").optional(),
              function: objectType({
                name: stringType().nullish(),
                arguments: stringType().nullish()
              })
            })
          ).nullish()
        }).nullish(),
        logprobs: objectType({
          content: arrayType(
            objectType({
              token: stringType(),
              logprob: numberType(),
              top_logprobs: arrayType(
                objectType({
                  token: stringType(),
                  logprob: numberType()
                })
              )
            })
          ).nullable()
        }).nullish(),
        finish_reason: stringType().nullable().optional(),
        index: numberType()
      })
    )
  }),
  OpenRouterErrorResponseSchema
]);
function prepareToolsAndToolChoice(mode) {
  var _a;
  const tools = ((_a = mode.tools) == null ? void 0 : _a.length) ? mode.tools : void 0;
  if (tools == null) {
    return { tools: void 0, tool_choice: void 0 };
  }
  const mappedTools = tools.map((tool) => {
    if (isFunctionTool(tool)) {
      return {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      };
    }
    return {
      type: "function",
      function: {
        name: tool.name
      }
    };
  });
  const toolChoice = mode.toolChoice;
  if (toolChoice == null) {
    return { tools: mappedTools, tool_choice: void 0 };
  }
  const type = toolChoice.type;
  switch (type) {
    case "auto":
    case "none":
    case "required":
      return { tools: mappedTools, tool_choice: type };
    case "tool":
      return {
        tools: mappedTools,
        tool_choice: {
          type: "function",
          function: {
            name: toolChoice.toolName
          }
        }
      };
    default: {
      const _exhaustiveCheck = type;
      throw new Error(`Unsupported tool choice type: ${_exhaustiveCheck}`);
    }
  }
}
function convertToOpenRouterCompletionPrompt({
  prompt,
  inputFormat,
  user = "user",
  assistant = "assistant"
}) {
  if (inputFormat === "prompt" && prompt.length === 1 && prompt[0] && prompt[0].role === "user" && prompt[0].content.length === 1 && prompt[0].content[0] && prompt[0].content[0].type === "text") {
    return { prompt: prompt[0].content[0].text };
  }
  let text = "";
  if (prompt[0] && prompt[0].role === "system") {
    text += `${prompt[0].content}

`;
    prompt = prompt.slice(1);
  }
  for (const { role, content } of prompt) {
    switch (role) {
      case "system": {
        throw new InvalidPromptError({
          message: "Unexpected system message in prompt: ${content}",
          prompt
        });
      }
      case "user": {
        const userMessage = content.map((part) => {
          switch (part.type) {
            case "text": {
              return part.text;
            }
            case "image": {
              throw new UnsupportedFunctionalityError({
                functionality: "images"
              });
            }
            case "file": {
              throw new UnsupportedFunctionalityError({
                functionality: "file attachments"
              });
            }
            default: {
              const _exhaustiveCheck = part;
              throw new Error(
                `Unsupported content type: ${_exhaustiveCheck}`
              );
            }
          }
        }).join("");
        text += `${user}:
${userMessage}

`;
        break;
      }
      case "assistant": {
        const assistantMessage = content.map((part) => {
          switch (part.type) {
            case "text": {
              return part.text;
            }
            case "tool-call": {
              throw new UnsupportedFunctionalityError({
                functionality: "tool-call messages"
              });
            }
            case "reasoning": {
              throw new UnsupportedFunctionalityError({
                functionality: "reasoning messages"
              });
            }
            case "redacted-reasoning": {
              throw new UnsupportedFunctionalityError({
                functionality: "redacted reasoning messages"
              });
            }
            case "file": {
              throw new UnsupportedFunctionalityError({
                functionality: "file attachments"
              });
            }
            default: {
              const _exhaustiveCheck = part;
              throw new Error(
                `Unsupported content type: ${_exhaustiveCheck}`
              );
            }
          }
        }).join("");
        text += `${assistant}:
${assistantMessage}

`;
        break;
      }
      case "tool": {
        throw new UnsupportedFunctionalityError({
          functionality: "tool messages"
        });
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  text += `${assistant}:
`;
  return {
    prompt: text
  };
}

// src/map-openrouter-completion-logprobs.ts
function mapOpenRouterCompletionLogProbs(logprobs) {
  return logprobs == null ? void 0 : logprobs.tokens.map((token, index) => {
    var _a, _b;
    return {
      token,
      logprob: (_a = logprobs.token_logprobs[index]) != null ? _a : 0,
      topLogprobs: logprobs.top_logprobs ? Object.entries((_b = logprobs.top_logprobs[index]) != null ? _b : {}).map(
        ([token2, logprob]) => ({
          token: token2,
          logprob
        })
      ) : []
    };
  });
}

// src/openrouter-completion-language-model.ts
var OpenRouterCompletionLanguageModel = class {
  constructor(modelId, settings, config) {
    this.specificationVersion = "v1";
    this.defaultObjectGenerationMode = void 0;
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }
  get provider() {
    return this.config.provider;
  }
  getArgs({
    mode,
    inputFormat,
    prompt,
    maxTokens,
    temperature,
    topP,
    frequencyPenalty,
    presencePenalty,
    seed,
    responseFormat,
    topK,
    stopSequences,
    providerMetadata
  }) {
    var _a, _b;
    const type = mode.type;
    const extraCallingBody = (_a = providerMetadata == null ? void 0 : providerMetadata.openrouter) != null ? _a : {};
    const { prompt: completionPrompt } = convertToOpenRouterCompletionPrompt({
      prompt,
      inputFormat
    });
    const baseArgs = __spreadValues(__spreadValues(__spreadValues({
      // model id:
      model: this.modelId,
      models: this.settings.models,
      // model specific settings:
      logit_bias: this.settings.logitBias,
      logprobs: typeof this.settings.logprobs === "number" ? this.settings.logprobs : typeof this.settings.logprobs === "boolean" ? this.settings.logprobs ? 0 : void 0 : void 0,
      suffix: this.settings.suffix,
      user: this.settings.user,
      // standardized settings:
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      seed,
      stop: stopSequences,
      response_format: responseFormat,
      top_k: topK,
      // prompt:
      prompt: completionPrompt,
      // OpenRouter specific settings:
      include_reasoning: this.settings.includeReasoning,
      reasoning: this.settings.reasoning
    }, this.config.extraBody), this.settings.extraBody), extraCallingBody);
    switch (type) {
      case "regular": {
        if ((_b = mode.tools) == null ? void 0 : _b.length) {
          throw new UnsupportedFunctionalityError({
            functionality: "tools"
          });
        }
        if (mode.toolChoice) {
          throw new UnsupportedFunctionalityError({
            functionality: "toolChoice"
          });
        }
        return baseArgs;
      }
      case "object-json": {
        throw new UnsupportedFunctionalityError({
          functionality: "object-json mode"
        });
      }
      case "object-tool": {
        throw new UnsupportedFunctionalityError({
          functionality: "object-tool mode"
        });
      }
      // Handle all non-text types with a single default case
      default: {
        const _exhaustiveCheck = type;
        throw new UnsupportedFunctionalityError({
          functionality: `${_exhaustiveCheck} mode`
        });
      }
    }
  }
  async doGenerate(options) {
    var _b, _c, _d, _e, _f;
    const args = this.getArgs(options);
    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: "/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: openrouterFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        OpenRouterCompletionChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const _a = args, { prompt: rawPrompt } = _a, rawSettings = __objRest(_a, ["prompt"]);
    if ("error" in response) {
      throw new Error(`${response.error.message}`);
    }
    const choice = response.choices[0];
    if (!choice) {
      throw new Error("No choice in OpenRouter completion response");
    }
    return {
      response: {
        id: response.id,
        modelId: response.model
      },
      text: (_b = choice.text) != null ? _b : "",
      reasoning: choice.reasoning || void 0,
      usage: {
        promptTokens: (_d = (_c = response.usage) == null ? void 0 : _c.prompt_tokens) != null ? _d : 0,
        completionTokens: (_f = (_e = response.usage) == null ? void 0 : _e.completion_tokens) != null ? _f : 0
      },
      finishReason: mapOpenRouterFinishReason(choice.finish_reason),
      logprobs: mapOpenRouterCompletionLogProbs(choice.logprobs),
      rawCall: { rawPrompt, rawSettings },
      rawResponse: { headers: responseHeaders },
      warnings: []
    };
  }
  async doStream(options) {
    const args = this.getArgs(options);
    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: "/completions",
        modelId: this.modelId
      }),
      headers: combineHeaders(this.config.headers(), options.headers),
      body: __spreadProps(__spreadValues({}, this.getArgs(options)), {
        stream: true,
        // only include stream_options when in strict compatibility mode:
        stream_options: this.config.compatibility === "strict" ? { include_usage: true } : void 0
      }),
      failedResponseHandler: openrouterFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        OpenRouterCompletionChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const _a = args, { prompt: rawPrompt } = _a, rawSettings = __objRest(_a, ["prompt"]);
    let finishReason = "other";
    let usage = {
      promptTokens: Number.NaN,
      completionTokens: Number.NaN
    };
    let logprobs;
    return {
      stream: response.pipeThrough(
        new TransformStream({
          transform(chunk, controller) {
            if (!chunk.success) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: chunk.error });
              return;
            }
            const value = chunk.value;
            if ("error" in value) {
              finishReason = "error";
              controller.enqueue({ type: "error", error: value.error });
              return;
            }
            if (value.usage != null) {
              usage = {
                promptTokens: value.usage.prompt_tokens,
                completionTokens: value.usage.completion_tokens
              };
            }
            const choice = value.choices[0];
            if ((choice == null ? void 0 : choice.finish_reason) != null) {
              finishReason = mapOpenRouterFinishReason(choice.finish_reason);
            }
            if ((choice == null ? void 0 : choice.text) != null) {
              controller.enqueue({
                type: "text-delta",
                textDelta: choice.text
              });
            }
            const mappedLogprobs = mapOpenRouterCompletionLogProbs(
              choice == null ? void 0 : choice.logprobs
            );
            if (mappedLogprobs == null ? void 0 : mappedLogprobs.length) {
              if (logprobs === void 0) {
                logprobs = [];
              }
              logprobs.push(...mappedLogprobs);
            }
          },
          flush(controller) {
            controller.enqueue({
              type: "finish",
              finishReason,
              logprobs,
              usage
            });
          }
        })
      ),
      rawCall: { rawPrompt, rawSettings },
      rawResponse: { headers: responseHeaders },
      warnings: []
    };
  }
};
var OpenRouterCompletionChunkSchema = unionType([
  objectType({
    id: stringType().optional(),
    model: stringType().optional(),
    choices: arrayType(
      objectType({
        text: stringType(),
        reasoning: stringType().nullish().optional(),
        reasoning_details: ReasoningDetailArraySchema.nullish(),
        finish_reason: stringType().nullish(),
        index: numberType(),
        logprobs: objectType({
          tokens: arrayType(stringType()),
          token_logprobs: arrayType(numberType()),
          top_logprobs: arrayType(recordType(stringType(), numberType())).nullable()
        }).nullable().optional()
      })
    ),
    usage: objectType({
      prompt_tokens: numberType(),
      completion_tokens: numberType()
    }).optional().nullable()
  }),
  OpenRouterErrorResponseSchema
]);
function createOpenRouter(options = {}) {
  var _a, _b, _c;
  const baseURL = (_b = withoutTrailingSlash((_a = options.baseURL) != null ? _a : options.baseUrl)) != null ? _b : "https://openrouter.ai/api/v1";
  const compatibility = (_c = options.compatibility) != null ? _c : "compatible";
  const getHeaders = () => __spreadValues({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: "OPENROUTER_API_KEY",
      description: "OpenRouter"
    })}`
  }, options.headers);
  const createChatModel = (modelId, settings = {}) => new OpenRouterChatLanguageModel(modelId, settings, {
    provider: "openrouter.chat",
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    compatibility,
    fetch: options.fetch,
    extraBody: options.extraBody
  });
  const createCompletionModel = (modelId, settings = {}) => new OpenRouterCompletionLanguageModel(modelId, settings, {
    provider: "openrouter.completion",
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    compatibility,
    fetch: options.fetch,
    extraBody: options.extraBody
  });
  const createLanguageModel = (modelId, settings) => {
    if (new.target) {
      throw new Error(
        "The OpenRouter model function cannot be called with the new keyword."
      );
    }
    if (modelId === "openai/gpt-3.5-turbo-instruct") {
      return createCompletionModel(
        modelId,
        settings
      );
    }
    return createChatModel(modelId, settings);
  };
  const provider = (modelId, settings) => createLanguageModel(modelId, settings);
  provider.languageModel = createLanguageModel;
  provider.chat = createChatModel;
  provider.completion = createCompletionModel;
  return provider;
}
createOpenRouter({
  compatibility: "strict"
  // strict for OpenRouter API
});

export { createOpenRouter };

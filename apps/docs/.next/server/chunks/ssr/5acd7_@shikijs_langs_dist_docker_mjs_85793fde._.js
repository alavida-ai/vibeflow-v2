module.exports = [
"[project]/node_modules/.pnpm/@shikijs+langs@3.12.2/node_modules/@shikijs/langs/dist/docker.mjs [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const lang = Object.freeze(JSON.parse("{\"displayName\":\"Dockerfile\",\"name\":\"docker\",\"patterns\":[{\"captures\":{\"1\":{\"name\":\"keyword.other.special-method.dockerfile\"},\"2\":{\"name\":\"keyword.other.special-method.dockerfile\"}},\"match\":\"^\\\\s*\\\\b(?i:(FROM))\\\\b.*?\\\\b(?i:(AS))\\\\b\"},{\"captures\":{\"1\":{\"name\":\"keyword.control.dockerfile\"},\"2\":{\"name\":\"keyword.other.special-method.dockerfile\"}},\"match\":\"^\\\\s*(?i:(ONBUILD)\\\\s+)?(?i:(ADD|ARG|CMD|COPY|ENTRYPOINT|ENV|EXPOSE|FROM|HEALTHCHECK|LABEL|MAINTAINER|RUN|SHELL|STOPSIGNAL|USER|VOLUME|WORKDIR))\\\\s\"},{\"captures\":{\"1\":{\"name\":\"keyword.operator.dockerfile\"},\"2\":{\"name\":\"keyword.other.special-method.dockerfile\"}},\"match\":\"^\\\\s*(?i:(ONBUILD)\\\\s+)?(?i:(CMD|ENTRYPOINT))\\\\s\"},{\"include\":\"#string-character-escape\"},{\"begin\":\"\\\"\",\"beginCaptures\":{\"1\":{\"name\":\"punctuation.definition.string.begin.dockerfile\"}},\"end\":\"\\\"\",\"endCaptures\":{\"1\":{\"name\":\"punctuation.definition.string.end.dockerfile\"}},\"name\":\"string.quoted.double.dockerfile\",\"patterns\":[{\"include\":\"#string-character-escape\"}]},{\"begin\":\"'\",\"beginCaptures\":{\"1\":{\"name\":\"punctuation.definition.string.begin.dockerfile\"}},\"end\":\"'\",\"endCaptures\":{\"1\":{\"name\":\"punctuation.definition.string.end.dockerfile\"}},\"name\":\"string.quoted.single.dockerfile\",\"patterns\":[{\"include\":\"#string-character-escape\"}]},{\"captures\":{\"1\":{\"name\":\"punctuation.whitespace.comment.leading.dockerfile\"},\"2\":{\"name\":\"comment.line.number-sign.dockerfile\"},\"3\":{\"name\":\"punctuation.definition.comment.dockerfile\"}},\"match\":\"^(\\\\s*)((#).*$\\\\n?)\"}],\"repository\":{\"string-character-escape\":{\"match\":\"\\\\\\\\.\",\"name\":\"constant.character.escaped.dockerfile\"}},\"scopeName\":\"source.dockerfile\",\"aliases\":[\"dockerfile\"]}"));
const __TURBOPACK__default__export__ = [
    lang
];
}),
];

//# sourceMappingURL=5acd7_%40shikijs_langs_dist_docker_mjs_85793fde._.js.map
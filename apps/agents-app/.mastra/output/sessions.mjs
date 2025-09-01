const sessions = /* @__PURE__ */ new Map();
const getSession = (sessionId) => {
  return sessions.get(sessionId);
};
const setSession = (sessionId, sessionData) => {
  sessions.set(sessionId, sessionData);
  return sessionData;
};
const deleteSession = (sessionId) => {
  sessions.delete(sessionId);
};

export { deleteSession as d, getSession as g, setSession as s };
//# sourceMappingURL=sessions.mjs.map

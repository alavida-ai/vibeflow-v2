type SessionData = {
    workflow?: {
        runId: string;
        workflowId: string;
    }
};

const sessions = new Map<string, SessionData>();

export const getSession = (sessionId: string) => {
    return sessions.get(sessionId);
};

export const setSession = (sessionId: string, sessionData: SessionData) => {
    sessions.set(sessionId, sessionData);
    return sessionData;
};

export const deleteSession = (sessionId: string) => {
    sessions.delete(sessionId);
};
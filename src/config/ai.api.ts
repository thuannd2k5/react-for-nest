import axios from 'config/axios-customize';

// config/ai.api.ts
export const callAnalyzeCompanyAI = (companyId: string) => {
    return axios.get(`/api/v1/llm/check-company/${companyId}`);
};


export const callAnalyzeJobAI = (jobId: string) => {
    return axios.get(`/api/v1/llm/check-job/${jobId}`);
};

export const callCareerChatAI = (
    userMessage: string,
    history: { role: string; message: string }[],
    context?: {
        jobId?: string;
        companyId?: string;
        userLevel?: string;
    }
) => {
    return axios.post(`/api/v1/chat-ai/chat`, {
        userMessage,
        history,
        context,
    });
};


export const callGenerateJobDescriptionAI = (payload: any) => {
    return axios.post('/api/v1/llm/ai-generate', payload);
};




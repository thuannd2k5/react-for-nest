import axios from 'config/axios-customize';

// config/ai.api.ts
export const callAnalyzeCompanyAI = (companyId: string) => {
    return axios.get(`/api/v1/llm/check-company/${companyId}`);
};


export const callAnalyzeJobAI = (jobId: string) => {
    return axios.get(`/api/v1/llm/check-job/${jobId}`);
};

export const callCareerChatAI = (message: string) => {
    return axios.post('/api/v1/chat-ai/chat', {
        message,
    });
};

export const callGetChatHistory = () => {
    return axios.get('/api/v1/chat-ai/history');
};


export const callGenerateJobDescriptionAI = (payload: any) => {
    return axios.post('/api/v1/llm/ai-generate', payload);
};




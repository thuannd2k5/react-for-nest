export type CompanyAIVerification = {
    verdict: "legitimate" | "suspicious" | "likely_fake";
    confidence: number;
    reasons: string[];
    red_flags: string[];
    recommendations: string[];
};


export type JobAIVerification = {
    job_legitimacy: 'hợp lý' | 'đáng ngờ' | 'rủi ro cao';
    confidence: number;
    risk_reasons: string[];
    suitable_for: string[];
    required_skills: {
        hard_skills: string[];
        soft_skills: string[];
    };
    language_requirement: {
        required: boolean;
        languages: string[];
    };
    recommendations: string[];
};


export type CareerChatResponse = {
    reply: string;
    analysis: string[];
    follow_up_questions: string[];
};

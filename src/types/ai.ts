export type CompanyAIVerification = {
    verdict: "legitimate" | "suspicious" | "likely_fake";
    confidence: number;
    reasons: string[];
    red_flags: string[];
    recommendations: string[];
};



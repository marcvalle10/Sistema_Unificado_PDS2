export type Course = {
    code: string;
    name: string;
    credits: number;
    eje?: "C" | "B" | "P" | "I" | "E";
    prereq?: string[];
    semester?: number;
    suggestedTerm?: number;
};
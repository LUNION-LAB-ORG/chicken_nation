

export interface AppClickBody {
    platform: "android" | "ios" | "web";
    userAgent: string;
    type?: string;
    targetId?: string;
    targetLabel?: string;
}
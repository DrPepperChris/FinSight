export interface PipelineStage {
    name: string;
    layer: string;
    source: string;
    output: string;
    purpose: string;
}

export interface AnalyticsMetric {
    label: string;
    value: string;
    description: string;
}
export interface ParsedPrompt {
  sections: {
    states?: string;
    derivedStates?: string;
    events?: string;
    effects?: string;
    view?: string;
    config?: string;
  };
  rawText: string;
}

// Centralized model definitions for NVIDIA NIM and OpenRouter

export const NVIDIA_MODELS = {
  default:   'meta/llama-3.1-70b-instruct',
  fast:      'meta/llama-3.1-8b-instruct',
  reasoning: 'nvidia/llama-3.1-nemotron-70b-instruct',
  vision:    'microsoft/phi-3-vision-128k-instruct',
} as const;

export const OPENROUTER_MODELS = {
  default:   'meta-llama/llama-3.1-70b-instruct:free',
  fast:      'meta-llama/llama-3.1-8b-instruct:free',
  reasoning: 'deepseek/deepseek-r1:free',
  vision:    'qwen/qwen-2-vl-7b-instruct:free',
} as const;

export type NvidiaModel = (typeof NVIDIA_MODELS)[keyof typeof NVIDIA_MODELS];
export type OpenRouterModel = (typeof OPENROUTER_MODELS)[keyof typeof OPENROUTER_MODELS];

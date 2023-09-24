import { Injectable, Logger } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { performance } from 'perf_hooks';
import { Embedding } from '../../../@generated/solomon.js';
import { config } from '../../../config.js';

interface LlamaOptions {
  temperature?: number;
  top_k?: number;
  top_p?: number;
  n_predict?: number;
  n_keep?: number;
  prompt: string;
  stop?: string[];
  tfs_z?: number;
  typical_p?: number;
  repeat_penalty?: number;
  repeat_last_n?: number;
  penalize_nl?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
  mirostat?: number;
  mirostat_tau?: number;
  mirostat_eta?: number;
  grammar?: string;
  seed?: number;
  ignore_eos?: boolean;
  logit_bias?: [number, number | false][];
}

const DEFAULT_OPTIONS: Partial<LlamaOptions> = {
  frequency_penalty: 0,
  mirostat: 0,
  mirostat_eta: 0.1,
  mirostat_tau: 5,
  presence_penalty: 0,
  repeat_last_n: 256,
  repeat_penalty: 1.1,
  temperature: 0.4,
  tfs_z: 1,
  top_k: 40,
  top_p: 0.5,
  typical_p: 1,
  stop: ['\\end{code}'],
};

type CompleteOptions = ({ messages: Message[] } | { prompt: string }) & {
  options?: Omit<LlamaOptions, 'prompt'>;
};

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class LlamaCppService {
  private log = new Logger(LlamaCppService.name);

  async embedding(input: string): Promise<Embedding> {
    const url = config.services.llm.server_url + '/embedding';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: input,
      }),
    });

    if (response.status !== 200) {
      throw new Error(`LLM server returned ${response.status}`);
    }

    const json = (await response.json()) as { embedding: number[] };
    const embedding = json.embedding;
    if (embedding.every((item) => item === 0)) {
      throw new Error(`LLM server returned an empty embedding. Is embedding enabled?`);
    }

    return Embedding.fromJson({
      value: embedding,
    });
  }

  async complete(input: CompleteOptions) {
    const start = performance.now();
    const prompt = 'prompt' in input ? input.prompt : this.messagesToPrompt(input.messages);
    writeFileSync('prompt.txt', prompt);

    const url = config.services.llm.server_url + '/completion';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...DEFAULT_OPTIONS,
        ...input.options,
        prompt: prompt,
      }),
    });

    if (response.status !== 200) {
      throw new Error(`LLM server returned ${response.status}`);
    }

    const json = (await response.json()) as { content: string };
    const end = performance.now();
    const duration = end - start;
    this.log.debug(`LLM took ${duration}ms`);
    return json.content;
  }

  messagesToPrompt(messages: Message[]) {
    let prompt = '';
    for (const message of messages) {
      switch (message.role) {
        case 'system':
          break;
        case 'user':
          prompt += `\\begin{code}\n// Path: ${message.content}\n// Parsed:\n`;
          break;
        case 'assistant':
          prompt += `${message.content}\n\\end{code}\n`;
          break;
        default:
          throw new Error(`Unknown message role: ${message.role}`);
      }
    }

    return prompt;
  }
}

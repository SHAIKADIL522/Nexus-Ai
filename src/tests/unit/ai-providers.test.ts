/**
 * AI Provider Unit Tests
 * Run: npm test
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Provider Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NVIDIA_API_KEY = 'test-nvidia-key';
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
  });

  it('should attempt NVIDIA first when key is present', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: new ReadableStream(),
      json: async () => ({ choices: [{ message: { content: 'test' } }] }),
    });

    const { nvidiaComplete } = await import('../lib/ai/providers/nvidia.provider');
    const response = await nvidiaComplete([{ role: 'user', content: 'hello' }]);
    expect(response.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('integrate.api.nvidia.com'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should include Authorization header with NVIDIA key', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, body: new ReadableStream(), json: async () => ({}) });
    const { nvidiaComplete } = await import('../lib/ai/providers/nvidia.provider');
    await nvidiaComplete([{ role: 'user', content: 'test' }]);
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBe('Bearer test-nvidia-key');
  });

  it('should fallback to OpenRouter when NVIDIA fails', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('NVIDIA unavailable'))
      .mockResolvedValueOnce({ ok: true, body: new ReadableStream() });

    const { streamCompletion } = await import('../lib/ai/providers/provider-manager');
    const result = await streamCompletion([{ role: 'user', content: 'hello' }]);
    expect(result.provider).toBe('openrouter');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should throw if both providers fail', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const { streamCompletion } = await import('../lib/ai/providers/provider-manager');
    await expect(streamCompletion([{ role: 'user', content: 'hi' }])).rejects.toThrow();
  });
});

describe('NVIDIA Models', () => {
  it('should export all required model constants', async () => {
    const { NVIDIA_MODELS, OPENROUTER_MODELS } = await import('../lib/ai/providers/models');
    expect(NVIDIA_MODELS.default).toBeDefined();
    expect(NVIDIA_MODELS.fast).toBeDefined();
    expect(NVIDIA_MODELS.reasoning).toBeDefined();
    expect(OPENROUTER_MODELS.default).toBeDefined();
  });
});

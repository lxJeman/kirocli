interface RateLimitConfig {
	requests_per_minute: number;
	tokens_per_minute: number;
}

interface RequestRecord {
	timestamp: number;
	tokens: number;
}

export class RateLimiter {
	private requests: RequestRecord[] = [];
	private config: RateLimitConfig;

	constructor(config: RateLimitConfig) {
		this.config = config;
	}

	async checkRateLimit(estimatedTokens: number = 1000): Promise<void> {
		const now = Date.now();
		const oneMinuteAgo = now - 60 * 1000;

		// Clean old requests
		this.requests = this.requests.filter(req => req.timestamp > oneMinuteAgo);

		// Check request limit
		if (this.requests.length >= this.config.requests_per_minute) {
			const oldestRequest = this.requests[0];
			if (oldestRequest) {
				const waitTime = 60 * 1000 - (now - oldestRequest.timestamp);
				throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request.`);
			}
		}

		// Check token limit
		const totalTokens = this.requests.reduce((sum, req) => sum + req.tokens, 0);
		if (totalTokens + estimatedTokens > this.config.tokens_per_minute) {
			const oldestRequest = this.requests[0];
			if (oldestRequest) {
				const waitTime = 60 * 1000 - (now - oldestRequest.timestamp);
				throw new Error(`Token rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request.`);
			}
		}

		// Record this request
		this.requests.push({
			timestamp: now,
			tokens: estimatedTokens,
		});
	}

	getRemainingRequests(): number {
		const now = Date.now();
		const oneMinuteAgo = now - 60 * 1000;
		const recentRequests = this.requests.filter(req => req.timestamp > oneMinuteAgo);
		return Math.max(0, this.config.requests_per_minute - recentRequests.length);
	}

	getRemainingTokens(): number {
		const now = Date.now();
		const oneMinuteAgo = now - 60 * 1000;
		const recentRequests = this.requests.filter(req => req.timestamp > oneMinuteAgo);
		const usedTokens = recentRequests.reduce((sum, req) => sum + req.tokens, 0);
		return Math.max(0, this.config.tokens_per_minute - usedTokens);
	}
}
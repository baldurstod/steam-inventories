import { JSONObject } from 'harmony-types';

export async function fetchApi(action: string, version: number, params: any = {}): Promise<{ requestId: string, response: JSONObject }> {
	const requestId = crypto.randomUUID();
	const response = await fetch('/api', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Request-ID': requestId,
		},
		body: JSON.stringify(
			{
				action: action,
				version: version,
				params: params,
			}
		),
	});

	return { requestId: requestId, response: await response.json() };
}

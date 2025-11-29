import { JSONObject } from 'harmony-types';
import { fetchApi } from './fetchapi';

export type InventoryResponse = {
	success: boolean,
	error?: string,
	result?: JSONObject
}

export async function getInventory(steamId64: string, appId: number, contextId: number): Promise<JSONObject | null> {
	const { requestId, response } = await fetchApi('get-inventory', 1, {
		steam_id64: steamId64,
		app_id: appId,
		context_id: contextId,
	}) as { requestId: string, response: InventoryResponse };

	if (!response.success) {
		return null;
	}

	return response.result!;
}

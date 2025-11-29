
import { JSONObject } from 'harmony-types';
import { createElement } from 'harmony-ui';
import { getInventory } from './api';

export const ITEM_QTY_THRESHOLD = 10;
export const MARKET_IMG_PREFIX = 'https://community.akamai.steamstatic.com/economy/image/';

class Application {
	#htmlTextArea!: HTMLTextAreaElement;
	#htmlAssets!: HTMLElement;
	#inventories = new Map<string, Map<string, number>>();
	//#total = new Map<string, number>();
	#schema = new Map();
	#totalItems = 0;

	constructor() {
		this.#initHTML();
		this.#inventories.set('total', new Map());
	}

	#initHTML() {
		this.#htmlTextArea = createElement('textarea', {
			parent: document.body,

		}) as HTMLTextAreaElement;

		createElement('button', {
			parent: document.body,
			innerText: 'go',
			$click: () => this.#listInventories(),
		}) as HTMLTextAreaElement;

		this.#htmlAssets = createElement('div', {
			parent: document.body,
		}) as HTMLTextAreaElement;
	}

	async #listInventories(): Promise<void> {
		this.#htmlTextArea.value;
		var lines = this.#htmlTextArea.value.split('\n');
		for (const line of lines) {
			//console.info(line);
			const result = await getInventory(line, 440, 2);
			console.info(result);
			if (result) {
				this.#processInventory(line, result);

			}
		}
		this.#updateDocument();
	}

	#processInventory(steamId64: string, inventoryJson: JSONObject) {
		//this.#totalSlots += inventoryJson.result.num_backpack_slots ?? 0;
		this.#inventories.set(steamId64, new Map());
		console.log(inventoryJson);
		let items = inventoryJson.assets;
		if (items) {
			this.#totalItems += inventoryJson.total_inventory_count as number;
			for (let item of items as JSONObject[]) {
				this.#addInventory(steamId64, item.classid as string);
				this.#addInventory('total', item.classid as string);
			}
		}

		const descriptions = inventoryJson.descriptions;
		if (descriptions) {
			for (let description of descriptions as JSONObject[]) {
				/*this.addInventory(steamID64, item.classid);
				this.addInventory('total', item.classid);*/
				this.#schema.set(description.classid, description);
			}
		}
	}

	#addInventory(steamId64: string, defIndex: string) {
		const userInventory = this.#inventories.get(steamId64);
		if (!userInventory) {
			return;
		}
		if (userInventory.has(defIndex)) {
			userInventory.set(defIndex, userInventory.get(defIndex)! + 1);
		} else {
			userInventory.set(defIndex, 1);
		}
	}

	#updateDocument() {
		this.#inventories.get('total')![Symbol.iterator] = function* (): MapIterator<[string, number]> {
			yield* [...this.entries()].sort(
				(a, b) => {
					return a[1] < b[1] ? 1 : -1;
				}
			);
		}

		for (let [defindex, total] of this.#inventories.get('total')!) {
			if ((total as number) > ITEM_QTY_THRESHOLD) {
				console.error(defindex, total);
				this.#createItem(defindex, total);
			}
		}
		//console.error(this.inventories);
		//console.error(this.schema);
		//console.error(this.#totalSlots, this.#totalItems);
	}

	#createItem(defindex: string, total: number) {
		let itemSchema = this.#schema.get(defindex);
		if (itemSchema) {
			let itemHtml = createElement('div', {
				parent: this.#htmlAssets,
				style: 'display: flex;align-items: center;font-family: sans-serif;',
				childs: [
					createElement('img', {
						style: 'width: 150px;',
						src: MARKET_IMG_PREFIX + itemSchema.icon_url,
					}) as HTMLImageElement,
					createElement('div', {
						innerText: String(total),
						style: 'font-size: 1em;margin:2px;',

					}),
					createElement('div', {
						innerText: itemSchema.name,
						style: 'font-size: 1em;',
					}),
				],
			});
		}
	}

}
const app = new Application();

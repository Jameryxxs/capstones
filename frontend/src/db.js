import Dexie from 'dexie';

export const db = new Dexie('FishLodgerDB');
db.version(2).stores({
  pendingPrices: '++id, fish, price_per_kilo, retailer, market_date, quantity_available, origin',
  pendingDeliveries: '++id, fish, quantity, supply_source, delivery_date'
});

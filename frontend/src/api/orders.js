import client from './client.js';

export async function placeOrder(address) {
  const { data } = await client.post('/api/orders', { address });
  return data;
}

export async function fetchOrder(orderNumber) {
  const { data } = await client.get(`/api/orders/${orderNumber}`);
  return data;
}

export async function fetchOrders() {
  const { data } = await client.get('/api/orders');
  return data;
}

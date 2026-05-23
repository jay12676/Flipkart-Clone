import client from './client.js';

export async function fetchCart() {
  const { data } = await client.get('/api/cart');
  return data;
}

export async function addToCart(productId, quantity = 1) {
  const { data } = await client.post('/api/cart/items', {
    product_id: productId,
    quantity,
  });
  return data;
}

export async function updateCartQuantity(cartItemId, quantity) {
  const { data } = await client.patch(`/api/cart/items/${cartItemId}`, { quantity });
  return data;
}

export async function removeFromCart(cartItemId) {
  const { data } = await client.delete(`/api/cart/items/${cartItemId}`);
  return data;
}

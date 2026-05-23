import client from './client.js';

export async function fetchWishlist() {
  const { data } = await client.get('/api/wishlist');
  return data;
}

export async function toggleWishlist(productId) {
  const { data } = await client.post('/api/wishlist/items', {
    product_id: productId,
  });
  return data;
}

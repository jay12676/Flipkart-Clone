import client from './client.js';

export async function fetchCategories() {
  const { data } = await client.get('/api/categories');
  return data;
}

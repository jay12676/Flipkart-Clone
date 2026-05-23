import client from './client.js';

export async function fetchProducts({ search, category, page = 1, pageSize = 24 } = {}) {
  const params = {};
  if (search) params.search = search;
  if (category) params.category = category;
  params.page = page;
  params.page_size = pageSize;

  const { data } = await client.get('/api/products', { params });
  return data;
}

export async function fetchProduct(id) {
  const { data } = await client.get(`/api/products/${id}`);
  return data;
}

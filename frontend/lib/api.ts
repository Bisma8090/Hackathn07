import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['RawMaterial', 'Product', 'Order', 'Dashboard'],
  endpoints: (builder) => ({
    // Raw Materials
    getRawMaterials: builder.query<any[], void>({
      query: () => '/raw-materials',
      providesTags: ['RawMaterial'],
    }),
    getLowStockMaterials: builder.query<any[], void>({
      query: () => '/raw-materials/low-stock',
      providesTags: ['RawMaterial'],
    }),
    createRawMaterial: builder.mutation<any, any>({
      query: (body) => ({ url: '/raw-materials', method: 'POST', body }),
      invalidatesTags: ['RawMaterial', 'Product'],
    }),
    updateRawMaterial: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/raw-materials/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['RawMaterial', 'Product'],
    }),
    deleteRawMaterial: builder.mutation<any, string>({
      query: (id) => ({ url: `/raw-materials/${id}`, method: 'DELETE' }),
      invalidatesTags: ['RawMaterial'],
    }),

    // Products
    getProducts: builder.query<any[], void>({
      query: () => '/products',
      providesTags: ['Product'],
    }),
    getProduct: builder.query<any, string>({
      query: (id) => `/products/${id}`,
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation<any, any>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/products/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation<any, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product'],
    }),

    // Orders
    getOrders: builder.query<any[], void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation<any, any>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Order', 'Product', 'RawMaterial', 'Dashboard'],
    }),
    updateOrderStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),

    // Dashboard
    getDashboardStats: builder.query<any, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetRawMaterialsQuery,
  useGetLowStockMaterialsQuery,
  useCreateRawMaterialMutation,
  useUpdateRawMaterialMutation,
  useDeleteRawMaterialMutation,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useGetDashboardStatsQuery,
} = api;

// API Client per il backend Django
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://167.99.143.43:8000/api";

export interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", {
          url,
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        const apiError = {
          message:
            errorData.detail ||
            errorData.message ||
            `HTTP Error ${response.status}`,
          status: response.status,
          data: errorData,
          response: { data: errorData }, // Per compatibilità con catch(error)
        } as ApiError & { response?: { data: unknown } };
        throw apiError;
      }

      // Se la risposta è 204 No Content o non ha body, ritorna undefined
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return undefined as T;
      }

      // Controlla se la risposta ha contenuto JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      // Se non è JSON, ritorna undefined
      return undefined as T;
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: "Network error",
        status: 0,
        data: error,
      } as ApiError;
    }
  }

  // Metodi generici per GET e POST (utilizzati nei form)
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  // Categories
  async getCategories() {
    return this.request<{ count: number; results: Category[] }>("/categories/");
  }

  async getCategory(id: number) {
    return this.request<Category>(`/categories/${id}/`);
  }

  async createCategory(data: Omit<Category, "id" | "products_count">) {
    return this.request<Category>("/categories/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: Partial<Category>) {
    return this.request<Category>(`/categories/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number) {
    return this.request<void>(`/categories/${id}/`, {
      method: "DELETE",
    });
  }

  // Products
  async getProducts(params?: { category?: number; is_active?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category) query.append("category", params.category.toString());
    if (params?.is_active !== undefined)
      query.append("is_active", params.is_active.toString());

    return this.request<{ count: number; results: Product[] }>(
      `/products/${query.toString() ? `?${query.toString()}` : ""}`,
    );
  }

  async getProduct(id: number) {
    return this.request<Product>(`/products/${id}/`);
  }

  async createProduct(data: Omit<Product, "id" | "category_name">) {
    return this.request<Product>("/products/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: Partial<Product>) {
    return this.request<Product>(`/products/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number) {
    return this.request<void>(`/products/${id}/`, {
      method: "DELETE",
    });
  }

  // Tables
  async getTables() {
    return this.request<{ count: number; results: Table[] }>("/tables/");
  }

  async getTable(id: number) {
    return this.request<Table>(`/tables/${id}/`);
  }

  async createTable(data: Omit<Table, "id">) {
    return this.request<Table>("/tables/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTable(id: number, data: Partial<Table>) {
    return this.request<Table>(`/tables/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTable(id: number) {
    return this.request<void>(`/tables/${id}/`, {
      method: "DELETE",
    });
  }

  // Reservations
  async getReservations(params?: { status?: string; date?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.date) query.append("date", params.date);

    return this.request<{ count: number; results: Reservation[] }>(
      `/reservations/${query.toString() ? `?${query.toString()}` : ""}`,
    );
  }

  async getReservation(id: number) {
    return this.request<Reservation>(`/reservations/${id}/`);
  }

  async createReservation(data: Omit<Reservation, "id" | "table_number">) {
    return this.request<Reservation>("/reservations/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateReservation(id: number, data: Partial<Reservation>) {
    return this.request<Reservation>(`/reservations/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async confirmReservation(id: number) {
    return this.request<Reservation>(`/reservations/${id}/confirm/`, {
      method: "POST",
    });
  }

  async cancelReservation(id: number) {
    return this.request<Reservation>(`/reservations/${id}/cancel/`, {
      method: "POST",
    });
  }

  async deleteReservation(id: number) {
    return this.request<void>(`/reservations/${id}/`, {
      method: "DELETE",
    });
  }

  // Orders
  async getOrders(params?: { status?: string; table?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.table) query.append("table", params.table.toString());

    return this.request<{ count: number; results: Order[] }>(
      `/orders/${query.toString() ? `?${query.toString()}` : ""}`,
    );
  }

  async getOrder(id: number) {
    return this.request<OrderDetail>(`/orders/${id}/`);
  }

  async createOrder(data: {
    table: number;
    status?: string;
    items: Array<{ product: number; quantity: number; notes?: string }>;
  }) {
    return this.request<OrderDetail>("/orders/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id: number, status: string) {
    return this.request<OrderDetail>(`/orders/${id}/update_status/`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  }

  async addOrderItem(
    id: number,
    item: { product: number; quantity: number; notes?: string },
  ) {
    return this.request<OrderDetail>(`/orders/${id}/add_item/`, {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async removeOrderItem(id: number, itemId: number) {
    return this.request<OrderDetail>(
      `/orders/${id}/remove_item/?item_id=${itemId}`,
      {
        method: "DELETE",
      },
    );
  }

  async deleteOrder(id: number) {
    return this.request<void>(`/orders/${id}/`, {
      method: "DELETE",
    });
  }
}

// Types
export interface Category {
  id: number;
  name: string;
  products_count?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  category?: number;
  category_name?: string;
  is_active: boolean;
}

export interface Table {
  id: number;
  number: number;
  table_number: number; // Alias per compatibilità
  capacity: number;
  seats: number; // Alias per compatibilità
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
  is_active: boolean;
}

export interface Reservation {
  id: number;
  customer_name: string;
  customer_phone: string;
  date: string;
  pax: number;
  table: number | null;
  table_number?: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  notes?: string;
  price_at_order: string;
  subtotal: string;
}

export interface Order {
  id: number;
  table: number;
  table_number: number;
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED";
  total_amount: string;
  items_count: number;
  created_at: string;
}

export interface OrderDetail extends Omit<Order, "items_count"> {
  updated_at: string;
  items: OrderItem[];
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

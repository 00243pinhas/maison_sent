export class PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  static from<T>(
    data: T[],
    total: number,
    query: { page: number; limit: number },
  ): PaginatedResponse<T> {
    const response = new PaginatedResponse<T>();
    response.data = data;
    response.total = total;
    response.page = query.page;
    response.limit = query.limit;
    response.totalPages = Math.ceil(total / query.limit);
    return response;
  }
}

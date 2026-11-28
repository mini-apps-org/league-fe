import type { ApiEnvelope } from '@/types/api';
import type { DivisionOption } from '@/types/divisions';

import { BaseAPI } from './baseAPI';
import { ENDPOINTS } from './endpoints';

class BaseDivisionsAPI extends BaseAPI {
  // Every division in every session, for the division pickers.
  async fetchDivisionOptions(): Promise<DivisionOption[]> {
    const { data } = await this.get<ApiEnvelope<DivisionOption[]>>(ENDPOINTS.DIVISIONS);

    return data;
  }
}

export const DivisionsAPI = new BaseDivisionsAPI();

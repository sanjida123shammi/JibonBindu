import { http } from "./http";

export interface CounterStats {
  totalDonation: number;
  totalCase: number;
  totalDonor: number;
  totalMember: number;
}

export const statsApi = {
  getCounterStats: async (): Promise<CounterStats> => {
    const res = await http.get<CounterStats>("/api/stats/counter");
    return res.data;
  },
};

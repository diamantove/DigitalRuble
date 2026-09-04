import { apiClient } from "../../../../shared/api/client";
import type { Wallet } from "../types";

export function getWallets(mid: string) {
    return apiClient.get<Wallet[]>(`/clients/${encodeURIComponent(mid)}/wallets`);
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// ----------------------------------------
// Queries
// ----------------------------------------

// Fetch all registered player tags
export function usePlayerTags() {
  return useQuery({
    queryKey: ["playerTags"],
    queryFn: async () => {
      const res = await api.get("/player/tags");
      return res.data;
    },
  });
}

// Fetch active player details with layout levels, builders, upgrades
export function usePlayerDetails(tag: string | null) {
  return useQuery({
    queryKey: ["playerDetails", tag],
    queryFn: async () => {
      if (!tag) return null;
      const res = await api.get(`/player/details/${encodeURIComponent(tag)}`);
      return res.data;
    },
    enabled: !!tag,
    staleTime: 30000, // Consider data fresh for 30 seconds (avoids redundant fetching on mounts/focus)
  });
}

// ----------------------------------------
// Mutations
// ----------------------------------------

// Register a new player tag
export function useRegisterTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (playerTag: string) => {
      const res = await api.post("/player/tag", { playerTag });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerTags"] });
    },
  });
}

// Sync details directly from Clash API
export function useSyncPlayerTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (playerTag: string) => {
      const res = await api.post(`/player/sync/${encodeURIComponent(playerTag)}`);
      return res.data;
    },
    onSuccess: (_, playerTag) => {
      queryClient.invalidateQueries({ queryKey: ["playerDetails", playerTag] });
    },
  });
}

// Start a building or laboratory upgrade
export function useStartUpgrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { playerTag: string; itemName: string; currentLevel: number; village?: string }) => {
      const res = await api.post("/upgrade/start", payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["playerDetails", variables.playerTag] });
    },
  });
}

// Complete upgrade instantly
export function useCompleteUpgrade(playerTag: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (upgradeId: string) => {
      const res = await api.post(`/upgrade/complete/${upgradeId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerDetails", playerTag] });
    },
  });
}

// Cancel upgrading timer
export function useCancelUpgrade(playerTag: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (upgradeId: string) => {
      const res = await api.post(`/upgrade/cancel/${upgradeId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerDetails", playerTag] });
    },
  });
}

// Speed up upgrade slots with active potion boost
export function useBoostTimers(playerTag: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/upgrade/boost/${encodeURIComponent(playerTag)}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerDetails", playerTag] });
    },
  });
}

// Import village profiles from JSON backups
export function useImportJson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jsonData: any) => {
      const res = await api.post("/player/import-json", jsonData);
      return res.data;
    },
    onSuccess: (data) => {
      const tag = data.player_tag || data.playerTag || data.tag;
      if (tag) {
        queryClient.invalidateQueries({ queryKey: ["playerDetails", tag] });
      }
    },
  });
}

// Update player building/troop/hero levels from pre-mapped frontend data
export function useUpdatePlayerLevels() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      playerTag: string;
      buildings?: { name: string; level: number; village?: string }[];
      troops?: { name: string; level: number; village?: string }[];
      heroes?: { name: string; level: number; village?: string }[];
    }) => {
      const res = await api.patch("/player/levels", payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["playerDetails", variables.playerTag] });
      queryClient.invalidateQueries({ queryKey: ["playerTags"] });
    },
  });
}

// ----------------------------------------
// Planner Hooks
// ----------------------------------------

export function usePlayerPlans(tag: string | null) {
  return useQuery({
    queryKey: ["playerPlans", tag],
    queryFn: async () => {
      if (!tag) return [];
      const res = await api.get(`/planner/plans/${encodeURIComponent(tag)}`);
      return res.data;
    },
    enabled: !!tag,
  });
}

export function useAddPlan(playerTag: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      playerTag: string;
      itemName: string;
      fromLevel: number;
      toLevel: number;
      priority?: number;
    }) => {
      const res = await api.post("/planner/plan", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerPlans", playerTag] });
    },
  });
}

export function useDeletePlan(playerTag: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/planner/plan/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerPlans", playerTag] });
    },
  });
}

export function useUpdatePlanPriority(playerTag: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; priority: number }) => {
      const res = await api.patch(`/planner/plan/${payload.id}/priority`, { priority: payload.priority });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerPlans", playerTag] });
    },
  });
}

export function useCalculatePlanCost() {
  return useMutation({
    mutationFn: async (payload: { items: { itemName: string; fromLevel: number; toLevel: number }[] }) => {
      const res = await api.post("/planner/calculate", payload);
      return res.data;
    },
  });
}


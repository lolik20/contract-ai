"use client";

import { useEffect, useState, useCallback } from "react";

export interface MeUser {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  questionBalance: number;
}

interface MeState {
  user: MeUser | null;
  loading: boolean;
  refresh: () => void;
}

/** Клиентский хук: текущий пользователь через GET /api/me. */
export function useMe(): MeState {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    return fetch("/api/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active) setUser(data.user ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, loading, refresh: load };
}

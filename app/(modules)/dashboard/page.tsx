"use client";

import { SectionCards } from "@/components/section-cards";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";

type Counts = {
  playkids: number;
  coaches: number;
  sports: number;
  branches: number;
};

export default function Page() {
  const [counts, setCounts] = useState<Counts>({
    playkids: 0,
    coaches: 0,
    sports: 0,
    branches: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);

  const fetchCount = useCallback(
    async (url: string, token: string, signal?: AbortSignal) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal,
        });

        if (!res.ok) {
          console.warn(`Failed to fetch ${url}:`, res.status);
          return 0;
        }

        const json = await res.json();
        const data = json?.data;
        return Array.isArray(data) ? data.length : 0;
      } catch (err: unknown) {
        // Jangan rethrow AbortError — cukup tangani secara diam-diam
        if (err instanceof Error && err.name === "AbortError") {
          // optional: console.debug("fetch aborted for", url);
          return 0;
        }
        console.error(`Error fetching ${url}:`, err);
        return 0;
      }
    },
    []
  );


  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const signal = controller.signal;

    const endpoints: Array<{ url: string; key: keyof Counts }> = [
      { url: "/admin/play-kid", key: "playkids" },
      { url: "/admin/coach", key: "coaches" },
      { url: "/admin/sport", key: "sports" },
      { url: "/admin/branch", key: "branches" },
    ];

    async function fetchAll() {
      setLoading(true);
      const token = Cookies.get("token") ?? "";

      const promises = endpoints.map((e) =>
        fetchCount(e.url, token, signal) // fetchCount sekarang sudah meng-handle AbortError
      );      

      try {
        const settled = await Promise.allSettled(promises);

        if (!mounted) return;

        const next: Counts = {
          playkids: 0,
          coaches: 0,
          sports: 0,
          branches: 0,
        };

        settled.forEach((s, i) => {
          const key = endpoints[i].key;
          if (s.status === "fulfilled") {
            next[key] = typeof s.value === "number" ? s.value : 0;
          } else {
            console.warn(`Request for ${endpoints[i].url} failed:`, s.reason);
            next[key] = 0;
          }
        });

        setCounts(next);
      } catch (err) {
        console.error("Unexpected error fetching counts:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAll();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [fetchCount]);

  return (
    <>
      {loading ? (
        <div className="px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="@container/card">
                <CardHeader>
                  <CardDescription>
                    <Skeleton className="h-5 w-24" />
                  </CardDescription>
                  <CardTitle>
                    <Skeleton className="h-10 w-32" />
                  </CardTitle>
                </CardHeader>

                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <div className="line-clamp-1 flex gap-2 font-medium">
                    <Skeleton className="h-5 w-48" />
                  </div>
                  <div className="text-muted-foreground">
                    <Skeleton className="h-4 w-40" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <SectionCards
          playkids={counts.playkids}
          coaches={counts.coaches}
          sports={counts.sports}
          branches={counts.branches}
        />
      )}
    </>
  );
}

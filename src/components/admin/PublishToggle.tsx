"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  isPublished: boolean;
}

export function PublishToggle({ id, isPublished }: Props) {
  const [published, setPublished] = useState(isPublished);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    const res = await fetch(`/api/contracts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !published }),
    });
    if (res.ok) {
      setPublished(!published);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
        published
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${published ? "bg-green-500" : "bg-gray-400"}`} />
      {published ? "Опубликован" : "Черновик"}
    </button>
  );
}

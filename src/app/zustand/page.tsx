"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { create } from "zustand";
import { persistNSync } from "persist-and-sync";

type Store = {
  object: {
    name: string;
    description: string;
  }
  counter: {
    nested: {
      count: number;
    }
  }
  setObject: (object: Store["object"]) => void;
  setCounter: (counter: Store["counter"]) => void;
}

export const useStore = create<Store>(
  persistNSync((set) => ({
    object: {
      name: "",
      description: "",
    },
    counter: {
      nested: {
        count: 0,
      }
    },
    setObject: (object) => set({ object }),
    setCounter: (counter) => set({ counter }),
  }), { name: "zustand-store" })
);
export default function ZustandPage() {
  const { object, counter, setObject, setCounter } = useStore();
  return (
    <div>
      <Input value={object.name} onChange={(e) => setObject({ ...object, name: e.target.value })} />
      <Input value={object.description} onChange={(e) => setObject({ ...object, description: e.target.value })} />
      <Button onClick={() => setCounter({ ...counter, nested: { ...counter.nested, count: counter.nested.count + 1 } })}>
        <Plus />
      </Button>
      <p>{counter.nested.count}</p>
    </div>
  )
}
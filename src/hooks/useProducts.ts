import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/lib/catalog";

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export function useProducts() {
  return useQuery({ queryKey: ["products"], queryFn: fetchProducts, staleTime: 5 * 60 * 1000 });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { TecdocError, isTecdocConfigured } from "@/lib/tecdoc/client";
import {
  decodeVin,
  getArticleDetail,
  getArticles,
  getCategories,
  getFitmentByOe,
  getManufacturers,
  getModels,
  getVehicles,
  resolveManufacturerId,
  searchByNumber,
} from "@/lib/tecdoc/queries";

const id = z.coerce.number().int().positive();

const actions = {
  search: {
    schema: z.object({ q: z.string().trim().min(3).max(40) }),
    run: ({ q }: { q: string }) => searchByNumber(q),
  },
  manufacturers: {
    schema: z.object({}),
    run: () => getManufacturers(),
  },
  models: {
    schema: z.object({ manufacturerId: id }),
    run: ({ manufacturerId }: { manufacturerId: number }) => getModels(manufacturerId),
  },
  vehicles: {
    schema: z.object({ modelId: id }),
    run: ({ modelId }: { modelId: number }) => getVehicles(modelId),
  },
  categories: {
    schema: z.object({ vehicleId: id }),
    run: ({ vehicleId }: { vehicleId: number }) => getCategories(vehicleId),
  },
  articles: {
    schema: z.object({ vehicleId: id, categoryId: id }),
    run: ({ vehicleId, categoryId }: { vehicleId: number; categoryId: number }) =>
      getArticles(vehicleId, categoryId),
  },
  detail: {
    schema: z.object({ articleId: id }),
    run: ({ articleId }: { articleId: number }) => getArticleDetail(articleId),
  },
  fitment: {
    schema: z.object({ make: z.string().trim().min(2).max(40), oe: z.string().trim().min(4).max(30) }),
    run: async ({ make, oe }: { make: string; oe: string }) => {
      const manufacturerId = await resolveManufacturerId(make);
      return manufacturerId ? getFitmentByOe(manufacturerId, oe) : [];
    },
  },
  vin: {
    schema: z.object({
      vin: z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN must be 17 characters"),
    }),
    run: ({ vin }: { vin: string }) => decodeVin(vin),
  },
} as const;

type Action = keyof typeof actions;

const STATUS: Record<TecdocError["code"], number> = {
  not_configured: 503,
  quota: 429,
  unauthorized: 502,
  not_found: 502,
  upstream: 502,
};

export async function GET(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!(action in actions)) {
    return NextResponse.json({ error: "unknown_action" }, { status: 404 });
  }
  if (!isTecdocConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { schema, run } = actions[action as Action];
  const input = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!input.success) {
    return NextResponse.json(
      { error: "invalid_input", message: input.error.issues[0]?.message },
      { status: 400 },
    );
  }

  try {
    const data = await (run as (args: unknown) => Promise<unknown>)(input.data);
    return NextResponse.json(
      { data },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch (error) {
    if (error instanceof TecdocError) {
      console.error(`[tecdoc] ${action}: ${error.message}`);
      return NextResponse.json({ error: error.code }, { status: STATUS[error.code] });
    }
    console.error(`[tecdoc] ${action}:`, error);
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}

import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./auth";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    user: await authenticateRequest(opts.req.headers),
  };
}

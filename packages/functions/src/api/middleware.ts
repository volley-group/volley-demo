import { type ClerkClient, type ClerkOptions, createClerkClient } from '@clerk/backend';
import type { SignedInAuthObject } from '@clerk/backend/internal';
import type { Context, MiddlewareHandler } from 'hono';
import { env } from 'hono/adapter';
import { HTTPException } from 'hono/http-exception';

// type ClerkAuth = ReturnType<Awaited<ReturnType<ClerkClient['authenticateRequest']>>['toAuth']>;
type ClerkRequestState = Awaited<ReturnType<ClerkClient['authenticateRequest']>>;

declare module 'hono' {
  interface ContextVariableMap {
    clerk: ClerkClient;
    requestState: ClerkRequestState;
    auth: SignedInAuthObject;
  }
}

export const getRequestState = (c: Context): ClerkRequestState => {
  return c.get('requestState');
};

// export const getAuth = (c: Context): ClerkAuth => {
//   return c.get('auth');
// };

type ClerkEnv = {
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_API_URL: string;
  CLERK_API_VERSION: string;
};

export const clerkMiddleware = (options?: ClerkOptions): MiddlewareHandler => {
  return async (c, next) => {
    const clerkEnv = env<ClerkEnv>(c);
    const { secretKey, publishableKey, apiUrl, apiVersion, ...rest } = options || {
      secretKey: clerkEnv.CLERK_SECRET_KEY || '',
      publishableKey: clerkEnv.CLERK_PUBLISHABLE_KEY || '',
      apiUrl: clerkEnv.CLERK_API_URL,
      apiVersion: clerkEnv.CLERK_API_VERSION,
    };
    if (!secretKey) {
      throw new Error('Missing Clerk Secret key');
    }

    if (!publishableKey) {
      throw new Error('Missing Clerk Publishable key');
    }

    const clerkClient = createClerkClient({
      ...rest,
      apiUrl,
      apiVersion,
      secretKey,
      publishableKey,
    });

    const requestState = await clerkClient.authenticateRequest(c.req.raw, {
      ...rest,
      secretKey,
      publishableKey,
    });

    if (requestState.headers) {
      requestState.headers.forEach((value, key) => c.res.headers.append(key, value));

      const locationHeader = requestState.headers.get('location');

      if (locationHeader) {
        return c.redirect(locationHeader, 307);
      } else if (requestState.status === 'handshake') {
        throw new Error('Clerk: unexpected handshake without redirect');
      }
    }

    c.set('clerk', clerkClient);
    c.set('requestState', requestState);

    await next();
  };
};

export const authenticatedMiddleware = ({
  allowUnauthenticated = false,
}: { allowUnauthenticated?: boolean } = {}): MiddlewareHandler => {
  return async (c, next) => {
    const request = c.get('requestState');
    if (!request.isSignedIn) {
      if (allowUnauthenticated) {
        return next();
      }
      throw new HTTPException(401, { message: 'Unauthorized' });
    }

    c.set('auth', request.toAuth());
    await next();
  };
};

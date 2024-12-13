/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SignedInImport } from './routes/signed-in'
import { Route as SignOutImport } from './routes/sign-out'
import { Route as AuthedImport } from './routes/_authed'
import { Route as IndexImport } from './routes/index'
import { Route as SlackInstallImport } from './routes/slack.install'
import { Route as SignUpSplatImport } from './routes/sign-up.$'
import { Route as SignInSplatImport } from './routes/sign-in.$'
import { Route as AuthedFeedImport } from './routes/_authed/feed'
import { Route as AuthedConfigImport } from './routes/_authed/config'

// Create/Update Routes

const SignedInRoute = SignedInImport.update({
  id: '/signed-in',
  path: '/signed-in',
  getParentRoute: () => rootRoute,
} as any)

const SignOutRoute = SignOutImport.update({
  id: '/sign-out',
  path: '/sign-out',
  getParentRoute: () => rootRoute,
} as any)

const AuthedRoute = AuthedImport.update({
  id: '/_authed',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const SlackInstallRoute = SlackInstallImport.update({
  id: '/slack/install',
  path: '/slack/install',
  getParentRoute: () => rootRoute,
} as any)

const SignUpSplatRoute = SignUpSplatImport.update({
  id: '/sign-up/$',
  path: '/sign-up/$',
  getParentRoute: () => rootRoute,
} as any)

const SignInSplatRoute = SignInSplatImport.update({
  id: '/sign-in/$',
  path: '/sign-in/$',
  getParentRoute: () => rootRoute,
} as any)

const AuthedFeedRoute = AuthedFeedImport.update({
  id: '/feed',
  path: '/feed',
  getParentRoute: () => AuthedRoute,
} as any)

const AuthedConfigRoute = AuthedConfigImport.update({
  id: '/config',
  path: '/config',
  getParentRoute: () => AuthedRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/_authed': {
      id: '/_authed'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthedImport
      parentRoute: typeof rootRoute
    }
    '/sign-out': {
      id: '/sign-out'
      path: '/sign-out'
      fullPath: '/sign-out'
      preLoaderRoute: typeof SignOutImport
      parentRoute: typeof rootRoute
    }
    '/signed-in': {
      id: '/signed-in'
      path: '/signed-in'
      fullPath: '/signed-in'
      preLoaderRoute: typeof SignedInImport
      parentRoute: typeof rootRoute
    }
    '/_authed/config': {
      id: '/_authed/config'
      path: '/config'
      fullPath: '/config'
      preLoaderRoute: typeof AuthedConfigImport
      parentRoute: typeof AuthedImport
    }
    '/_authed/feed': {
      id: '/_authed/feed'
      path: '/feed'
      fullPath: '/feed'
      preLoaderRoute: typeof AuthedFeedImport
      parentRoute: typeof AuthedImport
    }
    '/sign-in/$': {
      id: '/sign-in/$'
      path: '/sign-in/$'
      fullPath: '/sign-in/$'
      preLoaderRoute: typeof SignInSplatImport
      parentRoute: typeof rootRoute
    }
    '/sign-up/$': {
      id: '/sign-up/$'
      path: '/sign-up/$'
      fullPath: '/sign-up/$'
      preLoaderRoute: typeof SignUpSplatImport
      parentRoute: typeof rootRoute
    }
    '/slack/install': {
      id: '/slack/install'
      path: '/slack/install'
      fullPath: '/slack/install'
      preLoaderRoute: typeof SlackInstallImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

interface AuthedRouteChildren {
  AuthedConfigRoute: typeof AuthedConfigRoute
  AuthedFeedRoute: typeof AuthedFeedRoute
}

const AuthedRouteChildren: AuthedRouteChildren = {
  AuthedConfigRoute: AuthedConfigRoute,
  AuthedFeedRoute: AuthedFeedRoute,
}

const AuthedRouteWithChildren =
  AuthedRoute._addFileChildren(AuthedRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '': typeof AuthedRouteWithChildren
  '/sign-out': typeof SignOutRoute
  '/signed-in': typeof SignedInRoute
  '/config': typeof AuthedConfigRoute
  '/feed': typeof AuthedFeedRoute
  '/sign-in/$': typeof SignInSplatRoute
  '/sign-up/$': typeof SignUpSplatRoute
  '/slack/install': typeof SlackInstallRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '': typeof AuthedRouteWithChildren
  '/sign-out': typeof SignOutRoute
  '/signed-in': typeof SignedInRoute
  '/config': typeof AuthedConfigRoute
  '/feed': typeof AuthedFeedRoute
  '/sign-in/$': typeof SignInSplatRoute
  '/sign-up/$': typeof SignUpSplatRoute
  '/slack/install': typeof SlackInstallRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/_authed': typeof AuthedRouteWithChildren
  '/sign-out': typeof SignOutRoute
  '/signed-in': typeof SignedInRoute
  '/_authed/config': typeof AuthedConfigRoute
  '/_authed/feed': typeof AuthedFeedRoute
  '/sign-in/$': typeof SignInSplatRoute
  '/sign-up/$': typeof SignUpSplatRoute
  '/slack/install': typeof SlackInstallRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | ''
    | '/sign-out'
    | '/signed-in'
    | '/config'
    | '/feed'
    | '/sign-in/$'
    | '/sign-up/$'
    | '/slack/install'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | ''
    | '/sign-out'
    | '/signed-in'
    | '/config'
    | '/feed'
    | '/sign-in/$'
    | '/sign-up/$'
    | '/slack/install'
  id:
    | '__root__'
    | '/'
    | '/_authed'
    | '/sign-out'
    | '/signed-in'
    | '/_authed/config'
    | '/_authed/feed'
    | '/sign-in/$'
    | '/sign-up/$'
    | '/slack/install'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthedRoute: typeof AuthedRouteWithChildren
  SignOutRoute: typeof SignOutRoute
  SignedInRoute: typeof SignedInRoute
  SignInSplatRoute: typeof SignInSplatRoute
  SignUpSplatRoute: typeof SignUpSplatRoute
  SlackInstallRoute: typeof SlackInstallRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthedRoute: AuthedRouteWithChildren,
  SignOutRoute: SignOutRoute,
  SignedInRoute: SignedInRoute,
  SignInSplatRoute: SignInSplatRoute,
  SignUpSplatRoute: SignUpSplatRoute,
  SlackInstallRoute: SlackInstallRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_authed",
        "/sign-out",
        "/signed-in",
        "/sign-in/$",
        "/sign-up/$",
        "/slack/install"
      ]
    },
    "/": {
      "filePath": "index.ts"
    },
    "/_authed": {
      "filePath": "_authed.tsx",
      "children": [
        "/_authed/config",
        "/_authed/feed"
      ]
    },
    "/sign-out": {
      "filePath": "sign-out.tsx"
    },
    "/signed-in": {
      "filePath": "signed-in.tsx"
    },
    "/_authed/config": {
      "filePath": "_authed/config.tsx",
      "parent": "/_authed"
    },
    "/_authed/feed": {
      "filePath": "_authed/feed.tsx",
      "parent": "/_authed"
    },
    "/sign-in/$": {
      "filePath": "sign-in.$.tsx"
    },
    "/sign-up/$": {
      "filePath": "sign-up.$.tsx"
    },
    "/slack/install": {
      "filePath": "slack.install.tsx"
    }
  }
}
ROUTE_MANIFEST_END */

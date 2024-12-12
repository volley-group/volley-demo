import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { AppNavbar } from '@/components/app-navbar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

// const feeds = createServerFn({ method: "GET" })
//   .validator(z.object({ teamId: z.string() }))
//   .handler(async ({ data }) => {
//     // const { userId } = await getAuth(getWebRequest());
//     // const clerk = await clerkClient({
//     //   secretKey: Resource.ClerkSecretKey.value,
//     // });
//     // const accessTokens = (await clerk.users.getUserOauthAccessToken(userId!, "oauth_slack")).data;
//     // const token = accessTokens[0].token || "";
//     // const userInfo = await client.openid.connect.userInfo({
//     //   token,
//     // });
//     const teamConfigs = await db
//       .select({ ...getTableColumns(ConfigTable), teamId: SlackInstallationTable.teamId })
//       .from(ConfigTable)
//       .innerJoin(SlackInstallationTable, eq(ConfigTable.installationId, SlackInstallationTable.id))
//       .where(eq(SlackInstallationTable.teamId, data.teamId));
//     const products = await getFeeds();
//     const services = await products.reduce(
//       async (acc, product) => {
//         const services = await product.getServices();
//         return {
//           ...(await acc),
//           [product.name]: services,
//         };
//       },
//       Promise.resolve({} as Record<string, IService[]>),
//     );
//     const productsWithServices = products.map((product) => ({
//       name: product.name,
//       displayName: product.displayName,
//       logo: product.logo,
//       services: services[product.name],
//     }));
//     return { products: productsWithServices, teamConfigs };
//   });

// const toggleService = createServerFn({ method: "POST" })
//   .validator(z.object({ product: z.string(), service: z.string(), installationId: z.number() }))
//   .handler(async ({ data }) => {
//     const [config] = await db
//       .select({ services: ConfigTable.services })
//       .from(ConfigTable)
//       .where(and(eq(ConfigTable.installationId, data.installationId), eq(ConfigTable.product, data.product)));
//     if (!config) {
//       await db
//         .insert(ConfigTable)
//         .values({ product: data.product, installationId: data.installationId, services: [data.service] })
//         .onConflictDoUpdate({
//           target: [ConfigTable.product, ConfigTable.installationId],
//           set: {
//             services: sql`array_remove(${ConfigTable.services}, ${data.service})`,
//           },
//         });
//     } else {
//       config.services.includes(data.service)
//         ? await db
//             .update(ConfigTable)
//             .set({ services: sql`array_remove(${ConfigTable.services}, ${data.service})` })
//             .where(
//               and(eq(ConfigTable.installationId, data.installationId), eq(ConfigTable.product, data.product)),
//             )
//         : await db
//             .update(ConfigTable)
//             .set({ services: sql`array_append(${ConfigTable.services}, ${data.service})` })
//             .where(
//               and(eq(ConfigTable.installationId, data.installationId), eq(ConfigTable.product, data.product)),
//             );
//     }
//   });

export const Route = createFileRoute('/_authed/config')({
  component: ConfigComponent,
  loader: async ({ context: { hc } }) => {
    return await hc['get-feed-and-configs'].$get().then((r) => r.json());
  },
});

function ConfigComponent() {
  // const { products, teamConfigs } = Route.useLoaderData();
  const { products, teamConfigs } = Route.useLoaderData();
  const { hc } = Route.useRouteContext();
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [enabledServices, setEnabledServices] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearchQueries, setProductSearchQueries] = useState<Record<string, string>>({});

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const toggleService = (productId: string, serviceId: string) => {
    const productKey = `${productId}-${serviceId}`;
    // const newEnabled = new Set(enabledProducts);
    // if (newEnabled.has(productKey)) {
    //   newEnabled.delete(productKey);
    // } else {
    //   newEnabled.add(productKey);
    // }
    // setEnabledProducts(newEnabled);
  };

  // const getIconForProduct = (productId: string, serviceId: string) => {
  //   if (productId === 'github') {
  //     switch (serviceId) {
  //       case 'actions':
  //         return <GitBranch className="h-5 w-5" />;
  //       case 'api':
  //         return <Github className="h-5 w-5" />;
  //       case 'pages':
  //         return <Globe className="h-5 w-5" />;
  //       case 'packages':
  //         return <Package className="h-5 w-5" />;
  //       default:
  //         return <Github className="h-5 w-5" />;
  //     }
  //   } else if (productId === 'aws') {
  //     switch (serviceId) {
  //       case 'ec2':
  //         return <Server className="h-5 w-5" />;
  //       case 's3':
  //         return <Cloud className="h-5 w-5" />;
  //       case 'lambda':
  //         return <FileCode className="h-5 w-5" />;
  //       case 'rds':
  //         return <Database className="h-5 w-5" />;
  //       default:
  //         return <Cloud className="h-5 w-5" />;
  //     }
  //   }
  //   return <Cloud className="h-5 w-5" />;
  // };

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.services.some((service) => service.name.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [products, searchQuery]
  );

  const filteredServices = useCallback(
    (product: (typeof products)[0]) => {
      const productSearch = productSearchQueries[product.name] || '';
      return product.services.filter((service) => product.name.toLowerCase().includes(productSearch.toLowerCase()));
    },
    [productSearchQueries]
  );

  const handleProductSearch = (serviceId: string, query: string) => {
    setProductSearchQueries((prev) => ({
      ...prev,
      [serviceId]: query,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container mx-auto p-4 pt-20">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Service Configuration</h1>
            <p className="mt-2 text-muted-foreground">
              Choose which services and products you want to monitor. You'll receive notifications when there are
              incidents affecting your selected products.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Search services and products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />

            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Collapsible
                    key={product.name}
                    open={expandedProducts.has(product.name)}
                    onOpenChange={() => toggleProduct(product.name)}
                  >
                    <Card className="overflow-hidden">
                      <CollapsibleTrigger className="w-full text-left">
                        <CardHeader className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <img src={product.logo} alt={`${product.name} logo`} className="h-8 w-8 rounded-md" />
                              <h3 className="text-xl font-semibold">{product.name}</h3>
                            </div>
                            <Button variant="ghost" size="icon">
                              {expandedProducts.has(product.name) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="p-0">
                          <div className="px-6 py-2">
                            <Input
                              placeholder={`Search ${product.name} products...`}
                              value={productSearchQueries[product.name] || ''}
                              onChange={(e) => handleProductSearch(product.name, e.target.value)}
                              className="w-full"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="divide-y">
                            {filteredServices(product).map((service) => {
                              const isEnabled = enabledServices.has(`${product.name}-${service.name}`);
                              return (
                                <button
                                  key={product.name}
                                  className={cn(
                                    'flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-secondary/50',
                                    isEnabled && 'bg-secondary'
                                  )}
                                  onClick={() => toggleService(product.name, service.name)}
                                >
                                  <div className="flex items-center gap-3">
                                    {/* {getIconForProduct(product.name, service.name)} */}
                                    <span className="font-medium">{service.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={isEnabled}
                                      onCheckedChange={() => toggleService(product.name, service.name)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="data-[state=checked]:bg-primary"
                                    />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
}

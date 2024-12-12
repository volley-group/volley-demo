import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Loader2Icon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { AppNavbar } from '@/components/app-navbar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { hc, queryClient } from '@/lib/clients';
import type { InferResponseType } from 'hono/client';

const productsQuery = queryOptions({
  queryKey: ['products'],
  queryFn: () => hc['products'].$get().then((r) => r.json()),
});

const configsQuery = queryOptions({
  queryKey: ['configs'],
  queryFn: () => hc['configs'].$get().then((r) => r.json()),
});

export const Route = createFileRoute('/_authed/config')({
  component: ConfigComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(productsQuery);
    queryClient.ensureQueryData(configsQuery);
  },
});

function ConfigComponent() {
  const { isLoading: loadingProducts, data: productsData } = useQuery(productsQuery);
  const { isLoading: loadingConfigs, data: configsData } = useQuery(configsQuery);

  const configMutation = useMutation({
    mutationFn: (data: { product: string; service: string; action: 'add' | 'remove' }) =>
      hc.configs.$post({ json: data }).then((r) => r.json()),
    onMutate: (data) => {
      console.log(data);
      const previousData = queryClient.getQueryData(configsQuery.queryKey);
      const productConfig = previousData?.configs?.find((c) => c.product === data.product);
      const productServices = productConfig?.services || [];
      queryClient.setQueryData(configsQuery.queryKey, (oldData) => {
        return productConfig
          ? {
              configs: oldData!.configs.map((config) => {
                if (config.product === productConfig.product) {
                  return {
                    ...config,
                    services:
                      data.action === 'add'
                        ? [...productServices, data.service]
                        : productServices.filter((s) => s !== data.service),
                  };
                }
                return config;
              }),
            }
          : {
              configs: [
                {
                  installationId: 0,
                  product: data.product,
                  services: [data.service],
                },
              ],
            };
      });
      return { previousData };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(configsQuery.queryKey, (oldData) => {
        return {
          ...oldData,
          configs: oldData!.configs.map((c) => (c.product === data.config.product ? data.config : c)),
        };
      });
    },
    onError: (error, _, context) => {
      console.error(error);
      queryClient.setQueryData(configsQuery.queryKey, context?.previousData);
    },
  });

  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceSearchQueries, setServiceSearchQueries] = useState<Record<string, string>>({});

  const productServiceIsEnabled = useCallback(
    (product: string, service: string) => {
      return loadingConfigs
        ? false
        : configsData?.configs.some((config) => config.product == product && config.services.includes(service));
    },
    [configsData?.configs, loadingConfigs]
  );

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
    configMutation.mutate({
      product: productId,
      service: serviceId,
      action: productServiceIsEnabled(productId, serviceId) ? 'remove' : 'add',
    });
  };

  const filteredProducts = useMemo(
    () =>
      loadingProducts
        ? []
        : productsData?.products.filter(
            (product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.services.some((service) => service.name.toLowerCase().includes(searchQuery.toLowerCase()))
          ),
    [productsData, searchQuery, loadingProducts]
  );

  const filteredServices = useCallback(
    (product: InferResponseType<(typeof hc)['products']['$get']>['products'][0]) => {
      const serviceSearch = serviceSearchQueries[product.name] || '';
      return product.services.filter((service) => service.name.toLowerCase().includes(serviceSearch.toLowerCase()));
    },
    [serviceSearchQueries]
  );

  const handleServiceSearch = (productId: string, query: string) => {
    setServiceSearchQueries((prev) => ({
      ...prev,
      [productId]: query,
    }));
  };

  if (!productsData || !configsData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8">
          <Loader2Icon className="w-8 h-8" />
        </div>
        <p className="mt-4 text-muted-foreground">Loading configuration...</p>
      </div>
    );
  }

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
                {filteredProducts!.map((product) => (
                  <Collapsible
                    key={product.name}
                    open={expandedProducts.has(product.name)}
                    onOpenChange={() => toggleProduct(product.name)}
                  >
                    <Card className="overflow-hidden">
                      <CollapsibleTrigger className="w-full text-left">
                        <CardHeader className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={product.logo} alt={`${product.name} logo`} className="h-8 w-8 rounded-md" />
                              <h3 className="text-xl font-semibold">{product.displayName}</h3>
                            </div>
                            {expandedProducts.has(product.name) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="p-0">
                          <div className="px-6 py-2">
                            <Input
                              placeholder={`Search ${product.name} products...`}
                              value={serviceSearchQueries[product.name] || ''}
                              onChange={(e) => handleServiceSearch(product.name, e.target.value)}
                              className="w-full"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="divide-y">
                            {filteredServices(product).map((service) => {
                              const isEnabled = productServiceIsEnabled(product.name, service.name);
                              return (
                                <div
                                  key={service.name}
                                  className={cn(
                                    'flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-secondary/50',
                                    isEnabled && 'bg-secondary'
                                  )}
                                  // onClick={() => toggleService(product.name, service.name)}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium">{service.displayName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={isEnabled}
                                      onCheckedChange={() => toggleService(product.name, service.name)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="data-[state=checked]:bg-primary"
                                    />
                                  </div>
                                </div>
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

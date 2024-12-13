import { createFileRoute } from '@tanstack/react-router';
import { AppNavbar } from '@/components/app-navbar';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Check, Filter, Loader2Icon } from 'lucide-react';
import { hc } from '@/lib/clients';
import { useQuery, queryOptions } from '@tanstack/react-query';
import { MessageFeed } from '@/components/messages/message-feed';

const messagesQuery = queryOptions({
  queryKey: ['messages'],
  queryFn: () => hc['status-messages'].$get().then((r) => r.json()),
});

const productsQuery = queryOptions({
  queryKey: ['products'],
  queryFn: () => hc['products'].$get().then((r) => r.json()),
});

export const Route = createFileRoute('/_authed/feed')({
  component: FeedComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(messagesQuery);
    queryClient.ensureQueryData(productsQuery);
  },
  preload: true,
});

function FeedComponent() {
  const { data: messagesData } = useQuery(messagesQuery);
  const { data: productsData } = useQuery(productsQuery);

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Extract unique products and services
  // const { products, services } = useMemo(() => {
  //   const productsSet = new Set(messages.map((message) => message.product));

  //   // Create services with product context
  //   const servicesWithContext: ServiceWithContext[] = messages.flatMap((message) =>
  //     message.affectedServices.map((service) => ({
  //       name: service,
  //       product: message.product,
  //       displayName: `${message.product} - ${service}`,
  //     }))
  //   );

  //   // Remove duplicates by creating a Map with displayName as key
  //   const uniqueServices = Array.from(
  //     new Map(servicesWithContext.map((service) => [service.displayName, service])).values()
  //   ).sort((a, b) => a.displayName.localeCompare(b.displayName));

  //   return {
  //     products: Array.from(productsSet),
  //     services: uniqueServices,
  //   };
  // }, [messages]);

  const messages = useMemo(() => messagesData?.messages || [], [messagesData]);
  const products = useMemo(() => productsData?.products || [], [productsData]);
  const services = useMemo(
    () => products.flatMap((product) => product.services.map((service) => ({ ...service, product: product.name }))),
    [products]
  );
  // Filter incidents based on selections
  const filteredIncidents = useMemo(() => {
    return messages.filter((message) => {
      const matchesProduct = selectedProducts.size === 0 || selectedProducts.has(message.product);
      const matchesService =
        selectedServices.size === 0 ||
        message.affectedServices.some((service) => selectedServices.has(`${message.product} - ${service}`));
      const matchesSearch =
        searchQuery === '' ||
        message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.content.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesProduct && matchesService && matchesSearch;
    });
  }, [messages, selectedProducts, selectedServices, searchQuery]);

  // Filter services based on search
  const filteredServices = useMemo(() => {
    return services.filter(
      (service) =>
        (selectedProducts.size === 0 || selectedProducts.has(service.product)) &&
        service.displayName.toLowerCase().includes(serviceSearchQuery.toLowerCase())
    );
  }, [services, serviceSearchQuery, selectedProducts]);

  // Add products filter
  const filteredProducts = useMemo(() => {
    return products.filter((product) => product.displayName.toLowerCase().includes(productSearchQuery.toLowerCase()));
  }, [products, productSearchQuery]);

  const toggleProduct = (product: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(product)) {
      newSelected.delete(product);
    } else {
      newSelected.add(product);
    }
    setSelectedProducts(newSelected);
  };

  const toggleService = (serviceDisplayName: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceDisplayName)) {
      newSelected.delete(serviceDisplayName);
    } else {
      newSelected.add(serviceDisplayName);
    }
    setSelectedServices(newSelected);
  };

  if (!messagesData || !productsData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="mx-auto max-w-7xl p-4 pt-20">
        <div className="flex gap-8">
          <div className="flex-1">
            <MessageFeed messages={filteredIncidents} />
          </div>

          <div className="sticky top-20 w-64 shrink-0 rounded-lg border bg-card text-card-foreground shadow-sm max-h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex flex-col space-y-1.5 p-4">
              <h3 className="flex items-center gap-2 font-semibold leading-none tracking-tight">
                <Filter className="h-4 w-4" />
                Filters
              </h3>
            </div>
            <Separator />
            <div className="p-4 flex flex-col flex-1 space-y-4 overflow-hidden">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Products */}
              <div className="space-y-2 flex-shrink-0">
                <Label>Products</Label>
                <Input
                  placeholder="Search products..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="mb-2"
                />
                <ScrollArea className="rounded-md border">
                  <div className="space-y-1 p-2">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.name}
                        onClick={() => toggleProduct(product.name)}
                        className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm transition-colors hover:bg-gray-100 hover:text-gray-900 ${
                          selectedProducts.has(product.name) ? 'bg-gray-100' : ''
                        }`}
                      >
                        {product.displayName}
                        {selectedProducts.has(product.name) && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Services */}
              <div className="space-y-2 flex-1 min-h-0 flex flex-col">
                <Label>Services</Label>
                <Input
                  placeholder="Search services..."
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  className="mb-2"
                />
                <ScrollArea className="flex-1 rounded-md border">
                  <div className="space-y-1 p-2">
                    {filteredServices.map((service) => (
                      <button
                        key={service.displayName}
                        onClick={() => toggleService(service.displayName)}
                        className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm transition-colors hover:bg-gray-100 hover:text-gray-900 ${
                          selectedServices.has(service.displayName) ? 'bg-gray-100' : ''
                        }`}
                      >
                        {service.displayName}
                        {selectedServices.has(service.displayName) && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Active Filters */}
              {(selectedProducts.size > 0 || selectedServices.size > 0) && (
                <div className="space-y-2 flex-shrink-0">
                  <Label>Active Filters</Label>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(selectedProducts).map((product) => (
                      <Badge
                        key={product}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => toggleProduct(product)}
                      >
                        {product} ×
                      </Badge>
                    ))}
                    {Array.from(selectedServices).map((service) => (
                      <Badge
                        key={service}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => toggleService(service)}
                      >
                        {service} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

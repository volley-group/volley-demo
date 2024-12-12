import { createFileRoute } from '@tanstack/react-router';
import { IncidentFeed } from '@/components/incidents/incident-feed';
import { AppNavbar } from '@/components/app-navbar';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Check, Filter } from 'lucide-react';

interface ServiceWithContext {
  name: string;
  product: string;
  displayName: string; // Format: "Product - Service"
}

export const Route = createFileRoute('/_authed/feed')({
  component: FeedComponent,
  loader: async ({ context: { hc } }) => await hc['status-messages'].$get().then(r => r.json()),
});

function FeedComponent() {
  const { teamId, messages } = Route.useLoaderData();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Extract unique products and services
  const { products, services } = useMemo(() => {
    const productsSet = new Set(messages.map((message) => message.product));

    // Create services with product context
    const servicesWithContext: ServiceWithContext[] = messages.flatMap((message) =>
      message.affectedServices.map((service) => ({
        name: service,
        product: message.product,
        displayName: `${message.product} - ${service}`,
      }))
    );

    // Remove duplicates by creating a Map with displayName as key
    const uniqueServices = Array.from(
      new Map(servicesWithContext.map((service) => [service.displayName, service])).values()
    ).sort((a, b) => a.displayName.localeCompare(b.displayName));

    return {
      products: Array.from(productsSet),
      services: uniqueServices,
    };
  }, [messages]);

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
    return services.filter((service) => service.displayName.toLowerCase().includes(serviceSearchQuery.toLowerCase()));
  }, [services, serviceSearchQuery]);

  // Add products filter
  const filteredProducts = useMemo(() => {
    return products.filter((product) => product.toLowerCase().includes(productSearchQuery.toLowerCase()));
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

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="mx-auto max-w-7xl p-4 pt-20">
        <div className="flex gap-8">
          <div className="flex-1">
            <IncidentFeed
              incidents={filteredIncidents.map((message) => ({
                id: message.guid,
                title: message.title,
                description: message.content,
                timestamp: message.pubDate, // fallback to current date if invalid
                product: message.product,
                service: message.affectedServices[0] || 'Unknown',
                status: 'monitoring',
                severity: 'major',
                productIcon: '',
              }))}
            />
          </div>

          <div className="w-64 shrink-0">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-4">
                <h3 className="flex items-center gap-2 font-semibold leading-none tracking-tight">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
              </div>
              <Separator />
              <div className="p-4">
                <div className="space-y-4">
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
                  <div className="space-y-2">
                    <Label>Products</Label>
                    <Input
                      placeholder="Search products..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                    <ScrollArea className="h-[120px] rounded-md border">
                      <div className="space-y-1 p-2">
                        {filteredProducts.map((product) => (
                          <button
                            key={product}
                            onClick={() => toggleProduct(product)}
                            className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-sm transition-colors hover:bg-gray-100 hover:text-gray-900 ${
                              selectedProducts.has(product) ? 'bg-gray-100' : ''
                            }`}
                          >
                            {product}
                            {selectedProducts.has(product) && <Check className="h-4 w-4" />}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Services */}
                  <div className="space-y-2">
                    <Label>Services</Label>
                    <Input
                      placeholder="Search services..."
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                    <ScrollArea className="h-[120px] rounded-md border">
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
                    <div className="space-y-2">
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
          </div>
        </div>
      </main>
    </div>
  );
}

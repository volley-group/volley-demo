import { ReactNode, useState, ComponentPropsWithoutRef, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CaretRightIcon, CaretDownIcon } from '@radix-ui/react-icons';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface CollapsibleBoxProps extends Omit<ComponentPropsWithoutRef<typeof Collapsible>, 'title'> {
  title: ReactNode;
  children: ReactNode;
  toggleBar?: boolean;
  showCarat?: boolean;
}

export const CollapsibleBox = forwardRef<HTMLDivElement, CollapsibleBoxProps>(
  ({ title, children, defaultOpen = true, showCarat = true, toggleBar = true, ...props }, ref) => {
    return (
      <Collapsible {...props} open={props.open ?? defaultOpen} ref={ref} className={cn('rounded', props.className)}>
        <Card className="bg-background">
          <CollapsibleTrigger asChild className={`bg-amber-100 rounded-t ${!props.open ? 'rounded-b' : ''}`}>
            <div className={cn('flex items-center p-2 gap-2', toggleBar && 'cursor-pointer')}>
              {showCarat && (
                <Button variant="ghost" size="icon">
                  {props.open ? <CaretDownIcon /> : <CaretRightIcon />}
                  <span className="sr-only">Toggle</span>
                </Button>
              )}
              {title}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>{children}</CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }
);

CollapsibleBox.displayName = 'CollapsibleBox';

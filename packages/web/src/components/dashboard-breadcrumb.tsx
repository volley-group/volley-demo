import { Fragment } from "react";
import { isMatch, Link, useMatches } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

export const DashboardBreadcrumb = () => {
  const matches = useMatches();

  if (matches.some((match) => match.status === "pending")) return null;

  const matchesWithCrumbs = matches.filter((match) => isMatch(match, "loaderData.breadcrumb"));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {matchesWithCrumbs.map((match, i) =>
          i + 1 < matchesWithCrumbs.length ? (
            <Fragment key={match.loaderData?.breadcrumb}>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link from={match.fullPath}>{match.loaderData?.breadcrumb}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </Fragment>
          ) : (
            <BreadcrumbItem key={match.loaderData?.breadcrumb}>
              <BreadcrumbPage>{match.loaderData?.breadcrumb}</BreadcrumbPage>
            </BreadcrumbItem>
          ),
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}; 
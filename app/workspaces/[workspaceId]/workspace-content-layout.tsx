import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

export type PageInfoProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
};
type BreadcrumbItem = {
  title: string;
  href?: string;
};

export default function WorkspaceContentLayout({
  children,
  pageInfo,
}: {
  children: React.ReactNode;
  pageInfo: PageInfoProps;
}) {
  let items = pageInfo.breadcrumb?.map((item) => ({
    key: item.href,
    jsx: (
      <BreadcrumbItem key={item.href}>
        <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
      </BreadcrumbItem>
    ),
  }));
  return (
    <div className="grid gap-4 p-4 lg:gap-6 lg:p-6">
      {items &&
        items.length > 0 && ( // Checks if items is not null and has length
          <Breadcrumb>
            <BreadcrumbList>
              {items.map((item, i) => (
                <React.Fragment key={item.key}>
                  {items && i < items.length - 1 ? (
                    <>
                      {item.jsx}
                      <BreadcrumbSeparator>/</BreadcrumbSeparator>
                    </>
                  ) : (
                    <>
                      <BreadcrumbPage>{item.jsx}</BreadcrumbPage>
                    </>
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      <div>
        <div key="title" className="flex justify-between">
          <h1 className="text-lg font-semibold md:text-3xl">
            {pageInfo.title}
          </h1>
          <div key="action" className="flex gap-2">
            {pageInfo.actions}
          </div>
        </div>
        {pageInfo.subtitle && (
          <div key="subtitle" className="">
            {pageInfo.subtitle}
          </div>
        )}
      </div>

      <div>{children}</div>
    </div>
  );
}

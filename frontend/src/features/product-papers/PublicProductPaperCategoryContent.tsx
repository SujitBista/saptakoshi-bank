"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ProductPaperCategory } from "@saptakoshi/shared";
import { PublicPortalLayout } from "@/components/layout/PublicPortalLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  DataListCard,
  DataListCardField,
  DataListCards,
} from "@/components/ui/DataListCard";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import {
  fetchProductPapers,
  formatFileSize,
  formatProductPaperDate,
  getProductPaperCategoryLabel,
} from "@/features/product-papers/api";
import {
  DEFAULT_PRODUCT_PAPER_PAGE,
  DEFAULT_PRODUCT_PAPER_PAGE_SIZE,
  PRODUCT_PAPER_PAGE_SIZE_OPTIONS,
  type ProductPaper,
} from "@/features/product-papers/types";
import { getApiErrorMessage } from "@/lib/api-client";

const SEARCH_DEBOUNCE_MS = 300;

export function PublicProductPaperCategoryContent({
  category,
}: {
  category: ProductPaperCategory;
}) {
  const [productPapers, setProductPapers] = useState<ProductPaper[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(DEFAULT_PRODUCT_PAPER_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PRODUCT_PAPER_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProductPapers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchProductPapers({
        category,
        search: debouncedSearch,
        page,
        limit: pageSize,
      });

      setProductPapers(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);

      if (response.totalPages > 0 && page > response.totalPages) {
        setPage(response.totalPages);
      }
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Unable to load product papers. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [category, debouncedSearch, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = search.trim();

      if (nextSearch !== debouncedSearch) {
        setPage(DEFAULT_PRODUCT_PAPER_PAGE);
      }

      setDebouncedSearch(nextSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProductPapers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProductPapers]);

  return (
    <PublicPortalLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-blue">
            Product Paper: {getProductPaperCategoryLabel(category)}
          </h1>
          <p className="mt-2 text-sm text-brand-black-75">
            View public product paper PDFs for {getProductPaperCategoryLabel(category).toLowerCase()} products.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader
            title="Search Product Papers"
            description="Search by title, description, or file name"
          />
          <CardContent>
            <Input
              label="Search"
              placeholder="Search product papers"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Product Paper List"
            description={`${total} product paper${total === 1 ? "" : "s"} found`}
          />
          <CardContent>
            {error ? (
              <div
                className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
              </div>
            ) : productPapers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-black-15 px-6 py-12 text-center">
                <p className="text-sm font-medium text-brand-black">No product papers found</p>
                <p className="mt-1 text-sm text-brand-black-75">
                  Try adjusting your search terms.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Title</TableHeaderCell>
                        <TableHeaderCell>File Size</TableHeaderCell>
                        <TableHeaderCell>Updated</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productPapers.map((productPaper) => (
                        <TableRow key={productPaper.id}>
                          <TableCell className="max-w-md whitespace-normal font-medium text-brand-blue">
                            <div>
                              <p>{productPaper.title}</p>
                              {productPaper.description ? (
                                <p className="mt-1 text-xs text-brand-black-75">
                                  {productPaper.description}
                                </p>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>{formatFileSize(productPaper.fileSize)}</TableCell>
                          <TableCell>
                            {formatProductPaperDate(productPaper.updatedAt)}
                          </TableCell>
                          <TableCell>
                            <Link href={`/product-paper/view/${productPaper.id}`}>
                              <Button variant="outline" className="px-3 py-1.5 text-xs">
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <DataListCards className="md:hidden">
                  {productPapers.map((productPaper) => (
                    <DataListCard
                      key={productPaper.id}
                      title={productPaper.title}
                      subtitle={getProductPaperCategoryLabel(productPaper.category)}
                      actions={
                        <Link href={`/product-paper/view/${productPaper.id}`}>
                          <Button variant="outline" className="px-3 py-1.5 text-xs">
                            View
                          </Button>
                        </Link>
                      }
                    >
                      {productPaper.description ? (
                        <DataListCardField
                          label="Description"
                          value={productPaper.description}
                        />
                      ) : null}
                      <DataListCardField
                        label="File Size"
                        value={formatFileSize(productPaper.fileSize)}
                      />
                      <DataListCardField
                        label="Updated"
                        value={formatProductPaperDate(productPaper.updatedAt)}
                      />
                    </DataListCard>
                  ))}
                </DataListCards>

                <Pagination
                  className="mt-4"
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  itemLabel="product papers"
                  pageSizeOptions={PRODUCT_PAPER_PAGE_SIZE_OPTIONS}
                  onPageChange={setPage}
                  onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(DEFAULT_PRODUCT_PAPER_PAGE);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicPortalLayout>
  );
}

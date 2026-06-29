"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  DataListCard,
  DataListCardField,
  DataListCards,
} from "@/components/ui/DataListCard";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  fetchAdminProductPapers,
  formatFileSize,
  formatProductPaperDate,
  getProductPaperCategoryLabel,
} from "@/features/product-papers/api";
import { DeleteProductPaperDialog } from "@/features/product-papers/DeleteProductPaperDialog";
import {
  DEFAULT_PRODUCT_PAPER_PAGE,
  DEFAULT_PRODUCT_PAPER_PAGE_SIZE,
  PRODUCT_PAPER_CATEGORY_OPTIONS,
  PRODUCT_PAPER_PAGE_SIZE_OPTIONS,
  type ProductPaper,
} from "@/features/product-papers/types";
import { getApiErrorMessage } from "@/lib/api-client";

const SEARCH_DEBOUNCE_MS = 300;

export function AdminProductPaperListContent() {
  const { user, isReady, handleLogout } = useAdminAuth();
  const [productPapers, setProductPapers] = useState<ProductPaper[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [page, setPage] = useState(DEFAULT_PRODUCT_PAPER_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PRODUCT_PAPER_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductPaper, setSelectedProductPaper] = useState<ProductPaper | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadProductPapers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchAdminProductPapers({
        category: category === "ALL" ? undefined : (category as "DEPOSIT" | "CREDIT"),
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
    if (!isReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadProductPapers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isReady, loadProductPapers]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-blue-05">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
      </div>
    );
  }

  return (
    <AdminLayout
      userEmail={user.email}
      userRole={user.role}
      onLogout={handleLogout}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-blue sm:text-2xl">Product Papers</h1>
            <p className="mt-1 text-sm text-brand-black-75">
              Upload and manage public-facing bank product paper PDFs.
            </p>
          </div>
          <Link href="/admin/product-papers/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Upload Product Paper</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader
            title="Search and Filter"
            description="Filter by category or search by title, description, or file name"
          />
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
              <Input
                label="Search"
                placeholder="Search product papers"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <Select
                label="Category"
                options={[
                  { value: "ALL", label: "All categories" },
                  ...PRODUCT_PAPER_CATEGORY_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  })),
                ]}
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(DEFAULT_PRODUCT_PAPER_PAGE);
                }}
              />

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => {
                    setSearch("");
                    setDebouncedSearch("");
                    setCategory("ALL");
                    setPage(DEFAULT_PRODUCT_PAPER_PAGE);
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Product Paper Table"
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
                  Upload a new product paper or adjust the filters.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Category</TableHeaderCell>
                        <TableHeaderCell>Title</TableHeaderCell>
                        <TableHeaderCell>File Size</TableHeaderCell>
                        <TableHeaderCell>Uploaded</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productPapers.map((productPaper) => (
                        <TableRow key={productPaper.id}>
                          <TableCell>{getProductPaperCategoryLabel(productPaper.category)}</TableCell>
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
                          <TableCell>{formatProductPaperDate(productPaper.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Link href={`/admin/product-papers/${productPaper.id}`}>
                                <Button variant="outline" className="px-3 py-1.5 text-xs">
                                  View
                                </Button>
                              </Link>
                              <Link href={`/admin/product-papers/${productPaper.id}/edit`}>
                                <Button variant="outline" className="px-3 py-1.5 text-xs">
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                className="px-3 py-1.5 text-xs"
                                onClick={() => {
                                  setSelectedProductPaper(productPaper);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
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
                        <>
                          <Link href={`/admin/product-papers/${productPaper.id}`}>
                            <Button variant="outline" className="px-3 py-1.5 text-xs">
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/product-papers/${productPaper.id}/edit`}>
                            <Button variant="outline" className="px-3 py-1.5 text-xs">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => {
                              setSelectedProductPaper(productPaper);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      }
                    >
                      <DataListCardField
                        label="File Size"
                        value={formatFileSize(productPaper.fileSize)}
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

      <DeleteProductPaperDialog
        productPaper={selectedProductPaper}
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProductPaper(null);
        }}
        onSuccess={(deletedId) => {
          setProductPapers((current) =>
            current.filter((productPaper) => productPaper.id !== deletedId)
          );
          setTotal((current) => Math.max(0, current - 1));
        }}
      />
    </AdminLayout>
  );
}

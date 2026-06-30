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
  fetchCreditTrainingMaterials,
  formatFileSize,
  formatCreditTrainingMaterialDate,
} from "@/features/credit-training-materials/api";
import { DeleteCreditTrainingMaterialDialog } from "@/features/credit-training-materials/DeleteCreditTrainingMaterialDialog";
import {
  DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE,
  DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE_SIZE,
  CREDIT_TRAINING_MATERIAL_PAGE_SIZE_OPTIONS,
  type CreditTrainingMaterial,
} from "@/features/credit-training-materials/types";
import { getApiErrorMessage } from "@/lib/api-client";

const SEARCH_DEBOUNCE_MS = 300;

export function AdminCreditTrainingMaterialListContent() {
  const { user, isReady, handleLogout } = useAdminAuth();
  const [materials, setMaterials] = useState<CreditTrainingMaterial[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<CreditTrainingMaterial | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadMaterials = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchCreditTrainingMaterials({
        search: debouncedSearch,
        page,
        limit: pageSize,
      });

      setMaterials(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);

      if (response.totalPages > 0 && page > response.totalPages) {
        setPage(response.totalPages);
      }
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Unable to load Credit training materials. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextSearch = search.trim();

      if (nextSearch !== debouncedSearch) {
        setPage(DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE);
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
      void loadMaterials();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isReady, loadMaterials]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-blue-05">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue-25 border-t-brand-blue" />
      </div>
    );
  }

  return (
    <AdminLayout userEmail={user.email} userRole={user.role} onLogout={handleLogout}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-blue sm:text-2xl">Credit Management</h1>
            <p className="mt-1 text-sm text-brand-black-75">
              Upload and manage public-facing Credit training material PDFs.
            </p>
          </div>
          <Link href="/admin/training-materials/credit/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Upload Credit Training Material</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader
            title="Search Credit Training Materials"
            description="Search by title"
          />
          <CardContent>
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Input
                label="Search"
                placeholder="Search Credit training materials by title"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full md:w-auto"
                  onClick={() => {
                    setSearch("");
                    setDebouncedSearch("");
                    setPage(DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE);
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
            title="Credit Training Material Table"
            description={`${total} material${total === 1 ? "" : "s"} found`}
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
            ) : materials.length === 0 ? (
              <div className="rounded-xl border border-dashed border-brand-black-15 px-6 py-12 text-center">
                <p className="text-sm font-medium text-brand-black">
                  No Credit training materials found
                </p>
                <p className="mt-1 text-sm text-brand-black-75">
                  Upload a new Credit training material or adjust your search.
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
                        <TableHeaderCell>Uploaded</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {materials.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="max-w-md whitespace-normal font-medium text-brand-blue">
                            {material.title}
                          </TableCell>
                          <TableCell>{formatFileSize(material.fileSize)}</TableCell>
                          <TableCell>{formatCreditTrainingMaterialDate(material.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Link href={`/admin/training-materials/credit/${material.id}`}>
                                <Button variant="outline" className="px-3 py-1.5 text-xs">
                                  View
                                </Button>
                              </Link>
                              <Link href={`/admin/training-materials/credit/${material.id}/edit`}>
                                <Button variant="outline" className="px-3 py-1.5 text-xs">
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                className="px-3 py-1.5 text-xs"
                                onClick={() => {
                                  setSelectedMaterial(material);
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
                  {materials.map((material) => (
                    <DataListCard
                      key={material.id}
                      title={material.title}
                      actions={
                        <>
                          <Link href={`/admin/training-materials/credit/${material.id}`}>
                            <Button variant="outline" className="px-3 py-1.5 text-xs">
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/training-materials/credit/${material.id}/edit`}>
                            <Button variant="outline" className="px-3 py-1.5 text-xs">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => {
                              setSelectedMaterial(material);
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
                        value={formatFileSize(material.fileSize)}
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
                  itemLabel="Credit training materials"
                  pageSizeOptions={CREDIT_TRAINING_MATERIAL_PAGE_SIZE_OPTIONS}
                  onPageChange={setPage}
                  onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(DEFAULT_CREDIT_TRAINING_MATERIAL_PAGE);
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteCreditTrainingMaterialDialog
        material={selectedMaterial}
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedMaterial(null);
        }}
        onSuccess={(deletedId) => {
          setMaterials((current) => current.filter((material) => material.id !== deletedId));
          setTotal((current) => Math.max(0, current - 1));
        }}
      />
    </AdminLayout>
  );
}

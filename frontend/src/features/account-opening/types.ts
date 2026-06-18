export interface AccountOpeningUploadFormValues {
  clientCode: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  citizenNo: string;
  mobileNumber: string;
  file: FileList;
}

export interface AccountOpeningEditFormValues {
  firstName: string;
  lastName: string;
  fatherName: string;
  citizenNo: string;
  mobileNumber: string;
  file?: FileList;
}

export interface AccountOpeningDocument {
  id: number;
  branchId: number;
  branchCode: string;
  branchName: string;
  uploadedBy: number;
  uploadedByName: string;
  clientCode: string;
  firstName: string;
  lastName: string;
  fatherName: string | null;
  citizenNo: string;
  mobileNumber: string;
  documentNo: string;
  originalFileName: string;
  storedFileName: string;
  relativeFilePath: string;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountOpeningDocumentResponse {
  document: AccountOpeningDocument;
}

export interface AccountOpeningDocumentListResponse {
  data: AccountOpeningDocument[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AccountOpeningDocumentSearchFilters {
  search?: string;
  clientCode?: string;
  documentNo?: string;
  page?: number;
  limit?: number;
}

export const DEFAULT_ACCOUNT_OPENING_PAGE = 1;
export const DEFAULT_ACCOUNT_OPENING_PAGE_SIZE = 10;

export interface AccountOpeningUploadFormValues {
  clientCode: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  citizenNo: string;
  mobileNumber: string;
  file: FileList;
}

export interface AccountOpeningDocument {
  id: number;
  branchId: number;
  uploadedBy: number;
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

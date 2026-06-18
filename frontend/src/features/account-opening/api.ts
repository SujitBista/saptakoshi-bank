import { apiClient } from "@/lib/api-client";
import { getToken } from "@/lib/auth";
import type {
  AccountOpeningDocument,
  AccountOpeningDocumentResponse,
  AccountOpeningUploadFormValues,
} from "@/features/account-opening/types";

export async function uploadAccountOpeningDocument(
  values: AccountOpeningUploadFormValues
): Promise<AccountOpeningDocument> {
  const formData = new FormData();
  formData.set("client_code", values.clientCode.trim());
  formData.set("first_name", values.firstName.trim());
  formData.set("last_name", values.lastName.trim());
  formData.set("father_name", values.fatherName.trim());
  formData.set("citizen_no", values.citizenNo.trim());
  formData.set("mobile_number", values.mobileNumber.trim());
  formData.set("file", values.file[0]);

  const response = await apiClient<AccountOpeningDocumentResponse>(
    "/api/account-opening-documents",
    {
      method: "POST",
      body: formData,
      token: getToken(),
    }
  );

  return response.document;
}

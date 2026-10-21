export const FORM_REPOSITORY_TOKEN = Symbol('IFormRepository');

export interface IFormRepository {
  createForm(data: {
    tenantId: string;
    formName: string;
    formSchema: Record<string, any>;
    isActive: boolean;
  }): Promise<any>;
  findForms(tenantId: string): Promise<any[]>;
  findFormById(id: string): Promise<any | null>;
  createResponse(data: {
    formId: string;
    formData: Record<string, any>;
    submitterIp?: string;
  }): Promise<any>;
  findResponses(formId: string): Promise<any[]>;
}

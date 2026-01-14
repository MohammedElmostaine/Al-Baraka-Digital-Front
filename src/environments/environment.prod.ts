export const environment = {
  production: true,
  apiUrl: 'https://your-api.com',
  apiEndpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register'
    },
    client: {
      account: '/api/client/account',
      operations: '/api/client/operations',
      uploadDocument: '/api/client/operations/{id}/document',
      downloadDocument: '/api/client/documents/{id}'
    },
    agent: {
      pendingOperations: '/api/agent/operations/pending',
      approveOperation: '/api/agent/operations/{id}/approve',
      rejectOperation: '/api/agent/operations/{id}/reject',
      operationDocument: '/api/agent/operations/{id}/document',
      getOperationById: '/api/agent/operations/{id}'

    },
    admin: {
      users: '/api/admin/users',
      userById: '/api/admin/users/{id}',
      toggleStatus: '/api/admin/users/{id}/toggle-status',
      usersByRole: '/api/admin/users/role/{role}'
    }
  },
  tokenKey: 'albaraka_token',
  userKey: 'albaraka_user'
};

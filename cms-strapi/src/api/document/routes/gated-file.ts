export default {
  routes: [{
    method: 'GET',
    path: '/gated-resources/:documentId',
    handler: 'document.gatedFile',
    config: { auth: { scope: ['api::document.document.gatedFile'] } },
  }],
};

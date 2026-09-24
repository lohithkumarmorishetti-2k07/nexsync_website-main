// Legacy admin-middleware wrapper: now delegates to requireCoordinator
const { requireCoordinator } = require("./rbac-middleware");

module.exports = requireCoordinator;

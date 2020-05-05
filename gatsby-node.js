/* eslint no-param-reassign: 0 */
exports.onCreatePage = ({ page, actions }) => {
  const { createPage } = actions;
  if (page.path === '/') {
    page.matchPath = '/*';
    createPage(page);
  }
};

const webpack = require("webpack")
const path = require("path")

/* eslint no-param-reassign: 0 */
exports.onCreatePage = ({ page, actions }) => {
  const { createPage } = actions;
  if (page.path === '/') {
    page.matchPath = '/*';
    createPage(page);
  }
};
exports.onCreateWebpackConfig = ({
  stage,
  rules,
  loaders,
  plugins,
  actions,
}) => {
  actions.setWebpackConfig({
    plugins: [
      new webpack.NormalModuleReplacementPlugin( /node_modules\/antd\/lib\/style\/index\.less/, path.resolve('src/myStylesReplacement.less') )
    ],
  })
}

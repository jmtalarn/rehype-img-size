const path = require("path");
const visit = require("unist-util-visit");
const sizeOf = require("image-size");
const probe = require("probe-image-size");

module.exports = setImageSize;

function setImageSize(options) {
  const opts = options || {};
  const dir = opts.dir;
  return transformer;

  async function transformer(tree, file) {
    visit(tree, "element", visitor);
    function visitor(node) {
      if (node.tagName === "img") {
        let src = node.properties.src;
        if (src.startsWith("http")) {
          const { width, height } = await probe(src);
          node.properties.width = width;
          node.properties.height = height;
          return;
        }
        if (dir && src.startsWith("data:image")) {
          const { width, height } = await getImageDimensions(src);
          node.properties.width = width;
          node.properties.height = height;
          return;
        }
        if (dir && src.startsWith("/")) {
          src = path.join(dir, src);
        }
        const dimensions = sizeOf(src);
        node.properties.width = dimensions.width;
        node.properties.height = dimensions.height;
      }
    }
  }
}

function getImageDimensions(file) {
  return new Promise(function (resolved, rejected) {
    var i = new Image();
    i.onload = function () {
      resolved({ width: i.width, height: i.height });
    };
    i.src = file;
  });
}

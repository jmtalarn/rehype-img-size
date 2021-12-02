const path = require("path");
const visit = require("unist-util-visit");
const sizeOf = require("image-size");
const probe = require("probe-image-size");

module.exports = setImageSize;

function setImageSize(options) {
  const opts = options || {};
  const dir = opts.dir;
  return transformer;

  function transformer(tree, file) {
    visit(tree, "element", visitor);
    async function visitor(node) {
      if (node.tagName === "img") {
        let src = node.properties.src;
        let dimensions;
        if (src.startsWith("http")) {
          dimensions = await probe(src);
        }
        if (dir && src.startsWith("data:image")) {
          dimensions = sizeOf(
            Buffer.from(src.replace(/data:image\/.*;base64,/, ""), "base64")
          );
          dimensions.width = dimensions.width ?? dimensions.height ?? 640;
          dimensions.height = dimensions.height ?? dimensions.width ?? 640;
        }
        if (dir && src.startsWith("/")) {
          src = path.join(dir, src);
          dimensions = sizeOf(src);
        }
        node.properties.width = dimensions.width;
        node.properties.height = dimensions.height;
      }
    }
  }
}

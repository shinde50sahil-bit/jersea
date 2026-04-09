function isStoredImagePath(value) {
  return (
    typeof value === "string" &&
    value.trim().startsWith("/uploads/") &&
    !value.includes("..")
  );
}

module.exports = {
  isStoredImagePath
};

// Vitest's jsdom environment handles window/document/etc.
// Only need custom stubs here.
window.scrollTo = () => {};

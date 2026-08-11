// @pricy/api — the single tRPC API for Pricy.
//
// All three zones (marketing, web, admin) import their data procedures from
// here; procedures import @pricy/db to run queries. Client-facing components
// never touch @pricy/db directly — only this API.
//
// Populated in the upcoming steps (tRPC core, then the restaurants router).
export {};

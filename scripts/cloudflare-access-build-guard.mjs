export const assertCloudflareAccessConfirmed = (environment = process.env) => {
  if (environment.CF_PAGES === "1" && environment.TALLYO_CLOUDFLARE_ACCESS_CONFIRMED !== "true") {
    throw new Error("Cloudflare Pages build blocked until the required Access policies are confirmed");
  }
};

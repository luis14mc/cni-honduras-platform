export function isIndexableDeployment() {
  return process.env.NEXT_PUBLIC_SITE_URL === "https://cni.hn";
}

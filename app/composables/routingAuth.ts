import { navigateTo } from "#app";

export default function routingAuth(
  role: string,
  pathTujuan: string,
  pathSekarang: string,
  aksesPath: string | string[],
) {
  const router = useRouter();
  const defaultPath = `/dashboard/${role}`;
  console.log(pathSekarang, pathTujuan);
  const allowedPaths = Array.isArray(aksesPath) ? aksesPath : [aksesPath];
  if (allowedPaths.includes(pathTujuan)) {
    return;
  }
  if (pathSekarang.toString().trim() === defaultPath.toString().trim()) {
    console.log("path pathSekarang == defaultPath");
    return;
  } else {
    return defaultPath;
  }
}

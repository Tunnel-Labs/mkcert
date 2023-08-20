import fs from "node:fs";

import onetime from "onetime";
import path from "pathe";
import pMemoize from "p-memoize";
import { execa } from "execa";

export const getMkcertCertsPaths = pMemoize(
  async ({
    mkcertBin = "mkcert",
    monorepoDirpath,
  }: {
    mkcertBin: string;
    monorepoDirpath: string;
  }) => {
    const mkcertCertsDirpath = path.join(
      monorepoDirpath,
      "node_modules/.localdev/mkcert"
    );

    // Needs to be a dynamic import in order to be a "publishable" package
    const { stdout: caRootDirpath } = await execa(mkcertBin, ["-CAROOT"]);

    return {
      caFilePath: path.join(caRootDirpath, "rootCA.pem"),
      keyFilePath: path.join(mkcertCertsDirpath, "test-key.pem"),
      certFilePath: path.join(mkcertCertsDirpath, "test-cert.pem"),
    };
  },
  { cacheKey: (args) => args[0]?.mkcertBin ?? "mkcert" }
);

export const getMkcertCerts = onetime(
  async ({
    mkcertBin = "mkcert",
    monorepoDirpath,
  }: {
    mkcertBin: string;
    monorepoDirpath: string;
  }) => {
    const { caFilePath, keyFilePath, certFilePath } = await getMkcertCertsPaths(
      { mkcertBin, monorepoDirpath }
    );
    const [ca, key, cert] = await Promise.all([
      fs.promises.readFile(caFilePath, "utf8"),
      fs.promises.readFile(keyFilePath, "utf8"),
      fs.promises.readFile(certFilePath, "utf8"),
    ]);
    return { ca, key, cert };
  }
);

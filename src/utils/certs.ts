import fs from 'node:fs';

import onetime from 'onetime';
import os from 'node:os';
import path from 'pathe';
import pMemoize from 'p-memoize';
import { execa } from 'execa';

export const getMkcertCertsPaths = pMemoize(
	async ({
		mkcertBin = 'mkcert',
		monorepoDirpath
	}: {
		mkcertBin: string;
		monorepoDirpath: string;
	}) => {
		const mkcertCertsDirpath = path.join(os.homedir(), '.mkcert');

		// Needs to be a dynamic import in order to be a "publishable" package
		const { stdout: caRootDirpath } = await execa(mkcertBin, ['-CAROOT']);

		return {
			caFilepath: path.join(caRootDirpath, 'rootCA.pem'),
			keyFilepath: path.join(mkcertCertsDirpath, 'test-key.pem'),
			certFilepath: path.join(mkcertCertsDirpath, 'test-cert.pem')
		};
	},
	{ cacheKey: (args) => args[0]?.mkcertBin ?? 'mkcert' }
);

export const getMkcertCerts = onetime(
	async ({
		mkcertBin = 'mkcert',
		monorepoDirpath
	}: {
		mkcertBin: string;
		monorepoDirpath: string;
	}) => {
		const { caFilepath, keyFilepath, certFilepath } = await getMkcertCertsPaths(
			{ mkcertBin, monorepoDirpath }
		);
		const [ca, key, cert] = await Promise.all([
			fs.promises.readFile(caFilepath, 'utf8'),
			fs.promises.readFile(keyFilepath, 'utf8'),
			fs.promises.readFile(certFilepath, 'utf8')
		]);
		return { ca, key, cert };
	}
);

import { spawn } from 'child_process';
import { checkProxy, getNewFingerprint, spawnArgs, writePrefs } from '../src/index';
import { IProfile } from '../src/types';
import fs from 'fs-extra';
import path from 'path';

const profileStorage = path.join(path.resolve(), 'profiles')
const executablePath = "C:/Users/Admin/.gologin/browser/orbita-browser-134/chrome.exe"

const proxyStr = '171.225.119.77:21603:khljtiNj3Kd:fdkm3nbjg45d'
const [host, port, username, password] = proxyStr.split(':');

const startProfile = async () => {
  const profile: IProfile = {
    proxy: {
      protocol: 'http',
      host,
      port: parseInt(port),
      username,
      password
    }
  }

  if (profile.proxy.protocol)
    profile.proxyInfo = await checkProxy(profile.proxy)

  const fingerprint = getNewFingerprint(profile);

  const userDataDir = path.join(profileStorage, 'test')

  await fs.ensureDir(path.join(userDataDir))

  await writePrefs(userDataDir, fingerprint)

  const args = spawnArgs({ userDataDir, remoteDebuggingPort: 1234 }, profile)

  const child = spawn(executablePath, args)

  console.log('child', child.pid);
}

(async () => {
  await Promise.all(Array.from({ length: 1 }, (_, index) => index).map(() => startProfile()))
})()
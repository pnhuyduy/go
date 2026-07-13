import { spawn } from 'child_process';
import { checkProxy, getNewFingerprint, randomInt, spawnArgs, writePrefs } from '../src/index';
import { IProfile } from '../src/types';
import fs from 'fs-extra';
import path from 'path';

const profileStorage = path.join(path.resolve(), 'profiles')
const version = '146'
const executablePath = `C:/Users/Admin/.gologin/browser/orbita-browser-${version}/chrome.exe`

const proxyStr = '103.179.189.46:14545:kp20:kp20'
const [host, port, username, password] = proxyStr.split(':');

const startProfile = async () => {
  const profile: IProfile = {
    proxy: {
      protocol: null,
      host,
      port: parseInt(port),
      username,
      password
    }
  }

  if (profile.proxy.protocol)
    profile.proxyInfo = await checkProxy(profile.proxy)

  const fingerprint = getNewFingerprint(profile);

  const userDataDir = path.join(profileStorage, randomInt(0, 999999).toString())

  await fs.ensureDir(path.join(userDataDir))

  await writePrefs(userDataDir, fingerprint)

  const args = spawnArgs({ userDataDir, remoteDebuggingPort: 1234 }, profile)

  const child = spawn(executablePath, args)

  console.log('child', child.pid);
}

(async () => {
  await Promise.all(Array.from({ length: 2 }, (_, index) => index).map(() => startProfile()))
})()
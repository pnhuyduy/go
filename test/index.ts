import { execFile } from 'child_process';
import { getNewFingerprint, spawnArgs, writePrefs } from '../src/index';
import { IProfile } from '../src/types';
import fs from 'fs-extra';
import path from 'path';

const profileStorage = path.join(path.resolve(), 'profiles')
const executablePath = "C:/Users/Admin/.gologin/browser/orbita-browser-120/chrome.exe"


const startProfile = async () => {
  const profile: IProfile = {
    proxy: {
      protocol: null,
      host: 'string',
      port: 0,
      username: 'string',
      password: 'string',
    }
  }

  const fingerprint = getNewFingerprint(profile);

  const userDataDir = path.join(profileStorage, fingerprint.gologin.name)

  await fs.ensureDir(path.join(userDataDir))

  await writePrefs(userDataDir, fingerprint)

  const args = spawnArgs({ userDataDir }, profile)

  const child = execFile(executablePath, args)
}

(async () => {
  await Promise.all(Array.from({ length: 2 }, (_, index) => index).map(() => startProfile()))
})()
import { Nullable } from './types'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { HttpsProxyAgent } from 'https-proxy-agent'
import https from 'node:https'

export interface IProxyService {
  name: string
  url: string
  extract: (data: any) => ICheckProxyResult
}

export interface IProxy {
  protocol: Nullable<'http' | 'socks'>
  host: string
  port: number
  username: string
  password: string
}

export interface ICheckProxyResult {
  ip: string
  country: string
  timezone: string
  latitude: string
  longitude: string
  accuracy: Nullable<number>
}

export const PROXY_SERVICES: IProxyService[] = [
  {
    name: 'ipfoxy',
    url: 'https://api.ipfoxy.com/sys/tools/ip/get-info',
    extract: (data: any): ICheckProxyResult => {
      return {
        ip: data.data.ip,
        country: data.data.ip_data.country,
        timezone: data.data.ip_data.timezone,
        latitude: data.data.ip_data.latitude,
        longitude: data.data.ip_data.longitude,
        accuracy: null,
      }
    },
  },
  {
    name: 'TZ',
    url: 'https://time.gologin.com/timezone',
    extract: (data: any): ICheckProxyResult => {
      return {
        ip: data.ip,
        country: data.country,
        timezone: data.timezone,
        latitude: data.ll[0],
        longitude: data.ll[1],
        accuracy: data.accuracy || null,
      }
    },
  },
]

export const extractProxyInfo = async (
  proxy: IProxy,
  serviceChecker: IProxyService,
  timeout: number = 5000,
): Promise<Nullable<ICheckProxyResult>> => {
  const { protocol, host, port, username, password } = proxy

  if (!host || !port) throw new Error('Invalid proxy')

  let agent: any
  let data: Nullable<ICheckProxyResult> = null

  let proxyAgent = `${protocol}://${host}:${port}`

  if (username && password)
    proxyAgent = `${protocol}://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}`

  if (protocol === 'http') agent = new HttpsProxyAgent(proxyAgent, { timeout })
  else if (protocol === 'socks') agent = new SocksProxyAgent(proxyAgent, { timeout })

  return new Promise((resolve) => {
    let d = ''
    const res = https.get(
      serviceChecker.url,
      {
        agent,
        headers: {
          ...(serviceChecker.name === 'ipgeolocation'
            ? {
                origin: 'https://ipgeolocation.io',
                referer: 'https://ipgeolocation.io/',
                accept: 'application/json',
                'user-agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              }
            : {}),
        },
        rejectUnauthorized: false,
      },
      (response: any) => {
        response.on('error', () => {
          resolve(null)
        })
        response.on('data', (chunk: any) => {
          d += chunk
        })

        response.on('end', () => {
          data = serviceChecker.extract(JSON.parse(d))
          if (data && data.ip && data.timezone) resolve(data)
          else resolve(null)
        })
      },
    )

    res.on('error', () => {
      resolve(null)
    })

    res.end()
  })
}

export const checkProxy = async (proxy: IProxy, timeout = 5000) => {
  for (const serviceChecker of PROXY_SERVICES) {
    const data = await extractProxyInfo(proxy, serviceChecker, timeout)
    if (data) return data
  }

  return null
}

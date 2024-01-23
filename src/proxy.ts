import { Nullable } from './types'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { HttpsProxyAgent } from 'https-proxy-agent'
import https from 'node:https';

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
    name: 'ipgeolocation',
    url: 'https://api.ipgeolocation.io/ipgeo',
    extract: (data: any): ICheckProxyResult => {
      return {
        ip: data.ip,
        country: data.country_name,
        timezone: data.time_zone.name,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: null,
      }
    },
  },
  {
    name: 'ipscore',
    url: 'https://ipscore.io/api/v1/score',
    extract: (data: any): ICheckProxyResult => {
      return {
        ip: data.ip_address,
        country: data.country,
        timezone: data.timezone,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: null,
      }
    },
  },
  {
    name: 'ipsb',
    url: 'https://api.ip.sb/geoip',
    extract: (data: any): ICheckProxyResult => {
      return {
        ip: data.ip,
        country: data.country_code,
        timezone: data.timezone,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: null,
      }
    },
  },
  {
    name: 'ipinfo',
    url: 'https://ipinfo.io/json',
    extract: (data: any): ICheckProxyResult => {
      const loc = data.loc.split(',')
      return {
        ip: data.ip,
        country: data.country,
        timezone: data.timezone,
        latitude: loc[0],
        longitude: loc[1],
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
  {
    name: 'lumtest',
    url: 'https://lumtest.com/myip.json',
    extract: (data: any): ICheckProxyResult => {
      return {
        ip: data.ip,
        country: data.country,
        timezone: data.geo.tz,
        latitude: data.geo.latitude,
        longitude: data.geo.longitude,
        accuracy: null,
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

  if (protocol === 'http')
    agent = new HttpsProxyAgent(proxyAgent, { timeout })
  else if (protocol === 'socks')
    agent = new SocksProxyAgent(proxyAgent, { timeout })

  return new Promise((resolve) => {
    let d = ''
    const res = https
      .get(
        serviceChecker.url,
        {
          agent,
          headers: {
            ...(serviceChecker.name === 'ipgeolocation'
              ? {
                'origin': 'https://ipgeolocation.io',
                'referer': 'https://ipgeolocation.io/',
                'accept': 'application/json',
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
            if (data && data.ip && data.timezone)
              resolve(data)
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
    if (data)
      return data
  }

  return null
}

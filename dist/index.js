"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// test/index.ts
var import_child_process = require("child_process");

// src/proxy.ts
var import_socks_proxy_agent = require("socks-proxy-agent");
var import_https_proxy_agent = require("https-proxy-agent");
var import_node_https = __toESM(require("https"));
var PROXY_SERVICES = [
  {
    name: "ipfoxy",
    url: "https://api.ipfoxy.com/sys/tools/ip/get-info",
    extract: (data) => {
      return {
        ip: data.data.ip,
        country: data.data.ip_data.country,
        timezone: data.data.ip_data.timezone,
        latitude: data.data.ip_data.latitude,
        longitude: data.data.ip_data.longitude,
        accuracy: null
      };
    }
  },
  {
    name: "TZ",
    url: "https://time.gologin.com/timezone",
    extract: (data) => {
      return {
        ip: data.ip,
        country: data.country,
        timezone: data.timezone,
        latitude: data.ll[0],
        longitude: data.ll[1],
        accuracy: data.accuracy || null
      };
    }
  }
];
var extractProxyInfo = async (proxy, serviceChecker, timeout = 5e3) => {
  const { protocol, host: host2, port: port2, username: username2, password: password2 } = proxy;
  if (!host2 || !port2)
    throw new Error("Invalid proxy");
  let agent;
  let data = null;
  let proxyAgent = `${protocol}://${host2}:${port2}`;
  if (username2 && password2)
    proxyAgent = `${protocol}://${encodeURIComponent(username2)}:${encodeURIComponent(password2)}@${host2}:${port2}`;
  if (protocol === "http")
    agent = new import_https_proxy_agent.HttpsProxyAgent(proxyAgent, { timeout });
  else if (protocol === "socks")
    agent = new import_socks_proxy_agent.SocksProxyAgent(proxyAgent, { timeout });
  return new Promise((resolve) => {
    let d = "";
    const res = import_node_https.default.get(
      serviceChecker.url,
      {
        agent,
        headers: {
          ...serviceChecker.name === "ipgeolocation" ? {
            origin: "https://ipgeolocation.io",
            referer: "https://ipgeolocation.io/",
            accept: "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          } : {}
        },
        rejectUnauthorized: false
      },
      (response) => {
        response.on("error", () => {
          resolve(null);
        });
        response.on("data", (chunk) => {
          d += chunk;
        });
        response.on("end", () => {
          data = serviceChecker.extract(JSON.parse(d));
          if (data && data.ip && data.timezone)
            resolve(data);
          else
            resolve(null);
        });
      }
    );
    res.on("error", () => {
      resolve(null);
    });
    res.end();
  });
};
var checkProxy = async (proxy, timeout = 5e3) => {
  for (const serviceChecker of PROXY_SERVICES) {
    const data = await extractProxyInfo(proxy, serviceChecker, timeout);
    if (data)
      return data;
  }
  return null;
};

// src/generator.ts
var import_rfdc = __toESM(require("rfdc"));
var import_defu = __toESM(require("defu"));
var import_path = __toESM(require("path"));
var import_fs_extra = __toESM(require("fs-extra"));

// src/utils.ts
var import_crypto = __toESM(require("crypto"));

// src/webgl.ts
var webgl_default = [
  {
    label: "Google Inc. (NVIDIA)",
    value: "Google Inc. (NVIDIA)",
    renderer: [
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1080 Ti Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.9729)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1080 Ti Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.9729)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.7280)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.7280)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.9676)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.9676)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.9729)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.9729)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Ti Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.15.1179)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Ti Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.15.1179)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce RTX 2060 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce RTX 2060 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 760 Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.5671)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 760 Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.5671)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Ti Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.15.1179)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Ti Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.15.1179)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1050 Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.6079)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1050 Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.6079)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Ti Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.15.1165)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Ti Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.15.1165)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1050 Ti Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.7239)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1050 Ti Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.7239)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 550 Ti Direct3D11 vs_5_0 ps_5_0, D3D11)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 550 Ti Direct3D11 vs_5_0 ps_5_0, D3D11)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1050 Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.5671)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1050 Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.5671)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.7208)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.7208)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce 210 Direct3D11 vs_4_1 ps_4_1, D3D11-9.18.13.4144)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce 210 Direct3D11 vs_4_1 ps_4_1, D3D11-9.18.13.4144)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.5751)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.5751)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Ti Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.5749)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Ti Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.5749)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GT 440 Direct3D11 vs_5_0 ps_5_0, D3D11-23.21.13.8813)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GT 440 Direct3D11 vs_5_0 ps_5_0, D3D11-23.21.13.8813)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 960 Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.5671)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 960 Direct3D11 vs_5_0 ps_5_0, D3D11-27.21.14.5671)"
      },
      {
        label: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.9676)",
        value: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1650 Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14.9676)"
      }
    ]
  },
  {
    label: "Google Inc. (Intel)",
    value: "Google Inc. (Intel)",
    renderer: [
      {
        label: "ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.9365)",
        value: "ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.9365)"
      },
      {
        label: "ANGLE (Intel, Intel(R) HD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-10.18.10.3496)",
        value: "ANGLE (Intel, Intel(R) HD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-10.18.10.3496)"
      },
      {
        label: "ANGLE (Intel, Intel(R) UHD Graphics 610 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.8681)",
        value: "ANGLE (Intel, Intel(R) UHD Graphics 610 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.8681)"
      },
      {
        label: "ANGLE (Intel, Intel(R) HD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)",
        value: "ANGLE (Intel, Intel(R) HD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)"
      },
      {
        label: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.8984)",
        value: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.8984)"
      },
      {
        label: "ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.9749)",
        value: "ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.9749)"
      },
      {
        label: "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.9664)",
        value: "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.9664)"
      },
      {
        label: "ANGLE (Intel, Intel(R) UHD Graphics 600 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.8681)",
        value: "ANGLE (Intel, Intel(R) UHD Graphics 600 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.8681)"
      },
      {
        label: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)",
        value: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)"
      },
      {
        label: "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)",
        value: "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)"
      },
      {
        label: "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.8477)",
        value: "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.8477)"
      },
      {
        label: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-26.20.100.6911)",
        value: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-26.20.100.6911)"
      },
      {
        label: "ANGLE (Intel, Intel(R) HD Graphics 5500 Direct3D11 vs_5_0 ps_5_0, D3D11-10.18.10.3960)",
        value: "ANGLE (Intel, Intel(R) HD Graphics 5500 Direct3D11 vs_5_0 ps_5_0, D3D11-10.18.10.3960)"
      },
      {
        label: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.100.9864)",
        value: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.100.9864)"
      },
      {
        label: "ANGLE (Intel, Intel(R) HD Graphics 4000 Direct3D11 vs_5_0 ps_5_0, D3D11-10.18.10.4252)",
        value: "ANGLE (Intel, Intel(R) HD Graphics 4000 Direct3D11 vs_5_0 ps_5_0, D3D11-10.18.10.4252)"
      },
      {
        label: "ANGLE (Intel, Intel(R) HD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-20.19.15.5107)",
        value: "ANGLE (Intel, Intel(R) HD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-20.19.15.5107)"
      },
      {
        label: "ANGLE (Intel, Intel(R) HD Graphics 520 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.9171)",
        value: "ANGLE (Intel, Intel(R) HD Graphics 520 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.9171)"
      },
      {
        label: "ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.9664)",
        value: "ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.9664)"
      },
      {
        label: "ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.8476)",
        value: "ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.100.8476)"
      },
      {
        label: "ANGLE (Intel, Intel(R) HD Graphics 4600 Direct3D11 vs_5_0 ps_5_0, D3D11-20.19.15.5126)",
        value: "ANGLE (Intel, Intel(R) HD Graphics 4600 Direct3D11 vs_5_0 ps_5_0, D3D11-20.19.15.5126)"
      }
    ]
  },
  {
    label: "Google Inc. (AMD)",
    value: "Google Inc. (AMD)",
    renderer: [
      {
        label: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.13020.4)",
        value: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.13020.4)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon R7 200 Series Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.1034.6)",
        value: "ANGLE (AMD, AMD Radeon R7 200 Series Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.1034.6)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon(TM) Vega 8 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-26.20.11030.22001)",
        value: "ANGLE (AMD, AMD Radeon(TM) Vega 8 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-26.20.11030.22001)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon(TM) R5 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-26.20.14050.2)",
        value: "ANGLE (AMD, AMD Radeon(TM) R5 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-26.20.14050.2)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon R7 200 Series Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.21026.2006)",
        value: "ANGLE (AMD, AMD Radeon R7 200 Series Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.21026.2006)"
      },
      {
        label: "ANGLE (AMD, Radeon RX 570 Series Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14023.3004)",
        value: "ANGLE (AMD, Radeon RX 570 Series Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.14023.3004)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.11028.10001)",
        value: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.11028.10001)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon(TM) RX Vega 10 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.13022.3)",
        value: "ANGLE (AMD, AMD Radeon(TM) RX Vega 10 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.13022.3)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon(TM) Vega 6 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.21034.37)",
        value: "ANGLE (AMD, AMD Radeon(TM) Vega 6 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.21034.37)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon R7 200 Series Direct3D11 vs_5_0 ps_5_0, D3D11)",
        value: "ANGLE (AMD, AMD Radeon R7 200 Series Direct3D11 vs_5_0 ps_5_0, D3D11)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)",
        value: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon R7 430 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.15026.1004)",
        value: "ANGLE (AMD, AMD Radeon R7 430 Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.15026.1004)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon HD 7700 Series Direct3D11 vs_5_0 ps_5_0, D3D11-26.20.12028.2)",
        value: "ANGLE (AMD, AMD Radeon HD 7700 Series Direct3D11 vs_5_0 ps_5_0, D3D11-26.20.12028.2)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.15002.118)",
        value: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.15002.118)"
      },
      {
        label: "ANGLE (AMD, Radeon (TM) RX 470 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.13023.4001)",
        value: "ANGLE (AMD, Radeon (TM) RX 470 Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-30.0.13023.4001)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.14016.7001)",
        value: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.14016.7001)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.14064.3)",
        value: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.14064.3)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon(TM) Vega 8 Mobile Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.22002.57)",
        value: "ANGLE (AMD, AMD Radeon(TM) Vega 8 Mobile Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.22002.57)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon RX 5600 XT Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.12033.1007)",
        value: "ANGLE (AMD, AMD Radeon RX 5600 XT Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.12033.1007)"
      },
      {
        label: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.15002.11002)",
        value: "ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.15002.11002)"
      }
    ]
  },
  {
    label: "Google Inc.",
    value: "Google Inc.",
    renderer: [
      {
        label: "ANGLE (Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0)",
        value: "ANGLE (Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0)"
      },
      {
        label: "ANGLE (Intel(R) HD Graphics 4000 Direct3D11 vs_5_0 ps_5_0)",
        value: "ANGLE (Intel(R) HD Graphics 4000 Direct3D11 vs_5_0 ps_5_0)"
      },
      {
        label: "ANGLE (Intel(R) HD Graphics Direct3D11 vs_4_1 ps_4_1)",
        value: "ANGLE (Intel(R) HD Graphics Direct3D11 vs_4_1 ps_4_1)"
      },
      {
        label: "ANGLE (Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0)",
        value: "ANGLE (Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0)"
      },
      {
        label: "ANGLE (AMD Radeon(TM) Vega 8 Graphics Direct3D11 vs_5_0 ps_5_0)",
        value: "ANGLE (AMD Radeon(TM) Vega 8 Graphics Direct3D11 vs_5_0 ps_5_0)"
      },
      {
        label: "ANGLE (NVIDIA GeForce GT 440  Direct3D11 vs_5_0 ps_5_0)",
        value: "ANGLE (NVIDIA GeForce GT 440  Direct3D11 vs_5_0 ps_5_0)"
      },
      {
        label: "ANGLE (Intel(R) HD Graphics 4400 Direct3D11 vs_5_0 ps_5_0)",
        value: "ANGLE (Intel(R) HD Graphics 4400 Direct3D11 vs_5_0 ps_5_0)"
      },
      {
        label: "ANGLE (AMD Radeon(TM) R7 Graphics Direct3D11 vs_5_0 ps_5_0)",
        value: "ANGLE (AMD Radeon(TM) R7 Graphics Direct3D11 vs_5_0 ps_5_0)"
      },
      {
        label: "ANGLE (Intel(R) UHD Graphics 600 Direct3D11 vs_5_0 ps_5_0)",
        value: "ANGLE (Intel(R) UHD Graphics 600 Direct3D11 vs_5_0 ps_5_0)"
      },
      {
        label: "ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)",
        value: "ANGLE (NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0)"
      }
    ]
  },
  {
    label: "Intel Inc.",
    value: "Intel Inc.",
    renderer: [
      { label: "Intel Iris OpenGL Engine", value: "Intel Iris OpenGL Engine" }
    ]
  },
  {
    label: "Google Inc. (Microsoft)",
    value: "Google Inc. (Microsoft)",
    renderer: [
      {
        label: "ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11-6.3.9600.16505)",
        value: "ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11-6.3.9600.16505)"
      },
      {
        label: "ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11-10.0.19041.546)",
        value: "ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11-10.0.19041.546)"
      }
    ]
  },
  {
    label: "Google Inc. (NVIDIA Corporation)",
    value: "Google Inc. (NVIDIA Corporation)",
    renderer: [
      {
        label: "ANGLE (NVIDIA Corporation, GeForce RTX 3070/PCIe/SSE2, OpenGL 4.5.0 NVIDIA 461.40)",
        value: "ANGLE (NVIDIA Corporation, GeForce RTX 3070/PCIe/SSE2, OpenGL 4.5.0 NVIDIA 461.40)"
      }
    ]
  },
  {
    label: "Google Inc. (Unknown)",
    value: "Google Inc. (Unknown)",
    renderer: [
      {
        label: "ANGLE (Unknown, Qualcomm(R) Adreno(TM) 630 GPU Direct3D11 vs_5_0 ps_5_0, D3D11-25.18.10500.0)",
        value: "ANGLE (Unknown, Qualcomm(R) Adreno(TM) 630 GPU Direct3D11 vs_5_0 ps_5_0, D3D11-25.18.10500.0)"
      },
      {
        label: "ANGLE (Unknown, Qualcomm(R) Adreno(TM) 630 GPU Direct3D11 vs_5_0 ps_5_0, D3D11)",
        value: "ANGLE (Unknown, Qualcomm(R) Adreno(TM) 630 GPU Direct3D11 vs_5_0 ps_5_0, D3D11)"
      },
      {
        label: "ANGLE (Unknown, Qualcomm(R) Adreno(TM) 680 GPU Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.1640.0)",
        value: "ANGLE (Unknown, Qualcomm(R) Adreno(TM) 680 GPU Direct3D11 vs_5_0 ps_5_0, D3D11-27.20.1640.0)"
      },
      {
        label: "ANGLE (Unknown, Qualcomm(R) Adreno Direct3D11 vs_5_0 ps_5_0, D3D11)",
        value: "ANGLE (Unknown, Qualcomm(R) Adreno Direct3D11 vs_5_0 ps_5_0, D3D11)"
      },
      {
        label: "ANGLE (Unknown, VMware SVGA 3D Direct3D11 vs_4_1 ps_4_1, D3D11-8.16.1.24)",
        value: "ANGLE (Unknown, VMware SVGA 3D Direct3D11 vs_4_1 ps_4_1, D3D11-8.16.1.24)"
      }
    ]
  }
];

// src/utils.ts
var randomFloat = (min, max) => {
  return Math.random() * (max - min) + min;
};
var randomUID = (length = 30) => {
  const uid = import_crypto.default.randomBytes(length).toString("hex");
  return uid;
};
var randomItem = (items) => items[Math.floor(Math.random() * items.length)];
var randomWebGL = () => {
  const vendor = randomItem(webgl_default);
  const renderer = randomItem(vendor.renderer);
  return {
    mode: true,
    renderer: renderer.value,
    vendor: vendor.value
  };
};

// src/generator.ts
var import_crypto2 = require("crypto");

// src/template.ts
var gologinConfig = {
  "profile_id": "65afdb402c3967ee9a75aa1d",
  "name": "profile 5",
  "is_m1": false,
  "geoLocation": {
    "mode": "prompt",
    "latitude": 10.822,
    "longitude": 106.6257,
    "accuracy": 100
  },
  "navigator": {
    "platform": "Win32",
    "max_touch_points": 0
  },
  "dns": "",
  "proxy": {
    "username": "",
    "password": ""
  },
  "screenHeight": 720,
  "screenWidth": 1280,
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.110 Safari/537.36",
  "webGl": {
    "vendor": "Google Inc. (AMD)",
    "renderer": "ANGLE (AMD, Radeon RX 570 Series (0x000067DF) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "mode": true
  },
  "webgl": {
    "metadata": {
      "vendor": "Google Inc. (AMD)",
      "renderer": "ANGLE (AMD, Radeon RX 570 Series (0x000067DF) Direct3D11 vs_5_0 ps_5_0, D3D11)",
      "mode": true
    }
  },
  "mobile": {
    "enable": false,
    "width": 1280,
    "height": 720,
    "device_scale_factor": 1.25
  },
  "webglParams": {
    "glCanvas": "webgl2",
    "supportedFunctions": [
      {
        "name": "beginQuery",
        "supported": true
      },
      {
        "name": "beginTransformFeedback",
        "supported": true
      },
      {
        "name": "bindBufferBase",
        "supported": true
      },
      {
        "name": "bindBufferRange",
        "supported": true
      },
      {
        "name": "bindSampler",
        "supported": true
      },
      {
        "name": "bindTransformFeedback",
        "supported": true
      },
      {
        "name": "bindVertexArray",
        "supported": true
      },
      {
        "name": "blitFramebuffer",
        "supported": true
      },
      {
        "name": "clearBufferfi",
        "supported": true
      },
      {
        "name": "clearBufferfv",
        "supported": true
      },
      {
        "name": "clearBufferiv",
        "supported": true
      },
      {
        "name": "clearBufferuiv",
        "supported": true
      },
      {
        "name": "clientWaitSync",
        "supported": true
      },
      {
        "name": "compressedTexImage3D",
        "supported": true
      },
      {
        "name": "compressedTexSubImage3D",
        "supported": true
      },
      {
        "name": "copyBufferSubData",
        "supported": true
      },
      {
        "name": "copyTexSubImage3D",
        "supported": true
      },
      {
        "name": "createQuery",
        "supported": true
      },
      {
        "name": "createSampler",
        "supported": true
      },
      {
        "name": "createTransformFeedback",
        "supported": true
      },
      {
        "name": "createVertexArray",
        "supported": true
      },
      {
        "name": "deleteQuery",
        "supported": true
      },
      {
        "name": "deleteSampler",
        "supported": true
      },
      {
        "name": "deleteSync",
        "supported": true
      },
      {
        "name": "deleteTransformFeedback",
        "supported": true
      },
      {
        "name": "deleteVertexArray",
        "supported": true
      },
      {
        "name": "drawArraysInstanced",
        "supported": true
      },
      {
        "name": "drawBuffers",
        "supported": true
      },
      {
        "name": "drawElementsInstanced",
        "supported": true
      },
      {
        "name": "drawRangeElements",
        "supported": true
      },
      {
        "name": "endQuery",
        "supported": true
      },
      {
        "name": "endTransformFeedback",
        "supported": true
      },
      {
        "name": "fenceSync",
        "supported": true
      },
      {
        "name": "framebufferTextureLayer",
        "supported": true
      },
      {
        "name": "getActiveUniformBlockName",
        "supported": true
      },
      {
        "name": "getActiveUniformBlockParameter",
        "supported": true
      },
      {
        "name": "getActiveUniforms",
        "supported": true
      },
      {
        "name": "getBufferSubData",
        "supported": true
      },
      {
        "name": "getFragDataLocation",
        "supported": true
      },
      {
        "name": "getIndexedParameter",
        "supported": true
      },
      {
        "name": "getInternalformatParameter",
        "supported": true
      },
      {
        "name": "getQuery",
        "supported": true
      },
      {
        "name": "getQueryParameter",
        "supported": true
      },
      {
        "name": "getSamplerParameter",
        "supported": true
      },
      {
        "name": "getSyncParameter",
        "supported": true
      },
      {
        "name": "getTransformFeedbackVarying",
        "supported": true
      },
      {
        "name": "getUniformBlockIndex",
        "supported": true
      },
      {
        "name": "getUniformIndices",
        "supported": true
      },
      {
        "name": "invalidateFramebuffer",
        "supported": true
      },
      {
        "name": "invalidateSubFramebuffer",
        "supported": true
      },
      {
        "name": "isQuery",
        "supported": true
      },
      {
        "name": "isSampler",
        "supported": true
      },
      {
        "name": "isSync",
        "supported": true
      },
      {
        "name": "isTransformFeedback",
        "supported": true
      },
      {
        "name": "isVertexArray",
        "supported": true
      },
      {
        "name": "pauseTransformFeedback",
        "supported": true
      },
      {
        "name": "readBuffer",
        "supported": true
      },
      {
        "name": "renderbufferStorageMultisample",
        "supported": true
      },
      {
        "name": "resumeTransformFeedback",
        "supported": true
      },
      {
        "name": "samplerParameterf",
        "supported": true
      },
      {
        "name": "samplerParameteri",
        "supported": true
      },
      {
        "name": "texImage3D",
        "supported": true
      },
      {
        "name": "texStorage2D",
        "supported": true
      },
      {
        "name": "texStorage3D",
        "supported": true
      },
      {
        "name": "texSubImage3D",
        "supported": true
      },
      {
        "name": "transformFeedbackVaryings",
        "supported": true
      },
      {
        "name": "uniform1ui",
        "supported": true
      },
      {
        "name": "uniform1uiv",
        "supported": true
      },
      {
        "name": "uniform2ui",
        "supported": true
      },
      {
        "name": "uniform2uiv",
        "supported": true
      },
      {
        "name": "uniform3ui",
        "supported": true
      },
      {
        "name": "uniform3uiv",
        "supported": true
      },
      {
        "name": "uniform4ui",
        "supported": true
      },
      {
        "name": "uniform4uiv",
        "supported": true
      },
      {
        "name": "uniformBlockBinding",
        "supported": true
      },
      {
        "name": "uniformMatrix2x3fv",
        "supported": true
      },
      {
        "name": "uniformMatrix2x4fv",
        "supported": true
      },
      {
        "name": "uniformMatrix3x2fv",
        "supported": true
      },
      {
        "name": "uniformMatrix3x4fv",
        "supported": true
      },
      {
        "name": "uniformMatrix4x2fv",
        "supported": true
      },
      {
        "name": "uniformMatrix4x3fv",
        "supported": true
      },
      {
        "name": "vertexAttribDivisor",
        "supported": true
      },
      {
        "name": "vertexAttribI4i",
        "supported": true
      },
      {
        "name": "vertexAttribI4iv",
        "supported": true
      },
      {
        "name": "vertexAttribI4ui",
        "supported": true
      },
      {
        "name": "vertexAttribI4uiv",
        "supported": true
      },
      {
        "name": "vertexAttribIPointer",
        "supported": true
      },
      {
        "name": "waitSync",
        "supported": true
      }
    ],
    "glParamValues": [
      {
        "name": "ALIASED_LINE_WIDTH_RANGE",
        "value": {
          "0": 1,
          "1": 1
        }
      },
      {
        "name": "ALIASED_POINT_SIZE_RANGE",
        "value": {
          "0": 1,
          "1": 1024
        }
      },
      {
        "name": [
          "DEPTH_BITS",
          "STENCIL_BITS"
        ],
        "value": "n/a"
      },
      {
        "name": "MAX_3D_TEXTURE_SIZE",
        "value": 2048
      },
      {
        "name": "MAX_ARRAY_TEXTURE_LAYERS",
        "value": 2048
      },
      {
        "name": "MAX_COLOR_ATTACHMENTS",
        "value": 8
      },
      {
        "name": "MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS",
        "value": 200704
      },
      {
        "name": "MAX_COMBINED_TEXTURE_IMAGE_UNITS",
        "value": 32
      },
      {
        "name": "MAX_COMBINED_UNIFORM_BLOCKS",
        "value": 24
      },
      {
        "name": "MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS",
        "value": 212992
      },
      {
        "name": "MAX_CUBE_MAP_TEXTURE_SIZE",
        "value": 16384
      },
      {
        "name": "MAX_DRAW_BUFFERS",
        "value": 8
      },
      {
        "name": "MAX_FRAGMENT_INPUT_COMPONENTS",
        "value": 120
      },
      {
        "name": "MAX_FRAGMENT_UNIFORM_BLOCKS",
        "value": 12
      },
      {
        "name": "MAX_FRAGMENT_UNIFORM_COMPONENTS",
        "value": 4096
      },
      {
        "name": "MAX_FRAGMENT_UNIFORM_VECTORS",
        "value": 1024
      },
      {
        "name": "MAX_PROGRAM_TEXEL_OFFSET",
        "value": 7
      },
      {
        "name": "MAX_RENDERBUFFER_SIZE",
        "value": 16384
      },
      {
        "name": "MAX_SAMPLES",
        "value": 8
      },
      {
        "name": "MAX_TEXTURE_IMAGE_UNITS",
        "value": 16
      },
      {
        "name": "MAX_TEXTURE_LOD_BIAS",
        "value": 2
      },
      {
        "name": "MAX_TEXTURE_SIZE",
        "value": 16384
      },
      {
        "name": "MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS",
        "value": 120
      },
      {
        "name": "MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS",
        "value": 4
      },
      {
        "name": "MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS",
        "value": 4
      },
      {
        "name": "MAX_UNIFORM_BLOCK_SIZE",
        "value": 65536
      },
      {
        "name": "MAX_UNIFORM_BUFFER_BINDINGS",
        "value": 24
      },
      {
        "name": "MAX_VARYING_COMPONENTS",
        "value": 120
      },
      {
        "name": "MAX_VARYING_VECTORS",
        "value": 30
      },
      {
        "name": "MAX_VERTEX_ATTRIBS",
        "value": 16
      },
      {
        "name": "MAX_VERTEX_OUTPUT_COMPONENTS",
        "value": 120
      },
      {
        "name": "MAX_VERTEX_TEXTURE_IMAGE_UNITS",
        "value": 16
      },
      {
        "name": "MAX_VERTEX_UNIFORM_BLOCKS",
        "value": 12
      },
      {
        "name": "MAX_VERTEX_UNIFORM_COMPONENTS",
        "value": 16384
      },
      {
        "name": "MAX_VERTEX_UNIFORM_VECTORS",
        "value": 4096
      },
      {
        "name": "MAX_VIEWPORT_DIMS",
        "value": {
          "0": 32767,
          "1": 32767
        }
      },
      {
        "name": "MIN_PROGRAM_TEXEL_OFFSET",
        "value": -8
      },
      {
        "name": [
          "RED_BITS",
          "GREEN_BITS",
          "BLUE_BITS",
          "ALPHA_BITS"
        ],
        "value": "n/a"
      },
      {
        "name": "RENDERER",
        "value": "WebKit WebGL"
      },
      {
        "name": "SHADING_LANGUAGE_VERSION",
        "value": "WebGL GLSL ES 3.00 (OpenGL ES GLSL ES 3.0 Chromium)"
      },
      {
        "name": "UNIFORM_BUFFER_OFFSET_ALIGNMENT",
        "value": 256
      },
      {
        "name": "VENDOR",
        "value": "WebKit"
      },
      {
        "name": "VERSION",
        "value": "WebGL 2.0 (OpenGL ES 3.0 Chromium)"
      }
    ],
    "antialiasing": true,
    "textureMaxAnisotropyExt": 16,
    "shaiderPrecisionFormat": "highp/highp",
    "extensions": [
      "EXT_color_buffer_float",
      "EXT_color_buffer_half_float",
      "EXT_disjoint_timer_query_webgl2",
      "EXT_float_blend",
      "EXT_texture_compression_bptc",
      "EXT_texture_compression_rgtc",
      "EXT_texture_filter_anisotropic",
      "EXT_texture_norm16",
      "KHR_parallel_shader_compile",
      "OES_draw_buffers_indexed",
      "OES_texture_float_linear",
      "OVR_multiview2",
      "WEBGL_clip_cull_distance",
      "WEBGL_compressed_texture_s3tc",
      "WEBGL_compressed_texture_s3tc_srgb",
      "WEBGL_debug_renderer_info",
      "WEBGL_debug_shaders",
      "WEBGL_lose_context",
      "WEBGL_multi_draw",
      "WEBGL_provoking_vertex"
    ]
  },
  "webgl_noice_enable": false,
  "webglNoiceEnable": false,
  "webgl_noise_enable": false,
  "webgl_noise_value": 73.693,
  "webglNoiseValue": 73.693,
  "getClientRectsNoice": 4.56989,
  "get_client_rects_noise": 4.56989,
  "client_rects_noise_enable": false,
  "mediaDevices": {
    "enable": false,
    "uid": "759b1aa2710f4fae976d36afbaff48d643d70b0f19534c0283b85e7d2e",
    "audioInputs": 1,
    "audioOutputs": 1,
    "videoInputs": 1
  },
  "doNotTrack": false,
  "plugins": {
    "all_enable": true,
    "flash_enable": true
  },
  "storage": {
    "enable": true
  },
  "audioContext": {
    "enable": true,
    "noiseValue": 9958609051243e-20
  },
  "languages": "vi-VN,vi,en-US,en",
  "langHeader": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
  "canvasMode": "off",
  "canvasNoise": 0.14191644,
  "hardwareConcurrency": 8,
  "deviceMemory": 8192,
  "startupUrl": "",
  "startup_urls": [
    ""
  ],
  "icon": {
    "avatar": {
      "enabled": true,
      "windows_icons": {
        "32": "32.png"
      }
    }
  },
  "timezone": {
    "id": "Asia/Ho_Chi_Minh"
  },
  "unpinable_extension_names": [
    "passwords-ext"
  ],
  "webrtc": {
    "enable": true,
    "should_fill_empty_ice_list": true,
    "mode": "alerted"
  }
};
var defaultPreferences = { "NewTabPage": { "PrevNavigationTime": "13302807227669318" }, "account_id_migration_state": 2, "account_tracker_service_last_update": "13302807097942551", "ack_existing_ntp_extensions": true, "alternate_error_pages": { "backup": true }, "apps": {}, "autocomplete": { "retention_policy_last_version": 103 }, "autofill": { "orphan_rows_removed": true }, "bookmark_bar": { "show_on_all_tabs": false }, "browser": { "has_seen_welcome_page": false, "window_placement": { "bottom": 875, "left": 22, "maximized": false, "right": 1222, "top": 60, "work_area_bottom": 897, "work_area_left": 0, "work_area_right": 1512, "work_area_top": 38 } }, "countryid_at_install": 21077, "custom_links": { "initialized": true, "list": [{ "isMostVisited": false, "title": "Facebook", "url": "https://www.facebook.com/" }, { "isMostVisited": false, "title": "Google Ads", "url": "https://ads.google.com/" }, { "isMostVisited": false, "title": "TikTok", "url": "https://www.tiktok.com/" }, { "isMostVisited": false, "title": "Amazon", "url": "https://www.amazon.com/" }, { "isMostVisited": false, "title": "eBay", "url": "https://ebay.com/" }, { "isMostVisited": false, "title": "YouTube", "url": "https://www.youtube.com/" }, { "isMostVisited": false, "title": "Coinlist", "url": "https://coinlist.co/" }, { "isMostVisited": false, "title": "Huobi", "url": "https://www.huobi.com/" }, { "isMostVisited": false, "title": "bet365", "url": "https://www.bet365.com/" }, { "isMostVisited": false, "title": "PayPal", "url": "https://paypal.com/" }] }, "default_apps_install_state": 3, "domain_diversity": { "last_reporting_timestamp": "13302807099119819" }, "extensions": { "alerts": { "initialized": true }, "chrome_url_overrides": {}, "last_chrome_version": "103.0.5060.53", "settings": {}, "block_external_extensions": true }, "gaia_cookie": { "changed_time": 1658333661108506e-6, "hash": "2jmj7l5rSw0yVb/vlWAYkK/YBwk=", "last_list_accounts_data": '["gaia.l.a.r",[]]' }, "gcm": { "product_category_for_subtypes": "com.orbita.macosx" }, "google": { "services": { "signin_scoped_device_id": "e8046704-b3cb-4533-8099-e2261bc1be67" } }, "intl": { "selected_languages": "en-US,en" }, "invalidation": { "per_sender_topics_to_handler": { "1013309121859": {}, "8181035976": {} } }, "media": { "device_id_salt": "", "engagement": { "schema_version": 5 } }, "media_router": { "receiver_id_hash_token": "" }, "ntp": { "num_personal_suggestions": 1 }, "optimization_guide": { "previously_registered_optimization_types": { "ABOUT_THIS_SITE": true, "HISTORY_CLUSTERS": true }, "store_file_paths_to_delete": {} }, "plugins": { "plugins_list": [] }, "privacy_sandbox": { "preferences_reconciled": true }, "profile": { "avatar_bubble_tutorial_shown": 2, "avatar_index": 26, "content_settings": { "enable_quiet_permission_ui_enabling_method": { "notifications": 1 }, "exceptions": { "accessibility_events": {}, "app_banner": {}, "ar": {}, "auto_select_certificate": {}, "automatic_downloads": {}, "autoplay": {}, "background_sync": {}, "bluetooth_chooser_data": {}, "bluetooth_guard": {}, "bluetooth_scanning": {}, "camera_pan_tilt_zoom": {}, "client_hints": {}, "clipboard": {}, "cookies": {}, "durable_storage": {}, "fedcm_active_session": {}, "fedcm_share": {}, "file_system_access_chooser_data": {}, "file_system_last_picked_directory": {}, "file_system_read_guard": {}, "file_system_write_guard": {}, "formfill_metadata": {}, "geolocation": {}, "get_display_media_set_select_all_screens": {}, "hid_chooser_data": {}, "hid_guard": {}, "http_allowed": {}, "idle_detection": {}, "images": {}, "important_site_info": {}, "insecure_private_network": {}, "installed_web_app_metadata": {}, "intent_picker_auto_display": {}, "javascript": {}, "javascript_jit": {}, "legacy_cookie_access": {}, "local_fonts": {}, "media_engagement": {}, "media_stream_camera": {}, "media_stream_mic": {}, "midi_sysex": {}, "mixed_script": {}, "nfc_devices": {}, "notifications": {}, "password_protection": {}, "payment_handler": {}, "permission_autoblocking_data": {}, "permission_autorevocation_data": {}, "popups": {}, "ppapi_broker": {}, "protocol_handler": {}, "safe_browsing_url_check_data": {}, "sensors": {}, "serial_chooser_data": {}, "serial_guard": {}, "site_engagement": {}, "sound": {}, "ssl_cert_decisions": {}, "storage_access": {}, "subresource_filter": {}, "subresource_filter_data": {}, "usb_chooser_data": {}, "usb_guard": {}, "vr": {}, "webid_api": {}, "window_placement": {} }, "pref_version": 1 }, "created_by_version": "103.0.5060.53", "creation_time": "13302807096310804", "exit_type": "Normal", "last_engagement_time": "13302807261018135", "last_time_password_store_metrics_reported": 1658333657573382e-6, "managed_user_id": "", "name": "Person 1", "password_account_storage_settings": {} }, "safebrowsing": { "event_timestamps": {}, "metrics_last_log_time": "13302807096" }, "signin": { "allowed": false }, "sync": { "requested": false }, "translate_site_blacklist": [], "translate_site_blacklist_with_time": {}, "unified_consent": { "migration_state": 10 }, "web_apps": { "system_web_app_failure_count": 0, "system_web_app_last_attempted_language": "en-US", "system_web_app_last_attempted_update": "103.0.5060.53", "system_web_app_last_installed_language": "en-US", "system_web_app_last_update": "103.0.5060.53" }, "webauthn": { "touchid": { "metadata_secret": "FAs08eDqvux1A4NYorVc4ZHDwnhqyLknX9ef3JS4DLg=" } }, "gologin": { "profile_id": "65afdb402c3967ee9a75aa1d", "name": "profile 5", "is_m1": false, "geoLocation": { "mode": "prompt", "latitude": 10.822, "longitude": 106.6257, "accuracy": 100 }, "navigator": { "platform": "Win32", "max_touch_points": 0 }, "dns": "", "proxy": { "username": "", "password": "" }, "screenHeight": 720, "screenWidth": 1280, "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.110 Safari/537.36", "webGl": { "vendor": "Google Inc. (AMD)", "renderer": "ANGLE (AMD, Radeon RX 570 Series (0x000067DF) Direct3D11 vs_5_0 ps_5_0, D3D11)", "mode": true }, "webgl": { "metadata": { "vendor": "Google Inc. (AMD)", "renderer": "ANGLE (AMD, Radeon RX 570 Series (0x000067DF) Direct3D11 vs_5_0 ps_5_0, D3D11)", "mode": true } }, "mobile": { "enable": false, "width": 1280, "height": 720, "device_scale_factor": 1.25 }, "webglParams": { "glCanvas": "webgl2", "supportedFunctions": [{ "name": "beginQuery", "supported": true }, { "name": "beginTransformFeedback", "supported": true }, { "name": "bindBufferBase", "supported": true }, { "name": "bindBufferRange", "supported": true }, { "name": "bindSampler", "supported": true }, { "name": "bindTransformFeedback", "supported": true }, { "name": "bindVertexArray", "supported": true }, { "name": "blitFramebuffer", "supported": true }, { "name": "clearBufferfi", "supported": true }, { "name": "clearBufferfv", "supported": true }, { "name": "clearBufferiv", "supported": true }, { "name": "clearBufferuiv", "supported": true }, { "name": "clientWaitSync", "supported": true }, { "name": "compressedTexImage3D", "supported": true }, { "name": "compressedTexSubImage3D", "supported": true }, { "name": "copyBufferSubData", "supported": true }, { "name": "copyTexSubImage3D", "supported": true }, { "name": "createQuery", "supported": true }, { "name": "createSampler", "supported": true }, { "name": "createTransformFeedback", "supported": true }, { "name": "createVertexArray", "supported": true }, { "name": "deleteQuery", "supported": true }, { "name": "deleteSampler", "supported": true }, { "name": "deleteSync", "supported": true }, { "name": "deleteTransformFeedback", "supported": true }, { "name": "deleteVertexArray", "supported": true }, { "name": "drawArraysInstanced", "supported": true }, { "name": "drawBuffers", "supported": true }, { "name": "drawElementsInstanced", "supported": true }, { "name": "drawRangeElements", "supported": true }, { "name": "endQuery", "supported": true }, { "name": "endTransformFeedback", "supported": true }, { "name": "fenceSync", "supported": true }, { "name": "framebufferTextureLayer", "supported": true }, { "name": "getActiveUniformBlockName", "supported": true }, { "name": "getActiveUniformBlockParameter", "supported": true }, { "name": "getActiveUniforms", "supported": true }, { "name": "getBufferSubData", "supported": true }, { "name": "getFragDataLocation", "supported": true }, { "name": "getIndexedParameter", "supported": true }, { "name": "getInternalformatParameter", "supported": true }, { "name": "getQuery", "supported": true }, { "name": "getQueryParameter", "supported": true }, { "name": "getSamplerParameter", "supported": true }, { "name": "getSyncParameter", "supported": true }, { "name": "getTransformFeedbackVarying", "supported": true }, { "name": "getUniformBlockIndex", "supported": true }, { "name": "getUniformIndices", "supported": true }, { "name": "invalidateFramebuffer", "supported": true }, { "name": "invalidateSubFramebuffer", "supported": true }, { "name": "isQuery", "supported": true }, { "name": "isSampler", "supported": true }, { "name": "isSync", "supported": true }, { "name": "isTransformFeedback", "supported": true }, { "name": "isVertexArray", "supported": true }, { "name": "pauseTransformFeedback", "supported": true }, { "name": "readBuffer", "supported": true }, { "name": "renderbufferStorageMultisample", "supported": true }, { "name": "resumeTransformFeedback", "supported": true }, { "name": "samplerParameterf", "supported": true }, { "name": "samplerParameteri", "supported": true }, { "name": "texImage3D", "supported": true }, { "name": "texStorage2D", "supported": true }, { "name": "texStorage3D", "supported": true }, { "name": "texSubImage3D", "supported": true }, { "name": "transformFeedbackVaryings", "supported": true }, { "name": "uniform1ui", "supported": true }, { "name": "uniform1uiv", "supported": true }, { "name": "uniform2ui", "supported": true }, { "name": "uniform2uiv", "supported": true }, { "name": "uniform3ui", "supported": true }, { "name": "uniform3uiv", "supported": true }, { "name": "uniform4ui", "supported": true }, { "name": "uniform4uiv", "supported": true }, { "name": "uniformBlockBinding", "supported": true }, { "name": "uniformMatrix2x3fv", "supported": true }, { "name": "uniformMatrix2x4fv", "supported": true }, { "name": "uniformMatrix3x2fv", "supported": true }, { "name": "uniformMatrix3x4fv", "supported": true }, { "name": "uniformMatrix4x2fv", "supported": true }, { "name": "uniformMatrix4x3fv", "supported": true }, { "name": "vertexAttribDivisor", "supported": true }, { "name": "vertexAttribI4i", "supported": true }, { "name": "vertexAttribI4iv", "supported": true }, { "name": "vertexAttribI4ui", "supported": true }, { "name": "vertexAttribI4uiv", "supported": true }, { "name": "vertexAttribIPointer", "supported": true }, { "name": "waitSync", "supported": true }], "glParamValues": [{ "name": "ALIASED_LINE_WIDTH_RANGE", "value": { "0": 1, "1": 1 } }, { "name": "ALIASED_POINT_SIZE_RANGE", "value": { "0": 1, "1": 1024 } }, { "name": ["DEPTH_BITS", "STENCIL_BITS"], "value": "n/a" }, { "name": "MAX_3D_TEXTURE_SIZE", "value": 2048 }, { "name": "MAX_ARRAY_TEXTURE_LAYERS", "value": 2048 }, { "name": "MAX_COLOR_ATTACHMENTS", "value": 8 }, { "name": "MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS", "value": 200704 }, { "name": "MAX_COMBINED_TEXTURE_IMAGE_UNITS", "value": 32 }, { "name": "MAX_COMBINED_UNIFORM_BLOCKS", "value": 24 }, { "name": "MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS", "value": 212992 }, { "name": "MAX_CUBE_MAP_TEXTURE_SIZE", "value": 16384 }, { "name": "MAX_DRAW_BUFFERS", "value": 8 }, { "name": "MAX_FRAGMENT_INPUT_COMPONENTS", "value": 120 }, { "name": "MAX_FRAGMENT_UNIFORM_BLOCKS", "value": 12 }, { "name": "MAX_FRAGMENT_UNIFORM_COMPONENTS", "value": 4096 }, { "name": "MAX_FRAGMENT_UNIFORM_VECTORS", "value": 1024 }, { "name": "MAX_PROGRAM_TEXEL_OFFSET", "value": 7 }, { "name": "MAX_RENDERBUFFER_SIZE", "value": 16384 }, { "name": "MAX_SAMPLES", "value": 8 }, { "name": "MAX_TEXTURE_IMAGE_UNITS", "value": 16 }, { "name": "MAX_TEXTURE_LOD_BIAS", "value": 2 }, { "name": "MAX_TEXTURE_SIZE", "value": 16384 }, { "name": "MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS", "value": 120 }, { "name": "MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS", "value": 4 }, { "name": "MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS", "value": 4 }, { "name": "MAX_UNIFORM_BLOCK_SIZE", "value": 65536 }, { "name": "MAX_UNIFORM_BUFFER_BINDINGS", "value": 24 }, { "name": "MAX_VARYING_COMPONENTS", "value": 120 }, { "name": "MAX_VARYING_VECTORS", "value": 30 }, { "name": "MAX_VERTEX_ATTRIBS", "value": 16 }, { "name": "MAX_VERTEX_OUTPUT_COMPONENTS", "value": 120 }, { "name": "MAX_VERTEX_TEXTURE_IMAGE_UNITS", "value": 16 }, { "name": "MAX_VERTEX_UNIFORM_BLOCKS", "value": 12 }, { "name": "MAX_VERTEX_UNIFORM_COMPONENTS", "value": 16384 }, { "name": "MAX_VERTEX_UNIFORM_VECTORS", "value": 4096 }, { "name": "MAX_VIEWPORT_DIMS", "value": { "0": 32767, "1": 32767 } }, { "name": "MIN_PROGRAM_TEXEL_OFFSET", "value": -8 }, { "name": ["RED_BITS", "GREEN_BITS", "BLUE_BITS", "ALPHA_BITS"], "value": "n/a" }, { "name": "RENDERER", "value": "WebKit WebGL" }, { "name": "SHADING_LANGUAGE_VERSION", "value": "WebGL GLSL ES 3.00 (OpenGL ES GLSL ES 3.0 Chromium)" }, { "name": "UNIFORM_BUFFER_OFFSET_ALIGNMENT", "value": 256 }, { "name": "VENDOR", "value": "WebKit" }, { "name": "VERSION", "value": "WebGL 2.0 (OpenGL ES 3.0 Chromium)" }], "antialiasing": true, "textureMaxAnisotropyExt": 16, "shaiderPrecisionFormat": "highp/highp", "extensions": ["EXT_color_buffer_float", "EXT_color_buffer_half_float", "EXT_disjoint_timer_query_webgl2", "EXT_float_blend", "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc", "EXT_texture_filter_anisotropic", "EXT_texture_norm16", "KHR_parallel_shader_compile", "OES_draw_buffers_indexed", "OES_texture_float_linear", "OVR_multiview2", "WEBGL_clip_cull_distance", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders", "WEBGL_lose_context", "WEBGL_multi_draw", "WEBGL_provoking_vertex"] }, "webgl_noice_enable": false, "webglNoiceEnable": false, "webgl_noise_enable": false, "webgl_noise_value": 73.693, "webglNoiseValue": 73.693, "getClientRectsNoice": 4.56989, "get_client_rects_noise": 4.56989, "client_rects_noise_enable": false, "mediaDevices": { "enable": false, "uid": "759b1aa2710f4fae976d36afbaff48d643d70b0f19534c0283b85e7d2e", "audioInputs": 1, "audioOutputs": 1, "videoInputs": 1 }, "doNotTrack": false, "plugins": { "all_enable": true, "flash_enable": true }, "storage": { "enable": true }, "audioContext": { "enable": true, "noiseValue": 9958609051243e-20 }, "languages": "vi-VN,vi,en-US,en", "langHeader": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7", "canvasMode": "off", "canvasNoise": 0.14191644, "hardwareConcurrency": 8, "deviceMemory": 8192, "startupUrl": "", "startup_urls": [""], "icon": { "avatar": { "enabled": true, "windows_icons": { "32": "32.png" } } }, "timezone": { "id": "Asia/Ho_Chi_Minh" }, "unpinable_extension_names": ["passwords-ext"], "webrtc": { "enable": true, "should_fill_empty_ice_list": true, "mode": "alerted" } }, "bookmarks": { "editing_enabled": true }, "history": { "saving_disabled": false }, "credentials_enable_service": true };

// src/resources.ts
var screens = ["800x600", "960x720", "1024x576", "1024x600", "1024x640", "1024x768", "1152x648", "1152x864", "1280x720", "1280x768", "1280x800", "1280x960", "1280x1024", "1360x768", "1366x768", "1400x1050", "1440x900", "1440x1080", "1536x864", "1600x900", "1600x1200", "1680x1050", "1856x1392", "1920x1080", "1920x1200", "1920x1440", "2048x1152", "2048x1536", "2304x1440", "2560x1440", "2560x1600", "2560x2048", "2880x1800"];
var hwConcurrency = [2, 4, 8, 16, 32];
var deviceMemory = [2, 4, 8, 16, 32, 64];
var generateUserAgent = (version) => `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`;

// src/generator.ts
var clone = (0, import_rfdc.default)();
var defaultOptions = {
  version: 134,
  doNotTrack: true,
  dns: "",
  screen: null,
  webrtc: {
    mode: "alerted",
    fillBasedOnIP: true
  },
  timezone: {
    fillBasedOnIP: true,
    id: ""
  },
  location: {
    mode: "prompt"
  },
  language: {
    autoLang: true,
    value: ""
  },
  canvas: {
    mode: "noise"
  },
  clientRects: {
    mode: "noise"
  },
  audioContext: {
    mode: "noise"
  },
  mediaDevices: {
    mode: "noise"
  },
  webGL: {
    mode: "noise"
  },
  webGLMetadata: {
    mode: "mask",
    vendor: "",
    renderer: ""
  },
  fonts: {
    mode: "noise"
  }
};
var getNewFingerprint = (payload, opts = defaultOptions) => {
  const options = (0, import_defu.default)(opts, defaultOptions);
  const newGologinConfig = clone(gologinConfig);
  newGologinConfig.name = payload.name || randomUID(5);
  if (payload.proxy.protocol) {
    const { username: username2, password: password2 } = payload.proxy;
    newGologinConfig.proxy.username = username2;
    newGologinConfig.proxy.password = password2;
    if (payload.proxyInfo) {
      newGologinConfig.timezone.id = payload.proxyInfo.timezone;
      newGologinConfig.geoLocation.latitude = parseFloat(payload.proxyInfo.latitude);
      newGologinConfig.geoLocation.longitude = parseFloat(payload.proxyInfo.longitude);
    }
  }
  const audioNoiseValue = parseFloat(
    (randomFloat(1, 9) / 1e8).toExponential(12)
  );
  newGologinConfig.audioContext.noiseValue = audioNoiseValue;
  newGologinConfig.audioContext.enable = options.audioContext.mode === "noise";
  const canvasNoise = parseFloat(Math.random().toFixed(8));
  newGologinConfig.canvasMode = options.canvas.mode;
  newGologinConfig.canvasNoise = canvasNoise;
  const clientRectsNoise = parseFloat(randomFloat(1, 9).toFixed(4));
  newGologinConfig.getClientRectsNoice = newGologinConfig.get_client_rects_noise = clientRectsNoise;
  newGologinConfig.client_rects_noise_enable = options.clientRects.mode === "noise";
  const maskWebGLMetadata = options.webGLMetadata.mode === "mask";
  const { vendor, renderer } = options.webGLMetadata;
  const webGl = randomWebGL();
  newGologinConfig.webGl = webGl;
  newGologinConfig.webGl.mode = maskWebGLMetadata;
  newGologinConfig.webGl.vendor = vendor;
  newGologinConfig.webGl.renderer = renderer;
  newGologinConfig.webgl.metadata = webGl;
  newGologinConfig.webgl.metadata.mode = maskWebGLMetadata;
  newGologinConfig.webgl.metadata.vendor = vendor;
  newGologinConfig.webgl.metadata.renderer = renderer;
  const webGlNoise = parseFloat(randomFloat(1, 99).toFixed(3));
  newGologinConfig.webglNoiseValue = newGologinConfig.webgl_noise_value = webGlNoise;
  const webGLNoiseImage = options.webGL.mode === "noise";
  newGologinConfig.webgl_noice_enable = newGologinConfig.webglNoiceEnable = newGologinConfig.webgl_noise_enable = webGLNoiseImage;
  newGologinConfig.deviceMemory = randomItem(deviceMemory) * 1024;
  newGologinConfig.hardwareConcurrency = randomItem(hwConcurrency);
  newGologinConfig.doNotTrack = options.doNotTrack;
  newGologinConfig.dns = options.dns;
  const [width, height] = options.screen ? options.screen.split("x") : randomItem(screens).split("x");
  newGologinConfig.screenWidth = parseInt(width, 10);
  newGologinConfig.screenHeight = parseInt(height, 10);
  newGologinConfig.webrtc.mode = options.webrtc.mode;
  newGologinConfig.geoLocation.mode = options.location.mode;
  newGologinConfig.mediaDevices.uid = randomUID();
  newGologinConfig.mediaDevices.audioInputs = (0, import_crypto2.randomInt)(0, 3);
  newGologinConfig.mediaDevices.audioOutputs = (0, import_crypto2.randomInt)(0, 3);
  newGologinConfig.mediaDevices.videoInputs = (0, import_crypto2.randomInt)(0, 3);
  newGologinConfig.userAgent = generateUserAgent(options.version);
  newGologinConfig.navigator.platform = "Win32";
  const prefs = {
    ...clone(defaultPreferences),
    gologin: newGologinConfig
  };
  return prefs;
};
var spawnArgs = (options, payload, args = []) => {
  let params = [];
  const { userDataDir, remoteDebuggingPort } = options;
  const { proxy, proxyInfo } = payload;
  if (proxy.protocol) {
    let proxyStr2 = `${proxy.protocol}://${proxy.host}:${proxy.port}`;
    const hr_rules = `MAP * 0.0.0.0 , EXCLUDE ${proxy.host}`;
    params.push(`--tz=${proxyInfo?.timezone}`);
    params.push(`--proxy-server=${proxyStr2}`);
    params.push(`--host-resolver-rules=${hr_rules}`);
  }
  params = [
    `--user-data-dir=${userDataDir}`,
    ...remoteDebuggingPort ? [`--remote-debugging-port=${remoteDebuggingPort}`] : [],
    "--lang=en",
    "--font-masking-mode=2",
    "--password-store=basic",
    ...params,
    ...args
  ];
  return params;
};
var writePrefs = async (userDataDir, prefs) => {
  const prefsPath = import_path.default.join(userDataDir, "Default", "Preferences");
  await import_fs_extra.default.ensureFile(prefsPath);
  await import_fs_extra.default.writeJSON(prefsPath, prefs);
};

// test/index.ts
var import_fs_extra2 = __toESM(require("fs-extra"));
var import_path2 = __toESM(require("path"));
var profileStorage = import_path2.default.join(import_path2.default.resolve(), "profiles");
var executablePath = "C:/Users/Admin/.gologin/browser/orbita-browser-134/chrome.exe";
var proxyStr = "127.0.0.1:22338";
var [host, port, username, password] = proxyStr.split(":");
var startProfile = async () => {
  const profile = {
    proxy: {
      protocol: null,
      host,
      port: parseInt(port),
      username,
      password
    }
  };
  if (profile.proxy.protocol)
    profile.proxyInfo = await checkProxy(profile.proxy);
  const fingerprint = getNewFingerprint(profile);
  const userDataDir = import_path2.default.join(profileStorage, "test");
  await import_fs_extra2.default.ensureDir(import_path2.default.join(userDataDir));
  await writePrefs(userDataDir, fingerprint);
  const args = spawnArgs({ userDataDir, remoteDebuggingPort: 1234 }, profile);
  const child = (0, import_child_process.spawn)(executablePath, args);
  console.log("child", child.pid);
};
(async () => {
  await Promise.all(Array.from({ length: 1 }, (_, index) => index).map(() => startProfile()));
})();

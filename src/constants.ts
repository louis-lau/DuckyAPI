import { RedisOptions } from "ioredis"

export const wildDuckApiUrl = "http://mailserver.local:5438"
export const wildDuckApiToken = "yesverysecret"

// If false checks all new passwords against https://haveibeenpwned.com/Passwords
export const allowUnsafePasswords = true

// Allow values such as *@example.com. user@* is never allowed
export const allowForwarderWildcard = true

export const jwtConstants = {
  secret: "secretKey"
}

export const maxLimits = {
  quota: undefined,
  send: 300,
  forward: 200,
  receive: 2000
}

export const redisOptions: RedisOptions = {
  host: "mailserver.local",
  db: 10
}

export const arena = {
  enabled: true,
  basicAuth: {
    enabled: true,
    users: {
      admin: "test"
    }
  }
}

export const DnsConfig = {
  mx: {
    records: [
      {
        exchange: "london.mxroute.com",
        priority: 10
      }
    ]
  },
  spf: {
    correctValue: "v=spf1 include:mxroute.com -all",
    regex: new RegExp("^v=spf.* include:(mxroute\\.com|mxlogin\\.com) .*(-|~|\\?)all$")
  }
}

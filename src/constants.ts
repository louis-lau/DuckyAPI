export const wildDuckApiUrl = "http://mailserver.local:5438"
export const wildDuckApiToken = "yesverysecret"

// If false checks all new passwords against https://haveibeenpwned.com/Passwords
export const allowUnsafePasswords = false

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

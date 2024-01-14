# Home Assistant Add-on: 1Password
## Service account rate limits

1password has a rate limit of 1k / 5k / 50k requests per day (depending on your account type - more details [here](https://developer.1password.com/docs/service-accounts/rate-limits#daily-limits)). Please make sure the configured "Check Interval" is
not too high, otherwise you might hit the rate limit and the add-on will stop working for the rest of the day.

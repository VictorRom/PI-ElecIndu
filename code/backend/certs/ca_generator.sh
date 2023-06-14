#! /bin/sh
mkdir -p demoCA

step-cli certificate create "root_ca" "demoCA/ca_cert.pem" "demoCA/ca_key.pem" \
  --no-password --insecure \
  --profile root-ca \
  --not-before "2021-01-01T00:00:00+00:00" \
  --not-after "2051-01-01T00:00:00+00:00" \
  --san "localhost" \
  --san "localhost" \
  --kty RSA --size 2048

step-cli certificate create "signed_crt" server_cert.pem server_key.pem \
  --no-password --insecure \
  --profile leaf \
  --ca "demoCA/ca_cert.pem" \
  --ca-key "demoCA/ca_key.pem" \
  --not-before "2021-01-01T00:00:00+00:00" \
  --not-after "2051-01-01T00:00:00+00:00" \
  --san "localhost" \
  --san "localhost" \
  --kty RSA --size 2048


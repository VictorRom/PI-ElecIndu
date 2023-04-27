from fastapi.security import HTTPBasic, HTTPBasicCredentials


# Create an instance of the HTTPBasic authentication class
security = HTTPBasic()

# Load the SSL certificate and key files
context = SSL.Context(SSL.PROTOCOL_TLSv1_2)
context.use_privatekey_file("ssl_key.pem")
context.use_certificate_file("ssl_cert.pem")

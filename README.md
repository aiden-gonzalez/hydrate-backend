# hydrate-backend
Backend Node.js server for hydRate

### Generating a local certificate for HTTPS
To generate a local certificate.pem and https_private_key.pem, run the following commands to install mkcert:

```
brew install mkcert
mkcert -install
npm install -g local-ssl-proxy
```

Then, in the folder with your project:

```
mkcert localhost
```

Then you can rename the private key file outputted to https_private_key.pem.

This next step isn't necessary because node runs its own https server, but if you want to simply use a ssl proxy, you can run the following:

```
local-ssl-proxy --source 3010 --target 3000 --cert <certificate .pem file> --key <private key .pem file>
```

Then you would have an https server on port 3010 mimicing local 3000.

### Generate a public / private key pair for Cloudfront CDN signed URLs
To create a public / private key pair for Cloudfront, run `openssl genrsa -out cloudfront_private_key.pem 2048`.  Then copy the private key contents into the environment variable.

To then create the corresponding public key, run `openssl rsa -pubout -in cloudfront_private_key.pem -out cloudfront_public_key.pem`.  Then upload that public key to Cloudfront.

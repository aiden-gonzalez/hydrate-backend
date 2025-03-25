# hydrate-backend
Backend Node.js server for hydRate

### Generating a local certificate for HTTPS
To generate a local certificate.pem and private-key.pem, run the following commands to install mkcert:

```
brew install mkcert
mkcert -install
npm install -g local-ssl-proxy
```

Then, in the folder with your project:

```
mkcert localhost
```

This isn't necessary because node runs its own https server, but if you want to simply use a ssl proxy, you can run the following:

```
local-ssl-proxy --source 3010 --target 3000 --cert <certificate .pem file> --key <private key .pem file>
```

Then you would have an https server on port 3010 mimicing local 3000.

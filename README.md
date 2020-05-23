# api-luckbets

> Backend para aplicação de consulta de resultados da loterias caixa, utilizando as tecnologias Node.JS, Express.JS, Firebase e MongoDB.

## Build Setup

### Create an .env File
#### For Windows with cmd
```bash
copy NUL .env 
```
#### For Windows with PowerShell
```bash
New-Item .env -ItemType File
```
#### For Linux/Unix
```bash
touch .env 
```

### Add the environment variables needed to boot the server into the .env file:
```bash
API_PORT=4000
MONGO_DB=mongodb://localhost:27017/db-api
HTTPLOG=false
TZSERVER=America/Sao_Paulo
FIREBASE_JSON_CONFIG={"type":"service_account","project_id":"YOUR PROJECT ID","private_key_id":"YOUR PRIVATE KEY ID","private_key":"YOUR PRIVATE KEY","client_email":"YOUR PROJECT CLIENT EMAIL","client_id":"YOUR PROJECT CLIENT ID","auth_uri":"YOUR PROJECT AUTH URI","token_uri":"YOUR PROJECT TOKEN AUTH URI","auth_provider_x509_cert_url":"YOUR PROJECT AUTH PROVIDER X509 CERT URL","client_x509_cert_url":"YOUR PROJECT CLIENT PROVIDER X509 CERT URL"}
TIME_SCHEDULER_SORTEIO=0/3 19-23,00,06 * * 1-6
TIME_SCHEDULER_AVISOSORTEIO=0 08,12,15,18 * * 1-6
```
** NOTE: See that the FIREBASE_JSON_CONFIG variable is a JSON object minified with the private keys of your Firebase project
### install dependencies
npm install

# serve with hot reload at localhost:4000
npm run dev

# build for production with minification
npm run start

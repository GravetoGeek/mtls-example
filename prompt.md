1-Quero criar em minha máquina local, dois sistemas apartados como se fossem empresas diferentes.
2-Estes dois sistemas devem se integrar e trocar informações.
3-Os sistemas devem estar dentro de kubernetes usando Minikube, apartados e na máquina local.
4-A conexão entre os sistemas deve acontecer através do protocolo mtls.
5-Os certificados devem ser do tipo .crt e .key.
6-Cada sistema deve possuir seu próprio certificado.
7-Defina o diretório onde os certificados da CA devem ser armazenados.
8-Os certificados devem ser gerados por uma CA.
9-Os certificados devem ser gerados com openssl, autoassinados em um único comando.
10-Os certificados devem ser gerados com validade de 1 ano.
11-Os certificados devem ser gerados com algoritmo rsa e tamanho de 2048 bits.
12-Os sistemas de ambas empresas deve ser feito em nodejs com express.
13-A "empresa a" deve possuir uma api chamado "enviar" que enviará uma mensagem para a api "receber" da "empresa b".
14-A "empresa a" deve possuir uma api chamado "receber", que receberá uma mensagem da api "enviar" da "empresa b".
15-Não deve haver deploy em produção, apenas execução em máquina local.
16-Deve ser criado uma imagem docker para cada sistema.
17-Deve ser criado um deployment para cada sistema no minikube.
18-Deve ser criado um service para cada sistema no minikube.
19-Deve ser criado um ingress para cada sistema no minikube.
20-Deve ser criado um secret para cada sistema no minikube.
21-Deve ser criado um registry para armazenamento local das images de cada sistema.
22-Deve ser criado um namespace para cada sistema no minikube, chamados "empresa-a" e "empresa-b".
23-Monte um passo a passo de como preparar esses ambientes
24-Toda configuração deve conter o nome do arquivo e path.
25- A estrutura atual do projeto é esta:
📦mtls
 ┣ 📂empresa-a
 ┃ ┣ 📂certs
 ┃ ┃ ┣ 📜ca-empresa-a.crt
 ┃ ┃ ┗ 📜ca-empresa-a.key
 ┃ ┣ 📜deployment.yaml
 ┃ ┣ 📜index.js
 ┃ ┣ 📜package-lock.json
 ┃ ┣ 📜package.json
 ┃ ┗ 📜service.yaml
 ┣ 📂empresa-b
 ┃ ┣ 📂certs
 ┃ ┃ ┣ 📜ca-empresa-b.crt
 ┃ ┃ ┗ 📜ca-empresa-b.key
 ┃ ┣ 📜deployment.yaml
 ┃ ┣ 📜index.js
 ┃ ┣ 📜package-lock.json
 ┃ ┣ 📜package.json
 ┃ ┗ 📜service.yaml


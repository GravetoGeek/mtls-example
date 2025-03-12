
# Criar namespaces para as empresas A e B

kubectl create namespace empresa-a
kubectl create namespace empresa-b

# Criar uma autoridade certificadora (CA)
openssl req -x509 -newkey rsa:2048 -keyout ca-empresa-a.key -out ca-empresa-a.crt -days 365 -nodes -subj "/CN=CA Empresa A"

openssl req -x509 -newkey rsa:2048 -keyout ca-empresa-b.key -out ca-empresa-b.crt -days 365 -nodes -subj "/CN=CA Empresa B"

# Certificado para o serviço da Empresa A

openssl req -x509 -newkey rsa:4096 -keyout empresa-a.key -out empresa-a.crt -days 365 -nodes -subj "/CN=localhost" -CA ca-empresa-a.crt -CAkey ca-empresa-a.key -CAcreateserial -sha256


# Certificado para o serviço da Empresa B

openssl req -x509 -newkey rsa:4096 -keyout empresa-b.key -out empresa-b.crt -days 365 -nodes -subj "/CN=localhost" -CA ca-empresa-b.crt -CAkey ca-empresa-b.key -CAcreateserial -sha256


# Criar secrets para empresa A

kubectl create secret generic empresa-a-certs --namespace=empresa-a --from-file=certs/empresa-a.crt --from-file=certs/empresa-a.key

# Criar secrets para empresa B

kubectl create secret generic empresa-b-certs --namespace=empresa-b --from-file=certs/empresa-b.crt --from-file=certs/empresa-b.key

# Aplicar os manifests da empresa

kubectl apply -f empresa-a/deployment.yaml -n empresa-a
kubectl apply -f empresa-b/deployment.yaml -n empresa-b

# Deletar deployment
kubectl delete deployment empresa-a -n empresa-a
kubectl delete deployment empresa-b -n empresa-b

# Requisição de certificado para o serviço da Empresa A

curl --cacert /etc/mtls/ca.crt --cert /etc/mtls/tls.crt --key /etc/mtls/tls.key https://service-a.empresa-a.svc.cluster.local/service-a

# Requisição de certificado para o serviço da Empresa B

curl --cacert /etc/mtls/ca.crt --cert /etc/mtls/tls.crt --key /etc/mtls/tls.key https://service-b.empresa-b.svc.cluster.local/service-b

# Obter nome do pod

kubectl get pods -n empresa-a
kubectl get pods -n empresa-b

# Verificar logs

kubectl logs -n empresa-a -l app=service-a
kubectl logs -n empresa-b -l app=service-b


# Verificar conectividade entre os namespaces

kubectl exec -it <pod-name> -n empresa-a -- curl https://service-b.empresa-b.svc.cluster.local/service-b
kubectl exec -it empresa-a-667b7fc645-62g5m -n empresa-a -- curl https://empresa-b.empresa-b.svc.cluster.local:3001/enviar


# Criar secrets para os certificados e chaves da Empresa A

kubectl create secret generic mtls-certs-a -n empresa-a \
  --from-file=ca.crt=certs/ca-empresa-a.crt \
  --from-file=tls.crt=certs/empresa-a.crt \
  --from-file=tls.key=service-a.key

# Criar secrets para os certificados e chaves da Empresa B

kubectl create secret generic mtls-certs-b -n empresa-b \
  --from-file=ca.crt=ca-empresa-b.crt \
  --from-file=tls.crt=service-b.crt \
  --from-file=tls.key=service-b.key


# Configurações de pod temporário

kubectl create secret generic mtls-client-certs-a -n empresa-a \
  --from-file=ca.crt=empresa_a/ca-empresa-a.crt \
  --from-file=tls.crt=empresa_a/service-a.crt \
  --from-file=tls.key=empresa_a/service-a.key


kubectl create secret generic mtls-client-certs-b -n empresa-b \
  --from-file=ca.crt=empresa_b/ca-empresa-b.crt \
  --from-file=tls.crt=empresa_b/service-b.crt \
  --from-file=tls.key=empresa_b/service-b.key


kubectl run curl -n empresa-a --image=curlimages/curl -i --tty --rm --restart=Never \
  --overrides='
  {
    "spec": {
      "containers": [
        {
          "name": "curl",
          "image": "curlimages/curl",
          "command": ["sh"],
          "stdin": true,
          "tty": true,
          "volumeMounts": [
            {
              "mountPath": "/etc/mtls",
              "name": "mtls-certs",
              "readOnly": true
            }
          ]
        }
      ],
      "volumes": [
        {
          "name": "mtls-certs",
          "secret": {
            "secretName": "mtls-client-certs-a"
          }
        }
      ]
    }
  }' -- sh


kubectl run curl -n empresa-b --image=curlimages/curl -i --tty --rm --restart=Never \
  --overrides='
  {
    "spec": {
      "containers": [
        {
          "name": "curl",
          "image": "curlimages/curl",
          "command": ["sh"],
          "stdin": true,
          "tty": true,
          "volumeMounts": [
            {
              "mountPath": "/etc/mtls",
              "name": "mtls-certs",
              "readOnly": true
            }
          ]
        }
      ],
      "volumes": [
        {
          "name": "mtls-certs",
          "secret": {
            "secretName": "mtls-client-certs-b"
          }
        }
      ]
    }
  }' -- sh


# Executar pod temporário

curl --cacert ./empresa-b/certs/ca-empresa-a.crt --cert ./empresa-b/certs/empresa-a.crt --key ./empresa-b/certs/empresa-a.key https://$(minikube ip)/enviar
curl --cacert empresa-a/certs/ca-empresa-a.crt --cert empresa-a/certs/empresa-a.crt --key empresa-a/certs/empresa-a.key https://localhost:3000/enviar

curl --cacert certs/ca-empresa-b.crt --cert certs/empresa-b.crt --key certs/empresa-b.key https://10.103.214.1/enviar


# Verificar resolução de dns

kubectl exec -it <pod-name> -- sh

kubectl exec -it service-b-86cd9645cc-cgnhh -- sh


# Verificar se o configmap está montado corretamente no pod

kubectl describe pod <pod-name> -n empresa-b
kubectl describe pod service-b-86cd9645cc-cgnhh -n empresa-b

# Verifiquese o serviço está acessível:

kubectl get svc -n empresa-b


# Acessar pod
kubectl exec -it <pod-name> -n empresa-a -- sh
kubectl exec -it empresa-a-667b7fc645-62g5m -n empresa-a -- sh




# Remover recursos
kubectl delete namespace empresa-a empresa-b



# Iniciar um repositório local

docker run -d -p 5000:5000 --name registry registry


# Verificar se o repositório está funcionando
curl http://$(minikube ip):32775/v2/_catalog

curl http://localhost:32775/v2/_catalog


# buildar imagem do docker
docker build -t empresa-a:latest ./empresa-a

minikube image build ./empresa-a


docker build -t empresa-b:latest ./empresa-b

minikube image build ./empresa-b

docker build --tag $(minikube ip):5000/empresa-a:latest ./empresa-a
docker build --tag $(minikube ip):5000/empresa-b:latest ./empresa-b

docker build -t localhost:32775/empresa-a:latest empresa-a
docker build -t localhost:32775/empresa-b:latest empresa-b

# Taguear a imagem com endereço do registro local
docker tag empresa-a:latest 172.19.107.182:32775/empresa-a:latest
docker tag empresa-a:latest localhost:32775/empresa-a:latest

docker tag empresa-b:latest 172.19.107.182:32775/empresa-b:latest
docker tag empresa-b:latest localhost:32775/empresa-b:latest

docker tag empresa-a:latest $(minikube ip):5000/empresa-a:latest
docker tag empresa-b:latest $(minikube ip):5000/empresa-b:latest


# Enviar a imagem para o repositório local
docker push 172.19.107.182:32775/empresa-a:latest

docker push 172.19.107.182:32775/empresa-b:latest

docker push localhost:5000/empresa-a:latest

docker push localhost:5000/empresa-b:latest

docker push $(minikube ip):5000/empresa-a:latest

docker push $(minikube ip):5000/empresa-b:latest




# Comandos
kubectl apply -f empresa-a/deployment.yaml -n empresa-a
kubectl apply -f empresa-b/deployment.yaml -n empresa-b

kubectl apply -f empresa-a/service.yaml -n empresa-a
kubectl apply -f empresa-b/service.yaml -n empresa-b

kubectl apply -f empresa-a/ingress.yaml -n empresa-a
kubectl apply -f empresa-b/ingress.yaml -n empresa-b



# Permitir conexão insegura ao docker registry
sudo nano /etc/docker/daemon.json

"insecure-registries": ["172.19.107.182:5000"]



# Verificar serviços do minikube
kubectl get service --namespace kube-system


kubectl port-forward --namespace kube-system service/registry 5000:80




# Curl

# EMPRESA A

curl --cacert empresa-a/certs/ca-empresa-a.crt --cert empresa-a/certs/empresa-a.crt --key empresa-a/certs/empresa-a.key -X POST https://localhost:3000/enviar --header 'Content-Type: application/json' --data '{"message": "curl empresa-a","data": {"teste": 2}}'


curl --cacert certs/ca-empresa-a.crt --cert certs/empresa-a.crt --key certs/empresa-a.key -X POST https://localhost:3000/enviar --header 'Content-Type: application/json' --data '{"message": "curl empresa-a","data": {"teste": 2}}'


curl https://empresa-b.empresa-b.svc.cluster.local:3001/enviar

curl --cacert certs/ca-empresa-a.crt --cert certs/empresa-a.crt --key certs/empresa-a.key -X POST https://empresa-a.empresa-a.svc.cluster.local:3000/enviar --header 'Content-Type: application/json' --data '{"message": "curl empresa-a","data": {"teste": 2}}'

curl --cacert empresa-a/certs/ca-empresa-a.crt --cert empresa-a/certs/empresa-a.crt --key empresa-a/certs/empresa-a.key -X POST https://$(minikube ip):3000/enviar --header 'Content-Type: application/json' --data '{"message": "curl empresa-a","data": {"teste": 2}}'

kubectl exec -it empresa-a-667b7fc645-62g5m -n empresa-a -- curl https://empresa-b.empresa-b.svc.cluster.local:3001/enviar

# EMPRESA B

curl --cacert empresa-b/certs/ca-empresa-b.crt --cert empresa-a/certs/empresa-a.crt --key empresa-a/certs/empresa-a.key -X POST https://localhost:3001/receber -H "Content-Type: application/json" -d '{"message": "Teste do curl"}'


curl --cacert empresa-b/certs/ca-empresa-b.crt --cert empresa-b/certs/empresa-b.crt --key empresa-b/certs/empresa-b.key -X POST https://localhost:3001/receber






docker tag empresa-a localhost:32775/empresa-a
docker push localhost:32775/empresa-a
docker tag empresa-b localhost:32775/empresa-b
docker push localhost:32775/empresa-b
const express=require('express')
const https=require('https')
const http=require('http')
const fs=require('fs')
const axios=require('axios')

const app=express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
const port=3000

// Configuração do mTLS
const options={
    key: fs.readFileSync('certs/empresa-a.key'),
    cert: fs.readFileSync('certs/empresa-a.crt'),
    ca: [
        fs.readFileSync('certs/ca-empresa-a.crt'),
        fs.readFileSync('certs/ca-empresa-b.crt')
    ],
    requestCert: true,
    rejectUnauthorized: true,
}

app.get('/',(req,res) => {
    res.send('Empresa A')
})

// API para enviar mensagem
app.post('/enviar',async (req,res) => {
    try {
        const {body}=req
        console.log({body})
        const response=await axios.post('https://localhost:3001/receber',
            {
                message: 'Mensagem da Empresa A',
                data: body,
            },{
            httpsAgent: new https.Agent({
                key: fs.readFileSync('certs/empresa-a.key'),
                cert: fs.readFileSync('certs/empresa-a.crt'),
                ca: [
                    fs.readFileSync('certs/ca-empresa-a.crt'),
                    fs.readFileSync('certs/ca-empresa-b.crt')
                ],
            }),
        })

        res.send(response.data)
    } catch(error) {
        console.log({error})
        res.status(500).send({message:'Erro ao enviar mensagem',error})
    }
})

// API para receber mensagem
app.post('/receber',(req,res) => {
    const {body}=req
    const {data,message}=body
    console.log(`Mensagem recebida empresa-b:
    ${message}`)

    res.send({
        message: `Mensagem recebida pela empresa-b:
    ${message}`,
        data
    })
})

// Iniciar servidor com mtls
https.createServer(options,app).listen(port,() => {
    console.log(`Empresa A rodando na porta ${port}`)
})

//Iniciar servidor sem mtls
// http.createServer(app).listen(port,() => {
//     console.log(`Empresa A rodando na porta ${port}`)
// })
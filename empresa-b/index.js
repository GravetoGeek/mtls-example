const express=require('express')
const https=require('https')
const http=require('http')
const fs=require('fs')
const axios=require('axios')

const app=express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
const port=3001

// Configuração do mTLS
const options={
    key: fs.readFileSync('certs/empresa-b.key'),
    cert: fs.readFileSync('certs/empresa-b.crt'),
    ca: [
        fs.readFileSync('certs/ca-empresa-b.crt'),
        fs.readFileSync('certs/ca-empresa-a.crt')
    ],
    requestCert: true,
    rejectUnauthorized: true,
}

// API para enviar mensagem
app.post('/enviar',async (req,res) => {
    try {
        const { body } = req;
        const response=await axios.post('https://localhost:3000/receber',
            {
                message: 'Mensagem da Empresa B',
                data: body,
            },{
            httpsAgent: new https.Agent({
                key: fs.readFileSync('certs/empresa-b.key'),
                cert: fs.readFileSync('certs/empresa-b.crt'),
                ca: [
                    fs.readFileSync('certs/ca-empresa-b.crt'),
                    fs.readFileSync('certs/ca-empresa-a.crt')
                ],
                allowPartialTrustChain: false,
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
    console.log(`Mensagem recebida empresa-a:
    ${JSON.stringify(data)}`)

    res.send({
        message: `Mensagem recebida pela empresa-a:
    ${message}`,
        data
    })
})

// Iniciar servidor com mtls
https.createServer(options,app).listen(port,() => {
    console.log(`Empresa B rodando na porta ${port}`)
})

//Iniciar servidor sem mtls
// http.createServer(app).listen(port,() => {
//     console.log(`Empresa B rodando na porta ${port}`)
// })
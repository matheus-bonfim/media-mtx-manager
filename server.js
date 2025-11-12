import express from 'express';
import cors from 'cors';
import { handleRequest, getAllContainers, removeStream } from './main.js';
import { IP_PUBLIC, containerAgingTime, cleanerIntervalTime, HTTP_PORT } from './config.js';



export function createServer(){

    //setInterval(() => getAllContainers(containerAgingTime), cleanerIntervalTime);

    const app = express();
    const corsOptions = {
        origin: '*',
        methods: ['GET', 'POST']
    }
    app.use(cors(corsOptions));

    app.use(express.json({type: 'application/json'}));



    app.get('/api/getRTSP_pubURL', async (req, res) => {
        const url_source = req.query.url_source;
        const ponto = req.query.ponto;
        

        const ports = await handleRequest(ponto, url_source);
        if (ports) {
            const url_rtsp = `rtsp://${IP_PUBLIC}:${ports.rtspAddress}/${ponto}`;
            const url_webrtc = `http://${IP_PUBLIC}:${ports.webrtcAddress}/${ponto}`;
            res.status(200).json({
                message: 'URL RTSP gerada com sucesso',
                url: url_rtsp,
                url_webrtc: url_webrtc,
                ports: ports
            });
        }
        else {
            res.status(500).json({
                message: 'Erro ao gerar URL RTSP'
            });
        }
    })

    app.get('/api/removeOlderStreams', async (req, res) => {
        const agingTime = req.query.agingTime;
        const streams_lst = req.query['streams_lst[]'];
        const con_lst = await getAllContainers(agingTime);
        res.status(200).json({
            con_lst: con_lst
        })
    })

    app.get('/api/removeStream', async (req, res) => {
        const ponto = req.query.ponto;
        const resp = await removeStream(ponto);
        res.status(200).json({message: 'a'})
    })


    return app;
}


const serverHTTP = createServer();
const procSHttp = serverHTTP.listen(HTTP_PORT, () => {
      console.log(`\n Server HTTP rodando em http://localhost:${HTTP_PORT}`);
    });



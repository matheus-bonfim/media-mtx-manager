import getPort, { portNumbers } from 'get-port';
import { getAvailableUdpPort } from './udpPorts.js';
import fs from 'fs';
import path from 'path';
import Docker from 'dockerode';
import { con_config_path, IP_PUBLIC } from './config.js';






export async function getPorts() {
    const rtspAddress = await getPort({port: portNumbers(9554, 9564)});
    const webrtcAddress = await getPort({port: portNumbers(9031, 9041)});
    const webrtcLocalUDPAddress = await getAvailableUdpPort({portRange: [9042, 9052]});
    //const udpPort1 = await getAvailableUdpPort({portRange:})
    let pair_is_set = false;
    let rtpAddress=8010; 
    let rtcpAddress;
    const max_rtpAddress = 8030;
    let noPorts = false;


    while(!pair_is_set && !noPorts){
        //rtpAddress = await getPort({port: portNumbers(rtpAddress, max_rtpAddress)});
        rtpAddress = await getAvailableUdpPort({portRange: [rtpAddress, max_rtpAddress]})
        if(!rtpAddress){ //se nao encontrar porta para
            noPorts = true;
            break;
        }
        rtcpAddress = await getAvailableUdpPort({portRange: [rtpAddress + 1, rtpAddress + 1]})
        if(!rtcpAddress){
            rtpAddress += 2;
        }
        else pair_is_set = true;
        if(rtpAddress > max_rtpAddress - 1){
            noPorts = true;
        }
    }
    if(noPorts){
        return false;
    }
    else{
        const ports = {
            webrtcAddress: webrtcAddress,
            webrtcLocalUDPAddress: webrtcLocalUDPAddress,
            rtspAddress: rtspAddress, 
            rtpAddress: rtpAddress, 
            rtcpAddress: rtcpAddress,
        }
       
        return ports;
    }
}


// export async function getPorts() {
//     const rtspAddress = await getPort({port: portNumbers(9554, 9564)});
//     const webrtcAddress = await getPort({port: portNumbers(9031, 9041)});
//     //const webrtcLocalUDPAddress = await getAvailableUdpPort({portRange: [9042, 9052]});
//     //const udpPort1 = await getAvailableUdpPort({portRange:})
//     let pair_is_set = false;
//     let udpAddress=9042; 
//     let udpAddress2;
//     const max_udpAddress = 9052;
//     const udpInterval = 2;
//     let noPorts = false;


//     while(!pair_is_set && !noPorts){
//         //rtpAddress = await getPort({port: portNumbers(rtpAddress, max_rtpAddress)});
//         udpAddress = await getAvailableUdpPort({portRange: [udpAddress, max_udpAddress]})
//         if(!udpAddress){ //se nao encontrar porta para
//             noPorts = true;
//             break;
//         }
//         udpAddress2 = await getAvailableUdpPort({portRange: [udpAddress + 1, udpAddress + 2]})
//         if(!udpAddress2){
//             udpAddress += 2;
//         }
//         else pair_is_set = true;
//         if(udpAddress > max_udpAddress - 1){
//             noPorts = true;
//         }
//     }
//     if(noPorts){
//         return false;
//     }
//     else{
        
//         const ports = {
//             webrtcAddress: webrtcAddress,
//             rtspAddress: rtspAddress, 
//             udpAddress: udpAddress, 
//             udpAddress2: udpAddress2,
//         }
       
//         return ports;
//     }
// }


export function createYml(name, url_source, ports){

    try{
        fs.copyFileSync(path.join(con_config_path, 'default.yml'), path.join(con_config_path, `${name}.yml`));
    }
    catch (err) {
        console.log("Erro ao copiar default", err);
        return false;
    }

    //webrtcICEUDPRange: 9043-9053
    const content = `\nwebrtcAddress: :${ports.webrtcAddress}\nwebrtcLocalUDPAddress: :${ports.webrtcLocalUDPAddress}\nrtspAddress: :${ports.rtspAddress}\nrtpAddress: :${ports.rtpAddress}\nrtcpAddress: :${ports.rtcpAddress}\nwebrtcAdditionalHosts: [ "${IP_PUBLIC}" ]\npaths:\n  ${name}:\n    source: ${url_source}\n    sourceProtocol: tcp\n    sourceOnDemand: yes`;  
    
    try {
        const fileName = path.join(con_config_path,`${name}.yml` );
        fs.appendFileSync(fileName, content);
        return fileName;
    } catch (error) {
        console.log("Error overwriting file", error);
        return false;
    }
}
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = "0";

import path from 'path';
import child_process from 'child_process';
import {log} from "@cores/logger";
import {
    PPCa,
    PPCaFileOptions,
    PPCaOptions, PPPassThroughHttpHandler,
    PPServerProxy
} from "pms-proxy";
import {JDSource} from "@cores/source";
import {configs} from "./config";

async function getHttpsOption() {
    let https: PPCaOptions = <any>{};

    if (process.env.NODE_ENV == 'production') {
        https = await PPCa.generateCACertificate();
    } else {
        https = {
            keyPath: path.join(__dirname, '../certs/rootCA.key'),
            certPath: path.join(__dirname, '../certs/rootCA.pem'),
        }
    }
    return https;
}

(async () => {
    const https: PPCaOptions = await getHttpsOption();

    const server = new PPServerProxy({
        https
    })

    /**
     * Test inject all .js files
     *
     */
    const handler = new PPPassThroughHttpHandler(true, true);
    handler.injectBuffer((req, buffer) => {
        let source = new JDSource(buffer.toString());
        return {
            data: source.output()
        }
    })
    server.addRule()
        .host('103.142.26.166')
        .url(/\.js(\?(.*))?$/gi).then(handler);
    await server.listen(configs.proxyPort);

    if (process.env.NODE_ENV == 'production') {
        if (process.env.type == 'win32') {
            // for Windows
            // start with Proxy and CA
            const spki = PPCa.generateSPKIFingerprint((<PPCaFileOptions>https).cert);
            const userData = path.join(configs.rootAppDir, '/data/chrome');
            log.info('Chrome Data: ' + userData);
            log.info('SPKI: ' + spki);
            log.info(`Run: start chrome --proxy-server="http://127.0.0.1:${configs.proxyPort}" --ignore-certificate-errors-spki-list=\"${spki}\" --user-data-dir=\"${userData}\"`)
            const proc = child_process.exec(
                `start chrome --proxy-server="http://127.0.0.1:${configs.proxyPort}" --ignore-certificate-errors-spki-list=\"${spki}\" --user-data-dir=\"${userData}\"`
            );
            process.on('exit', () => {
                proc.kill();
            })
        }
    }

    log.info(`Server proxy running on port ${configs.proxyPort}`);
})();

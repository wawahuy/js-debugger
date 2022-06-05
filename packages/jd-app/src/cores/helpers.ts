import {log} from "@cores/logger";

export function timer(name: string) {
    const t = new Date().getTime();
    log.info(`${name} starting...`);

    return () => {
        log.info(`${name} done! ${new Date().getTime() - t}ms`);
    }
}
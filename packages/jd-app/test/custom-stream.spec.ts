import {PmsConcatStream, PmsFilterOffsetStream} from "../src/cores/custom-stream";
import {Readable} from "stream";
import {exceptions} from "winston";

describe('Custom stream', () => {
    test('concat-stream', async () => {
        const s = new PmsConcatStream(
            Readable.from('123'),
            Readable.from('456')
        )
        let buffers: Buffer[] = [];
        for await (let buffer of s) {
            buffers.push(buffer);
        }

        expect(Buffer.concat(buffers)).toEqual(Buffer.from('123456'));
    })

    test('filter-stream', async () => {
        const s = new PmsFilterOffsetStream({ start: 1, len: 4 });
        new PmsConcatStream(
            Readable.from('0'),
            Readable.from('1'),
            Readable.from('23'),
            Readable.from('456'),
        ).pipe(s);

        let buffers: Buffer[] = [];
        for await (let buffer of s) {
            buffers.push(buffer);
        }

        expect(Buffer.concat(buffers).toString()).toEqual('1234');
    })

    test('destroy in concat stream', async () => {
        const r = new Readable({
            read(size: number) {
                setTimeout(() => {
                    this.destroy(new Error('Hello world'));
                }, 1000)
            }
        })

        const c = new PmsConcatStream(r);

        const p = new Promise((res, rej) => {
            c.on('error', (err) => {
                rej(err);
            })
        })
        await expect(p).rejects.toEqual(new Error('Hello world'));
    })
})

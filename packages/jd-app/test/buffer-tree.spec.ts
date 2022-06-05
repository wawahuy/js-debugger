import {PmsBufferTree} from "../src/cores/buffer-tree";
import {Readable} from "stream";

describe('Buffer Tree Tests', () => {
    const bufferTree = new PmsBufferTree();

    it('insert & remove', () => {
        bufferTree.insertStream({ start: 0, end: 432 }, Readable.from(""));
        bufferTree.remove({ start: 0, end: 432 });
        expect(bufferTree.has({ start: 0, end: 432 })).toEqual(false)
    })
})

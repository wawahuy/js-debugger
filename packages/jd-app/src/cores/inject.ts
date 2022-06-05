import acorn from "acorn";
import {JDNode} from "@cores/source";

export abstract class JDInject {

    constructor(
        protected tree: JDNode
    ) {
    }

    abstract handle(): void;
    abstract name(): string;
}
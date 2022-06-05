import acorn, {Parser} from 'acorn';
import escodegen from "escodegen";
import {timer} from "@cores/helpers";
import {JDInject} from "@cores/inject";
import {JDInjectDebugVariable} from "@cores/inject-debug-variable";

export interface JDNode extends acorn.Node {
    body?: Node[];
}

export class JDSource {
    private tree: JDNode;

    constructor(
        private source: string
    ) {
        this.init()
    }

    private init() {
        let t;
        try {
            /**
             * Parse
             *
             */
            t = timer("parse");
            this.tree = Parser.parse(this.source, {
                ecmaVersion: "latest"
            });
            t();

            /**
             * Inject
             *
             */
            const injects: JDInject[] = [
                new JDInjectDebugVariable(this.tree)
            ]
            injects.forEach(inject => {
                t = timer('[INJECT] ' + inject.name());
                inject.handle();
                t();
            })
        } catch (e) {
            console.log(e);
        }
    }

    output() {
        if (!this.tree) {
            return this.source;
        }

        const t = timer("code generate");
        const result = escodegen.generate(this.tree);
        t();
        return result;
    }
}
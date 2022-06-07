import {JDInject} from "@cores/inject";
import acorn, {Parser} from "acorn";
import {builders as b, namedTypes, NodePath} from "ast-types";
import {JDNode} from "@cores/source";
import * as astTypes from "ast-types";
import escodegen from "escodegen";

export class JDInjectDebugVariable extends JDInject {
    constructor(tree: JDNode) {
        super(tree);
    }

    handle() {
        const that = this;
        astTypes.visit(this.tree, {
            visitVariableDeclarator(path) {
                try {
                    const vDebug = that.getParentNameVariableDebugger(path);
                    const name = path.value.id.name;
                    if (!name.startsWith('$jd')) {
                        // normal
                        let p = path.parentPath;

                        // without for
                        if (p?.parentPath?.node?.type !== 'ForInStatement') {
                            p.insertAfter(that.createNodeDebugVariable(vDebug, name))
                        }
                    }
                } catch (e) {
                    console.log(path.node);
                    console.log(e);
                }
                this.traverse(path);
            },
            visitAssignmentExpression(path) {
                try {
                    const vDebug = that.getParentNameVariableDebugger(path);
                    const name = that.getNameVariable(path.value.left);
                    if (!name.startsWith('$jd')) {
                        let p = path;
                        do {
                            p = p.parentPath;
                        } while (!p.parentPath?.node?.body);
                        p.insertAfter(that.createNodeDebugVariable(vDebug, name))
                    }
                }  catch (e) {
                    console.log(path.node);
                    console.log(e);
                }
                this.traverse(path);
            },
            visitFunction(path) {
                this.traverse(path);
            },
            visitFunctionDeclaration(path) {
                that.visitFunction(path, this, path.value.id);
            },
            visitFunctionExpression(path) {
                that.visitFunction(path, this, path.parentPath.value.id);
            },
            visitArrowFunctionExpression(path) {
                that.visitFunction(path, this, path.parentPath.value.id);
            }
        })
        if (this.tree.body) {
            this.tree.body = this.createNodeGlobal().concat(this.tree.body);
        }
    }

    name() {
        return "JD Inject Debug Variable";
    }

    private visitFunction(path: any, obj: any, identifier: any) {
        const vDebug = this.getParentNameVariableDebugger(path);
        path.node.$jd$__rv = vDebug + '_';
        if (path.node.body.body) {
            path.node.body.body = [
                this.createNodePrefixFunction(path.node.$jd$__rv, identifier?.name || 'anonymous'),
                ...path.node.body.body
            ];
        }
        obj.traverse(path);
    }

    private getParentNameVariableDebugger(path: any) {
        path = path.parentPath;
        do {
            const node = path.node;
            if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
                return node.$jd$__rv;
            }
            path = path.parentPath;
        } while (path.node);
        return "$jd$__rv";
    }

    private getNameVariable(node: any): string {
        if (node.type === "Identifier") {
            return node.name;
        } else if (node.type === "MemberExpression") {
            return this.getNameVariable(node.object) + '.' + node.property.name;
        }
        return "__WTF__";
    }

    private createNodePrefixFunction(vDebug: string, name: string) {
        return b.variableDeclaration(
            'const',
            [
                b.variableDeclarator(
                    b.identifier(vDebug),
                    b.callExpression(
                        b.memberExpression(
                            b.identifier(vDebug.slice(0, vDebug.length - 1)),
                            b.identifier('next'),
                            false
                        ),
                        [
                            b.literal(name)
                        ]
                    )
                )
            ]
        )

    }

    private createNodeDebugVariable(vDebug: string, name: string) {
        return b.expressionStatement(
            b.callExpression(
                b.memberExpression(
                    b.identifier(vDebug),
                    b.identifier('debug'),
                    false
                ),
                [
                    b.literal(name),
                    b.identifier(name),
                ]
            )
        )
    }

    private createNodeGlobal() {
        const source = `
            if (!window['$jd$registerVariable']) {
                window['$jd$registerVariable'] = function (name) {                  
                    return {
                        next: function (n) {
                            return $jd$registerVariable(n + "." + name + "()");
                        },
                        debug: function (n, v) {
                            console.log(name + "." + n + ": " + v);
                        },
                    }
                }
                window['$jd$__rv'] = $jd$registerVariable("");
            }
        `;
        const tree: JDNode = Parser.parse(source, { ecmaVersion: 'latest' });
        return tree.body || [];
    }
}
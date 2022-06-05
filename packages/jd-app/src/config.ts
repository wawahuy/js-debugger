const getRootAppDir = () => {
    if (process.env.NODE_ENV == 'production') {
        if(process.env.type == 'win32') {
            return process.cwd();
        } else {
            throw 'Not support system ' + process.env.type;
        }
    } else {
        return __dirname;
    }
}

export const configs = {
    proxyPort: 1234,

    /**
     * Root App Directory
     *
     */
    rootAppDir: getRootAppDir(),
}
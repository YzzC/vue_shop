module.exports = {
    pluginOptions:{
        "style-resources-loader":{
            preProcessor: "less",
            patterns:[]
        }
    },
    chainWebpack: config=>{
        config.when(process.env.NODE_ENV === "production", config =>{
            //发布模式
            config.entry('app').clear().add('./src/main-prod.js')
        })

        config.when(process.env.NODE_ENV === "development", config =>{
            //开发模式
            config.entry('app').clear().add('./src/main-dev.js')
        })
    }
};
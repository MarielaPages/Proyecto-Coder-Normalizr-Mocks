const { normalize, schema } = require("normalizr");

module.exports = function normalizingMessages(objANorm){
    //armo los esquemas
    const authorSchema = new schema.Entity('authors')

    const messageSchema = new schema.Entity('messages') //No entiendo porque no los toma. Es porque no es un objeto?

    const articleSchema = new schema.Entity('articles', {
    author: authorSchema,
    message: messageSchema
    })

    const mensajesSchema = new schema.Entity('mensajes', {
    mensajes: [articleSchema]
    })

    //Normalizo
    const normalizedMessages = normalize(objANorm, mensajesSchema)
    console.log("hola")

    return normalizedMessages
}
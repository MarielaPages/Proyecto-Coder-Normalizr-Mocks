const fs = require('fs')

//Creo clase con la que creare un objeto donde mantener los mensajes
class Mensajes{
    constructor(archivo){
        this.file = archivo
    }
    async save(object){
        try{
            const contenido = await fs.promises.readFile(`./${this.file}`, 'utf-8');
            const arrayProductos = JSON.parse(contenido);
            let posteriorId = 0;
            if(arrayProductos.legth === 0){
                posteriorId = 1
            }
            else{
                let ultimoId=0
                arrayProductos.forEach(element => {
                    ultimoId=element.id
                });
                posteriorId = ultimoId + 1
            }
            let objeto = {
                id : posteriorId,
                author: {
                    id : object.email,
                    name: object.name,
                    lastName: object.lastName,
                    age: object.age,
                    alias: object.alias,
                    avatar: object.avatar
                },
                date : object.date,
                message : object.message
            }
            arrayProductos.push(objeto);
            await fs.promises.writeFile(`./${this.file}`, `${JSON.stringify(arrayProductos)}`);
        }
        catch(err){
            console.log("save error",err)
        }
    }
    async getAll(){
        try{
            const contenido = await fs.promises.readFile(`./${this.file}`, 'utf-8');
            const arrayProductos = JSON.parse(contenido);
            return arrayProductos;
        }
        catch(err){
            console.log("getAll error",err);
        }
    }
}

module.exports = Mensajes
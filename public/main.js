const socket = io();

//creo funcion para desnormalizar
 function denormalizingMessages(objNormalizado){
    //armo los esquemas
    const authorSchema = new normalizr.schema.Entity('authors')

    const articleSchema = new normalizr.schema.Entity('articles', {
    author: authorSchema,
    })

    const mensajesSchema = new normalizr.schema.Entity('mensajes', {
    mensajes: [articleSchema]
    })

    //Normalizo
    const denormalizedMessages = normalizr.denormalize(objNormalizado.result, mensajesSchema, objNormalizado.entities)
    
    return denormalizedMessages
}

//Envio y recibo datos de productos
const button = document.getElementById('button');
const title = document.getElementById('title');
const price = document.getElementById('price')
const thumbnail = document.getElementById('thumbnail')

button.addEventListener("click", (e) => {
    e.preventDefault();
    const newProduct = {title: title.value, price: price.value, thumbnail: thumbnail.value}
    socket.emit("newProduct", newProduct);
})

let tableContainer = document.getElementById('tableContainer')
let tableBody = document.getElementById("tbody")

socket.on('productosEnviados', productos =>{
    if(productos.length>0){
        tableBody.innerHTML = productos.map(product => {
            return(`<tr>
                    <td> ${product.title} </td>
                    <td> ${product.price} </td>
                    <td>
                        <img src="${product.thumbnail}" alt="${product.title}" class="imgProd"> <!--El src lo va a ir a buscar a public porque alli declare que estan mis archivos estaticos-->
                    </td>
                    </tr>`)
        }).join('');             
    }
    else{
        tableContainer.innerHTML = `<p class="text-center">There are no products</p>`
    }
})

//Envio y recibo datos de mensajes
const button2 = document.getElementById('button2')
const email = document.getElementById('email')
const message = document.getElementById('message')
const userName = document.getElementById('name')
const lastName = document.getElementById('lastName')
const age = document.getElementById('age')
const alias = document.getElementById('alias')
const avatar = document.getElementById('avatar')


button2.addEventListener("click", () => {
    const d = new Date();
    const day = d.getDay()
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    const hour = d.getHours()
    const minutes = d.getMinutes()
    const second = d.getMilliseconds()
    const date = `${day}/${month}/${year} ${hour}:${minutes}:${second}`
    const personMessage = {email: email.value, date: date , message: message.value, name: userName.value, lastName: lastName.value, age: age.value, alias: alias.value, avatar: avatar.value}
    socket.emit("newMessage", personMessage)
    button2.value = ''
    email.value=''
    message.value=''
})

const messagesContainer = document.getElementById("messagesContainer")

socket.on('mensajesEnviados', mensajesNorm =>{
    const mensajesDesnorm = denormalizingMessages(mensajesNorm);
    const arrayMensajes = mensajesDesnorm.mensajes
    const mensajes = []
    for (let i=0; i<arrayMensajes.length; i++){
        mensajes.push(arrayMensajes[i])
    }

    messagesContainer.classList.add("mensajesContainerStyles")
    if(mensajes.length>0){
        messagesContainer.innerHTML = mensajes.map(mensaje => {
            return(`<p><span class="mail">${mensaje.author.id} </span>
                <span class="fecha">[${mensaje.date}]: </span>
                <span class="msj">${mensaje.message}</span></p>`)
        }).join(' ');
    }
    else{
        messagesContainer.innerHTML = ''
        messagesContainer.classList.remove("mensajesContainerStyles")
    }
})

socket.on('porcentComp', porcentaje => {
    const percentContainer = document.getElementById("compressPerc")
    if(porcentaje>0){
        percentContainer.innerHTML = `The compression percentage is ${porcentaje}%`
    }
    else{
        percentContainer.innerHTML = ''
    }
})




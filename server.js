const express = require("express");
const app = express();
//const multer = require('multer')
const {Server : ioServer} = require('socket.io')
const http = require('http')
const Contenedor = require("./contenedor")
const Mensajes = require('./mensajes')
const { faker } = require('@faker-js/faker');
const normalizingMessages = require('./funcionNorm')
const { inspect } = require('util')


const archivoNuevo = new Contenedor();
const mensajesLlegados = new Mensajes('mensajes.txt')

//Creo los servidores
const httpServer = http.createServer(app)
const io = new ioServer(httpServer) 

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname+"/public"));

//Rutas
app.get("/", (req, resp) => {
  const productos = archivoNuevo.getAll();
  resp.render('pages/index', {productos: productos}) // lo busca en views
})
app.get('/api/productos-test', (req, res) => {
  let arrayProdsFake = []
  for(let i=1; i<6; i++){
    const obj = {
      id: i,
      title: faker.commerce.productName(),
      price: faker.commerce.price(),
      thumbnail: faker.image.food()
    }
    arrayProdsFake.push(obj)
  }
  res.render('pages/productosTest', {productos: arrayProdsFake})
})


//Le digo donde van a estar mis templates y prendo el motor
app.set('views', './views') // este no es necesario??
app.set('view engine', 'ejs')


let messages = []
let productos = []

async function devolverMensajes(){
  messages = await mensajesLlegados.getAll()

  //Normalizo el array de mensajes
  const mensajes = {id:"mensajes", mensajes: messages}
  const normalizedMessages = normalizingMessages(mensajes)

  //porcentaje de disminucion 
  const difLong = JSON.stringify(messages).length - JSON.stringify(normalizedMessages).length
  const porcentDismin = Math.round((difLong/JSON.stringify(messages).length)*100)

  //veo el contenido del objeto normalizado
  //console.log(inspect(normalizedMessages, false, 12, true))

  io.sockets.emit('mensajesEnviados', normalizedMessages)
  io.sockets.emit('porcentComp', porcentDismin)
}
//Levanto el servidor io
io.on('connection', socket => {
  console.log("cliente conectado")
  
  io.sockets.emit('productosEnviados', productos)
  socket.on('newProduct', (product) =>{
    archivoNuevo.save(product);
    productos = archivoNuevo.getAll()
    io.sockets.emit('productosEnviados', productos);
  })

  devolverMensajes()
  socket.on('newMessage', async data =>{
    await mensajesLlegados.save(data)
    messages = await mensajesLlegados.getAll()
    console.log("messages", JSON.stringify(messages).length)

    //Normalizo el array de mensajes
    const mensajes = {id:"mensajes", mensajes: messages}
    const normalizedMessages = normalizingMessages(mensajes)

    //porcentaje de disminucion 
    const difLong = JSON.stringify(messages).length - JSON.stringify(normalizedMessages).length
    const porcentDismin = Math.round((difLong/JSON.stringify(messages).length)*100)

    io.sockets.emit('mensajesEnviados', normalizedMessages)
    io.sockets.emit('porcentComp', porcentDismin)
  })
});

//empiezo el server
const PORT = 8080;
const server = httpServer.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`);
});

server.on('error', error => console.log(`Error en el servidor ${error}`))
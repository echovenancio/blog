---
layout: post
---

# Quadro colaborativo em JS 

Nessa série de posts estarei mostrando como criar uma simples ferramenta de whiteboard interativo em JS
utilizando WebSockets e um backend em go.

## O que é um whiteboard interativo?

Um whiteboard interativo é uma ferramenta que permite que várias pessoas desenhem em um mesmo quadro em tempo real.
É muito utilizado em reuniões remotas e aulas online.

## Incialização do projeto
Após criar a pasta onde o projeto será armazenado usaremos a ferramenta cli da linguagem go para
inicializar um módulo com o seguinte comando:

```bash
go init
```

Com a criação do módulo criaremos um arquivo html que servirá como frontend, além de uma pasta
com arquivos estáticos que guardaram o estilo e a lógica do frontend. Por ultimo criaremos um arquivo
main.go que servirá como o nosso servidor.

# Estrutura do projeto
```
─── board
    ├── cmd/main.go
    ├── go.mod
    ├── go.sum
    ├── index.html
    ├── static
       ├── board.js
└── style.css
```


## Dependências

A única dependência do projeto é a biblioteca `gorilla/websocket` que será utilizada para criar o servidor de WebSockets.
Então após inicializar o módulo go, instalamos a dependência com o comando:

```bash
go get github.com/gorilla/websocket
```

# Frontend

Abrindo o nosso arquivo  ```index.html``` escreveremos algumas simples tags para manipular o canvas.

```html
<!DOCTYPE html>

<html>
    <head>
        <title>Board interativo</title>
    </head>
        <body>
            <script defer src="/static/board.js"></script>  
            <canvas id="canvas"></canvas>
        </body>
</html>
```

## Canvas

O canvas é uma API que podemos manipular para desenhar gráficos na tela diretamente através da tag ```canvas```.
Primeiro precisamos pegar o elemento canvas e o contexto 2d do canvas.

No arquivo static/board.js:

```js
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
```

O contexto 2d serve para desenhar no canvas, com ele podemos desenhar linhas, retângulos, círculos, etc.
Porém antes de começarmos a desenhar, precisamos definir o tamanho do canvas para que ele ocupe toda
a janela e seu tamanho seja redimensionado ao longo em que o usuário mude o tamanho da aba. Para esse
finalidade usaremos o seguinte código:

```js
function reziseCanvas() {
    const temp = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    outlineCanvas.width = window.innerWidth;
    outlineCanvas.height = window.innerHeight;

    ctx.putImageData(temp, 0, 0);
}
```

Essa função irá redimensionar o canvas e manter o desenho que já foi feito. 
Para que a função seja chamada sempre que a janela for redimensionada, adicionamos um event listener:

```js
window.addEventListener('resize', reziseCanvas);
```

Além de chamar a função no corpo principal do código, para que ela seja executada assim que a página for carregada:

```js
reziseCanvas();
```

## Desenhando no canvas

O contexto 2d do canvas possui uma série de métodos para desenhar formas geométricas, como linhas, retângulos, círculos, etc.
Utilizaremos essas funções e vamos abstrair-las em uma função mais simples que será chamada sempre que o usuário tentar desenhar qualquer forma.
Para isso precisamos delimitar uma estrutura de como um desenho é representado para que a função saiba quais métodos precisa chamar para
desenhar a forma correta. A forma mais prática é usar json para definir essa estrutura, o que vai permitir que mandemos esse dado para o servidor e
de volta para o cliente facilmente. Segue-se um exemplo de como essa estrutura pode ser definida:

```json
[
    {
        "type": "line",
        "x1": 0,
        "y1": 0,
        "x2": 100,
        "y2": 100,
        "color": "#000000",
        "color": "#000000"
    },
    {
        "type": "circle",
        "x": 100,
        "y": 100,
        "radius": 50,
        "color": "#000000",
        "isFilled": true,
        "fill": "#000000"
    },
    {
        "type": "rect",
        "x": 100,
        "y": 100,
        "width": 100,
        "height": 100,
        "color": "#000000",
        "isFilled": true,
        "fill": "#000000"
    }, 
    {
        "type": "pencil",
        "lines": [
                {
                    "x1": 0,
                    "y1": 0,
                    "x2": 100,
                    "y2": 100,
                    "color": "#000000",
                },
                {
                    "x1": 100,
                    "y1": 100,
                    "x2": 200,
                    "y2": 200,
                    "color": "#000000",
                }
            ]
        },
]
```

Ferramentas como um apagador (eraser) podemos modelar como um círculo de cor branca com um raio grande o suficiente para 
pintar sobre qualquer desenho.

Com a estrutura dos nossos desenhos definida podemos escrever a função que desenha no canvas:

```js
function drawEl(draw) {
    ctx.lineWidth = draw.lineWidth;
    ctx.strokeStyle = draw.color;

    if (draw.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(draw.x1, draw.y1);
        ctx.lineTo(draw.x2, draw.y2);
        ctx.stroke();
    } else if (draw.type === 'rect') {
        ctx.strokeRect(draw.x, draw.y, draw.width, draw.height);
    } else if (draw.type === 'circle') {
        ctx.beginPath();
        ctx.arc(draw.x, draw.y, draw.radius, 0, 2 * Math.PI);
        ctx.stroke();
    } else if (draw.type === 'pencil') {
        for (let line of draw.lines) {
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.stroke();
        }
    }
}
```

A função acima recebe um objeto que representa um desenho, seleciona a espessura
da linha e a cor do desenho além chamar os métodos do contexto 2d 
para desenhar a forma geométrica que condiz com a forma do desenho. O maior
outlier aqui seria o pincel que é representado por um array de linhas, por isso
a necessidade de um loop para desenhar todas as linhas, existe outro
nuançe sobre o pincel, porém abordaremos isso mais a frente.


## Eventos do mouse

Já que temos um método de desenhar na tela, agora precisamos saber onde
devemos desenhar. Primeros iremos declarar algumas variáveis para entender o 
estado e posição do mouse.

```js
let isMouseDown = false;

let curMouseX = 0;
let curMouseY = 0;

let initialMouseX = 0;
let initialMouseY = 0;
```

Agora precisamos adicionar os eventos de mouse para que possamos capturar a posição.

```js
canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    initialMouseX = e.clientX;
    initialMouseY = e.clientY;
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        isMouseDown = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    curMouseX = e.clientX;
    curMouseY = e.clientY;
});
```

Com a informação do estado e posição do mouse podemos expandir esses
event listeners para integrar com a função de desenho.

```js
canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        isMouseDown = false;
        drawEl({
            type: 'line',
            x1: initialMouseX,
            y1: initialMouseY,
            x2: curMouseX,
            y2: curMouseY,
            color: '#000000',
        });
    }
});
```

Agora quando o usuário clicar e arrastar o mouse e soltar, uma linha será desenhada
entre a posição inicial e final do mouse. Porém nesse estágio o usuário
só pode desenhar linhas, para que ele possa desenhar outras formas preciamos
adicionar uma variável de controle.

```js
let tool = 'line';
```

Agora podemos modificar o evento de mouseup para que ele desenhe nao
só a linha como outras formas.

```js
canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        isMouseDown = false;
        if (tool === 'line') {
            drawEl({
                type: 'line',
                x1: initialMouseX,
                y1: initialMouseY,
                x2: curMouseX,
                y2: curMouseY,
                color: '#000000',
            });
        } else if (tool === 'circle') {
            drawEl({
                type: 'circle',
                x: initialMouseX,
                y: initialMouseY,
                radius: Math.sqrt((curMouseX - initialMouseX) ** 2 + (curMouseY - initialMouseY) ** 2),
                color: '#000000',
            });
        } else if (tool === 'rect') {
            drawEl({
                type: 'rect',
                x: initialMouseX,
                y: initialMouseY,
                width: curMouseX - initialMouseX,
                height: curMouseY - initialMouseY,
                color: '#000000',
            });
        } 
    }
});
```

Para finalizarmos essa secção precisamos adicionar algumas outras
variáveis de controle para que o usuário possa mudar as características
do desenho, como por exemplo a cor da forma.

```js
let color = 'black';
let isFilled = false;
let fill = 'black';
```

Com a cor podemos revisar a função do event listener para passar a cor
do desenho e as outras propriedades, como preenchimento. O código
com essas alterações feitas pode ser encontrado no repositório
do projeto.

### Pincel

O pincel é uma das exceções do nosso sistema de desenho, pois invés de
pintar-lo na tela após soltar o clique do mouse, é mais intuitivo você desenhar
enquanto segura o clique do mouse. Por isso invés de ter a função de desenha-lo
no evento de mouseup, precisamos desenha-lo no evento de mousemove.

```js
container.addEventListener('mousemove', (e) => {
    curMouseX = e.clientX;
    curMouseY = e.clientY;
    if (isMouseDown) {
        if (tool === 'pencil') {
            drawEl({
                type: 'line',
                x1: initialMouseX,
                y1: initialMouseY,
                x2: curMouseX,
                y2: curMouseY,
                color: color,
            });
        }
    }
});
```

Quando estivermos sincronizando com o servidor e outros clientes conectados no whiteboard
faz sentido em vez de mandar cada linha individualmente que compoem o desenho do pincel, mandar
o desenho inteiro. Para isso precisamos de uma variável que armazene todas as linhas.

```js
let drawings = [];
```

No código completo você pode achar os lugares onde você deve fazer push ao array
e quando você deve limpa-lo.

## Controles

Para que o usuário possa mudar a ferramenta de desenho, cor, preenchimento, etc
precisamos adicionar controles na tela. Primeiro adicionaremos algumas tags
para representar esses controles.

```html
<div id="controls">
    <span data-tool="pencil" id="pencil-control">
        p 
    </span>
    <span data-tool="circle" id="circle-control">
        c 
    </span>
    <span data-tool="rect" id="rect-control">
        r 
    </span>
    <span data-tool="line" id="line-control">
        l 
    </span >
    <span id="color-control">
        cor 
        <input type="color">
    </span>
    <span id="is-filled-control">
        preenchimento?
        <input type="checkbox">
    </span>
    <span id="fill-control">
        fill 
        <input type="color">
    </span>
</div>
```

Para encerrarmos essa parte do projeto precisamos adicionar os event listeners
para controlar qual ferramenta o usuário está usando.

```js
const pencilControl = document.getElementById('pencil-control');
const circleControl = document.getElementById('circle-control');
const lineControl = document.getElementById('line-control');
const rectControl = document.getElementById('rect-control');
const colorControl = document.getElementById('color-control');

const controls = [pencilControl, circleControl, lineControl, rectControl];

for (let control of controls) {
    control.addEventListener('click', () => {
        if (lastActiveControl != null) {
            lastActiveControl.classList.remove('active');
        }
        tool = control.getAttribute('data-tool');
        control.classList.add('active');
        lastActiveControl = control;
    });
}
```

O código acima adiciona um event listener para cada controle, que muda a ferramenta
de desenho para a ferramenta que o usuário clicou. Existem alguns controles que não
são tratados aqui, nominalmente se uma forma possui preenchimento e a cor do preenchimento,
porém o código que implementa essa função também pode ser encontrado no repositório.

# Conclusão

Com isso encerramos essa secção do projeto, no proximo post trataremos sobre
o backend, sincronização entre os clientes e as conexões WebSockets.

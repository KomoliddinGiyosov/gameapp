/**
 * Created by Иван on 10.10.2014.
 */
// автор Супрунов Иван Евгеньевич
//параметры карты
var maxSizeMap = 12;
var minSizeMap = 5;
var maxSizeMapPixels = 1900;
var minSizeMapPixels = 100;
var deltaSizeMapPixels = 100;

var sizeCell
var canvas;
var context;
var countCells;
var sizeMap; // размер в пикселях - для html
var sizeMapPx; // размер в пикселях - для игры
var lenghtCells; // самая длинная строка
var cells; // клетки

var thicknessCellDraw; // толщина прочерченной линии
var thicknessCellNoDraw; // толщина сетки

var drawImageCross; // картинка крестика
var drawImageToe; // картинка нолика
var drawImageVertical;
var drawImageHorizontal;
var drawImageCorner;

var movePlayer1; // ходит первый игрок или второй

var countCross; //количество крестиков
var countToe; //количество ноликов

var countCrossButtonEl;
var countToeButtonEl;
var countCellsNotFinishEl;

// уменьшить карту в игровых клетках
function decSizeMap() {
    var sizeMapEl = document.getElementById("sizeMap");
    sizeMap = sizeMapEl.innerHTML;
    if (sizeMap > minSizeMap) {
        sizeMapEl.innerHTML = parseInt(sizeMapEl.innerHTML, 10) - 2;
    }

    return;
}
// увеличить карту в игровых клетках
function incSizeMap() {
    var sizeMapEl = document.getElementById("sizeMap");
    sizeMap = sizeMapEl.innerHTML;
    if (sizeMap < maxSizeMap) {
        sizeMapEl.innerHTML = parseInt(sizeMapEl.innerHTML, 10) + 2;
    }
    return;
}




function Cell(n, x, y, lx, ly) {
    this.n = n;
    this.x = x;
    this.y = y;
    this.lx = lx;
    this.ly = ly;
    this.ll = false;
    this.lr = false;
    this.lt = false;
    this.lb = false;
}
// посчитать количество клеток
function calcCountCels() {
    var count = 0,
        i;
    for (i = 1; i < lenghtCells; i += 2) {
        count += i;
    }
    count *= 2;
    count += lenghtCells;
    return count;
}
// вычесляет линию крестика по его номеру
function calcLYCell(n) {
    for (var i = 1; i <= lenghtCells; i += 2) {
        n -= i;
        if (n < 0)
            return (i - 1) / 2;
    }

    for (i = lenghtCells - 2; i >= 1; i -= 2) {
        n -= i;
        if (n < 0)
            return (lenghtCells * 2 - i - 1) / 2;
    }
    return -1;

}
// вычесляет столбец крестика по его номеру
function calcLXCell(n) {
    var i = 1;
    for (; i <= lenghtCells; i += 2) {
        n -= i;
        if (n < 0)
            return lenghtCells - ((lenghtCells - i) / 2 - n - 1) - 1;
    }
    for (i = lenghtCells - 2; i >= 1; i -= 2) {
        n -= i;
        if (n < 0)
            return lenghtCells - ((lenghtCells - i) / 2 - n - 1) - 1;
    }
    return -1;
}

// перевод длины в линиях в пиксили для x
function calcXCell(lx) {
    return sizeCell * lx;
}
// перевод длины в линиях в пиксили для x
function calcYCell(ly) {
    return sizeCell * ly;
}
// создали сетку
function createNetCells() {
    context.beginPath();
    context.lineWidth = thicknessCellNoDraw;
    for (var i = 0; i < countCells; i++) {
        var cell = cells[i];

        context.moveTo(cell.x, cell.y);
        context.lineTo(cell.x, cell.y + sizeCell);

        context.moveTo(cell.x + sizeCell, cell.y);
        context.lineTo(cell.x + sizeCell, cell.y + sizeCell);

        context.moveTo(cell.x, cell.y);
        context.lineTo(cell.x + sizeCell, cell.y);

        context.moveTo(cell.x, cell.y + sizeCell);
        context.lineTo(cell.x + sizeCell, cell.y + sizeCell);
    }
    context.stroke();
}

//создали клетки
function initCells() {
    cells = new Array();
    for (var i = 0; i < countCells; i++) {
        var lx = calcLXCell(i);
        var ly = calcLYCell(i);
        cells[i] = new Cell(i, calcXCell(lx), calcYCell(ly), lx, ly);
    }

}


// прорисовали все отмеченные линии клеток
function drawAllCells() {
    for (var i = 0, len = countCells; i < len; i++) {
        if (cells[i].ll) {
            drawLinesCell("left", cells[i]);
        }
        if (cells[i].lr) {
            drawLinesCell("right", cells[i]);
        }
        if (cells[i].lt) {
            drawLinesCell("top", cells[i]);
        }
        if (cells[i].lb) {
            drawLinesCell("bottom", cells[i]);
        }

    }
}

function set4Cells() {
    movePlayer1 = true;
    cells[0].lb = true;
    cells[2].lt = true;
    cells[countCells - 1].lt = true;
    cells[countCells - 3].lb = true;
    countCross += 2;
    checkFinishDrawCell(cells[0]);
    checkFinishDrawCell(cells[countCells - 1]);

    var i, delta;
    for (i = 0, delta = 1; delta <= lenghtCells; i += delta, delta += 2);
    i -= lenghtCells;

    movePlayer1 = false;
    cells[i].lr = true;
    cells[i + 1].ll = true;
    var j = i + lenghtCells - 1;
    cells[j].ll = true;
    cells[j - 1].lr = true;
    countToe += 2;
    checkFinishDrawCell(cells[i]);
    checkFinishDrawCell(cells[j]);

    countCellsNotFinish -= 4;

    movePlayer1 = true;


}

function setBorderCells() // установили крайние границы клеток
{
    var i, delta;
    for (i = 0, delta = 1; delta <= lenghtCells; i += delta, delta += 2) {
        cells[i].ll = true;
        cells[i].lt = true;
    }
    for (i = 0, delta = 1; delta <= lenghtCells; delta += 2, i += delta) {
        cells[i].lr = true;
        cells[i].lt = true;
    }
    var midle = i - (lenghtCells * 2 + 1);
    for (i = midle, delta = lenghtCells + 2; delta > 1; delta -= 2, i += delta) {
        cells[i].lb = true;
        cells[i].ll = true;
    }
    for (i = midle + lenghtCells - 1, delta = lenghtCells; delta > 0; delta -= 2, i += delta) {
        cells[i].lb = true;
        cells[i].lr = true;
    }
    set4Cells();
}


function clearCanvas() {
    context.clearRect(0, 0, context.width, context.height);
}



function showGameElement() {
    document.getElementById("divGameInfo").style.display = "inline";
    document.getElementById("generalCanvas").style.display = "inline";

}

function onMouseDownButton() {
    var div = document.getElementById("divGameElemens");
    div.style.display = "inline";
    document.getElementById("generalCanvas").style.display = "none";
}

function onMouseUpButton() {
    var div = document.getElementById("divGameElemens");
    div.style.display = "none";
    document.getElementById("generalCanvas").style.display = "inline";
}

function setGameInfo() {
    document.getElementById("aCountCross").innerHTML = countCross;
    document.getElementById("aCountToe").innerHTML = countToe;
    document.getElementById("aCountNotFinishCell").innerHTML = countCellsNotFinish;

}

function drawMainField() //иницилазатор
{
    showGameElement();

    thicknessCellDraw = 8;
    thicknessCellNoDraw = 0.2;
    countCross = countToe = 0;


    countCrossButtonEl = document.getElementById("buttonCountCross");
    countToeButtonEl = document.getElementById("buttonCountToe");

    countCellsNotFinishEl = document.getElementById("buttonNotFinishCell");

    capionPlayerEl = document.getElementById("captionMovePlayer");

    canvas = document.getElementById("generalCanvas");


    if (screen.width < screen.height)
        canvas.width = canvas.height = screen.width;
    else
        canvas.width = canvas.height = screen.height;


    canvas.margin = "";
    canvas.addEventListener("mousedown", mouseClickCanvas, false);

    context = canvas.getContext("2d");
    context.translate(thicknessCellDraw, thicknessCellDraw);
    clearCanvas();

    movePlayer1 = false;

    lenghtCells = parseInt(document.getElementById("sizeMap").innerHTML, 10);
    sizeMapPx = parseInt(canvas.width, 10) * .98;

    countCells = calcCountCels();
    countCellsNotFinish = countCells;

    sizeCell = sizeMapPx / lenghtCells;
    setOriginalImage();




    initCells();
    setBorderCells();
    drawAllCells();
    createNetCells();

    setGameInfo();


    hideGameSeting();
    drawCorners();

    document.getElementById("divGameSeting").style.display = "none";


}

function checkLine(l) {
    if (l != true) {
        l = true;
        return true;
    } else
        return false;
}

function drawLinesCell(position, cell) //прорисовываем линию и устанавливаем её
{
    var o = thicknessCellDraw / 2;
    var o2 = thicknessCellDraw;
    context.beginPath();
    context.lineWidth = thicknessCellDraw;
    if (position === "left") {
        cell.ll = true;
        context.drawImage(drawImageVertical, cell.x - o, cell.y - o, thicknessCellDraw, sizeCell + o);
        context.drawImage(drawImageCorner, cell.x - o2, cell.y - o2, o2 * 2, o2 * 2);
        context.drawImage(drawImageCorner, cell.x - o2, cell.y - o2 + sizeCell, o2 * 2, o2 * 2);
    }
    if (position === "right") {
        cell.lr = true;
        context.drawImage(drawImageVertical, cell.x - o + sizeCell, cell.y - o, thicknessCellDraw, sizeCell + o);
        context.drawImage(drawImageCorner, cell.x - o2 + sizeCell, cell.y - o2, o2 * 2, o2 * 2);
        context.drawImage(drawImageCorner, cell.x - o2, cell.y - o2 + sizeCell, o2 * 2, o2 * 2);
    }
    if (position === "top") {
        cell.lt = true;
        context.drawImage(drawImageHorizontal, cell.x - o, cell.y - o, sizeCell + o, thicknessCellDraw);
        context.drawImage(drawImageCorner, cell.x - o2, cell.y - o2, o2 * 2, o2 * 2);
        context.drawImage(drawImageCorner, cell.x - o2 + sizeCell, cell.y - o2, o2 * 2, o2 * 2);
    }
    if (position === "bottom") {
        cell.lb = true;
        context.drawImage(drawImageHorizontal, cell.x - o, cell.y + sizeCell - o, sizeCell, thicknessCellDraw);
        context.drawImage(drawImageCorner, cell.x - o2, cell.y - o2 + sizeCell, o2 * 2, o2 * 2);
        context.drawImage(drawImageCorner, cell.x - o2, cell.y - o2 + sizeCell, o2 * 2, o2 * 2);
    }
    context.fillStyle = "#009";
    context.stroke();

}

function checkLinesDraw(l, r, t, b, cell) //прорисовываем линию и находим её орентацию
{
    var position = "none";

    function equLine(l1, l2, l3, l4) {
        if (l1 < l2 && l1 < l3 && l1 < l4)
            return true;
        else
            return false;
    }
    if (equLine(l, r, t, b) && checkLine(cell.ll))
        position = "left";

    else if (equLine(r, l, t, b) && checkLine(cell.lr))
        position = "right";

    else if (equLine(t, r, l, b) && checkLine(cell.lt))
        position = "top";

    else if (equLine(b, r, t, l) && checkLine(cell.lb))
        position = "bottom";

    if (position != "none")
        drawLinesCell(position, cell);

    return position;





}

function getStyleForByClassName(className, style) {
    var css = document.styleSheets[0].rules;
    var s = css.cssText;
    for (var i = 0; i < css.length; i++) {
        if (css[i].selectorText == className) {
            s = css[i].cssText
            break;
        }
    }
    var i1 = s.indexOf(style);
    i1 += style.length;
    var i2 = s.indexOf(";", i1);
    var l = i2 - i1;
    return s.substr(i1 + 1, l - 1).replace("px", "");

}
$(window).resize(function () {

    var fs = getStyleForByClassName("a", "font-size");
    document.getElementById("aEndGame").style.fontSize = (fs / detectZoom.zoom()) + "px";
    document.getElementById("aCountCross").style.fontSize = (fs / detectZoom.zoom()) + "px";
    document.getElementById("aCountToe").style.fontSize = (fs / detectZoom.zoom()) + "px";
    document.getElementById("aCountNotFinishCell").style.fontSize = (fs / detectZoom.zoom()) + "px";

});

function findCellForlXlY(lx, ly) //ищем номер клетки по линии и столбцу
{
    for (var i = 0; i < countCells; i++) {
        var cell = cells[i];
        if (cell.lx == lx && cell.ly == ly)
            return i;
    }
    return -1;
}

function drawCorners() {
    var o = thicknessCellDraw;
    for (var i = 0; i < countCells; i++) {
        var c = cells[i];
        context.drawImage(drawImageCorner, c.x - o, c.y - o, o * 2, o * 2);
        context.drawImage(drawImageCorner, c.x - o + sizeCell, c.y - o, o * 2, o * 2);
        context.drawImage(drawImageCorner, c.x - o, c.y - o + sizeCell, o * 2, o * 2);
        context.drawImage(drawImageCorner, c.x - o + sizeCell, c.y - o + sizeCell, o * 2, o * 2);
    }
}

function checkFinishDrawCell(cell) //проверяем клетку на завешённость
{
    if (cell.lb && cell.ll && cell.lr && cell.lt) {
        var o = thicknessCellDraw;
        if (movePlayer1)
            context.drawImage(drawImageCross, cell.x + o, cell.y + o, sizeCell - o * 2, sizeCell - o * 2);
        else
            context.drawImage(drawImageToe, cell.x + o, cell.y + o, sizeCell - o * 2, sizeCell - o * 2);
        return true;
    }
    return false;
}

function findNeighbor(cell, position) //ищем соседнюю клетку к выбранной клетки
{
    if (position == "none")
        return;
    var lx = cell.lx;
    var ly = cell.ly;
    var n;

    if (position == "left")
        n = findCellForlXlY(lx - 1, ly);
    else if (position == "right")
        n = findCellForlXlY(lx + 1, ly);
    else if (position == "top")
        n = findCellForlXlY(lx, ly - 1);
    else if (position == "bottom")
        n = findCellForlXlY(lx, ly + 1);

    if (position == "left")
        cells[n].lr = true;
    else if (position == "right")
        cells[n].ll = true;
    else if (position == "top")
        cells[n].lb = true;
    else if (position == "bottom")
        cells[n].lt = true;

    return n;
}

var capionPlayerEl;
var countCellsNotFinish;



function checkEndGame() // проверка на конец игры
{
    if (countCellsNotFinish == 0) {
        var winner;
        if (countCross > countToe)
            winner = "Победил игрок 1  со счётом " + countCross + " - " + countToe;
        else
            winner = "Победил игрок 2  со счётом " + countToe + " - " + countCross;
        alert(winner);
        endingGame();
    }
}


function mouseClickCanvas(event) {

    var clickX = event.pageX - canvas.offsetLeft;
    var clickY = event.pageY - canvas.offsetTop;

    for (var i = 0; i < countCells; i++) {
        var cell = cells[i];
        if (cell.x <= clickX && cell.x + sizeCell >= clickX) {
            if (cell.y <= clickY && cell.y + sizeCell >= clickY) {
                var l, r, t, b;
                l = clickX - cell.x;
                r = cell.x + sizeCell - clickX;
                t = clickY - cell.y;
                b = cell.y + sizeCell - clickY;

                var position = checkLinesDraw(l, r, t, b, cell);
                if (position == "none")
                    return;
                var nCell2 = findNeighbor(cell, position);
                var drawTryCell1 = checkFinishDrawCell(cell);
                var drawTryCell2 = checkFinishDrawCell(cells[nCell2]);
                if ((drawTryCell1 || drawTryCell2) == false) {
                    if (movePlayer1 == true)
                        movePlayer1 = false;
                    else
                        movePlayer1 = true;
                }
                var countFinishCell = drawTryCell1 + drawTryCell2;
                countCellsNotFinish -= countFinishCell;
                if (movePlayer1)
                    countCross += countFinishCell;
                else
                    countToe += countFinishCell;
                checkEndGame();
                setGameInfo();
                return;
            }

        }
    }
}

function bodyLoad() {
    setOriginalImage();

}

function clickButtonEndingGame() {
    if (confirm("вы действительн хотите закончить игру"))
        endingGame();
}

function endingGame() {

    document.getElementById("generalCanvas").style.display = "none";
    document.getElementById("divGameInfo").style.display = "none";
    document.getElementById("divGameSeting").style.display = "inline";
}

function hideGameSeting() {
    var el = document.getElementById("divGameSeting");
    el.style.display = "none";
}


function setOriginalImage() {
    drawImageCross = new Image(1000, 1000);
    drawImageCross.src = "images/крестик.jpg";
    drawImageToe = new Image(1000, 1000);
    drawImageToe.src = "images/нолик.jpg";
    drawImageHorizontal = new Image(1000, 1000);
    drawImageHorizontal.src = "images/горизонталь.jpg";
    drawImageVertical = new Image(1000, 1000);
    drawImageVertical.src = "images/вертикаль.jpg";
    drawImageCorner = new Image(1000, 1000);
    drawImageCorner.src = "images/уголок.jpg";
}
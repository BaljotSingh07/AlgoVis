const gridCellSize = 30;
// const width = window.innerWidth
// const height = window.innerHeight;
const gridColSize = 62;
const gridRowSize = 31;
const gridSize = gridColSize * gridRowSize;
let inProgress = false;
let visitedG = []
$(function () {
    // create an 100 by 100 grid
    const searchGrid = $("#search-grid")
    searchGrid.css('grid-template-columns', `repeat(${gridColSize}, ${gridCellSize}px)`)
    let gridId = 0;
    for(let i = 0; i< gridRowSize; i++){
        for(let j = 0; j< gridColSize; j++){
        searchGrid.append(`<div id='${gridId}' class="grid-cell"></div>`);
        gridId++;
        }
    }

    //add the start and end cells
    const startCell = $(`#${Math.floor(gridSize/2)}`)
    const goalCell = $(`#40`)

    startCell.toggleClass('start')
    goalCell.toggleClass('goal')

    let isMouseDown = false;
    $('#search-grid').on('mousedown', function () {
        isMouseDown = true;
    })
    $('#search-grid').on('mouseup', function () {
        isMouseDown = false;
    })

    $('.grid-cell').mouseenter(function () {
        if(isMouseDown && !$(this).hasClass('start') && !$(this).hasClass('goal')){
            $(this).toggleClass('wall');
        }
    });
    $('.grid-cell').mousedown(function () {
        if(!$(this).hasClass('start') && !$(this).hasClass('goal')){
            $(this).toggleClass('wall');
           
        }
    });

    $('#seek-bar').on('change', function () {
        drawVisitedCells(parseInt($(this).val() * visitedG.size / 100))
    })
    
    $('#play').click(function () {
        if(inProgress) return;
        clear();
        $(this).toggleClass('disabled')
        inProgress = true;
        let path = []
        const selectedAlgo = 'dfs'
        if(selectedAlgo === 'dfs'){
            path = runDFS(parseInt(startCell.attr('id')), parseInt(goalCell.attr('id')))
        }else if(selectedAlgo === 'bfs'){
            path = runBFS(parseInt(startCell.attr('id')), parseInt(goalCell.attr('id')))
        }
        path.then(async (path) => {
            for(let cell of path){
                await sleep(1);
                const jqCell = $(`#${cell}`)
                if(jqCell.hasClass('goal') || jqCell.hasClass('start'))
                    continue;
                jqCell.toggleClass('path')
            }
            inProgress = false;
        })
    })
    $('#pause').click(() => {
        inProgress = false;
    })

    $('#reset').click(clear)


    const borderHighlight = $('#border-highlight')
    //border highlight
    $("#search-grid").mousemove((e) => {
        borderHighlight.css("top" , e.clientY-20)
        borderHighlight.css("left" , e.clientX-20)
    })
})

function getNeighborsCells(cell){
    if(cell > gridSize)
        return [];
    const neighbors = [];
    const row = Math.floor(cell / gridColSize);
    const col = cell % gridColSize;
    if(row > 0){
        const neighborCell = cell - gridColSize;
        if(! $(`#${neighborCell}`).hasClass('wall'))
            neighbors.push(neighborCell);
    }
    if(row < gridRowSize-1){
        const neighborCell = cell + gridColSize;
        if(! $(`#${neighborCell}`).hasClass('wall'))
        neighbors.push(neighborCell);
    }
    if(col > 0){
        const neighborCell = cell - 1;
        if(! $(`#${neighborCell}`).hasClass('wall'))
        neighbors.push(neighborCell);
    }
    if(col < gridColSize-1){
        const neighborCell = cell + 1;
        if(! $(`#${neighborCell}`).hasClass('wall'))
        neighbors.push(neighborCell);
    }
    //randomize the neighbors
    // for(let i = neighbors.length - 1; i > 0; i--){
    //     const j = Math.floor(Math.random() * (i + 1));
    //     [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
    // }

    return neighbors;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clear(){
    $('.grid-cell').removeClass('visited')
    $('.grid-cell').removeClass('path')
}

async function drawVisitedCells(startValue = 0){
    clear()
    let cellsDrawn = 0;
    const seekBar = $("#seek-bar")
    startValue = parseInt(seekBar.val()) * visitedG.size / 100
    for(let cell of visitedG){
        if(cellsDrawn % 4 === 0 && cellsDrawn > startValue){
            await sleep(1);
        }
        if(cellsDrawn > startValue && inProgress === false)
            return;
        cellsDrawn++;
        seekBar.val(cellsDrawn/visitedG.size * 100)
        const jqCell = $(`#${cell}`)
        if(jqCell.hasClass('goal') || jqCell.hasClass('start'))
            continue;
        jqCell.toggleClass('visited')
    }
}

//run depth first search
async function runBFS(start, goal){
    const visited = new Set();
    const stack = [[start, [start]]];
    while(stack.length > 0){
        //dequeue the first element from the stack
        const popped = stack.shift();
        const current = popped[0];
        const path = popped[1];
        if(current === goal){
            visitedG = visited;
            await drawVisitedCells();
            return path;
        }
        if(visited.has(current)){
            continue;
        }
        // if(current !== start)
        //     $(`#${current}`).css('background-color', '#08587e59')
        visited.add(current);
        const neighbors = getNeighborsCells(current);
        for(let neighbor of neighbors){
            stack.push([neighbor, [...path, neighbor]]);
        }
    }
}

async function runDFS(start, goal){
    const visited = new Set();
    const stack = [[start, [start]]];
    while(stack.length > 0){
        //dequeue the first element from the stack
        const popped = stack.pop();
        const current = popped[0];
        const path = popped[1];
        if(current === goal){
            visitedG = visited;
            await drawVisitedCells(visited);
            return path;
        }
        if(visited.has(current)){
            continue;
        }
        // if(current !== start)
        //     $(`#${current}`).css('background-color', '#08587e59')
        visited.add(current);
        const neighbors = getNeighborsCells(current);
        for(let neighbor of neighbors){
            stack.push([neighbor, [...path, neighbor]]);
        }
    }
}
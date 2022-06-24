function createPuzzle(canvas, tray, map, type, showCanvas, showTray, images, level, isFlag) {
    const canvasContainer = document.querySelector(canvas);
    const trayContainer = document.querySelector(tray);

    const pop = document.querySelector('.pop');
    const mask = document.querySelector('.mask');

    const flag = isFlag;


    const orderMap = map;
    const cutouts = type;

    canvasContainer.addEventListener('puzzleUpdated', function(e) {
        if(e.detail.puzzleStatus) {

            if(flag) {
                document.querySelector('.stage-clear').style.display = 'block';
                canvasContainer.style.opacity = '0';
                trayContainer.style.opacity = '0';
                document.querySelector('.contentBlock > h1').style.opacity = '0';
                return;
            }

            mask.style.display = 'block';

            pop.style.display = 'block';
            pop.classList.add('active');

            

            function show() {
                mask.style.display = 'none';
                pop.style.display = 'none';
                pop.removeEventListener('click',show);
            }

            let timer = setTimeout(function() {
                pop.addEventListener('click', show)

                clearTimeout(timer);

                
            }, 2000)

            

            

            if(canvasContainer || trayContainer) {
                canvasContainer.remove();
                trayContainer.remove();
            }

            if(showCanvas || showTray) {
                document.querySelector(showCanvas).style.height = '100%';
                document.querySelector(showTray).style.height = '100%';
            }
            
            
        }
    })

    const puzzle = new ImagePuzzle('cutout');
    puzzle.bindImage(images);
    puzzle.createCutoutCanvas(canvasContainer, cutouts, trayContainer, 1, 3, 4, orderMap, "rgba(235, 189, 26, 1)", "white", level, 
    "rgba(200, 200, 200, 1)", "grey", "4px", 
    "rgba(200, 200, 200, 1)", "grey", "4px")
}



createPuzzle('#canvas', '#tray', orderMap1, cutouts1, '#canvas2', '#tray2', './images/image5.jpg', "Level One");
createPuzzle('#canvas2', '#tray2', orderMap2, cutouts2, '#canvas3', '#tray3', './images/image1.jpg', "Level Two");
createPuzzle('#canvas3', '#tray3', orderMap3, cutouts3, undefined, undefined, './images/image2.jpg', "Level Three", true);
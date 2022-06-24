// library class definitions
"use strict";

// anonymous function wrapper
(function(global, document) {

    // main ImagePuzzle class definition
    class ImagePuzzle {

        // constructor
        constructor(puzzleType) {

            // 4 possible puzzle types
            if (puzzleType !== "grid" && puzzleType !== "scatter" && puzzleType !== "scramble" && puzzleType !== "cutout") {
                console.log("invalid puzzle type, defaulting to grid")
                puzzleType = "grid"
            }

            this.type = puzzleType
            // class Piece object array
            this.pieces = []
            // class Slot object array
            this.canvasSlots = []
            // DOM elements
            this.piecesDOM = []
            this.backCanvasDOM = null
            this.backTrayDOM = null
            this.canvasSlotsDOM = []
            this.traySlotsDOM = []
            this.canvasParentDOM = null
            this.trayParentDOM = null
            this.titleBarDOM = null
            // Others
            this.canvasParentWidth = null
            this.trayParentWidth = null
            this.imgURL = null
            this.imgWidth = null
            this.imgHeight = null
            this.backgroundImgURL = null
            this.backgroundImgWidth = null
            this.backgroundImgHeight = null
            this.canvas = null
            this.tray = null
            this.numRows = 1
            this.numCols = 1
            this.tNumRows = 1
            this.tNumCols = 1
            this.gridGapSize = 4
            this.trayGapSize = 4
            this.completed = false
        }

        // ==================================== //
        // ========== USER FUNCTIONS ========== //
        // ==================================== //

        // bind puzzle image
        bindImage(imgURL) {
            this.imgURL = imgURL
        }

        // bind background image for canvas
        bindBackgroundImage(imgURL) {
            this.backgroundImgURL = imgURL
        }

        // create the main grid canvas
        createGridCanvas(parentElement, numRows, numCols, gapSize, titleBarColor="cornflowerblue", titleTextColor="white", titleText="", slotColor="grey", slotBorderRadius="0px", backgroundColor="white", canvasBorderRadius="0px") {

            this.numRows = numRows
            this.numCols = numCols
            this.gridGapSize = gapSize

            // get the parent's width and store it in object
            let windowWidth = parentElement.clientWidth
            this.canvasParentWidth = windowWidth

            // create the backCanvas
            let backCanvas = document.createElement('div')
            backCanvas.setAttribute("class", "backCanvas")
            backCanvas.style.backgroundColor = backgroundColor
            backCanvas.style.borderRadius = canvasBorderRadius

            // create the titleBar
            let titleBar = document.createElement('div')
            titleBar.setAttribute("class", "canvasTitleBar")
            titleBar.innerHTML = titleText
            titleBar.style.color = titleTextColor
            titleBar.style.backgroundColor = titleBarColor
            titleBar.style.borderRadius = canvasBorderRadius + " " + canvasBorderRadius + " 0%" + " 0%"

            // create canvas DOM element
            let puzzleCanvas = document.createElement('div')
            puzzleCanvas.setAttribute("class", "gridCanvas")
            puzzleCanvas.style.gridTemplateRows = "repeat(" + (this.numRows).toString() + ", 1fr)"
            puzzleCanvas.style.gridTemplateColumns = "repeat(" + (this.numCols).toString() + ", 1fr)"
            puzzleCanvas.style.borderRadius = "0% " + "0% " + canvasBorderRadius + " " + canvasBorderRadius

            if (this.backgroundImgURL != null) {
                puzzleCanvas.style.backgroundImage = "url(" + this.backgroundImgURL + ")"
            }

            // load the image to get image dimensions
            const img_element = new Image()
            img_element.setAttribute("id", "testPuzzleImage")
            img_element.setAttribute("src", this.imgURL)
            img_element.onload = () => {

                const imgWidth = img_element.naturalWidth
                const imgHeight = img_element.naturalHeight

                this.imgWidth = imgWidth
                this.imgHeight = imgHeight

                const width = Math.floor((imgWidth / this.numCols) * (windowWidth / imgWidth) - (this.gridGapSize * (this.numCols - 1)))
                const height = Math.floor((imgHeight / this.numRows) * (windowWidth / imgWidth) - (this.gridGapSize * (this.numRows - 1)))

                // create the canvas slots
                for (let y = 0; y < this.numRows; ++y) {
                    for (let x = 0; x < this.numCols; ++x) {

                        // get the slot id
                        let newID = y * this.numCols + x

                        // create slot in object array
                        let slot = new Slot(newID, x + 1, y + 1, x + 2, y + 2)
                        this.canvasSlots.push(slot)

                        // create piece in object array
                        let piece = new Piece(newID, newID, null)
                        this.pieces.push(piece)

                        // create slot in DOM
                        let canvasSlot = document.createElement('div')
                        canvasSlot.setAttribute("class", "canvasGridSlots")
                        canvasSlot.setAttribute("id", "slot_" + newID.toString())
                        canvasSlot.ondrop = () => { this.drop(event) }
                        canvasSlot.ondragover = () => { this.allowDrop(event) }

                        canvasSlot.style.gridColumnStart = (x + 1).toString()
                        canvasSlot.style.gridColumnEnd = (x + 2).toString()
                        canvasSlot.style.gridRowStart = (y + 1).toString()
                        canvasSlot.style.gridRowEnd = (y + 2).toString()
                        canvasSlot.style.minWidth = width.toString() + "px"
                        canvasSlot.style.minHeight = height.toString() + "px"
                        canvasSlot.style.backgroundColor = slotColor
                        canvasSlot.style.borderRadius = slotBorderRadius

                        puzzleCanvas.appendChild(canvasSlot)
                        this.canvasSlotsDOM.push(canvasSlot)
                        
                    }
                }

                // save relevant info
                backCanvas.appendChild(titleBar)
                backCanvas.appendChild(puzzleCanvas)
                parentElement.appendChild(backCanvas)
                this.titleBarDOM = titleBar
                this.canvas = puzzleCanvas
                this.backCanvasDOM = backCanvas
                this.canvasParentDOM = parentElement
            }
            
        }

        // create the scatter canvas
        createScatterCanvas(parentElement, slotsArray, titleBarColor="cornflowerblue", titleTextColor="white", titleText="", slotColor="grey", slotBorderRadius="0px", backgroundColor="white", canvasBorderRadius="0px") {

            let windowWidth = parentElement.clientWidth
            this.canvasParentWidth = windowWidth

            // create the backCanvas
            let backCanvas = document.createElement('div')
            backCanvas.setAttribute("class", "backCanvas")
            backCanvas.style.backgroundColor = backgroundColor
            backCanvas.style.borderRadius = canvasBorderRadius

            // create the titleBar
            let titleBar = document.createElement('div')
            titleBar.setAttribute("class", "canvasTitleBar")
            titleBar.innerHTML = titleText
            titleBar.style.color = titleTextColor
            titleBar.style.backgroundColor = titleBarColor
            titleBar.style.borderRadius = canvasBorderRadius + " " + canvasBorderRadius + " 0%" + " 0%"

            // load the image to get image dimensions
            const img_element = new Image()
            img_element.setAttribute("id", "testPuzzleImage")
            img_element.setAttribute("src", this.imgURL)
            img_element.onload = () => {

                const imgWidth = img_element.naturalWidth
                const imgHeight = img_element.naturalHeight

                this.backgroundImgWidth = imgWidth
                this.backgroundImgHeight = imgHeight

                const width = Math.floor(imgWidth * (windowWidth / imgWidth))
                const height = Math.floor(imgHeight * (windowWidth / imgWidth))

                // create the canvas
                let scatterCanvas = document.createElement('div')
                scatterCanvas.setAttribute("class", "scatterCanvas")
                scatterCanvas.style.height = height.toString() + "px"
                scatterCanvas.style.borderRadius = "0% " + "0% " + canvasBorderRadius + " " + canvasBorderRadius
                scatterCanvas.style.backgroundImage = "url(" + this.imgURL + ")"

                // create the slots on canvas
                for (let i = 0; i < slotsArray.length; i++) {

                    let newID = this.canvasSlots.length

                    let canvasSlot = document.createElement('div')
                    canvasSlot.setAttribute("class", "canvasScatterSlot")
                    canvasSlot.setAttribute("id", "slot_" + newID.toString())
                    canvasSlot.ondrop = () => { this.drop(event) }
                    canvasSlot.ondragover = () => { this.allowDrop(event) }

                    canvasSlot.style.top = slotsArray[i].top
                    canvasSlot.style.left = slotsArray[i].left
                    canvasSlot.style.width = slotsArray[i].width
                    canvasSlot.style.height = slotsArray[i].height
                    canvasSlot.style.backgroundColor = slotColor
                    canvasSlot.style.borderRadius = slotBorderRadius

                    let slot = new Slot(newID, slotsArray[i].left, slotsArray[i].top, slotsArray[i].left + slotsArray[i].width, slotsArray[i].top + slotsArray[i].height)
                    this.canvasSlots.push(slot)

                    scatterCanvas.appendChild(canvasSlot)
                    this.canvasSlotsDOM.push(canvasSlot)
                }

                // save relevant info
                backCanvas.appendChild(titleBar)
                backCanvas.appendChild(scatterCanvas)
                parentElement.appendChild(backCanvas)
                this.titleBarDOM = titleBar
                this.canvas = scatterCanvas
                this.backCanvasDOM = backCanvas
                this.canvasParentDOM = parentElement
            }
            
        }

        // create the main scramble canvas
        createScrambleCanvas(parentElement, numRows, numCols, gapSize, orderMap, titleBarColor="cornflowerblue", titleTextColor="white", titleText="", slotColor="grey", slotBorderRadius="0px", backgroundColor="white", canvasBorderRadius="0px") {

            this.numRows = numRows
            this.numCols = numCols
            this.gridGapSize = gapSize

            if (!this.checkOrderMapValidity(orderMap)) {
                console.log("Invalid orderMap, scrambleCanvas not created!")
                return
            }
            
            // get the parent's width and store it in object
            let windowWidth = parentElement.clientWidth
            this.canvasParentWidth = windowWidth

            // create the backCanvas
            let backCanvas = document.createElement('div')
            backCanvas.setAttribute("class", "backCanvas")
            backCanvas.style.backgroundColor = backgroundColor
            backCanvas.style.borderRadius = canvasBorderRadius

            // create the titleBar
            let titleBar = document.createElement('div')
            titleBar.setAttribute("class", "canvasTitleBar")
            titleBar.innerHTML = titleText
            titleBar.style.color = titleTextColor
            titleBar.style.backgroundColor = titleBarColor
            titleBar.style.borderRadius = canvasBorderRadius + " " + canvasBorderRadius + " 0%" + " 0%"

            // create canvas DOM element
            let puzzleCanvas = document.createElement('div')
            puzzleCanvas.setAttribute("class", "scrambleCanvas")
            puzzleCanvas.style.gridTemplateRows = "repeat(" + (this.numRows).toString() + ", 1fr)"
            puzzleCanvas.style.gridTemplateColumns = "repeat(" + (this.numCols).toString() + ", 1fr)"
            puzzleCanvas.style.borderRadius = "0% " + "0% " + canvasBorderRadius + " " + canvasBorderRadius

            if (this.backgroundImgURL != null) {
                puzzleCanvas.style.backgroundImage = "url(" + this.backgroundImgURL + ")"
            }

            // save relevant info
            backCanvas.appendChild(titleBar)
            backCanvas.appendChild(puzzleCanvas)
            parentElement.appendChild(backCanvas)
            this.titleBarDOM = titleBar
            this.canvas = puzzleCanvas
            this.backCanvasDOM = backCanvas
            this.canvasParentDOM = parentElement

            this.cutImage(null, puzzleCanvas, 0, 0, slotColor, slotBorderRadius, orderMap)
        }

        // create the main cutout canvas
        createCutoutCanvas(canvasParentElement, cutoutsArray, trayParentElement, numRows, numCols, gapSize, orderMap, 
            cTitleBarColor="cornflowerblue", cTitleTextColor="white", cTitleText="", cSlotColor="grey", cBackgroundColor="white", canvasBorderRadius="0px",
            slotColor="grey", backgroundColor="white", trayBorderRadius="0px") {
            
            let windowWidth = canvasParentElement.clientWidth
            this.canvasParentWidth = windowWidth

            // create the backCanvas
            let backCanvas = document.createElement('div')
            backCanvas.setAttribute("class", "backCanvas")
            backCanvas.style.backgroundColor = cBackgroundColor
            backCanvas.style.borderRadius = canvasBorderRadius

            // create the titleBar
            let titleBar = document.createElement('div')
            titleBar.setAttribute("class", "canvasTitleBar")
            titleBar.innerHTML = cTitleText
            titleBar.style.color = cTitleTextColor
            titleBar.style.backgroundColor = cTitleBarColor
            titleBar.style.borderRadius = canvasBorderRadius + " " + canvasBorderRadius + " 0%" + " 0%"

            // load the image to get image dimensions
            const img_element = new Image()
            img_element.setAttribute("id", "testPuzzleImage")
            img_element.setAttribute("src", this.imgURL)
            img_element.onload = () => {

                let image = new Image()
                image.src = this.imgURL

                const imgWidth = img_element.naturalWidth
                const imgHeight = img_element.naturalHeight

                // const percentOverWidth = 100 / imgWidth
                // const percentOverHeight = 100 / imgHeight

                this.imgWidth = imgWidth
                this.imgHeight = imgHeight

                const width = Math.floor(imgWidth * (windowWidth / imgWidth))
                const height = Math.floor(imgHeight * (windowWidth / imgWidth))

                // create the canvas
                let cutoutCanvas = document.createElement('div')
                cutoutCanvas.setAttribute("class", "scatterCanvas")
                cutoutCanvas.style.height = height.toString() + "px"
                cutoutCanvas.style.borderRadius = "0% " + "0% " + canvasBorderRadius + " " + canvasBorderRadius
                cutoutCanvas.style.backgroundImage = "url(" + this.imgURL + ")"

                if (this.backgroundImgURL != null) {
                    cutoutCanvas.style.backgroundImage = "url(" + this.backgroundImgURL + ")"
                }

                let cutoutPiecesArray = []

                for (let i = 0; i < cutoutsArray.length; i++) {

                    let newID = i
                    let newPiece = new Piece(newID, newID, null)
                    this.pieces.push(newPiece)

                    // making slots
                    let canvasSlot = document.createElement('div')
                    canvasSlot.setAttribute("class", "canvasScatterSlot")
                    canvasSlot.setAttribute("id", "slot_" + newID.toString())
                    canvasSlot.ondrop = () => { this.drop(event) }
                    canvasSlot.ondragover = () => { this.allowDrop(event) }

                    let slot = new Slot(newID, null, null, null, null)
                    this.canvasSlots.push(slot)

                    cutoutCanvas.appendChild(canvasSlot)
                    this.canvasSlotsDOM.push(canvasSlot)

                    // making images
                    let canvas = document.createElement("canvas")
                    let context = canvas.getContext("2d")
                    let minx = cutoutsArray[i][0].x
                    let miny = cutoutsArray[i][0].y
                    let maxx = cutoutsArray[i][0].x
                    let maxy = cutoutsArray[i][0].y

                    for (let j = 0; j < cutoutsArray[i].length; j++) {
                        if (cutoutsArray[i][j].x < minx) { minx = cutoutsArray[i][j].x }
                        if (cutoutsArray[i][j].y < miny) { miny = cutoutsArray[i][j].y }
                        if (cutoutsArray[i][j].x > maxx) { maxx = cutoutsArray[i][j].x }
                        if (cutoutsArray[i][j].y > maxy) { maxy = cutoutsArray[i][j].y }
                    }

                    canvas.width = maxx - minx
                    canvas.height = maxy - miny

                    // slot styles
                    let path = "polygon("

                    for (let j = 0; j < cutoutsArray[i].length; j++) {
                        let front = " "
                        let back = ","
                        if (j === 0) { front = "" }
                        if (j === cutoutsArray[i].length - 1) { back = ")" }
                        path = path + front + (Math.floor((cutoutsArray[i][j].x - minx) * (width / this.imgWidth))).toString() + "px " + (Math.floor((cutoutsArray[i][j].y - miny) * (height / this.imgHeight))).toString() + "px" + back
                    }

                    canvasSlot.style.clipPath = path
                    canvasSlot.style.backgroundColor = cSlotColor
                    canvasSlot.style.width = (Math.floor((maxx - minx) * (width / this.imgWidth))).toString() + "px"
                    canvasSlot.style.height = (Math.floor((maxy - miny) * (height / this.imgHeight))).toString() + "px"
                    canvasSlot.style.top = (Math.floor(miny * (height / this.imgHeight))).toString() + "px"
                    canvasSlot.style.left = (Math.floor(minx * (width / this.imgWidth))).toString() + "px"

                    // clip images to desired shape
                    context.translate(-minx, -miny)
                    context.drawImage(image, 0, 0)
                    context.beginPath()
                    context.moveTo(cutoutsArray[i][0].x, cutoutsArray[i][0].y)
                    
                    for (let j = 0; j < cutoutsArray[i].length; j++) {
                        context.lineTo(cutoutsArray[i][j].x, cutoutsArray[i][j].y)
                    }
                    context.closePath()

                    context.globalCompositeOperation = "destination-atop";
                    context.fill()

                    canvas.setAttribute("id", "piece_" + newID.toString())
                    canvas.setAttribute("draggable", "true")
                    canvas.ondragstart = () => { this.drag(event) }
                    cutoutPiecesArray.push(canvas)
                    this.piecesDOM.push(canvas)
                }

                // save relevant info
                backCanvas.appendChild(titleBar)
                backCanvas.appendChild(cutoutCanvas)
                canvasParentElement.appendChild(backCanvas)
                this.titleBarDOM = titleBar
                this.canvas = cutoutCanvas
                this.backCanvasDOM = backCanvas
                this.canvasParentDOM = canvasParentElement

                // create the puzzle tray
                this.tNumRows = numRows
                this.tNumCols = numCols
                this.trayGapSize = gapSize
                this.trayParentWidth = trayParentElement.clientWidth
                this.createTrayHelper(trayParentElement, false, numRows, numCols, slotColor, "0px", orderMap, backgroundColor, trayBorderRadius, "", "white", "black", cutoutPiecesArray)
            }
        }

        // match each scatter canvas slot to an image url
        createScatterMatchings(slotArray, imgURLArray) {

            for (let i = 0; i < slotArray.length; i++) {
                let piece = new Piece(i, slotArray[i], imgURLArray[i])
                this.pieces.push(piece)
            }
        }
        
        // create the puzzle tray
        createTray(parentElement, numRows, numCols, gapSize, orderMap, displayTitle, titleBarColor="cornflowerblue", titleTextColor="white", titleText="", slotColor="grey", slotBorderRadius="0px", backgroundColor="white", trayBorderRadius="0px") {
            
            if (!this.checkOrderMapValidity(orderMap)) {
                console.log("Invalid orderMap, tray not created!")
                return
            }

            this.tNumRows = numRows
            this.tNumCols = numCols
            this.trayGapSize = gapSize
            this.trayParentWidth = parentElement.clientWidth
            this.createTrayHelper(parentElement, displayTitle, numRows, numCols, slotColor, slotBorderRadius, orderMap, backgroundColor, trayBorderRadius, titleText, titleTextColor, titleBarColor, null)
        }


        // =============================================== //
        // ========== NON-USER HELPER FUNCTIONS ========== //
        // =============================================== //

        // create the pieces tray helper
        createTrayHelper(parentElement, displayTitle, numRows, numCols, slotColor, slotBorderRadius, orderMap, backgroundColor, trayBorderRadius, titleText, titleTextColor, titleBarColor, cutoutPiecesArray) {

            // create the backTray
            let backTray = document.createElement('div')
            backTray.setAttribute("class", "backCanvas")
            backTray.style.backgroundColor = backgroundColor
            backTray.style.borderRadius = trayBorderRadius

            // create the titleBar
            let titleBar = document.createElement('div')
            titleBar.setAttribute("class", "canvasTitleBar")
            titleBar.innerHTML = titleText
            titleBar.style.color = titleTextColor
            titleBar.style.backgroundColor = titleBarColor
            titleBar.style.borderRadius = trayBorderRadius + " " + trayBorderRadius + " 0%" + " 0%"

            // create the pieces tray for the puzzle pieces
            let piecesTray = document.createElement('div')
            piecesTray.setAttribute("class", "piecesTray")
            piecesTray.style.gridTemplateRows = "repeat(" + (numRows).toString() + ", 1fr)"
            piecesTray.style.gridTemplateColumns = "repeat(" + (numCols).toString() + ", 1fr)"
            piecesTray.style.backgroundColor = backgroundColor
            piecesTray.style.borderRadius = trayBorderRadius

            // save relevant info
            if (displayTitle) { backTray.appendChild(titleBar) }
            backTray.appendChild(piecesTray)
            parentElement.appendChild(backTray)
            this.tray = piecesTray
            this.backTrayDOM = backTray
            this.trayParentDOM = parentElement

            // create the tray slots differently for each type of puzzle
            if (this.type === "grid") {
                this.cutImage(piecesTray, null, numRows, numCols, slotColor, slotBorderRadius, orderMap)
            }
            else if (this.type === "scatter") {
                this.displayScatterTray(numRows, numCols, orderMap, slotColor, slotBorderRadius, parentElement.clientWidth)
            }
            else if (this.type === "cutout") {
                this.displayCutoutTray(numRows, numCols, orderMap, slotColor, slotBorderRadius, parentElement.clientWidth, cutoutPiecesArray)
            }
        }

        // create the tray slots for a cutout puzzle
        displayCutoutTray(tNumRows, tNumCols, orderMap, slotColor, slotBorderRadius, pWidth, cutoutPiecesArray) {

            for (let y = 0; y < tNumRows; ++y) {
                for (let x = 0; x < tNumCols; ++x) {

                    let newID = y * tNumCols + x

                    // create the tray slots
                    let slot = document.createElement('div')
                    slot.setAttribute("class", "traySlot")
                    slot.setAttribute("id", "tray_" + newID.toString())
                    slot.ondrop = () => { this.drop(event) }
                    slot.ondragover = () => { this.allowDrop(event) }

                    slot.style.gridColumnStart = (x + 1).toString()
                    slot.style.gridColumnEnd = (x + 2).toString()
                    slot.style.gridRowStart = (y + 1).toString()
                    slot.style.gridRowEnd = (y + 2).toString()
                    slot.style.minHeight = (Math.floor(pWidth / (3 * tNumCols))).toString() + "px"
                    slot.style.backgroundColor = slotColor
                    slot.style.borderRadius = slotBorderRadius

                    cutoutPiecesArray[orderMap[y][x]].style.height = "100%"
                    cutoutPiecesArray[orderMap[y][x]].style.width = "100%"

                    // place the image onto the slot
                    slot.appendChild(cutoutPiecesArray[orderMap[y][x]])
                    this.tray.appendChild(slot)
                    this.traySlotsDOM.push(slot)
                }
            }
        }

        // create the tray slots for a scatter puzzle
        displayScatterTray(tNumRows, tNumCols, orderMap, slotColor, slotBorderRadius, pWidth) {

            // create image DOM elements for each imgURL saved in pieces
            let imgArray = []
            for (let i = 0; i < this.pieces.length; i++) {
                let image = document.createElement('img')
                image.setAttribute("src", this.pieces[i].imgURL)

                let newID = i

                image.setAttribute("id", "piece_" + newID.toString())
                image.setAttribute("draggable", "true")
                image.ondragstart = () => { this.drag(event) }
                image.style.borderRadius = slotBorderRadius

                imgArray.push(image)
                this.piecesDOM.push(image)
            }

            for (let y = 0; y < tNumRows; ++y) {
                for (let x = 0; x < tNumCols; ++x) {

                    let newID = y * tNumCols + x

                    // create the tray slots
                    let slot = document.createElement('div')
                    slot.setAttribute("class", "traySlot")
                    slot.setAttribute("id", "tray_" + newID.toString())
                    slot.ondrop = () => { this.drop(event) }
                    slot.ondragover = () => { this.allowDrop(event) }

                    slot.style.gridColumnStart = (x + 1).toString()
                    slot.style.gridColumnEnd = (x + 2).toString()
                    slot.style.gridRowStart = (y + 1).toString()
                    slot.style.gridRowEnd = (y + 2).toString()
                    slot.style.minHeight = (Math.floor(pWidth / (3 * tNumCols))).toString() + "px"
                    slot.style.backgroundColor = slotColor
                    slot.style.borderRadius = slotBorderRadius

                    imgArray[orderMap[y][x]].style.height = "100%"
                    imgArray[orderMap[y][x]].style.width = "100%"

                    // place the image onto the tray slot
                    slot.appendChild(imgArray[orderMap[y][x]])
                    this.tray.appendChild(slot)
                    this.traySlotsDOM.push(slot)
                }
            }
        }

        // general function for cutting rectangular image pieces
        cutImage(piecesTray, canvas, tNumRows, tNumCols, slotColor, slotBorderRadius, orderMap) {

            // load the image to get image dimensions
            const img_element = new Image()
            img_element.setAttribute("id", "puzzle_image")
            img_element.setAttribute("src", this.imgURL)
            img_element.onload = () => {

                this.imgWidth = img_element.naturalWidth
                this.imgHeight = img_element.naturalHeight

                const width = Math.floor(img_element.naturalWidth / this.numCols)
                const height = Math.floor(img_element.naturalHeight / this.numRows)
        
                let image = new Image()
                image.src = this.imgURL
        
                let puzzlePiecesArr = []
                for (let y = 0; y < this.numRows; ++y) {
                    for (let x = 0; x < this.numCols; ++x) {

                        // use canvas and context to cut the image into desired pieces and save them in an array
                        let canvas = document.createElement('canvas')
                        canvas.width = width
                        canvas.height = height

                        let context = canvas.getContext('2d')
                        context.drawImage(image, x * width, y * height, width, height, 0, 0, canvas.width, canvas.height)
                        
                        let newID = y * this.numCols + x

                        canvas.setAttribute("id", "piece_" + newID.toString())
                        canvas.setAttribute("draggable", "true")
                        canvas.ondragstart = () => { this.drag(event) }
                        canvas.style.borderRadius = slotBorderRadius
                        puzzlePiecesArr.push(canvas)
                        this.piecesDOM.push(canvas)
                    }
                }
                
                if (piecesTray !== null) {
                    this.displayGridTray(piecesTray, puzzlePiecesArr, tNumCols, tNumRows, slotColor, slotBorderRadius, orderMap)
                }
                else {
                    this.displayScrambleCanvas(canvas, puzzlePiecesArr, slotColor, slotBorderRadius, orderMap)
                }
            }
        }

        // create the main scramble canvas
        displayScrambleCanvas(canvas, puzzlePiecesArr, slotColor, slotBorderRadius, orderMap) {

            const width = Math.floor((this.imgWidth / this.numCols) * (this.trayParentWidth / this.imgWidth) - (this.gridGapSize * (this.numCols - 1)))
            const height = Math.floor((this.imgHeight / this.numRows) * (this.trayParentWidth / this.imgWidth) - (this.gridGapSize * (this.numRows - 1)))

            // create the canvas slots
            for (let y = 0; y < this.numRows; ++y) {
                for (let x = 0; x < this.numCols; ++x) {

                    // get the slot id
                    let newID = y * this.numCols + x

                    // create slot in object array
                    let slot = new Slot(newID, x + 1, y + 1, x + 2, y + 2)
                    this.canvasSlots.push(slot)

                    // create piece in object array
                    let piece = new Piece(newID, newID, null)
                    this.pieces.push(piece)

                    // create slot in DOM
                    let canvasSlot = document.createElement('div')
                    canvasSlot.setAttribute("class", "canvasScrambleSlots")
                    canvasSlot.setAttribute("id", "slot_" + newID.toString())
                    canvasSlot.ondrop = () => { this.drop(event) }
                    canvasSlot.ondragover = () => { this.allowDrop(event) }

                    canvasSlot.style.gridColumnStart = (x + 1).toString()
                    canvasSlot.style.gridColumnEnd = (x + 2).toString()
                    canvasSlot.style.gridRowStart = (y + 1).toString()
                    canvasSlot.style.gridRowEnd = (y + 2).toString()
                    canvasSlot.style.minWidth = width.toString() + "px"
                    canvasSlot.style.minHeight = height.toString() + "px"
                    canvasSlot.style.backgroundColor = slotColor
                    canvasSlot.style.borderRadius = slotBorderRadius

                    puzzlePiecesArr[orderMap[y][x]].style.height = "100%"
                    puzzlePiecesArr[orderMap[y][x]].style.width = "100%"

                    // place the image pieces onto the slots
                    canvasSlot.appendChild(puzzlePiecesArr[orderMap[y][x]])
                    this.canvas.appendChild(canvasSlot)
                    this.canvasSlotsDOM.push(canvasSlot)
                    
                }
            }

            // first check each piece for correctness
            for (let i = 0; i < this.numRows * this.numCols; ++i) {
                    this.checkDirectPieceCorrectness(this.canvasSlotsDOM[i], i, "initial")
            }
        }

        // create the tray slots for grid puzzles
        displayGridTray(piecesTray, puzzlePiecesArr, tNumCols, tNumRows, slotColor, slotBorderRadius, orderMap) {

            // get the height and width for each image fragment
            const originalPieceWidth = (this.imgWidth / this.numCols)
            const originalPieceHeight = (this.imgHeight / this.numRows)

            const heightOverWidth = originalPieceHeight / originalPieceWidth

            const trayPieceWidth = Math.floor((this.trayParentWidth - (this.trayGapSize * (tNumCols - 1))) / tNumCols)
            const trayPieceHeight = Math.floor(heightOverWidth * (this.trayParentWidth - (this.trayGapSize * (tNumCols - 1))) / tNumCols)
        
            // pieces tray slots
            for (let y = 0; y < tNumRows; ++y) {
                for (let x = 0; x < tNumCols; ++x) {

                    let newID = y * tNumCols + x

                    // create the tray slots
                    let slot = document.createElement('div')
                    slot.setAttribute("class", "traySlot")
                    slot.setAttribute("id", "tray_" + newID.toString())
                    slot.ondrop = () => { this.drop(event) }
                    slot.ondragover = () => { this.allowDrop(event) }

                    slot.style.gridColumnStart = (x + 1).toString()
                    slot.style.gridColumnEnd = (x + 2).toString()
                    slot.style.gridRowStart = (y + 1).toString()
                    slot.style.gridRowEnd = (y + 2).toString()
                    slot.style.minHeight = trayPieceHeight.toString() + "px"
                    slot.style.backgroundColor = slotColor
                    slot.style.borderRadius = slotBorderRadius

                    puzzlePiecesArr[orderMap[y][x]].style.height = "100%"
                    puzzlePiecesArr[orderMap[y][x]].style.width = "100%"

                    // place the image pieces onto the slots
                    slot.appendChild(puzzlePiecesArr[orderMap[y][x]])
                    piecesTray.appendChild(slot)
                    this.traySlotsDOM.push(slot)
                }
            }
        }    

        // check the piece's correctness for drop events
        checkPieceCorrectness(event) {

            // get the target slot and image piece
            const target_slot = event.target
            const target_slot_id = parseInt(target_slot.id.substring(5), 10)

            const child_piece = target_slot.firstElementChild
            const child_piece_id = parseInt(child_piece.id.substring(6), 10)

            let piece_info = null

            for (let i = 0; i < this.pieces.length; ++i) {
                if (this.pieces[i].piece_id === child_piece_id) {
                    piece_info = this.pieces[i]
                }
            }

            // determine if the piece is placed correctly
            if (piece_info === null) { console.log("not found") }
            else if (target_slot.id.substring(0, 4) === "tray") { piece_info.correct = false }
            else if (piece_info.linked_slot === target_slot_id) { piece_info.correct = true }
            else { piece_info.correct = false }
            
            // check if the puzzle has been completed
            let puzzleCompleted = true

            for (let i = 0; i < this.pieces.length; ++i) {
                if (this.pieces[i].correct === false) {
                    this.completed = false
                    puzzleCompleted = false
                }
            }

            if (puzzleCompleted) { this.completed = true }

            // create an event notifying the user of the puzzle's updated state
            const parentElement = this.canvasParentDOM

            const updateEvent = new CustomEvent('puzzleUpdated', { 
                detail: { pieceStatus: piece_info.correct, puzzleStatus: this.completed, targetSlotID: target_slot_id, action: "drop" } 
            })

            parentElement.dispatchEvent(updateEvent)
        }

        // check the piece's correctness for switch and initial events
        checkDirectPieceCorrectness(element, sequence, actionType) {

            // get the target slot and image piece
            const target_slot = element
            const target_slot_id = parseInt(target_slot.id.substring(5), 10)

            const child_piece = target_slot.firstElementChild
            const child_piece_id = parseInt(child_piece.id.substring(6), 10)

            let piece_info = null

            for (let i = 0; i < this.pieces.length; ++i) {
                if (this.pieces[i].piece_id === child_piece_id) {
                    piece_info = this.pieces[i]
                }
            }

            // determine if the piece is placed correctly
            if (piece_info === null) { console.log("not found") }
            else if (target_slot.id.substring(0, 4) === "tray") { piece_info.correct = false }
            else if (piece_info.linked_slot === target_slot_id) { piece_info.correct = true }
            else { piece_info.correct = false }
            
            // check if the puzzle has been completed
            let puzzleCompleted = true

            for (let i = 0; i < this.pieces.length; ++i) {
                if (this.pieces[i].correct === false) {
                    this.completed = false
                    puzzleCompleted = false
                }
            }

            if (puzzleCompleted) { this.completed = true }

            // create an event notifying the user of the puzzle's updated state
            const parentElement = this.canvasParentDOM

            const updateEvent = new CustomEvent('puzzleUpdated', { 
                detail: { pieceStatus: piece_info.correct, puzzleStatus: this.completed, targetSlotID: target_slot_id, action: actionType + sequence.toString() } 
            })

            parentElement.dispatchEvent(updateEvent)
        }

        // check if the passed in orderMap is valid
        checkOrderMapValidity(orderMap) {

            let tempArray = []
            if (this.type !== "scramble")
            {
                for (let i = 0; i < this.tNumRows; i++) {
                    for (let j = 0; j < this.tNumCols; j++) {
                        tempArray.push(orderMap[i][j])
                    }
                }
            }
            else {
                for (let i = 0; i < this.numRows; i++) {
                    for (let j = 0; j < this.numCols; j++) {
                        tempArray.push(orderMap[i][j])
                    }
                }
            }

            console.log(tempArray)
            
            tempArray.sort((a, b) => a - b)

            for (let k = 0; k < tempArray.length; k++) {
                if (tempArray[k] !== k) {
                    return false;
                }
            }
            return true;
        }

        // handle drag events
        drag(event) {

            let dataHolder = { id: event.target.id, parent: event.target.parentElement.id }
            event.dataTransfer.setData("text/plain", JSON.stringify(dataHolder));
        }
        
        // prepare an element to accept drop
        allowDrop(event) {
            event.preventDefault()
        }
        
        // handle drop events
        drop(event) {

            event.preventDefault()
            let data = event.dataTransfer.getData("text/plain")
            data = JSON.parse(data)
            let id = data.id
            let originalParentID = data.parent
            let originalParent = null

            // get the image's original parent
            if (originalParentID.substring(0, 4) === "tray") {
                originalParent = (this.traySlotsDOM.filter((traySlot) => traySlot.id === originalParentID))[0]
            }
            else {
                originalParent = (this.canvasSlotsDOM.filter((canvasSlot) => canvasSlot.id === originalParentID))[0]
            }

            // get the image itself
            let element = null

            for (let i = 0; i < this.piecesDOM.length; i++) {
                if (this.piecesDOM[i].id === id) {
                    element = this.piecesDOM[i]
                }
            }

            if (element !== null && event.target.id.substring(0, 4) !== "tray" && event.target.id.substring(0, 4) !== "slot") {

                // switch action, place target image into target slot, and place image already
                // in target slot into target image's parent element
                const targetParent = event.target.parentElement
                targetParent.removeChild(event.target)
                targetParent.appendChild(element)
                originalParent.appendChild(event.target)
                this.checkDirectPieceCorrectness(targetParent, 1, "switch")
                this.checkDirectPieceCorrectness(originalParent, 2, "switch")
            }
            else if (element !== null) {

                // drop event, place target image into target slot
                event.target.appendChild(element)
                this.checkPieceCorrectness(event)
            }
            else {
                
                // cannot find piece
                console.log("cannot find piece, what is going on?")
            }
        }

    }

    // piece class
    class Piece {
        constructor(piece_id, linked_slot, imgURL) {
            this.piece_id = piece_id
            this.linked_slot = linked_slot
            this.imgURL = imgURL
            this.correct = false
        }
    }

    // slot class
    class Slot {
        constructor(slot_id, top_left_x, top_left_y, bottom_right_x, bottom_right_y) {
            this.slot_id = slot_id
            this.top_left_x = top_left_x
            this.top_left_y = top_left_y
            this.bottom_right_x = bottom_right_x
            this.bottom_right_y = bottom_right_y
        }
    }

    global.ImagePuzzle = global.ImagePuzzle || ImagePuzzle

})(window, window.document);

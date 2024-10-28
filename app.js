document.addEventListener("DOMContentLoaded", () => {
    const bingoCard = document.getElementById("bingoCard");
    const bingoTitle = document.getElementById("bingoTitle");
    const gallery = document.getElementById("gallery");
    const colorPicker = document.getElementById("colorPicker");

    // Load the initial bingo card with default colors
    loadBingoCard();

    // Event listener for color picker to change color of all crossed cells
    colorPicker.addEventListener("input", (event) => {
        setSelectedCellColor(event.target.value);
    });

    function loadBingoCard() {
        bingoCard.innerHTML = ''; // Clear any existing cells

        fetch('phrases.txt')
            .then(response => response.text())
            .then(text => {
                const phrases = text.split('\n').map(line => line.trim()).filter(line => line !== "");
                phrases.sort(() => Math.random() - 0.5);

                for (let i = 0; i < 25; i++) {
                    const cell = document.createElement("div");
                    cell.classList.add("bingo-cell");

                    if (i === 12) {
                        cell.textContent = "FREE";
                        cell.classList.add("center-cell", "crossed");
                        cell.style.backgroundColor = "#4caf50"; // Set initial color of FREE cell
                    } else {
                        cell.textContent = phrases[i];
                        cell.style.backgroundColor = "white"; // Set default color to white for other cells
                    }

                    cell.addEventListener("click", () => {
                        // Toggle crossed class for all cells, including FREE cell
                        cell.classList.toggle("crossed");

                        // Change color if the cell is selected (crossed)
                        if (cell.classList.contains("crossed")) {
                            cell.style.backgroundColor = colorPicker.value;
                        } else {
                            cell.style.backgroundColor = i === 12 ? "#4caf50" : "white"; // Reset color
                        }

                        checkBingo();
                    });

                    bingoCard.appendChild(cell);
                }
            })
            .catch(error => console.error('Error loading phrases:', error));
    }

    function setSelectedCellColor(color) {
        // Update color of all cells that are crossed, including the FREE cell
        const crossedCells = document.querySelectorAll(".bingo-cell.crossed");
        crossedCells.forEach(cell => {
            cell.style.backgroundColor = color;
        });
    }

    function checkBingo() {
        const cells = Array.from(bingoCard.children);
        const isBingo = checkRows(cells) || checkColumns(cells) || checkDiagonals(cells);

        if (isBingo) {
            bingoTitle.style.display = 'block';
            captureScreenshot();
        }
    }

    function checkRows(cells) {
        for (let i = 0; i < 5; i++) {
            if (cells.slice(i * 5, i * 5 + 5).every(cell => cell.classList.contains('crossed'))) {
                return true;
            }
        }
        return false;
    }

    function checkColumns(cells) {
        for (let i = 0; i < 5; i++) {
            if ([0, 5, 10, 15, 20].map(j => cells[i + j]).every(cell => cell.classList.contains('crossed'))) {
                return true;
            }
        }
        return false;
    }

    function checkDiagonals(cells) {
        const diagonal1 = [0, 6, 12, 18, 24].every(i => cells[i].classList.contains('crossed'));
        const diagonal2 = [4, 8, 12, 16, 20].every(i => cells[i].classList.contains('crossed'));
        return diagonal1 || diagonal2;
    }

    function captureScreenshot() {
        const titleOverlay = document.getElementById("titleOverlay");
        titleOverlay.style.display = "block"; // Show title overlay
    
        html2canvas(document.getElementById('bingoCardContainer')).then(canvas => {
            canvas.toBlob(blob => {
                const img = new Image();
                img.src = URL.createObjectURL(blob);
                img.alt = 'Winning Bingo Card Screenshot';
                img.onclick = () => copyToClipboard(blob); // Copy to clipboard on click
    
                gallery.appendChild(img);
    
                titleOverlay.style.display = "none"; // Hide title overlay after screenshot
            });
        });
    }
    

    function copyToClipboard(blob) {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item])
            .then(() => alert("Screenshot copied to clipboard!"))
            .catch(err => alert("Failed to copy: " + err));
    }

    window.refreshCard = () => {
        bingoTitle.style.display = 'none';
        loadBingoCard(); // Reload the bingo card only
    };
});

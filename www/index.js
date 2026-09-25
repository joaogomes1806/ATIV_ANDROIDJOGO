/* ==========================================================
   TRILHA SELVAGEM
   JOGO COMPLETO
   JavaScript puro
   SEM BIBLIOTECAS
   FUNCIONA OFFLINE
   ========================================================== */

(function () {

    "use strict";


    /* ======================================================
       1. CANVAS
       ====================================================== */

    var canvas = document.getElementById("game");

    var ctx = canvas.getContext("2d");

    var DPR =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    function resize() {

        canvas.width =
            window.innerWidth * DPR;

        canvas.height =
            window.innerHeight * DPR;

        canvas.style.width =
            window.innerWidth + "px";

        canvas.style.height =
            window.innerHeight + "px";


        ctx.setTransform(
            DPR,
            0,
            0,
            DPR,
            0,
            0
        );
    }


    window.addEventListener(
        "resize",
        resize
    );


    resize();


    /* ======================================================
       2. CONFIGURAÇÃO
       ====================================================== */

    var TILE = 64;

    var SPEED_MULT = 0.6;

    var ROWS_PER_PHASE = 16;

    var WIN_ROW = 48;


    /* ======================================================
       3. FASES
       ====================================================== */

    var PHASES = [

        /* --------------------------------------------------
           FASE 1 - LOBO
           -------------------------------------------------- */

        {
            animal: "LOBO",

            icon: "🐺",

            title: "O LOBO",

            description:
                "Atravesse a cidade financeira e encontre a floresta neon.",

            biomes: [

                {
                    name: "CIDADE FINANCEIRA",

                    sky: "#07131f",

                    grass: [
                        "#102a35",
                        "#153744"
                    ],

                    road: "#20232b",

                    water: "#006d91",

                    rail: "#252b36",

                    obstacle: "#21a67a",

                    trunk: "#402b20",

                    rock: "#52616b",

                    accent: "#00e5ff"
                },

                {
                    name: "FLORESTA NEON",

                    sky: "#10051b",

                    grass: [
                        "#172e29",
                        "#1d4036"
                    ],

                    road: "#1c1524",

                    water: "#007b78",

                    rail: "#29202f",

                    obstacle: "#b72eff",

                    trunk: "#38221c",

                    rock: "#493a57",

                    accent: "#ff2ee6"
                }
            ]
        },


        /* --------------------------------------------------
           FASE 2 - ORNITORRINCO
           -------------------------------------------------- */

        {
            animal: "ORNITORRINCO",

            icon: "🦆",

            title: "O ORNITORRINCO",

            description:
                "Desça pelos rios e atravesse o pântano até a grande cachoeira.",

            biomes: [

                {
                    name: "RIO SELVAGEM",

                    sky: "#06232a",

                    grass: [
                        "#164d3e",
                        "#1d604a"
                    ],

                    road: "#304138",

                    water: "#007f8f",

                    rail: "#304e49",

                    obstacle: "#42a85f",

                    trunk: "#5b3b20",

                    rock: "#6f8c8b",

                    accent: "#00ffc8"
                },

                {
                    name: "PÂNTANO",

                    sky: "#071b16",

                    grass: [
                        "#1a3827",
                        "#244a30"
                    ],

                    road: "#263329",

                    water: "#125d52",

                    rail: "#26382d",

                    obstacle: "#77b82a",

                    trunk: "#3b291c",

                    rock: "#536653",

                    accent: "#a8ff00"
                },

                {
                    name: "GRANDE CACHOEIRA",

                    sky: "#061827",

                    grass: [
                        "#154257",
                        "#1c5268"
                    ],

                    road: "#293b44",

                    water: "#008fc4",

                    rail: "#294858",

                    obstacle: "#43d9ff",

                    trunk: "#46301e",

                    rock: "#66818c",

                    accent: "#43d9ff"
                }
            ]
        },


        /* --------------------------------------------------
           FASE 3 - SARUÊ
           -------------------------------------------------- */

        {
            animal: "SARUÊ",

            icon: "🦨",

            title: "O SARUÊ",

            description:
                "Passe pelos becos da cidade durante a noite e chegue ao parque.",

            biomes: [

                {
                    name: "BECOS DA CIDADE",

                    sky: "#090b17",

                    grass: [
                        "#1b202a",
                        "#242b36"
                    ],

                    road: "#11151c",

                    water: "#30334a",

                    rail: "#202433",

                    obstacle: "#65707d",

                    trunk: "#33251e",

                    rock: "#555d68",

                    accent: "#b8c7ff"
                },

                {
                    name: "PARQUE NOTURNO",

                    sky: "#070d12",

                    grass: [
                        "#102c25",
                        "#164034"
                    ],

                    road: "#171c20",

                    water: "#075f5b",

                    rail: "#1c2b2a",

                    obstacle: "#4caf50",

                    trunk: "#35251b",

                    rock: "#4c5c57",

                    accent: "#7dff8a"
                },

                {
                    name: "CENTRO DA CIDADE",

                    sky: "#100815",

                    grass: [
                        "#25202d",
                        "#30283b"
                    ],

                    road: "#17141d",

                    water: "#49295e",

                    rail: "#292033",

                    obstacle: "#ff3d81",

                    trunk: "#342019",

                    rock: "#63536b",

                    accent: "#ff3d81"
                }
            ]
        }

    ];


    /* ======================================================
       4. VARIÁVEIS
       ====================================================== */

    var currentPhase = 0;

    var laneTypes = {};

    var player = null;

    var state = "menu";

    var score = 0;

    var best = 0;

    var scrollY = 0;

    var targetScrollY = 0;

    var lastTime = 0;

    var cause = "";


    /* ======================================================
       5. ELEMENTOS
       ====================================================== */

    var hud =
        document.getElementById("hud");

    var scoreElement =
        document.getElementById("score");

    var animalLabel =
        document.getElementById("animal-label");

    var phaseLabel =
        document.getElementById("phase-label");

    var biomeLabel =
        document.getElementById("biome-label");


    /* ======================================================
       6. FASE ATUAL
       ====================================================== */

    function getPhase() {

        return PHASES[currentPhase];

    }


    /* ======================================================
       7. BIOMA ATUAL
       ====================================================== */

    function getBiome(row) {

        var phase =
            getPhase();

        var biomeIndex =
            Math.min(
                Math.floor(
                    (row % ROWS_PER_PHASE) /
                    6
                ),
                phase.biomes.length - 1
            );

        return phase.biomes[biomeIndex];
    }


    /* ======================================================
       8. MOSTRAR FASE
       ====================================================== */

    function showPhaseScreen() {

        var phase =
            getPhase();


        document
            .getElementById("phase-animal-icon")
            .textContent =
            phase.icon;


        document
            .getElementById("phase-title")
            .textContent =
            "FASE " +
            (currentPhase + 1);


        document
            .getElementById("phase-animal-name")
            .textContent =
            phase.title;


        document
            .getElementById("phase-description")
            .textContent =
            phase.description;


        document
            .getElementById("phase-screen")
            .classList
            .remove("hidden");


        setTimeout(
            function () {

                document
                    .getElementById("phase-screen")
                    .classList
                    .add("hidden");


                resetGame();

            },
            1700
        );
    }


    /* ======================================================
       9. GERAR FAIXA
       ====================================================== */

    function genLane(row) {

        if (laneTypes[row]) {

            return laneTypes[row];

        }


        if (row <= 0) {

            laneTypes[row] = {

                type: "grass",

                obstacles: []

            };

            return laneTypes[row];

        }


        var random =
            Math.random();


        var previous =
            laneTypes[row - 1]
                ? laneTypes[row - 1].type
                : "grass";


        var previousTwo =
            laneTypes[row - 2]
                ? laneTypes[row - 2].type
                : "grass";


        var type;


        /* ==================================================
           FASE DO ORNITORRINCO
           MAIS ÁGUA
           ================================================== */

        if (currentPhase === 1) {

            if (row % 7 === 0) {

                type = "grass";

            } else if (random < 0.42) {

                type = "water";

            } else if (random < 0.64) {

                type = "grass";

            } else if (random < 0.83) {

                type = "road";

            } else {

                type = "rail";
            }

        }


        /* ==================================================
           FASE DO SARUÊ
           MAIS ESTRADAS
           ================================================== */

        else if (currentPhase === 2) {

            if (row % 7 === 0) {

                type = "grass";

            } else if (random < 0.44) {

                type = "road";

            } else if (random < 0.59) {

                type = "grass";

            } else if (random < 0.73) {

                type = "water";

            } else {

                type = "rail";
            }

        }


        /* ==================================================
           FASE DO LOBO
           ================================================== */

        else {

            if (row % 7 === 0) {

                type = "grass";

            } else if (
                previous !== "grass" &&
                previousTwo !== "grass"
            ) {

                type = "grass";

            } else if (random < 0.35) {

                type = "road";

            } else if (random < 0.50) {

                type = "water";

            } else if (random < 0.60) {

                type = "rail";

            } else {

                type = "grass";
            }

        }


        var lane = {

            type: type,

            obstacles: []

        };


        /* ==================================================
           GRAMA
           ================================================== */

        if (type === "grass") {

            var amount =
                Math.floor(
                    Math.random() * 3
                );


            for (
                var i = 0;
                i < amount;
                i++
            ) {

                var column =
                    Math.floor(
                        Math.random() * 13
                    ) - 6;


                if (
                    Math.abs(column) <= 1
                ) {

                    continue;

                }


                lane.obstacles.push({

                    col: column,

                    kind:
                        Math.random() < 0.55
                            ? "tree"
                            : "rock"

                });

            }

        }


        /* ==================================================
           ESTRADA
           ================================================== */

        else if (type === "road") {

            lane.dir =
                Math.random() < 0.5
                    ? 1
                    : -1;


            lane.speed =
                0.12 +
                Math.random() * 0.06;


            lane.gap =
                3.6 +
                Math.random() * 1.8;


            lane.offset =
                Math.random() * 10;


            lane.vType =
                Math.random() < 0.3
                    ? "truck"
                    : "car";


            lane.color = [

                "#ff3864",

                "#00c8ff",

                "#ffd166",

                "#8b5cf6",

                "#00e5a8",

                "#ffffff"

            ][
                Math.floor(
                    Math.random() * 6
                )
            ];

        }


        /* ==================================================
           ÁGUA
           ================================================== */

        else if (type === "water") {

            lane.dir =
                Math.random() < 0.5
                    ? 1
                    : -1;


            lane.speed =
                0.08 +
                Math.random() * 0.04;


            lane.gap =
                3.0 +
                Math.random();


            lane.offset =
                Math.random() * 10;


            lane.logLen =
                2 +
                Math.floor(
                    Math.random() * 2
                );

        }


        /* ==================================================
           TRILHO
           ================================================== */

        else if (type === "rail") {

            lane.warnTimer = 0;

            lane.trainActive = false;

            lane.cycle =
                220 +
                Math.random() * 100;

            lane.timer =
                Math.random() *
                lane.cycle;

        }


        laneTypes[row] =
            lane;


        return lane;

    }


    /* ======================================================
       10. RESETAR JOGO
       ====================================================== */

    function resetGame() {

        laneTypes = {};


        player = {

            row: 0,

            col: 0,

            dir: "up",

            hop: 0,

            hopMax: 8,

            alive: true

        };


        scrollY = 0;

        targetScrollY = 0;

        score = 0;

        state = "playing";

        cause = "";


        genLane(0);

        genLane(1);

        genLane(2);


        scoreElement.textContent =
            "0";


        animalLabel.textContent =
            getPhase().animal;


        phaseLabel.textContent =
            currentPhase + 1;


        updateBiomeLabel();

    }


    /* ======================================================
       11. BIOMA
       ====================================================== */

    function updateBiomeLabel() {

        biomeLabel.textContent =
            getBiome(player.row).name;

    }


    /* ======================================================
       12. MOVIMENTO
       ====================================================== */

    function tryMove(direction) {

        if (
            state !== "playing" ||
            player.hop > 0
        ) {

            return;

        }


        var newRow =
            player.row;


        var newCol =
            player.col;


        if (direction === "up") {

            newRow++;

        }

        else if (direction === "down") {

            newRow--;

        }

        else if (direction === "left") {

            newCol--;

        }

        else if (direction === "right") {

            newCol++;

        }


        if (
            newCol < -6 ||
            newCol > 6
        ) {

            return;

        }


        if (newRow < 0) {

            return;

        }


        var lane =
            genLane(newRow);


        /* ==================================================
           OBSTÁCULOS
           ================================================== */

        if (
            lane.type === "grass"
        ) {

            for (
                var i = 0;
                i < lane.obstacles.length;
                i++
            ) {

                if (
                    lane.obstacles[i].col ===
                    newCol
                ) {

                    return;

                }

            }

        }


        player.dir =
            direction;


        player.fromRow =
            player.row;


        player.fromCol =
            player.col;


        player.row =
            newRow;


        player.col =
            newCol;


        player.hop =
            player.hopMax;


        if (
            newRow > score
        ) {

            score =
                newRow;


            scoreElement.textContent =
                score;

        }


        genLane(newRow + 1);

        genLane(newRow + 2);

        genLane(newRow + 3);


        updateBiomeLabel();


        /* ==================================================
           FIM DA FASE
           ================================================== */

        if (
            newRow >= WIN_ROW
        ) {

            finishPhase();

        }

    }


    /* ======================================================
       13. TECLADO
       ====================================================== */

    window.addEventListener(
        "keydown",
        function (event) {

            var key =
                event.key.toLowerCase();


            if (
                key === "arrowup" ||
                key === "w"
            ) {

                tryMove("up");

            }

            else if (
                key === "arrowdown" ||
                key === "s"
            ) {

                tryMove("down");

            }

            else if (
                key === "arrowleft" ||
                key === "a"
            ) {

                tryMove("left");

            }

            else if (
                key === "arrowright" ||
                key === "d"
            ) {

                tryMove("right");

            }

        }
    );


    /* ======================================================
       14. BOTÕES MOBILE
       ====================================================== */

    document
        .querySelectorAll(".dbtn")
        .forEach(
            function (button) {

                button.addEventListener(
                    "touchstart",
                    function (event) {

                        event.preventDefault();

                        tryMove(
                            button.getAttribute(
                                "data-dir"
                            )
                        );

                    },
                    {
                        passive: false
                    }
                );


                button.addEventListener(
                    "click",
                    function () {

                        tryMove(
                            button.getAttribute(
                                "data-dir"
                            )
                        );

                    }
                );

            }
        );


    /* ======================================================
       15. SWIPE
       ====================================================== */

    var touchStartX = 0;

    var touchStartY = 0;

    var touchActive = false;


    canvas.addEventListener(
        "touchstart",
        function (event) {

            touchActive = true;


            touchStartX =
                event.touches[0].clientX;


            touchStartY =
                event.touches[0].clientY;

        },
        {
            passive: true
        }
    );


    canvas.addEventListener(
        "touchend",
        function (event) {

            if (!touchActive) {

                return;

            }


            touchActive = false;


            var dx =
                event.changedTouches[0].clientX -
                touchStartX;


            var dy =
                event.changedTouches[0].clientY -
                touchStartY;


            var absX =
                Math.abs(dx);


            var absY =
                Math.abs(dy);


            if (
                Math.max(absX, absY) < 24
            ) {

                return;

            }


            if (absX > absY) {

                tryMove(
                    dx > 0
                        ? "right"
                        : "left"
                );

            }

            else {

                tryMove(
                    dy > 0
                        ? "down"
                        : "up"
                );

            }

        },
        {
            passive: true
        }
    );


    /* ======================================================
       16. VERIFICAR TORA
       ====================================================== */

    function getLogAt(
        lane,
        col
    ) {

        var position =
            col - lane.offset;


        var remainder =
            (
                (
                    position %
                    lane.gap
                ) +
                lane.gap
            ) %
            lane.gap;


        return (
            remainder <
            lane.logLen
        );

    }


    /* ======================================================
       17. VEÍCULO
       ====================================================== */

    function isHitByVehicle(
        lane,
        col
    ) {

        var position =
            col - lane.offset;


        var remainder =
            (
                (
                    position %
                    lane.gap
                ) +
                lane.gap
            ) %
            lane.gap;


        var width =
            lane.vType === "truck"
                ? 1.8
                : 1.0;


        return (
            remainder <
            width
        );

    }


    /* ======================================================
       18. DERROTA
       ====================================================== */

    function triggerLose(message) {

        if (
            state !== "playing"
        ) {

            return;

        }


        state = "lose";

        player.alive = false;

        cause = message;


        setTimeout(
            function () {

                document
                    .getElementById(
                        "cause-text"
                    )
                    .textContent =
                    cause;


                document
                    .getElementById(
                        "final-score-lose"
                    )
                    .textContent =
                    "Distância: " +
                    score +
                    " | Recorde: " +
                    best;


                document
                    .getElementById(
                        "lose-screen"
                    )
                    .classList
                    .remove("hidden");

            },
            300
        );

    }


    /* ======================================================
       19. TERMINAR FASE
       ====================================================== */

    function finishPhase() {

        if (
            state !== "playing"
        ) {

            return;

        }


        state = "phaseComplete";


        if (
            score > best
        ) {

            best = score;

        }


        if (
            currentPhase <
            PHASES.length - 1
        ) {

            currentPhase++;

            showPhaseScreen();

        }

        else {

            showFinalVictory();

        }

    }


    /* ======================================================
       20. VITÓRIA FINAL
       ====================================================== */

    function showFinalVictory() {

        state = "win";


        document
            .getElementById(
                "final-score-win"
            )
            .textContent =
            "Você completou as três fases! Recorde: " +
            best;


        document
            .getElementById(
                "win-screen"
            )
            .classList
            .remove("hidden");

    }


    /* ======================================================
       21. ATUALIZAÇÃO
       ====================================================== */

    function update(deltaTime) {

        if (!player) {

            return;

        }


        if (
            player.hop > 0
        ) {

            player.hop--;

        }


        targetScrollY =
            player.row *
            TILE;


        scrollY +=
            (
                targetScrollY -
                scrollY
            ) *
            0.18;


        if (
            state !== "playing"
        ) {

            return;

        }


        var topRow =
            Math.ceil(
                player.row +
                window.innerHeight /
                TILE
            ) + 3;


        for (
            var row = 0;
            row <= topRow;
            row++
        ) {

            genLane(row);

        }


        /* ==================================================
           OBJETOS
           ================================================== */

        for (
            var rowKey in laneTypes
        ) {

            var row =
                parseInt(rowKey);


            var lane =
                laneTypes[row];


            if (
                lane.type === "road"
            ) {

                lane.offset +=
                    lane.speed *
                    lane.dir *
                    SPEED_MULT *
                    (
                        deltaTime /
                        16.67
                    );

            }


            else if (
                lane.type === "water"
            ) {

                lane.offset +=
                    lane.speed *
                    lane.dir *
                    SPEED_MULT *
                    (
                        deltaTime /
                        16.67
                    );


                if (
                    row === player.row &&
                    player.hop <= 0
                ) {

                    var onLog =
                        getLogAt(
                            lane,
                            player.col
                        );


                    if (!onLog) {

                        triggerLose(
                            "A correnteza levou o animal!"
                        );

                    }

                }

            }


            else if (
                lane.type === "rail"
            ) {

                lane.timer +=
                    deltaTime /
                    16.67;


                if (
                    lane.timer >
                    lane.cycle
                ) {

                    lane.timer = 0;

                }


                lane.trainActive =
                    lane.timer >
                    lane.cycle - 55;

            }

        }


        /* ==================================================
           CARROS
           ================================================== */

        var currentLane =
            laneTypes[player.row];


        if (
            currentLane &&
            currentLane.type === "road" &&
            player.hop <= 0
        ) {

            if (
                isHitByVehicle(
                    currentLane,
                    player.col
                )
            ) {

                triggerLose(
                    "Um veículo apareceu no caminho!"
                );

            }

        }


        /* ==================================================
           TREM
           ================================================== */

        if (
            currentLane &&
            currentLane.type === "rail" &&
            player.hop <= 0
        ) {

            if (
                currentLane.trainActive
            ) {

                triggerLose(
                    "O trem passou pela trilha!"
                );

            }

        }


        /* ==================================================
           LIMITE
           ================================================== */

        if (
            player.col < -6.4 ||
            player.col > 6.4
        ) {

            triggerLose(
                "O animal saiu do caminho!"
            );

        }

    }


    /* ======================================================
       22. POSIÇÃO DA FAIXA
       ====================================================== */

    function laneScreenY(row) {

        return (
            window.innerHeight -
            (
                row * TILE -
                scrollY
            ) -
            TILE * 1.5
        );

    }


    /* ======================================================
       23. FUNDO
       ====================================================== */

    function drawBackground(biome) {

        ctx.fillStyle =
            biome.sky;


        ctx.fillRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );


        /* --------------------------------------------------
           LUA
           -------------------------------------------------- */

        if (
            currentPhase === 2
        ) {

            ctx.fillStyle =
                "rgba(255,255,220,.85)";


            ctx.beginPath();


            ctx.arc(
                window.innerWidth * 0.82,
                100,
                28,
                0,
                Math.PI * 2
            );


            ctx.fill();


            /* Estrelas */

            ctx.fillStyle =
                "rgba(255,255,255,.5)";


            for (
                var i = 0;
                i < 35;
                i++
            ) {

                var x =
                    (
                        i * 97
                    ) %
                    window.innerWidth;


                var y =
                    (
                        i * 47
                    ) %
                    230;


                ctx.fillRect(
                    x,
                    y,
                    2,
                    2
                );

            }

        }


        /* --------------------------------------------------
           SOL / BRILHO DO RIO
           -------------------------------------------------- */

        if (
            currentPhase === 1
        ) {

            var gradient =
                ctx.createRadialGradient(
                    window.innerWidth * 0.75,
                    100,
                    5,
                    window.innerWidth * 0.75,
                    100,
                    160
                );


            gradient.addColorStop(
                0,
                "rgba(0,255,210,.22)"
            );


            gradient.addColorStop(
                1,
                "rgba(0,255,210,0)"
            );


            ctx.fillStyle =
                gradient;


            ctx.fillRect(
                0,
                0,
                window.innerWidth,
                300
            );

        }

    }


    /* ======================================================
       24. DESENHAR FAIXA
       ====================================================== */

    function drawLane(row) {

        var lane =
            genLane(row);


        var biome =
            getBiome(row);


        var y =
            laneScreenY(row);


        if (
            y < -TILE ||
            y >
            window.innerHeight + TILE
        ) {

            return;

        }


        var centerX =
            window.innerWidth / 2;


        /* ==================================================
           GRAMA
           ================================================== */

        if (
            lane.type === "grass"
        ) {

            ctx.fillStyle =
                row % 2 === 0
                    ? biome.grass[0]
                    : biome.grass[1];


            ctx.fillRect(
                0,
                y,
                window.innerWidth,
                TILE
            );


            /* Pequenas folhas */

            ctx.fillStyle =
                "rgba(255,255,255,.06)";


            for (
                var grassX = 0;
                grassX <
                window.innerWidth;
                grassX += 35
            ) {

                ctx.fillRect(
                    grassX +
                    (row * 11) % 20,
                    y + 15,
                    3,
                    8
                );

            }

        }


        /* ==================================================
           ESTRADA
           ================================================== */

        else if (
            lane.type === "road"
        ) {

            ctx.fillStyle =
                biome.road;


            ctx.fillRect(
                0,
                y,
                window.innerWidth,
                TILE
            );


            ctx.fillStyle =
                "rgba(255,255,255,.35)";


            for (
                var roadX = -30;
                roadX <
                window.innerWidth + 30;
                roadX += 40
            ) {

                ctx.fillRect(
                    roadX,
                    y + TILE / 2 - 2,
                    22,
                    4
                );

            }

        }


        /* ==================================================
           ÁGUA
           ================================================== */

        else if (
            lane.type === "water"
        ) {

            ctx.fillStyle =
                biome.water;


            ctx.fillRect(
                0,
                y,
                window.innerWidth,
                TILE
            );


            ctx.fillStyle =
                "rgba(255,255,255,.18)";


            for (
                var waterX = 0;
                waterX <
                window.innerWidth;
                waterX += 42
            ) {

                ctx.fillRect(
                    waterX +
                    ((row * 13) % 40),
                    y + 18,
                    20,
                    3
                );

            }

        }


        /* ==================================================
           TRILHOS
           ================================================== */

        else if (
            lane.type === "rail"
        ) {

            ctx.fillStyle =
                biome.grass[0];


            ctx.fillRect(
                0,
                y,
                window.innerWidth,
                TILE
            );


            ctx.fillStyle =
                biome.rail;


            ctx.fillRect(
                0,
                y + 22,
                window.innerWidth,
                20
            );


            ctx.fillStyle =
                "#b99b67";


            for (
                var railX = 0;
                railX <
                window.innerWidth;
                railX += 27
            ) {

                ctx.fillRect(
                    railX,
                    y + 18,
                    6,
                    28
                );

            }

        }


        /* ==================================================
           ÁRVORES E PEDRAS
           ================================================== */

        if (
            lane.type === "grass"
        ) {

            lane.obstacles.forEach(
                function (obstacle) {

                    var x =
                        centerX +
                        obstacle.col *
                        TILE;


                    if (
                        obstacle.kind === "tree"
                    ) {

                        ctx.fillStyle =
                            biome.trunk;


                        ctx.fillRect(
                            x - 5,
                            y + 27,
                            10,
                            28
                        );


                        ctx.fillStyle =
                            biome.obstacle;


                        ctx.beginPath();


                        ctx.arc(
                            x,
                            y + 25,
                            23,
                            0,
                            Math.PI * 2
                        );


                        ctx.fill();


                        /* Copa menor */

                        ctx.beginPath();


                        ctx.arc(
                            x - 10,
                            y + 33,
                            15,
                            0,
                            Math.PI * 2
                        );


                        ctx.fill();

                    }


                    else {

                        ctx.fillStyle =
                            biome.rock;


                        ctx.beginPath();


                        ctx.ellipse(
                            x,
                            y + 42,
                            21,
                            15,
                            0,
                            0,
                            Math.PI * 2
                        );


                        ctx.fill();

                    }

                }
            );

        }


        /* ==================================================
           CARROS
           ================================================== */

        if (
            lane.type === "road"
        ) {

            var period =
                lane.gap;


            for (
                var column = -8;
                column <= 8;
                column++
            ) {

                var position =
                    column -
                    lane.offset;


                var remainder =
                    (
                        (
                            position %
                            period
                        ) +
                        period
                    ) %
                    period;


                var width =
                    lane.vType === "truck"
                        ? 1.8
                        : 1.0;


                if (
                    remainder < width
                ) {

                    var vehicleX =
                        centerX +
                        column * TILE -
                        remainder * TILE;


                    drawVehicle(
                        vehicleX,
                        y,
                        lane,
                        width
                    );

                }

            }

        }


        /* ==================================================
           TORAS
           ================================================== */

        if (
            lane.type === "water"
        ) {

            for (
                var columnLog = -8;
                columnLog <= 8;
                columnLog++
            ) {

                var logPosition =
                    columnLog -
                    lane.offset;


                var logRemainder =
                    (
                        (
                            logPosition %
                            lane.gap
                        ) +
                        lane.gap
                    ) %
                    lane.gap;


                if (
                    logRemainder <
                    lane.logLen
                ) {

                    var logX =
                        centerX +
                        columnLog * TILE -
                        logRemainder * TILE;


                    ctx.fillStyle =
                        "#80502b";


                    ctx.fillRect(
                        logX,
                        y + 20,
                        TILE *
                        lane.logLen,
                        22
                    );


                    ctx.fillStyle =
                        "rgba(255,255,255,.18)";


                    ctx.fillRect(
                        logX + 8,
                        y + 27,
                        TILE *
                        lane.logLen -
                        16,
                        3
                    );

                }

            }

        }


        /* ==================================================
           TREM
           ================================================== */

        if (
            lane.type === "rail" &&
            lane.trainActive
        ) {

            ctx.fillStyle =
                "#b52b38";


            ctx.fillRect(
                0,
                y + 8,
                window.innerWidth,
                48
            );


            ctx.fillStyle =
                "rgba(255,255,255,.25)";


            for (
                var trainX = 10;
                trainX <
                window.innerWidth;
                trainX += 65
            ) {

                ctx.fillRect(
                    trainX,
                    y + 17,
                    34,
                    28
                );

            }

        }

    }


    /* ======================================================
       25. VEÍCULO
       ====================================================== */

    function drawVehicle(
        x,
        y,
        lane,
        width
    ) {

        var w =
            TILE *
            width *
            0.92;


        var h =
            TILE *
            0.62;


        ctx.fillStyle =
            lane.color;


        roundRect(
            x,
            y + 12,
            w,
            h,
            9
        );


        ctx.fill();


        ctx.fillStyle =
            "rgba(255,255,255,.35)";


        roundRect(
            x + 8,
            y + 18,
            w * 0.48,
            h * 0.4,
            5
        );


        ctx.fill();

    }


    /* ======================================================
       26. RETÂNGULO ARREDONDADO
       ====================================================== */

    function roundRect(
        x,
        y,
        width,
        height,
        radius
    ) {

        ctx.beginPath();


        ctx.moveTo(
            x + radius,
            y
        );


        ctx.arcTo(
            x + width,
            y,
            x + width,
            y + height,
            radius
        );


        ctx.arcTo(
            x + width,
            y + height,
            x,
            y + height,
            radius
        );


        ctx.arcTo(
            x,
            y + height,
            x,
            y,
            radius
        );


        ctx.arcTo(
            x,
            y,
            x + width,
            y,
            radius
        );


        ctx.closePath();

    }


    /* ======================================================
       27. DESENHAR ANIMAL
       ====================================================== */

    function drawPlayer() {

        var centerX =
            window.innerWidth / 2;


        var progress =
            player.hop > 0
                ? player.hop /
                  player.hopMax
                : 0;


        var px =
            centerX +
            player.col *
            TILE;


        var py =
            window.innerHeight -
            (
                player.row *
                TILE -
                scrollY
            ) -
            TILE * 1.5;


        var jump =
            Math.sin(
                (1 - progress) *
                Math.PI
            ) *
            (
                player.hop > 0
                    ? 18
                    : 0
            );


        py -= jump;


        ctx.save();


        ctx.translate(
            px,
            py + TILE * 0.5
        );


        if (
            player.dir === "left"
        ) {

            ctx.scale(-1, 1);

        }


        if (
            currentPhase === 0
        ) {

            drawWolf();

        }

        else if (
            currentPhase === 1
        ) {

            drawPlatypus();

        }

        else {

            drawOpossum();

        }


        ctx.restore();

    }


    /* ======================================================
       28. LOBO
       ====================================================== */

    function drawWolf() {

        /* Corpo */

        ctx.fillStyle =
            "#737d88";


        roundRect(
            -16,
            -17,
            32,
            28,
            8
        );


        ctx.fill();


        /* Cabeça */

        ctx.beginPath();


        ctx.arc(
            13,
            -19,
            15,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Orelhas */

        ctx.beginPath();


        ctx.moveTo(
            3,
            -29
        );


        ctx.lineTo(
            8,
            -45
        );


        ctx.lineTo(
            14,
            -29
        );


        ctx.fill();


        ctx.beginPath();


        ctx.moveTo(
            17,
            -30
        );


        ctx.lineTo(
            25,
            -43
        );


        ctx.lineTo(
            29,
            -27
        );


        ctx.fill();


        /* Focinho */

        ctx.fillStyle =
            "#d9dee3";


        ctx.beginPath();


        ctx.ellipse(
            25,
            -15,
            9,
            6,
            0,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Nariz */

        ctx.fillStyle =
            "#111";


        ctx.beginPath();


        ctx.arc(
            32,
            -15,
            3,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Olho */

        ctx.fillStyle =
            "#ffd166";


        ctx.beginPath();


        ctx.arc(
            19,
            -22,
            2.5,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Cauda */

        ctx.strokeStyle =
            "#737d88";


        ctx.lineWidth = 7;


        ctx.beginPath();


        ctx.moveTo(
            -14,
            -5
        );


        ctx.quadraticCurveTo(
            -35,
            0,
            -28,
            13
        );


        ctx.stroke();

    }


    /* ======================================================
       29. ORNITORRINCO
       ====================================================== */

    function drawPlatypus() {

        /* Corpo */

        ctx.fillStyle =
            "#684a3a";


        roundRect(
            -17,
            -15,
            35,
            27,
            9
        );


        ctx.fill();


        /* Cabeça */

        ctx.beginPath();


        ctx.arc(
            12,
            -17,
            16,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Bico */

        ctx.fillStyle =
            "#e5a82f";


        ctx.beginPath();


        ctx.ellipse(
            27,
            -12,
            14,
            7,
            0,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Olho */

        ctx.fillStyle =
            "#111";


        ctx.beginPath();


        ctx.arc(
            17,
            -23,
            3,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Cauda */

        ctx.fillStyle =
            "#4a3329";


        ctx.beginPath();


        ctx.ellipse(
            -22,
            2,
            14,
            10,
            -0.3,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Patas */

        ctx.fillStyle =
            "#e5a82f";


        ctx.fillRect(
            -12,
            8,
            10,
            7
        );


        ctx.fillRect(
            8,
            8,
            10,
            7
        );

    }


    /* ======================================================
       30. SARUÊ
       ====================================================== */

    function drawOpossum() {

        /* Corpo */

        ctx.fillStyle =
            "#777b80";


        roundRect(
            -18,
            -15,
            36,
            27,
            9
        );


        ctx.fill();


        /* Cabeça */

        ctx.beginPath();


        ctx.arc(
            15,
            -17,
            15,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Orelhas */

        ctx.fillStyle =
            "#d4a6ad";


        ctx.beginPath();


        ctx.arc(
            6,
            -29,
            7,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.beginPath();


        ctx.arc(
            24,
            -29,
            7,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Focinho */

        ctx.fillStyle =
            "#e0c2c5";


        ctx.beginPath();


        ctx.ellipse(
            28,
            -12,
            10,
            7,
            0,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Nariz */

        ctx.fillStyle =
            "#111";


        ctx.beginPath();


        ctx.arc(
            35,
            -12,
            3,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Olhos */

        ctx.fillStyle =
            "#111";


        ctx.beginPath();


        ctx.arc(
            19,
            -21,
            2.5,
            0,
            Math.PI * 2
        );


        ctx.fill();


        /* Cauda comprida */

        ctx.strokeStyle =
            "#a8adb2";


        ctx.lineWidth = 6;


        ctx.beginPath();


        ctx.moveTo(
            -17,
            -1
        );


        ctx.quadraticCurveTo(
            -35,
            4,
            -42,
            22
        );


        ctx.stroke();

    }


    /* ======================================================
       31. LOOP
       ====================================================== */

    function frame(time) {

        var deltaTime =
            Math.min(
                time - lastTime,
                40
            ) || 16.6;


        lastTime =
            time;


        update(deltaTime);


        if (!player) {

            requestAnimationFrame(frame);

            return;

        }


        var biome =
            getBiome(player.row);


        drawBackground(biome);


        var topRow =
            Math.ceil(
                player.row +
                window.innerHeight /
                TILE
            ) + 3;


        var bottomRow =
            Math.max(
                0,
                player.row - 3
            );


        for (
            var row = bottomRow;
            row <= topRow;
            row++
        ) {

            drawLane(row);

        }


        drawPlayer();


        requestAnimationFrame(frame);

    }


    /* ======================================================
       32. INICIAR
       ====================================================== */

    document
        .getElementById("play-btn")
        .addEventListener(
            "click",
            function () {

                document
                    .getElementById(
                        "start-screen"
                    )
                    .classList
                    .add("hidden");


                hud.classList
                    .remove("hidden");


                document
                    .getElementById(
                        "dpad"
                    )
                    .classList
                    .remove("hidden");


                document
                    .getElementById(
                        "joystick-hint"
                    )
                    .classList
                    .remove("hidden");


                currentPhase = 0;

                showPhaseScreen();

            }
        );


    /* ======================================================
       33. DERROTA
       ====================================================== */

    document
        .getElementById(
            "retry-btn-lose"
        )
        .addEventListener(
            "click",
            function () {

                document
                    .getElementById(
                        "lose-screen"
                    )
                    .classList
                    .add("hidden");


                currentPhase = 0;

                showPhaseScreen();

            }
        );


    /* ======================================================
       34. NOVO JOGO
       ====================================================== */

    document
        .getElementById(
            "retry-btn-win"
        )
        .addEventListener(
            "click",
            function () {

                document
                    .getElementById(
                        "win-screen"
                    )
                    .classList
                    .add("hidden");


                currentPhase = 0;

                showPhaseScreen();

            }
        );


    /* ======================================================
       35. COMEÇAR LOOP
       ====================================================== */

    requestAnimationFrame(frame);


})();
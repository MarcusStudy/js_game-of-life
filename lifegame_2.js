// 引用元
// https://php-archive.net/html/game-of-life-for-canvas/

{
    // キャンバス
    var canvas;
    // 2Dコンテキスト
    var ctx;
    // セル1マスのサイズ
    var cellSize = 8;
    // 列
    var cols;
    // 行
    var rows;
    // キャンバス上のセルの状態を管理する
    var cells = new Array();
    // スタートボタン
    var buttonStart;
    // ランダムボタン
    var buttonRandom;
    // リセットボタン
    var buttonReset;
    // 繰り返し動作を管理する変数
    var timer1;
    // 動作状態を管理、trueなら動作中、falseなら停止中
    var running = false;

    window.onload = function () {
        // html上のid"lifegame"を取得
        canvas = document.getElementById('lifegame');
        // 描画機能を利用するための2Dコンテキストを取得
        ctx = canvas.getContext('2d');
        // 列 (8列) (Math.floorは小数点以下切り捨てのメソッド)
        cols = Math.floor(canvas.width / cellSize);
        // 行 (8行)
        rows = Math.floor(canvas.height / cellSize);
        // 2Dコンテキストを初期化
        initCells();

        // html上のスタートボタンを取得
        buttonStart = document.getElementById('buttonStart');
        // html上のランダムボタンを取得
        buttonRandom = document.getElementById('buttonRandom');
        // html上のリセットボタンを取得
        buttonReset = document.getElementById('buttonReset');

        // スタートボタンに"クリック"のイベントリスナーを追加
        // スタート処理をスタートボタンクリック時に動作するよう設定
        buttonStart.addEventListener('click', onStart, false);

        // ランダムボタンに"クリック"のイベントリスナーを追加
        // ランダムに生存セルを配置する処理をランダムボタンクリック時に動作するよう設定
        buttonRandom.addEventListener('click', randomCells, false);

        // リセットボタンに"クリック"のイベントリスナーを追加
        // 生存セルを全てリセットする処理をリセットボタンクリック時に動作するよう設定
        buttonReset.addEventListener('click', initCells, false);

        // キャンバスに"クリック"のイベントリスナーを追加
        // セルをクリックしてセルの状態を反転させる処理(生存←→死亡)をセルクリック時に動作するよう設定
        canvas.addEventListener('click', canvasClick, false);
    };

    // 初期化
    function initCells() {
        // 色指定
        ctx.fillStyle = 'rgb(60, 60, 60)';
        // 塗りつぶし
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 座標を配列で表現し、生存セル1、死亡セル0で表現。ここでは全てのセルに0を代入
        for (col = 0; col < cols; col++) {
            cells[col] = new Array();
            for (row = 0; row < rows; row++) {
                cells[col][row] = 0;
            }
        }

        // 再描画
        redraw();
    }

    // 全体を再描画
    function redraw() {
        for (col = 0; col < cols; col++) {
            for (row = 0; row < rows; row++) {
                drawCell(col, row);
            }
        }
    }

    // セルを描画 (1の場合に黄緑色に塗りつぶし、0の場合黒にする)
    function drawCell(x, y) {
        var value = cells[x][y];
        var style = value ? "rgb(156, 255,0)" : "rgb(40,40,40)";
        ctx.fillStyle = style;
        ctx.fillRect(x * cellSize, y * cellSize,
            cellSize - 1, cellSize - 1);
    }

    // 開始 (as イベントリスナー)
    function onStart() {
        if (running) {
            // 動作中の場合

            // setIntervalで設定された繰り返し動作をキャンセル
            clearInterval(timer1);
            // ボタンの表示文字を"Start"に変更
            buttonStart.value = "Start";
            // 動作状態管理変数を"停止"に変更
            running = false;
        } else {
            // 停止中の場合

            // 世代を進行させる
            nextGeneration();
            // setInterval…一定時間ごとに特定の処理を繰り返す
            // ここでは"nextGeneration関数を0.1秒ごとに呼び出し"と設定
            timer1 = setInterval("nextGeneration()", 100);
            // ボタンの表示文字を"Stop"に変更
            buttonStart.value = "Stop";
            // 動作状態管理変数を"動作中"に変更
            running = true;
        }
    }

    // 世代を進行させる (Life of Gameの中心ロジック)
    function nextGeneration() {
        // 次の世代用の一時的な配列を用意
        var tmpCells = new Array();
        // キャンバスのセルを全てなめる
        for (col = 0; col < cols; col++) {
            tmpCells[col] = new Array();
            for (row = 0; row < rows; row++) {
                // 周囲の生存セルを数える
                var count = countAround(col, row);

                // 調査対象セルが生存の場合
                if (cells[col][row]) {

                    if (count == 2 || count == 3) {
                        // 周囲セルの生存数が2,もしくは3の場合、引き続き生存
                        tmpCells[col][row] = 1;
                    } else {
                        // 周囲セルの生存数が2,もしくは3でなない場合、死亡
                        tmpCells[col][row] = 0;
                    }
                } else {
                    // 調査対象セルが死亡の場合

                    if (count == 3) {
                        // 周辺セルの生存数が3の場合,誕生
                        tmpCells[col][row] = 1;
                    } else {
                        // 周辺セルの生存数が3以外の場合,引き続き死亡
                        tmpCells[col][row] = 0;
                    }
                }
            }
        }

        // 作成完了した一時配列を実際のキャンバスに適用
        cells = tmpCells;
        // 再描画
        redraw();
    }

    // 周囲の生存セルを数える
    function countAround(x, y) {
        var count = 0;
        // 以下のような周囲のセル(8個)の状態を確認する
        // □ □ □
        // □ ■ □
        // □ □ □

        for (i = -1; i <= 1; i++) {
            for (j = -1; j <= 1; j++) {
                if (
                    (i != 0 || j != 0) &&
                    x + i >= 0 && x + i < cols &&
                    y + j >= 0 && y + j < rows
                ) {
                    count += cells[x + i][y + j];
                }
            }
        }
        return count;
    }

    // ランダムに埋める
    function randomCells() {
        for (col = 0; col < cols; col++) {
            cells[col] = new Array();
            for (row = 0; row < rows; row++) {
                // Math.random 0以上1未満の数を返す
                // Math.round 小数点を四捨五入する
                cells[col][row] = Math.round(Math.random());
            }
        }
        // 再描画
        redraw();
    }

    // Canvasクリック
    function canvasClick(e) {
        // セル位置の割り出し
        var x = e.clientX - canvas.offsetLeft;
        var y = e.clientY - canvas.offsetTop;
        var col = Math.floor(x / cellSize);
        var row = Math.floor(y / cellSize);
        // 現在の状態と反対の状態を代入
        cells[col][row] = !cells[col][row];
        // セル描画
        drawCell(col, row);
    }

}

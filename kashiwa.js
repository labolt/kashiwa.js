/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     kashiwa.js
   ──────────────────────────────
     Ver. 7.3.1
     Copyright(c) 2014-2021 ARINOKI
     Released under the MIT license
     http://opensource.org/licenses/mit-license.php
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ──────────────────────────────

     + [各種関数の定義]
     |
     + [テンプレートの定義]
     |  |
     |  + Main_Template
     |
     + [シーンの制御]
     |  |
     |  + FrameTimer
     |  |
     |  + Scene
     |  |
     |  + SceneController
     |
     + [表示オブジェクトの定義]
     |  |
     |  + Group
     |  |
     |  + ButtonFrame
     |  |
     |  + Text
     |  |
     |  + FillRect
     |  |
     |  + StrokeRect
     |  |
     |  + FillCircle
     |  |
     |  + StrokeCircle
     |  |
     |  + FillRoundRect
     |  |
     |  + StrokeRoundRect
     |  |
     |  + DrawSVG
     |  |
     |  + DrawImage
     |  |
     |  + Spinner
     |
     + [表示オブジェクトの定義(Web)]
     |  |
     |  + Group
     |  |
     |  + ButtonFrame
     |  |
     |  + Text
     |  |
     |  + FillRect
     |  |
     |  + StrokeRect
     |  |
     |  + FillCircle
     |  |
     |  + StrokeCircle
     |  |
     |  + FillRoundRect
     |  |
     |  + StrokeRoundRect
     |  |
     |  + DrawSVG
     |  |
     |  + DrawImage
     |  |
     |  + Spinner
     |
     + [ブラウザの制御]
     |  |
     |  + DeviceInfo
     |  |
     |  + WindowController
     |  |
     |  + CanvasController
     |
     + [キー入力の制御]
     |  |
     |  + InputChecker
     |  |
     |  + InputChecker(Web)
     |
     + [データの制御]
     |  |
     |  + UrlParam
     |  |
     |  + HttpRequestController
     |  |
     |  + SocketController
     |  |
     |  + StorageController
     |
     + [画像の制御]
     |  |
     |  + SVGLoader
     |  |
     |  + PictureLoader
     |  |
     |  + PictureController
     |  |
     |  + ThumbController
     |
     + [インタラクション]
     |  |
     |  + Easing
     |
     + [ユーティリティ]
        |
        + Debugger
      

   ────────────────────────────── */

var kashiwa = {};
(function(pkg) {

	pkg.web = {};


	/* --------------------
	    各種関数の定義
	-------------------- */

	pkg.addHash = function(val, hash) {
	/* 連想配列を追加する
	   - p1 : 追加先の変数
	   - p2 : 連想配列リスト */

		for (var key in hash) {
			val[key] = hash[key];
		}
	};

	pkg.inheritPrototype = function(child, parent) {
	/* プロトタイプを継承する
	   - p1 : 継承先のクラス
	   - p2 : 継承元のクラス */

		var tmp = function tmp() {};
		tmp.prototype = parent.prototype;
		child.prototype = new tmp();
	};

	pkg.clone = function(src) {
	/* 配列変数をディープコピーする
	   - p1 : コピー元の変数 */

		var ret;
		if (src.constructor === Array) {
			ret = [];
		} else if (src.constructor === Object) {
			ret = {};
		} else {
			return (src);
		}
		for (var key in src) {
			ret[key] = this.clone(src[key]);
		}
		return (ret);
	};

	pkg.getRankList = function(list, mode) {
	/* 配列のIDを値の大小で並べ替える(同値はIDの若い方が優位)
	   - p1 : 数値リスト
	   - p2 : 判定方式(false= 昇順/ true= 降順) */

		var data = pkg.clone(list);
		var idList = new Array();
		var n, i, j;
		for (i = 0; i < data.length; i ++) {
			idList[i] = i;
		}

		for (i = 0; i < data.length - 1; i ++) {
			for (j = i + 1; j < data.length; j ++) {
				if (mode == false) {
					if (data[j] < data[i]) {
						// 値を入れ替え
						n = data[j];
						data[j] = data[i];
						data[i] = n;

						// IDを入れ替え
						n = idList[j];
						idList[j] = idList[i];
						idList[i] = n;
					}
				} else {
					if (data[j] > data[i]) {
						// 値を入れ替え
						n = data[j];
						data[j] = data[i];
						data[i] = n;

						// IDを入れ替え
						n = idList[j];
						idList[j] = idList[i];
						idList[i] = n;
					}
				}
			}
		}

		return (idList);
	},

	pkg.replaceStr = function(string, list) {
	/* コードを既定の文字列に置き換える
	   - p1 : 置き換え元の文字列
	   - p2 : 文言リスト */

		var tmpStr = string;
		for (var name in list) {
			tmpStr = tmpStr.replace('<$' + name + '>', list[name]);
		}
		return (tmpStr);
	};

	pkg.calcPhotoSize = function(inputW, inputH, frameW, frameH, mode) {
	/* 画像の拡縮サイズを算出する
	   - p1 : 元画像の幅
	   - p2 : 元画像の高さ
	   - p3 : 収めたい枠の幅
	   - p4 : 収めたい枠の高さ
	   - p5 : オプション(false= 拡大を許す / true= 縮小のみ)
	   - return ( [拡縮後の幅, 拡縮後の高さ] ) */

		if (mode == true) {
		// 原寸以下で表示

			// 初期値
			tmpRate = 1;
			if ((inputW > frameW) || (inputH > frameH)) {
				// 幅に合わせた場合の倍率
				tmpRate = frameW / inputW;
				if (inputH * tmpRate > frameH) {
					// 高さに合わせた場合の倍率
					tmpRate = frameH / inputH;
				}
			}
		} else {
		// 拡大を許す

			// 幅に合わせた場合の倍率
			tmpRate = frameW / inputW;
			if (inputH * tmpRate > frameH) {
				// 高さに合わせた場合の倍率
				tmpRate = frameH / inputH;
			}
		}

		return ([Math.floor(inputW * tmpRate), Math.floor(inputH * tmpRate)]);
	};

	pkg.calcThumbSize = function(orig_w, orig_h, max_w, max_h) {
	/* 画像のトリミングサイズを算出する
	   - p1 : 元画像の幅
	   - p2 : 元画像の高さ
	   - p3 : 収めたい枠の幅
	   - p4 : 収めたい枠の高さ
	   - return ( [切出後の最終的な幅, 切出後の最終的な高さ, 縮小する幅, 縮小する高さ] ) */

		var resizerate;
		var out_trim_w;
		var out_trim_h;
		var out_small_w;
		var out_small_h;

		// サムネイルの切り出しエリアを算出
		resizerate = max_h / max_w;
		out_width = orig_w;
		out_height = Math.floor(orig_w * resizerate);
		if (out_height > orig_h) {
			out_height = orig_h;
			out_width = Math.floor(orig_h / resizerate);
		}
		out_trim_w = out_width;
		out_trim_h = out_height;

		// 縮小後のサムネイルサイズを算出
		resizerate = max_w / orig_w;
		out_width = max_w;
		out_height = Math.floor(orig_h * resizerate);
		if (out_height < max_h) {
			resizerate = max_h / orig_h;
			out_height = max_h;
			out_width = Math.floor(orig_w * resizerate);
		}
		out_small_w = out_width;
		out_small_h = out_height;

		return ([out_trim_w, out_trim_h, out_small_w, out_small_h]);
	};

	pkg.addEvent = function(ev_name) {
	/* カスタムイベントを発生させる
	   - p1 : イベント名 */

		var customEvent = document.createEvent("HTMLEvents");
		customEvent.initEvent(ev_name, true, false);
		window.dispatchEvent(customEvent);
	};

	pkg.hideAddrBar = function() {
	/* アドレスバーを隠す */

		window.scrollTo(0,1);
	};



	/* --------------------
	    テンプレートの定義
	-------------------- */

	/*
		---------- [Main_Template]
	*/

	pkg.Main_Template = function() {
		this.initDefault();
	};
	pkg.Main_Template.prototype = {

		initDefault:function() {
		/* デフォルト状態を初期化 */

			this.def = {}; // 状態定義
			this.val = {}; // 状態変数

			// デバイス情報の取得
			this.dInfo = new kashiwa.DeviceInfo();

			// パラメータ値の取得
			var prms = new kashiwa.UrlParam();
			this.def.prms = {};
			this.def.prms.ui  = prms.get("ui");
			this.def.prms.pxr = prms.get("pxr");

			// デバイスの正しいピクセル密度を保存
			this.def.deviceOrigPxr = this.dInfo.getInfo().devicePxr;
			// ピクセル密度のエミュレーション
			if (this.def.prms.pxr) {
				if (parseFloat(this.def.prms.pxr) > 0) {
					this.dInfo.emulateDevicePxr(1.5);
				}
			}
			// ピクセル密度
			this.def.pxr = this.dInfo.getInfo().devicePxr;

			// ブラウザの言語
			this.browserLang = null;
			this.getBrowserLang();

			// イベント制御
			this.regInputEvent();

			// アニメーション制御用
			this.frameTimer = new kashiwa.FrameTimer();
			this.reqFrame = null;
			this.flgRunning = false;
			this.getReqAniFrame();

			// リサイズ時の挙動を設定する
			this.winCtrl = new kashiwa.web.WindowController();
			this.winCtrl.init();
		},

		regInputEvent:function() {
		/* 入力イベントを登録する */

			var _this = this;
			window.addEventListener("inputtedSomething", function() {
				_this.inputEventHandler();
			}, false);
			window.addEventListener("startSceneRedraw", function() {
				_this.startSceneRedraw();
			}, false);
			window.addEventListener("stopSceneRedraw", function() {
				_this.stopSceneRedraw();
			}, false);
		},

		inputEventHandler:function() {
		/* 入力イベントに応じた処理を行う(各アプリケーションで定義) */

			return false;
		},

		startSceneRedraw:function() {
		/* シーンの再描画開始を制御する */

			if (this.flgRunning == false) {
				this.start();
			}
		},

		stopSceneRedraw:function() {
		/* シーンの再描画停止を制御する */

			if (this.flgRunning == true) {
				this.stop();
			}
		},

		defStrings:function(list) {
		/* 表示文言を定義する
		   - p1 : 表示文言を定義したオブジェクト */

			this.def.strings = list;

			// 与えられた文言リストの中でどの言語を使うかを決める
			var flag = false;
			for (var name in this.def.strings) {
				// ブラウザ言語コードの前方一致でみる
				if (this.browserLang.indexOf(name) == 0) {
					this.lang = name;
					flag = true;
				}
			}
			if (flag == false) {
				this.lang = 'en';
			}
		},

		defImgPath:function(path) {
		/* 画像パーツのパスを定義する
		   - p1 : 画像を配置しているディレクトリの相対パス */

		   this.def.imgPath = path;
		},

		getBrowserLang:function() {
		/* ブラウザの言語を取得する */

			this.browserLang =
				(window.navigator.languages && window.navigator.languages[0]) ||
	        	window.navigator.language ||
	        	window.navigator.userLanguage ||
	        	window.navigator.browserLanguage;
		},

		getReqAniFrame:function() {
		/* ブラウザに適したrequestAnimationFrameを取得する */

			this.requestAnimationFrame = window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(callback) {
					setTimeout(callback, 40);
				};
			window.requestAnimationFrame = this.requestAnimationFrame;

			this.cancelAnimationFrame = window.cancelAnimationFrame ||
				window.webkitCancelRequestAnimationFrame ||
				window.mozCancelRequestAnimationFrame ||
				window.oCancelRequestAnimationFrame ||
				window.msCancelRequestAnimationFrame ||
				function(id) {
					clearTimeout(id);
				};
			window.cancelAnimationFrame = this.cancelAnimationFrame;
		},

		init:function() {
		/* 状態を初期化(各アプリケーションで定義) */

			return false;
		},

		repeatFunc:function() {
		/* 繰り返し処理 */

			// フレームの更新
			var frameCnt = this.frameTimer.update();
			this.transCnt += frameCnt;
		},

		startReqAniFrame:function() {
		/* requestAnimationFrameを開始 */

			var _this = this;
			this.repeatFunc();
			if (this.flgRunning == true) {
				this.reqFrame = window.requestAnimationFrame(function() { _this.startReqAniFrame(); });
			}
		},

		start:function() {
		/* 繰り返し処理の開始 */

			// console.log("start");
			this.flgRunning = true;
			this.frameTimer.resetTimer();
			this.startReqAniFrame();
		},

		stop:function() {
		/* 繰り返し処理の停止 */

			// console.log("stop");
			this.flgRunning = false;
		}

	};



	/* --------------------
	    シーンの制御
	-------------------- */

	/*
		---------- [FrameTimer]
	*/

	pkg.FrameTimer = function() {
		this.drawRate = 20;
		this.beforeTime = 0;
		this.currentTime = 0;
		this.drawStock = 0;
	};
	pkg.FrameTimer.prototype = {

		init:function(f_rate) {
		/* タイマーを初期化する
		   - p1 : 描画レート */

			this.drawRate = f_rate;
			this.beforeTime = Date.now();
			this.currentTime = 0;
			this.drawStock = 0;
		},

		resetTimer:function() {
		/* タイマーをリセットする */

			this.beforeTime = Date.now();
		},

		update:function() {
		/* フレームを更新する
		   - return ( 前フレームからの進捗 ) */

			this.currentTime = Date.now();
			this.drawStock += this.currentTime - this.beforeTime;
			var drawCnt = Math.floor(this.drawStock / this.drawRate);
			this.drawStock = this.drawStock % this.drawRate;
			this.beforeTime = this.currentTime;

			return (drawCnt);
		}

	};


	/*
		---------- [Scene]
	*/

	pkg.Scene = function() {
		this.initFunc = function() {};
		this.openFunc = function() {};
		this.openCompletedFunc = function() {};
		this.closeFunc = function() {};
		this.closeCompletedFunc = function() {};
		this.updateFunc = function() {};	
	};
	pkg.Scene.prototype = {

		init:function(ctrl) {
		/* 初期化する
		   - p1 : シーンコントローラ */

			this.sceneCtrl = ctrl;

			this.objects = new Array();
			this.transitionState = -1;
			this.transitionCnt = 0;
			this.transitionRate = 1;

			this.openFrameMax = 0;
			this.closeFrameMax = 0;

			this.initFunc();
		},

		draw:function(canv) {
		/* 登録オブジェクトを全て描画する
		   - p1 : 対象のCanvasControllerオブジェクト */

			for (var i = 0; i < this.objects.length; i ++) {
				this.objects[i].draw(canv, this.objects[i], this.transitionRate);
			}
		},

		check:function() {
		/* オブジェクトの入力状態を確認する */

			for (var i = 0; i < this.objects.length; i ++) {
				if ((this.objects[i].type == "ButtonFrame") || (this.objects[i].type == "Group")) {
					this.objects[i].check();
				}
			}
		},

		startChecker:function() {
		/* 入力チェックを開始する */

			for (var i = 0; i < this.objects.length; i ++) {
				if ((this.objects[i].type == "ButtonFrame") || (this.objects[i].type == "Group")) {
					this.objects[i].startChecker();
				}
			}
		},

		stopChecker:function() {
		/* 入力チェックを停止する */

			for (var i = 0; i < this.objects.length; i ++) {
				if ((this.objects[i].type == "ButtonFrame") || (this.objects[i].type == "Group")) {
					this.objects[i].stopChecker();
				}
			}
		},

		open:function() {
		/* オープン時 */

			if (this.openFrameMax > 0) {
				this.transitionState = 0;
				this.transitionCnt = 0;

				this.openFunc();
			} else {
			// 遷移アニメの長さが0の場合(= 即時遷移完了する)
				this.transitionState = 1;
				this.transitionCnt = 0;
				this.sceneCtrl.transitionHandler();
				this.transitionCompletedOpEx();
			}
		},

		close:function() {
		/* クローズ時 */

			if (this.closeFrameMax > 0) {
			// 遷移アニメの長さが1以上の場合
				this.transitionState = 2;
				this.transitionCnt = 0;

				this.closeFunc();
			} else {
			// 遷移アニメの長さが0の場合(= 即時遷移完了する)
				this.transitionState = -1;
				this.transitionCnt = 0;
				this.sceneCtrl.transitionHandler();
				this.transitionCompletedClEx();
			}
		},

		checkInput:function() {
		/* 入力チェック */

		},

		resize:function() {
		/* 領域サイズの変更に対応する */

		},

		update:function(rate) {
		/* 画面更新 */

			this.checkInput();

			this.transitionRate = rate;
			this.updateFunc();
			this.updateTransition(this.openFrameMax, this.closeFrameMax);
		},

		updateTransition:function(op_cnt_max, cl_cnt_max) {
		/* 画面遷移の更新 */

			// 画面遷移のカウンタ
			if ((this.transitionState == 0) || (this.transitionState == 2)) {
				this.transitionCnt += this.transitionRate;

				// 画面遷移の完了
				if ((this.transitionState == 0) && (this.transitionCnt >= op_cnt_max)) {
					this.transitionState = 1;
					this.sceneCtrl.transitionHandler();
					this.transitionCompletedOpEx();
				}
				if ((this.transitionState == 2) && (this.transitionCnt >= cl_cnt_max)) {
					this.transitionState = -1;
					this.sceneCtrl.transitionHandler();
					this.transitionCompletedClEx();
				}
			}
		},

		transitionCompletedOpEx:function() {
		/* オープン完了時 追加処理 */

			this.openCompletedFunc();
		},

		transitionCompletedClEx:function() {
		/* クローズ完了時 追加処理 */

			this.closeCompletedFunc();
		},

		getState:function() {
		/* 遷移ステータス取得
	     - return ( ステータスコード )
	       ステータスコード :
	       - = -1 : invisible
	       - =  0 : opening
	       - =  1 : available
	       - =  2 : closing */

			var tmp = this.transitionState;
			return (tmp);
		}

	};


	/*
		---------- [SceneController]
	*/

	pkg.SceneController = function() {
		this.state = null;
			/* 遷移ステータス
			   - = -1 : start
			   - =  0 : fixed
			   - =  1 : closing
			   - =  2 : closed
			   - =  3 : opening */
		this.currentId = null;
		this.nextId = null;
		this.scenes = new Array();
		this.queueList = new Array();
	};
	pkg.SceneController.prototype = {

		init:function(sc_list) {
		/* コントローラを初期化する
		   - p1 : Sceneオブジェクト(Bg,UIの関連構造を含む)のリスト[Array]
		          - sc:Sceneインスタンス(省略不可)
		          - ui:UI用のSceneインスタンス(省略可)
		          - bg:Bg用のSceneインスタンス(省略可) */

			this.scenes = [];
			for (var i = 0; i < sc_list.length; i ++) {
				this.scenes[i] = sc_list[i];
			}
			this.state = -1;
			this.currentId = 0;
		},

		start:function(sc_id) {
		/* シーンの制御を開始する */

			if (sc_id) {
				this.currentId = sc_id;
			}
			this.enqueueScene(this.currentId);
		},

		checkInput:function() {
		/* シーンの入力を確認する */

			if (this.scenes[this.currentId].bg) {
				this.scenes[this.currentId].bg.checkInput();
			}
			this.scenes[this.currentId].sc.checkInput();
			if (this.scenes[this.currentId].ui) {
				this.scenes[this.currentId].ui.checkInput();
			}
		},

		resize:function() {
		/* シーンのサイズ変更を制御する */

			if (this.scenes[this.currentId].bg) {
				this.scenes[this.currentId].bg.resize();
			}
			this.scenes[this.currentId].sc.resize();
			if (this.scenes[this.currentId].ui) {
				this.scenes[this.currentId].ui.resize();
			}
		},

		update:function(rate) {
		/* シーンをアップデートする */

			if (this.scenes[this.currentId].bg) {
				this.scenes[this.currentId].bg.update(rate);
			}
			this.scenes[this.currentId].sc.update(rate);
			if (this.scenes[this.currentId].ui) {
				this.scenes[this.currentId].ui.update(rate);
			}
		},

		enqueueScene:function(id) {
		/* シーン切替キューにシーンを追加する
		   - p1 : 追加するシーンid */

			this.queueList.push(id);
			pkg.addEvent("startSceneRedraw");
		},

		dequeueScene:function() {
		/* シーン切替キューから1項目実行して削除する */

			var startFlg = false;
			if ((this.state != 2) && (this.queueList.length < 1)) {
				return (-1);
			}
			if (this.state == -1) {
			// 初回のシーンオープン時
				this.nextId = this.queueList.shift();
				this.state = 2;
				startFlg = true;
			}
			if ((this.state == 0) && (this.queueList[0] == this.currentId)) {
			// 同じシーンの場合
				this.queueList.shift();
				return (-1);
			}
			if (this.state == 0) {
				// 現在のシーンをクローズ
				this.state = 1;
				this.transCnt = 0;
				this.nextId = this.queueList.shift();
				this.scenes[this.currentId].sc.close();

				// Bgのクローズ
				if (this.scenes[this.currentId].bg == this.scenes[this.nextId].bg) {
					this.transitionHandler();
				} else {
					if (this.scenes[this.currentId].bg) {
						this.scenes[this.currentId].bg.close();
					} else {
						// Bgが存在しない場合は即時遷移完了とする
						this.transitionHandler();
					}
				}

				// UIのクローズ
				if (this.scenes[this.currentId].ui == this.scenes[this.nextId].ui) {
					this.transitionHandler();
				} else {
					if (this.scenes[this.currentId].ui) {
						this.scenes[this.currentId].ui.close();
					} else {
						// UIが存在しない場合は即時遷移完了とする
						this.transitionHandler();
					}
				}
				// (即時遷移の場合,この時点でstateが変わっている)
			}
			if (this.state == 2) {
				// 次のシーンをオープン
				this.state = 3;
				this.transCnt = 0;
				this.scenes[this.nextId].sc.open();

				// Bgのオープン
				if ((this.scenes[this.currentId].bg == this.scenes[this.nextId].bg) &&
					(startFlg != true)) {
					this.transitionHandler();
				} else {
					if (this.scenes[this.nextId].bg) {
						this.scenes[this.nextId].bg.open();
					} else {
						// Bgが存在しない場合は即時遷移完了とする
						this.transitionHandler();
					}
				}

				// UIのオープン
				if ((this.scenes[this.currentId].ui == this.scenes[this.nextId].ui) &&
					(startFlg != true)) {
					this.transitionHandler();
				} else {
					if (this.scenes[this.nextId].ui) {
						this.scenes[this.nextId].ui.open();
					} else {
						// UIが存在しない場合は即時遷移完了とする
						this.transitionHandler();
					}
				}

				this.currentId = this.nextId;
				// (即時遷移の場合,この時点でstateが変わっている)
			}
			return (0);
		},

		transitionHandler:function() {
		/* Scene, UI, Bg 全ての遷移を確認する */

			this.transCnt ++;
			if (this.transCnt >= 3) {
				if (this.state == 1) {
				// クローズ完了に切り替え
					this.state = 2;
				} else if (this.state == 3) {
				// 通常(遷移完了)に切り替え
					this.state = 0;
					// 全てのキューの遷移が終わったら再描画のループを完了してよい
					if (this.queueList.length == 0) {
						pkg.addEvent("stopSceneRedraw");
					}
				}
			}
		},

		getCurrentScene:function() {
		/* 現在のシーンidを取得する
			- return ( シーンid ) */

			var tmp = this.currentId;
			return (tmp);
		},

		getCurrentState:function() {
		/* 現在の遷移ステータスを取得する
			- return ( 遷移ステータス ) */

			var tmp = this.state;
			return (tmp);
		},

		changeState:function(val) {
		/* 遷移ステータスを変更する
			- p1 : 適用する遷移ステータス */

			this.state = val;
		}

	};



	/* --------------------
	    表示オブジェクトの定義
	-------------------- */

	pkg.obj = {};

	/*
		---------- [Group]
	*/

	pkg.obj.Group = function() {
		this.init();
		this.type = "Group";
		this.parent = null;

		this.constructor();
	};
	pkg.obj.Group.prototype = {

		constructor:function() {
		/* コンストラクタ(追加処理) */

			return false;
		},

		init:function() {
		/* 初期化する */

			this.hidden = false;
			this.x = 0;
			this.y = 0;
			this.alpha = 1.0;

			this.content = new Array();
		},

		append:function(obj) {
		/* グループに追加する */

			this.content.push(obj);
			obj.parent = this;
		},

		remove:function(obj) {
		/* グループから削除する */

			for (var i = 0; i < this.content.length; i ++) {
				if (this.content[i] == obj) {
					this.content.splice(i, 1);
				}
			}
		},

		releasePress:function() {
		/* ボタンの押しっぱなし判定を解放する */

			if (this.hidden == true) {
				return false;
			}

			for (var i = 0; i < this.content.length; i ++) {
				// 子要素に同様の処理を実行する(ButtonFrameとGroupのみ)
				if ((this.content[i].type == "ButtonFrame") || (this.content[i].type == "Group")) {
					this.content[i].releasePress();
				}
			}
		},

		clearState:function() {
		/* ボタンの状態を初期化する */

			if (this.hidden == true) {
				return false;
			}

			for (var i = 0; i < this.content.length; i ++) {
				// 子要素に同様の処理を実行する(ButtonFrameとGroupのみ)
				if ((this.content[i].type == "ButtonFrame") || (this.content[i].type == "Group")) {
					this.content[i].clearState();
				}
			}
		},

		check:function() {
		/* 入力状態を確認する */

			if (this.hidden == true) {
				return false;
			}

			for (var i = 0; i < this.content.length; i ++) {
				// 子要素に同様の処理を実行する(ButtonFrameとGroupのみ)
				if ((this.content[i].type == "ButtonFrame") || (this.content[i].type == "Group")) {
					this.content[i].check();
				}
			}
		}

	};


	/*
		---------- [ButtonFrame]
	*/

	pkg.obj.ButtonFrame = function(target, anime) {
		this.init(target, anime);
		this.type = "ButtonFrame";
		this.parent = null;

		this.constructor();
	};
	pkg.obj.ButtonFrame.prototype = {

		constructor:function() {
		/* コンストラクタ(追加処理) */

			return false;
		},

		init:function(target, anime) {
		/* 初期化する
		   - p1 : 判定対象とする描画オブジェクト
		   - p2 : アニメーションのコマ数 */

			this.hidden = false;
			this.x = 0;
			this.y = 0;
			this.alpha = 1.0;

			this.target = target;
			this.animeMax = anime;
			this.animeEasing = new pkg.Easing(this.animeMax, 50);

			this.inputChk = null;

			this.result = 0;

			/* buttonHover :
			   -  0 … ホバー無し
			   -  1 … ホバー開始
			   -  2 … ホバー終了 */
			this.buttonHover = 0;
			this.cntBtHover = 0;
			this.lvBtHover = 0;

			/* buttonState :
			   -  0 … タッチ無し
			   -  1 … タッチスタート
			   -  2 … タッチエンド */
			this.buttonState = 0;
			this.cntBtState = 0;
			this.lvBtState = 0;
		},

		getRectInfo:function() {
		/* 対象オブジェクトの矩形位情報を取得する */

			var posX = 0;
			var posY = 0;
			var width = 0;
			var height = 0;

			var rootObj = new Array();

			// グループ階層を取得する
			rootObj[0] = this.target;
			for (var i = 0; rootObj[i].parent; i ++) {
				rootObj[i + 1] = rootObj[i].parent;
			}

			// 階層を辿って座標を算出する
			for (var i = rootObj.length - 1; i >= 0; i --) {
				posX += rootObj[i].x;
				posY += rootObj[i].y;
			}

			// 大きさを取得する
			if (this.target.w) {
				width = this.target.w;
			}
			if (this.target.h) {
				height = this.target.h;
			}

			return ([posX, posY, width, height]);
		},

		update:function(f_rate) {
		/* ボタンの状態を更新する */

			// 更新処理
			if (this.buttonHover == 1) {
				if (this.cntBtHover < this.animeMax) {
					this.cntBtHover += f_rate;
					if (this.cntBtHover >= this.animeMax) {
					// ホバーアニメの完了
						this.cntBtHover = this.animeMax;

						if ((this.buttonState == 0)
							|| (this.buttonState == 1) && (this.cntBtState >= this.animeMax)
							|| (this.buttonState == 2) && (this.cntBtState <= 0)) {
						// アクティブのアニメが競合しない場合

							// 完了イベントを飛ばす
							pkg.addEvent("endButtonAnimation");
						}
					}
				}
			} else if (this.buttonHover == 2) {
				if (this.cntBtHover > 0) {
					this.cntBtHover -= f_rate;
					if (this.cntBtHover < 0) {
						this.cntBtHover = 0;
					}
				} else {
				// ホバー終了アニメの完了
					this.buttonHover = 0;

					if ((this.buttonState == 0)
						|| (this.buttonState == 1) && (this.cntBtState >= this.animeMax)
						|| (this.buttonState == 2) && (this.cntBtState <= 0)) {
					// アクティブのアニメが競合しない場合

						// 完了イベントを飛ばす
						pkg.addEvent("endButtonAnimation");
					}
				}
			}
			this.lvBtHover = this.animeEasing.getRate(this.cntBtHover);

			if (this.buttonState == 1) {
				if (this.cntBtState < this.animeMax) {
					this.cntBtState += f_rate;
					if (this.cntBtState >= this.animeMax) {
					// アクティブアニメの完了
						this.cntBtState = this.animeMax;
						if ((this.buttonHover == 0)
							|| (this.buttonHover == 1) && (this.cntBtHover >= this.animeMax)
							|| (this.buttonHover == 2) && (this.cntBtHover <= 0)) {
						// ホバーのアニメが競合しない場合

							// 完了イベントを飛ばす
							pkg.addEvent("endButtonAnimation");
						}
					}
				}
			} else if (this.buttonState == 2) {
				if (this.cntBtState > 0) {
					this.cntBtState -= f_rate;
					if (this.cntBtState < 0) {
						this.cntBtState = 0;
					}
				} else {
				// アクティブ終了アニメの完了
					this.buttonState = 0;
					if ((this.buttonHover == 0)
						|| (this.buttonHover == 1) && (this.cntBtHover >= this.animeMax)
						|| (this.buttonHover == 2) && (this.cntBtHover <= 0)) {
					// ホバーのアニメが競合しない場合

						// 完了イベントを飛ばす
						pkg.addEvent("endButtonAnimation");
					}
				}
			}
			this.lvBtState = this.animeEasing.getRate(this.cntBtState);
		},

		check:function() {
		/* 入力状態を確認する */

			this.inputChk.update();
			var touchInfo = this.inputChk.getPointer();
			var rect = this.getRectInfo();

			// ボタン判定
			if (this.inputChk.getTouchFlag() == true) {
			// タッチ端末

				// アクティブ判定・制御
				if (this.buttonState != 1) {
				// アクティブ中でない場合

					if ((touchInfo.x >= rect[0]) && (touchInfo.x <= rect[0] + rect[2]) &&
						(touchInfo.y >= rect[1]) && (touchInfo.y <= rect[1] + rect[3])) {
						// アクティブ状態のスタート
						this.buttonState = 1;
						pkg.addEvent("startButtonAnimation");
					}
				} else if (this.buttonState == 1) {
				// アクティブ中である場合

					if (touchInfo.pressed == 0) {
					// タッチが離された(= 確定)

						// ボタンの確定
						this.result = 1;

						// アクティブ終了のスタート
						this.buttonState = 2;
						pkg.addEvent("startButtonAnimation");
					} else if ((touchInfo.x < rect[0]) || (touchInfo.x > rect[0] + rect[2]) ||
						(touchInfo.y < rect[1]) || (touchInfo.y > rect[1] + rect[3])) {
					// タッチ位置がボタンから外れた(= タップのキャンセル)

						// アクティブ終了のスタート
						this.buttonState = 2;
						pkg.addEvent("startButtonAnimation");
					}
				}
			} else {
			// マウス端末

				// ホバー判定・制御
				if (this.buttonHover != 1) {
				// ホバー中でない場合

					if ((touchInfo.x >= rect[0]) && (touchInfo.x <= rect[0] + rect[2]) &&
						(touchInfo.y >= rect[1]) && (touchInfo.y <= rect[1] + rect[3])) {
						// ホバー状態のスタート
						this.buttonHover = 1;
						pkg.addEvent("startButtonAnimation");
					}
				} else if (this.buttonHover == 1) {
				// ホバー中である場合

					if ((touchInfo.x < rect[0]) || (touchInfo.x > rect[0] + rect[2]) ||
						(touchInfo.y < rect[1]) || (touchInfo.y > rect[1] + rect[3])) {
						// ホバー終了のスタート
						this.buttonHover = 2;
						pkg.addEvent("startButtonAnimation");
					}
				}

				// アクティブ判定・制御
				if (this.buttonState != 1) {
				// アクティブ中でない場合

					if (touchInfo.pressed == 1) {
					// マウスが押されている

						if ((touchInfo.x >= rect[0]) && (touchInfo.x <= rect[0] + rect[2]) &&
							(touchInfo.y >= rect[1]) && (touchInfo.y <= rect[1] + rect[3])) {
							// アクティブ状態のスタート
							this.buttonState = 1;
							pkg.addEvent("startButtonAnimation");
						}
					}
				} else if (this.buttonState == 1) {
				// アクティブ中である場合

					if (touchInfo.pressed == 0) {
					// マウスが押されていない

						if ((touchInfo.x >= rect[0]) && (touchInfo.x <= rect[0] + rect[2]) &&
							(touchInfo.y >= rect[1]) && (touchInfo.y <= rect[1] + rect[3])) {
						// マウスがボタンの上にある

							// ボタンの確定
							this.result = 1;

							// アクティブ終了のスタート
							this.buttonState = 2;
							pkg.addEvent("startButtonAnimation");
						} else {
						// マウスがボタンの上にない

							// アクティブ終了のスタート
							this.buttonState = 2;
							pkg.addEvent("startButtonAnimation");
						}
					}
				}
			}

			return false;
		},

		getHover:function() {
		/* ボタンのホバー状態を取得する */

			var tmp = this.buttonHover;
			return (tmp);
		},

		getHoverLevel:function() {
		/* ボタンのホバー状態の進度を取得する */

			var tmp = this.lvBtHover;
			return (tmp);
		},

		getActive:function() {
		/* ボタンのアクティブ状態を取得する */

			var tmp = this.buttonState;
			return (tmp);
		},

		getActiveLevel:function() {
		/* ボタンのアクティブ状態の進度を取得する */

			var tmp = this.lvBtState;
			return (tmp);
		},

		getResult:function() {
		/* 結果を取得する
		   - return ( 状態コード )
		     状態コード :
		       -  0 … 未確定
		       -  1 … ボタンが押された */

			var tmp = 0;
			if (this.result != 0) {
				tmp = this.result;
				this.result = 0;
			}
			return (tmp);
		},

		releasePress:function() {
		/* ボタンの押しっぱなし判定を解放する */

			this.buttonHover = 2;
			this.buttonState = 2;
			this.result = 0;
			pkg.addEvent("startButtonAnimation");
		},

		clearState:function() {
		/* ボタンの状態を初期化する */

			this.buttonHover = 2;
			this.buttonState = 2;
			this.cntBtHover = 0;
			this.cntBtState = 0;
			this.result = 0;
			pkg.addEvent("startButtonAnimation");
		}

	};


	/*
		---------- [Text]
	*/

	pkg.obj.Text = function() {
		this.init();
		this.type = "Text";
		this.parent = null;

		this.constructor();
	};
	pkg.obj.Text.prototype = {

		constructor:function() {
		/* コンストラクタ(追加処理) */

			return false;
		},

		init:function() {
		/* 初期化する */

			this.body = '';

			this.hidden = false;
			this.x = 0;
			this.y = 0;

			this.alpha = 1.0;
			this.fill = {};
			this.fill.r = 64;
			this.fill.g = 64;
			this.fill.b = 64;

			this.font = 'sans-serif';
			this.weight = 'normal';
			this.size = 12;
			this.align = 'left';
			this.baseline = 'top';
		},

		check:function() {
		/* 入力状態を確認する */

			return false;
		}

	};


	/*
		---------- [FillRect]
	*/

	pkg.obj.FillRect = function() {
		this.init();
		this.type = "FillRect";
		this.parent = null;

		this.constructor();
	};
	pkg.obj.FillRect.prototype = {

		constructor:function() {
		/* コンストラクタ(追加処理) */

			return false;
		},

		init:function() {
		/* 初期化する */

			this.hidden = false;
			this.x = 0;
			this.y = 0;
			this.w = 0;
			this.h = 0;

			this.alpha = 1.0;
			this.fill = {};
			this.fill.r = 0;
			this.fill.g = 0;
			this.fill.b = 0;
		},

		check:function() {
		/* 入力状態を確認する */

			return false;
		}

	};


	/*
		---------- [StrokeRect]
	*/

	pkg.obj.StrokeRect = function() {
		this.init();
		this.type = "StrokeRect";
		this.parent = null;

		this.constructor();
	};
	pkg.obj.StrokeRect.prototype = {

		constructor:function() {
		/* コンストラクタ(追加処理) */

			return false;
		},

		init:function() {
		/* 初期化する */

			this.hidden = false;
			this.x = 0;
			this.y = 0;
			this.w = 0;
			this.h = 0;

			this.alpha = 1.0;
			this.stroke = {};
			this.stroke.r = 0;
			this.stroke.g = 0;
			this.stroke.b = 0;

			this.lineCap = 'round';
			this.lineWidth = 1;
		},

		check:function() {
		/* 入力状態を確認する */

			return false;
		}

	};


	/*
		---------- [FillCircle]
	*/

	pkg.obj.FillCircle = function() {
		this.init();
		this.type = "FillCircle";
		this.parent = null;

		this.constructor();
	};
	pkg.obj.FillCircle.prototype = {

		constructor:function() {
		/* コンストラクタ(追加処理) */

			return false;
		},

		init:function() {
		/* 初期化する */

			this.hidden = false;
			this.x = 0;
			this.y = 0;
			this.r = 0;

			this.alpha = 1.0;
			this.fill = {};
			this.fill.r = 0;
			this.fill.g = 0;
			this.fill.b = 0;
		},

		check:function() {
		/* 入力状態を確認する */

			return false;
		}

	};


	/*
		---------- [StrokeCircle]
	*/

	pkg.obj.StrokeCircle = function() {
		this.init();
		this.type = "StrokeCircle";
		this.parent = null;

		this.constructor();
	};
	pkg.obj.StrokeCircle.prototype = {

		constructor:function() {
		/* コンストラクタ(追加処理) */

			return false;
		},

		init:function() {
		/* 初期化する */

			this.hidden = false;
			this.x = 0;
			this.y = 0;
			this.r = 0;

			this.alpha = 1.0;
			this.stroke = {};
			this.stroke.r = 0;
			this.stroke.g = 0;
			this.stroke.b = 0;

			this.lineWidth = 1;
		},

		check:function() {
		/* 入力状態を確認する */

			return false;
		}

	};


	/*
		---------- [FillRoundRect]
	*/

	pkg.obj.FillRoundRect = function() {
		this.init();
		this.type = "FillRoundRect";
		this.parent = null;

		this.constructor();
	};
	pkg.obj.FillRoundRect.prototype = {

		constructor:function() {
		/* コンストラクタ(追加処理) */

			return false;
		},

		init:function() {
		/* 初期化する */

			this.hidden = false;
			this.x = 0;
			this.y = 0;
			this.w = 0;
			this.h = 0;
			this.r = 4;

			this.alpha = 1.0;
			this.fill = {};
			this.fill.r = 0;
			this.fill.g = 0;
			this.fill.b = 0;
		},

		check:function() {
		/* 入力状態を確認する */

			return false;
		}

	};


	/*
		---------- [StrokeRoundRect]
	*/

	pkg.obj.StrokeRoundRect = function() {
		this.init();
		this.type = "StrokeRoundRect";
		this.parent = null;

		this.constructor();
	};
	pkg.obj.StrokeRoundRect.prototype = {

		constructor:function() {
		/* コンストラクタ(追加処理) */

			return false;
		},

		init:function() {
		/* 初期化する */

			this.hidden = false;
			this.x = 0;
			this.y = 0;
			this.w = 0;
			this.h = 0;
			this.r = 4;

			this.alpha = 1.0;
			this.stroke = {};
			this.stroke.r = 0;
			this.stroke.g = 0;
			this.stroke.b = 0;

			this.lineWidth = 1;
		},

		check:function() {
		/* 入力状態を確認する */

			return false;
		}

	};


	/*
		---------- [DrawSVG]
	*/

	pkg.obj.DrawSVG = function() {
		this.init();
		this.type = "DrawSVG";
		this.parent = null;

		this.constructor();
	};
	pkg.obj.DrawSVG.prototype = {

		constructor:function() {
		/* コンストラクタ(追加処理) */

			return false;
		},

		init:function() {
		/* 初期化する */

			this.hidden = false;
			this.x = 0;
			this.y = 0;
			this.w = null;
			this.h = null;

			this.alpha = 1.0;
		},

		check:function() {
		/* 入力状態を確認する */

			return false;
		}

	};


	/*
		---------- [DrawImage]
	*/

	pkg.obj.DrawImage = function() {
		this.init();
		this.type = "DrawImage";
		this.parent = null;

		this.constructor();
	};
	pkg.obj.DrawImage.prototype = {

		constructor:function() {
		/* コンストラクタ(追加処理) */

			return false;
		},

		init:function() {
		/* 初期化する */

			this.hidden = false;
			this.x = 0;
			this.y = 0;
			this.w = 0;
			this.h = 0;

			this.alpha = 1.0;
		},

		check:function() {
		/* 入力状態を確認する */

			return false;
		}

	};


	/*
		---------- [Spinner]
	*/

	pkg.obj.Spinner = function() {
		this.init();
		this.type = "Spinner";
		this.parent = null;

		this.constructor();
	};
	pkg.obj.Spinner.prototype = {

		constructor:function() {
		/* コンストラクタ(追加処理) */

			return false;
		},

		init:function() {
		/* 初期化する */

			this.hidden = false;
			this.x = 0;
			this.y = 0;
			this.r = 0;

			this.alpha = 1.0;

			this.fill = {};
			this.fill.r = 0;
			this.fill.g = 0;
			this.fill.b = 0;

			this.frameMax = 100;

			this.cnt = 0;
		},

		update:function(quantity) {
		/* カウンタを進める */

			// カウンタを進める
			this.amountCnt = 0;
			this.cnt += quantity;
			if (this.cnt >= this.frameMax) {
				while (this.cnt >= this.frameMax) {
					this.cnt -= this.frameMax;
					this.amountCnt ++;
				}
			}
		},

		check:function() {
		/* 入力状態を確認する */

			return false;
		}

	};



	/* --------------------
	    表示オブジェクトの定義(Web)
	-------------------- */

	// ピクセル密度
	pkg.web.pxr = 1;

	/*
		---------- [Group]
	*/

	pkg.web.Group = function() {
		pkg.obj.Group.apply(this, arguments);
	};
	pkg.inheritPrototype(pkg.web.Group, pkg.obj.Group);
	pkg.addHash(pkg.web.Group.prototype, {

		startChecker:function() {
		/* 入力チェックを開始する */

			for (var i = 0; i < this.content.length; i ++) {
				if ((this.content[i].type == "ButtonFrame") || (this.content[i].type == "Group")) {
					this.content[i].startChecker();
				}
			}
		},

		stopChecker:function() {
		/* 入力チェックを停止する */

			for (var i = 0; i < this.content.length; i ++) {
				if ((this.content[i].type == "ButtonFrame") || (this.content[i].type == "Group")) {
					this.content[i].stopChecker();
				}
			}
		},

		draw:function(canv, this_, rate) {
		/* 描画する
		   - p1 : 対象のCanvasControllerオブジェクト
		   - p2 : 実行元オブジェクト
		   - p3 : アニメーションカウンタ */

			this.drawBefore(this_, rate);

			if (this.hidden == true) {
				return false;
			}

			for (var i = 0; i < this.content.length; i ++) {
				// 位置と透明度を継承する
				var tmpObj = Object.create(this.content[i]);
				tmpObj.x = this.x + this.content[i].x;
				tmpObj.y = this.y + this.content[i].y;
				tmpObj.alpha = this.alpha * this.content[i].alpha;

				tmpObj.draw(canv, this.content[i], rate);
			}
		},

		drawBefore:function(this_, rate) {
		/* 描画時の追加処理
		   - p1 : 実行元オブジェクト
		   - p2 : アニメーションカウンタ */

			return false;
		}

	});


	/*
		---------- [ButtonFrame]
	*/

	pkg.web.ButtonFrame = function() {
		pkg.obj.ButtonFrame.apply(this, arguments);
	};
	pkg.inheritPrototype(pkg.web.ButtonFrame, pkg.obj.ButtonFrame);
	pkg.addHash(pkg.web.ButtonFrame.prototype, {

		initChecker:function(canv) {
		/* InputCheckerを初期化する
		   - p1 : 対象のCanvasControllerオブジェクト */

			this.inputChk = new pkg.web.InputChecker(this.touchFlg, true);
			this.inputChk.config(canv);
		},

		startChecker:function() {
		/* 入力チェックを開始する */

			this.inputChk.start();
		},

		stopChecker:function() {
		/* 入力チェックを停止する */

			this.inputChk.stop();
		},

		draw:function(canv, this_, rate) {
		/* 描画する
		   - p1 : 対象のCanvasControllerオブジェクト
		   - p2 : 実行元オブジェクト
		   - p3 : アニメーションカウンタ */

			this.drawBefore(this_, rate);

			return false;
		},

		drawBefore:function(rate) {
		/* 描画時の追加処理
		   - p1 : アニメーションカウンタ */

			return false;
		}

	});


	/*
		---------- [Text]
	*/

	pkg.web.Text = function() {
		pkg.obj.Text.apply(this, arguments);
	};
	pkg.inheritPrototype(pkg.web.Text, pkg.obj.Text);
	pkg.addHash(pkg.web.Text.prototype, {

		draw:function(canv, this_, rate) {
		/* 描画する
		   - p1 : 対象のCanvasControllerオブジェクト
		   - p2 : 実行元オブジェクト
		   - p3 : アニメーションカウンタ */

			this.drawBefore(this_, rate);

			if (this.hidden == true) {
				return false;
			}

			canv.adjustRotation();

			var ctx = canv.getInfo().ctx;

			ctx.globalAlpha = this.alpha;
			var tmpFont = this.size * pkg.web.pxr;
			ctx.font = '' + this.weight + ' ' + tmpFont + 'px ' + this.font;
			ctx.fillStyle = 'rgb(' + this.fill.r + ', ' + this.fill.g + ', ' + this.fill.b + ')';
			ctx.textAlign = this.align;
			ctx.textBaseline = this.baseline;
			ctx.fillText(this.body, this.x * pkg.web.pxr, this.y * pkg.web.pxr);

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.rotate(0);
		},

		drawBefore:function(rate) {
		/* 描画時の追加処理
		   - p1 : アニメーションカウンタ */

			return false;
		},

		measure:function(canv) {
		/* 横幅を計測する
		   - p1 : 対象のCanvasControllerオブジェクト */

			if (this.hidden == true) {
				return false;
			}

			var ctx = canv.getInfo().ctx;

			ctx.globalAlpha = this.alpha;
			var tmpFont = this.size * pkg.web.pxr;
			ctx.font = '' + this.weight + ' ' + tmpFont + 'px ' + this.font;
			ctx.fillStyle = 'rgb(' + this.fill.r + ', ' + this.fill.g + ', ' + this.fill.b + ')';
			ctx.textAlign = this.align;
			ctx.textBaseline = this.baseline;
			var tmp = ctx.measureText(this.body);
			return (tmp.width / pkg.web.pxr);
		}

	});


	/*
		---------- [FillRect]
	*/

	pkg.web.FillRect = function() {
		pkg.obj.FillRect.apply(this, arguments);
	};
	pkg.inheritPrototype(pkg.web.FillRect, pkg.obj.FillRect);
	pkg.addHash(pkg.web.FillRect.prototype, {

		draw:function(canv, this_, rate) {
		/* 描画する
		   - p1 : 対象のCanvasControllerオブジェクト
		   - p2 : 実行元オブジェクト
		   - p3 : アニメーションカウンタ */

			this.drawBefore(this_, rate);

			if (this.hidden == true) {
				return false;
			}

			canv.adjustRotation();

			var ctx = canv.getInfo().ctx;

			ctx.globalAlpha = this.alpha;
			ctx.fillStyle = 'rgb(' + this.fill.r + ', ' + this.fill.g + ', ' + this.fill.b + ')';
			ctx.fillRect(this.x * pkg.web.pxr, this.y * pkg.web.pxr, this.w * pkg.web.pxr, this.h * pkg.web.pxr);

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.rotate(0);
		},

		drawBefore:function(rate) {
		/* 描画時の追加処理
		   - p1 : アニメーションカウンタ */

			return false;
		}

	});


	/*
		---------- [StrokeRect]
	*/

	pkg.web.StrokeRect = function() {
		pkg.obj.StrokeRect.apply(this, arguments);
	};
	pkg.inheritPrototype(pkg.web.StrokeRect, pkg.obj.StrokeRect);
	pkg.addHash(pkg.web.StrokeRect.prototype, {

		draw:function(canv, this_, rate) {
		/* 描画する
		   - p1 : 対象のCanvasControllerオブジェクト
		   - p2 : 実行元オブジェクト
		   - p3 : アニメーションカウンタ */

			this.drawBefore(this_, rate);

			if (this.hidden == true) {
				return false;
			}

			canv.adjustRotation();

			var ctx = canv.getInfo().ctx;

			ctx.globalAlpha = this.alpha;
			ctx.strokeStyle = 'rgb(' + this.stroke.r + ', ' + this.stroke.g + ', ' + this.stroke.b + ')';
			ctx.lineCap = this.lineCap;
			ctx.lineWidth = this.lineWidth * pkg.web.pxr;
			ctx.strokeRect(this.x * pkg.web.pxr, this.y * pkg.web.pxr, this.w * pkg.web.pxr, this.h * pkg.web.pxr);

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.rotate(0);
		},

		drawBefore:function(rate) {
		/* 描画時の追加処理
		   - p1 : アニメーションカウンタ */

			return false;
		}

	});


	/*
		---------- [FillCircle]
	*/

	pkg.web.FillCircle = function() {
		pkg.obj.FillCircle.apply(this, arguments);
	};
	pkg.inheritPrototype(pkg.web.FillCircle, pkg.obj.FillCircle);
	pkg.addHash(pkg.web.FillCircle.prototype, {

		draw:function(canv, this_, rate) {
		/* 描画する
		   - p1 : 対象のCanvasControllerオブジェクト
		   - p2 : 実行元オブジェクト
		   - p3 : アニメーションカウンタ */

			this.drawBefore(this_, rate);

			if (this.hidden == true) {
				return false;
			}

			canv.adjustRotation();

			var ctx = canv.getInfo().ctx;

			ctx.globalAlpha = this.alpha;
			ctx.fillStyle = 'rgb(' + this.fill.r + ', ' + this.fill.g + ', ' + this.fill.b + ')';
			ctx.beginPath();
			ctx.arc(this.x * pkg.web.pxr, this.y * pkg.web.pxr, this.r * pkg.web.pxr, 0, Math.PI * 2.0, true);
			ctx.fill();

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.rotate(0);
		},

		drawBefore:function(rate) {
		/* 描画時の追加処理
		   - p1 : アニメーションカウンタ */

			return false;
		}

	});


	/*
		---------- [StrokeCircle]
	*/

	pkg.web.StrokeCircle = function() {
		pkg.obj.StrokeCircle.apply(this, arguments);
	};
	pkg.inheritPrototype(pkg.web.StrokeCircle, pkg.obj.StrokeCircle);
	pkg.addHash(pkg.web.StrokeCircle.prototype, {

		draw:function(canv, this_, rate) {
		/* 描画する
		   - p1 : 対象のCanvasControllerオブジェクト
		   - p2 : 実行元オブジェクト
		   - p3 : アニメーションカウンタ */

			this.drawBefore(this_, rate);

			if (this.hidden == true) {
				return false;
			}

			canv.adjustRotation();

			var ctx = canv.getInfo().ctx;

			ctx.globalAlpha = this.alpha;
			ctx.strokeStyle = 'rgb(' + this.stroke.r + ', ' + this.stroke.g + ', ' + this.stroke.b + ')';
			ctx.lineCap = this.lineCap;
			ctx.lineWidth = this.lineWidth * pkg.web.pxr;
			ctx.beginPath();
			ctx.arc(this.x * pkg.web.pxr, this.y * pkg.web.pxr, this.r * pkg.web.pxr, 0, Math.PI * 2.0, true);
			ctx.stroke();

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.rotate(0);
		},

		drawBefore:function(rate) {
		/* 描画時の追加処理
		   - p1 : アニメーションカウンタ */

			return false;
		}

	});


	/*
		---------- [FillRoundRect]
	*/

	pkg.web.FillRoundRect = function() {
		pkg.obj.FillRoundRect.apply(this, arguments);
	};
	pkg.inheritPrototype(pkg.web.FillRoundRect, pkg.obj.FillRoundRect);
	pkg.addHash(pkg.web.FillRoundRect.prototype, {

		draw:function(canv, this_, rate) {
		/* 描画する
		   - p1 : 対象のCanvasControllerオブジェクト
		   - p2 : 実行元オブジェクト
		   - p3 : アニメーションカウンタ */

			this.drawBefore(this_, rate);

			if (this.hidden == true) {
				return false;
			}

			canv.adjustRotation();

			var ctx = canv.getInfo().ctx;

			ctx.globalAlpha = this.alpha;
			ctx.fillStyle = 'rgb(' + this.fill.r + ', ' + this.fill.g + ', ' + this.fill.b + ')';
			ctx.beginPath();
			ctx.arc((this.x + this.r) * pkg.web.pxr, (this.y + this.r) * pkg.web.pxr,
				this.r * pkg.web.pxr, - Math.PI, - 0.5 * Math.PI, false);
			ctx.arc((this.x + this.w - this.r) * pkg.web.pxr, (this.y + this.r) * pkg.web.pxr,
				this.r * pkg.web.pxr, - 0.5 * Math.PI, 0, false);
			ctx.arc((this.x + this.w - this.r) * pkg.web.pxr, (this.y + this.h - this.r) * pkg.web.pxr,
				this.r * pkg.web.pxr, 0, 0.5 * Math.PI, false);
			ctx.arc((this.x + this.r) * pkg.web.pxr, (this.y + this.h - this.r) * pkg.web.pxr,
				this.r * pkg.web.pxr, 0.5 * Math.PI, Math.PI, false);
			ctx.fill();

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.rotate(0);
		},

		drawBefore:function(rate) {
		/* 描画時の追加処理
		   - p1 : アニメーションカウンタ */

			return false;
		}

	});


	/*
		---------- [StrokeRoundRect]
	*/

	pkg.web.StrokeRoundRect = function() {
		pkg.obj.StrokeRoundRect.apply(this, arguments);
	};
	pkg.inheritPrototype(pkg.web.StrokeRoundRect, pkg.obj.StrokeRoundRect);
	pkg.addHash(pkg.web.StrokeRoundRect.prototype, {

		draw:function(canv, this_, rate) {
		/* 描画する
		   - p1 : 対象のCanvasControllerオブジェクト
		   - p2 : 実行元オブジェクト
		   - p3 : アニメーションカウンタ */

			this.drawBefore(this_, rate);

			if (this.hidden == true) {
				return false;
			}

			canv.adjustRotation();

			var ctx = canv.getInfo().ctx;

			ctx.globalAlpha = this.alpha;
			ctx.strokeStyle = 'rgb(' + this.stroke.r + ', ' + this.stroke.g + ', ' + this.stroke.b + ')';
			ctx.lineWidth = this.lineWidth * pkg.web.pxr;
			ctx.beginPath();
			ctx.arc((this.x + this.r) * pkg.web.pxr, (this.y + this.r) * pkg.web.pxr,
				this.r * pkg.web.pxr, - Math.PI, - 0.5 * Math.PI, false);
			ctx.arc((this.x + this.w - this.r) * pkg.web.pxr, (this.y + this.r) * pkg.web.pxr,
				this.r * pkg.web.pxr, - 0.5 * Math.PI, 0, false);
			ctx.arc((this.x + this.w - this.r) * pkg.web.pxr, (this.y + this.h - this.r) * pkg.web.pxr,
				this.r * pkg.web.pxr, 0, 0.5 * Math.PI, false);
			ctx.arc((this.x + this.r) * pkg.web.pxr, (this.y + this.h - this.r) * pkg.web.pxr,
				this.r * pkg.web.pxr, 0.5 * Math.PI, Math.PI, false);
			ctx.moveTo(this.x * pkg.web.pxr, (this.y + this.h - this.r) * pkg.web.pxr);
			ctx.lineTo(this.x * pkg.web.pxr, (this.y + this.r) * pkg.web.pxr);
			ctx.stroke();

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.rotate(0);
		},

		drawBefore:function(rate) {
		/* 描画時の追加処理
		   - p1 : アニメーションカウンタ */

			return false;
		}

	});


	/*
		---------- [DrawSVG]
	*/

	pkg.web.DrawSVG = function() {
		pkg.obj.DrawSVG.apply(this, arguments);

		this.imgData = null;
	};
	pkg.inheritPrototype(pkg.web.DrawSVG, pkg.obj.DrawSVG);
	pkg.addHash(pkg.web.DrawSVG.prototype, {

		config:function(img) {
		/* SVGデータを設定する
		   - p1 : Imageオブジェクト化されたSVGデータ */

			this.imgData = img;
		},

		draw:function(canv, this_, rate) {
		/* 描画する
		   - p1 : 対象のCanvasControllerオブジェクト
		   - p2 : 実行元オブジェクト
		   - p3 : アニメーションカウンタ */

			this.drawBefore(this_, rate);

			if (this.hidden == true) {
				return false;
			}
			if (! this.imgData) {
				return false;
			}

			canv.adjustRotation();

			var ctx = canv.getInfo().ctx;

			ctx.globalAlpha = this.alpha;
			var w = this.w;
			if (! w) { w =  this.imgData.width; }
			var h = this.h;
			if (! h) { h =  this.imgData.height; }

			ctx.drawImage(this.imgData,
				0, 0, this.imgData.width, this.imgData.height,
				this.x * pkg.web.pxr, this.y * pkg.web.pxr, w * pkg.web.pxr, h * pkg.web.pxr);

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.rotate(0);
		},

		drawBefore:function(rate) {
		/* 描画時の追加処理
		   - p1 : アニメーションカウンタ */

			return false;
		}

	});


	/*
		---------- [DrawImage]
	*/

	pkg.web.DrawImage = function() {
		pkg.obj.DrawImage.apply(this, arguments);

		this.srcCanv = null;
		this.srcX = 0;
		this.srcY = 0;
		this.srcW = 0;
		this.srcH = 0;
		this.scaleOpt = 0;
	};
	pkg.inheritPrototype(pkg.web.DrawImage, pkg.obj.DrawImage);
	pkg.addHash(pkg.web.DrawImage.prototype, {

		config:function(canv, x, y, w, h, opt, pxr_opt) {
		/* 画像のコピー元を設定する
		   - p1 : コピー元のcanvas要素
		   - p2 : コピー元のX座標
		   - p3 : コピー元のY座標
		   - p4 : コピー元の幅(p6=1なら省略可)
		   - p5 : コピー元の高さ(p6=1なら省略可)
		   - p6 : 等倍コピーオプション(=1 : 有効)
		   - p7 : コピー元のピクセル密度を考慮する(=1 : 有効) */

			this.srcCanv = canv;
			this.srcX = x;
			this.srcY = y;
			this.srcW = w;
			this.srcH = h;
			this.scaleOpt = opt;
			this.pxrOpt = pxr_opt;
		},

		draw:function(canv, this_, rate) {
		/* 描画する
		   - p1 : 対象のCanvasControllerオブジェクト
		   - p2 : 実行元オブジェクト
		   - p3 : アニメーションカウンタ */

			this.drawBefore(this_, rate);

			if (this.hidden == true) {
				return false;
			}

			canv.adjustRotation();

			var ctx = canv.getInfo().ctx;

			var optRate;
			if (this.pxrOpt == 1) {
				optRate = pkg.web.pxr;
			} else {
				optRate = 1;
			}
			ctx.globalAlpha = this.alpha;
			if (this.scaleOpt == 1) {
				ctx.drawImage(this.srcCanv,
					this.srcX * optRate, this.srcY * optRate, this.w * pkg.web.pxr, this.h * pkg.web.pxr,
					this.x * pkg.web.pxr, this.y * pkg.web.pxr, this.w * pkg.web.pxr, this.h * pkg.web.pxr);
			} else {
				ctx.drawImage(this.srcCanv,
					this.srcX * optRate, this.srcY * optRate, this.srcW * optRate, this.srcH * optRate,
					this.x * pkg.web.pxr, this.y * pkg.web.pxr, this.w * pkg.web.pxr, this.h * pkg.web.pxr);				
			}

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.rotate(0);
		},

		drawBefore:function(rate) {
		/* 描画時の追加処理
		   - p1 : アニメーションカウンタ */

			return false;
		}

	});


	/*
		---------- [Spinner]
	*/

	pkg.web.Spinner = function() {
		pkg.obj.Spinner.apply(this, arguments);

		this.rotateCnt = 0;
	};
	pkg.inheritPrototype(pkg.web.Spinner, pkg.obj.Spinner);
	pkg.addHash(pkg.web.Spinner.prototype, {

		draw:function(canv, this_, rate) {
		/* 描画する
		   - p1 : 対象のCanvasControllerオブジェクト
		   - p2 : 実行元オブジェクト
		   - p3 : アニメーションカウンタ */

			this.drawBefore(this_, rate);

			if (this.hidden == true) {
				return false;
			}

			canv.adjustRotation();

			var ctx = canv.getInfo().ctx;

			this.pieceW = Math.round(this.r * 0.1);
			this.pieceH = Math.round(this.r * 0.25);
			this.radius = this.r / 2;

			// 状態を保存
			ctx.save();

			// 描画座標に移動
			ctx.translate(this.x * pkg.web.pxr, this.y * pkg.web.pxr);

			// 回転カウンタを進める
			this.rotateCnt += this.amountCnt;
			if (this.rotateCnt > 12) {
				this.rotateCnt = 0;
			}
			ctx.rotate(30 * this.rotateCnt * Math.PI / 180);

			for (var i = 0; i < 12; i ++) {
				ctx.fillStyle = 'rgb(' + this.fill.r + ', ' + this.fill.g + ', ' + this.fill.b + ')';
				ctx.globalAlpha = 1 / 12 * i * this.alpha;
				ctx.beginPath();
				ctx.moveTo((0 - this.pieceW / 4) * pkg.web.pxr,
					(this.radius - this.pieceH) * pkg.web.pxr);
				ctx.quadraticCurveTo(0 * pkg.web.pxr, (this.radius - this.pieceH - this.pieceW / 2) * pkg.web.pxr,
					(0 + this.pieceW / 4) * pkg.web.pxr, (this.radius - this.pieceH) * pkg.web.pxr);
				ctx.lineTo((0 + this.pieceW / 2) * pkg.web.pxr, (this.radius - this.pieceW / 3) * pkg.web.pxr);
				ctx.quadraticCurveTo(0 * pkg.web.pxr, (this.radius + this.pieceW / 3) * pkg.web.pxr,
					(0 - this.pieceW / 2) * pkg.web.pxr, (this.radius - this.pieceW / 3) * pkg.web.pxr);
				ctx.closePath();
				ctx.fill();
				ctx.rotate(30 * Math.PI / 180);
			}

			// canvasの状態を元に戻す
			ctx.rotate(-30 * this.rotateCnt * Math.PI / 180);
			ctx.translate(-this.x / 2 * pkg.web.pxr, -this.y / 2 * pkg.web.pxr);
			ctx.restore();

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.rotate(0);
		},

		drawBefore:function(rate) {
		/* 描画時の追加処理
		   - p1 : アニメーションカウンタ */

			return false;
		}

	});



	/* --------------------
	    ブラウザの制御
	-------------------- */

	/*
		---------- [DeviceInfo]
	*/

	pkg. DeviceInfo = function() {
		this.deviceOS = -1;
		this.tablet = false;
		this.browser = -1;
		this.osVer = "";

		this.deviceW = 0;
		this.deviceH = 0;
		this.viewAreaW = 0;
		this.viewAreaH = 0;
		this.pixelW = 0;
		this.pixelH = 0;
		this.devicePxr = 1;

		this.debug = false;

		this.init();
		this.refreshDisp();
	};
	pkg.DeviceInfo.prototype = {

		init:function() {
		/* デバイス情報を更新する */

			// OS・ブラウザ情報の取得
			var UA = navigator.userAgent;
			if (((UA.indexOf('iPhone') >= 0) || (UA.indexOf('iPad') >= 0)) || (UA.indexOf('iPod') >= 0)) {
				// iOS
				this.deviceOS = 1;
				this.browser = 0;
				if (UA.indexOf('iPad') >= 0) {
					this.tablet = true;
				}
				var iosver = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
				this.osVer = iosver[1];
			} else if (UA.indexOf('Android') >= 0) {
				// Android
				this.deviceOS = 2;
				this.browser = 0; // 標準ブラウザ(=WebKit)
				if ((UA.indexOf('Opera') >= 0) && (UA.indexOf('Mini') < 0)) { this.browser = 2; }
				if (UA.indexOf('Fennec') >= 0) { this.browser = 3; }
				if (UA.indexOf('Chrome') >= 0) { this.browser = 4; }
				if (this.browser != 2) {
				// Opera以外
					if (UA.indexOf('Mobile') < 0) {
						this.tablet = true;
					}
				} else {
				// Opera
					if (UA.indexOf('Tablet') >= 0) {
						this.tablet = true;
					}
				}
				if (UA.indexOf('Android 4.') >= 0) { this.osVer = "4"; }
			} else if (UA.indexOf('Windows Phone OS') >= 0) {
				// Windows Phone
				this.deviceOS = 3;
				this.browser = 1;
			} else {
				// PC
				this.deviceOS = 0;
				if (UA.indexOf('AppleWebKit/') >= 0) {
					// WebKit
					this.browser = 0;
				} else if (window.execScript) {
					// IE
					this.browser = 1;
				} else if (UA.indexOf('Opera') >= 0) {
					// Opera
					this.browser = 2;
				} else if ((UA.indexOf('Gecko') >= 0) && (UA.indexOf('KHTML') == -1)) {
					// Firefox
					this.browser = 3;
				}
			}
		},

		refreshDisp:function() {
		/* 解像度を更新する */

			// 解像度の取得
			if (this.deviceOS == 0) {
			// PC
				if (self.innerHeight) {
					this.deviceW = self.innerWidth;
					this.deviceH = self.innerHeight;
				} else {
					this.deviceW = screen.width;
					this.deviceH = screen.height;
				}
			} else {
			// モバイルデバイス
				if (this.deviceOS == 2) {
				// Android
					if (this.browser != 4) {
					// 標準ブラウザ, Opera, Firefox
						this.deviceW = Math.floor(window.outerWidth / window.devicePixelRatio);
						this.deviceH = Math.floor(window.outerHeight / window.devicePixelRatio);
					} else {
					// Chrome
						this.deviceW = window.outerWidth;
						this.deviceH = window.outerHeight;
					}
				} else {
				// Android 以外
					this.deviceW = screen.width;
					this.deviceH = screen.height;
				}
			}

			// 画面回転への対応(iOS)
			if ((this.deviceOS == 1) && (window.orientation != 0)) {
				var tmp = this.deviceW;
				this.deviceW = this.deviceH;
				this.deviceH = tmp;
			}

			// ビュー領域を求める
			this.viewAreaW = this.deviceW;
			if (this.deviceOS == 1) {
			// iOS = メニューバー・ステータスバーを引いた高さ
				if (this.tablet == true) {
				// iPad
					this.viewAreaH = window.innerHeight;
				} else {
				// iPhone, iPod touch
					if (this.osVer >= 7) {
					// iOS 7 以降
						this.viewAreaH = window.innerHeight;
					} else {
					// iOS 6 以前
						if (window.orientation == 0) {
							this.viewAreaH = this.deviceH - 20 - 44;
						} else {
							this.viewAreaH = this.deviceH - 20 - 32;
						}
					}
				}
			} else {
				this.viewAreaH = this.deviceH;
			}

			// ピクセル密度の取得
			if (window.devicePixelRatio == undefined) {
				this.devicePxr = 1;
			} else {
				this.devicePxr = window.devicePixelRatio;
			}

			// 原寸のピクセル領域を求める
			this.pixelW = this.viewAreaW * this.devicePxr;
			this.pixelH = this.viewAreaH * this.devicePxr;
		},

		emulateDevicePxr:function(pxr) {
		/* ピクセル密度を変更して実行する
		   - p1 : 変更するピクセル密度 */

			this.devicePxr = pxr;
			this.pixelW = this.viewAreaW * this.devicePxr;
			this.pixelH = this.viewAreaH * this.devicePxr;
		},

		getInfo:function() {
		/* デバイス情報を取得する
		   - return ( {
		        deviceW: デバイスの画面解像度(Width),
		        deviceH: デバイスの画面解像度(Height),
		        viewAreaW: ブラウザの表示領域(Width),
		        viewAreaH: ブラウザの表示領域(Height),
		        pixelW: ブラウザの表示領域のピクセル原寸(Width),
		        pixelH: ブラウザの表示領域のピクセル原寸(Height),
		        devicePxr: デバイスのピクセル密度,
		        browser: ブラウザの種類,
				   - -1 … 未取得
				   -  0 … WebKit
				   -  1 … Internet Explorer
				   -  2 … Opera
				   -  3 … Firefox
				   -  4 … Chrome(Android)
		        deviceOS: OSの種類,
				   - -1 … 未取得
				   -  0 … 下記以外(PCなど)
				   -  1 … iOS
				   -  2 … Android
				   -  3 … Windows Phone
		        tablet: タブレットか否か
				   - true … タブレット端末
			 } ) */

			var tmp = {};
			tmp.deviceW = this.deviceW;
			tmp.deviceH = this.deviceH;
			tmp.viewAreaW = this.viewAreaW;
			tmp.viewAreaH = this.viewAreaH;
			tmp.pixelW = this.pixelW;
			tmp.pixelH = this.pixelH;
			tmp.devicePxr = this.devicePxr;
			tmp.browser = this.browser;
			tmp.deviceOS = this.deviceOS;
			tmp.tablet = this.tablet;

			return (tmp);
		}

	};


	/*
		---------- [WindowController]
	*/

	pkg.web.WindowController = function() {
	};
	pkg.web.WindowController.prototype = {

		init:function() {
		/* 初期化する */

			var _this = this;
			window.addEventListener("resize", function() {
				_this.resizeHandler();
			}, false);
			this.funcOnResized = function() {};
		},

		regResizeFunc:function(func) {
		/* リサイズ時に実行する関数を登録する */

			this.funcOnResized = func;
		},

		resizeHandler:function() {
		/* リサイズ時の処理 */

			this.funcOnResized();
		}

	};


	/*
		---------- [CanvasController]
	*/

	pkg.web.CanvasController = function(canv) {
		this.init(canv);
	};
	pkg.web.CanvasController.prototype = {

		init:function(canv) {
		/* 初期化する
		   - p1 : 対象のcanvasオブジェクト */

			this.canv = canv;
			this.ctx = this.canv.getContext('2d');
			this.x = 0;
			this.y = 0;
			this.pxr = 1; // pixW ÷ nativeW
			this.viewRate = 1; // width ÷ nativeW
			this.orientation = 0; // 0 or 90
			this.display = true;

			// 表示スタイル上のサイズ(縮小される可能性あり)
			this.width = this.canv.width;
			this.height = this.canv.height;

			// プログラム上の計算サイズ
			this.nativeW = this.width;
			this.nativeH = this.height;

			// canvasの描画サイズ(ピクセル原寸)
			this.pixW = this.nativeW * this.pxr;
			this.pixH = this.nativeH * this.pxr;
		},

		changeSize:function(w, h, pxr, screenW, screenH, orientation) {
		/* canvasのサイズを変更する */

			var width = this.nativeW;
			var height = this.nativeH;
			if (w) {
				width = w;
			}
			if (h) {
				height = h;
			}

			// スクリーンに収まるサイズを算出する
			var calcW = null, calcH = null, calcRate = null;
			if ((screenW) || (screenH)) {
				// スクリーン幅に合わせた場合のサイズを算出
				var output1_W, output1_H;
				if (width > screenW) {
				// 幅が収まらない場合は,縮小して代入する
					output1_W = Math.floor(screenW);
					output1_H = Math.floor(height * screenW / width);
				} else {
				// 幅が収まる場合は,そのまま代入する
					output1_W = width;
					output1_H = height;
				}

				// スクリーン高に合わせた場合のサイズを算出
				var output2_W, output2_H;
				if (height > screenH) {
				// 高さが収まらない場合は,縮小して代入する
					output2_W = Math.floor(width * screenH / height);
					output2_H = Math.floor(screenH);
				} else {
				// 幅が収まる場合は,そのまま代入する
					output2_W = width;
					output2_H = height;
				}

				if (output1_W <= output2_W) {
					calcW = output1_W;
					calcH = output1_H;
					calcRate = output1_W /width;
				} else {
					calcW = output2_W;
					calcH = output2_H;
					calcRate = output2_W / width;
				}
			}

			// ピクセル密度を決定する
			if (pxr) {
				this.pxr = pxr;
			}

			// 画面回転を決定する
			if ((orientation == 0) || (orientation == 90)) {
				this.orientation = orientation;
			}

			// canvasの幅を決定する
			if ((w) || (pxr) || (calcW) || (orientation == 0) || (orientation == 90)) {
				this.nativeW = width;
				this.pixW = width * pxr;
				if (calcW) {
					this.width = calcW;
				} else {
					this.width = this.nativeW;
				}
				if (this.orientation == 90) {
					this.canv.style.height = this.width + 'px';
					this.canv.height = this.pixW;
				} else {
					this.canv.style.width = this.width + 'px';
					this.canv.width = this.pixW;
				}
			}

			// canvasの高さを決定する
			if ((h) || (pxr) || (calcH) || (orientation == 0) || (orientation == 90)) {
				this.nativeH = height;
				this.pixH = height * pxr;
				if (calcH) {
					this.height = calcH;
				} else {
					this.height = this.nativeH;
				}
				if (this.orientation == 90) {
					this.canv.style.width = this.height + 'px';
					this.canv.width = this.pixH;
				} else {
					this.canv.style.height = this.height + 'px';
					this.canv.height = this.pixH;
				}
			}

			// canvasの表示倍率を決定する
			if (calcRate) {
				this.viewRate = calcRate;
			} else {
				this.viewRate = 1;
			}
		},

		changePosition:function(x, y) {
		/* canvasの位置を変更する */

			if (x) {
				this.x = x;
				this.canv.style.marginLeft = this.x + 'px';
			}
			if (y) {
				this.y = y;
				this.canv.style.marginTop = this.y + 'px';
			}
		},

		changeVisibility:function(flag) {
		/* 表示・非表示を変更する */

			this.display = flag;
			if (this.display == false) {
				this.canv.style.display = 'none';
			}
			if (this.display == true) {
				this.canv.style.display = 'block';
			}
		},

		adjustRotation:function() {
		/* 必要に応じてcanvasの描画位置を調整する */

			if (this.orientation == 90) {
				this.ctx.translate(this.pixH, 0);
				this.ctx.rotate(Math.PI / 2);
			}
		},

		getInfo:function() {
		/* canvasの情報を取得する */

			var obj = {};
			obj.x = this.x;
			obj.y = this.y;
			obj.width = this.width;
			obj.height = this.height;
			obj.nativeW = this.nativeW;
			obj.nativeH = this.nativeH;
			obj.pixW = this.pixW;
			obj.pixH = this.pixH;
			obj.pxr = this.pxr;
			obj.viewRate = this.viewRate;
			obj.orientation = this.orientation;
			obj.display = this.display;
			obj.ctx = this.ctx;
			obj.canv = this.canv;

			return (obj);
		},

		clearAll:function() {
		/* 描画内容をすべて消去する */

			this.ctx.clearRect(0, 0, this.canv.width, this.canv.height);
		}

	};



	/* --------------------
	    キー入力の制御
	-------------------- */

	/*
		---------- [InputChecker]
	*/

	pkg.InputChecker = function(queflg) {
	/* - p1 : キュー利用フラグ(=true : キュー有効化) */

		this.enableQueue = queflg;

		this.currentKeyInfo = {};
		this.firstDownFlg = false;
		this.keepDownFlg = false;

		this.touchFlg = false;
		this.preventive = false;

		this.init();
	};
	pkg.InputChecker.prototype = {

		init:function() {
		/* チェッカーを初期化する */

			this.currentKeyInfo.pressed = 0;
			this.currentKeyInfo.x = -1;
			this.currentKeyInfo.y = -1;
			this.queueList = new Array();
			this.firstDownFlg = false;
			this.keepDownFlg = false;
		},

		keyHandler:function(x, y, on, down) {
		/* 入力キーをキューに追加する */

			var mouseX       = x;
			var mouseY       = y;
			var mouseOnFlg   = on;
			var mouseDownFlg = down;

			// 現在の値を設定
			if (mouseDownFlg == true) {
				// 押しっぱなし判定
				if (this.firstDownFlg == false) {
					// 初回押下
					this.currentKeyInfo.pressed = 1;
					this.firstDownFlg = true;
				} else {
					// 押しっぱなし状態
					this.currentKeyInfo.pressed = 2;
					this.keepDownFlg = true;
				}
			} else {
				this.currentKeyInfo.pressed = 0;
				this.firstDownFlg = false;
				this.keepDownFlg = false;
			}
			this.currentKeyInfo.x = mouseX;
			this.currentKeyInfo.y = mouseY;

			if (this.enableQueue == true) {
			// キューを使用する
				if (this.queueList.length > 0) {
				// キューがある場合
					if (this.currentKeyInfo.pressed != 2) {
						if (((this.currentKeyInfo.pressed != 0) || (this.queueList[this.queueList.length - 1].pressed != 0)) &&
							((this.currentKeyInfo.pressed != 1) || (this.queueList[this.queueList.length - 1].pressed != 1))) {
							// キュー(末尾)に追加 (mouse_down_keepingを除く)
							this.queueList.push({
									pressed:this.currentKeyInfo.pressed,
									x:this.currentKeyInfo.x,
									y:this.currentKeyInfo.y
								});
						}
					}
				} else {
				// キューが無い場合
					// キューの先頭に追加
					this.queueList.push({
							pressed:this.currentKeyInfo.pressed,
							x:this.currentKeyInfo.x,
							y:this.currentKeyInfo.y
						});
				}
			}

			// キー入力イベントを発生させる(アプリケーションで任意に利用)
			pkg.addEvent("inputtedSomething");
		},

		update:function() {
		/* 入力情報を更新する */

			// 重複除外フラグを初期化
			this.preventive = false;

			if (this.enableQueue == true) {
			// キューを使用する
				if (this.queueList.length > 0) {
				// キューがある場合
					var tmp = this.queueList.shift();
					this.returnVal = {
							pressed:tmp.pressed,
							x:Math.floor(tmp.x),
							y:Math.floor(tmp.y)
						};
				} else {
				// キューが無い場合
					this.returnVal = {
							pressed:this.currentKeyInfo.pressed,
							x:Math.floor(this.currentKeyInfo.x),
							y:Math.floor(this.currentKeyInfo.y)
						};
				}
			}
		},

		skipCurrentFrame:function() {
		/* 今のフレームで以降の検出を除外する */

			this.preventive = true;
		},

		getTouchFlag:function() {
		/* タッチモードを取得する */

			var tmp = this.touchFlg;
			return (tmp);
		},

		getPointer:function() {
		/* タッチ,ポインタ入力値を取得する
		   - return ( {pressed: 入力コード, x: 入力時のx座標, y: 入力時のy座標} )
		     入力コード :
		       - mouse_up … 0
		       - mouse_down … 1
		       - mouse_down_keeping … 2 */

			var tmp = {};
			if (this.enableQueue == true) {
			// キューを使用する
				tmp.pressed = this.returnVal.pressed;
				tmp.x = this.returnVal.x;
				tmp.y = this.returnVal.y;
			} else {
			// キューを使用しない
				tmp.pressed = this.currentKeyInfo.pressed;
				tmp.x = this.currentKeyInfo.x;
				tmp.y = this.currentKeyInfo.y;
			}

			// 重複チェックの除外
			if (this.preventive == true) {
				tmp.pressed = 0;
			}
			return (tmp);
		}

	};


	/*
		---------- [InputChecker(Web)]
	*/

	pkg.web.InputChecker = function() {
		pkg.InputChecker.apply(this, arguments);
	};
	pkg.inheritPrototype(pkg.web.InputChecker, pkg.InputChecker);
	pkg.addHash(pkg.web.InputChecker.prototype, {

		config:function(canv) {
		/* 対象要素を指定して初期化する
		   - p1 : 対象のCanvasControllerオブジェクト */

			this.canvCtrl = canv;
			this.canv = this.canvCtrl.getInfo().canv;

			this.mouseX = 0;
			this.mouseY = 0;
			this.mouseOnFlg = false;
			this.mouseDownFlg = false;
			this.viewRate = 1;
			this.orientation = 0;
			this.canvasW = 0;
			this.canvasH = 0;
		},

		start:function() {
		/* キーチェックを開始する */

			var _this = this;

			// イベントハンドラを定義する
			this.handler = {};
			this.handler.getTouchPosition = function(e) {
				e.preventDefault();
				_this.touchFlg = true;

				_this.mouseOnFlg = true;
				_this.mouseDownFlg = true;
				var rect = _this.canv.getBoundingClientRect();
				_this.mouseX = e.touches[0].pageX - rect.left;
				_this.mouseY = e.touches[0].pageY - rect.top;

				// 倍率を補正する
				_this.updateCanvasInfo();
				_this.mouseX = Math.floor(_this.mouseX / _this.viewRate);
				_this.mouseY = Math.floor(_this.mouseY / _this.viewRate);

				// 画面回転を補正する
				if (_this.orientation == 90) {
					var tmpMouseX = _this.mouseY;
					var tmpMouseY = _this.canvasH - _this.mouseX;
					_this.mouseX = tmpMouseX;
					_this.mouseY = tmpMouseY;
				}

				_this.sendInputData();
			};
			this.handler.getTouchEnd = function(e) {
				e.preventDefault();
				_this.touchFlg = true;

				_this.mouseDownFlg = false;
				_this.sendInputData();
			};
			this.handler.getMousePosition = function(e) {
				_this.touchFlg = false;

				_this.mouseOnFlg = true;
				var rect = _this.canv.getBoundingClientRect();
				_this.mouseX = e.clientX - rect.left;
				_this.mouseY = e.clientY - rect.top;

				// 倍率を補正する
				_this.updateCanvasInfo();
				_this.mouseX = Math.floor(_this.mouseX / _this.viewRate);
				_this.mouseY = Math.floor(_this.mouseY / _this.viewRate);

				// 画面回転を補正する
				if (_this.orientation == 90) {
					var tmpMouseX = _this.mouseY;
					var tmpMouseY = _this.canvasH - _this.mouseX;
					_this.mouseX = tmpMouseX;
					_this.mouseY = tmpMouseY;
				}

				_this.sendInputData();
			};
			this.handler.getMouseUp = function(e) {
				_this.touchFlg = false;

				_this.mouseDownFlg = false;
				_this.sendInputData();
			};
			this.handler.getMouseDown = function(e) {
				_this.touchFlg = false;

				_this.mouseDownFlg = true;
				_this.sendInputData();
			};
			this.handler.getMouseOut = function(e) {
				_this.touchFlg = false;

				_this.mouseOnFlg = false;
				_this.sendInputData();
			};


			// タッチデバイス

			// TouchStart, TouchMove
			this.canv.addEventListener("touchstart", this.handler.getTouchPosition, true);
			this.canv.addEventListener("touchmove", this.handler.getTouchPosition, true);

			// TouchEnd
			this.canv.addEventListener("touchend", this.handler.getTouchEnd, true);

			// 非タッチデバイス

			// MouseOver, MouseMove
			this.canv.addEventListener("mousemove", this.handler.getMousePosition, false);
			this.canv.addEventListener("mouseover", this.handler.getMousePosition, true);

			// MouseUp
			this.canv.addEventListener("mouseup", this.handler.getMouseUp, true);

			// MouseDown
			this.canv.addEventListener("mousedown", this.handler.getMouseDown, true);


			// MouseOut
			this.canv.addEventListener("mouseout", this.handler.getMouseOut, true);
		},

		updateCanvasInfo:function() {
		/* canvasの情報を取得する */

			this.canvasW = this.canvCtrl.getInfo().nativeW;
			this.canvasH = this.canvCtrl.getInfo().nativeH;
			this.viewRate = this.canvCtrl.getInfo().viewRate;
			this.orientation = this.canvCtrl.getInfo().orientation;
		},

		sendInputData:function() {
		/* 入力イベントの送信 */

			var tmp = this.getVals();
			this.keyHandler(tmp.mouseX, tmp.mouseY, tmp.mouseOnFlg, tmp.mouseDownFlg);
		},

		getVals:function() {
		/* キー入力値を返す */

			var _this = this;
			var vals = {};
			(function(inside) {
				if ((_this.touchFlg == true) && (_this.mouseDownFlg == false)) {
				// タッチデバイスでタッチされていない時
					inside.mouseX = -1;
					inside.mouseY = -1;
				} else if ((_this.touchFlg == false) && (_this.mouseOnFlg == false)) {
					inside.mouseX = -1;
					inside.mouseY = -1;
				} else {
					inside.mouseX = _this.mouseX;
					inside.mouseY = _this.mouseY;
				}
				inside.mouseOnFlg = _this.mouseOnFlg;
				inside.mouseDownFlg = _this.mouseDownFlg;
			})(vals);

			return (vals);
		},

		stop:function() {
		/* キーチェックを停止する */

			// タッチデバイス

			// TouchStart, TouchMove
			this.canv.removeEventListener("touchstart", this.handler.getTouchPosition, true);
			this.canv.removeEventListener("touchmove", this.handler.getTouchPosition, true);

			// TouchEnd
			this.canv.removeEventListener("touchend", this.handler.getTouchEnd, true);


			// 非タッチデバイス

			// MouseOver, MouseMove
			this.canv.removeEventListener("mousemove", this.handler.getMousePosition, true);
			this.canv.removeEventListener("mouseover", this.handler.getMousePosition, true);

			// MouseUp
			this.canv.removeEventListener("mouseup", this.handler.getMouseUp, true);

			// MouseDown
			this.canv.removeEventListener("mousedown", this.handler.getMouseDown, true);


			// MouseOut
			this.canv.removeEventListener("mouseout", this.handler.getMouseOut, true);
		}

	});



	/* --------------------
	    データの制御
	-------------------- */

	/*
		---------- [UrlParam]
	*/

	pkg.UrlParam = function() {
		this.prm = new Array();
		this.str = location.search.split('?');
		if (this.str.length < 2) {
			this.str = '';
		} else {
			this.prm = this.str[1].split('&');
		}
	};
	pkg.UrlParam.prototype = {

		get:function(name) {
		/* 指定したキーの値を取得する
		   - p1 : キー */

			for (var i = 0; i < this.prm.length; i ++) {
				val = this.prm[i].split('=');
				if ((val[0] == name) && (val.length == 2)) {
					return (decodeURIComponent(val[1]));
				}
			}
			return ('');
		}

	};


	/*
		---------- [HttpRequestController]
	*/

	pkg.HttpRequestController = function() {
		this.xhr = null;

		this.xhrUrl = null;
		this.dataType = null;
		this.method = null;
		this.dataSend = null;
		this.sendDataType = null;

		this.state = -1;
	};
	pkg.HttpRequestController.prototype = {

		init:function(url, dtype, mtd, sdata, sdtype) {
		/* 初期化する
		   - p1 : リクエストを送るURL
		   - p2 : 受信するデータ形式(=0:JSON,Text / =1:XML)
		   - p3 : 使用するメソッド(=0:GET / =1:POST)
		   - p4 : 送信するデータ(=null:受信のみ)
		   - p5 : 送信するデータ形式(=null:フォーム送信形式) */

			this.xhrUrl = url;
			this.dataType = dtype;
			this.method = mtd;
			this.dataSend = sdata;
			this.sendDataType = sdtype;

			this.state = -1;

			if (window.ActiveXObject) {
				this.xhr = new ActiveXObject("Microsoft.XMLHTTP");
			} else {
				this.xhr = new XMLHttpRequest();
				this.xhr.overrideMimeType('text/xml');
			}
		},

		start:function(fn_onload, fn_onerror) {
		/* 通信を開始する
		   - p1 : 読み込み完了時に実行する関数
		   - p2 : 読み込みエラー時に実行する関数 */

			var _this = this;

			this.funcOnLoad = fn_onload;
			this.funcOnError = fn_onerror;

			this.state = -1;

			// アクセス先とメソッドの設定
			if (this.method == 0) {
			// GET
				var tmpGetUrl = "";
				if (this.dataSend != null) {
					tmpGetUrl = "?" + this.dataSend;
				}
				this.xhr.open("GET", this.xhrUrl + tmpGetUrl, true);
			} else if (this.method == 1) {
			// POST
				this.xhr.open("POST", this.xhrUrl, true);
			}

			// データ送信の準備
			var contentType;
			if (this.dataSend != null) {
				if (this.sendDataType == null) {
					contentType = "application/x-www-form-urlencoded";
				} else {
					contentType = this.sendDataType;
				}
				this.xhr.setRequestHeader("Content-Type", contentType);
			}
			this.xhr.onreadystatechange = xhrHandler;

			// データ通信の開始
			if (this.method == 0) {
			// GET
				this.xhr.send(null);
			} else if (this.method == 1) {
			// POST
				this.xhr.send(this.dataSend);
			}

			function xhrHandler() {
				if (_this.xhr.readyState == 4) {
					if ((_this.xhr.status == 200) || (_this.xhr.status == 201)) {
					// データ取得完了
						_this.state = 1;
						if (_this.funcOnLoad) {
							_this.funcOnLoad();
						}
					} else {
					// エラー
						_this.state = 2;
						if (_this.funcOnError) {
							_this.funcOnError();
						}
					}
				} else if ((_this.xhr.readyState == 2) || (_this.xhr.readyState == 3)) {
				// 受信処理中
					_this.state = 0;
				}
			};
		},

		stop:function() {
		/* 通信を中止する */

			this.xhr.abort();
		},

		getState:function() {
		/* 通信の進捗を取得する
		   - return ( 状態コード )
		     状態コード :
		       - -1 … 開始前
		       -  0 … 受信中
		       -  1 … 受信完了
		       -  2 … エラー */

			var tmp = this.state;
			return (tmp);
		},

		getData:function() {
		/* 受信したデータを取得する
		   - return ( JSON または XMLデータ ) */

			if (this.dataType == 0) {
			// JSON
				return (this.xhr.responseText);
			} else if (this.dataType == 1) {
			// XML
				return (this.xhr.responseXML);
			}
		}

	};


	/*
		---------- [SocketController]
	*/

	pkg.SocketController = function() {
		this.socket = null;
		this.urlSocket = null;
		this.stateSocket = 0;
		this.flgMessage = false;
		this.message = null;
	};
	pkg.SocketController.prototype = {

		init:function(url) {
		/* 初期化して接続を確立する
		   - p1 : 接続するURL */

			this.urlSocket = url;
			this.stateSocket = 0;
			this.flgMessage = false;
			this.message = null;

			if ("WebSocket" in window) {
				this.socket = new WebSocket(this.urlSocket);
			} else if ("MozWebSocket" in window) {
				this.socket = new MozWebSocket(this.urlSocket);
			}

			var _this = this;
			this.socket.onopen = function(e){
			// 接続した
				_this.stateSocket = 1;
			}
			this.socket.onclose = function(e){
			// 切断した
				_this.stateSocket = 0;
			}
			this.socket.onerror = function(e){
			// エラーが発生した
				_this.stateSocket = 2;
			}
			this.socket.onmessage = function(e){
			// メッセージを受信した
				_this.message = e.data;
				_this.flgMessage = true;
			}
		},

		checkMessage:function() {
		/* メッセージ受信の有無を確認する */

			var tmp = this.flgMessage;
			return (tmp);
		},

		getMessage:function() {
		/* 受信したメッセージを取得する */

			if (this.flgMessage == true) {
				this.flgMessage = false;
				var tmp = this.message;
				return (tmp);
			} else {
				return (null);
			}
		},

		send:function(val) {
		/* メッセージを送信する
		   - p1 : 送信するデータ */

			if (this.stateSocket == 1) {
				this.socket.send(val);
			}
		},

		close:function() {
		/* サーバとの接続を切断する */

			this.socket.close(val);
			this.socket = null;
		},

		getState:function() {
		/* 接続の状況を取得する
		   - return ( 状態コード )
		     状態コード :
		       - 0 … 切断
		       - 1 … 接続中
		       - 2 … エラー */

			var tmp = this.stateSocket;
			return (tmp);
		}

	};


	/*
		---------- [StorageController]
	*/

	pkg.StorageController = function() {
		this.available = false;
		this.storageKey = null;
		this.storageType = null;
		this.dataParsed = null;
	};
	pkg.StorageController.prototype = {

		init:function(key, type) {
		/* 初期化する
		   - p1 : キー
		   - p2 : ストレージタイプ
		     ストレージタイプ :
		       - 0 … localStorage
		       - 1 … sessionStorage */

			this.storageKey = key;
			this.storageType = type;

			if (this.storageType == 0) {
				if ("localStorage" in window) {
					this.available = true;
				} else {
					this.available = false;
				}
			} else if (this.storageType == 1) {
				if ("sessionStorage" in window) {
					this.available = true;
				} else {
					this.available = false;
				}
			}
		},

		loadData:function(opt) {
		/* データを読み込む
		   - p1 : パースオプション */

			var data;
			if (this.available == true) {
				if (this.storageType == 0) {
					data = window.localStorage.getItem(this.storageKey);
				} else if (this.storageType == 1) {
					data = window.sessionStorage.getItem(this.storageKey);
				}
				if (data == undefined) {
					data = "";
				}
			} else {
				data = null;
			}
			if ((data != "") && (opt == true)) {
				this.dataParsed = JSON.parse(data);
			}

			return (data);
		},

		getParsedData:function() {
		/* 配列化されたデータを取得する */

			var tmp = kashiwa.clone(this.dataParsed);
			return (tmp);
		},

		saveData:function(dat, opt) {
		/* データを保存する
		   - p1 : 保存するデータ
		   - p2 : パースオプション */

			var data = dat;
			if (this.available == true) {
				if (opt == true) {
					data = JSON.stringify(data);
				}
				if (this.storageType == 0) {
					window.localStorage.setItem(this.storageKey, data);
				} else if (this.storageType == 1) {
					window.sessionStorage.setItem(this.storageKey, data);
				}
			}
		},

		deleteData:function() {
		/* データを削除する */

			if (this.available == true) {
				if (this.storageType == 0) {
					window.localStorage.removeItem(this.storageKey);
				} else if (this.storageType == 1) {
					window.sessionStorage.removeItem(this.storageKey);
				}
			}
		}

	};



	/* --------------------
	    画像の制御
	-------------------- */

	/*
		---------- [SVGLoader]
	*/

	pkg.SVGLoader = function(rand) {
	/* - p1 : ランダムフレーズ */

		this.randomPhrase = null;
		if (rand) {
			this.randomPhrase = rand;
		}
		this.imgData = null;
	};
	pkg.SVGLoader.prototype = {

		init:function(path) {
		/* SVGデータの読み込みを初期化する
		   - p1 : SVGファイルのパス */

			this.imgData = null;

			var _this = this;
			var xhr = new kashiwa.HttpRequestController();
			xhr.init(path, 0, 0);
			xhr.start(function() {
			// 読み込みが完了

				// 取得したSVGデータからBlobオブジェクトを生成する
				var data = this.getData();
				var blobSVG = new Blob([data], {type: "image/svg+xml"});

				// URLオブジェクトからFileオブジェクトのURLを生成する
				var urlObj = self.URL || self.webkitURL || self;
				var url = urlObj.createObjectURL(blobSVG);

				// URLからImageオブジェクトを生成する
				_this.imgData = new Image();
				_this.imgData.src = url;
				_this.imgData.onload = function() {
					// URLオブジェクトからURLを削除
					urlObj.revokeObjectURL(url); //画像のFileオブジェクトのURLを削除

					pkg.addEvent("imageDataLoaded");
				};
			},
			function() {
			// 読み込みエラー

				return false;
			});
		},

		getData:function() {
		/* SVGデータを取得する */

			var img = this.imgData;
			return (img);
		}

	};


	/*
		---------- [PictureLoader]
	*/

	pkg.PictureLoader = function(rand) {
	/* - p1 : ランダムフレーズ */

		this.randomPhrase = null;
		if (rand) {
			this.randomPhrase = rand;
		}

		this.srcPic = new Array();
		this.imgPic = new Array();
		this.orderLoading = new Array();

		this.loadingIdList = new Array();
		this.loadingPathList = new Array();
		this.cntProgress = 0;

		this.flgLoadedPic = new Array();
		this.flgErrorPic = new Array();
	};
	pkg.PictureLoader.prototype = {

		initPictures:function() {
		/* 画像リストを初期化する */

			this.srcPic = new Array();
			this.flgLoadedPic = new Array();
			this.flgErrorPic = new Array();
		},

		addPictures:function(pic_list) {
		/* 画像を追加する
		   - p1 : 画像パスのリスト[Array] */

			firstId = this.srcPic.length;
			for (var i = 0; i < pic_list.length; i ++) {
				this.srcPic[firstId + i] = pic_list[i];
				this.flgLoadedPic[firstId + i] = false;
				this.flgErrorPic[firstId + i] = false;
			}
		},

		inputOrder:function(order) {
		/* 読み込み順序を適用する
		   - p1 : IDが順に並んだリスト[Array]
		   (指定が無い場合,ID昇順) */

			this.orderLoading = new Array();
			for (var i = 0; i < order.length; i ++) {
				this.orderLoading[i] = order[i];
			}
		},

		startLoading:function(fn_oncomp, fn_onload, fn_onerror, opt) {
		/* 読み込みを開始する
		   - p1 : 全画像読み込み完了時に実行する関数
		   - p2 : 読み込み完了時に実行する関数(アイテムごと)
		   - p3 : 読み込みエラー時に実行する関数(アイテムごと)
		   - p4 : オプション(0= 全ての画像 / 1= order指定された画像のみ) */

			var funcOnComp = fn_oncomp;
			var funcOnLoad = fn_onload;
			var funcOnError = fn_onerror;

			var _this = this;
			var tmp_id, i, m, n, target_id;

			// 読込用のリストを作る
			this.loadingIdList = new Array();
			this.loadingPathList = new Array();

			for (i = 0; i < this.srcPic.length; i ++) {

				if ((this.orderLoading.length > 0) && (this.orderLoading.length - 1 >= i)) {
				// 読込順 指定あり

					tmp_id = this.orderLoading[i];
				} else {
				// 読込順 指定なし

					if (opt == 1) {
					// オプションが指定されている場合,order外の画像を読み込まない
						break;
					}

					for (m = 0; m < this.srcPic.length; m ++) {
						// まだ追加されていない画像を探す
						tmp_id = m;
						for (n = 0; n < this.loadingIdList.length; n ++) {
							if (tmp_id == this.loadingIdList[n]) {
								tmp_id = -1;
								break;
							}
						}
						if (tmp_id != -1) {
							break;
						}
					}
				}
				this.loadingIdList.push(tmp_id);
				this.loadingPathList.push(this.srcPic[tmp_id] + "?" + this.randomPhrase);
			}

			// 画像の読み込み開始
			this.cntProgress = 0;
			for (i = 0; i < this.loadingPathList.length; i ++) {
				target_id = this.loadingIdList[i];
				if (this.flgLoadedPic[target_id] == true) {
				// 既に読込完了していればスキップ
					continue;
				}

				this.imgPic[target_id] = new Image();
				this.imgPic[target_id].src = this.loadingPathList[i];
				(function(id) {
					if (_this.imgPic[id].addEventListener) {
						// 読込完了時
						_this.imgPic[id].addEventListener('load', function() {
							_this.flgLoadedPic[id] = true;
							if (funcOnLoad) {
								funcOnLoad(id);
							}
							checkCompleted();
						}, false);

						// 読込エラー時
						_this.imgPic[id].addEventListener('error', function() {
							_this.flgLoadedPic[id] = true;
							_this.flgErrorPic[id] = true;
							if (funcOnError) {
								funcOnError(id);
							}
							checkCompleted();
						}, false);

					}
				})(target_id);
			}

			function checkCompleted() {
			// 読込完了を確認
				_this.cntProgress ++;
				if (_this.cntProgress >= _this.loadingPathList.length) {
					if (funcOnComp) {
						funcOnComp();
					}
				}
			};
		},

		getPictureState:function(id) {
		/* 画像の読み込み状態を取得する
		   - p1 : 画像ID
		   - return ( 状態コード )
		     状態コード :
		       - -1 … 未定義
		       -  0 … 読み込み前
		       -  1 … 読み込み完了
		       -  2 … エラー */

			var value;
			if (this.flgLoadedPic[id] == undefined) {
				value = -1;
			} else if (this.flgLoadedPic[id] == false) {
				value = 0;
			} else {
				if (this.flgErrorPic[id] == true) {
					value = 2;
				} else {
					value = 1;
				}
			}
			return (value);
		},

		getProgress:function(type) {
		/* 読み込みの進捗を取得する
		   - p1 : 情報タイプ
		     情報タイプ :
		       -  0 … 進捗割合(0～1.0)
		       -  1 … 完了個数
		       -  2 … 全体個数 */

			var value = 0;
			var tmp;
			if (type == 0) {
				tmp = 0;
				for (var i = 0; i < this.srcPic.length; i ++) {
					if ((this.flgLoadedPic[i] == true) || (this.flgErrorPic[i] == true)) {
						tmp ++;
					}
				}
				value = tmp / this.srcPic.length;
			} else if (type == 1) {
				for (var i = 0; i < this.srcPic.length; i ++) {
					if ((this.flgLoadedPic[i] == true) || (this.flgErrorPic[i] == true)) {
						value ++;
					}
				}
			} else if (type == 2) {
				value = this.srcPic.length;
			}

			return (value);
		},

		deleteLoadedPicture:function(id) {
		/* 画像をメモリ上から削除する
		   - p1 : 画像ID */

			this.imgPic[id] = null;
			this.flgLoadedPic[id] = false;
			this.flgErrorPic[id] = false;
		},

		replacePicture:function(id, path) {
		/* 既存の画像を別の画像に置き換える
		   - p1 : 画像ID
		   - p2 : 画像のパス */

			this.deleteLoadedPicture(id);
			this.srcPic[id] = path;
		},

		getPictureObj:function(id) {
		/* 画像オブジェクトを取得する
		   - p1 : 画像ID */

			return (this.imgPic[id]);
		}

	};


	/*
		---------- [PictureController]
	*/

	pkg.PictureController = function(canv, img_pxr, pxr) {
	/* - p1 : バッファとして使うCanvas
	   - p2 : 画像が対応する最大ピクセル密度
	   - p3 : ディスプレイのピクセル密度 */

		this.canvas = canv;
		this.imgPxr = img_pxr;
		this.dispPxr = pxr;

		this.imgPic = new Array();
		this.picPosX = new Array();
		this.picPosY = new Array();
		this.picSizeW = new Array();
		this.picSizeH = new Array();
	};
	pkg.PictureController.prototype = {

		init:function(img_list) {
		/* 初期化する
		   - p1 : imgオブジェクトが入った配列 */

			for (var i = 0; i < img_list.length; i ++) {
				this.imgPic[i] = img_list[i];
			}
		},

		makeBuffer:function() {
		/* 画像バッファを作成する */

			// バッファサイズと画像の描画位置を求める
			var currentX = 0;
			var currentY = 0;
			var currentW = 0;
			var currentH = 0;
			var maxCurrentW = 0;
			var maxCurrentH = 0;

			for (var i = 0; i < this.imgPic.length; i ++) {
				if (this.imgPic[i]) {
					this.picSizeW[i] = this.imgPic[i].width / this.imgPxr * this.dispPxr;
					this.picSizeH[i] = this.imgPic[i].height / this.imgPxr * this.dispPxr;
				} else {
					this.picSizeW[i] = 20 * this.dispPxr;
					this.picSizeH[i] = 20 * this.dispPxr;
				}
				if (currentH + this.picSizeH[i] + 10 > 2040) { // Bug Fix (+ 10)
					currentX += currentW;
					currentY = 0;
					currentW = 0;
					currentH = 0;
				}

				this.picPosX[i] = currentX;
				this.picPosY[i] = currentY;
				if (this.picSizeW[i] > currentW) {
					currentW = this.picSizeW[i];
				}
				currentH += this.picSizeH[i];
				if (currentH > maxCurrentH) {
					maxCurrentH = currentH;
				}

				currentY += this.picSizeH[i];
			}
			maxCurrentW = currentX + currentW;

			// キャンバスを作成する
			this.canvas.width = maxCurrentW;
			this.canvas.height = maxCurrentH + 20; // Bug Fix (Android, + 20)
			var ctxCanv = this.canvas.getContext('2d');
			ctxCanv.clearRect(0, 0, this.canvas.width, this.canvas.height);
			ctxCanv.globalAlpha = 1.0;

			// バッファに画像を並べる
			for (var i = 0; i < this.imgPic.length; i ++) {
				if (this.imgPic[i]) {
					ctxCanv.drawImage(this.imgPic[i],
						0, 0, this.imgPic[i].width, this.imgPic[i].height,
						this.picPosX[i], this.picPosY[i], this.picSizeW[i], this.picSizeH[i]);
				} else {
					ctxCanv.fillStyle = 'rgb(128, 128, 128)';
					ctxCanv.fillRect(this.picPosX[i], this.picPosY[i], this.picSizeW[i], this.picSizeH[i]);
				}
			}
		},

		getPictureInfo:function(id) {
		/* 画像の情報を取得する
		   - p1 : 画像ID
		   - return (
			   x: シート上のX座標,
			   y: シート上のY座標,
			   w: シート上の横幅,
			   h: シート上の高さ
			   ) */

			var obj = {};
			obj.x = Math.floor(this.picPosX[id] / this.dispPxr);
			obj.y = Math.floor(this.picPosY[id] / this.dispPxr);
			obj.w = Math.floor(this.picSizeW[id] / this.dispPxr);
			obj.h = Math.floor(this.picSizeH[id] / this.dispPxr);

			return (obj);
		}

	};


	/*
		---------- [ThumbController]
	*/

	pkg.ThumbController = function(canvas, size_w, size_h, sp_max, pxr) {
	/* - p1 : バッファとして使うCanvas
	   - p2 : スプライトの幅(ピクセル密度適用前)
	   - p3 : スプライトの高さ(ピクセル密度適用前)
	   - p4 : 使用するスプライト数の上限
	   - p5 : ディスプレイのピクセル密度 */

		this.canv = canvas;
		this.ctx = this.canv.getContext('2d');
		this.dispPxr = pxr;
		this.picSizeW = Math.floor(size_w) * this.dispPxr + 1;
		this.picSizeH = Math.floor(size_h) * this.dispPxr + 1;
		this.spriteMax = sp_max;

		this.init();
	};
	pkg.ThumbController.prototype = {

		init:function() {
		/* 初期化する */

			this.bufPos = new Array();
			for (var i = 0; i < this.spriteMax; i ++) {
				this.bufPos[i] = new Array();
			}
		},

		makeBuf:function() {
		/* バッファを作成する */

			// バッファサイズと画像の描画位置を求める
			var currentX = 0, currentY = 0, currentW = 0, currentH = 0;
			var maxCurrentW = 0, maxCurrentH = 0;

			for (var i = 0; i < this.spriteMax; i ++) {
				if (currentH + this.picSizeH + 10 > 2040) { // Bug Fix (+ 10)
					currentX += currentW;
					currentY = 0;
					currentW = 0;
					currentH = 0;
				}

				this.bufPos[i][0] = currentX;
				this.bufPos[i][1] = currentY;
				if (this.picSizeW > currentW) {
					currentW = this.picSizeW;
				}
				currentH += this.picSizeH;
				if (currentH > maxCurrentH) {
					maxCurrentH = currentH;
				}

				currentY += this.picSizeH;
			}
			maxCurrentW = currentX + currentW;

			// キャンバスのサイズを決定する
			this.canv.width = maxCurrentW + 10;
			this.canv.height = maxCurrentH + 20; // Bug Fix (Android, + 20)
			this.ctx.clearRect(0, 0, this.canv.width, this.canv.height);
			this.ctx.globalAlpha = 1.0;
		},

		drawThumb:function(img_obj, buf_id) {
		/* バッファに画像を描画する
		   - p1 : 画像オブジェクト
		   - p2 : バッファID */

			this.ctx.drawImage(img_obj,
				0, 0, img_obj.width, img_obj.height,
				this.bufPos[buf_id][0], this.bufPos[buf_id][1], this.picSizeW, this.picSizeH);
		},

		getPos:function(buf_id) {
		/* 画像の位置を返す
		   - p1 : バッファID
		   - return ( [シート上のX座標, Y座標] ) */

			var tmp_x = Math.floor(this.bufPos[buf_id][0] / this.dispPxr);
			var tmp_y = Math.floor(this.bufPos[buf_id][1] / this.dispPxr);

			return ([tmp_x, tmp_y]);
		}

	};



	/* --------------------
	    インタラクション
	-------------------- */

	/*
		---------- [Easing]
	*/

	pkg.Easing = function(steps, ac) {
		this.valSteps = steps;
		this.valAccel = ac;
	};
	pkg.Easing.prototype = {
		getRate:function(step) {
		var times = step / this.valSteps;
		return (
			(100 + this.valAccel) * times /
			(2 * this.valAccel * times + 100 - this.valAccel));
		}
	};



	/* --------------------
	    ユーティリティ
	-------------------- */

	/*
		---------- [Debugger]
	*/

	pkg.Debugger = function() {
		this.outputObj = document.getElementById('debugger');
	};
	pkg.Debugger.prototype = {
		write:function(val) {
			this.outputObj.innerHTML = val;
		}
	};


})(kashiwa);


//EOF
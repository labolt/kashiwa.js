/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     kashiwa.js
   ──────────────────────────────
     Ver. 5.0.0
     Copyright(c) 2014-2015 ARINOKI
     Released under the MIT license
     http://opensource.org/licenses/mit-license.php
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ──────────────────────────────

     + [テンプレートの定義]
     |  |
     |  + Main_Template
     |  |
     |  + Scene_Template
     |
     + [シーンの制御]
     |  |
     |  + FrameTimer
     |  |
     |  + SceneController
     |
     + [ブラウザの制御]
     |  |
     |  + DeviceInfo
     |  |
     |  + WindowController
     |
     + [キー入力の制御]
     |  |
     |  + InputChecker
     |  |
     |  + GetInput
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
     |  + PictureLoader
     |  |
     |  + PictureController
     |  |
     |  + ThumbController
     |
     + [表示・演出]
     |  |
     |  + LoadingAnime
     |  |
     |  + ButtonController
     |  |
     |  + Easing
     |
     + [ユーティリティ]
     |  |
     |  + Debugger
     |
     + [各種関数の定義]

   ────────────────────────────── */

var kashiwa = {};
(function(pkg) {

	/* --------------------
	    テンプレートの定義
	-------------------- */

	/*
		---------- [Main_Template]
	*/

	pkg.Main_Template = function() {
		this.frameTimer = new kashiwa.FrameTimer();
		this.reqFrame = null;
		this.flgRunning = false;
		this.getReqAniFrame();
	};
	pkg.Main_Template.prototype = {

		init:function() {
		/* 状態を初期化 */

			this.start();
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

			this.flgRunning = true;
			this.startReqAniFrame();
		},

		stop:function() {
		/* 繰り返し処理の停止 */

			this.flgRunning = false;
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

		resizeHandler:function() {
		/* リサイズ時の処理 */

			return false;
		},

		getResized:function(dInfo) {
		/* リサイズの取得 */

			var _this = this;
			if ((dInfo.getOS() == 1) || ((dInfo.getOS() == 2) && (dInfo.getBrowser() == 4))) {
				// iOS, Android(Chrome)
				window.addEventListener("orientationchange", function() {
					_this.resizeHandler();
				}, false);
			}
			if ((dInfo.getOS() == 0) || (dInfo.getOS() == 2) || (dInfo.getOS() == 3)) {
				window.addEventListener("resize", function() {
					if ((dInfo.getOS() == 0) || (dInfo.getOS() == 3)) {
						// PC, WindowsPhone
						_this.resizeHandler();
					} else if ((dInfo.getOS() == 2) && ((dInfo.getBrowser() == 0) || (dInfo.getBrowser() == 2))) {
						// Android(標準ブラウザ), Android(Opera)
						var tmpW = Math.floor(window.outerWidth / window.devicePixelRatio);
						if (tmpW != dInfo.getScale(0)) {
							_this.resizeHandler();
						}
					}
				}, false);
			}
		}

	};


	/*
		---------- [Scene_Template]
	*/

	pkg.Scene_Template = function(common_vars) {
		this.common = common_vars;
		this.sceneCtrl = this.common.sceneCtrl;
		this.inputChk = this.common.inputChk;
		this.transitionState = -1;
		this.transitionCnt = 0;
		this.transitionRate = 1;
	};
	pkg.Scene_Template.prototype = {

		init:function() {
		/* 初期化処理 */

			return false;
		},

		open:function() {
		/* オープン時 */

			this.transitionState = 0;
			this.transitionCnt = 0;

			this.openEx();
		},

		openEx:function() {
		/* オープン時 追加処理 */

			return false;
		},

		close:function() {
		/* クローズ時 */

			this.transitionState = 2;
			this.transitionCnt = 0;

			this.closeEx();
		},

		closeEx:function() {
		/* クローズ時 追加処理 */

			return false;
		},

		update:function() {
		/* 画面更新,入力チェック */

			this.updateTransition(1, 1);
		},

		updateTransition:function(op_cnt_max, cl_cnt_max) {
		/* 画面遷移の更新 */

			// 画面遷移のカウンタ
			if ((this.transitionState == 0) || (this.transitionState == 2)) {
				this.transitionCnt += this.transitionRate;

				// 画面遷移の完了
				if ((this.transitionState == 0) && (this.transitionCnt >= op_cnt_max)) {
					this.transitionState = 1;
					this.common.sceneCtrl.transitionHandler();
					this.transitionCompletedOpEx();
				}
				if ((this.transitionState == 2) && (this.transitionCnt >= cl_cnt_max)) {
					this.transitionState = -1;
					this.common.sceneCtrl.transitionHandler();
					this.transitionCompletedClEx();
				}
			}
		},

		transitionCompletedOpEx:function() {
		/* オープン完了時 追加処理 */

			return false;
		},

		transitionCompletedClEx:function() {
		/* クローズ完了時 追加処理 */

			return false;
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

		this.listScene = new Array();
		this.listUI = new Array();
		this.relatedIdsUI = new Array();
		this.listBg = new Array();
		this.relatedIdsBg = new Array();
		this.queueList = new Array();
	};
	pkg.SceneController.prototype = {

		init:function(sc_list) {
		/* コントローラを初期化する
		   - p1 : シーンインスタンスのリスト[Array] */

			this.listScene = [];
			for (var i = 0; i < sc_list.length; i ++) {
				this.listScene[i] = sc_list[i];
			}
			this.state = -1;
			this.currentId = 0;
			this.enqueueScene(this.currentId);
		},

		registerUI:function(ui_list, id_list) {
		/* UIを登録する
		   - p1 : UIインスタンスのリスト[Array]
		   - p2 : 各シーンに対するp1項目の紐付け[Array]
		          対応するUIインスタンスを指定しない場合は -1 とする */

			for (var i = 0; i < ui_list.length; i ++) {
				this.listUI[i] = ui_list[i];
			}
			for (var i = 0; i < this.listScene.length; i ++) {
				this.relatedIdsUI[i] = id_list[i];
			}
		},

		registerBg:function(bg_list, id_list) {
		/* 背景を登録する
		   - p1 : 背景インスタンスのリスト[Array]
		   - p2 : 各シーンに対するp1項目の紐付け[Array]
		          対応する背景インスタンスを指定しない場合は -1 とする */

			for (var i = 0; i < bg_list.length; i ++) {
				this.listBg[i] = bg_list[i];
			}
			for (var i = 0; i < this.listScene.length; i ++) {
				this.relatedIdsBg[i] = id_list[i];
			}
		},

		update:function() {
		/* シーンをアップデートする */

			if (this.relatedIdsUI[this.currentId] != -1) {
				this.listUI[this.relatedIdsUI[this.currentId]].update();
			}
			this.listScene[this.currentId].update();
			if (this.relatedIdsBg[this.currentId] != -1) {
				this.listBg[this.relatedIdsBg[this.currentId]].update();
			}
		},

		enqueueScene:function(id) {
		/* シーン切替キューにシーンを追加する
		   - p1 : 追加するシーンid */

			this.queueList.push(id);
		},

		dequeueScene:function() {
		/* シーン切替キューから1項目実行して削除する */

			var startFlg = false;
			if ((this.state != 2) && (this.queueList.length < 1)) {
				return (-1);
			}
			if (this.state == -1) {
				this.nextId = this.queueList.shift();
				this.state = 2;
				startFlg = true;
			}
			if (this.state == 0) {
				// 現在のシーンをクローズ
				this.transCnt = 0;
				this.nextId = this.queueList.shift();
				this.listScene[this.currentId].close();
				if (this.relatedIdsBg[this.currentId] == this.relatedIdsBg[this.nextId]) {
					this.transCnt ++;
				} else {
					if (this.relatedIdsBg[this.currentId] != -1) {
						this.listBg[this.relatedIdsBg[this.currentId]].close();
					} else {
						// Bgが存在しない場合は即時遷移完了とする
						this.transitionHandler();
					}
				}
				if (this.relatedIdsUI[this.currentId] == this.relatedIdsUI[this.nextId]) {
					this.transCnt ++;
				} else {
					if (this.relatedIdsUI[this.currentId] != -1) {
						this.listUI[this.relatedIdsUI[this.currentId]].close();
					} else {
						// UIが存在しない場合は即時遷移完了とする
						this.transitionHandler();
					}
				}
				this.state = 1;
			} else if (this.state == 2) {
				// 次のシーンをオープン
				this.transCnt = 0;
				this.listScene[this.nextId].open();
				if ((this.relatedIdsBg[this.currentId] == this.relatedIdsBg[this.nextId]) &&
					(startFlg != true)) {
					this.transCnt ++;
				} else {
					if (this.relatedIdsBg[this.nextId] != -1) {
						this.listBg[this.relatedIdsBg[this.nextId]].open();
					} else {
						// Bgが存在しない場合は即時遷移完了とする
						this.transitionHandler();
					}
				}
				if ((this.relatedIdsUI[this.currentId] == this.relatedIdsUI[this.nextId]) &&
					(startFlg != true)) {
					this.transCnt ++;
				} else {
					if (this.relatedIdsUI[this.nextId] != -1) {
						this.listUI[this.relatedIdsUI[this.nextId]].open();
					} else {
						// UIが存在しない場合は即時遷移完了とする
						this.transitionHandler();
					}
				}
				this.currentId = this.nextId;
				this.state = 3;
			}
			return (0);
		},

		transitionHandler:function() {
		/* Scene, UI, Bg 全ての遷移を確認する */

			this.transCnt ++;
			if (this.transCnt >= 3) {
				if (this.state == 1) {
					this.state = 2;
				} else if (this.state == 3) {
					this.state = 0;
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

		getOS:function() {
		/* OS情報を取得する
		   - return ( OSコード )
		     OSコード :
		       - -1 … 未取得
		       -  0 … 下記以外(PCなど)
		       -  1 … iOS
		       -  2 … Android
		       -  3 … Windows Phone */

			if (this.debug) { return (0); }
			var tmp = this.deviceOS;
			return (tmp);
		},

		getTablet:function() {
		/* タブレットか否かを取得する
		   - return ( 判別コード )
		     判別コード :
		       - true … タブレット端末 */

			var tmp = this.tablet;
			return (tmp);
		},

		getBrowser:function() {
		/* ブラウザ情報を取得する
		   - return ( ブラウザコード )
		     ブラウザコード :
		       - -1 … 未取得
		       -  0 … WebKit
		       -  1 … Internet Explorer
		       -  2 … Opera
		       -  3 … Firefox
		       -  4 … Chrome(Android) */

			var tmp = this.browser;
			return (tmp);
		},

		getScale:function(type) {
		/* 画面解像度を取得する
		   - p1 : 取得する情報タイプ
		     情報タイプ :
		       - 0 … deviceW
		       - 1 … deviceH
		       - 2 … viewAreaW
		       - 3 … viewAreaH
		       - 4 … pixelW
		       - 5 … pixelH
		       - 6 … devicePxr */

			var tmp;
			if (type == 0) {
				tmp = this.deviceW;
				if (this.debug) { tmp = 320; }
			} else if (type == 1) {
				tmp = this.deviceH;
				if (this.debug) { tmp = 480; }
			} else if (type == 2) {
				tmp = this.viewAreaW;
				if (this.debug) { tmp = 320; }
			} else if (type == 3) {
				tmp = this.viewAreaH;
				if (this.debug) { tmp = 416; }
			} else if (type == 4) {
				tmp = this.pixelW;
				if (this.debug) { tmp = 640; }
			} else if (type == 5) {
				tmp = this.pixelH;
				if (this.debug) { tmp = 832; }
			} else if (type == 6) {
				tmp = this.devicePxr;
				if (this.debug) { tmp = 2; }
			}
			return (tmp);
		}

	};


	/*
		---------- [WindowController]
	*/

	pkg.WindowController = function() {
	};
	pkg.WindowController.prototype = {

		resizeHandler:function() {
		/* リサイズ時の処理 */

			return false;
		},

		getResized:function(dInfo) {
		/* リサイズの取得 */

			var curObj = this;
			if ((dInfo.getOS() == 1) || ((dInfo.getOS() == 2) && (dInfo.getBrowser() == 4))) {
				// iOS, Android(Chrome)
				window.addEventListener("orientationchange", function() {
					curObj.resizeHandler();
				}, false);
			}
			if ((dInfo.getOS() == 0) || (dInfo.getOS() == 2) || (dInfo.getOS() == 3)) {
				window.addEventListener("resize", function() {
					if ((dInfo.getOS() == 0) || (dInfo.getOS() == 3)) {
						// PC, WindowsPhone
						curObj.resizeHandler();
					} else if ((dInfo.getOS() == 2) && ((dInfo.getBrowser() == 0) || (dInfo.getBrowser() == 2))) {
						// Android(標準ブラウザ), Android(Opera)
						var tmpW = Math.floor(window.outerWidth / window.devicePixelRatio);
						if (tmpW != dInfo.getScale(0)) {
							curObj.resizeHandler();
						}
					}
				}, false);
			}
		}

	};



	/* --------------------
	    キー入力の制御
	-------------------- */

	/*
		---------- [InputChecker]
	*/

	pkg.InputChecker = function(touch, queflg) {
	/* - p1 : タッチデバイスフラグ(=true : タッチ有効化)
	   - p2 : キュー利用フラグ(=true : キュー有効化) */

		this.touchFlg = touch;
		this.enableQueue = queflg;

		this.currentKeyInfo = new Array();
		this.queueList = new Array();
		this.firstDownFlg = false;
		this.keepDownFlg = false;

		this.preventive = false;

		this.init();
	};
	pkg.InputChecker.prototype = {

		init:function() {
		/* チェッカーを初期化する */

			this.currentKeyInfo = [0, -1, -1];
			this.queueList = [];
			this.firstDownFlg = false;
			this.keepDownFlg = false;
		},

		keyHandler:function(vals) {
		/* 入力キーをキューに追加する */

			var mouseX       = vals[0];
			var mouseY       = vals[1];
			var mouseOnFlg   = vals[2];
			var mouseDownFlg = vals[3];

			// 現在の値を設定
			if (mouseDownFlg == true) {
				this.currentKeyInfo[0] = 1;
				this.firstDownFlg = true;
			} else {
				this.currentKeyInfo[0] = 0;
				this.firstDownFlg = false;
				this.keepDownFlg = false;
			}
			this.currentKeyInfo[1] = mouseX;
			this.currentKeyInfo[2] = mouseY;

			if (this.enableQueue == true) {
			// キューを使用する
				if (this.queueList.length > 0) {
				// キューがある場合
					if (this.currentKeyInfo[0] != 2) {
						if (((this.currentKeyInfo[0] != 0) || (this.queueList[this.queueList.length - 1][0] != 0)) &&
							((this.currentKeyInfo[0] != 1) || (this.queueList[this.queueList.length - 1][0] != 1))) {
							// キューに追加 (mouse_down_keepingを除く)
							this.queueList.push([this.currentKeyInfo[0], this.currentKeyInfo[1], this.currentKeyInfo[2]]);
						}
					}
				} else {
				// キューが無い場合
					// キューの先頭に追加
					this.queueList.push([this.currentKeyInfo[0], this.currentKeyInfo[1], this.currentKeyInfo[2]]);
				}
			}
		},

		update:function() {
		/* 入力情報を更新する */

			// 重複除外フラグを初期化
			this.preventive = false;

			// 押しっぱなし判定
			if ((this.keepDownFlg == true) && (this.currentKeyInfo[0] == 1)) {
				this.currentKeyInfo[0] = 2;
			} else if (this.firstDownFlg == true) {
				this.keepDownFlg = true;
			}

			if (this.enableQueue == true) {
			// キューを使用する
				if (this.queueList.length > 0) {
				// キューがある場合
					var tmp = this.queueList.shift();
					this.returnVal = [tmp[0], Math.floor(tmp[1]), Math.floor(tmp[2])];
				} else {
				// キューが無い場合
					this.returnVal = [this.currentKeyInfo[0],
						Math.floor(this.currentKeyInfo[1]), Math.floor(this.currentKeyInfo[2])];
				}
			}
		},

		skipCurrentFrame:function() {
		/* 今のフレームで以降の検出を除外する */

			this.preventive = true;
		},

		getTouch:function() {
		/* タッチ,ポインタ入力値を取得する
		   - return ( [入力コード, 入力時のx座標, 入力時のy座標] )
		     入力コード :
		       - mouse_up … 0
		       - mouse_down … 1
		       - mouse_down_keeping … 2 */

			var tmp;
			if (this.enableQueue == true) {
			// キューを使用する
				tmp = kashiwa.clone(this.returnVal);
			} else {
			// キューを使用しない
				tmp = kashiwa.clone(this.currentKeyInfo);
			}

			// 重複チェックの除外
			if (this.preventive == true) {
				tmp[0] = 0;
			}
			return (tmp);
		}

	};


	/*
		---------- [GetInput]
	*/

	pkg.GetInput = function(element, touch) {
	/* - p1 : キーチェックを行うDOMエレメント
	   - p2 : タッチデバイスフラグ(=true : タッチ有効化) */

		this.canv = element;
		this.touchFlg = touch;

		this.init();
	};
	pkg.GetInput.prototype = {

		init:function() {
		/* チェッカーを初期化する */

			this.mouseX = 0;
			this.mouseY = 0;
			this.mouseOnFlg = false;
			this.mouseDownFlg = false;

			this.event = document.createEvent("HTMLEvents");
			this.event.initEvent("af_input", true, true);
		},

		start:function() {
		/* キーチェックを開始する */

			var curObj = this;

			if (this.touchFlg == true) {
			// タッチデバイス
				// TouchStart, TouchMove
				var getTouchPosition = function(e) {
					e.preventDefault();
					curObj.mouseOnFlg = true;
					curObj.mouseDownFlg = true;
					var rect = curObj.canv.getBoundingClientRect();
					curObj.mouseX = e.touches[0].pageX - rect.left;
					curObj.mouseY = e.touches[0].pageY - rect.top;
					curObj.dispatchInputEvent();
				}
				this.canv.ontouchstart = getTouchPosition;
				this.canv.ontouchmove = getTouchPosition;

				// TouchEnd
				var getTouchEnd = function(e) {
					e.preventDefault();
					curObj.mouseDownFlg = false;
					curObj.dispatchInputEvent();
				}
				this.canv.ontouchend = getTouchEnd;
			} else {
			// 非タッチデバイス
				// MouseOver, MouseMove
				var getMousePosition = function(e) {
					curObj.mouseOnFlg = true;
					var rect = curObj.canv.getBoundingClientRect();
					curObj.mouseX = e.clientX - rect.left;
					curObj.mouseY = e.clientY - rect.top;
					curObj.dispatchInputEvent();
				}
				this.canv.onmousemove = getMousePosition;
				this.canv.onmouseover = getMousePosition;

				// MouseUp
				var getMouseUp = function(e) {
					curObj.mouseDownFlg = false;
					curObj.dispatchInputEvent();
				}
				this.canv.onmouseup = getMouseUp;

				// MouseDown
				var getMouseDown = function(e) {
					curObj.mouseDownFlg = true;
					curObj.dispatchInputEvent();
				}
				this.canv.onmousedown = getMouseDown;
			}

			// MouseOut
			var getMouseOut = function(e) {
				curObj.mouseOnFlg = false;
				curObj.dispatchInputEvent();
			}
			this.canv.onmouseout = getMouseOut;
		},

		dispatchInputEvent:function() {
		/* 入力イベントの送信 */

			this.canv.dispatchEvent(this.event);
		},

		getVals:function() {
		/* キー入力値を返す */

			var curObj = this;
			var vals = {};
			(function(inside) {
				if ((curObj.touchFlg == true) && (curObj.mouseDownFlg == false)) {
				// タッチデバイスでタッチされていない時
					inside.mouseX = -1;
					inside.mouseY = -1;
				} else if ((curObj.touchFlg == false) && (curObj.mouseOnFlg == false)) {
					inside.mouseX = -1;
					inside.mouseY = -1;
				} else {
					inside.mouseX = curObj.mouseX;
					inside.mouseY = curObj.mouseY;
				}
				inside.mouseOnFlg = curObj.mouseOnFlg;
				inside.mouseDownFlg = curObj.mouseDownFlg;
			})(vals);

			return (vals);
		},

		stop:function() {
		/* キーチェックを停止する */

			if (this.touchFlg == true) {
			// タッチデバイス
				// TouchStart, TouchMove
				this.canv.ontouchstart = null;
				this.canv.ontouchmove = null;
				// TouchEnd
				this.canv.ontouchend = null;
			} else {
			// 非タッチデバイス
				// MouseOver, MouseMove
				this.canv.onmousemove = null;
				this.canv.onmouseover = null;
				// MouseUp
				this.canv.onmouseup = null;
				// MouseDown
				this.canv.onmousedown = null;
			}
			// MouseOut
			this.canv.onmouseout = null;
		}

	};



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
		   - p2 : 受信するデータ形式(=0:JSON / =1:XML)
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

			var curObj = this;

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
				if (curObj.xhr.readyState == 4) {
					if ((curObj.xhr.status == 200) || (curObj.xhr.status == 201)) {
					// データ取得完了
						curObj.state = 1;
						if (curObj.funcOnLoad) {
							curObj.funcOnLoad();
						}
					} else {
					// エラー
						curObj.state = 2;
						if (curObj.funcOnError) {
							curObj.funcOnError();
						}
					}
				} else if ((curObj.xhr.readyState == 2) || (curObj.xhr.readyState == 3)) {
				// 受信処理中
					curObj.state = 0;
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

			var curObj = this;
			this.socket.onopen = function(e){
			// 接続した
				curObj.stateSocket = 1;
			}
			this.socket.onclose = function(e){
			// 切断した
				curObj.stateSocket = 0;
			}
			this.socket.onerror = function(e){
			// エラーが発生した
				curObj.stateSocket = 2;
			}
			this.socket.onmessage = function(e){
			// メッセージを受信した
				curObj.message = e.data;
				curObj.flgMessage = true;
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
		---------- [PictureLoader]
	*/

	pkg.PictureLoader = function(rand) {
	/* - p1 : ランダムフレーズ */

		this.randomPhrase = rand;

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
		   - return ( [シート上のX座標, Y座標, 横幅, 高さ] ) */

			var info = [
				Math.floor(this.picPosX[id]),
				Math.floor(this.picPosY[id]),
				Math.floor(this.picSizeW[id]),
				Math.floor(this.picSizeH[id])
			];
			return (info);
		}

	};


	/*
		---------- [ThumbController]
	*/

	pkg.ThumbController = function(canvas, size_w, size_h, sp_max) {
	/* - p1 : バッファとして使うCanvas
	   - p2 : スプライトの幅(ピクセル実寸)
	   - p3 : スプライトの高さ(ピクセル実寸)
	   - p4 : 使用するスプライト数の上限 */

		this.canv = canvas;
		this.ctx = this.canv.getContext('2d');
		this.picSizeW = Math.floor(size_w) + 1;
		this.picSizeH = Math.floor(size_h) + 1;
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

			var tmp_x = Math.floor(this.bufPos[buf_id][0]);
			var tmp_y = Math.floor(this.bufPos[buf_id][1]);

			return ([tmp_x, tmp_y]);
		}

	};



	/* --------------------
	    表示・演出
	-------------------- */

	/*
		---------- [LoadingAnime]
	*/

	pkg.LoadingAnime = function(canv_ctx, device_pxr, cnt_max) {
	/* - p1 : 対象Canvasのコンテキスト
	   - p2 : デバイスのピクセル密度
	   - p3 : アニメーションカウンタの最大値 */

		this.ctx = canv_ctx;
		this.pxr = device_pxr;
		this.cntMax = cnt_max;
		this.cnt = 0;

		this.rotateCnt = 0;
		this.posX = 0;
		this.posY = 0;
		this.size = 100;
		this.pieceW = Math.round(this.size * 0.1);
		this.pieceH = Math.round(this.size * 0.25);
		this.radius = this.size / 2;
		this.color = 'rgb(0, 0, 0)';
	};
	pkg.LoadingAnime.prototype = {

		changePos:function(x, y) {
		/* 表示位置を変更する
		   - p1 : X座標
		   - p2 : Y座標 */

			this.posX = x;
			this.posY = y;
		},

		changeSize:function(w) {
		/* 表示サイズを変更する
		   - p1 : 一辺のサイズ */

			this.size = w;
			this.pieceW = Math.round(this.size * 0.1);
			this.pieceH = Math.round(this.size * 0.25);
			this.radius = this.size / 2;
		},

		changeColor:function(col) {
		/* 表示カラーを変更する
		   - p1 : カラー指定 */

			this.color = col;
		},

		update:function(cnt) {
		/* 表示を更新する */

			// カウンタを進める
			var amountCnt = 0;
			this.cnt += cnt;
			if (this.cnt >= this.cntMax) {
				while (this.cnt >= this.cntMax) {
					this.cnt -= this.cntMax;
					amountCnt ++;
				}
			}

			// 状態を保存
			this.ctx.save();

			// 描画座標に移動
			this.ctx.translate(this.posX * this.pxr, this.posY * this.pxr);

			// 回転カウンタを進める
			this.rotateCnt += amountCnt;
			if (this.rotateCnt > 12) {
				this.rotateCnt = 0;
			}
			this.ctx.rotate(30 * this.rotateCnt * Math.PI / 180);

			for (var i = 0; i < 12; i ++) {
				this.ctx.fillStyle = this.color;
				this.ctx.globalAlpha = 1 / 12 * i;
				this.ctx.beginPath();
				this.ctx.moveTo((0 - this.pieceW / 4) * this.pxr,
					(this.radius - this.pieceH) * this.pxr);
				this.ctx.quadraticCurveTo(0 * this.pxr, (this.radius - this.pieceH - this.pieceW / 2) * this.pxr,
					(0 + this.pieceW / 4) * this.pxr, (this.radius - this.pieceH) * this.pxr);
				this.ctx.lineTo((0 + this.pieceW / 2) * this.pxr, (this.radius - this.pieceW / 3) * this.pxr);
				this.ctx.quadraticCurveTo(0 * this.pxr, (this.radius + this.pieceW / 3) * this.pxr,
					(0 - this.pieceW / 2) * this.pxr, (this.radius - this.pieceW / 3) * this.pxr);
				this.ctx.closePath();
				this.ctx.fill();
				this.ctx.rotate(30 * Math.PI / 180);
			}

			// canvasの状態を元に戻す
			this.ctx.rotate(-30 * this.rotateCnt * Math.PI / 180);
			this.ctx.translate(-this.posX / 2 * this.pxr, -this.posY / 2 * this.pxr);
			this.ctx.restore();
		}

	};


	/*
		---------- [ButtonController]
	*/

	pkg.ButtonController = function(anime, key, touch) {
	/* - p1 : アニメーションのコマ数
	   - p2 : InputChecker */

		this.animeMax = anime;
		this.inputChk = key;
		this.touchFlg = touch;
		this.animeEasing = new pkg.Easing(this.animeMax, 50);

		this.init();
	};
	pkg.ButtonController.prototype = {

		init:function() {
		/* ステータスを初期化する */

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

			this.beforePos = [-1, -1];
		},

		defButton:function(posx, posy, bw, bh) {
		/* ボタンの位置・大きさを定義する
		   - p1 : ボタンのX座標
		   - p2 : ボタンのY座標
		   - p3 : ボタンの幅
		   - p4 : ボタンの高さ */

			this.btPosX = posx;
			this.btPosY = posy;
			this.btW = bw;
			this.btH = bh;
		},

		update:function(f_rate) {
		/* ボタンのステータスを更新する
		   - p1 : 前フレームからの進捗 */

			if (this.buttonHover == 1) {
				if (this.cntBtHover < this.animeMax) {
					this.cntBtHover += f_rate;
					if (this.cntBtHover > this.animeMax) {
						this.cntBtHover = this.animeMax;
					}
				}
			} else if (this.buttonHover == 2) {
				if (this.cntBtHover > 0) {
					this.cntBtHover -= f_rate;
					if (this.cntBtHover < 0) {
						this.cntBtHover = 0;
					}
				} else {
					this.buttonHover = 0;
				}
			}
			this.lvBtHover = this.animeEasing.getRate(this.cntBtHover);

			if (this.buttonState == 1) {
				if (this.cntBtState < this.animeMax) {
					this.cntBtState += f_rate;
					if (this.cntBtState > this.animeMax) {
						this.cntBtState = this.animeMax;
					}
				}
			} else if (this.buttonState == 2) {
				if (this.cntBtState > 0) {
					this.cntBtState -= f_rate;
					if (this.cntBtState < 0) {
						this.cntBtState = 0;
					}
				} else {
					this.buttonState = 0;
				}
			}
			this.lvBtState = this.animeEasing.getRate(this.cntBtState);

			this.input();
		},

		input:function() {
		/* ボタンの押下を確認する */

			var tmpPos = this.inputChk.getTouch();

			// ボタン判定
			if (this.touchFlg == true) {
			// タッチ端末

				if ((this.buttonHover == 1) && (tmpPos[1] < 0) && (this.beforePos[0] > 0)) {
				// タッチを放した時
					if ((this.beforePos[0] >= this.btPosX) && (this.beforePos[0] < this.btPosX + this.btW) &&
						(this.beforePos[1] >= this.btPosY) && (this.beforePos[1] < this.btPosY + this.btH)) {
					// 前回の座標がボタン上(＝確定操作)
						this.result = 1;
					}
				} else {
					if ((tmpPos[1] >= this.btPosX) && (tmpPos[1] < this.btPosX + this.btW) &&
						(tmpPos[2] >= this.btPosY) && (tmpPos[2] < this.btPosY + this.btH)) {
						// ホバーを確認する
						this.buttonHover = 1;
					} else if (this.buttonHover == 1) {
					// ホバーの終了
						this.buttonHover = 2;
						if (this.buttonState == 1) {
							this.buttonState = 2;
						}
					}
				}
			} else {
			// マウス端末

				if ((tmpPos[1] >= this.btPosX) && (tmpPos[1] < this.btPosX + this.btW) &&
					(tmpPos[2] >= this.btPosY) && (tmpPos[2] < this.btPosY + this.btH)) {
					// ホバーを確認する
					this.buttonHover = 1;

					if ((tmpPos[0] == 0) && (this.buttonState == 1)) {
					// 押しっぱなし状態からの解放(＝確定操作)
						this.result = 1;
						this.buttonState = 2;
					}
					if (tmpPos[0] == 1) {
					// 押しっぱなしを確認
						this.buttonState = 1;
					}
				} else if (this.buttonHover == 1) {
				// ホバーの終了
					this.buttonHover = 2;
					if (this.buttonState == 1) {
						this.buttonState = 2;
					}
				}
			}

			this.beforePos[0] = tmpPos[1];
			this.beforePos[1] = tmpPos[2];
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

		releasePress:function() {
		/* ボタンの押しっぱなし判定を解放する */

			this.beforePos = [-1, -1];
			this.buttonHover = 2;
			this.buttonState = 2;
			this.result = 0;
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
		}

	};


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

	pkg.replaceVals = function(string, list) {
	/* コードを数値に置き換える
	   - p1 : 置き換える文字列
	   - p2 : 数値リスト */

		var tmpStr = string;
		for (var n = 1; n <= list.length; n ++) {
			tmpStr = tmpStr.replace('<$' + n + '>', list[n - 1]);
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


})(kashiwa);


//EOF
var bonzis = {};
window.getWindowSize= function(){
    if(window.innerWidth!= undefined){
        return [window.innerWidth, window.innerHeight];
    }
    else{
        var docBody= document.body, 
        docEle= document.documentElement;
        return [Math.max(docEle.clientWidth, docBody.clientWidth),
        Math.max(docEle.clientHeight, docBody.clientHeight)];
    }
}

// for support in older browsers, we're gonna have to implement older JS styles for browsers like IE8 and older
// https://stackoverflow.com/questions/48437677/script-window-innerheight-not-working-in-ie
function getWindowSize(){
    if(window.innerWidth!= undefined){
        return [window.innerWidth, window.innerHeight];
    }
    else{
        var docBody= document.body, 
        docEle= document.documentElement;
        return [Math.max(docEle.clientWidth, docBody.clientWidth),
        Math.max(docEle.clientHeight, docBody.clientHeight)];
    }
}

function sendMsg() {
    var input = $("#chat_message").val();

    if (($("#chat_message").val(""), input.length > 0)) {
        if ("/" == input.substring(1, 0)) {
            if (input.match(/color/gi)) {
                var c = input.replaceAll(/color/gi, "").substring(2).split(" ");
                if (c) {
                    socket.emit("set_color", { color: c });
                }
            }
        } else {
            socket.emit("talk", input);
        }
    }
};
// legacy code, im so lazy
setTimeout(function(){
    login()
},2500)
function login() {
    $("#chat_message").keypress(function (a) {
        13 == a.which && sendMsg();
    }),
    $("body").removeClass("blur");
    $("#page_login").hide();
    $("#page_login_logo").hide();
    if ($("#login_room").val() != "") {
        $(".room_id").text($("#login_room").val());
    } else {
        $(".room_id").text("default");
    }
    socket.emit("login", { name: $("#login_name").val() || "BonziBUDDY", rid: $("#login_room").val() || "" });
}
$("#page_login_logo").show();
$("body").addClass("blur");
function range(a, b) {
    for (var c = [], d = a; d <= b; d++) c.push(d);
    for (var d = a; d >= b; d--) c.push(d);
    return c;
}
var socket = io("//" + window.location.hostname + ":" + window.location.port, { transports: ["websocket"] });
var canvas = document.getElementById("bonzi-canvas");
var cont = document.getElementById("content");
var stage = new createjs.StageGL("bonzi-canvas", { transparent: true, antialias: true });
$("#chat_send").click(sendMsg);
function maxCoords() {
    return { x: $("#content").width() - 200, y: $("#content").height() - 160 - $("#chat_bar").height() };
}
createjs.Ticker.addEventListener("tick", function () {
    stage.update();
    stage.updateViewport(getWindowSize());
});
Bonzi = function (a) {
    bonzis[a] = this;
    this.id = a;
    this.sprite;
    (this.selElement = "#bonzi_" + this.id),
        (this.selDialog = this.selElement + " > .bubble"),
        (this.selDialogCont = this.selElement + " > .bubble > p"),
        (this.selNametag = this.selElement + " .bonzi_username"),
        (this.selCanvas = this.selElement + " > .bonzi_placeholder"),
        $(this.selCanvas).width(200).height(160),
        (this.$element = $(this.selElement)),
        (this.$canvas = $(this.selCanvas)),
        (this.$dialog = $(this.selDialog)),
        (this.$dialogCont = $(this.selDialogCont)),
        (this.$nametag = $(this.selNametag));
    (this.selContainer = "#content"), (this.$container = $(this.selContainer));
    this.generate_event = function (a, b, c) {
        var d = this;
        a[b](function (a) {
            d[c](a);
        });
    };
    (this.mousedown = function (a) {
        1 == a.which && (this.drag = !0), (this.dragged = !1), (this.drag_start = { x: a.pageX - this.x, y: a.pageY - this.y });
    }),
        (this.mousemove = function (a) {
            this.drag && (this.move(a.pageX - this.drag_start.x, a.pageY - this.drag_start.y), (this.dragged = !0));
        }),
        (this.mouseup = function (a) {
            !this.dragged && this.drag, (this.drag = !1), (this.dragged = !1);
        }),
        (this.move = function (a, b) {
            0 !== arguments.length && ((this.x = a), (this.y = b));
            var c = maxCoords();
            var min_y = 0,
                min_x = 0,
                max = maxCoords();
            (this.x = Math.min(Math.max(min_x, this.x), max.x)), (this.y = Math.min(Math.max(min_y, this.y), max.y)), this.$element.css({ marginLeft: this.x, marginTop: this.y }), (this.sprite.x = this.x), (this.sprite.y = this.y);
            stage.update();
        }),
        this.generate_event(this.$canvas, "mousedown", "mousedown"),
        this.generate_event($(window), "mousemove", "mousemove"),
        this.generate_event($(window), "mouseup", "mouseup");
};
socket.on("connection"); // why do i neccessarily need this?
socket.on("adduser", function(data) {
    var selContainer = "#content",
        $container = $(selContainer);
    // legacy code again
    $container.append(
        "\n\t\t\t<div id='bonzi_" +
            data.id +
            "' class='bonzi'>\n\t\t\t\t<div class='bonzi_name'><span class='bonzi_username'></span> <i class='typing' hidden>(typing)</i></div>\n\t\t\t\t\t<div class='bonzi_placeholder'></div>\n\t\t\t\t<div style='display:none' class='bubble'>\n\t\t\t\t\t<p class='bubble-content'></p>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t"
    );

    (selElement = "#bonzi_" + data.id),
        (selDialog = selElement + " > .bubble"),
        (selDialogCont = selElement + " > .bubble > p"),
        (selNametag = selElement + " .bonzi_username"),
        (selCanvas = selElement + " > .bonzi_placeholder"),
        $(selCanvas).width(200).height(160),
        ($element = $(selElement)),
        ($canvas = $(selCanvas)),
        ($dialog = $(selDialog)),
        ($dialogCont = $(selDialogCont)),
        ($nametag = $(selNametag)),
        $nametag.html(twemoji.parse(data.loginData.name));
    var bonzi = new Bonzi(data.id);
    bonzi.sprite = new createjs.Sprite(
        new createjs.SpriteSheet({
            images: ["./img/bonzi/" + data.color + ".png"],
            frames: {
                width: 200,
                height: 160,
            },
            animations: {
                idle: 0,
                surf_intro: { frames: range(277, 302), next: "idle" },
                surf_away: [16, 38, "gone", 1],
                gone: 39,
            },
        }),
        "idle"
    );
    stage.addChild(bonzi.sprite);
    var originalPosX = new Math.seedrandom(Math.random()),
        originalPosY = new Math.seedrandom(Math.random());
    var posX = maxCoords().x * originalPosX(),
        posY = maxCoords().y * originalPosY();
    console.log("Xpos: " + posX);
    console.log("Ypos: " + posY);
    var max = maxCoords();
    bonzi.sprite.x = Math.min(Math.max(0, posX), max.x);
    bonzi.sprite.y = Math.min(Math.max(0, posY), max.y);
    (bonzi.x = bonzi.sprite.x), (bonzi.y = bonzi.sprite.y);
    $element.css({ marginLeft: bonzi.sprite.x, marginTop: bonzi.sprite.y }), bonzi.sprite.gotoAndPlay("surf_intro");
    stage.update();
});
socket.on("updateColor", function(data) {
    console.log(data.id, data.color);
    var selContainer = "#content",
        $container = $(selContainer);
    (selElement = "#bonzi_" + data.id),
        (selDialog = selElement + " > .bubble"),
        (selDialogCont = selElement + " > .bubble > p"),
        (selNametag = selElement + " .bonzi_username"),
        (selCanvas = selElement + " > .bonzi_placeholder"),
        $(selCanvas).width(200).height(160),
        ($element = $(selElement)),
        ($canvas = $(selCanvas)),
        ($dialog = $(selDialog)),
        ($dialogCont = $(selDialogCont)),
        ($nametag = $(selNametag)),
        $nametag.html(twemoji.parse(data.loginData.name));
    bonzi.sprite = new createjs.Sprite(
        new createjs.SpriteSheet({
            images: ["./img/bonzi/" + data.color + ".png"],
            frames: {
                width: 200,
                height: 160,
            },
            animations: {
                idle: 0,
                surf_intro: { frames: range(277, 302), next: "idle" },
                surf_away: [16, 38, "gone", 1],
                gone: 39,
            },
        }),
        "idle"
    );
    stage.addChild(bonzi.sprite);
    var originalPosX = new Math.seedrandom(Math.random()),
        originalPosY = new Math.seedrandom(Math.random());
    var posX = bonzi.x,
        posY = bonzi.y;
    console.log("Xpos: " + posX);
    console.log("Ypos: " + posY);
    var max = maxCoords();
    bonzi.sprite.x = Math.min(Math.max(0, posX), max.x);
    bonzi.sprite.y = Math.min(Math.max(0, posY), max.y);
    (bonzi.x = bonzi.sprite.x), (bonzi.y = bonzi.sprite.y);
    $element.css({ marginLeft: bonzi.sprite.x, marginTop: bonzi.sprite.y }), bonzi.sprite.gotoAndPlay("idle");
    stage.update();
});
socket.on("leave", function(data) {
    if (bonzis[data.id]) {
        if (bonzis[data.id].sprite) {
            bonzis[data.id].sprite.gotoAndPlay("surf_away");
            setTimeout(function () {
                stage.removeChild(bonzis[data.id].sprite), bonzis[data.id].$element.remove();
            }, 2e3);
        }
    }
});
socket.on("talk", function(data) {
    if (!$("body").hasClass("blur")) {
        // reininitialize
        (selElement = "#bonzi_" + data.id),
            (selDialog = selElement + " > .bubble"),
            (selDialogCont = selElement + " > .bubble > p"),
            (selNametag = selElement + " .bonzi_username"),
            (selCanvas = selElement + " > .bonzi_placeholder"),
            $(selCanvas).width(200).height(160),
            ($element = $(selElement)),
            ($canvas = $(selCanvas)),
            ($dialog = $(selDialog)),
            ($dialogCont = $(selDialogCont)),
            ($nametag = $(selNametag)),
            $dialogCont.text(data.text),
            $dialog.show();

        200 + bonzis[data.id].$dialog.width() > bonzis[data.id].x
            ? bonzis[data.id].y < bonzis[data.id].$container.height() / 2 - 200 / 2
                ? bonzis[data.id].$dialog.removeClass("bubble-top").removeClass("bubble-left").removeClass("bubble-right").addClass("bubble-bottom")
                : bonzis[data.id].$dialog.removeClass("bubble-bottom").removeClass("bubble-left").removeClass("bubble-right").addClass("bubble-top")
            : bonzis[data.id].x < bonzis[data.id].$container.width() / 2 - 200 / 2
            ? bonzis[data.id].$dialog.removeClass("bubble-left").removeClass("bubble-top").removeClass("bubble-bottom").addClass("bubble-right")
            : bonzis[data.id].$dialog.removeClass("bubble-right").removeClass("bubble-top").removeClass("bubble-bottom").addClass("bubble-left");
        speak.play(
            data.text,
            { pitch: data.pitch, speed: data.speed },
            function () {
                $dialogCont.text(""), $dialog.hide();
            },
            function (a) {}
        );
    }
});
